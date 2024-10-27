// weatherController.js
const axios = require("axios");
const weatherService = require("../services/weatherService");
const Threshold = require("../models/Threshold");
require("dotenv").config();

const API_KEY = process.env.OPENWEATHER_API_KEY;

exports.getCurrentWeather = async (req, res) => {
  const cityName = req.params.city;

  try {
    const city = weatherService.getCityByName(cityName);

    if (!city) {
      return res.status(404).json({ error: "City not found" });
    }

    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${city.lat}&lon=${city.lon}&appid=${API_KEY}`;
    const response = await axios.get(url);
    const data = response.data;

    // Current weather data
    const temp = data.current.temp - 273.15;
    const feels_like = data.current.feels_like - 273.15;
    const main = data.current.weather[0].main;
    const humidity = data.current.humidity;
    const wind_speed = data.current.wind_speed;
    const pressure = data.current.pressure;
    const dt = data.current.dt;
    const sunrise = data.current.sunrise;
    const sunset = data.current.sunset;

    const dateTimeUTC = new Date(dt * 1000);
    const dateTimeIST = new Date(
      dateTimeUTC.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );
    const dateIST = dateTimeIST.toISOString().split("T")[0];
    const timeIST = dateTimeIST.toTimeString().split(" ")[0];

    const currentWeather = {
      city: city.name,
      temp,
      feels_like,
      main,
      dt,
      date: dateIST,
      time: timeIST,
      humidity,
      wind_speed,
      pressure,
      sunrise,
      sunset,
    };

    // Hourly forecast
    const hourlyForecast = data.hourly.map((hour) => {
      const hourTimeUTC = new Date(hour.dt * 1000);
      const hourTimeIST = new Date(
        hourTimeUTC.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
      );
      const timeIST = hourTimeIST.toTimeString().split(" ")[0];

      return {
        dt: hour.dt,
        time: timeIST,
        temp: hour.temp - 273.15,
        feels_like: hour.feels_like - 273.15,
        pressure: hour.pressure,
        humidity: hour.humidity,
        wind_speed: hour.wind_speed,
        weather: hour.weather,
        pop: hour.pop,
      };
    });

    // Daily forecast
    const dailyForecast = data.daily.map((day) => {
      const dateUTC = new Date(day.dt * 1000);
      const dateIST = new Date(
        dateUTC.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
      );
      const dateString = dateIST.toISOString().split("T")[0];

      return {
        dt: day.dt,
        date: dateString,
        sunrise: day.sunrise,
        sunset: day.sunset,
        summary: day.summary,
        temp: {
          day: day.temp.day - 273.15,
          min: day.temp.min - 273.15,
          max: day.temp.max - 273.15,
          night: day.temp.night - 273.15,
          eve: day.temp.eve - 273.15,
          morn: day.temp.morn - 273.15,
        },
        feels_like: {
          day: day.feels_like.day - 273.15,
          night: day.feels_like.night - 273.15,
          eve: day.feels_like.eve - 273.15,
          morn: day.feels_like.morn - 273.15,
        },
        pressure: day.pressure,
        humidity: day.humidity,
        wind_speed: day.wind_speed,
        weather: day.weather,
        pop: day.pop,
      };
    });

    await weatherService.updateDailySummary(city.name, dateIST, temp, main);

    const threshold = await Threshold.findOne({ city: city.name });
    if (threshold) {
      let alertMessage = "";
      if (temp > threshold.temperature || main === threshold.condition) {
        alertMessage = `Threshold exceeded! Temp: ${temp.toFixed(
          2
        )}°C, Condition: ${main}`;
        await weatherService.sendThresholdAlertEmail(threshold, temp, main);
      }
      res.json({
        currentWeather,
        hourlyForecast,
        dailyForecast,
        thresholdExceeded: true,
        alertMessage,
      });
    } else {
      res.json({
        currentWeather,
        hourlyForecast,
        dailyForecast,
      });
    }
  } catch (err) {
    console.error(
      `Error fetching current weather for ${cityName}:`,
      err.message
    );
    res.status(500).json({ error: err.message });
  }
};

exports.getThreshold = async (req, res) => {
  const cityName = req.params.city;
  try {
    const threshold = await Threshold.find({ city: cityName });
    if (threshold) {
      res.json(threshold);
    } else {
      res.status(200).json({ error: "No threshold set for this city" });
    }
  } catch (err) {
    console.error(`Error fetching threshold for ${cityName}:`, err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.sendAlert = async (req, res) => {
  // console.log("This is send alert : ", req.body);
  const {
    email,
    city,
    temperature,
    condition,
    thresholdTemp,
    thresholdCondition,
  } = req.body;
  try {
    const emailResult = await weatherService.sendThresholdAlertEmail({
      email,
      city,
      temperature,
      condition,
      thresholdTemp,
      thresholdCondition,
    });

    if (emailResult) {
      res.json({ message: "Alert email sent successfully" });
    } else {
      throw new Error("Failed to send alert email");
    }
  } catch (err) {
    console.error("Error sending alert:", err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.setThreshold = async (req, res) => {
  const { email, city, temperature, condition } = req.body;
  try {
    let threshold = await Threshold.findOne({ email, city });
    if (threshold) {
      threshold.temperature = temperature;
      threshold.condition = condition;
      await threshold.save();
    } else {
      threshold = new Threshold({ email, city, temperature, condition });
      await threshold.save();
    }
    res.json({ message: "Thresholds updated", threshold });
  } catch (err) {
    console.error(`Error setting thresholds:`, err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.getDailySummary = async (req, res) => {
  const city = req.params.city;
  try {
    const summaries = await weatherService.getDailySummary(city);
    res.json(summaries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
