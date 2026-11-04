import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home, ShoppingCart, Package, Box, Activity, ShieldCheck,
  Wrench, Truck, Landmark, Users, FileText, BarChart3,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import clsx from 'clsx';
import { useStore } from '../../store';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Home', icon: <Home size={17} /> },
  { path: '/sales', label: 'Sales', icon: <ShoppingCart size={17} /> },
  { path: '/procurement', label: 'Procurement', icon: <Package size={17} /> },
  { path: '/inventory', label: 'Inventory', icon: <Box size={17} /> },
  { path: '/jobs', label: 'Production', icon: <Activity size={17} /> },
  { path: '/quality', label: 'Quality', icon: <ShieldCheck size={17} /> },
  { path: '/assets', label: 'Maintenance', icon: <Wrench size={17} /> },
  { path: '/dispatch', label: 'Dispatch', icon: <Truck size={17} /> },
  { path: '/reports', label: 'Finance', icon: <Landmark size={17} /> },
  { path: '/admin', label: 'People', icon: <Users size={17} /> },
  { path: '/documents', label: 'Documents', icon: <FileText size={17} /> },
  { path: '/reports', label: 'Reports', icon: <BarChart3 size={17} /> },
];

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useStore();
  const collapsed = sidebarCollapsed;

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 bottom-0 z-40 flex flex-col sidebar-transition hidden md:flex select-none',
        collapsed ? 'w-[var(--sidebar-w-collapsed,64px)]' : 'w-[var(--sidebar-width,216px)]'
      )}
      style={{
        background: 'var(--brand-primary-dark, var(--sidebar-bg))',
        borderRight: '1px solid var(--sidebar-border, rgba(255,255,255,0.08))',
      }}
    >
      {/* Brand Header */}
      <div
        className={clsx(
          'flex items-center flex-shrink-0 h-[64px] border-b',
          collapsed ? 'justify-center' : 'px-4 gap-3'
        )}
        style={{ borderColor: 'var(--sidebar-border, rgba(255,255,255,0.08))' }}
      >
        {/* Stylized Logo Mark: Dual rounded gradient pills */}
        <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center relative">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shadow-md relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, var(--brand-primary, #7048F5), var(--brand-secondary, #A855F7))',
            }}
          >
            <div className="w-4 h-1.5 bg-white rounded-full -rotate-45 transform -translate-x-0.5 -translate-y-1 shadow-sm" />
            <div className="w-4 h-1.5 bg-white/90 rounded-full -rotate-45 transform translate-x-0.5 translate-y-1 shadow-sm" />
          </div>
        </div>

        {!collapsed && (
          <div className="overflow-hidden leading-tight">
            <div className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>EOSS</span>
            </div>
            <div className="text-[10px] font-medium text-white/60 tracking-normal whitespace-nowrap">
              Business OS for SMEs
            </div>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1 scrollbar-none">
        {NAV_ITEMS.map((item, idx) => (
          <NavLink
            key={`${item.path}-${idx}`}
            to={item.path}
            end={item.path === '/'}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 rounded-xl transition-all duration-150 text-[13px] font-medium',
              collapsed ? 'justify-center p-2.5 mx-auto w-10 h-10' : 'px-3.5 py-2.5',
              isActive
                ? 'text-white shadow-md'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            )}
            style={({ isActive }) => ({
              background: isActive
                ? 'var(--sidebar-active-bg, linear-gradient(135deg, var(--brand-primary), var(--brand-secondary)))'
                : 'transparent',
              boxShadow: isActive
                ? '0 4px 14px -2px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
                : undefined,
            })}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!collapsed && <span className="truncate">{item.label}</span>}
            {!collapsed && item.badge && (
              <span className="ml-auto text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-semibold leading-none">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div
        className="flex-shrink-0 p-2.5 border-t"
        style={{ borderColor: 'var(--sidebar-border, rgba(255,255,255,0.08))' }}
      >
        <button
          onClick={toggleSidebar}
          className={clsx(
            'flex items-center gap-2 w-full rounded-lg px-2.5 py-2 text-xs font-medium text-white/60 hover:text-white hover:bg-white/10 transition-colors',
            collapsed ? 'justify-center' : ''
          )}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={15} /> : <><ChevronLeft size={15} /><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  );
}
