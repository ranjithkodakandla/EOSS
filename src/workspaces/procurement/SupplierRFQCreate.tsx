import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../../store';
import type { SupplierQuotation, SupplierQuotationLine } from '../../types';

const TODAY = new Date().toISOString().slice(0, 10);
let rfqSeq = 100;

export default function SupplierRFQCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialPrId = searchParams.get('prId') ?? '';
  const { purchaseReqs, suppliers, materials, supplierQuotations, addSupplierQuotation, showToast } = useStore();

  const [selectedPrId, setSelectedPrId] = useState(initialPrId);
  const pr = purchaseReqs.find(p => p.id === selectedPrId);

  const [form, setForm] = useState({
    supplierId: '',
    supplierName: '',
    recordMode: 'received' as 'received' | 'pending',
    validDays: '14',
    deliveryDays: '10',
    paymentTerms: 'Net 30 days',
    taxPct: '18',
    freightIncluded: true,
    notes: '',
  });

  const buildInitialLines = (targetPrId: string) => {
    const targetPr = purchaseReqs.find(p => p.id === targetPrId);
    const prLines = targetPr?.lines ?? [];
    if (prLines.length > 0) {
      return prLines.map((l, i) => ({
        id: `ql-${i}-${Date.now()}`,
        materialItemId: l.materialItemId || '',
        materialCode: l.materialCode || '',
        description: l.description || l.materialName,
        grade: l.grade || '',
        uom: l.uom || 'kg',
        requiredQty: l.requiredQty,
        unitPrice: l.estimatedPrice ?? 0,
      }));
    }
    return [{
      id: `ql-0-${Date.now()}`,
      materialItemId: '',
      materialCode: '',
      description: '',
      grade: '',
      uom: 'kg',
      requiredQty: 0,
      unitPrice: 0,
    }];
  };

  const [lines, setLines] = useState(() => buildInitialLines(initialPrId));

  const handlePrChange = (nextPrId: string) => {
    setSelectedPrId(nextPrId);
    setLines(buildInitialLines(nextPrId));
  };

  const setLine = (id: string, patch: Partial<typeof lines[0]>) =>
    setLines(ls => ls.map(l => l.id === id ? { ...l, ...patch } : l));

  const selectSupplier = (supplierId: string) => {
    const s = suppliers.find(x => x.id === supplierId);
    setForm(f => ({ ...f, supplierId, supplierName: s?.tradingName ?? s?.legalName ?? '' }));
  };

  const alreadyRequested = Boolean(
    selectedPrId && form.supplierId &&
    supplierQuotations.some(q => q.prId === selectedPrId && q.supplierId === form.supplierId && q.status !== 'rejected')
  );

  const canSubmit = Boolean(
    form.supplierId &&
    !alreadyRequested &&
    lines.length > 0 &&
    lines.every(l => l.description.trim() && l.requiredQty > 0 && (form.recordMode === 'pending' || l.unitPrice > 0))
  );

  const subtotal = lines.reduce((sum, l) => sum + (l.requiredQty * (l.unitPrice || 0)), 0);
  const taxAmount = subtotal * (Number(form.taxPct || 0) / 100);
  const totalWithTax = Math.round(subtotal + taxAmount);

  const handleSave = () => {
    const seq = ++rfqSeq;
    const id = `sq-${Date.now()}-${seq}`;
    const validUntil = new Date(TODAY);
    validUntil.setDate(validUntil.getDate() + Math.max(1, Number(form.validDays) || 14));
    const quoteNumber = `${form.recordMode === 'received' ? 'SQ' : 'SRFQ'}-${TODAY.slice(0, 4)}-${String(supplierQuotations.length + 101).padStart(3, '0')}`;

    const quoteLines: SupplierQuotationLine[] = lines.map((l, i) => ({
      id: `${id}-l-${i}`,
      quoteId: id,
      materialItemId: l.materialItemId || `mat-${i}`,
      materialCode: l.materialCode || undefined,
      materialName: l.description.trim(),
      grade: l.grade || undefined,
      quotedQty: l.requiredQty,
      orderedQty: l.requiredQty,
      uom: l.uom,
      unitPrice: l.unitPrice,
      unitRate: l.unitPrice,
      taxPct: Number(form.taxPct) || 0,
      freightIncluded: form.freightIncluded,
      lineTotal: Math.round(l.unitPrice * l.requiredQty),
      leadTimeDays: Number(form.deliveryDays) || 10,
    }));

    const quote: SupplierQuotation = {
      id,
      quoteNumber,
      supplierId: form.supplierId,
      supplierName: form.supplierName,
      quoteDate: TODAY,
      validUntil: validUntil.toISOString().slice(0, 10),
      currency: 'INR',
      deliveryDays: Number(form.deliveryDays) || 10,
      paymentTerms: form.paymentTerms,
      prId: selectedPrId || undefined,
      prNumber: pr?.prNumber,
      status: form.recordMode,
      recordType: form.recordMode === 'received' ? 'quotation' : 'rfq',
      notes: form.notes.trim() || undefined,
      lines: quoteLines,
    };
    addSupplierQuotation(quote);
    showToast({
      type: 'success',
      title: form.recordMode === 'received' ? 'Supplier quotation recorded' : 'Supplier RFQ logged',
      body: `${quote.quoteNumber} from ${form.supplierName}${pr ? ` linked to ${pr.prNumber}` : ''}.`,
    });
    if (selectedPrId) {
      navigate(`/procurement/pr/${selectedPrId}`);
    } else {
      navigate(`/procurement/quote/${quote.id}`);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <button type="button" onClick={() => navigate(selectedPrId ? `/procurement/pr/${selectedPrId}` : '/procurement?tab=quotes')} className="p-1.5 rounded-lg hover:bg-[var(--surface-2)]">
          <ArrowLeft size={18} className="text-[var(--text-2)]" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-[var(--text)]">Record Supplier Quotation / RFQ</h1>
          <p className="text-xs text-[var(--text-2)]">{pr ? `Linked to ${pr.prNumber} · ${pr.lines?.length ?? 0} line(s)` : 'Supplier quotation for procurement comparison'}</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="rounded-xl border p-5 space-y-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <h2 className="text-sm font-bold text-[var(--text)]">Originating PR & Supplier Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-3)] mb-1">Purchase Requisition</label>
                <select className="eoss-input w-full" value={selectedPrId} onChange={e => handlePrChange(e.target.value)}>
                  <option value="">— Standalone Quotation —</option>
                  {purchaseReqs.filter(p => p.status !== 'cancelled').map(p => (
                    <option key={p.id} value={p.id}>{p.prNumber} ({p.purpose || `${p.lineCount} lines`})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-3)] mb-1">Entry Mode</label>
                <select className="eoss-input w-full" value={form.recordMode} onChange={e => setForm(f => ({ ...f, recordMode: e.target.value as 'received' | 'pending' }))}>
                  <option value="received">Quotation Received (with unit prices)</option>
                  <option value="pending">RFQ Sent (awaiting supplier quote)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-3)] mb-1">Supplier *</label>
                <select className="eoss-input w-full" value={form.supplierId} onChange={e => selectSupplier(e.target.value)}>
                  <option value="">— Select supplier —</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.tradingName || s.legalName}</option>)}
                </select>
                {alreadyRequested && <p className="text-xs mt-1 text-[var(--error)]">An active quotation already exists for this supplier on this PR.</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-3)] mb-1">Quote Valid For (days)</label>
                <select className="eoss-input w-full" value={form.validDays} onChange={e => setForm(f => ({ ...f, validDays: e.target.value }))}>
                  {['7', '14', '21', '30', '45'].map(d => <option key={d} value={d}>{d} days</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-3)] mb-1">Delivery Lead Time (days)</label>
                <input type="number" min={1} className="eoss-input w-full" value={form.deliveryDays} onChange={e => setForm(f => ({ ...f, deliveryDays: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-3)] mb-1">Payment Terms</label>
                <input className="eoss-input w-full" value={form.paymentTerms} onChange={e => setForm(f => ({ ...f, paymentTerms: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-3)] mb-1">GST / Tax %</label>
                <input type="number" min={0} max={28} className="eoss-input w-full" value={form.taxPct} onChange={e => setForm(f => ({ ...f, taxPct: e.target.value }))} />
              </div>
              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 text-xs text-[var(--text)] cursor-pointer">
                  <input type="checkbox" checked={form.freightIncluded} onChange={e => setForm(f => ({ ...f, freightIncluded: e.target.checked }))} />
                  Freight included in unit rate
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-[var(--text-3)] mb-1">Commercial Notes</label>
                <textarea className="eoss-input w-full" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="MTC availability, packing charges, delivery remarks..." />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[var(--text)]">Quoted Material Lines</h2>
              <button type="button" onClick={() => setLines(ls => [...ls, { id: `ql-${Date.now()}`, materialItemId: '', materialCode: '', description: '', grade: '', uom: 'kg', requiredQty: 0, unitPrice: 0 }])}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: 'var(--brand-fill)' }}>
                <Plus size={13} /> Add Line
              </button>
            </div>
            {lines.map((line, idx) => (
              <div key={line.id} className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[var(--text-2)]">Line {idx + 1}</span>
                  {lines.length > 1 && (
                    <button type="button" onClick={() => setLines(ls => ls.filter(l => l.id !== line.id))} className="p-1 rounded hover:bg-[var(--surface-2)]">
                      <Trash2 size={13} className="text-red-500" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs text-[var(--text-3)] mb-1">Material / Description *</label>
                    <input className="eoss-input w-full" value={line.description} onChange={e => {
                      const val = e.target.value;
                      const match = materials.find(m => m.name.toLowerCase() === val.toLowerCase());
                      setLine(line.id, { description: val, ...(match ? { materialItemId: match.id, materialCode: match.itemCode, grade: line.grade || match.standardGrade || '' } : {}) });
                    }} />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--text-3)] mb-1">Grade</label>
                    <input className="eoss-input w-full" value={line.grade} onChange={e => setLine(line.id, { grade: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--text-3)] mb-1">Qty *</label>
                    <input type="number" min={0.01} step="any" className="eoss-input w-full" value={line.requiredQty || ''} onChange={e => setLine(line.id, { requiredQty: Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--text-3)] mb-1">UOM</label>
                    <select className="eoss-input w-full" value={line.uom} onChange={e => setLine(line.id, { uom: e.target.value })}>
                      {['kg', 'nos', 'mtr', 'pcs', 'sheets', 'ltrs', 'sets'].map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--text-3)] mb-1">Quoted Rate (₹) {form.recordMode === 'received' ? '*' : ''}</label>
                    <input type="number" min={0} step="any" className="eoss-input w-full" value={line.unitPrice || ''} onChange={e => setLine(line.id, { unitPrice: Number(e.target.value) })} />
                  </div>
                  <div className="md:col-span-2 flex items-end justify-end text-xs font-mono text-[var(--text-2)] pb-1">
                    Line Total: ₹{Math.round((line.requiredQty || 0) * (line.unitPrice || 0)).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            ))}
            {subtotal > 0 && (
              <div className="text-right text-sm font-semibold font-mono text-[var(--text)]">
                Subtotal: ₹{subtotal.toLocaleString('en-IN')} · Est. Total (incl. {form.taxPct}% GST): ₹{totalWithTax.toLocaleString('en-IN')}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <button type="button" onClick={() => navigate(selectedPrId ? `/procurement/pr/${selectedPrId}` : '/procurement?tab=quotes')}
          className="px-4 py-2 rounded-lg border text-sm font-medium" style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}>
          Cancel
        </button>
        <button type="button" onClick={handleSave} disabled={!canSubmit}
          className="px-5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40" style={{ background: 'var(--brand-fill)' }}>
          {form.recordMode === 'received' ? 'Save Supplier Quotation' : 'Send RFQ to Supplier'}
        </button>
      </div>
    </div>
  );
}
