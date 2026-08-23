const GroceryList = require('../models/GroceryList');
const MealPlan = require('../models/MealPlan');
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Generate grocery list from meal plan, recipes, or AI
 */
exports.generateGroceryList = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const { mealPlanId, recipeIds, name } = req.body;

        let items = [];
        const ingredientMap = {};

        let targetMealPlanId = mealPlanId;

        // Auto-find latest meal plan if not provided
        if (!targetMealPlanId && (!recipeIds || recipeIds.length === 0)) {
            const latestMealPlan = await MealPlan.findOne({ userId, isActive: true }).sort({ startDate: -1 });
            if (latestMealPlan) {
                targetMealPlanId = latestMealPlan._id;
            }
        }

        // Fetch user for pantry, goals, and history
        const user = await User.findById(userId).populate('favoriteRecipes');
        const userPantry = (user?.pantry || []).map(i => i.toLowerCase());

        // 1. Get ingredients from meal plan
        if (targetMealPlanId) {
            const mealPlan = await MealPlan.findOne({ _id: targetMealPlanId, userId });
            if (mealPlan) {
                mealPlan.meals.forEach(meal => {
                    meal.ingredients?.forEach(ing => {
                        const ingName = typeof ing === 'string' ? ing : ing.name || ing;
                        const key = ingName.toLowerCase();
                        if (!ingredientMap[key]) {
                            ingredientMap[key] = {
                                name: ingName,
                                quantity: ing.amount || '1',
                                category: categorizeIngredient(ingName)
                            };
                        } else {
                            const currentQty = parseInt(ingredientMap[key].quantity) || 1;
                            ingredientMap[key].quantity = (currentQty + 1).toString();
                        }
                    });
                });
            }
        }

        // 2. Get ingredients from recipes
        if (recipeIds && recipeIds.length > 0) {
            const recipes = await Recipe.find({ _id: { $in: recipeIds }, userId });
            recipes.forEach(recipe => {
                recipe.ingredients?.forEach(ing => {
                    const ingName = typeof ing === 'string' ? ing : ing.name || ing;
                    const key = ingName.toLowerCase();
                    if (!ingredientMap[key]) {
                        ingredientMap[key] = {
                            name: ingName,
                            quantity: '1',
                            category: categorizeIngredient(ingName)
                        };
                    } else {
                        const currentQty = parseInt(ingredientMap[key].quantity) || 1;
                        ingredientMap[key].quantity = (currentQty + 1).toString();
                    }
                });
            });
        }

        // Convert ingredient map to array
        items = Object.values(ingredientMap).map(item => ({
            ...item,
            estimatedCost: estimateCost(item.name, item.category)
        }));

        // 3. AI GENERATION IF NO ITEMS FOUND (Or if everything was already in pantry)
        if (items.length === 0) {
            const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
            
            if (genAI) {
                const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
                
                const favoriteMeals = user?.favoriteRecipes?.map(r => r.name).join(', ') || 'No specific history';
                const currentPantryStr = user?.pantry?.join(', ') || 'Empty';
                
                const prompt = `
                    Act as a professional nutritionist and smart shopper. 
                    The user's goal is ${user?.goals || 'balanced'}. 
                    Their current pantry contains: [${currentPantryStr}].
                    Their favorite meals/history: [${favoriteMeals}].
                    
                    Task: Generate a healthy weekly grocery list of exactly 12 items they should BUY.
                    Focus on complementary items they need to finish making full meals based on what they already have.
                    It is okay to suggest items they already have if they are staples they might need to restock.
                    If their pantry is completely empty, suggest essential foundational staples based on their goals and history.
                    
                    Return ONLY a JSON array of objects. Format exactly like this:
                    [
                        { "name": "Item Name", "quantity": "amount (e.g., 2 lbs)", "category": "produce/meat/dairy/pantry/frozen/other" }
                    ]
                `;
                
                try {
                    const result = await model.generateContent(prompt);
                    let text = result.response.text().trim();
                    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
                    const aiItems = JSON.parse(text);
                    
                    items = aiItems.map(item => ({
                        name: item.name,
                        quantity: item.quantity,
                        category: categorizeIngredient(item.category || item.name),
                        estimatedCost: estimateCost(item.name, item.category || item.name)
                    }));
                } catch(e) {
                    console.error("AI Parse Error:", e);
                    items = [
                        { name: 'Oats', quantity: '1 box', category: 'pantry', estimatedCost: 3 },
                        { name: 'Chicken Breast', quantity: '2 lbs', category: 'meat', estimatedCost: 10 },
                        { name: 'Broccoli', quantity: '2 heads', category: 'produce', estimatedCost: 4 }
                    ];
                }
            } else {
                items = [
                    { name: 'Brown Rice', quantity: '1 bag', category: 'pantry', estimatedCost: 4 },
                    { name: 'Eggs', quantity: '1 dozen', category: 'dairy', estimatedCost: 3 },
                    { name: 'Spinach', quantity: '1 bunch', category: 'produce', estimatedCost: 2 }
                ];
            }
        }

        const totalEstimatedCost = items.reduce((sum, item) => sum + item.estimatedCost, 0);

        const groceryList = new GroceryList({
            userId,
            name: name || 'Auto-Generated Plan',
            items,
            totalEstimatedCost,
            mealPlanId: targetMealPlanId || null
        });

        await groceryList.save();

        res.status(201).json({
            success: true,
            data: groceryList
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user's grocery lists
 */
exports.getGroceryLists = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const lists = await GroceryList.find({ userId })
            .sort({ createdAt: -1 })
            .limit(20);

        res.json({
            success: true,
            data: lists
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get single grocery list
 */
exports.getGroceryList = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const { id } = req.params;

        const list = await GroceryList.findOne({ _id: id, userId });
        if (!list) {
            return res.status(404).json({ error: 'Grocery list not found' });
        }

        res.json({
            success: true,
            data: list
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update grocery list item
 */
exports.updateGroceryItem = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const { listId, itemId } = req.params;
        const updates = req.body;

        const list = await GroceryList.findOne({ _id: listId, userId });
        if (!list) {
            return res.status(404).json({ error: 'Grocery list not found' });
        }

        const item = list.items.id(itemId);
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        Object.assign(item, updates);
        await list.save();

        res.json({
            success: true,
            data: list
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete grocery list
 */
exports.deleteGroceryList = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const { id } = req.params;

        await GroceryList.findOneAndDelete({ _id: id, userId });

        res.json({
            success: true,
            message: 'Grocery list deleted'
        });
    } catch (error) {
        next(error);
    }
};

// Helper functions
function categorizeIngredient(ingredient) {
    const ing = ingredient.toLowerCase();
    if (ing.match(/(chicken|beef|pork|fish|turkey|meat)/)) return 'meat';
    if (ing.match(/(milk|cheese|yogurt|butter|cream)/)) return 'dairy';
    if (ing.match(/(apple|banana|orange|berry|vegetable|lettuce|tomato|onion)/)) return 'produce';
    if (ing.match(/(frozen|ice)/)) return 'frozen';
    if (ing.match(/(juice|soda|water|drink)/)) return 'beverages';
    return 'pantry';
}

function estimateCost(itemName, category) {
    // Simple cost estimation (in USD)
    const baseCosts = {
        produce: 2.5,
        meat: 8.0,
        dairy: 4.0,
        pantry: 3.0,
        frozen: 4.5,
        beverages: 2.0,
        other: 3.0
    };
    return baseCosts[category] || 3.0;
}

