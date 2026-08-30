const { Op } = require("sequelize");
const { Tenant, Contract, Room, Companion, Building, User } = require("../models");
const { hashPassword } = require("../utils/password");
const { getAccessibleBuildingIds } = require("../utils/buildingAccess");
const { tenantAccessCondition, isTenantAccessible } = require("../utils/tenantScope");

exports.getTenants = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        const { search } = req.query;
        const accIds = await getAccessibleBuildingIds(req.user.id);
        // Chỉ trả về khách thuê thuộc nhà mình sở hữu / được chia sẻ (data isolation)
        const where = { ...(await tenantAccessCondition(req.user.id, accIds)) };
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
        const { count, rows } = await Tenant.findAndCountAll({
            where,
            include: [
                { model: Companion, as: "companions", attributes: ["id", "name", "phone", "cccd", "relationship", "telegramChatId", "fingerprintCode", "status", "endedAt", "createdAt", "updatedAt"] },
                { model: User, as: "user", attributes: ["id", "email", "name"], required: false },
                { model: Building, as: "building", attributes: ["id", "name", "address"], required: false },
                { model: Contract, as: "contracts", required: false,
                  include: [{ model: Room, as: "room", attributes: ["room_number", "buildingId"], include: [{ model: Building, as: "building", attributes: ["id", "name"] }] }]
                }
            ],
            order: [['name', 'ASC']],
            limit,
            offset
        });
        const filtered = rows.map((tenant) => {
            // Include all tenants (even those without a contract). Only keep
            // contracts that belong to buildings the landlord can access.
            const contracts = (tenant.contracts || []).filter(
                (c) => c.room && (accIds.length === 0 || accIds.includes(c.room.buildingId))
            );
            return { ...tenant.toJSON(), contracts };
        });
        res.json({ tenants: filtered, total: count, page, totalPages: Math.ceil(count / limit) });
    } catch (error) {
        next(error);
    }
};

exports.createTenant = async (req, res, next) => {
    try {
        const { name, phone, cccd, buildingId } = req.body;
        // Khách thuê phải gắn với một nhà mà chủ trọ được phép quản lý, nếu không
        // bản ghi sẽ không thuộc về ai và lọt ra danh sách của chủ trọ khác.
        const accIds = await getAccessibleBuildingIds(req.user.id);
        if (!buildingId || !accIds.includes(Number(buildingId))) {
            return res.status(400).json({ message: "Nhà trọ không hợp lệ hoặc không thuộc về bạn" });
        }
        const tenant = await Tenant.create({ name, phone, cccd, buildingId: Number(buildingId) });
        res.status(201).json({ message: "Thêm khách thuê thành công", tenant });
    } catch (error) {
        next(error);
    }
};

exports.updateTenant = async (req, res, next) => {
    try {
        if (!(await isTenantAccessible(req.user.id, req.params.id))) {
            return res.status(403).json({ message: "Bạn không có quyền trên khách thuê này" });
        }
        const tenant = await Tenant.findByPk(req.params.id);
        if (!tenant) return res.status(404).json({ message: "Không tìm thấy khách thuê" });
        const { name, phone, cccd, password } = req.body;
        const updateData = { name, phone, cccd };
        // Mật khẩu chỉ được lưu dạng hash ở bảng users, không lưu bản rõ ở tenants.
        if (password && String(password).trim() !== '') {
            if (String(password).trim().length < 6) {
                return res.status(400).json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự" });
            }
            if (tenant.userId) {
                const hashed = await hashPassword(String(password).trim());
                await User.update({ password: hashed, currentSessionToken: null }, { where: { id: tenant.userId } });
            }
        }
        await tenant.update(updateData);
        res.json({ message: "Cập nhật thông tin thành công", tenant });
    } catch (error) {
        next(error);
    }
};
