const { Invoice, Contract, Room, Building } = require("../models");
const storage = require("../services/storage/storage.service");
const { getResolvedSettings } = require("../utils/settings");
const { findTenantByUser } = require("../utils/tenantHelpers");
const { resolveContract } = require("../utils/tenantHelpers");
const { monthStr, nextMonthOf, isFutureMonth, monthIndex } = require("../utils/dates");
const telegram = require("../utils/telegram");

const FRONTEND_URL = process.env.FRONTEND_URL;

exports.getInvoices = async (req, res, next) => {
    try {
        const tenant = await findTenantByUser(req.user.id);
        if (!tenant) return res.status(404).json({ message: "Không tìm thấy thông tin khách thuê" });

        const contractWhere = { tenantId: tenant.id };
        const contractId = req.query.contractId;
        if (contractId) contractWhere.id = contractId;

        const invoices = await Invoice.findAll({
            include: [{
                model: Contract, as: "contract", required: true,
                where: contractWhere
            }],
            order: [['createdAt', 'DESC']]
        });

        res.json({ invoices });
    } catch (error) {
        next(error);
    }
};

exports.getSettings = async (req, res, next) => {
    try {
        const tenant = await findTenantByUser(req.user.id);
        if (!tenant) return res.status(404).json({ message: "Không tìm thấy thông tin khách thuê" });

         const contract = await resolveContract(tenant.id, req.query.contractId, [{ model: Room, as: "room", include: [{ model: Building, as: "building", attributes: ["id", "name", "address"] }] }]);
        if (!contract) return res.status(404).json({ message: "Không có hợp đồng hoạt động" });

        const settings = await getResolvedSettings(contract.room.landlordId, contract.room.buildingId);

        res.json({
            settings,
            roomPrice: contract.room.price,
            room: contract.room,
            contract
        });
    } catch (error) {
        next(error);
    }
};

exports.saveInitialReadings = async (req, res, next) => {
    try {
        const { electricity, water, electricityPhoto, waterPhoto } = req.body;
        if (electricity === undefined || water === undefined) {
            return res.status(400).json({ message: "Thiếu chỉ số điện/nước ban đầu" });
        }
        if (!electricityPhoto || !waterPhoto) {
            return res.status(400).json({ message: "Vui lòng upload ảnh đồng hồ điện và nước" });
        }

        const tenant = await findTenantByUser(req.user.id);
        if (!tenant) return res.status(404).json({ message: "Không tìm thấy thông tin khách thuê" });

        const contract = await resolveContract(tenant.id, req.query.contractId, [{ model: Room, as: "room" }]);
        if (!contract) return res.status(404).json({ message: "Không có hợp đồng hoạt động" });

        const [elecRes, waterRes] = await Promise.all([
            storage.upload({
                base64: electricityPhoto,
                folderId: `phongtro/${contract.room.room_number}/meters`,
                publicId: `elec_initial_${contract.id}`
            }),
            storage.upload({
                base64: waterPhoto,
                folderId: `phongtro/${contract.room.room_number}/meters`,
                publicId: `water_initial_${contract.id}`
            })
        ]);

        await contract.update({
            initialElectricity: Number(electricity),
            initialWater: Number(water),
            initialElectricityPhoto: elecRes.url,
            initialWaterPhoto: waterRes.url
        });

        const roomPrice = Number(contract.room.price) || 0;
        await Invoice.create({
            contractId: contract.id,
            month: monthStr(new Date()),
            roomPrice,
            electricityOld: 0,
            electricityNew: Number(electricity),
            electricityCost: 0,
            waterOld: 0,
            waterNew: Number(water),
            waterCost: 0,
            serviceFee: 0,
            otherFees: 0,
            total: roomPrice,
            status: 'submitted'
        });

        res.json({
            message: "Đã lưu chỉ số ban đầu thành công",
            contract
        });

        try {
            await telegram.sendToLandlord({
                landlordId: contract.room.landlordId,
                buildingId: contract.room.buildingId,
                text: `📦 Có phòng ${contract.room.room_number} là khách thuê mới, đã gửi chỉ số ban đầu và tiền phòng tháng ${monthStr(new Date())}, chờ xác nhận.`,
                url: `${FRONTEND_URL}/landlord/invoices`
            });
        } catch (e) {
            console.error("Landlord Telegram failed:", e.message);
        }
    } catch (error) {
        next(error);
    }
};

exports.submitMeter = async (req, res, next) => {
    try {
        const { electricity, water, electricityPhoto, waterPhoto, month: requestedMonth } = req.body;
        if (electricity === undefined || water === undefined) {
            return res.status(400).json({ message: "Thiếu chỉ số điện/nước" });
        }
        if (!electricityPhoto || !waterPhoto) {
            return res.status(400).json({ message: "Vui lòng upload ảnh đồng hồ điện và nước" });
        }

        const tenant = await findTenantByUser(req.user.id);
        if (!tenant) return res.status(404).json({ message: "Không tìm thấy thông tin khách thuê" });

        const contract = await resolveContract(tenant.id, req.query.contractId, [{ model: Room, as: "room" }]);
        if (!contract) return res.status(404).json({ message: "Không có hợp đồng hoạt động" });

        // Lấy hóa đơn có tháng LỚN NHẤT (không phải createdAt) để xác định tháng
        // kế tiếp cần đóng; tránh việc sửa/thêm bản ghi làm sai thứ tự.
        const allInvoices = await Invoice.findAll({
            where: { contractId: contract.id },
            attributes: ["month", "electricityNew", "waterNew"]
        });
        const latestInvoice = allInvoices.reduce((max, inv) => {
            if (!max) return inv;
            return monthIndex(inv.month) > monthIndex(max.month) ? inv : max;
        }, null);

        const now = new Date();
        const nextPayable = latestInvoice
            ? nextMonthOf(latestInvoice.month)
            : monthStr(new Date(now.getFullYear(), now.getMonth() + 1, 1));
        const month = requestedMonth || nextPayable;

        // Không cho chốt hóa đơn vượt quá tháng hiện tại: chặn tình trạng gửi
        // liên tục làm nhảy tháng tương lai (10, 11, 12...) và làm sai chỉ số nước/điện.
        if (isFutureMonth(month)) {
            return res.status(400).json({ message: "Không thể chốt hóa đơn cho tháng chưa tới." });
        }
        // Chỉ cho đóng đúng tháng kế tiếp: bắt buộc đóng tuần tự để chỉ số điện/nước
        // luôn liền mạch (không nhảy cách tháng gây sai tiền nước).
        if (monthIndex(month) !== monthIndex(nextPayable)) {
            return res.status(400).json({
                message: `Vui lòng đóng đủ các tháng trước. Tháng cần đóng tiếp theo là ${nextPayable}.`
            });
        }
        const existing = await Invoice.findOne({ where: { contractId: contract.id, month } });
        if (existing) {
            return res.status(400).json({ message: "Hóa đơn tháng này đã tồn tại" });
        }

        const settings = await getResolvedSettings(contract.room.landlordId, contract.room.buildingId);
        const elecRate = Number(settings.electricityRate) || 3500;
        const waterRate = Number(settings.waterRate) || 15000;
        const serviceFee = settings.serviceFee !== undefined && settings.serviceFee !== "" ? Number(settings.serviceFee) || 0 : 0;
        const roomPrice = Number(contract.room.price) || 0;

        // Chỉ số cũ lấy từ hóa đơn của tháng liền trước (theo thứ tự tháng).
        const elecOld = latestInvoice ? Number(latestInvoice.electricityNew) : (Number(contract.initialElectricity) || 0);
        const waterOld = latestInvoice ? Number(latestInvoice.waterNew) : (Number(contract.initialWater) || 0);
        const elecNew = Number(electricity);
        const waterNew = Number(water);

        if (elecNew < elecOld) return res.status(400).json({ message: "Chỉ số điện mới nhỏ hơn chỉ số cũ" });
        if (waterNew < waterOld) return res.status(400).json({ message: "Chỉ số nước mới nhỏ hơn chỉ số cũ" });

        let elecPhotoUrl = null;
        let waterPhotoUrl = null;
        if (electricityPhoto) {
            const r = await storage.upload({
                base64: electricityPhoto,
                folderId: `phongtro/${contract.room.room_number}/invoices/${month}`,
                publicId: `elec_${contract.id}`
            });
            elecPhotoUrl = r.url;
        }
        if (waterPhoto) {
            const r = await storage.upload({
                base64: waterPhoto,
                folderId: `phongtro/${contract.room.room_number}/invoices/${month}`,
                publicId: `water_${contract.id}`
            });
            waterPhotoUrl = r.url;
        }

        const elecCost = (elecNew - elecOld) * elecRate;
        const waterCost = (waterNew - waterOld) * waterRate;
        const total = roomPrice + elecCost + waterCost + serviceFee;

        const invoice = await Invoice.create({
            contractId: contract.id,
            month,
            roomPrice,
            electricityOld: elecOld,
            electricityNew: elecNew,
            electricityCost: elecCost,
            waterOld,
            waterNew,
            waterCost,
            serviceFee,
            otherFees: 0,
            total,
            status: 'submitted',
            electricityPhoto: elecPhotoUrl,
            waterPhoto: waterPhotoUrl
        });

        res.json({ message: "Đã gửi chỉ số và chốt hóa đơn thành công", invoice });

        try {
            const [mm, yyyy] = month.split("/");
            await telegram.sendToLandlord({
                landlordId: contract.room.landlordId,
                buildingId: contract.room.buildingId,
                text: `🧾 Có phòng ${contract.room.room_number} gửi tiền nhà tháng ${mm} năm ${yyyy} chờ xác nhận.`,
                url: `${FRONTEND_URL}/landlord/invoices`
            });
        } catch (e) {
            console.error("Landlord Telegram failed:", e.message);
        }
    } catch (error) {
        next(error);
    }
};
