const { body } = require("express-validator");

const createNotificationValidationRules = () => [
    body('title').notEmpty().withMessage("Tiêu đề không được để trống"),
    body('content').notEmpty().withMessage("Nội dung không được để trống"),
    body('targetType').isIn(['all', 'specific_rooms']).withMessage("Loại đối tượng không hợp lệ"),
    body('targetRoomIds').optional().isArray(),
];

module.exports = { createNotificationValidationRules };
