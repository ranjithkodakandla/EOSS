import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useStore } from '../../store';
import { DEMO_NOW } from '../../data/seed';
import type { NCR, QualityRelease } from '../../types';
import StatusChip from '../../components/layout/StatusChip';

let ncrSeq = 50;

export default function InspectionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { inspections, lots, jobs, ncrs, qualityReleases, currentUser, addNCR, linkNCRToInspection, updateInspection, addQualityRelease } = useStore();
  const canRaiseNCR = ['owner', 'qc'].includes(currentUser.role);
  const canRelease = ['owner', 'qc'].includes(currentUser.role);
  const [recording, setRecording] = useState(false);
  const [recForm, setRecForm] = useState({ accepted: 0, rejected: 0, notes: '' });

  const ins = inspections.find(i => i.id === id);
  if (!ins) return <div className="p-6 text-[var(--text-2)]">Inspection not found</div>;

  const lot = ins.lotId ? lots.find(l => l.id === ins.lotId) : null;
  const job = ins.jobId ? jobs.find(j => j.id === ins.jobId) : null;
  const existingRelease = job ? qualityReleases.find(r => r.jobId === job.id) : null;

  const checklistItems = ins.measurements && ins.measurements.length > 0
    ? ins.measurements.map(m => ({ label: `${m.parameter} — ${m.acceptanceCriteria} (actual: ${m.actual})`, result: m.passed ? 'pass' : 'fail' }))
    : [
      { label: 'Dimensions check', result: ins.result === 'pass' ? 'pass' : 'pending' },
      { label: 'Visual / surface inspection', result: ins.result === 'fail' ? 'fail' : ins.result === 'pass' ? 'pass' : 'pending' },
      { label: 'Grade / mark verification', result: ins.result !== 'pending' ? 'pass' : 'pending' },
      { label: 'Certificate matching', result: lot?.certStatus === 'verified' ? 'pass' : 'pending' },
    ];

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate('/quality')} className="text-[var(--text-3)] hover:text-[var(--text)]"><ArrowLeft size={16} /></button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-[var(--text)] font-mono">{ins.inspectionNumber}</h1>
            <StatusChip status={ins.result} />
            <StatusChip status={ins.type.toLowerCase().replace(/[\s-]/g, '_')} label={ins.type} size="sm" />
            <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${ins.origin === 'external' ? 'bg-[var(--info-bg)] text-[var(--info)]' : 'bg-[var(--surface-3)] text-[var(--text-3)]'}`}>
              {ins.origin === 'external' ? 'External' : 'Internal'}
            </span>
          </div>
          <p className="text-sm text-[var(--text-2)]">{ins.inspectorName}{ins.externalOrgName ? ` (${ins.externalOrgName})` : ''} · {new Date(ins.date).toLocaleDateString('en-IN')}</p>
          {ins.reworkOfInspectionId && <p className="text-xs text-[var(--text-3)] mt-0.5">Re-inspection after rework of <button onClick={() => navigate(`/quality/inspection/${ins.reworkOfInspectionId}`)} className="text-[var(--brand)] hover:underline font-mono">{ins.reworkOfInspectionId}</button></p>}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Inspection Details</h3>
            <dl className="space-y-2 text-sm">
              <Field label="Template" value={ins.templateName} />
              <Field label="Inspector" value={ins.inspectorName} />
              <Field label="Date" value={new Date(ins.date).toLocaleDateString('en-IN')} />
              {lot && <Field label="Lot Number" value={lot.lotNumber} mono />}
              {job && <Field label="Job Number" value={job.jobNumber} mono />}
              {ins.stageName && <Field label="Stage" value={ins.stageName} />}
              {ins.checklistVersion && <Field label="Checklist Version" value={ins.checklistVersion} mono />}
            </dl>
          </div>

          {ins.origin === 'external' && (
            <div className="bg-[var(--info-bg)] border border-[var(--info)] rounded-xl p-4">
              <h3 className="font-semibold text-sm text-[var(--info)] mb-3">External Inspection</h3>
              <dl className="space-y-2 text-sm">
                <Field label="Organisation" value={ins.externalOrgName ?? '—'} />
                <Field label="Scope" value={ins.externalScope ?? '—'} />
                {ins.reportRef && <Field label="Report Reference" value={ins.reportRef} mono />}
              </dl>
              {ins.remarks && <p className="text-xs text-[var(--text-2)] mt-2">{ins.remarks}</p>}
            </div>
          )}

          {/* Quantities */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Results</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center bg-[var(--surface-2)] rounded-lg p-3">
                <div className="text-xl font-bold text-[var(--text)]">{ins.sampleQty}</div>
                <div className="text-xs text-[var(--text-3)]">Sampled</div>
              </div>
              <div className="text-center bg-[var(--success-bg)] rounded-lg p-3">
                <div className="text-xl font-bold text-[var(--success)]">{ins.acceptedQty}</div>
                <div className="text-xs text-[var(--text-3)]">Accepted</div>
              </div>
              <div className="text-center bg-[var(--error-bg)] rounded-lg p-3">
                <div className="text-xl font-bold text-[var(--error)]">{ins.rejectedQty}</div>
                <div className="text-xs text-[var(--text-3)]">Rejected</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Checklist */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Inspection Checklist</h3>
            <div className="space-y-2">
              {checklistItems.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  {item.result === 'pass' ? <CheckCircle size={14} className="text-[var(--success)] flex-shrink-0" /> :
                   item.result === 'fail' ? <XCircle size={14} className="text-[var(--error)] flex-shrink-0" /> :
                   <div className="w-3.5 h-3.5 rounded-full border-2 border-[var(--border)] flex-shrink-0" />}
                  <span className="text-sm text-[var(--text)]">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {ins.ncrId && (
            <div className="bg-[var(--error-bg)] border border-[var(--error)] rounded-xl p-4">
              <div className="font-semibold text-sm text-[var(--error)] mb-1">NCR Raised</div>
              <div className="font-mono text-xs text-[var(--text)]">{ins.ncrNumber}</div>
              <button onClick={() => navigate(`/quality/ncr/${ins.ncrId}`)} className="mt-2 text-xs text-[var(--error)] underline">View NCR →</button>
            </div>
          )}
          {/* Record Result panel — only when pending */}
          {ins.result === 'pending' && canRaiseNCR && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <div className="font-semibold text-sm text-[var(--text)] mb-3">Record Inspection Result</div>
              {!recording ? (
                <button onClick={() => { setRecForm({ accepted: ins.sampleQty, rejected: 0, notes: '' }); setRecording(true); }}
                  className="w-full py-2 rounded-lg text-sm font-medium text-white" style={{ background: 'var(--brand)' }}>
                  Record Result
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-[var(--text-3)] mb-1">Accepted Qty</label>
                      <input type="number" min={0} max={ins.sampleQty}
                        className="eoss-input w-full font-mono text-sm"
                        value={recForm.accepted}
                        onChange={e => setRecForm(f => ({ ...f, accepted: Number(e.target.value) }))} />
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--text-3)] mb-1">Rejected Qty</label>
                      <input type="number" min={0} max={ins.sampleQty}
                        className="eoss-input w-full font-mono text-sm"
                        value={recForm.rejected}
                        onChange={e => setRecForm(f => ({ ...f, rejected: Number(e.target.value) }))} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--text-3)] mb-1">Notes</label>
                    <textarea rows={2} className="eoss-input w-full text-sm resize-none" value={recForm.notes}
                      onChange={e => setRecForm(f => ({ ...f, notes: e.target.value }))} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setRecording(false)} className="flex-1 py-2 border border-[var(--border)] rounded-lg text-sm text-[var(--text-2)]">Cancel</button>
                    <button
                      onClick={() => {
                        const result = recForm.rejected === 0 ? 'pass' : recForm.accepted === 0 ? 'fail' : 'partial';
                        updateInspection(ins.id, { acceptedQty: recForm.accepted, rejectedQty: recForm.rejected, result: result as any });
                        setRecording(false);
                      }}
                      className="flex-1 py-2 rounded-lg text-sm font-semibold text-white"
                      style={{ background: recForm.rejected === 0 ? 'var(--success,#16A34A)' : 'var(--error,#DC2626)' }}>
                      {recForm.rejected === 0 ? '✓ Mark Pass' : '✗ Mark Fail'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {ins.result === 'fail' && !ins.ncrId && canRaiseNCR && (
            <div className="bg-[var(--warning-bg)] border border-[var(--warning)] rounded-xl p-4">
              <div className="font-semibold text-sm text-[var(--warning)] mb-1 flex items-center gap-1.5">
                <AlertTriangle size={14} /> Inspection Failed — No NCR
              </div>
              <p className="text-xs text-[var(--text-2)] mb-3">This inspection failed but no NCR has been raised yet.</p>
              <button
                onClick={() => {
                  const ncrId = `ncr-new-${++ncrSeq}`;
                  const ncrNumber = `NCR-2024-${String(ncrSeq).padStart(3, '0')}`;
                  const newNCR: NCR = {
                    id: ncrId,
                    ncrNumber,
                    inspectionId: ins.id,
                    sourceType: ins.type === 'Incoming' ? 'Incoming' : 'In-Process',
                    severity: 'Major',
                    description: `Non-conformance raised from failed inspection ${ins.inspectionNumber}`,
                    affectedQty: ins.rejectedQty,
                    disposition: 'Pending',
                    raisedBy: currentUser.name,
                    raisedAt: new Date().toISOString(),
                    status: 'open',
                    lotId: ins.lotId,
                    jobId: ins.jobId,
                  };
                  addNCR(newNCR);
                  linkNCRToInspection(ins.id, ncrId, ncrNumber);
                }}
                className="w-full py-2 bg-[var(--warning)] text-white rounded-lg text-sm font-medium"
              >
                Raise NCR
              </button>
            </div>
          )}

          {job && ins.result === 'pass' && !existingRelease && canRelease && (
            <div className="bg-[var(--success-bg)] border border-[var(--success)] rounded-xl p-4">
              <div className="font-semibold text-sm text-[var(--success)] mb-1 flex items-center gap-1.5">
                <ShieldCheck size={14} /> Ready for Quality Release
              </div>
              <p className="text-xs text-[var(--text-2)] mb-3">Issuing a release clears {job.jobNumber} for dispatch. Dispatch cannot proceed without one.</p>
              <button
                onClick={() => {
                  const release: QualityRelease = {
                    id: `qr-${Date.now()}`, jobId: job.id, jobNumber: job.jobNumber, inspectionId: ins.id,
                    releasedBy: currentUser.name, releasedAt: DEMO_NOW + 'T00:00:00', certDossierComplete: true,
                    notes: `Released based on inspection ${ins.inspectionNumber}.`,
                  };
                  addQualityRelease(release);
                }}
                className="w-full py-2 bg-[var(--success)] text-white rounded-lg text-sm font-medium"
              >
                Issue Quality Release
              </button>
            </div>
          )}
          {job && existingRelease && (
            <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4">
              <div className="font-semibold text-sm text-[var(--success)] mb-1 flex items-center gap-1.5">
                <ShieldCheck size={14} /> Quality Released
              </div>
              <p className="text-xs text-[var(--text-2)]">Released by {existingRelease.releasedBy} on {existingRelease.releasedAt.slice(0, 10)}. {job.jobNumber} is dispatch-eligible.</p>
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
