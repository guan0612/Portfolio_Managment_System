import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidenav from './components/Sidenav';
import Introduction from './pages/Introduction';
import StockGraph from './pages/StockRelationGraph';
import TradingStrategy from './pages/TradingStrategy';
import StockRelationAnalysis from './pages/StockRelationAnalysis';
import TradingAgent from './pages/TradingAgent';
import './style/App.css';

function App() {
  return (
    <div className="App">
      <Sidenav />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Introduction />} />
          <Route path="/introduction" element={<Introduction />} />
          <Route path="/stock-relation-graph" element={<StockGraph />} />
          <Route path="/stock-relation-analysis" element={<StockRelationAnalysis />} />
          <Route path="/trading-strategy" element={<TradingStrategy />} />
          <Route path="/trading-agent" element={<TradingAgent />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
