const Leaderboard = require('../models/Leaderboard');
const DailyLog = require('../models/DailyLog');
const User = require('../models/User');

exports.updateLeaderboardEntry = async (userId, dateObj) => {
    try {
        const date = new Date(dateObj);
        date.setHours(0, 0, 0, 0);

        const dailyLog = await DailyLog.findOne({ userId, date });
        const user = await User.findById(userId);

        if (!dailyLog || !user) return;

        let score = 0;

        const mealsLogged = Object.values(dailyLog.mealCount || {}).reduce((a, b) => a + b, 0);
        score += (mealsLogged * 10);

        const calories = dailyLog.totalNutrition?.calories || 0;
        const goal = user.calorieGoal || 2000;
        
        let caloriesMet = false;
        if (calories > 0 && calories >= (goal * 0.9) && calories <= (goal * 1.1)) {
            score += 50;
            caloriesMet = true;
        }

        const streak = user.streak || 1;
        score += (streak * 5);

        await Leaderboard.findOneAndUpdate(
            { userId, date },
            {
                username: user.username,
                profileImage: user.profileImage,
                score: score,
                points: score,
                mealsLogged: mealsLogged,
                streak: streak,
                nutrition: dailyLog.totalNutrition,
                metrics: {
                    caloriesMet: caloriesMet,
                    perfectDay: (caloriesMet && mealsLogged >= 3)
                }
            },
            { upsert: true, new: true }
        );

    } catch (error) {
        console.error("Leaderboard Calc Error:", error);
    }
};

exports.getDailyLeaderboard = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const leaderboard = await Leaderboard.find({ date: today })
            .sort({ score: -1 })
            .limit(50)
            .populate('userId', 'username profileImage');

        res.json({ success: true, data: leaderboard });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getWeeklyLeaderboard = async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const leaderboard = await Leaderboard.aggregate([
            { $match: { date: { $gte: sevenDaysAgo } } },
            { $group: {
                _id: "$userId",
                username: { $first: "$username" },
                totalScore: { $sum: "$score" },
                mealsLogged: { $sum: "$mealsLogged" }
            }},
            { $sort: { totalScore: -1 } },
            { $limit: 50 }
        ]);

        res.json({ success: true, data: leaderboard });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUserRank = async (req, res) => {
    try {
        const userId = req.user._id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let entry = await Leaderboard.findOne({ userId, date: today });
        const dailyLog = await DailyLog.findOne({ userId, date: today });
        
        const hasActivity = dailyLog && (
            Object.values(dailyLog.mealCount || {}).reduce((a,b)=>a+b,0) > 0 || 
            (dailyLog.waterIntake || 0) > 0
        );

        if (hasActivity) {
            await exports.updateLeaderboardEntry(userId, today);
            entry = await Leaderboard.findOne({ userId, date: today });
        }

        if (!entry) {
             entry = await Leaderboard.findOne({ userId }).sort({ createdAt: -1 });
        }

        const myScore = entry ? (entry.score || entry.points || 0) : 0;
        
        const rank = await Leaderboard.countDocuments({ 
            date: today, 
            score: { $gt: myScore } 
        }) + 1;

        res.json({ 
            success: true, 
            rank, 
            score: myScore, 
            points: myScore, 
            mealsLogged: entry ? entry.mealsLogged : (dailyLog ? 25 : 0),
            streak: entry ? entry.streak : 1,
            data: entry 
        });

    } catch (error) {
        console.error("Rank Error:", error);
        res.status(500).json({ error: error.message });
    }
};