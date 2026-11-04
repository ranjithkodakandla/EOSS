import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, ChevronRight, Clock, Package, FileText, Activity, Layers, Users, CheckCircle, Play, Pause } from 'lucide-react';
import { useStore, JOB_BLOCKERS, PURCHASE_REQS } from '../../store';
import { MATERIALS, SUPPLIER_PO_LINES } from '../../data/seed';
import StatusChip from '../../components/layout/StatusChip';
import clsx from 'clsx';

const TABS = ['Overview', 'Stages', 'Materials', 'Updates', 'Documents', 'Quality', 'Blockers'];

export default function JobWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { jobs, setJobStatus, currentUser, showToast } = useStore();
  const [tab, setTab] = useState('Overview');

  const job = jobs.find(j => j.id === id);
  if (!job) return <div className="p-6 text-[var(--text-2)]">Job not found</div>;

  const blockers = JOB_BLOCKERS.filter(b => b.jobId === id && b.status === 'open');
  const totalGood = job.stages.reduce((s, st) => s + st.completedGoodQty, 0);
  const totalInput = job.stages.reduce((s, st) => s + (st.inputQty || 0), 0);
  const pct = totalInput > 0 ? Math.round((totalGood / totalInput) * 100) : 0;
  const completedStages = job.stages.filter(s => s.status === 'complete').length;

  const canUpdate = ['owner', 'supervisor', 'operator'].includes(currentUser.role);
  const canApprove = ['owner'].includes(currentUser.role);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="sticky top-[var(--topbar-h)] z-20 bg-[var(--bg)] border-b border-[var(--border)] px-4 md:px-6 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => navigate('/jobs')} className="text-[var(--text-3)] hover:text-[var(--text)]">
            <ArrowLeft size={16} />
          </button>
          <span className="text-[var(--text-3)] text-sm">/</span>
          <span className="font-mono font-semibold text-sm text-[var(--brand)]">{job.jobNumber}</span>
          <StatusChip status={job.status} />
          {job.hasBlocker && <span className="flex items-center gap-1 text-xs text-[var(--error)] font-semibold"><AlertTriangle size={12} /> BLOCKED</span>}
          <div className="ml-auto flex gap-2">
            {canUpdate && job.status === 'active' && (
              <button
                onClick={() => { setJobStatus(job.id, 'hold'); showToast({ type: 'warning', title: 'Job placed on hold' }); }}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-[var(--border)] rounded-lg text-sm text-[var(--text-2)] hover:bg-[var(--surface-2)]"
              >
                <Pause size={13} /> Hold
              </button>
            )}
            {canUpdate && job.status === 'hold' && (
              <button
                onClick={() => { setJobStatus(job.id, 'active'); showToast({ type: 'success', title: 'Job resumed' }); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--brand)] text-white rounded-lg text-sm font-medium"
              >
                <Play size={13} /> Resume
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-3 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={clsx('px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors',
                tab === t ? 'bg-[var(--brand)] text-white font-medium' : 'text-[var(--text-2)] hover:bg-[var(--surface-2)]'
              )}
            >
              {t}
              {t === 'Blockers' && blockers.length > 0 && (
                <span className="ml-1.5 bg-[var(--error)] text-white text-[10px] px-1.5 py-0.5 rounded-full">{blockers.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 md:p-6">
        {tab === 'Overview' && <Overview job={job} pct={pct} completedStages={completedStages} blockers={blockers} navigate={navigate} />}
        {tab === 'Stages' && <Stages job={job} canUpdate={canUpdate} navigate={navigate} />}
        {tab === 'Materials' && <Materials job={job} />}
        {tab === 'Updates' && <Updates job={job} />}
        {tab === 'Documents' && <DocTab job={job} />}
        {tab === 'Quality' && <QualityTab job={job} />}
        {tab === 'Blockers' && <BlockersTab blockers={blockers} job={job} />}
      </div>
    </div>
  );
}

function Overview({ job, pct, completedStages, blockers, navigate }: any) {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="md:col-span-2 space-y-4">
        {/* Info card */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
          <h2 className="font-semibold text-sm text-[var(--text)] mb-3">Job Details</h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <Field label="Customer" value={job.customerName} />
            <Field label="PO Number" value={job.customerPoNumber ?? '—'} />
            <Field label="Description" value={job.description} span />
            <Field label="Drawing Ref" value={job.drawingRef ?? '—'} />
            <Field label="Site" value={job.siteName} />
            <Field label="Owner" value={job.owner} />
            <Field label="Priority" value={<StatusChip status={job.priority} size="sm" />} />
            <Field label="Value" value={job.value ? `₹${(job.value / 1000).toFixed(0)}k` : '—'} />
            <Field label="Planned Start" value={new Date(job.plannedStart).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} />
            <Field label="Planned End" value={new Date(job.plannedEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} />
            {job.actualStart && <Field label="Actual Start" value={new Date(job.actualStart).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} />}
            {job.actualEnd && <Field label="Actual End" value={new Date(job.actualEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} />}
          </dl>
        </div>

        {/* Progress */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-sm text-[var(--text)]">Stage Progress</h2>
            <span className="text-xs text-[var(--text-2)]">{completedStages}/{job.stages.length} stages complete</span>
          </div>
          <div className="h-2 bg-[var(--surface-2)] rounded-full overflow-hidden mb-3">
            <div className="h-full bg-[var(--brand)] rounded-full transition-all" style={{ width: `${(completedStages / job.stages.length) * 100}%` }} />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {job.stages.map((s: any, i: number) => (
              <div key={s.id} className={clsx(
                'flex-shrink-0 px-3 py-2 rounded-lg border text-xs',
                s.status === 'complete' ? 'bg-[var(--success-bg)] border-[var(--success)] text-[var(--success)]' :
                s.status === 'in_progress' ? 'bg-[var(--info-bg)] border-[var(--info)] text-[var(--info)]' :
                s.status === 'hold' ? 'bg-[var(--error-bg)] border-[var(--error)] text-[var(--error)]' :
                'bg-[var(--surface-2)] border-[var(--border)] text-[var(--text-3)]'
              )}>
                <div className="font-semibold">{i + 1}. {s.name}</div>
                <div className="mt-0.5 text-[10px]">{s.completedGoodQty}/{s.inputQty} {s.uom}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right column */}
      <div className="space-y-4">
        {blockers.length > 0 && (
          <div className="bg-[var(--error-bg)] border border-[var(--error)] rounded-xl p-4">
            <h3 className="font-semibold text-sm text-[var(--error)] mb-2 flex items-center gap-1.5"><AlertTriangle size={14} /> Active Blockers</h3>
            {blockers.map((b: any) => (
              <div key={b.id} className="text-xs text-[var(--text)] mt-2">
                <div className="font-semibold">{b.type}</div>
                <div className="text-[var(--text-2)] mt-0.5">{b.description}</div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
          <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Material Status</h3>
          <StatusChip status={
            job.materialReadiness === 'ready' ? 'available' :
            job.materialReadiness === 'shortage' ? 'shortage' :
            job.materialReadiness === 'partial' ? 'partial' : 'pending'
          } label={job.materialReadiness} />
          <p className="text-xs text-[var(--text-2)] mt-2">
            {job.materialReadiness === 'shortage' ? 'Critical shortage — job blocked on material.' :
             job.materialReadiness === 'partial' ? 'Some materials not yet fully received.' :
             job.materialReadiness === 'ready' ? 'All materials reserved and available.' : 'Materials not yet assessed.'}
          </p>
        </div>
      </div>
    </div>
  );
}

function Stages({ job, canUpdate, navigate }: any) {
  return (
    <div className="space-y-3">
      {job.stages.map((s: any) => (
        <div key={s.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 bg-[var(--surface-2)] rounded-full text-sm font-semibold text-[var(--text-2)] flex items-center justify-center flex-shrink-0">{s.sequence}</span>
              <div>
                <div className="font-semibold text-sm text-[var(--text)]">{s.name}</div>
                <div className="text-xs text-[var(--text-2)]">{s.workCentre} · {s.owner || 'Unassigned'}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusChip status={s.status} size="sm" />
              {canUpdate && (s.status === 'in_progress' || s.status === 'pending') && (
                <button
                  onClick={() => navigate(`/jobs/${job.id}/stage/${s.id}`)}
                  className="px-3 py-1.5 bg-[var(--brand)] text-white text-xs rounded-lg font-medium hover:bg-[var(--brand-700)]"
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
              <div className="flex justify-between text-[11px] text-[var(--text-3)] mb-1">
                <span>Progress</span>
                <span>{s.completedGoodQty}/{s.inputQty}</span>
              </div>
              <div className="h-1.5 bg-[var(--surface-2)] rounded-full">
                <div className="h-full bg-[var(--success)] rounded-full" style={{ width: `${Math.min(100, (s.completedGoodQty / s.inputQty) * 100)}%` }} />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Materials({ job }: any) {
  const { lots } = useStore();
  const jobLots = lots.filter(l => l.status === 'reserved' || l.status === 'issued');
  return (
    <div className="space-y-3">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-2)]">
          <h3 className="font-semibold text-sm text-[var(--text)]">Material Requirements & Allocations</h3>
        </div>
        <table className="eoss-table">
          <thead>
            <tr><th>Material</th><th>Required</th><th>Reserved</th><th>Issued</th><th>UOM</th><th>Status</th></tr>
          </thead>
          <tbody>
            {job.id === 'job-101' && (
              <>
                <tr>
                  <td className="text-sm">MS Plate 8mm</td>
                  <td className="font-mono text-sm">320</td>
                  <td className="font-mono text-sm">320</td>
                  <td className="font-mono text-sm">320</td>
                  <td className="text-xs text-[var(--text-2)]">kg</td>
                  <td><StatusChip status="issued" size="sm" /></td>
                </tr>
                <tr>
                  <td className="text-sm">Welding Rods E6013</td>
                  <td className="font-mono text-sm">200</td>
                  <td className="font-mono text-sm">200</td>
                  <td className="font-mono text-sm">0</td>
                  <td className="text-xs text-[var(--text-2)]">pcs</td>
                  <td><StatusChip status="reserved" size="sm" /></td>
                </tr>
              </>
            )}
            {job.id === 'job-102' && (
              <tr>
                <td className="text-sm">SS Sheet 3mm 304L</td>
                <td className="font-mono text-sm">432</td>
                <td className="font-mono text-sm">108</td>
                <td className="font-mono text-sm">0</td>
                <td className="text-xs text-[var(--text-2)]">kg</td>
                <td><StatusChip status="shortage" label="shortage" size="sm" /></td>
              </tr>
            )}
            {!['job-101', 'job-102'].includes(job.id) && (
              <tr><td colSpan={6} className="text-center py-6 text-sm text-[var(--text-3)]">Material requirements tracked at stage level</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Updates({ job }: any) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
      <h3 className="font-semibold text-sm text-[var(--text)] mb-4">Activity Feed</h3>
      <div className="space-y-4">
        {job.stages.filter((s: any) => s.status !== 'pending').map((s: any) => (
          <div key={s.id} className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-[var(--brand)] flex items-center justify-center flex-shrink-0 text-white">
              <Activity size={12} />
            </div>
            <div>
              <p className="text-sm text-[var(--text)]">
                <span className="font-medium">{s.name}</span> — {s.status === 'complete' ? 'completed' : s.status === 'in_progress' ? 'started' : s.status}
              </p>
              <p className="text-xs text-[var(--text-2)]">{s.owner || 'Unknown'} · {s.completedGoodQty} {s.uom} done</p>
              <p className="text-xs text-[var(--text-3)]">{s.actualStart ? new Date(s.actualStart).toLocaleDateString('en-IN') : ''}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DocTab({ job }: any) {
  const { documents } = useStore();
  const jobDocs = documents.filter(d => d.linkedEntities.some(le => le.ref === job.jobNumber));
  return (
    <div className="space-y-3">
      {jobDocs.length === 0 && <div className="text-center py-10 text-sm text-[var(--text-3)]">No documents linked to this job.</div>}
      {jobDocs.map(d => (
        <div key={d.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 flex items-center gap-3">
          <FileText size={18} className="text-[var(--brand)] flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-[var(--text)]">{d.title}</div>
            <div className="text-xs text-[var(--text-2)]">{d.docType} · v{d.version} · {d.fileSize}</div>
          </div>
          <StatusChip status={d.certStatus ?? 'pending'} size="sm" />
        </div>
      ))}
    </div>
  );
}

function QualityTab({ job }: any) {
  const { inspections, ncrs } = useStore();
  const jobInsp = inspections.filter(i => i.jobId === job.id);
  const jobNcrs = ncrs.filter(n => n.jobId === job.id);
  return (
    <div className="space-y-4">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-2)]">
          <h3 className="font-semibold text-sm">Inspections ({jobInsp.length})</h3>
        </div>
        <table className="eoss-table">
          <thead><tr><th>No.</th><th>Type</th><th>Stage</th><th>Date</th><th>Sample</th><th>Accept</th><th>Reject</th><th>Result</th></tr></thead>
          <tbody>
            {jobInsp.length === 0 && <tr><td colSpan={8} className="text-center py-6 text-sm text-[var(--text-3)]">No inspections recorded</td></tr>}
            {jobInsp.map(i => (
              <tr key={i.id}>
                <td className="font-mono text-xs">{i.inspectionNumber}</td>
                <td className="text-sm">{i.type}</td>
                <td className="text-sm text-[var(--text-2)]">{i.stageName ?? '—'}</td>
                <td className="text-sm">{new Date(i.date).toLocaleDateString('en-IN')}</td>
                <td className="font-mono text-sm">{i.sampleQty}</td>
                <td className="font-mono text-sm text-[var(--success)]">{i.acceptedQty}</td>
                <td className="font-mono text-sm text-[var(--error)]">{i.rejectedQty}</td>
                <td><StatusChip status={i.result} size="sm" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {jobNcrs.length > 0 && (
        <div className="bg-[var(--error-bg)] border border-[var(--error)] rounded-xl p-4">
          <h3 className="font-semibold text-sm text-[var(--error)] mb-2">NCRs ({jobNcrs.length})</h3>
          {jobNcrs.map(n => (
            <div key={n.id} className="text-sm mt-2">
              <span className="font-mono font-semibold">{n.ncrNumber}</span> — {n.description}
              <StatusChip status={n.status} size="sm" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BlockersTab({ blockers, job }: any) {
  const { showToast } = useStore();
  if (blockers.length === 0) return (
    <div className="bg-[var(--success-bg)] border border-[var(--success)] rounded-xl p-6 text-center">
      <CheckCircle size={24} className="text-[var(--success)] mx-auto mb-2" />
      <p className="font-semibold text-[var(--success)]">No active blockers</p>
      <p className="text-sm text-[var(--text-2)] mt-1">This job is running without blockers.</p>
    </div>
  );
  return (
    <div className="space-y-3">
      {blockers.map((b: any) => (
        <div key={b.id} className="bg-[var(--error-bg)] border border-[var(--error)] rounded-xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle size={14} className="text-[var(--error)]" />
                <span className="font-semibold text-sm text-[var(--error)]">{b.type} Blocker</span>
                <StatusChip status="open" size="sm" />
              </div>
              <p className="text-sm text-[var(--text)]">{b.description}</p>
              <p className="text-xs text-[var(--text-2)] mt-2">Raised by {b.raisedBy} · {new Date(b.raisedAt).toLocaleDateString('en-IN')}</p>
            </div>
            <button
              onClick={() => showToast({ type: 'success', title: 'Blocker resolved', body: 'Blocker marked as resolved.' })}
              className="px-3 py-1.5 bg-[var(--success)] text-white text-xs rounded-lg font-medium flex-shrink-0"
            >
              Resolve
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function Field({ label, value, span }: { label: string; value: React.ReactNode; span?: boolean }) {
  return (
    <div className={span ? 'col-span-2' : ''}>
      <dt className="text-xs text-[var(--text-3)] font-medium">{label}</dt>
      <dd className="text-sm text-[var(--text)] mt-0.5">{value}</dd>
    </div>
  );
}

function SmallField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] text-[var(--text-3)]">{label}</div>
      <div className="text-xs text-[var(--text)] mt-0.5">{value}</div>
    </div>
  );
}
