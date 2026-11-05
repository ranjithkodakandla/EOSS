import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, AlertTriangle, Search, Filter, ChevronRight, X } from 'lucide-react';
import { useStore, CUSTOMERS } from '../../store';
import StatusChip from '../../components/layout/StatusChip';
import clsx from 'clsx';
import type { Job, JobStage } from '../../types';

const PRIORITY_COLOR: Record<string, string> = {
  urgent: 'var(--error)', high: 'var(--warning)', normal: 'var(--info)', low: 'var(--text-3)'
};

export default function Jobs() {
  const { jobs, currentUser, addJob, showToast } = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [view, setView] = useState<'board' | 'list'>('list');
  const [showNewJob, setShowNewJob] = useState(false);

  const filtered = jobs.filter(j => {
    const matchSearch = !search || j.jobNumber.toLowerCase().includes(search.toLowerCase()) ||
      j.customerName.toLowerCase().includes(search.toLowerCase()) ||
      j.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || j.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusCounts = {
    all: jobs.length,
    active: jobs.filter(j => j.status === 'active').length,
    hold: jobs.filter(j => j.status === 'hold').length,
    complete: jobs.filter(j => j.status === 'complete').length,
  };

  const daysLeft = (end: string) => {
    const diff = new Date(end).getTime() - Date.now();
    return Math.ceil(diff / 86400000);
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
            style={{ background: 'var(--brand)' }}>
            <Plus size={13} /> New Job
          </button>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm border-separate border-spacing-0" style={{ minWidth: 800 }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 5 }}>
              <tr style={{ background: 'var(--surface-muted,#F8F9FC)' }}>
                {['Job #', 'Customer', 'Description', 'Status', 'Priority', 'Stage', 'Planned End', 'Material', ''].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(j => {
                const dl = daysLeft(j.plannedEnd);
                const isLate = dl < 0 && j.status !== 'complete';
                return (
                  <tr key={j.id} className="cursor-pointer" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-muted,#F8F9FC)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}
                    onClick={() => navigate(`/jobs/${j.id}`)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {j.hasBlocker && <AlertTriangle size={13} style={{ color: 'var(--error,#DC2626)', flexShrink: 0 }} />}
                        <span className="font-mono text-xs font-bold" style={{ color: 'var(--brand)' }}>{j.jobNumber}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text)' }}>{j.customerName}</td>
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
                    <td className="px-4 py-3">
                      <StatusChip status={j.materialReadiness === 'ready' ? 'available' : j.materialReadiness === 'shortage' ? 'shortage' : j.materialReadiness === 'partial' ? 'partial' : 'pending'} label={j.materialReadiness} size="sm" />
                    </td>
                    <td className="px-4 py-3"><ChevronRight size={14} style={{ color: 'var(--text-3)' }} /></td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-sm" style={{ color: 'var(--text-3)' }}>No jobs found</td></tr>
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
  const [form, setForm] = useState({ customerId: '', customerName: '', description: '', plannedEnd: '', priority: 'normal' as Job['priority'] });
  const [err, setErr] = useState('');
  const save = () => {
    if (!form.customerId || !form.description || !form.plannedEnd) { setErr('Customer, description and planned end date required'); return; }
    const id = `job-${Date.now()}`;
    const num = `J-${String(Math.floor(Math.random() * 900 + 110))}`;
    const defaultStages: JobStage[] = [
      { id: `${id}-s1`, jobId: id, name: 'Material Preparation', sequence: 1, status: 'pending', plannedStart: '2026-11-05', plannedEnd: form.plannedEnd, inputQty: 0, completedGoodQty: 0, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'pcs' },
      { id: `${id}-s2`, jobId: id, name: 'Fabrication', sequence: 2, status: 'pending', plannedStart: '2026-11-05', plannedEnd: form.plannedEnd, inputQty: 0, completedGoodQty: 0, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'pcs' },
      { id: `${id}-s3`, jobId: id, name: 'QC Inspection', sequence: 3, status: 'pending', plannedStart: '2026-11-05', plannedEnd: form.plannedEnd, inputQty: 0, completedGoodQty: 0, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'pcs' },
    ];
    onSave({ id, jobNumber: num, customerId: form.customerId, customerName: form.customerName, description: form.description, status: 'active', priority: form.priority, plannedStart: '2026-11-05', plannedEnd: form.plannedEnd, siteId: 'site-1', siteName: 'Main Plant', owner: 'Owner', stages: defaultStages, currentStage: 'Material Preparation', materialReadiness: 'pending', hasBlocker: false });
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-[var(--text)]">New Job</h3>
          <button onClick={onClose}><X size={16} className="text-[var(--text-3)]" /></button>
        </div>
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
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Job Description *</label>
            <input className="eoss-input w-full" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Fabrication of 10 MS Frames" />
          </div>
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
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[var(--border)] rounded-xl text-sm text-[var(--text-2)]">Cancel</button>
          <button onClick={save} className="flex-1 py-2.5 bg-[var(--brand)] text-white rounded-xl text-sm font-medium">Create Job</button>
        </div>
      </div>
    </div>
  );
}
