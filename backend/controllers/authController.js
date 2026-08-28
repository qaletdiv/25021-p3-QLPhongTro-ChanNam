const jwt = require("jsonwebtoken");
const { User, Tenant, Companion } = require("../models");
const { generateSessionToken, setAuthCookie } = require("../utils/cookies");
const { writeAuditLog } = require("../utils/auditLog");
const { hashPassword, comparePassword } = require("../utils/password");

const signToken = (user, sessionId) => jwt.sign(
    { userId: user.id, role: user.role, sessionId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
);

exports.register = async (req, res, next) => {
    try {
        const { name, email, phone, password, role, cccd, companions, buildingId } = req.body;
        if ((role || 'tenant') === 'landlord') {
            return res.status(403).json({ message: "Không được phép tự đăng ký tài khoản chủ trọ" });
        }
        const hashed = await hashPassword(password);
        const newUser = await User.create({ name, email, phone, password: hashed, role: role || 'tenant' });

        if (role === 'tenant') {
            const tenant = await Tenant.create({ name, phone, cccd: cccd || null, password, userId: newUser.id, buildingId: buildingId || null });
            if (companions && companions.length > 0) {
                const items = companions.map(c => ({ ...c, tenantId: tenant.id }));
                await Companion.bulkCreate(items);
            }
        }

        const sessionId = generateSessionToken();
        await newUser.update({ currentSessionToken: sessionId });
        const token = signToken(newUser, sessionId);
        setAuthCookie(res, token);
        res.status(201).json({ message: "Đăng ký thành công", user: { id: newUser.id, name, email, phone, role: role || 'tenant' } });
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
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
        if (user.isActive === false) return res.status(403).json({ message: "Tài khoản đã bị vô hiệu hóa, vui lòng liên hệ chủ trọ." });

        // Single active session: a new login invalidates any previous session for this account.
        const sessionId = generateSessionToken();
        await user.update({ currentSessionToken: sessionId });
        const token = signToken(user, sessionId);
        setAuthCookie(res, token);

        res.json({ message: "Đăng nhập thành công", user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
        writeAuditLog({ actorId: user.id, action: "auth.login", targetType: "user", targetId: user.id, req, metadata: { email: user.email } });
    } catch (error) {
        next(error);
    }
};

exports.logout = async (req, res, next) => {
    try {
        if (req.user) {
            writeAuditLog({ actorId: req.user.id, action: "auth.logout", targetType: "user", targetId: req.user.id, req, metadata: { email: req.user.email } });
            await req.user.update({ currentSessionToken: null });
        }
        const { clearAuthCookie } = require("../utils/cookies");
        clearAuthCookie(res);
        res.json({ message: "Đăng xuất thành công" });
    } catch (error) {
        next(error);
    }
};

exports.getMe = async (req, res, next) => {
    res.json({ user: req.user });
};
