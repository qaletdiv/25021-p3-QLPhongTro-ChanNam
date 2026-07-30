const { body, param } = require("express-validator");

const createFurnitureValidationRules = () => [
    body('name').notEmpty().withMessage("Ten vat dung khong duoc de trong").trim(),
    body('note').optional().trim(),
    body('default_quantity').optional().isInt({ min: 1 }).withMessage("So luong mac dinh phai >= 1"),
];

const updateFurnitureValidationRules = () => [
    body('name').optional().notEmpty().trim(),
    body('note').optional().trim(),
    body('default_quantity').optional().isInt({ min: 1 }),
];

const furnitureIdParamValidation = () => [
    param("id").isInt({ min: 1 }).withMessage("ID vat dung phai la so nguyen duong"),
];

module.exports = { createFurnitureValidationRules, updateFurnitureValidationRules, furnitureIdParamValidation };
