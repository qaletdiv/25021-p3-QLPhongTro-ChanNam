const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const authenticateToken = require('../middlewares/authenticateToken');
const authorizeRole = require('../middlewares/authorizeRole');

router.get('/:id', authenticateToken, authorizeRole(['landlord', 'tenant']), imageController.getImage);

module.exports = router;