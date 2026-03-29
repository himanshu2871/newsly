const express = require('express');
const router = express.Router();
const { summarizeArticle } = require('../controllers/summaryController');
const authMiddleware = require('../middleware/authMiddleware');
const rateLimiter = require('../middleware/rateLimiter');

// Protected — only logged in users can generate summaries
router.post('/', authMiddleware, rateLimiter(10, 60 * 1000), summarizeArticle);

module.exports = router;