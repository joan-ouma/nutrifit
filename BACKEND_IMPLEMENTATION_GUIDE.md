# Backend Implementation Guide for NutriSmart

This guide provides specific modifications needed for the [NutriSmart backend repository](https://github.com/joan-ouma/NutriSmart) to support the enhanced frontend features.

## 📋 Quick Checklist

- [ ] Add JWT authentication middleware
- [ ] Standardize error response format
- [ ] Add recipe favorites endpoints
- [ ] Add recipe search endpoint
- [ ] Add GET /api/auth/me endpoint
- [ ] Update User model with favoriteRecipes
- [ ] Create Recipe model
- [ ] Protect routes with auth middleware
- [ ] Update CORS to allow Authorization header

## 🔧 Step-by-Step Implementation

### Step 1: Install Required Dependencies

```bash
npm install jsonwebtoken bcryptjs
```

### Step 2: Create Authentication Middleware

Create `middleware/auth.js`:

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

        const token = authHeader.substring(7);
        
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
            if (tokenError.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    error: 'Token expired',
                    msg: 'Please log in again'
                });
            }
            
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token',
                msg: 'Token verification failed'
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error during authentication',
            msg: error.message
        });
    }
};

module.exports = authMiddleware;
```

### Step 3: Update User Model

Update `models/User.js` to include favoriteRecipes:

```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true,
        unique: true,
        trim: true
    },
    email: { 
        type: String, 
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: { 
        type: String, 
        required: true,
        minlength: 6
    },
    pantry: [String],
    goals: { 
        type: String, 
        enum: ['balanced', 'weight-loss', 'muscle'],
        default: 'balanced' 
    },
    budgetLevel: { 
        type: String, 
        enum: ['low', 'medium', 'high'],
        default: 'medium' 
    },
    bio: String,
    profileImage: String,
    favoriteRecipes: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Recipe' 
    }],
    searchHistory: [{
        query: String,
        timestamp: { type: Date, default: Date.now }
    }]
}, { 
    timestamps: true 
});

module.exports = mongoose.model('User', userSchema);
```

### Step 4: Create Recipe Model

Create `models/Recipe.js`:

```javascript
const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
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
    savedAt: { 
        type: Date, 
        default: Date.now 
    }
}, { 
    timestamps: true 
});

recipeSchema.index({ userId: 1, savedAt: -1 });

module.exports = mongoose.model('Recipe', recipeSchema);
```

### Step 5: Update Auth Controller

Update `controllers/authController.js` to ensure proper JWT token format:

```javascript
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username, email, and password are required',
                msg: 'Please provide all required fields'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 6 characters',
                msg: 'Password too short'
            });
        }

        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'User already exists',
                msg: existingUser.email === email 
                    ? 'Email already registered' 
                    : 'Username already taken'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            pantry: [],
            goals: 'balanced',
            budgetLevel: 'medium'
        });

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        const userData = user.toObject();
        delete userData.password;

        res.status(201).json({
            success: true,
            token,
            user: userData,
            msg: 'Registration successful'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            msg: 'Registration failed'
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password required',
                msg: 'Please provide email and password'
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials',
                msg: 'Invalid email or password'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials',
                msg: 'Invalid email or password'
            });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

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

// NEW: Get current user endpoint
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password')
            .populate('favoriteRecipes');

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

### Step 6: Create Recipe Controller

Create `controllers/recipeController.js`:

```javascript
const Recipe = require('../models/Recipe');
const User = require('../models/User');

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

exports.saveRecipe = async (req, res) => {
    try {
        const recipeData = req.body;
        const userId = req.user._id;

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
```

### Step 7: Update Routes

Update `routes/auth.js`:

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
router.get('/me', authMiddleware, getCurrentUser); // NEW

module.exports = router;
```

Create `routes/recipes.js`:

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

Update `routes/user.js` to protect routes:

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

### Step 8: Update Server.js

Update your `server.js` to include new routes and CORS configuration:

```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// CORS configuration - IMPORTANT: Allow Authorization header
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'] // CRITICAL: Include Authorization
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/recipes', require('./routes/recipes')); // NEW
app.use('/api/recommend', require('./routes/recommend')); // Your existing route

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
```

### Step 9: Update Environment Variables

Ensure your `.env` file includes:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
MONGO_URI=your-mongodb-connection-string
GEMINI_API_KEY=your-gemini-api-key-optional
CORS_ORIGIN=http://localhost:3000,https://mern-final-project-joan-ouma.vercel.app
```

### Step 10: Standardize Error Responses

Create `middleware/errorHandler.js`:

```javascript
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            error: messages.join(', '),
            msg: 'Validation failed'
        });
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(400).json({
            success: false,
            error: `Duplicate ${field} value`,
            msg: `This ${field} already exists`
        });
    }

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

    res.status(err.statusCode || 500).json({
        success: false,
        error: err.message || 'Server error',
        msg: err.message || 'Something went wrong'
    });
};

module.exports = errorHandler;
```

Add to `server.js`:

```javascript
const errorHandler = require('./middleware/errorHandler');
// ... other middleware ...
app.use(errorHandler); // Must be last
```

## 🧪 Testing the Changes

### Test Authentication:

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@test.com","password":"password123"}'

# Login (save the token)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'

# Get current user (use token from login)
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test Recipe Endpoints:

```bash
# Save recipe
curl -X POST http://localhost:5000/api/recipes/favorites \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Recipe","ingredients":["ing1","ing2"],"instructions":["step1"]}'

# Get favorites
curl http://localhost:5000/api/recipes/favorites \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Search recipes
curl "http://localhost:5000/api/recipes/search?q=chicken"
```

## 📝 Summary of Changes

1. **Added JWT Authentication Middleware** - Protects routes with Bearer token
2. **Created Recipe Model** - Stores saved recipes
3. **Updated User Model** - Added favoriteRecipes array
4. **Created Recipe Controller** - Handles favorites, search, trending
5. **Added New Routes** - `/api/recipes/*` endpoints
6. **Updated Auth Routes** - Added `/api/auth/me` endpoint
7. **Protected User Routes** - All require authentication
8. **Standardized Error Format** - Consistent error responses
9. **Updated CORS** - Allows Authorization header

## 🚨 Important Notes

1. **JWT_SECRET**: Make sure to set a strong secret in production
2. **CORS**: Update CORS_ORIGIN to include your frontend domains
3. **Password Hashing**: Ensure passwords are hashed before saving
4. **Token Expiration**: Currently set to 7 days, adjust as needed
5. **Error Handling**: All errors now follow the same format

## 🔗 Integration with Frontend

The frontend expects these endpoints:

- `POST /api/auth/register` - Returns `{success, token, user, msg}`
- `POST /api/auth/login` - Returns `{success, token, user, msg}`
- `GET /api/auth/me` - Returns `{success, data: user, msg}`
- `POST /api/recipes/favorites` - Saves recipe
- `GET /api/recipes/favorites` - Gets user favorites
- `DELETE /api/recipes/favorites/:id` - Removes favorite
- `GET /api/recipes/search?q=query` - Searches recipes
- `GET /api/recipes/:id` - Gets recipe details

All protected routes expect: `Authorization: Bearer <token>`

