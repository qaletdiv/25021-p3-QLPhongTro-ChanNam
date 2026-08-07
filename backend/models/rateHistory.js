const { Model } = require('sequelize');

module.exports = (sequelize, DataType) => {
    class RateHistory extends Model {
        static associate(models) {
            RateHistory.belongsTo(models.User, { foreignKey: "landlordId", as: "landlord" });
            RateHistory.belongsTo(models.Building, { foreignKey: "buildingId", as: "building" });
        }
    }

    RateHistory.init({
        key: { type: DataType.STRING(100), allowNull: false },
        value: { type: DataType.DECIMAL(12, 2), allowNull: true },
        landlordId: { type: DataType.INTEGER, allowNull: false },
        buildingId: { type: DataType.INTEGER, allowNull: true }
    }, {
        sequelize, modelName: "RateHistory", tableName: "rate_histories", timestamps: true
    })

    return RateHistory;
}