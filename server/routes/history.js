const express = require('express');
const router = express.Router();
const { getTodayInHistory } = require('../controllers/historyController');
const rateLimiter = require('../middleware/rateLimiter');

// Public route to get today in history, lightly rate-limited
router.get('/today', rateLimiter(20, 60 * 1000), getTodayInHistory);

module.exports = router;
