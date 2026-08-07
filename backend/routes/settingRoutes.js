const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const vietqrController = require('../controllers/vietqrController');
const authenticateToken = require('../middlewares/authenticateToken');
const authorizeRole = require('../middlewares/authorizeRole');

router.get('/', authenticateToken, authorizeRole('landlord'), settingController.getSettings);
router.put('/', authenticateToken, authorizeRole('landlord'), settingController.saveSettings);
router.post('/check-telegram', authenticateToken, authorizeRole('landlord'), settingController.checkTelegramConnection);
router.get('/vietqr/banks', authenticateToken, authorizeRole('landlord'), vietqrController.getBanks);
router.get('/rate-history', authenticateToken, authorizeRole('landlord'), settingController.getRateHistory);

module.exports = router;
