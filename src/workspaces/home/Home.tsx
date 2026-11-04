import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, TrendingUp, Package, Wrench, FileText, ChevronRight,
  AlertCircle, CheckCircle, Info, ArrowRight, BarChart2,
  Zap, Clock, Activity, Briefcase, ShoppingBag, Truck, Shield,
  Cpu, TrendingDown, Calendar, User, Flame, Sparkles, Check, X,
  ArrowUpRight, RefreshCw, Layers, ShieldAlert, Radio, ChevronDown, ChevronUp
} from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';
import clsx from 'clsx';

export default function Home() {
  const {
    pulseExceptions, jobs, inventory, assets, inspections, dispatches,
    currentUser, approvalRequests, resolveApproval, showToast
  } = useStore();
  const navigate = useNavigate();

  // Progressive Disclosure states
  const [fleetFilter, setFleetFilter] = useState<'all' | 'action_needed' | 'in_progress' | 'complete'>('all');
  const [expandedChain, setExpandedChain] = useState<string | null>(null); // Level 2 drill-down
  const [exceptionCategory, setExceptionCategory] = useState<string>('all');
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

  // Fleet Filtering (Glance level)
  const filteredJobs = jobs.filter(j => {
    if (fleetFilter === 'action_needed') return j.hasBlocker || j.status === 'hold';
    if (fleetFilter === 'in_progress') return j.status === 'active';
    if (fleetFilter === 'complete') return j.status === 'complete';
    return true;
  });

  // Non-duplicate exceptions for signal feed
  const nonDuplicateExceptions = pulseExceptions.filter(e => {
    // Exclude SPO-2024-002 and DP-01 which are already covered in Top 3 / Causal
    const isCoveredInTop3 = e.affectedRef.includes('SPO-2024-002') || e.affectedRef.includes('AST-DP01');
    if (isCoveredInTop3) return false;
    if (exceptionCategory === 'all') return true;
    return e.category === exceptionCategory;
  });

  const handleResolveApproval = (id: string, decision: 'approved' | 'rejected') => {
    setApprovingId(id);
    setTimeout(() => {
      resolveApproval(id, decision, currentUser.name, decision === 'approved' ? 'Approved from Executive Pulse' : 'Rejected');
      setApprovingId(null);
      showToast({
        type: decision === 'approved' ? 'success' : 'warning',
        title: `PO Amendment ${decision === 'approved' ? 'Approved' : 'Rejected'}`,
        body: `Processed by ${currentUser.name} via Executive Pulse.`,
      });
    }, 200);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1520px] mx-auto space-y-6">

      {/* ── 1. Top Executive Briefing & Command Header (Glance Level 1) ── */}
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
                <div className="text-[10px] font-mono text-[var(--text-3)] uppercase">Active Pipeline</div>
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

      {/* ── 2. The 6-Pillar Operational Flow Pipeline (Glance Level 1) ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[var(--text-3)]">
            Continuous Operational Pipeline (6 Core Pillars)
          </span>
          <span className="text-[11px] text-[var(--text-3)] font-mono">
            Click any pillar to jump directly to workspace
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

      {/* ── 3. TOP 3 PRIORITY ACTIONS DECK (Level 1 Glance + Level 3 Direct Action) ── */}
      {/* Eliminates competing lists & cognitive overload: founder immediately sees the 3 most urgent matters */}
      <div className="industrial-panel p-5 space-y-3.5 border-l-4 border-l-[var(--error)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--error)] animate-ping" />
            <h2 className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
              Top 3 Actions Requiring Immediate Attention
            </h2>
          </div>
          <span className="text-[10px] font-mono text-[var(--text-3)] uppercase">
            Prioritized by Revenue Exposure & Operational Bottleneck
          </span>
        </div>

        <div className="grid lg:grid-cols-3 gap-3">
          {/* Action 1: Critical Job Blocker */}
          <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--error-border)] space-y-2.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-mono text-[10px] font-bold text-[var(--error)] px-1.5 py-0.5 rounded bg-[var(--error-bg)] border border-[var(--error-border)]">
                  #1 CRITICAL BLOCKER
                </span>
                <span className="font-mono text-xs font-bold text-[var(--error)]">
                  ₹320k Exposure
                </span>
              </div>
              <div className="text-xs font-bold text-[var(--text)]">
                Job J-102 Halted at Cutting Stage
              </div>
              <p className="text-[11px] text-[var(--text-2)] mt-1 leading-relaxed">
                Bharat Power order blocked due to SS Sheet 3mm stockout. Upstream PO SPO-2024-002 overdue by 2 days.
              </p>
            </div>
            <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
              <span className="text-[10px] font-mono text-[var(--text-3)]">Ref: J-102</span>
              <button
                onClick={() => navigate('/jobs/job-102')}
                className="btn-primary text-xs py-1 px-3 bg-red-600 hover:bg-red-500 shadow-none inline-flex items-center gap-1"
              >
                Resolve Blocker <ArrowRight size={11} />
              </button>
            </div>
          </div>

          {/* Action 2: Asset Breakdown */}
          <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--warning-border)] space-y-2.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-mono text-[10px] font-bold text-[var(--warning)] px-1.5 py-0.5 rounded bg-[var(--warning-bg)] border border-[var(--warning-border)]">
                  #2 MACHINE DOWNTIME
                </span>
                <span className="font-mono text-xs font-bold text-[var(--warning)]">
                  ₹325k Exposure
                </span>
              </div>
              <div className="text-xs font-bold text-[var(--text)]">
                Drill Press DP-01 Spindle Seized
              </div>
              <p className="text-[11px] text-[var(--text-2)] mt-1 leading-relaxed">
                Shop-floor drilling bay inoperable. 20 Flange sets waiting for Job J-104 (NTPC Vendor Division).
              </p>
            </div>
            <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
              <span className="text-[10px] font-mono text-[var(--text-3)]">Ref: AST-DP01</span>
              <button
                onClick={() => navigate('/assets/ast-dp01')}
                className="btn-ghost text-xs py-1 px-3 border border-[var(--warning-border)] text-[var(--warning)] hover:bg-[var(--warning-bg)] inline-flex items-center gap-1"
              >
                View Maintenance <ArrowRight size={11} />
              </button>
            </div>
          </div>

          {/* Action 3: Executive Approval */}
          <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--cyan-border)] space-y-2.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-mono text-[10px] font-bold text-[var(--cyan-bright)] px-1.5 py-0.5 rounded bg-[var(--cyan-muted)] border border-[var(--cyan-border)]">
                  #3 OWNER SIGN-OFF
                </span>
                <span className="font-mono text-xs font-bold text-[var(--cyan-bright)]">
                  ₹36k Impact
                </span>
              </div>
              <div className="text-xs font-bold text-[var(--text)]">
                Supplier PO SPO-2024-002 Revision
              </div>
              <p className="text-[11px] text-[var(--text-2)] mt-1 leading-relaxed">
                Stainless Source quantity reduction from 300kg to 200kg. Delivery date committed to 10 Nov.
              </p>
            </div>
            <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
              <span className="text-[10px] font-mono text-[var(--text-3)]">By Karthik Raju</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleResolveApproval('apr-001', 'rejected')}
                  disabled={approvingId === 'apr-001'}
                  className="btn-ghost text-xs py-1 px-2.5 hover:bg-[var(--error-bg)] hover:text-[var(--error)]"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleResolveApproval('apr-001', 'approved')}
                  disabled={approvingId === 'apr-001'}
                  className="btn-primary text-xs py-1 px-3 bg-emerald-600 hover:bg-emerald-500 shadow-none"
                >
                  <Check size={11} className="mr-1" /> Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Main Operations Split: Causal Analysis (Expandable) & Fleet Radar ── */}
      <div className="grid lg:grid-cols-12 gap-6">

        {/* ── Left Column: Causal Risk Chains & Fleet Radar (8 cols) ── */}
        <div className="lg:col-span-8 space-y-6">

          {/* Causal Risk Analysis — Level 2 Investigate: Clean Summary with Drill-Down Accordion */}
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
                    Multi-factor correlation: Upstream causes mapped to shop-floor bottlenecks and financial exposure
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--surface-3)] text-[var(--text-3)]">
                2 CHAINS IDENTIFIED
              </span>
            </div>

            {/* Chain 1: Summary Bar with Progressive Disclosure Drill-Down */}
            <div className="rounded-xl border border-[var(--error-border)]/70 bg-[var(--surface-2)] overflow-hidden transition-all">
              <div
                onClick={() => setExpandedChain(expandedChain === 'chain-1' ? null : 'chain-1')}
                className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-[var(--surface-3)]/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[var(--error)] flex-shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[var(--text)]">
                        Chain 01: Procurement Overdue → SS Sheet Shortage → Job J-102 Blocked
                      </span>
                      <span className="font-mono text-[10px] text-[var(--error)] bg-[var(--error-bg)] px-1.5 py-0.2 rounded border border-[var(--error-border)]">
                        ₹320k Risk
                      </span>
                    </div>
                    <div className="text-[11px] text-[var(--text-3)] mt-0.5 font-mono">
                      Stainless Source India (SPO-2024-002) · 2 days late · Bharat Power Equipment
                    </div>
                  </div>
                </div>

                <button
                  className="btn-ghost text-xs py-1 px-2.5 flex items-center gap-1 text-[var(--cyan-bright)]"
                  title="Expand causal graph"
                >
                  <span className="text-[11px] font-medium">{expandedChain === 'chain-1' ? 'Collapse' : 'Investigate'}</span>
                  {expandedChain === 'chain-1' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>

              {/* Level 2 Deep Drill-Down Nodes */}
              {expandedChain === 'chain-1' && (
                <div className="p-4 pt-2 border-t border-[var(--border)] space-y-3 bg-[var(--surface)]">
                  <div className="grid md:grid-cols-3 gap-3">
                    {/* Node 1: Root Cause */}
                    <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
                      <div className="text-[10px] font-mono uppercase text-[var(--text-3)] flex items-center justify-between">
                        <span>1. Root Trigger</span>
                        <Clock size={11} className="text-[var(--warning)]" />
                      </div>
                      <div className="text-xs font-semibold text-[var(--text)]">Supplier PO Overdue</div>
                      <div className="font-mono text-[11px] text-[var(--cyan-bright)]">SPO-2024-002</div>
                      <div className="text-[11px] text-[var(--text-2)]">Stainless Source committed for 2 Nov (2 days late).</div>
                    </div>

                    {/* Node 2: Physical Friction */}
                    <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
                      <div className="text-[10px] font-mono uppercase text-[var(--text-3)] flex items-center justify-between">
                        <span>2. Physical Bottleneck</span>
                        <Package size={11} className="text-[var(--error)]" />
                      </div>
                      <div className="text-xs font-semibold text-[var(--text)]">SS Sheet 3mm Shortage</div>
                      <div className="font-mono text-[11px] text-[var(--error)]">108 kg avail vs 432 kg req</div>
                      <div className="text-[11px] text-[var(--text-2)]">216 kg held in Quarantine under NCR-007 (surface pitting).</div>
                    </div>

                    {/* Node 3: Commercial Consequence */}
                    <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--error-border)] space-y-1 bg-[var(--error-bg)]/20">
                      <div className="text-[10px] font-mono uppercase text-[var(--error)] flex items-center justify-between">
                        <span>3. Business Impact</span>
                        <Briefcase size={11} className="text-[var(--error)]" />
                      </div>
                      <div className="text-xs font-semibold text-[var(--text)]">Job J-102 Halted</div>
                      <div className="font-mono text-[11px] text-[var(--text)]">Bharat Power Equipment</div>
                      <div className="text-[11px] text-[var(--error)] font-medium">Cutting stage blocked. Potential 5-day delivery slippage.</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border)] text-xs">
                    <span className="text-[11px] text-[var(--text-2)] flex items-center gap-1 font-mono">
                      <Sparkles size={12} className="text-[var(--cyan-bright)]" /> AI: Expedite 200kg balance or release partial Lot 005.
                    </span>
                    <button
                      onClick={() => navigate('/jobs/job-102')}
                      className="btn-primary text-xs py-1 px-3"
                    >
                      Open Job J-102 <ArrowRight size={11} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Chain 2: Summary Bar with Progressive Disclosure Drill-Down */}
            <div className="rounded-xl border border-[var(--warning-border)]/70 bg-[var(--surface-2)] overflow-hidden transition-all">
              <div
                onClick={() => setExpandedChain(expandedChain === 'chain-2' ? null : 'chain-2')}
                className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-[var(--surface-3)]/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[var(--warning)] flex-shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[var(--text)]">
                        Chain 02: Asset Breakdown (DP-01) → Drill Bay Stoppage → Job J-104 Delivery Risk
                      </span>
                      <span className="font-mono text-[10px] text-[var(--warning)] bg-[var(--warning-bg)] px-1.5 py-0.2 rounded border border-[var(--warning-border)]">
                        ₹325k Risk
                      </span>
                    </div>
                    <div className="text-[11px] text-[var(--text-3)] mt-0.5 font-mono">
                      Drill Press DP-01 · Spindle motor seized · NTPC Vendor Division
                    </div>
                  </div>
                </div>

                <button
                  className="btn-ghost text-xs py-1 px-2.5 flex items-center gap-1 text-[var(--cyan-bright)]"
                  title="Expand causal graph"
                >
                  <span className="text-[11px] font-medium">{expandedChain === 'chain-2' ? 'Collapse' : 'Investigate'}</span>
                  {expandedChain === 'chain-2' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>

              {/* Level 2 Deep Drill-Down Nodes */}
              {expandedChain === 'chain-2' && (
                <div className="p-4 pt-2 border-t border-[var(--border)] space-y-3 bg-[var(--surface)]">
                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
                      <div className="text-[10px] font-mono uppercase text-[var(--text-3)] flex items-center justify-between">
                        <span>1. Equipment Failure</span>
                        <Wrench size={11} className="text-[var(--error)]" />
                      </div>
                      <div className="text-xs font-semibold text-[var(--text)]">Drill Press DP-01 Seized</div>
                      <div className="font-mono text-[11px] text-[var(--error)]">ME-2024-012 raised</div>
                      <div className="text-[11px] text-[var(--text-2)]">Spindle motor seized at 07:45 today. Technician Venkat Rao on-site.</div>
                    </div>

                    <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
                      <div className="text-[10px] font-mono uppercase text-[var(--text-3)] flex items-center justify-between">
                        <span>2. Stage Bottleneck</span>
                        <Activity size={11} className="text-[var(--warning)]" />
                      </div>
                      <div className="text-xs font-semibold text-[var(--text)]">Drill Bay Inoperable</div>
                      <div className="font-mono text-[11px] text-[var(--warning)]">20 Flange Sets Waiting</div>
                      <div className="text-[11px] text-[var(--text-2)]">Cutting stage stopped at 8/20 completed units.</div>
                    </div>

                    <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--warning-border)] space-y-1 bg-[var(--warning-bg)]/20">
                      <div className="text-[10px] font-mono uppercase text-[var(--warning)] flex items-center justify-between">
                        <span>3. Delivery Risk</span>
                        <Briefcase size={11} className="text-[var(--warning)]" />
                      </div>
                      <div className="text-xs font-semibold text-[var(--text)]">Job J-104 Blocked</div>
                      <div className="font-mono text-[11px] text-[var(--text)]">NTPC Vendor Division</div>
                      <div className="text-[11px] text-[var(--warning)] font-medium">Due 20 Nov. Critical path through drilling is blocked.</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border)] text-xs">
                    <span className="text-[11px] text-[var(--text-2)] flex items-center gap-1 font-mono">
                      <Sparkles size={12} className="text-[var(--cyan-bright)]" /> AI: Reroute flange drilling to Radial Drill RD-02 in Main Bay.
                    </span>
                    <button
                      onClick={() => navigate('/jobs/job-104')}
                      className="btn-primary text-xs py-1 px-3"
                    >
                      Open Job J-104 <ArrowRight size={11} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Active Job Fleet Radar Matrix (with Filter Pills for Fast Scan) ── */}
          <div className="industrial-panel p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[var(--text)]">Live Manufacturing Fleet Radar</h3>
                <p className="text-[11px] text-[var(--text-3)] font-mono">
                  Stage progress, material sufficiency & due dates across customer orders
                </p>
              </div>

              {/* Quick Filter Affordance */}
              <div className="flex items-center gap-1 bg-[var(--surface-2)] p-0.5 rounded-lg border border-[var(--border)]">
                <button
                  onClick={() => setFleetFilter('all')}
                  className={clsx(
                    'px-2 py-0.5 rounded text-[11px] font-medium transition-colors',
                    fleetFilter === 'all' ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs' : 'text-[var(--text-3)] hover:text-[var(--text)]'
                  )}
                >
                  All ({jobs.length})
                </button>
                <button
                  onClick={() => setFleetFilter('action_needed')}
                  className={clsx(
                    'px-2 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1',
                    fleetFilter === 'action_needed' ? 'bg-[var(--error-bg)] text-[var(--error)] border border-[var(--error-border)]' : 'text-[var(--error)] hover:bg-[var(--error-bg)]/20'
                  )}
                >
                  <AlertTriangle size={10} /> Needs Action ({blockedJobs})
                </button>
                <button
                  onClick={() => setFleetFilter('in_progress')}
                  className={clsx(
                    'px-2 py-0.5 rounded text-[11px] font-medium transition-colors',
                    fleetFilter === 'in_progress' ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs' : 'text-[var(--text-3)] hover:text-[var(--text)]'
                  )}
                >
                  In Progress ({activeJobs})
                </button>
                <button
                  onClick={() => setFleetFilter('complete')}
                  className={clsx(
                    'px-2 py-0.5 rounded text-[11px] font-medium transition-colors',
                    fleetFilter === 'complete' ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs' : 'text-[var(--text-3)] hover:text-[var(--text)]'
                  )}
                >
                  Done ({completedJobs})
                </button>
              </div>
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
                  {filteredJobs.map(j => {
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
                            Inspect <ArrowRight size={12} className="ml-1" />
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

        {/* ── Right Column: Pending Approvals Queue & Non-Duplicate Signals (4 cols) ── */}
        <div className="lg:col-span-4 space-y-6">

          {/* 1. All Pending Approvals (Visible without competing with risks) */}
          <div className="industrial-panel p-4 space-y-3.5 border-t-2 border-t-[var(--cyan-bright)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--cyan-bright)]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                  Approvals & Sign-Offs ({pendingApprovals.length})
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[var(--text-3)]">
                EXECUTIVE QUEUE
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

          {/* 2. Deduplicated Operational Signals Register */}
          <div className="industrial-panel p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert size={14} className="text-[var(--text-2)]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                  Operational Signals
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[var(--text-3)]">
                {nonDuplicateExceptions.length} SIGNALS
              </span>
            </div>

            {/* Category tabs */}
            <div className="flex flex-wrap gap-1">
              {['all', 'material', 'quality', 'document'].map(cat => (
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
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {nonDuplicateExceptions.slice(0, 4).map(exc => {
                const isCrit = exc.priority === 'critical';
                const isWarn = exc.priority === 'warning';
                return (
                  <div
                    key={exc.id}
                    className={clsx(
                      'p-2.5 rounded-lg border transition-all text-xs space-y-1',
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

                    <p className="text-[11px] text-[var(--text-2)] line-clamp-2">
                      {exc.body}
                    </p>

                    <div className="flex items-center justify-end pt-0.5">
                      <button
                        onClick={() => navigate(exc.workspacePath)}
                        className="text-[10px] font-semibold text-[var(--brand)] hover:underline inline-flex items-center gap-0.5"
                      >
                        {exc.cta} <ArrowRight size={10} />
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
              Quick Launches
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
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
