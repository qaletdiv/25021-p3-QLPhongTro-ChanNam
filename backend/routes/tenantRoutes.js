const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');
const authenticateToken = require('../middlewares/authenticateToken');
const authorizeRole = require('../middlewares/authorizeRole');
const { createTenantValidationRules, tenantIdParamValidation } = require('../validators/tenantValidator');
const handleValidationErrors = require('../middlewares/validationErrorHandler');

router.get('/', authenticateToken, authorizeRole('landlord'), tenantController.getTenants);
router.post('/', authenticateToken, authorizeRole('landlord'), createTenantValidationRules(), handleValidationErrors, tenantController.createTenant);
router.put('/:id', authenticateToken, authorizeRole('landlord'), tenantIdParamValidation(), createTenantValidationRules(), handleValidationErrors, tenantController.updateTenant);

module.exports = router;
