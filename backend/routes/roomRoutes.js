const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const authenticateToken = require('../middlewares/authenticateToken');
const authorizeRole = require('../middlewares/authorizeRole');
const { createRoomValidationRules, updateRoomValidationRules, roomIdParamValidation } = require('../validators/roomValidator');
const handleValidationErrors = require('../middlewares/validationErrorHandler');

router.get('/', authenticateToken, authorizeRole('landlord'), roomController.getRooms);
router.get('/:id', authenticateToken, authorizeRole('landlord'), roomIdParamValidation(), handleValidationErrors, roomController.getRoomById);
router.post('/', authenticateToken, authorizeRole('landlord'), createRoomValidationRules(), handleValidationErrors, roomController.createRoom);
router.put('/:id', authenticateToken, authorizeRole('landlord'), roomIdParamValidation(), updateRoomValidationRules(), handleValidationErrors, roomController.updateRoom);
router.delete('/:id', authenticateToken, authorizeRole('landlord'), roomIdParamValidation(), handleValidationErrors, roomController.deleteRoom);

module.exports = router;
