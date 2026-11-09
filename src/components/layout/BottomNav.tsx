import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Package, ClipboardCheck, Settings } from 'lucide-react';
import clsx from 'clsx';
import { useStore } from '../../store';

const MOBILE_NAV = [
  { path: '/', label: 'Home', icon: <LayoutDashboard size={20} />, end: true },
  { path: '/jobs', label: 'Jobs', icon: <ClipboardCheck size={20} /> },
  { path: '/inventory', label: 'Stock', icon: <Package size={20} /> },
  { path: '/sales', label: 'Sales', icon: <Briefcase size={20} /> },
  { path: '/admin', label: 'Admin', icon: <Settings size={20} /> },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface)] border-t border-[var(--border)] bottom-nav flex md:hidden">
      {MOBILE_NAV.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.end}
          className={({ isActive }) => clsx(
            'flex-1 flex flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors',
            isActive ? 'text-[var(--brand)]' : 'text-[var(--text-3)]'
          )}
        >
          {item.icon}
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
