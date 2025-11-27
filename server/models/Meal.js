/**
 * Meal Model
 * Tracks individual meals logged by users
 */
const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
        index: true
    },
    name: { 
        type: String, 
        required: [true, 'Meal name is required'],
        trim: true
    },
    type: { 
        type: String, 
        enum: ['breakfast', 'lunch', 'dinner', 'snack'],
        required: true
    },
    date: { 
        type: Date, 
        required: true,
        index: true
    },
    recipeId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Recipe' 
    },
    nutrition: {
        calories: { type: Number, default: 0, required: true },
        protein: { type: Number, default: 0 }, // in grams
        carbs: { type: Number, default: 0 }, // in grams
        fats: { type: Number, default: 0 }, // in grams
        fiber: { type: Number, default: 0 },
        sugar: { type: Number, default: 0 },
        sodium: { type: Number, default: 0 } // in mg
    },
    ingredients: [{
        name: { type: String, required: true },
        amount: { type: String },
        calories: { type: Number, default: 0 }
    }],
    servingSize: { 
        type: String, 
        default: '1 serving' 
    },
    servings: {
        type: Number,
        default: 1,
        min: 0.1
    },
    tags: [{
        type: String,
        enum: ['gluten-free', 'vegan', 'vegetarian', 'keto', 'paleo', 'dairy-free', 'nut-free', 'low-carb', 'high-protein', 'low-fat', 'quick', 'meal-prep']
    }],
    notes: { 
        type: String,
        maxlength: [500, 'Notes must be less than 500 characters']
    }
}, { 
    timestamps: true 
});

// Compound index for efficient queries
mealSchema.index({ userId: 1, date: -1 });
mealSchema.index({ userId: 1, date: 1, type: 1 });

module.exports = mongoose.model('Meal', mealSchema);

