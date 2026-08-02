const { Model } = require('sequelize');

module.exports = (sequelize, DataType) => {
    class TenantNotificationRead extends Model {
        static associate(models) {
            TenantNotificationRead.belongsTo(models.Tenant, { foreignKey: "tenantId", as: "tenant" });
        }
    }

    TenantNotificationRead.init({
        tenantId: { type: DataType.INTEGER, allowNull: false },
        kind: { type: DataType.STRING(20), allowNull: false },
        targetId: { type: DataType.INTEGER, allowNull: false }
    }, {
        sequelize, modelName: "TenantNotificationRead", tableName: "tenant_notification_reads", timestamps: true,
        indexes: [{ unique: true, fields: ["tenantId", "kind", "targetId"] }]
    })

    return TenantNotificationRead;
}
