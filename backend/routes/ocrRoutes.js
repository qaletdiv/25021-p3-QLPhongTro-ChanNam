const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');
const ocrController = require('../controllers/ocrController');

router.post('/ocr-meter', authenticateToken, ocrController.recognizeMeter);

module.exports = router;
