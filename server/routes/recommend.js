/**
 * Recommend Routes
 * Handles AI recipe recommendations using Gemini
 */
const express = require('express');
const router = express.Router();
const recommendController = require('../controllers/recommendController');
const auth = require('../middleware/auth');

// Generate personalized recommendations (requires auth)
router.post('/personalized', auth, recommendController.getPersonalizedRecommendations);

//generate estimate prizes 
router.post('/estimate', auth, recommendController.estimateGroceryItem);

// Generate recipes from pantry (requires auth)
router.post('/', auth, recommendController.generateRecipes);

module.exports = router;
