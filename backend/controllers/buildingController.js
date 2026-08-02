const { Building, Room } = require("../models");

exports.getBuildings = async (req, res, next) => {
    try {
        const buildings = await Building.findAll({
            where: { landlordId: req.user.id },
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
        const building = await Building.findOne({
            where: { id: req.params.id, landlordId: req.user.id },
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
