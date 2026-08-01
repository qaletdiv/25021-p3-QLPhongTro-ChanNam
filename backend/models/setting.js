const { Model } = require('sequelize');

module.exports = (sequelize, DataType) => {
    class Setting extends Model {
        static associate(models) {
            Setting.belongsTo(models.User, { foreignKey: "landlordId", as: "landlord" });
            Setting.belongsTo(models.Building, { foreignKey: "buildingId", as: "building" });
        }
    }

    Setting.init({
        key: { type: DataType.STRING(100), allowNull: false },
        value: { type: DataType.TEXT, allowNull: true },
        landlordId: { type: DataType.INTEGER, allowNull: false },
        buildingId: { type: DataType.INTEGER, allowNull: true }
    }, {
        sequelize, modelName: "Setting", tableName: "settings", timestamps: true
    })

    return Setting;
}
