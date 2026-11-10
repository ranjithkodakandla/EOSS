import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';

export type WorkspaceNavItem = { id: string; label: string; to: string };

export default function WorkspaceNav({ items, activeId }: { items: WorkspaceNavItem[]; activeId: string }) {
  const location = useLocation();
  return (
    <nav aria-label="Workspace sections" className="flex items-center gap-0 px-6 border-b overflow-x-auto" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      {items.map(item => {
        const active = item.id === activeId;
        const to = `${item.to}${location.search && item.id !== activeId ? `?from=${encodeURIComponent(location.pathname + location.search)}` : ''}`;
        return (
          <Link key={item.id} to={to} className={clsx('relative px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors', active && 'font-semibold')} style={{ color: active ? 'var(--brand)' : 'var(--text-2)' }}>
            {item.label}
            {active && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full" style={{ background: 'var(--brand)' }} />}
          </Link>
        );
      })}
    </nav>
  );
}
