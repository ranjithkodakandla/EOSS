import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, TrendingUp, Package, Wrench, FileText, ChevronRight,
  AlertCircle, CheckCircle, Info, ArrowRight, BarChart2,
  Zap, Clock, Activity, Briefcase, ShoppingBag, Truck, Shield,
} from 'lucide-react';
import { useStore, PURCHASE_REQS } from '../../store';
import { DEMO_NOW } from '../../data/seed';
import StatusChip from '../../components/layout/StatusChip';
import clsx from 'clsx';

const CAT_META: Record<string, { icon: React.ReactNode; color: string }> = {
  material:    { icon: <Package size={13} />,      color: 'var(--info)' },
  procurement: { icon: <ShoppingBag size={13} />,  color: 'var(--warning)' },
  production:  { icon: <Activity size={13} />,     color: 'var(--brand)' },
  quality:     { icon: <Shield size={13} />,       color: 'var(--hold)' },
  asset:       { icon: <Wrench size={13} />,       color: 'var(--accent)' },
  document:    { icon: <FileText size={13} />,     color: 'var(--text-3)' },
  dispatch:    { icon: <Truck size={13} />,        color: 'var(--success)' },
};

const PRIORITY_CFG = {
  critical: {
    dot: 'var(--error)',
    border: 'var(--error-border)',
    bg: 'var(--error-bg)',
    label: 'Critical',
    icon: <AlertCircle size={13} />,
  },
  warning: {
    dot: 'var(--warning)',
    border: 'var(--warning-border)',
    bg: 'var(--warning-bg)',
    label: 'Warning',
    icon: <AlertTriangle size={13} />,
  },
  info: {
    dot: 'var(--info)',
    border: 'var(--info-border)',
    bg: 'var(--info-bg)',
    label: 'Info',
    icon: <Info size={13} />,
  },
};

function relativeTime(iso: string) {
  const demoMs = new Date(DEMO_NOW).getTime();
  const diff = demoMs - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return `${Math.floor(diff / 60000)}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function Home() {
  const { pulseExceptions, jobs, inventory, assets, inspections, dispatches, currentUser } = useStore();
  const navigate = useNavigate();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const critical  = pulseExceptions.filter(e => e.priority === 'critical').length;
  const warning   = pulseExceptions.filter(e => e.priority === 'warning').length;
  const info      = pulseExceptions.filter(e => e.priority === 'info').length;

  const filtered = categoryFilter === 'all'
    ? pulseExceptions
    : pulseExceptions.filter(e => e.category === categoryFilter);

  const activeJobs      = jobs.filter(j => j.status === 'active').length;
  const holdJobs        = jobs.filter(j => j.status === 'hold').length;
  const completedJobs   = jobs.filter(j => j.status === 'complete').length;
  const shortageItems   = inventory.filter(i => i.shortage).length;
  const breakdownAssets = assets.filter(a => a.status === 'breakdown').length;
  const openPRs         = PURCHASE_REQS.filter(pr => pr.status === 'approved' || pr.status === 'open').length;
  const pendingQC       = inspections.filter(i => i.result === 'pending').length;
  const inTransit       = dispatches.filter(d => d.status === 'dispatched').length;

  const categories = ['all', ...Array.from(new Set(pulseExceptions.map(e => e.category)))];

  const firstName = currentUser.name.split(' ')[0];
  const hour = new Date(DEMO_NOW).getHours() ?? 9;
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-5">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Business Pulse
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-2)' }}>
            {greeting}, {firstName}. Here's your operational snapshot for today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs flex-shrink-0 mt-1" style={{ color: 'var(--text-3)' }}>
          <span className="relative inline-flex">
            <span className="w-2 h-2 rounded-full pulse-dot" style={{ background: 'var(--success)' }} />
            <span className="live-ring w-2 h-2 rounded-full" style={{ color: 'var(--success)' }} />
          </span>
          Live · {new Date(DEMO_NOW).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
        </div>
      </div>

      {/* Alert bar — only when criticals exist */}
      {critical > 0 && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius)] text-sm font-medium"
          style={{ background: 'var(--error-bg)', border: '1px solid var(--error-border)', color: 'var(--error)' }}
        >
          <AlertCircle size={15} className="flex-shrink-0" />
          <span>{critical} critical exception{critical > 1 ? 's' : ''} require immediate attention</span>
          <span className="ml-auto text-xs font-semibold opacity-70">Scroll to see ↓</span>
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-5">

        {/* Left — Exception feed */}
        <div className="space-y-4">

          {/* Exception header + category filter */}
          <div className="eoss-card overflow-hidden">
            <div className="eoss-card-header">
              <div className="flex items-center gap-2.5">
                <span style={{ color: 'var(--text-2)' }}><AlertCircle size={15} /></span>
                <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Exceptions</span>
                <div className="flex items-center gap-1.5 ml-1">
                  {critical > 0 && (
                    <span className="pill text-white" style={{ background: 'var(--error)', borderColor: 'var(--error)' }}>
                      {critical} critical
                    </span>
                  )}
                  {warning > 0 && (
                    <span className="pill" style={{ background: 'var(--warning-bg)', borderColor: 'var(--warning-border)', color: 'var(--warning)' }}>
                      {warning} warning
                    </span>
                  )}
                  {info > 0 && (
                    <span className="pill" style={{ background: 'var(--info-bg)', borderColor: 'var(--info-border)', color: 'var(--info)' }}>
                      {info} info
                    </span>
                  )}
                </div>
              </div>
              <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>AI-monitored</span>
            </div>

            {/* Category filters */}
            <div
              className="flex gap-1.5 px-4 py-2.5 overflow-x-auto"
              style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
            >
              {categories.map(c => (
                <button
                  key={c}
                  onClick={() => setCategoryFilter(c)}
                  className="px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-all capitalize"
                  style={categoryFilter === c
                    ? { background: 'var(--brand)', color: 'white' }
                    : { background: 'var(--surface-2)', color: 'var(--text-2)', border: '1px solid var(--border)' }
                  }
                >
                  {c === 'all' ? `All (${pulseExceptions.length})` : c}
                </button>
              ))}
            </div>

            {/* Exception list */}
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {filtered.length === 0 && (
                <div className="px-4 py-10 text-center text-sm" style={{ color: 'var(--text-3)' }}>
                  No exceptions in this category.
                </div>
              )}
              {filtered.map(exc => {
                const pc = PRIORITY_CFG[exc.priority];
                const cm = CAT_META[exc.category] ?? { icon: <Activity size={13} />, color: 'var(--text-3)' };
                return (
                  <button
                    key={exc.id}
                    onClick={() => navigate(exc.workspacePath)}
                    className="w-full flex items-start gap-4 px-4 py-4 text-left transition-colors group"
                    style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}
                  >
                    {/* Priority dot */}
                    <div className="flex-shrink-0 mt-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: pc.dot, boxShadow: `0 0 0 3px color-mix(in srgb, ${pc.dot} 15%, transparent)` }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 flex-wrap">
                        <span className="text-sm font-semibold leading-snug" style={{ color: 'var(--text)' }}>{exc.title}</span>
                        <span
                          className="pill mt-0.5"
                          style={{ background: pc.bg, borderColor: pc.border, color: pc.dot }}
                        >
                          {pc.icon}
                          {pc.label}
                        </span>
                        <span
                          className="pill mt-0.5"
                          style={{ color: cm.color, background: 'var(--surface-2)', borderColor: 'var(--border)' }}
                        >
                          {cm.icon}
                          {exc.category}
                        </span>
                      </div>

                      <p className="text-xs mt-1.5 leading-relaxed line-clamp-2" style={{ color: 'var(--text-2)' }}>
                        {exc.body}
                      </p>

                      {exc.aiReason && (
                        <div className="ai-signal mt-2 w-fit">
                          <Zap size={10} />
                          <span>{exc.aiReason}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[11px] font-mono" style={{ color: 'var(--text-3)' }}>{exc.affectedRef}</span>
                        <span style={{ color: 'var(--border-2)' }}>·</span>
                        <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>
                          <Clock size={9} className="inline mr-0.5 opacity-60" />
                          {relativeTime(exc.since)}
                        </span>
                      </div>
                    </div>

                    <div
                      className="flex-shrink-0 flex items-center gap-1 text-xs font-medium mt-1 opacity-70 group-hover:opacity-100 transition-opacity"
                      style={{ color: 'var(--brand)' }}
                    >
                      {exc.cta}
                      <ChevronRight size={13} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right — Operational sidebar */}
        <div className="space-y-4">

          {/* Operations health */}
          <div className="eoss-card">
            <div className="px-4 pt-4 pb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-3)' }}>
                Operations Today
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <MetricTile
                  label="Active Jobs" value={activeJobs}
                  sub={`${holdJobs} on hold`}
                  color="var(--brand)"
                  onClick={() => navigate('/jobs')}
                />
                <MetricTile
                  label="Shortages" value={shortageItems}
                  sub="below reorder"
                  color={shortageItems > 0 ? 'var(--error)' : 'var(--success)'}
                  onClick={() => navigate('/inventory')}
                />
                <MetricTile
                  label="Machine Issues" value={breakdownAssets}
                  sub="in breakdown"
                  color={breakdownAssets > 0 ? 'var(--error)' : 'var(--success)'}
                  onClick={() => navigate('/assets')}
                />
                <MetricTile
                  label="In Transit" value={inTransit}
                  sub="dispatches"
                  color="var(--info)"
                  onClick={() => navigate('/dispatch')}
                />
              </div>
            </div>

            {/* Completion bar */}
            <div className="px-4 pb-4">
              <div className="flex justify-between text-[11px] mb-1.5" style={{ color: 'var(--text-3)' }}>
                <span>Job completion</span>
                <span className="font-mono" style={{ color: 'var(--text-2)' }}>{completedJobs}/{jobs.length}</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: jobs.length > 0 ? `${(completedJobs / jobs.length) * 100}%` : '0%',
                    background: 'var(--success)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="eoss-card">
            <div className="eoss-card-header">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Quick Access</span>
            </div>
            <div className="p-3 space-y-1">
              {[
                { label: 'Open Purchase Requests', count: openPRs, path: '/procurement', color: 'var(--warning)', icon: <ShoppingBag size={14} /> },
                { label: 'Pending QC Inspections', count: pendingQC, path: '/quality', color: 'var(--hold)', icon: <Shield size={14} /> },
                { label: 'Active Jobs', count: activeJobs, path: '/jobs', color: 'var(--brand)', icon: <Activity size={14} /> },
              ].map(q => (
                <button
                  key={q.path}
                  onClick={() => navigate(q.path)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-[var(--radius-sm)] transition-colors text-left"
                  style={{ background: 'transparent' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <span style={{ color: q.color }}>{q.icon}</span>
                  <span className="flex-1 text-xs font-medium" style={{ color: 'var(--text)' }}>{q.label}</span>
                  <span
                    className="text-xs font-bold font-mono px-2 py-0.5 rounded-md"
                    style={{ background: 'var(--surface-3)', color: q.color }}
                  >
                    {q.count}
                  </span>
                  <ChevronRight size={12} style={{ color: 'var(--text-3)' }} />
                </button>
              ))}
            </div>
          </div>

          {/* Exception summary by priority */}
          <div className="eoss-card">
            <div className="eoss-card-header">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Exception Summary</span>
            </div>
            <div className="p-4 space-y-3">
              {[
                { label: 'Critical', value: critical, color: 'var(--error)', bg: 'var(--error-bg)', border: 'var(--error-border)' },
                { label: 'Warning', value: warning, color: 'var(--warning)', bg: 'var(--warning-bg)', border: 'var(--warning-border)' },
                { label: 'Informational', value: info, color: 'var(--info)', bg: 'var(--info-bg)', border: 'var(--info-border)' },
              ].map(row => (
                <div key={row.label} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: row.color }} />
                  <span className="flex-1 text-xs" style={{ color: 'var(--text-2)' }}>{row.label}</span>
                  <div className="flex-1 progress-bar">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: pulseExceptions.length > 0 ? `${(row.value / pulseExceptions.length) * 100}%` : '0%',
                        background: row.color,
                      }}
                    />
                  </div>
                  <span className="text-xs font-mono font-semibold w-5 text-right" style={{ color: row.color }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricTile({ label, value, sub, color, onClick }: {
  label: string; value: number; sub: string; color: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="p-3 rounded-[var(--radius-sm)] text-left transition-all group"
      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = color;
        el.style.background = 'var(--surface)';
        el.style.boxShadow = 'var(--shadow-sm)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = 'var(--border)';
        el.style.background = 'var(--surface-2)';
        el.style.boxShadow = '';
      }}
    >
      <div className="text-xl font-bold font-mono leading-none mb-1" style={{ color }}>{value}</div>
      <div className="text-[11px] font-semibold" style={{ color: 'var(--text)' }}>{label}</div>
      <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-3)' }}>{sub}</div>
    </button>
  );
}
