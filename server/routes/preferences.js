const express = require('express');
const router = express.Router();
const { getPreferences, updatePreferences } = require('../controllers/preferenceController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware); // All preference routes are protected

router.get('/', getPreferences);
router.put('/', updatePreferences);

module.exports = router;