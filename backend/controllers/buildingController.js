const { Op } = require("sequelize");
const { Building, Room, BuildingCollaborator, User } = require("../models");
const { getAccessibleBuildingIds } = require("../utils/buildingAccess");
const { writeAuditLog } = require("../utils/auditLog");

exports.getCollaborators = async (req, res, next) => {
    try {
        const building = await Building.findOne({ where: { id: req.params.id, landlordId: req.user.id } });
        if (!building) return res.status(404).json({ message: "Không tìm thấy nhà hoặc bạn không phải chủ sở hữu" });
        const rows = await BuildingCollaborator.findAll({
            where: { buildingId: building.id },
            include: [{ model: User, as: "user", attributes: ["id", "name", "email"] }],
        });
        res.json({ collaborators: rows.map((r) => r.user) });
    } catch (error) {
        next(error);
    }
};

exports.addCollaborator = async (req, res, next) => {
    try {
        const building = await Building.findOne({ where: { id: req.params.id, landlordId: req.user.id } });
        if (!building) return res.status(404).json({ message: "Không tìm thấy nhà hoặc bạn không phải chủ sở hữu" });
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu cộng tác viên" });
        const emailLower = String(email).trim().toLowerCase();
        let user = await User.findOne({ where: { email: emailLower } });
        if (!user) {
            // Tạo mới tài khoản landlord
            const name = req.user.name; // lấy name từ chủ trọ tạo ra
            const phone = req.user.phone; // lấy phone từ chủ trọ tạo ra
            const hashed = await hashPassword(password);
            user = await User.create({ name, email: emailLower, phone, password: hashed, role: "landlord" });
        }
        if (user.role !== "landlord") {
            return res.status(400).json({ message: "Chỉ có thể chia sẻ cho tài khoản chủ trọ" });
        }
        if (user.id === req.user.id) return res.status(400).json({ message: "Bạn là chủ sở hữu nhà này" });
        const exists = await BuildingCollaborator.findOne({ where: { buildingId: building.id, userId: user.id } });
        if (exists) return res.status(409).json({ message: "Tài khoản này đã là cộng tác viên" });
        await BuildingCollaborator.create({ buildingId: building.id, userId: user.id });
        await writeAuditLog({ actorId: req.user.id, action: "building.add_collaborator", targetType: "building", targetId: building.id, metadata: { email: user.email } });
        res.json({ message: `Đã chia sẻ ${building.name} cho ${user.email}`, collaborator: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
        next(error);
    }
};

exports.removeCollaborator = async (req, res, next) => {
    try {
        const building = await Building.findOne({ where: { id: req.params.id, landlordId: req.user.id } });
        if (!building) return res.status(404).json({ message: "Không tìm thấy nhà hoặc bạn không phải chủ sở hữu" });
        const deleted = await BuildingCollaborator.destroy({ where: { buildingId: building.id, userId: req.params.userId } });
        if (!deleted) return res.status(404).json({ message: "Không tìm thấy cộng tác viên" });
        await writeAuditLog({ actorId: req.user.id, action: "building.remove_collaborator", targetType: "building", targetId: building.id, metadata: { removedUserId: Number(req.params.userId) } });
        res.json({ message: "Đã xóa cộng tác viên khỏi nhà này" });
    } catch (error) {
        next(error);
    }
};


exports.getPublicBuildings = async (req, res, next) => {
    try {
        const buildings = await Building.findAll({
            attributes: ["id", "name", "address"],
            order: [['name', 'ASC']],
        });
        res.json({ buildings });
    } catch (error) {
        next(error);
    }
};

exports.getBuildings = async (req, res, next) => {
    try {
        const accIds = await getAccessibleBuildingIds(req.user.id);
        const buildings = await Building.findAll({
            where: accIds.length ? { id: { [Op.in]: accIds } } : { landlordId: req.user.id },
            include: [{ model: Room, as: "rooms", attributes: ["id", "status"] }],
            order: [['createdAt', 'ASC']]
        });
        const result = buildings.map(b => {
            const rooms = b.rooms || [];
            return {
                ...b.toJSON(),
                roomCount: rooms.length,
                emptyCount: rooms.filter(r => r.status === 'empty').length,
                rentedCount: rooms.filter(r => r.status === 'rented').length
            };
        });
        res.json({ buildings: result });
    } catch (error) {
        next(error);
    }
};

exports.getBuildingById = async (req, res, next) => {
    try {
        const accIds = await getAccessibleBuildingIds(req.user.id);
        const building = await Building.findOne({
            where: accIds.length ? { id: req.params.id, [Op.or]: [{ landlordId: req.user.id }, { id: { [Op.in]: accIds } }] } : { id: -1 },
            include: [{ model: Room, as: "rooms" }]
        });
        if (!building) return res.status(404).json({ message: "Không tìm thấy nhà" });
        res.json({ building });
    } catch (error) {
        next(error);
    }
};

exports.createBuilding = async (req, res, next) => {
    try {
        const { name, address } = req.body;
        const building = await Building.create({ name, address, landlordId: req.user.id });
        res.status(201).json({ message: "Thêm nhà thành công", building });
    } catch (error) {
        next(error);
    }
};

exports.updateBuilding = async (req, res, next) => {
    try {
        const building = await Building.findOne({ where: { id: req.params.id, landlordId: req.user.id } });
        if (!building) return res.status(404).json({ message: "Không tìm thấy nhà" });
        const { name, address } = req.body;
        await building.update({ name, address });
        res.json({ message: "Cập nhật nhà thành công", building });
    } catch (error) {
        next(error);
    }
};

exports.deleteBuilding = async (req, res, next) => {
    try {
        const building = await Building.findOne({ where: { id: req.params.id, landlordId: req.user.id } });
        if (!building) return res.status(404).json({ message: "Không tìm thấy nhà" });
        const roomCount = await Room.count({ where: { buildingId: building.id } });
        if (roomCount > 0) return res.status(400).json({ message: "Không thể xóa nhà đang có phòng" });
        await building.destroy();
        res.json({ message: "Xóa nhà thành công" });
    } catch (error) {
        next(error);
    }
};
