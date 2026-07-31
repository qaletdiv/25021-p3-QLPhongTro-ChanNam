const { Model } = require('sequelize');

module.exports = (sequelize, DataType) => {
    class Tenant extends Model {
        static associate(models) {
            Tenant.belongsTo(models.User, { foreignKey: "userId", as: "user" });
            Tenant.hasMany(models.Contract, { foreignKey: "tenantId", as: "contracts" });
            Tenant.hasMany(models.Companion, { foreignKey: "tenantId", as: "companions" });
        }
    }

    Tenant.init({
        name: { type: DataType.STRING(100), allowNull: false },
        phone: { type: DataType.STRING(20), allowNull: false },
        cccd: { type: DataType.STRING(20) },
        userId: { type: DataType.INTEGER }
    }, {
        sequelize, modelName: "Tenant", tableName: "tenants", timestamps: true
    })

    return Tenant;
}
