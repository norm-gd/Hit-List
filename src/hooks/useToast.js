import { useState } from 'react';

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now() + Math.random();  // id = utc_timestamp + Random_Int
    const t = { id, ...toast };
    setToasts(s => [...s, t]);
    setTimeout(() => {
      setToasts(s => s.filter(x => x.id !== id));
    }, 4000); // toast timeout -> 4secs 
    return id;
  };

  const removeToast = (id) => setToasts(s => s.filter(x => x.id !== id)); // garbage collection 

  const handleToastAction = (id, action) => {
    if (action && action.onClick) action.onClick(); // click -> dismiss 
    removeToast(id);
  };

  return { toasts, addToast, removeToast, handleToastAction };
}
