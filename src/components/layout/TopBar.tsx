import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useStore } from '../../store';
import RoleSwitcher from './RoleSwitcher';
import NotificationDropdown from './NotificationDropdown';
import type { ThemeMode } from '../../store';

export default function TopBar() {
  const { theme, setTheme, sidebarCollapsed } = useStore();

  const cycleTheme = () => {
    const next: Record<ThemeMode, ThemeMode> = { system: 'light', light: 'dark', dark: 'system' };
    setTheme(next[theme]);
  };

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;

  return (
    <header
      className="fixed top-0 right-0 z-30 h-[var(--topbar-h)] bg-[var(--surface)] border-b border-[var(--border)] flex items-center justify-between px-4 gap-3"
      style={{
        left: `var(--sidebar-w${sidebarCollapsed ? '-collapsed' : ''})`,
        transition: 'left 0.2s ease',
      }}
    >
      {/* Left: breadcrumb placeholder */}
      <div className="hidden md:block" />

      {/* Right actions */}
      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={cycleTheme}
          className="p-2 rounded-lg hover:bg-[var(--surface-2)] transition-colors"
          title={`Theme: ${theme}`}
        >
          <ThemeIcon size={16} className="text-[var(--text-2)]" />
        </button>
        <NotificationDropdown />
        <RoleSwitcher />
      </div>
    </header>
  );
}
