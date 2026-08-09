const models = require("../models");

exports.writeAuditLog = async ({ actorId, actorType, action, targetType, targetId, req, metadata = {} }) => {
    try {
        await models.AuditLog.create({
            actorId: actorId || null,
            actorType: actorType || "user",
            action,
            entityType: targetType || null,
            entityId: targetId || null,
            ipAddress: req ? (req.ip || null) : null,
            userAgent: req ? ((req.headers && req.headers["user-agent"]) || null).slice(0, 255) : null,
            metadata,
        });
    } catch (error) {
        console.error("Audit log write failed:", error.message);
    }
};