import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

type Toast = { id: number; message: string; variant?: 'default' | 'success' | 'error' };

const ToastContext = createContext<{ show: (message: string, variant?: Toast['variant']) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const show = useCallback((message: string, variant: Toast['variant'] = 'default') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2200);
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof window !== 'undefined' && createPortal(
        <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex max-w-sm flex-col gap-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={
                'pointer-events-auto rounded-md border bg-white px-3 py-2 text-sm shadow dark:border-neutral-700 dark:bg-neutral-900 ' +
                (t.variant === 'success' ? 'border-green-300 dark:border-green-700' : t.variant === 'error' ? 'border-red-300 dark:border-red-700' : '')
              }
            >
              {t.message}
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}

