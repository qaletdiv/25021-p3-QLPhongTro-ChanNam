const { body } = require("express-validator");

const createNotificationValidationRules = () => [
    body('title').notEmpty().withMessage("Tieu de khong duoc de trong"),
    body('content').notEmpty().withMessage("Noi dung khong duoc de trong"),
    body('targetType').isIn(['all', 'specific_rooms']).withMessage("Loai doi tuong khong hop le"),
    body('targetRoomIds').optional().isArray(),
];

module.exports = { createNotificationValidationRules };
