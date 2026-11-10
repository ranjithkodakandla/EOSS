import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, AlertTriangle, Activity, Check, X, Pencil,
  ExternalLink, ChevronRight, FileCheck, ShieldAlert
} from 'lucide-react';
import { useStore } from '../../store';
import { EMPLOYEES } from '../../data/seed';
import StatusChip from '../../components/layout/StatusChip';
import MaterialFeasibilityPanel from '../../components/domain/MaterialFeasibilityPanel';
import clsx from 'clsx';
import { jobMaterialQuantities, materialReadinessForJob } from '../../domain/inventory';

const TABS = ['Overview', 'Stages', 'Materials', 'Quality', 'NCR / Rework', 'Updates', 'Blockers'];

export default function JobWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    jobs, setJobStatus, updateJobStage, updateJob, cancelJob, resolveBlocker, currentUser, showToast, inventory, storeLocations,
    inspections, ncrs, lots, issueMaterial, addInspection, addNCR,
    jobBlockers: allJobBlockers, jobMaterialReqs, materials, stageTemplates,
  } = useStore();

  const [tab, setTab] = useState('Overview');
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState<string>('');
  const [goodQtyInput, setGoodQtyInput] = useState<number>(0);
  const [rejectQtyInput, setRejectQtyInput] = useState<number>(0);
  const [stageNotes, setStageNotes] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>(EMPLOYEES[5]?.name || 'Mohan Das');
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [recordForm, setRecordForm] = useState({ status: 'active' as const, currentStage: '', owner: '', plannedEnd: '', notes: '' });

  const job = jobs.find(j => j.id === id);
  const activeStage = job?.stages.find(s => s.status === 'in_progress') || job?.stages[0];

  useEffect(() => {
    if (searchParams.get('update') === '1' && activeStage) {
      const rem = Math.max(0, activeStage.inputQty - activeStage.completedGoodQty);
      setRecordForm({ status: 'active', currentStage: activeStage.name, owner: job?.owner ?? '', plannedEnd: job?.plannedEnd ?? '', notes: '' });
      setRecordModalOpen(true);
    }
    // Open the stage form once when Home asks to update this job.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!job || !activeStage) return <div className="p-8 text-sm text-[var(--text-2)]">Job not found: {id}</div>;

  const blockers = allJobBlockers.filter(b => b.jobId === id && b.status === 'open');
  const jobReqs = jobMaterialReqs.filter(r => r.jobId === job.id);
  const materialReadiness = materialReadinessForJob(job, jobMaterialReqs, inventory, lots, storeLocations);
  const materialRows = jobMaterialQuantities(job, jobMaterialReqs, inventory, storeLocations);
  const workflowName = job.stageTemplateName && !job.stageTemplateName.toLowerCase().startsWith('custom')
    ? job.stageTemplateName
    : stageTemplates.find(template => template.stages.length === job.stages.length)?.name ?? 'Job workflow snapshot';
  const isBlocked = job.hasBlocker || blockers.length > 0;

  // Open Stage Update Modal (Streamlined 2-click capture)
  const openStageUpdate = (stageId?: string) => {
    const targetStage = stageId
      ? job.stages.find(s => s.id === stageId)
      : activeStage;

    if (targetStage) {
      setSelectedStageId(targetStage.id);
      const rem = Math.max(0, targetStage.inputQty - targetStage.completedGoodQty);
      setGoodQtyInput(rem || targetStage.inputQty);
      setRejectQtyInput(0);
      setStageNotes('');
      setStageModalOpen(true);
    }
  };

  const handleSaveStageUpdate = () => {
    const targetStage = job.stages.find(s => s.id === selectedStageId);
    if (!targetStage) return;

    const totalGood = targetStage.completedGoodQty + goodQtyInput;
    const totalReject = targetStage.rejectedQty + rejectQtyInput;
    updateJobStage(job.id, selectedStageId, {
      completedGoodQty: totalGood,
      rejectedQty: totalReject,
      status: totalGood >= targetStage.inputQty ? 'complete' : 'in_progress',
      owner: selectedEmployee,
      actualStart: targetStage.actualStart || '2026-11-05',
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
    <div className="flex flex-col h-full overflow-hidden">
    <div className="flex-1 overflow-auto px-5 py-5 md:px-8 md:py-6 space-y-6 max-w-7xl w-full mx-auto">

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
              onClick={() => { setRecordForm({ status: job.status === 'draft' ? 'active' : job.status as 'active', currentStage: activeStage.name, owner: job.owner, plannedEnd: job.plannedEnd, notes: '' }); setRecordModalOpen(true); }}
              className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5"
            >
              <Pencil size={13} /> Update Record
            </button>
          )}
          {!['complete', 'cancelled'].includes(job.status) && <button type="button" onClick={() => setCancelModalOpen(true)} className="px-3 py-2 rounded-lg text-xs font-semibold border" style={{ borderColor: 'var(--error)', color: 'var(--error)' }}>Cancel Job</button>}
        </div>
      </div>

      {/* ── 2. Prominent Next Action (Glance Level 1) ── */}
      <div className={clsx(
        'p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm',
        isBlocked ? 'bg-[var(--error-bg)]/20 border-[var(--error-border)]' : 'bg-[var(--surface)] border-[var(--border)]'
      )}>
        <div className="space-y-0.5">
          <div className="text-xs font-mono font-medium font-bold text-[var(--text-3)]">
            {isBlocked ? 'Current Blocker' : 'Current Stage & Next Action'}
          </div>
          <div className="text-sm text-[var(--text)]">
            {isBlocked ? (
              <span className="font-semibold text-[var(--error)]">
                {blockers[0]?.description ?? 'Job is blocked.'}
              </span>
            ) : (
              <span>
                <strong>Stage {activeStage.sequence}: {activeStage.name}</strong> is in progress ({activeStage.completedGoodQty}/{activeStage.inputQty} good units by {activeStage.owner || 'Mohan Das'}).
              </span>
            )}
          </div>
        </div>

      </div>

      {/* ── 3. Production Stage Progression Stepper (Calm & Linear) ── */}
      <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
        <div className="text-xs font-bold font-medium text-[var(--text-3)] font-mono">
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

      {/* ── 4. Workspace Tabs ── */}
      <div className="border-b border-[var(--border)] flex gap-0 overflow-x-auto scrollbar-none -mx-1">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="relative px-3 py-2.5 text-xs font-medium transition-colors whitespace-nowrap flex-shrink-0"
            style={{ color: tab === t ? 'var(--brand)' : 'var(--text-3)' }}
          >
            {t}
            {tab === t && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full" style={{ background: 'var(--brand-fill)' }} />
            )}
          </button>
        ))}
      </div>

      {/* ── 5. Tab Content: Overview (Crisp 4-Pillar Readiness) ── */}
      {tab === 'Overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
              <div className="text-xs text-[var(--text-3)] font-medium">Materials</div>
              <div className={clsx('text-sm font-bold mt-1 capitalize', job.materialReadiness === 'shortage' ? 'text-[var(--error)]' : 'text-[var(--text)]')}>
                {materialReadiness.replace('_', ' ')}
              </div>
              <div className="text-xs text-[var(--text-3)] mt-0.5">
                {jobReqs[0] ? `${jobReqs[0].materialName} (${jobReqs[0].reservedQty}/${jobReqs[0].requiredQty} ${jobReqs[0].uom})` : 'No BOM captured'}
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
              <div className="text-xs text-[var(--text-3)] font-medium">Current stage</div>
              <div className="text-sm font-bold text-[var(--text)] mt-1">{activeStage?.name ?? job.currentStage}</div>
              <div className="text-xs text-[var(--text-3)] mt-0.5">
                {activeStage ? `${activeStage.completedGoodQty}/${activeStage.inputQty} ${activeStage.uom}` : '—'}
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
              <div className="text-xs text-[var(--text-3)] font-medium">Open inspections</div>
              <div className="text-sm font-bold text-[var(--text)] mt-1">
                {inspections.filter(i => i.jobId === job.id && (i.result === 'pending' || i.result === 'fail')).length}
              </div>
              <button type="button" onClick={() => setTab('Quality')} className="text-xs text-[var(--brand)] mt-0.5">Open quality</button>
            </div>
          </div>

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
              <div>
                <span className="text-[var(--text-3)] block">Production Route:</span>
                <span className="font-medium text-[var(--text)]">{workflowName} · {job.stages.length} stages</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Materials BOM & Feasibility ── */}
      {tab === 'Materials' && (
        <div className="space-y-4">
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
                {materialRows.map(({ req: r, shortageQty, availableQty }) => (
                  <tr key={r.id}>
                    <td className="py-3 px-4 font-medium text-[var(--text)]">{r.materialName}</td>
                    <td className="py-3 px-4 text-xs text-[var(--text-3)]">{r.stageName}</td>
                    <td className="py-3 px-4 font-mono">{r.requiredQty} {r.uom}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">{r.reservedQty} {r.uom}</td>
                    <td className="py-3 px-4">
                      {shortageQty > 0 ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-[var(--error)]">Shortage ({shortageQty} {r.uom}) · {availableQty} available</span>
                          <button type="button" onClick={() => {
                            const source = inventory.find(i => i.materialItemId === r.materialItemId && i.availableQty > 0);
                            const q = new URLSearchParams({
                              material: r.materialName,
                              from: source?.locationName || '',
                              to: job.siteName,
                              qty: String(shortageQty),
                              uom: r.uom,
                              job: job.jobNumber,
                            });
                            navigate(`/inventory/transfer?${q.toString()}`);
                          }} className="text-xs font-semibold text-[var(--brand)]">Move stock</button>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-emerald-400">Allocated</span>
                      )}
                    </td>
                  </tr>
                ))}
                {jobReqs.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-6 text-xs text-[var(--text-3)]">No material requirements captured for this job yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {jobReqs.filter(r => r.shortage).map(r => (
            <MaterialFeasibilityPanel
              key={r.id}
              materialItemId={r.materialItemId}
              materialName={r.materialName}
              uom={r.uom}
              requiredQty={r.requiredQty}
              assignedSiteId={job.siteId}
            />
          ))}
        </div>
      )}

      {/* ── Tab: All Stages ── */}
      {tab === 'Stages' && (
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

      {/* Quality tab */}
      {tab === 'Quality' && (() => {
        const jobInspections = inspections.filter(i => i.jobId === job.id);
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--text)]">Inspections for {job.jobNumber}</h3>
              {['owner', 'qc'].includes(currentUser.role) && (
                <button onClick={() => navigate(`/quality?newFor=${job.id}`)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: 'var(--brand-fill)' }}>
                  + New Inspection
                </button>
              )}
            </div>
            {jobInspections.length === 0 ? (
              <div className="rounded-xl border p-8 text-center" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                <p className="text-sm text-[var(--text-3)]">No inspections recorded for this job yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border)' }}>
                <table className="eoss-table">
                  <thead><tr><th>Inspection #</th><th>Type</th><th>Stage</th><th>Date</th><th>Inspector</th><th>Sample</th><th>Accept</th><th>Reject</th><th>Result</th></tr></thead>
                  <tbody>
                    {jobInspections.map(i => (
                      <tr key={i.id} className="cursor-pointer" onClick={() => navigate(`/quality/inspection/${i.id}`)}>
                        <td className="font-mono text-xs font-bold" style={{ color: 'var(--brand)' }}>{i.inspectionNumber}</td>
                        <td className="text-xs capitalize">{i.type}</td>
                        <td className="text-xs text-[var(--text-2)]">{i.stageName || '—'}</td>
                        <td className="text-xs text-[var(--text-2)]">{new Date(i.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                        <td className="text-xs">{i.inspectorName}</td>
                        <td className="text-xs text-center font-mono">{i.sampleQty}</td>
                        <td className="text-xs text-center font-semibold" style={{ color: i.acceptedQty > 0 ? 'var(--success,#16A34A)' : 'var(--text-3)' }}>{i.acceptedQty || '—'}</td>
                        <td className="text-xs text-center font-semibold" style={{ color: i.rejectedQty > 0 ? 'var(--error,#DC2626)' : 'var(--text-3)' }}>{i.rejectedQty || '—'}</td>
                        <td><StatusChip status={i.result} size="sm" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })()}

      {/* NCR / Rework tab */}
      {tab === 'NCR / Rework' && (() => {
        const jobNcrs = ncrs.filter(n => n.jobId === job.id);
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--text)]">NCRs for {job.jobNumber}</h3>
            </div>
            {jobNcrs.length === 0 ? (
              <div className="rounded-xl border p-8 text-center" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                <p className="text-sm text-[var(--text-3)]">No NCRs raised for this job.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {jobNcrs.map(n => (
                  <div key={n.id} className="rounded-xl border p-4 cursor-pointer hover:opacity-90"
                    style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
                    onClick={() => navigate(`/quality/ncr/${n.id}`)}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-mono font-bold text-sm" style={{ color: 'var(--brand)' }}>{n.ncrNumber}</span>
                          <StatusChip status={n.severity.toLowerCase()} label={n.severity} size="sm" />
                          <StatusChip status={n.status} size="sm" />
                        </div>
                        <p className="text-sm text-[var(--text)]">{n.description}</p>
                        <p className="text-xs text-[var(--text-3)] mt-1">{n.sourceType} · {n.affectedQty} units · Disposition: {n.disposition}</p>
                      </div>
                      <ChevronRight size={14} style={{ color: 'var(--text-3)' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* Material Issue tab */}
      {tab === 'Materials' && (() => null)()}

      {['Updates', 'Blockers'].includes(tab) && (
        <div className="rounded-xl border p-10 text-center" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <p className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>{tab}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>No data recorded yet for this job.</p>
        </div>
      )}

      {recordModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"><div className="w-full max-w-lg rounded-xl p-5 space-y-4 bg-[var(--surface)] border border-[var(--border)]"><div className="flex items-center justify-between"><div><h3 className="text-sm font-bold text-[var(--text)]">Update {job.jobNumber}</h3><p className="text-xs text-[var(--text-2)]">Changes are saved to the job record and audit history.</p></div><button type="button" onClick={() => setRecordModalOpen(false)}><X size={16} className="text-[var(--text-3)]" /></button></div><div className="grid sm:grid-cols-2 gap-3"><label className="text-xs text-[var(--text-2)]">Job status<select className="eoss-input w-full mt-1" value={recordForm.status} onChange={e => setRecordForm(f => ({ ...f, status: e.target.value as typeof f.status }))}>{['draft', 'active', 'hold', 'complete', 'cancelled'].map(s => <option key={s} value={s}>{s}</option>)}</select></label><label className="text-xs text-[var(--text-2)]">Current production stage<select className="eoss-input w-full mt-1" value={recordForm.currentStage} onChange={e => setRecordForm(f => ({ ...f, currentStage: e.target.value }))}>{job.stages.map(stage => <option key={stage.id} value={stage.name}>{stage.name}</option>)}</select></label><label className="text-xs text-[var(--text-2)]">Owner<input className="eoss-input w-full mt-1" value={recordForm.owner} onChange={e => setRecordForm(f => ({ ...f, owner: e.target.value }))} /></label><label className="text-xs text-[var(--text-2)]">Target completion<input type="date" className="eoss-input w-full mt-1" value={recordForm.plannedEnd} onChange={e => setRecordForm(f => ({ ...f, plannedEnd: e.target.value }))} /></label></div><label className="text-xs text-[var(--text-2)] block">Operational note<textarea rows={3} className="eoss-input w-full mt-1" value={recordForm.notes} onChange={e => setRecordForm(f => ({ ...f, notes: e.target.value }))} /></label><div className="flex justify-end gap-2"><button type="button" onClick={() => setRecordModalOpen(false)} className="btn-ghost text-xs">Cancel</button><button type="button" onClick={() => { updateJob(job.id, { status: recordForm.status, currentStage: recordForm.currentStage, owner: recordForm.owner, plannedEnd: recordForm.plannedEnd }); setRecordModalOpen(false); showToast({ type: 'success', title: 'Job record updated' }); }} className="btn-primary text-xs">Save changes</button></div></div></div>}

      {cancelModalOpen && <JobCancelModal job={job} onClose={() => setCancelModalOpen(false)} onConfirm={reason => { cancelJob(job.id, reason, currentUser.name); setCancelModalOpen(false); }} />}

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
                <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Rejected Qty</label>
                <input type="number" min="0" value={rejectQtyInput}
                  onChange={e => setRejectQtyInput(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] font-mono text-sm text-[var(--text)]" />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Operator</label>
                <select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)]">
                  {EMPLOYEES.map(emp => (
                    <option key={emp.id} value={emp.name}>{emp.name} ({emp.department})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Notes</label>
                <textarea rows={2} value={stageNotes} onChange={e => setStageNotes(e.target.value)}
                  placeholder="Optional production notes…"
                  className="w-full p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] resize-none" />
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
    </div>
  );
}

function JobCancelModal({ job, onClose, onConfirm }: { job: import('../../types').Job; onClose: () => void; onConfirm: (reason: string) => void }) {
  const { jobMaterialReqs } = useStore();
  const [reason, setReason] = useState('');
  const reqs = jobMaterialReqs.filter(req => req.jobId === job.id);
  const reserved = reqs.reduce((sum, req) => sum + req.reservedQty, 0);
  const issued = reqs.reduce((sum, req) => sum + req.issuedQty, 0);
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"><div className="w-full max-w-lg rounded-xl p-5 space-y-4 bg-[var(--surface)] border border-[var(--border)]"><div className="flex items-center justify-between"><div><h3 className="text-sm font-bold text-[var(--text)]">Cancel {job.jobNumber}</h3><p className="text-xs text-[var(--text-2)]">Cancellation preserves the job and its history.</p></div><button type="button" onClick={onClose}><X size={16} className="text-[var(--text-3)]" /></button></div><div className="text-xs rounded-lg p-3 bg-[var(--surface-2)]"><div className="grid grid-cols-2 gap-2"><span>Status: <strong>{job.status}</strong></span><span>Stage: <strong>{job.currentStage}</strong></span><span>Reserved: <strong>{reserved}</strong></span><span>Issued/consumed: <strong>{issued}</strong></span></div><p className="mt-2 text-[var(--text-2)]">Reserved but unissued quantities will be released. Issued or consumed material is not restored automatically. Use an accepted return transaction for eligible unused material.</p></div><label className="block text-xs font-semibold text-[var(--text-2)]">Cancellation reason *<textarea autoFocus rows={3} value={reason} onChange={e => setReason(e.target.value)} className="eoss-input w-full mt-1" /></label><div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="btn-ghost text-xs">Keep job</button><button type="button" disabled={!reason.trim()} onClick={() => onConfirm(reason)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50" style={{ background: 'var(--error)' }}>Confirm cancellation</button></div></div></div>;
}
