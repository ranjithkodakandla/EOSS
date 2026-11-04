import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Wrench, AlertTriangle, ChevronRight } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';
import clsx from 'clsx';

export default function AssetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { assets, maintenanceEvents } = useStore();
  const [tab, setTab] = useState<'info' | 'history'>('info');

  const asset = assets.find(a => a.id === id);
  if (!asset) return <div className="p-6 text-[var(--text-2)]">Asset not found</div>;

  const events = maintenanceEvents.filter(m => m.assetId === id);

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

      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('info')} className={clsx('px-4 py-2 rounded-lg text-sm transition-colors', tab === 'info' ? 'bg-[var(--brand)] text-white' : 'border border-[var(--border)] text-[var(--text-2)]')}>Asset Info</button>
        <button onClick={() => setTab('history')} className={clsx('px-4 py-2 rounded-lg text-sm transition-colors', tab === 'history' ? 'bg-[var(--brand)] text-white' : 'border border-[var(--border)] text-[var(--text-2)]')}>
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
