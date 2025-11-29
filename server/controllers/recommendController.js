const { GoogleGenerativeAI } = require('@google/generative-ai');
const Meal = require('../models/Meal');
const DailyLog = require('../models/DailyLog');
const User = require('../models/User');

// Initialize Gemini AI
const genAI = process.env.GEMINI_API_KEY 
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

// ==========================================
// 1. GENERATE RECIPES (The AI Chef)
// ==========================================
exports.generateRecipes = async (req, res, next) => {
    try {
        const { 
            pantry, 
            userGoal = 'balanced', 
            budget = 'medium',
            cuisine = 'any',
            mealType = 'any',
            dietaryRestrictions = [],
            maxCalories
        } = req.body;
        
        // --- VALIDATION ---
        if (!pantry || !pantry.trim()) {
            return res.status(400).json({ success: false, error: 'Pantry ingredients are required' });
        }

        // --- CHECK API KEY ---
        if (!genAI) {
            console.error("CRITICAL ERROR: GEMINI_API_KEY is missing in .env file");
            return res.status(500).json({ 
                success: false, 
                error: "Server Error: Gemini API Key is missing. Check backend logs." 
            });
        }

        // --- THE MICHELIN STAR PROMPT ---
        const prompt = `
            You are a professional Michelin-star chef. Create 2 detailed, gourmet recipes using these ingredients: ${pantry}.
            
            User Preferences:
            - Goal: ${userGoal}
            - Budget: ${budget}
            - Cuisine: ${cuisine}
            - Meal Type: ${mealType}
            ${maxCalories ? `- Max Calories: ${maxCalories}` : ''}
            ${dietaryRestrictions.length ? `- Restrictions: ${dietaryRestrictions.join(', ')}` : ''}

            CRITICAL INSTRUCTIONS:
            1. Use the provided ingredients (${pantry}) as the main components.
            2. INSTRUCTIONS MUST BE DETAILED: Do NOT write "Cook chicken". Write "Sear the chicken on medium-high heat for 6 minutes per side until golden brown."
            3. Provide at least 6 steps in the instructions.
            4. NUTRITION: Values must be NUMBERS ONLY. Do not write "500 kcal", just write 500.
            5. KENYAN CUISINE: If cuisine is 'Kenyan', suggest authentic dishes (Ugali, Sukuma Wiki, Nyama Choma, Chapati, etc.) if ingredients allow.

            Return ONLY a valid JSON array matching this structure:
            [{
                "name": "Creative Recipe Name",
                "ingredients": ["list", "of", "ingredients"],
                "instructions": ["Step 1...", "Step 2...", "Step 3...", "Step 4...", "Step 5...", "Step 6..."],
                "nutrition": { "calories": 500, "protein": 30, "carbs": 50, "fats": 15 },
                "time": "30 min",
                "matchScore": 95,
                "whyItWorks": "Why this fits...",
                "missingIngredients": ["optional missing items"]
            }]
        `;

        let recipes = [];

        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Clean the text (remove markdown backticks if AI adds them)
            const jsonStr = text.replace(/```json|```/g, '').trim();
            
            // Extract JSON array
            const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
            
            if (jsonMatch) {
                recipes = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error("Invalid JSON format received from AI");
            }

        } catch (error) {
            console.error('Gemini API Error:', error);
            // STOP! Do not send Pasta. Send the real error so we can fix it.
            return res.status(500).json({ 
                success: false, 
                error: `AI Generation Failed: ${error.message}` 
            });
        }

        // Send the real recipes
        res.json({
            success: true,
            data: recipes
        });

    } catch (error) {
        console.error("Server Controller Error:", error);
        next(error);
    }
};

// ==========================================
// 2. PERSONALIZED RECOMMENDATIONS (Context Aware)
// ==========================================
exports.getPersonalizedRecommendations = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const { mealType, date } = req.body;

        // Get user profile
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Get recent history
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentLogs = await DailyLog.find({ userId, date: { $gte: sevenDaysAgo } }).sort({ date: -1 });

        // Calculate Stats
        const avgCalories = recentLogs.length > 0 
            ? recentLogs.reduce((sum, log) => sum + log.totalNutrition.calories, 0) / recentLogs.length 
            : 0;
        
        let todayNutrition = null;
        if (date) {
            const targetDate = new Date(date);
            targetDate.setHours(0, 0, 0, 0);
            const todayLog = await DailyLog.findOne({ userId, date: targetDate });
            if (todayLog) todayNutrition = todayLog.totalNutrition;
        }

        const calorieGoal = user.calorieGoal || 2000;
        const remainingCalories = todayNutrition 
            ? Math.max(0, calorieGoal - todayNutrition.calories)
            : calorieGoal;

        // Simple prompt for personalized (simplified for stability)
        const prompt = `
            Act as a nutritionist. Suggest 1 meal for a user.
            Goal: ${user.goals}, Remaining Cals: ${remainingCalories}, Type: ${mealType}.
            Return JSON: [{ "name": "...", "instructions": [], "nutrition": {...} }]
        `;

        // Generate
        let recommendations = [];
        if (genAI) {
            try {
                const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
                const result = await model.generateContent(prompt);
                const text = result.response.text();
                const jsonMatch = text.match(/\[[\s\S]*\]/);
                if (jsonMatch) recommendations = JSON.parse(jsonMatch[0]);
            } catch (e) { console.error(e); }
        }

        // Fallback (Only for personalized, NOT for the main chef)
        if (recommendations.length === 0) {
            recommendations = generateFallbackRecommendations({ mealType, remainingCalories });
        }

        res.json({
            success: true,
            recommendations,
            userContext: { calorieGoal, remainingCalories }
        });

    } catch (error) {
        next(error);
    }
};

// ==========================================
// 3. HELPER FUNCTIONS
// ==========================================

function generateFallbackRecommendations({ mealType, remainingCalories }) {
    // Only used for the "Personalized" tab, not the main "AI Chef"
    return [{
        name: 'Balanced Power Bowl',
        type: mealType || 'balanced',
        ingredients: ['quinoa', 'mixed greens', 'chickpeas', 'avocado'],
        instructions: ['Combine all ingredients in a bowl', 'Dress with olive oil and lemon'],
        nutrition: { calories: 450, protein: 15, carbs: 55, fats: 20 },
        time: '15 min',
        matchScore: 80
    }];
}

function generateInsights() { return []; } // Placeholder if needed