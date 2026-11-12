import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Wrench, AlertTriangle, ChevronRight, Gauge, X, Pencil } from 'lucide-react';
import { useStore } from '../../store';
import { useReturnNavigation } from '../../hooks/useReturnNavigation';
import { computeMaintenanceDue } from '../../domain/maintenanceDue';
import { DEMO_NOW } from '../../data/seed';
import StatusChip from '../../components/layout/StatusChip';
import RecordHistoryPanel from '../../components/workflow/RecordHistoryPanel';
import clsx from 'clsx';

export default function AssetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { assets, maintenanceEvents, meterReadings, addMeterReading, closeMaintenanceEvent, updateAsset, currentUser, showToast } = useStore();
  const { goBack } = useReturnNavigation('/assets');
  const [tab, setTab] = useState<'info' | 'history' | 'readings'>('info');
  const [readingModalOpen, setReadingModalOpen] = useState(false);
  const [readingValue, setReadingValue] = useState<string>('');
  const [readingType, setReadingType] = useState<'routine' | 'shift-end' | 'post-maintenance' | 'correction'>('routine');
  const [readingNotes, setReadingNotes] = useState('');
  const [repairModalOpen, setRepairModalOpen] = useState(false);
  const [repairForm, setRepairForm] = useState({ downtimeEnd: `${DEMO_NOW}T17:00`, diagnosis: '', workDone: '' });

  const asset = assets.find(a => a.id === id);
  if (!asset) return <div className="p-6 text-[var(--text-2)]">Asset not found</div>;

  const events = maintenanceEvents.filter(m => m.assetId === id);
  const openBreakdown = events.find(m => m.type === 'Breakdown' && m.status !== 'closed');
  const readings = meterReadings.filter(r => r.assetId === id).slice().sort((a, b) => b.readingDate.localeCompare(a.readingDate));
  const due = computeMaintenanceDue(asset, meterReadings, new Date(DEMO_NOW));

  const handleMarkRepaired = () => {
    if (openBreakdown) {
      closeMaintenanceEvent(
        openBreakdown.id,
        repairForm.diagnosis.trim() || openBreakdown.rootCause || 'Fault diagnosed and resolved',
        repairForm.workDone.trim() || openBreakdown.correctiveAction || 'Repair completed and machine tested',
        { downtimeEnd: repairForm.downtimeEnd || `${DEMO_NOW}T17:00`, completionDate: (repairForm.downtimeEnd || DEMO_NOW).slice(0, 10) }
      );
      showToast({ type: 'success', title: 'Asset marked repaired', body: `${openBreakdown.eventNumber} closed and ${asset.assetCode} restored to Operational.` });
    } else {
      updateAsset(asset.id, { status: 'operational' });
      showToast({ type: 'success', title: 'Asset marked repaired', body: `${asset.assetCode} is now Operational.` });
    }
    setRepairModalOpen(false);
  };

  const handleLogReading = () => {
    if (!readingValue) return;
    addMeterReading({
      id: `mr-${Date.now()}`, assetId: asset.id, assetCode: asset.assetCode, reading: Number(readingValue),
      readingDate: DEMO_NOW, recordedBy: currentUser.name, readingType, notes: readingNotes || undefined,
    });
    showToast({ type: 'success', title: 'Meter reading logged', body: `${asset.assetCode}: ${readingValue} ${asset.meterType}.` });
    setReadingModalOpen(false);
    setReadingValue('');
    setReadingNotes('');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => goBack()} className="text-[var(--text-3)] hover:text-[var(--text)]"><ArrowLeft size={16} /></button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm font-bold text-[var(--brand)]">{asset.assetCode}</span>
            <StatusChip status={asset.status} />
            <span className={clsx('text-xs font-semibold', {
              'text-[var(--error)]': asset.criticality === 'Critical',
              'text-[var(--warning)]': asset.criticality === 'High',
              'text-[var(--info)]': asset.criticality === 'Medium',
              'text-[var(--text-3)]': asset.criticality === 'Low',
            })}>{asset.criticality}</span>
          </div>
          <h1 className="text-lg font-bold text-[var(--text)]">{asset.name}</h1>
        </div>
        <button type="button" onClick={() => navigate(`/assets?edit=${asset.id}`)} className="btn-ghost text-xs inline-flex items-center gap-1.5"><Pencil size={13} /> Edit Asset</button>
      </div>

      {asset.status === 'breakdown' && (
        <div className="mb-4 bg-[var(--error-bg)] border border-[var(--error)] rounded-xl p-3 flex items-center gap-2">
          <AlertTriangle size={16} className="text-[var(--error)] flex-shrink-0" />
          <p className="text-sm text-[var(--error)] font-medium">This asset is currently in breakdown. Active maintenance event in progress.</p>
        </div>
      )}
      {asset.status === 'pm_overdue' && (
        <div className="mb-4 bg-[var(--warning-bg)] border border-[var(--warning)] rounded-xl p-3 flex items-center gap-2">
          <AlertTriangle size={16} className="text-[var(--warning)] flex-shrink-0" />
          <p className="text-sm text-[var(--warning)] font-medium">Preventive maintenance is overdue. Schedule service immediately.</p>
        </div>
      )}

      {(due.status === 'due' || due.status === 'overdue' || due.status === 'upcoming') && (
        <div className={clsx('mb-4 rounded-xl p-3 flex items-center gap-2 border', {
          'bg-[var(--error-bg)] border-[var(--error)]': due.status === 'overdue',
          'bg-[var(--warning-bg)] border-[var(--warning)]': due.status === 'due',
          'bg-[var(--surface)] border-[var(--border)]': due.status === 'upcoming',
        })}>
          <Gauge size={16} className={clsx('flex-shrink-0', due.status === 'overdue' ? 'text-[var(--error)]' : due.status === 'due' ? 'text-[var(--warning)]' : 'text-[var(--text-2)]')} />
          <p className={clsx('text-sm font-medium', due.status === 'overdue' ? 'text-[var(--error)]' : due.status === 'due' ? 'text-[var(--warning)]' : 'text-[var(--text-2)]')}>
            {due.summary}
          </p>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('info')} className={clsx('px-4 py-2 rounded-lg text-sm transition-colors', tab === 'info' ? 'bg-[var(--brand-fill)] text-white' : 'border border-[var(--border)] text-[var(--text-2)]')}>Asset Info</button>
        <button onClick={() => setTab('readings')} className={clsx('px-4 py-2 rounded-lg text-sm transition-colors', tab === 'readings' ? 'bg-[var(--brand-fill)] text-white' : 'border border-[var(--border)] text-[var(--text-2)]')}>
          Running Hours ({readings.length})
        </button>
        <button onClick={() => setTab('history')} className={clsx('px-4 py-2 rounded-lg text-sm transition-colors', tab === 'history' ? 'bg-[var(--brand-fill)] text-white' : 'border border-[var(--border)] text-[var(--text-2)]')}>
          Maintenance History ({events.length})
        </button>
      </div>

      {tab === 'info' && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Asset Information</h3>
            <dl className="space-y-2.5 text-sm">
              <Field label="Asset Code" value={asset.assetCode} mono />
              <Field label="Category" value={asset.category} />
              <Field label="Sub-Category" value={asset.subCategory ?? '—'} />
              <Field label="Manufacturer" value={asset.manufacturer} />
              <Field label="Model" value={asset.model} />
              {asset.serialNumber && <Field label="Serial Number" value={asset.serialNumber} mono />}
              {asset.purchaseYear && <Field label="Purchase Year" value={String(asset.purchaseYear)} />}
              {asset.workCentre && <Field label="Work Centre" value={asset.workCentre} />}
              {asset.location && <Field label="Location" value={asset.location} />}
            </dl>
          </div>

          <div className="space-y-4">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Service & Meter</h3>
              <dl className="space-y-2.5 text-sm">
                <Field label="Meter Type" value={asset.meterType} />
                {asset.currentReading != null && <Field label="Current Reading" value={`${asset.currentReading.toLocaleString()} ${asset.meterType}`} />}
                {(asset.pmFrequencyMetric ?? asset.pmFrequencyHours) && <Field label="PM Frequency" value={`${asset.pmFrequencyMetric ?? asset.pmFrequencyHours} ${asset.meterType === 'none' ? 'metric' : asset.meterType}`} />}
                {asset.lastServiceDate && <Field label="Last Service" value={new Date(asset.lastServiceDate).toLocaleDateString('en-IN')} />}
                {asset.nextServiceDate && (
                  <div>
                    <dt className="text-xs text-[var(--text-3)]">Next Service</dt>
                    <dd className={clsx('text-sm mt-0.5', asset.status === 'pm_overdue' ? 'text-[var(--error)] font-semibold' : 'text-[var(--text)]')}>{new Date(asset.nextServiceDate).toLocaleDateString('en-IN')}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Actions</h3>
              <div className="space-y-2">
                {asset.meterType && asset.meterType !== 'none' && (
                  <button onClick={() => setReadingModalOpen(true)} className="w-full py-2 border border-[var(--border)] text-[var(--text)] rounded-lg text-sm hover:bg-[var(--surface-2)] transition-colors flex items-center justify-center gap-2">
                    <Gauge size={14} /> Log Meter Reading
                  </button>
                )}
                <button onClick={() => navigate(`/assets?log=${asset.id}`)} className="w-full py-2 border border-[var(--border)] text-[var(--text)] rounded-lg text-sm hover:bg-[var(--surface-2)] transition-colors flex items-center justify-center gap-2">
                  <Wrench size={14} /> Log Maintenance Event
                </button>
                {asset.status === 'breakdown' && (
                  <button type="button" onClick={() => setRepairModalOpen(true)} className="w-full py-2 bg-[var(--success)] text-white rounded-lg text-sm font-medium">
                    Mark Repaired
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'readings' && (
        <div className="space-y-3">
          {readings.length === 0 && <div className="text-center py-10 text-sm text-[var(--text-3)]">No meter readings logged for this asset</div>}
          {readings.map(r => (
            <div key={r.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 flex items-center justify-between gap-3">
              <div>
                <div className="font-mono text-base font-bold text-[var(--text)]">{r.reading.toLocaleString()} {asset.meterType}</div>
                <div className="text-xs text-[var(--text-3)] mt-0.5">{r.recordedBy} · {new Date(r.readingDate).toLocaleDateString('en-IN')} · <span className="capitalize">{r.readingType.replace('-', ' ')}</span></div>
                {r.notes && <div className="text-xs text-[var(--text-2)] mt-1">{r.notes}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'history' && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-x-auto">
          {events.length === 0 ? (
            <div className="text-center py-10 text-sm text-[var(--text-3)]">No maintenance events for this asset</div>
          ) : (
            <table className="eoss-table">
              <thead>
                <tr>
                  <th>Event #</th>
                  <th>Type</th>
                  <th>Planned Date</th>
                  <th>Start Date</th>
                  <th>Completion Date</th>
                  <th>Downtime</th>
                  <th>Technician</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {events.map(m => {
                  const dtHours = m.downtimeEnd
                    ? Math.max(0, (new Date(m.downtimeEnd).getTime() - new Date(m.downtimeStart).getTime()) / 3600000).toFixed(1)
                    : m.type === 'Breakdown' && m.status !== 'closed'
                      ? 'Ongoing'
                      : '—';
                  return (
                    <tr key={m.id} className="cursor-pointer hover:bg-[var(--surface-2)]" onClick={() => navigate(`/assets/me/${m.id}`)}>
                      <td className="font-mono text-xs font-bold text-[var(--brand)]">{m.eventNumber}</td>
                      <td><StatusChip status={m.type.toLowerCase()} label={m.type} size="sm" /></td>
                      <td className="text-xs">{m.plannedDate ? new Date(m.plannedDate).toLocaleDateString('en-IN') : '—'}</td>
                      <td className="text-xs">{new Date(m.downtimeStart).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="text-xs">{m.completionDate || m.downtimeEnd ? new Date(m.completionDate || m.downtimeEnd!).toLocaleDateString('en-IN') : '—'}</td>
                      <td className="font-mono text-xs">{dtHours === 'Ongoing' || dtHours === '—' ? dtHours : `${dtHours}h`}</td>
                      <td className="text-xs">{m.technicianName}</td>
                      <td className="text-xs max-w-[220px] truncate">{m.symptom}</td>
                      <td><StatusChip status={m.status} size="sm" /></td>
                      <td><ChevronRight size={14} className="text-[var(--text-3)]" /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {repairModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl p-5 space-y-4 bg-[var(--surface)] border border-[var(--border)]">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h3 className="text-sm font-bold text-[var(--text)]">Mark Repaired — {asset.assetCode}</h3>
              <button type="button" onClick={() => setRepairModalOpen(false)} className="text-[var(--text-3)] hover:text-[var(--text)]"><X size={16} /></button>
            </div>
            <div className="space-y-3 text-xs">
              {openBreakdown && (
                <div className="rounded-lg p-2.5 bg-[var(--surface-2)] text-[var(--text-2)]">
                  Closing open breakdown <span className="font-mono font-bold text-[var(--brand)]">{openBreakdown.eventNumber}</span>: {openBreakdown.symptom}
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Resolution / Completion Time</label>
                <input type="datetime-local" value={repairForm.downtimeEnd} onChange={e => setRepairForm(f => ({ ...f, downtimeEnd: e.target.value }))} className="eoss-input w-full" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Root Cause / Diagnosis</label>
                <input value={repairForm.diagnosis} onChange={e => setRepairForm(f => ({ ...f, diagnosis: e.target.value }))} placeholder="Fault identified during repair" className="eoss-input w-full" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Work Done / Corrective Action</label>
                <textarea rows={2} value={repairForm.workDone} onChange={e => setRepairForm(f => ({ ...f, workDone: e.target.value }))} placeholder="Replaced part, calibrated, tested…" className="eoss-input w-full" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
              <button type="button" onClick={() => setRepairModalOpen(false)} className="btn-ghost text-xs py-1.5 px-3">Cancel</button>
              <button type="button" onClick={handleMarkRepaired} className="btn-primary text-xs py-1.5 px-4">Confirm Repaired</button>
            </div>
          </div>
        </div>
      )}

      {readingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl p-5 space-y-4 bg-[var(--surface)] border border-[var(--border)]">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h3 className="text-sm font-bold text-[var(--text)]">Log Meter Reading — {asset.assetCode}</h3>
              <button onClick={() => setReadingModalOpen(false)} className="text-[var(--text-3)] hover:text-[var(--text)]"><X size={16} /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Reading ({asset.meterType})</label>
                <input type="number" value={readingValue} onChange={e => setReadingValue(e.target.value)} placeholder={String(asset.currentReading ?? 0)} className="w-full p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] font-mono text-base font-bold text-[var(--text)]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Reading Type</label>
                <select value={readingType} onChange={e => setReadingType(e.target.value as any)} className="w-full p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)]">
                  <option value="routine">Routine</option>
                  <option value="shift-end">Shift-end</option>
                  <option value="post-maintenance">Post-maintenance</option>
                  <option value="correction">Correction</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Notes</label>
                <input value={readingNotes} onChange={e => setReadingNotes(e.target.value)} className="w-full p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)]" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
              <button onClick={() => setReadingModalOpen(false)} className="btn-ghost text-xs py-1.5 px-3">Cancel</button>
              <button disabled={!readingValue} onClick={handleLogReading} className="btn-primary text-xs py-1.5 px-4 disabled:opacity-50">Save Reading</button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-5">
        <RecordHistoryPanel
          entityId={asset.id}
          entityRef={asset.assetCode}
          title="Asset Lifecycle & Audit Trail"
          subtitle="Master updates, breakdown reports, repairs completed, and meter readings"
        />
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-[var(--text-3)]">{label}</dt>
      <dd className={`text-sm text-[var(--text)] mt-0.5 ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  );
}
