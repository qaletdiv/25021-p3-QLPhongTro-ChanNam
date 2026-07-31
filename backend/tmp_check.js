process.env.DOTENV_CONFIG_QUIET = "true";
require("dotenv").config({ quiet: true });
const jwt = require("jsonwebtoken");
const { sequelize } = require("./models");
(async () => {
  const [r] = await sequelize.query("SELECT id,role FROM users WHERE email='testlandlord@test.com'");
  const fs = require("fs");
  fs.writeFileSync("tmp_token.txt", jwt.sign({ userId: r[0].id }, process.env.JWT_SECRET, { expiresIn: "7d" }));
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
