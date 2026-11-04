import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, AlertTriangle, ChevronRight, Clock, Package, FileText,
  Activity, Layers, Users, CheckCircle, Play, Pause, Truck,
  Calendar, User, MapPin, DollarSign, Zap, Shield, Wrench,
  TrendingUp, AlertCircle, ArrowRight,
} from 'lucide-react';
import { useStore, JOB_BLOCKERS, PURCHASE_REQS } from '../../store';
import { MATERIALS, SUPPLIER_PO_LINES, JOB_MATERIAL_REQS } from '../../data/seed';
import StatusChip from '../../components/layout/StatusChip';
import clsx from 'clsx';

const TABS = ['Overview', 'Stages', 'Materials', 'Procurement', 'Quality', 'NCR/Rework', 'Assets', 'Documents', 'Dispatch', 'Updates', 'Blockers'];

const STATUS_COLOR: Record<string, string> = {
  active: 'var(--brand)',
  hold: 'var(--warning)',
  complete: 'var(--success)',
  cancelled: 'var(--text-3)',
};

export default function JobWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { jobs, setJobStatus, currentUser, showToast } = useStore();
  const [tab, setTab] = useState('Overview');

  const job = jobs.find(j => j.id === id);
  if (!job) return <div className="p-6 text-sm" style={{ color: 'var(--text-2)' }}>Job not found</div>;

  const blockers = JOB_BLOCKERS.filter(b => b.jobId === id && b.status === 'open');
  const totalGood   = job.stages.reduce((s, st) => s + st.completedGoodQty, 0);
  const totalInput  = job.stages.reduce((s, st) => s + (st.inputQty || 0), 0);
  const pct         = totalInput > 0 ? Math.round((totalGood / totalInput) * 100) : 0;
  const completedStages = job.stages.filter(s => s.status === 'complete').length;

  const canUpdate  = ['owner', 'supervisor', 'operator'].includes(currentUser.role);
  const canApprove = ['owner'].includes(currentUser.role);

  const statusColor = STATUS_COLOR[job.status] ?? 'var(--text-2)';

  return (
    <div className="max-w-7xl mx-auto">

      {/* ── Sticky header ── */}
      <div
        className="sticky z-20 px-4 md:px-6"
        style={{
          top: 'var(--topbar-h)',
          background: 'var(--bg)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {/* Breadcrumb + actions */}
        <div className="flex flex-wrap items-center gap-2 pt-3 pb-2">
          <button
            onClick={() => navigate('/jobs')}
            className="flex items-center gap-1 text-xs font-medium transition-colors"
            style={{ color: 'var(--text-3)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-3)'; }}
          >
            <ArrowLeft size={13} />
            Jobs
          </button>
          <span style={{ color: 'var(--border-2)' }}>/</span>

          {/* Job number badge */}
          <div
            className="flex items-center gap-2 px-2.5 py-1 rounded-md"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <span className="font-mono text-sm font-semibold" style={{ color: statusColor }}>
              {job.jobNumber}
            </span>
            <StatusChip status={job.status} size="sm" />
            {job.hasBlocker && (
              <span className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: 'var(--error)' }}>
                <AlertTriangle size={11} /> BLOCKED
              </span>
            )}
          </div>

          <div className="hidden md:flex items-center gap-1 text-xs" style={{ color: 'var(--text-3)' }}>
            <User size={11} className="flex-shrink-0" />
            {job.customerName}
          </div>

          {/* Job health indicator */}
          {job.hasBlocker ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold"
              style={{ background: 'var(--error-bg)', color: 'var(--error)', border: '1px solid var(--error-border)' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--error)' }} />
              At Risk
            </div>
          ) : job.status === 'hold' ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold"
              style={{ background: 'var(--warning-bg)', color: 'var(--warning)', border: '1px solid var(--warning-border)' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--warning)' }} />
              On Hold
            </div>
          ) : job.status === 'active' ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold"
              style={{ background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success-border)' }}>
              <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: 'var(--success)' }} />
              On Track
            </div>
          ) : null}

          {/* Planned dates */}
          <div className="hidden lg:flex items-center gap-1 text-xs" style={{ color: 'var(--text-3)' }}>
            <Calendar size={11} />
            Due: {new Date(job.plannedEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </div>

          {/* Actions */}
          <div className="ml-auto flex gap-2">
            {canUpdate && job.status === 'active' && (
              <button
                onClick={() => { setJobStatus(job.id, 'hold'); showToast({ type: 'warning', title: 'Job placed on hold' }); }}
                className="btn-ghost text-xs py-1.5 px-3"
              >
                <Pause size={12} /> Hold
              </button>
            )}
            {canUpdate && job.status === 'hold' && (
              <button
                onClick={() => { setJobStatus(job.id, 'active'); showToast({ type: 'success', title: 'Job resumed' }); }}
                className="btn-primary text-xs py-1.5 px-3"
              >
                <Play size={12} /> Resume
              </button>
            )}
          </div>
        </div>

        {/* Stage progress timeline */}
        <div className="hidden md:flex items-stretch gap-0 overflow-x-auto pb-2 mt-1" style={{ scrollbarWidth: 'none' }}>
          {job.stages.map((s: any, i: number) => {
            const isDone   = s.status === 'complete';
            const isActive = s.status === 'in_progress';
            const isHold   = s.status === 'hold';
            const stagePct = s.inputQty > 0 ? Math.min(100, Math.round((s.completedGoodQty / s.inputQty) * 100)) : 0;
            const dotBg    = isDone ? 'var(--success)' : isActive ? 'var(--brand)' : 'var(--surface)';
            const dotBorder= isDone ? 'var(--success)' : isActive ? 'var(--brand)' : isHold ? 'var(--error)' : 'var(--border-2)';
            const lineBg   = isDone ? 'var(--success)' : 'var(--border-2)';
            return (
              <React.Fragment key={s.id}>
                {i > 0 && (
                  <div className="flex items-center flex-shrink-0" style={{ width: 20 }}>
                    <div className="w-full h-px" style={{ background: lineBg, opacity: isDone ? 1 : 0.5 }} />
                  </div>
                )}
                <div
                  className="flex flex-col items-center gap-1 flex-shrink-0 px-2 py-1 rounded-md"
                  style={{
                    minWidth: 68, maxWidth: 88,
                    background: isActive ? 'var(--brand-50)' : isDone ? 'var(--success-bg)' : isHold ? 'var(--error-bg)' : 'transparent',
                  }}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2"
                    style={{ background: dotBg, borderColor: dotBorder, color: isDone || isActive ? 'white' : 'var(--text-3)' }}
                  >
                    {isDone ? '✓' : isHold ? '!' : i + 1}
                  </div>
                  <span
                    className="text-[10px] text-center leading-tight font-medium"
                    style={{ color: isDone ? 'var(--success)' : isActive ? 'var(--brand)' : isHold ? 'var(--error)' : 'var(--text-3)', maxWidth: 80 }}
                  >
                    {s.name}
                  </span>
                  {isActive && stagePct > 0 && (
                    <div className="w-full progress-bar" style={{ height: 2 }}>
                      <div className="progress-bar-fill" style={{ width: `${stagePct}%`, background: 'var(--brand)' }} />
                    </div>
                  )}
                  {isActive && (
                    <span className="text-[9px] font-mono" style={{ color: 'var(--brand)' }}>{stagePct}%</span>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Tab bar */}
        <div
          className="flex gap-0.5 overflow-x-auto pb-px"
          style={{ scrollbarWidth: 'none' }}
        >
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-3 py-2 text-xs whitespace-nowrap font-medium transition-all border-b-2 flex-shrink-0"
              style={{
                borderBottomColor: tab === t ? 'var(--brand)' : 'transparent',
                color: tab === t ? 'var(--brand)' : 'var(--text-2)',
                background: 'transparent',
              }}
            >
              {t}
              {t === 'Blockers' && blockers.length > 0 && (
                <span
                  className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                  style={{ background: 'var(--error)', color: 'white' }}
                >
                  {blockers.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className="p-4 md:p-6">
        {tab === 'Overview'    && <Overview job={job} pct={pct} completedStages={completedStages} blockers={blockers} navigate={navigate} />}
        {tab === 'Stages'      && <Stages job={job} canUpdate={canUpdate} navigate={navigate} />}
        {tab === 'Materials'   && <Materials job={job} />}
        {tab === 'Procurement' && <ProcurementTab job={job} navigate={navigate} />}
        {tab === 'Updates'     && <Updates job={job} />}
        {tab === 'Documents'   && <DocTab job={job} />}
        {tab === 'Quality'     && <QualityTab job={job} navigate={navigate} />}
        {tab === 'NCR/Rework'  && <NCRTab job={job} navigate={navigate} />}
        {tab === 'Assets'      && <AssetsTab job={job} navigate={navigate} />}
        {tab === 'Dispatch'    && <DispatchTab job={job} navigate={navigate} />}
        {tab === 'Blockers'    && <BlockersTab blockers={blockers} job={job} />}
      </div>
    </div>
  );
}

/* ── Overview ── */
function Overview({ job, pct, completedStages, blockers, navigate }: any) {
  const { inspections, ncrs, supplierPos } = useStore();
  const jobInsp  = inspections.filter((i: any) => i.jobId === job.id);
  const jobNcrs  = ncrs.filter((n: any) => n.jobId === job.id);
  const jobSpos  = supplierPos.filter((p: any) => p.jobRef === job.jobNumber || p.jobRef === job.id);
  const overdueSpos = jobSpos.filter((p: any) => p.status === 'overdue');
  const matReqs  = JOB_MATERIAL_REQS.filter((r: any) => r.jobId === job.id);
  const passedInsp = jobInsp.filter((i: any) => i.result === 'pass').length;
  const openNcrs   = jobNcrs.filter((n: any) => n.status === 'open').length;
  const passRate   = jobInsp.length > 0 ? Math.round((passedInsp / jobInsp.length) * 100) : null;

  // Active / in-progress stage
  const activeStage = job.stages.find((s: any) => s.status === 'in_progress') ?? job.stages.find((s: any) => s.status === 'pending');
  const activeStagePct = activeStage && activeStage.inputQty > 0
    ? Math.min(100, Math.round((activeStage.completedGoodQty / activeStage.inputQty) * 100))
    : 0;

  // Attention count
  const attentionCount = blockers.length + overdueSpos.length + (job.materialReadiness === 'shortage' ? 1 : 0) + openNcrs;

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="md:col-span-2 space-y-4">

        {/* Job Situation panel */}
        <div className="eoss-card overflow-hidden">
          <div
            className="flex items-center gap-2 px-4 py-3"
            style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}
          >
            <TrendingUp size={14} style={{ color: 'var(--brand)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Job Situation</span>
            {attentionCount > 0 && (
              <span className="pill ml-1" style={{ background: 'var(--error-bg)', borderColor: 'var(--error-border)', color: 'var(--error)' }}>
                <AlertCircle size={10} /> {attentionCount} area{attentionCount !== 1 ? 's' : ''} need attention
              </span>
            )}
          </div>

          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>

            {/* Current stage */}
            {activeStage && (
              <div className="px-4 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <Activity size={13} style={{ color: 'var(--brand)' }} />
                  <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
                    Current Stage: {activeStage.name}
                  </span>
                  <StatusChip status={activeStage.status} size="sm" />
                  {activeStage.workCentre && (
                    <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>{activeStage.workCentre}</span>
                  )}
                </div>
                {activeStage.inputQty > 0 && (
                  <div>
                    <div className="flex justify-between text-[11px] mb-1" style={{ color: 'var(--text-3)' }}>
                      <span>Progress</span>
                      <span className="font-mono">{activeStage.completedGoodQty} / {activeStage.inputQty} {activeStage.uom}</span>
                    </div>
                    <div className="progress-bar" style={{ height: 6 }}>
                      <div className="progress-bar-fill" style={{ width: `${activeStagePct}%`, background: 'var(--brand)' }} />
                    </div>
                    {activeStage.rejectedQty > 0 && (
                      <div className="text-[11px] mt-1" style={{ color: 'var(--error)' }}>
                        {activeStage.rejectedQty} {activeStage.uom} rejected
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Material readiness */}
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <Package size={13} style={{ color: job.materialReadiness === 'shortage' ? 'var(--error)' : job.materialReadiness === 'partial' ? 'var(--warning)' : 'var(--success)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>Material Readiness</span>
                <StatusChip
                  status={job.materialReadiness === 'ready' ? 'available' : job.materialReadiness === 'shortage' ? 'shortage' : job.materialReadiness === 'partial' ? 'partial' : 'pending'}
                  label={job.materialReadiness}
                  size="sm"
                />
              </div>
              {matReqs.length > 0 ? (
                <div className="space-y-2">
                  {matReqs.map((r: any) => {
                    const avail = r.reservedQty > 0 ? r.reservedQty : 0;
                    const pctAvail = r.requiredQty > 0 ? Math.min(100, Math.round((avail / r.requiredQty) * 100)) : 100;
                    return (
                      <div key={r.id}>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span style={{ color: 'var(--text-2)' }}>{r.materialName}</span>
                          <span className="font-mono" style={{ color: r.shortage ? 'var(--error)' : 'var(--text-2)' }}>
                            {r.reservedQty} / {r.requiredQty} {r.uom}
                          </span>
                        </div>
                        <div className="progress-bar" style={{ height: 4 }}>
                          <div
                            className="progress-bar-fill"
                            style={{
                              width: `${pctAvail}%`,
                              background: r.shortage ? 'var(--error)' : pctAvail >= 100 ? 'var(--success)' : 'var(--warning)',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs" style={{ color: 'var(--text-2)' }}>
                  {job.materialReadiness === 'shortage' ? 'Critical shortage — job blocked on material.' :
                   job.materialReadiness === 'partial'  ? 'Some materials not yet fully received.' :
                   job.materialReadiness === 'ready'    ? 'All materials reserved and available.' :
                   'Materials not yet assessed.'}
                </p>
              )}
            </div>

            {/* Procurement risk */}
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingIcon size={13} color={overdueSpos.length > 0 ? 'var(--error)' : 'var(--text-2)'} />
                <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>Procurement</span>
                {overdueSpos.length > 0 ? (
                  <span className="pill" style={{ background: 'var(--error-bg)', borderColor: 'var(--error-border)', color: 'var(--error)' }}>
                    {overdueSpos.length} overdue PO{overdueSpos.length > 1 ? 's' : ''}
                  </span>
                ) : jobSpos.length > 0 ? (
                  <span className="pill" style={{ background: 'var(--success-bg)', borderColor: 'var(--success-border)', color: 'var(--success)' }}>
                    On schedule
                  </span>
                ) : null}
              </div>
              {overdueSpos.length > 0 ? (
                <div className="space-y-1.5">
                  {overdueSpos.map((p: any) => (
                    <button
                      key={p.id}
                      onClick={() => navigate(`/procurement/${p.id}`)}
                      className="flex items-center gap-2 w-full text-left text-xs px-3 py-2 rounded-md"
                      style={{ background: 'var(--error-bg)', border: '1px solid var(--error-border)' }}
                    >
                      <span className="font-mono font-semibold" style={{ color: 'var(--error)' }}>{p.poNumber}</span>
                      <span style={{ color: 'var(--text-2)' }}>{p.supplierName}</span>
                      <span className="ml-auto font-semibold" style={{ color: 'var(--error)' }}>Overdue</span>
                      <ChevronRight size={12} style={{ color: 'var(--error)' }} />
                    </button>
                  ))}
                </div>
              ) : jobSpos.length === 0 ? (
                <p className="text-xs" style={{ color: 'var(--text-3)' }}>No supplier POs linked to this job</p>
              ) : (
                <p className="text-xs" style={{ color: 'var(--text-2)' }}>
                  {jobSpos.length} PO{jobSpos.length !== 1 ? 's' : ''} — all within committed dates
                </p>
              )}
            </div>

            {/* Quality */}
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <Shield size={13} style={{ color: openNcrs > 0 ? 'var(--error)' : 'var(--success)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>Quality</span>
                {openNcrs > 0 && (
                  <span className="pill" style={{ background: 'var(--error-bg)', borderColor: 'var(--error-border)', color: 'var(--error)' }}>
                    {openNcrs} open NCR{openNcrs > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="text-xs" style={{ color: 'var(--text-2)' }}>
                {jobInsp.length === 0
                  ? 'No inspections recorded yet'
                  : `${jobInsp.length} inspection${jobInsp.length !== 1 ? 's' : ''} · ${passedInsp} passed${passRate !== null ? ` (${passRate}% pass rate)` : ''} · ${jobNcrs.length} NCR${jobNcrs.length !== 1 ? 's' : ''}`
                }
              </p>
            </div>
          </div>
        </div>

        {/* Job details */}
        <div className="eoss-card">
          <div className="eoss-card-header">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Job Details</span>
          </div>
          <div className="p-4">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <Field label="Customer"     value={job.customerName} />
              <Field label="PO Number"    value={job.customerPoNumber ?? '—'} mono />
              <Field label="Description"  value={job.description} span />
              <Field label="Drawing Ref"  value={job.drawingRef ?? '—'} mono />
              <Field label="Site"         value={job.siteName} />
              <Field label="Owner"        value={job.owner} />
              <Field label="Priority"     value={<StatusChip status={job.priority} size="sm" />} />
              <Field label="Planned Start" value={new Date(job.plannedStart).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} />
              <Field label="Planned End"   value={new Date(job.plannedEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} />
              {job.actualStart && <Field label="Actual Start" value={new Date(job.actualStart).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} />}
            </dl>
          </div>
        </div>
      </div>

      {/* Right column */}
      <div className="space-y-4">
        {/* Stage completion summary */}
        <div className="eoss-card">
          <div className="eoss-card-header">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Stages</span>
            <span className="text-xs" style={{ color: 'var(--text-2)' }}>{completedStages}/{job.stages.length}</span>
          </div>
          <div className="p-3">
            <div className="progress-bar mb-3" style={{ height: 6 }}>
              <div
                className="progress-bar-fill"
                style={{ width: `${(completedStages / job.stages.length) * 100}%`, background: 'var(--brand)' }}
              />
            </div>
            <div className="space-y-1.5">
              {job.stages.map((s: any, i: number) => {
                const isDone = s.status === 'complete';
                const isActive = s.status === 'in_progress';
                const isHold = s.status === 'hold';
                return (
                  <div key={s.id} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                      style={{
                        background: isDone ? 'var(--success)' : isActive ? 'var(--brand)' : 'var(--surface-3)',
                        color: isDone || isActive ? 'white' : 'var(--text-3)',
                      }}
                    >
                      {isDone ? '✓' : i + 1}
                    </div>
                    <span className="text-xs flex-1" style={{ color: isDone ? 'var(--success)' : isActive ? 'var(--brand)' : 'var(--text-2)' }}>
                      {s.name}
                    </span>
                    <StatusChip status={s.status} size="sm" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {blockers.length > 0 && (
          <div className="rounded-[var(--radius)] overflow-hidden" style={{ border: '1px solid var(--error-border)' }}>
            <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: 'var(--error-bg)' }}>
              <AlertTriangle size={13} style={{ color: 'var(--error)' }} />
              <span className="font-semibold text-xs" style={{ color: 'var(--error)' }}>
                {blockers.length} Active Blocker{blockers.length > 1 ? 's' : ''}
              </span>
            </div>
            {blockers.map((b: any) => (
              <div key={b.id} className="px-4 py-3" style={{ borderTop: '1px solid var(--error-border)', background: 'var(--surface)' }}>
                <div className="text-xs font-semibold" style={{ color: 'var(--error)' }}>{b.type}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>{b.description}</div>
                <div className="text-[10px] mt-1" style={{ color: 'var(--text-3)' }}>
                  Raised by {b.raisedBy} · {new Date(b.raisedAt).toLocaleDateString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AI intelligence */}
        {(job.hasBlocker || job.status === 'hold' || job.materialReadiness === 'shortage') && (
          <div
            className="rounded-[var(--radius)] p-4"
            style={{
              background: 'linear-gradient(135deg, #EEF4FF 0%, #F0F9FF 100%)',
              border: '1px solid #BAE6FD',
            }}
          >
            <div className="ai-signal mb-2">
              <Zap size={10} /> EOSS Intelligence
            </div>
            <p className="text-xs mt-2 leading-relaxed" style={{ color: '#2A4D6E' }}>
              {job.materialReadiness === 'shortage'
                ? `Material shortage is the primary risk for ${job.jobNumber}. Check procurement commitments and consider expediting or sourcing from alternative lots.`
                : job.status === 'hold'
                ? `${job.jobNumber} has been placed on hold. Review blocker resolution timeline and assess impact on committed delivery date.`
                : `${job.jobNumber} has active blockers that may affect production schedule. Early resolution will reduce delivery risk.`
              }
            </p>
          </div>
        )}

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-2">
          <StatTile icon={<Activity size={13} />} label="Yield" value={`${pct}%`}
            accent={pct >= 90 ? 'var(--success)' : pct >= 70 ? 'var(--warning)' : 'var(--error)'} />
          <StatTile icon={<DollarSign size={13} />} label="Value"
            value={job.value ? `₹${(job.value / 1000).toFixed(0)}k` : '—'} />
        </div>
      </div>
    </div>
  );
}

function ShoppingIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  );
}

/* ── Stages ── */
function Stages({ job, canUpdate, navigate }: any) {
  return (
    <div className="space-y-3">
      {job.stages.map((s: any) => (
        <div key={s.id} className="eoss-card p-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-3">
              <span
                className="w-7 h-7 rounded-full text-sm font-bold flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--surface-3)', color: 'var(--text-2)' }}
              >
                {s.sequence}
              </span>
              <div>
                <div className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{s.name}</div>
                <div className="text-xs" style={{ color: 'var(--text-2)' }}>{s.workCentre} · {s.owner || 'Unassigned'}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusChip status={s.status} size="sm" />
              {canUpdate && (s.status === 'in_progress' || s.status === 'pending') && (
                <button
                  onClick={() => navigate(`/jobs/${job.id}/stage/${s.id}`)}
                  className="btn-primary text-xs py-1.5 px-3"
                >
                  Update Stage
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            <SmallField label="Planned" value={`${new Date(s.plannedStart).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} → ${new Date(s.plannedEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`} />
            {s.actualStart && <SmallField label="Actual Start" value={new Date(s.actualStart).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} />}
            <SmallField label="Input Qty" value={`${s.inputQty} ${s.uom}`} />
            <SmallField label="Good / Reject" value={`${s.completedGoodQty} / ${s.rejectedQty}`} />
          </div>
          {s.completedGoodQty > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-[11px] mb-1" style={{ color: 'var(--text-3)' }}>
                <span>Progress</span>
                <span>{s.completedGoodQty}/{s.inputQty}</span>
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

/* ── Materials ── */
function Materials({ job }: any) {
  const reqs = JOB_MATERIAL_REQS.filter(r => r.jobId === job.id);
  if (reqs.length === 0) {
    return (
      <div className="eoss-card py-12 text-center text-sm" style={{ color: 'var(--text-3)' }}>
        No material requirements recorded for this job
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {reqs.map(r => {
        const reservedPct  = r.requiredQty > 0 ? Math.min(100, Math.round((r.reservedQty / r.requiredQty) * 100)) : 0;
        const issuedPct    = r.requiredQty > 0 ? Math.min(100, Math.round((r.issuedQty / r.requiredQty) * 100)) : 0;
        const statusLabel  = r.shortage ? 'shortage' : r.issuedQty > 0 ? 'issued' : r.reservedQty > 0 ? 'reserved' : 'pending';
        return (
          <div
            key={r.id}
            className="eoss-card p-4"
            style={r.shortage ? { borderColor: 'var(--error-border)', background: 'var(--error-bg)' } : {}}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {r.shortage && <AlertTriangle size={12} style={{ color: 'var(--error)' }} />}
                  <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{r.materialName}</span>
                  <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>{r.stageName}</span>
                  <StatusChip status={statusLabel} label={r.shortage ? 'shortage' : undefined} size="sm" />
                </div>
                {/* Visual bars */}
                <div className="space-y-1.5">
                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5" style={{ color: 'var(--text-3)' }}>
                      <span>Reserved</span>
                      <span className="font-mono">{r.reservedQty} / {r.requiredQty} {r.uom}</span>
                    </div>
                    <div className="progress-bar" style={{ height: 5 }}>
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${reservedPct}%`,
                          background: r.shortage ? 'var(--error)' : reservedPct >= 100 ? 'var(--success)' : 'var(--warning)',
                        }}
                      />
                    </div>
                  </div>
                  {r.issuedQty > 0 && (
                    <div>
                      <div className="flex justify-between text-[11px] mb-0.5" style={{ color: 'var(--text-3)' }}>
                        <span>Issued</span>
                        <span className="font-mono">{r.issuedQty} {r.uom}</span>
                      </div>
                      <div className="progress-bar" style={{ height: 5 }}>
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${issuedPct}%`, background: 'var(--brand)' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Updates ── */
function Updates({ job }: any) {
  return (
    <div className="eoss-card p-4">
      <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text)' }}>Activity Feed</h3>
      <div className="space-y-4">
        {job.stages.filter((s: any) => s.status !== 'pending').map((s: any) => (
          <div key={s.id} className="flex gap-3">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white"
              style={{ background: 'var(--brand)' }}
            >
              <Activity size={12} />
            </div>
            <div>
              <p className="text-sm" style={{ color: 'var(--text)' }}>
                <span className="font-medium">{s.name}</span> — {s.status === 'complete' ? 'completed' : s.status === 'in_progress' ? 'started' : s.status}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-2)' }}>{s.owner || 'Unknown'} · {s.completedGoodQty} {s.uom} done</p>
              <p className="text-xs" style={{ color: 'var(--text-3)' }}>{s.actualStart ? new Date(s.actualStart).toLocaleDateString('en-IN') : ''}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Documents ── */
function DocTab({ job }: any) {
  const { documents } = useStore();
  const jobDocs = documents.filter(d => d.linkedEntities.some((le: any) => le.ref === job.jobNumber));
  return (
    <div className="space-y-3">
      {jobDocs.length === 0 && <div className="text-center py-10 text-sm" style={{ color: 'var(--text-3)' }}>No documents linked to this job.</div>}
      {jobDocs.map(d => (
        <div key={d.id} className="eoss-card p-4 flex items-center gap-3">
          <FileText size={18} style={{ color: 'var(--brand)', flexShrink: 0 }} />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>{d.title}</div>
            <div className="text-xs" style={{ color: 'var(--text-2)' }}>{d.docType} · v{d.version} · {d.fileSize}</div>
          </div>
          <StatusChip status={d.certStatus ?? 'pending'} size="sm" />
        </div>
      ))}
    </div>
  );
}

/* ── Quality ── */
function QualityTab({ job, navigate }: any) {
  const { inspections, ncrs } = useStore();
  const jobInsp = inspections.filter(i => i.jobId === job.id);
  const jobNcrs = ncrs.filter(n => n.jobId === job.id);
  return (
    <div className="space-y-4">
      <div className="eoss-card overflow-hidden">
        <div className="eoss-card-header">
          <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Inspections ({jobInsp.length})</span>
        </div>
        <table className="eoss-table">
          <thead><tr><th>No.</th><th>Type</th><th>Stage</th><th>Date</th><th>Sample</th><th>Accept</th><th>Reject</th><th>Result</th></tr></thead>
          <tbody>
            {jobInsp.length === 0 && <tr><td colSpan={8} className="text-center py-6 text-sm" style={{ color: 'var(--text-3)' }}>No inspections recorded</td></tr>}
            {jobInsp.map(i => (
              <tr key={i.id} className="cursor-pointer" onClick={() => navigate(`/quality/inspection/${i.id}`)}>
                <td className="font-mono text-xs" style={{ color: 'var(--brand)' }}>{i.inspectionNumber}</td>
                <td className="text-sm">{i.type}</td>
                <td className="text-sm" style={{ color: 'var(--text-2)' }}>{i.stageName ?? '—'}</td>
                <td className="text-sm">{new Date(i.date).toLocaleDateString('en-IN')}</td>
                <td className="font-mono text-sm">{i.sampleQty}</td>
                <td className="font-mono text-sm" style={{ color: 'var(--success)' }}>{i.acceptedQty}</td>
                <td className="font-mono text-sm" style={{ color: 'var(--error)' }}>{i.rejectedQty}</td>
                <td><StatusChip status={i.result} size="sm" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {jobNcrs.length > 0 && (
        <div className="rounded-[var(--radius)] p-4" style={{ background: 'var(--error-bg)', border: '1px solid var(--error-border)' }}>
          <h3 className="font-semibold text-sm mb-2" style={{ color: 'var(--error)' }}>NCRs ({jobNcrs.length})</h3>
          {jobNcrs.map(n => (
            <div key={n.id} className="flex items-center gap-2 mt-2 cursor-pointer" onClick={() => navigate(`/quality/ncr/${n.id}`)}>
              <span className="font-mono text-xs font-semibold" style={{ color: 'var(--error)' }}>{n.ncrNumber}</span>
              <StatusChip status={n.status} size="sm" />
              <span className="text-xs truncate" style={{ color: 'var(--text-2)' }}>{n.description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── NCR/Rework ── */
function NCRTab({ job, navigate }: any) {
  const { ncrs } = useStore();
  const jobNcrs = ncrs.filter(n => n.jobId === job.id);
  return (
    <div className="space-y-3">
      {jobNcrs.length === 0 && (
        <div className="rounded-[var(--radius)] p-6 text-center" style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)' }}>
          <CheckCircle size={24} style={{ color: 'var(--success)' }} className="mx-auto mb-2" />
          <p className="font-semibold" style={{ color: 'var(--success)' }}>No NCRs for this job</p>
        </div>
      )}
      {jobNcrs.map(n => (
        <div
          key={n.id}
          className="eoss-card p-4 cursor-pointer"
          onClick={() => navigate(`/quality/ncr/${n.id}`)}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--brand)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-semibold" style={{ color: 'var(--brand)' }}>{n.ncrNumber}</span>
            <StatusChip status={n.severity.toLowerCase()} label={n.severity} size="sm" />
            <StatusChip status={n.status} size="sm" />
          </div>
          <p className="text-sm" style={{ color: 'var(--text)' }}>{n.description}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-2)' }}>Disposition: {n.disposition} · Raised by {n.raisedBy}</p>
        </div>
      ))}
    </div>
  );
}

/* ── Dispatch ── */
function DispatchTab({ job, navigate }: any) {
  const { dispatches } = useStore();
  const jobDispatches = dispatches.filter(d => (d.jobs ?? []).includes(job.jobNumber));
  return (
    <div className="space-y-3">
      {jobDispatches.length === 0 && (
        <div className="text-center py-10 text-sm" style={{ color: 'var(--text-3)' }}>No dispatches linked to this job.</div>
      )}
      {jobDispatches.map(d => (
        <div
          key={d.id}
          className="eoss-card p-4 flex items-center gap-3 cursor-pointer"
          onClick={() => navigate(`/dispatch/${d.id}`)}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--brand)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
        >
          <Truck size={18} style={{ color: 'var(--brand)', flexShrink: 0 }} />
          <div className="flex-1 min-w-0">
            <div className="font-mono text-xs font-semibold" style={{ color: 'var(--brand)' }}>{d.dispatchNumber}</div>
            <div className="text-sm" style={{ color: 'var(--text)' }}>{d.customerName}</div>
            <div className="text-xs" style={{ color: 'var(--text-2)' }}>{d.carrier} · {d.dispatchDate ? new Date(d.dispatchDate).toLocaleDateString('en-IN') : '—'}</div>
          </div>
          <StatusChip status={d.status} size="sm" />
          <ChevronRight size={14} style={{ color: 'var(--text-3)' }} />
        </div>
      ))}
    </div>
  );
}

/* ── Blockers ── */
function BlockersTab({ blockers, job }: any) {
  const { showToast } = useStore();
  if (blockers.length === 0) return (
    <div className="rounded-[var(--radius)] p-6 text-center" style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)' }}>
      <CheckCircle size={24} style={{ color: 'var(--success)' }} className="mx-auto mb-2" />
      <p className="font-semibold" style={{ color: 'var(--success)' }}>No active blockers</p>
      <p className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>This job is running without blockers.</p>
    </div>
  );
  return (
    <div className="space-y-3">
      {blockers.map((b: any) => (
        <div key={b.id} className="rounded-[var(--radius)] p-4" style={{ background: 'var(--error-bg)', border: '1px solid var(--error-border)' }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle size={14} style={{ color: 'var(--error)' }} />
                <span className="font-semibold text-sm" style={{ color: 'var(--error)' }}>{b.type} Blocker</span>
                <StatusChip status="open" size="sm" />
              </div>
              <p className="text-sm" style={{ color: 'var(--text)' }}>{b.description}</p>
              <p className="text-xs mt-2" style={{ color: 'var(--text-2)' }}>Raised by {b.raisedBy} · {new Date(b.raisedAt).toLocaleDateString('en-IN')}</p>
            </div>
            <button
              onClick={() => showToast({ type: 'success', title: 'Blocker resolved', body: 'Blocker marked as resolved.' })}
              className="btn-primary text-xs py-1.5 px-3 flex-shrink-0"
              style={{ background: 'var(--success)' }}
            >
              Resolve
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Procurement ── */
function ProcurementTab({ job, navigate }: any) {
  const { supplierPos } = useStore();
  const prs  = PURCHASE_REQS.filter(r => r.jobId === job.id || r.jobNumber === job.jobNumber);
  const spos = supplierPos.filter(p => p.jobRef === job.jobNumber || p.jobRef === job.id);
  const overdueSpos = spos.filter(p => p.status === 'overdue');
  return (
    <div className="space-y-4">
      {overdueSpos.length > 0 && (
        <div
          className="rounded-[var(--radius)] px-4 py-3 flex items-center gap-3"
          style={{ background: 'var(--error-bg)', border: '1px solid var(--error-border)' }}
        >
          <AlertTriangle size={14} style={{ color: 'var(--error)', flexShrink: 0 }} />
          <div className="flex-1">
            <span className="text-xs font-semibold" style={{ color: 'var(--error)' }}>
              {overdueSpos.length} supplier PO{overdueSpos.length > 1 ? 's are' : ' is'} overdue for this job
            </span>
            <span className="text-xs ml-2" style={{ color: 'var(--text-2)' }}>
              {overdueSpos.map(p => p.poNumber).join(', ')}
            </span>
          </div>
        </div>
      )}
      <div className="eoss-card overflow-hidden">
        <div className="eoss-card-header">
          <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Purchase Requisitions ({prs.length})</span>
        </div>
        <table className="eoss-table">
          <thead><tr><th>PR #</th><th>Raised By</th><th>Required By</th><th>Lines</th><th>Priority</th><th>Status</th></tr></thead>
          <tbody>
            {prs.length === 0 && <tr><td colSpan={6} className="text-center py-6 text-sm" style={{ color: 'var(--text-3)' }}>No purchase requisitions linked to this job</td></tr>}
            {prs.map(r => (
              <tr key={r.id}>
                <td><span className="font-mono text-xs" style={{ color: 'var(--brand)' }}>{r.prNumber}</span></td>
                <td className="text-sm" style={{ color: 'var(--text-2)' }}>{r.raisedBy}</td>
                <td className="text-sm" style={{ color: 'var(--text-2)' }}>{new Date(r.requiredBy).toLocaleDateString('en-IN')}</td>
                <td className="text-sm">{r.lineCount}</td>
                <td><StatusChip status={r.priority} size="sm" /></td>
                <td><StatusChip status={r.status} size="sm" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="eoss-card overflow-hidden">
        <div className="eoss-card-header">
          <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Supplier Purchase Orders ({spos.length})</span>
        </div>
        <table className="eoss-table">
          <thead><tr><th>SPO #</th><th>Supplier</th><th>Committed</th><th>Value</th><th>Status</th></tr></thead>
          <tbody>
            {spos.length === 0 && <tr><td colSpan={5} className="text-center py-6 text-sm" style={{ color: 'var(--text-3)' }}>No supplier POs linked to this job</td></tr>}
            {spos.map(p => (
              <tr key={p.id} className="cursor-pointer" onClick={() => navigate(`/procurement/${p.id}`)}>
                <td><span className="font-mono text-xs" style={{ color: 'var(--brand)' }}>{p.poNumber}</span></td>
                <td className="text-sm">{p.supplierName}</td>
                <td className="text-sm" style={{ color: 'var(--text-2)' }}>{new Date(p.committedDate).toLocaleDateString('en-IN')}</td>
                <td className="text-sm">₹{p.totalValue.toLocaleString('en-IN')}</td>
                <td><StatusChip status={p.status} size="sm" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Assets ── */
function AssetsTab({ job, navigate }: any) {
  const { maintenanceEvents, assets } = useStore();
  const jobEvents     = maintenanceEvents.filter(e => e.affectedJobs.some((aj: any) => aj.jobId === job.id || aj.jobNumber === job.jobNumber));
  const jobWorkCentres = [...new Set(job.stages.map((s: any) => s.workCentre).filter(Boolean))];
  const relatedAssets = assets.filter(a => a.workCentre && jobWorkCentres.includes(a.workCentre));
  return (
    <div className="space-y-4">
      <div className="eoss-card overflow-hidden">
        <div className="eoss-card-header">
          <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Work Centre Assets ({relatedAssets.length})</span>
        </div>
        <table className="eoss-table">
          <thead><tr><th>Code</th><th>Asset</th><th>Work Centre</th><th>Criticality</th><th>Status</th></tr></thead>
          <tbody>
            {relatedAssets.length === 0 && <tr><td colSpan={5} className="text-center py-6 text-sm" style={{ color: 'var(--text-3)' }}>No assets matched to this job's work centres</td></tr>}
            {relatedAssets.map(a => (
              <tr key={a.id} className="cursor-pointer" onClick={() => navigate(`/assets/${a.id}`)}>
                <td><span className="font-mono text-xs" style={{ color: 'var(--brand)' }}>{a.assetCode}</span></td>
                <td className="text-sm">{a.name}</td>
                <td className="text-sm" style={{ color: 'var(--text-2)' }}>{a.workCentre}</td>
                <td><StatusChip status={a.criticality.toLowerCase()} label={a.criticality} size="sm" /></td>
                <td><StatusChip status={a.status} size="sm" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {jobEvents.length > 0 && (
        <div className="eoss-card overflow-hidden">
          <div className="eoss-card-header" style={{ background: 'var(--error-bg)' }}>
            <span className="font-semibold text-sm" style={{ color: 'var(--error)' }}>Maintenance Events Affecting This Job ({jobEvents.length})</span>
          </div>
          <table className="eoss-table">
            <thead><tr><th>Event #</th><th>Asset</th><th>Type</th><th>Impact</th><th>Status</th></tr></thead>
            <tbody>
              {jobEvents.map(e => {
                const impact = e.affectedJobs.find((aj: any) => aj.jobId === job.id || aj.jobNumber === job.jobNumber)?.impact;
                return (
                  <tr key={e.id} className="cursor-pointer" onClick={() => navigate(`/assets/maintenance/${e.id}`)}>
                    <td><span className="font-mono text-xs" style={{ color: 'var(--brand)' }}>{e.eventNumber}</span></td>
                    <td className="text-sm">{e.assetName}</td>
                    <td className="text-sm" style={{ color: 'var(--text-2)' }}>{e.type}</td>
                    <td className="text-sm" style={{ color: 'var(--warning)' }}>{impact ?? '—'}</td>
                    <td><StatusChip status={e.status} size="sm" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Helpers ── */
function StatTile({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: string }) {
  return (
    <div className="eoss-card p-3">
      <div className="flex items-center gap-1.5 mb-1" style={{ color: 'var(--text-3)' }}>{icon}<span className="text-[11px]">{label}</span></div>
      <div className="text-sm font-bold" style={{ color: accent ?? 'var(--text)' }}>{value}</div>
    </div>
  );
}

function Field({ label, value, span, mono }: { label: string; value: React.ReactNode; span?: boolean; mono?: boolean }) {
  return (
    <div className={span ? 'col-span-2' : ''}>
      <dt className="text-xs font-medium" style={{ color: 'var(--text-3)' }}>{label}</dt>
      <dd className={`text-sm mt-0.5 ${mono ? 'font-mono' : ''}`} style={{ color: 'var(--text)' }}>{value}</dd>
    </div>
  );
}

function SmallField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px]" style={{ color: 'var(--text-3)' }}>{label}</div>
      <div className="text-xs mt-0.5" style={{ color: 'var(--text)' }}>{value}</div>
    </div>
  );
}
