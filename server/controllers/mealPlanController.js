const MealPlan = require('../models/MealPlan');
const Recipe = require('../models/Recipe');
const User = require('../models/User');

/**
 * Create a meal plan
 */
exports.createMealPlan = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const { name, startDate, endDate, meals } = req.body;

        // Calculate total estimated calories
        const totalCalories = meals.reduce((sum, meal) => 
            sum + (meal.nutrition?.calories || 0), 0
        );

        const mealPlan = new MealPlan({
            userId,
            name: name || 'Weekly Meal Plan',
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            meals,
            totalEstimatedCalories: totalCalories
        });

        await mealPlan.save();

        res.status(201).json({
            success: true,
            data: mealPlan
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user's meal plans
 */
exports.getMealPlans = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const plans = await MealPlan.find({ userId })
            .sort({ startDate: -1 })
            .limit(20);

        res.json({
            success: true,
            data: plans
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get single meal plan
 */
exports.getMealPlan = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const { id } = req.params;

        const plan = await MealPlan.findOne({ _id: id, userId });
        if (!plan) {
            return res.status(404).json({ error: 'Meal plan not found' });
        }

        res.json({
            success: true,
            data: plan
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Generate meal plan from recommendations
 */
exports.generateMealPlan = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const { days = 7, calorieGoal } = req.body;

        const user = await User.findById(userId);
        const targetCalories = calorieGoal || user.calorieGoal || 2000;
        const dailyCalorieTarget = targetCalories;

        // Generate meal plan for specified days
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + days - 1);

        const meals = [];
        const mealTypes = ['breakfast', 'lunch', 'dinner'];
        const calorieDistribution = {
            breakfast: 0.25, // 25%
            lunch: 0.35,     // 35%
            dinner: 0.40     // 40%
        };

        for (let i = 0; i < days; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(currentDate.getDate() + i);

            for (const mealType of mealTypes) {
                const targetCalories = dailyCalorieTarget * calorieDistribution[mealType];
                
                meals.push({
                    date: currentDate,
                    mealType,
                    recipeName: `Suggested ${mealType}`,
                    nutrition: {
                        calories: Math.round(targetCalories),
                        protein: Math.round(targetCalories * 0.25 / 4), // 25% protein
                        carbs: Math.round(targetCalories * 0.40 / 4),   // 40% carbs
                        fats: Math.round(targetCalories * 0.35 / 9)     // 35% fats
                    },
                    ingredients: [],
                    notes: `Auto-generated ${mealType} for ${currentDate.toLocaleDateString()}`
                });
            }
        }

        const mealPlan = new MealPlan({
            userId,
            name: `${days}-Day Meal Plan`,
            startDate,
            endDate,
            meals,
            totalEstimatedCalories: dailyCalorieTarget * days
        });

        await mealPlan.save();

        res.status(201).json({
            success: true,
            data: mealPlan,
            message: `Generated ${days}-day meal plan`
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update meal plan
 */
exports.updateMealPlan = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const { id } = req.params;
        const updates = req.body;

        const plan = await MealPlan.findOneAndUpdate(
            { _id: id, userId },
            updates,
            { new: true, runValidators: true }
        );

        if (!plan) {
            return res.status(404).json({ error: 'Meal plan not found' });
        }

        res.json({
            success: true,
            data: plan
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete meal plan
 */
exports.deleteMealPlan = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const { id } = req.params;

        await MealPlan.findOneAndDelete({ _id: id, userId });

        res.json({
            success: true,
            message: 'Meal plan deleted'
        });
    } catch (error) {
        next(error);
    }
};

