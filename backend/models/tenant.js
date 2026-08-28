const { Model } = require('sequelize');

module.exports = (sequelize, DataType) => {
    class Tenant extends Model {
        static associate(models) {
            Tenant.belongsTo(models.User, { foreignKey: "userId", as: "user" });
            Tenant.belongsTo(models.Building, { foreignKey: "buildingId", as: "building" });
            Tenant.hasMany(models.Contract, { foreignKey: "tenantId", as: "contracts" });
            Tenant.hasMany(models.Companion, { foreignKey: "tenantId", as: "companions" });
        }
    }

    Tenant.init({
        name: { type: DataType.STRING(100), allowNull: false },
        phone: { type: DataType.STRING(20), allowNull: false },
        cccd: { type: DataType.STRING(20) },
        password: { type: DataType.STRING(255) },
        telegramChatId: { type: DataType.STRING(64) },
        userId: { type: DataType.INTEGER },
        buildingId: { type: DataType.INTEGER }
    }, {
        sequelize, modelName: "Tenant", tableName: "tenants", timestamps: true
    })

    return Tenant;
}
