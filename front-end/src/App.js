import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidenav from './components/Sidenav';
import Introduction from './pages/Introduction';
import StockGraph from './pages/StockRelationGraph';
import TradingStrategy from './pages/TradingStrategy';
import Settings from './pages/Settings';
import './style/App.css';

function App() {
  return (
    <div className="App">
      <Sidenav />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Introduction />} />
          <Route path="/stock-graph" element={<StockGraph />} />
          <Route path="/trading-strategy" element={<TradingStrategy />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
