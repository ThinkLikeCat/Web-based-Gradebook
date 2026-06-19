import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { PlannedWork } from '../../types';

type ToastItem = {
  id: string;
  work: PlannedWork;
  removing: boolean;
};

export function ToastContainer({ notifications }: { notifications: PlannedWork[] }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    if (notifications.length === 0) return;
    const newItems = notifications
      .filter(n => !toasts.some(t => t.id === n.id))
      .map(n => ({ id: n.id, work: n, removing: false }));
    if (newItems.length === 0) return;
    setToasts(prev => [...newItems, ...prev].slice(0, 5));

    newItems.forEach(item => {
      setTimeout(() => {
        setToasts(prev => prev.map(t => t.id === item.id ? { ...t, removing: true } : t));
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== item.id));
        }, 300);
      }, 4000);
    });
  }, [notifications]);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast ${toast.removing ? 'removing' : ''}`}>
          <Bell size={20} />
          <div>
            <strong>Новое задание</strong>
            <span>{toast.work.subject} · {toast.work.title}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
