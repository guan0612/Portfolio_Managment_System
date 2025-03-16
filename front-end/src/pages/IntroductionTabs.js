import React, { useState } from 'react';
import '../style/IntroductionTabs.css';

const IntroductionTabs = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="introduction-tabs">
      <div className="header">
        <h1>Portfolio Management via RL and GAT</h1>
        <p className="subtitle">A comprehensive two-layer reinforcement learning approach</p>
        <a href="https://etd.lib.nycu.edu.tw/cgi-bin/gs32/ncugsweb.cgi?o=dncucdr&s=id=%22GC108552020%22.&searchmode=basic" 
           className="paper-link" 
           target="_blank" 
           rel="noopener noreferrer">
          查看論文原文
        </a>
      </div>
      
      <div className="tabs-container">
        <div className="tabs-header">
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => handleTabClick('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-button ${activeTab === 'gat' ? 'active' : ''}`}
            onClick={() => handleTabClick('gat')}
          >
            GAT Network
          </button>
          <button 
            className={`tab-button ${activeTab === 'stock-picked' ? 'active' : ''}`}
            onClick={() => handleTabClick('stock-picked')}
          >
            Stock Selection
          </button>
          <button 
            className={`tab-button ${activeTab === 'tcn' ? 'active' : ''}`}
            onClick={() => handleTabClick('tcn')}
          >
            TCN-AE
          </button>
          <button 
            className={`tab-button ${activeTab === 'trading' ? 'active' : ''}`}
            onClick={() => handleTabClick('trading')}
          >
            Trading Agent
          </button>
          <button 
            className={`tab-button ${activeTab === 'data' ? 'active' : ''}`}
            onClick={() => handleTabClick('data')}
          >
            Data Files
          </button>
        </div>
        
        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="tab-panel">
              <h2>Project Overview</h2>
              <div className="overview-content">
                <div className="overview-text">
                  <p>This project addresses the challenge of designing profitable stock trading strategies using reinforcement learning while maintaining low risk. We propose a novel two-layer RL framework that prioritizes risk minimization in stock selection and then optimizes investment return through trading strategy.</p>
                  
                  <h3>Key Components</h3>
                  <ul>
                    <li><strong>First Layer:</strong> Leverages PPO agent with Graph Attention Networks to capture relationships between stocks and train a stock selection module focused on minimizing risk-adjusted return.</li>
                    <li><strong>Second Layer:</strong> Employs TCN-AE to compress technical indicators and a PPO-based trading agent with average profit as the reward.</li>
                  </ul>
                  
                  <h3>Project Flow</h3>
                  <ol>
                    <li>GAT model determines stock relationships</li>
                    <li>Stock Selection Agent creates low-risk portfolio</li>
                    <li>TCN-AE compresses daily technical indicators</li>
                    <li>Trading Agent executes trades to maximize return</li>
                  </ol>
                </div>
                <div className="overview-image">
                  <div className="image-container">
                    <img 
                      src="https://hackmd.io/_uploads/BySm8QsFkg.png" 
                      alt="System Architecture" 
                      className="architecture-image"
                    />
                    <p className="image-caption">System Architecture Diagram</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'gat' && (
            <div className="tab-panel">
              <h2>GAT Network</h2>
              <div className="module-header">
                <div className="module-icon">🔍</div>
                <div className="module-description">
                  <p>The Graph Attention Network (GAT) module calculates the relationship between stocks based on quarterly financial report data, generating a 74×74 graph.</p>
                </div>
              </div>
              
              <div className="details-section">
                <h3>Technical Details</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <h4>Input</h4>
                    <p>19 financial information metrics for 74 stocks</p>
                  </div>
                  <div className="detail-item">
                    <h4>Output</h4>
                    <p>1 × 74 (Sharpe value of each stock)</p>
                  </div>
                  <div className="detail-item">
                    <h4>Process</h4>
                    <p>Self-attention mechanism to determine stock relationships</p>
                  </div>
                  <div className="detail-item">
                    <h4>Key Feature</h4>
                    <p>Captures complex inter-stock dependencies</p>
                  </div>
                </div>
              </div>
              
              <div className="implementation-notes">
                <h3>Implementation Notes</h3>
                <p>The GAT model is trained using 19 financial report fields including revenue, profit, assets, liabilities, equity, share capital, reserves, and cash flow data. The model forms a complete graph with 74 stock targets and trains to predict Sharpe ratios.</p>
              </div>
            </div>
          )}
          
          {activeTab === 'stock-picked' && (
            <div className="tab-panel">
              <h2>Stock Selection Agent</h2>
              <div className="module-header">
                <div className="module-icon">📈</div>
                <div className="module-description">
                  <p>The Stock-Picked Agent selects a low-risk investment portfolio from a pool of 74 Taiwanese stocks at the end of each quarter.</p>
                </div>
              </div>
              
              <div className="details-section">
                <h3>Technical Details</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <h4>Input</h4>
                    <p>74×74 Graph + 19 financial metrics + Sharpe values</p>
                  </div>
                  <div className="detail-item">
                    <h4>Output</h4>
                    <p>1×74 Binary vector (stock selection status)</p>
                  </div>
                  <div className="detail-item">
                    <h4>Algorithm</h4>
                    <p>Proximal Policy Optimization (PPO)</p>
                  </div>
                  <div className="detail-item">
                    <h4>Reward</h4>
                    <p>Average Sharpe ratio of selected stocks</p>
                  </div>
                </div>
              </div>
              
              <div className="implementation-notes">
                <h3>Implementation Notes</h3>
                <p>The agent extracts relationships calculated by GAT and financial report features to select stocks. Through iterative training, it learns to select a portfolio that maximizes the average Sharpe ratio, minimizing risk. This portfolio is used until the next quarterly financial report is released.</p>
              </div>
            </div>
          )}
          
          {activeTab === 'tcn' && (
            <div className="tab-panel">
              <h2>TCN Autoencoder</h2>
              <div className="module-header">
                <div className="module-icon">🧩</div>
                <div className="module-description">
                  <p>The Temporal Convolutional Network Autoencoder (TCN-AE) compresses daily technical indicators to extract meaningful features.</p>
                </div>
              </div>
              
              <div className="details-section">
                <h3>Technical Details</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <h4>Input</h4>
                    <p>20 days × 117 features for each data point</p>
                  </div>
                  <div className="detail-item">
                    <h4>Output</h4>
                    <p>1 feature × 20 days (from encoder)</p>
                  </div>
                  <div className="detail-item">
                    <h4>Technique</h4>
                    <p>Compression and reconstruction for feature learning</p>
                  </div>
                  <div className="detail-item">
                    <h4>Training Period</h4>
                    <p>~8 years of historical data</p>
                  </div>
                </div>
              </div>
              
              <div className="implementation-notes">
                <h3>Implementation Notes</h3>
                <p>TCN-AE is trained on data from 2013/01/01 to 2020/11/13 with validation on subsequent data. The model compresses 117 features (including technical indicators for stocks and market indices) from 20 consecutive days into a 20-dimensional feature vector.</p>
              </div>
            </div>
          )}
          
          {activeTab === 'trading' && (
            <div className="tab-panel">
              <h2>Trading Agent</h2>
              <div className="module-header">
                <div className="module-icon">💰</div>
                <div className="module-description">
                  <p>The Trading Agent maximizes cumulative returns by executing trades based on the low-risk portfolio and compressed features.</p>
                </div>
              </div>
              
              <div className="details-section">
                <h3>Technical Details</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <h4>Input</h4>
                    <p>N×20×1 (past data) + Portfolio position + Cash</p>
                  </div>
                  <div className="detail-item">
                    <h4>Output</h4>
                    <p>N values between -1 and 1 (trading signals)</p>
                  </div>
                  <div className="detail-item">
                    <h4>Algorithm</h4>
                    <p>Proximal Policy Optimization (PPO)</p>
                  </div>
                  <div className="detail-item">
                    <h4>Reward</h4>
                    <p>Cumulative return rate</p>
                  </div>
                </div>
              </div>
              
              <div className="implementation-notes">
                <h3>Implementation Notes</h3>
                <p>The trading agent trains a new model each quarter based on the list from the stock selection agent. It operates with an initial capital of 1 million NTD, standard transaction fees, and factors in dividends and capital reductions. Trading actions proceed by selling stocks first, then buying stocks in priority order based on the magnitude of the assigned values.</p>
              </div>
            </div>
          )}
          
          {activeTab === 'data' && (
            <div className="tab-panel">
              <h2>Data Processing Files</h2>
              <div className="data-files-container">
                <div className="data-file">
                  <div className="file-icon">📊</div>
                  <div className="file-details">
                    <h3>get Financial Statements.ipynb</h3>
                    <p>This notebook grabs financial statement data from FinMind API for use by the GAT module. It processes quarterly financial reports for 74 Taiwanese stocks.</p>
                    <h4>Output Files:</h4>
                    <ul>
                      <li>Stock-Picked Agent/Financial statements_SharpeRatio_RL.csv</li>
                      <li>GAT-main/data/{'{'}<span>stock_code</span>{'}'}.csv</li>
                    </ul>
                  </div>
                </div>
                
                <div className="data-file">
                  <div className="file-icon">📈</div>
                  <div className="file-details">
                    <h3>get Trading Data.ipynb</h3>
                    <p>This notebook captures daily transaction data from FinMind API for use by the TCN-AE module. It processes technical indicators and market data.</p>
                    <h4>Output Files:</h4>
                    <ul>
                      <li>TCN-AE/output_original_data.csv</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntroductionTabs; 