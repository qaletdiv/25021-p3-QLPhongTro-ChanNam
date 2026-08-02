const authorizeRole = (allowedRoles) => {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: "Không thể xác định vai trò" });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Bạn không có quyền truy cập" });
        }
        next();
    };
};

module.exports = authorizeRole;
