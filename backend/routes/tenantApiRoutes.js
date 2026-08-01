const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');
const authorizeRole = require('../middlewares/authorizeRole');

const tenantDashboardController = require('../controllers/tenantDashboardController');
const tenantInvoiceController = require('../controllers/tenantInvoiceController');
const tenantIssueController = require('../controllers/tenantIssueController');
const tenantProfileController = require('../controllers/tenantProfileController');
const tenantNotificationController = require('../controllers/tenantNotificationController');

const auth = [authenticateToken, authorizeRole('tenant')];

router.get('/dashboard', ...auth, tenantDashboardController.getDashboard);

router.get('/invoices', ...auth, tenantInvoiceController.getInvoices);
router.get('/invoice-settings', ...auth, tenantInvoiceController.getSettings);
router.post('/initial-readings', ...auth, tenantInvoiceController.saveInitialReadings);
router.post('/meter-submit', ...auth, tenantInvoiceController.submitMeter);

router.get('/issues', ...auth, tenantIssueController.getIssues);
router.post('/issues', ...auth, tenantIssueController.createIssue);

router.get('/profile', ...auth, tenantProfileController.getProfile);
router.put('/profile', ...auth, tenantProfileController.updateProfile);
router.put('/password', ...auth, tenantProfileController.changePassword);

router.put('/notifications/:id/read', ...auth, tenantNotificationController.markAsRead);

module.exports = router;
