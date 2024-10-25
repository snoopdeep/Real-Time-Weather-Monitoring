const express = require('express');
const mongoose = require('mongoose');
const weatherRouter = require('./routes/weather');
const dbConfig = require('./config/db');
require('dotenv').config();
const weatherService = require('./services/weatherService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Routes
app.use('/api/weather', weatherRouter);
// console.log(process.env.MONGODB_URI);

// Connect to MongoDB
mongoose.connect(dbConfig.url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
  // Start fetching weather data after successful DB connection
  weatherService.startFetchingData();
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
