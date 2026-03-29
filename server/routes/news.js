const express = require('express');
const router = express.Router();
const {
  getNewsByTopic,
  getLatestNews,
  searchNews,
  getIndiaNews,
  getTopics
} = require('../controllers/newsController');

router.get('/latest', getLatestNews);
router.get('/topics', getTopics);
router.get('/india', getIndiaNews);
router.get('/search', searchNews);
router.get('/', getNewsByTopic);

module.exports = router;