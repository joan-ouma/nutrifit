/**
 * Recipe Routes
 * Handles all recipe-related endpoints
 */
const express = require('express');
const router = express.Router();
const {
    getTrendingRecipes,
    saveRecipe,
    getFavorites,
    removeFavorite,
    getRecipeById,
    searchRecipes
} = require('../controllers/recipeController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.get('/trending', getTrendingRecipes);
router.get('/search', searchRecipes);
router.get('/:id', getRecipeById);

// Protected routes (require authentication)
router.post('/favorites', authMiddleware, saveRecipe);
router.get('/favorites', authMiddleware, getFavorites);
router.delete('/favorites/:id', authMiddleware, removeFavorite);

module.exports = router;



