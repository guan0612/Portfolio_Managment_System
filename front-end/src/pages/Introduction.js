import React from 'react';
import '../style/Introduction.css';

const Introduction = () => {
  return (
    <div className="introduction-bento">
      <div className="header">
        <h1>Portfolio Management via Reinforcement Learning and GAT</h1>
        <p className="subtitle">A dual-layer approach to balance risk and return in stock trading</p>
        <a href="https://etd.lib.nycu.edu.tw/cgi-bin/gs32/ncugsweb.cgi?o=dncucdr&s=id=%22GC108552020%22.&searchmode=basic" 
           className="paper-link" 
           target="_blank" 
           rel="noopener noreferrer">
          查看論文原文
        </a>
      </div>
      
      <div className="bento-grid">
        <div className="bento-item overview">
          <h2>Project Overview</h2>
          <p>This innovative investment system helps you build a profitable stock portfolio while minimizing risk. Our two-layer approach first selects low-risk stocks, then optimizes daily trading decisions to maximize returns - achieving better performance than traditional ETFs in both bull and bear markets.</p>
        </div>
        
        <div className="bento-item architecture">
          <h2>System Architecture</h2>
          <div className="architecture-content">
            <img 
              src="https://hackmd.io/_uploads/BySm8QsFkg.png" 
              alt="System Architecture" 
              className="architecture-image"
            />
          </div>
        </div>
        
        <div className="bento-item module-gat">
          <div className="module-content-wrapper">
            <div className="module-header">
              <div className="module-icon">📊</div>
              <h2>Stock Relationships</h2>
            </div>
            <div className="module-links">
              <a href="/stock-relation-graph" className="module-link-button small">關係圖</a>
              <a href="/stock-relation-analysis" className="module-link-button small">分析</a>
            </div>
            <p className="module-description">Discovers hidden connections between stocks by analyzing financial reports, revealing which companies influence each other in the market.</p>
            <div className="io-panel">
              <div className="io-item">
                <span className="io-label">Analyzes</span>
                <span className="io-value">Quarterly financial data from 74 companies</span>
              </div>
              <div className="io-item">
                <span className="io-label">Provides</span>
                <span className="io-value">A map of stock correlations and influences</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bento-item module-stock-picked">
          <div className="module-content-wrapper">
            <div className="module-header">
              <div className="module-icon">🎯</div>
              <h2>Portfolio Builder</h2>
            </div>
            <div className="module-links">
              <a href="/trading-strategy" className="module-link-button small">查看策略</a>
            </div>
            <p className="module-description">Creates a low-risk investment portfolio by identifying which stocks work well together, balancing potential returns against market volatility.</p>
            <div className="io-panel">
              <div className="io-item">
                <span className="io-label">Considers</span>
                <span className="io-value">Stock relationships and financial health</span>
              </div>
              <div className="io-item">
                <span className="io-label">Selects</span>
                <span className="io-value">The ideal mix of stocks for lower risk</span>
              </div>
              <div className="io-item">
                <span className="io-label">Strategy</span>
                <span className="io-value">Risk-minimization through diversification</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bento-item module-selected-portfolio">
          <div className="module-content-wrapper">
            <div className="module-header">
              <div className="module-icon">🔄</div>
              <h2>Selected Portfolio</h2>
            </div>
            <div className="module-links">
              <a href="/trading-agent" className="module-link-button small">查看策略</a>
            </div>
            <p className="module-description">A risk-minimized investment portfolio created by the Stock Selection Agent, focused on balancing potential returns with market volatility.</p>
            <div className="io-panel">
              <div className="io-item">
                <span className="io-label">Formation</span>
                <span className="io-value">Based on GAT network insights and financial metrics</span>
              </div>
              <div className="io-item">
                <span className="io-label">Objective</span>
                <span className="io-value">Maximize Sharpe ratio for optimal risk-return balance</span>
              </div>
              <div className="io-item">
                <span className="io-label">Duration</span>
                <span className="io-value">Updated quarterly with new financial reports</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bento-item module-trading">
          <div className="module-content-wrapper">
            <div className="module-header">
              <div className="module-icon">💹</div>
              <h2>Trading Execution</h2>
            </div>
            <div className="module-links">
              <a href="/trading-agent" className="module-link-button small">查看績效</a>
            </div>
            <p className="module-description">Makes daily trading decisions within your selected portfolio, optimizing when to buy, sell, or hold each stock to maximize overall returns.</p>
            <div className="io-panel">
              <div className="io-item">
                <span className="io-label">Considers</span>
                <span className="io-value">Market patterns, portfolio status, and cash</span>
              </div>
              <div className="io-item">
                <span className="io-label">Decides</span>
                <span className="io-value">Precise buy/sell amounts for each stock</span>
              </div>
              <div className="io-item">
                <span className="io-label">Targets</span>
                <span className="io-value">Maximum portfolio growth over time</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bento-item flow-diagram-bento">
          <h2>Process Flow</h2>
          <div className="flow-diagram">
            <div className="data-sources">
              <div className="data-box financial-data">
                <h3>Financial Reports</h3>
                <p>Quarterly data from 74 stocks</p>
                <small>Source: FinMind API</small>
              </div>
              <div className="data-box trading-data">
                <h3>Trading Data</h3>
                <p>Daily technical indicators</p>
                <small>Source: FinMind API</small>
              </div>
            </div>
            
            <div className="process-flow">
              <div className="flow-stage">
                <div className="stage-number">1</div>
                <div className="stage-content">
                  <h3>
                    GAT Network
                  </h3>
                  <p>Analyzes stock relationships through financial reports</p>
                  <div className="tech-details">
                    <span className="tech-label">Input:</span> Quarterly financial reports with 19 key metrics from 74 stocks
                    <br />
                    <span className="tech-label">Output:</span> A network showing how stocks influence each other
                  </div>
                </div>
                <div className="arrow-down"></div>
              </div>
              
              <div className="flow-stage">
                <div className="stage-number">2</div>
                <div className="stage-content">
                  <h3>
                    Stock Selection Agent (PPO)
                  </h3>
                  <p>Creates a low-risk portfolio using the GAT network insights</p>
                  <div className="tech-details">
                    <span className="tech-label">Input:</span> Stock relationships and financial metrics
                    <br />
                    <span className="tech-label">Output:</span> A diversified portfolio of carefully selected stocks
                    <br />
                    <span className="tech-label">Goal:</span> Maximize Sharpe ratio (higher returns with lower risk)
                  </div>
                </div>
                <div className="arrow-down"></div>
              </div>
              
              <div className="parallel-stages">
                <div className="stage-2-to-3b-connector"></div>
                <div className="flow-stage parallel">
                  <div className="stage-number">3A</div>
                  <div className="stage-content">
                    <h3>TCN Autoencoder</h3>
                    <p>Identifies market patterns from price movements</p>
                    <div className="tech-details">
                      <span className="tech-label">Input:</span> 20 days of price data with 117 technical indicators
                      <br />
                      <span className="tech-label">Output:</span> Essential market patterns for better trading decisions
                    </div>
                  </div>
                </div>
                
                <div className="flow-stage parallel">
                  <div className="stage-number">3B</div>
                  <div className="stage-content">
                    <h3>Selected Portfolio</h3>
                    <p>The portfolio created by the Stock Selection Agent</p>
                    <div className="tech-details">
                      <span className="tech-label">Content:</span> A basket of carefully selected stocks
                      <br />
                      <span className="tech-label">Duration:</span> Held until next quarterly financial reports
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="arrow-down merge"></div>
              
              <div className="flow-stage">
                <div className="stage-number">4</div>
                <div className="stage-content">
                  <h3>
                    Trading Agent (PPO)
                  </h3>
                  <p>Optimizes daily trading within the selected portfolio</p>
                  <div className="tech-details">
                    <span className="tech-label">Input:</span> Market patterns, current holdings, and available cash
                    <br />
                    <span className="tech-label">Output:</span> Daily buy/sell signals for each stock in portfolio
                    <br />
                    <span className="tech-label">Goal:</span> Maximize total investment returns
                  </div>
                </div>
              </div>
            </div>
            
            <div className="final-output">
              <div className="output-box">
                <h3>
                  Final Output
                </h3>
                <p>Optimized trading decisions that balance risk and return</p>
                <ul>
                  <li>Minimized risk through stock selection</li>
                  <li>Maximized returns through trading strategy</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bento-item data-files">
          <h2>Data Processing</h2>
          <div className="file-items">
            <div className="file-item">
              <div className="file-icon">📈</div>
              <div className="file-info">
                <h3>Financial Statements</h3>
                <p>Collects and processes quarterly financial data to understand company fundamentals</p>
              </div>
            </div>
            <div className="file-item">
              <div className="file-icon">📊</div>
              <div className="file-info">
                <h3>Trading Data</h3>
                <p>Analyzes daily price movements and technical indicators for market insights</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bento-item performance">
          <h2>
            Performance Results
            <div className="module-links">
              <a href="/trading-performance" className="module-link-button">詳細資訊</a>
            </div>
          </h2>
          <div className="performance-metrics">
            <div className="metric">
              <div className="metric-value">106.97%</div>
              <div className="metric-label">Our System Return</div>
            </div>
            <div className="metric">
              <div className="metric-value">24.27%</div>
              <div className="metric-label">Yuanta50 ETF</div>
            </div>
            <div className="metric">
              <div className="metric-value">14.56%</div>
              <div className="metric-label">S&P 500 ETF</div>
            </div>
          </div>
          <p className="performance-note">Results from 2021/11/15 to 2024/4/19, spanning 10 quarters</p>
        </div>
        
        <div className="bento-item key-features">
          <h2>Key Advantages</h2>
          <ul className="feature-list">
            <li>Dual-layer reinforcement learning framework balances risk and return optimization</li>
            <li>GAT network extracts relationships between stocks from financial reports</li>
            <li>TCN-AE compresses technical indicators to enhance trading decisions</li>
            <li>Incorporates stock dividends and capital adjustments for accurate returns</li>
            <li>Outperforms benchmark ETFs in both bull and bear markets</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Introduction; 