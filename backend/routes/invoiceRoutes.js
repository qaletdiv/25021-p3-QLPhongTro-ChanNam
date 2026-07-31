const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const authenticateToken = require('../middlewares/authenticateToken');
const authorizeRole = require('../middlewares/authorizeRole');
const { invoiceIdParamValidation } = require('../validators/invoiceValidator');
const handleValidationErrors = require('../middlewares/validationErrorHandler');

router.get('/', authenticateToken, authorizeRole('landlord'), invoiceController.getInvoices);
router.put('/:id/paid', authenticateToken, authorizeRole('landlord'), invoiceIdParamValidation(), handleValidationErrors, invoiceController.markAsPaid);
router.post('/:id/remind', authenticateToken, authorizeRole('landlord'), invoiceIdParamValidation(), handleValidationErrors, invoiceController.sendReminder);

module.exports = router;
