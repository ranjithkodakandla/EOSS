import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../../store';
import type { PurchaseRequisition } from '../../types';

type Step = 1 | 2 | 3;

interface PRLine {
  id: string;
  materialCode: string;
  description: string;
  uom: string;
  requiredQty: number;
  targetRate: number;
  requiredBy: string;
  notes: string;
}

const UOM_OPTIONS = ['kg', 'nos', 'mtr', 'pcs', 'sheets', 'ltrs', 'sets', 'rolls'];
const TODAY = '2026-11-05';

let prSeq = 100;

export default function PRCreate() {
  const navigate = useNavigate();
  const { currentUser, jobs, addPurchaseReq, showToast } = useStore();

  const [step, setStep] = useState<Step>(1);

  // Step 1 — Header
  const [header, setHeader] = useState({
    jobId: '',
    raisedBy: currentUser.name,
    requiredBy: '',
    priority: 'normal' as PurchaseRequisition['priority'],
    purpose: '',
    notes: '',
  });

  // Step 2 — Lines
  const [lines, setLines] = useState<PRLine[]>([
    { id: 'l-1', materialCode: '', description: '', uom: 'kg', requiredQty: 0, targetRate: 0, requiredBy: '', notes: '' },
  ]);

  const activeJobs = jobs.filter(j => j.status === 'active' || j.status === 'hold');
  const selectedJob = activeJobs.find(j => j.id === header.jobId);

  const addLine = () =>
    setLines(ls => [...ls, { id: `l-${Date.now()}`, materialCode: '', description: '', uom: 'kg', requiredQty: 0, targetRate: 0, requiredBy: '', notes: '' }]);

  const removeLine = (id: string) => setLines(ls => ls.filter(l => l.id !== id));

  const setLine = (id: string, patch: Partial<PRLine>) =>
    setLines(ls => ls.map(l => l.id === id ? { ...l, ...patch } : l));

  const canNext: Record<Step, boolean> = {
    1: !!header.raisedBy && !!header.requiredBy,
    2: lines.length > 0 && lines.every(l => l.description && l.requiredQty > 0),
    3: true,
  };

  const handleSubmit = () => {
    const seq = ++prSeq;
    const id = `pr-new-${seq}`;
    const pr: PurchaseRequisition & Record<string, any> = {
      id,
      prNumber: `PR-${TODAY.slice(0, 4)}-${String(seq).padStart(3, '0')}`,
      raisedBy: header.raisedBy,
      raisedDate: TODAY,
      requiredBy: header.requiredBy,
      jobId: header.jobId || undefined,
      jobNumber: selectedJob?.jobNumber,
      status: ['owner', 'buyer'].includes(currentUser.role) ? 'approved' : 'pending',
      lineCount: lines.length,
      totalQty: lines.reduce((s, l) => s + l.requiredQty, 0),
      priority: header.priority,
      lines,
      purpose: header.purpose,
      notes: header.notes,
    };
    addPurchaseReq(pr);
    showToast({ type: 'success', title: 'Purchase Requisition created', body: `${pr.prNumber} raised.` });
    navigate(`/procurement/pr/${id}`);
  };

  const steps = [
    { n: 1 as Step, label: 'Header' },
    { n: 2 as Step, label: 'Lines' },
    { n: 3 as Step, label: 'Review' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header bar */}
      <div className="flex-shrink-0 flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <button onClick={() => navigate('/procurement?tab=pr')} className="p-1.5 rounded-lg hover:bg-[var(--surface-2)]">
          <ArrowLeft size={18} className="text-[var(--text-2)]" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-[var(--text)]">New Purchase Requisition</h1>
          <p className="text-xs text-[var(--text-2)]">Raise a material requirement for production</p>
        </div>
        {/* Step indicator */}
        <div className="ml-auto flex items-center gap-1">
          {steps.map((s, i) => (
            <React.Fragment key={s.n}>
              {i > 0 && <div className="w-8 h-px" style={{ background: step > s.n ? 'var(--brand)' : 'var(--border)' }} />}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors"
                style={{
                  background: step === s.n ? 'var(--brand)' : step > s.n ? 'var(--success-bg,#F0FDF4)' : 'var(--surface-2)',
                  color: step === s.n ? '#fff' : step > s.n ? 'var(--success,#16A34A)' : 'var(--text-2)',
                }}>
                {step > s.n ? '✓' : s.n} {s.label}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto space-y-5">

          {step === 1 && (
            <div className="rounded-xl border p-5 space-y-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              <h2 className="text-sm font-bold text-[var(--text)]">Requisition Header</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-3)] mb-1">Raised By *</label>
                  <input className="eoss-input w-full" value={header.raisedBy} onChange={e => setHeader(h => ({ ...h, raisedBy: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-3)] mb-1">Required By *</label>
                  <input type="date" className="eoss-input w-full" value={header.requiredBy} onChange={e => setHeader(h => ({ ...h, requiredBy: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-3)] mb-1">Priority</label>
                  <select className="eoss-input w-full" value={header.priority} onChange={e => setHeader(h => ({ ...h, priority: e.target.value as any }))}>
                    {['low', 'normal', 'high', 'urgent'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-3)] mb-1">Job Reference (optional)</label>
                  <select className="eoss-input w-full" value={header.jobId} onChange={e => setHeader(h => ({ ...h, jobId: e.target.value }))}>
                    <option value="">— Not linked to a job —</option>
                    {activeJobs.map(j => <option key={j.id} value={j.id}>{j.jobNumber} · {j.description}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-[var(--text-3)] mb-1">Purpose</label>
                  <input className="eoss-input w-full" placeholder="e.g. SS 316 plates for reactor shell" value={header.purpose} onChange={e => setHeader(h => ({ ...h, purpose: e.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-[var(--text-3)] mb-1">Internal Notes</label>
                  <textarea className="eoss-input w-full" rows={2} value={header.notes} onChange={e => setHeader(h => ({ ...h, notes: e.target.value }))} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[var(--text)]">Material Lines</h2>
                <button onClick={addLine} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: 'var(--brand)' }}>
                  <Plus size={13} /> Add Line
                </button>
              </div>

              {lines.map((line, idx) => (
                <div key={line.id} className="rounded-xl border p-4 space-y-3" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--text-2)]">Line {idx + 1}</span>
                    {lines.length > 1 && (
                      <button onClick={() => removeLine(line.id)} className="p-1 rounded hover:bg-[var(--surface-2)]">
                        <Trash2 size={13} className="text-red-500" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-[var(--text-3)] mb-1">Material Code</label>
                      <input className="eoss-input w-full" placeholder="e.g. SS316-6MM" value={line.materialCode} onChange={e => setLine(line.id, { materialCode: e.target.value })} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-[var(--text-3)] mb-1">Description *</label>
                      <input className="eoss-input w-full" placeholder="e.g. SS 316 Plate 6mm thk" value={line.description} onChange={e => setLine(line.id, { description: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--text-3)] mb-1">Qty *</label>
                      <input type="number" min={1} className="eoss-input w-full" value={line.requiredQty || ''} onChange={e => setLine(line.id, { requiredQty: Number(e.target.value) })} />
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--text-3)] mb-1">UOM</label>
                      <select className="eoss-input w-full" value={line.uom} onChange={e => setLine(line.id, { uom: e.target.value })}>
                        {UOM_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--text-3)] mb-1">Target Rate (₹)</label>
                      <input type="number" min={0} className="eoss-input w-full" value={line.targetRate || ''} onChange={e => setLine(line.id, { targetRate: Number(e.target.value) })} />
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--text-3)] mb-1">Required By</label>
                      <input type="date" className="eoss-input w-full" value={line.requiredBy} onChange={e => setLine(line.id, { requiredBy: e.target.value })} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-[var(--text-3)] mb-1">Notes</label>
                      <input className="eoss-input w-full" value={line.notes} onChange={e => setLine(line.id, { notes: e.target.value })} />
                    </div>
                    {line.targetRate > 0 && line.requiredQty > 0 && (
                      <div className="text-xs text-right text-[var(--text-2)] font-mono">
                        Est. value: ₹{(line.targetRate * line.requiredQty).toLocaleString('en-IN')}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div className="text-right text-sm font-semibold font-mono text-[var(--text)]">
                Total Qty: {lines.reduce((s, l) => s + l.requiredQty, 0)} · Est. Value: ₹{lines.reduce((s, l) => s + l.targetRate * l.requiredQty, 0).toLocaleString('en-IN')}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-xl border p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                <h2 className="text-sm font-bold text-[var(--text)] mb-3">Review & Submit</h2>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  {[
                    { label: 'Raised By', value: header.raisedBy },
                    { label: 'Required By', value: header.requiredBy },
                    { label: 'Priority', value: header.priority },
                    { label: 'Job Ref', value: selectedJob ? `${selectedJob.jobNumber} · ${selectedJob.description}` : '—' },
                    { label: 'Purpose', value: header.purpose || '—' },
                    { label: 'Lines', value: `${lines.length} material(s)` },
                    { label: 'Total Qty', value: lines.reduce((s, l) => s + l.requiredQty, 0).toString() },
                    { label: 'Est. Value', value: `₹${lines.reduce((s, l) => s + l.targetRate * l.requiredQty, 0).toLocaleString('en-IN')}` },
                  ].map((f, i) => (
                    <div key={i}>
                      <dt className="text-xs text-[var(--text-3)]">{f.label}</dt>
                      <dd className="text-sm font-medium text-[var(--text)] mt-0.5">{f.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="rounded-xl border overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
                <table className="eoss-table">
                  <thead>
                    <tr><th>#</th><th>Code</th><th>Description</th><th>Qty</th><th>UOM</th><th>Target Rate</th><th>Est. Value</th></tr>
                  </thead>
                  <tbody>
                    {lines.map((l, i) => (
                      <tr key={l.id}>
                        <td className="text-xs text-[var(--text-3)]">{i + 1}</td>
                        <td className="font-mono text-xs">{l.materialCode || '—'}</td>
                        <td>{l.description}</td>
                        <td className="font-mono text-right">{l.requiredQty}</td>
                        <td>{l.uom}</td>
                        <td className="font-mono text-right">{l.targetRate ? `₹${l.targetRate.toLocaleString('en-IN')}` : '—'}</td>
                        <td className="font-mono text-right">{l.targetRate && l.requiredQty ? `₹${(l.targetRate * l.requiredQty).toLocaleString('en-IN')}` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {['owner', 'buyer'].includes(currentUser.role) && (
                <div className="rounded-lg p-3 text-xs" style={{ background: 'var(--success-bg,#F0FDF4)', color: 'var(--success,#16A34A)' }}>
                  As {currentUser.role}, this PR will be <strong>auto-approved</strong> on submission.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <button
          onClick={() => step > 1 ? setStep((step - 1) as Step) : navigate('/procurement?tab=pr')}
          className="px-4 py-2 rounded-lg border text-sm font-medium"
          style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}>
          {step === 1 ? 'Cancel' : '← Back'}
        </button>
        <button
          onClick={() => step < 3 ? setStep((step + 1) as Step) : handleSubmit()}
          disabled={!canNext[step]}
          className="px-5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40"
          style={{ background: 'var(--brand)' }}>
          {step < 3 ? 'Next →' : 'Submit PR'}
        </button>
      </div>
    </div>
  );
}
