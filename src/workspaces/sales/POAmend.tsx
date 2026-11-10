import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Save, FileEdit } from 'lucide-react';
import { useStore } from '../../store';

export default function POAmend() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customerPos, poLines, poAmendments, currentUser, addPoAmendment, showToast } = useStore();
  const po = customerPos.find(p => p.id === id);
  const lines = poLines.filter(line => line.poId === id);
  const [reason, setReason] = useState('qty_change');
  const [changeNote, setChangeNote] = useState('');
  const [lineId, setLineId] = useState(lines[0]?.id ?? '');
  const [newQty, setNewQty] = useState('');
  const [newRate, setNewRate] = useState('');
  const [newRequiredDate, setNewRequiredDate] = useState('');
  const [newRevision, setNewRevision] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [deliveryTerms, setDeliveryTerms] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const selectedLine = lines.find(line => line.id === lineId);
  const nextRevision = useMemo(() => {
    const existing = poAmendments.filter(a => a.entityType === 'customer_po' && a.poId === id);
    return Math.max(po?.revision ?? 1, ...existing.map(a => a.revision), 1) + 1;
  }, [po, poAmendments, id]);

  if (!po) return <div className="p-8 text-center text-[var(--text-2)]">Customer PO not found.</div>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeNote.trim()) return;
    const now = new Date().toISOString();
    addPoAmendment({
      id: `amend-cpo-${Date.now()}`, entityType: 'customer_po', poId: po.id, poNumber: po.poNumber,
      revision: nextRevision, reason, changeNote: changeNote.trim(), status: 'pending_approval',
      requestedBy: currentUser.name, requestedAt: now, attachmentName: attachmentName || undefined,
      lineId: selectedLine?.id,
      lineChanges: selectedLine ? { description: newDescription || undefined, drawingRevision: newRevision || undefined, quantity: newQty ? Number(newQty) : undefined, rate: newRate ? Number(newRate) : undefined, requiredDate: newRequiredDate || undefined } : undefined,
      headerChanges: { paymentTerms: paymentTerms || undefined, deliveryTerms: deliveryTerms || undefined },
      beforeSnapshot: { poStatus: po.status, totalValue: po.totalValue, paymentTerms: po.paymentTerms, deliveryTerms: po.deliveryTerms, line: selectedLine ?? null },
    });
    setSubmitted(true);
    showToast({ type: 'success', title: 'Amendment submitted', body: `${po.poNumber} is pending owner approval as Rev ${nextRevision}.` });
    setTimeout(() => navigate(`/sales/po/${id}`), 700);
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">
      <div>
        <button onClick={() => navigate(`/sales/po/${id}`)} className="flex items-center gap-1.5 text-sm text-[var(--text-2)] hover:text-[var(--brand)] mb-3"><ArrowLeft size={14} /> Back to {po.poNumber}</button>
        <div className="flex items-center gap-2"><FileEdit size={20} className="text-[var(--brand)]" /><h1 className="text-xl font-bold text-[var(--text)]">Amend Customer PO</h1></div>
        <p className="text-sm text-[var(--text-2)] mt-1">{po.poNumber} · {po.customerName} · New revision will be Rev {nextRevision}</p>
      </div>
      <div className="flex items-start gap-3 p-3.5 rounded-xl" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)' }}><AlertTriangle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" /><div className="text-xs text-amber-700"><strong>Approval required.</strong> The current PO remains binding until the owner approves this amendment. The approved change is recorded as a new revision.</div></div>
      <form onSubmit={handleSubmit} className="rounded-2xl border p-5 space-y-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div><label className="block text-xs font-semibold text-[var(--text-2)] mb-1.5">Amendment Reason *</label><select required value={reason} onChange={e => setReason(e.target.value)} className="eoss-input w-full"><option value="qty_change">Quantity Change</option><option value="price_revision">Price Revision</option><option value="delivery_date">Delivery Date Change</option><option value="spec_change">Specification / Drawing Revision</option><option value="add_line">Add New Line</option><option value="cancel_line">Cancel Existing Line</option><option value="commercial_terms">Commercial Terms</option><option value="other">Other</option></select></div>
        {lines.length > 0 && <div className="space-y-3"><h3 className="text-sm font-semibold text-[var(--text)]">Line changes</h3><select value={lineId} onChange={e => setLineId(e.target.value)} className="eoss-input w-full"><option value="">No line selected</option>{lines.map(line => <option key={line.id} value={line.id}>{line.drawingNumber} · {line.description}</option>)}</select>{selectedLine && <div className="grid md:grid-cols-2 gap-3 p-3 rounded-lg" style={{ background: 'var(--surface-2)' }}><Field label={`Quantity (current ${selectedLine.orderedQty})`} value={newQty} onChange={setNewQty} type="number" /><Field label={`Rate (current ₹${selectedLine.rate.toLocaleString('en-IN')})`} value={newRate} onChange={setNewRate} type="number" /><Field label={`Required date (current ${selectedLine.requiredDate})`} value={newRequiredDate} onChange={setNewRequiredDate} type="date" /><Field label={`Drawing revision (current ${selectedLine.revision})`} value={newRevision} onChange={setNewRevision} /><Field label="Description" value={newDescription} onChange={setNewDescription} className="md:col-span-2" /></div>}</div>}
        <div><h3 className="text-sm font-semibold text-[var(--text)] mb-3">Header / commercial changes</h3><div className="grid md:grid-cols-2 gap-3"><Field label={`Payment terms (current ${po.paymentTerms})`} value={paymentTerms} onChange={setPaymentTerms} placeholder="Leave blank to keep current" /><Field label={`Delivery terms (current ${po.deliveryTerms})`} value={deliveryTerms} onChange={setDeliveryTerms} placeholder="Leave blank to keep current" /></div></div>
        <div><label className="block text-xs font-semibold text-[var(--text-2)] mb-1.5">Change description *</label><textarea required value={changeNote} onChange={e => setChangeNote(e.target.value)} rows={4} placeholder="State the reason and exact old value → new value." className="eoss-input w-full resize-none" /></div>
        <div><label className="block text-xs font-semibold text-[var(--text-2)] mb-1.5">Customer evidence (optional)</label><input type="file" accept=".pdf,.jpg,.jpeg,.png,.msg,.eml" onChange={e => setAttachmentName(e.target.files?.[0]?.name ?? '')} className="eoss-input w-full text-xs" /></div>
        <div className="flex items-center justify-end gap-3 pt-2"><button type="button" onClick={() => navigate(`/sales/po/${id}`)} className="px-4 py-2 rounded-lg text-sm font-semibold border" style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}>Cancel</button><button type="submit" disabled={submitted || !changeNote.trim()} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40" style={{ background: 'var(--brand)' }}><Save size={14} />{submitted ? 'Submitted…' : 'Submit for Approval'}</button></div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder, className = '' }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string; className?: string }) {
  return <label className={`block ${className}`}><span className="block text-xs font-medium text-[var(--text-2)] mb-1">{label}</span><input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="eoss-input w-full" /></label>;
}
