const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const authenticateToken = require('../middlewares/authenticateToken');
const authorizeRole = require('../middlewares/authorizeRole');

router.get('/', authenticateToken, authorizeRole('landlord'), auditController.getAuditLogs);

module.exports = router;