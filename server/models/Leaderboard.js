const mongoose = require('mongoose');

const leaderboardEntrySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    username: { type: String, required: true },
    date: { type: Date, required: true, index: true },
    
    metrics: {
        caloriesMet: { type: Boolean, default: false },
        proteinMet: { type: Boolean, default: false },
        carbsMet: { type: Boolean, default: false },
        fatsMet: { type: Boolean, default: false },
        perfectDay: { type: Boolean, default: false }
    },
    nutrition: {
        calories: { type: Number, default: 0 },
        protein: { type: Number, default: 0 },
        carbs: { type: Number, default: 0 },
        fats: { type: Number, default: 0 }
    },
    calorieGoal: { type: Number, default: 2000 },
    
    // ✅ The Score Field (Calculated by Controller)
    score: { type: Number, default: 0, index: true },
    
    streak: { type: Number, default: 1 },
    mealsLogged: { type: Number, default: 0 }
}, { timestamps: true });

leaderboardEntrySchema.index({ userId: 1, date: 1 }, { unique: true });
leaderboardEntrySchema.index({ date: -1, score: -1 });

module.exports = mongoose.model('Leaderboard', leaderboardEntrySchema);