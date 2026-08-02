const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User, Tenant, Companion } = require("../models");

exports.register = async (req, res, next) => {
    try {
        const { name, email, phone, password, role, cccd, companions } = req.body;
        if ((role || 'tenant') === 'landlord') {
            return res.status(403).json({ message: "Không được phép tự đăng ký tài khoản chủ trọ" });
        }
        const hashPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ name, email, phone, password: hashPassword, role: role || 'tenant' });

        if (role === 'tenant') {
            const tenant = await Tenant.create({ name, phone, cccd: cccd || null, userId: newUser.id });
            if (companions && companions.length > 0) {
                const items = companions.map(c => ({ ...c, tenantId: tenant.id }));
                await Companion.bulkCreate(items);
            }
        }

        const payload = { userId: newUser.id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        res.status(201).json({ message: "Đăng ký thành công", token, user: { id: newUser.id, name, email, phone, role: role || 'tenant' } });
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            const field = error.errors[0].path;
            return res.status(409).json({ message: `${field === 'email' ? 'Email' : 'SĐT'} đã tồn tại` });
        }
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.scope("withPassword").findOne({ where: { email } });
        if (!user) return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
        const payload = { userId: user.id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        res.json({ message: "Đăng nhập thành công", token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
    } catch (error) {
        next(error);
    }
};

exports.getMe = async (req, res, next) => {
    res.json({ user: req.user });
};
