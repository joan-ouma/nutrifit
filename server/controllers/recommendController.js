const { GoogleGenerativeAI } = require('@google/generative-ai');
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
                const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
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
    return `You are a professional nutritionist and chef. Generate 3-5 personalized recipe recommendations.

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
        const userId = req.user?._id || req.user?.id;

        if (!pantry || !pantry.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Pantry ingredients are required'
            });
        }

        // Get user preferences if authenticated
        let user = null;
        if (userId) {
            user = await User.findById(userId);
        }

        const prompt = `You are a professional chef. Create 3 detailed recipes based on these ingredients: ${pantry}. 
        User goal: ${userGoal}, Budget: ${budget}.
        ${cuisine !== 'any' ? `Cuisine preference: ${cuisine}` : ''}
        ${mealType !== 'any' ? `Meal type: ${mealType}` : ''}
        ${maxCalories ? `Maximum calories per serving: ${maxCalories}` : ''}
        ${maxPrepTime ? `Maximum preparation time: ${maxPrepTime} minutes` : ''}
        ${dietaryRestrictions.length > 0 ? `Dietary restrictions: ${dietaryRestrictions.join(', ')}` : ''}
        ${user?.dietaryRestrictions?.length ? `Additional dietary restrictions: ${user.dietaryRestrictions.join(', ')}` : ''}
        ${user?.allergies?.length ? `Allergies to avoid: ${user.allergies.join(', ')}` : ''}
        
        For each recipe, provide:
        1. Recipe name
        2. List of ingredients (use what's available, note missing ingredients)
        3. Step-by-step instructions
        4. Estimated calories, protein (grams), carbs (grams), fats (grams), fiber (grams), sugar (grams), sodium (mg)
        5. Cooking time
        6. Cost per serving
        7. Why this recipe works for the user's goal
        8. Match score (0-100)
        
        Format as JSON array with this structure:
        [{
            "name": "Recipe Name",
            "ingredients": ["ingredient1", "ingredient2"],
            "instructions": ["step1", "step2"],
            "nutrition": {"calories": 400, "protein": 20, "carbs": 50, "fats": 10, "fiber": 5, "sugar": 8, "sodium": 600},
            "time": "30 min",
            "servingSize": "1 serving",
            "costPerServing": "$5",
            "matchScore": 90,
            "whyItWorks": "Explanation",
            "missingIngredients": ["item1", "item2"],
            "image": "food image URL"
        }]`;

        let recipes = [];

        if (genAI) {
            try {
                const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();

                const jsonMatch = text.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    recipes = JSON.parse(jsonMatch[0]);
                }
            } catch (error) {
                console.error('Gemini API error:', error);
            }
        }

        if (recipes.length === 0) {
            recipes = [
                {
                    name: 'Quick Pantry Pasta',
                    ingredients: pantry.split(',').map(i => i.trim()),
                    instructions: [
                        'Boil pasta according to package directions',
                        'Heat olive oil in a pan',
                        'Add ingredients and cook for 5 minutes',
                        'Combine with pasta and serve'
                    ],
                    nutrition: {
                        calories: 450,
                        protein: 15,
                        carbs: 60,
                        fats: 12,
                        fiber: 3,
                        sugar: 5,
                        sodium: 500
                    },
                    time: '20 min',
                    servingSize: '1 serving',
                    costPerServing: '$4',
                    matchScore: 85,
                    whyItWorks: 'Uses all your pantry ingredients efficiently',
                    missingIngredients: [],
                    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800'
                }
            ];
        }

        res.json({
            success: true,
            data: Array.isArray(recipes) ? recipes : [recipes]
        });

    } catch (error) {
        next(error);
    }
};

