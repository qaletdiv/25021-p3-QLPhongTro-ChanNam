const { Furniture } = require("../models");

exports.getFurnitures = async (req, res, next) => {
    try {
        const furnitures = await Furniture.findAll({ where: { landlordId: req.user.id }, order: [['name', 'ASC']] });
        res.json({ furnitures });
    } catch (error) {
        next(error);
    }
};

exports.createFurniture = async (req, res, next) => {
    try {
        const { name, note, default_quantity } = req.body;
        const furniture = await Furniture.create({ name, note, default_quantity: default_quantity || 1, landlordId: req.user.id });
        res.status(201).json({ message: "Them vat dung thanh cong", furniture });
    } catch (error) {
        next(error);
    }
};

exports.updateFurniture = async (req, res, next) => {
    try {
        const furniture = await Furniture.findOne({ where: { id: req.params.id, landlordId: req.user.id } });
        if (!furniture) return res.status(404).json({ message: "Khong tim thay vat dung" });
        await furniture.update(req.body);
        res.json({ message: "Cap nhat vat dung thanh cong", furniture });
    } catch (error) {
        next(error);
    }
};

exports.deleteFurniture = async (req, res, next) => {
    try {
        const furniture = await Furniture.findOne({ where: { id: req.params.id, landlordId: req.user.id } });
        if (!furniture) return res.status(404).json({ message: "Khong tim thay vat dung" });
        await furniture.destroy();
        res.json({ message: "Xoa vat dung thanh cong" });
    } catch (error) {
        next(error);
    }
};
