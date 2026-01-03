import React from 'react';

export default function Toasts({ toasts = [], onAction, onClose }) {
  return (
    <div className="toast-wrap" aria-live="polite" aria-atomic="true">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.variant || 'info'}`}> 
          <div className="toast-message">{t.message}</div>
          {t.actions && t.actions.length > 0 && (
            <div className="toast-actions">
              {t.actions.map((a, i) => (
                <button key={i} className="toast-action" onClick={() => onAction(t.id, a)}>{a.label}</button>
              ))}
            </div>
          )}
          <button className="toast-close" onClick={() => onClose(t.id)} aria-label="Dismiss">×</button>
        </div>
      ))}
    </div>
  );
}
