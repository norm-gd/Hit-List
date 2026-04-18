import { useState, useRef } from 'react';
import { PALETTE } from '../constants';
import { createNewList } from '../utils/list';

export function useLists(initialLists, setShowHome, addToast) {
  const [lists, setLists] = useState(initialLists); // blank lists 
  const [draggingIds, setDraggingIds] = useState([]); // save list position 
  const [focusedId, setFocusedId] = useState(null);
  const [paletteOpenId, setPaletteOpenId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]); // selected lists 
  const [editingItem, setEditingItem] = useState(null); 
  const [editingValue, setEditingValue] = useState('');
  const [draggedItem, setDraggedItem] = useState(null); // enable dragging accross canvas 
  const [dragOverState, setDragOverState] = useState(null); 
  const nodeRefs = useRef({});

  const createList = (playgroundName) => {
    const newList = createNewList(playgroundName);
    setLists(prev => [...prev, newList]);
    setShowHome(false);
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

  const closeList = (id) => {
    setLists(prevLists => {
      const filtered = prevLists.filter(list => list.id !== id);
      if (filtered.length === 0) {
        setShowHome(true);
      }
      return filtered;
    });
    if (nodeRefs.current[id]) {
      delete nodeRefs.current[id];
    }
  };

  const handleDragStop = (id, e, data) => {
    setLists(lists.map(list => list.id === id ? { ...list, position: { x: data.x, y: data.y } } : list));
  };

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
    try { payload = JSON.parse(e.dataTransfer.getData('text/plain')); } catch (_) {}
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
    try { payload = JSON.parse(e.dataTransfer.getData('text/plain')); } catch (_) {}
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

  const cancelEditing = () => {
    setEditingItem(null);
    setEditingValue('');
  };

  const toggleSelect = (listId) => {
    setSelectedIds(prev =>
      prev.includes(listId) ? prev.filter(id => id !== listId) : [...prev, listId]
    );
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
        {
          label: 'Clear',
          onClick: () => {
            setLists([]);
            nodeRefs.current = {};
            setShowHome(true);
            addToast({ message: 'Lists cleared', variant: 'success' });
          }
        }
      ]
    });
  };

  const openFromHistory = (id) => {
    setShowHome(false);
    setFocusedId(id);
    setTimeout(() => setFocusedId(null), 2500);
  };

  return {
    lists,
    setLists,
    draggingIds,
    setDraggingIds,
    focusedId,
    paletteOpenId,
    selectedIds,
    editingItem,
    editingValue,
    setEditingValue,
    draggedItem,
    dragOverState,
    nodeRefs,
    createList,
    setListColor,
    updateListTitle,
    addItem,
    removeItem,
    closeList,
    handleDragStop,
    onItemDragStart,
    onItemDragOver,
    onItemDrop,
    onItemDragEnd,
    startEditing,
    saveEditing,
    cancelEditing,
    toggleSelect,
    batchDelete,
    batchColor,
    closeBatch,
    requestClearAll,
    openFromHistory
  };
}
