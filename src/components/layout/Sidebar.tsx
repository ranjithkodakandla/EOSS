import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home, ShoppingCart, Package, Box, Activity, ShieldCheck,
  Wrench, Truck, Users, FileText, BarChart3,
  ChevronLeft, ChevronRight, Store, Landmark, Settings, History,
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
  { path: '/sales', label: 'Sales & Orders', icon: <ShoppingCart size={17} /> },
  { path: '/suppliers', label: 'Suppliers', icon: <Store size={17} /> },
  { path: '/procurement', label: 'Procurement', icon: <Package size={17} /> },
  { path: '/inventory', label: 'Inventory', icon: <Box size={17} /> },
  { path: '/jobs', label: 'Production', icon: <Activity size={17} /> },
  { path: '/quality', label: 'Quality', icon: <ShieldCheck size={17} /> },
  { path: '/assets', label: 'Maintenance', icon: <Wrench size={17} /> },
  { path: '/dispatch', label: 'Dispatch', icon: <Truck size={17} /> },
  { path: '/finance', label: 'Finance', icon: <Landmark size={17} /> },
  { path: '/documents', label: 'Documents', icon: <FileText size={17} /> },
  { path: '/reports', label: 'Reports', icon: <BarChart3 size={17} /> },
  { path: '/audit', label: 'Audit Trail', icon: <History size={17} /> },
];

function AuroraWave({ theme }: { theme: string }) {
  const isOcean = theme === 'ocean';
  const isGraphite = theme === 'graphite';

  const c1 = isGraphite ? 'rgba(229,138,54,0.55)' : isOcean ? 'rgba(8,127,140,0.60)' : 'rgba(168,85,247,0.60)';
  const c2 = isGraphite ? 'rgba(245,158,11,0.30)' : isOcean ? 'rgba(14,165,165,0.35)' : 'rgba(112,72,245,0.35)';
  const c3 = isGraphite ? 'rgba(229,138,54,0.15)' : isOcean ? 'rgba(8,127,140,0.18)' : 'rgba(168,85,247,0.18)';
  const stopA = isGraphite ? '#E58A36' : isOcean ? '#087F8C' : '#7048F5';
  const stopB = isGraphite ? '#F59E0B' : isOcean ? '#0EA5A5' : '#A855F7';

  return (
    <svg
      viewBox="0 0 216 90"
      preserveAspectRatio="none"
      className="absolute bottom-0 left-0 right-0 w-full pointer-events-none"
      style={{ height: 90 }}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`wg-${theme}`} cx="50%" cy="110%" r="75%" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={stopA} stopOpacity="0.5" />
          <stop offset="55%" stopColor={stopB} stopOpacity="0.2" />
          <stop offset="100%" stopColor={stopA} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* filled glow pool */}
      <path d="M-10 90 Q108 10 226 90 Z" fill={`url(#wg-${theme})`} />
      {/* arc 1 — brightest */}
      <path d="M-10 90 Q108 12 226 90" stroke={c1} strokeWidth="2.5" fill="none" />
      {/* arc 2 */}
      <path d="M-10 90 Q108 28 226 90" stroke={c2} strokeWidth="1.8" fill="none" />
      {/* arc 3 */}
      <path d="M-10 90 Q108 44 226 90" stroke={c3} strokeWidth="1.2" fill="none" />
    </svg>
  );
}

export default function Sidebar({ mobileOpen = false, onClose }: { mobileOpen?: boolean; onClose?: () => void }) {
  const { sidebarCollapsed, toggleSidebar, eossTheme } = useStore();
  const collapsed = sidebarCollapsed && !mobileOpen;

  const sidebarBg = eossTheme === 'graphite'
    ? 'linear-gradient(185deg, #232630 0%, #1F222B 40%, #13151C 100%)'
    : eossTheme === 'ocean'
    ? 'linear-gradient(185deg, #123240 0%, #102D3A 40%, #071D27 100%)'
    : 'linear-gradient(185deg, #1E1B4B 0%, #191A4A 40%, #110C3A 100%)';

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 bottom-0 z-50 flex flex-col sidebar-transition select-none',
        mobileOpen ? 'flex' : 'hidden md:flex',
        collapsed ? 'w-[var(--sidebar-w-collapsed,64px)]' : 'w-[var(--sidebar-width,216px)]'
      )}
      style={{
        background: sidebarBg,
        borderRight: '1px solid var(--sidebar-border, rgba(255,255,255,0.08))',
      }}
    >
      {/* Brand Header */}
      <NavLink
        to="/"
        end
        aria-label="Go to EOSS Home"
        className={clsx(
          'flex items-center flex-shrink-0 h-[64px] border-b hover:bg-white/5 transition-colors',
          collapsed ? 'justify-center' : 'px-4 gap-3'
        )}
        style={{ borderColor: 'var(--sidebar-border, rgba(255,255,255,0.08))' }}
      >
        {/* Stylized Logo Mark: Dual rounded gradient pills */}
        <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center relative">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shadow-md relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, var(--brand), var(--brand-secondary, #A855F7))',
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
      </NavLink>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5 relative z-10">
        {NAV_ITEMS.map((item, idx) => (
          <NavLink
            key={`${item.path}-${idx}`}
            to={item.path}
            end={item.path === '/'}
            title={collapsed ? item.label : undefined}
            onClick={onClose}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 rounded-xl transition-all duration-150 text-[13px] font-medium',
              collapsed ? 'justify-center p-2 mx-auto w-9 h-9' : 'px-3 py-2',
              isActive
                ? 'text-white shadow-md'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            )}
            style={({ isActive }) => ({
              background: isActive
                ? 'var(--sidebar-active-bg, linear-gradient(135deg, var(--brand), var(--brand-secondary)))'
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

      {/* Aurora wave ornament (rendered behind footer) */}
      <div className="absolute bottom-0 left-0 right-0 h-[80px] overflow-hidden pointer-events-none z-0" aria-hidden="true">
        <AuroraWave theme={eossTheme} />
      </div>

      {/* Persistent Sidebar Footer: Admin & Settings + Collapse */}
      <div
        className="flex-shrink-0 px-2 py-1.5 border-t relative z-10 backdrop-blur-md"
        style={{ borderColor: 'var(--sidebar-border, rgba(255,255,255,0.08))', background: 'rgba(0,0,0,0.15)' }}
      >
        <NavLink
          to="/admin"
          title={collapsed ? 'Admin & Settings' : undefined}
          onClick={onClose}
          className={({ isActive }) => clsx(
            'flex items-center gap-3 rounded-xl transition-all duration-150 text-[13px] font-medium mb-1',
            collapsed ? 'justify-center p-2 mx-auto w-9 h-9' : 'px-3 py-2',
            isActive
              ? 'text-white shadow-md'
              : 'text-white/80 hover:text-white hover:bg-white/10'
          )}
          style={({ isActive }) => ({
            background: isActive
              ? 'var(--sidebar-active-bg, linear-gradient(135deg, var(--brand), var(--brand-secondary)))'
              : 'transparent',
            boxShadow: isActive
              ? '0 4px 14px -2px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
              : undefined,
          })}
        >
          <span className="flex-shrink-0"><Settings size={17} /></span>
          {!collapsed && <span className="truncate font-semibold">Admin & Settings</span>}
        </NavLink>

        <button
          onClick={toggleSidebar}
          className={clsx(
            mobileOpen && 'hidden',
            'flex items-center gap-2 w-full rounded-lg px-2.5 py-1.5 text-xs font-medium text-white/60 hover:text-white hover:bg-white/10 transition-colors',
            collapsed ? 'justify-center' : ''
          )}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={14} /> : <><ChevronLeft size={14} /><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  );
}
