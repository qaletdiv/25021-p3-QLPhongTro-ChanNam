require('dotenv').config({ override: true });
const { Sequelize } = require('sequelize');
const c = require('../config/config');
const cfg = c.development;
const seq = new Sequelize(cfg.database, cfg.username, cfg.password,
  { host: cfg.host, port: cfg.port, dialect: cfg.dialect, logging: false });

async function run() {
  // 1. Add fingerprintCode if missing
  try {
    const [cols] = await seq.query("SHOW COLUMNS FROM companions LIKE 'fingerprintCode'");
    if (cols.length === 0) {
      await seq.query("ALTER TABLE companions ADD COLUMN fingerprintCode VARCHAR(255) DEFAULT NULL AFTER relationship");
      console.log('Added fingerprintCode to companions');
    }
  } catch(e) { console.log('companions error:', e.message); }

  // 1b. Add status if missing
  try {
    const [cols] = await seq.query("SHOW COLUMNS FROM companions LIKE 'status'");
    if (cols.length === 0) {
      await seq.query("ALTER TABLE companions ADD COLUMN status VARCHAR(20) DEFAULT 'active' AFTER fingerprintCode");
      console.log('Added status to companions');
    }
  } catch(e) { console.log('companions status error:', e.message); }

  // 1c. Add endedAt to companions if missing
  try {
    const [cols] = await seq.query("SHOW COLUMNS FROM companions LIKE 'endedAt'");
    if (cols.length === 0) {
      await seq.query("ALTER TABLE companions ADD COLUMN endedAt DATETIME NULL DEFAULT NULL AFTER status");
      console.log('Added endedAt to companions');
    }
  } catch(e) { console.log('companions endedAt error:', e.message); }

  // 1d. Add telegramChatId to companions if missing
  try {
    const [cols] = await seq.query("SHOW COLUMNS FROM companions LIKE 'telegramChatId'");
    if (cols.length === 0) {
      await seq.query("ALTER TABLE companions ADD COLUMN telegramChatId VARCHAR(64) NULL DEFAULT NULL AFTER relationship");
      console.log('Added telegramChatId to companions');
    }
  } catch(e) { console.log('companions telegramChatId error:', e.message); }

  // 2. Add unique index on settings(key, landlordId) if missing
  try {
    const [idx] = await seq.query("SHOW INDEX FROM settings WHERE Key_name = 'idx_key_landlord'");
    if (idx.length === 0) {
      await seq.query("DELETE s1 FROM settings s1 INNER JOIN settings s2 WHERE s1.id < s2.id AND s1.`key` = s2.`key` AND s1.landlordId = s2.landlordId");
      await seq.query("ALTER TABLE settings ADD UNIQUE INDEX idx_key_landlord (`key`, landlordId)");
      console.log('Added unique index to settings');
    }
  } catch(e) { console.log('settings error:', e.message); }

  // 2b. Add checkoutDate to contracts if missing
  try {
    const [cols] = await seq.query("SHOW COLUMNS FROM contracts LIKE 'checkoutDate'");
    if (cols.length === 0) {
      await seq.query("ALTER TABLE contracts ADD COLUMN checkoutDate DATE NULL DEFAULT NULL AFTER status");
      console.log('Added checkoutDate to contracts');
    }
  } catch(e) { console.log('contracts checkoutDate error:', e.message); }

  // 2c. Drop the legacy plaintext tenants.password column (security fix).
  // Tenant credentials live only in users.password (bcrypt hash); the mirrored
  // plaintext copy is removed together with any data still stored in it.
  try {
    const [cols] = await seq.query("SHOW COLUMNS FROM tenants LIKE 'password'");
    if (cols.length > 0) {
      await seq.query("ALTER TABLE tenants DROP COLUMN password");
      console.log('Dropped legacy plaintext password column from tenants');
    }
  } catch(e) { console.log('tenants drop password error:', e.message); }

  // 3. Create rate_histories table if missing
  try {
    const [tables] = await seq.query("SHOW TABLES LIKE 'rate_histories'");
    if (tables.length === 0) {
      await seq.query(`CREATE TABLE rate_histories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        \`key\` VARCHAR(100) NOT NULL,
        value DECIMAL(12,2) NULL,
        landlordId INT NOT NULL,
        buildingId INT NULL DEFAULT NULL,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL,
        INDEX idx_rate_landlord (\`key\`, landlordId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
      console.log('Created rate_histories table');
    }
  } catch(e) { console.log('rate_histories error:', e.message); }

  // 3b. Add isActive to users if missing
  try {
    const [cols] = await seq.query("SHOW COLUMNS FROM users LIKE 'isActive'");
    if (cols.length === 0) {
      await seq.query("ALTER TABLE users ADD COLUMN isActive TINYINT(1) NOT NULL DEFAULT 1 AFTER currentSessionToken");
      console.log('Added isActive to users');
    }
  } catch(e) { console.log('users isActive error:', e.message); }

  // 4. Create fingerprint_histories table if missing
  try {
    const [tables] = await seq.query("SHOW TABLES LIKE 'fingerprint_histories'");
    if (tables.length === 0) {
      await seq.query(`CREATE TABLE fingerprint_histories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fingerprintCode VARCHAR(255) NOT NULL,
        ownerType ENUM('tenant','companion') NOT NULL DEFAULT 'tenant',
        ownerId INT NULL DEFAULT NULL,
        ownerName VARCHAR(255) NULL DEFAULT NULL,
        tenantId INT NULL DEFAULT NULL,
        roomId INT NULL DEFAULT NULL,
        buildingId INT NULL DEFAULT NULL,
        landlordId INT NOT NULL,
        \`action\` ENUM('assigned','removed') NOT NULL DEFAULT 'assigned',
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL,
        INDEX idx_fp_landlord (landlordId, fingerprintCode)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
      console.log('Created fingerprint_histories table');
    }
  } catch(e) { console.log('fingerprint_histories error:', e.message); }

  // 5. Create audit_logs table if missing
  try {
    const [tables] = await seq.query("SHOW TABLES LIKE 'audit_logs'");
    if (tables.length === 0) {
      await seq.query(`CREATE TABLE audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        actorId INT NULL DEFAULT NULL,
        actorType VARCHAR(20) NULL DEFAULT 'user',
        \`action\` VARCHAR(100) NOT NULL,
        entityType VARCHAR(50) NULL DEFAULT NULL,
        entityId INT NULL DEFAULT NULL,
        ipAddress VARCHAR(64) NULL DEFAULT NULL,
        userAgent VARCHAR(255) NULL DEFAULT NULL,
        metadata JSON NULL DEFAULT NULL,
        createdAt DATETIME NOT NULL,
        INDEX idx_audit_actor (actorId),
        INDEX idx_audit_action (\`action\`, createdAt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
      console.log('Created audit_logs table');
    }
  } catch(e) { console.log('audit_logs error:', e.message); }

  // 6. Create push_subscriptions table if missing
  try {
    const [tables] = await seq.query("SHOW TABLES LIKE 'push_subscriptions'");
    if (tables.length === 0) {
      await seq.query(`CREATE TABLE push_subscriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        endpoint VARCHAR(500) NOT NULL,
        p256dh VARCHAR(255) NOT NULL,
        \`auth\` VARCHAR(255) NOT NULL,
        userAgent VARCHAR(255) NULL DEFAULT NULL,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL,
        UNIQUE INDEX uk_push_endpoint (endpoint),
        INDEX idx_push_user (userId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
      console.log('Created push_subscriptions table');
    }
  } catch(e) { console.log('push_subscriptions error:', e.message); }

  // 7. Create building_collaborators table if missing (shared building access for co-landlords)
  try {
    const [tables] = await seq.query("SHOW TABLES LIKE 'building_collaborators'");
    if (tables.length === 0) {
      await seq.query(`CREATE TABLE building_collaborators (
        id INT AUTO_INCREMENT PRIMARY KEY,
        buildingId INT NOT NULL,
        userId INT NOT NULL,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL,
        UNIQUE INDEX uq_bc_building_user (buildingId, userId),
        INDEX idx_bc_user (userId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
      console.log('Created building_collaborators table');
    }
  } catch(e) { console.log('building_collaborators error:', e.message); }

  // 8. Add buildingId to tenants if missing (tenant-selected building at registration)
  try {
    const [cols] = await seq.query("SHOW COLUMNS FROM tenants LIKE 'buildingId'");
    if (cols.length === 0) {
      await seq.query("ALTER TABLE tenants ADD COLUMN buildingId INT NULL DEFAULT NULL AFTER userId");
      console.log('Added buildingId to tenants');
    }
  } catch(e) { console.log('tenants buildingId error:', e.message); }

  // 8b. Add isRead to notifications if missing (model expects it; missing column 500s every GET).
  try {
    const [cols] = await seq.query("SHOW COLUMNS FROM notifications LIKE 'isRead'");
    if (cols.length === 0) {
      await seq.query("ALTER TABLE notifications ADD COLUMN isRead TINYINT(1) NOT NULL DEFAULT 0 AFTER status");
      console.log('Added isRead to notifications');
    }
  } catch(e) { console.log('notifications isRead error:', e.message); }

  // 9. Backfill tenants.buildingId from the building of the room they rent.
  // The tenant list is scoped by building access, so legacy rows created before
  // the buildingId column existed must be attached to their building to stay visible.
  try {
    const [result] = await seq.query(`
      UPDATE tenants t
      JOIN (
        SELECT c.tenantId, MAX(r.buildingId) AS buildingId
        FROM contracts c
        JOIN rooms r ON r.id = c.roomId
        WHERE r.buildingId IS NOT NULL
        GROUP BY c.tenantId
      ) src ON src.tenantId = t.id
      SET t.buildingId = src.buildingId
      WHERE t.buildingId IS NULL
    `);
    console.log('Backfilled tenants.buildingId from contracts:', result.affectedRows ?? 0, 'row(s)');
  } catch(e) { console.log('tenants buildingId backfill error:', e.message); }

  console.log('Done');
  process.exit(0);
}
run();
