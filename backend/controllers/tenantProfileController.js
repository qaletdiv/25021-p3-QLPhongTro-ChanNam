const bcrypt = require("bcrypt");
const { User } = require("../models");
const { findTenantByUser } = require("../utils/tenantHelpers");

exports.getProfile = async (req, res, next) => {
    try {
        const tenant = await findTenantByUser(req.user.id);
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

        const tenant = await findTenantByUser(req.user.id);
        if (tenant && cccd !== undefined) {
            await tenant.update({ cccd });
        }
        if (tenant && telegramChatId !== undefined) {
            await tenant.update({ telegramChatId: String(telegramChatId).trim() });
        }

        res.json({ message: "Cập nhật thông tin thành công" });
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            const field = error.errors && error.errors[0] && error.errors[0].path;
            const message = field === "phone"
                ? "Số điện thoại đã được sử dụng bởi người dùng khác"
                : field === "email"
                    ? "Email đã được sử dụng bởi người dùng khác"
                    : "Thông tin đã tồn tại";
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
        if (!isMatch) return res.status(400).json({ message: "Mật khẩu cũ không đúng" });

        const hashed = await bcrypt.hash(newPassword, 10);
        await user.update({ password: hashed });
        res.json({ message: "Đổi mật khẩu thành công" });
    } catch (error) {
        next(error);
    }
};
