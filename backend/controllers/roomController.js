const { Room, Contract, ContractFurniture, Furniture, Tenant, Building } = require("../models");

exports.getRooms = async (req, res, next) => {
    try {
        const { status, buildingId } = req.query;
        const where = { landlordId: req.user.id };
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
        const room = await Room.findOne({
            where: { id: req.params.id, landlordId: req.user.id },
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
        if (!room) return res.status(404).json({ message: "Khong tim thay phong" });
        res.json({ room });
    } catch (error) {
        next(error);
    }
};

exports.createRoom = async (req, res, next) => {
    try {
        const { room_number, floor, area, price, buildingId } = req.body;
        if (buildingId) {
            const building = await Building.findOne({ where: { id: buildingId, landlordId: req.user.id } });
            if (!building) return res.status(400).json({ message: "Nha khong ton tai hoac khong thuoc ve ban" });
        }
        const room = await Room.create({ room_number, floor, area, price, landlordId: req.user.id, buildingId: buildingId || null });
        res.status(201).json({ message: "Them phong thanh cong", room });
    } catch (error) {
        next(error);
    }
};

exports.updateRoom = async (req, res, next) => {
    try {
        const room = await Room.findOne({ where: { id: req.params.id, landlordId: req.user.id } });
        if (!room) return res.status(404).json({ message: "Khong tim thay phong" });
        const { room_number, floor, area, price, buildingId } = req.body;
        if (buildingId !== undefined && buildingId !== null) {
            const building = await Building.findOne({ where: { id: buildingId, landlordId: req.user.id } });
            if (!building) return res.status(400).json({ message: "Nha khong ton tai hoac khong thuoc ve ban" });
        }
        await room.update({ room_number, floor, area, price, buildingId: buildingId === undefined ? room.buildingId : buildingId });
        res.json({ message: "Cap nhat phong thanh cong", room });
    } catch (error) {
        next(error);
    }
};

exports.deleteRoom = async (req, res, next) => {
    try {
        const room = await Room.findOne({ where: { id: req.params.id, landlordId: req.user.id } });
        if (!room) return res.status(404).json({ message: "Khong tim thay phong" });
        if (room.status !== 'empty') return res.status(400).json({ message: "Chi co the xoa phong trong" });
        await room.destroy();
        res.json({ message: "Xoa phong thanh cong" });
    } catch (error) {
        next(error);
    }
};
