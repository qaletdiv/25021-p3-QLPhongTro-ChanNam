const { body, param } = require("express-validator");

const createTenantValidationRules = () => [
    body('name').notEmpty().withMessage("Ten khach khong duoc de trong").trim(),
    body('phone').notEmpty().withMessage("SĐT khong duoc de trong").trim(),
    body('cccd').optional().trim(),
];

const tenantIdParamValidation = () => [
    param("id").isInt({ min: 1 }).withMessage("ID khach phai la so nguyen duong"),
];

module.exports = { createTenantValidationRules, tenantIdParamValidation };
