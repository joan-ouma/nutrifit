const express = require('express');
const router = express.Router();
const waterController = require('../controllers/waterController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/log', waterController.logWater);
router.get('/', waterController.getWaterIntake);

module.exports = router;

