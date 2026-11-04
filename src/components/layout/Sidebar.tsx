import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Briefcase, ShoppingBag, Package, FileText,
  BarChart2, Settings, Truck, Wrench, ClipboardCheck,
  Building2, Shield, ChevronLeft, ChevronRight, Activity,
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

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Command',
    items: [
      { path: '/', label: 'Business Pulse', icon: <Activity size={16} />, roles: ['owner', 'sales', 'buyer', 'storekeeper', 'supervisor', 'operator', 'qc', 'maintenance', 'dispatch', 'auditor'] },
      { path: '/reports', label: 'Reports', icon: <BarChart2 size={16} />, roles: ['owner', 'auditor'] },
    ],
  },
  {
    label: 'Commercial',
    items: [
      { path: '/sales', label: 'Sales', icon: <Briefcase size={16} />, roles: ['owner', 'sales', 'auditor'] },
      { path: '/suppliers', label: 'Suppliers', icon: <Building2 size={16} />, roles: ['owner', 'buyer', 'auditor'] },
      { path: '/procurement', label: 'Procurement', icon: <ShoppingBag size={16} />, roles: ['owner', 'buyer', 'storekeeper', 'supervisor', 'auditor'] },
    ],
  },
  {
    label: 'Operations',
    items: [
      { path: '/inventory', label: 'Inventory', icon: <Package size={16} />, roles: ['owner', 'buyer', 'storekeeper', 'supervisor', 'qc', 'auditor'] },
      { path: '/jobs', label: 'Jobs', icon: <ClipboardCheck size={16} />, roles: ['owner', 'supervisor', 'operator', 'qc', 'dispatch', 'auditor'] },
      { path: '/quality', label: 'Quality', icon: <Shield size={16} />, roles: ['owner', 'supervisor', 'qc', 'auditor'] },
      { path: '/assets', label: 'Assets', icon: <Wrench size={16} />, roles: ['owner', 'supervisor', 'maintenance', 'auditor'] },
      { path: '/dispatch', label: 'Dispatch', icon: <Truck size={16} />, roles: ['owner', 'sales', 'dispatch', 'auditor'] },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { path: '/documents', label: 'Documents', icon: <FileText size={16} />, roles: ['owner', 'sales', 'buyer', 'storekeeper', 'supervisor', 'qc', 'maintenance', 'dispatch', 'auditor'] },
      { path: '/admin', label: 'Admin', icon: <Settings size={16} />, roles: ['owner'] },
    ],
  },
];

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, currentUser } = useStore();
  const collapsed = sidebarCollapsed;

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 bottom-0 z-40 flex flex-col sidebar-transition hidden md:flex',
        collapsed ? 'w-[var(--sidebar-w-collapsed)]' : 'w-[var(--sidebar-w)]'
      )}
      style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)' }}
    >
      {/* Logo */}
      <div
        className={clsx(
          'flex items-center flex-shrink-0 h-[var(--topbar-h)]',
          collapsed ? 'justify-center' : 'px-4 gap-3'
        )}
        style={{ borderBottom: '1px solid var(--sidebar-border)' }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-white text-xs"
          style={{ background: 'var(--brand)', boxShadow: '0 0 0 1px rgba(255,255,255,0.1)' }}
        >
          E
        </div>
        {!collapsed && (
          <div>
            <div className="text-sm font-bold" style={{ color: 'var(--sidebar-text-active)', letterSpacing: '-0.01em' }}>EOSS</div>
            <div className="text-[10px] font-medium" style={{ color: 'var(--sidebar-text)', letterSpacing: '0.02em' }}>Shankar MFG · HYD</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 scrollbar-none">
        {NAV_GROUPS.map(group => {
          const visibleItems = group.items.filter(item => item.roles.includes(currentUser.role));
          if (visibleItems.length === 0) return null;
          return (
            <div key={group.label}>
              {!collapsed && (
                <div
                  className="px-4 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: 'var(--sidebar-section)' }}
                >
                  {group.label}
                </div>
              )}
              {collapsed && <div className="my-1 mx-3 h-px" style={{ background: 'var(--sidebar-border)' }} />}
              {visibleItems.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) => clsx(
                    'flex items-center gap-2.5 mx-2 my-0.5 rounded-lg transition-colors text-[13px] font-medium',
                    collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2',
                  )}
                  style={({ isActive }) => ({
                    background: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
                    color: isActive ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
                    ...(isActive ? { boxShadow: 'inset 2px 0 0 var(--brand)' } : {}),
                  })}
                  onMouseEnter={e => {
                    const el = e.currentTarget;
                    if (!el.classList.contains('active')) {
                      el.style.background = 'var(--sidebar-hover-bg)';
                      el.style.color = 'var(--sidebar-text-hover)';
                    }
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget;
                    if (!el.classList.contains('active')) {
                      el.style.background = 'transparent';
                      el.style.color = 'var(--sidebar-text)';
                    }
                  }}
                >
                  {item.icon}
                  {!collapsed && <span>{item.label}</span>}
                  {!collapsed && item.badge && (
                    <span className="ml-auto text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-semibold leading-none">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="flex-shrink-0 p-2" style={{ borderTop: '1px solid var(--sidebar-border)' }}>
        <button
          onClick={toggleSidebar}
          className={clsx(
            'flex items-center gap-2 w-full rounded-lg px-2 py-2 text-xs font-medium transition-colors',
            collapsed ? 'justify-center' : ''
          )}
          style={{ color: 'var(--sidebar-text)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--sidebar-hover-bg)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          {collapsed ? <ChevronRight size={15} /> : <><ChevronLeft size={15} /><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  );
}
