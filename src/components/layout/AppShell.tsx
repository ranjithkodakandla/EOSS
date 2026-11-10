import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import Toast from '../feedback/Toast';
import { useStore } from '../../store';
import clsx from 'clsx';

function installTableSorting() {
  const state = new WeakMap<HTMLTableElement, { column: number; direction: 'asc' | 'desc' }>();
  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

  const valueFor = (cell: HTMLTableCellElement) => {
    const text = cell.innerText.trim();
    const numberText = text.replace(/[₹$€£,%\s]/g, '').replace(/,/g, '');
    if (numberText && /^-?\d+(\.\d+)?$/.test(numberText)) return Number(numberText);
    return text;
  };

  const compare = (a: unknown, b: unknown) => {
    if (a === '' && b === '') return 0;
    if (a === '') return 1;
    if (b === '') return -1;
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    return collator.compare(String(a), String(b));
  };

  const enhance = (table: HTMLTableElement) => {
    const headerRow = table.tHead?.rows[0];
    const body = table.tBodies[0];
    if (!headerRow || !body) return;

    Array.from(headerRow.cells).forEach((header, column) => {
      if (header.querySelector('button') || !header.innerText.trim()) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'eoss-table-sort-button';
      button.title = `Sort by ${header.innerText.trim()}`;
      button.style.cssText = 'display:inline-flex;align-items:center;gap:4px;background:none;border:0;padding:0;font:inherit;color:inherit;cursor:pointer;text-align:left;';
      while (header.firstChild) button.appendChild(header.firstChild);
      const indicator = document.createElement('span');
      indicator.setAttribute('aria-hidden', 'true');
      indicator.textContent = '↕';
      indicator.style.opacity = '0.4';
      button.appendChild(indicator);
      header.appendChild(button);

      button.addEventListener('click', event => {
        event.stopPropagation();
        const previous = state.get(table);
        const direction = previous?.column === column && previous.direction === 'asc' ? 'desc' : 'asc';
        state.set(table, { column, direction });
        const rows = Array.from(body.rows);
        rows.sort((rowA, rowB) => {
          const a = rowA.cells[column];
          const b = rowB.cells[column];
          if (!a || !b) return 0;
          const result = compare(valueFor(a), valueFor(b));
          return direction === 'asc' ? result : -result;
        });
        body.append(...rows);
        Array.from(headerRow.cells).forEach(cell => {
          const current = cell.querySelector('.eoss-table-sort-indicator') as HTMLElement | null;
          if (current) current.textContent = '↕';
          cell.removeAttribute('aria-sort');
        });
        indicator.className = 'eoss-table-sort-indicator';
        indicator.textContent = direction === 'asc' ? '↑' : '↓';
        indicator.style.opacity = '1';
        header.setAttribute('aria-sort', direction === 'asc' ? 'ascending' : 'descending');
      });
    });
  };

  const scan = () => document.querySelectorAll<HTMLTableElement>('table').forEach(enhance);
  scan();
  const observer = new MutationObserver(scan);
  observer.observe(document.getElementById('root') ?? document.body, { childList: true, subtree: true });
  return () => observer.disconnect();
}

export default function AppShell() {
  const { sidebarCollapsed } = useStore();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => installTableSorting(), []);

  return (
    <div className={clsx('min-h-screen bg-[var(--app-bg,var(--bg))] text-[var(--text)]')}>
      {mobileNavOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="md:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
      <Sidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <TopBar onOpenMenu={() => setMobileNavOpen(true)} />
      <main
        className={clsx(
          'pt-[var(--topbar-h)] pb-16 md:pb-0 min-h-screen transition-[margin] duration-200',
          sidebarCollapsed ? 'md:ml-[var(--sidebar-w-collapsed)]' : 'md:ml-[var(--sidebar-width,var(--sidebar-w))]'
        )}
      >
        <Outlet />
      </main>
      <BottomNav />
      <Toast />
    </div>
  );
}
