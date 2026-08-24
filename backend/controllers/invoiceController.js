const { Op } = require("sequelize");
const { Invoice, Contract, Room, Tenant, Building } = require("../models");
const telegram = require("../utils/telegram");
const push = require("../utils/push");
const { formatMoney } = require("../utils/money");
const { getAccessibleBuildingIds, isBuildingAccessible } = require("../utils/buildingAccess");

exports.getInvoices = async (req, res, next) => {
    try {
        const { status, month } = req.query;
        const where = {};
        if (status && ['pending', 'submitted', 'paid'].includes(status)) where.status = status;
        if (month) where.month = month;

        const accIds = await getAccessibleBuildingIds(req.user.id);
        const invoices = await Invoice.findAll({
            where,
            include: [{
                model: Contract, as: "contract", required: true,
                include: [
                    { model: Room, as: "room", where: { buildingId: { [Op.in]: accIds.length ? accIds : [-1] } }, attributes: ["room_number", "price"], include: [{ model: Building, as: "building", attributes: ["id", "name"] }] },
                    { model: Tenant, as: "tenant", attributes: ["name", "phone"] }
                ]
            }],
            order: [['createdAt', 'DESC']]
        });
        res.json({ invoices });
    } catch (error) {
        next(error);
    }
};

exports.getPendingCount = async (req, res, next) => {
    try {
        const accIds = await getAccessibleBuildingIds(req.user.id);
        const count = await Invoice.count({
            where: { status: { [Op.in]: ['pending', 'submitted'] } },
            include: [{ model: Contract, as: "contract", required: true, include: [{ model: Room, as: "room", where: { buildingId: { [Op.in]: accIds.length ? accIds : [-1] } }, required: true }] }]
        });
        res.json({ count });
    } catch (error) {
        next(error);
    }
};

exports.markAsPaid = async (req, res, next) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id, {
            include: [{ model: Contract, as: "contract", include: [{ model: Room, as: "room" }, { model: Tenant, as: "tenant", attributes: ["id", "name", "userId"] }] }]
        });
        if (!invoice) return res.status(404).json({ message: "Không tìm thấy hóa đơn" });
        if (!(await isBuildingAccessible(req.user.id, invoice.contract.room?.buildingId))) return res.status(403).json({ message: "Không có quyền" });
        if (invoice.status === 'paid') return res.status(400).json({ message: "Hóa đơn đã được thanh toán" });

        await invoice.update({ status: 'paid', paidAt: new Date() });
        const tenant = invoice.contract.tenant;
        if (tenant && tenant.userId) {
            try {
                const totalStr = formatMoney(invoice.total);
                await push.sendToUser(tenant.userId, {
                    title: "Hóa đơn đã được xác nhận",
                    body: `Hóa đơn tháng ${invoice.month}: ${totalStr} đã được xác nhận thanh toán.`,
                    url: "/tenant/invoices",
                    invoiceId: invoice.id
                });
            } catch (e) {
                console.error("Tenant push failed:", e.message);
            }
        }
        res.json({ message: "Xác nhận thanh toán thành công", invoice });
    } catch (error) {
        next(error);
    }
};

exports.sendReminder = async (req, res, next) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id, {
            include: [{ model: Contract, as: "contract", include: [{ model: Room, as: "room" }, { model: Tenant, as: "tenant" }] }]
        });
        if (!invoice) return res.status(404).json({ message: "Không tìm thấy hóa đơn" });
        if (!(await isBuildingAccessible(req.user.id, invoice.contract.room?.buildingId))) return res.status(403).json({ message: "Không có quyền" });

        const tenant = invoice.contract.tenant;
        if (!tenant || !tenant.telegramChatId) {
            return res.status(400).json({ message: "Khách thuê chưa cung cấp Telegram Chat ID" });
        }

        const total = Number(invoice.total);
        const totalStr = formatMoney(total);
        const text = telegram.formatMessage(
            `Nhắc nợ tiền phòng ${invoice.month}\n\n` +
            `Kính gửi anh/chị ${invoice.contract.tenant.name}\n` +
            `Phòng: ${invoice.contract.room.room_number}\n` +
            `Tổng tiền cần thanh toán: ${totalStr}\n` +
            `Hóa đơn tháng: ${invoice.month}\n` +
            `Vui lòng thanh toán đúng hạn. Cảm ơn!`,
            { tenantName: tenant.name, roomNumber: invoice.contract.room.room_number, totalAmount: totalStr }
        );

        try {
            await telegram.sendMessage({
                landlordId: req.user.id,
                buildingId: invoice.contract.room.buildingId,
                chatId: tenant.telegramChatId,
                text
            });
        } catch (e) {
            return res.status(400).json({ message: e.message });
        }

        res.json({ message: "Đã gửi nhắc nợ qua Telegram" });
    } catch (error) {
        next(error);
    }
};
