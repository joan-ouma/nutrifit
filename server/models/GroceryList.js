/**
 * GroceryList Model
 * Stores user's grocery lists with items and estimated costs
 */
const mongoose = require('mongoose');

const groceryItemSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    quantity: { type: String, default: '1' },
    unit: { type: String, default: 'item' },
    estimatedCost: { type: Number, default: 0 },
    category: { 
        type: String, 
        enum: ['produce', 'meat', 'dairy', 'pantry', 'frozen', 'beverages', 'other'],
        default: 'other'
    },
    checked: { type: Boolean, default: false },
    store: { type: String },
    notes: { type: String }
});

const groceryListSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
        index: true
    },
    name: { 
        type: String, 
        required: true,
        default: 'My Grocery List'
    },
    items: [groceryItemSchema],
    totalEstimatedCost: { 
        type: Number, 
        default: 0 
    },
    mealPlanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MealPlan'
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    completedAt: { 
        type: Date 
    }
}, { 
    timestamps: true 
});

groceryListSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('GroceryList', groceryListSchema);

