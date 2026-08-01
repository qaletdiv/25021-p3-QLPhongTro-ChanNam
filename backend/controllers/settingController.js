const { Setting } = require("../models");
const { getResolvedSettings } = require("../utils/settings");

exports.getSettings = async (req, res, next) => {
    try {
        const buildingId = req.query.buildingId ? Number(req.query.buildingId) : null;
        const result = await getResolvedSettings(req.user.id, buildingId);
        res.json({ settings: result });
    } catch (error) {
        next(error);
    }
};

exports.saveSettings = async (req, res, next) => {
    try {
        const entries = req.body;
        const buildingId = req.query.buildingId ? Number(req.query.buildingId) : null;
        const keys = Object.keys(entries);
        for (const key of keys) {
            const value = String(entries[key]);
            const [existing] = await Setting.findAll({
                where: { key, landlordId: req.user.id, buildingId: buildingId || null }
            });
            if (existing) {
                await existing.update({ value });
            } else {
                await Setting.create({ key, value, landlordId: req.user.id, buildingId: buildingId || null });
            }
        }
        res.json({ message: "Luu cai dat thanh cong" });
    } catch (error) {
        next(error);
    }
};

exports.checkZaloConnection = async (req, res, next) => {
    try {
        res.json({ message: "Zalo OA ket noi thanh cong (gia lap)" });
    } catch (error) {
        next(error);
    }
};
