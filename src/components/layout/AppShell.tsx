import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import Toast from '../feedback/Toast';
import { useStore } from '../../store';
import clsx from 'clsx';

export default function AppShell() {
  const { sidebarCollapsed } = useStore();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
