/**
 * User Model
 * Stores user information, preferences, and favorites
 */
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters']
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: { 
        type: String, 
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    pantry: [{
        type: String,
        trim: true
    }],
    goals: { 
        type: String, 
        enum: ['balanced', 'weight-loss', 'muscle', 'weight-gain'],
        default: 'balanced' 
    },
    budgetLevel: { 
        type: String, 
        enum: ['low', 'medium', 'high'],
        default: 'medium' 
    },
    // Calorie and nutrition goals
    calorieGoal: { 
        type: Number, 
        default: 2000 
    },
    macroGoals: {
        protein: { type: Number, default: 30 }, // percentage
        carbs: { type: Number, default: 40 },
        fats: { type: Number, default: 30 }
    },
    // Dietary preferences and restrictions
    dietaryRestrictions: [{
        type: String,
        enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'keto', 'paleo', 'halal', 'kosher']
    }],
    allergies: [{
        type: String
    }],
    // Activity level for calorie calculation
    activityLevel: {
        type: String,
        enum: ['sedentary', 'lightly-active', 'moderately-active', 'very-active', 'extra-active'],
        default: 'moderately-active'
    },
    // Body metrics (optional)
    bodyMetrics: {
        age: { type: Number },
        gender: { type: String, enum: ['male', 'female', 'other'] },
        height: { type: Number }, // in cm
        weight: { type: Number }, // in kg
        targetWeight: { type: Number } // in kg
    },
    // Water intake goal
    waterGoal: {
        type: Number,
        default: 2000 // ml - 8 glasses
    },
    bio: { 
        type: String,
        maxlength: [500, 'Bio must be less than 500 characters']
    },
    profileImage: { 
        type: String 
    },
    favoriteRecipes: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Recipe' 
    }],
    searchHistory: [{
        query: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
    }]
}, { 
    timestamps: true 
});

// Indexes are automatically created by unique: true on email and username fields
// No need for duplicate index definitions

module.exports = mongoose.model('User', userSchema);



