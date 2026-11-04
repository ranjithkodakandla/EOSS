import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, AlertTriangle, Search, Filter, ChevronRight } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';
import clsx from 'clsx';

const PRIORITY_COLOR: Record<string, string> = {
  urgent: 'var(--error)', high: 'var(--warning)', normal: 'var(--info)', low: 'var(--text-3)'
};

export default function Jobs() {
  const { jobs, currentUser } = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [view, setView] = useState<'board' | 'list'>('list');

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
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-[var(--text)]">Job Board</h1>
          <p className="text-sm text-[var(--text-2)]">{jobs.length} jobs · {statusCounts.active} active</p>
        </div>
        {(currentUser.role === 'owner' || currentUser.role === 'supervisor' || currentUser.role === 'sales') && (
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--brand)] text-white rounded-lg text-sm font-medium hover:bg-[var(--brand-700)] transition-colors">
            <Plus size={16} /> New Job
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search job number, customer, description…"
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] placeholder:text-[var(--text-3)] focus:outline-none focus:border-[var(--brand)]"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {Object.entries(statusCounts).map(([s, count]) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={clsx('px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors capitalize',
                statusFilter === s ? 'bg-[var(--brand)] text-white' : 'border border-[var(--border)] text-[var(--text-2)] hover:bg-[var(--surface-2)]'
              )}
            >
              {s} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="eoss-table">
            <thead>
              <tr>
                <th>Job #</th>
                <th>Customer</th>
                <th>Description</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Stage</th>
                <th>Planned End</th>
                <th>Material</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(j => {
                const dl = daysLeft(j.plannedEnd);
                const isLate = dl < 0 && j.status !== 'complete';
                return (
                  <tr key={j.id} className="cursor-pointer" onClick={() => navigate(`/jobs/${j.id}`)}>
                    <td>
                      <div className="flex items-center gap-2">
                        {j.hasBlocker && <span title="Has blocker"><AlertTriangle size={13} className="text-[var(--error)] flex-shrink-0" /></span>}
                        <span className="font-mono text-xs font-semibold text-[var(--brand)]">{j.jobNumber}</span>
                      </div>
                    </td>
                    <td className="text-sm text-[var(--text)]">{j.customerName}</td>
                    <td className="text-sm text-[var(--text-2)] max-w-[200px] truncate">{j.description}</td>
                    <td><StatusChip status={j.status} /></td>
                    <td>
                      <span className="text-xs font-semibold capitalize" style={{ color: PRIORITY_COLOR[j.priority] }}>
                        {j.priority}
                      </span>
                    </td>
                    <td className="text-sm text-[var(--text-2)]">{j.currentStage}</td>
                    <td>
                      <span className={clsx('text-xs', isLate ? 'text-[var(--error)] font-semibold' : 'text-[var(--text-2)]')}>
                        {new Date(j.plannedEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        {isLate && ` (${Math.abs(dl)}d late)`}
                        {!isLate && j.status !== 'complete' && dl <= 3 && ` (${dl}d left)`}
                      </span>
                    </td>
                    <td>
                      <StatusChip
                        status={j.materialReadiness === 'ready' ? 'available' : j.materialReadiness === 'shortage' ? 'shortage' : j.materialReadiness === 'partial' ? 'partial' : 'pending'}
                        label={j.materialReadiness}
                        size="sm"
                      />
                    </td>
                    <td><ChevronRight size={14} className="text-[var(--text-3)]" /></td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="text-center py-10 text-sm text-[var(--text-3)]">No jobs found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
