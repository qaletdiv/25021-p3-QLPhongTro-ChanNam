const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');
const authorizeRole = require('../middlewares/authorizeRole');
const contractPdfController = require('../controllers/contractPdfController');
const contractTemplateController = require('../controllers/contractTemplateController');

router.get('/template', authenticateToken, authorizeRole('landlord'), contractTemplateController.getTemplate);
router.put('/template', authenticateToken, authorizeRole('landlord'), contractTemplateController.saveTemplate);
router.get('/:id/pdf', authenticateToken, authorizeRole('landlord'), contractPdfController.generatePdf);

module.exports = router;
