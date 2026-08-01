const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const authenticateToken = require('../middlewares/authenticateToken');
const authorizeRole = require('../middlewares/authorizeRole');

router.get('/', authenticateToken, authorizeRole('landlord'), settingController.getSettings);
router.put('/', authenticateToken, authorizeRole('landlord'), settingController.saveSettings);
router.post('/check-telegram', authenticateToken, authorizeRole('landlord'), settingController.checkTelegramConnection);

module.exports = router;
