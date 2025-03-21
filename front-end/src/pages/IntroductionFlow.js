import React from 'react';
import '../style/IntroductionFlow.css';

// Main component with header and complete content
const IntroductionFlow = () => {
  return (
    <div className="introduction-flow">
      <div className="header">
        <h1>Portfolio Management via RL and GAT</h1>
        <p className="subtitle">A two-layer reinforcement learning approach</p>
        <a href="https://etd.lib.nycu.edu.tw/cgi-bin/gs32/ncugsweb.cgi?o=dncucdr&s=id=%22GC108552020%22.&searchmode=basic" 
           className="paper-link" 
           target="_blank" 
           rel="noopener noreferrer">
          查看論文原文
        </a>
      </div>
      
      <div className="system-architecture">
        <img 
          src="https://hackmd.io/_uploads/BySm8QsFkg.png" 
          alt="System Architecture" 
          className="architecture-image"
        />
        <p className="image-caption">Original System Architecture Diagram</p>
      </div>
      
      <FlowDiagramModule />
      
      <div className="notebook-references">
        <h3>Data Processing Notebooks</h3>
        <div className="notebook-items">
          <div className="notebook-item">
            <span className="notebook-icon">📊</span>
            <div>
              <h4>get Financial Statements.ipynb</h4>
              <p>Processes financial statement data from FinMind for GAT model</p>
            </div>
          </div>
          <div className="notebook-item">
            <span className="notebook-icon">📈</span>
            <div>
              <h4>get Trading Data.ipynb</h4>
              <p>Processes daily trading data from FinMind for TCN-AE model</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Exportable flow diagram module that can be used independently
export const FlowDiagramModule = () => {
  return (
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
            <h3>GAT Network</h3>
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
            <h3>Stock Selection Agent (PPO)</h3>
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
            <h3>Trading Agent (PPO)</h3>
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
          <h3>Final Output</h3>
          <p>Optimized trading decisions that balance risk and return</p>
          <ul>
            <li>Minimized risk through stock selection</li>
            <li>Maximized returns through trading strategy</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default IntroductionFlow; 