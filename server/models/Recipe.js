/**
 * Recipe Model
 * Stores user-saved recipes and favorites
 */
const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Recipe name is required'],
        trim: true
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    ingredients: [{
        type: String,
        trim: true
    }],
    instructions: [{
        type: String,
        trim: true
    }],
    nutrition: {
        calories: { type: Number, default: 0 },
        protein: { type: String, default: '0g' },
        carbs: { type: String, default: '0g' },
        fats: { type: String, default: '0g' }
    },
    time: { 
        type: String, 
        default: '30 min' 
    },
    costPerServing: { 
        type: String, 
        default: '$5' 
    },
    matchScore: { 
        type: Number, 
        min: 0, 
        max: 100 
    },
    whyItWorks: { 
        type: String 
    },
    missingIngredients: [{
        type: String,
        trim: true
    }],
    image: { 
        type: String 
    },
    savedAt: { 
        type: Date, 
        default: Date.now 
    }
}, { 
    timestamps: true 
});

// Index for faster searches
recipeSchema.index({ userId: 1, savedAt: -1 });
recipeSchema.index({ name: 'text', 'ingredients': 'text', 'whyItWorks': 'text' });

module.exports = mongoose.model('Recipe', recipeSchema);



