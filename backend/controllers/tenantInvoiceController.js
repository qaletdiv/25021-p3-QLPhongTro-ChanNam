const { Invoice, Contract, Tenant, Room } = require("../models");
const cloudinary = require("../config/cloudinary");
const { getResolvedSettings } = require("../utils/settings");

exports.getInvoices = async (req, res, next) => {
    try {
        const tenant = await Tenant.findOne({ where: { userId: req.user.id } });
        if (!tenant) return res.status(404).json({ message: "Khong tim thay thong tin khach thue" });

        const invoices = await Invoice.findAll({
            include: [{
                model: Contract, as: "contract", required: true,
                where: { tenantId: tenant.id }
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
        const tenant = await Tenant.findOne({ where: { userId: req.user.id } });
        if (!tenant) return res.status(404).json({ message: "Khong tim thay thong tin khach thue" });

        const contract = await Contract.findOne({
            where: { tenantId: tenant.id, status: 'active' },
            include: [{ model: Room, as: "room", include: [{ model: require("../models").Building, as: "building", attributes: ["id", "name", "address"] }] }]
        });
        if (!contract) return res.status(404).json({ message: "Khong co hop dong hoat dong" });

        const settings = await getResolvedSettings(contract.room.landlordId, contract.room.buildingId);
        const result = {};
        Object.entries(settings).forEach(([k, v]) => { result[k] = v; });

        res.json({
            settings: result,
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
            return res.status(400).json({ message: "Thieu chi so dien/nuoc ban dau" });
        }
        if (!electricityPhoto || !waterPhoto) {
            return res.status(400).json({ message: "Vui long upload anh dong ho dien va nuoc" });
        }

        const tenant = await Tenant.findOne({ where: { userId: req.user.id } });
        if (!tenant) return res.status(404).json({ message: "Khong tim thay thong tin khach thue" });

        const contract = await Contract.findOne({
            where: { tenantId: tenant.id, status: 'active' },
            include: [{ model: Room, as: "room" }]
        });
        if (!contract) return res.status(404).json({ message: "Khong co hop dong hoat dong" });

        const [elecRes, waterRes] = await Promise.all([
            cloudinary.uploader.upload(electricityPhoto, {
                folder: `phongtro/${contract.room.room_number}/meters`,
                public_id: `elec_initial_${contract.id}`,
                overwrite: true
            }),
            cloudinary.uploader.upload(waterPhoto, {
                folder: `phongtro/${contract.room.room_number}/meters`,
                public_id: `water_initial_${contract.id}`,
                overwrite: true
            })
        ]);

        await contract.update({
            initialElectricity: Number(electricity),
            initialWater: Number(water),
            initialElectricityPhoto: elecRes.secure_url,
            initialWaterPhoto: waterRes.secure_url
        });

        res.json({
            message: "Da luu chi so ban dau thanh cong",
            contract
        });
    } catch (error) {
        next(error);
    }
};

exports.submitMeter = async (req, res, next) => {
    try {
        const { electricity, water, electricityPhoto, waterPhoto } = req.body;
        if (electricity === undefined || water === undefined) {
            return res.status(400).json({ message: "Thieu chi so dien/nuoc" });
        }
        if (!electricityPhoto || !waterPhoto) {
            return res.status(400).json({ message: "Vui long upload anh dong ho dien va nuoc" });
        }

        const tenant = await Tenant.findOne({ where: { userId: req.user.id } });
        if (!tenant) return res.status(404).json({ message: "Khong tim thay thong tin khach thue" });

        const contract = await Contract.findOne({
            where: { tenantId: tenant.id, status: 'active' },
            include: [{ model: Room, as: "room" }]
        });
        if (!contract) return res.status(404).json({ message: "Khong co hop dong hoat dong" });

        const { Setting, Invoice } = require("../models");

        const now = new Date();
        const monthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const month = `${String(monthDate.getMonth() + 1).padStart(2, "0")}/${monthDate.getFullYear()}`;
        const existing = await Invoice.findOne({ where: { contractId: contract.id, month } });
        if (existing) {
            return res.status(400).json({ message: "Hoa don thang nay da ton tai" });
        }

        const settings = await getResolvedSettings(contract.room.landlordId, contract.room.buildingId);
        const s = {};
        Object.entries(settings).forEach(([k, v]) => { s[k] = v; });
        const elecRate = Number(s.electricityRate) || 3500;
        const waterRate = Number(s.waterRate) || 15000;
        const serviceFee = s.serviceFee !== undefined && s.serviceFee !== "" ? Number(s.serviceFee) || 0 : 0;
        const roomPrice = Number(contract.room.price) || 0;

        const lastInvoice = await Invoice.findOne({
            where: { contractId: contract.id },
            order: [['createdAt', 'DESC']]
        });
        const elecOld = lastInvoice ? Number(lastInvoice.electricityNew) : (Number(contract.initialElectricity) || 0);
        const waterOld = lastInvoice ? Number(lastInvoice.waterNew) : (Number(contract.initialWater) || 0);
        const elecNew = Number(electricity);
        const waterNew = Number(water);

        if (elecNew < elecOld) return res.status(400).json({ message: "Chi so dien moi nho hon chi so cu" });
        if (waterNew < waterOld) return res.status(400).json({ message: "Chi so nuoc moi nho hon chi so cu" });

        let elecPhotoUrl = null;
        let waterPhotoUrl = null;
        if (electricityPhoto) {
            const r = await cloudinary.uploader.upload(electricityPhoto, {
                folder: `phongtro/${contract.room.room_number}/invoices/${month}`,
                public_id: `elec_${contract.id}`,
                overwrite: true
            });
            elecPhotoUrl = r.secure_url;
        }
        if (waterPhoto) {
            const r = await cloudinary.uploader.upload(waterPhoto, {
                folder: `phongtro/${contract.room.room_number}/invoices/${month}`,
                public_id: `water_${contract.id}`,
                overwrite: true
            });
            waterPhotoUrl = r.secure_url;
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

        res.json({ message: "Da gui chi so va chot hoa don thanh cong", invoice });
    } catch (error) {
        next(error);
    }
};
