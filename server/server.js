const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration - Allow Authorization header
const corsOrigins = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : ['http://localhost:3000'];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        if (corsOrigins.includes(origin) || corsOrigins.includes('*')) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/recipes', require('./routes/recipes'));
app.use('/api/recommend', require('./routes/recommend'));
app.use('/api/meals', require('./routes/meals'));
app.use('/api/grocery', require('./routes/grocery'));
app.use('/api/achievements', require('./routes/achievements'));
app.use('/api/export', require('./routes/export'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/meal-plans', require('./routes/mealPlans'));
app.use('/api/water', require('./routes/water'));
app.use('/api/chat', require('./routes/chat'));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        message: 'NutriFit API is running'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: 'Welcome to NutriFit API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            user: '/api/user',
            recipes: '/api/recipes',
            recommend: '/api/recommend'
        }
    });
});

// Error handler middleware (must be last)
app.use(errorHandler);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nutrifit')
.then(() => {
    console.log('✅ MongoDB connected successfully');
})
.catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
    console.log(`🔑 GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing'}`);
    console.log(`🗄️  MONGO_URI: ${process.env.MONGO_URI ? '✅ Set' : '❌ Using default'}`);
});

module.exports = app;



