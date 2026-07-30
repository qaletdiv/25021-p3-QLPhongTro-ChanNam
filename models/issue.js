const { Model } = require('sequelize');

module.exports = (sequelize, DataType) => {
    class Issue extends Model {
        static associate(models) {
            Issue.belongsTo(models.Tenant, { foreignKey: "tenantId", as: "tenant" });
            Issue.belongsTo(models.Room, { foreignKey: "roomId", as: "room" });
        }
    }

    Issue.init({
        tenantId: { type: DataType.INTEGER, allowNull: false },
        roomId: { type: DataType.INTEGER, allowNull: false },
        title: { type: DataType.STRING(255), allowNull: false },
        description: { type: DataType.TEXT, allowNull: true },
        images: { type: DataType.TEXT, allowNull: true },
        status: { type: DataType.ENUM('pending', 'resolved'), allowNull: false, defaultValue: 'pending' }
    }, {
        sequelize, modelName: "Issue", tableName: "issues", timestamps: true
    })

    return Issue;
}
