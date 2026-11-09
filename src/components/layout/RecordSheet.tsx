import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface Action {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

interface Props {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  primary?: Action;
  secondary?: Action;
  width?: 'md' | 'lg';
}

/**
 * One pattern for create, edit, and record detail:
 * right-hand sheet on desktop, full-screen sheet on a phone.
 * The job workspace stays a full page because it is a multi-stage board, not a form.
 */
export default function RecordSheet({ title, subtitle, onClose, children, primary, secondary, width = 'md' }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const panel = width === 'lg' ? 'md:w-[min(760px,92vw)]' : 'md:w-[min(520px,92vw)]';

  return createPortal(
    <div className="fixed inset-0 z-[70] flex justify-end bg-black/40" role="presentation">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Close" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative h-full w-full ${panel} bg-[var(--surface)] text-[var(--text)] shadow-2xl flex flex-col`}
        style={{ borderLeft: '1px solid var(--border)' }}
      >
        <header className="flex-shrink-0 h-14 px-4 flex items-center gap-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold truncate">{title}</h2>
            {subtitle && <p className="text-[11px] text-[var(--text-2)] truncate">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--surface-2)]" aria-label="Close">
            <X size={16} />
          </button>
        </header>
        <div className="flex-1 min-h-0 overflow-auto px-4 py-4">{children}</div>
        {(primary || secondary) && (
          <footer className="flex-shrink-0 px-4 py-3 border-t flex items-center gap-2" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            {secondary && (
              <button type="button" onClick={secondary.onClick} className="px-4 py-2 rounded-xl border text-sm" style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}>
                {secondary.label}
              </button>
            )}
            <div className="flex-1" />
            {primary && (
              <button
                type="button"
                onClick={primary.onClick}
                disabled={primary.disabled}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: 'var(--brand)' }}
              >
                {primary.label}
              </button>
            )}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}
