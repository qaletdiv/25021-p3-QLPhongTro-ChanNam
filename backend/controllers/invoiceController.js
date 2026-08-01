const { Op } = require("sequelize");
const { Invoice, Contract, Room, Tenant, Building } = require("../models");
const telegram = require("../utils/telegram");

exports.getInvoices = async (req, res, next) => {
    try {
        const { status, month } = req.query;
        const where = {};
        if (status && ['pending', 'submitted', 'paid'].includes(status)) where.status = status;
        if (month) where.month = month;

        const invoices = await Invoice.findAll({
            where,
            include: [{
                model: Contract, as: "contract", required: true,
                include: [
                    { model: Room, as: "room", where: { landlordId: req.user.id }, attributes: ["room_number", "price"], include: [{ model: Building, as: "building", attributes: ["id", "name"] }] },
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

exports.markAsPaid = async (req, res, next) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id, {
            include: [{ model: Contract, as: "contract", include: [{ model: Room, as: "room" }] }]
        });
        if (!invoice) return res.status(404).json({ message: "Khong tim thay hoa don" });
        if (invoice.contract.room.landlordId !== req.user.id) return res.status(403).json({ message: "Khong co quyen" });
        if (invoice.status === 'paid') return res.status(400).json({ message: "Hoa don da duoc thanh toan" });

        await invoice.update({ status: 'paid', paidAt: new Date() });
        res.json({ message: "Xac nhan thanh toan thanh cong", invoice });
    } catch (error) {
        next(error);
    }
};

exports.sendReminder = async (req, res, next) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id, {
            include: [{ model: Contract, as: "contract", include: [{ model: Room, as: "room" }, { model: Tenant, as: "tenant" }] }]
        });
        if (!invoice) return res.status(404).json({ message: "Khong tim thay hoa don" });
        if (invoice.contract.room.landlordId !== req.user.id) return res.status(403).json({ message: "Khong co quyen" });

        const tenant = invoice.contract.tenant;
        if (!tenant || !tenant.telegramChatId) {
            return res.status(400).json({ message: "Khach thue chua cung cap Telegram Chat ID" });
        }

        const total = Number(invoice.totalAmount);
        const totalStr = new Intl.NumberFormat("vi-VN").format(total) + " VND";
        const text = telegram.formatMessage(
            `Nhac no tien phong ${invoice.month}\n\n` +
            `Kinh gui anh/chi ${invoice.contract.tenant.name}\n` +
            `Phong: ${invoice.contract.room.room_number}\n` +
            `Tong tien can thanh toan: ${totalStr}\n` +
            `Hoa don thang: ${invoice.month}\n` +
            `Vui long thanh toan dung han. Cam on!`,
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

        res.json({ message: "Da gui nhac no qua Telegram" });
    } catch (error) {
        next(error);
    }
};
