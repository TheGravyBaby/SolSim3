import React from 'react';
import Header from './components/Header';
import Canvas from './components/Canvas';
import Footer from './components/Footer';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="app">
      <Header />
      <Canvas />
      <Footer />
    </div>
  );
}

export default App;