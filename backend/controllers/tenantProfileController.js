const bcrypt = require("bcrypt");
const { User, Tenant } = require("../models");

exports.getProfile = async (req, res, next) => {
    try {
        const tenant = await Tenant.findOne({ where: { userId: req.user.id } });
        const profile = {
            name: req.user.name,
            email: req.user.email,
            phone: req.user.phone,
            cccd: req.user.cccd || (tenant ? tenant.cccd : ""),
            telegramChatId: tenant ? tenant.telegramChatId || "" : "",
            avatar: req.user.avatar
        };
        res.json({ profile });
    } catch (error) {
        next(error);
    }
};

exports.updateProfile = async (req, res, next) => {
    try {
        const { name, email, phone, cccd, telegramChatId } = req.body;
        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (phone) updateData.phone = phone;
        if (cccd !== undefined) updateData.cccd = cccd;

        await req.user.update(updateData);

        const tenant = await Tenant.findOne({ where: { userId: req.user.id } });
        if (tenant && cccd !== undefined) {
            await tenant.update({ cccd });
        }
        if (tenant && telegramChatId !== undefined) {
            await tenant.update({ telegramChatId: String(telegramChatId).trim() });
        }

        res.json({ message: "Cap nhat thong tin thanh cong" });
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            const field = error.errors && error.errors[0] && error.errors[0].path;
            const message = field === "phone"
                ? "So dien thoai da duoc su dung boi nguoi dung khac"
                : field === "email"
                    ? "Email da duoc su dung boi nguoi dung khac"
                    : "Thong tin da ton tai";
            return res.status(409).json({ message });
        }
        next(error);
    }
};

exports.changePassword = async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.scope('withPassword').findByPk(req.user.id);
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: "Mat khau cu khong dung" });

        const hashed = await bcrypt.hash(newPassword, 10);
        await user.update({ password: hashed });
        res.json({ message: "Doi mat khau thanh cong" });
    } catch (error) {
        next(error);
    }
};
