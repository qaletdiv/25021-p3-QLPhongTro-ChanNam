require('dotenv').config({ override: true });
const { Sequelize } = require('sequelize');
const c = require('./config/config');
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

  // 2. Add unique index on settings(key, landlordId) if missing
  try {
    const [idx] = await seq.query("SHOW INDEX FROM settings WHERE Key_name = 'idx_key_landlord'");
    if (idx.length === 0) {
      await seq.query("DELETE s1 FROM settings s1 INNER JOIN settings s2 WHERE s1.id < s2.id AND s1.`key` = s2.`key` AND s1.landlordId = s2.landlordId");
      await seq.query("ALTER TABLE settings ADD UNIQUE INDEX idx_key_landlord (`key`, landlordId)");
      console.log('Added unique index to settings');
    }
  } catch(e) { console.log('settings error:', e.message); }

  console.log('Done');
  process.exit(0);
}
run();
