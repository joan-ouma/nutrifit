const { GoogleGenerativeAI } = require('@google/generative-ai');
const User = require('../models/User');
// ✅ CRITICAL FIX: Added these missing imports
const Meal = require('../models/Meal'); 
const DailyLog = require('../models/DailyLog');

require('dotenv').config();

// Initialize Gemini
const key = process.env.GEMINI_API_KEY;
const genAI = key ? new GoogleGenerativeAI(key) : null;

// ==========================================
// 1. GENERATE RECIPES (The AI Chef)
// ==========================================
exports.generateRecipes = async (req, res) => {
    try {
        const { pantry, cuisine, mealType, userGoal, maxCalories } = req.body;

        if (!pantry || !pantry.trim()) {
            return res.status(400).json({ success: false, error: 'Pantry ingredients are required' });
        }

        if (!genAI) {
            return res.status(500).json({ success: false, error: "Server Error: API Key Missing" });
        }

        // Using the model that worked for you in the logs
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
            You are a professional Michelin-star chef. Create 2 detailed recipes using these ingredients: ${pantry}.
            
            Preferences:
            - Cuisine: ${cuisine || 'Any'} (If 'Kenyan', suggest authentic dishes like Ugali, Sukuma Wiki, Chapati)
            - Type: ${mealType || 'Any'}
            - Goal: ${userGoal || 'Balanced'}
            ${maxCalories ? `- Max Calories: ${maxCalories}` : ''}

            CRITICAL RULES:
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
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonStr = text.replace(/```json|```/g, '').trim();
        const recipes = JSON.parse(jsonStr.match(/\[[\s\S]*\]/)[0]);

        res.json({ success: true, data: recipes });

    } catch (error) {
        console.error("❌ AI ERROR:", error);
        res.status(500).json({ success: false, error: `AI Error: ${error.message}` });
    }
};

// ==========================================
// 2. PERSONALIZED RECOMMENDATIONS (Fixed)
// ==========================================
exports.getPersonalizedRecommendations = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // ✅ THIS LINE CAUSED THE CRASH BEFORE (Meal was undefined)
        // Now it works because we imported Meal at the top
        const recentMeals = await Meal.find({ userId }).sort({ date: -1 }).limit(5);
        
        // Placeholder response for now to keep the app stable
        res.json({ 
            success: true, 
            message: "Personalized endpoint ready",
            context: {
                lastMeal: recentMeals[0]?.name || "None"
            }
        });

    } catch (error) {
        console.error("Personalized Error:", error.message);
        // Don't crash the server, just send error
        res.status(500).json({ success: false, error: error.message });
    }
};

// ==========================================
// 3. SMART GROCERY ESTIMATOR
// ==========================================
exports.estimateGroceryItem = async (req, res) => {
    try {
        const { itemName } = req.body;
        if (!itemName) return res.status(400).json({ error: "Item name required" });

        const fallbackPrice = (Math.random() * (4.5 - 1.5) + 1.5).toFixed(2);

        if (!genAI) {
            return res.json({ 
                success: true, 
                data: { estimatedCost: fallbackPrice, category: 'other', unit: 'item' } 
            });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
            Act as a grocery price database.
            Item: "${itemName}"
            Task: Estimate average global price (USD) and category.
            Return raw JSON only: { "estimatedCost": 2.50, "category": "produce", "unit": "kg" }
            Categories: produce, meat, dairy, pantry, frozen, beverages, other.
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanText = text.replace(/```json|```/g, '').trim();
        
        let data;
        try {
            data = JSON.parse(cleanText);
        } catch (e) {
            data = { estimatedCost: fallbackPrice, category: 'other', unit: 'item' };
        }

        res.json({ success: true, data });

    } catch (error) {
        console.error("Price Estimation Error:", error.message);
        res.json({ 
            success: true, 
            data: { estimatedCost: 2.99, category: 'other', unit: 'item' } 
        });
    }
};