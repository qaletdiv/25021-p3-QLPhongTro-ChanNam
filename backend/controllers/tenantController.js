const { Op } = require("sequelize");
const { Tenant, Contract, Room, Companion, Building } = require("../models");

exports.getTenants = async (req, res, next) => {
    try {
        const { search } = req.query;
        const where = {};
        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } }
            ];
        }
        const tenants = await Tenant.findAll({
            where,
            include: [
                { model: Companion, as: "companions", attributes: ["name", "phone", "cccd", "relationship"] },
                { model: Contract, as: "contracts",
                  include: [{ model: Room, as: "room", attributes: ["room_number"], where: { landlordId: req.user.id }, include: [{ model: Building, as: "building", attributes: ["id", "name"] }] }]
                }
            ],
            order: [['name', 'ASC']]
        });
        const filtered = tenants.map((tenant) => {
            const contracts = (tenant.contracts || []).filter((c) => c.room);
            return contracts.length ? { ...tenant.toJSON(), contracts } : { ...tenant.toJSON(), contracts: [] };
        });
        res.json({ tenants: filtered });
    } catch (error) {
        next(error);
    }
};

exports.createTenant = async (req, res, next) => {
    try {
        const { name, phone, cccd } = req.body;
        const tenant = await Tenant.create({ name, phone, cccd });
        res.status(201).json({ message: "Them khach thue thanh cong", tenant });
    } catch (error) {
        next(error);
    }
};

exports.updateTenant = async (req, res, next) => {
    try {
        const tenant = await Tenant.findByPk(req.params.id);
        if (!tenant) return res.status(404).json({ message: "Khong tim thay khach thue" });
        const { name, phone, cccd } = req.body;
        await tenant.update({ name, phone, cccd });
        res.json({ message: "Cap nhat thong tin thanh cong", tenant });
    } catch (error) {
        next(error);
    }
};
