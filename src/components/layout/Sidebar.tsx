import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Briefcase, ShoppingBag, Package, Users, FileText,
  BarChart2, Settings, Truck, Wrench, ClipboardCheck, ChevronLeft, ChevronRight,
  Building2, Shield
} from 'lucide-react';
import clsx from 'clsx';
import { useStore } from '../../store';
import type { RoleKey } from '../../types';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  roles: RoleKey[];
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Business Pulse', icon: <LayoutDashboard size={18} />, roles: ['owner', 'sales', 'buyer', 'storekeeper', 'supervisor', 'operator', 'qc', 'maintenance', 'dispatch', 'auditor'] },
  { path: '/sales', label: 'Sales', icon: <Briefcase size={18} />, roles: ['owner', 'sales', 'auditor'] },
  { path: '/suppliers', label: 'Suppliers', icon: <Building2 size={18} />, roles: ['owner', 'buyer', 'auditor'] },
  { path: '/procurement', label: 'Procurement', icon: <ShoppingBag size={18} />, roles: ['owner', 'buyer', 'storekeeper', 'supervisor', 'auditor'] },
  { path: '/inventory', label: 'Inventory', icon: <Package size={18} />, roles: ['owner', 'buyer', 'storekeeper', 'supervisor', 'qc', 'auditor'] },
  { path: '/jobs', label: 'Jobs', icon: <ClipboardCheck size={18} />, roles: ['owner', 'supervisor', 'operator', 'qc', 'dispatch', 'auditor'] },
  { path: '/quality', label: 'Quality', icon: <Shield size={18} />, roles: ['owner', 'supervisor', 'qc', 'auditor'] },
  { path: '/assets', label: 'Assets', icon: <Wrench size={18} />, roles: ['owner', 'supervisor', 'maintenance', 'auditor'] },
  { path: '/dispatch', label: 'Dispatch', icon: <Truck size={18} />, roles: ['owner', 'sales', 'dispatch', 'auditor'] },
  { path: '/documents', label: 'Documents', icon: <FileText size={18} />, roles: ['owner', 'sales', 'buyer', 'storekeeper', 'supervisor', 'qc', 'maintenance', 'dispatch', 'auditor'] },
  { path: '/reports', label: 'Reports', icon: <BarChart2 size={18} />, roles: ['owner', 'auditor'] },
  { path: '/admin', label: 'Admin', icon: <Settings size={18} />, roles: ['owner'] },
];

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, currentUser } = useStore();
  const collapsed = sidebarCollapsed;

  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(currentUser.role));

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 bottom-0 z-40 bg-[var(--surface)] border-r border-[var(--border)] flex flex-col sidebar-transition hidden md:flex',
        collapsed ? 'w-[var(--sidebar-w-collapsed)]' : 'w-[var(--sidebar-w)]'
      )}
    >
      {/* Logo */}
      <div className={clsx(
        'flex items-center border-b border-[var(--border)] flex-shrink-0',
        collapsed ? 'h-[var(--topbar-h)] justify-center' : 'h-[var(--topbar-h)] px-4 gap-3'
      )}>
        <div className="w-7 h-7 bg-[var(--brand)] rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">E</span>
        </div>
        {!collapsed && (
          <div>
            <div className="text-sm font-bold text-[var(--text)]">EOSS</div>
            <div className="text-[10px] text-[var(--text-3)] -mt-0.5">Shankar MFG</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 scrollbar-none">
        {visibleItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 mx-2 my-0.5 rounded-lg transition-colors',
              collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
              isActive
                ? 'bg-[var(--brand)] text-white'
                : 'text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
            )}
          >
            {item.icon}
            {!collapsed && <span className="text-[13px] font-medium">{item.label}</span>}
            {!collapsed && item.badge && (
              <span className="ml-auto text-[10px] bg-[var(--error)] text-white px-1.5 py-0.5 rounded-full font-semibold">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-[var(--border)] p-2 flex-shrink-0">
        <button
          onClick={toggleSidebar}
          className={clsx(
            'flex items-center gap-2 w-full rounded-lg px-2 py-2 text-[var(--text-3)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition-colors',
            collapsed ? 'justify-center' : ''
          )}
        >
          {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span className="text-xs">Collapse</span></>}
        </button>
      </div>
    </aside>
  );
}
