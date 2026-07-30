const { param } = require("express-validator");

const invoiceIdParamValidation = () => [
    param("id").isInt({ min: 1 }).withMessage("ID hoa don phai la so nguyen duong"),
];

module.exports = { invoiceIdParamValidation };
