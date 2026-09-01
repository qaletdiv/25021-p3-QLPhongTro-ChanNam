const storage = require("../services/storage/storage.service");

exports.getImage = (req, res, next) => {
    try {
        const raw = req.params.id || req.params['0'] || req.params.any || req.params['*'];
        const key = raw ? decodeURIComponent(raw) : null;
        if (!key) return res.status(404).json({ message: "Không tìm thấy ảnh" });
        const abs = storage.resolveKey(key);
        if (!abs) return res.status(404).json({ message: "Không tìm thấy ảnh" });
        res.sendFile(abs);
    } catch (error) {
        next(error);
    }
};