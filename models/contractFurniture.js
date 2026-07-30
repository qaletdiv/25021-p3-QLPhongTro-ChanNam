const { Model } = require('sequelize');

module.exports = (sequelize, DataType) => {
    class ContractFurniture extends Model {
        static associate(models) {
            ContractFurniture.belongsTo(models.Contract, { foreignKey: "contractId", as: "contract" });
            ContractFurniture.belongsTo(models.Furniture, { foreignKey: "furnitureId", as: "furniture" });
        }
    }

    ContractFurniture.init({
        contractId: { type: DataType.INTEGER, allowNull: false },
        furnitureId: { type: DataType.INTEGER, allowNull: false },
        quantity: { type: DataType.INTEGER, allowNull: false, defaultValue: 1 }
    }, {
        sequelize, modelName: "ContractFurniture", tableName: "contract_furnitures", timestamps: true
    })

    return ContractFurniture;
}
