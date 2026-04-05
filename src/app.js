// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Toasts from './components/Toast';
import BatchToolbar from './components/BatchToolbar';
import CommandPalette from './components/CommandPalette';
import ThemeModal from './components/ThemeModal';
import './index.css';

const MAX_URL_LENGTH = 55000;

// color palette used for windows (power color swatches)
const PALETTE = ['#f6ffc0', '#ff51fa', '#c1fffe', '#ff7351', '#daf900'];

function App() {
  const [lists, setLists] = useState([]);
  const [showHome, setShowHome] = useState(true);
  const [playgroundName, setPlaygroundName] = useState(() => localStorage.getItem('playgroundName') || 'Default Playground');
  const nodeRefs = useRef({});
  const [draggingIds, setDraggingIds] = useState([]);
  const [focusedId, setFocusedId] = useState(null);
  const [paletteOpenId, setPaletteOpenId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [activeNav, setActiveNav] = useState('canvas');
  const playgroundRef = useRef(null);
  const rafRef = useRef(null);

  // mouse tracking for subtle background gradient movement
  useEffect(() => {
    const node = playgroundRef.current;
    if (!node) return;
    const onMove = (e) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const rect = node.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      rafRef.current = requestAnimationFrame(() => {
        node.style.setProperty('--mx', x + 'px');
        node.style.setProperty('--my', y + 'px');
      });
    };
    node.addEventListener('mousemove', onMove);
    return () => {
      node.removeEventListener('mousemove', onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const data = params.get('data');
    if (data) {
      try {
        const decoded = JSON.parse(atob(data));
        setLists(decoded);
        setShowHome(false);
      } catch (e) {
        console.error('Invalid data in URL');
      }
    }
  }, []);

  useEffect(() => {
    if (lists.length > 0) {
      const encoded = btoa(JSON.stringify(lists));
      const newUrl = `${window.location.origin}${window.location.pathname}?data=${encoded}`;
      if (newUrl.length <= MAX_URL_LENGTH) {
        window.history.replaceState(null, '', newUrl);
      } else {
        alert('List too long! Cannot save to URL.');
      }
    } else {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [lists]);

  const createList = () => {
    const newList = {
      id: Date.now(),
      title: 'New List',
      items: [],
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      position: { x: Math.random() * 200, y: Math.random() * 200 },
      playground: playgroundName
    };
    setLists([...lists, newList]);
    setShowHome(false);
  };

  useEffect(() => {
    setLists(prev => prev.map(list => ({
      ...list,
      items: (list.items || []).map(it => (typeof it === 'string' ? { id: Date.now() + Math.random(), text: it } : it))
    })));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => {
          const newState = !prev;
          setActiveNav(newState ? 'commands' : 'canvas');
          return newState;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleCommandAction = (action) => {
    setShowCommandPalette(false);
    setActiveNav('canvas');
    switch (action) {
      case 'batchDelete':
        if (selectedIds.length > 0) batchDelete();
        else addToast({ message: 'No lists selected', variant: 'info' });
        break;
      case 'changeAccent':
        const newAccent = PALETTE[Math.floor(Math.random() * PALETTE.length)];
        document.documentElement.style.setProperty('--power-color', newAccent);
        addToast({ message: 'Power color changed', variant: 'success' });
        break;
      default:
        break;
    }
  };

  const setListColor = (id, color) => {
    setLists(lists.map(list => list.id === id ? { ...list, color } : list));
    setPaletteOpenId(null);
  };

  const updateListTitle = (id, newTitle) => {
    setLists(lists.map(list => list.id === id ? { ...list, title: newTitle } : list));
  };

  const addItem = (id, itemText) => {
    const itemObj = { id: Date.now() + Math.random(), text: itemText };
    setLists(lists.map(list => list.id === id ? { ...list, items: [...list.items, itemObj] } : list));
  };

  const removeItem = (id, index) => {
    setLists(lists.map(list => {
      if (list.id === id) {
        const newItems = [...list.items];
        newItems.splice(index, 1);
        return { ...list, items: newItems };
      }
      return list;
    }));
  };

  // FIXED: Consolidated closeList function and removed duplicate declaration
  const closeList = (id) => {
    setLists(prevLists => {
      const filtered = prevLists.filter(list => list.id !== id);
      if (filtered.length === 0) {
        setShowHome(true);
      }
      return filtered;
    });
    
    // cleanup nodeRef to avoid memory leaks
    if (nodeRefs.current[id]) {
        delete nodeRefs.current[id];
    }
  };

  const handleDragStop = (id, e, data) => {
    setLists(lists.map(list => list.id === id ? { ...list, position: { x: data.x, y: data.y } } : list));
  };

  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverState, setDragOverState] = useState(null);

  const reorderItem = (listId, fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    setLists(prev => prev.map(list => {
      if (list.id !== listId) return list;
      const items = [...list.items];
      const [moved] = items.splice(fromIndex, 1);
      const insertIndex = Math.max(0, Math.min(toIndex, items.length));
      items.splice(insertIndex, 0, moved);
      return { ...list, items };
    }));
  };

  const onItemDragStart = (e, listId, index) => {
    try { e.dataTransfer.setData('text/plain', JSON.stringify({ listId, index })); } catch (_) {}
    try {
      const img = new Image();
      img.src = 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg"></svg>';
      e.dataTransfer.setDragImage(img, 0, 0);
    } catch (_) {}
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItem({ listId, index });
  };

  const onItemDragOver = (e, listId, index) => {
    e.preventDefault();
    let payload = null;
    try { payload = JSON.parse(e.dataTransfer.getData('text/plain')); } catch (_) { }
    if (payload && payload.listId === listId && payload.index === index) {
      setDragOverState(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const isBefore = e.clientY < midY;
    setDragOverState({ listId, index, position: isBefore ? 'before' : 'after' });
  };

  const onItemDrop = (e, listId, index) => {
    e.preventDefault();
    let payload = null;
    try { payload = JSON.parse(e.dataTransfer.getData('text/plain')); } catch (_) { }
    if (!payload) { setDraggedItem(null); setDragOverState(null); return; }
    if (payload.listId === listId) {
      const rect = e.currentTarget.getBoundingClientRect();
      const isBefore = e.clientY < (rect.top + rect.height / 2);
      let toIndex = index + (isBefore ? 0 : 1);
      if (payload.index < toIndex) toIndex -= 1;
      reorderItem(listId, payload.index, toIndex);
    }
    setDraggedItem(null);
    setDragOverState(null);
  };

  const onItemDragEnd = () => {
    setDraggedItem(null);
    setDragOverState(null);
  };

  const [editingItem, setEditingItem] = useState(null);
  const [editingValue, setEditingValue] = useState('');

  const startEditing = (listId, index, current) => {
    setEditingItem({ listId, index });
    setEditingValue(current);
  };

  const saveEditing = () => {
    if (!editingItem) return;
    const { listId, index } = editingItem;
    setLists(prev => prev.map(list => {
      if (list.id !== listId) return list;
      const items = [...list.items];
      items[index] = { ...items[index], text: editingValue };
      return { ...list, items };
    }));
    setEditingItem(null);
    setEditingValue('');
  };

  const cancelEditing = () => { setEditingItem(null); setEditingValue(''); };

  const openFromHistory = (id) => {
    setShowHome(false);
    setFocusedId(id);
    setTimeout(() => setFocusedId(null), 2500);
  };

  const handleNavClick = (navKey) => {
    setActiveNav(navKey);
    if (navKey === 'commands') {
      setShowCommandPalette(true);
    } else if (navKey === 'canvas') {
      setShowCommandPalette(false);
    }
  };

  const handleThemeClick = () => {
    setShowThemeModal(true);
  };

  const handleThemeCommit = (color) => {
    document.documentElement.style.setProperty('--power-color', color);
    addToast({ message: 'Power color updated', variant: 'success' });
  };

  const handleSettingsClick = () => {
    addToast({ message: 'Settings not available', variant: 'info' });
  };

  const handleLogoutClick = () => {
    addToast({ message: 'Logged out', variant: 'info' });
  };

  const [toasts, setToasts] = useState([]);
  const addToast = (toast) => {
    const id = Date.now() + Math.random();
    const t = { id, ...toast };
    setToasts(s => [...s, t]);
    setTimeout(() => {
      setToasts(s => s.filter(x => x.id !== id));
    }, 4000);
    return id;
  };
  const removeToast = (id) => setToasts(s => s.filter(x => x.id !== id));
  const handleToastAction = (id, action) => {
    if (action && action.onClick) action.onClick();
    removeToast(id);
  };

  const exportUrl = () => {
    const encoded = lists.length > 0 ? btoa(JSON.stringify(lists)) : null;
    const url = encoded ? `${window.location.origin}${window.location.pathname}?data=${encoded}` : window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => addToast({ message: 'Shareable URL copied to clipboard', variant: 'success' }));
    } else {
      addToast({ message: 'Copy the URL manually', variant: 'info', actions: [{ label: 'Copy', onClick: () => { try { navigator.clipboard.writeText(url); } catch(e){} } }] });
    }
  };

  const toggleSelect = (listId) => {
    setSelectedIds(prev => {
      if (prev.includes(listId)) {
        return prev.filter(id => id !== listId);
      } else {
        return [...prev, listId];
      }
    });
  };

  const batchDelete = () => {
    if (selectedIds.length === 0) return;
    setLists(lists.filter(list => !selectedIds.includes(list.id)));
    setSelectedIds([]);
    addToast({ message: `${selectedIds.length} list(s) deleted`, variant: 'success' });
  };

  const batchColor = () => {
    if (selectedIds.length === 0) return;
    const newColor = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    setLists(lists.map(list =>
      selectedIds.includes(list.id) ? { ...list, color: newColor } : list
    ));
    addToast({ message: `${selectedIds.length} list(s) color changed`, variant: 'info' });
  };

  const closeBatch = () => {
    setSelectedIds([]);
  };

  const requestClearAll = () => {
    addToast({
      message: 'Clear all lists?',
      variant: 'warning',
      actions: [
        { label: 'Clear', onClick: () => { setLists([]); nodeRefs.current = {}; setShowHome(true); addToast({ message: 'Lists cleared', variant: 'success' }); } }
      ]
    });
  };

  return (
    <div className="app">
      <Header
        activeNav={activeNav}
        onNavClick={handleNavClick}
        onThemeClick={handleThemeClick}
        onSettingsClick={handleSettingsClick}
      />
      <Sidebar
        activeNav={activeNav}
        onClear={requestClearAll}
        lists={lists}
        onOpenList={openFromHistory}
        onExport={exportUrl}
        onCreate={createList}
        onNavClick={handleNavClick}
        onThemeClick={handleThemeClick}
        onLogoutClick={handleLogoutClick}
      />

      <main ref={playgroundRef} className="playground" role="main">
        <div className="bg-glow" aria-hidden="true"></div>
        <Toasts toasts={toasts} onAction={handleToastAction} onClose={removeToast} />

        {lists.length === 0 && (
          <div className="empty-state">
            <h1>HITLIST</h1>
            <p className="empty-state-subtitle">CREATE AND MANAGE YOUR TASKS</p>

            <div className="home-playground">
              <label className="muted uppercase">DEFAULT PLAYGROUND NAME</label>
              <input value={playgroundName} onChange={(e) => { setPlaygroundName(e.target.value); try { localStorage.setItem('playgroundName', e.target.value); } catch(e){} }} placeholder="Default Playground" />
            </div>

            <button className="btn primary large" onClick={createList}>CREATE LIST</button>
          </div>
        )}

        {lists.map(list => {
          if (!nodeRefs.current[list.id]) nodeRefs.current[list.id] = React.createRef();
          const isDragging = draggingIds.includes(list.id);
          return (
            <Draggable
              key={list.id}
              nodeRef={nodeRefs.current[list.id]}
              bounds="parent"
              defaultPosition={list.position || { x: 0, y: 0 }}
              handle=".window-header"
              onStart={() => setDraggingIds(s => Array.from(new Set([...s, list.id])))}
              onStop={(e, data) => { setDraggingIds(s => s.filter(i => i !== list.id)); handleDragStop(list.id, e, data); }}
            >
              <div ref={nodeRefs.current[list.id]} style={{ ['--accent-color']: list.color || PALETTE[0] }} className={`window ${isDragging ? 'dragging' : ''} ${focusedId === list.id ? 'focused' : ''} ${selectedIds.includes(list.id) ? 'selected' : ''}`}>
                <div className="window-header">
                  <input
                    type="checkbox"
                    className="select-checkbox"
                    checked={selectedIds.includes(list.id)}
                    onChange={() => toggleSelect(list.id)}
                    aria-label="Select list"
                  />
                  <input
                    className="list-input title"
                    value={list.title}
                    onChange={(e) => updateListTitle(list.id, e.target.value)}
                  />
                  <div className="window-controls">
                    <button className={`color-btn ${paletteOpenId === list.id ? 'open' : ''}`} aria-label="Pick color" onClick={() => setPaletteOpenId(paletteOpenId === list.id ? null : list.id)}>
                      <span className="color-indicator" style={{ background: list.color || PALETTE[0] }} />
                    </button>
                    {paletteOpenId === list.id && (
                      <div className="color-palette" role="dialog" aria-label="Color palette">
                        {PALETTE.map(c => (
                          <button key={c} className={`color-swatch ${list.color === c ? 'selected' : ''}`} style={{ background: c }} onClick={() => setListColor(list.id, c)} aria-label={`Set color ${c}`} />
                        ))}
                      </div>
                    )}
                    <button className="close-btn" onClick={() => closeList(list.id)}>×</button>
                  </div>
                </div>
                <ul className="list-items">
                  {list.items.map((item, index) => {
                    const isEditing = editingItem && editingItem.listId === list.id && editingItem.index === index;
                    const isDraggingItem = draggedItem && draggedItem.listId === list.id && draggedItem.index === index;
                    const dragOverBefore = dragOverState && dragOverState.listId === list.id && dragOverState.index === index && dragOverState.position === 'before';
                    const dragOverAfter = dragOverState && dragOverState.listId === list.id && dragOverState.index === index && dragOverState.position === 'after';
                    return (
                      <li
                        key={item.id}
                        className={`list-item ${dragOverBefore ? 'drag-over-before' : ''} ${dragOverAfter ? 'drag-over-after' : ''} ${isEditing ? 'editing' : ''} ${isDraggingItem ? 'dragging' : ''}`}
                        draggable
                        onDragStart={(e) => onItemDragStart(e, list.id, index)}
                        onDragOver={(e) => onItemDragOver(e, list.id, index)}
                        onDrop={(e) => onItemDrop(e, list.id, index)}
                        onDragEnd={onItemDragEnd}
                      >
                        {isEditing ? (
                          <input
                            className="item-edit-input"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') saveEditing(); if (e.key === 'Escape') cancelEditing(); }}
                            onBlur={saveEditing}
                            autoFocus
                          />
                        ) : (
                          <>
                            <span className="item-text" onDoubleClick={() => startEditing(list.id, index, item.text)}>{item.text}</span>
                            <div className="item-actions">
                              <button className="remove-item" onClick={() => removeItem(list.id, index)}>Remove</button>
                            </div>
                          </>
                        )}
                      </li>
                    );
                  })}
                </ul>
                <div className="add-row">
                  <input
                    className="list-input add"
                    placeholder="Add item"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target.value) {
                        addItem(list.id, e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                  <button className="btn small" onClick={(e) => {
                    const input = e.target.previousElementSibling;
                    if (input && input.value) { addItem(list.id, input.value); input.value = ''; }
                  }}>Add</button>
                </div>
              </div>
            </Draggable>
          );
        })}

        {selectedIds.length > 0 && (
          <BatchToolbar
            selectedCount={selectedIds.length}
            onDelete={batchDelete}
            onColor={batchColor}
            onClose={closeBatch}
          />
        )}

        <CommandPalette
          show={showCommandPalette}
          onClose={() => {
            setShowCommandPalette(false);
            setActiveNav('canvas');
          }}
          onAction={handleCommandAction}
        />
      </main>

      <ThemeModal
        show={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        onCommit={handleThemeCommit}
      />
    </div>
  );
}

export default App;