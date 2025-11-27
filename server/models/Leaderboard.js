/**
 * Leaderboard Model
 * Tracks daily goal achievements for leaderboard rankings
 */
const mongoose = require('mongoose');

const leaderboardEntrySchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
        index: true
    },
    username: {
        type: String,
        required: true
    },
    date: { 
        type: Date, 
        required: true,
        index: true
    },
    // Goal achievement metrics
    metrics: {
        caloriesMet: { type: Boolean, default: false },
        proteinMet: { type: Boolean, default: false },
        carbsMet: { type: Boolean, default: false },
        fatsMet: { type: Boolean, default: false },
        perfectDay: { type: Boolean, default: false } // All macros balanced
    },
    // Actual values
    nutrition: {
        calories: { type: Number, default: 0 },
        protein: { type: Number, default: 0 },
        carbs: { type: Number, default: 0 },
        fats: { type: Number, default: 0 }
    },
    calorieGoal: { type: Number, default: 2000 },
    score: { 
        type: Number, 
        default: 0,
        index: true
    },
    streak: { type: Number, default: 1 }, // Consecutive days meeting goals
    mealsLogged: { type: Number, default: 0 }
}, { 
    timestamps: true 
});

// Compound unique index - one entry per user per day
leaderboardEntrySchema.index({ userId: 1, date: 1 }, { unique: true });
// Index for leaderboard queries
leaderboardEntrySchema.index({ date: -1, score: -1 });

// Calculate score based on achievements
leaderboardEntrySchema.methods.calculateScore = function() {
    let score = 0;
    
    // Base points for logging meals
    score += this.mealsLogged * 10;
    
    // Points for meeting calorie goal (within 5%)
    const calorieDiff = Math.abs(this.nutrition.calories - this.calorieGoal) / this.calorieGoal;
    if (calorieDiff <= 0.05) score += 50;
    else if (calorieDiff <= 0.10) score += 30;
    else if (calorieDiff <= 0.15) score += 10;
    
    // Bonus for perfect day
    if (this.metrics.perfectDay) score += 100;
    
    // Macro goals met
    if (this.metrics.proteinMet) score += 25;
    if (this.metrics.carbsMet) score += 25;
    if (this.metrics.fatsMet) score += 25;
    
    // Streak bonus
    score += this.streak * 5;
    
    return score;
};

leaderboardEntrySchema.pre('save', function(next) {
    this.score = this.calculateScore();
    next();
});

module.exports = mongoose.model('Leaderboard', leaderboardEntrySchema);
