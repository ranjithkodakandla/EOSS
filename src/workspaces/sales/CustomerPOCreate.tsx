import React, { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import type { CustomerPO, POLine } from '../../types';

export default function CustomerPOCreate() {
  const navigate = useNavigate();
  const { quotations, quotationLines, customerPos, convertQuotationToPO, showToast } = useStore();
  const [quotationId, setQuotationId] = useState('');
  const available = useMemo(() => quotations.filter(q => q.status === 'accepted' && !customerPos.some(po => po.quotationRef === q.quotationNumber)), [quotations, customerPos]);
  const selected = quotations.find(q => q.id === quotationId);
  const lines = selected ? quotationLines.filter(l => l.quotationId === selected.id) : [];

  const create = () => {
    if (!selected) return;
    const seq = Date.now().toString().slice(-5);
    const poId = `cpo-${seq}`;
    const po: CustomerPO = { id: poId, poNumber: `CPO-${seq}`, customerId: selected.customerId, customerName: selected.customerName, acceptedDate: new Date().toISOString().slice(0, 10), paymentTerms: selected.paymentTerms ?? 'Net 30', status: 'pending', totalValue: selected.totalValue, currency: selected.currency, lineCount: lines.length, quotationRef: selected.quotationNumber, deliveryTerms: selected.deliveryTerms ?? '' };
    const poLines: POLine[] = lines.map((line, index) => ({ id: `${poId}-l${index + 1}`, poId, drawingNumber: line.drawingNumber, revision: line.drawingRevision, description: line.productName, orderedQty: line.orderedQty, uom: line.uom, requiredDate: line.requiredDate, rate: line.unitPrice, value: line.value, status: 'pending' }));
    convertQuotationToPO(selected.id, po, poLines);
    showToast({ type: 'success', title: 'Customer PO created for review', body: `${po.poNumber} is awaiting owner approval.` });
    navigate(`/sales/po/${po.id}`);
  };

  return <div className="flex flex-col h-full"><div className="flex-shrink-0 flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}><button onClick={() => navigate('/sales?tab=pos')} className="p-1.5 rounded-lg"><ArrowLeft size={18} style={{ color: 'var(--text-2)' }} /></button><div><h1 className="text-lg font-bold" style={{ color: 'var(--text)' }}>Add Customer PO</h1><p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>Select an accepted quotation. The PO will enter review before execution.</p></div></div><div className="flex-1 overflow-auto p-6"><div className="max-w-3xl mx-auto space-y-5"><div className="rounded-xl border p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}><h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text)' }}>Quotation source</h2>{available.length === 0 ? <div className="rounded-lg p-4 text-sm" style={{ background: 'var(--surface-2)', color: 'var(--text-2)' }}>No accepted quotations are available. Prepare and accept a Customer Quotation first, then return here to create the Customer PO.</div> : <select value={quotationId} onChange={e => setQuotationId(e.target.value)} className="eoss-input w-full"><option value="">Select an accepted quotation</option>{available.map(q => <option key={q.id} value={q.id}>{q.quotationNumber} · {q.customerName} · ₹{q.totalValue.toLocaleString('en-IN')}</option>)}</select>}</div>{selected && <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}><div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}><FileText size={15} style={{ color: 'var(--brand)' }} /><span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{selected.quotationNumber} · {selected.customerName}</span></div><div className="p-4"><div className="grid grid-cols-3 gap-3 mb-4"><Summary label="Lines" value={String(lines.length)} /><Summary label="Total" value={`₹${selected.totalValue.toLocaleString('en-IN')}`} /><Summary label="Status" value="Pending approval" /></div><p className="text-xs" style={{ color: 'var(--text-2)' }}>The originating RFQ and quotation remain linked. Approval will release this Customer PO for jobs and delivery.</p></div></div>}</div></div><div className="flex-shrink-0 flex justify-between px-6 py-4 border-t" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}><button onClick={() => navigate('/sales?tab=pos')} className="px-4 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}>Cancel</button><button disabled={!selected} onClick={create} className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40" style={{ background: 'var(--brand)' }}><CheckCircle2 size={14} /> Create for Review</button></div></div>;
}
function Summary({ label, value }: { label: string; value: string }) { return <div><div className="text-[11px]" style={{ color: 'var(--text-3)' }}>{label}</div><div className="text-sm font-semibold mt-0.5" style={{ color: 'var(--text)' }}>{value}</div></div>; }
