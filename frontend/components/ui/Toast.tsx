'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toast: (opts: Omit<Toast, 'id'>) => void;
  success: (title: string, description?: string) => void;
  error:   (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info:    (title: string, description?: string) => void;
}

// ─── Context ──────────────────────────────────────────────────
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// ─── Config ───────────────────────────────────────────────────
const ICONS: Record<ToastType, React.ElementType> = {
  success: CheckCircle2,
  error:   XCircle,
  warning: AlertTriangle,
  info:    Info,
};

const STYLES: Record<ToastType, { container: string; icon: string }> = {
  success: {
    container: 'border-emerald-500/30 bg-emerald-950/80',
    icon: 'text-emerald-400',
  },
  error: {
    container: 'border-red-500/30 bg-red-950/80',
    icon: 'text-red-400',
  },
  warning: {
    container: 'border-amber-500/30 bg-amber-950/80',
    icon: 'text-amber-400',
  },
  info: {
    container: 'border-blue-500/30 bg-blue-950/80',
    icon: 'text-blue-400',
  },
};

// ─── Single Toast Component ────────────────────────────────────
function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const Icon = ICONS[toast.type];
  const style = STYLES[toast.type];

  React.useEffect(() => {
    const timer = setTimeout(
      () => onDismiss(toast.id),
      toast.duration ?? 4000
    );
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0,  scale: 1    }}
      exit={{    opacity: 0, x: 60, scale: 0.95  }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`
        flex items-start gap-3 w-full max-w-sm rounded-xl border px-4 py-3
        shadow-2xl backdrop-blur-md cursor-pointer select-none
        ${style.container}
      `}
      onClick={() => onDismiss(toast.id)}
    >
      <Icon size={18} className={`mt-0.5 shrink-0 ${style.icon}`} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white leading-snug">
          {toast.title}
        </p>
        {toast.description && (
          <p className="text-xs text-white/60 mt-0.5 leading-relaxed">
            {toast.description}
          </p>
        )}
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onDismiss(toast.id); }}
        className="shrink-0 text-white/40 hover:text-white/80 transition-colors mt-0.5"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

// ─── Provider ─────────────────────────────────────────────────
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((opts: Omit<Toast, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev.slice(-4), { ...opts, id }]); // max 5 visible
  }, []);

  const success = useCallback((title: string, description?: string) =>
    toast({ type: 'success', title, description }), [toast]);
  const error   = useCallback((title: string, description?: string) =>
    toast({ type: 'error', title, description }), [toast]);
  const warning = useCallback((title: string, description?: string) =>
    toast({ type: 'warning', title, description }), [toast]);
  const info    = useCallback((title: string, description?: string) =>
    toast({ type: 'info', title, description }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}

      {/* Toast container — bottom-right */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto">
              <ToastItem toast={t} onDismiss={dismiss} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────
export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
