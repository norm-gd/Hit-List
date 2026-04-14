import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Toasts from './components/Toast';
import BatchToolbar from './components/BatchToolbar';
import CommandPalette from './components/CommandPalette';
import ThemeModal from './components/ThemeModal';
import HitlistWindow from './components/HitlistWindow';
import { ToastProvider, useToastContext } from './context/ToastContext';
import { useLists } from './hooks/useLists';
import { useUrlSync } from './hooks/useUrlSync';
import { readUrlParams, buildShareUrl } from './utils/url';
import { normalizeItems } from './utils/list';
import { PALETTE } from './constants';
import './index.css';

function AppInner() {
  const { addToast, ...toastApi } = useToastContext();

  const urlParams = useRef(readUrlParams()).current;
  const normalizedLists = useRef(normalizeItems(urlParams.lists)).current;

  const [showHome, setShowHome] = useState(!urlParams.hasData);
  const [playgroundName, setPlaygroundName] = useState(() => {
    try { return localStorage.getItem('playgroundName') || 'Default Playground'; } catch { return 'Default Playground'; }
  });
  const [operatorName, setOperatorName] = useState(urlParams.operatorName);
  const [powerColor, setPowerColor] = useState(urlParams.powerColor);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [activeNav, setActiveNav] = useState('canvas');
  const playgroundRef = useRef(null);
  const rafRef = useRef(null);

  const listsApi = useLists(normalizedLists, setShowHome, addToast);
  useUrlSync({ lists: listsApi.lists, operatorName, powerColor });

  // apply theme from url on first render
  useEffect(() => {
    if (urlParams.powerColor !== '#f6ffc0') {
      document.documentElement.style.setProperty('--power-color', urlParams.powerColor);
    }
  }, []);

  // mouse tracking for background gradient
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

  // cmd+k shortcut
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
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCommandAction = (action) => {
    setShowCommandPalette(false);
    setActiveNav('canvas');
    switch (action) {
      case 'batchDelete':
        if (listsApi.selectedIds.length > 0) listsApi.batchDelete();
        else addToast({ message: 'No lists selected', variant: 'info' });
        break;
      case 'changeAccent': {
        const newAccent = PALETTE[Math.floor(Math.random() * PALETTE.length)];
        setPowerColor(newAccent);
        document.documentElement.style.setProperty('--power-color', newAccent);
        addToast({ message: 'Power color changed', variant: 'success' });
        break;
      }
      default:
        break;
    }
  };

  const handleNavClick = (navKey) => {
    setActiveNav(navKey);
    if (navKey === 'commands') setShowCommandPalette(true);
    else if (navKey === 'canvas') setShowCommandPalette(false);
  };

  const handleThemeCommit = (color) => {
    setPowerColor(color);
    document.documentElement.style.setProperty('--power-color', color);
    addToast({ message: 'Power color updated', variant: 'success' });
  };

  const handleBookmark = () => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    addToast({ message: `Press ${isMac ? 'Cmd+D' : 'Ctrl+D'} to bookmark this page`, variant: 'info' });
  };

  const exportUrl = () => {
    const url = buildShareUrl({ lists: listsApi.lists, operatorName, powerColor });
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => addToast({ message: 'Shareable URL copied to clipboard', variant: 'success' }));
    } else {
      addToast({ message: 'Copy the URL manually', variant: 'info', actions: [{ label: 'Copy', onClick: () => { try { navigator.clipboard.writeText(url); } catch(e){} } }] });
    }
  };

  return (
    <div className="app">
      <Header
        activeNav={activeNav}
        onNavClick={handleNavClick}
        onThemeClick={() => setShowThemeModal(true)}
        onSettingsClick={() => addToast({ message: 'You caught me, its still WIP...', variant: 'info' })}
      />
      <Sidebar
        activeNav={activeNav}
        onClear={listsApi.requestClearAll}
        lists={listsApi.lists}
        onOpenList={listsApi.openFromHistory}
        onCopy={exportUrl}
        onBookmark={handleBookmark}
        onCreate={() => listsApi.createList(playgroundName)}
        onNavClick={handleNavClick}
        onThemeClick={() => setShowThemeModal(true)}
        onLogoutClick={() => addToast({ message: 'You caught me. New feature WIP...', variant: 'info' })}
        operatorName={operatorName}
        onOperatorNameChange={setOperatorName}
      />

      <main ref={playgroundRef} className="playground" role="main">
        <div className="bg-glow" aria-hidden="true"></div>
        <Toasts toasts={toastApi.toasts} onAction={toastApi.handleToastAction} onClose={toastApi.removeToast} />

        {listsApi.lists.length === 0 && (
          <div className="empty-state">
            <h1>HITLIST</h1>
            <p className="empty-state-subtitle">CREATE AND MANAGE YOUR TASKS</p>
            <div className="home-playground">
              <label className="muted uppercase">DEFAULT PLAYGROUND NAME</label>
              <input value={playgroundName} onChange={(e) => { setPlaygroundName(e.target.value); try { localStorage.setItem('playgroundName', e.target.value); } catch(e){} }} placeholder="Default Playground" />
            </div>
            <button className="btn primary large" onClick={() => listsApi.createList(playgroundName)}>CREATE LIST</button>
          </div>
        )}

        {listsApi.lists.map(list => {
          if (!listsApi.nodeRefs.current[list.id]) listsApi.nodeRefs.current[list.id] = React.createRef();
          return (
            <HitlistWindow
              key={list.id}
              list={list}
              nodeRef={listsApi.nodeRefs.current[list.id]}
              isDragging={listsApi.draggingIds.includes(list.id)}
              isFocused={listsApi.focusedId === list.id}
              isSelected={listsApi.selectedIds.includes(list.id)}
              paletteOpenId={listsApi.paletteOpenId}
              draggingIds={listsApi.draggingIds}
              setDraggingIds={listsApi.setDraggingIds}
              selectedIds={listsApi.selectedIds}
              handleDragStop={listsApi.handleDragStop}
              setListColor={listsApi.setListColor}
              updateListTitle={listsApi.updateListTitle}
              setPaletteOpenId={listsApi.setPaletteOpenId}
              closeList={listsApi.closeList}
              toggleSelect={listsApi.toggleSelect}
              addItem={listsApi.addItem}
              editingItem={listsApi.editingItem}
              editingValue={listsApi.editingValue}
              draggedItem={listsApi.draggedItem}
              dragOverState={listsApi.dragOverState}
              onItemDragStart={listsApi.onItemDragStart}
              onItemDragOver={listsApi.onItemDragOver}
              onItemDrop={listsApi.onItemDrop}
              onItemDragEnd={listsApi.onItemDragEnd}
              startEditing={listsApi.startEditing}
              saveEditing={listsApi.saveEditing}
              cancelEditing={listsApi.cancelEditing}
              setEditingValue={listsApi.setEditingValue}
              removeItem={listsApi.removeItem}
            />
          );
        })}

        {listsApi.selectedIds.length > 0 && (
          <BatchToolbar
            selectedCount={listsApi.selectedIds.length}
            onDelete={listsApi.batchDelete}
            onColor={listsApi.batchColor}
            onClose={listsApi.closeBatch}
          />
        )}

        <CommandPalette
          show={showCommandPalette}
          onClose={() => { setShowCommandPalette(false); setActiveNav('canvas'); }}
          onAction={handleCommandAction}
        />
      </main>

      <ThemeModal
        show={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        onCommit={handleThemeCommit}
        initialColor={powerColor}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  );
}
