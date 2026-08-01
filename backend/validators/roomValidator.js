const { body, param } = require("express-validator");

const createRoomValidationRules = () => [
    body('room_number').notEmpty().withMessage("So phong khong duoc de trong").trim(),
    body('price').notEmpty().withMessage("Gia thue khong duoc de trong").isFloat({ min: 0 }),
    body('default_payment_day').optional().isInt({ min: 1, max: 31 }),
    body('floor').optional().isInt({ min: 0 }),
    body('area').optional().isFloat({ min: 0 }),
    body('buildingId').optional({ nullable: true }).isInt({ min: 1 }),
];

const updateRoomValidationRules = () => [
    body('room_number').optional().notEmpty().trim(),
    body('price').optional().isFloat({ min: 0 }),
    body('default_payment_day').optional().isInt({ min: 1, max: 31 }),
    body('floor').optional().isInt({ min: 0 }),
    body('area').optional().isFloat({ min: 0 }),
    body('buildingId').optional({ nullable: true }).isInt({ min: 1 }),
];

const roomIdParamValidation = () => [
    param("id").isInt({ min: 1 }).withMessage("ID phong phai la so nguyen duong"),
];

module.exports = { createRoomValidationRules, updateRoomValidationRules, roomIdParamValidation };
