const { Model } = require('sequelize');

module.exports = (sequelize, DataType) => {
    class Building extends Model {
        static associate(models) {
            Building.belongsTo(models.User, { foreignKey: "landlordId", as: "landlord" });
            Building.hasMany(models.Room, { foreignKey: "buildingId", as: "rooms" });
        }
    }

    Building.init({
        name: { type: DataType.STRING(100), allowNull: false },
        address: { type: DataType.TEXT, allowNull: true },
        landlordId: { type: DataType.INTEGER, allowNull: false }
    }, {
        sequelize, modelName: "Building", tableName: "buildings", timestamps: true
    })

    return Building;
}
