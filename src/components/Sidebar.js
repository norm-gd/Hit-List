import React, { useState, useEffect, useRef } from 'react';

const NAV_ITEMS = [
  { key: 'canvas', label: 'CANVAS', icon: 'dashboard' },
  { key: 'commands', label: 'COMMANDS', icon: 'terminal' }
];

export default function Sidebar({ activeNav, onClear, lists = [], onOpenList, onExport, onCreate, onNavClick, onThemeClick, onLogoutClick }) {
  const [operatorName, setOperatorName] = useState('OPERATOR_01');
  const [isEditingName, setIsEditingName] = useState(false);
  const nameInputRef = useRef(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('operatorName');
      if (saved) setOperatorName(saved);
    } catch (e) {
      console.error('Failed to read operator name from localStorage');
    }
  }, []);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  const handleNameBlur = () => {
    setIsEditingName(false);
    try {
      localStorage.setItem('operatorName', operatorName);
    } catch (e) {
      console.error('Failed to save operator name to localStorage');
    }
  };

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleNameBlur();
    }
  };

  const handleClear = () => {
    onClear && onClear();
  };

  const handleExport = () => {
    onExport && onExport();
  };

  const recent = lists ? [...lists].reverse().slice(0, 8) : [];

  return (
    <aside className="sidebar" aria-label="Sidebar navigation">
      <div className="sidebar-inner">
        
        <div className="profile-block">
          <div className="avatar-placeholder">OP</div>
          <div className="profile-info">
            {isEditingName ? (
              <input
                ref={nameInputRef}
                type="text"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                onBlur={handleNameBlur}
                onKeyDown={handleNameKeyDown}
                className="operator-name-input"
                aria-label="Operator name"
              />
            ) : (
              <div 
                className="operator-name" 
                onClick={() => setIsEditingName(true)}
                role="button"
                tabIndex={0}
                aria-label="Edit operator name"
              >
                {operatorName}
              </div>
            )}
            <div className="operator-status">STATUS: ACTIVE</div>
          </div>
        </div>

        <button className="new-task-btn" onClick={onCreate}>
          <span className="material-symbols-outlined">add</span>
          NEW TASK
        </button>

        <nav className="sidebar-nav">
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

        <div className="action-row">
          <button className="action-btn" title="Export" onClick={handleExport} aria-label="Export">
            <span className="material-symbols-outlined">download</span>
            <span className="label">Export</span>
          </button>
          <button className="action-btn" title="Clear All" onClick={handleClear} aria-label="Clear All">
            <span className="material-symbols-outlined">delete</span>
            <span className="label">Clear</span>
          </button>
        </div>

        <div className="spacer" />

        <div className="sidebar-history">
          <h4>RECENT LISTS</h4>
          {recent.length === 0 ? (
            <div className="muted">No recent lists</div>
          ) : (
            <div className="history-list">
              {recent.map(item => (
                <button key={item.id} className="history-item" onClick={() => onOpenList && onOpenList(item.id)}>
                  <span className="history-title">{item.title}</span>
                  <small className="muted">{new Date(item.id).toLocaleString()}</small>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="sidebar-footer">
          <button className="footer-link" onClick={onThemeClick} aria-label="Theme">
            <span className="material-symbols-outlined">palette</span>
            THEME
          </button>
          <button className="footer-link" onClick={onLogoutClick} aria-label="Logout">
            <span className="material-symbols-outlined">logout</span>
            LOGOUT
          </button>
        </div>
      </div>
    </aside>
  );
}
