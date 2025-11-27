const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');
const auth = require('../middleware/auth');

// Public leaderboard endpoints
router.get('/daily', leaderboardController.getDailyLeaderboard);
router.get('/weekly', leaderboardController.getWeeklyLeaderboard);

// User's rank (requires auth)
router.get('/my-rank', auth, leaderboardController.getUserRank);

module.exports = router;

