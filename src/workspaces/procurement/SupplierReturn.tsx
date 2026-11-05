import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Truck, Plus, AlertTriangle, CheckCircle } from 'lucide-react';
import { useStore, SUPPLIERS } from '../../store';
import StatusChip from '../../components/layout/StatusChip';

export default function SupplierReturn() {
  const navigate = useNavigate();
  const { grns, supplierPos, showToast } = useStore();

  const [selectedGrn, setSelectedGrn] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [disposition, setDisposition] = useState<'return_to_supplier' | 'replace' | 'credit_note'>('return_to_supplier');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const acceptedGrns = grns.filter(g => g.status === 'accepted' || g.status === 'partial');
  const selectedGrnObj = grns.find(g => g.id === selectedGrn);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGrn || !returnReason) return;
    setSubmitted(true);
    showToast({ type: 'success', title: 'Supplier return initiated', body: `Return note against GRN ${selectedGrnObj?.grnNumber} raised. Awaiting supplier confirmation.` });
    setTimeout(() => navigate('/procurement'), 1500);
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5">
      <div>
        <button
          onClick={() => navigate('/procurement')}
          className="flex items-center gap-1.5 text-sm text-[var(--text-2)] hover:text-[var(--brand)] mb-3 cursor-pointer transition-colors"
        >
          <ArrowLeft size={14} /> Procurement
        </button>
        <div className="flex items-center gap-2">
          <Truck size={20} className="text-orange-500" />
          <h1 className="text-xl font-bold text-[var(--text)]">Supplier Return</h1>
        </div>
        <p className="text-sm text-[var(--text-2)] mt-1">
          Return defective or excess material to supplier against an accepted GRN.
        </p>
      </div>

      {/* Warning */}
      <div
        className="flex items-start gap-3 p-3.5 rounded-xl"
        style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)' }}
      >
        <AlertTriangle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-amber-700">
          A supplier return will create a negative stock movement and reduce the accepted quantity on the GRN. The original GRN is preserved; a return note is raised as a separate document.
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border p-5 space-y-4"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      >
        <div>
          <label className="block text-xs font-semibold text-[var(--text-2)] mb-1.5">Select GRN *</label>
          <select
            required
            value={selectedGrn}
            onChange={e => setSelectedGrn(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            <option value="">Choose an accepted GRN…</option>
            {acceptedGrns.map(g => (
              <option key={g.id} value={g.id}>
                {g.grnNumber} · {g.supplierName} · {g.receivedDate}
              </option>
            ))}
          </select>
        </div>

        {selectedGrnObj && (
          <div
            className="p-3 rounded-lg text-sm space-y-1"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <div className="flex justify-between">
              <span className="text-xs text-[var(--text-2)]">Supplier</span>
              <span className="text-xs font-semibold text-[var(--text)]">{selectedGrnObj.supplierName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-[var(--text-2)]">SPO Ref</span>
              <span className="text-xs font-semibold text-[var(--text)]">{selectedGrnObj.spoNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-[var(--text-2)]">Received</span>
              <span className="text-xs font-semibold text-[var(--text)]">{selectedGrnObj.receivedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-[var(--text-2)]">Status</span>
              <StatusChip status={selectedGrnObj.status} />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-[var(--text-2)] mb-1.5">Return Reason *</label>
          <select
            required
            value={returnReason}
            onChange={e => setReturnReason(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            <option value="">Select reason…</option>
            <option value="quality_rejection">Quality Rejection (failed inspection)</option>
            <option value="excess_supply">Excess Supply (over-delivered)</option>
            <option value="wrong_material">Wrong Material / Specification</option>
            <option value="damage_in_transit">Damage in Transit</option>
            <option value="expired">Expired / Out of Shelf Life</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--text-2)] mb-2">Disposition *</label>
          <div className="flex gap-2 flex-wrap">
            {[
              { value: 'return_to_supplier', label: 'Return to Supplier' },
              { value: 'replace', label: 'Request Replacement' },
              { value: 'credit_note', label: 'Credit Note' },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDisposition(opt.value as typeof disposition)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${disposition === opt.value ? 'text-white border-transparent' : 'border-transparent'}`}
                style={disposition === opt.value
                  ? { background: 'var(--brand)' }
                  : { background: 'var(--surface-2)', color: 'var(--text-2)', border: '1px solid var(--border)' }
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--text-2)] mb-1.5">Notes / NCR Reference</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder="Reference NCR number, inspection report, or any supporting information…"
            className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 resize-none"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/procurement')}
            className="px-4 py-2 rounded-lg text-sm font-semibold border cursor-pointer hover:bg-[var(--surface-2)] transition"
            style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitted || !selectedGrn || !returnReason}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition disabled:opacity-40"
            style={{ background: 'var(--brand)' }}
          >
            {submitted ? <CheckCircle size={14} /> : <Plus size={14} />}
            {submitted ? 'Submitted' : 'Raise Return Note'}
          </button>
        </div>
      </form>
    </div>
  );
}
