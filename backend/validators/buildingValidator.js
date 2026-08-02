const { body, param } = require("express-validator");

const createBuildingValidationRules = () => [
    body('name').notEmpty().withMessage("Tên nhà không được để trống").trim(),
    body('address').optional().trim(),
];

const updateBuildingValidationRules = () => [
    body('name').optional().notEmpty().trim(),
    body('address').optional().trim(),
];

const buildingIdParamValidation = () => [
    param("id").isInt({ min: 1 }).withMessage("ID nhà phải là số nguyên dương"),
];

module.exports = { createBuildingValidationRules, updateBuildingValidationRules, buildingIdParamValidation };
