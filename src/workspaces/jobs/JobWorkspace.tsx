import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, AlertTriangle, Activity, Check, X,
  ExternalLink, ChevronRight, FileCheck, ShieldAlert
} from 'lucide-react';
import { useStore, JOB_BLOCKERS } from '../../store';
import { JOB_MATERIAL_REQS, EMPLOYEES } from '../../data/seed';
import StatusChip from '../../components/layout/StatusChip';
import clsx from 'clsx';

const TABS = ['Overview', 'Materials', 'Quality', 'Assets', 'All Stages'];

export default function JobWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    jobs, setJobStatus, updateJobStage, resolveBlocker, currentUser, showToast
  } = useStore();

  const [tab, setTab] = useState('Overview');
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState<string>('');
  const [goodQtyInput, setGoodQtyInput] = useState<number>(0);
  const [selectedEmployee, setSelectedEmployee] = useState<string>(EMPLOYEES[5]?.name || 'Mohan Das');

  const job = jobs.find(j => j.id === id);
  if (!job) return <div className="p-8 text-sm text-[var(--text-2)]">Job not found: {id}</div>;

  const blockers = JOB_BLOCKERS.filter(b => b.jobId === id && b.status === 'open');
  const isBlocked = job.hasBlocker || blockers.length > 0;
  const activeStage = job.stages.find(s => s.status === 'in_progress') || job.stages[0];

  // Open Stage Update Modal (Streamlined 2-click capture)
  const openStageUpdate = (stageId?: string) => {
    const targetStage = stageId
      ? job.stages.find(s => s.id === stageId)
      : activeStage;

    if (targetStage) {
      setSelectedStageId(targetStage.id);
      const rem = Math.max(0, targetStage.inputQty - targetStage.completedGoodQty);
      setGoodQtyInput(rem || targetStage.inputQty);
      setStageModalOpen(true);
    }
  };

  const handleSaveStageUpdate = () => {
    const targetStage = job.stages.find(s => s.id === selectedStageId);
    if (!targetStage) return;

    const totalGood = targetStage.completedGoodQty + goodQtyInput;
    updateJobStage(job.id, selectedStageId, {
      completedGoodQty: totalGood,
      status: totalGood >= targetStage.inputQty ? 'complete' : 'in_progress',
      owner: selectedEmployee,
    });

    setStageModalOpen(false);
    showToast({
      type: 'success',
      title: `Stage ${targetStage.name} Updated`,
      body: `Recorded +${goodQtyInput} units by ${selectedEmployee}.`,
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
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">

      {/* ── 1. Clean Header (Glance: Identity, Status & Primary Action) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => navigate('/jobs')}
              className="text-[var(--text-3)] hover:text-[var(--text)] flex items-center gap-1 font-medium"
            >
              <ArrowLeft size={13} />
              Jobs
            </button>
            <span className="text-[var(--text-3)]">/</span>
            <span className="font-mono font-bold text-[var(--cyan-bright)]">{job.jobNumber}</span>
            <StatusChip status={job.status} size="sm" />
            {isBlocked && (
              <span className="px-2 py-0.2 rounded text-[11px] font-bold bg-[var(--error-bg)] text-[var(--error)] border border-[var(--error-border)]">
                Blocked
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-[var(--text)]">
            {job.customerName}
          </h1>
          <div className="text-xs text-[var(--text-3)] flex items-center gap-3">
            <span>PO: <strong className="text-[var(--text-2)] font-mono">{job.customerPoNumber || '—'}</strong></span>
            <span>·</span>
            <span>Value: <strong className="text-[var(--text-2)] font-mono">₹{(((job.value ?? 0) / 1000)).toLocaleString('en-IN')}k</strong></span>
            <span>·</span>
            <span>Due Date: <strong className="text-[var(--text-2)] font-mono">{new Date(job.plannedEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isBlocked ? (
            <button
              onClick={() => blockers[0] && handleResolveJobBlocker(blockers[0].id)}
              className="btn-primary text-xs py-2 px-4 bg-red-600 hover:bg-red-500 shadow-none inline-flex items-center gap-1.5"
            >
              <Check size={13} /> Resolve Blocker
            </button>
          ) : (
            <button
              onClick={() => openStageUpdate()}
              className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5"
            >
              <Activity size={13} /> Update Progress
            </button>
          )}
        </div>
      </div>

      {/* ── 2. Prominent Next Action (Glance Level 1) ── */}
      <div className={clsx(
        'p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm',
        isBlocked ? 'bg-[var(--error-bg)]/20 border-[var(--error-border)]' : 'bg-[var(--surface)] border-[var(--border)]'
      )}>
        <div className="space-y-0.5">
          <div className="text-xs font-mono uppercase tracking-wider font-bold text-[var(--text-3)]">
            {isBlocked ? 'Current Blocker' : 'Current Stage & Next Action'}
          </div>
          <div className="text-sm text-[var(--text)]">
            {isBlocked ? (
              <span className="font-semibold text-[var(--error)]">
                SS Sheet 3mm shortage halted Cutting stage. Upstream PO SPO-2024-002 overdue.
              </span>
            ) : (
              <span>
                <strong>Stage {activeStage.sequence}: {activeStage.name}</strong> is in progress ({activeStage.completedGoodQty}/{activeStage.inputQty} good units by {activeStage.owner || 'Mohan Das'}).
              </span>
            )}
          </div>
        </div>

        {isBlocked ? (
          <button
            onClick={() => blockers[0] && handleResolveJobBlocker(blockers[0].id)}
            className="text-xs text-[var(--error)] hover:underline font-bold whitespace-nowrap self-start sm:self-auto"
          >
            Clear Blocker →
          </button>
        ) : (
          <button
            onClick={() => openStageUpdate(activeStage.id)}
            className="text-xs text-[var(--brand)] hover:underline font-bold whitespace-nowrap self-start sm:self-auto"
          >
            Record Next Output →
          </button>
        )}
      </div>

      {/* ── 3. Production Stage Progression Stepper (Calm & Linear) ── */}
      <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-3)] font-mono">
          Production Timeline
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {job.stages.map((stage: any, index: number) => {
            const isDone   = stage.status === 'complete';
            const isActive = stage.status === 'in_progress';
            const isHold   = stage.status === 'hold';

            return (
              <div
                key={stage.id}
                onClick={() => openStageUpdate(stage.id)}
                className={clsx(
                  'p-3 rounded-lg border text-xs space-y-1 transition-all cursor-pointer',
                  isDone ? 'bg-[var(--surface-2)] border-emerald-500/30' :
                  isActive ? 'bg-[var(--surface-2)] border-[var(--cyan-border)]' :
                  isHold ? 'bg-[var(--error-bg)]/20 border-[var(--error-border)]' :
                  'bg-[var(--surface-2)]/50 border-[var(--border)]'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[var(--text-3)]">Stage {index + 1}</span>
                  {isDone ? (
                    <span className="text-emerald-400 font-bold text-xs">✓ Done</span>
                  ) : isActive ? (
                    <span className="text-[var(--cyan-bright)] font-bold text-xs">Active</span>
                  ) : isHold ? (
                    <span className="text-[var(--error)] font-bold text-xs">Blocked</span>
                  ) : (
                    <span className="text-[var(--text-3)] text-xs">Pending</span>
                  )}
                </div>
                <div className="font-bold text-[var(--text)] truncate">{stage.name}</div>
                <div className="text-[11px] font-mono text-[var(--text-3)]">
                  {stage.completedGoodQty}/{stage.inputQty} {stage.uom}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 4. Workspace Tabs (Level 2 Deep Detail on Demand) ── */}
      <div className="border-b border-[var(--border)] flex gap-2">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              'px-3 py-2 text-xs font-semibold border-b-2 -mb-px transition-colors',
              tab === t
                ? 'border-[var(--cyan-bright)] text-[var(--cyan-bright)]'
                : 'border-transparent text-[var(--text-3)] hover:text-[var(--text)]'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── 5. Tab Content: Overview (Crisp 4-Pillar Readiness) ── */}
      {tab === 'Overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
              <div className="text-xs text-[var(--text-3)] font-medium">1. Materials</div>
              <div className="text-sm font-bold text-[var(--text)] mt-1">
                {job.materialReadiness === 'ready' ? 'All BOM Reserved' : 'Shortage Alert'}
              </div>
              <div className="text-xs text-[var(--text-3)] mt-0.5">MS Plate 8mm (320kg)</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
              <div className="text-xs text-[var(--text-3)] font-medium">2. Machinery</div>
              <div className="text-sm font-bold text-emerald-400 mt-1">Bays Online</div>
              <div className="text-xs text-[var(--text-3)] mt-0.5">Lincoln WM-01 nominal</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
              <div className="text-xs text-[var(--text-3)] font-medium">3. Quality</div>
              <div className="text-sm font-bold text-emerald-400 mt-1">100% Passed</div>
              <div className="text-xs text-[var(--text-3)] mt-0.5">Weld visual check passed</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
              <div className="text-xs text-[var(--text-3)] font-medium">4. Dispatch</div>
              <div className="text-sm font-bold text-[var(--text)] mt-1">Target 18 Nov</div>
              <div className="text-xs text-[var(--text-3)] mt-0.5">Bengaluru Plant</div>
            </div>
          </div>

          {/* AI Insight (1 Sentence) */}
          <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text-2)] flex items-center gap-2">
            <span className="text-[var(--cyan-bright)] font-bold">💡 AI Note:</span>
            <span>Production tracking nominally. Next planned handover is Stage 3 Welding on 6 Nov.</span>
          </div>

          {/* Commercial & Drawing Metadata */}
          <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2 text-xs">
            <div className="font-bold text-[var(--text)]">Engineering & Commercial Specifications</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-1">
              <div>
                <span className="text-[var(--text-3)] block">Drawing Reference:</span>
                <span className="font-mono font-bold text-[var(--cyan-bright)]">{job.drawingRef || 'REV-STD-01'}</span>
              </div>
              <div>
                <span className="text-[var(--text-3)] block">Work Location:</span>
                <span className="font-medium text-[var(--text)]">{job.siteName}</span>
              </div>
              <div>
                <span className="text-[var(--text-3)] block">Supervisor:</span>
                <span className="font-medium text-[var(--text)]">{job.owner}</span>
              </div>
              <div>
                <span className="text-[var(--text-3)] block">Priority:</span>
                <span className="capitalize font-semibold text-[var(--brand)]">{job.priority}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Materials BOM ── */}
      {tab === 'Materials' && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--surface-2)] text-xs text-[var(--text-3)] font-mono border-b border-[var(--border)]">
              <tr>
                <th className="py-3 px-4">Material</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Required</th>
                <th className="py-3 px-4">Reserved</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {JOB_MATERIAL_REQS.filter(r => r.jobId === job.id).map(r => (
                <tr key={r.id}>
                  <td className="py-3 px-4 font-medium text-[var(--text)]">{r.materialName}</td>
                  <td className="py-3 px-4 text-xs text-[var(--text-3)]">{r.stageName}</td>
                  <td className="py-3 px-4 font-mono">{r.requiredQty} {r.uom}</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400">{r.reservedQty} {r.uom}</td>
                  <td className="py-3 px-4">
                    {r.shortage ? (
                      <span className="text-xs font-bold text-[var(--error)]">Shortage ({r.requiredQty - r.reservedQty} {r.uom})</span>
                    ) : (
                      <span className="text-xs font-bold text-emerald-400">Allocated</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Tab: All Stages ── */}
      {tab === 'All Stages' && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--surface-2)] text-xs text-[var(--text-3)] font-mono border-b border-[var(--border)]">
              <tr>
                <th className="py-3 px-4">Seq</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Work Centre</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Completed</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {job.stages.map((s: any) => (
                <tr key={s.id}>
                  <td className="py-3 px-4 font-mono text-xs">{s.sequence}</td>
                  <td className="py-3 px-4 font-bold text-[var(--text)]">{s.name}</td>
                  <td className="py-3 px-4 text-xs text-[var(--text-3)]">{s.workCentre || 'General Bay'}</td>
                  <td className="py-3 px-4"><StatusChip status={s.status} size="sm" /></td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400">{s.completedGoodQty}/{s.inputQty} {s.uom}</td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => openStageUpdate(s.id)} className="text-xs text-[var(--brand)] hover:underline font-medium">
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── 6. Streamlined Stage Update Modal (2 Clicks) ── */}
      {stageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl p-5 space-y-4 bg-[var(--surface)] border border-[var(--border)]">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h3 className="text-sm font-bold text-[var(--text)]">
                Record Output — {job.stages.find(s => s.id === selectedStageId)?.name}
              </h3>
              <button onClick={() => setStageModalOpen(false)} className="text-[var(--text-3)] hover:text-[var(--text)]">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-medium text-[var(--text-2)] mb-1">
                  Good Output Quantity
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={goodQtyInput}
                    onChange={e => setGoodQtyInput(Number(e.target.value))}
                    className="flex-1 p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] font-mono text-base font-bold text-[var(--text)]"
                  />
                  <button
                    type="button"
                    onClick={() => setGoodQtyInput(goodQtyInput + 1)}
                    className="p-2.5 rounded-lg bg-[var(--surface-3)] text-[var(--text)] font-bold text-xs"
                  >
                    +1
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-2)] mb-1">
                  Operator
                </label>
                <select
                  value={selectedEmployee}
                  onChange={e => setSelectedEmployee(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)]"
                >
                  {EMPLOYEES.map(emp => (
                    <option key={emp.id} value={emp.name}>{emp.name} ({emp.department})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
              <button onClick={() => setStageModalOpen(false)} className="btn-ghost text-xs py-1.5 px-3">
                Cancel
              </button>
              <button onClick={handleSaveStageUpdate} className="btn-primary text-xs py-1.5 px-4">
                Save Output
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
