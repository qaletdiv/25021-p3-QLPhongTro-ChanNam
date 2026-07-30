const { Setting } = require("../models");

exports.getSettings = async (req, res, next) => {
    try {
        const settings = await Setting.findAll({ where: { landlordId: req.user.id } });
        const result = {};
        settings.forEach(s => { result[s.key] = s.value; });
        res.json({ settings: result });
    } catch (error) {
        next(error);
    }
};

exports.saveSettings = async (req, res, next) => {
    try {
        const entries = req.body;
        const keys = Object.keys(entries);
        for (const key of keys) {
            const value = String(entries[key]);
            await Setting.upsert({ key, value, landlordId: req.user.id });
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
