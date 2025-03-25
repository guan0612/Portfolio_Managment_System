import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidenav from './components/Sidenav';
import IntroductionBento from './pages/IntroductionBento';
import StockGraph from './pages/StockRelationGraph';
import TradingStrategy from './pages/TradingStrategy';
import TradingPerformance from './pages/TradingPerformance';
import StockRelationAnalysis from './pages/StockRelationAnalysis';
import './style/App.css';

function App() {
  return (
    <div className="App">
      <Sidenav />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<IntroductionBento />} />
          <Route path="/introduction-bento" element={<IntroductionBento />} />
          <Route path="/stock-relation-graph" element={<StockGraph />} />
          <Route path="/stock-relation-analysis" element={<StockRelationAnalysis />} />
          <Route path="/trading-strategy" element={<TradingStrategy />} />
          <Route path="/trading-performance" element={<TradingPerformance />} />
          {/* 舊路由，保留向後兼容性 */}
          <Route path="/stock-graph" element={<StockGraph />} />
          <Route path="/stock-relation" element={<StockRelationAnalysis />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
