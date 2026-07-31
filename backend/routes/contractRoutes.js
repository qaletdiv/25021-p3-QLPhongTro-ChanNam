const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const authenticateToken = require('../middlewares/authenticateToken');
const authorizeRole = require('../middlewares/authorizeRole');
const { createContractValidationRules, contractIdParamValidation } = require('../validators/contractValidator');
const handleValidationErrors = require('../middlewares/validationErrorHandler');

router.get('/', authenticateToken, authorizeRole('landlord'), contractController.getContracts);
router.get('/:id', authenticateToken, authorizeRole('landlord'), contractIdParamValidation(), handleValidationErrors, contractController.getContractById);
router.post('/', authenticateToken, authorizeRole('landlord'), createContractValidationRules(), handleValidationErrors, contractController.createContract);
router.put('/:id', authenticateToken, authorizeRole('landlord'), contractIdParamValidation(), handleValidationErrors, contractController.updateContract);
router.put('/:id/checkout', authenticateToken, authorizeRole('landlord'), contractIdParamValidation(), handleValidationErrors, contractController.checkoutContract);

module.exports = router;
