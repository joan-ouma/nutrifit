const DailyLog = require('../models/DailyLog');
const User = require('../models/User');

/**
 * Log water intake
 */
exports.logWater = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const { amount, date } = req.body; // amount in ml

        const targetDate = date ? new Date(date) : new Date();
        targetDate.setHours(0, 0, 0, 0);

        let dailyLog = await DailyLog.findOne({ userId, date: targetDate });

        if (!dailyLog) {
            const user = await User.findById(userId);
            dailyLog = new DailyLog({
                userId,
                date: targetDate,
                calorieGoal: user?.calorieGoal || 2000,
                waterGoal: user?.waterGoal || 2000
            });
        }

        dailyLog.waterIntake = (dailyLog.waterIntake || 0) + (amount || 0);
        await dailyLog.save();

        res.json({
            success: true,
            data: {
                waterIntake: dailyLog.waterIntake,
                waterGoal: dailyLog.waterGoal,
                remaining: Math.max(0, dailyLog.waterGoal - dailyLog.waterIntake),
                percentage: Math.min(100, (dailyLog.waterIntake / dailyLog.waterGoal) * 100)
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get water intake for date range
 */
exports.getWaterIntake = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const { startDate, endDate } = req.query;

        const query = { userId };
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const logs = await DailyLog.find(query)
            .select('date waterIntake waterGoal')
            .sort({ date: -1 });

        const totalWater = logs.reduce((sum, log) => sum + (log.waterIntake || 0), 0);
        const avgWater = logs.length > 0 ? totalWater / logs.length : 0;

        res.json({
            success: true,
            data: logs,
            summary: {
                totalWater,
                averageWater: Math.round(avgWater),
                daysTracked: logs.length
            }
        });
    } catch (error) {
        next(error);
    }
};

