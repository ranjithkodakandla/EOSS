import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, CheckCircle, ArrowRight, Activity,
  Briefcase, Wrench, Check, X, ChevronRight,
  ShieldAlert, Clock, Sparkles
} from 'lucide-react';
import { useStore } from '../../store';
import clsx from 'clsx';

export default function Home() {
  const {
    jobs, inventory, assets, approvalRequests, resolveApproval, showToast, currentUser
  } = useStore();
  const navigate = useNavigate();

  const [fleetFilter, setFleetFilter] = useState<'all' | 'action_needed'>('all');
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Core business metrics (Simple on the surface)
  const activeJobs      = jobs.filter(j => j.status === 'active').length;
  const blockedJobs     = jobs.filter(j => j.hasBlocker).length;
  const shortageItems   = inventory.filter(i => i.shortage).length;
  const breakdownAssets = assets.filter(a => a.status === 'breakdown').length;
  const pendingApprovals = approvalRequests.filter(a => a.status === 'pending');

  const totalValue = jobs.reduce((sum, j) => sum + (j.value || 0), 0);
  const atRiskValue = jobs.filter(j => j.hasBlocker || j.status === 'hold').reduce((sum, j) => sum + (j.value || 0), 0);

  const healthScore = Math.round(
    ((jobs.length - blockedJobs) / jobs.length * 35) +
    ((assets.length - breakdownAssets) / assets.length * 25) +
    ((inventory.length - shortageItems) / inventory.length * 20) +
    (pendingApprovals.length === 0 ? 20 : 10)
  );

  const firstName = currentUser.name.split(' ')[0];

  // Quick Approval Action
  const handleResolveApproval = (id: string, decision: 'approved' | 'rejected') => {
    setApprovingId(id);
    setTimeout(() => {
      resolveApproval(id, decision, currentUser.name, decision === 'approved' ? 'Approved by owner' : 'Rejected');
      setApprovingId(null);
      showToast({
        type: decision === 'approved' ? 'success' : 'warning',
        title: `PO Amendment ${decision === 'approved' ? 'Approved' : 'Rejected'}`,
        body: `Processed for Stainless Source India.`,
      });
    }, 150);
  };

  // Filtered Jobs for the Fleet list
  const displayJobs = jobs.filter(j => {
    if (fleetFilter === 'action_needed') return j.hasBlocker || j.status === 'hold';
    return true;
  });

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">

      {/* ── 1. Glance: Executive Briefing & The 3 Numbers That Matter ── */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--text)]">
            Good afternoon, {firstName}
          </h1>
          <p className="text-sm text-[var(--text-2)] mt-1">
            Plant operations running with <strong className="text-[var(--error)]">2 blocked orders</strong> and 1 machine awaiting maintenance.
          </p>
        </div>

        {/* 3 High-Level Metric Tiles (Clean & Uncluttered) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-[var(--text-3)] uppercase tracking-wider">Plant Health</div>
              <div className="text-2xl font-bold font-mono text-[var(--text)] mt-1">{healthScore}%</div>
              <div className="text-xs text-[var(--warning)] font-medium mt-0.5 flex items-center gap-1">
                <AlertTriangle size={12} /> Elevated Risk
              </div>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-[var(--warning)] border-t-transparent flex items-center justify-center font-mono text-xs font-bold text-[var(--text)]">
              {healthScore}%
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
            <div className="text-xs font-medium text-[var(--text-3)] uppercase tracking-wider">Active Orders Value</div>
            <div className="text-2xl font-bold font-mono text-[var(--text)] mt-1">₹{(totalValue / 100000).toFixed(1)}L</div>
            <div className="text-xs text-[var(--text-3)] mt-0.5">{activeJobs} orders in production</div>
          </div>

          <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--error-border)]/60">
            <div className="text-xs font-medium text-[var(--error)] uppercase tracking-wider">Revenue at Risk</div>
            <div className="text-2xl font-bold font-mono text-[var(--error)] mt-1">₹{(atRiskValue / 100000).toFixed(1)}L</div>
            <div className="text-xs text-[var(--error)] mt-0.5 font-medium">{blockedJobs} customer jobs halted</div>
          </div>
        </div>
      </div>

      {/* ── 2. Act: The 3 Priority Decisions Requiring Attention Today ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-[var(--text)] flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--error)]" />
            3 Things Requiring Your Attention Today
          </h2>
          <span className="text-xs text-[var(--text-3)] font-mono">Prioritized by business impact</span>
        </div>

        <div className="space-y-3">
          {/* Action 1: Critical Job Blocker */}
          <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--error-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-[var(--error)]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-[var(--error-bg)] text-[var(--error)]">
                  Job J-102 Halted
                </span>
                <span className="text-xs font-semibold text-[var(--text)]">Bharat Power Equipment</span>
                <span className="text-xs font-mono font-bold text-[var(--error)] ml-auto sm:ml-2">₹320k Exposure</span>
              </div>
              <p className="text-sm text-[var(--text-2)]">
                Cutting stage stopped due to <strong>SS Sheet 3mm shortage</strong> (108 kg available vs 432 kg needed). Supplier PO SPO-2024-002 is 2 days overdue.
              </p>
            </div>
            <button
              onClick={() => navigate('/jobs/job-102')}
              className="btn-primary text-xs py-2 px-4 bg-red-600 hover:bg-red-500 shadow-none flex-shrink-0 inline-flex items-center gap-1.5 self-start sm:self-auto"
            >
              Resolve Blocker <ArrowRight size={13} />
            </button>
          </div>

          {/* Action 2: Asset Breakdown */}
          <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--warning-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-[var(--warning)]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-[var(--warning-bg)] text-[var(--warning)]">
                  Machine Breakdown
                </span>
                <span className="text-xs font-semibold text-[var(--text)]">Drill Press DP-01</span>
                <span className="text-xs font-mono font-bold text-[var(--warning)] ml-auto sm:ml-2">₹325k Exposure</span>
              </div>
              <p className="text-sm text-[var(--text-2)]">
                Spindle motor seized at 07:45 today. <strong>20 Flange sets waiting for Job J-104</strong> (NTPC Vendor Division).
              </p>
            </div>
            <button
              onClick={() => navigate('/assets/ast-dp01')}
              className="btn-ghost text-xs py-2 px-4 border border-[var(--warning-border)] text-[var(--warning)] hover:bg-[var(--warning-bg)] flex-shrink-0 inline-flex items-center gap-1.5 self-start sm:self-auto"
            >
              View Ticket <ArrowRight size={13} />
            </button>
          </div>

          {/* Action 3: Owner Approval */}
          <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-[var(--border-strong)]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-[var(--cyan-muted)] text-[var(--cyan-bright)]">
                  PO Amendment Sign-Off
                </span>
                <span className="text-xs font-semibold text-[var(--text)]">SPO-2024-002 (Stainless Source)</span>
                <span className="text-xs font-mono font-bold text-[var(--text-2)] ml-auto sm:ml-2">₹36k Adjustment</span>
              </div>
              <p className="text-sm text-[var(--text-2)]">
                Karthik Raju requested quantity reduction from 300kg to 200kg with delivery promised for 10 Nov.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-auto">
              <button
                onClick={() => handleResolveApproval('apr-001', 'rejected')}
                disabled={approvingId === 'apr-001'}
                className="btn-ghost text-xs py-2 px-3 hover:bg-[var(--error-bg)] hover:text-[var(--error)]"
              >
                Reject
              </button>
              <button
                onClick={() => handleResolveApproval('apr-001', 'approved')}
                disabled={approvingId === 'apr-001'}
                className="btn-primary text-xs py-2 px-4 bg-emerald-600 hover:bg-emerald-500 shadow-none inline-flex items-center gap-1"
              >
                <Check size={13} /> Approve
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Investigate: Active Manufacturing Fleet (Scannable & Clean) ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-[var(--text)]">Customer Orders in Production</h2>
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setFleetFilter('all')}
                className={clsx(
                  'px-2.5 py-1 rounded-md transition-colors',
                  fleetFilter === 'all' ? 'bg-[var(--surface-3)] text-[var(--text)] font-semibold' : 'text-[var(--text-3)] hover:text-[var(--text)]'
                )}
              >
                All ({jobs.length})
              </button>
              <button
                onClick={() => setFleetFilter('action_needed')}
                className={clsx(
                  'px-2.5 py-1 rounded-md transition-colors',
                  fleetFilter === 'action_needed' ? 'bg-[var(--error-bg)] text-[var(--error)] font-bold' : 'text-[var(--error)]/70 hover:text-[var(--error)]'
                )}
              >
                Needs Action ({blockedJobs})
              </button>
            </div>
          </div>

          <button
            onClick={() => navigate('/jobs')}
            className="text-xs text-[var(--brand)] hover:underline inline-flex items-center gap-1"
          >
            All Workspaces <ChevronRight size={13} />
          </button>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--surface-2)] text-xs text-[var(--text-3)] font-mono border-b border-[var(--border)]">
              <tr>
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Current Stage</th>
                <th className="py-3 px-4">Progress</th>
                <th className="py-3 px-4">Target Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {displayJobs.map(j => {
                const isBlocked = j.hasBlocker;
                const progressPct = j.stages.length > 0
                  ? Math.round((j.stages.filter(s => s.status === 'complete').length / j.stages.length) * 100)
                  : 0;

                return (
                  <tr
                    key={j.id}
                    onClick={() => navigate(`/jobs/${j.id}`)}
                    className="hover:bg-[var(--surface-2)] transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-[var(--cyan-bright)]">
                      {j.jobNumber}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[var(--text)]">
                      {j.customerName}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[var(--text-2)]">
                      {j.currentStage}
                    </td>
                    <td className="py-3.5 px-4 w-36">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-[var(--surface-3)] h-1.5 rounded-full overflow-hidden">
                          <div
                            className={clsx('h-full', isBlocked ? 'bg-[var(--error)]' : 'bg-emerald-500')}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-[var(--text-3)] w-8 text-right">{progressPct}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-[var(--text-2)]">
                      {new Date(j.plannedEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="py-3.5 px-4">
                      {isBlocked ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[var(--error-bg)] text-[var(--error)]">
                          Blocked
                        </span>
                      ) : j.status === 'complete' ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[var(--success-bg)] text-[var(--success)]">
                          Complete
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[var(--surface-3)] text-[var(--text-2)]">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-xs text-[var(--text-3)] group-hover:text-[var(--cyan-bright)] font-medium inline-flex items-center gap-1">
                        Open <ChevronRight size={13} />
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
  );
}
