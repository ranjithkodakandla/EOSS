import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Wrench, AlertTriangle, ChevronRight, Gauge, X } from 'lucide-react';
import { useStore } from '../../store';
import { computeMaintenanceDue } from '../../domain/maintenanceDue';
import { DEMO_NOW } from '../../data/seed';
import StatusChip from '../../components/layout/StatusChip';
import clsx from 'clsx';

export default function AssetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { assets, maintenanceEvents, meterReadings, addMeterReading, currentUser, showToast } = useStore();
  const [tab, setTab] = useState<'info' | 'history' | 'readings'>('info');
  const [readingModalOpen, setReadingModalOpen] = useState(false);
  const [readingValue, setReadingValue] = useState<string>('');
  const [readingType, setReadingType] = useState<'routine' | 'shift-end' | 'post-maintenance' | 'correction'>('routine');
  const [readingNotes, setReadingNotes] = useState('');

  const asset = assets.find(a => a.id === id);
  if (!asset) return <div className="p-6 text-[var(--text-2)]">Asset not found</div>;

  const events = maintenanceEvents.filter(m => m.assetId === id);
  const readings = meterReadings.filter(r => r.assetId === id).slice().sort((a, b) => b.readingDate.localeCompare(a.readingDate));
  const due = computeMaintenanceDue(asset, meterReadings, new Date(DEMO_NOW));

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
        <button onClick={() => navigate('/assets')} className="text-[var(--text-3)] hover:text-[var(--text)]"><ArrowLeft size={16} /></button>
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
                {asset.pmFrequencyHours && <Field label="PM Frequency" value={`${asset.pmFrequencyHours} hours`} />}
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
                <button onClick={() => navigate('/assets')} className="w-full py-2 border border-[var(--border)] text-[var(--text)] rounded-lg text-sm hover:bg-[var(--surface-2)] transition-colors flex items-center justify-center gap-2">
                  <Wrench size={14} /> Log Maintenance Event
                </button>
                {asset.status === 'breakdown' && (
                  <button className="w-full py-2 bg-[var(--success)] text-white rounded-lg text-sm font-medium">
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
        <div className="space-y-3">
          {events.length === 0 && <div className="text-center py-10 text-sm text-[var(--text-3)]">No maintenance events for this asset</div>}
          {events.map(m => (
            <div key={m.id} className={clsx('bg-[var(--surface)] border rounded-xl p-4 cursor-pointer hover:border-[var(--brand)] transition-colors', m.type === 'Breakdown' && m.status !== 'closed' ? 'border-[var(--error)]' : 'border-[var(--border)]')} onClick={() => navigate(`/assets/me/${m.id}`)}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-mono text-xs font-bold text-[var(--brand)]">{m.eventNumber}</span>
                    <StatusChip status={m.type.toLowerCase()} label={m.type} size="sm" />
                    <StatusChip status={m.status} size="sm" />
                  </div>
                  <p className="text-sm text-[var(--text)]">{m.symptom}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-3)]">
                    <span>{m.technicianName}</span>
                    <span>·</span>
                    <span>{new Date(m.downtimeStart).toLocaleDateString('en-IN')}</span>
                    {m.downtimeEnd && <><span>·</span><span className="text-[var(--success)]">Resolved</span></>}
                  </div>
                </div>
                <ChevronRight size={14} className="text-[var(--text-3)]" />
              </div>
            </div>
          ))}
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
