import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

const ITEMS = [
  { to: '/inventory', label: 'Stock on hand', end: true },
  { to: '/products', label: 'Item master' },
  { to: '/transfers', label: 'Move stock' },
  { to: '/allocations', label: 'Site need' },
];

export default function StockWorkspaceNav() {
  return (
    <div className="flex-shrink-0 flex gap-1 px-3 overflow-x-auto border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      {ITEMS.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => clsx(
            'px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px',
            isActive ? 'border-[var(--brand)] text-[var(--brand)]' : 'border-transparent text-[var(--text-2)]'
          )}
        >
          {item.label}
        </NavLink>
      ))}
    </div>
  );
}
