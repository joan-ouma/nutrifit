const express = require('express');
const router = express.Router();
const achievementController = require('../controllers/achievementController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/check', achievementController.checkAchievements);
router.get('/', achievementController.getAchievements);

module.exports = router;

