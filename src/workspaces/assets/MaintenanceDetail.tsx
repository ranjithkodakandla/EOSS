import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';
import clsx from 'clsx';

export default function MaintenanceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { maintenanceEvents, assets, jobs, currentUser, showToast } = useStore();

  const event = maintenanceEvents.find(m => m.id === id);
  if (!event) return <div className="p-6 text-[var(--text-2)]">Maintenance event not found</div>;

  const asset = assets.find(a => a.id === event.assetId);
  const affectedJobDetails = event.affectedJobs.map(aj => jobs.find(j => j.id === aj.jobId)).filter(Boolean);
  const canClose = ['owner', 'maintenance', 'supervisor'].includes(currentUser.role);

  const downtimeHours = event.downtimeEnd
    ? ((new Date(event.downtimeEnd).getTime() - new Date(event.downtimeStart).getTime()) / 3600000).toFixed(1)
    : ((Date.now() - new Date(event.downtimeStart).getTime()) / 3600000).toFixed(1);

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate('/assets')} className="text-[var(--text-3)] hover:text-[var(--text)]"><ArrowLeft size={16} /></button>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm font-bold text-[var(--brand)]">{event.eventNumber}</span>
            <StatusChip status={event.type.toLowerCase()} label={event.type} />
            <StatusChip status={event.status} />
            {event.severity && <span className={clsx('text-xs font-semibold', ['High', 'Critical'].includes(event.severity) ? 'text-[var(--error)]' : 'text-[var(--warning)]')}>{event.severity}</span>}
          </div>
          <p className="text-sm text-[var(--text-2)] mt-0.5">{event.assetName} <span className="font-mono text-xs text-[var(--text-3)]">({event.assetCode})</span></p>
        </div>
      </div>

      {event.affectedJobs.length > 0 && (
        <div className="mb-4 bg-[var(--error-bg)] border border-[var(--error)] rounded-xl p-3 flex items-start gap-2">
          <AlertTriangle size={16} className="text-[var(--error)] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-[var(--error)] font-medium">{event.affectedJobs.length} production job(s) affected</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {affectedJobDetails.map(j => j && (
                <button key={j.id} onClick={() => navigate(`/jobs/${j.id}`)} className="text-xs text-[var(--error)] underline font-mono">{j.jobNumber}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Event Details</h3>
            <dl className="space-y-2.5 text-sm">
              <Field label="Type" value={event.type} />
              {event.severity && <Field label="Severity" value={event.severity} />}
              <Field label="Technician" value={event.technicianName} />
              <Field label="Downtime Start" value={new Date(event.downtimeStart).toLocaleString('en-IN')} />
              {event.downtimeEnd
                ? <Field label="Downtime End" value={new Date(event.downtimeEnd).toLocaleString('en-IN')} />
                : <div><dt className="text-xs text-[var(--text-3)]">Downtime End</dt><dd className="text-sm text-[var(--error)] font-semibold mt-0.5">Still in progress</dd></div>
              }
              <Field label="Total Downtime" value={`${downtimeHours} hours`} />
              {asset && <div><dt className="text-xs text-[var(--text-3)]">Asset Criticality</dt><dd className={clsx('text-sm font-semibold mt-0.5', { 'text-[var(--error)]': asset.criticality === 'Critical', 'text-[var(--warning)]': asset.criticality === 'High', 'text-[var(--info)]': asset.criticality === 'Medium', 'text-[var(--text-3)]': asset.criticality === 'Low' })}>{asset.criticality}</dd></div>}
            </dl>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <h3 className="font-semibold text-sm text-[var(--text)] mb-2">Symptom / Problem</h3>
            <p className="text-sm text-[var(--text)]">{event.symptom}</p>
          </div>

          {event.rootCause && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <h3 className="font-semibold text-sm text-[var(--text)] mb-2">Root Cause</h3>
              <p className="text-sm text-[var(--text)]">{event.rootCause}</p>
            </div>
          )}

          {event.correctiveAction && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <h3 className="font-semibold text-sm text-[var(--text)] mb-2">Corrective Action</h3>
              <p className="text-sm text-[var(--text)]">{event.correctiveAction}</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {event.partsUsed && event.partsUsed.length > 0 && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Parts Used</h3>
              <div className="space-y-2">
                {event.partsUsed.map((p, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-[var(--text)]">{p.partName}</span>
                    <span className="text-[var(--text-2)] font-mono">{p.qty} {p.uom}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {asset && (
            <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4">
              <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Asset Info</h3>
              <dl className="space-y-2 text-sm">
                <Field label="Asset" value={`${asset.manufacturer} ${asset.model}`} />
                <Field label="Category" value={asset.category} />
                {asset.workCentre && <Field label="Work Centre" value={asset.workCentre} />}
              </dl>
              <button onClick={() => navigate(`/assets/${asset.id}`)} className="mt-3 text-xs text-[var(--brand)] underline">View Full Asset →</button>
            </div>
          )}

          {canClose && event.status !== 'closed' && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Close Event</h3>
              <textarea rows={3} placeholder="Resolution notes…" className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] placeholder:text-[var(--text-3)] focus:outline-none focus:border-[var(--brand)] resize-none mb-3" />
              <button onClick={() => showToast({ type: 'success', title: 'Event closed', body: `${event.eventNumber} marked as resolved` })} className="w-full py-2.5 bg-[var(--success)] text-white rounded-lg text-sm font-medium">
                Mark as Resolved & Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-[var(--text-3)]">{label}</dt>
      <dd className={`text-sm text-[var(--text)] mt-0.5 ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  );
}
