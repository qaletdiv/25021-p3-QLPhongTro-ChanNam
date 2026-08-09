const { Model } = require('sequelize');

module.exports = (sequelize, DataType) => {
    class FingerprintHistory extends Model {
        static associate(models) {
            FingerprintHistory.belongsTo(models.User, { foreignKey: "landlordId", as: "landlord" });
            FingerprintHistory.belongsTo(models.Tenant, { foreignKey: "tenantId", as: "tenant" });
            FingerprintHistory.belongsTo(models.Room, { foreignKey: "roomId", as: "room" });
            FingerprintHistory.belongsTo(models.Building, { foreignKey: "buildingId", as: "building" });
        }
    }

    FingerprintHistory.init({
        fingerprintCode: { type: DataType.STRING(255), allowNull: false },
        ownerType: { type: DataType.ENUM('tenant', 'companion'), allowNull: false, defaultValue: 'tenant' },
        ownerId: { type: DataType.INTEGER, allowNull: true },
        ownerName: { type: DataType.STRING(255), allowNull: true },
        tenantId: { type: DataType.INTEGER, allowNull: true },
        roomId: { type: DataType.INTEGER, allowNull: true },
        buildingId: { type: DataType.INTEGER, allowNull: true },
        landlordId: { type: DataType.INTEGER, allowNull: false },
        action: { type: DataType.ENUM('assigned', 'removed'), allowNull: false, defaultValue: 'assigned' }
    }, {
        sequelize, modelName: "FingerprintHistory", tableName: "fingerprint_histories", timestamps: true
    })

    return FingerprintHistory;
}