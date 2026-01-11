// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Toasts from './components/Toast';
import './index.css';

const MAX_URL_LENGTH = 50000;

// color palette used for windows
const PALETTE = ['#6C6AFF','#00D4FF','#FF7BA7','#FFD89B','#7FFFD4','#C7A0FF'];

function App() {
  const [lists, setLists] = useState([]);
  const [showHome, setShowHome] = useState(true);
  const nodeRefs = useRef({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [draggingIds, setDraggingIds] = useState([]);
  const [focusedId, setFocusedId] = useState(null);
  const [paletteOpenId, setPaletteOpenId] = useState(null);
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
        // Optionally truncate or handle overflow
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
      position: { x: Math.random() * 200, y: Math.random() * 200 }
    };
    setLists([...lists, newList]);
    setShowHome(false);
  };

  // ensure list items are objects when loading from URL / decoded data
  useEffect(() => {
    // normalize list items to objects if they are simple strings (backwards compatibility)
    setLists(prev => prev.map(list => ({
      ...list,
      items: (list.items || []).map(it => (typeof it === 'string' ? { id: Date.now() + Math.random(), text: it } : it))
    })));
  }, []);

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

  const closeList = (id) => {
    setLists(lists.filter(list => list.id !== id));
    // cleanup nodeRef to avoid memory leaks and stale refs
    if (nodeRefs.current[id]) delete nodeRefs.current[id];
    if (lists.length === 1) {
      setShowHome(true);
    }
  };

  const handleDragStop = (id, e, data) => {
    setLists(lists.map(list => list.id === id ? { ...list, position: { x: data.x, y: data.y } } : list));
  };

  // --- item reordering (drag & drop within a list) ---
  const [draggedItem, setDraggedItem] = useState(null); // { listId, index }
  const [dragOverState, setDragOverState] = useState(null); // { listId, index, position: 'before'|'after' }

  const reorderItem = (listId, fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    setLists(prev => prev.map(list => {
      if (list.id !== listId) return list;
      const items = [...list.items];
      const [moved] = items.splice(fromIndex, 1);
      // adjust target if necessary
      const insertIndex = Math.max(0, Math.min(toIndex, items.length));
      items.splice(insertIndex, 0, moved);
      return { ...list, items };
    }));
  };

  const onItemDragStart = (e, listId, index) => {
    try { e.dataTransfer.setData('text/plain', JSON.stringify({ listId, index })); } catch (_) {}
    // set a transparent drag image so the browser doesn't create a ghost
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
    // if dragging over the same item being dragged, ignore to prevent jitter
    let payload = null;
    try { payload = JSON.parse(e.dataTransfer.getData('text/plain')); } catch (_) { }
    if (payload && payload.listId === listId && payload.index === index) {
      setDragOverState(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    // use vertical midpoint for vertical lists
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
      // compute drop position at drop time (vertical midpoint) for accuracy
      const rect = e.currentTarget.getBoundingClientRect();
      const isBefore = e.clientY < (rect.top + rect.height / 2);
      let toIndex = index + (isBefore ? 0 : 1);
      // if moving forward, removing earlier shifts indices, adjust
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

  // --- inline editing for items ---
  const [editingItem, setEditingItem] = useState(null); // { listId, index }
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
      // items are objects {id,text}
      items[index] = { ...items[index], text: editingValue };
      return { ...list, items };
    }));
    setEditingItem(null);
    setEditingValue('');
  };

  const cancelEditing = () => { setEditingItem(null); setEditingValue(''); };

  const handleLogin = () => {
    alert('Login functionality not implemented in this serverless version.');
  };

  const openFromHistory = (id) => {
    setShowHome(false);
    setFocusedId(id);
    // clear highlight after a short delay
    setTimeout(() => setFocusedId(null), 2500);
  };

  // Toast system
  const [toasts, setToasts] = useState([]);
  const addToast = (toast) => {
    const id = Date.now() + Math.random();
    const t = { id, ...toast };
    setToasts(s => [...s, t]);
    // auto-dismiss after 4s if not a persistent toast
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
      // fallback: show toast with Copy action
      addToast({ message: 'Copy the URL manually', variant: 'info', actions: [{ label: 'Copy', onClick: () => { try { navigator.clipboard.writeText(url); } catch(e){} } }] });
    }
  };

  const requestClearAll = () => {
    addToast({
      message: 'Clear all lists? This cannot be undone.',
      variant: 'info',
      actions: [
        { label: 'Clear', onClick: () => { setLists([]); nodeRefs.current = {}; setShowHome(true); setSidebarOpen(false); addToast({ message: 'Lists cleared', variant: 'success' }); } }
      ]
    });
  };

  const saveNow = () => {
    addToast({ message: 'Save not implemented yet', variant: 'info' });
  };

  return (
    <div className="app">
      <Header onCreate={createList} onLogin={handleLogin} />
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onClear={requestClearAll}
        onToggle={() => setSidebarOpen(s => !s)}
        lists={lists}
        onOpenList={openFromHistory}
        onExport={exportUrl}
        onSave={saveNow}
      />

      <main ref={playgroundRef} className="playground" role="main">
        <div className="bg-glow" aria-hidden="true"></div>
        <Toasts toasts={toasts} onAction={handleToastAction} onClose={removeToast} />

        {lists.length === 0 && (
          <div className="empty-state">
            <h2>Welcome to Hit-List</h2>
            <p>Use <strong>Create List</strong> (top-right) to add draggable lists. Drag windows by their header to move them and share via URL.</p>
            <button className="btn primary" onClick={createList}>Create List</button>
          </div>
        )}

        {lists.map(list => {
          // ensure there's a stable ref object for each list to pass to Draggable
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
              <div ref={nodeRefs.current[list.id]} style={{ ['--accent-color']: list.color || PALETTE[0] }} className={`window ${isDragging ? 'dragging' : ''} ${focusedId === list.id ? 'focused' : ''}`}>
                <div className="window-header">
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

        {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)} aria-hidden={false}></div>}
      </main>
    </div>
  );
}

export default App;