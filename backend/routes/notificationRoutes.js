const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authenticateToken = require('../middlewares/authenticateToken');
const authorizeRole = require('../middlewares/authorizeRole');
const { createNotificationValidationRules } = require('../validators/notificationValidator');
const handleValidationErrors = require('../middlewares/validationErrorHandler');

router.get('/', authenticateToken, authorizeRole('landlord'), notificationController.getNotifications);
router.post('/', authenticateToken, authorizeRole('landlord'), createNotificationValidationRules(), handleValidationErrors, notificationController.createNotification);
router.post('/:id/read', authenticateToken, authorizeRole('landlord'), notificationController.markAsRead);

module.exports = router;
