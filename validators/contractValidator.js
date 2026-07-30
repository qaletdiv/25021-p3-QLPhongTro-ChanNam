const { body, param } = require("express-validator");
const { Room } = require("../models");

const createContractValidationRules = () => [
    body('tenantId').notEmpty().isInt({ min: 1 }).withMessage("Chon khach thue"),
    body('roomId').notEmpty().isInt({ min: 1 }).withMessage("Chon phong")
        .custom(async (value) => {
            const room = await Room.findByPk(value);
            if (!room) throw new Error("Phong khong ton tai");
            if (room.status !== 'empty') throw new Error("Phong khong trong");
            return true;
        }),
    body('deposit').notEmpty().isFloat({ min: 0 }).withMessage("Tien coc phai >= 0"),
    body('startDate').notEmpty().isISO8601().withMessage("Ngay bat dau khong hop le"),
    body('endDate').notEmpty().isISO8601().withMessage("Ngay ket thuc khong hop le")
        .custom((value, { req }) => {
            if (new Date(value) <= new Date(req.body.startDate)) {
                throw new Error("Ngay ket thuc phai sau ngay bat dau");
            }
            return true;
        }),
    body('paymentDay').notEmpty().isInt({ min: 1, max: 31 }).withMessage("Ngay thu tien phai 1-31"),
    body('fingerprintCode').optional().trim(),
    body('furnitures').optional().isArray(),
    body('furnitures.*.furnitureId').optional().isInt({ min: 1 }),
    body('furnitures.*.quantity').optional().isInt({ min: 1 }),
];

const contractIdParamValidation = () => [
    param("id").isInt({ min: 1 }).withMessage("ID hop dong phai la so nguyen duong"),
];

module.exports = { createContractValidationRules, contractIdParamValidation };
