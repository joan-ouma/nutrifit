const { GoogleGenerativeAI } = require('@google/generative-ai');
const User = require('../models/User');
require('dotenv').config(); // Load environment variables

// --- 1. DEBUG: CHECK API KEY (Look at your terminal when server starts) ---
const key = process.env.GEMINI_API_KEY;
console.log("🔑 DEBUG KEY CHECK:");
console.log("   - Key Exists?", !!key);
console.log("   - Key Length:", key ? key.length : 0);
console.log("   - First 4 chars:", key ? key.substring(0, 4) : "NONE");

// Initialize Gemini (Only if key exists)
const genAI = key ? new GoogleGenerativeAI(key) : null;

// --- 2. THE CONTROLLER ---
exports.generateRecipes = async (req, res) => {
    console.log("👉 CONTROLLER HIT: generateRecipes was called!");

    try {
        const { pantry, cuisine, mealType, userGoal, maxCalories } = req.body;

        // Validation
        if (!pantry || !pantry.trim()) {
            return res.status(400).json({ success: false, error: 'Pantry ingredients are required' });
        }

        // Check connection
        if (!genAI) {
            console.error("❌ ERROR: Gemini API Key is missing in .env");
            return res.status(500).json({ success: false, error: "Server Error: API Key Missing" });
        }

        // The Prompt (Updated for Gemini Flash)
        const prompt = `
            You are a professional Michelin-star chef. Create 2 detailed recipes using these ingredients: ${pantry}.
            
            User Preferences:
            - Goal: ${userGoal || 'Balanced'}
            - Cuisine: ${cuisine || 'Any'} (If 'Kenyan', suggest authentic dishes like Ugali/Sukuma Wiki)
            - Meal Type: ${mealType || 'Any'}
            ${maxCalories ? `- Max Calories: ${maxCalories}` : ''}

            CRITICAL INSTRUCTIONS:
            1. Instructions must be DETAILED (6+ steps). 
            2. Nutrition values must be NUMBERS ONLY.
            3. Return ONLY a valid JSON array.

            Example format:
            [{
                "name": "Recipe Name",
                "ingredients": ["..."],
                "instructions": ["Step 1...", "Step 2..."],
                "nutrition": { "calories": 500, "protein": 30, "carbs": 50, "fats": 15 },
                "time": "30 min",
                "matchScore": 95,
                "whyItWorks": "...",
                "missingIngredients": []
            }]
        `;

        // UPDATED: Using a valid model from your list
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean and Parse JSON
        const jsonStr = text.replace(/```json|```/g, '').trim();
        const recipes = JSON.parse(jsonStr.match(/\[[\s\S]*\]/)[0]);

        res.json({ success: true, data: recipes });

    } catch (error) {
        console.error("❌ AI ERROR:", error);
        
        // Return the REAL error to the frontend
        res.status(500).json({ 
            success: false, 
            error: `AI Error: ${error.message}` 
        });
    }
};

// Placeholder for personalized recommendations
exports.getPersonalizedRecommendations = async (req, res) => {
    res.json({ success: true, message: "Personalized endpoint ready" });
};

/*const { GoogleGenerativeAI } = require('@google/generative-ai');
const Meal = require('../models/Meal');
const DailyLog = require('../models/DailyLog');
const User = require('../models/User');

// Initialize Gemini AI
const genAI = process.env.GEMINI_API_KEY 
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

/**
 * Generate personalized recipe recommendations based on user's eating patterns
 */
exports.getPersonalizedRecommendations = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const { mealType, date } = req.body;

        // Get user profile
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get recent meal history (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentMeals = await Meal.find({
            userId,
            date: { $gte: sevenDaysAgo }
        }).sort({ date: -1 }).limit(50);

        // Get recent daily logs
        const recentLogs = await DailyLog.find({
            userId,
            date: { $gte: sevenDaysAgo }
        }).sort({ date: -1 });

        // Analyze eating patterns
        const mealFrequency = { breakfast: 0, lunch: 0, dinner: 0, snack: 0 };
        const commonIngredients = {};
        const avgCalories = recentLogs.length > 0 
            ? recentLogs.reduce((sum, log) => sum + log.totalNutrition.calories, 0) / recentLogs.length 
            : 0;
        
        recentMeals.forEach(meal => {
            mealFrequency[meal.type] = (mealFrequency[meal.type] || 0) + 1;
            meal.ingredients?.forEach(ing => {
                const name = ing.name?.toLowerCase() || ing.toLowerCase();
                commonIngredients[name] = (commonIngredients[name] || 0) + 1;
            });
        });

        // Get today's nutrition if date provided
        let todayNutrition = null;
        if (date) {
            const targetDate = new Date(date);
            targetDate.setHours(0, 0, 0, 0);
            const todayLog = await DailyLog.findOne({ userId, date: targetDate });
            if (todayLog) {
                todayNutrition = todayLog.totalNutrition;
            }
        }

        // Calculate remaining calories for today
        const calorieGoal = user.calorieGoal || 2000;
        const remainingCalories = todayNutrition 
            ? Math.max(0, calorieGoal - todayNutrition.calories)
            : calorieGoal;

        // Get top ingredients
        const topIngredients = Object.entries(commonIngredients)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name]) => name);

        // Build recommendation prompt
        const prompt = buildRecommendationPrompt({
            user,
            mealType: mealType || 'balanced',
            remainingCalories,
            avgCalories,
            mealFrequency,
            topIngredients,
            todayNutrition,
            dietaryRestrictions: user.dietaryRestrictions || [],
            allergies: user.allergies || [],
            goals: user.goals
        });

        // Generate recommendations
        let recommendations = [];
        
        if (genAI) {
            try {
                // UPDATED: Using a valid model from your list
                const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();

                // Parse JSON from response
                const jsonMatch = text.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    recommendations = JSON.parse(jsonMatch[0]);
                }
            } catch (error) {
                console.error('Gemini API error:', error);
                
                // Check for API key errors
                if (error.status === 400 && error.errorDetails) {
                    const errorDetail = error.errorDetails.find(detail => detail.reason === 'API_KEY_INVALID');
                    if (errorDetail) {
                        console.error('CRITICAL: Invalid Gemini API Key. Please update GEMINI_API_KEY in Render.');
                    }
                }
            }
        }

        // Fallback recommendations if AI fails
        if (recommendations.length === 0) {
            recommendations = generateFallbackRecommendations({
                mealType,
                remainingCalories,
                topIngredients,
                user
            });
        }

        // Add personalized insights
        const insights = generateInsights({
            mealFrequency,
            avgCalories,
            calorieGoal,
            todayNutrition,
            remainingCalories
        });

        res.json({
            success: true,
            recommendations,
            insights,
            userContext: {
                calorieGoal,
                remainingCalories,
                avgDailyCalories: Math.round(avgCalories),
                topIngredients: topIngredients.slice(0, 5)
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Build recommendation prompt for AI
 */
function buildRecommendationPrompt({ user, mealType, remainingCalories, avgCalories, mealFrequency, topIngredients, todayNutrition, dietaryRestrictions, allergies, goals }) {
    return `You are a professional nutritionist and chef. Generate detailed step by step instructions for a personalized recipe recommendations.Do not use vague steps like "Cook chicken" instead use specific steps like "Cut the chicken into small pieces" and "Cook the chicken until it is fully cooked". "Nutrition" values must only be numbers and not strings like "kcal" or "g".

USER CONTEXT:
- Calorie Goal: ${user.calorieGoal || 2000} calories/day
- Remaining Calories Today: ${remainingCalories} calories
- Average Daily Calories (last 7 days): ${Math.round(avgCalories)} calories
- Dietary Goal: ${goals || 'balanced'}
- Dietary Restrictions: ${dietaryRestrictions.join(', ') || 'none'}
- Allergies: ${allergies.join(', ') || 'none'}
- Most Used Ingredients: ${topIngredients.join(', ') || 'none'}
- Meal Frequency: Breakfast ${mealFrequency.breakfast}x, Lunch ${mealFrequency.lunch}x, Dinner ${mealFrequency.dinner}x, Snacks ${mealFrequency.snack}x

${todayNutrition ? `TODAY'S NUTRITION SO FAR:
- Calories: ${todayNutrition.calories}/${user.calorieGoal || 2000}
- Protein: ${Math.round(todayNutrition.protein)}g
- Carbs: ${Math.round(todayNutrition.carbs)}g
- Fats: ${Math.round(todayNutrition.fats)}g` : ''}

RECOMMENDATION REQUIREMENTS:
1. Recipes should fit within ${remainingCalories} remaining calories
2. Consider user's eating patterns and preferences
3. Suggest recipes that complement their current nutrition
4. Use ingredients they commonly use when possible
5. Respect dietary restrictions and allergies
6. Align with their ${goals} goal

For each recipe, provide JSON format:
{
    "name": "Recipe Name",
    "type": "${mealType || 'balanced'}",
    "ingredients": ["ingredient1", "ingredient2"],
    "instructions": ["step1", "step2"],
    "nutrition": {
        "calories": 400,
        "protein": 25,
        "carbs": 45,
        "fats": 12,
        "fiber": 5,
        "sugar": 8,
        "sodium": 600
    },
    "time": "30 min",
    "servingSize": "1 serving",
    "costPerServing": "$5",
    "matchScore": 90,
    "whyItWorks": "Explanation of why this fits their needs",
    "missingIngredients": ["item1"],
    "image": "food image URL"
}

Return as JSON array.`;
}

/**
 * Generate fallback recommendations when AI is unavailable
 */
function generateFallbackRecommendations({ mealType, remainingCalories, topIngredients, user }) {
    const calorieTarget = Math.min(remainingCalories, 600);
    
    return [
        {
            name: 'Balanced Power Bowl',
            type: mealType || 'balanced',
            ingredients: topIngredients.slice(0, 5).concat(['quinoa', 'mixed greens', 'olive oil']),
            instructions: [
                'Cook quinoa according to package directions',
                'Prepare vegetables and protein',
                'Arrange in a bowl with greens',
                'Drizzle with dressing and serve'
            ],
            nutrition: {
                calories: Math.round(calorieTarget * 0.9),
                protein: Math.round(calorieTarget * 0.25 / 4),
                carbs: Math.round(calorieTarget * 0.4 / 4),
                fats: Math.round(calorieTarget * 0.35 / 9),
                fiber: 8,
                sugar: 5,
                sodium: 400
            },
            time: '25 min',
            servingSize: '1 bowl',
            costPerServing: '$6',
            matchScore: 85,
            whyItWorks: 'Balanced macros that fit your remaining calorie budget',
            missingIngredients: [],
            image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800'
        }
    ];
}

/**
 * Generate personalized insights
 */
function generateInsights({ mealFrequency, avgCalories, calorieGoal, todayNutrition, remainingCalories }) {
    const insights = [];

    if (avgCalories < calorieGoal * 0.85) {
        insights.push({
            type: 'calorie',
            message: `You're averaging ${Math.round(avgCalories)} calories per day. Consider adding nutrient-dense meals to reach your goal.`,
            priority: 'medium'
        });
    }

    if (mealFrequency.snack < mealFrequency.breakfast) {
        insights.push({
            type: 'pattern',
            message: 'You tend to eat more breakfasts than snacks. Healthy snacks can help maintain energy throughout the day.',
            priority: 'low'
        });
    }

    if (remainingCalories < 300 && todayNutrition) {
        insights.push({
            type: 'calorie',
            message: `You have ${remainingCalories} calories remaining. Consider lighter meal options or a healthy snack.`,
            priority: 'high'
        });
    }

    return insights;
}

/**
 * Generate recipes based on pantry (original functionality)
 */
/**
 * Generate recipes based on pantry ingredients
 */
exports.generateRecipes = async (req, res, next) => {
    try {
        const { 
            pantry, 
            userGoal = 'balanced', 
            budget = 'medium',
            cuisine = 'any',
            mealType = 'any',
            dietaryRestrictions = [],
            maxCalories,
            maxPrepTime
        } = req.body;
        
        // 1. Validation
        if (!pantry || !pantry.trim()) {
            return res.status(400).json({ success: false, error: 'Pantry ingredients are required' });
        }

        // 2. CHECK API KEY
        if (!genAI) {
            console.error("ERROR: GEMINI_API_KEY is missing in .env file");
            return res.status(500).json({ success: false, error: "Server Error: API Key missing" });
        }

        // 3. FIX: Add the 'pantry' ingredients to the prompt!
        // (You missed this in your previous code, so the AI didn't know what to cook)
        const prompt = `
            You are a professional Michelin-star chef. Create 2 detailed recipes using these ingredients: ${pantry}.
            
            User Preferences:
            - Goal: ${userGoal}
            - Budget: ${budget}
            - Cuisine: ${cuisine}
            - Meal Type: ${mealType}
            ${maxCalories ? `- Max Calories: ${maxCalories}` : ''}
            ${dietaryRestrictions.length ? `- Restrictions: ${dietaryRestrictions.join(', ')}` : ''}

            CRITICAL INSTRUCTIONS:
            1. Use the provided ingredients (${pantry}) as the main components.
            2. "instructions" must be an array of at least 6 detailed steps.
            3. "nutrition" values must be NUMBERS ONLY (no "kcal", "g"). 
            4. If the cuisine is "Kenyan", suggest authentic dishes like Ugali, Sukuma Wiki, or Nyama Choma if ingredients allow.

            Return ONLY valid JSON array:
            [{
                "name": "Recipe Name",
                "ingredients": ["list", "of", "ingredients"],
                "instructions": ["Step 1...", "Step 2..."],
                "nutrition": { "calories": 500, "protein": 30, "carbs": 50, "fats": 15 },
                "time": "30 min",
                "matchScore": 95,
                "whyItWorks": "Why this fits...",
                "missingIngredients": ["optional missing items"]
            }]
        `;

        let recipes = [];

        try {
            // UPDATED: Using a valid model from your list
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Clean the text (sometimes AI adds markdown backticks)
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
            
            // Check for specific API key errors
            if (error.status === 400 && error.errorDetails) {
                const errorDetail = error.errorDetails.find(detail => detail.reason === 'API_KEY_INVALID');
                if (errorDetail) {
                    return res.status(500).json({ 
                        success: false, 
                        error: 'Invalid Gemini API Key. Please check your GEMINI_API_KEY environment variable in Render. Get a valid key from https://makersuite.google.com/app/apikey' 
                    });
                }
            }
            
            // Check for other common errors
            if (error.message && error.message.includes('API key')) {
                return res.status(500).json({ 
                    success: false, 
                    error: 'Gemini API Key error. Please verify your GEMINI_API_KEY is set correctly in Render environment variables.' 
                });
            }
            
            // Generic error
            return res.status(500).json({ 
                success: false, 
                error: `AI Generation Failed: ${error.message || 'Unknown error'}. Please check server logs for details.` 
            });
        }

        res.json({
            success: true,
            data: recipes
        });

    } catch (error) {
        console.error("Server Error:", error);
        next(error);
    }
};
// ... existing code ...

// ==========================================
// 3. SMART GROCERY ESTIMATOR (New Feature)
// ==========================================
exports.estimateGroceryItem = async (req, res) => {
    try {
        const { itemName } = req.body;
        
        if (!itemName) return res.status(400).json({ error: "Item name required" });

        // Check API Key
        if (!genAI) {
            return res.status(500).json({ error: "AI Service Unavailable" });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
            Estimate the current average cost (in USD) and category for one standard serving/unit of: "${itemName}".
            
            Context: The user is likely in Kenya or using international pricing.
            
            Return ONLY a JSON object:
            {
                "estimatedCost": 1.50,
                "category": "dairy" (Options: produce, meat, dairy, pantry, frozen, beverages, other),
                "unit": "liter" (or kg, bunch, item, etc)
            }
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonStr = text.replace(/```json|```/g, '').trim();
        const data = JSON.parse(jsonStr.match(/\{[\s\S]*\}/)[0]);

        res.json({ success: true, data });

    } catch (error) {
        console.error("Price Estimation Error:", error);
        // Fallback if AI fails (so the app doesn't crash)
        res.json({ 
            success: true, 
            data: { estimatedCost: 0, category: 'other', unit: 'item' } 
        });
    }
};