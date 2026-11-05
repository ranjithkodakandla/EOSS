import React, { useState } from 'react';
import { Search, HelpCircle, ChevronDown, Check, X, User } from 'lucide-react';
import { useStore, type EOSSTheme } from '../../store';
import NotificationDropdown from './NotificationDropdown';
import GlobalSearchModal from '../search/GlobalSearchModal';
import clsx from 'clsx';

export default function TopBar() {
  const { sidebarCollapsed, currentUser, eossTheme, setEOSSTheme, showToast } = useStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const themes: { id: EOSSTheme; label: string; accent: string }[] = [
    { id: 'aurora', label: 'Theme 1 · Aurora Indigo', accent: '#7048F5' },
    { id: 'ocean', label: 'Theme 2 · Ocean Teal', accent: '#087F8C' },
    { id: 'graphite', label: 'Theme 3 · Graphite Amber', accent: '#E58A36' },
  ];

  return (
    <>
      <header
        className={clsx(
          "fixed top-0 right-0 z-30 h-[70px] flex items-center justify-between px-3 sm:px-5 lg:px-7 gap-2 sm:gap-4 transition-[left] duration-200 select-none left-0",
          sidebarCollapsed ? "md:left-[var(--sidebar-w-collapsed,64px)]" : "md:left-[var(--sidebar-width,216px)]"
        )}
        style={{
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
                Apex Precision Engineering
              </span>
              <ChevronDown size={13} className="text-[var(--text-2)] hidden sm:inline" />
            </div>
            <span className="text-[10px] sm:text-[11px] text-[var(--text-2)] font-medium -mt-0.5 truncate hidden md:inline">
              Precision Engineering & Manufacturing · Hyderabad
            </span>
          </button>
        </div>

        {/* Center: Global Record Search (Ctrl + K) */}
        <div className="flex-1 flex justify-center sm:justify-start max-w-xs sm:max-w-md lg:max-w-xl mx-1 sm:mx-3 md:mx-6">
          {/* Mobile search icon button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="sm:hidden w-8 h-8 rounded-full border flex items-center justify-center text-[var(--text-2)] bg-[var(--surface)] hover:border-[var(--brand)] transition-colors shadow-2xs cursor-pointer"
            style={{ borderColor: 'var(--border, #E5E0F5)' }}
            title="Global Record Search"
          >
            <Search size={15} className="text-[var(--text-2)]" />
          </button>

          {/* Desktop/Tablet full search bar */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden sm:flex w-full items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2 rounded-full border text-xs sm:text-sm text-[var(--text-2)] bg-[var(--surface)] hover:border-[var(--brand)] transition-all shadow-sm group cursor-pointer"
            style={{ borderColor: 'var(--border, #E5E0F5)' }}
            title="Global Record Search (Cmd+K / Ctrl+K)"
          >
            <Search size={15} className="text-[var(--text-2)] group-hover:text-[var(--brand)] flex-shrink-0" />
            <span className="truncate flex-1 text-left text-xs sm:text-[13px] font-normal text-gray-500">
              Search orders, customers, materials, documents...
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
                    Hyderabad Hub · Tenant: Apex Precision Engineering Pvt Ltd
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Avatar */}
          <button
            onClick={() => setProfileOpen(true)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-sm cursor-pointer select-none flex-shrink-0 hover:opacity-80 transition-opacity"
            style={{
              background: 'linear-gradient(135deg, var(--brand), var(--brand-secondary, #A855F7))',
            }}
            title={`${currentUser.name} (${currentUser.role}) — Click to view profile`}
          >
            {currentUser.name.charAt(0)}
          </button>
        </div>
      </header>

      {/* Global Record Search Dialog (Cmd+K) */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Profile Modal */}
      {profileOpen && (
        <ProfileModal
          currentUser={currentUser}
          eossTheme={eossTheme}
          themes={themes}
          onThemeChange={t => { setEOSSTheme(t); }}
          onClose={() => setProfileOpen(false)}
          onSave={() => { showToast({ type: 'success', title: 'Preferences saved', body: 'Your profile preferences have been updated.' }); setProfileOpen(false); }}
        />
      )}
    </>
  );
}

function ProfileModal({ currentUser, eossTheme, themes, onThemeChange, onClose, onSave }: {
  currentUser: { name: string; role: string; email?: string };
  eossTheme: EOSSTheme;
  themes: { id: EOSSTheme; label: string; accent: string }[];
  onThemeChange: (t: EOSSTheme) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const [selectedTheme, setSelectedTheme] = useState<EOSSTheme>(eossTheme);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--border)]">
          <h3 className="font-bold text-[var(--text)]">My Profile</h3>
          <button onClick={onClose}><X size={16} className="text-[var(--text-3)]" /></button>
        </div>
        <div className="px-6 py-5 space-y-5">
          {/* Avatar + name */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-secondary, #A855F7))' }}>
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-[var(--text)]">{currentUser.name}</div>
              <div className="text-xs text-[var(--text-2)] mt-0.5">{currentUser.email ?? 'ranjith302@gmail.com'}</div>
              <div className="text-[11px] text-[var(--text-3)] capitalize mt-0.5">Role: {currentUser.role}</div>
            </div>
          </div>

          {/* Theme preference */}
          <div>
            <div className="text-xs font-semibold text-[var(--text-2)] mb-2">Theme Preference</div>
            <div className="space-y-1.5">
              {themes.map(t => (
                <button key={t.id} onClick={() => { setSelectedTheme(t.id); onThemeChange(t.id); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border text-sm transition-colors ${selectedTheme === t.id ? 'border-[var(--brand)] bg-[var(--surface-2)]' : 'border-[var(--border)] hover:bg-[var(--surface-2)]'}`}>
                  <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: t.accent }} />
                  <span className="text-[var(--text)] font-medium text-xs">{t.label}</span>
                  {selectedTheme === t.id && <Check size={14} className="ml-auto text-[var(--brand)]" />}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="px-6 pb-5 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[var(--border)] rounded-xl text-sm text-[var(--text-2)]">Cancel</button>
          <button onClick={onSave} className="flex-1 py-2.5 bg-[var(--brand)] text-white rounded-xl text-sm font-medium">Save Preferences</button>
        </div>
      </div>
    </div>
  );
}
