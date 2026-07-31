const { Model } = require('sequelize');

module.exports = (sequelize, DataType) => {
    class Invoice extends Model {
        static associate(models) {
            Invoice.belongsTo(models.Contract, { foreignKey: "contractId", as: "contract" });
        }
    }

    Invoice.init({
        contractId: { type: DataType.INTEGER, allowNull: false },
        month: { type: DataType.STRING(7), allowNull: false },
        roomPrice: { type: DataType.DECIMAL(15, 0), allowNull: false, defaultValue: 0 },
        electricityOld: { type: DataType.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
        electricityNew: { type: DataType.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
        electricityCost: { type: DataType.DECIMAL(15, 0), allowNull: false, defaultValue: 0 },
        waterOld: { type: DataType.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
        waterNew: { type: DataType.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
        waterCost: { type: DataType.DECIMAL(15, 0), allowNull: false, defaultValue: 0 },
        serviceFee: { type: DataType.DECIMAL(15, 0), allowNull: false, defaultValue: 0 },
        otherFees: { type: DataType.DECIMAL(15, 0), allowNull: false, defaultValue: 0 },
        total: { type: DataType.DECIMAL(15, 0), allowNull: false, defaultValue: 0 },
        status: { type: DataType.ENUM('pending', 'paid'), allowNull: false, defaultValue: 'pending' },
        paidAt: { type: DataType.DATE, allowNull: true }
    }, {
        sequelize, modelName: "Invoice", tableName: "invoices", timestamps: true
    })

    return Invoice;
}
