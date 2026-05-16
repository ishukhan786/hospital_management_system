import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { ToastMessage } from '../../types';

export const Toast: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<ToastMessage>;
      setToasts(prev => [...prev, customEvent.detail]);
    };

    window.addEventListener('hms_toast', handleToast);
    return () => window.removeEventListener('hms_toast', handleToast);
  }, []);

  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        setToasts(prev => prev.slice(1));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toasts]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      maxWidth: '400px'
    }}>
      {toasts.map(toast => {
        const bg = toast.type === 'success' ? '#16a34a' :
                   toast.type === 'error' ? '#e11d48' :
                   toast.type === 'warning' ? '#d97706' : '#0284c7';

        return (
          <div key={toast.id} style={{
            background: bg,
            color: 'white',
            padding: '16px 20px',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            animation: 'scaleUp 0.2s ease-out',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {toast.type === 'success' && <CheckCircle size={24} />}
              {toast.type === 'error' && <AlertCircle size={24} />}
              {toast.type === 'warning' && <AlertTriangle size={24} />}
              {toast.type === 'info' && <Info size={24} />}
              <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                opacity: 0.8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export const showToast = (message: string, type: ToastMessage['type'] = 'success') => {
  const event = new CustomEvent<ToastMessage>('hms_toast', {
    detail: { id: `toast-${Date.now()}`, message, type }
  });
  window.dispatchEvent(event);
};
