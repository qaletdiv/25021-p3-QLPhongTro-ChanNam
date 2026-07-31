const { body } = require("express-validator");

const registerValidationRules = () => [
    body('name').notEmpty().withMessage("Ten khong duoc de trong").trim(),
    body('email').notEmpty().withMessage("Email khong duoc de trong").isEmail().normalizeEmail(),
    body('phone').notEmpty().withMessage("SĐT khong duoc de trong").matches(/^(0|\+84)[3-9]\d{8,9}$/).withMessage("SĐT khong hop le"),
    body('password').notEmpty().withMessage("Password khong duoc de trong").isLength({ min: 6 }),
    body('role').optional().isIn(['landlord', 'tenant']).withMessage("Role phai la landlord hoac tenant"),
    body('cccd').optional({ values: 'falsy' }).trim(),
];

const loginValidationRules = () => [
    body('email').notEmpty().withMessage("Email khong duoc de trong").isEmail().normalizeEmail(),
    body('password').notEmpty().withMessage("Password khong duoc de trong"),
];

module.exports = { registerValidationRules, loginValidationRules };
