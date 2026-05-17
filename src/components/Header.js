import React from 'react';
import { NAV_ITEMS } from '../constants';

export default function Header({ activeNav, onNavClick, onThemeClick, onSettingsClick }) {
  return (
    <header className="app-header">
      <div className="brand">HitLIST</div>
      
      <nav className="header-nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.key}
            className={`nav-link ${activeNav === item.key ? 'active' : ''}`}
            onClick={() => {
              if (onNavClick) onNavClick(item.key);
            }}
            aria-label={item.label}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="header-actions">
        <button
          className="icon-btn"
          onClick={onThemeClick}
          aria-label="Theme"
          title="Theme"
        >
          <span className="material-symbols-outlined">palette</span>
        </button>
        <button
          className="icon-btn"
          onClick={onSettingsClick}
          aria-label="Settings"
          title="Settings"
        >
          <span className="material-symbols-outlined">settings</span>
        </button>
      </div>
    </header>
  );
}
