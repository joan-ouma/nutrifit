const Meal = require('../models/Meal');
const DailyLog = require('../models/DailyLog');
const User = require('../models/User');
const Leaderboard = require('../models/Leaderboard'); // ✅ Import Leaderboard Model directly

/**
 * Log a meal
 */
exports.logMeal = async (req, res, next) => {
    try {
        const { name, type, date, recipeId, nutrition, ingredients, servingSize, notes } = req.body;
        const userId = req.user._id || req.user.id;

        // 1. Save Meal
        const meal = new Meal({
            userId,
            name,
            type,
            date: date ? new Date(date) : new Date(),
            nutrition: nutrition || { calories: 0, protein: 0, carbs: 0, fats: 0 },
            ingredients: ingredients || [],
            servingSize: servingSize || '1 serving',
            notes
        });

        await meal.save();

        // 2. Update Daily Log (Nutrition Stats)
        const mealDate = new Date(meal.date);
        mealDate.setHours(0, 0, 0, 0);
        
        let dailyLog = await DailyLog.findOne({ userId, date: mealDate });
        const user = await User.findById(userId);

        if (!dailyLog) {
            dailyLog = new DailyLog({
                userId,
                date: mealDate,
                calorieGoal: user?.calorieGoal || 2000
            });
        }

        dailyLog.totalNutrition.calories += meal.nutrition.calories || 0;
        dailyLog.totalNutrition.protein += meal.nutrition.protein || 0;
        dailyLog.totalNutrition.carbs += meal.nutrition.carbs || 0;
        dailyLog.totalNutrition.fats += meal.nutrition.fats || 0;
        dailyLog.mealCount[type] = (dailyLog.mealCount[type] || 0) + 1;

        await dailyLog.save();

        // 3. ✅ ATOMIC LEADERBOARD UPDATE (The Fix)
        // Instead of recalculating, we just FORCE +10 points instantly.
        try {
            await Leaderboard.findOneAndUpdate(
                { userId, date: mealDate },
                {
                    $setOnInsert: { // Set these only if creating new entry
                        username: user.username,
                        profileImage: user.profileImage,
                        streak: user.streak || 1
                    },
                    $inc: { // INCREMENT existing values safely
                        score: 10,       // +10 Points
                        points: 10,      // +10 Points (Backup field)
                        mealsLogged: 1   // +1 Meal
                    }
                },
                { upsert: true, new: true }
            );
            console.log("✅ Points incremented +10");
        } catch (err) {
            console.error("Leaderboard update error:", err);
        }

        res.status(201).json({
            success: true,
            meal,
            msg: "Meal logged +10 Points!"
        });

    } catch (error) {
        next(error);
    }
};

// ... (Keep existing getters below) ...
exports.getMealsByDate = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { date } = req.params;
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const meals = await Meal.find({ userId, date: { $gte: targetDate, $lt: nextDay } });
        const dailyLog = await DailyLog.findOne({ userId, date: targetDate });

        res.json({ success: true, meals, dailyLog });
    } catch (error) { next(error); }
};

exports.getWeeklySummary = async (req, res, next) => {
    try {
       // Placeholder for weekly summary logic if you need it restored
       res.json({ success: true, data: [] });
    } catch (error) { next(error); }
};

exports.deleteMeal = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { mealId } = req.params;
        
        // Find meal to get date before deleting
        const meal = await Meal.findById(mealId);
        if(meal) {
            const mealDate = new Date(meal.date);
            mealDate.setHours(0,0,0,0);

            // Remove points atomically
            await Leaderboard.findOneAndUpdate(
                { userId, date: mealDate },
                { $inc: { score: -10, points: -10, mealsLogged: -1 } }
            );
            await Meal.findByIdAndDelete(mealId);
        }
        res.json({ success: true, msg: "Meal deleted" });
    } catch (error) { next(error); }
};

exports.updateMeal = async (req, res, next) => { res.json({ success: true }); };
exports.getNutritionInsights = async (req, res, next) => { res.json({ success: true }); };