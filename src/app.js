// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Toasts from './components/Toast';
import './index.css';

const MAX_URL_LENGTH = 50000;

function App() {
  const [lists, setLists] = useState([]);
  const [showHome, setShowHome] = useState(true);
  const nodeRefs = useRef({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [draggingIds, setDraggingIds] = useState([]);
  const [focusedId, setFocusedId] = useState(null);
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
      position: { x: Math.random() * 200, y: Math.random() * 200 }
    };
    setLists([...lists, newList]);
    setShowHome(false);
  };

  const updateListTitle = (id, newTitle) => {
    setLists(lists.map(list => list.id === id ? { ...list, title: newTitle } : list));
  };

  const addItem = (id, item) => {
    setLists(lists.map(list => list.id === id ? { ...list, items: [...list.items, item] } : list));
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
              <div ref={nodeRefs.current[list.id]} className={`window ${isDragging ? 'dragging' : ''} ${focusedId === list.id ? 'focused' : ''}`}>
                <div className="window-header">
                  <input
                    className="list-input title"
                    value={list.title}
                    onChange={(e) => updateListTitle(list.id, e.target.value)}
                  />
                  <div className="window-controls">
                    <button className="icon-btn" aria-label="More actions">⋯</button>
                    <button className="close-btn" onClick={() => closeList(list.id)}>×</button>
                  </div>
                </div>
                <ul className="list-items">
                  {list.items.map((item, index) => (
                    <li key={index} className="list-item">
                      <span className="item-text">{item}</span>
                      <button className="remove-item" onClick={() => removeItem(list.id, index)}>Remove</button>
                    </li>
                  ))}
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