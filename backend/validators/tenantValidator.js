const { body, param } = require("express-validator");

const createTenantValidationRules = () => [
    body('name').notEmpty().withMessage("Tên khách không được để trống").trim(),
    body('phone').notEmpty().withMessage("SĐT không được để trống").trim(),
    body('cccd').optional().trim(),
];

const tenantIdParamValidation = () => [
    param("id").isInt({ min: 1 }).withMessage("ID khách phải là số nguyên dương"),
];

module.exports = { createTenantValidationRules, tenantIdParamValidation };
