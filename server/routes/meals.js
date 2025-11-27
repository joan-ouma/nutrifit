const express = require('express');
const router = express.Router();
const mealController = require('../controllers/mealController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Log a meal
router.post('/', mealController.logMeal);

// Get meals for a specific date
router.get('/date/:date', mealController.getMealsByDate);

// Get weekly summary
router.get('/weekly', mealController.getWeeklySummary);

// Get nutrition insights
router.get('/insights', mealController.getNutritionInsights);

// Update meal
router.put('/:mealId', mealController.updateMeal);

// Delete meal
router.delete('/:mealId', mealController.deleteMeal);

module.exports = router;

