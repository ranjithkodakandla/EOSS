import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, AlertTriangle, ChevronRight, Wrench, Search, X, Archive, Pencil } from 'lucide-react';
import { useStore } from '../../store';
import { computeMaintenanceDue } from '../../domain/maintenanceDue';
import { maintenanceDueSoon, maintenanceOverdue } from '../../domain/recordLists';
import { DEMO_NOW } from '../../data/seed';
import StatusChip from '../../components/layout/StatusChip';
import clsx from 'clsx';
import type { Asset, MaintenanceEvent } from '../../types';

export default function Assets() {
  const { assets, sites, maintenanceEvents, meterReadings, currentUser, addAsset, archiveAsset, addMaintenanceEvent, updateAsset, showToast } = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const focusParam = searchParams.get('focus');
  const [tab, setTab] = useState<'assets' | 'maintenance'>('assets');
  const [search, setSearch] = useState('');
  const [focus, setFocus] = useState<'all' | 'breakdown' | 'overdue' | 'due'>(
    focusParam === 'breakdown' || focusParam === 'overdue' || focusParam === 'due' ? focusParam : 'all'
  );
  const logParam = searchParams.get('log');
  const editParam = searchParams.get('edit');
  const [showLogEvent, setShowLogEvent] = useState(!!logParam);
  const [logAssetId, setLogAssetId] = useState<string | undefined>(logParam ?? undefined);
  const [showAssetForm, setShowAssetForm] = useState(!!editParam);
  const [editingAssetId, setEditingAssetId] = useState<string | undefined>(editParam ?? undefined);
  const [showArchived, setShowArchived] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<Asset | null>(null);
  useEffect(() => {
    if (!logParam) return;
    setLogAssetId(logParam);
    setShowLogEvent(true);
  }, [logParam]);
  useEffect(() => {
    if (editParam) { setEditingAssetId(editParam); setShowAssetForm(true); }
  }, [editParam]);
  const canManage = ['owner', 'maintenance', 'supervisor'].includes(currentUser.role);

  const handleArchiveAsset = (asset: Asset, e: React.MouseEvent) => {
    e.stopPropagation();
    const hasOpenEvents = maintenanceEvents.some(m => m.assetId === asset.id && m.status !== 'closed');
    if (hasOpenEvents) { showToast({ type: 'error', title: 'Cannot archive asset', body: 'Close open maintenance events before archiving this asset.' }); return; }
    setArchiveTarget(asset);
  };

  const now = new Date(DEMO_NOW);
  const dueByAsset = Object.fromEntries(assets.map(a => [a.id, computeMaintenanceDue(a, meterReadings, now)]));

  const liveAssets = assets.filter(a => showArchived || !a.archivedAt);
  const breakdowns = liveAssets.filter(a => a.status === 'breakdown').length;
  const pmOverdue = maintenanceOverdue(liveAssets, meterReadings, now).length;
  const upcoming = maintenanceDueSoon(liveAssets, meterReadings, now).length;
  const inMaint = assets.filter(a => a.status === 'in_maintenance').length;
  const openEvents = maintenanceEvents.filter(m => m.status !== 'closed').length;

  const filteredAssets = liveAssets.filter(a => {
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.assetCode.toLowerCase().includes(search.toLowerCase())) return false;
    const due = dueByAsset[a.id];
    if (focus === 'breakdown') return a.status === 'breakdown';
    if (focus === 'overdue') return maintenanceOverdue([a], meterReadings, now).length > 0;
    if (focus === 'due') return maintenanceDueSoon([a], meterReadings, now).length > 0;
    return true;
  });
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
        {breakdowns > 0 && (
          <button type="button" onClick={() => { setTab('assets'); setFocus(focus === 'breakdown' ? 'all' : 'breakdown'); }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border"
            style={{ background: 'var(--error-bg,#FEF2F2)', color: 'var(--error,#DC2626)', borderColor: focus === 'breakdown' ? 'var(--error,#DC2626)' : 'transparent' }}>
            <AlertTriangle size={12} /> {breakdowns} breakdown
          </button>
        )}
        {pmOverdue > 0 && (
          <button type="button" onClick={() => { setTab('assets'); setFocus(focus === 'overdue' ? 'all' : 'overdue'); }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
            style={{ background: 'var(--warning-bg,#FFFBEB)', color: 'var(--warning,#D97706)', borderColor: focus === 'overdue' ? 'var(--warning,#D97706)' : 'transparent' }}>
            {pmOverdue} overdue
          </button>
        )}
        {upcoming > 0 && (
          <button type="button" onClick={() => { setTab('assets'); setFocus(focus === 'due' ? 'all' : 'due'); }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
            style={{ background: 'var(--surface)', color: 'var(--text-2)', borderColor: focus === 'due' ? 'var(--brand)' : 'var(--border)' }}>
            {upcoming} due soon
          </button>
        )}
        {canCreate && (
          <div className="flex items-center gap-2">
            <button onClick={() => { setEditingAssetId(undefined); setShowAssetForm(true); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border" style={{ borderColor: 'var(--brand)', color: 'var(--brand)' }}>
              <Plus size={13} /> Add Asset
            </button>
            <button onClick={() => setShowLogEvent(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: 'var(--brand-fill)' }}>
              <Wrench size={13} /> Log Event
            </button>
          </div>
        )}
        {assets.some(a => a.archivedAt) && <button onClick={() => setShowArchived(v => !v)} className="btn-ghost text-xs">{showArchived ? 'Hide archived' : `Show archived (${assets.filter(a => a.archivedAt).length})`}</button>}
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 flex items-center border-b px-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        {([['assets', `Assets (${filteredAssets.length})`], ['maintenance', `Maintenance Events (${filteredME.length})`]] as [string, string][]).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id as any)}
            className="relative px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap"
            style={{ color: tab === id ? 'var(--brand)' : 'var(--text-2)' }}>
            {label}
            {tab === id && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full" style={{ background: 'var(--brand-fill)' }} />}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
      {(focus === 'overdue' || focus === 'due') && (
        <div className="px-4 py-2 text-sm border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
          {focus === 'overdue' ? 'These assets are overdue. Schedule a service, or complete an open work order.' : 'These assets are due soon. Schedule the service.'}
        </div>
      )}
      {tab === 'assets' && (
        <>
        <div className="md:hidden p-3 space-y-2">
          {filteredAssets.map(a => {
            const due = dueByAsset[a.id];
            const metricUnit = a.meterType && a.meterType !== 'none' ? a.meterType : 'metric';
            const next = due?.drivingCondition === 'hours' && due.remainingHours != null
              ? `${due.remainingHours} ${metricUnit} left`
              : a.nextServiceDate
                ? new Date(a.nextServiceDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                : 'No service date';
            return (
              <div key={a.id} onClick={() => navigate(`/assets/${a.id}`)}
                className="w-full text-left rounded-xl border p-3 cursor-pointer"
                style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold" style={{ color: 'var(--brand)' }}>{a.assetCode}</span>
                  <StatusChip status={a.status} size="sm" />
                </div>
                <div className="text-sm font-semibold text-[var(--text)] mt-1">{a.name}</div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-xs text-[var(--text-2)]">{a.workCentre ?? a.category} · next {next}</span>
                  {(focus === 'overdue' || focus === 'due') && (
                    <AssetAction asset={a} events={maintenanceEvents} onSchedule={id => { setLogAssetId(id); setShowLogEvent(true); }} onComplete={id => navigate(`/assets/me/${id}`)} />
                  )}
                </div>
              </div>
            );
          })}
          {filteredAssets.length === 0 && <p className="text-center py-8 text-sm" style={{ color: 'var(--text-3)' }}>No assets match</p>}
        </div>
        <table className="hidden md:table w-full text-sm border-separate border-spacing-0" style={{ minWidth: 900 }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 5 }}>
            <tr style={{ background: 'var(--surface-2)' }}>
              {['Code', 'Asset', 'Category', 'Work Centre', 'Criticality', 'Meter', 'Last Service', 'Next Service', 'Status', ''].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold font-medium" style={{ color: 'var(--text-3)', borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredAssets.map(a => (
              <tr key={a.id} className="cursor-pointer"
                style={{ borderBottom: '1px solid var(--border)', background: a.status === 'breakdown' ? 'var(--error-bg,#FEF2F2)' : a.status === 'pm_overdue' ? 'var(--warning-bg,#FFFBEB)' : 'var(--surface)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
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
                <td className="px-4 py-3">
                  {(() => {
                    const due = dueByAsset[a.id];
                    if (due?.drivingCondition === 'hours' && due.remainingHours != null) {
                      const metricUnit = a.meterType && a.meterType !== 'none' ? a.meterType : 'metric';
                      const overdue = due.status === 'overdue';
                      const soon = due.status === 'due' || due.status === 'upcoming';
                      return (
                        <div>
                          <div className="text-xs" style={{ color: overdue ? 'var(--error,#DC2626)' : 'var(--text-2)', fontWeight: overdue ? 600 : undefined }}>
                            {due.remainingHours} {metricUnit} left
                          </div>
                          <div className="text-[10px] mt-0.5" style={{ color: overdue ? 'var(--error,#DC2626)' : soon ? 'var(--warning,#D97706)' : 'var(--text-3)' }}>
                            {overdue ? `Overdue by ${Math.abs(due.remainingHours)} ${metricUnit}` : `Next at ${due.nextDueReading} ${metricUnit}`}
                          </div>
                        </div>
                      );
                    }
                    if (!a.nextServiceDate) return <span className="text-xs" style={{ color: 'var(--text-3)' }}>—</span>;
                    const days = Math.round((new Date(a.nextServiceDate).getTime() - new Date(DEMO_NOW).getTime()) / 86400000);
                    return (
                      <div>
                        <div className="text-xs" style={{ color: a.status === 'pm_overdue' ? 'var(--error,#DC2626)' : 'var(--text-2)', fontWeight: a.status === 'pm_overdue' ? 600 : undefined }}>
                          {new Date(a.nextServiceDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </div>
                        <div className="text-[10px] mt-0.5" style={{ color: days < 0 ? 'var(--error,#DC2626)' : days <= 7 ? 'var(--warning,#D97706)' : 'var(--text-3)' }}>
                          {days < 0 ? `Overdue by ${-days}d` : days === 0 ? 'Due today' : `Due in ${days}d`}
                        </div>
                      </div>
                    );
                  })()}
                </td>
                <td className="px-4 py-3"><StatusChip status={a.status} size="sm" /></td>
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-1">
                    {(focus === 'overdue' || focus === 'due') && (
                      <AssetAction asset={a} events={maintenanceEvents} onSchedule={id => { setLogAssetId(id); setShowLogEvent(true); }} onComplete={id => navigate(`/assets/me/${id}`)} />
                    )}
                    {canManage && !a.archivedAt && <button onClick={e => handleArchiveAsset(a, e)} className="p-1 rounded hover:bg-[var(--surface-2)]" title="Archive asset"><Archive size={12} style={{ color: 'var(--error,#DC2626)' }} /></button>}
                    {canManage && !a.archivedAt && <button onClick={e => { e.stopPropagation(); setEditingAssetId(a.id); setShowAssetForm(true); }} className="p-1 rounded hover:bg-[var(--surface-2)]" title="Edit asset"><Pencil size={12} style={{ color: 'var(--brand)' }} /></button>}
                    <ChevronRight size={14} style={{ color: 'var(--text-3)' }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </>
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

      {showLogEvent && (
        <LogEventModal
          initialAssetId={logAssetId}
          assets={assets}
          onClose={() => setShowLogEvent(false)}
          onSave={(event) => {
            addMaintenanceEvent(event);
            showToast({ type: 'success', title: 'Event logged', body: `${event.eventNumber} has been opened.` });
            setShowLogEvent(false);
            setTab('maintenance');
          }}
        />
      )}
      {showAssetForm && (
        <AssetFormModal
          asset={editingAssetId ? assets.find(a => a.id === editingAssetId) : undefined}
          sites={sites}
          onClose={() => { setShowAssetForm(false); setEditingAssetId(undefined); }}
          onSave={asset => {
            if (editingAssetId) updateAsset(editingAssetId, asset);
            else addAsset(asset as Asset);
            showToast({ type: 'success', title: editingAssetId ? 'Asset updated' : 'Asset added', body: `${asset.assetCode} is now available in Maintenance.` });
            setShowAssetForm(false); setEditingAssetId(undefined);
          }}
        />
      )}
      {archiveTarget && (
        <ArchiveAssetModal asset={archiveTarget} onClose={() => setArchiveTarget(null)} onConfirm={reason => { archiveAsset(archiveTarget.id, reason, currentUser.name); setArchiveTarget(null); }} />
      )}
    </div>
  );
}

function AssetAction({ asset, events, onSchedule, onComplete }: {
  asset: { id: string };
  events: { id: string; assetId: string; status: string }[];
  onSchedule: (id: string) => void;
  onComplete: (id: string) => void;
}) {
  const open = events.find(m => m.assetId === asset.id && m.status !== 'closed');
  if (open) {
    return (
      <button type="button" onClick={e => { e.stopPropagation(); onComplete(open.id); }}
        className="px-2 py-1 rounded-lg text-xs font-semibold text-white" style={{ background: 'var(--brand-fill)' }}>
        Complete
      </button>
    );
  }
  return (
    <button type="button" onClick={e => { e.stopPropagation(); onSchedule(asset.id); }}
      className="px-2 py-1 rounded-lg text-xs font-semibold text-white" style={{ background: 'var(--brand-fill)' }}>
      Schedule
    </button>
  );
}

function LogEventModal({ assets, initialAssetId, onClose, onSave }: { assets: { id: string; name: string; assetCode: string }[]; initialAssetId?: string; onClose: () => void; onSave: (e: MaintenanceEvent) => void }) {
  const [form, setForm] = useState({ assetId: initialAssetId || '', type: (initialAssetId ? 'Preventive' : 'Breakdown') as MaintenanceEvent['type'], symptom: initialAssetId ? 'Scheduled service from overdue maintenance' : '', technicianName: '', severity: 'Medium' as NonNullable<MaintenanceEvent['severity']> });
  const [barcodeInput, setBarcodeInput] = useState('');
  const [err, setErr] = useState('');
  const handleBarcodeScan = (code: string) => {
    const found = assets.find(a => a.assetCode === code.trim() || a.id === code.trim());
    if (found) { setForm(f => ({ ...f, assetId: found.id })); setBarcodeInput(''); }
    else setBarcodeInput(code + ' — not found');
  };
  const save = () => {
    if (!form.assetId || !form.symptom || !form.technicianName) { setErr('Asset, symptom and technician are required'); return; }
    const asset = assets.find(a => a.id === form.assetId);
    if (!asset) return;
    const id = `me-${Date.now()}`;
    const num = `ME-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900 + 100))}`;
    onSave({ id, eventNumber: num, type: form.type, assetId: form.assetId, assetName: asset.name, assetCode: asset.assetCode, severity: form.severity, symptom: form.symptom, technicianId: 'usr-demo', technicianName: form.technicianName, downtimeStart: '2026-11-05', status: 'open', affectedJobs: [], sparesUsed: [] });
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-[var(--text)]">Log Maintenance Event</h3>
          <button onClick={onClose}><X size={16} className="text-[var(--text-3)]" /></button>
        </div>
        <div className="space-y-3">
          <p className="text-xs text-[var(--text-2)] rounded-lg p-2.5" style={{ background: 'var(--surface-2)' }}>Log Event records a maintenance occurrence and its closure history. Asset setup and maintenance schedules are managed in Add / Edit Asset.</p>
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Scan / Enter Asset Tag</label>
            <div className="flex gap-2">
              <input className="eoss-input flex-1" placeholder="EOSS-ASSET-HYD-0042 or asset code" value={barcodeInput} onChange={e => setBarcodeInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleBarcodeScan(barcodeInput)} />
              <button onClick={() => handleBarcodeScan(barcodeInput)} className="px-3 py-1.5 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-xs text-[var(--text-2)] hover:border-[var(--brand)]">Scan</button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Asset *</label>
            <select className="eoss-input w-full" value={form.assetId} onChange={e => setForm(f => ({ ...f, assetId: e.target.value }))}>
              <option value="">Select an asset…</option>
              {assets.map(a => <option key={a.id} value={a.id}>{a.name} ({a.assetCode})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Type</label>
              <select className="eoss-input w-full" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as MaintenanceEvent['type'] }))}>
                {(['Breakdown', 'Preventive', 'Corrective'] as const).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Severity</label>
              <select className="eoss-input w-full" value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value as NonNullable<MaintenanceEvent['severity']> }))}>
                {(['Low', 'Medium', 'High', 'Critical'] as const).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Symptom / Description *</label>
            <input className="eoss-input w-full" value={form.symptom} onChange={e => setForm(f => ({ ...f, symptom: e.target.value }))} placeholder="Describe the issue" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Technician *</label>
            <input className="eoss-input w-full" value={form.technicianName} onChange={e => setForm(f => ({ ...f, technicianName: e.target.value }))} placeholder="Technician name" />
          </div>
        </div>
        {err && <p className="text-xs text-[var(--danger)] mt-2">{err}</p>}
        <div className="flex gap-3 mt-5">
          <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center">Cancel</button>
          <button onClick={save} className="flex-1 py-2.5 bg-[var(--brand-fill)] text-white rounded-xl text-sm font-medium">Log Event</button>
        </div>
      </div>
    </div>
  );
}

function AssetFormModal({ asset, sites, onClose, onSave }: { asset?: Asset; sites: { id: string; name: string }[]; onClose: () => void; onSave: (data: Partial<Asset>) => void }) {
  const [form, setForm] = useState({
    assetCode: asset?.assetCode ?? '', name: asset?.name ?? '', category: asset?.category ?? '', siteId: asset?.siteId ?? sites[0]?.id ?? '',
    workCentre: asset?.workCentre ?? '', criticality: asset?.criticality ?? 'Medium' as Asset['criticality'], status: asset?.status ?? 'operational' as Asset['status'],
    manufacturer: asset?.manufacturer ?? '', model: asset?.model ?? '', meterType: asset?.meterType ?? 'none' as NonNullable<Asset['meterType']>,
    currentReading: asset?.currentReading?.toString() ?? '', nextServiceDate: asset?.nextServiceDate ?? '', pmFrequencyMetric: (asset?.pmFrequencyMetric ?? asset?.pmFrequencyHours)?.toString() ?? '',
  });
  const [err, setErr] = useState('');
  const unit = form.meterType === 'none' ? 'metric' : form.meterType;
  const save = () => {
    if (!form.assetCode.trim() || !form.name.trim() || !form.category.trim() || !form.siteId || !form.manufacturer.trim()) { setErr('Code, name, category, site and manufacturer are required'); return; }
    const site = sites.find(s => s.id === form.siteId);
    onSave({
      ...(asset ?? { id: `asset-${Date.now()}`, purchaseDate: DEMO_NOW }),
      assetCode: form.assetCode.trim(), name: form.name.trim(), category: form.category.trim(), siteId: form.siteId,
      workCentre: form.workCentre.trim() || undefined, criticality: form.criticality, status: form.status,
      manufacturer: form.manufacturer.trim(), model: form.model.trim() || undefined, meterType: form.meterType,
      currentReading: form.currentReading ? Number(form.currentReading) : undefined,
      nextServiceDate: form.nextServiceDate || undefined,
      pmFrequencyMetric: form.pmFrequencyMetric && form.meterType !== 'none' ? Number(form.pmFrequencyMetric) : undefined,
      pmFrequencyHours: undefined,
      location: site?.name,
    });
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-2xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4"><div><h3 className="font-bold text-[var(--text)]">{asset ? 'Edit Asset' : 'Add Asset'}</h3><p className="text-xs text-[var(--text-2)] mt-1">Asset master and maintenance schedule. Log Event is used for actual maintenance occurrences.</p></div><button type="button" onClick={onClose} aria-label="Close"><X size={16} className="text-[var(--text-3)]" /></button></div>
      <div className="grid sm:grid-cols-2 gap-3">
        <FieldInput label="Asset Code *" value={form.assetCode} onChange={v => setForm(f => ({ ...f, assetCode: v }))} placeholder="CNC-05" />
        <FieldInput label="Asset Name *" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="CNC Vertical Machining Centre" />
        <FieldInput label="Category *" value={form.category} onChange={v => setForm(f => ({ ...f, category: v }))} placeholder="Machining Equipment" />
        <label className="text-xs text-[var(--text-2)]">Site *<select className="eoss-input w-full mt-1" value={form.siteId} onChange={e => setForm(f => ({ ...f, siteId: e.target.value }))}>{sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
        <FieldInput label="Manufacturer *" value={form.manufacturer} onChange={v => setForm(f => ({ ...f, manufacturer: v }))} placeholder="DMG MORI" />
        <FieldInput label="Model" value={form.model} onChange={v => setForm(f => ({ ...f, model: v }))} placeholder="DMU 50" />
        <FieldInput label="Work Centre" value={form.workCentre} onChange={v => setForm(f => ({ ...f, workCentre: v }))} placeholder="CNC Bay" />
        <label className="text-xs text-[var(--text-2)]">Criticality<select className="eoss-input w-full mt-1" value={form.criticality} onChange={e => setForm(f => ({ ...f, criticality: e.target.value as Asset['criticality'] }))}>{(['Low', 'Medium', 'High', 'Critical'] as const).map(v => <option key={v} value={v}>{v}</option>)}</select></label>
        <div className="sm:col-span-2 border-t pt-3 mt-1" style={{ borderColor: 'var(--border)' }}><div className="text-xs font-semibold text-[var(--text)] mb-2">Maintenance schedule</div><div className="grid sm:grid-cols-3 gap-3"><label className="text-xs text-[var(--text-2)]">Metric<select className="eoss-input w-full mt-1" value={form.meterType} onChange={e => setForm(f => ({ ...f, meterType: e.target.value as NonNullable<Asset['meterType']> }))}>{[['none', 'Calendar only'], ['hours', 'Running hours'], ['cycles', 'Cycles'], ['km', 'Kilometres']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label><FieldInput label={form.meterType === 'none' ? 'Metric interval' : `Metric interval (${unit})`} value={form.pmFrequencyMetric} onChange={v => setForm(f => ({ ...f, pmFrequencyMetric: v }))} type="number" placeholder="600" /><FieldInput label="Next due date" value={form.nextServiceDate} onChange={v => setForm(f => ({ ...f, nextServiceDate: v }))} type="date" /></div></div>
      </div>
      {err && <p className="text-xs text-[var(--error)] mt-3">{err}</p>}
      <div className="flex gap-2 justify-end mt-5"><button type="button" onClick={onClose} className="btn-ghost">Cancel</button><button type="button" onClick={save} className="btn-primary">{asset ? 'Save Asset' : 'Add Asset'}</button></div>
    </div>
  </div>;
}

function FieldInput({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return <label className="text-xs text-[var(--text-2)]">{label}<input type={type} className="eoss-input w-full mt-1" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} /></label>;
}

function ArchiveAssetModal({ asset, onClose, onConfirm }: { asset: Asset; onClose: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState('');
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-md p-6 shadow-2xl"><h3 className="font-bold text-[var(--text)]">Archive {asset.assetCode}?</h3><p className="text-sm text-[var(--text-2)] mt-2">The asset will be marked retired and hidden from active lists. Maintenance history remains available.</p><label className="block text-xs font-semibold text-[var(--text-2)] mt-4">Reason *<textarea autoFocus rows={3} className="eoss-input w-full mt-1" value={reason} onChange={e => setReason(e.target.value)} placeholder="Replaced, sold, or permanently retired…" /></label><div className="flex gap-2 justify-end mt-5"><button type="button" onClick={onClose} className="btn-ghost">Cancel</button><button type="button" disabled={!reason.trim()} onClick={() => onConfirm(reason.trim())} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-40" style={{ background: 'var(--error)' }}>Archive Asset</button></div></div></div>;
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
