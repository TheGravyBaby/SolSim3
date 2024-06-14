import React, { useEffect, useRef, useState } from 'react';
import Performance from './Performance'; // Adjust the path according to your project structure

const Header: React.FC = () => {
  return (
    <header className="header">
      <h3>SolSim3</h3>
      <label>
        Star Systems: 
        <select name="selectedSystem">
          <option>Option 1</option>
          <option>Option 2</option>
        </select> 
      </label>
      
      <label>
        Granularity: 
        <select name="selectedGranularity">
          <option>Option 1</option>
          <option>Option 2</option>
        </select> 
      </label>

      <Performance />
    </header>
  );
};

export default Header;