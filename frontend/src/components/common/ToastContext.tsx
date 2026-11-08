import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

export interface ToastContextType {
  showToast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  addToast: (type: ToastType, message: string, title?: string, duration?: number) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', title?: string, duration: number = 3800) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts((prev) => [newToast, ...prev].slice(0, 5)); // максимум 5 тоастов одновременно

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, title?: string) => showToast(message, 'success', title),
    [showToast]
  );
  const error = useCallback(
    (message: string, title?: string) => showToast(message, 'error', title),
    [showToast]
  );
  const info = useCallback(
    (message: string, title?: string) => showToast(message, 'info', title),
    [showToast]
  );
  const warning = useCallback(
    (message: string, title?: string) => showToast(message, 'warning', title),
    [showToast]
  );
  const addToast = useCallback(
    (type: ToastType, message: string, title?: string, duration?: number) => showToast(message, type, title, duration),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, addToast, success, error, info, warning }}>
      {children}
      {/* Контейнер тоастов: Apple Dynamic Stack в правом верхнем углу */}
      <div
        aria-live="polite"
        style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          pointerEvents: 'none',
          maxWidth: 'min(420px, calc(100vw - 32px))',
          width: '100%'
        }}
      >
        {toasts.map((toast) => {
          const config = {
            success: {
              border: '#10b981',
              bgLight: 'rgba(255, 255, 255, 0.96)',
              icon: <CheckCircle2 size={18} color="#10b981" />,
              badgeBg: 'rgba(16, 185, 129, 0.12)',
              defaultTitle: 'Успешно'
            },
            error: {
              border: '#ef4444',
              bgLight: 'rgba(255, 255, 255, 0.96)',
              icon: <AlertCircle size={18} color="#ef4444" />,
              badgeBg: 'rgba(239, 68, 68, 0.12)',
              defaultTitle: 'Ошибка'
            },
            warning: {
              border: '#f59e0b',
              bgLight: 'rgba(255, 255, 255, 0.96)',
              icon: <AlertTriangle size={18} color="#f59e0b" />,
              badgeBg: 'rgba(245, 158, 11, 0.12)',
              defaultTitle: 'Внимание'
            },
            info: {
              border: '#0077ff',
              bgLight: 'rgba(255, 255, 255, 0.96)',
              icon: <Info size={18} color="#0077ff" />,
              badgeBg: 'rgba(0, 119, 255, 0.12)',
              defaultTitle: 'Уведомление'
            }
          }[toast.type];

          return (
            <div
              key={toast.id}
              role="alert"
              style={{
                pointerEvents: 'auto',
                background: config.bgLight,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: `1.5px solid ${config.border}`,
                borderRadius: 14,
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.14), 0 2px 8px rgba(0, 0, 0, 0.06)',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                animation: 'toastSlideIn 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
                color: '#0f172a'
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: config.badgeBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {config.icon}
              </div>

              <div style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', lineHeight: 1.25 }}>
                  {toast.title || config.defaultTitle}
                </div>
                <div style={{ fontSize: 12, color: '#334155', marginTop: 3, lineHeight: 1.45, wordBreak: 'break-word' }}>
                  {toast.message}
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                aria-label="Закрыть уведомление"
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 4,
                  cursor: 'pointer',
                  color: '#94a3b8',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'color 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
