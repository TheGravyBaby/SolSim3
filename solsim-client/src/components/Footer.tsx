import React from 'react';
import orbitService from '../services/orbitService';

const Footer: React.FC = () => {
  const handleStart = () => {
    orbitService.connectWebSocket();
  };

  const handleStop = () => {
    orbitService.disconnectWebSocket();
  };

  return (
    <footer className="footer">
      <button onClick={handleStart}>Start</button>
      <button onClick={handleStop}>Stop</button>
      <select>
        <option>Option 1</option>
        <option>Option 2</option>
      </select>    
    </footer>
  );
};

export default Footer;