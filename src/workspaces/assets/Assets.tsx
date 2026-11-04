import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, AlertTriangle, ChevronRight, Wrench, Search } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';
import clsx from 'clsx';

export default function Assets() {
  const { assets, maintenanceEvents, currentUser } = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'assets' | 'maintenance'>('assets');
  const [search, setSearch] = useState('');

  const breakdowns = assets.filter(a => a.status === 'breakdown').length;
  const pmOverdue = assets.filter(a => a.status === 'pm_overdue').length;
  const inMaint = assets.filter(a => a.status === 'in_maintenance').length;
  const openEvents = maintenanceEvents.filter(m => m.status !== 'closed').length;

  const filteredAssets = assets.filter(a => !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.assetCode.toLowerCase().includes(search.toLowerCase()));
  const filteredME = maintenanceEvents.filter(m => !search || m.eventNumber.toLowerCase().includes(search.toLowerCase()) || m.assetName.toLowerCase().includes(search.toLowerCase()));

  const canCreate = ['owner', 'maintenance', 'supervisor'].includes(currentUser.role);

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-[var(--text)]">Assets & Maintenance</h1>
          <div className="flex items-center gap-3 mt-0.5">
            <p className="text-sm text-[var(--text-2)]">{assets.length} assets</p>
            {breakdowns > 0 && <span className="flex items-center gap-1 text-xs text-[var(--error)] font-semibold"><AlertTriangle size={12} /> {breakdowns} breakdown</span>}
            {pmOverdue > 0 && <span className="text-xs text-[var(--warning)] font-semibold">{pmOverdue} PM overdue</span>}
          </div>
        </div>
        {canCreate && (
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--brand)] text-white rounded-lg text-sm font-medium">
            <Plus size={16} /> Log Event
          </button>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <KpiTile label="Total Assets" value={assets.length} />
        <KpiTile label="Breakdown" value={breakdowns} accent={breakdowns > 0 ? 'error' : 'neutral'} />
        <KpiTile label="PM Overdue" value={pmOverdue} accent={pmOverdue > 0 ? 'warning' : 'neutral'} />
        <KpiTile label="Open Events" value={openEvents} accent={openEvents > 0 ? 'warning' : 'neutral'} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('assets')} className={clsx('px-4 py-2 rounded-lg text-sm transition-colors', tab === 'assets' ? 'bg-[var(--brand)] text-white' : 'border border-[var(--border)] text-[var(--text-2)]')}>
          Assets ({assets.length})
        </button>
        <button onClick={() => setTab('maintenance')} className={clsx('px-4 py-2 rounded-lg text-sm transition-colors', tab === 'maintenance' ? 'bg-[var(--brand)] text-white' : 'border border-[var(--border)] text-[var(--text-2)]')}>
          Maintenance Events ({maintenanceEvents.length})
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search assets, events…" className="w-full pl-9 pr-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] placeholder:text-[var(--text-3)] focus:outline-none focus:border-[var(--brand)]" />
      </div>

      {tab === 'assets' && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="eoss-table">
              <thead>
                <tr><th>Code</th><th>Asset</th><th>Category</th><th>Work Centre</th><th>Criticality</th><th>Meter</th><th>Last Service</th><th>Next Service</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {filteredAssets.map(a => (
                  <tr key={a.id} className={clsx('cursor-pointer', a.status === 'breakdown' ? 'bg-[var(--error-bg)]' : a.status === 'pm_overdue' ? 'bg-[var(--warning-bg)]' : '')} onClick={() => navigate(`/assets/${a.id}`)}>
                    <td><span className="font-mono text-xs font-semibold text-[var(--brand)]">{a.assetCode}</span></td>
                    <td>
                      <div className="text-sm font-medium text-[var(--text)]">{a.name}</div>
                      <div className="text-[11px] text-[var(--text-3)]">{a.manufacturer} {a.model}</div>
                    </td>
                    <td className="text-sm text-[var(--text-2)]">{a.category}</td>
                    <td className="text-sm text-[var(--text-2)]">{a.workCentre ?? '—'}</td>
                    <td>
                      <span className={clsx('text-xs font-semibold', {
                        'text-[var(--error)]': a.criticality === 'Critical',
                        'text-[var(--warning)]': a.criticality === 'High',
                        'text-[var(--info)]': a.criticality === 'Medium',
                        'text-[var(--text-3)]': a.criticality === 'Low',
                      })}>{a.criticality}</span>
                    </td>
                    <td className="text-sm text-[var(--text-2)]">{a.meterType !== 'none' && a.currentReading ? `${a.currentReading.toLocaleString()} ${a.meterType}` : '—'}</td>
                    <td className="text-sm text-[var(--text-2)]">{a.lastServiceDate ? new Date(a.lastServiceDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</td>
                    <td className={clsx('text-sm', a.status === 'pm_overdue' ? 'text-[var(--error)] font-semibold' : 'text-[var(--text-2)]')}>
                      {a.nextServiceDate ? new Date(a.nextServiceDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                    </td>
                    <td><StatusChip status={a.status} size="sm" /></td>
                    <td><ChevronRight size={14} className="text-[var(--text-3)]" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'maintenance' && (
        <div className="space-y-3">
          {filteredME.map(m => (
            <div key={m.id} className={clsx('bg-[var(--surface)] border rounded-xl p-4 cursor-pointer hover:border-[var(--brand)] transition-colors', m.type === 'Breakdown' && m.status !== 'closed' ? 'border-[var(--error)]' : 'border-[var(--border)]')} onClick={() => navigate(`/assets/me/${m.id}`)}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-xs font-semibold text-[var(--brand)]">{m.eventNumber}</span>
                    <StatusChip status={m.type.toLowerCase()} label={m.type} size="sm" />
                    <StatusChip status={m.status} size="sm" />
                    {m.severity && <span className={clsx('text-xs font-semibold', m.severity === 'High' || m.severity === 'Critical' ? 'text-[var(--error)]' : 'text-[var(--warning)]')}>{m.severity}</span>}
                  </div>
                  <div className="text-sm font-medium text-[var(--text)]">{m.assetName} <span className="text-[var(--text-3)] font-mono text-xs">({m.assetCode})</span></div>
                  <p className="text-xs text-[var(--text-2)] mt-1 line-clamp-2">{m.symptom}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-3)]">
                    <span>{m.technicianName}</span>
                    <span>·</span>
                    <span>{new Date(m.downtimeStart).toLocaleDateString('en-IN')}</span>
                    {m.affectedJobs.length > 0 && <><span>·</span><span className="text-[var(--error)]">{m.affectedJobs.length} jobs affected</span></>}
                  </div>
                </div>
                <ChevronRight size={14} className="text-[var(--text-3)] flex-shrink-0 mt-1" />
              </div>
            </div>
          ))}
          {filteredME.length === 0 && <div className="text-center py-10 text-sm text-[var(--text-3)]">No maintenance events found</div>}
        </div>
      )}
    </div>
  );
}

function KpiTile({ label, value, accent = 'neutral' }: { label: string; value: number; accent?: string }) {
  const color = { error: 'var(--error)', success: 'var(--success)', info: 'var(--info)', warning: 'var(--warning)', neutral: 'var(--text)' }[accent] ?? 'var(--text)';
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
      <div className="text-xl font-bold" style={{ color }}>{value}</div>
      <div className="text-xs text-[var(--text-2)] mt-0.5">{label}</div>
    </div>
  );
}
