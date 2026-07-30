const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authenticateToken = require('../middlewares/authenticateToken');
const authorizeRole = require('../middlewares/authorizeRole');

router.get('/stats', authenticateToken, authorizeRole('landlord'), dashboardController.getStats);
router.get('/expiring-contracts', authenticateToken, authorizeRole('landlord'), dashboardController.getExpiringContracts);

module.exports = router;
