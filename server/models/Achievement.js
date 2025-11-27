/**
 * Achievement Model
 * Tracks user achievements and badges
 */
const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
        index: true
    },
    type: { 
        type: String, 
        required: true,
        enum: [
            'first_meal', 'week_streak', 'calorie_goal', 'protein_goal', 
            'meal_prep', 'recipe_saved', 'grocery_completed', 'perfect_day',
            'nutrition_balanced', 'month_streak', 'goal_reached'
        ]
    },
    title: { type: String, required: true },
    description: { type: String },
    icon: { type: String },
    unlockedAt: { 
        type: Date, 
        default: Date.now 
    },
    progress: { 
        type: Number, 
        default: 0 
    },
    target: { 
        type: Number, 
        default: 1 
    }
}, { 
    timestamps: true 
});

achievementSchema.index({ userId: 1, type: 1 }, { unique: true });
achievementSchema.index({ userId: 1, unlockedAt: -1 });

module.exports = mongoose.model('Achievement', achievementSchema);

