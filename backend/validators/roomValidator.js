const { body, param } = require("express-validator");

const createRoomValidationRules = () => [
    body('room_number').notEmpty().withMessage("Số phòng không được để trống").trim(),
    body('price').notEmpty().withMessage("Giá thuê không được để trống").isFloat({ min: 0 }),
    body('floor').optional().isInt({ min: 0 }),
    body('area').optional().isFloat({ min: 0 }),
    body('buildingId').optional({ nullable: true }).isInt({ min: 1 }),
];

const updateRoomValidationRules = () => [
    body('room_number').optional().notEmpty().trim(),
    body('price').optional().isFloat({ min: 0 }),
    body('floor').optional().isInt({ min: 0 }),
    body('area').optional().isFloat({ min: 0 }),
    body('buildingId').optional({ nullable: true }).isInt({ min: 1 }),
];

const roomIdParamValidation = () => [
    param("id").isInt({ min: 1 }).withMessage("ID phòng phải là số nguyên dương"),
];

module.exports = { createRoomValidationRules, updateRoomValidationRules, roomIdParamValidation };
