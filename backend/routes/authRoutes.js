const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { registerValidationRules, loginValidationRules } = require('../validators/authValidator');
const handleValidationErrors = require('../middlewares/validationErrorHandler');
const authenticateToken = require('../middlewares/authenticateToken');

router.post('/register', registerValidationRules(), handleValidationErrors, authController.register);
router.post('/login', loginValidationRules(), handleValidationErrors, authController.login);
router.post('/logout', authenticateToken, authController.logout);
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;
