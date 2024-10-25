import React from 'react';

function CityList({ cities, onSelect, selectedCity }) {
  return (
    <div>
      <h2>Cities</h2>
      <ul>
        {cities.map(city => (
          <li
            key={city}
            style={{ cursor: 'pointer', fontWeight: city === selectedCity ? 'bold' : 'normal' }}
            onClick={() => onSelect(city)}
          >
            {city}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CityList;
