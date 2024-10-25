const axios = require("axios");
const cron = require("node-cron");
const DailySummary = require("../models/DailySummary");
const Threshold = require("../models/Threshold");
// const Alert = require('../models/Alert');
const nodemailer = require("nodemailer");
require("dotenv").config();

const API_KEY = process.env.OPENWEATHER_API_KEY;
const cities = [
  { name: "Delhi", lat: 28.7041, lon: 77.1025 },
  { name: "Mumbai", lat: 19.0760, lon: 72.8777 },
  { name: "Chennai", lat: 13.0827, lon: 80.2707 },
  { name: "Bangalore", lat: 12.9716, lon: 77.5946 },
  { name: "Kolkata", lat: 22.5726, lon: 88.3639 },
  { name: "Hyderabad", lat: 17.3850, lon: 78.4867 },
];


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendThresholdAlertEmail = async (alertData) => {
  console.log('this is sendThresholdAlertEmail : ',alertData);
  try {
    const {
      email,
      city,
      temperature,
      condition,
      thresholdTemp,
      thresholdCondition,
    } = alertData;

    const message = `
Weather Alert for ${city}!

Current Weather:
- Temperature: ${temperature.toFixed(2)}°C
- Condition: ${condition}

Your Alert Thresholds:
- Temperature: ${thresholdTemp}°C
- Condition: ${thresholdCondition}

This alert was triggered because the current weather has exceeded your set thresholds.
    `;
    console.log(message);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Weather Alert for ${city}`,
      text: message,
    };
    // console.log('mail options : ', mailOptions);

    const info = await transporter.sendMail(mailOptions);
    console.log("Alert email sent:", info.response);
    return true;
  } catch (error) {
    console.error("Error sending alert email:", error.message);
    return false;
  }
};

// Function to get city by name
exports.getCityByName = (cityName) => {
  return cities.find(
    (city) => city.name.toLowerCase() === cityName.toLowerCase()
  );
};

const fetchWeatherData = async () => {
  for (let city of cities) {
    try {
      console.log(`Fetching data for ${city.name}`);
      const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${city.lat}&lon=${city.lon}&appid=${API_KEY}`;
      const response = await axios.get(url);
      const data = response.data;

      const temp = data.current.temp - 273.15; 
      const main = data.current.weather[0].main;
      const dt = data.current.dt;

      const dateTimeUTC = new Date(dt * 1000);
      const dateTimeIST = new Date(
        dateTimeUTC.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
      );
      const dateIST = dateTimeIST.toISOString().split("T")[0]; 

      const date = dateIST; 

      await updateDailySummary(city.name, date, temp, main);

      
    } catch (error) {
      console.error(
        `Error fetching weather data for ${city.name}:`,
        error.response ? error.response.data : error.message
      );
    }
  }
};

const updateDailySummary = async (cityName, date, temp, condition) => {
  try {
    let summary = await DailySummary.findOne({ city: cityName, date });

    if (summary) {
      summary.totalTemp += temp;
      summary.count += 1;
      summary.averageTemp = summary.totalTemp / summary.count;

      if (temp > summary.maxTemp) {
        summary.maxTemp = temp;
      }

      if (temp < summary.minTemp) {
        summary.minTemp = temp;
      }

      let conditionCounts = summary.conditionCounts || {};
      conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
      summary.conditionCounts = conditionCounts;

      // Determine dominantCondition
      let dominantCondition = Object.keys(conditionCounts).reduce((a, b) =>
        conditionCounts[a] > conditionCounts[b] ? a : b
      );
      summary.dominantCondition = dominantCondition;

      // Update lastUpdated timestamp
      summary.lastUpdated = new Date();

      await summary.save();
    } else {
      // Create new summary
      let conditionCounts = {};
      conditionCounts[condition] = 1;

      let summary = new DailySummary({
        city: cityName,
        date,
        totalTemp: temp,
        count: 1,
        averageTemp: temp,
        maxTemp: temp,
        minTemp: temp,
        conditionCounts: conditionCounts,
        dominantCondition: condition,
        lastUpdated: new Date(), 
      });

      await summary.save();
    }
  } catch (error) {
    console.error(
      `Error updating daily summary for ${cityName} on ${date}:`,
      error.message
    );
  }
};

exports.updateDailySummary = updateDailySummary;
// exports.checkThresholds = checkThresholds;

exports.getDailySummary = async (city) => {
  const summaries = await DailySummary.find({ city })
    .sort({ date: -1 })
    .limit(7)
    .lean();

  return summaries;
};

exports.startFetchingData = () => {
  fetchWeatherData();
  cron.schedule("*/5 * * * *", fetchWeatherData);
};
