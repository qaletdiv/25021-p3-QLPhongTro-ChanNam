const { Op } = require("sequelize");
const { AuditLog, User } = require("../models");

exports.getAuditLogs = async (req, res, next) => {
    try {
        const { search, action, from, to, entityType, page = 1 } = req.query;
        const where = {};

        if (action && action !== "all") where.action = action;
        if (entityType && entityType !== "all") where.entityType = entityType;

        const range = {};
        if (from) range[Op.gte] = new Date(from);
        if (to) range[Op.lte] = new Date(to);
        if (from || to) where.createdAt = range;

        if (search) {
            where.action = { [Op.like]: `%${search}%` };
        }

        const limit = 50;
        const offset = (Number(page) || 1) <= 1 ? 0 : ((Number(page) || 1) - 1) * limit;

        const { rows, count } = await AuditLog.findAndCountAll({
            where,
            include: [{ model: User, as: "actor", attributes: ["id", "name", "email", "role"] }],
            order: [["createdAt", "DESC"]],
            limit,
            offset,
        });

        res.json({ logs: rows, total: count });
    } catch (error) {
        next(error);
    }
};