const DailyLog = require('../models/DailyLog');
const Meal = require('../models/Meal');

/**
 * Export nutrition data as CSV
 */
exports.exportNutritionCSV = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const { startDate, endDate } = req.query;

        const query = { userId };
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const dailyLogs = await DailyLog.find(query).sort({ date: 1 });

        // Generate CSV
        const headers = ['Date', 'Calories', 'Protein (g)', 'Carbs (g)', 'Fats (g)', 'Fiber (g)', 'Sugar (g)', 'Sodium (mg)', 'Calorie Goal', 'Remaining'];
        const rows = dailyLogs.map(log => {
            const remaining = log.getRemainingCalories();
            return [
                log.date.toISOString().split('T')[0],
                log.totalNutrition.calories || 0,
                log.totalNutrition.protein || 0,
                log.totalNutrition.carbs || 0,
                log.totalNutrition.fats || 0,
                log.totalNutrition.fiber || 0,
                log.totalNutrition.sugar || 0,
                log.totalNutrition.sodium || 0,
                log.calorieGoal || 2000,
                remaining
            ];
        });

        const csv = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=nutrition-export-${Date.now()}.csv`);
        res.send(csv);
    } catch (error) {
        next(error);
    }
};

/**
 * Export meal log as CSV
 */
exports.exportMealsCSV = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const { startDate, endDate } = req.query;

        const query = { userId };
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const meals = await Meal.find(query).sort({ date: 1, createdAt: 1 });

        const headers = ['Date', 'Meal Type', 'Name', 'Calories', 'Protein (g)', 'Carbs (g)', 'Fats (g)', 'Serving Size', 'Notes'];
        const rows = meals.map(meal => [
            meal.date.toISOString().split('T')[0],
            meal.type,
            meal.name,
            meal.nutrition?.calories || 0,
            meal.nutrition?.protein || 0,
            meal.nutrition?.carbs || 0,
            meal.nutrition?.fats || 0,
            meal.servingSize || '1 serving',
            meal.notes || ''
        ]);

        const csv = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=meals-export-${Date.now()}.csv`);
        res.send(csv);
    } catch (error) {
        next(error);
    }
};

