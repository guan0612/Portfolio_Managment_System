import React from 'react';
import '../style/IntroductionBento.css';

const IntroductionBento = () => {
  return (
    <div className="introduction-bento">
      <div className="header">
        <h1>Portfolio Management via Reinforcement Learning and GAT</h1>
        <p className="subtitle">A dual-layer approach to balance risk and return in stock trading</p>
      </div>
      
      <div className="bento-grid">
        <div className="bento-item overview">
          <h2>Project Overview</h2>
          <p>This project addresses the challenge of designing profitable stock trading strategies using reinforcement learning while maintaining low risk. Our novel two-layer framework uses GAT to model stock relationships and PPO agents to optimize both risk minimization and return maximization.</p>
        </div>
        
        <div className="bento-item architecture">
          <h2>Architecture</h2>
          <div className="architecture-content">
            <div className="architecture-diagram">
              <div className="layer layer-1">
                <div className="layer-box">
                  <span className="layer-label">Layer 1</span>
                  <div className="layer-content">
                    <div className="module-box">
                      <span className="module-icon">📊</span>
                      <span className="module-name">GAT</span>
                    </div>
                    <div className="arrow-right"></div>
                    <div className="module-box">
                      <span className="module-icon">🎯</span>
                      <span className="module-name">Stock Selection</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="layer-separator"></div>
              <div className="layer layer-2">
                <div className="layer-box">
                  <span className="layer-label">Layer 2</span>
                  <div className="layer-content">
                    <div className="module-box">
                      <span className="module-icon">🔄</span>
                      <span className="module-name">TCN-AE</span>
                    </div>
                    <div className="arrow-right"></div>
                    <div className="module-box">
                      <span className="module-icon">💹</span>
                      <span className="module-name">Trading Agent</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bento-item module-gat">
          <div className="module-header">
            <div className="module-icon">📊</div>
            <h2>GAT Network</h2>
          </div>
          <p>Calculates relationship between each stock based on quarterly financial report data to generate a 74×74 graph.</p>
          <div className="io-panel">
            <div className="io-item">
              <span className="io-label">Input</span>
              <span className="io-value">19 financial features × 74 stocks</span>
            </div>
            <div className="io-item">
              <span className="io-label">Output</span>
              <span className="io-value">1 × 74 (Sharpe values)</span>
            </div>
          </div>
        </div>
        
        <div className="bento-item module-stock-picked">
          <div className="module-header">
            <div className="module-icon">🎯</div>
            <h2>Stock Selection Agent</h2>
          </div>
          <p>Selects low-risk investment portfolio using stock relationships and financial features to maximize the average Sharpe ratio.</p>
          <div className="io-panel">
            <div className="io-item">
              <span className="io-label">Input</span>
              <span className="io-value">74×74 graph + financial data</span>
            </div>
            <div className="io-item">
              <span className="io-label">Output</span>
              <span className="io-value">1×74 (stock selection status)</span>
            </div>
            <div className="io-item">
              <span className="io-label">Algorithm</span>
              <span className="io-value">Proximal Policy Optimization</span>
            </div>
          </div>
        </div>
        
        <div className="bento-item module-tcn">
          <div className="module-header">
            <div className="module-icon">🔄</div>
            <h2>TCN Autoencoder</h2>
          </div>
          <p>Compresses the 20×117 technical indicators into 1×20 features and reconstructs to train the model.</p>
          <div className="io-panel">
            <div className="io-item">
              <span className="io-label">Input</span>
              <span className="io-value">20 days × 117 features</span>
            </div>
            <div className="io-item">
              <span className="io-label">Output</span>
              <span className="io-value">1 feature × 20 days</span>
            </div>
          </div>
        </div>
        
        <div className="bento-item module-trading">
          <div className="module-header">
            <div className="module-icon">💹</div>
            <h2>Trading Agent</h2>
          </div>
          <p>Executes trading based on the low-risk portfolio and compressed technical features to maximize returns.</p>
          <div className="io-panel">
            <div className="io-item">
              <span className="io-label">Input</span>
              <span className="io-value">N×20×1 past data + portfolio + cash</span>
            </div>
            <div className="io-item">
              <span className="io-label">Output</span>
              <span className="io-value">N values between -1 and 1</span>
            </div>
            <div className="io-item">
              <span className="io-label">Reward</span>
              <span className="io-value">Cumulative return</span>
            </div>
          </div>
        </div>
        
        <div className="bento-item data-files">
          <h2>Data Processing</h2>
          <div className="file-items">
            <div className="file-item">
              <div className="file-icon">📈</div>
              <div className="file-info">
                <h3>get Financial Statements.ipynb</h3>
                <p>Grab financial statement data from FinMind for GAT model</p>
              </div>
            </div>
            <div className="file-item">
              <div className="file-icon">📊</div>
              <div className="file-info">
                <h3>get Trading Data.ipynb</h3>
                <p>Capture daily transaction data from FinMind for TCN-AE</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bento-item performance">
          <h2>Performance</h2>
          <div className="performance-metrics">
            <div className="metric">
              <div className="metric-value">106.97%</div>
              <div className="metric-label">Trading Agent Return</div>
            </div>
            <div className="metric">
              <div className="metric-value">24.27%</div>
              <div className="metric-label">Yuanta50 Return</div>
            </div>
            <div className="metric">
              <div className="metric-value">14.56%</div>
              <div className="metric-label">SPY Return</div>
            </div>
          </div>
          <p className="performance-note">Performance metrics from 2021/11/15 to 2024/4/19, spanning 10 quarters</p>
        </div>
        
        <div className="bento-item key-features">
          <h2>Key Features</h2>
          <ul className="feature-list">
            <li>Dual-layer reinforcement learning framework to balance risk and return</li>
            <li>GAT network to extract features from financial reports</li>
            <li>TCN-AE to compress technical features from market data</li>
            <li>Incorporation of stock dividends and capital adjustments</li>
            <li>Outperforms benchmark ETFs in both bull and bear markets</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default IntroductionBento; 