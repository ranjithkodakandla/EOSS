import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { useStore } from '../../store';
import clsx from 'clsx';

const ICONS = {
  success: <CheckCircle size={16} className="text-[var(--success)]" />,
  error: <XCircle size={16} className="text-[var(--error)]" />,
  warning: <AlertTriangle size={16} className="text-[var(--warning)]" />,
  info: <Info size={16} className="text-[var(--info)]" />,
};

export default function Toast() {
  const { toasts, removeToast } = useStore();

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-start gap-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xl px-4 py-3 max-w-sm animate-in slide-in-from-right-2"
        >
          {ICONS[t.type]}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-[var(--text)]">{t.title}</div>
            {t.body && <div className="text-xs text-[var(--text-2)] mt-0.5">{t.body}</div>}
          </div>
          <button onClick={() => removeToast(t.id)} className="text-[var(--text-3)] hover:text-[var(--text)] flex-shrink-0">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
