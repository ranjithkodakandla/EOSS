import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, TrendingUp, Package, Wrench, FileText, ChevronRight,
  AlertCircle, CheckCircle, Info, ArrowRight, BarChart2,
  Zap, Clock, Activity, Briefcase, ShoppingBag, Truck, Shield,
  Cpu, TrendingDown, Calendar, User, Flame, Sparkles, Check, X,
  ArrowUpRight, RefreshCw, Layers, ShieldAlert, Radio
} from 'lucide-react';
import { useStore } from '../../store';
import { DEMO_NOW } from '../../data/seed';
import StatusChip from '../../components/layout/StatusChip';
import clsx from 'clsx';

export default function Home() {
  const {
    pulseExceptions, jobs, inventory, assets, inspections, dispatches,
    currentUser, approvalRequests, resolveApproval, showToast
  } = useStore();
  const navigate = useNavigate();

  const [pillarFilter, setPillarFilter] = useState<string>('all');
  const [exceptionCategory, setExceptionCategory] = useState<string>('all');
  const [dismissedInsights, setDismissedInsights] = useState<string[]>([]);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Derived counts
  const activeJobs      = jobs.filter(j => j.status === 'active').length;
  const holdJobs        = jobs.filter(j => j.status === 'hold').length;
  const completedJobs   = jobs.filter(j => j.status === 'complete').length;
  const blockedJobs     = jobs.filter(j => j.hasBlocker).length;
  const shortageItems   = inventory.filter(i => i.shortage).length;
  const qcHoldItems     = inventory.filter(i => i.qcHoldQty > 0).length;
  const breakdownAssets = assets.filter(a => a.status === 'breakdown').length;
  const pmOverdueAssets = assets.filter(a => a.status === 'pm_overdue').length;
  const pendingApprovals = approvalRequests.filter(a => a.status === 'pending');
  const inTransit       = dispatches.filter(d => d.status === 'dispatched').length;

  const totalValue = jobs.reduce((sum, j) => sum + (j.value || 0), 0);
  const atRiskValue = jobs.filter(j => j.hasBlocker || j.status === 'hold').reduce((sum, j) => sum + (j.value || 0), 0);

  // Health Score calculation (0 - 100)
  const healthScore = Math.round(
    ((jobs.length - blockedJobs) / jobs.length * 35) +
    ((assets.length - breakdownAssets) / assets.length * 25) +
    ((inventory.length - shortageItems) / inventory.length * 20) +
    (pendingApprovals.length === 0 ? 20 : 10)
  );

  const firstName = currentUser.name.split(' ')[0];

  // 6 Pillars of Factory Operations
  const operationalPillars = [
    {
      id: 'commercial',
      label: 'Commercial Demand',
      icon: <Briefcase size={14} />,
      status: 'nominal',
      metric: `${jobs.length} Orders`,
      detail: `₹${(totalValue / 100000).toFixed(1)}L Book`,
      path: '/sales',
    },
    {
      id: 'procurement',
      label: 'Supply & Procurement',
      icon: <ShoppingBag size={14} />,
      status: 'warning',
      metric: '1 PO Overdue',
      detail: 'SPO-002 Stainless Source',
      path: '/procurement',
    },
    {
      id: 'materials',
      label: 'Material Inventory',
      icon: <Package size={14} />,
      status: shortageItems > 0 ? 'critical' : 'nominal',
      metric: `${shortageItems} Shortages`,
      detail: `${qcHoldItems} Lots in QC Hold`,
      path: '/inventory',
    },
    {
      id: 'production',
      label: 'Shop-Floor Production',
      icon: <Activity size={14} />,
      status: blockedJobs > 0 ? 'critical' : 'nominal',
      metric: `${activeJobs} Active · ${blockedJobs} Blocked`,
      detail: 'Fit-up & Cutting bays',
      path: '/jobs',
    },
    {
      id: 'assets',
      label: 'Machinery & Assets',
      icon: <Wrench size={14} />,
      status: breakdownAssets > 0 ? 'critical' : pmOverdueAssets > 0 ? 'warning' : 'nominal',
      metric: breakdownAssets > 0 ? `${breakdownAssets} Machine Down` : '8 Operational',
      detail: 'DP-01 Drill Press Seized',
      path: '/assets',
    },
    {
      id: 'quality',
      label: 'Quality & Dispatch',
      icon: <Shield size={14} />,
      status: 'warning',
      metric: '1 Dispatch Ready',
      detail: 'J-103 Released · 2 NCRs',
      path: '/quality',
    },
  ];

  // Filtered exceptions
  const filteredExceptions = pulseExceptions.filter(e => {
    if (exceptionCategory === 'all') return true;
    return e.category === exceptionCategory;
  });

  const handleResolveApproval = (id: string, decision: 'approved' | 'rejected') => {
    setApprovingId(id);
    setTimeout(() => {
      resolveApproval(id, decision, currentUser.name, decision === 'approved' ? 'Approved from Executive Pulse' : 'Rejected');
      setApprovingId(null);
    }, 200);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1520px] mx-auto space-y-6">

      {/* ── 1. Top Executive Briefing & Command Header ── */}
      <div className="industrial-panel p-5 md:p-6 overflow-hidden panel-accent-top">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="heat-badge text-[11px]">
                <Cpu size={12} />
                EXECUTIVE INTELLIGENCE CENTRE
              </span>
              <span className="text-[11px] font-mono text-[var(--text-3)]">
                STATION ID: HYD-HQ · SHIFT 1 ACTIVE
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--text)]">
              Welcome back, {firstName}
            </h1>
            <p className="text-xs md:text-sm text-[var(--text-2)] max-w-3xl leading-relaxed">
              Overall manufacturing health is at <strong className="text-[var(--text)]">{healthScore}%</strong>.
              Two customer jobs (<strong className="text-[var(--error)]">J-102</strong> and <strong className="text-[var(--error)]">J-104</strong>) have active operational blockers representing <strong className="text-[var(--warning)] font-mono">₹645,000</strong> in delivery exposure. Drill Press DP-01 breakdown requires maintenance triage.
            </p>
          </div>

          {/* Health Gauge & High-Level KPIs */}
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap lg:flex-nowrap border-t lg:border-t-0 lg:border-l border-[var(--border)] pt-4 lg:pt-0 lg:pl-8">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-[var(--surface-2)] border-2 border-[var(--border-2)]">
                <svg className="w-16 h-16 -rotate-90 transform" viewBox="0 0 36 36">
                  <path
                    className="text-[var(--surface-3)]"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    strokeWidth="3.5"
                    strokeDasharray={`${healthScore}, 100`}
                    stroke={healthScore > 75 ? 'var(--cyan-bright)' : healthScore > 50 ? 'var(--warning)' : 'var(--error)'}
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute font-mono text-base font-bold text-[var(--text)]">
                  {healthScore}%
                </span>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-3)]">Plant Health Index</div>
                <div className="text-xs font-semibold text-[var(--warning)] flex items-center gap-1 mt-0.5">
                  <AlertTriangle size={12} /> Elevated Risk
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 min-w-[190px]">
              <div className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                <div className="text-[10px] font-mono text-[var(--text-3)] uppercase">Active Revenue</div>
                <div className="stat-metric text-base font-bold text-[var(--text)] mt-0.5">
                  ₹{(totalValue / 100000).toFixed(2)}L
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--error-border)]">
                <div className="text-[10px] font-mono text-[var(--error)] uppercase">Exposed At Risk</div>
                <div className="stat-metric text-base font-bold text-[var(--error)] mt-0.5">
                  ₹{(atRiskValue / 100000).toFixed(2)}L
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. The 6-Pillar Operational Flow Pipeline ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[var(--text-3)]">
            Continuous Operational Pipeline (6 Core Pillars)
          </span>
          <span className="text-[11px] text-[var(--text-3)] font-mono">
            Click any pillar to inspect live status
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {operationalPillars.map(p => {
            const isCritical = p.status === 'critical';
            const isWarning  = p.status === 'warning';
            return (
              <button
                key={p.id}
                onClick={() => navigate(p.path)}
                className={clsx(
                  'text-left p-3.5 rounded-xl transition-all duration-200 border group relative overflow-hidden',
                  isCritical
                    ? 'bg-[var(--surface)] border-[var(--error-border)] hover:border-[var(--error)]'
                    : isWarning
                    ? 'bg-[var(--surface)] border-[var(--warning-border)] hover:border-[var(--warning)]'
                    : 'bg-[var(--surface)] border-[var(--border)] hover:border-[var(--cyan-border)]'
                )}
                style={{
                  boxShadow: isCritical ? 'inset 0 2px 0 var(--error)' : isWarning ? 'inset 0 2px 0 var(--warning)' : 'inset 0 1px 0 rgba(255,255,255,0.05)',
                }}
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-[var(--text-2)] group-hover:text-[var(--text)] transition-colors">
                    {p.icon}
                  </span>
                  <span className={clsx(
                    'w-1.5 h-1.5 rounded-full',
                    isCritical ? 'bg-[var(--error)] animate-pulse' : isWarning ? 'bg-[var(--warning)]' : 'bg-[var(--success)]'
                  )} />
                </div>
                <div className="text-[11px] font-semibold text-[var(--text)] truncate">{p.label}</div>
                <div className="text-xs font-bold font-mono text-[var(--text)] mt-1">{p.metric}</div>
                <div className="text-[10px] text-[var(--text-3)] truncate mt-0.5">{p.detail}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3. Main Split: Causal Impact Chains (Left) & Executive Decision Queue (Right) ── */}
      <div className="grid lg:grid-cols-12 gap-6">

        {/* ── Left Column: Causal Problem-to-Impact Intelligence (8 cols) ── */}
        <div className="lg:col-span-8 space-y-6">

          {/* Causal Risk Analysis: Root Cause -> Friction -> Commercial Impact */}
          <div className="industrial-panel p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-md bg-[var(--cyan-muted)] text-[var(--cyan-bright)] border border-[var(--cyan-border)]">
                  <Zap size={14} />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-[var(--text)]">
                    Active Causal Risk Chains
                  </h2>
                  <p className="text-[11px] text-[var(--text-3)] font-mono">
                    Multi-factor correlation: Supplier delay & Machine downtime mapped to revenue exposure
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--surface-3)] text-[var(--text-3)]">
                2 CHAINS IDENTIFIED
              </span>
            </div>

            {/* Chain 1: SPO Delivery Delay -> SS Material Shortage -> J-102 Blocker */}
            <div className="rounded-xl border border-[var(--error-border)] bg-[var(--surface-2)] p-4 space-y-3.5 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-bold text-[var(--error)]">
                  <AlertCircle size={14} />
                  CRITICAL CHAIN 01: PROCUREMENT DELAY EXPOSING REVENUE
                </span>
                <span className="font-mono text-[11px] text-[var(--error)] font-semibold bg-[var(--error-bg)] px-2 py-0.5 rounded border border-[var(--error-border)]">
                  ₹320,000 EXPOSURE
                </span>
              </div>

              {/* 3 Connected Nodes */}
              <div className="grid md:grid-cols-3 gap-3 relative">
                {/* Node 1: Root Cause */}
                <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] space-y-1">
                  <div className="text-[10px] font-mono uppercase text-[var(--text-3)] flex items-center justify-between">
                    <span>1. Root Trigger</span>
                    <Clock size={11} className="text-[var(--warning)]" />
                  </div>
                  <div className="text-xs font-semibold text-[var(--text)]">Supplier PO Overdue</div>
                  <div className="font-mono text-[11px] text-[var(--cyan-bright)]">SPO-2024-002</div>
                  <div className="text-[11px] text-[var(--text-2)]">Stainless Source India committed for 2 Nov (2 days late).</div>
                </div>

                {/* Node 2: Physical Friction */}
                <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] space-y-1">
                  <div className="text-[10px] font-mono uppercase text-[var(--text-3)] flex items-center justify-between">
                    <span>2. Physical Bottleneck</span>
                    <Package size={11} className="text-[var(--error)]" />
                  </div>
                  <div className="text-xs font-semibold text-[var(--text)]">SS Sheet 3mm Shortage</div>
                  <div className="font-mono text-[11px] text-[var(--error)]">108 kg avail vs 432 kg req</div>
                  <div className="text-[11px] text-[var(--text-2)]">216 kg held in Quarantine under NCR-007 (surface pitting).</div>
                </div>

                {/* Node 3: Commercial Consequence */}
                <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--error-border)] space-y-1 bg-[var(--error-bg)]/20">
                  <div className="text-[10px] font-mono uppercase text-[var(--error)] flex items-center justify-between">
                    <span>3. Business Impact</span>
                    <Briefcase size={11} className="text-[var(--error)]" />
                  </div>
                  <div className="text-xs font-semibold text-[var(--text)]">Job J-102 Halted</div>
                  <div className="font-mono text-[11px] text-[var(--text)]">Bharat Power Equipment</div>
                  <div className="text-[11px] text-[var(--error)] font-medium">Cutting stage blocked. Potential 5-day delivery slippage.</div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border)]">
                <div className="text-[11px] text-[var(--text-2)] flex items-center gap-1.5">
                  <Sparkles size={12} className="text-[var(--cyan-bright)]" />
                  <span>AI Recommended Action: Review SPO revision to expedite remaining 200 kg or release partial Lot 005.</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate('/procurement/spo/spo-002')}
                    className="btn-ghost text-xs py-1 px-2.5"
                  >
                    Inspect SPO-002
                  </button>
                  <button
                    onClick={() => navigate('/jobs/job-102')}
                    className="btn-primary text-xs py-1 px-3"
                  >
                    Open Job J-102 <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            </div>

            {/* Chain 2: DP-01 Machine Breakdown -> Drilling Halted -> J-104 Impact */}
            <div className="rounded-xl border border-[var(--warning-border)] bg-[var(--surface-2)] p-4 space-y-3.5 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-bold text-[var(--warning)]">
                  <Wrench size={14} />
                  CRITICAL CHAIN 02: SHOP-FLOOR ASSET DOWNTIME
                </span>
                <span className="font-mono text-[11px] text-[var(--warning)] font-semibold bg-[var(--warning-bg)] px-2 py-0.5 rounded border border-[var(--warning-border)]">
                  ₹325,000 EXPOSURE
                </span>
              </div>

              <div className="grid md:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] space-y-1">
                  <div className="text-[10px] font-mono uppercase text-[var(--text-3)] flex items-center justify-between">
                    <span>1. Equipment Failure</span>
                    <Wrench size={11} className="text-[var(--error)]" />
                  </div>
                  <div className="text-xs font-semibold text-[var(--text)]">Drill Press DP-01 Seized</div>
                  <div className="font-mono text-[11px] text-[var(--error)]">ME-2024-012 raised</div>
                  <div className="text-[11px] text-[var(--text-2)]">Spindle motor seized at 07:45 today. Technician Venkat Rao on-site.</div>
                </div>

                <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] space-y-1">
                  <div className="text-[10px] font-mono uppercase text-[var(--text-3)] flex items-center justify-between">
                    <span>2. Stage Bottleneck</span>
                    <Activity size={11} className="text-[var(--warning)]" />
                  </div>
                  <div className="text-xs font-semibold text-[var(--text)]">Drill Bay Inoperable</div>
                  <div className="font-mono text-[11px] text-[var(--warning)]">20 Flange Sets Waiting</div>
                  <div className="text-[11px] text-[var(--text-2)]">Cutting stage stopped at 8/20 completed units.</div>
                </div>

                <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--warning-border)] space-y-1 bg-[var(--warning-bg)]/20">
                  <div className="text-[10px] font-mono uppercase text-[var(--warning)] flex items-center justify-between">
                    <span>3. Delivery Risk</span>
                    <Briefcase size={11} className="text-[var(--warning)]" />
                  </div>
                  <div className="text-xs font-semibold text-[var(--text)]">Job J-104 Blocked</div>
                  <div className="font-mono text-[11px] text-[var(--text)]">NTPC Vendor Division</div>
                  <div className="text-[11px] text-[var(--warning)] font-medium">Due 20 Nov. Critical path through drilling is blocked.</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border)]">
                <div className="text-[11px] text-[var(--text-2)] flex items-center gap-1.5">
                  <Sparkles size={12} className="text-[var(--cyan-bright)]" />
                  <span>AI Recommended Action: Reroute flange drilling to Radial Drill RD-02 in Main Bay to maintain schedule.</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate('/assets/ast-dp01')}
                    className="btn-ghost text-xs py-1 px-2.5"
                  >
                    View Maintenance
                  </button>
                  <button
                    onClick={() => navigate('/jobs/job-104')}
                    className="btn-primary text-xs py-1 px-3"
                  >
                    Open Job J-104 <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Active Job Fleet Radar Matrix ── */}
          <div className="industrial-panel p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[var(--text)]">Live Manufacturing Fleet Status</h3>
                <p className="text-[11px] text-[var(--text-3)] font-mono">
                  All 8 production orders · Stage progress, material sufficiency & due dates
                </p>
              </div>
              <button
                onClick={() => navigate('/jobs')}
                className="text-xs text-[var(--brand)] hover:underline flex items-center gap-1 font-medium"
              >
                Full Job Board <ChevronRight size={13} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="eoss-table">
                <thead>
                  <tr>
                    <th>Job & Customer</th>
                    <th>Stage & Work Centre</th>
                    <th>Progress</th>
                    <th>Material Status</th>
                    <th>Target Due</th>
                    <th>Value</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(j => {
                    const isBlocked = j.hasBlocker;
                    const isComplete = j.status === 'complete';
                    const activeStage = j.stages.find(s => s.status === 'in_progress') || j.stages[0];
                    const progressPct = j.stages.length > 0
                      ? Math.round((j.stages.filter(s => s.status === 'complete').length / j.stages.length) * 100)
                      : 0;

                    return (
                      <tr
                        key={j.id}
                        onClick={() => navigate(`/jobs/${j.id}`)}
                        className="cursor-pointer group hover:bg-[var(--surface-2)] transition-colors"
                      >
                        <td>
                          <div className="flex items-center gap-2">
                            <span className={clsx(
                              'font-mono text-xs font-bold px-1.5 py-0.5 rounded border',
                              isBlocked
                                ? 'bg-[var(--error-bg)] text-[var(--error)] border-[var(--error-border)]'
                                : isComplete
                                ? 'bg-[var(--success-bg)] text-[var(--success)] border-[var(--success-border)]'
                                : 'bg-[var(--surface-3)] text-[var(--cyan-bright)] border-[var(--border)]'
                            )}>
                              {j.jobNumber}
                            </span>
                            <div>
                              <div className="text-xs font-semibold text-[var(--text)]">{j.customerName}</div>
                              <div className="text-[10px] text-[var(--text-3)] truncate max-w-[180px]">{j.description}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="text-xs font-medium text-[var(--text)]">{j.currentStage}</div>
                          <div className="text-[10px] text-[var(--text-3)]">{activeStage?.workCentre || 'General Bay'}</div>
                        </td>
                        <td className="w-28">
                          <div className="flex items-center justify-between text-[10px] font-mono mb-1 text-[var(--text-2)]">
                            <span>{progressPct}%</span>
                            <span>{j.stages.filter(s => s.status === 'complete').length}/{j.stages.length}</span>
                          </div>
                          <div className="progress-bar h-1.5">
                            <div
                              className="progress-bar-fill"
                              style={{
                                width: `${progressPct}%`,
                                background: isBlocked ? 'var(--error)' : isComplete ? 'var(--success)' : 'var(--brand)',
                              }}
                            />
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5 text-xs font-mono">
                            <span className={clsx(
                              'w-2 h-2 rounded-full',
                              j.materialReadiness === 'ready' ? 'bg-[var(--success)]' :
                              j.materialReadiness === 'shortage' ? 'bg-[var(--error)] animate-ping' :
                              'bg-[var(--warning)]'
                            )} />
                            <span className={clsx(
                              'capitalize',
                              j.materialReadiness === 'ready' ? 'text-[var(--success)]' :
                              j.materialReadiness === 'shortage' ? 'text-[var(--error)] font-bold' :
                              'text-[var(--warning)]'
                            )}>
                              {j.materialReadiness}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={clsx(
                            'text-xs font-mono',
                            isBlocked ? 'text-[var(--error)] font-bold' : 'text-[var(--text-2)]'
                          )}>
                            {new Date(j.plannedEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        </td>
                        <td>
                          <span className="font-mono text-xs font-semibold text-[var(--text)]">
                            ₹{(((j.value ?? 0) / 1000)).toLocaleString('en-IN')}k
                          </span>
                        </td>
                        <td className="text-right">
                          <span className="inline-flex items-center text-xs text-[var(--text-3)] group-hover:text-[var(--cyan-bright)] transition-colors">
                            View <ArrowRight size={12} className="ml-1" />
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Right Column: Executive Decisions & Live Exception Stream (4 cols) ── */}
        <div className="lg:col-span-4 space-y-6">

          {/* 1. Needs Your Decision — Triage Card (Fixed undefined bug) */}
          <div className="industrial-panel p-4 space-y-3.5 border-l-2 border-l-[var(--warning)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--warning)] animate-ping" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--warning)]">
                  Needs Your Decision ({pendingApprovals.length})
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[var(--text-3)]">
                OWNER SIGN-OFF
              </span>
            </div>

            {pendingApprovals.length === 0 ? (
              <div className="p-4 rounded-lg bg-[var(--surface-2)] text-center text-xs text-[var(--text-3)]">
                <CheckCircle size={20} className="mx-auto mb-1 text-[var(--success)]" />
                All pending approvals resolved.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingApprovals.map(apr => (
                  <div
                    key={apr.id}
                    className="p-3.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] space-y-2.5 transition-all hover:border-[var(--border-strong)]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-[10px] font-mono uppercase text-[var(--cyan-bright)]">
                          {apr.requestType}
                        </div>
                        <div className="text-xs font-bold text-[var(--text)] mt-0.5">
                          {apr.entityRef}
                        </div>
                      </div>
                      {apr.currentValue && (
                        <div className="text-right">
                          <div className="text-[10px] font-mono text-[var(--text-3)]">Impact</div>
                          <div className="text-xs font-mono font-bold text-[var(--warning)]">
                            ₹{(apr.currentValue / 1000).toLocaleString('en-IN')}k
                          </div>
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-[var(--text-2)] leading-relaxed">
                      {apr.description}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-[var(--text-3)] pt-1 border-t border-[var(--border)]">
                      <span>By {apr.requestedBy}</span>
                      <span>{new Date(apr.requestedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {/* Action buttons with live state update */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => handleResolveApproval(apr.id, 'rejected')}
                        disabled={approvingId === apr.id}
                        className="btn-ghost text-xs py-1.5 justify-center hover:bg-[var(--error-bg)] hover:text-[var(--error)] hover:border-[var(--error-border)]"
                      >
                        <X size={12} /> Reject
                      </button>
                      <button
                        onClick={() => handleResolveApproval(apr.id, 'approved')}
                        disabled={approvingId === apr.id}
                        className="btn-primary text-xs py-1.5 justify-center bg-[var(--success)] hover:bg-emerald-600 shadow-none"
                      >
                        <Check size={12} /> Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. Exception Stream with Filtering */}
          <div className="industrial-panel p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert size={14} className="text-[var(--error)]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                  Live Exception Register
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[var(--text-3)]">
                {filteredExceptions.length} ALERTS
              </span>
            </div>

            {/* Category tabs */}
            <div className="flex flex-wrap gap-1">
              {['all', 'material', 'procurement', 'asset', 'quality', 'document'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setExceptionCategory(cat)}
                  className={clsx(
                    'px-2 py-0.5 rounded text-[10px] font-mono uppercase transition-colors',
                    exceptionCategory === cat
                      ? 'bg-[var(--surface-3)] text-[var(--cyan-bright)] border border-[var(--cyan-border)]'
                      : 'text-[var(--text-3)] hover:text-[var(--text)]'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {filteredExceptions.map(exc => {
                const isCrit = exc.priority === 'critical';
                const isWarn = exc.priority === 'warning';
                return (
                  <div
                    key={exc.id}
                    className={clsx(
                      'p-3 rounded-lg border transition-all text-xs space-y-1.5',
                      isCrit ? 'bg-[var(--error-bg)]/20 border-[var(--error-border)]' :
                      isWarn ? 'bg-[var(--warning-bg)]/15 border-[var(--warning-border)]' :
                      'bg-[var(--surface-2)] border-[var(--border)]'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className={clsx(
                        'font-bold text-[11px] flex items-center gap-1',
                        isCrit ? 'text-[var(--error)]' : isWarn ? 'text-[var(--warning)]' : 'text-[var(--text)]'
                      )}>
                        <span className={clsx(
                          'w-1.5 h-1.5 rounded-full',
                          isCrit ? 'bg-[var(--error)]' : isWarn ? 'bg-[var(--warning)]' : 'bg-[var(--cyan)]'
                        )} />
                        {exc.title}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--text-3)]">
                        {exc.affectedRef}
                      </span>
                    </div>

                    <p className="text-[11px] text-[var(--text-2)] leading-relaxed">
                      {exc.body}
                    </p>

                    {exc.aiReason && (
                      <div className="text-[10px] font-mono text-[var(--cyan-bright)] bg-[var(--cyan-muted)] p-1.5 rounded border border-[var(--cyan-border)]">
                        {exc.aiReason}
                      </div>
                    )}

                    <div className="flex items-center justify-end pt-1">
                      <button
                        onClick={() => navigate(exc.workspacePath)}
                        className="text-[11px] font-semibold text-[var(--brand)] hover:underline inline-flex items-center gap-1"
                      >
                        {exc.cta} <ArrowRight size={11} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Quick Operational Launches */}
          <div className="industrial-panel p-4 space-y-2.5">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--text-3)]">
              Operational Actions
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => navigate('/jobs')}
                className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--border-strong)] text-left transition-colors"
              >
                <div className="text-xs font-semibold text-[var(--text)]">New Job</div>
                <div className="text-[10px] text-[var(--text-3)]">From Customer PO</div>
              </button>
              <button
                onClick={() => navigate('/inventory')}
                className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--border-strong)] text-left transition-colors"
              >
                <div className="text-xs font-semibold text-[var(--text)]">Log Receipt</div>
                <div className="text-[10px] text-[var(--text-3)]">GRN & MTC Upload</div>
              </button>
              <button
                onClick={() => navigate('/assets')}
                className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--border-strong)] text-left transition-colors"
              >
                <div className="text-xs font-semibold text-[var(--text)]">Breakdown</div>
                <div className="text-[10px] text-[var(--text-3)]">Shop-floor Alert</div>
              </button>
              <button
                onClick={() => navigate('/quality')}
                className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--border-strong)] text-left transition-colors"
              >
                <div className="text-xs font-semibold text-[var(--text)]">QC Release</div>
                <div className="text-[10px] text-[var(--text-3)]">Final Sign-off</div>
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
