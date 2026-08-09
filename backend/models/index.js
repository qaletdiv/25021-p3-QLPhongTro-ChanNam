const Sequelize = require("sequelize");

const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + "/../config/config.js")[env];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.User = require('./user')(sequelize, Sequelize);
db.AuditLog = require('./auditLog')(sequelize, Sequelize);
db.Room = require('./room')(sequelize, Sequelize);
db.Building = require('./building')(sequelize, Sequelize);
db.Furniture = require('./furniture')(sequelize, Sequelize);
db.Tenant = require('./tenant')(sequelize, Sequelize);
db.Contract = require('./contract')(sequelize, Sequelize);
db.ContractFurniture = require('./contractFurniture')(sequelize, Sequelize);
db.Companion = require('./companion')(sequelize, Sequelize);
db.Invoice = require('./invoice')(sequelize, Sequelize);
db.Notification = require('./notification')(sequelize, Sequelize);
db.Setting = require('./setting')(sequelize, Sequelize);
db.RateHistory = require('./rateHistory')(sequelize, Sequelize);
db.Issue = require('./issue')(sequelize, Sequelize);
db.TenantNotificationRead = require('./tenantNotificationRead')(sequelize, Sequelize);
db.FingerprintHistory = require('./fingerprintHistory')(sequelize, Sequelize);
db.PushSubscription = require('./pushSubscription')(sequelize, Sequelize);

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) db[modelName].associate(db);
})

db.sequelize = sequelize;

module.exports = db;
