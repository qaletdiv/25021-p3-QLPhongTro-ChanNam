const { Op } = require("sequelize");
const { Tenant, Contract, Room, Companion, Building, User } = require("../models");
const { hashPassword } = require("../utils/password");

exports.getTenants = async (req, res, next) => {
    try {
        const { search } = req.query;
        const where = {};
        if (search) {
            const like = { [Op.like]: `%${search}%` };
            const matchedCompanionTenantIds = await Companion.findAll({
                where: { [Op.or]: [{ name: like }, { phone: like }] },
                attributes: ['tenantId']
            }).then((rows) => rows.map((r) => r.tenantId));
            const orConditions = [{ name: like }, { phone: like }];
            if (matchedCompanionTenantIds.length > 0) {
                orConditions.push({ id: { [Op.in]: matchedCompanionTenantIds } });
            }
            where[Op.or] = orConditions;
        }
        const tenants = await Tenant.findAll({
            where,
            include: [
                { model: Companion, as: "companions", attributes: ["id", "name", "phone", "cccd", "relationship", "telegramChatId", "fingerprintCode", "status", "endedAt", "createdAt", "updatedAt"] },
                { model: Contract, as: "contracts",
                  include: [{ model: Room, as: "room", attributes: ["room_number"], where: { landlordId: req.user.id }, include: [{ model: Building, as: "building", attributes: ["id", "name"] }] }]
                }
            ],
            order: [['name', 'ASC']]
        });
        const filtered = tenants.map((tenant) => {
            const contracts = (tenant.contracts || []).filter((c) => c.room);
            return { ...tenant.toJSON(), contracts };
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
        res.status(201).json({ message: "Thêm khách thuê thành công", tenant });
    } catch (error) {
        next(error);
    }
};

exports.updateTenant = async (req, res, next) => {
    try {
        const tenant = await Tenant.findByPk(req.params.id);
        if (!tenant) return res.status(404).json({ message: "Không tìm thấy khách thuê" });
        const { name, phone, cccd, password } = req.body;
        const updateData = { name, phone, cccd };
        if (password && String(password).trim() !== '') {
            updateData.password = String(password).trim();
            if (tenant.userId) {
                const hashed = await hashPassword(String(password).trim());
                await User.update({ password: hashed }, { where: { id: tenant.userId } });
            }
        }
        await tenant.update(updateData);
        res.json({ message: "Cập nhật thông tin thành công", tenant });
    } catch (error) {
        next(error);
    }
};
