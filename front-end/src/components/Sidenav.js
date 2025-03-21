import React from 'react';
import '../style/Sidenav.css';
import { Link } from 'react-router-dom';

const Sidenav = () => {
  const menuItems = [
    { to: '/', icon: '📖', text: 'Introduction' },
    { to: '/stock-graph', icon: '🕸️', text: 'Stock Relation Graph' },
    { to: '/trading-strategy', icon: '💰', text: 'Trading Strategy' },
    { to: '/settings', icon: '⚙️', text: 'Settings' },
    { to: '/trading-performance', icon: '📈', text: 'Trading Performance' }, // 新增這一行
  ];

  return (
    <div className="sidenav">
      <div className="sidenav-header">
        <h2>Menu</h2>
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