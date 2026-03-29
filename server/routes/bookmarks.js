const express = require('express');
const router = express.Router();
const { getUserBookmarks, saveBookmark, deleteBookmark, checkBookmark } = require('../controllers/bookmarkController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware); // All bookmark routes are protected

router.get('/check', checkBookmark);
router.get('/', getUserBookmarks);
router.post('/', saveBookmark);
router.delete('/:id', deleteBookmark);

module.exports = router;