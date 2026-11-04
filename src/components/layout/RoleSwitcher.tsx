import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Shield } from 'lucide-react';
import { useStore } from '../../store';
import { DEMO_USERS } from '../../data/seed';
import type { RoleKey } from '../../types';

const ROLE_ICONS: Record<RoleKey, string> = {
  owner: '👑', sales: '📋', buyer: '🛒', storekeeper: '📦',
  supervisor: '🏭', operator: '⚙️', qc: '🔍', maintenance: '🔧',
  dispatch: '🚚', auditor: '🔎',
};

export default function RoleSwitcher() {
  const { currentUser, switchRole } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] transition-colors text-sm"
        title="Switch demo role"
      >
        <Shield size={14} className="text-[var(--brand)]" />
        <span className="text-[var(--text)] font-medium hidden sm:inline">{currentUser.name}</span>
        <span className="text-[11px] text-[var(--text-2)] bg-[var(--surface-2)] px-1.5 py-0.5 rounded hidden sm:inline">
          {currentUser.role}
        </span>
        <ChevronDown size={14} className="text-[var(--text-3)]" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-72 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-[var(--border)] bg-[var(--surface-2)]">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-3)]">Demo Role Switcher</p>
            <p className="text-xs text-[var(--text-2)] mt-0.5">Switch to explore role-specific views</p>
          </div>
          <div className="py-1">
            {DEMO_USERS.map(user => (
              <button
                key={user.id}
                onClick={() => { switchRole(user.role); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-[var(--surface-2)] transition-colors text-left ${
                  currentUser.id === user.id ? 'bg-[var(--brand-50)]' : ''
                }`}
              >
                <span className="w-8 h-8 rounded-full bg-[var(--brand)] text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
                  {user.avatar}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[var(--text)]">{user.name}</div>
                  <div className="text-xs text-[var(--text-2)] capitalize">{ROLE_ICONS[user.role]} {user.role}</div>
                </div>
                {currentUser.id === user.id && (
                  <span className="w-2 h-2 rounded-full bg-[var(--brand)] flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
