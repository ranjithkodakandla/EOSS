import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../../store';
import type { SupplierQuotation } from '../../types';

const TODAY = '2026-11-05';
let rfqSeq = 50;

export default function SupplierRFQCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prId = searchParams.get('prId') ?? '';
  const { purchaseReqs, supplierPos, currentUser, addSupplierQuotation, showToast } = useStore();

  const pr = purchaseReqs.find(p => p.id === prId) as (typeof purchaseReqs[0] & Record<string, any>) | undefined;
  const prLines: any[] = pr?.lines ?? [];

  const MOCK_SUPPLIERS = [
    { id: 'supp-msk', name: 'MSK Steel Pvt Ltd' },
    { id: 'supp-ssi', name: 'Stainless Source India' },
    { id: 'supp-sct', name: 'SteelCraft Tubes' },
    { id: 'supp-apex', name: 'Apex Consumables' },
    { id: 'supp-bgs', name: 'Bharat Gas Supply' },
  ];

  const [form, setForm] = useState({
    supplierId: '',
    supplierName: '',
    validDays: '14',
    deliveryDays: '21',
    paymentTerms: 'Net 30',
    notes: '',
  });

  const [lines, setLines] = useState<{ id: string; description: string; uom: string; requiredQty: number; targetRate: number }[]>(
    prLines.length > 0
      ? prLines.map((l: any, i: number) => ({ id: `rl-${i}`, description: l.description, uom: l.uom, requiredQty: l.requiredQty, targetRate: l.targetRate ?? 0 }))
      : [{ id: 'rl-0', description: '', uom: 'kg', requiredQty: 0, targetRate: 0 }]
  );

  const setLine = (id: string, patch: Partial<typeof lines[0]>) =>
    setLines(ls => ls.map(l => l.id === id ? { ...l, ...patch } : l));

  const selectSupplier = (supplierId: string) => {
    const s = MOCK_SUPPLIERS.find(x => x.id === supplierId);
    setForm(f => ({ ...f, supplierId, supplierName: s?.name ?? '' }));
  };

  const canSubmit = form.supplierId && lines.length > 0 && lines.every(l => l.description && l.requiredQty > 0);

  const handleSend = () => {
    const seq = ++rfqSeq;
    const id = `srfq-${seq}`;
    const validUntil = new Date(TODAY);
    validUntil.setDate(validUntil.getDate() + Number(form.validDays));

    const quote: SupplierQuotation = {
      id,
      quoteNumber: `SRFQ-${String(seq).padStart(4, '0')}`,
      supplierId: form.supplierId,
      supplierName: form.supplierName,
      quoteDate: TODAY,
      validUntil: validUntil.toISOString().slice(0, 10),
      deliveryDays: Number(form.deliveryDays),
      paymentTerms: form.paymentTerms,
      prId: prId || undefined,
      status: 'pending',
      lines: lines.map((l, i) => ({
        id: `${id}-l-${i}`,
        quoteId: id,
        materialItemId: `mat-${i}`,
        materialName: l.description,
        orderedQty: l.requiredQty,
        uom: l.uom,
        unitRate: l.targetRate,
        lineTotal: l.targetRate * l.requiredQty,
        leadTimeDays: Number(form.deliveryDays),
      })),
    };
    addSupplierQuotation(quote);
    showToast({ type: 'success', title: 'Supplier RFQ sent', body: `${quote.quoteNumber} sent to ${form.supplierName}.` });
    navigate(`/procurement?tab=quotes`);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <button onClick={() => navigate(prId ? `/procurement/pr/${prId}` : '/procurement?tab=quotes')} className="p-1.5 rounded-lg hover:bg-[var(--surface-2)]">
          <ArrowLeft size={18} className="text-[var(--text-2)]" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-[var(--text)]">Send Supplier RFQ</h1>
          <p className="text-xs text-[var(--text-2)]">{pr ? `From ${pr.prNumber} · ${(pr as any).lines?.length ?? 0} lines` : 'Request for Quotation'}</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto space-y-5">

          {/* Supplier & Terms */}
          <div className="rounded-xl border p-5 space-y-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <h2 className="text-sm font-bold text-[var(--text)]">Supplier & Terms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-3)] mb-1">Supplier *</label>
                <select className="eoss-input w-full" value={form.supplierId} onChange={e => selectSupplier(e.target.value)}>
                  <option value="">— Select supplier —</option>
                  {MOCK_SUPPLIERS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-3)] mb-1">Quote Valid For (days)</label>
                <select className="eoss-input w-full" value={form.validDays} onChange={e => setForm(f => ({ ...f, validDays: e.target.value }))}>
                  {['7', '14', '21', '30'].map(d => <option key={d} value={d}>{d} days</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-3)] mb-1">Expected Delivery (days)</label>
                <input type="number" className="eoss-input w-full" value={form.deliveryDays} onChange={e => setForm(f => ({ ...f, deliveryDays: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-3)] mb-1">Payment Terms</label>
                <input className="eoss-input w-full" value={form.paymentTerms} onChange={e => setForm(f => ({ ...f, paymentTerms: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-[var(--text-3)] mb-1">Notes to Supplier</label>
                <textarea className="eoss-input w-full" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Lines */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[var(--text)]">Lines</h2>
              <button onClick={() => setLines(ls => [...ls, { id: `rl-${Date.now()}`, description: '', uom: 'kg', requiredQty: 0, targetRate: 0 }])}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: 'var(--brand-fill)' }}>
                <Plus size={13} /> Add Line
              </button>
            </div>
            {lines.map((line, idx) => (
              <div key={line.id} className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[var(--text-2)]">Line {idx + 1}</span>
                  {lines.length > 1 && (
                    <button onClick={() => setLines(ls => ls.filter(l => l.id !== line.id))} className="p-1 rounded hover:bg-[var(--surface-2)]">
                      <Trash2 size={13} className="text-red-500" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs text-[var(--text-3)] mb-1">Description *</label>
                    <input className="eoss-input w-full" value={line.description} onChange={e => setLine(line.id, { description: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--text-3)] mb-1">Qty *</label>
                    <input type="number" min={1} className="eoss-input w-full" value={line.requiredQty || ''} onChange={e => setLine(line.id, { requiredQty: Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--text-3)] mb-1">UOM</label>
                    <select className="eoss-input w-full" value={line.uom} onChange={e => setLine(line.id, { uom: e.target.value })}>
                      {['kg', 'nos', 'mtr', 'pcs', 'sheets', 'ltrs', 'sets'].map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--text-3)] mb-1">Target Rate (₹)</label>
                    <input type="number" min={0} className="eoss-input w-full" value={line.targetRate || ''} onChange={e => setLine(line.id, { targetRate: Number(e.target.value) })} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <button onClick={() => navigate(prId ? `/procurement/pr/${prId}` : '/procurement?tab=quotes')}
          className="px-4 py-2 rounded-lg border text-sm font-medium" style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}>
          Cancel
        </button>
        <button onClick={handleSend} disabled={!canSubmit}
          className="px-5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40" style={{ background: 'var(--brand-fill)' }}>
          Send RFQ to Supplier
        </button>
      </div>
    </div>
  );
}
