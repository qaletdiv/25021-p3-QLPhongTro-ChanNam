const { Op } = require("sequelize");
const { Invoice, Contract, Room, Tenant, Building } = require("../models");

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

        res.json({ message: "Da gui nhac no (tich hop Zalo se duoc them sau)" });
    } catch (error) {
        next(error);
    }
};
