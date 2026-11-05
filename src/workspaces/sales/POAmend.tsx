import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Save, FileEdit } from 'lucide-react';
import { useStore } from '../../store';

export default function POAmend() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customerPos, showToast } = useStore();

  const po = customerPos.find(p => p.id === id);

  const [reason, setReason] = useState('');
  const [changeNote, setChangeNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!po) {
    return (
      <div className="p-8 text-center text-[var(--text-2)]">
        Customer PO not found.{' '}
        <button onClick={() => navigate('/sales')} className="underline text-[var(--brand)]">Back to Sales</button>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || !changeNote.trim()) return;
    setSubmitted(true);
    showToast({ type: 'success', title: 'Amendment request submitted', body: `Amendment for ${po.poNumber} is pending approval.` });
    setTimeout(() => navigate(`/sales/po/${id}`), 1500);
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5">
      <div>
        <button
          onClick={() => navigate(`/sales/po/${id}`)}
          className="flex items-center gap-1.5 text-sm text-[var(--text-2)] hover:text-[var(--brand)] mb-3 cursor-pointer transition-colors"
        >
          <ArrowLeft size={14} /> Back to {po.poNumber}
        </button>
        <div className="flex items-center gap-2">
          <FileEdit size={20} className="text-[var(--brand)]" />
          <h1 className="text-xl font-bold text-[var(--text)]">Amend Customer PO</h1>
        </div>
        <p className="text-sm text-[var(--text-2)] mt-1">
          {po.poNumber} · {po.customerName}
        </p>
      </div>

      {/* Warning */}
      <div
        className="flex items-start gap-3 p-3.5 rounded-xl"
        style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)' }}
      >
        <AlertTriangle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-amber-700">
          <strong>Amendment requires approval.</strong> Any change to quantity, price or delivery date will be flagged for maker-checker review before it becomes binding. The original PO remains in effect until the amendment is approved.
        </div>
      </div>

      {/* Amendment Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border p-5 space-y-4"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      >
        <div>
          <label className="block text-xs font-semibold text-[var(--text-2)] mb-1.5">Amendment Reason *</label>
          <select
            required
            value={reason}
            onChange={e => setReason(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            <option value="">Select reason…</option>
            <option value="qty_change">Quantity Change</option>
            <option value="price_revision">Price Revision</option>
            <option value="delivery_date">Delivery Date Change</option>
            <option value="spec_change">Specification Change</option>
            <option value="add_line">Add New Line</option>
            <option value="cancel_line">Cancel Existing Line</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--text-2)] mb-1.5">Description of Change *</label>
          <textarea
            required
            value={changeNote}
            onChange={e => setChangeNote(e.target.value)}
            rows={4}
            placeholder="Describe exactly what is changing, the old value and the new value…"
            className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 resize-none"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--text-2)] mb-1.5">Attachment (optional)</label>
          <div
            className="border-2 border-dashed rounded-lg p-4 text-center text-sm text-[var(--text-2)] cursor-pointer hover:bg-[var(--surface-2)] transition"
            style={{ borderColor: 'var(--border)' }}
          >
            Upload customer-issued amendment document, email or photo
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(`/sales/po/${id}`)}
            className="px-4 py-2 rounded-lg text-sm font-semibold border cursor-pointer hover:bg-[var(--surface-2)] transition"
            style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitted || !reason || !changeNote.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition disabled:opacity-40"
            style={{ background: 'var(--brand)' }}
          >
            <Save size={14} />
            {submitted ? 'Submitted…' : 'Submit for Approval'}
          </button>
        </div>
      </form>
    </div>
  );
}
