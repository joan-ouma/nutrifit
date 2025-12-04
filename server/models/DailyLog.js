const mongoose = require('mongoose');

const dailyLogSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
        index: true
    },
    date: { 
        type: Date, 
        required: true,
        index: true
    },
    totalNutrition: {
        calories: { type: Number, default: 0 },
        protein: { type: Number, default: 0 },
        carbs: { type: Number, default: 0 },
        fats: { type: Number, default: 0 },
        fiber: { type: Number, default: 0 },
        sugar: { type: Number, default: 0 },
        sodium: { type: Number, default: 0 }
    },
    mealCount: {
        breakfast: { type: Number, default: 0 },
        lunch: { type: Number, default: 0 },
        dinner: { type: Number, default: 0 },
        snack: { type: Number, default: 0 }
    },
    calorieGoal: { 
        type: Number, 
        default: 2000 
    },
    waterIntake: { 
        type: Number, 
        default: 0
    },
    waterGoal: {
        type: Number,
        default: 2000
    },
    exercise: {
        caloriesBurned: { type: Number, default: 0 },
        minutes: { type: Number, default: 0 },
        type: { type: String }
    }
}, { 
    timestamps: true 
});

dailyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

dailyLogSchema.methods.getRemainingCalories = function() {
    return Math.max(0, this.calorieGoal - this.totalNutrition.calories);
};

dailyLogSchema.methods.getMacroPercentages = function() {
    const total = this.totalNutrition.protein * 4 + 
                  this.totalNutrition.carbs * 4 + 
                  this.totalNutrition.fats * 9;
    
    if (total === 0) return { protein: 0, carbs: 0, fats: 0 };
    
    return {
        protein: Math.round((this.totalNutrition.protein * 4 / total) * 100),
        carbs: Math.round((this.totalNutrition.carbs * 4 / total) * 100),
        fats: Math.round((this.totalNutrition.fats * 9 / total) * 100)
    };
};

module.exports = mongoose.model('DailyLog', dailyLogSchema);

