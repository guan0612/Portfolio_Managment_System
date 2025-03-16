import React from 'react';
import '../style/IntroductionFlow.css';

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
              <p>Calculates relationships between stocks using financial report data</p>
              <div className="tech-details">
                <span className="tech-label">Input:</span> Financial data (19 features × 74 stocks)
                <br />
                <span className="tech-label">Output:</span> Stock relationship graph (74×74)
              </div>
            </div>
            <div className="arrow-down"></div>
          </div>
          
          <div className="flow-stage">
            <div className="stage-number">2</div>
            <div className="stage-content">
              <h3>Stock Selection Agent (PPO)</h3>
              <p>Selects low-risk portfolio using stock relationships and financial features</p>
              <div className="tech-details">
                <span className="tech-label">Input:</span> Stock relationship graph + Financial features
                <br />
                <span className="tech-label">Output:</span> Selected stock portfolio (1×74 binary vector)
                <br />
                <span className="tech-label">Reward:</span> Average Sharpe ratio (risk-adjusted return)
              </div>
            </div>
            <div className="arrow-down"></div>
          </div>
          
          <div className="parallel-stages">
            <div className="flow-stage parallel">
              <div className="stage-number">3A</div>
              <div className="stage-content">
                <h3>TCN Autoencoder</h3>
                <p>Compresses technical indicators into high-dimensional features</p>
                <div className="tech-details">
                  <span className="tech-label">Input:</span> 20 days × 117 features
                  <br />
                  <span className="tech-label">Output:</span> 1 feature × 20 days
                </div>
              </div>
            </div>
            
            <div className="flow-stage parallel">
              <div className="stage-number">3B</div>
              <div className="stage-content">
                <h3>Selected Portfolio</h3>
                <p>Low-risk stock portfolio from Stage 2</p>
                <div className="tech-details">
                  <span className="tech-label">Content:</span> N selected stocks (N ≤ 74)
                  <br />
                  <span className="tech-label">Period:</span> Used until next quarterly report
                </div>
              </div>
            </div>
          </div>
          
          <div className="arrow-down merge"></div>
          
          <div className="flow-stage">
            <div className="stage-number">4</div>
            <div className="stage-content">
              <h3>Trading Agent (PPO)</h3>
              <p>Executes daily trading based on selected portfolio and compressed features</p>
              <div className="tech-details">
                <span className="tech-label">Input:</span> Compressed features + Portfolio position + Cash
                <br />
                <span className="tech-label">Output:</span> Trading signals (-1 to 1) for N stocks
                <br />
                <span className="tech-label">Reward:</span> Cumulative return
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

export default IntroductionFlow; 