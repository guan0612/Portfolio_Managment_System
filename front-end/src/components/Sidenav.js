import React from 'react';
import '../style/Sidenav.css';
import { Link } from 'react-router-dom';

const Sidenav = () => {
  const menuItems = [
    { to: '/introduction', icon: '📖', text: 'Introduction' },
    { to: '/stock-relation-graph', icon: '🕸️', text: 'Stock Relation Graph' },
    { to: '/stock-relation-analysis', icon: '🔍', text: 'Stock Relation Analysis' },
    { to: '/stock-picked-agent', icon: '💰', text: 'Stock Picked Agent' },
    // { to: '/trading-agent', icon: '📈', text: 'Trading Strategy' },
  ];

  return (
    <div className="sidenav">
      <div className="sidenav-header">
        <Link to="/" className="logo-link">
          <img src="/logo.png" alt="Logo" className="sidenav-logo" />
          <h3 className="sidenav-title">Portfolio-Management<br />via RL and GAT</h3>
        </Link>
      </div>
      <nav className="sidenav-menu">
        <ul>
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link to={item.to} aria-label={`Go to ${item.text}`}>
                <span className="icon">{item.icon}</span>
                <span className="text">{item.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidenav;
