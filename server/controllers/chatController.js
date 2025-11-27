const { GoogleGenerativeAI } = require('@google/generative-ai');
const ChatMessage = require('../models/ChatMessage');
const Recipe = require('../models/Recipe');
const User = require('../models/User');

// Initialize Gemini AI
const genAI = process.env.GEMINI_API_KEY 
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

/**
 * Generate recipe via chat
 */
exports.generateRecipeChat = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const { 
            ingredients, 
            dietaryRestrictions = [],
            cuisine = 'any',
            mealType = 'any',
            maxCalories,
            maxPrepTime,
            sessionId 
        } = req.body;

        if (!ingredients || ingredients.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Ingredients are required'
            });
        }

        // Get user preferences
        const user = await User.findById(userId);
        const userDietaryRestrictions = dietaryRestrictions.length > 0 
            ? dietaryRestrictions 
            : (user?.dietaryRestrictions || []);
        const userAllergies = user?.allergies || [];

        // Build prompt for recipe generation
        const ingredientsList = Array.isArray(ingredients) 
            ? ingredients.join(', ') 
            : ingredients;

        const prompt = `You are a professional chef and nutritionist. Generate 2-3 detailed recipes based on these ingredients: ${ingredientsList}.

${cuisine !== 'any' ? `Cuisine preference: ${cuisine}` : ''}
${mealType !== 'any' ? `Meal type: ${mealType}` : ''}
${maxCalories ? `Maximum calories per serving: ${maxCalories}` : ''}
${maxPrepTime ? `Maximum preparation time: ${maxPrepTime} minutes` : ''}
${userDietaryRestrictions.length > 0 ? `Dietary restrictions: ${userDietaryRestrictions.join(', ')}` : ''}
${userAllergies.length > 0 ? `Allergies to avoid: ${userAllergies.join(', ')}` : ''}

For each recipe, provide JSON format:
{
    "name": "Recipe Name",
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
    "whyItWorks": "Explanation",
    "missingIngredients": ["item1"],
    "image": "food image URL"
}

Return as JSON array.`;

        let recipes = [];
        let aiResponse = '';

        if (genAI) {
            try {
                const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();

                // Try to extract JSON
                const jsonMatch = text.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    recipes = JSON.parse(jsonMatch[0]);
                    aiResponse = `I've generated ${recipes.length} recipe${recipes.length > 1 ? 's' : ''} based on your preferences and ingredients!`;
                } else {
                    aiResponse = text;
                }
            } catch (error) {
                console.error('Gemini API error:', error);
                aiResponse = 'I encountered an error generating recipes. Please try again.';
            }
        }

        // Fallback recipes if AI fails
        if (recipes.length === 0) {
            recipes = [{
                name: 'Quick Recipe',
                ingredients: Array.isArray(ingredients) ? ingredients : ingredients.split(',').map(i => i.trim()),
                instructions: ['Prepare ingredients', 'Cook according to your preferences'],
                nutrition: {
                    calories: 400,
                    protein: 20,
                    carbs: 50,
                    fats: 10,
                    fiber: 5,
                    sugar: 5,
                    sodium: 500
                },
                time: '30 min',
                servingSize: '1 serving',
                costPerServing: '$5',
                matchScore: 85,
                whyItWorks: 'Uses your available ingredients',
                missingIngredients: [],
                image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'
            }];
            aiResponse = 'Here\'s a recipe suggestion based on your ingredients!';
        }

        // Save user message
        const userMessage = new ChatMessage({
            userId,
            sessionId: sessionId || `session_${Date.now()}`,
            role: 'user',
            message: `Generate recipes with: ${ingredientsList}`,
            messageType: 'ingredient_request',
            preferences: {
                dietaryRestrictions: userDietaryRestrictions,
                cuisine,
                mealType,
                maxCalories,
                maxPrepTime
            },
            ingredients: Array.isArray(ingredients) ? ingredients : ingredients.split(',').map(i => i.trim())
        });
        await userMessage.save();

        // Save assistant response
        const assistantMessage = new ChatMessage({
            userId,
            sessionId: userMessage.sessionId,
            role: 'assistant',
            message: aiResponse,
            messageType: 'recipe',
            preferences: userMessage.preferences,
            ingredients: userMessage.ingredients
        });
        await assistantMessage.save();

        res.json({
            success: true,
            message: aiResponse,
            recipes,
            sessionId: userMessage.sessionId
        });

    } catch (error) {
        next(error);
    }
};

/**
 * General chat (FAQ/Support)
 */
exports.chatMessage = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const { message, sessionId } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }

        // Save user message
        const userMsg = new ChatMessage({
            userId,
            sessionId: sessionId || `session_${Date.now()}`,
            role: 'user',
            message: message.trim(),
            messageType: 'question'
        });
        await userMsg.save();

        // Get context from recent messages
        const recentMessages = await ChatMessage.find({
            userId,
            sessionId: userMsg.sessionId
        }).sort({ timestamp: -1 }).limit(5);

        // Build context-aware prompt
        const context = recentMessages.reverse().map(msg => 
            `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.message}`
        ).join('\n');

        const prompt = `You are NutriFit's helpful AI assistant. You help users with:
- Nutrition and health questions
- How to use the app features
- Meal planning advice
- General support

Be friendly, concise, and helpful. If asked about recipes, guide them to use the recipe generator.

User question: ${message.trim()}

${context ? `\nPrevious conversation:\n${context}` : ''}

Provide a helpful response:`;

        let aiResponse = '';

        if (genAI) {
            try {
                const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                aiResponse = response.text();
            } catch (error) {
                console.error('Gemini API error:', error);
                aiResponse = getFallbackResponse(message);
            }
        } else {
            aiResponse = getFallbackResponse(message);
        }

        // Save assistant response
        const assistantMsg = new ChatMessage({
            userId,
            sessionId: userMsg.sessionId,
            role: 'assistant',
            message: aiResponse,
            messageType: 'text'
        });
        await assistantMsg.save();

        res.json({
            success: true,
            message: aiResponse,
            sessionId: userMsg.sessionId
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Get chat history
 */
exports.getChatHistory = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const { sessionId } = req.query;

        const query = { userId };
        if (sessionId) {
            query.sessionId = sessionId;
        }

        const messages = await ChatMessage.find(query)
            .sort({ timestamp: 1 })
            .limit(50);

        res.json({
            success: true,
            messages
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Fallback responses when AI is unavailable
 */
function getFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('recipe') || lowerMessage.includes('cook') || lowerMessage.includes('meal')) {
        return 'I can help you generate recipes! Use the recipe generator by selecting your preferences and entering your ingredients. Would you like me to guide you through it?';
    }

    if (lowerMessage.includes('calorie') || lowerMessage.includes('nutrition')) {
        return 'You can track your calories and nutrition in the Nutrition tab. Log your meals daily to see your progress and get personalized insights!';
    }

    if (lowerMessage.includes('leaderboard') || lowerMessage.includes('rank')) {
        return 'Check out the Leaderboard tab to see how you rank! Points are earned by logging meals, meeting calorie goals, and maintaining streaks.';
    }

    if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
        return 'I\'m here to help! You can ask me about recipes, nutrition tracking, meal planning, or any features of NutriFit. What would you like to know?';
    }

    return 'Thanks for your message! I\'m here to help with recipes, nutrition tracking, and meal planning. How can I assist you today?';
}

