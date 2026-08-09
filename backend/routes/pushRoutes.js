const express = require('express');
const router = express.Router();
const pushController = require('../controllers/pushController');
const authenticateToken = require('../middlewares/authenticateToken');

router.get('/vapid', authenticateToken, pushController.getVapidPublicKey);
router.post('/subscribe', authenticateToken, pushController.subscribe);
router.post('/unsubscribe', authenticateToken, pushController.unsubscribe);

module.exports = router;