const express = require('express');
const router = express.Router();
const buildingController = require('../controllers/buildingController');
const authenticateToken = require('../middlewares/authenticateToken');
const authorizeRole = require('../middlewares/authorizeRole');
const { createBuildingValidationRules, updateBuildingValidationRules, buildingIdParamValidation } = require('../validators/buildingValidator');
const handleValidationErrors = require('../middlewares/validationErrorHandler');

// Public list of buildings so tenants can pick their nhà trọ at registration (no auth).
router.get('/public', buildingController.getPublicBuildings);

router.get('/', authenticateToken, authorizeRole('landlord'), buildingController.getBuildings);
router.get('/:id', authenticateToken, authorizeRole('landlord'), buildingIdParamValidation(), handleValidationErrors, buildingController.getBuildingById);
router.post('/', authenticateToken, authorizeRole('landlord'), createBuildingValidationRules(), handleValidationErrors, buildingController.createBuilding);
router.put('/:id', authenticateToken, authorizeRole('landlord'), buildingIdParamValidation(), updateBuildingValidationRules(), handleValidationErrors, buildingController.updateBuilding);
router.delete('/:id', authenticateToken, authorizeRole('landlord'), buildingIdParamValidation(), handleValidationErrors, buildingController.deleteBuilding);

// Quản lý cộng tác viên (chỉ chủ sở hữu nhà)
router.get('/:id/collaborators', authenticateToken, authorizeRole('landlord'), buildingIdParamValidation(), handleValidationErrors, buildingController.getCollaborators);
router.post('/:id/collaborators', authenticateToken, authorizeRole('landlord'), buildingIdParamValidation(), handleValidationErrors, buildingController.addCollaborator);
router.delete('/:id/collaborators/:userId', authenticateToken, authorizeRole('landlord'), buildingIdParamValidation(), handleValidationErrors, buildingController.removeCollaborator);

module.exports = router;
