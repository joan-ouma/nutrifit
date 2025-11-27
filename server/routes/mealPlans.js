const express = require('express');
const router = express.Router();
const mealPlanController = require('../controllers/mealPlanController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', mealPlanController.createMealPlan);
router.post('/generate', mealPlanController.generateMealPlan);
router.get('/', mealPlanController.getMealPlans);
router.get('/:id', mealPlanController.getMealPlan);
router.put('/:id', mealPlanController.updateMealPlan);
router.delete('/:id', mealPlanController.deleteMealPlan);

module.exports = router;

