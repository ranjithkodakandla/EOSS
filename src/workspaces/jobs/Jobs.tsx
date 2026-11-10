import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, AlertTriangle, Search, ChevronRight, Trash2 } from 'lucide-react';
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

type JobSortKey = 'number' | 'customer' | 'description' | 'status' | 'priority' | 'stage' | 'plannedEnd' | 'projected' | 'material' | 'risk';

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
  const { jobs, dispatches, sites, currentUser, addJob, showToast } = useStore();
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
  const [deletedJobIds, setDeletedJobIds] = useState<Set<string>>(new Set());
  const canManage = ['owner', 'supervisor'].includes(currentUser.role);
  const now = new Date(DEMO_NOW);

  const statusByJob = Object.fromEntries(jobs.map(j => [j.id, computeProductionStatus(j, now)]));

  const handleDeleteJob = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const job = jobs.find(j => j.id === id);
    if (!job) return;
    if (job.status === 'complete') { showToast({ type: 'error', title: 'Cannot delete completed job' }); return; }
    const hasDispatch = dispatches.some(d => Array.isArray(d.jobs) && d.jobs.includes(id));
    if (hasDispatch) { showToast({ type: 'error', title: 'Cannot delete job', body: 'Job has dispatch records.' }); return; }
    setDeletedJobIds(prev => new Set([...prev, id]));
    showToast({ type: 'success', title: 'Job removed' });
  };

  const matchJob = (j: Job, status: string) => {
    if (deletedJobIds.has(j.id)) return false;
    const q = search.toLowerCase();
    const matchSearch = !q || j.jobNumber.toLowerCase().includes(q) ||
      j.customerName.toLowerCase().includes(q) ||
      j.description.toLowerCase().includes(q);
    const risk = statusByJob[j.id].risk;
    const matchRisk = riskFilter === 'watch'
      ? risk === 'at_risk' || risk === 'delayed'
      : (!riskFilter || risk === riskFilter);
    const matchFocus = focusParam !== 'shortage' || j.materialReadiness === 'shortage';
    const matchSite = siteFilter === 'all' || j.siteId === siteFilter;
    const matchStatus = status === 'all' || j.status === status;
    return matchSearch && matchStatus && matchRisk && matchFocus && matchSite;
  };
  const filteredBase = jobs.filter(j => matchJob(j, statusFilter));
  const [sortKey, setSortKey] = useState<JobSortKey>('number');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const sortedJobs = sortRows(filteredBase, sortKey, sortDir, (j, key) => {
    const status = statusByJob[j.id];
    return ({ number: j.jobNumber, customer: j.customerName, description: j.description, status: j.status, priority: j.priority, stage: j.currentStage, plannedEnd: j.plannedEnd, projected: status.projectedCompletion, material: j.materialReadiness, risk: status.risk } as Record<JobSortKey, unknown>)[key as JobSortKey];
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
    if (j.materialReadiness === 'shortage') return { label: 'Review', path: `/jobs/${j.id}` };
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
                <span className="text-xs font-semibold" style={{ color: RISK_COLOR[status.risk] }}>{RISK_LABEL[status.risk]}</span>
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
              {([['Job #', 'number'], ['Customer', 'customer'], ['Description', 'description'], ['Status', 'status'], ['Priority', 'priority'], ['Stage', 'stage'], ['Planned End', 'plannedEnd'], ['Projected', 'projected'], ['Material', 'material'], ['Risk', 'risk']] as [string, JobSortKey][]).map(([label, key]) => (
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
                      {j.hasBlocker === true && <AlertTriangle size={12} style={{ color: 'var(--error,#DC2626)', flexShrink: 0 }} />}
                      <span className="font-mono text-xs font-bold" style={{ color: 'var(--brand)' }}>{j.jobNumber}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text)' }}>
                    {j.customerName}
                    <div className="text-[11px] font-normal text-[var(--text-3)]">{j.siteName}</div>
                  </td>
                  <td className="px-4 py-3 text-xs max-w-[200px] truncate" style={{ color: 'var(--text-2)' }}>{j.description}</td>
                  <td className="px-4 py-3"><StatusChip status={j.status} size="sm" /></td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold capitalize" style={{ color: PRIORITY_COLOR[j.priority] }}>{j.priority}</span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{j.currentStage}</td>
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
                  <td className="px-4 py-3">
                    <StatusChip
                      status={j.materialReadiness === 'ready' ? 'available' : j.materialReadiness === 'shortage' ? 'shortage' : j.materialReadiness === 'partial' ? 'partial' : 'pending'}
                      label={j.materialReadiness}
                      size="sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold" style={{ color: RISK_COLOR[status.risk] }}>{RISK_LABEL[status.risk]}</span>
                  </td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      {guided && (
                        <button type="button" onClick={() => navigate(jobNext(j).path)}
                          className="px-2 py-1 rounded-lg text-xs font-semibold text-white" style={{ background: 'var(--brand-fill)' }}>
                          {jobNext(j).label}
                        </button>
                      )}
                      {canManage && j.status !== 'complete' && (
                        <button onClick={e => handleDeleteJob(j.id, e)} className="p-1 rounded hover:bg-[var(--surface-2)]" title="Remove job"><Trash2 size={12} style={{ color: 'var(--error,#DC2626)' }} /></button>
                      )}
                      <ChevronRight size={14} style={{ color: 'var(--text-3)' }} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {sortedJobs.length === 0 && (
              <tr><td colSpan={11} className="px-4 py-10 text-center text-sm" style={{ color: 'var(--text-3)' }}>No jobs found</td></tr>
            )}
          </tbody>
        </table>
      </div>

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

function NewJobModal({ onClose, onSave }: { onClose: () => void; onSave: (j: Job) => void }) {
  const { customerPos } = useStore();
  const [form, setForm] = useState({
    customerId: '', customerName: '', description: '', plannedEnd: '', priority: 'normal' as Job['priority'],
    linkedPoRef: '', orderedQty: '', bufferPct: '5',
    siteId: DEFAULT_SITE_ID, siteName: DEFAULT_SITE_NAME,
  });
  const [err, setErr] = useState('');
  const orderedQtyNum = Number(form.orderedQty) || 0;
  const bufferPctNum = Number(form.bufferPct) || 5;
  const plannedQty = orderedQtyNum > 0 ? Math.ceil(orderedQtyNum * (1 + bufferPctNum / 100)) : 0;
  const save = () => {
    if (!form.customerId || !form.description || !form.plannedEnd) { setErr('Customer, description and planned end date required'); return; }
    const id = `job-${Date.now()}`;
    const num = `J-${String(Math.floor(Math.random() * 900 + 110))}`;
    const defaultStages: JobStage[] = [
      { id: `${id}-s1`, jobId: id, name: 'Material Preparation', sequence: 1, status: 'pending', plannedStart: DEMO_NOW, plannedEnd: form.plannedEnd, inputQty: plannedQty || 0, completedGoodQty: 0, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'pcs' },
      { id: `${id}-s2`, jobId: id, name: 'Fabrication', sequence: 2, status: 'pending', plannedStart: DEMO_NOW, plannedEnd: form.plannedEnd, inputQty: plannedQty || 0, completedGoodQty: 0, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'pcs' },
      { id: `${id}-s3`, jobId: id, name: 'QC Inspection', sequence: 3, status: 'pending', plannedStart: DEMO_NOW, plannedEnd: form.plannedEnd, inputQty: plannedQty || 0, completedGoodQty: 0, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'pcs' },
    ];
    onSave({ id, jobNumber: num, customerId: form.customerId, customerName: form.customerName, description: form.description, status: 'active', priority: form.priority, plannedStart: DEMO_NOW, plannedEnd: form.plannedEnd, siteId: form.siteId, siteName: form.siteName, owner: 'Owner', stages: defaultStages, currentStage: 'Material Preparation', materialReadiness: 'pending', hasBlocker: false });
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

