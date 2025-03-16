import React from 'react';
import '../style/IntroductionCards.css';

const IntroductionCards = () => {
  return (
    <div className="introduction-cards">
      <div className="header">
        <h1>Portfolio Management via RL and GAT</h1>
        <p className="subtitle">A modular approach to balanced investment risk and return</p>
      </div>
      
      <div className="overview">
        <p>This project implements a novel two-layer reinforcement learning framework that focuses on risk minimization in stock selection and return optimization through trading strategies.</p>
      </div>
      
      <div className="cards-container">
        <div className="card">
          <div className="card-header">
            <div className="card-icon">📊</div>
            <h2>GAT-main</h2>
          </div>
          <div className="card-content">
            <p>Calculate the relationship between each stock based on quarterly financial report data to generate a 74×74 relationship graph.</p>
            <div className="card-io">
              <div className="card-input">
                <h4>Input</h4>
                <p>19 financial information × 74 stocks</p>
              </div>
              <div className="card-output">
                <h4>Output</h4>
                <p>1 × 74 (Sharpe value of each stock)</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <div className="card-icon">🎯</div>
            <h2>Stock-Picked Agent</h2>
          </div>
          <div className="card-content">
            <p>Using relationships provided by GAT and financial report features, this agent trains to maximize the average Sharpe ratio, resulting in a low-risk portfolio.</p>
            <div className="card-io">
              <div className="card-input">
                <h4>Input</h4>
                <p>74×74 Graph + Financial data + Sharpe values</p>
              </div>
              <div className="card-output">
                <h4>Output</h4>
                <p>1×74 (stock selection status)</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <div className="card-icon">🔄</div>
            <h2>TCN-AE</h2>
          </div>
          <div className="card-content">
            <p>Compresses daily technical indicators to extract high-dimensional features for the trading agent.</p>
            <div className="card-io">
              <div className="card-input">
                <h4>Input</h4>
                <p>20 days × 117 features per data</p>
              </div>
              <div className="card-output">
                <h4>Output</h4>
                <p>1 feature × 20 days (compressed representation)</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <div className="card-icon">💹</div>
            <h2>Trading Agent</h2>
          </div>
          <div className="card-content">
            <p>Uses the low-risk portfolio from Stock-Picked Agent and compressed data from TCN-AE to maximize cumulative returns.</p>
            <div className="card-io">
              <div className="card-input">
                <h4>Input</h4>
                <p>N×20×1 (past data) + Portfolio position + Cash</p>
              </div>
              <div className="card-output">
                <h4>Output</h4>
                <p>N values between -1 and 1 (trading signals)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="data-files">
        <h3>Data Processing Files</h3>
        <ul>
          <li><strong>get Financial Statement.ipynb</strong>: Grab financial statement data from Finmind for GAT</li>
          <li><strong>get Trading Data.ipynb</strong>: Capture daily transaction data from Finmind for TCN-AE</li>
        </ul>
      </div>
    </div>
  );
};

export default IntroductionCards; 