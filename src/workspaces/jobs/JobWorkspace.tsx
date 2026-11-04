import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, AlertTriangle, ChevronRight, Clock, Package, FileText,
  Activity, Layers, Users, CheckCircle, Play, Pause, Truck,
  Calendar, User, MapPin, DollarSign, Zap, Shield, Wrench,
  TrendingUp, AlertCircle, ArrowRight, Check, X, Sparkles,
  FileCheck, ShieldAlert, Cpu, ExternalLink, RefreshCw, Box
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
  const [rejectQtyInput, setRejectQtyInput] = useState<number>(0);
  const [scrapQtyInput, setScrapQtyInput] = useState<number>(0);
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

  // Open Stage Update Modal
  const openStageUpdate = (stageId?: string) => {
    const targetStage = stageId
      ? job.stages.find(s => s.id === stageId)
      : (job.stages.find(s => s.status === 'in_progress') || job.stages[0]);

    if (targetStage) {
      setSelectedStageId(targetStage.id);
      setGoodQtyInput(targetStage.completedGoodQty);
      setRejectQtyInput(targetStage.rejectedQty);
      setScrapQtyInput(targetStage.scrapQty || 0);
      setStageAction(targetStage.status === 'complete' ? 'complete' : targetStage.status === 'hold' ? 'hold' : 'continue');
      setStageModalOpen(true);
    }
  };

  const handleSaveStageUpdate = () => {
    const targetStage = job.stages.find(s => s.id === selectedStageId);
    if (!targetStage) return;

    const newStatus = stageAction === 'complete' ? 'complete' : stageAction === 'hold' ? 'hold' : 'in_progress';
    updateJobStage(job.id, selectedStageId, {
      completedGoodQty: goodQtyInput,
      rejectedQty: rejectQtyInput,
      scrapQty: scrapQtyInput,
      status: newStatus,
      owner: selectedEmployee,
    });

    setStageModalOpen(false);
    showToast({
      type: 'success',
      title: `Stage ${targetStage.name} Updated`,
      body: `Recorded: ${goodQtyInput} good units by ${selectedEmployee}`,
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

      {/* ── 1. Commercial & Engineering Command Header ── */}
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
      </div>

      {/* ── 2. Interactive Stage Progression Pipeline (Full Width) ── */}
      <div className="industrial-panel p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-[var(--cyan-bright)]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
              Production Stage Progression ({completedStages}/{job.stages.length} Complete · {pct}% Good Yield)
            </h2>
          </div>
          <span className="text-[11px] font-mono text-[var(--text-3)]">
            Click any stage node to record good output or report downtime
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
                  'text-left p-3.5 rounded-xl border transition-all duration-150 relative group cursor-pointer',
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
                {stage.owner && (
                  <div className="text-[10px] font-mono text-[var(--text-2)] mt-0.5 truncate">
                    Worker: {stage.owner}
                  </div>
                )}

                {/* Stage Quantity Balance Bar (J1 Blueprint Rule) */}
                <div className="mt-3 pt-2 border-t border-[var(--border)] space-y-1">
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
                  {stage.rejectedQty > 0 && (
                    <div className="text-[10px] text-[var(--error)] font-mono">
                      {stage.rejectedQty} rejected
                    </div>
                  )}
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

      {/* ── 3. Workspace Tab Navigation ── */}
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

          {/* The 4-Pillar Manufacturing Readiness Cockpit */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Pillar 1: Material Readiness & BOM */}
            <div className="industrial-panel p-4 space-y-3">
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

              {/* Material Allocation Lines */}
              <div className="space-y-2">
                {JOB_MATERIAL_REQS.filter(r => r.jobId === job.id).length > 0 ? (
                  JOB_MATERIAL_REQS.filter(r => r.jobId === job.id).map(r => (
                    <div key={r.id} className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] space-y-1 text-xs">
                      <div className="flex justify-between font-medium">
                        <span className="text-[var(--text)] truncate">{r.materialName}</span>
                        <span className={clsx('font-mono font-bold', r.shortage ? 'text-[var(--error)]' : 'text-emerald-400')}>
                          {r.reservedQty}/{r.requiredQty} {r.uom}
                        </span>
                      </div>
                      <div className="text-[10px] text-[var(--text-3)] font-mono flex items-center justify-between">
                        <span>Stage: {r.stageName}</span>
                        <span>{r.shortage ? 'SHORTAGE' : 'LOT ALLOCATED'}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-2.5 rounded-lg bg-[var(--surface-2)] text-xs text-[var(--text-2)]">
                    MS Plate 8mm: 320 kg allocated (LOT-2024-001, MTC Verified)
                  </div>
                )}
              </div>

              <button
                onClick={() => setTab('Materials')}
                className="w-full text-center text-xs text-[var(--brand)] hover:underline pt-1 font-medium inline-flex items-center justify-center gap-1"
              >
                Inspect Full Material BOM <ChevronRight size={12} />
              </button>
            </div>

            {/* Pillar 2: Machine & Work Centre Health */}
            <div className="industrial-panel p-4 space-y-3">
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

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[var(--text)]">Fabrication Bay</span>
                    <span className="text-[10px] font-mono text-emerald-400">OPERATIONAL</span>
                  </div>
                  <div className="text-[11px] text-[var(--text-2)]">Lincoln PowerWave S350 (WM-01)</div>
                </div>

                <div className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[var(--text)]">Cutting Bay</span>
                    <span className="text-[10px] font-mono text-emerald-400">OPERATIONAL</span>
                  </div>
                  <div className="text-[11px] text-[var(--text-2)]">Hypertherm Plasma Cutter (PC-01)</div>
                </div>
              </div>

              <button
                onClick={() => setTab('Assets')}
                className="w-full text-center text-xs text-[var(--brand)] hover:underline pt-1 font-medium inline-flex items-center justify-center gap-1"
              >
                View Asset Telemetry <ChevronRight size={12} />
              </button>
            </div>

            {/* Pillar 3: Quality Status & NCRs */}
            <div className="industrial-panel p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-[var(--cyan-bright)]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                    3. Quality & NCRs
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                  100% PASS RATE
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[var(--text)]">In-Process Inspection</span>
                    <span className="text-[10px] font-mono text-emerald-400">PASSED</span>
                  </div>
                  <div className="text-[11px] text-[var(--text-2)]">Weld Visual Check · Inspector: Priya Patel</div>
                </div>

                <div className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[var(--text)]">MTC Dossier</span>
                    <span className="text-[10px] font-mono text-[var(--cyan-bright)]">VERIFIED</span>
                  </div>
                  <div className="text-[11px] text-[var(--text-2)]">MTC-2024-047 matched to Lot 001</div>
                </div>
              </div>

              <button
                onClick={() => setTab('Quality')}
                className="w-full text-center text-xs text-[var(--brand)] hover:underline pt-1 font-medium inline-flex items-center justify-center gap-1"
              >
                Quality Inspection Logs <ChevronRight size={12} />
              </button>
            </div>

            {/* Pillar 4: Dispatch Readiness */}
            <div className="industrial-panel p-4 space-y-3">
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

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[var(--text)]">Quality Release (QR)</span>
                    <span className="text-[10px] font-mono text-[var(--text-3)]">Awaiting Final Insp</span>
                  </div>
                  <div className="text-[11px] text-[var(--text-2)]">Dispatch blocked until QR generated</div>
                </div>

                <div className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[var(--text)]">Carrier Logistics</span>
                    <span className="text-[10px] font-mono text-[var(--text-3)]">Pending Release</span>
                  </div>
                  <div className="text-[11px] text-[var(--text-2)]">Destination: Bengaluru Plant</div>
                </div>
              </div>

              <button
                onClick={() => setTab('Dispatch')}
                className="w-full text-center text-xs text-[var(--brand)] hover:underline pt-1 font-medium inline-flex items-center justify-center gap-1"
              >
                Dispatch Manifest & Pack <ChevronRight size={12} />
              </button>
            </div>

          </div>

          {/* AI Contextual Manufacturing Co-pilot & Schedule Synthesis */}
          <div className="intel-panel p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--cyan-bright)]">
                <Sparkles size={14} />
                <span>EOSS AI Manufacturing Co-Pilot · Real-Time Telemetry Diagnosis</span>
              </div>
              <span className="text-[10px] font-mono text-[var(--text-3)]">
                SIMULATED PREDICTIVE MODEL
              </span>
            </div>

            <p className="text-xs text-[var(--text)] leading-relaxed max-w-4xl">
              {job.hasBlocker
                ? `Job ${job.jobNumber} is currently blocked by physical bottlenecks. Critical path analysis indicates every 24 hours of delay will shift final dispatch by 1.4 production days due to downstream welding machine contention. Recommended action: resolve the root blocker and prioritize fit-up handover.`
                : `Job ${job.jobNumber} is running nominally on the planned trajectory. Material buffer is healthy with 100% of MS Plate 8mm reserved and verified. Stage 2 (Fit-up) is currently 60% complete with Mohan Das recording 6 good assemblies. No schedule drift detected.`}
            </p>

            <div className="flex items-center gap-2 pt-2 border-t border-[var(--cyan-border)]/40 text-[11px] font-mono text-[var(--text-2)]">
              <span>Next Milestone: <strong>Stage 3 Welding</strong></span>
              <span>·</span>
              <span>Planned Handover: <strong>6 Nov 2024</strong></span>
              <span>·</span>
              <span>Assigned Machine: <strong>WM-02 ESAB</strong></span>
            </div>
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
              <Field label="Current Production Stage" value={job.currentStage} />
              <Field label="Target Yield" value="98.5% Expected" />
              <Field label="Customer Account" value={job.customerName} />
              <Field label="PO Reference" value={job.customerPoNumber || '—'} mono />
              <Field label="Planned Start" value={new Date(job.plannedStart).toLocaleDateString('en-IN')} />
              <Field label="Committed Delivery" value={new Date(job.plannedEnd).toLocaleDateString('en-IN')} />
            </div>
          </div>

        </div>
      )}

      {/* Secondary Tabs (Fully preserved with complete functionality) */}
      {tab === 'Stages'      && <Stages job={job} canUpdate={canUpdate} navigate={navigate} onOpenUpdate={openStageUpdate} />}
      {tab === 'Materials'   && <Materials job={job} />}
      {tab === 'Procurement' && <ProcurementTab job={job} navigate={navigate} />}
      {tab === 'Updates'     && <Updates job={job} />}
      {tab === 'Documents'   && <DocTab job={job} />}
      {tab === 'Quality'     && <QualityTab job={job} navigate={navigate} />}
      {tab === 'NCR/Rework'  && <NCRTab job={job} navigate={navigate} />}
      {tab === 'Assets'      && <AssetsTab job={job} navigate={navigate} />}
      {tab === 'Dispatch'    && <DispatchTab job={job} navigate={navigate} />}
      {tab === 'Blockers'    && <BlockersTab blockers={blockers} job={job} onResolve={handleResolveJobBlocker} />}

      {/* ── 5. Inline Stage Update Modal (Instant Interaction) ── */}
      {stageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg industrial-panel p-5 space-y-4 bg-[var(--surface)] border border-[var(--border-strong)]">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-[var(--cyan-bright)]" />
                <h3 className="text-sm font-bold text-[var(--text)]">
                  Record Stage Update — {job.stages.find(s => s.id === selectedStageId)?.name}
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
              {/* Stage Selector */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-[var(--text-3)] mb-1">
                  Select Production Stage
                </label>
                <select
                  value={selectedStageId}
                  onChange={e => {
                    const st = job.stages.find(s => s.id === e.target.value);
                    if (st) {
                      setSelectedStageId(st.id);
                      setGoodQtyInput(st.completedGoodQty);
                      setRejectQtyInput(st.rejectedQty);
                      setScrapQtyInput(st.scrapQty || 0);
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

              {/* Quantities Grid (J1 Stage Accounting) */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-[var(--success)] mb-1">
                    Good Output Qty
                  </label>
                  <input
                    type="number"
                    value={goodQtyInput}
                    onChange={e => setGoodQtyInput(Number(e.target.value))}
                    className="w-full p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] font-mono text-sm font-bold text-[var(--text)]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-[var(--warning)] mb-1">
                    Rework Qty
                  </label>
                  <input
                    type="number"
                    value={rejectQtyInput}
                    onChange={e => setRejectQtyInput(Number(e.target.value))}
                    className="w-full p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] font-mono text-sm font-bold text-[var(--text)]"
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
                    className="w-full p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] font-mono text-sm font-bold text-[var(--text)]"
                  />
                </div>
              </div>

              {/* Worker Attribution (J3 Employee Rule) */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-[var(--text-3)] mb-1">
                  Worker Attribution (Shop Floor Operator)
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

              {/* Transition Action */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-[var(--text-3)] mb-1">
                  Stage Status Transition
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setStageAction('continue')}
                    className={clsx(
                      'py-2 px-3 rounded-lg border text-center font-medium transition-colors',
                      stageAction === 'continue' ? 'bg-[var(--surface-3)] border-[var(--cyan-bright)] text-[var(--cyan-bright)]' : 'bg-[var(--surface-2)] border-[var(--border)] text-[var(--text-2)]'
                    )}
                  >
                    In Progress
                  </button>
                  <button
                    type="button"
                    onClick={() => setStageAction('hold')}
                    className={clsx(
                      'py-2 px-3 rounded-lg border text-center font-medium transition-colors',
                      stageAction === 'hold' ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-[var(--surface-2)] border-[var(--border)] text-[var(--text-2)]'
                    )}
                  >
                    Hold Stage
                  </button>
                  <button
                    type="button"
                    onClick={() => setStageAction('complete')}
                    className={clsx(
                      'py-2 px-3 rounded-lg border text-center font-medium transition-colors',
                      stageAction === 'complete' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-[var(--surface-2)] border-[var(--border)] text-[var(--text-2)]'
                    )}
                  >
                    Complete Stage
                  </button>
                </div>
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
                Save Stage Update
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/* ── Tab Components (Stages, Materials, Procurement, Quality, etc.) ── */
function Stages({ job, canUpdate, navigate, onOpenUpdate }: any) {
  return (
    <div className="space-y-3">
      {job.stages.map((s: any) => (
        <div key={s.id} className="industrial-panel p-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full text-sm font-bold flex items-center justify-center flex-shrink-0 bg-[var(--surface-3)] text-[var(--text)] font-mono">
                {s.sequence}
              </span>
              <div>
                <div className="font-semibold text-sm text-[var(--text)]">{s.name}</div>
                <div className="text-xs text-[var(--text-2)]">{s.workCentre || 'General Bay'} · Operator: {s.owner || 'Unassigned'}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusChip status={s.status} size="sm" />
              {canUpdate && (
                <button
                  onClick={() => onOpenUpdate(s.id)}
                  className="btn-primary text-xs py-1.5 px-3"
                >
                  Update Stage
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 pt-3 border-t border-[var(--border)]">
            <SmallField label="Planned Schedule" value={`${new Date(s.plannedStart).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} → ${new Date(s.plannedEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`} />
            <SmallField label="Actual Start" value={s.actualStart ? new Date(s.actualStart).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Not started'} />
            <SmallField label="Input Quantity" value={`${s.inputQty} ${s.uom}`} />
            <SmallField label="Good / Reject Balance" value={`${s.completedGoodQty} good / ${s.rejectedQty} reject`} />
          </div>

          {s.completedGoodQty > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-[11px] mb-1 font-mono text-[var(--text-3)]">
                <span>Progress: {Math.round((s.completedGoodQty / s.inputQty) * 100)}%</span>
                <span>{s.completedGoodQty} / {s.inputQty} {s.uom}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${Math.min(100, (s.completedGoodQty / s.inputQty) * 100)}%`, background: 'var(--success)' }} />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Materials({ job }: any) {
  const reqs = JOB_MATERIAL_REQS.filter(r => r.jobId === job.id);
  if (reqs.length === 0) {
    return (
      <div className="industrial-panel py-12 text-center text-sm text-[var(--text-3)]">
        No material requirements recorded for this job
      </div>
    );
  }
  return (
    <div className="industrial-panel overflow-hidden">
      <div className="p-4 border-b border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[var(--text)]">Job Material Requirements & BOM Reconciliation</h3>
          <p className="text-[11px] font-mono text-[var(--text-3)]">Required vs Reserved vs Issued with Lot linkages</p>
        </div>
      </div>
      <table className="eoss-table">
        <thead>
          <tr>
            <th>Material Item</th>
            <th>Production Stage</th>
            <th>Required Qty</th>
            <th>Reserved Qty</th>
            <th>Issued Qty</th>
            <th>Status</th>
            <th>Linked Lots</th>
          </tr>
        </thead>
        <tbody>
          {reqs.map(r => (
            <tr key={r.id}>
              <td>
                <div className="font-semibold text-xs text-[var(--text)]">{r.materialName}</div>
              </td>
              <td className="text-xs text-[var(--text-2)]">{r.stageName}</td>
              <td className="font-mono text-xs font-bold text-[var(--text)]">{r.requiredQty} {r.uom}</td>
              <td className="font-mono text-xs text-amber-400">{r.reservedQty} {r.uom}</td>
              <td className="font-mono text-xs text-emerald-400">{r.issuedQty} {r.uom}</td>
              <td>
                <StatusChip status={r.shortage ? 'shortage' : 'available'} label={r.shortage ? 'Shortage' : 'Available'} size="sm" />
              </td>
              <td>
                <span className="font-mono text-xs text-[var(--cyan-bright)]">{r.lotIds?.join(', ') || '—'}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProcurementTab({ job, navigate }: any) {
  const prs  = PURCHASE_REQS.filter(p => p.jobId === job.id);
  const spos = SUPPLIER_PO_LINES.filter(l => l.materialItemId && l.status);
  return (
    <div className="space-y-4">
      <div className="industrial-panel overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--text)]">Purchase Requisitions for This Job ({prs.length})</h3>
        </div>
        {prs.length === 0 ? (
          <div className="py-8 text-center text-xs text-[var(--text-3)]">No PRs raised for this job</div>
        ) : (
          <table className="eoss-table">
            <thead><tr><th>PR #</th><th>Raised By</th><th>Date</th><th>Required By</th><th>Qty</th><th>Status</th></tr></thead>
            <tbody>
              {prs.map(p => (
                <tr key={p.id}>
                  <td><span className="font-mono text-xs text-[var(--brand)] font-semibold">{p.prNumber}</span></td>
                  <td className="text-xs">{p.raisedBy}</td>
                  <td className="font-mono text-xs text-[var(--text-3)]">{p.raisedDate}</td>
                  <td className="font-mono text-xs">{p.requiredBy}</td>
                  <td className="font-mono text-xs">{p.totalQty}</td>
                  <td><StatusChip status={p.status} size="sm" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Updates({ job }: any) {
  return (
    <div className="industrial-panel p-5 space-y-4">
      <h3 className="text-sm font-bold text-[var(--text)]">Production Stage Updates & Evidence Log</h3>
      <div className="space-y-3">
        {job.stages.map((s: any) => (
          <div key={s.id} className="p-3.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-bold text-[var(--text)]">Stage {s.sequence}: {s.name}</span>
              <span className="font-mono text-[10px] text-[var(--text-3)]">{s.plannedEnd}</span>
            </div>
            <p className="text-[var(--text-2)]">
              Output: {s.completedGoodQty} good units, {s.rejectedQty} rejected. Handled by {s.owner || 'Unassigned'}.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DocTab({ job }: any) {
  const { documents } = useStore();
  const jobDocs = documents.filter(d => d.linkedEntities.some(le => le.ref === job.jobNumber || le.type === 'Job'));
  return (
    <div className="industrial-panel p-5 space-y-3">
      <h3 className="text-sm font-bold text-[var(--text)]">Attached Job Documents & Drawings ({jobDocs.length})</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        {jobDocs.map(d => (
          <div key={d.id} className="p-3.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs space-y-1">
            <div className="font-bold text-[var(--text)]">{d.title}</div>
            <div className="text-[11px] text-[var(--text-3)] font-mono">{d.docType} · Version {d.version}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QualityTab({ job, navigate }: any) {
  const { inspections } = useStore();
  const jobInsp = inspections.filter(i => i.jobId === job.id);
  return (
    <div className="industrial-panel p-5 space-y-3">
      <h3 className="text-sm font-bold text-[var(--text)]">Quality Inspections ({jobInsp.length})</h3>
      {jobInsp.length === 0 ? (
        <div className="text-xs text-[var(--text-3)] py-4">No inspection records logged yet</div>
      ) : (
        <table className="eoss-table">
          <thead><tr><th>Inspection #</th><th>Type</th><th>Inspector</th><th>Date</th><th>Outcome</th></tr></thead>
          <tbody>
            {jobInsp.map(i => (
              <tr key={i.id} onClick={() => navigate(`/quality/inspection/${i.id}`)} className="cursor-pointer">
                <td><span className="font-mono text-xs text-[var(--brand)] font-bold">{i.inspectionNumber}</span></td>
                <td className="text-xs">{i.type}</td>
                <td className="text-xs">{i.inspectorName}</td>
                <td className="font-mono text-xs">{i.date}</td>
                <td><StatusChip status={i.result} size="sm" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function NCRTab({ job, navigate }: any) {
  const { ncrs } = useStore();
  const jobNcrs = ncrs.filter(n => n.jobId === job.id);
  return (
    <div className="industrial-panel p-5 space-y-3">
      <h3 className="text-sm font-bold text-[var(--text)]">Non-Conformance Reports ({jobNcrs.length})</h3>
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

function SmallField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase text-[var(--text-3)]">{label}</div>
      <div className="text-xs font-semibold text-[var(--text)] mt-0.5">{value}</div>
    </div>
  );
}
