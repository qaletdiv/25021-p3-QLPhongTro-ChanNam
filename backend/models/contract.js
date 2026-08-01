const { Model } = require('sequelize');

module.exports = (sequelize, DataType) => {
    class Contract extends Model {
        static associate(models) {
            Contract.belongsTo(models.Tenant, { foreignKey: "tenantId", as: "tenant" });
            Contract.belongsTo(models.Room, { foreignKey: "roomId", as: "room" });
            Contract.hasMany(models.ContractFurniture, { foreignKey: "contractId", as: "contractFurnitures" });
            Contract.hasMany(models.Invoice, { foreignKey: "contractId", as: "invoices" });
        }
    }

    Contract.init({
        tenantId: { type: DataType.INTEGER, allowNull: false },
        roomId: { type: DataType.INTEGER, allowNull: false },
        deposit: { type: DataType.DECIMAL(15, 0), allowNull: false, defaultValue: 0 },
        price: { type: DataType.DECIMAL(15, 0), allowNull: false, defaultValue: 0 },
        startDate: { type: DataType.DATEONLY, allowNull: false },
        endDate: { type: DataType.DATEONLY, allowNull: false },
        paymentDay: { type: DataType.INTEGER, allowNull: false, defaultValue: 5 },
        fingerprintCode: { type: DataType.STRING(255) },
        status: { type: DataType.ENUM('active', 'ended'), allowNull: false, defaultValue: 'active' }
    }, {
        sequelize, modelName: "Contract", tableName: "contracts", timestamps: true
    })

    return Contract;
}
