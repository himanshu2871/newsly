const express = require('express');
const router = express.Router();
const { summarizeArticle } = require('../controllers/summaryController');
const rateLimiter = require('../middleware/rateLimiter');

// Public while login is disabled; keep the per-IP limit on AI requests.
router.post('/', rateLimiter(10, 60 * 1000), summarizeArticle);

module.exports = router;