import React, { useState } from 'react';

export default function Login({ onClose, onLogin }) {
  const [name, setName] = useState('');
  const submit = (e) => { e.preventDefault(); if (!name) return; onLogin({ name }); };
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <h3>Login</h3>
        <form className="login-form" onSubmit={submit}>
          <label className="muted">Display name</label>
          <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Your name" />
          <div style={{display:'flex', gap:8, marginTop:12}}>
            <button className="btn primary" type="submit">Continue</button>
            <button className="btn" type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
