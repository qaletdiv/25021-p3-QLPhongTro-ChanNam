const { Model } = require('sequelize');

module.exports = (sequelize, DataType) => {
    class Furniture extends Model {
        static associate(models) {
            Furniture.belongsTo(models.User, { foreignKey: "landlordId", as: "landlord" });
            Furniture.hasMany(models.ContractFurniture, { foreignKey: "furnitureId", as: "contractFurnitures" });
        }
    }

    Furniture.init({
        name: { type: DataType.STRING, allowNull: false },
        note: { type: DataType.TEXT },
        default_quantity: { type: DataType.INTEGER, allowNull: false, defaultValue: 1 },
        landlordId: { type: DataType.INTEGER, allowNull: false }
    }, {
        sequelize, modelName: "Furniture", tableName: "furnitures", timestamps: true
    })

    return Furniture;
}
