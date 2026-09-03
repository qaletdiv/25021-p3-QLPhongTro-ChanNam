const { body } = require("express-validator");

const registerValidationRules = () => [
    body('name').notEmpty().withMessage("Tên không được để trống").trim(),
    body('email').notEmpty().withMessage("Email không được để trống").isEmail().normalizeEmail({ removeDots: true }),
    body('phone').notEmpty().withMessage("SĐT không được để trống").matches(/^(0|\+84)[3-9]\d{8,9}$/).withMessage("SĐT không hợp lệ"),
    body('password').notEmpty().withMessage("Mật khẩu không được để trống").isLength({ min: 6 }),
    body('role').optional().isIn(['landlord', 'tenant']).withMessage("Vai trò phải là landlord hoặc tenant"),
    body('cccd').optional({ values: 'falsy' }).trim(),
];

const loginValidationRules = () => [
    body('email').notEmpty().withMessage("Email không được để trống").isEmail().normalizeEmail({ removeDots: true }),
    body('password').notEmpty().withMessage("Mật khẩu không được để trống"),
];

module.exports = { registerValidationRules, loginValidationRules };
