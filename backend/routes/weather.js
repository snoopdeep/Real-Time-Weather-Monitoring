const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');

router.get('/current/:city', weatherController.getCurrentWeather);
router.get('/daily-summary/:city', weatherController.getDailySummary);
router.get('/get-threshold/:city', weatherController.getThreshold);
router.post('/send-alert', weatherController.sendAlert);
router.post('/set-threshold', weatherController.setThreshold);

module.exports = router;