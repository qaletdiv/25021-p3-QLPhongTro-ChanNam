const { Model } = require('sequelize');

module.exports = (sequelize, DataType) => {
    class Notification extends Model {
        static associate(models) {
            Notification.belongsTo(models.User, { foreignKey: "landlordId", as: "landlord" });
        }
    }

    Notification.init({
        title: { type: DataType.STRING(255), allowNull: false },
        content: { type: DataType.TEXT, allowNull: false },
        targetType: { type: DataType.ENUM('all', 'specific_rooms'), allowNull: false, defaultValue: 'all' },
        targetRoomIds: { type: DataType.TEXT, allowNull: true },
        sentAt: { type: DataType.DATE, allowNull: true },
        recipientCount: { type: DataType.INTEGER, allowNull: false, defaultValue: 0 },
        status: { type: DataType.ENUM('draft', 'sent'), allowNull: false, defaultValue: 'draft' },
        source: { type: DataType.ENUM('manual', 'auto'), allowNull: false, defaultValue: 'manual' },
        type: { type: DataType.STRING(20), allowNull: false, defaultValue: 'broadcast' },
        landlordId: { type: DataType.INTEGER, allowNull: false }
    }, {
        sequelize, modelName: "Notification", tableName: "notifications", timestamps: true
    })

    return Notification;
}
