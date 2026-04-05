import React, { useState, useEffect, useRef } from 'react';

const ACTIONS = [
  { 
    key: 'batch-delete', 
    label: 'BATCH DELETE', 
    icon: 'delete',
    shortcut: '⌫',
    color: 'var(--error)',
    action: 'batchDelete'
  },
  { 
    key: 'change-accent', 
    label: 'CHANGE GLOBAL ACCENT', 
    icon: 'palette',
    shortcut: '⇧P',
    color: 'var(--secondary)',
    action: 'changeAccent'
  }
];

export default function CommandPalette({ show, onClose, onAction }) {
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (show && inputRef.current) {
      inputRef.current.focus();
    }
  }, [show]);

  const filteredActions = ACTIONS.filter(action => 
    action.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div 
      className={`command-palette-overlay ${show ? 'show' : ''}`} 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div 
        className="command-palette" 
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="command-search">
          <span className="material-symbols-outlined search-icon">terminal</span>
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="SEARCH COMMANDS..."
            className="search-input"
            aria-label="Search commands"
          />
        </div>

        <div className="command-list">
          {filteredActions.length === 0 ? (
            <div className="command-empty">No commands found</div>
          ) : (
            filteredActions.map(action => (
              <button
                key={action.key}
                className="command-item"
                onClick={() => onAction(action.action)}
                style={{ ['--action-color']: action.color }}
                aria-label={action.label}
              >
                <span className="command-icon">
                  <span className="material-symbols-outlined">{action.icon}</span>
                </span>
                <span className="command-label">{action.label}</span>
                <span className="command-shortcut">{action.shortcut}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
