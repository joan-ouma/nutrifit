const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');

router.use(auth);

// Generate recipe via chat
router.post('/recipe', chatController.generateRecipeChat);

// General chat message
router.post('/message', chatController.chatMessage);

// Get chat history
router.get('/history', chatController.getChatHistory);

module.exports = router;

