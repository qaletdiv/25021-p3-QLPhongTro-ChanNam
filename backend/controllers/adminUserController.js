const { Op } = require("sequelize");
const { User, Tenant, Contract, Room, BuildingCollaborator } = require("../models");
const { writeAuditLog } = require("../utils/auditLog");
const { hashPassword } = require("../utils/password");

const AUTH_ATTRS = ["id", "name", "email", "phone", "role", "isActive", "avatar", "cccd", "createdAt", "updatedAt"];

// Danh sách userId mà chủ trọ được quản lý: khách thuê có hợp đồng trên phòng của mình
// HOẶC trên các nhà được chia sẻ cho mình làm cộng tác viên
async function getManageableUserIds(landlordId) {
    const sharedBuildingIds = (await BuildingCollaborator.findAll({ where: { userId: landlordId }, attributes: ["buildingId"] })).map((b) => b.buildingId);
    const rooms = await Room.findAll({
        where: { [Op.or]: [{ landlordId }, ...(sharedBuildingIds.length ? [{ buildingId: { [Op.in]: sharedBuildingIds } }] : [])] },
        attributes: ["id"]
    });
    const roomIds = rooms.map((r) => r.id);
    if (!roomIds.length) return [];
    const contracts = await Contract.findAll({ where: { roomId: { [Op.in]: roomIds } }, attributes: ["tenantId"] });
    const tenantIds = [...new Set(contracts.map((c) => c.tenantId).filter(Boolean))];
    if (!tenantIds.length) return [];
    const tenants = await Tenant.findAll({ where: { id: { [Op.in]: tenantIds } }, attributes: ["userId"] });
    return [...new Set(tenants.map((t) => t.userId).filter(Boolean))];
}

exports.getUsers = async (req, res, next) => {
    try {
        const { search, role, active } = req.query;
        const where = { [Op.and]: [] };
        where[Op.and].push({ role: { [Op.not]: "landlord" } });

        // Chỉ xem tài khoản khách thuê thuộc phòng trọ của mình (data isolation)
        const manageable = await getManageableUserIds(req.user.id);
        where[Op.and].push({ id: manageable.length ? manageable : [-1] });

        if (search) {
            where[Op.and].push({
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } },
                    { phone: { [Op.like]: `%${search}%` } },
                ],
            });
        }
        if (role && role !== "all") where[Op.and].push({ role });
        if (active === "true") where[Op.and].push({ isActive: true });
        if (active === "false") where[Op.and].push({ isActive: false });

        const users = await User.findAll({
            where,
            attributes: AUTH_ATTRS,
            include: [{ model: Tenant, as: "tenants", attributes: ["id", "name", "phone"] }],
            order: [["createdAt", "DESC"]],
        });

        const result = users.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone,
            role: u.role,
            isActive: u.isActive,
            avatar: u.avatar,
            cccd: u.cccd,
            createdAt: u.createdAt,
            tenant: (u.tenants && u.tenants[0]) || null,
        }));

        res.json({ users: result });
    } catch (error) {
        next(error);
    }
};

exports.revokeSession = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (String(id) === String(req.user.id)) {
            return res.status(400).json({ message: "Không thể thu hồi phiên đăng nhập của chính tài khoản admin." });
        }
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng." });

        const manageable = await getManageableUserIds(req.user.id);
        if (!manageable.includes(Number(id))) {
            return res.status(403).json({ message: "Bạn không có quyền thao tác trên tài khoản này." });
        }

        await user.update({ currentSessionToken: null });
        await writeAuditLog({ actorId: req.user.id, action: "account.revoke_session", targetType: "user", targetId: Number(id), metadata: { targetName: user.name, targetEmail: user.email } });
        res.json({ message: "Đã thu hồi phiên đăng nhập của tài khoản này." });
    } catch (error) {
        next(error);
    }
};

exports.disableAccount = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (String(id) === String(req.user.id)) {
            return res.status(400).json({ message: "Không thể vô hiệu hóa chính tài khoản admin đang sử dụng." });
        }
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

        const manageableDisable = await getManageableUserIds(req.user.id);
        if (!manageableDisable.includes(Number(id))) {
            return res.status(403).json({ message: "Bạn không có quyền thao tác trên tài khoản này." });
        }

        await user.update({ isActive: false, currentSessionToken: null });
        await writeAuditLog({ actorId: req.user.id, action: "user.disable", targetType: "user", targetId: Number(id), metadata: { targetName: user.name, targetEmail: user.email } });
        res.json({ message: "Đã vô hiệu hóa tài khoản." });
    } catch (error) {
        next(error);
    }
};

exports.enableAccount = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

        const manageableEnable = await getManageableUserIds(req.user.id);
        if (!manageableEnable.includes(Number(id))) {
            return res.status(403).json({ message: "Bạn không có quyền thao tác trên tài khoản này." });
        }

        await user.update({ isActive: true });
        await writeAuditLog({ actorId: req.user.id, action: "user.enable", targetType: "user", targetId: Number(id), metadata: { targetName: user.name, targetEmail: user.email } });
        res.json({ message: "Đã kích hoạt lại tài khoản." });
    } catch (error) {
        next(error);
    }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    if (!newPassword || String(newPassword).length < 6) {
      return res.status(400).json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự." });
    }
    if (String(id) === String(req.user.id)) {
      return res.status(400).json({ message: "Hãy dùng chức năng đổi mật khẩu ở trang Cài Đặt cho chính tài khoản admin." });
    }
    const user = await User.findByPk(id, { include: [{ model: Tenant, as: "tenants", attributes: ["id"] }] });
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    const manageablePwd = await getManageableUserIds(req.user.id);
    if (!manageablePwd.includes(Number(id))) {
      return res.status(403).json({ message: "Bạn không có quyền thao tác trên tài khoản này." });
    }

    const hashed = await hashPassword(String(newPassword));
    await user.update({ password: hashed, currentSessionToken: null });

    const tenant = user.tenants && user.tenants[0];
    if (tenant) await Tenant.update({ password: String(newPassword) }, { where: { id: tenant.id } });

    await writeAuditLog({ actorId: req.user.id, action: "user.change_password", targetType: "user", targetId: Number(id), metadata: { targetName: user.name, targetEmail: user.email } });
    res.json({ message: "Đã đổi mật khẩu và thu hồi phiên đăng nhập hiện tại của tài khoản này." });
  } catch (error) {
    next(error);
  }
};

exports.deleteAccount = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (String(id) === String(req.user.id)) {
      return res.status(400).json({ message: "Không thể xóa chính tài khoản admin đang sử dụng." });
    }
    const user = await User.findByPk(id, { include: [{ model: Tenant, as: "tenants", attributes: ["id"] }] });
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng." });

    if (user.role === "landlord") {
      return res.status(400).json({ message: "Chỉ có thể xóa tài khoản khách thuê." });
    }

    // Chỉ chủ trọ của nhà chứa phòng của khách mới được xóa (data isolation)
    const manageable = await getManageableUserIds(req.user.id);
    if (!manageable.includes(Number(id))) {
      return res.status(403).json({ message: "Bạn không có quyền xóa tài khoản khách thuê của nhà trọ khác." });
    }

    // Gỡ liên kết khách thuê để tránh vi phạm FK; giữ nguyên hợp đồng/hoá đơn để bảo toàn dữ liệu
    await Tenant.update({ userId: null }, { where: { userId: id } });
    await user.destroy();

    await writeAuditLog({ actorId: req.user.id, action: "user.delete", targetType: "user", targetId: Number(id), metadata: { targetName: user.name, targetEmail: user.email } });
    res.json({ message: "Đã xóa tài khoản khách thuê." });
  } catch (error) {
    next(error);
  }
};