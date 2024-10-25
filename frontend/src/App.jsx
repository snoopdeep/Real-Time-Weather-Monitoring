import React, { useState } from 'react';
import CityList from './components/CityList.jsx';
import WeatherDetails from './components/WeatherDetails.jsx';
import ThresholdSettings from './components/ThresholdSettings.jsx';
import './App.css';

function App() {
  const cities = ['Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Kolkata', 'Hyderabad'];
  const [selectedCity, setSelectedCity] = useState(cities[0]);

  const handleCitySelect = (city) => {
    setSelectedCity(city);
  };

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-logo">🌤️</div>
        <div className="navbar-title">Real-Time Weather Analysis</div>
      </nav>
      <div className="app-container">
        <div className="sidebar">
          <CityList cities={cities} onSelect={handleCitySelect} selectedCity={selectedCity} />
          <ThresholdSettings />
        </div>
        <div className="content">
          <WeatherDetails city={selectedCity} />
        </div>
      </div>
    </div>
  );
}

export default App;
