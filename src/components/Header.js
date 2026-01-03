import React from 'react';

export default function Header({ onCreate, onLogin }) {
  return (
    <header className="app-header">
      <div className="brand">Hit-List</div>
      <div className="header-actions">
        <button className="btn secondary" onClick={onCreate}>Create List</button>
        <button className="btn primary" onClick={onLogin}>Login</button>
      </div>
    </header>
  );
}
