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
      <div>
        <button className="solSimButton">Recenter</button>
        <br />
        <button className="solSimButton">Something</button>

      </div>

      <div className='StartStopContainer'>
        <button className={runningState ? 'startStop stop' : 'startStop start' } onClick={runningState ? handleStop : handleStart}>
          {runningState ? "STOP" : "START"}
        </button>
      </div>


      <div>
        <button className="solSimButton">Reset Paths</button>
        <button className="solSimButton">Toggle Paths
          
        </button>
        <br />
        <button className="solSimButton">Toggle Vectors</button>
        <button className="solSimButton">Toggle Grid </button>
      </div>

    </footer>
  );
};

export default Footer;