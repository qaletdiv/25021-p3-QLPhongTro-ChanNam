const { Model } = require('sequelize');

module.exports = (sequelize, DataType) => {
    class AuditLog extends Model {
        static associate(models) {
            AuditLog.belongsTo(models.User, { foreignKey: "actorId", as: "actor" });
        }
    }

    AuditLog.init({
        actorId: { type: DataType.INTEGER, allowNull: true },
        actorType: { type: DataType.STRING(20), allowNull: true },
        action: { type: DataType.STRING(100), allowNull: false },
        entityType: { type: DataType.STRING(50), allowNull: true },
        entityId: { type: DataType.INTEGER, allowNull: true },
        ipAddress: { type: DataType.STRING(64), allowNull: true },
        userAgent: { type: DataType.STRING(255), allowNull: true },
        metadata: { type: DataType.JSON, allowNull: true },
        createdAt: { type: DataType.DATE, allowNull: false }
    }, {
        sequelize, modelName: "AuditLog", tableName: "audit_logs", timestamps: true, updatedAt: false
    });

    return AuditLog;
}