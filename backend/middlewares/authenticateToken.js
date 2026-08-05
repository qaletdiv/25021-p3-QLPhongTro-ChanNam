const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { COOKIE_NAME } = require('../utils/cookies');

const EXEMPT_ROLES_LOGIN = true; // login/logout always reachable

const extractToken = (req) => {
    // Prefer Authorization Bearer header, fall back to HttpOnly cookie (JWT + cookies)
    const authHeader = req.headers['authorization'];
    if (authHeader) {
        const parts = authHeader.split(' ');
        if (parts.length === 2 && /^Bearer$/i.test(parts[0])) return parts[1];
    }
    const cookies = req.cookies;
    if (cookies && cookies[COOKIE_NAME]) return cookies[COOKIE_NAME];
    // Manual fallback (no cookie-parser mounted)
    const raw = req.headers.cookie;
    if (raw) {
        const tokenMatch = raw.match(new RegExp(`${COOKIE_NAME.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]+)`));
        if (tokenMatch) return decodeURIComponent(tokenMatch[1]);
    }
    return null;
};

const authenticateToken = (req, res, next) => {
    const token = extractToken(req);
    if (!token) {
        return res.status(401).json({ message: 'Token required.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedPayload) => {
        if (err) {
            return res.status(err instanceof jwt.TokenExpiredError ? 401 : 403).json({ message: err.message });
        }
        if (!decodedPayload || !decodedPayload.userId) {
            return res.status(403).json({ message: 'Invalid token payload.' });
        }
        try {
            const user = await User.findByPk(decodedPayload.userId);
            if (!user) {
                return res.status(401).json({ message: 'User not found.' });
            }

            // Single active session per account: if a newer login issued a different
            // session id, the previous session is invalidated -> force logout.
            if (decodedPayload.sessionId && user.currentSessionToken && decodedPayload.sessionId !== user.currentSessionToken) {
                return res.status(401).json({ message: 'Phiên đăng nhập đã hết, vui lòng đăng nhập lại.' });
            }

            req.user = user;
            next();
        } catch (dbError) {
            next(dbError);
        }
    });
};

module.exports = authenticateToken;
