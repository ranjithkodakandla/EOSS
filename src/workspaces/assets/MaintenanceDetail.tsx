import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { useStore } from '../../store';
import { DEMO_NOW } from '../../data/seed';
import StatusChip from '../../components/layout/StatusChip';
import RecordHistoryPanel from '../../components/workflow/RecordHistoryPanel';
import clsx from 'clsx';

export default function MaintenanceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { maintenanceEvents, assets, jobs, closeMaintenanceEvent, currentUser, showToast } = useStore();

  const event = maintenanceEvents.find(m => m.id === id);
  const [downtimeEnd, setDowntimeEnd] = useState(() => event?.downtimeEnd ?? `${DEMO_NOW}T17:00`);
  const [diagnosis, setDiagnosis] = useState(() => event?.rootCause ?? '');
  const [workDone, setWorkDone] = useState(() => event?.correctiveAction ?? '');
  const [notes, setNotes] = useState(() => event?.notes ?? '');
  const [err, setErr] = useState('');

  if (!event) return <div className="p-6 text-[var(--text-2)]">Maintenance event not found</div>;

  const asset = assets.find(a => a.id === event.assetId);
  const affectedJobDetails = event.affectedJobs.map(aj => jobs.find(j => j.id === aj.jobId)).filter(Boolean);
  const canClose = ['owner', 'maintenance', 'supervisor'].includes(currentUser.role);

  const downtimeHours = event.downtimeEnd
    ? Math.max(0, (new Date(event.downtimeEnd).getTime() - new Date(event.downtimeStart).getTime()) / 3600000).toFixed(1)
    : event.type === 'Breakdown'
      ? Math.max(0, (new Date(DEMO_NOW).getTime() - new Date(event.downtimeStart).getTime()) / 3600000).toFixed(1)
      : '0.0';

  const handleClose = () => {
    setErr('');
    if (!workDone.trim() && !notes.trim()) {
      setErr('Please enter work done or resolution notes before closing.');
      return;
    }
    if (downtimeEnd && new Date(downtimeEnd).getTime() < new Date(event.downtimeStart).getTime()) {
      setErr('Resolution timestamp cannot be earlier than event start.');
      return;
    }
    const endValue = downtimeEnd || `${DEMO_NOW}T17:00`;
    closeMaintenanceEvent(
      event.id,
      diagnosis.trim() || event.rootCause || 'Root cause verified during maintenance',
      workDone.trim() || notes.trim(),
      { downtimeEnd: endValue, completionDate: endValue.slice(0, 10), notes: notes.trim() || undefined }
    );
    showToast({ type: 'success', title: 'Event closed', body: `${event.eventNumber} resolved and asset state updated.` });
  };

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
              <Field label="Technician / Responsible" value={event.responsiblePerson ?? event.technicianName} />
              {event.plannedDate && <Field label="Planned Date" value={new Date(event.plannedDate).toLocaleDateString('en-IN')} />}
              {event.expectedDurationHours != null && <Field label="Expected Duration" value={`${event.expectedDurationHours} hours`} />}
              <Field label={event.type === 'Breakdown' ? 'Downtime Start' : 'Start / Scheduled'} value={new Date(event.downtimeStart).toLocaleString('en-IN')} />
              {event.downtimeEnd
                ? <Field label="Completion / Downtime End" value={new Date(event.downtimeEnd).toLocaleString('en-IN')} />
                : <div><dt className="text-xs text-[var(--text-3)]">Completion / Downtime End</dt><dd className="text-sm text-[var(--error)] font-semibold mt-0.5">Still in progress</dd></div>
              }
              <Field label="Total Downtime" value={`${downtimeHours} hours`} />
              {asset && <div><dt className="text-xs text-[var(--text-3)]">Asset Criticality</dt><dd className={clsx('text-sm font-semibold mt-0.5', { 'text-[var(--error)]': asset.criticality === 'Critical', 'text-[var(--warning)]': asset.criticality === 'High', 'text-[var(--info)]': asset.criticality === 'Medium', 'text-[var(--text-3)]': asset.criticality === 'Low' })}>{asset.criticality}</dd></div>}
            </dl>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <h3 className="font-semibold text-sm text-[var(--text)] mb-2">Symptom / Description</h3>
            <p className="text-sm text-[var(--text)]">{event.symptom}</p>
            {event.notes && <p className="text-xs text-[var(--text-2)] mt-2 pt-2 border-t border-[var(--border)]">{event.notes}</p>}
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
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-sm text-[var(--text)]">Resolve & Close Event</h3>
              <div>
                <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Resolution / Completion Time</label>
                <input type="datetime-local" value={downtimeEnd} onChange={e => setDowntimeEnd(e.target.value)} className="eoss-input w-full text-xs" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Root Cause / Diagnosis</label>
                <input value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="Observed root cause" className="eoss-input w-full text-xs" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Work Done / Corrective Action *</label>
                <textarea rows={2} value={workDone} onChange={e => setWorkDone(e.target.value)} placeholder="Repair, replacement, calibration details…" className="eoss-input w-full text-xs" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Resolution Notes</label>
                <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Verification & sign-off notes…" className="eoss-input w-full text-xs" />
              </div>
              {err && <p className="text-xs text-[var(--error,#DC2626)] font-medium">{err}</p>}
              <button type="button" onClick={handleClose} className="w-full py-2.5 bg-[var(--success)] text-white rounded-lg text-sm font-medium">
                Mark as Resolved & Close
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5">
        <RecordHistoryPanel
          entityId={event.id}
          entityRef={event.eventNumber}
          relatedIds={asset ? [asset.id] : []}
          title="Maintenance Event Activity & Audit Trail"
          subtitle="Breakdown/PM log creation, spare parts usage, diagnosis, and closure"
        />
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
