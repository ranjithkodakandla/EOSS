import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, AlertTriangle, ChevronRight, Clock, Package, FileText,
  Activity, Layers, Users, CheckCircle, Play, Pause, Truck,
  Calendar, User, MapPin, DollarSign, Zap,
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

        {/* Stage progress rail */}
        <div className="hidden md:flex items-center gap-0 overflow-x-auto pb-2 mt-1">
          {job.stages.map((s: any, i: number) => {
            const isDone   = s.status === 'complete';
            const isActive = s.status === 'in_progress';
            const isHold   = s.status === 'hold';
            const dotColor = isDone ? 'var(--success)' : isActive ? 'var(--brand)' : isHold ? 'var(--error)' : 'var(--border-2)';
            const lineColor = isDone ? 'var(--success)' : isActive ? 'var(--brand)' : 'var(--border-2)';
            return (
              <React.Fragment key={s.id}>
                {i > 0 && (
                  <div
                    className="h-px flex-1 min-w-[16px] max-w-[48px]"
                    style={{ background: lineColor, opacity: isDone ? 1 : 0.4 }}
                  />
                )}
                <div className="flex flex-col items-center gap-1 flex-shrink-0" style={{ maxWidth: 80 }}>
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border-2"
                    style={{
                      background: isDone ? 'var(--success)' : isActive ? 'var(--brand)' : 'var(--surface)',
                      borderColor: dotColor,
                      color: isDone || isActive ? 'white' : 'var(--text-3)',
                    }}
                  >
                    {isDone ? '✓' : i + 1}
                  </div>
                  <span
                    className="text-[10px] text-center leading-tight truncate w-full px-1"
                    style={{ color: isDone || isActive ? 'var(--text-2)' : 'var(--text-3)' }}
                  >
                    {s.name}
                  </span>
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
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="md:col-span-2 space-y-4">

        {/* Stat strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatTile
            icon={<Calendar size={13} />}
            label="Due"
            value={new Date(job.plannedEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          />
          <StatTile
            icon={<Layers size={13} />}
            label="Stages"
            value={`${completedStages}/${job.stages.length} done`}
          />
          <StatTile
            icon={<Activity size={13} />}
            label="Yield"
            value={`${pct}%`}
            accent={pct >= 90 ? 'var(--success)' : pct >= 70 ? 'var(--warning)' : 'var(--error)'}
          />
          <StatTile
            icon={<DollarSign size={13} />}
            label="Value"
            value={job.value ? `₹${(job.value / 1000).toFixed(0)}k` : '—'}
          />
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

        {/* Stage progress */}
        <div className="eoss-card">
          <div className="eoss-card-header">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Stage Progress</span>
            <span className="text-xs" style={{ color: 'var(--text-2)' }}>{completedStages}/{job.stages.length} complete</span>
          </div>
          <div className="p-4">
            <div className="progress-bar mb-4">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${(completedStages / job.stages.length) * 100}%`,
                  background: 'var(--brand)',
                }}
              />
            </div>
            <div className="grid gap-2">
              {job.stages.map((s: any, i: number) => {
                const isDone   = s.status === 'complete';
                const isActive = s.status === 'in_progress';
                const isHold   = s.status === 'hold';
                return (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-[var(--radius-sm)]"
                    style={{
                      background: isDone ? 'var(--success-bg)' : isActive ? 'var(--info-bg)' : isHold ? 'var(--error-bg)' : 'var(--surface-2)',
                      border: `1px solid ${isDone ? 'var(--success-border)' : isActive ? 'var(--info-border)' : isHold ? 'var(--error-border)' : 'var(--border)'}`,
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                      style={{
                        background: isDone ? 'var(--success)' : isActive ? 'var(--brand)' : 'var(--surface)',
                        color: isDone || isActive ? 'white' : 'var(--text-3)',
                        border: `1px solid ${isDone ? 'var(--success)' : isActive ? 'var(--brand)' : 'var(--border-2)'}`,
                      }}
                    >
                      {isDone ? '✓' : i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold" style={{ color: isDone ? 'var(--success)' : isActive ? 'var(--brand)' : 'var(--text)' }}>
                          {s.name}
                        </span>
                        <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>{s.workCentre}</span>
                      </div>
                      {s.inputQty > 0 && (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="progress-bar flex-1" style={{ height: 3 }}>
                            <div
                              className="progress-bar-fill"
                              style={{
                                width: `${Math.min(100, (s.completedGoodQty / s.inputQty) * 100)}%`,
                                background: isDone ? 'var(--success)' : 'var(--brand)',
                              }}
                            />
                          </div>
                          <span className="text-[10px] font-mono flex-shrink-0" style={{ color: 'var(--text-3)' }}>
                            {s.completedGoodQty}/{s.inputQty} {s.uom}
                          </span>
                        </div>
                      )}
                    </div>
                    <StatusChip status={s.status} size="sm" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Right column */}
      <div className="space-y-4">
        {blockers.length > 0 && (
          <div
            className="rounded-[var(--radius)] p-4"
            style={{ background: 'var(--error-bg)', border: '1px solid var(--error-border)' }}
          >
            <h3 className="font-semibold text-sm flex items-center gap-1.5 mb-3" style={{ color: 'var(--error)' }}>
              <AlertTriangle size={14} /> Active Blockers
            </h3>
            {blockers.map((b: any) => (
              <div key={b.id} className="mt-2 first:mt-0">
                <div className="text-xs font-semibold" style={{ color: 'var(--error)' }}>{b.type}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>{b.description}</div>
              </div>
            ))}
          </div>
        )}

        {/* Material status */}
        <div className="eoss-card">
          <div className="eoss-card-header">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Materials</span>
          </div>
          <div className="p-4">
            <StatusChip
              status={
                job.materialReadiness === 'ready' ? 'available' :
                job.materialReadiness === 'shortage' ? 'shortage' :
                job.materialReadiness === 'partial' ? 'partial' : 'pending'
              }
              label={job.materialReadiness}
            />
            <p className="text-xs mt-2" style={{ color: 'var(--text-2)' }}>
              {job.materialReadiness === 'shortage' ? 'Critical shortage — job blocked on material.' :
               job.materialReadiness === 'partial'  ? 'Some materials not yet fully received.' :
               job.materialReadiness === 'ready'    ? 'All materials reserved and available.' :
               'Materials not yet assessed.'}
            </p>
          </div>
        </div>

        {/* AI signal if job has blockers or is on hold */}
        {(job.hasBlocker || job.status === 'hold') && (
          <div className="eoss-card p-4">
            <div className="ai-signal mb-2">
              <Zap size={10} /> AI Signal
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--text-2)' }}>
              {job.status === 'hold'
                ? `This job has been on hold. Consider reviewing blocker resolution and rescheduling downstream stages.`
                : `Job has active blockers. Downstream stages may need replanning based on resolution timeline.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
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
  return (
    <div className="eoss-card overflow-hidden">
      <div className="eoss-card-header">
        <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Material Requirements & Allocations</span>
      </div>
      <table className="eoss-table">
        <thead>
          <tr><th>Material</th><th>Stage</th><th>Required</th><th>Reserved</th><th>Issued</th><th>UOM</th><th>Status</th></tr>
        </thead>
        <tbody>
          {reqs.length === 0 && (
            <tr><td colSpan={7} className="text-center py-6 text-sm" style={{ color: 'var(--text-3)' }}>No material requirements recorded for this job</td></tr>
          )}
          {reqs.map(r => (
            <tr key={r.id}>
              <td className="text-sm">{r.materialName}</td>
              <td className="text-xs" style={{ color: 'var(--text-2)' }}>{r.stageName}</td>
              <td className="font-mono text-sm">{r.requiredQty}</td>
              <td className="font-mono text-sm">{r.reservedQty}</td>
              <td className="font-mono text-sm">{r.issuedQty}</td>
              <td className="text-xs" style={{ color: 'var(--text-2)' }}>{r.uom}</td>
              <td><StatusChip status={r.shortage ? 'shortage' : r.issuedQty > 0 ? 'issued' : r.reservedQty > 0 ? 'reserved' : 'pending'} label={r.shortage ? 'shortage' : undefined} size="sm" /></td>
            </tr>
          ))}
        </tbody>
      </table>
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
  return (
    <div className="space-y-4">
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
