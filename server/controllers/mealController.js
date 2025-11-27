const Meal = require('../models/Meal');
const DailyLog = require('../models/DailyLog');
const User = require('../models/User');
const Recipe = require('../models/Recipe');

/**
 * Log a meal
 */
exports.logMeal = async (req, res, next) => {
    try {
        const { name, type, date, recipeId, nutrition, ingredients, servingSize, notes } = req.body;
        const userId = req.user._id || req.user.id;

        // Validate meal type
        const validTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ error: 'Invalid meal type' });
        }

        // Create meal
        const meal = new Meal({
            userId,
            name,
            type,
            date: date ? new Date(date) : new Date(),
            recipeId,
            nutrition: nutrition || { calories: 0, protein: 0, carbs: 0, fats: 0 },
            ingredients: ingredients || [],
            servingSize: servingSize || '1 serving',
            notes
        });

        await meal.save();

        // Update or create daily log
        const mealDate = new Date(meal.date);
        mealDate.setHours(0, 0, 0, 0);
        
        let dailyLog = await DailyLog.findOne({ 
            userId, 
            date: mealDate 
        });

        if (!dailyLog) {
            const user = await User.findById(userId);
            dailyLog = new DailyLog({
                userId,
                date: mealDate,
                calorieGoal: user?.calorieGoal || 2000
            });
        }

        // Update daily totals
        dailyLog.totalNutrition.calories += meal.nutrition.calories || 0;
        dailyLog.totalNutrition.protein += meal.nutrition.protein || 0;
        dailyLog.totalNutrition.carbs += meal.nutrition.carbs || 0;
        dailyLog.totalNutrition.fats += meal.nutrition.fats || 0;
        dailyLog.totalNutrition.fiber += meal.nutrition.fiber || 0;
        dailyLog.totalNutrition.sugar += meal.nutrition.sugar || 0;
        dailyLog.totalNutrition.sodium += meal.nutrition.sodium || 0;
        
        dailyLog.mealCount[type] = (dailyLog.mealCount[type] || 0) + 1;

        await dailyLog.save();

        // Update leaderboard entry
        const leaderboardController = require('./leaderboardController');
        leaderboardController.updateLeaderboardEntry(userId, mealDate).catch(err => 
            console.error('Leaderboard update error:', err)
        );

        res.status(201).json({
            success: true,
            meal,
            dailyLog: {
                totalCalories: dailyLog.totalNutrition.calories,
                remainingCalories: dailyLog.getRemainingCalories(),
                macros: dailyLog.getMacroPercentages()
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get meals for a specific date
 */
exports.getMealsByDate = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const { date } = req.params;

        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const meals = await Meal.find({
            userId,
            date: { $gte: targetDate, $lt: nextDay }
        }).sort({ createdAt: -1 }).populate('recipeId', 'name image');

        // Get daily log
        const dailyLog = await DailyLog.findOne({ userId, date: targetDate });

        res.json({
            success: true,
            meals,
            dailyLog: dailyLog || {
                totalNutrition: { calories: 0, protein: 0, carbs: 0, fats: 0 },
                calorieGoal: 2000,
                mealCount: { breakfast: 0, lunch: 0, dinner: 0, snack: 0 }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get weekly nutrition summary
 */
exports.getWeeklySummary = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const { startDate } = req.query;

        const start = startDate ? new Date(startDate) : new Date();
        start.setDate(start.getDate() - start.getDay()); // Start of week (Sunday)
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(end.getDate() + 7);

        const dailyLogs = await DailyLog.find({
            userId,
            date: { $gte: start, $lt: end }
        }).sort({ date: 1 });

        // Calculate weekly totals
        const weeklyTotals = dailyLogs.reduce((acc, log) => {
            acc.calories += log.totalNutrition.calories;
            acc.protein += log.totalNutrition.protein;
            acc.carbs += log.totalNutrition.carbs;
            acc.fats += log.totalNutrition.fats;
            acc.fiber += log.totalNutrition.fiber;
            acc.sugar += log.totalNutrition.sugar;
            acc.sodium += log.totalNutrition.sodium;
            acc.daysLogged += 1;
            return acc;
        }, {
            calories: 0,
            protein: 0,
            carbs: 0,
            fats: 0,
            fiber: 0,
            sugar: 0,
            sodium: 0,
            daysLogged: 0
        });

        // Calculate averages
        const days = dailyLogs.length || 1;
        const averages = {
            calories: Math.round(weeklyTotals.calories / days),
            protein: Math.round(weeklyTotals.protein / days),
            carbs: Math.round(weeklyTotals.carbs / days),
            fats: Math.round(weeklyTotals.fats / days)
        };

        res.json({
            success: true,
            weeklyTotals,
            averages,
            dailyLogs,
            daysLogged: dailyLogs.length
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a meal
 */
exports.deleteMeal = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const { mealId } = req.params;

        const meal = await Meal.findOne({ _id: mealId, userId });
        if (!meal) {
            return res.status(404).json({ error: 'Meal not found' });
        }

        // Update daily log
        const mealDate = new Date(meal.date);
        mealDate.setHours(0, 0, 0, 0);
        
        const dailyLog = await DailyLog.findOne({ userId, date: mealDate });
        if (dailyLog) {
            dailyLog.totalNutrition.calories -= meal.nutrition.calories || 0;
            dailyLog.totalNutrition.protein -= meal.nutrition.protein || 0;
            dailyLog.totalNutrition.carbs -= meal.nutrition.carbs || 0;
            dailyLog.totalNutrition.fats -= meal.nutrition.fats || 0;
            dailyLog.totalNutrition.fiber -= meal.nutrition.fiber || 0;
            dailyLog.totalNutrition.sugar -= meal.nutrition.sugar || 0;
            dailyLog.totalNutrition.sodium -= meal.nutrition.sodium || 0;
            
            dailyLog.mealCount[meal.type] = Math.max(0, (dailyLog.mealCount[meal.type] || 0) - 1);
            
            await dailyLog.save();
        }

        await Meal.findByIdAndDelete(mealId);

        res.json({
            success: true,
            message: 'Meal deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update meal
 */
exports.updateMeal = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const { mealId } = req.params;
        const updates = req.body;

        const meal = await Meal.findOne({ _id: mealId, userId });
        if (!meal) {
            return res.status(404).json({ error: 'Meal not found' });
        }

        // Store old nutrition values
        const oldNutrition = { ...meal.nutrition };

        // Update meal
        Object.assign(meal, updates);
        await meal.save();

        // Update daily log if nutrition changed
        if (updates.nutrition) {
            const mealDate = new Date(meal.date);
            mealDate.setHours(0, 0, 0, 0);
            
            const dailyLog = await DailyLog.findOne({ userId, date: mealDate });
            if (dailyLog) {
                // Subtract old values, add new values
                dailyLog.totalNutrition.calories += (meal.nutrition.calories - oldNutrition.calories);
                dailyLog.totalNutrition.protein += (meal.nutrition.protein - oldNutrition.protein);
                dailyLog.totalNutrition.carbs += (meal.nutrition.carbs - oldNutrition.carbs);
                dailyLog.totalNutrition.fats += (meal.nutrition.fats - oldNutrition.fats);
                
                await dailyLog.save();
            }
        }

        res.json({
            success: true,
            meal
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get nutrition insights
 */
exports.getNutritionInsights = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const days = parseInt(req.query.days) || 7;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        const dailyLogs = await DailyLog.find({
            userId,
            date: { $gte: startDate }
        }).sort({ date: -1 });

        const user = await User.findById(userId);
        const calorieGoal = user?.calorieGoal || 2000;

        // Calculate insights
        const totalCalories = dailyLogs.reduce((sum, log) => sum + log.totalNutrition.calories, 0);
        const avgCalories = dailyLogs.length > 0 ? totalCalories / dailyLogs.length : 0;
        const calorieDeficit = calorieGoal - avgCalories;

        const totalProtein = dailyLogs.reduce((sum, log) => sum + log.totalNutrition.protein, 0);
        const avgProtein = dailyLogs.length > 0 ? totalProtein / dailyLogs.length : 0;

        const totalCarbs = dailyLogs.reduce((sum, log) => sum + log.totalNutrition.carbs, 0);
        const avgCarbs = dailyLogs.length > 0 ? totalCarbs / dailyLogs.length : 0;

        const totalFats = dailyLogs.reduce((sum, log) => sum + log.totalNutrition.fats, 0);
        const avgFats = dailyLogs.length > 0 ? totalFats / dailyLogs.length : 0;

        // Generate recommendations
        const recommendations = [];
        
        if (avgCalories < calorieGoal * 0.9) {
            recommendations.push({
                type: 'calories',
                message: `You're averaging ${Math.round(avgCalories)} calories per day, which is below your goal of ${calorieGoal}. Consider adding nutrient-dense snacks.`,
                priority: 'medium'
            });
        } else if (avgCalories > calorieGoal * 1.1) {
            recommendations.push({
                type: 'calories',
                message: `You're averaging ${Math.round(avgCalories)} calories per day, which exceeds your goal. Consider portion control or lighter meal options.`,
                priority: 'high'
            });
        }

        const proteinGoal = (calorieGoal * (user?.macroGoals?.protein || 30) / 100) / 4; // grams
        if (avgProtein < proteinGoal * 0.8) {
            recommendations.push({
                type: 'protein',
                message: `Your average protein intake (${Math.round(avgProtein)}g) is below recommended levels. Add lean proteins like chicken, fish, or legumes.`,
                priority: 'high'
            });
        }

        res.json({
            success: true,
            insights: {
                averageCalories: Math.round(avgCalories),
                calorieGoal,
                calorieDeficit: Math.round(calorieDeficit),
                averageProtein: Math.round(avgProtein),
                averageCarbs: Math.round(avgCarbs),
                averageFats: Math.round(avgFats),
                daysTracked: dailyLogs.length,
                period: days
            },
            recommendations
        });
    } catch (error) {
        next(error);
    }
};

