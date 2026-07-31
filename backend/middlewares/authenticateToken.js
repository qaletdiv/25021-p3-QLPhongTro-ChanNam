const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = (authHeader && authHeader.split(' ')[1]) || req.query.token;

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
            req.user = user;
            next();
        } catch (dbError) {
            next(dbError);
        }
    });
};

module.exports = authenticateToken;
