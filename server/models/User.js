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
    calorieGoal: {
        type: Number,
        default: 2000
    },
    waterGoal: {
        type: Number,
        default: 2500
    },
    streak: {
        type: Number,
        default: 0
    },
    lastMealDate: {
        type: Date
    },
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

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

module.exports = mongoose.model('User', userSchema);
