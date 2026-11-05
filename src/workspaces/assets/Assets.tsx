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
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex-shrink-0 flex items-center gap-3 px-5 py-3 border-b flex-wrap" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search assets, events…"
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border outline-none"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text)' }} />
        </div>
        <div className="flex-1" />
        {breakdowns > 0 && <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: 'var(--error-bg,#FEF2F2)', color: 'var(--error,#DC2626)' }}><AlertTriangle size={12} /> {breakdowns} breakdown</span>}
        {pmOverdue > 0 && <span className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: 'var(--warning-bg,#FFFBEB)', color: 'var(--warning,#D97706)' }}>{pmOverdue} PM overdue</span>}
        {canCreate && (
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: 'var(--brand)' }}>
            <Plus size={13} /> Log Event
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 flex items-center border-b px-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        {([['assets', `Assets (${assets.length})`], ['maintenance', `Maintenance Events (${maintenanceEvents.length})`]] as [string, string][]).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id as any)}
            className="relative px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap"
            style={{ color: tab === id ? 'var(--brand)' : 'var(--text-2)' }}>
            {label}
            {tab === id && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full" style={{ background: 'var(--brand)' }} />}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
      {tab === 'assets' && (
        <table className="w-full text-sm border-separate border-spacing-0" style={{ minWidth: 900 }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 5 }}>
            <tr style={{ background: 'var(--surface-muted,#F8F9FC)' }}>
              {['Code', 'Asset', 'Category', 'Work Centre', 'Criticality', 'Meter', 'Last Service', 'Next Service', 'Status', ''].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)', borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredAssets.map(a => (
              <tr key={a.id} className="cursor-pointer"
                style={{ borderBottom: '1px solid var(--border)', background: a.status === 'breakdown' ? 'var(--error-bg,#FEF2F2)' : a.status === 'pm_overdue' ? 'var(--warning-bg,#FFFBEB)' : 'var(--surface)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-muted,#F8F9FC)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = a.status === 'breakdown' ? 'var(--error-bg,#FEF2F2)' : a.status === 'pm_overdue' ? 'var(--warning-bg,#FFFBEB)' : 'var(--surface)'; }}
                onClick={() => navigate(`/assets/${a.id}`)}>
                <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: 'var(--brand)' }}>{a.assetCode}</td>
                <td className="px-4 py-3">
                  <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>{a.name}</div>
                  <div className="text-[11px]" style={{ color: 'var(--text-3)' }}>{a.manufacturer} {a.model}</div>
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{a.category}</td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{a.workCentre ?? '—'}</td>
                <td className="px-4 py-3 text-xs font-semibold" style={{ color: a.criticality === 'Critical' ? 'var(--error,#DC2626)' : a.criticality === 'High' ? 'var(--warning,#D97706)' : 'var(--text-3)' }}>{a.criticality}</td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{a.meterType !== 'none' && a.currentReading ? `${a.currentReading.toLocaleString()} ${a.meterType}` : '—'}</td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{a.lastServiceDate ? new Date(a.lastServiceDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</td>
                <td className="px-4 py-3 text-xs" style={{ color: a.status === 'pm_overdue' ? 'var(--error,#DC2626)' : 'var(--text-2)', fontWeight: a.status === 'pm_overdue' ? 600 : undefined }}>
                  {a.nextServiceDate ? new Date(a.nextServiceDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                </td>
                <td className="px-4 py-3"><StatusChip status={a.status} size="sm" /></td>
                <td className="px-4 py-3"><ChevronRight size={14} style={{ color: 'var(--text-3)' }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === 'maintenance' && (
        <div className="p-5 space-y-3 max-w-4xl">
          {filteredME.map(m => (
            <div key={m.id} className="rounded-xl border p-4 cursor-pointer hover:opacity-90 transition-opacity"
              style={{ borderColor: (m.type === 'Breakdown' && m.status !== 'closed') ? 'var(--error,#DC2626)' : 'var(--border)', background: 'var(--surface)' }}
              onClick={() => navigate(`/assets/me/${m.id}`)}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-xs font-bold" style={{ color: 'var(--brand)' }}>{m.eventNumber}</span>
                    <StatusChip status={m.type.toLowerCase()} label={m.type} size="sm" />
                    <StatusChip status={m.status} size="sm" />
                  </div>
                  <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>{m.assetName} <span className="font-mono text-xs" style={{ color: 'var(--text-3)' }}>({m.assetCode})</span></div>
                  <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-2)' }}>{m.symptom}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: 'var(--text-3)' }}>
                    <span>{m.technicianName}</span><span>·</span>
                    <span>{new Date(m.downtimeStart).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    {m.affectedJobs.length > 0 && <><span>·</span><span style={{ color: 'var(--error,#DC2626)' }}>{m.affectedJobs.length} jobs affected</span></>}
                  </div>
                </div>
                <ChevronRight size={14} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
              </div>
            </div>
          ))}
          {filteredME.length === 0 && <div className="text-center py-10 text-sm" style={{ color: 'var(--text-3)' }}>No maintenance events found</div>}
        </div>
      )}
      </div>
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
