import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, FileEdit, Save } from 'lucide-react';
import { useStore } from '../../store';

export default function SupplierPOAmend() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { supplierPos, supplierPoLines, poAmendments, currentUser, addPoAmendment, showToast } = useStore();
  const po = supplierPos.find(p => p.id === id);
  const lines = supplierPoLines.filter(line => line.spoId === id);
  const [reason, setReason] = useState('qty_change');
  const [changeNote, setChangeNote] = useState('');
  const [lineId, setLineId] = useState(lines[0]?.id ?? '');
  const [quantity, setQuantity] = useState('');
  const [rate, setRate] = useState('');
  const [committedDate, setCommittedDate] = useState('');
  const [materialName, setMaterialName] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const selectedLine = lines.find(line => line.id === lineId);
  const nextRevision = useMemo(() => Math.max(po?.revision ?? 1, ...poAmendments.filter(a => a.entityType === 'supplier_po' && a.poId === id).map(a => a.revision), 1) + 1, [po, poAmendments, id]);

  if (!po) return <div className="p-8 text-center text-[var(--text-2)]">Supplier PO not found.</div>;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeNote.trim()) return;
    const now = new Date().toISOString();
    addPoAmendment({
      id: `amend-spo-${Date.now()}`, entityType: 'supplier_po', poId: po.id, poNumber: po.poNumber,
      revision: nextRevision, reason, changeNote: changeNote.trim(), status: 'pending_approval', requestedBy: currentUser.name, requestedAt: now,
      attachmentName: attachmentName || undefined, lineId: selectedLine?.id,
      lineChanges: selectedLine ? { materialName: materialName || undefined, quantity: quantity ? Number(quantity) : undefined, rate: rate ? Number(rate) : undefined, requiredDate: committedDate || undefined } : undefined,
      headerChanges: { paymentTerms: paymentTerms || undefined, committedDate: committedDate || undefined },
      beforeSnapshot: { poStatus: po.status, totalValue: po.totalValue, paymentTerms: po.paymentTerms, committedDate: po.committedDate, line: selectedLine ?? null },
    });
    setSubmitted(true);
    showToast({ type: 'success', title: 'Supplier PO amendment submitted', body: `${po.poNumber} is pending owner approval as Rev ${nextRevision}.` });
    setTimeout(() => navigate(`/procurement/spo/${id}`), 700);
  };

  return <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">
    <div><button onClick={() => navigate(`/procurement/spo/${id}`)} className="flex items-center gap-1.5 text-sm text-[var(--text-2)] hover:text-[var(--brand)] mb-3"><ArrowLeft size={14} /> Back to {po.poNumber}</button><div className="flex items-center gap-2"><FileEdit size={20} className="text-[var(--brand)]" /><h1 className="text-xl font-bold text-[var(--text)]">Amend Supplier PO</h1></div><p className="text-sm text-[var(--text-2)] mt-1">{po.poNumber} · {po.supplierName} · New revision will be Rev {nextRevision}</p></div>
    <div className="flex items-start gap-3 p-3.5 rounded-xl" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)' }}><AlertTriangle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" /><div className="text-xs text-amber-700"><strong>Approval required.</strong> The current supplier PO remains binding until the owner approves the amendment.</div></div>
    <form onSubmit={submit} className="rounded-2xl border p-5 space-y-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <div><label className="block text-xs font-semibold text-[var(--text-2)] mb-1.5">Amendment Reason *</label><select value={reason} onChange={e => setReason(e.target.value)} className="eoss-input w-full"><option value="qty_change">Quantity Change</option><option value="price_revision">Price Revision</option><option value="delivery_date">Committed Date Change</option><option value="material_change">Material / Specification Change</option><option value="commercial_terms">Commercial Terms</option><option value="other">Other</option></select></div>
      {lines.length > 0 && <div className="space-y-3"><h3 className="text-sm font-semibold text-[var(--text)]">Line changes</h3><select value={lineId} onChange={e => setLineId(e.target.value)} className="eoss-input w-full"><option value="">No line selected</option>{lines.map(line => <option key={line.id} value={line.id}>{line.materialName}</option>)}</select>{selectedLine && <div className="grid md:grid-cols-2 gap-3 p-3 rounded-lg" style={{ background: 'var(--surface-2)' }}><Field label={`Material (current ${selectedLine.materialName})`} value={materialName} onChange={setMaterialName} /><Field label={`Quantity (current ${selectedLine.orderedQty})`} value={quantity} onChange={setQuantity} type="number" /><Field label={`Rate (current ₹${selectedLine.rate.toLocaleString('en-IN')})`} value={rate} onChange={setRate} type="number" /><Field label={`Committed date (current ${selectedLine.committedDate})`} value={committedDate} onChange={setCommittedDate} type="date" /></div>}</div>}
      <div><Field label={`Payment terms (current ${po.paymentTerms})`} value={paymentTerms} onChange={setPaymentTerms} placeholder="Leave blank to keep current" /></div>
      <div><label className="block text-xs font-semibold text-[var(--text-2)] mb-1.5">Change description *</label><textarea required value={changeNote} onChange={e => setChangeNote(e.target.value)} rows={4} placeholder="State the reason and exact old value → new value." className="eoss-input w-full resize-none" /></div>
      <div><label className="block text-xs font-semibold text-[var(--text-2)] mb-1.5">Supplier evidence (optional)</label><input type="file" accept=".pdf,.jpg,.jpeg,.png,.msg,.eml" onChange={e => setAttachmentName(e.target.files?.[0]?.name ?? '')} className="eoss-input w-full text-xs" /></div>
      <div className="flex justify-end gap-3"><button type="button" onClick={() => navigate(`/procurement/spo/${id}`)} className="px-4 py-2 rounded-lg text-sm font-semibold border" style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}>Cancel</button><button type="submit" disabled={submitted || !changeNote.trim()} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40" style={{ background: 'var(--brand)' }}><Save size={14} />{submitted ? 'Submitted…' : 'Submit for Approval'}</button></div>
    </form>
  </div>;
}

function Field({ label, value, onChange, type = 'text', placeholder }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) {
  return <label className="block"><span className="block text-xs font-medium text-[var(--text-2)] mb-1">{label}</span><input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="eoss-input w-full" /></label>;
}
