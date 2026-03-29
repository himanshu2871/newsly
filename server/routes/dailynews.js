const express = require('express');
const router = express.Router();
const { getDailyBrief } = require('../controllers/dailynewsController');
const rateLimiter = require('../middleware/rateLimiter');

// Public route — lightly rate-limited
router.get('/brief', rateLimiter(20, 60 * 1000), getDailyBrief);

module.exports = router;
