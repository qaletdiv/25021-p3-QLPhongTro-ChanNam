const express = require('express');
const router = express.Router();
const fingerprintController = require('../controllers/fingerprintController');
const authenticateToken = require('../middlewares/authenticateToken');
const authorizeRole = require('../middlewares/authorizeRole');

router.get('/', authenticateToken, authorizeRole('landlord'), fingerprintController.getFingerprintHistories);
router.get('/groups', authenticateToken, authorizeRole('landlord'), fingerprintController.getFingerprintGroups);

module.exports = router;