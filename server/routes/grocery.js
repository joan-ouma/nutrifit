const express = require('express');
const router = express.Router();
const groceryController = require('../controllers/groceryController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/generate', groceryController.generateGroceryList);
router.get('/', groceryController.getGroceryLists);
router.get('/:id', groceryController.getGroceryList);
router.put('/:listId/item/:itemId', groceryController.updateGroceryItem);
router.delete('/:id', groceryController.deleteGroceryList);

module.exports = router;

