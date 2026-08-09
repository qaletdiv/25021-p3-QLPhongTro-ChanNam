const express = require('express');
const router = express.Router();
const adminUserController = require('../controllers/adminUserController');
const authenticateToken = require('../middlewares/authenticateToken');
const authorizeRole = require('../middlewares/authorizeRole');

router.get('/users', authenticateToken, authorizeRole('landlord'), adminUserController.getUsers);
router.post('/users/:id/revoke', authenticateToken, authorizeRole('landlord'), adminUserController.revokeSession);
router.post('/users/:id/disable', authenticateToken, authorizeRole('landlord'), adminUserController.disableAccount);
router.post('/users/:id/enable', authenticateToken, authorizeRole('landlord'), adminUserController.enableAccount);
router.post('/users/:id/change-password', authenticateToken, authorizeRole('landlord'), adminUserController.changePassword);

module.exports = router;