'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, Share2 } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'share';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

let toastQueue: Toast[] = [];
let listeners: Array<(toasts: Toast[]) => void> = [];

export const showToast = (type: ToastType, message: string, duration = 3000) => {
  const id = Math.random().toString(36).substr(2, 9);
  const toast: Toast = { id, type, message, duration };
  toastQueue = [...toastQueue, toast];
  listeners.forEach(listener => listener(toastQueue));

  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }
};

const removeToast = (id: string) => {
  toastQueue = toastQueue.filter(t => t.id !== id);
  listeners.forEach(listener => listener(toastQueue));
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    listeners.push(setToasts);
    return () => {
      listeners = listeners.filter(l => l !== setToasts);
    };
  }, []);

  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-accent-green" />,
    error: <AlertCircle className="h-5 w-5 text-destructive" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
    share: <Share2 className="h-5 w-5 text-accent-green" />,
  };

  const bgColors = {
    success: 'bg-accent-green/10 border-accent-green/20',
    error: 'bg-destructive/10 border-destructive/20',
    info: 'bg-blue-500/10 border-blue-500/20',
    share: 'bg-accent-green/10 border-accent-green/20',
  };

  return (
    <div
      className={`
        ${bgColors[toast.type]}
        border rounded-2xl p-4 shadow-lg backdrop-blur-sm
        flex items-start gap-3 min-w-[300px]
        transition-all duration-300 ease-out
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
        animate-in slide-in-from-right
      `}
    >
      {icons[toast.type]}
      <p className="flex-1 text-sm font-medium text-foreground">{toast.message}</p>
      <button
        onClick={handleClose}
        className="shrink-0 hover:opacity-70 transition-opacity"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  );
}
