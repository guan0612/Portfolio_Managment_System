import React from 'react';
import TradingPerformance from './TradingPerformance';

const TradingAgent = () => {
  return (
    <div style={{ 
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '20px'
    }}>
      <TradingPerformance />
    </div>
  );
};

export default TradingAgent; 