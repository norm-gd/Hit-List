import React, { useState } from 'react';

const POWER_COLORS = [
  { name: 'YELLOW', value: '#f6ffc0' },
  { name: 'PINK', value: '#ff51fa' },
  { name: 'CYAN', value: '#c1fffe' },
  { name: 'ORANGE', value: '#ff7351' },
  { name: 'LIME', value: '#daf900' }
];

export default function ThemeModal({ show, onClose, onCommit }) {
  const [selectedColor, setSelectedColor] = useState('#f6ffc0');

  if (!show) return null;

  const handleCommit = () => {
    onCommit(selectedColor);
    onClose();
  };

  const handleReset = () => {
    setSelectedColor('#f6ffc0');
  };

  return (
    <div className="theme-modal-overlay" onClick={onClose}>
      <div className="theme-modal-panel" onClick={e => e.stopPropagation()}>
        <div className="theme-modal-header">
          <h2 className="theme-modal-title">THEME_OVERRIDE</h2>
          <button className="theme-modal-close" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="theme-modal-content">
          <section className="theme-section">
            <label className="theme-section-label">SELECT_POWER_COLOR</label>
            <div className="color-picker-grid">
              {POWER_COLORS.map(color => (
                <div key={color.value} className="color-option">
                  <button
                    className={`color-swatch ${selectedColor === color.value ? 'selected' : ''}`}
                    style={{ background: color.value }}
                    onClick={() => setSelectedColor(color.value)}
                    aria-label={`Set power color ${color.name}`}
                  />
                  <span className={`color-name ${selectedColor === color.value ? 'selected' : ''}`}>
                    {color.name}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="theme-section">
            <label className="theme-section-label">LIVE_RENDER_PREVIEW</label>
            <div className="preview-container">
              <div className="preview-card" style={{ '--preview-color': selectedColor }}>
                <div className="preview-icon" style={{ background: selectedColor }}>
                  <span className="material-symbols-outlined">bolt</span>
                </div>
                <div className="preview-text">
                  <span className="preview-title">System Pulse Active</span>
                  <span className="preview-subtitle">Current Color: {POWER_COLORS.find(c => c.value === selectedColor)?.name.replace('_', ' ')}</span>
                </div>
              </div>
              <div className="preview-meta">
                <div className="preview-dots">
                  <div className="dot" style={{ background: selectedColor }}></div>
                  <div className="dot" style={{ background: selectedColor, opacity: '0.5' }}></div>
                  <div className="dot" style={{ background: selectedColor, opacity: '0.2' }}></div>
                </div>
                <span className="preview-note">0px_RADIUS_ENFORCED</span>
              </div>
            </div>
          </section>

          <div className="theme-actions">
            <button className="btn-commit" onClick={handleCommit}>COMMIT_CHANGES</button>
            <button className="btn-reset" onClick={handleReset}>RESET</button>
          </div>
        </div>

        <div className="theme-footer">
          <span>OS_VERSION: 2.0.4-STABLE</span>
          <span>LATENCY: 0.002MS</span>
          <span>ENCRYPTION: AES-256</span>
        </div>
      </div>
    </div>
  );
}
