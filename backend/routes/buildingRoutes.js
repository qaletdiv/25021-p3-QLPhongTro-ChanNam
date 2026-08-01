const express = require('express');
const router = express.Router();
const buildingController = require('../controllers/buildingController');
const authenticateToken = require('../middlewares/authenticateToken');
const authorizeRole = require('../middlewares/authorizeRole');
const { createBuildingValidationRules, updateBuildingValidationRules, buildingIdParamValidation } = require('../validators/buildingValidator');
const handleValidationErrors = require('../middlewares/validationErrorHandler');

router.get('/', authenticateToken, authorizeRole('landlord'), buildingController.getBuildings);
router.get('/:id', authenticateToken, authorizeRole('landlord'), buildingIdParamValidation(), handleValidationErrors, buildingController.getBuildingById);
router.post('/', authenticateToken, authorizeRole('landlord'), createBuildingValidationRules(), handleValidationErrors, buildingController.createBuilding);
router.put('/:id', authenticateToken, authorizeRole('landlord'), buildingIdParamValidation(), updateBuildingValidationRules(), handleValidationErrors, buildingController.updateBuilding);
router.delete('/:id', authenticateToken, authorizeRole('landlord'), buildingIdParamValidation(), handleValidationErrors, buildingController.deleteBuilding);

module.exports = router;
