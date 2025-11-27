/**
 * ChatMessage Model
 * Stores chat conversation history
 */
const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
        index: true
    },
    sessionId: {
        type: String,
        required: true,
        index: true
    },
    role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    messageType: {
        type: String,
        enum: ['text', 'recipe', 'question', 'ingredient_request'],
        default: 'text'
    },
    // For recipe generation
    preferences: {
        dietaryRestrictions: [String],
        cuisine: String,
        mealType: String,
        maxCalories: Number,
        maxPrepTime: Number
    },
    ingredients: [String],
    recipes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe'
    }],
    // Metadata
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { 
    timestamps: true 
});

// Indexes for efficient queries
chatMessageSchema.index({ userId: 1, sessionId: 1, timestamp: -1 });
chatMessageSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);

