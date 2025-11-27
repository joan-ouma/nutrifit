/**
 * User Routes
 * Handles user profile and preferences
 */
const express = require('express');
const router = express.Router();
const {
    getProfile,
    updateProfile,
    getSearchHistory,
    saveSearchHistory
} = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

// All user routes require authentication
router.use(authMiddleware);

router.get('/profile', getProfile);
router.post('/profile', updateProfile);
router.get('/search-history', getSearchHistory);
router.post('/search-history', saveSearchHistory);

module.exports = router;



