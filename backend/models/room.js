const { Model } = require('sequelize');

module.exports = (sequelize, DataType) => {
    class Room extends Model {
        static associate(models) {
            Room.belongsTo(models.User, { foreignKey: "landlordId", as: "landlord" });
            Room.belongsTo(models.Building, { foreignKey: "buildingId", as: "building" });
            Room.hasMany(models.Contract, { foreignKey: "roomId", as: "contracts" });
        }
    }

    Room.init({
        room_number: { type: DataType.STRING(20), allowNull: false },
        floor: { type: DataType.INTEGER, defaultValue: 1 },
        area: { type: DataType.DECIMAL(10, 2) },
        price: { type: DataType.DECIMAL(15, 0), allowNull: false },
        status: { type: DataType.ENUM('empty', 'rented'), allowNull: false, defaultValue: 'empty' },
        landlordId: { type: DataType.INTEGER, allowNull: false },
        buildingId: { type: DataType.INTEGER, allowNull: true }
    }, {
        sequelize, modelName: "Room", tableName: "rooms", timestamps: true
    })

    return Room;
}
