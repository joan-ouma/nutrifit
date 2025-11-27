const GroceryList = require('../models/GroceryList');
const MealPlan = require('../models/MealPlan');
const Recipe = require('../models/Recipe');

/**
 * Generate grocery list from meal plan or recipes
 */
exports.generateGroceryList = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const { mealPlanId, recipeIds, name } = req.body;

        let items = [];
        const ingredientMap = {};

        // Get ingredients from meal plan
        if (mealPlanId) {
            const mealPlan = await MealPlan.findOne({ _id: mealPlanId, userId });
            if (mealPlan) {
                mealPlan.meals.forEach(meal => {
                    meal.ingredients?.forEach(ing => {
                        const key = ing.name?.toLowerCase() || ing.toLowerCase();
                        if (!ingredientMap[key]) {
                            ingredientMap[key] = {
                                name: ing.name || ing,
                                quantity: ing.amount || '1',
                                category: categorizeIngredient(ing.name || ing)
                            };
                        }
                    });
                });
            }
        }

        // Get ingredients from recipes
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
                        // Increase quantity if already exists
                        const currentQty = parseInt(ingredientMap[key].quantity) || 1;
                        ingredientMap[key].quantity = (currentQty + 1).toString();
                    }
                });
            });
        }

        // Convert to array
        items = Object.values(ingredientMap).map(item => ({
            ...item,
            estimatedCost: estimateCost(item.name, item.category)
        }));

        const totalEstimatedCost = items.reduce((sum, item) => sum + item.estimatedCost, 0);

        const groceryList = new GroceryList({
            userId,
            name: name || 'My Grocery List',
            items,
            totalEstimatedCost,
            mealPlanId: mealPlanId || null
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

