const Leaderboard = require('../models/Leaderboard');
const DailyLog = require('../models/DailyLog');
const User = require('../models/User');

/**
 * Update or create leaderboard entry for a user
 */
exports.updateLeaderboardEntry = async (userId, date) => {
    try {
        const dailyLog = await DailyLog.findOne({ userId, date });
        if (!dailyLog) return null;

        const user = await User.findById(userId);
        if (!user) return null;

        const calorieGoal = user.calorieGoal || 2000;
        const macroGoals = user.macroGoals || { protein: 30, carbs: 40, fats: 30 };

        // Calculate if goals are met
        const calorieDiff = Math.abs(dailyLog.totalNutrition.calories - calorieGoal) / calorieGoal;
        const caloriesMet = calorieDiff <= 0.10; // Within 10%

        // Calculate macro percentages
        const macros = dailyLog.getMacroPercentages();
        const proteinMet = macros.protein >= macroGoals.protein * 0.8 && macros.protein <= macroGoals.protein * 1.2;
        const carbsMet = macros.carbs >= macroGoals.carbs * 0.8 && macros.carbs <= macroGoals.carbs * 1.2;
        const fatsMet = macros.fats >= macroGoals.fats * 0.8 && macros.fats <= macroGoals.fats * 1.2;
        const perfectDay = caloriesMet && proteinMet && carbsMet && fatsMet;

        // Calculate streak
        const yesterday = new Date(date);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayEntry = await Leaderboard.findOne({ userId, date: yesterday });
        const streak = yesterdayEntry && yesterdayEntry.score > 50 ? yesterdayEntry.streak + 1 : 1;

        // Count meals logged
        const mealsLogged = Object.values(dailyLog.mealCount).reduce((sum, count) => sum + count, 0);

        const entry = await Leaderboard.findOneAndUpdate(
            { userId, date },
            {
                username: user.username,
                metrics: {
                    caloriesMet,
                    proteinMet,
                    carbsMet,
                    fatsMet,
                    perfectDay
                },
                nutrition: dailyLog.totalNutrition,
                calorieGoal,
                streak,
                mealsLogged
            },
            { upsert: true, new: true }
        );

        return entry;
    } catch (error) {
        console.error('Error updating leaderboard:', error);
        return null;
    }
};

/**
 * Get daily leaderboard
 */
exports.getDailyLeaderboard = async (req, res, next) => {
    try {
        const { date } = req.query;
        const targetDate = date ? new Date(date) : new Date();
        targetDate.setHours(0, 0, 0, 0);

        // Get top 50 entries for the day
        const entries = await Leaderboard.find({ date: targetDate })
            .sort({ score: -1 })
            .limit(50)
            .populate('userId', 'username')
            .lean();

        // Format usernames for privacy (first 3 letters + ***)
        const formattedEntries = entries.map(entry => {
            const username = entry.username || 'User';
            const maskedUsername = username.length > 3 
                ? username.substring(0, 3) + '***'
                : username + '***';

            return {
                ...entry,
                maskedUsername,
                rank: entries.indexOf(entry) + 1
            };
        });

        res.json({
            success: true,
            date: targetDate.toISOString().split('T')[0],
            leaderboard: formattedEntries,
            count: formattedEntries.length
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get weekly leaderboard
 */
exports.getWeeklyLeaderboard = async (req, res, next) => {
    try {
        const { startDate } = req.query;
        const start = startDate ? new Date(startDate) : new Date();
        start.setDate(start.getDate() - start.getDay()); // Start of week
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(end.getDate() + 7);

        // Aggregate scores by user for the week
        const weeklyScores = await Leaderboard.aggregate([
            {
                $match: {
                    date: { $gte: start, $lt: end }
                }
            },
            {
                $group: {
                    _id: '$userId',
                    username: { $first: '$username' },
                    totalScore: { $sum: '$score' },
                    perfectDays: { $sum: { $cond: ['$metrics.perfectDay', 1, 0] } },
                    avgScore: { $avg: '$score' },
                    streak: { $max: '$streak' },
                    daysActive: { $sum: 1 }
                }
            },
            {
                $sort: { totalScore: -1 }
            },
            {
                $limit: 50
            }
        ]);

        // Format usernames
        const formattedEntries = weeklyScores.map((entry, index) => {
            const username = entry.username || 'User';
            const maskedUsername = username.length > 3 
                ? username.substring(0, 3) + '***'
                : username + '***';

            return {
                ...entry,
                maskedUsername,
                rank: index + 1
            };
        });

        res.json({
            success: true,
            period: 'weekly',
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0],
            leaderboard: formattedEntries,
            count: formattedEntries.length
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user's leaderboard position
 */
exports.getUserRank = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const { date } = req.query;
        const targetDate = date ? new Date(date) : new Date();
        targetDate.setHours(0, 0, 0, 0);

        const userEntry = await Leaderboard.findOne({ userId, date: targetDate });
        
        if (!userEntry) {
            return res.json({
                success: true,
                rank: null,
                score: 0,
                message: 'No entry for today'
            });
        }

        // Get rank
        const entriesAbove = await Leaderboard.countDocuments({
            date: targetDate,
            score: { $gt: userEntry.score }
        });

        const rank = entriesAbove + 1;

        res.json({
            success: true,
            rank,
            score: userEntry.score,
            metrics: userEntry.metrics,
            streak: userEntry.streak,
            totalEntries: await Leaderboard.countDocuments({ date: targetDate })
        });
    } catch (error) {
        next(error);
    }
};

