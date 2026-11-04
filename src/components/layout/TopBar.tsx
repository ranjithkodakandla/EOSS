import React, { useState } from 'react';
import { Sun, Moon, Monitor, Search, Cpu, Building, ShieldCheck, Check } from 'lucide-react';
import { useStore } from '../../store';
import RoleSwitcher from './RoleSwitcher';
import NotificationDropdown from './NotificationDropdown';
import type { ThemeMode } from '../../store';

export default function TopBar() {
  const { theme, setTheme, sidebarCollapsed, jobs, assets, inventory } = useStore();
  const [askOpen, setAskOpen] = useState(false);
  const [query, setQuery] = useState('');

  const cycleTheme = () => {
    const next: Record<ThemeMode, ThemeMode> = { system: 'light', light: 'dark', dark: 'system' };
    setTheme(next[theme]);
  };

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;

  const downMachines = assets.filter(a => a.status === 'breakdown').length;
  const blockedJobs = jobs.filter(j => j.hasBlocker).length;

  return (
    <>
      <header
        className="fixed top-0 right-0 z-30 h-[var(--topbar-h)] bg-[var(--surface)] border-b border-[var(--border)] flex items-center justify-between px-3 md:px-5 gap-3 transition-all duration-200"
        style={{
          left: `var(--sidebar-w${sidebarCollapsed ? '-collapsed' : ''})`,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
        }}
      >
        {/* Left: Facility Telemetry & Context */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${downMachines > 0 ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${downMachines > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
            </span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text)]">
              <span>HYDERABAD PLANT</span>
              <span className="text-[var(--text-3)] font-normal hidden sm:inline">|</span>
              <span className="text-[var(--text-2)] text-[11px] font-mono hidden sm:inline">
                {downMachines > 0 ? `${downMachines} MACHINE DOWN` : blockedJobs > 0 ? `${blockedJobs} JOBS BLOCKED` : 'SHOP FLOOR NOMINAL'}
              </span>
            </div>
          </div>

          {/* Quick Ask EOSS Trigger */}
          <button
            onClick={() => setAskOpen(true)}
            className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md text-xs text-[var(--text-2)] bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--cyan-border)] hover:text-[var(--cyan-bright)] transition-colors ml-2"
          >
            <Search size={12} className="text-[var(--text-3)]" />
            <span className="text-[11px]">Ask EOSS...</span>
            <kbd className="font-mono text-[9px] px-1 py-0.5 rounded bg-[var(--surface-3)] text-[var(--text-3)] border border-[var(--border)]">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={cycleTheme}
            className="p-1.5 md:p-2 rounded-lg text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors"
            title={`Theme: ${theme}`}
            aria-label="Toggle visual theme"
          >
            <ThemeIcon size={15} />
          </button>
          <NotificationDropdown />
          <RoleSwitcher />
        </div>
      </header>

      {/* Ask EOSS Modal Dialog */}
      {askOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-[var(--surface)] border border-[var(--border-strong)] rounded-xl shadow-2xl overflow-hidden panel-accent-top">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-2)]">
              <Search size={16} className="text-[var(--cyan-bright)]" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Ask EOSS anything: e.g. 'Show material status for J-102' or 'overdue POs'..."
                className="w-full bg-transparent text-sm text-[var(--text)] placeholder-[var(--text-3)] focus:outline-none"
                autoFocus
              />
              <button
                onClick={() => setAskOpen(false)}
                className="text-xs px-2 py-1 rounded bg-[var(--surface-3)] text-[var(--text-2)] hover:text-[var(--text)]"
              >
                ESC
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-3)]">
                Suggested Operational Inquiries
              </div>
              <div className="space-y-1.5">
                {[
                  { text: 'Which jobs are blocked by material shortage today?', tag: 'Shortage Analysis' },
                  { text: 'Show drill press DP-01 breakdown status and affected jobs', tag: 'Asset Telemetry' },
                  { text: 'List unverified Mill Test Certificates in Quarantine', tag: 'Quality & Compliance' },
                  { text: 'Check supplier commitment delivery for SPO-2024-002', tag: 'Procurement' },
                ].map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuery(s.text)}
                    className="w-full text-left flex items-center justify-between p-2.5 rounded-lg text-xs hover:bg-[var(--surface-2)] transition-colors border border-transparent hover:border-[var(--border)]"
                  >
                    <span className="text-[var(--text)]">{s.text}</span>
                    <span className="text-[10px] font-mono text-[var(--cyan-bright)] bg-[var(--cyan-muted)] px-2 py-0.5 rounded border border-[var(--cyan-border)]">
                      {s.tag}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="px-4 py-2.5 bg-[var(--surface-2)] border-t border-[var(--border)] flex justify-between items-center text-[11px] text-[var(--text-3)] font-mono">
              <span>EOSS Sensory AI Core v2.4</span>
              <span>Deterministic query scoped to tenant data</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
