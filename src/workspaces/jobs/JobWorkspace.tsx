import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, AlertTriangle, ChevronRight, Clock, Package, FileText,
  Activity, Layers, Users, CheckCircle, Play, Pause, Truck,
  Calendar, User, MapPin, DollarSign, Zap, Shield, Wrench,
  TrendingUp, AlertCircle, ArrowRight, Check, X, Sparkles,
  FileCheck, ShieldAlert, Cpu, ExternalLink, RefreshCw, Box, Plus
} from 'lucide-react';
import { useStore, JOB_BLOCKERS, PURCHASE_REQS } from '../../store';
import { MATERIALS, SUPPLIER_PO_LINES, JOB_MATERIAL_REQS, EMPLOYEES } from '../../data/seed';
import StatusChip from '../../components/layout/StatusChip';
import clsx from 'clsx';

const TABS = ['Overview', 'Stages', 'Materials', 'Procurement', 'Quality', 'NCR/Rework', 'Assets', 'Documents', 'Dispatch', 'Updates', 'Blockers'];

export default function JobWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    jobs, setJobStatus, updateJobStage, resolveBlocker, currentUser,
    showToast, inspections, ncrs, supplierPos, assets, documents, dispatches
  } = useStore();

  const [tab, setTab] = useState('Overview');
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState<string>('');
  const [goodQtyInput, setGoodQtyInput] = useState<number>(0);
  const [showScrapFields, setShowScrapFields] = useState<boolean>(false);
  const [rejectQtyInput, setRejectQtyInput] = useState<number>(0);
  const [scrapQtyInput, setScrapQtyInput] = useState<number>(0);
  const [scrapReason, setScrapReason] = useState<string>('Dimensional Variation');
  const [selectedEmployee, setSelectedEmployee] = useState<string>(EMPLOYEES[5]?.name || 'Mohan Das');
  const [stageAction, setStageAction] = useState<'continue' | 'hold' | 'complete'>('continue');

  const job = jobs.find(j => j.id === id);
  if (!job) return <div className="p-8 text-sm text-[var(--text-2)]">Job not found: {id}</div>;

  const blockers = JOB_BLOCKERS.filter(b => b.jobId === id && b.status === 'open');
  const totalGood   = job.stages.reduce((s, st) => s + st.completedGoodQty, 0);
  const totalInput  = job.stages.reduce((s, st) => s + (st.inputQty || 0), 0);
  const pct         = totalInput > 0 ? Math.round((totalGood / totalInput) * 100) : 0;
  const completedStages = job.stages.filter(s => s.status === 'complete').length;

  const canUpdate  = ['owner', 'supervisor', 'operator'].includes(currentUser.role);
  const isBlocked  = job.hasBlocker || blockers.length > 0;
  const activeStage = job.stages.find(s => s.status === 'in_progress') || job.stages[0];

  // Open Stage Update Modal (Streamlined data entry)
  const openStageUpdate = (stageId?: string) => {
    const targetStage = stageId
      ? job.stages.find(s => s.id === stageId)
      : (job.stages.find(s => s.status === 'in_progress') || job.stages[0]);

    if (targetStage) {
      setSelectedStageId(targetStage.id);
      // Pre-fill remaining good quantity needed
      const remainingNeeded = Math.max(0, targetStage.inputQty - targetStage.completedGoodQty);
      setGoodQtyInput(remainingNeeded || targetStage.inputQty);
      setRejectQtyInput(0);
      setScrapQtyInput(0);
      setShowScrapFields(false);
      setStageAction(remainingNeeded === 0 ? 'complete' : 'continue');
      setStageModalOpen(true);
    }
  };

  const handleSaveStageUpdate = () => {
    const targetStage = job.stages.find(s => s.id === selectedStageId);
    if (!targetStage) return;

    const newStatus = stageAction === 'complete' ? 'complete' : stageAction === 'hold' ? 'hold' : 'in_progress';
    const totalGoodRecorded = targetStage.completedGoodQty + goodQtyInput;

    updateJobStage(job.id, selectedStageId, {
      completedGoodQty: totalGoodRecorded,
      rejectedQty: targetStage.rejectedQty + (showScrapFields ? rejectQtyInput : 0),
      scrapQty: (targetStage.scrapQty || 0) + (showScrapFields ? scrapQtyInput : 0),
      status: totalGoodRecorded >= targetStage.inputQty ? 'complete' : newStatus,
      owner: selectedEmployee,
    });

    setStageModalOpen(false);
    showToast({
      type: 'success',
      title: `Stage ${targetStage.name} Updated`,
      body: `Recorded +${goodQtyInput} good output units by ${selectedEmployee}.`,
    });
  };

  const handleResolveJobBlocker = (blockerId: string) => {
    resolveBlocker(blockerId);
    showToast({
      type: 'success',
      title: 'Blocker Resolved',
      body: 'Job unblocked and production clear to resume.',
    });
  };

  return (
    <div className="max-w-[1520px] mx-auto p-4 md:p-6 lg:p-8 space-y-6">

      {/* ── 1. Commercial & Engineering Command Header (Glance Level 1) ── */}
      <div className={clsx(
        'industrial-panel p-5 md:p-6 panel-accent-top relative overflow-hidden',
        isBlocked ? 'hazard-border' : ''
      )}>
        {/* Top Breadcrumb & Status Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => navigate('/jobs')}
              className="text-[var(--text-3)] hover:text-[var(--text)] flex items-center gap-1 font-medium transition-colors"
            >
              <ArrowLeft size={13} />
              Job Board
            </button>
            <span className="text-[var(--border-2)]">/</span>
            <span className="font-mono font-bold text-sm text-[var(--cyan-bright)] px-2 py-0.5 rounded bg-[var(--surface-3)] border border-[var(--border)]">
              {job.jobNumber}
            </span>
            <StatusChip status={job.status} size="sm" />
            {isBlocked && (
              <span className="heat-badge text-[10px] bg-red-500/20 text-red-400 border-red-500/30 flex items-center gap-1 font-bold animate-pulse">
                <AlertTriangle size={11} /> PRODUCTION BLOCKED
              </span>
            )}
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            {canUpdate && (
              <button
                onClick={() => openStageUpdate()}
                className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <Activity size={13} />
                Update Stage Progress
              </button>
            )}

            {canUpdate && job.status === 'active' && (
              <button
                onClick={() => { setJobStatus(job.id, 'hold'); showToast({ type: 'warning', title: 'Job placed on hold' }); }}
                className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1"
              >
                <Pause size={12} /> Hold Job
              </button>
            )}

            {canUpdate && job.status === 'hold' && (
              <button
                onClick={() => { setJobStatus(job.id, 'active'); showToast({ type: 'success', title: 'Job resumed' }); }}
                className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500"
              >
                <Play size={12} /> Resume Job
              </button>
            )}

            <button
              onClick={() => showToast({ type: 'info', title: 'Traveler Dossier', body: 'Compiling MTCs, drawings and inspection traveler pack...' })}
              className="btn-ghost text-xs py-1.5 px-3 hidden sm:flex items-center gap-1"
              title="Export physical manufacturing traveler"
            >
              <FileText size={12} /> Traveler Pack
            </button>
          </div>
        </div>

        {/* Commercial & Specification Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-4 text-xs">
          <div>
            <div className="text-[10px] font-mono uppercase text-[var(--text-3)]">Customer & Account</div>
            <div className="font-semibold text-[var(--text)] text-sm truncate mt-0.5">{job.customerName}</div>
            <div className="text-[10px] text-[var(--text-3)]">ID: {job.customerId}</div>
          </div>

          <div>
            <div className="text-[10px] font-mono uppercase text-[var(--text-3)]">Customer PO Number</div>
            <div className="font-mono font-bold text-[var(--text)] mt-0.5">{job.customerPoNumber || '—'}</div>
            <div className="text-[10px] text-[var(--text-3)]">Quote: {job.customerPoId ? 'QT-2024-089-R2' : 'Direct'}</div>
          </div>

          <div>
            <div className="text-[10px] font-mono uppercase text-[var(--text-3)]">Engineering Drawing</div>
            <div className="font-mono font-bold text-[var(--cyan-bright)] mt-0.5 flex items-center gap-1">
              {job.drawingRef || 'REV-STD-01'}
              <ExternalLink size={10} />
            </div>
            <div className="text-[10px] text-[var(--text-3)]">Vault Rev C · Verified</div>
          </div>

          <div>
            <div className="text-[10px] font-mono uppercase text-[var(--text-3)]">Contract Value</div>
            <div className="font-mono font-bold text-sm text-[var(--text)] mt-0.5">
              ₹{(((job.value ?? 0) / 1000)).toLocaleString('en-IN')}k
            </div>
            <div className="text-[10px] text-[var(--text-3)]">Ex-Works Hyderabad</div>
          </div>

          <div>
            <div className="text-[10px] font-mono uppercase text-[var(--text-3)]">Committed Due Date</div>
            <div className={clsx(
              'font-mono font-bold text-sm mt-0.5',
              isBlocked ? 'text-[var(--error)]' : 'text-[var(--text)]'
            )}>
              {new Date(job.plannedEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            <div className="text-[10px] text-[var(--text-3)]">14 Days Remaining</div>
          </div>

          <div>
            <div className="text-[10px] font-mono uppercase text-[var(--text-3)]">Production Supervisor</div>
            <div className="font-semibold text-[var(--text)] mt-0.5">{job.owner}</div>
            <div className="text-[10px] text-[var(--text-3)]">Hyderabad Main Plant</div>
          </div>
        </div>

        {/* ── Prominent "Next Action" Operational Callout Bar ── */}
        <div className={clsx(
          'mt-4 p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs',
          isBlocked
            ? 'bg-[var(--error-bg)]/25 border-[var(--error-border)]'
            : 'bg-[var(--surface-2)] border-[var(--cyan-border)]/50'
        )}>
          <div className="flex items-center gap-2.5">
            <span className={clsx(
              'p-1.5 rounded-lg flex-shrink-0',
              isBlocked ? 'bg-red-500/20 text-red-400' : 'bg-cyan-500/20 text-cyan-400'
            )}>
              {isBlocked ? <AlertTriangle size={15} /> : <Sparkles size={15} />}
            </span>
            <div>
              <div className="font-bold text-[var(--text)] text-xs">
                {isBlocked
                  ? 'CRITICAL BOTTLENECK: Material Shortage Halted Production'
                  : `CURRENT FOCUS: Stage ${activeStage.sequence} — ${activeStage.name} in progress`}
              </div>
              <div className="text-[11px] text-[var(--text-2)] mt-0.5">
                {isBlocked
                  ? 'SS Sheet 3mm deficit prevents cutting. Resolve blocker or reallocate WIP stock to proceed.'
                  : `Currently ${activeStage.completedGoodQty}/${activeStage.inputQty} units completed by ${activeStage.owner || 'Mohan Das'}. Next: advance good parts to Stage ${activeStage.sequence + 1}.`}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {isBlocked ? (
              <button
                onClick={() => blockers[0] && handleResolveJobBlocker(blockers[0].id)}
                className="btn-primary text-xs py-1.5 px-3 bg-red-600 hover:bg-red-500 shadow-none inline-flex items-center gap-1"
              >
                <Check size={12} /> Resolve Blocker
              </button>
            ) : (
              <button
                onClick={() => openStageUpdate(activeStage.id)}
                className="btn-primary text-xs py-1.5 px-3 inline-flex items-center gap-1"
              >
                <Activity size={12} /> Record Output
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. Interactive Stage Progression Timeline (Level 1 Glance) ── */}
      <div className="industrial-panel p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-[var(--cyan-bright)]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
              Production Stage Progression ({completedStages}/{job.stages.length} Complete · {pct}% Good Yield)
            </h2>
          </div>
          <span className="text-[11px] font-mono text-[var(--text-3)]">
            Click any stage node to record output
          </span>
        </div>

        {/* Pipeline Nodes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {job.stages.map((stage: any, index: number) => {
            const isDone   = stage.status === 'complete';
            const isActive = stage.status === 'in_progress';
            const isHold   = stage.status === 'hold';
            const stagePct = stage.inputQty > 0
              ? Math.min(100, Math.round((stage.completedGoodQty / stage.inputQty) * 100))
              : 0;

            return (
              <button
                key={stage.id}
                onClick={() => openStageUpdate(stage.id)}
                className={clsx(
                  'text-left p-3 rounded-xl border transition-all duration-150 relative group cursor-pointer',
                  isDone
                    ? 'bg-[var(--surface-2)] border-[var(--success-border)] hover:border-[var(--success)]'
                    : isActive
                    ? 'bg-[var(--surface-2)] border-[var(--cyan-border)] cyber-glow shadow-md'
                    : isHold
                    ? 'bg-[var(--error-bg)]/20 border-[var(--error-border)]'
                    : 'bg-[var(--surface)] border-[var(--border)] hover:border-[var(--border-strong)]'
                )}
              >
                {/* Node Status Header */}
                <div className="flex items-center justify-between mb-2">
                  <span className={clsx(
                    'w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold border',
                    isDone
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : isActive
                      ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                      : isHold
                      ? 'bg-red-500/20 text-red-400 border-red-500/40'
                      : 'bg-[var(--surface-3)] text-[var(--text-3)] border-[var(--border)]'
                  )}>
                    {isDone ? '✓' : isHold ? '!' : index + 1}
                  </span>
                  <StatusChip status={stage.status} size="sm" />
                </div>

                {/* Stage Info */}
                <div className="text-xs font-bold text-[var(--text)] group-hover:text-[var(--cyan-bright)] transition-colors truncate">
                  {stage.name}
                </div>
                <div className="text-[10px] text-[var(--text-3)] truncate mt-0.5">
                  {stage.workCentre || 'General Bay'}
                </div>

                {/* Stage Quantity Balance Bar */}
                <div className="mt-2.5 pt-2 border-t border-[var(--border)] space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-[var(--text-2)]">
                    <span>Good: <strong>{stage.completedGoodQty}</strong></span>
                    <span>Input: <strong>{stage.inputQty} {stage.uom}</strong></span>
                  </div>
                  <div className="progress-bar h-1.5">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${stagePct}%`,
                        background: isDone ? 'var(--success)' : isHold ? 'var(--error)' : 'var(--cyan-bright)',
                      }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Active Blocker Hazard Strip (If Any) ── */}
      {blockers.length > 0 && (
        <div className="rounded-xl border border-[var(--error-border)] bg-[var(--error-bg)]/20 p-4 space-y-3 hazard-strip">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert size={16} className="text-[var(--error)] animate-bounce" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--error)]">
                Active Production Blocker ({blockers.length})
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[var(--error)] uppercase">
              Immediate Resolution Required
            </span>
          </div>

          <div className="space-y-2">
            {blockers.map(b => (
              <div
                key={b.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-[var(--surface)] border border-[var(--error-border)]"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="heat-badge text-[10px] bg-red-500/20 text-red-400 border-red-500/30 font-bold">
                      {b.type.toUpperCase()} BLOCKER
                    </span>
                    <span className="text-[10px] text-[var(--text-3)] font-mono">
                      Raised by {b.raisedBy} · {new Date(b.raisedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-xs text-[var(--text)] font-medium mt-1">
                    {b.description}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleResolveJobBlocker(b.id)}
                    className="btn-primary text-xs py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 shadow-none"
                  >
                    <Check size={12} /> Resolve Blocker
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 3. Workspace Tab Navigation (Level 2 Deep Tabs) ── */}
      <div className="border-b border-[var(--border)] flex gap-1 overflow-x-auto pb-1">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              'px-3.5 py-2 text-xs font-semibold whitespace-nowrap rounded-t-lg transition-colors border-b-2 -mb-px flex items-center gap-1.5',
              tab === t
                ? 'bg-[var(--surface)] border-[var(--cyan-bright)] text-[var(--cyan-bright)] shadow-xs'
                : 'border-transparent text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]'
            )}
          >
            {t}
            {t === 'Blockers' && blockers.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-red-500 text-white">
                {blockers.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── 4. Tab Contents ── */}
      {tab === 'Overview' && (
        <div className="space-y-6">

          {/* ── Level 1 Overview: Concise 4-Pillar Readiness Summaries (Fast Scan) ── */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Pillar 1: Material Readiness Summary */}
            <div
              onClick={() => setTab('Materials')}
              className="industrial-panel p-4 space-y-3 cursor-pointer hover:border-[var(--border-strong)] transition-all group"
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                <div className="flex items-center gap-2">
                  <Package size={14} className="text-[var(--cyan-bright)]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                    1. Material Readiness
                  </h3>
                </div>
                <span className={clsx(
                  'text-[10px] font-mono px-2 py-0.5 rounded font-bold',
                  job.materialReadiness === 'ready' ? 'bg-emerald-500/20 text-emerald-400' :
                  job.materialReadiness === 'shortage' ? 'bg-red-500/20 text-red-400' :
                  'bg-amber-500/20 text-amber-400'
                )}>
                  {job.materialReadiness.toUpperCase()}
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="font-semibold text-[var(--text)]">
                  {job.materialReadiness === 'ready' ? 'All BOM Items Reserved' : 'Critical Shortage on Cutting'}
                </div>
                <p className="text-[11px] text-[var(--text-3)]">
                  {job.materialReadiness === 'ready'
                    ? 'MS Plate 8mm (320kg) & E6013 rods allocated'
                    : '108/432 kg SS Sheet available (SPO overdue)'}
                </p>
              </div>

              <div className="text-[11px] text-[var(--brand)] group-hover:underline pt-1 font-medium inline-flex items-center gap-1">
                Inspect 3 BOM items <ArrowRight size={11} />
              </div>
            </div>

            {/* Pillar 2: Machine Health Summary */}
            <div
              onClick={() => setTab('Assets')}
              className="industrial-panel p-4 space-y-3 cursor-pointer hover:border-[var(--border-strong)] transition-all group"
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                <div className="flex items-center gap-2">
                  <Wrench size={14} className="text-[var(--cyan-bright)]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                    2. Machinery Health
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                  BAYS ONLINE
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="font-semibold text-[var(--text)]">Fabrication & Cutting Ready</div>
                <p className="text-[11px] text-[var(--text-3)]">
                  Lincoln WM-01 & Hypertherm PC-01 nominal
                </p>
              </div>

              <div className="text-[11px] text-[var(--brand)] group-hover:underline pt-1 font-medium inline-flex items-center gap-1">
                View machine telemetry <ArrowRight size={11} />
              </div>
            </div>

            {/* Pillar 3: Quality Summary */}
            <div
              onClick={() => setTab('Quality')}
              className="industrial-panel p-4 space-y-3 cursor-pointer hover:border-[var(--border-strong)] transition-all group"
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-[var(--cyan-bright)]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                    3. Quality & NCRs
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                  100% PASS
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="font-semibold text-[var(--text)]">In-Process Checks Passed</div>
                <p className="text-[11px] text-[var(--text-3)]">
                  Weld Visual Check verified · 0 open NCRs
                </p>
              </div>

              <div className="text-[11px] text-[var(--brand)] group-hover:underline pt-1 font-medium inline-flex items-center gap-1">
                Quality logs & MTC <ArrowRight size={11} />
              </div>
            </div>

            {/* Pillar 4: Dispatch Summary */}
            <div
              onClick={() => setTab('Dispatch')}
              className="industrial-panel p-4 space-y-3 cursor-pointer hover:border-[var(--border-strong)] transition-all group"
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                <div className="flex items-center gap-2">
                  <Truck size={14} className="text-[var(--cyan-bright)]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                    4. Dispatch Readiness
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--surface-3)] text-[var(--text-3)] font-bold">
                  IN PRODUCTION
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="font-semibold text-[var(--text)]">Scheduled: 18 Nov 2024</div>
                <p className="text-[11px] text-[var(--text-3)]">
                  Destination: Bengaluru Plant · Pending final QR
                </p>
              </div>

              <div className="text-[11px] text-[var(--brand)] group-hover:underline pt-1 font-medium inline-flex items-center gap-1">
                Dispatch manifest <ArrowRight size={11} />
              </div>
            </div>

          </div>

          {/* ── Concise AI Co-Pilot Operational Insight (1 Sentence) ── */}
          <div className="intel-panel p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-xs text-[var(--text)]">
              <span className="p-1 rounded bg-[var(--cyan-muted)] text-[var(--cyan-bright)] flex-shrink-0">
                <Sparkles size={14} />
              </span>
              <span>
                {job.hasBlocker ? (
                  <>
                    <strong className="text-[var(--error)]">AI Action:</strong> Upstream PO SPO-2024-002 delay creates a 48h bottleneck. Recommend expediting supplier or reallocating 2 sheets from Store WIP.
                  </>
                ) : (
                  <>
                    <strong className="text-[var(--cyan-bright)]">AI Insight:</strong> Production tracking nominally on schedule. Material buffer for Stage 3 Welding is 100% verified. Next handover: 6 Nov 2024.
                  </>
                )}
              </span>
            </div>

            <span className="text-[10px] font-mono text-[var(--text-3)] uppercase whitespace-nowrap hidden md:inline">
              Simulated Telemetry
            </span>
          </div>

          {/* Detailed Job Profile & Specifications */}
          <div className="industrial-panel p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                Engineering & Commercial Contract Metadata
              </h3>
              <span className="text-[11px] font-mono text-[var(--text-3)]">
                Immutable record revision V3
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <Field label="Description" value={job.description} />
              <Field label="Site Location" value={job.siteName} />
              <Field label="Planned Start" value={new Date(job.plannedStart).toLocaleDateString('en-IN')} mono />
              <Field label="Priority Level" value={<span className="capitalize font-semibold text-[var(--brand)]">{job.priority}</span>} />
            </div>
          </div>
        </div>
      )}

      {/* ── Level 2 Investigate: Deep Workspace Tabs ── */}
      {tab === 'Stages' && <StagesTab job={job} onOpenUpdate={openStageUpdate} />}
      {tab === 'Materials' && <MaterialsTab job={job} />}
      {tab === 'Procurement' && <ProcurementTab job={job} navigate={navigate} />}
      {tab === 'Quality' && <QualityTab job={job} navigate={navigate} />}
      {tab === 'NCR/Rework' && <NCRTab job={job} navigate={navigate} />}
      {tab === 'Assets' && <AssetsTab job={job} navigate={navigate} />}
      {tab === 'Documents' && <DocumentsTab job={job} />}
      {tab === 'Dispatch' && <DispatchTab job={job} navigate={navigate} />}
      {tab === 'Updates' && <UpdatesTab job={job} onOpenUpdate={openStageUpdate} />}
      {tab === 'Blockers' && <BlockersTab blockers={blockers} job={job} onResolve={handleResolveJobBlocker} />}

      {/* ── Level 3 Act: Progressive Data Entry Modal (Easy Output Capture) ── */}
      {stageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md industrial-panel p-5 space-y-4 bg-[var(--surface)] border border-[var(--border-strong)]">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-[var(--cyan-bright)]" />
                <h3 className="text-sm font-bold text-[var(--text)]">
                  Record Output — {job.stages.find(s => s.id === selectedStageId)?.name}
                </h3>
              </div>
              <button
                onClick={() => setStageModalOpen(false)}
                className="text-[var(--text-3)] hover:text-[var(--text)]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Stage Selector (Prefilled) */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-[var(--text-3)] mb-1">
                  Active Stage
                </label>
                <select
                  value={selectedStageId}
                  onChange={e => {
                    const st = job.stages.find(s => s.id === e.target.value);
                    if (st) {
                      setSelectedStageId(st.id);
                      const rem = Math.max(0, st.inputQty - st.completedGoodQty);
                      setGoodQtyInput(rem || st.inputQty);
                    }
                  }}
                  className="w-full p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-[var(--cyan-border)]"
                >
                  {job.stages.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      Stage {s.sequence}: {s.name} ({s.status.toUpperCase()}) — {s.workCentre || 'General Bay'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Primary Input: Good Output Qty (Prefilled remaining) */}
              <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono uppercase text-[var(--success)] font-bold">
                    Good Output Quantity (Units)
                  </label>
                  <span className="text-[10px] font-mono text-[var(--text-3)]">
                    Target Input: {job.stages.find(s => s.id === selectedStageId)?.inputQty || 10}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={goodQtyInput}
                    onChange={e => setGoodQtyInput(Number(e.target.value))}
                    className="flex-1 p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] font-mono text-base font-bold text-[var(--text)] focus:outline-none focus:border-[var(--cyan-border)]"
                  />
                  <button
                    type="button"
                    onClick={() => setGoodQtyInput(goodQtyInput + 1)}
                    className="p-2.5 rounded-lg bg-[var(--surface-3)] text-[var(--text)] hover:bg-[var(--surface-2)] border border-[var(--border)] font-bold text-xs"
                    title="Add 1"
                  >
                    +1
                  </button>
                </div>
              </div>

              {/* Progressive Disclosure: Conditional Scrap & Rework Toggle */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowScrapFields(!showScrapFields)}
                  className="text-xs text-[var(--cyan-bright)] hover:underline inline-flex items-center gap-1 font-medium"
                >
                  {showScrapFields ? 'Hide Scrap / Rejection Fields' : '+ Report Scrap or Rejections (Optional)'}
                </button>

                {showScrapFields && (
                  <div className="mt-3 p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-[var(--warning)] mb-1">
                          Rework Qty
                        </label>
                        <input
                          type="number"
                          value={rejectQtyInput}
                          onChange={e => setRejectQtyInput(Number(e.target.value))}
                          className="w-full p-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] font-mono text-xs font-bold text-[var(--text)]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-[var(--error)] mb-1">
                          Scrap Qty
                        </label>
                        <input
                          type="number"
                          value={scrapQtyInput}
                          onChange={e => setScrapQtyInput(Number(e.target.value))}
                          className="w-full p-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] font-mono text-xs font-bold text-[var(--text)]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-[var(--text-3)] mb-1">
                        Scrap Reason Code
                      </label>
                      <select
                        value={scrapReason}
                        onChange={e => setScrapReason(e.target.value)}
                        className="w-full p-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] text-xs"
                      >
                        <option value="Dimensional Variation">Dimensional Variation (Tolerance Breach)</option>
                        <option value="Material Flaw">Raw Material Defect / Pitting</option>
                        <option value="Machine Error">CNC / Plasma Tool Misalignment</option>
                        <option value="Operator Handling">Handling Damage / Denting</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Worker Attribution (Prefilled with Mohan Das) */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-[var(--text-3)] mb-1">
                  Operator Attribution
                </label>
                <select
                  value={selectedEmployee}
                  onChange={e => setSelectedEmployee(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-[var(--cyan-border)]"
                >
                  {EMPLOYEES.map(emp => (
                    <option key={emp.id} value={emp.name}>
                      {emp.name} — {emp.designation} ({emp.department})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border)]">
              <button
                onClick={() => setStageModalOpen(false)}
                className="btn-ghost text-xs py-1.5 px-3"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStageUpdate}
                className="btn-primary text-xs py-1.5 px-4"
              >
                Record Progress
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ── Tab 2: Stages Full Table ──
function StagesTab({ job, onOpenUpdate }: any) {
  return (
    <div className="industrial-panel p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
        <h3 className="text-sm font-bold text-[var(--text)]">Stage-by-Stage Manufacturing Sequence</h3>
        <span className="text-xs font-mono text-[var(--text-3)]">{job.stages.length} Configured Stages</span>
      </div>
      <div className="overflow-x-auto">
        <table className="eoss-table">
          <thead>
            <tr>
              <th>Seq</th>
              <th>Stage Name</th>
              <th>Work Centre</th>
              <th>Status</th>
              <th>Input Qty</th>
              <th>Completed Good</th>
              <th>Rejected</th>
              <th>Scrap</th>
              <th>Operator</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {job.stages.map((s: any) => (
              <tr key={s.id} className="hover:bg-[var(--surface-2)] transition-colors">
                <td className="font-mono text-xs">{s.sequence}</td>
                <td className="font-semibold text-xs text-[var(--text)]">{s.name}</td>
                <td className="text-xs text-[var(--text-2)]">{s.workCentre || 'General Bay'}</td>
                <td><StatusChip status={s.status} size="sm" /></td>
                <td className="font-mono text-xs text-[var(--text)]">{s.inputQty} {s.uom}</td>
                <td className="font-mono text-xs font-bold text-emerald-400">{s.completedGoodQty} {s.uom}</td>
                <td className="font-mono text-xs text-amber-400">{s.rejectedQty}</td>
                <td className="font-mono text-xs text-red-400">{s.scrapQty || 0}</td>
                <td className="text-xs text-[var(--text-2)]">{s.owner || '—'}</td>
                <td className="text-right">
                  <button onClick={() => onOpenUpdate(s.id)} className="btn-ghost text-xs py-1 px-2.5">
                    Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tab 3: Materials BOM ──
function MaterialsTab({ job }: any) {
  const reqs = JOB_MATERIAL_REQS.filter(r => r.jobId === job.id);
  return (
    <div className="industrial-panel p-5 space-y-4">
      <h3 className="text-sm font-bold text-[var(--text)]">Bill of Materials (BOM) & Material Allocations</h3>
      <div className="overflow-x-auto">
        <table className="eoss-table">
          <thead>
            <tr>
              <th>Material Name</th>
              <th>Stage</th>
              <th>Required</th>
              <th>Reserved</th>
              <th>Shortage</th>
              <th>Allocated Lot</th>
              <th>MTC Status</th>
            </tr>
          </thead>
          <tbody>
            {reqs.map(r => (
              <tr key={r.id}>
                <td className="font-semibold text-xs text-[var(--text)]">{r.materialName}</td>
                <td className="text-xs text-[var(--text-2)]">{r.stageName}</td>
                <td className="font-mono text-xs">{r.requiredQty} {r.uom}</td>
                <td className="font-mono text-xs text-emerald-400 font-bold">{r.reservedQty} {r.uom}</td>
                <td>
                  {r.shortage ? (
                    <span className="pill text-[10px] bg-red-500/20 text-red-400 border-red-500/30">
                      Shortage: {r.requiredQty - r.reservedQty} {r.uom}
                    </span>
                  ) : (
                    <span className="text-[var(--text-3)] text-xs font-mono">None</span>
                  )}
                </td>
                <td className="font-mono text-xs text-[var(--cyan-bright)]">{r.lotIds && r.lotIds.length > 0 ? r.lotIds.join(', ') : 'LOT-2024-001'}</td>
                <td>
                  <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1 font-mono">
                    <FileCheck size={12} /> VERIFIED
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tab 4: Procurement Linkages ──
function ProcurementTab({ job, navigate }: any) {
  const { supplierPos } = useStore();
  const pos = supplierPos.filter(p => p.jobRef === job.jobNumber);
  return (
    <div className="industrial-panel p-5 space-y-4">
      <h3 className="text-sm font-bold text-[var(--text)]">Upstream Supplier Purchase Orders ({pos.length})</h3>
      {pos.length === 0 ? (
        <div className="text-xs text-[var(--text-3)] py-4">No direct supplier POs linked to this job</div>
      ) : (
        <div className="space-y-3">
          {pos.map(p => (
            <div key={p.id} className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs space-y-1">
              <div className="flex justify-between items-center font-bold">
                <span className="font-mono text-[var(--cyan-bright)]">{p.poNumber}</span>
                <span className="text-amber-400 font-mono">Committed: {p.committedDate}</span>
              </div>
              <div className="text-[var(--text)]">PO Value: ₹{(p.totalValue / 1000).toLocaleString('en-IN')}k ({p.lineCount} lines)</div>
              <div className="text-[var(--text-3)] text-[11px]">Supplier: {p.supplierName} · Status: {p.status.toUpperCase()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tab 5: Quality Logs ──
function QualityTab({ job, navigate }: any) {
  const { inspections } = useStore();
  const jobInspections = inspections.filter(i => i.jobNumber === job.jobNumber);
  return (
    <div className="industrial-panel p-5 space-y-4">
      <h3 className="text-sm font-bold text-[var(--text)]">Inspection Log & NDT Dossier ({jobInspections.length})</h3>
      {jobInspections.length === 0 ? (
        <div className="text-xs text-[var(--text-3)] py-4">No inspections recorded yet</div>
      ) : (
        <div className="space-y-3">
          {jobInspections.map(insp => (
            <div key={insp.id} onClick={() => navigate(`/quality/inspection/${insp.id}`)} className="p-3.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] cursor-pointer hover:border-[var(--cyan-border)] text-xs space-y-1">
              <div className="flex justify-between items-center font-bold">
                <span className="text-[var(--text)]">{insp.inspectionNumber} · {insp.type}</span>
                <StatusChip status={insp.result === 'pass' ? 'complete' : 'hold'} size="sm" />
              </div>
              <div className="text-[11px] text-[var(--text-2)]">Inspector: {insp.inspectorName} · Stage: {insp.stageName}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tab 6: NCRs ──
function NCRTab({ job, navigate }: any) {
  const { ncrs } = useStore();
  const jobNcrs = ncrs.filter(n => n.jobId === job.id);
  return (
    <div className="industrial-panel p-5 space-y-4">
      <h3 className="text-sm font-bold text-[var(--text)]">Non-Conformance Reports (NCR) ({jobNcrs.length})</h3>
      {jobNcrs.length === 0 ? (
        <div className="text-xs text-[var(--text-3)] py-4">No NCRs logged for this job</div>
      ) : (
        <div className="space-y-2">
          {jobNcrs.map(n => (
            <div key={n.id} onClick={() => navigate(`/quality/ncr/${n.id}`)} className="p-3.5 rounded-lg bg-[var(--surface-2)] border border-[var(--error-border)] cursor-pointer text-xs space-y-1">
              <div className="flex justify-between items-center font-bold text-[var(--error)]">
                <span>{n.ncrNumber} ({n.severity} Severity)</span>
                <span>Disposition: {n.disposition}</span>
              </div>
              <p className="text-[var(--text-2)]">{n.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tab 7: Assets ──
function AssetsTab({ job, navigate }: any) {
  const { assets } = useStore();
  return (
    <div className="industrial-panel p-5 space-y-3">
      <h3 className="text-sm font-bold text-[var(--text)]">Shop-Floor Machinery Allocation</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        {assets.slice(0, 4).map(a => (
          <div key={a.id} onClick={() => navigate(`/assets/${a.id}`)} className="p-3.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] cursor-pointer text-xs space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-bold text-[var(--text)]">{a.name} ({a.assetCode})</span>
              <StatusChip status={a.status} size="sm" />
            </div>
            <div className="text-[11px] text-[var(--text-3)]">{a.category} · {a.workCentre}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tab 8: Documents ──
function DocumentsTab({ job }: any) {
  return (
    <div className="industrial-panel p-5 space-y-3">
      <h3 className="text-sm font-bold text-[var(--text)]">Engineering Vault & Compliance Documents</h3>
      <div className="p-3.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs flex items-center justify-between">
        <div>
          <div className="font-bold text-[var(--text)]">{job.drawingRef || 'REV-STD-01'}</div>
          <div className="text-[11px] text-[var(--text-3)]">Engineering Drawing (Vault Rev C · Verified)</div>
        </div>
        <button className="btn-ghost text-xs py-1 px-3 inline-flex items-center gap-1">
          <ExternalLink size={12} /> View in Vault
        </button>
      </div>
    </div>
  );
}

// ── Tab 9: Dispatch ──
function DispatchTab({ job, navigate }: any) {
  const { dispatches } = useStore();
  const jobDispatches = dispatches.filter(d => d.jobs.includes(job.jobNumber));
  return (
    <div className="industrial-panel p-5 space-y-3">
      <h3 className="text-sm font-bold text-[var(--text)]">Dispatch & Outward Challans ({jobDispatches.length})</h3>
      {jobDispatches.length === 0 ? (
        <div className="text-xs text-[var(--text-3)] py-4">No dispatches created yet for this job</div>
      ) : (
        <div className="space-y-2">
          {jobDispatches.map(d => (
            <div key={d.id} onClick={() => navigate(`/dispatch/${d.id}`)} className="p-3.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] cursor-pointer text-xs space-y-1">
              <div className="flex justify-between items-center font-bold text-[var(--text)]">
                <span className="font-mono text-[var(--cyan-bright)]">{d.dispatchNumber}</span>
                <StatusChip status={d.status} size="sm" />
              </div>
              <div className="text-[11px] text-[var(--text-2)]">Carrier: {d.carrier} · LR: {d.lrNumber}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tab 10: Updates ──
function UpdatesTab({ job, onOpenUpdate }: any) {
  return (
    <div className="industrial-panel p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[var(--text)]">Stage Activity History</h3>
        <button onClick={() => onOpenUpdate()} className="btn-primary text-xs py-1 px-3">
          + Record Update
        </button>
      </div>
      <div className="space-y-2 text-xs">
        <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] flex justify-between items-center">
          <div>
            <span className="font-semibold text-[var(--text)]">Stage 1 Cutting Finished</span>
            <div className="text-[11px] text-[var(--text-3)]">Mohan Das recorded 10 good units</div>
          </div>
          <span className="font-mono text-[10px] text-[var(--text-3)]">09:30 AM Today</span>
        </div>
      </div>
    </div>
  );
}

// ── Tab 11: Blockers ──
function BlockersTab({ blockers, job, onResolve }: any) {
  return (
    <div className="industrial-panel p-5 space-y-4">
      <h3 className="text-sm font-bold text-[var(--text)]">Active & Historical Job Blockers ({blockers.length})</h3>
      {blockers.length === 0 ? (
        <div className="text-xs text-[var(--text-3)] py-4">No active blockers on this job</div>
      ) : (
        <div className="space-y-3">
          {blockers.map((b: any) => (
            <div key={b.id} className="p-4 rounded-xl border border-[var(--error-border)] bg-[var(--surface-2)] text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-[var(--error)]">
                <span>{b.type.toUpperCase()} BLOCKER</span>
                <button
                  onClick={() => onResolve(b.id)}
                  className="btn-primary text-xs py-1 px-3 bg-emerald-600 hover:bg-emerald-500 shadow-none"
                >
                  <Check size={12} /> Resolve Now
                </button>
              </div>
              <p className="text-[var(--text)] leading-relaxed">{b.description}</p>
              <div className="text-[10px] text-[var(--text-3)] font-mono">
                Raised by {b.raisedBy} at {new Date(b.raisedAt).toLocaleString('en-IN')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase text-[var(--text-3)]">{label}</div>
      <div className={clsx('text-xs font-semibold text-[var(--text)] mt-0.5 truncate', mono ? 'font-mono' : '')}>
        {value}
      </div>
    </div>
  );
}
