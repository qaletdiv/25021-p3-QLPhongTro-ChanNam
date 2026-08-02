require("dotenv").config();
const bcrypt = require("bcrypt");
const { sequelize, User } = require("../models");

const EMAIL = process.env.LANDLORD_EMAIL || "chutro@example.com";
const PHONE = process.env.LANDLORD_PHONE || "0900000000";
const PASSWORD = process.env.LANDLORD_PASSWORD || "chutro123";
const NAME = process.env.LANDLORD_NAME || "Chủ trọ";

(async () => {
    try {
        await sequelize.authenticate();
        const [user, created] = await User.findOrCreate({
            where: { email: EMAIL },
            defaults: {
                name: NAME,
                phone: PHONE,
                password: await bcrypt.hash(PASSWORD, 10),
                role: "landlord",
            },
        });
        console.log(created
            ? `Tao chủ trọ thanh cong: ${EMAIL} / ${PASSWORD} (userId=${user.id})`
            : `Email ${EMAIL} đã tồn tại (userId=${user.id}), bỏ qua.`);
        await sequelize.close();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
