const { Tenant } = require("../models");

exports.markAsRead = async (req, res, next) => {
    try {
        res.json({ message: "Da danh dau da doc" });
    } catch (error) {
        next(error);
    }
};
