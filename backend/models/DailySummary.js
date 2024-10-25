const mongoose = require('mongoose');

const dailySummarySchema = new mongoose.Schema({
  city: String,
  date: String, // 'YYYY-MM-DD'
  totalTemp: Number,
  count: Number,
  averageTemp: Number,
  maxTemp: Number,
  minTemp: Number,
  conditionCounts: { type: Map, of: Number }, // Map of condition to count
  dominantCondition: String,
  lastUpdated: { type: Date, default: Date.now }, // Add this field
});

module.exports = mongoose.model('DailySummary', dailySummarySchema);
