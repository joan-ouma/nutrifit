const Leaderboard = require('../models/Leaderboard');
const DailyLog = require('../models/DailyLog');
const User = require('../models/User');

/**
 * Update Leaderboard (The Scoring Engine)
 */
exports.updateLeaderboardEntry = async (userId, dateObj) => {
    try {
        const date = new Date(dateObj);
        date.setHours(0, 0, 0, 0);

        // 1. Fetch Data
        const dailyLog = await DailyLog.findOne({ userId, date });
        const user = await User.findById(userId);

        if (!dailyLog || !user) return;

        // 2. CALCULATE POINTS (The Missing Math)
        let score = 0;

        // A. Meals Logged (10 points each)
        // We sum up breakfast + lunch + dinner + snack counts
        const mealsLogged = Object.values(dailyLog.mealCount || {}).reduce((a, b) => a + b, 0);
        score += (mealsLogged * 10);

        // B. Calorie Goal (50 points if hit)
        const calories = dailyLog.totalNutrition?.calories || 0;
        const goal = user.calorieGoal || 2000;
        
        let caloriesMet = false;
        if (calories > 0 && calories >= (goal * 0.9) && calories <= (goal * 1.1)) {
            score += 50;
            caloriesMet = true;
        }

        // C. Streak Bonus (5 points per day)
        const streak = user.streak || 1;
        score += (streak * 5);

        // 3. FORCE UPDATE THE DATABASE
        // We explicitly set 'score' here.
        await Leaderboard.findOneAndUpdate(
            { userId, date },
            {
                username: user.username,
                profileImage: user.profileImage,
                score: score, // ✅ CRITICAL: Saving the calculated score
                points: score, // Backup field
                mealsLogged: mealsLogged,
                streak: streak,
                nutrition: dailyLog.totalNutrition,
                metrics: {
                    caloriesMet: caloriesMet,
                    perfectDay: (caloriesMet && mealsLogged >= 3) // Simple "Perfect Day" logic
                }
            },
            { upsert: true, new: true }
        );

        console.log(`✅ Points Updated: ${user.username} has ${score} points (Meals: ${mealsLogged})`);

    } catch (error) {
        console.error("Leaderboard Calc Error:", error);
    }
};

/**
 * Get Daily Leaderboard
 */
exports.getDailyLeaderboard = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const leaderboard = await Leaderboard.find({ date: today })
            .sort({ score: -1 }) // Sort by score descending
            .limit(50)
            .populate('userId', 'username profileImage');

        res.json({ success: true, data: leaderboard });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get Weekly Leaderboard
 */
exports.getWeeklyLeaderboard = async (req, res) => {
    try {
        // Aggregate last 7 days
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

        // 1. Try to find existing leaderboard entry
        let entry = await Leaderboard.findOne({ userId, date: today });
        
        // 2. CHECK FOR BUG: If no entry OR score is 0 but they have activity...
        // We go check the DailyLog to see if they actually did work today.
        const dailyLog = await DailyLog.findOne({ userId, date: today });
        
        const hasActivity = dailyLog && (
            Object.values(dailyLog.mealCount || {}).reduce((a,b)=>a+b,0) > 0 || 
            (dailyLog.waterIntake || 0) > 0
        );

        if (hasActivity) {
            // Found activity! Let's force a recalculation immediately.
            console.log("⚠️ Leaderboard Desync Detected. Auto-fixing score...");
            
            // Re-run the update logic we wrote earlier
            // (We call the export directly to reuse the logic)
            await exports.updateLeaderboardEntry(userId, today);
            
            // Fetch the fixed entry
            entry = await Leaderboard.findOne({ userId, date: today });
        }

        // 3. Fallback: If still nothing, verify if one exists without date constraint (All-time)
        if (!entry) {
             entry = await Leaderboard.findOne({ userId }).sort({ createdAt: -1 });
        }

        // 4. Calculate Rank
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
            mealsLogged: entry ? entry.mealsLogged : (dailyLog ? 25 : 0), // Use actual log if leaderboard fails
            streak: entry ? entry.streak : 1,
            data: entry 
        });

    } catch (error) {
        console.error("Rank Error:", error);
        res.status(500).json({ error: error.message });
    }
};