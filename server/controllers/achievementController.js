const Achievement = require('../models/Achievement');
const Meal = require('../models/Meal');
const DailyLog = require('../models/DailyLog');
const User = require('../models/User');

/**
 * Check and award achievements
 */
exports.checkAchievements = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const newAchievements = [];

        // Get user stats
        const mealCount = await Meal.countDocuments({ userId });
        const dailyLogs = await DailyLog.find({ userId }).sort({ date: -1 });
        const user = await User.findById(userId);

        // Check for first meal
        if (mealCount === 1) {
            const exists = await Achievement.findOne({ userId, type: 'first_meal' });
            if (!exists) {
                const achievement = await Achievement.create({
                    userId,
                    type: 'first_meal',
                    title: 'First Steps',
                    description: 'Logged your first meal!',
                    icon: '🎯',
                    progress: 1,
                    target: 1
                });
                newAchievements.push(achievement);
            }
        }

        // Check for week streak
        if (dailyLogs.length >= 7) {
            const recentDates = dailyLogs.slice(0, 7).map(log => {
                const date = new Date(log.date);
                date.setHours(0, 0, 0, 0);
                return date.getTime();
            });
            const uniqueDays = new Set(recentDates).size;
            
            if (uniqueDays >= 7) {
                const exists = await Achievement.findOne({ userId, type: 'week_streak' });
                if (!exists) {
                    const achievement = await Achievement.create({
                        userId,
                        type: 'week_streak',
                        title: 'Week Warrior',
                        description: 'Logged meals for 7 consecutive days!',
                        icon: '🔥',
                        progress: 7,
                        target: 7
                    });
                    newAchievements.push(achievement);
                }
            }
        }

        // Check for calorie goal achievement
        const recentLogs = dailyLogs.slice(0, 7);
        const avgCalories = recentLogs.length > 0
            ? recentLogs.reduce((sum, log) => sum + log.totalNutrition.calories, 0) / recentLogs.length
            : 0;
        
        if (avgCalories > 0 && Math.abs(avgCalories - (user.calorieGoal || 2000)) < 100) {
            const exists = await Achievement.findOne({ userId, type: 'calorie_goal' });
            if (!exists) {
                const achievement = await Achievement.create({
                    userId,
                    type: 'calorie_goal',
                    title: 'Goal Getter',
                    description: 'Met your calorie goal for a week!',
                    icon: '🎯',
                    progress: 1,
                    target: 1
                });
                newAchievements.push(achievement);
            }
        }

        // Check for perfect day (all macros balanced)
        const todayLog = dailyLogs[0];
        if (todayLog && todayLog.date.toDateString() === new Date().toDateString()) {
            const macros = todayLog.getMacroPercentages();
            const isBalanced = macros.protein >= 20 && macros.protein <= 35 &&
                              macros.carbs >= 30 && macros.carbs <= 50 &&
                              macros.fats >= 20 && macros.fats <= 35;
            
            if (isBalanced) {
                const exists = await Achievement.findOne({ 
                    userId, 
                    type: 'perfect_day',
                    unlockedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
                });
                if (!exists) {
                    const achievement = await Achievement.create({
                        userId,
                        type: 'perfect_day',
                        title: 'Perfect Balance',
                        description: 'Achieved balanced macros today!',
                        icon: '⭐',
                        progress: 1,
                        target: 1
                    });
                    newAchievements.push(achievement);
                }
            }
        }

        res.json({
            success: true,
            newAchievements,
            message: newAchievements.length > 0 ? 'New achievements unlocked!' : 'No new achievements'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user achievements
 */
exports.getAchievements = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const achievements = await Achievement.find({ userId })
            .sort({ unlockedAt: -1 });

        res.json({
            success: true,
            data: achievements,
            count: achievements.length
        });
    } catch (error) {
        next(error);
    }
};

