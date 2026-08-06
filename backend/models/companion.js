const { Model } = require('sequelize');

module.exports = (sequelize, DataType) => {
    class Companion extends Model {
        static associate(models) {
            Companion.belongsTo(models.Tenant, { foreignKey: "tenantId", as: "tenant" });
        }
    }

    Companion.init({
        name: { type: DataType.STRING(100), allowNull: false },
        phone: { type: DataType.STRING(20) },
        cccd: { type: DataType.STRING(20) },
        relationship: { type: DataType.STRING(50) },
        telegramChatId: { type: DataType.STRING(64) },
        fingerprintCode: { type: DataType.STRING(255) },
        status: { type: DataType.STRING(20), defaultValue: 'active' },
        endedAt: { type: DataType.DATE, allowNull: true }
    }, {
        sequelize, modelName: "Companion", tableName: "companions", timestamps: true
    })

    return Companion;
}
