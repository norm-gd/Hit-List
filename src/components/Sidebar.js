import React from 'react';

// Menu actions we want to show (export and clear)
const MENU_ITEMS = [
  { key: 'export', label: 'Export' },
  { key: 'save', label: 'Save' },
  { key: 'clear', label: 'Clear' }
];


function renderIcon(key) {
  if (key === 'export') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M12 3v12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 7l4-4 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 21H3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  if (key === 'save') return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M4 21h16V7.5L13.5 4H7L4 7.5V21Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 21v-8h8v8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  if (key === 'clear') return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M3 6h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 6v12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 11v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 11v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  return null;
}

export default function Sidebar({ open, onClose, onClear, onToggle, lists = [], onOpenList, onExport, onSave }) {
  const recent = lists ? [...lists].reverse().slice(0, 8) : [];

  const handleClear = () => {
    // request parent to ask for confirmation via toast
    onClear && onClear();
  };

  const handleExport = () => {
    onExport && onExport();
  };

  const handleSave = () => {
    onSave && onSave();
  };

  return (
    <aside className={`sidebar ${open ? 'open' : 'collapsed'}`} aria-hidden={false} aria-expanded={open}>
      <div className="sidebar-inner">
        {open ? (
          <>
            <div className="sidebar-header">
              <div>
                <h3>Menu</h3>
                <div className="muted">Quick actions and tools</div>
              </div>
              <button className="collapse-toggle expanded" aria-label="Collapse menu" onClick={onToggle}>‹</button>
            </div>


            <nav className="sidebar-nav">
              <div className="action-row">
                <button className="action-btn" title="Export" onClick={handleExport} aria-label="Export">
                  <span className="action-icon">{renderIcon('export')}</span>
                  <span className="label">Export</span>
                </button>

                <button className="action-btn" title="Save" onClick={handleSave} aria-label="Save">
                  <span className="action-icon">{renderIcon('save')}</span>
                  <span className="label">Save</span>
                </button>

                <button className="action-btn" title="Clear All" onClick={handleClear} aria-label="Clear All">
                  <span className="action-icon">{renderIcon('clear')}</span>
                  <span className="label">Clear</span>
                </button>
              </div>

              <div className="spacer" />
            </nav>

            <div className="sidebar-history">
              <h4>Recent lists</h4>
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
              <div className="see-all">See all</div>
            </div>

            <div className="sidebar-footer">
              <small className="muted">Frosted panel • Hit-List</small>
            </div>
          </>
        ) : (
          <nav className="sidebar-collapsed-nav" aria-hidden={!open}>
            <div className="collapsed-top">
              <button className="collapse-toggle top" aria-label="Open menu" onClick={onToggle}>›</button>
            </div>

            {MENU_ITEMS.map((it) => (
              <button key={it.key} className="icon-btn big" title={it.label} aria-label={it.label} onClick={it.key === 'export' ? handleExport : it.key === 'clear' ? handleClear : handleSave}>
                <span className="icon">{renderIcon(it.key)}</span>
              </button>
            ))}

            <div style={{ flex: 1 }} />

          </nav>
        )}
      </div>


    </aside>
  );
}
