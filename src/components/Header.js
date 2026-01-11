import React from 'react';

export default function Header({ onCreate, onLogin, user, onLogout }) {
  return (
    <header className="app-header">
      <div className="brand">Hit-List</div>
      <div className="header-actions">
        <button className="btn secondary" onClick={onCreate}>Create List</button>
        {user ? (
          <>
            <div className="muted">Hi, {user.name}</div>
            <button className="btn" onClick={onLogout}>Logout</button>
          </>
        ) : (
          <button className="btn primary" onClick={onLogin}>Login</button>
        )}
      </div>
    </header>
  );
}
