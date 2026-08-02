const { param } = require("express-validator");

const invoiceIdParamValidation = () => [
    param("id").isInt({ min: 1 }).withMessage("ID hóa đơn phải là số nguyên dương"),
];

module.exports = { invoiceIdParamValidation };
