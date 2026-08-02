const { Setting } = require("../models");
const { getResolvedSettings } = require("../utils/settings");
const telegram = require("../utils/telegram");

const ALLOWED_VARS = new Set(["TENKHACH", "MAPHONG", "TONG_TIEN", "THANG", "HAN_THANH_TOAN"]);

exports.getSettings = async (req, res, next) => {
    try {
        const buildingId = req.query.buildingId ? Number(req.query.buildingId) : null;
        const result = await getResolvedSettings(req.user.id, buildingId);
        res.json({ settings: result });
    } catch (error) {
        next(error);
    }
};

function validateTemplate(value) {
    if (/[`$]/.test(value)) {
        return "Mẫu không được chứa ký tự đặc biệt như backtick (`) hoặc ${...}";
    }
    const used = [...value.matchAll(/\{\{\s*([A-Z_]+)\s*\}\}/g)].map((m) => m[1]);
    const unknown = used.find((v) => !ALLOWED_VARS.has(v));
    if (unknown) {
        return `Biến {{${unknown}}} không được hỗ trợ`;
    }
    return null;
}

exports.saveSettings = async (req, res, next) => {
    try {
        const entries = req.body;
        const buildingId = req.query.buildingId ? Number(req.query.buildingId) : null;
        const keys = Object.keys(entries);
        for (const key of keys) {
            const value = String(entries[key]);
            if (key === "autoReminderTemplate" && value.trim()) {
                const err = validateTemplate(value);
                if (err) return res.status(400).json({ message: err });
            }
            const existing = await Setting.findOne({
                where: { key, landlordId: req.user.id, buildingId: buildingId || null }
            });
            if (existing) {
                await existing.update({ value });
            } else {
                await Setting.create({ key, value, landlordId: req.user.id, buildingId: buildingId || null });
            }
        }
        res.json({ message: "Lưu cài đặt thành công" });
    } catch (error) {
        next(error);
    }
};

exports.checkTelegramConnection = async (req, res, next) => {
    try {
        const buildingId = req.query.buildingId ? Number(req.query.buildingId) : null;
        const result = await telegram.checkConnection(req.user.id, buildingId);
        res.json(result);
    } catch (error) {
        next(error);
    }
};
