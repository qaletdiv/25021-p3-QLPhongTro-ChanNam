const push = require("../utils/push");

exports.getVapidPublicKey = (req, res) => {
    const key = push.getVapidPublicKey();
    if (!key) return res.status(503).json({ message: "VAPID keys chưa được cấu hình trên server." });
    res.json({ publicKey: key });
};

exports.subscribe = async (req, res, next) => {
    try {
        const sub = await push.saveSubscription({ userId: req.user.id, body: req.body, userAgent: req.headers["user-agent"] });
        res.status(201).json({ message: "Đã đăng ký nhận thông báo đẩy.", subscription: sub });
    } catch (error) {
        if (error.statusCode === 400) return res.status(400).json({ message: error.message });
        next(error);
    }
};

exports.unsubscribe = async (req, res, next) => {
    try {
        const endpoint = req.body.endpoint;
        await push.deleteSubscription(endpoint);
        res.json({ message: "Đã hủy đăng ký thông báo đẩy." });
    } catch (error) {
        next(error);
    }
};