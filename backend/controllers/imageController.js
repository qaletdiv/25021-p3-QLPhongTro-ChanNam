const storage = require("../services/storage/storage.service");

exports.getImage = (req, res, next) => {
    try {
        const key = req.params.id ? decodeURIComponent(req.params.id) : null;
        const abs = storage.resolveKey(key);
        if (!abs) return res.status(404).json({ message: "Không tìm thấy ảnh" });
        res.sendFile(abs);
    } catch (error) {
        next(error);
    }
};