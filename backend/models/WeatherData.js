const mongoose = require('mongoose');

const weatherDataSchema = new mongoose.Schema({
  city: String,
  timestamp: { type: Date, default: Date.now },
  temp: Number,
  feels_like: Number,
  main: String,
  dt: Number,
  date: String, // 'DD/MM/YYYY'
  time: String, // 'HH:MM:SS'
});

module.exports = mongoose.model('WeatherData', weatherDataSchema);
