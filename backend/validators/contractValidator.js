const { body, param } = require("express-validator");
const { Room } = require("../models");

const createContractValidationRules = () => [
    body('tenantId').notEmpty().isInt({ min: 1 }).withMessage("Chọn khách thuê"),
    body('roomId').notEmpty().isInt({ min: 1 }).withMessage("Chọn phòng")
        .custom(async (value) => {
            const room = await Room.findByPk(value);
            if (!room) throw new Error("Phòng không tồn tại");
            if (room.status !== 'empty') throw new Error("Phòng không trống");
            return true;
        }),
    body('deposit').notEmpty().isFloat({ min: 0 }).withMessage("Tiền cọc phải >= 0"),
    body('price').optional().isFloat({ min: 0 }).withMessage("Giá thuê phải >= 0"),
    body('startDate').notEmpty().isISO8601().withMessage("Ngày bắt đầu không hợp lệ"),
    body('endDate').notEmpty().isISO8601().withMessage("Ngày kết thúc không hợp lệ")
        .custom((value, { req }) => {
            if (new Date(value) <= new Date(req.body.startDate)) {
                throw new Error("Ngày kết thúc phải sau ngày bắt đầu");
            }
            return true;
        }),
    body('paymentDay').notEmpty().isInt({ min: 1, max: 31 }).withMessage("Ngày thu tiền phải 1-31"),
    body('fingerprintCode').optional().trim(),
    body('furnitures').optional().isArray(),
    body('furnitures.*.furnitureId').optional().isInt({ min: 1 }),
    body('furnitures.*.quantity').optional().isInt({ min: 1 }),
];

const contractIdParamValidation = () => [
    param("id").isInt({ min: 1 }).withMessage("ID hợp đồng phải là số nguyên dương"),
];

module.exports = { createContractValidationRules, contractIdParamValidation };
