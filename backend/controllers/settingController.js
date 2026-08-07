const { Setting, RateHistory } = require("../models");
const { getResolvedSettings } = require("../utils/settings");
const telegram = require("../utils/telegram");

const ALLOWED_VARS = new Set(["TENKHACH", "MAPHONG", "TONG_TIEN", "THANG", "HAN_THANH_TOAN"]);

const RATE_KEYS = new Set(["electricityRate", "waterRate", "serviceFee"]);

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
            const buildScope = buildingId || null;
            const existing = await Setting.findOne({
                where: { key, landlordId: req.user.id, buildingId: buildScope }
            });
            const oldValue = existing ? existing.value : null;
            if (existing) {
                await existing.update({ value });
            } else {
                await Setting.create({ key, value, landlordId: req.user.id, buildingId: buildScope });
            }
            if (RATE_KEYS.has(key) && value !== '') {
                const histExists = await RateHistory.findOne({
                    where: { key, landlordId: req.user.id, buildingId: buildScope }
                });
                if (!histExists && oldValue !== null && oldValue !== '' && !Number.isNaN(Number(oldValue))) {
                    await RateHistory.create({ key, value: Number(oldValue), landlordId: req.user.id, buildingId: buildScope });
                }
                await RateHistory.create({ key, value: Number(value), landlordId: req.user.id, buildingId: buildScope });
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

exports.getRateHistory = async (req, res, next) => {
    try {
        const buildingId = req.query.buildingId ? Number(req.query.buildingId) : null;
        const scope = (bid) => ({ landlordId: req.user.id, ...(bid ? { buildingId: bid } : { buildingId: null }) });
        let existing = await RateHistory.findAll({
            where: scope(buildingId),
            order: [["createdAt", "ASC"]]
        });
        if (buildingId && existing.length === 0) {
            existing = await RateHistory.findAll({
                where: scope(null),
                order: [["createdAt", "ASC"]]
            });
        }
        if (existing.length === 0) {
            const settings = await Setting.findAll({
                where: { key: [...RATE_KEYS], ...(buildingId ? { landlordId: req.user.id } : scope(null)) }
            });
            if (settings.length > 0) {
                const rows = settings
                    .filter((s) => s.value !== '' && s.value !== null && !Number.isNaN(Number(s.value)))
                    .map((s) => ({
                        id: -Math.abs(s.id),
                        key: s.key,
                        value: Number(s.value),
                        landlordId: s.landlordId,
                        buildingId: s.buildingId,
                        createdAt: s.createdAt,
                        updatedAt: s.updatedAt
                    }));
                return res.json({ history: rows });
            }
        }
        res.json({ history: existing });
    } catch (error) {
        next(error);
    }
};
