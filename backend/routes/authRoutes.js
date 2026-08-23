const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const authController = require('../controllers/authController');
const { registerValidationRules, loginValidationRules } = require('../validators/authValidator');
const handleValidationErrors = require('../middlewares/validationErrorHandler');
const authenticateToken = require('../middlewares/authenticateToken');

// Rate limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: { message: "Quá nhiều yêu cầu đăng nhập, vui lòng thử lại sau 15 phút" },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

router.post('/register', registerValidationRules(), handleValidationErrors, authController.register);
router.post('/login', authLimiter, loginValidationRules(), handleValidationErrors, authController.login);
router.post('/logout', authenticateToken, authController.logout);
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;
