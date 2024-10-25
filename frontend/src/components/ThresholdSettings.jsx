
import React, { useState } from 'react';
import axios from 'axios';

function ThresholdSettings() {
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [temperature, setTemperature] = useState('');
  const [condition, setCondition] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/weather/set-threshold', {
        email: email || null,
        city: city || null,
        temperature: temperature ? parseFloat(temperature) : null,
        condition: condition || null,
      });
      alert('Thresholds updated successfully');
      setEmail('');
      setCity('');
      setTemperature('');
      setCondition('');
    } catch (err) {
      console.error(err);
      alert('Failed to update thresholds');
    }
  };

  return (
    <div className="threshold-settings-container">
      <h2>Threshold Settings</h2>
      <form onSubmit={handleSubmit} className="threshold-form">
        <div className="form-group">
          <label>Email Address:</label>
          <input
            type="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g., example@example.com"
          />
        </div>
        <div className="form-group">
          <label>City:</label>
          <input
            type="text"
            value={city}
            required
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g., Delhi"
          />
        </div>
        <div className="form-group">
          <label>Temperature Threshold (°C):</label>
          <input
            type="number"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            placeholder="e.g., 35"
          />
        </div>
        <div className="form-group">
          <label>Weather Condition Threshold:</label>
          <input
            type="text"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            placeholder="e.g., Rain"
          />
        </div>
        <button type="submit" className="submit-button">
          Set Thresholds
        </button>
      </form>
    </div>
  );
}

export default ThresholdSettings;
