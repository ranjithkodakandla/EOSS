import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import Toast from '../feedback/Toast';
import { useStore } from '../../store';
import clsx from 'clsx';

export default function AppShell() {
  const { sidebarCollapsed, eossTheme } = useStore();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-aurora', 'theme-ocean', 'theme-graphite');
    root.classList.add(`theme-${eossTheme}`);
  }, [eossTheme]);

  return (
    <div className={clsx(`theme-${eossTheme}`, 'min-h-screen bg-[var(--app-bg,var(--bg))] text-[var(--text)]')}>
      <Sidebar />
      <TopBar />
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
