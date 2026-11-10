import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, ChevronRight, X } from 'lucide-react';
import { useStore, CUSTOMERS } from '../../store';
import { computeProductionStatus } from '../../domain/productionStatus';
import { jobsBlocked, DEFAULT_SITE_ID, DEFAULT_SITE_NAME } from '../../domain/recordLists';
import { DEMO_NOW } from '../../data/seed';
import RecordSheet from '../../components/layout/RecordSheet';
import SiteStoreField from '../../components/forms/SiteStoreField';
import StatusChip from '../../components/layout/StatusChip';
import type { Job, JobStage } from '../../types';
import SortableHeader from '../../components/layout/SortableHeader';
import { sortRows } from '../../domain/tableSort';
import { materialReadinessForJob } from '../../domain/inventory';

type JobSortKey = 'number' | 'customer' | 'description' | 'status' | 'priority' | 'stage' | 'plannedEnd' | 'projected' | 'material';

const PRIORITY_COLOR: Record<string, string> = {
  urgent: 'var(--error)', high: 'var(--warning)', normal: 'var(--info)', low: 'var(--text-3)'
};

const RISK_LABEL: Record<string, string> = {
  on_track: 'On Track', at_risk: 'At Risk', delayed: 'Delayed', blocked: 'Blocked', awaiting_material: 'Awaiting Material', complete: 'Complete',
};
const RISK_COLOR: Record<string, string> = {
  on_track: 'var(--success)', at_risk: 'var(--warning)', delayed: 'var(--error)', blocked: 'var(--error)', awaiting_material: 'var(--warning)', complete: 'var(--text-3)',
};

export default function Jobs() {
  const { jobs, sites, storeLocations, inventory, lots, jobMaterialReqs, stageTemplates, currentUser, addJob, cancelJob, showToast } = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const focusParam = searchParams.get('focus');
  const riskParam = searchParams.get('risk');
  const guided = focusParam === 'shortage' || !!riskParam;
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') ?? 'all');
  const [riskFilter, setRiskFilter] = useState<string | null>(riskParam);
  const [siteFilter, setSiteFilter] = useState(searchParams.get('site') ?? 'all');
  const [showNewJob, setShowNewJob] = useState(false);
  const [cancelJobId, setCancelJobId] = useState<string | null>(null);
  const canManage = ['owner', 'supervisor'].includes(currentUser.role);
  const now = new Date(DEMO_NOW);

  const statusByJob = Object.fromEntries(jobs.map(j => [j.id, computeProductionStatus(j, now)]));
  const readinessByJob = Object.fromEntries(jobs.map(j => [j.id, materialReadinessForJob(j, jobMaterialReqs, inventory, lots, storeLocations)]));

  const handleCancelJob = (id: string, reason: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const job = jobs.find(j => j.id === id);
    if (!job) return;
    if (job.status === 'complete' || job.status === 'cancelled') { showToast({ type: 'error', title: 'Job cannot be cancelled', body: 'Completed and already cancelled jobs remain historical.' }); return; }
    cancelJob(id, reason, currentUser.name);
    setCancelJobId(null);
  };

  const matchJob = (j: Job, status: string) => {
    const q = search.toLowerCase();
    const matchSearch = !q || j.jobNumber.toLowerCase().includes(q) ||
      j.customerName.toLowerCase().includes(q) ||
      j.description.toLowerCase().includes(q);
    const risk = statusByJob[j.id].risk;
    const matchRisk = riskFilter === 'watch'
      ? risk === 'at_risk' || risk === 'delayed'
      : (!riskFilter || risk === riskFilter);
    const readiness = readinessByJob[j.id];
    const matchFocus = focusParam !== 'shortage' || readiness === 'shortage';
    const matchSite = siteFilter === 'all' || j.siteId === siteFilter;
    const matchStatus = status === 'all' || j.status === status;
    return matchSearch && matchStatus && matchRisk && matchFocus && matchSite;
  };
  const filteredBase = jobs.filter(j => matchJob(j, statusFilter));
  const [sortKey, setSortKey] = useState<JobSortKey>('number');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const sortedJobs = sortRows(filteredBase, sortKey, sortDir, (j, key) => {
    const status = statusByJob[j.id];
    return ({ number: j.jobNumber, customer: j.customerName, description: j.description, status: j.status, priority: j.priority, stage: j.currentStage, plannedEnd: j.plannedEnd, projected: status.projectedCompletion, material: readinessByJob[j.id] } as Record<JobSortKey, unknown>)[key as JobSortKey];
  });
  const handleSort = (key: JobSortKey) => {
    if (sortKey === key) setSortDir(direction => direction === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const statusCounts = {
    all: jobs.filter(j => matchJob(j, 'all')).length,
    active: jobs.filter(j => matchJob(j, 'active')).length,
    hold: jobs.filter(j => matchJob(j, 'hold')).length,
    complete: jobs.filter(j => matchJob(j, 'complete')).length,
  };

  const scoped = jobs.filter(j => matchJob(j, 'all'));
  const riskCounts = {
    at_risk: scoped.filter(j => statusByJob[j.id].risk === 'at_risk').length,
    delayed: scoped.filter(j => statusByJob[j.id].risk === 'delayed').length,
    blocked: jobsBlocked(scoped, now).length,
    awaiting_material: scoped.filter(j => statusByJob[j.id].risk === 'awaiting_material').length,
  };
  const daysLeft = (end: string) => {
    const diff = new Date(end).getTime() - now.getTime();
    return Math.ceil(diff / 86400000);
  };

  const jobNext = (j: Job) => {
    const risk = statusByJob[j.id]?.risk;
    if (j.hasBlocker || risk === 'blocked') return { label: 'Resolve', path: `/jobs/${j.id}` };
    if (readinessByJob[j.id] === 'shortage') return { label: 'Review', path: `/jobs/${j.id}` };
    return { label: 'Update', path: `/jobs/${j.id}?update=1` };
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex-shrink-0 flex items-center gap-3 px-5 py-3 border-b flex-wrap"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search job, customer, description…"
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border outline-none"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text)' }} />
        </div>
        <select value={siteFilter} onChange={e => setSiteFilter(e.target.value)} className="eoss-input text-xs py-1.5 max-w-[11rem]" aria-label="Filter by site">
          <option value="all">All sites</option>
          {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <div className="flex gap-1.5 overflow-x-auto">
          {Object.entries(statusCounts).map(([s, count]) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap capitalize"
              style={{
                background: statusFilter === s ? 'var(--brand)' : 'var(--surface)',
                color: statusFilter === s ? '#fff' : 'var(--text-2)',
                borderColor: statusFilter === s ? 'var(--brand)' : 'var(--border)',
              }}>
              {s} ({count})
            </button>
          ))}
        </div>
        <div className="flex-1" />
        {(currentUser.role === 'owner' || currentUser.role === 'supervisor' || currentUser.role === 'sales') && (
          <button onClick={() => setShowNewJob(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
            style={{ background: 'var(--brand-fill)' }}>
            <Plus size={13} /> New Job
          </button>
        )}
      </div>

      <div className="flex-shrink-0 flex gap-2 px-4 py-2.5 overflow-x-auto border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        {([
          ['at_risk', 'At risk', riskCounts.at_risk, 'warning'],
          ['delayed', 'Delayed', riskCounts.delayed, 'error'],
          ['blocked', 'Blocked', riskCounts.blocked, 'error'],
          ['awaiting_material', 'Awaiting material', riskCounts.awaiting_material, 'warning'],
        ] as const).map(([key, label, value, accent]) => {
          const active = riskFilter === key;
          const color = accent === 'error' ? 'var(--error)' : 'var(--warning)';
          return (
            <button
              key={key}
              type="button"
              onClick={() => setRiskFilter(active ? null : key)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full border text-xs font-semibold"
              style={{
                borderColor: active ? color : 'var(--border)',
                color: value > 0 ? color : 'var(--text-3)',
                background: active ? 'var(--surface-2)' : 'var(--surface)',
              }}
            >
              {value} {label}
            </button>
          );
        })}
      </div>

      {guided && (
        <div className="px-4 py-2 text-sm border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)', color: 'var(--text)' }}>
          {focusParam === 'shortage' && 'These jobs are short of material. Open one to see what is missing.'}
          {riskParam === 'blocked' && 'These jobs are blocked. Resolve is the next step on the job.'}
          {riskParam === 'watch' && 'These jobs are at risk or delayed. Update progress on the current stage.'}
        </div>
      )}

      <div className="md:hidden flex-1 overflow-auto p-3 space-y-2">
        {sortedJobs.map(j => {
          const status = statusByJob[j.id];
          return (
            <div
              key={j.id}
              role="link"
              onClick={() => navigate(jobNext(j).path)}
              className="w-full text-left rounded-xl border p-3 cursor-pointer"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold" style={{ color: 'var(--brand)' }}>{j.jobNumber}</span>
                <span className="text-xs font-semibold" style={{ color: readinessByJob[j.id] === 'shortage' ? 'var(--error)' : 'var(--success)' }}>{String(readinessByJob[j.id]).replace('_', ' ')}</span>
              </div>
              <div className="text-sm font-semibold text-[var(--text)] mt-1">{j.customerName}</div>
              <div className="text-[11px] text-[var(--text-3)]">{j.siteName}</div>
              <div className="text-xs text-[var(--text-2)] mt-0.5 line-clamp-2">{j.description}</div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-[11px] text-[var(--text-3)]">{j.currentStage} · due {new Date(j.plannedEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                {guided && (
                  <button type="button" onClick={e => { e.stopPropagation(); navigate(jobNext(j).path); }}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white" style={{ background: 'var(--brand-fill)' }}>
                    {jobNext(j).label}
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {sortedJobs.length === 0 && <p className="text-center py-8 text-sm" style={{ color: 'var(--text-3)' }}>No jobs found</p>}
      </div>

      {/* Table */}
      <div className="hidden md:block flex-1 overflow-auto">
        <table className="w-full text-sm border-separate border-spacing-0" style={{ minWidth: 900 }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 5 }}>
            <tr style={{ background: 'var(--surface-2)' }}>
              {([['Job #', 'number'], ['Customer', 'customer'], ['Material Readiness', 'material'], ['Current Stage', 'stage'], ['Job Status', 'status'], ['Target Completion', 'plannedEnd'], ['Projected', 'projected']] as [string, JobSortKey][]).map(([label, key]) => (
                <SortableHeader key={label} label={label} active={sortKey === key} direction={sortDir} onSort={() => handleSort(key)} className="text-left px-4 py-2.5 text-xs font-semibold font-medium" style={{ color: 'var(--text-3)', borderBottom: '1px solid var(--border)' }} />
              ))}
              <th />
            </tr>
          </thead>
          <tbody>
            {sortedJobs.map(j => {
              const dl = daysLeft(j.plannedEnd);
              const isLate = dl < 0 && j.status !== 'complete';
              const status = statusByJob[j.id];
              return (
                <tr key={j.id} className="cursor-pointer" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}
                  onClick={() => navigate(`/jobs/${j.id}`)}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold" style={{ color: 'var(--brand)' }}>{j.jobNumber}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text)' }}>
                    {j.customerName}
                    <div className="text-[11px] font-normal text-[var(--text-3)]">{j.siteName}</div>
                  </td>
                  <td className="px-4 py-3"><StatusChip status={readinessByJob[j.id]} label={String(readinessByJob[j.id]).replace('_', ' ')} size="sm" /></td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{j.currentStage}</td>
                  <td className="px-4 py-3"><StatusChip status={j.status} size="sm" /></td>
                  <td className="px-4 py-3">
                    <span className="text-xs" style={{ color: isLate ? 'var(--error,#DC2626)' : 'var(--text-2)', fontWeight: isLate ? 600 : undefined }}>
                      {new Date(j.plannedEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      {isLate && ` · ${Math.abs(dl)}d late`}
                      {!isLate && j.status !== 'complete' && dl <= 3 && ` · ${dl}d left`}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }} title={status.projectionBasis}>
                    {status.projectedCompletion ? new Date(status.projectedCompletion).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                  </td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      {guided && (
                        <button type="button" onClick={() => navigate(jobNext(j).path)}
                          className="px-2 py-1 rounded-lg text-xs font-semibold text-white" style={{ background: 'var(--brand-fill)' }}>
                          {jobNext(j).label}
                        </button>
                      )}
                      {canManage && !['complete', 'cancelled'].includes(j.status) && (
                        <button onClick={e => { e.stopPropagation(); setCancelJobId(j.id); }} className="px-2 py-1 rounded text-xs font-semibold border" style={{ borderColor: 'var(--error)', color: 'var(--error)' }} title="Cancel job">Cancel</button>
                      )}
                      <ChevronRight size={14} style={{ color: 'var(--text-3)' }} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {sortedJobs.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-sm" style={{ color: 'var(--text-3)' }}>No jobs found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {cancelJobId && <CancelJobModal job={jobs.find(j => j.id === cancelJobId)!} onClose={() => setCancelJobId(null)} onConfirm={reason => handleCancelJob(cancelJobId, reason)} />}
      {showNewJob && (
        <NewJobModal
          onClose={() => setShowNewJob(false)}
          onSave={(job) => {
            addJob(job);
            showToast({ type: 'success', title: 'Job created', body: `${job.jobNumber} opened.` });
            setShowNewJob(false);
            navigate(`/jobs/${job.id}`);
          }}
        />
      )}
    </div>
  );
}

function CancelJobModal({ job, onClose, onConfirm }: { job: Job; onClose: () => void; onConfirm: (reason: string) => void }) {
  const { jobMaterialReqs } = useStore();
  const [reason, setReason] = useState('');
  const reqs = jobMaterialReqs.filter(r => r.jobId === job.id);
  const reserved = reqs.reduce((sum, r) => sum + r.reservedQty, 0);
  const issued = reqs.reduce((sum, r) => sum + r.issuedQty, 0);
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"><div className="w-full max-w-lg rounded-xl border p-5 space-y-4 bg-[var(--surface)]" style={{ borderColor: 'var(--border)' }}><div className="flex items-center justify-between"><div><h2 className="text-sm font-bold text-[var(--text)]">Cancel {job.jobNumber}</h2><p className="text-xs text-[var(--text-2)]">The record and audit history will be preserved.</p></div><button type="button" onClick={onClose}><X size={16} className="text-[var(--text-3)]" /></button></div><div className="rounded-lg p-3 text-xs" style={{ background: 'var(--surface-2)' }}><div className="grid grid-cols-2 gap-2"><div>Current status: <strong>{job.status}</strong></div><div>Current stage: <strong>{job.currentStage}</strong></div><div>Reserved: <strong>{reserved}</strong></div><div>Issued/consumed: <strong>{issued}</strong></div></div><p className="mt-2 text-[var(--text-2)]">Reserved but unissued quantities are released. Issued or consumed material is not restored automatically; use an accepted return transaction when appropriate.</p></div><div><label className="block text-xs font-semibold text-[var(--text-2)] mb-1">Cancellation reason *</label><textarea autoFocus value={reason} onChange={e => setReason(e.target.value)} rows={3} className="eoss-input w-full" placeholder="Why is this job being cancelled?" /></div><div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="btn-ghost text-xs">Keep job</button><button type="button" disabled={!reason.trim()} onClick={() => onConfirm(reason)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50" style={{ background: 'var(--error)' }}>Confirm cancellation</button></div></div></div>;
}

function NewJobModal({ onClose, onSave }: { onClose: () => void; onSave: (j: Job) => void }) {
  const { customerPos, stageTemplates } = useStore();
  const [form, setForm] = useState({
    customerId: '', customerName: '', description: '', plannedEnd: '', priority: 'normal' as Job['priority'],
    linkedPoRef: '', orderedQty: '', bufferPct: '5',
    siteId: DEFAULT_SITE_ID, siteName: DEFAULT_SITE_NAME,
    stageTemplateId: stageTemplates[0]?.id ?? '',
  });
  const [err, setErr] = useState('');
  const orderedQtyNum = Number(form.orderedQty) || 0;
  const bufferPctNum = Number(form.bufferPct) || 5;
  const plannedQty = orderedQtyNum > 0 ? Math.ceil(orderedQtyNum * (1 + bufferPctNum / 100)) : 0;
  const save = () => {
    if (!form.customerId || !form.description || !form.plannedEnd) { setErr('Customer, description and planned end date required'); return; }
    const id = `job-${Date.now()}`;
    const num = `J-${String(Math.floor(Math.random() * 900 + 110))}`;
    const template = stageTemplates.find(t => t.id === form.stageTemplateId) ?? stageTemplates[0];
    const defaultStages: JobStage[] = (template?.stages ?? []).map(stage => ({ id: `${id}-s${stage.sequence}`, jobId: id, name: stage.name, sequence: stage.sequence, status: 'pending', plannedStart: DEMO_NOW, plannedEnd: form.plannedEnd, inputQty: plannedQty || 0, completedGoodQty: 0, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'pcs', workCentre: stage.workCentre }));
    onSave({ id, jobNumber: num, customerId: form.customerId, customerName: form.customerName, description: form.description, status: 'active', priority: form.priority, plannedStart: DEMO_NOW, plannedEnd: form.plannedEnd, siteId: form.siteId, siteName: form.siteName, owner: 'Owner', stages: defaultStages, currentStage: defaultStages[0]?.name ?? 'Planning', materialReadiness: 'pending', hasBlocker: false, stageTemplateId: template?.id, stageTemplateName: template?.name });
  };
  return (
    <RecordSheet
      title="New job"
      subtitle="Opens on the selected site"
      onClose={onClose}
      secondary={{ label: 'Cancel', onClick: onClose }}
      primary={{ label: 'Create job', onClick: save }}
    >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Customer *</label>
            <select className="eoss-input w-full" value={form.customerId} onChange={e => {
              const c = CUSTOMERS.find(x => x.id === e.target.value);
              setForm(f => ({ ...f, customerId: e.target.value, customerName: c?.tradingName ?? c?.legalName ?? '' }));
            }}>
              <option value="">Select customer…</option>
              {CUSTOMERS.map(c => <option key={c.id} value={c.id}>{c.tradingName ?? c.legalName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Linked Customer PO</label>
            <select className="eoss-input w-full" value={form.linkedPoRef} onChange={e => setForm(f => ({ ...f, linkedPoRef: e.target.value }))}>
              <option value="">None / New PO</option>
              {customerPos.map(po => <option key={po.id} value={po.poNumber}>{po.poNumber} — {po.customerName}</option>)}
            </select>
          </div>
          <SiteStoreField
            siteId={form.siteId}
            storeId={DEFAULT_SITE_ID === form.siteId ? 'loc-wip' : ''}
            label="Site"
            storeLabel="Floor store"
            onChange={next => setForm(f => ({ ...f, siteId: next.siteId, siteName: next.siteName }))}
          />
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Job Description *</label>
            <input className="eoss-input w-full" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Fabrication of 10 MS Frames" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Production workflow *</label>
            <select className="eoss-input w-full" value={form.stageTemplateId} onChange={e => setForm(f => ({ ...f, stageTemplateId: e.target.value }))}>
              {stageTemplates.map(template => <option key={template.id} value={template.id}>{template.name} ({template.stages.length} stages)</option>)}
            </select>
            <p className="text-[11px] text-[var(--text-3)] mt-1">The selected stage sequence is copied to the job and will not change if the template changes later.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Ordered Qty</label>
              <input type="number" className="eoss-input w-full" value={form.orderedQty} onChange={e => setForm(f => ({ ...f, orderedQty: e.target.value }))} placeholder="e.g. 100" min="0" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Buffer %</label>
              <input type="number" className="eoss-input w-full" value={form.bufferPct} onChange={e => setForm(f => ({ ...f, bufferPct: e.target.value }))} min="0" max="50" />
            </div>
          </div>
          {orderedQtyNum > 0 && (
            <div className="text-xs rounded-lg px-3 py-2 bg-[var(--surface-2)] text-[var(--text-2)]">
              Planned production qty: <strong className="text-[var(--text)]">{plannedQty}</strong> ({form.orderedQty} ordered × {(1 + bufferPctNum/100).toFixed(2)})
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Planned End *</label>
              <input type="date" className="eoss-input w-full" value={form.plannedEnd} onChange={e => setForm(f => ({ ...f, plannedEnd: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Priority</label>
              <select className="eoss-input w-full" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Job['priority'] }))}>
                {(['normal', 'high', 'urgent', 'low'] as const).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </div>
        {err && <p className="text-xs text-[var(--danger)] mt-2">{err}</p>}
    </RecordSheet>
  );
}

