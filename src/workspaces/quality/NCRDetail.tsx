import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';

export default function NCRDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { ncrs, lots, jobs, currentUser, showToast } = useStore();
  const [disposition, setDisposition] = useState('');

  const ncr = ncrs.find(n => n.id === id);
  if (!ncr) return <div className="p-6 text-[var(--text-2)]">NCR not found</div>;

  const lot = ncr.lotId ? lots.find(l => l.id === ncr.lotId) : null;
  const job = ncr.jobId ? jobs.find(j => j.id === ncr.jobId) : null;
  const canDispose = ['owner', 'qc'].includes(currentUser.role);

  const handleDispose = () => {
    if (!disposition) return;
    showToast({ type: 'success', title: 'Disposition recorded', body: `NCR ${ncr.ncrNumber} disposition: ${disposition}` });
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate('/quality')} className="text-[var(--text-3)] hover:text-[var(--text)]"><ArrowLeft size={16} /></button>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-bold text-[var(--text)] font-mono">{ncr.ncrNumber}</h1>
            <StatusChip status={ncr.severity.toLowerCase()} label={ncr.severity} />
            <StatusChip status={ncr.status} />
          </div>
          <p className="text-sm text-[var(--text-2)]">{ncr.sourceType} · Raised by {ncr.raisedBy}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <h3 className="font-semibold text-sm text-[var(--text)] mb-3">NCR Details</h3>
            <dl className="space-y-2.5 text-sm">
              <Field label="Source" value={ncr.sourceType} />
              <Field label="Severity" value={ncr.severity} />
              <Field label="Affected Qty" value={`${ncr.affectedQty} units`} />
              <Field label="Disposition" value={ncr.disposition} />
              <Field label="Raised By" value={ncr.raisedBy} />
              <Field label="Raised At" value={new Date(ncr.raisedAt).toLocaleString('en-IN')} />
              {lot && <Field label="Lot" value={lot.lotNumber} mono />}
              {job && <Field label="Job" value={job.jobNumber} mono />}
            </dl>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <h3 className="font-semibold text-sm text-[var(--text)] mb-2">Description</h3>
            <p className="text-sm text-[var(--text)]">{ncr.description}</p>
          </div>
        </div>

        {canDispose && ncr.status === 'open' && (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 h-fit">
            <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Record Disposition</h3>
            <div className="space-y-2 mb-4">
              {['Rework', 'Return', 'Scrap', 'Accept-on-Deviation'].map(d => (
                <label key={d} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="disposition" value={d} checked={disposition === d} onChange={() => setDisposition(d)} className="accent-[var(--brand)]" />
                  <span className="text-sm text-[var(--text)]">{d}</span>
                </label>
              ))}
            </div>
            <textarea rows={3} placeholder="Notes on disposition decision…" className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] placeholder:text-[var(--text-3)] focus:outline-none focus:border-[var(--brand)] resize-none mb-3" />
            <button onClick={handleDispose} disabled={!disposition} className="w-full py-2.5 bg-[var(--brand)] text-white rounded-lg text-sm font-medium disabled:opacity-50">
              Record Disposition
            </button>
          </div>
        )}
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
