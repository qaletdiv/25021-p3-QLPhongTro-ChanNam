const { Model } = require('sequelize');

module.exports = (sequelize, DataType) => {
    class User extends Model {
        static associate(models) {
            User.hasMany(models.Room, { foreignKey: "landlordId", as: "rooms" });
            User.hasMany(models.Building, { foreignKey: "landlordId", as: "buildings" });
            User.hasMany(models.Furniture, { foreignKey: "landlordId", as: "furnitures" });
            User.hasMany(models.Tenant, { foreignKey: "userId", as: "tenants" });
        }
    }

    User.init({
        email: { type: DataType.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
        phone: { type: DataType.STRING(20), allowNull: false, unique: true },
        password: { type: DataType.STRING, allowNull: false },
        name: { type: DataType.STRING(100), allowNull: false },
        role: { type: DataType.ENUM('landlord', 'tenant'), allowNull: false, defaultValue: 'tenant' },
        currentSessionToken: { type: DataType.STRING(255), allowNull: true },
        isActive: { type: DataType.BOOLEAN, allowNull: false, defaultValue: true },
        avatar: { type: DataType.STRING },
        cccd: { type: DataType.STRING(20) }
    }, {
        sequelize, modelName: "User", tableName: "users", timestamps: true,
        defaultScope: { attributes: { exclude: ["password"] } },
        scopes: { withPassword: { attributes: {} } }
    })

    return User;
}
