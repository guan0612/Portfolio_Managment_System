import React from 'react';
import '../style/Sidenav.css';
import { Link } from 'react-router-dom';

const Sidenav = () => {
  return (
    <div className="sidenav">
      <div className="sidenav-header">
        <h2>Menu</h2>
      </div>
      <nav className="sidenav-menu">
        <ul>
          <li>
            <Link to="/">
              <span className="icon">📖</span>
              <span className="text">Introduction</span>
            </Link>
          </li>
          <li>
            <Link to="/stock-graph">
              <span className="icon">🕸️</span>
              <span className="text">Stock Relation Graph</span>
            </Link>
          </li>
          <li>
            <Link to="/trading-strategy">
              <span className="icon">💰</span>
              <span className="text">Trading Strategy</span>
            </Link>
          </li>
          <li>
            <Link to="/settings">
              <span className="icon">⚙️</span>
              <span className="text">Settings</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidenav; 