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
  { name: "Mumbai", lat: 19.076, lon: 72.8777 },
  { name: "Chennai", lat: 13.0827, lon: 80.2707 },
  { name: "Bangalore", lat: 12.9716, lon: 77.5946 },
  { name: "Kolkata", lat: 22.5726, lon: 88.3639 },
  { name: "Hyderabad", lat: 17.385, lon: 78.4867 },
];

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendThresholdAlertEmail = async (alertData) => {
  // console.log("this is sendThresholdAlertEmail : ", alertData);
  try {
    const {
      email,
      city,
      temperature,
      condition,
      thresholdTemp,
      thresholdCondition,
    } = alertData;

    // Determine if temperature and condition thresholds are set
    const tempThresholdSet = thresholdTemp != null;
    const conditionThresholdSet =
      thresholdCondition != null && thresholdCondition !== "";

    // Construct the HTML message with inline styling
    const messageHtml = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; color: #333333;">
  <div style="padding: 20px;">
    <p>Dear User,</p>

    <p>We wanted to inform you that the current weather conditions in <strong>${city}</strong> have met your alert criteria.</p>

    <div style="margin-bottom: 20px;">
      <h3 style="color: #333333;">Current Weather in ${city}:</h3>
      <ul style="list-style-type: none; padding: 0;">
        <li style="margin-bottom: 5px;"><strong>Temperature:</strong> ${temperature.toFixed(
          2
        )}°C</li>
        <li style="margin-bottom: 5px;"><strong>Condition:</strong> ${condition}</li>
      </ul>
    </div>

    <div style="margin-bottom: 20px;">
      <h3 style="color: #333333;">Your Alert Settings:</h3>
      <ul style="list-style-type: none; padding: 0;">
        ${
          tempThresholdSet
            ? `<li style="margin-bottom: 5px;"><strong>Temperature Threshold:</strong> ${thresholdTemp}°C</li>`
            : ""
        }
        ${
          conditionThresholdSet
            ? `<li style="margin-bottom: 5px;"><strong>Condition Threshold:</strong> ${thresholdCondition}</li>`
            : ""
        }
      </ul>
    </div>

    <p style="color: #ff0000; font-weight: bold;">
      ${
        tempThresholdSet &&
        (temperature > thresholdTemp || temperature < thresholdTemp)
          ? `The current temperature of ${temperature.toFixed(2)}°C ${
              temperature > thresholdTemp ? "exceeds" : "is below"
            } your set threshold of ${thresholdTemp}°C.<br>`
          : ""
      }
      ${
        conditionThresholdSet &&
        condition.toLowerCase() === thresholdCondition.toLowerCase()
          ? `The current weather condition matches your alert condition of "${thresholdCondition}".`
          : ""
      }
    </p>

    <p>Please take any necessary precautions based on this information.</p>

    <p>Thank you for using our Weather Alert Service.</p>

    <p>Best regards,<br/>
     RealTimeWeatherAnalysis.co</p>
  </div>
</body>
</html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Weather Alert for ${city}`,
      // text: messageText,
      html: messageHtml,
    };

    const info = await transporter.sendMail(mailOptions);
    // console.log("Alert email sent:", info.response);
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
      // console.log(`Fetching data for ${city.name}`);
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
