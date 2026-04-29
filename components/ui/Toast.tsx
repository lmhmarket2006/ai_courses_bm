'use client';

import React, { createContext, useCallback, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  show: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLES: Record<ToastVariant, { bg: string; icon: React.ReactNode; ring: string }> = {
  success: {
    bg: 'bg-emerald-50 text-emerald-900',
    ring: 'ring-emerald-200',
    icon: <CheckCircle2 size={18} className="text-emerald-600" />,
  },
  error: {
    bg: 'bg-red-50 text-red-900',
    ring: 'ring-red-200',
    icon: <AlertCircle size={18} className="text-red-600" />,
  },
  info: {
    bg: 'bg-slate-900 text-white',
    ring: 'ring-slate-700',
    icon: <Info size={18} className="text-white" />,
  },
};

/**
 * مزوّد الـ Toasts. يجب أن يلفّ التطبيق كله في `app/layout.tsx`.
 *
 * استخدامه:
 * ```tsx
 * const { show } = useToast();
 * show('تم الحفظ بنجاح', 'success');
 * ```
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, variant }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
        aria-atomic="true"
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const styles = VARIANT_STYLES[toast.variant];

  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), 3500);
    return () => clearTimeout(t);
  }, [toast.id, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className={`pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl ring-1 ${styles.bg} ${styles.ring} font-bold text-sm min-w-[260px]`}
      role="alert"
    >
      {styles.icon}
      <span className="flex-1">{toast.message}</span>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="إغلاق التنبيه"
        className="opacity-50 hover:opacity-100 transition-opacity"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

/** Hook للوصول إلى الـ Toast. يجب أن يكون داخل `<ToastProvider>`. */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within <ToastProvider>');
  }
  return ctx;
}
