import React from 'react';

export default function BatchToolbar({ selectedCount, onDelete, onColor, onClose }) {
  return (
    <div className="batch-toolbar">
      <div className="batch-info">
        <span className="batch-count">{selectedCount}</span>
        <span className="batch-label">SELECTED</span>
      </div>
      
      <div className="batch-actions">
        <button
          className="batch-btn"
          onClick={onDelete}
          aria-label="Delete selected"
        >
          <span className="material-symbols-outlined">delete</span>
          <span>DELETE</span>
        </button>
        
        <button
          className="batch-btn"
          onClick={onColor}
          aria-label="Change color"
        >
          <span className="material-symbols-outlined">palette</span>
          <span>COLOR</span>
        </button>
        
        <button
          className="batch-btn close"
          onClick={onClose}
          aria-label="Close selection"
        >
          <span className="material-symbols-outlined">close</span>
          <span>CLOSE</span>
        </button>
      </div>
    </div>
  );
}
