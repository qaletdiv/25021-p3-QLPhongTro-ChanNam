const { Invoice, Contract, Tenant } = require("../models");

exports.getInvoices = async (req, res, next) => {
    try {
        const tenant = await Tenant.findOne({ where: { userId: req.user.id } });
        if (!tenant) return res.status(404).json({ message: "Khong tim thay thong tin khach thue" });

        const invoices = await Invoice.findAll({
            include: [{
                model: Contract, as: "contract", required: true,
                where: { tenantId: tenant.id }
            }],
            order: [['month', 'DESC']]
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
            include: [{ model: Room, as: "room" }]
        });
        if (!contract) return res.status(404).json({ message: "Khong co hop dong hoat dong" });

        const { Setting } = require("../models");
        const settings = await Setting.findAll({ where: { landlordId: contract.room.landlordId } });
        const result = {};
        settings.forEach(s => { result[s.key] = s.value; });

        res.json({ settings: result, roomPrice: contract.room.price });
    } catch (error) {
        next(error);
    }
};
