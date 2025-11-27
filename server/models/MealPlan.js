/**
 * MealPlan Model
 * Stores weekly meal plans for users
 */
const mongoose = require('mongoose');

const mealPlanItemSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    mealType: { 
        type: String, 
        enum: ['breakfast', 'lunch', 'dinner', 'snack'],
        required: true
    },
    recipeId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Recipe' 
    },
    recipeName: { type: String },
    nutrition: {
        calories: { type: Number, default: 0 },
        protein: { type: Number, default: 0 },
        carbs: { type: Number, default: 0 },
        fats: { type: Number, default: 0 }
    },
    ingredients: [{
        name: { type: String },
        amount: { type: String }
    }],
    notes: { type: String }
});

const mealPlanSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
        index: true
    },
    name: { 
        type: String, 
        default: 'Weekly Meal Plan'
    },
    startDate: { 
        type: Date, 
        required: true 
    },
    endDate: { 
        type: Date, 
        required: true 
    },
    meals: [mealPlanItemSchema],
    totalEstimatedCalories: { type: Number, default: 0 },
    isActive: { 
        type: Boolean, 
        default: true 
    }
}, { 
    timestamps: true 
});

mealPlanSchema.index({ userId: 1, startDate: -1 });

module.exports = mongoose.model('MealPlan', mealPlanSchema);

