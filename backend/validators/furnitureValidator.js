const { body, param } = require("express-validator");

const createFurnitureValidationRules = () => [
    body('name').notEmpty().withMessage("Tên vật dụng không được để trống").trim(),
    body('note').optional().trim(),
    body('default_quantity').optional().isInt({ min: 1 }).withMessage("Số lượng mặc định phải >= 1"),
];

const updateFurnitureValidationRules = () => [
    body('name').optional().notEmpty().trim(),
    body('note').optional().trim(),
    body('default_quantity').optional().isInt({ min: 1 }),
];

const furnitureIdParamValidation = () => [
    param("id").isInt({ min: 1 }).withMessage("ID vật dụng phải là số nguyên dương"),
];

module.exports = { createFurnitureValidationRules, updateFurnitureValidationRules, furnitureIdParamValidation };
