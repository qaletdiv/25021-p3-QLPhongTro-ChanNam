const { User, Companion } = require("../models");
const { findTenantByUser } = require("../utils/tenantHelpers");
const { hashPassword, comparePassword } = require("../utils/password");

const COMPANION_ATTRS = ["id", "name", "phone", "cccd", "relationship", "telegramChatId", "fingerprintCode", "status", "endedAt", "createdAt", "updatedAt"];

exports.getProfile = async (req, res, next) => {
    try {
        const tenant = await findTenantByUser(req.user.id);
        const companions = tenant
            ? await Companion.findAll({ where: { tenantId: tenant.id, status: 'active' }, attributes: COMPANION_ATTRS, order: [["createdAt", "ASC"]] })
            : [];
        const profile = {
            name: req.user.name,
            email: req.user.email,
            phone: req.user.phone,
            cccd: req.user.cccd || (tenant ? tenant.cccd : ""),
            telegramChatId: tenant ? tenant.telegramChatId || "" : "",
            avatar: req.user.avatar,
            companions: companions.map((c) => c.get())
        };
        res.json({ profile });
    } catch (error) {
        next(error);
    }
};

exports.updateProfile = async (req, res, next) => {
    try {
        const { name, email, phone, cccd, telegramChatId, companions } = req.body;
        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (phone) updateData.phone = phone;
        if (cccd !== undefined) updateData.cccd = cccd;

        await req.user.update(updateData);

        const tenant = await findTenantByUser(req.user.id);
        if (tenant) {
            if (cccd !== undefined) await tenant.update({ cccd });
            if (telegramChatId !== undefined) {
                await tenant.update({ telegramChatId: String(telegramChatId).trim() });
            }
            if (Array.isArray(companions)) {
                const incoming = companions.filter((c) => (c.name || "").trim());
                const existing = await Companion.findAll({ where: { tenantId: tenant.id, status: 'active' } });
                const existingById = new Map(existing.map((c) => [c.id, c]));
                const keptIds = [];
                for (const c of incoming) {
                    if (c.id && existingById.has(c.id)) {
                        await existingById.get(c.id).update({
                            name: c.name, phone: c.phone || null, cccd: c.cccd || null, relationship: c.relationship || null, telegramChatId: c.telegramChatId || null, status: 'active',
                        });
                        keptIds.push(c.id);
                    } else {
                        const created = await Companion.create({ name: c.name, phone: c.phone || null, cccd: c.cccd || null, relationship: c.relationship || null, telegramChatId: c.telegramChatId || null, tenantId: tenant.id, status: 'active' });
                        keptIds.push(created.id);
                    }
                }
                const removeIds = existing.filter((c) => !keptIds.includes(c.id)).map((c) => c.id);
                if (removeIds.length) await Companion.update({ status: 'ended', endedAt: new Date() }, { where: { id: removeIds } });
            }
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
        const isMatch = await comparePassword(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: "Mật khẩu cũ không đúng" });

        const hashed = await hashPassword(newPassword);
        await user.update({ password: hashed });
        res.json({ message: "Đổi mật khẩu thành công" });
    } catch (error) {
        next(error);
    }
};
