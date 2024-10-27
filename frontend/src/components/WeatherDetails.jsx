// export default WeatherDetails;
import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import "./WeatherDetails.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function WeatherDetails({ city }) {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [dailyForecast, setDailyForecast] = useState([]);
  const [summary, setSummary] = useState([]);
  const [alert, setAlert] = useState(null);
  const [threshold, setThreshold] = useState(null);
  const [emailAlert, setEmailAlert] = useState(false);

  const [selectedForecastType, setSelectedForecastType] = useState("Hourly");
  const [hourlySummaryText, setHourlySummaryText] = useState("");
  const [dailySummaryText, setDailySummaryText] = useState("");

  const [tempUnit, setTempUnit] = useState("C");

  const fetchCurrentWeatherRef = useRef();
  const fetchSummaryRef = useRef();

  const API_URL = import.meta.env.VITE_API_URL;

  const convertTemp = (temp) => {
    return tempUnit === "C" ? temp : temp * 1.8 + 32;
  };

  const tempUnitSymbol = tempUnit === "C" ? "°C" : "°F";

  // Generate hourly forecast summary
  const generateHourlySummary = (hourlyData) => {
    if (!hourlyData || hourlyData.length === 0) {
      setHourlySummaryText("No hourly forecast data available.");
      return;
    }

    const temps = hourlyData.map((hour) => hour.temp);
    const humidities = hourlyData.map((hour) => hour.humidity);
    const windSpeeds = hourlyData.map((hour) => hour.wind_speed);
    const pressures = hourlyData.map((hour) => hour.pressure);
    const conditions = hourlyData.map((hour) => hour.weather[0].description);

    const maxTemp = convertTemp(Math.max(...temps)).toFixed(2);
    const minTemp = convertTemp(Math.min(...temps)).toFixed(2);
    const avgHumidity = (
      humidities.reduce((a, b) => a + b, 0) / humidities.length
    ).toFixed(2);
    const maxWindSpeed = Math.max(...windSpeeds).toFixed(2);
    const avgPressure = (
      pressures.reduce((a, b) => a + b, 0) / pressures.length
    ).toFixed(2);

    const conditionFrequency = {};
    conditions.forEach((condition) => {
      conditionFrequency[condition] = (conditionFrequency[condition] || 0) + 1;
    });
    const dominantCondition = Object.keys(conditionFrequency).reduce((a, b) =>
      conditionFrequency[a] > conditionFrequency[b] ? a : b
    );

    const summaryText = `Over the next ${hourlyData.length} hours, expect temperatures ranging from ${minTemp}${tempUnitSymbol} to ${maxTemp}${tempUnitSymbol}. The average humidity will be around ${avgHumidity}%. The wind speed may reach up to ${maxWindSpeed} m/s. The dominant weather condition will be ${dominantCondition}.`;

    setHourlySummaryText(summaryText);
  };

  // Generate daily forecast summary
  const generateDailySummary = (dailyData) => {
    if (!dailyData || dailyData.length === 0) {
      setDailySummaryText("No daily forecast data available.");
      return;
    }

    const temps = dailyData.map((day) => day.temp.day);
    const humidities = dailyData.map((day) => day.humidity);
    const windSpeeds = dailyData.map((day) => day.wind_speed);
    const pressures = dailyData.map((day) => day.pressure);
    const conditions = dailyData.map((day) => day.weather[0].description);

    const maxTemp = convertTemp(Math.max(...temps)).toFixed(2);
    const minTemp = convertTemp(Math.min(...temps)).toFixed(2);
    const avgHumidity = (
      humidities.reduce((a, b) => a + b, 0) / humidities.length
    ).toFixed(2);
    const maxWindSpeed = Math.max(...windSpeeds).toFixed(2);
    const avgPressure = (
      pressures.reduce((a, b) => a + b, 0) / pressures.length
    ).toFixed(2);

    const conditionFrequency = {};
    conditions.forEach((condition) => {
      conditionFrequency[condition] = (conditionFrequency[condition] || 0) + 1;
    });
    const dominantCondition = Object.keys(conditionFrequency).reduce((a, b) =>
      conditionFrequency[a] > conditionFrequency[b] ? a : b
    );

    const summaryText = `Over the next ${dailyData.length} days, expect temperatures ranging from ${minTemp}${tempUnitSymbol} to ${maxTemp}${tempUnitSymbol}. The average humidity will be around ${avgHumidity}%. The wind speed may reach up to ${maxWindSpeed} m/s. The dominant weather condition will be ${dominantCondition}.`;

    setDailySummaryText(summaryText);
  };

  const checkThresholdAndAlert = useCallback(
    async (weatherData) => {
      try {
        const thresholdRes = await axios.get(
          `${API_URL}/api/weather/get-threshold/${city.toLowerCase()}`
        );

        if (thresholdRes) {
          const thresholdDataArray = thresholdRes.data;
          setThreshold(thresholdDataArray);

          let anyAlertTriggered = false;
          let alertMessages = [];

          for (const thresholdData of thresholdDataArray) {
            const isTemperatureExceeded =
              thresholdData.temperature != null &&
              weatherData.temp > thresholdData.temperature;
            const isConditionMatched =
              thresholdData.condition &&
              weatherData.main.toLowerCase() === thresholdData.condition.toLowerCase();

            if (isTemperatureExceeded || isConditionMatched) {
              anyAlertTriggered = true;
              const alertMessage = `Weather Alert for ${thresholdData.email}! ${
                isTemperatureExceeded
                  ? `Temperature (${weatherData.temp.toFixed(
                      2
                    )}°C) exceeds threshold (${thresholdData.temperature}°C). `
                  : ""
              }${
                isConditionMatched
                  ? `Weather condition (${weatherData.main}) matches alert condition (${thresholdData.condition}).`
                  : ""
              }`;

              alertMessages.push(alertMessage);

              await axios.post(`${API_URL}/api/weather/send-alert`, {
                email: thresholdData.email,
                city: city,
                temperature: weatherData.temp,
                condition: weatherData.main,
                thresholdTemp: thresholdData.temperature,
                thresholdCondition: thresholdData.condition,
              });
            }
          }

          if (anyAlertTriggered) {
            setAlert(alertMessages.join("\n"));
            setTimeout(() => setAlert(null), 10000);

            setEmailAlert(true);
            setTimeout(() => setEmailAlert(false), 5000);
          }
        }
      } catch (err) {
        console.error("Error checking thresholds:", err);
      }
    },
    [city]
  );

  const fetchCurrentWeather = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/weather/current/${city}`);
      setCurrentWeather(res.data.currentWeather);
      setHourlyForecast(res.data.hourlyForecast);
      setDailyForecast(res.data.dailyForecast);
      generateHourlySummary(res.data.hourlyForecast);
      generateDailySummary(res.data.dailyForecast);
      await checkThresholdAndAlert(res.data.currentWeather);
    } catch (err) {
      console.error(err);
    }
  }, [city, checkThresholdAndAlert]);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/weather/daily-summary/${city}`);
      setSummary(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [city]);

  useEffect(() => {
    fetchCurrentWeatherRef.current = fetchCurrentWeather;
    fetchSummaryRef.current = fetchSummary;
  }, [fetchCurrentWeather, fetchSummary]);

  useEffect(() => {
    fetchCurrentWeather();
    fetchSummary();

    const intervalFunction = () => {
      fetchCurrentWeatherRef.current();
      fetchSummaryRef.current();
    };

    const interval = setInterval(intervalFunction, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [city]);

  if (!currentWeather) {
    return <div>Loading...</div>;
  }

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  const formatTime = (dt) => {
    const date = new Date(dt * 1000);
    return date.toLocaleTimeString("en-US", { timeZone: "Asia/Kolkata" });
  };

  const formatTimeHM = (dt) => {
    const date = new Date(dt * 1000);
    return date.toLocaleTimeString("en-US", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  let chartData = [];
  let xAxisKey = "";
  let summaryText = "";
  if (selectedForecastType === "Hourly") {
    chartData = hourlyForecast.map((hour) => ({
      time: formatTimeHM(hour.dt),
      temp: parseFloat(convertTemp(hour.temp).toFixed(2)),
      humidity: hour.humidity,
      wind_speed: hour.wind_speed,
      pressure: hour.pressure,
    }));
    xAxisKey = "time";
    summaryText = hourlySummaryText;
  } else if (selectedForecastType === "Daily") {
    chartData = dailyForecast.map((day) => ({
      date: formatDate(day.date),
      temp: parseFloat(convertTemp(day.temp.day).toFixed(2)),
      humidity: day.humidity,
      wind_speed: day.wind_speed,
      pressure: day.pressure,
    }));
    xAxisKey = "date";
    summaryText = dailySummaryText;
  }

  const currentTemp = convertTemp(currentWeather.temp).toFixed(2);
  const currentFeelsLike = convertTemp(currentWeather.feels_like).toFixed(2);

  const convertedSummary = summary.map((day) => ({
    ...day,
    averageTemp: convertTemp(day.averageTemp),
    maxTemp: convertTemp(day.maxTemp),
    minTemp: convertTemp(day.minTemp),
  }));

  return (
    <div className={`weather-details-container ${alert ? "alert-active" : ""}`}>
      {alert && <div className="alert-message">{alert}</div>}
      {emailAlert && (
        <div className="email-alert">
          Email notification has been sent to the user.
        </div>
      )}
      <div className="weather-header">
        <h2 className="city-name">{city}</h2>
        <button
          className="temp-toggle-button"
          onClick={() =>
            setTempUnit((prevUnit) => (prevUnit === "C" ? "F" : "C"))
          }
        >
          {tempUnit === "C" ? "°F" : "°C"}
        </button>
        <div className="sun-times">
          <div className="sunrise">
            <img className="icons" src="/sunrise.png" alt="Sunrise" />
            <span>{formatTimeHM(currentWeather.sunrise)} IST</span>
          </div>
          <div className="sunset">
            <img className="icons" src="/sunset.png" alt="Sunset" />
            <span>{formatTimeHM(currentWeather.sunset)} IST</span>
          </div>
        </div>
        <div className="date-time">
          <p>Date: {formatDate(currentWeather.date)}</p>
          <p>Time: {formatTime(currentWeather.dt)} IST</p>
        </div>
      </div>
      <div className="weather-info">
        <p>
          Temperature: <br /> {currentTemp}
          {tempUnitSymbol} 🌡️
        </p>
        <p>
          Feels Like: <br /> {currentFeelsLike}
          {tempUnitSymbol} 😊
        </p>
        <p>
          Condition:
          <br /> {currentWeather.main} 🌫️
        </p>
        <p>
          Humidity:
          <br /> {currentWeather.humidity}% 💧
        </p>
        <p>
          Wind Speed:
          <br /> {currentWeather.wind_speed} m/s 🌬️
        </p>
        <p>
          Pressure:
          <br /> {currentWeather.pressure} hPa 📈
        </p>
      </div>

      <h3>Daily Summary</h3>
      <table className="daily-summary-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Avg Temp ({tempUnitSymbol})</th>
            <th>Max Temp ({tempUnitSymbol})</th>
            <th>Min Temp ({tempUnitSymbol})</th>
            <th>Dominant Condition</th>
          </tr>
        </thead>
        <tbody>
          {convertedSummary.map((day) => (
            <tr key={day.date}>
              <td>{formatDate(day.date)}</td>
              <td>{day.averageTemp.toFixed(2)}</td>
              <td>{day.maxTemp.toFixed(2)}</td>
              <td>{day.minTemp.toFixed(2)}</td>
              <td>{day.dominantCondition}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="forecast-type-selector">
        <button
          className={selectedForecastType === "Hourly" ? "active" : ""}
          onClick={() => setSelectedForecastType("Hourly")}
        >
          Hourly Forecast
        </button>
        <button
          className={selectedForecastType === "Daily" ? "active" : ""}
          onClick={() => setSelectedForecastType("Daily")}
        >
          Daily Forecast
        </button>
      </div>

      <h3>{selectedForecastType} Forecast Chart</h3>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} style={{ backgroundColor: "#ffffff" }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis
              yAxisId="left"
              label={{
                value: tempUnitSymbol,
                angle: -90,
                position: "insideLeft",
              }}
            />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="temp"
              stroke="#00008B"
              name={`Temperature (${tempUnitSymbol})`}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="humidity"
              stroke="#006400"
              name="Humidity (%)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="wind_speed"
              stroke="#8B4513"
              name="Wind Speed (m/s)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="pressure"
              stroke="#800000"
              name="Pressure (hPa)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="forecast-summary">
        <h3>{selectedForecastType} Forecast Summary</h3>
        <p>{summaryText}</p>
      </div>
    </div>
  );
}

export default WeatherDetails;
