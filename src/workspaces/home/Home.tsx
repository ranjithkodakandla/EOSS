import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, TrendingUp, Package, Wrench, FileText, ChevronRight,
  AlertCircle, CheckCircle, Info, ArrowRight, BarChart2,
  Zap, Clock, Activity, Briefcase, ShoppingBag, Truck, Shield,
  Cpu, TrendingDown, Calendar, User, Flame, Sparkles,
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

// Simulated AI insights
const AI_INSIGHTS = [
  {
    id: 'ai-1',
    priority: 'critical' as const,
    icon: <Package size={15} />,
    title: 'J-102 at risk — material delivery overdue',
    body: 'SS Sheet 3mm 304L from Stainless Source (SPO-2024-002) was committed for 2 Nov but has not been received. Job J-102 requires 300 kg to begin Fit-Up stage. At current rate, planned start will be missed by 3–5 days.',
    refs: ['J-102', 'SPO-2024-002', 'LOT-2024-004'],
    cta: 'Review SPO',
    path: '/procurement',
  },
  {
    id: 'ai-2',
    priority: 'warning' as const,
    icon: <TrendingDown size={15} />,
    title: 'MS Plate 8mm approaching reorder threshold',
    body: '515 kg available across 2 lots (LOT-2024-001, LOT-2024-012R). Reorder point is 500 kg. With J-101 and J-106 in production, current stock will not cover the next 10 days without a new PO.',
    refs: ['LOT-2024-001', 'J-101', 'J-106'],
    cta: 'Create PR',
    path: '/procurement',
  },
  {
    id: 'ai-3',
    priority: 'warning' as const,
    icon: <Flame size={15} />,
    title: 'Argon Gas critically low — 3 cylinders remaining',
    body: 'Only 3 Argon cylinders are in stock (LOT-2024-008). Based on current production activity, this covers approximately 1.5 weeks. A purchase order should be raised to avoid production stoppage.',
    refs: ['LOT-2024-008', 'J-101', 'J-105'],
    cta: 'View Inventory',
    path: '/inventory',
  },
];

function relativeTime(iso: string) {
  const demoMs = new Date(DEMO_NOW).getTime();
  const diff = demoMs - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return `${Math.floor(diff / 60000)}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function Home() {
  const { pulseExceptions, jobs, inventory, assets, inspections, dispatches, currentUser, approvalRequests } = useStore();
  const navigate = useNavigate();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dismissedInsights, setDismissedInsights] = useState<string[]>([]);

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
  const pendingApprovals = approvalRequests.filter(a => a.status === 'pending').length;
  const blockedJobs     = jobs.filter(j => j.hasBlocker).length;

  const categories = ['all', ...Array.from(new Set(pulseExceptions.map(e => e.category)))];

  const firstName = currentUser.name.split(' ')[0];
  const hour = new Date(DEMO_NOW).getHours() ?? 9;
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Compute domain health
  const domainHealth = [
    {
      key: 'jobs',
      label: 'Production',
      icon: <Activity size={13} />,
      status: blockedJobs > 0 ? 'critical' : holdJobs > 0 ? 'warning' : 'ok',
      metric: blockedJobs > 0 ? `${blockedJobs} blocked` : `${activeJobs} active`,
      path: '/jobs',
    },
    {
      key: 'materials',
      label: 'Materials',
      icon: <Package size={13} />,
      status: shortageItems >= 3 ? 'critical' : shortageItems > 0 ? 'warning' : 'ok',
      metric: shortageItems > 0 ? `${shortageItems} short` : 'All ok',
      path: '/inventory',
    },
    {
      key: 'quality',
      label: 'Quality',
      icon: <Shield size={13} />,
      status: pendingQC > 2 ? 'warning' : 'ok',
      metric: pendingQC > 0 ? `${pendingQC} pending` : 'No issues',
      path: '/quality',
    },
    {
      key: 'assets',
      label: 'Assets',
      icon: <Wrench size={13} />,
      status: breakdownAssets > 0 ? 'critical' : 'ok',
      metric: breakdownAssets > 0 ? `${breakdownAssets} down` : 'All online',
      path: '/assets',
    },
    {
      key: 'dispatch',
      label: 'Dispatch',
      icon: <Truck size={13} />,
      status: inTransit > 0 ? 'ok' : 'ok',
      metric: inTransit > 0 ? `${inTransit} in transit` : 'No dispatches',
      path: '/dispatch',
    },
  ];

  const domainStatusColor: Record<string, string> = {
    critical: 'var(--error)',
    warning: 'var(--warning)',
    ok: 'var(--success)',
  };

  const visibleInsights = AI_INSIGHTS.filter(i => !dismissedInsights.includes(i.id));
  const isOwner = currentUser.role === 'owner';

  // Pending decisions for owner
  const decisionItems = [
    ...approvalRequests.filter(a => a.status === 'pending').map(a => ({
      id: a.id, label: `Approve: ${a.title ?? a.type}`, path: '/procurement', type: 'approval' as const,
    })),
    ...jobs.filter(j => j.hasBlocker && j.status === 'active').map(j => ({
      id: j.id, label: `Blocker on ${j.jobNumber}`, path: `/jobs/${j.id}`, type: 'blocker' as const,
    })),
  ].slice(0, 6);

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-4">

      {/* ── Header row ── */}
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
          </span>
          Live · {new Date(DEMO_NOW).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
        </div>
      </div>

      {/* ── Operational Health strip ── */}
      <div
        className="rounded-[var(--radius)] px-4 py-3 flex flex-wrap gap-2 items-center justify-between"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xs)' }}
      >
        <span className="text-[11px] font-semibold uppercase tracking-widest flex-shrink-0" style={{ color: 'var(--text-3)' }}>
          Operational Health
        </span>
        <div className="flex flex-wrap gap-2 flex-1 justify-end sm:justify-start">
          {domainHealth.map(d => (
            <button
              key={d.key}
              onClick={() => navigate(d.path)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all flex-shrink-0"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = domainStatusColor[d.status]; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: domainStatusColor[d.status] }}
              />
              <span style={{ color: 'var(--text-2)' }}>{d.icon}</span>
              <span style={{ color: 'var(--text)' }}>{d.label}</span>
              <span style={{ color: domainStatusColor[d.status] }}>{d.metric}</span>
            </button>
          ))}
        </div>
        {critical > 0 && (
          <div className="flex items-center gap-1.5 text-xs font-semibold flex-shrink-0" style={{ color: 'var(--error)' }}>
            <AlertCircle size={13} />
            {critical} critical
          </div>
        )}
      </div>

      {/* ── Main two-column layout ── */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-4">

        {/* ── Left column ── */}
        <div className="space-y-4">

          {/* EOSS Intelligence Panel */}
          {visibleInsights.length > 0 && (
            <div className="intel-panel rounded-[var(--radius)] overflow-hidden panel-accent-top">
              <div className="flex items-center gap-2.5 px-4 py-3" style={{ borderBottom: '1px solid var(--cyan-border)' }}>
                <span className="ai-signal">
                  <Sparkles size={11} /> EOSS Intelligence
                </span>
                <span className="text-[11px] ml-1" style={{ color: 'var(--cyan)' }}>
                  {visibleInsights.length} insight{visibleInsights.length !== 1 ? 's' : ''} detected
                </span>
                <span className="ml-auto text-[10px]" style={{ color: 'var(--text-3)' }}>Simulated · AI-generated</span>
              </div>
              <div className="divide-y" style={{ borderColor: 'var(--cyan-border)' }}>
                {visibleInsights.map(ins => {
                  const pc = PRIORITY_CFG[ins.priority];
                  return (
                    <div key={ins.id} className="px-4 py-3.5">
                      <div className="flex items-start gap-3">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{
                            background: ins.priority === 'critical' ? 'var(--error-bg)' : 'var(--warning-bg)',
                            color: ins.priority === 'critical' ? 'var(--error)' : 'var(--warning)',
                            border: `1px solid ${ins.priority === 'critical' ? 'var(--error-border)' : 'var(--warning-border)'}`,
                          }}
                        >
                          {ins.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{ins.title}</span>
                            <span className="pill" style={{ background: pc.bg, borderColor: pc.border, color: pc.dot }}>
                              {pc.label}
                            </span>
                          </div>
                          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-2)' }}>{ins.body}</p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {ins.refs.map(r => (
                              <span
                                key={r}
                                className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                                style={{ background: 'var(--cyan-muted)', color: 'var(--cyan-bright)', border: '1px solid var(--cyan-border)' }}
                              >
                                {r}
                              </span>
                            ))}
                            <div className="ml-auto flex items-center gap-1.5">
                              <button
                                onClick={() => setDismissedInsights(d => [...d, ins.id])}
                                className="text-[11px] px-2 py-1 rounded"
                                style={{ color: 'var(--text-3)' }}
                              >
                                Dismiss
                              </button>
                              <button
                                onClick={() => navigate(ins.path)}
                                className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded"
                                style={{ background: 'var(--brand)', color: 'white' }}
                              >
                                {ins.cta} <ArrowRight size={11} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Exception feed */}
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
                  <div
                    key={exc.id}
                    className="flex items-start gap-4 px-4 py-4"
                    style={{ borderBottom: '1px solid var(--border)' }}
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

                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className="text-[11px] font-mono" style={{ color: 'var(--text-3)' }}>{exc.affectedRef}</span>
                        <span style={{ color: 'var(--border-2)' }}>·</span>
                        <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>
                          <Clock size={9} className="inline mr-0.5 opacity-60" />
                          {relativeTime(exc.since)}
                        </span>
                        <button
                          onClick={() => navigate(exc.workspacePath)}
                          className="ml-auto flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded"
                          style={{ background: 'var(--brand-50)', color: 'var(--brand)', border: '1px solid var(--brand-muted)' }}
                        >
                          {exc.cta} <ChevronRight size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-4">

          {/* Needs Your Decision — owner only */}
          {isOwner && decisionItems.length > 0 && (
            <div
              className="rounded-[var(--radius)] overflow-hidden"
              style={{ background: 'var(--surface)', border: '1px solid var(--warning-border)' }}
            >
              <div
                className="flex items-center gap-2 px-4 py-3"
                style={{ borderBottom: '1px solid var(--warning-border)', background: 'var(--warning-bg)' }}
              >
                <AlertTriangle size={13} style={{ color: 'var(--warning)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--warning)' }}>
                  Needs Your Decision
                </span>
                <span
                  className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: 'var(--warning)', color: 'white' }}
                >
                  {decisionItems.length}
                </span>
              </div>
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {decisionItems.map(d => (
                  <button
                    key={d.id}
                    onClick={() => navigate(d.path)}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left transition-colors"
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: d.type === 'approval' ? 'var(--warning)' : 'var(--error)' }}
                    />
                    <span className="flex-1 text-xs" style={{ color: 'var(--text)' }}>{d.label}</span>
                    <ChevronRight size={12} style={{ color: 'var(--text-3)' }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Operations health */}
          <div className="eoss-card">
            <div className="px-4 pt-4 pb-1">
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
            <div className="px-4 pb-4 mt-3">
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
      <div className="stat-mono leading-none mb-1.5" style={{ color }}>{value}</div>
      <div className="text-[11px] font-semibold" style={{ color: 'var(--text)' }}>{label}</div>
      <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-3)' }}>{sub}</div>
    </button>
  );
}
