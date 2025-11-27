/**
 * Recipe Controller
 * Handles recipe-related operations: favorites, search, details
 */
const Recipe = require('../models/Recipe');
const User = require('../models/User');

// Get trending recipes (public)
exports.getTrendingRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.find()
            .sort({ savedAt: -1 })
            .limit(8)
            .populate('userId', 'username');

        res.json({
            success: true,
            data: recipes,
            count: recipes.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            msg: 'Failed to fetch trending recipes'
        });
    }
};

// Save recipe to favorites (protected)
exports.saveRecipe = async (req, res) => {
    try {
        const recipeData = req.body;
        const userId = req.user._id;

        // Check if recipe already exists
        let recipe = await Recipe.findOne({ 
            name: recipeData.name,
            userId 
        });

        if (recipe) {
            return res.status(400).json({
                success: false,
                error: 'Recipe already saved',
                msg: 'This recipe is already in your favorites'
            });
        }

        recipe = await Recipe.create({
            ...recipeData,
            userId,
            savedAt: new Date()
        });

        // Add to user's favorites array
        await User.findByIdAndUpdate(userId, {
            $addToSet: { favoriteRecipes: recipe._id }
        });

        res.status(201).json({
            success: true,
            data: recipe,
            msg: 'Recipe saved successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            msg: 'Failed to save recipe'
        });
    }
};

// Get user's favorite recipes (protected)
exports.getFavorites = async (req, res) => {
    try {
        const userId = req.user._id;
        const recipes = await Recipe.find({ userId })
            .sort({ savedAt: -1 });

        res.json({
            success: true,
            data: recipes,
            count: recipes.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            msg: 'Failed to fetch favorites'
        });
    }
};

// Remove recipe from favorites (protected)
exports.removeFavorite = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const recipe = await Recipe.findOneAndDelete({ 
            _id: id, 
            userId 
        });

        if (!recipe) {
            return res.status(404).json({
                success: false,
                error: 'Recipe not found',
                msg: 'Recipe not found in your favorites'
            });
        }

        await User.findByIdAndUpdate(userId, {
            $pull: { favoriteRecipes: id }
        });

        res.json({
            success: true,
            msg: 'Recipe removed from favorites'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            msg: 'Failed to remove recipe'
        });
    }
};

// Get recipe by ID (public)
exports.getRecipeById = async (req, res) => {
    try {
        const { id } = req.params;
        const recipe = await Recipe.findById(id)
            .populate('userId', 'username');

        if (!recipe) {
            return res.status(404).json({
                success: false,
                error: 'Recipe not found',
                msg: 'Recipe not found'
            });
        }

        res.json({
            success: true,
            data: recipe
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                error: 'Invalid recipe ID',
                msg: 'Invalid recipe ID format'
            });
        }
        res.status(500).json({
            success: false,
            error: error.message,
            msg: 'Failed to fetch recipe'
        });
    }
};

// Search recipes (public)
exports.searchRecipes = async (req, res) => {
    try {
        const { q, limit = 10 } = req.query;
        
        if (!q || q.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Search query required',
                msg: 'Please provide a search term'
            });
        }

        const searchRegex = new RegExp(q, 'i');
        const recipes = await Recipe.find({
            $or: [
                { name: searchRegex },
                { ingredients: { $in: [searchRegex] } },
                { whyItWorks: searchRegex }
            ]
        })
        .limit(parseInt(limit))
        .sort({ savedAt: -1 })
        .populate('userId', 'username');

        res.json({
            success: true,
            data: recipes,
            count: recipes.length,
            query: q
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            msg: 'Search failed'
        });
    }
};



