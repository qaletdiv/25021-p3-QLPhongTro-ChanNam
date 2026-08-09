const { Model } = require('sequelize');

module.exports = (sequelize, DataType) => {
    class PushSubscription extends Model {
        static associate(models) {
            PushSubscription.belongsTo(models.User, { foreignKey: "userId", as: "user" });
        }
    }

    PushSubscription.init({
        userId: { type: DataType.INTEGER, allowNull: false },
        endpoint: { type: DataType.STRING(500), allowNull: false },
        p256dh: { type: DataType.STRING(255), allowNull: false },
        auth: { type: DataType.STRING(255), allowNull: false },
        userAgent: { type: DataType.STRING(255), allowNull: true }
    }, {
        sequelize, modelName: "PushSubscription", tableName: "push_subscriptions", timestamps: true,
        indexes: [{ unique: true, fields: ["endpoint"] }]
    });

    return PushSubscription;
}