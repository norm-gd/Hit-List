import React from 'react';

export default function HitlistItem({
  listId,
  item,
  index,
  editingItem,
  editingValue,
  draggedItem,
  dragOverState,
  onItemDragStart,
  onItemDragOver,
  onItemDrop,
  onItemDragEnd,
  startEditing,
  saveEditing,
  cancelEditing,
  setEditingValue,
  removeItem
}) {
  const isEditing = editingItem && editingItem.listId === listId && editingItem.index === index;
  const isDraggingItem = draggedItem && draggedItem.listId === listId && draggedItem.index === index;
  const dragOverBefore = dragOverState && dragOverState.listId === listId && dragOverState.index === index && dragOverState.position === 'before';
  const dragOverAfter = dragOverState && dragOverState.listId === listId && dragOverState.index === index && dragOverState.position === 'after';

  return (
    <li
      key={item.id}
      className={`list-item ${dragOverBefore ? 'drag-over-before' : ''} ${dragOverAfter ? 'drag-over-after' : ''} ${isEditing ? 'editing' : ''} ${isDraggingItem ? 'dragging' : ''}`}
      draggable
      onDragStart={(e) => onItemDragStart(e, listId, index)}
      onDragOver={(e) => onItemDragOver(e, listId, index)}
      onDrop={(e) => onItemDrop(e, listId, index)}
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
          <span className="item-text" onDoubleClick={() => startEditing(listId, index, item.text)}>{item.text}</span>
          <div className="item-actions">
            <button className="remove-item" onClick={() => removeItem(listId, index)}>Remove</button>
          </div>
        </>
      )}
    </li>
  );
}
