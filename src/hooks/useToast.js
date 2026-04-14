import { useState } from 'react';

export function useToast() {
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

  return { toasts, addToast, removeToast, handleToastAction };
}
