const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authenticateToken = require('../middlewares/authenticateToken');
const authorizeRole = require('../middlewares/authorizeRole');

router.get('/stats', authenticateToken, authorizeRole('landlord'), dashboardController.getStats);
router.get('/notifications', authenticateToken, authorizeRole('landlord'), dashboardController.getNotifications);
router.get('/monthly-revenue', authenticateToken, authorizeRole('landlord'), dashboardController.getMonthlyRevenue);
router.get('/expiring-contracts', authenticateToken, authorizeRole('landlord'), dashboardController.getExpiringContracts);
router.get('/utility-usage', authenticateToken, authorizeRole('landlord'), dashboardController.getUtilityUsage);

module.exports = router;
