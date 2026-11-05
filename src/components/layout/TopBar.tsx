import React, { useState } from 'react';
import { Search, Bell, HelpCircle, ChevronDown, Check } from 'lucide-react';
import { useStore, type EOSSTheme } from '../../store';
import NotificationDropdown from './NotificationDropdown';
import GlobalSearchModal from '../search/GlobalSearchModal';
import clsx from 'clsx';

export default function TopBar() {
  const { sidebarCollapsed, currentUser, eossTheme, setEOSSTheme } = useStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const themes: { id: EOSSTheme; label: string; accent: string }[] = [
    { id: 'aurora', label: 'Theme 1 · Aurora Indigo', accent: '#7048F5' },
    { id: 'ocean', label: 'Theme 2 · Ocean Teal', accent: '#087F8C' },
    { id: 'graphite', label: 'Theme 3 · Graphite Amber', accent: '#E58A36' },
  ];

  return (
    <>
      <header
        className="fixed top-0 right-0 z-30 h-[70px] flex items-center justify-between px-3 sm:px-5 lg:px-7 gap-2 sm:gap-4 transition-[left] duration-200 select-none"
        style={{
          left: sidebarCollapsed ? 'var(--sidebar-w-collapsed, 64px)' : 'var(--sidebar-width, 216px)',
          background: 'var(--app-bg, #F6F4FF)',
          borderBottom: '1px solid var(--border, #E5E0F5)',
        }}
      >
        {/* Left: Company Selector */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          <button
            className="flex flex-col text-left group transition-opacity hover:opacity-90 cursor-pointer"
            title="Active Organization Profile"
          >
            <div className="flex items-center gap-1">
              <span className="text-sm sm:text-base font-extrabold text-[var(--text)] tracking-tight whitespace-nowrap">
                Sri Lakshmi Traders
              </span>
              <ChevronDown size={13} className="text-[var(--text-2)] hidden sm:inline" />
            </div>
            <span className="text-[10px] sm:text-[11px] text-[var(--text-2)] font-medium -mt-0.5 truncate hidden md:inline">
              Manufacturing & Trading · Hyderabad
            </span>
          </button>
        </div>

        {/* Center: Global Record Search (Ctrl + K) */}
        <div className="flex-1 max-w-xs sm:max-w-md lg:max-w-xl mx-1 sm:mx-3 md:mx-6">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2 rounded-full border text-xs sm:text-sm text-[var(--text-2)] bg-[var(--surface)] hover:border-[var(--brand)] transition-all shadow-sm group cursor-pointer"
            style={{ borderColor: 'var(--border, #E5E0F5)' }}
            title="Global Record Search (Cmd+K / Ctrl+K)"
          >
            <Search size={15} className="text-[var(--text-2)] group-hover:text-[var(--brand)] flex-shrink-0" />
            <span className="truncate flex-1 text-left text-xs sm:text-[13px] font-normal text-gray-500 hidden sm:inline">
              Search orders, customers, materials, documents...
            </span>
            <span className="truncate flex-1 text-left text-xs font-normal text-gray-500 sm:hidden">
              Search records...
            </span>
            <kbd className="hidden lg:inline-flex items-center font-mono text-[10px] px-2 py-0.5 rounded-md bg-gray-50 border border-gray-200 text-gray-500 shadow-2xs font-semibold">
              Ctrl + K
            </kbd>
          </button>
        </div>

        {/* Right: Theme Switcher, Notifications, Help & Avatar */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Theme Selector segmented pill for demo / review */}
          <div className="relative">
            <button
              onClick={() => setThemeMenuOpen(o => !o)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border text-xs font-semibold bg-white text-[var(--text)] hover:border-[var(--brand)] transition-colors shadow-2xs cursor-pointer"
              style={{ borderColor: 'var(--border, #E5E0F5)' }}
              title="Switch Visual Theme (Aurora Indigo / Ocean Teal / Graphite Amber)"
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{
                  background:
                    eossTheme === 'aurora'
                      ? '#7048F5'
                      : eossTheme === 'ocean'
                      ? '#087F8C'
                      : '#E58A36',
                }}
              />
              <span className="hidden sm:inline capitalize font-medium">{eossTheme}</span>
              <ChevronDown size={11} className="text-[var(--text-2)] hidden sm:inline" />
            </button>

            {themeMenuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setThemeMenuOpen(false)} />
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl border bg-[var(--surface)] shadow-xl z-40 p-1.5 animate-in fade-in"
                  style={{
                    background: 'var(--surface, #FFFFFF)',
                    borderColor: 'var(--border, #E5E0F5)',
                    boxShadow: 'var(--shadow-elevated)',
                  }}
                >
                  <div className="px-3 py-1.5 text-[11px] font-bold text-[var(--text-2)] uppercase tracking-wider">
                    EOSS Theme Presets
                  </div>
                  {themes.map(t => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setEOSSTheme(t.id);
                        setThemeMenuOpen(false);
                      }}
                      className={clsx(
                        'w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer',
                        eossTheme === t.id
                          ? 'bg-[var(--surface-2)] text-[var(--brand)] font-semibold'
                          : 'text-[var(--text)] hover:bg-[var(--surface-2)]'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ background: t.accent }} />
                        <span>{t.label}</span>
                      </div>
                      {eossTheme === t.id && <Check size={14} className="text-[var(--brand)]" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Notifications */}
          <NotificationDropdown />

          {/* Help Button */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setHelpOpen(o => !o)}
              className="p-1.5 rounded-full text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
              title="System Documentation & Help"
            >
              <HelpCircle size={19} />
            </button>
            {helpOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setHelpOpen(false)} />
                <div
                  className="absolute right-0 mt-2 w-64 rounded-xl border bg-[var(--surface)] shadow-xl z-40 p-3 text-xs space-y-2 animate-in fade-in"
                  style={{
                    background: 'var(--surface, #FFFFFF)',
                    borderColor: 'var(--border, #E5E0F5)',
                  }}
                >
                  <div className="font-bold text-[var(--text)]">EOSS Business OS v1.0</div>
                  <div className="text-[var(--text-2)]">
                    Autonomous manufacturing & trading business operating system for growing Indian SMEs.
                  </div>
                  <div className="pt-2 border-t border-[var(--border)] font-mono text-[11px] text-[var(--brand)]">
                    Hyderabad Hub · Tenant: Sri Lakshmi Traders
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Avatar */}
          <div
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-sm cursor-pointer select-none flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, var(--brand), var(--brand-secondary, #A855F7))',
            }}
            title={`${currentUser.name} (${currentUser.role})`}
          >
            {currentUser.name.charAt(0)}
          </div>
        </div>
      </header>

      {/* Global Record Search Dialog (Cmd+K) */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
