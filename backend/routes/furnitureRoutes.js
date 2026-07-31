const express = require('express');
const router = express.Router();
const furnitureController = require('../controllers/furnitureController');
const authenticateToken = require('../middlewares/authenticateToken');
const authorizeRole = require('../middlewares/authorizeRole');
const { createFurnitureValidationRules, updateFurnitureValidationRules, furnitureIdParamValidation } = require('../validators/furnitureValidator');
const handleValidationErrors = require('../middlewares/validationErrorHandler');

router.get('/', authenticateToken, authorizeRole('landlord'), furnitureController.getFurnitures);
router.post('/', authenticateToken, authorizeRole('landlord'), createFurnitureValidationRules(), handleValidationErrors, furnitureController.createFurniture);
router.put('/:id', authenticateToken, authorizeRole('landlord'), furnitureIdParamValidation(), updateFurnitureValidationRules(), handleValidationErrors, furnitureController.updateFurniture);
router.delete('/:id', authenticateToken, authorizeRole('landlord'), furnitureIdParamValidation(), handleValidationErrors, furnitureController.deleteFurniture);

module.exports = router;
