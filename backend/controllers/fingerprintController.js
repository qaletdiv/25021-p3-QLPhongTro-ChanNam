const { FingerprintHistory, Room, Building } = require("../models");
const { Op } = require("sequelize");
const { getAccessibleBuildingIds } = require("../utils/buildingAccess");

exports.getFingerprintHistories = async (req, res, next) => {
    try {
        const { buildingId, fingerprintCode, search, ownerType } = req.query;
        const accIds = await getAccessibleBuildingIds(req.user.id);
        const where = { buildingId: { [Op.in]: accIds.length ? accIds : [-1] } };
        if (buildingId && buildingId !== 'all') where.buildingId = Number(buildingId);
        if (fingerprintCode && fingerprintCode !== 'all') where.fingerprintCode = fingerprintCode;
        if (ownerType && ownerType !== 'all') where.ownerType = ownerType;
        if (search) {
            where[Op.or] = [
                { fingerprintCode: { [Op.like]: `%${search}%` } },
                { ownerName: { [Op.like]: `%${search}%` } }
            ];
        }

        const history = await FingerprintHistory.findAll({
            where,
            include: [
                { model: Room, as: "room", attributes: ["room_number", "buildingId"], include: [{ model: Building, as: "building", attributes: ["name"] }] }
            ],
            order: [["createdAt", "ASC"]]
        });

        res.json({ history });
    } catch (error) {
        next(error);
    }
};

exports.getFingerprintGroups = async (req, res, next) => {
    try {
        const { buildingId, search } = req.query;
        const accIds = await getAccessibleBuildingIds(req.user.id);
        const where = { buildingId: { [Op.in]: accIds.length ? accIds : [-1] } };
        if (buildingId && buildingId !== 'all') where.buildingId = Number(buildingId);
        if (search) {
            where[Op.or] = [
                { fingerprintCode: { [Op.like]: `%${search}%` } },
                { ownerName: { [Op.like]: `%${search}%` } }
            ];
        }

        const all = await FingerprintHistory.findAll({
            where,
            include: [
                { model: Room, as: "room", attributes: ["room_number", "buildingId"], include: [{ model: Building, as: "building", attributes: ["name"] }] }
            ],
            order: [["createdAt", "ASC"]]
        });
        const groups = {};
        for (const h of all) {
            if (!groups[h.fingerprintCode]) groups[h.fingerprintCode] = { fingerprintCode: h.fingerprintCode, roomId: h.roomId, buildingId: h.buildingId, history: [] };
            groups[h.fingerprintCode].history.push(h);
        }
        res.json({ groups: Object.values(groups) });
    } catch (error) {
        next(error);
    }
};