import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, CheckCircle } from 'lucide-react';
import { useStore } from '../../store';
import type { JobUpdate } from '../../types';

export default function StageUpdate() {
  const { id, stageId } = useParams<{ id: string; stageId: string }>();
  const navigate = useNavigate();
  const { jobs, currentUser, addJobUpdate, showToast } = useStore();

  const job = jobs.find(j => j.id === id);
  const stage = job?.stages.find(s => s.id === stageId);

  const [form, setForm] = useState({
    action: 'continue' as JobUpdate['action'],
    completedGoodQty: 0,
    rejectedQty: 0,
    reworkQty: 0,
    scrapQty: 0,
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);

  if (!job || !stage) return <div className="p-6 text-[var(--text-2)]">Stage not found</div>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.completedGoodQty < 0) return;
    const update: JobUpdate = {
      id: `upd-${Date.now()}`,
      jobStageId: stage.id,
      stageName: stage.name,
      action: form.action,
      completedGoodQty: form.completedGoodQty,
      rejectedQty: form.rejectedQty,
      reworkQty: form.reworkQty,
      scrapQty: form.scrapQty,
      notes: form.notes,
      performedByEmployeeId: currentUser.id,
      performedByName: currentUser.name,
      loggedByUserId: currentUser.id,
      loggedByName: currentUser.name,
      timestamp: new Date().toISOString(),
      hasPhoto: false,
    };
    addJobUpdate(job.id, update);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="p-6 max-w-lg mx-auto text-center mt-20">
        <CheckCircle size={48} className="text-[var(--success)] mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[var(--text)] mb-2">Update Recorded</h2>
        <p className="text-sm text-[var(--text-2)] mb-6">Stage update for <strong>{stage.name}</strong> has been saved.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate(`/jobs/${job.id}`)} className="px-4 py-2 bg-[var(--brand-fill)] text-white rounded-lg text-sm font-medium">
            Back to Job
          </button>
          <button onClick={() => { setSubmitted(false); setForm({ action: 'continue', completedGoodQty: 0, rejectedQty: 0, reworkQty: 0, scrapQty: 0, notes: '' }); }} className="px-4 py-2 border border-[var(--border)] rounded-lg text-sm text-[var(--text-2)]">
            Add Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-4 md:p-6">
      <div className="flex items-center gap-2 mb-5">
        <button onClick={() => navigate(`/jobs/${job.id}`)} className="text-[var(--text-3)] hover:text-[var(--text)]">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="font-bold text-[var(--text)]">Stage Update</h1>
          <p className="text-sm text-[var(--text-2)]">{job.jobNumber} · {stage.name}</p>
        </div>
      </div>

      {/* Stage context */}
      <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4 mb-5 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div><span className="text-[var(--text-3)] text-xs">Work Centre</span><div className="text-[var(--text)]">{stage.workCentre}</div></div>
          <div><span className="text-[var(--text-3)] text-xs">Input Qty</span><div className="text-[var(--text)]">{stage.inputQty} {stage.uom}</div></div>
          <div><span className="text-[var(--text-3)] text-xs">Done So Far</span><div className="text-[var(--success)] font-semibold">{stage.completedGoodQty}</div></div>
          <div><span className="text-[var(--text-3)] text-xs">Remaining</span><div className="text-[var(--text)]">{stage.inputQty - stage.completedGoodQty}</div></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
        {/* Action */}
        <div>
          <label className="block text-xs font-semibold text-[var(--text-2)] mb-2">Action</label>
          <div className="grid grid-cols-3 gap-2">
            {(['continue', 'hold', 'complete'] as const).map(a => (
              <button
                key={a}
                type="button"
                onClick={() => setForm(f => ({ ...f, action: a }))}
                className={`py-2 rounded-lg border text-sm font-medium capitalize transition-colors ${
                  form.action === a ? 'bg-[var(--brand-fill)] border-[var(--brand)] text-white' : 'border-[var(--border)] text-[var(--text-2)] hover:bg-[var(--surface-2)]'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Quantities */}
        <div className="grid grid-cols-2 gap-3">
          <NumField label="Good Qty" value={form.completedGoodQty} uom={stage.uom}
            onChange={v => setForm(f => ({ ...f, completedGoodQty: v }))} />
          <NumField label="Rejected Qty" value={form.rejectedQty} uom={stage.uom}
            onChange={v => setForm(f => ({ ...f, rejectedQty: v }))} />
          <NumField label="Rework Qty" value={form.reworkQty} uom={stage.uom}
            onChange={v => setForm(f => ({ ...f, reworkQty: v }))} />
          <NumField label="Scrap Qty" value={form.scrapQty} uom={stage.uom}
            onChange={v => setForm(f => ({ ...f, scrapQty: v }))} />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-[var(--text-2)] mb-1">Notes / Observations</label>
          <textarea
            rows={3}
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="Any issues, deviations or notes…"
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] placeholder:text-[var(--text-3)] focus:outline-none focus:border-[var(--brand)] resize-none"
          />
        </div>

        {/* Photo placeholder */}
        <div className="flex items-center gap-3 p-3 border border-dashed border-[var(--border)] rounded-lg cursor-pointer hover:bg-[var(--surface-2)] transition-colors">
          <Camera size={18} className="text-[var(--text-3)]" />
          <span className="text-sm text-[var(--text-3)]">Attach photo (optional)</span>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(`/jobs/${job.id}`)} className="flex-1 py-2.5 border border-[var(--border)] rounded-lg text-sm text-[var(--text-2)]">
            Cancel
          </button>
          <button type="submit" className="flex-1 py-2.5 bg-[var(--brand-fill)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--brand-700)]">
            Save Update
          </button>
        </div>
      </form>
    </div>
  );
}

function NumField({ label, value, uom, onChange }: { label: string; value: number; uom: string; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[var(--text-2)] mb-1">{label} <span className="text-[var(--text-3)]">({uom})</span></label>
      <input
        type="number"
        min={0}
        value={value}
        onChange={e => onChange(parseInt(e.target.value) || 0)}
        className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--brand)]"
      />
    </div>
  );
}
