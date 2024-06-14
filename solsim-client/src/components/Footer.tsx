import React, { useEffect, useState } from 'react';
import orbitService from '../services/orbitService';

const Footer: React.FC = () => {

  let [runningState, setRunningState] = useState(true)

  const handleStart = () => {
    orbitService.connectWebSocket();
    setRunningState(true)
  };

  const handleStop = () => {
    orbitService.disconnectWebSocket();
    setRunningState(false)
  };

  useEffect(() => {
    const subscription = orbitService.getIsRunningObservable().subscribe(s => {
      setRunningState(s);
    });

    // Cleanup subscription on component unmount
    return () => subscription.unsubscribe();
  }, []);
  
  return (
    <footer className="footer">
      <button onClick={runningState ? handleStop : handleStart}>
        {runningState ? "Stop" : "Start"}
      </button>

      <button className="footerButton">Recenter</button>
      <button className="footerButton">Toggle Paths</button>
      <button className="footerButton">Reset Paths</button>
      <button className="footerButton">Toggle Vectors</button>

    </footer>
  );
};

export default Footer;