const { body, param } = require("express-validator");

const createBuildingValidationRules = () => [
    body('name').notEmpty().withMessage("Ten nha khong duoc de trong").trim(),
    body('address').optional().trim(),
];

const updateBuildingValidationRules = () => [
    body('name').optional().notEmpty().trim(),
    body('address').optional().trim(),
];

const buildingIdParamValidation = () => [
    param("id").isInt({ min: 1 }).withMessage("ID nha phai la so nguyen duong"),
];

module.exports = { createBuildingValidationRules, updateBuildingValidationRules, buildingIdParamValidation };
