const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');
const authenticateToken = require('../middlewares/authenticateToken');
const authorizeRole = require('../middlewares/authorizeRole');

const auth = [authenticateToken, authorizeRole('landlord')];

router.get('/', ...auth, issueController.getIssues);
router.get('/pending-count', ...auth, issueController.getPendingCount);
router.patch('/:id/status', ...auth, issueController.updateIssueStatus);

module.exports = router;
