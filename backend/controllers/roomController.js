const { Room, Contract, ContractFurniture, Furniture, Tenant, Building } = require("../models");
const { getAccessibleBuildingIds, roomAccessCondition } = require("../utils/buildingAccess");

exports.getRooms = async (req, res, next) => {
    try {
        const { status, buildingId } = req.query;
        const accIds = await getAccessibleBuildingIds(req.user.id);
        const where = { ...roomAccessCondition(req.user.id, accIds) };
        if (status && ['empty', 'rented'].includes(status)) where.status = status;
        if (buildingId) where.buildingId = Number(buildingId);

        const rooms = await Room.findAll({
            where,
            include: [{
                model: Contract, as: "contracts", where: { status: 'active' }, required: false,
                include: [{ model: Tenant, as: "tenant", attributes: ["name", "phone"] }]
            }, {
                model: Building, as: "building", attributes: ["id", "name", "address"]
            }],
            order: [['room_number', 'ASC']]
        });
        res.json({ rooms });
    } catch (error) {
        next(error);
    }
};

exports.getRoomById = async (req, res, next) => {
    try {
        const accIds = await getAccessibleBuildingIds(req.user.id);
        const room = await Room.findOne({
            where: { id: req.params.id, ...roomAccessCondition(req.user.id, accIds) },
            include: [{
                model: Contract, as: "contracts", where: { status: 'active' }, required: false,
                include: [
                    { model: Tenant, as: "tenant", attributes: ["name", "phone"] },
                    { model: ContractFurniture, as: "contractFurnitures", include: [{ model: Furniture, as: "furniture", attributes: ["name", "note"] }] }
                ]
            }, {
                model: Building, as: "building", attributes: ["id", "name", "address"]
            }]
        });
        if (!room) return res.status(404).json({ message: "Không tìm thấy phòng" });
        res.json({ room });
    } catch (error) {
        next(error);
    }
};

exports.createRoom = async (req, res, next) => {
    try {
        const { room_number, floor, area, price, buildingId } = req.body;
        let ownerId = req.user.id;
        if (buildingId) {
            const accIds = await getAccessibleBuildingIds(req.user.id);
            if (!accIds.includes(Number(buildingId))) {
                return res.status(400).json({ message: "Nhà không tồn tại hoặc không thuộc về bạn" });
            }
            const b = await Building.findByPk(buildingId);
            // Phòng luôn thuộc quyền sở hữu của chủ nhà để mọi cộng tác viên cùng thấy
            ownerId = b.landlordId;
        }
        const room = await Room.create({ room_number, floor, area, price, landlordId: ownerId, buildingId: buildingId || null });
        res.status(201).json({ message: "Thêm phòng thành công", room });
    } catch (error) {
        next(error);
    }
};

exports.updateRoom = async (req, res, next) => {
    try {
        const accIds = await getAccessibleBuildingIds(req.user.id);
        const room = await Room.findOne({ where: { id: req.params.id, ...roomAccessCondition(req.user.id, accIds) } });
        if (!room) return res.status(404).json({ message: "Không tìm thấy phòng" });
        const { room_number, floor, area, price, buildingId } = req.body;
        if (buildingId !== undefined && buildingId !== null) {
            const accIds2 = await getAccessibleBuildingIds(req.user.id);
            if (!accIds2.includes(Number(buildingId))) {
                return res.status(400).json({ message: "Nhà không tồn tại hoặc không thuộc về bạn" });
            }
        }
        await room.update({ room_number, floor, area, price, buildingId: buildingId === undefined ? room.buildingId : buildingId });
        res.json({ message: "Cập nhật phòng thành công", room });
    } catch (error) {
        next(error);
    }
};

exports.deleteRoom = async (req, res, next) => {
    try {
        const accIds = await getAccessibleBuildingIds(req.user.id);
        const room = await Room.findOne({ where: { id: req.params.id, ...roomAccessCondition(req.user.id, accIds) } });
        if (!room) return res.status(404).json({ message: "Không tìm thấy phòng" });
        if (room.status !== 'empty') return res.status(400).json({ message: "Chỉ có thể xóa phòng trống" });
        await room.destroy();
        res.json({ message: "Xóa phòng thành công" });
    } catch (error) {
        next(error);
    }
};
