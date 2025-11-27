# Backend Modifications Required for Frontend Improvements

This document outlines all the backend modifications needed to support the enhanced frontend features.

## 🔐 1. JWT Authentication Middleware

The frontend now uses JWT Bearer tokens. You need to:

### Required Changes:
- ✅ Ensure JWT tokens are returned in login/register responses
- ✅ Create authentication middleware to verify Bearer tokens
- ✅ Protect routes that require authentication

### Example Middleware (`middleware/auth.js`):

```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'No token provided. Authorization denied.',
                msg: 'Authentication required'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            
            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'User not found',
                    msg: 'Invalid token'
                });
            }

            req.user = user;
            next();
        } catch (tokenError) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token',
                msg: 'Token verification failed'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error during authentication',
            msg: error.message
        });
    }
};

module.exports = authMiddleware;
```

## 📝 2. Standardized Error Response Format

All error responses should follow this format:

```javascript
{
    success: false,
    error: "Detailed error message",
    msg: "User-friendly error message"
}
```

### Example Error Handler (`middleware/errorHandler.js`):

```javascript
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            error: messages.join(', '),
            msg: 'Validation failed'
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        return res.status(400).json({
            success: false,
            error: 'Duplicate field value',
            msg: 'This email or username already exists'
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: 'Invalid token',
            msg: 'Authentication failed'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            error: 'Token expired',
            msg: 'Please log in again'
        });
    }

    // Default error
    res.status(err.statusCode || 500).json({
        success: false,
        error: err.message || 'Server error',
        msg: err.message || 'Something went wrong'
    });
};

module.exports = errorHandler;
```

## 🍽️ 3. Recipe Favorites/Saving Endpoints

Add endpoints to save and manage favorite recipes:

### New Endpoints Needed:

```
POST   /api/recipes/favorites          - Save a recipe to favorites
GET    /api/recipes/favorites          - Get user's favorite recipes
DELETE /api/recipes/favorites/:id      - Remove recipe from favorites
GET    /api/recipes/:id               - Get recipe details by ID
```

### Example Controller (`controllers/recipeController.js`):

```javascript
const Recipe = require('../models/Recipe');
const User = require('../models/User');

// Save recipe to favorites
exports.saveRecipe = async (req, res) => {
    try {
        const { recipeData } = req.body;
        const userId = req.user.id;

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

// Get user's favorite recipes
exports.getFavorites = async (req, res) => {
    try {
        const userId = req.user.id;
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

// Remove recipe from favorites
exports.removeFavorite = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

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

// Get recipe by ID
exports.getRecipeById = async (req, res) => {
    try {
        const { id } = req.params;
        const recipe = await Recipe.findById(id);

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
        res.status(500).json({
            success: false,
            error: error.message,
            msg: 'Failed to fetch recipe'
        });
    }
};
```

## 🔍 4. Recipe Search Endpoint

Add search functionality:

```
GET /api/recipes/search?q=query&limit=10
```

### Example Implementation:

```javascript
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

        const recipes = await Recipe.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { 'ingredients': { $regex: q, $options: 'i' } },
                { 'whyItWorks': { $regex: q, $options: 'i' } }
            ]
        })
        .limit(parseInt(limit))
        .sort({ savedAt: -1 });

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
```

## 👤 5. User Authentication Verification Endpoint

Add endpoint to verify token and get current user:

```
GET /api/auth/me
```

### Example Implementation:

```javascript
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        res.json({
            success: true,
            data: user,
            msg: 'User authenticated'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            msg: 'Failed to get user'
        });
    }
};
```

## 📊 6. Updated User Model

Ensure User model includes favorites:

```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    pantry: [String],
    goals: { type: String, default: 'balanced' },
    budgetLevel: { type: String, default: 'medium' },
    bio: String,
    profileImage: String,
    favoriteRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
    searchHistory: [{
        query: String,
        timestamp: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
```

## 🍳 7. Recipe Model

Create Recipe model if it doesn't exist:

```javascript
const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ingredients: [String],
    instructions: [String],
    nutrition: {
        calories: Number,
        protein: String,
        carbs: String,
        fats: String
    },
    time: String,
    costPerServing: String,
    matchScore: Number,
    whyItWorks: String,
    missingIngredients: [String],
    image: String,
    savedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Recipe', recipeSchema);
```

## 🔄 8. Updated Route Files

### Routes (`routes/recipes.js`):

```javascript
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

// Protected routes
router.post('/favorites', authMiddleware, saveRecipe);
router.get('/favorites', authMiddleware, getFavorites);
router.delete('/favorites/:id', authMiddleware, removeFavorite);

module.exports = router;
```

### Updated Auth Routes (`routes/auth.js`):

```javascript
const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getCurrentUser
} = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getCurrentUser);

module.exports = router;
```

## ✅ 9. Updated Auth Controller

Ensure login/register return proper format:

```javascript
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password required',
                msg: 'Please provide email and password'
            });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials',
                msg: 'Invalid email or password'
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials',
                msg: 'Invalid email or password'
            });
        }

        // Generate token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Return user data (without password)
        const userData = user.toObject();
        delete userData.password;

        res.json({
            success: true,
            token,
            user: userData,
            msg: 'Login successful'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            msg: 'Login failed'
        });
    }
};
```

## 🛡️ 10. Protected User Routes

Update user routes to require authentication:

```javascript
const express = require('express');
const router = express.Router();
const { updateProfile, getSearchHistory, saveSearchHistory } = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

// All user routes require authentication
router.use(authMiddleware);

router.post('/profile', updateProfile);
router.get('/search-history', getSearchHistory);
router.post('/search-history', saveSearchHistory);

module.exports = router;
```

## 📦 11. Required NPM Packages

Ensure these packages are installed:

```bash
npm install jsonwebtoken bcryptjs
```

## 🔧 12. Environment Variables

Ensure `.env` includes:

```env
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
MONGO_URI=your-mongodb-connection-string
GEMINI_API_KEY=your-gemini-api-key
CORS_ORIGIN=http://localhost:3000,https://mern-final-project-joan-ouma.vercel.app
```

## 📋 Summary Checklist

- [ ] Add JWT authentication middleware
- [ ] Standardize error response format
- [ ] Add recipe favorites endpoints (save, get, delete)
- [ ] Add recipe search endpoint
- [ ] Add GET /api/auth/me endpoint
- [ ] Update User model with favoriteRecipes
- [ ] Create Recipe model
- [ ] Protect user routes with auth middleware
- [ ] Update login/register to return proper format
- [ ] Add recipe details endpoint (GET /api/recipes/:id)
- [ ] Update CORS to allow Authorization header
- [ ] Test all endpoints with Postman/Thunder Client

## 🚀 Testing Recommendations

1. Test JWT token generation and verification
2. Test protected routes without token (should return 401)
3. Test protected routes with invalid token (should return 401)
4. Test protected routes with valid token (should work)
5. Test recipe saving and retrieval
6. Test search functionality
7. Test error handling for all endpoints

