import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Check } from 'lucide-react';
import { useStore, CUSTOMERS } from '../../store';
import type { CustomerQuotation, CustomerQuotationLine } from '../../types';

const DEMO_NOW = new Date().toISOString().slice(0, 10);
const addDays = (d: string, n: number) => {
  const dt = new Date(d);
  dt.setDate(dt.getDate() + n);
  return dt.toISOString().slice(0, 10);
};

interface QLine {
  id: string;
  drawingNumber: string;
  drawingRevision: string;
  productName: string;
  orderedQty: number;
  uom: string;
  unitPrice: number;
  requiredDate: string;
}

function newLine(n: number, rfqLine?: any): QLine {
  return {
    id: `ql-${Date.now()}-${n}`,
    drawingNumber: rfqLine?.drawingNumber ?? '',
    drawingRevision: rfqLine?.drawingRevision ?? 'A',
    productName: rfqLine?.description ?? rfqLine?.partName ?? '',
    orderedQty: rfqLine?.quantity ?? rfqLine?.qty ?? 1,
    uom: rfqLine?.uom ?? 'Nos',
    unitPrice: rfqLine?.targetPrice ?? 0,
    requiredDate: rfqLine?.requiredBy ?? '',
  };
}

export default function QuotationCreate() {
  const { rfqId } = useParams<{ rfqId: string }>();
  const navigate = useNavigate();
  const { rfqs, addQuotation, currentUser, showToast } = useStore();

  const rfq = rfqs.find(r => r.id === rfqId) as (typeof rfqs[0] & Record<string, any>) | undefined;
  const rfqLines: any[] = rfq?.lines ?? [];

  const [validDays, setValidDays] = useState('30');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<QLine[]>(
    rfqLines.length > 0 ? rfqLines.map((l, i) => newLine(i + 1, l)) : [newLine(1)]
  );

  if (!rfq) return <div className="p-8 text-sm text-[var(--text-2)]">RFQ not found.</div>;

  const addLine = () => setLines(ls => [...ls, newLine(ls.length + 1)]);
  const removeLine = (id: string) => setLines(ls => ls.filter(l => l.id !== id));
  const updateLine = (id: string, field: keyof QLine, value: any) =>
    setLines(ls => ls.map(l => l.id === id ? { ...l, [field]: value } : l));

  const totalValue = lines.reduce((s, l) => s + l.orderedQty * l.unitPrice, 0);
  const fmtMoney = (n: number) => `₹${n.toLocaleString('en-IN')}`;
  const validUntil = addDays(DEMO_NOW, parseInt(validDays) || 30);

  const handleSubmit = () => {
    const seq = Date.now().toString().slice(-4);
    const quotationNumber = `QT-${seq}`;

    const quotation: CustomerQuotation = {
      id: `qt-${seq}`,
      quotationNumber,
      rfqId: rfq.id,
      rfqNumber: rfq.rfqNumber,
      customerId: rfq.customerId,
      customerName: rfq.customerName,
      quotationDate: DEMO_NOW,
      validUntil,
      currency: 'INR',
      status: 'draft',
      totalValue,
      revision: 1,
      owner: currentUser.name,
      notes,
    };

    const qLines: CustomerQuotationLine[] = lines.map((l, i) => ({
      id: `${quotation.id}-l${i + 1}`,
      quotationId: quotation.id,
      productId: `prod-${i + 1}`,
      productName: l.productName,
      drawingNumber: l.drawingNumber,
      drawingRevision: l.drawingRevision,
      orderedQty: l.orderedQty,
      uom: l.uom,
      unitPrice: l.unitPrice,
      value: l.orderedQty * l.unitPrice,
      requiredDate: l.requiredDate,
    }));

    addQuotation(quotation, qLines);
    // Also update RFQ status
    showToast({ type: 'success', title: 'Quotation created', body: `${quotationNumber} drafted for ${rfq.customerName}.` });
    navigate(`/sales/quotation/qt-${seq}`);
  };

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="flex-shrink-0 px-6 py-4 border-b flex items-center gap-3" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <button onClick={() => navigate(`/sales/rfq/${rfqId}`)} className="p-1.5 rounded-lg hover:bg-[var(--surface-2)]">
          <ArrowLeft size={18} className="text-[var(--text-2)]" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-[var(--text)]">New Quotation</h1>
          <p className="text-xs text-[var(--text-2)]">Against {rfq.rfqNumber} · {rfq.customerName}</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto space-y-5">

          {/* Header */}
          <Card title="Quotation Details">
            <div className="grid md:grid-cols-3 gap-4">
              <Field label="Quotation Date">
                <input type="text" value={DEMO_NOW} disabled className="eoss-input opacity-60 cursor-not-allowed" />
              </Field>
              <Field label="Valid For (days)">
                <select value={validDays} onChange={e => setValidDays(e.target.value)} className="eoss-input">
                  {['15', '30', '45', '60', '90'].map(d => <option key={d} value={d}>{d} days (until {addDays(DEMO_NOW, parseInt(d))})</option>)}
                </select>
              </Field>
              <Field label="Prepared By">
                <input value={currentUser.name} disabled className="eoss-input opacity-60 cursor-not-allowed" />
              </Field>
            </div>
          </Card>

          {/* Lines */}
          <Card title="Quotation Lines" trailing={
            <button onClick={addLine} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-white" style={{ background: 'var(--brand)' }}>
              <Plus size={12} /> Add Line
            </button>
          }>
            {lines.map((l, idx) => (
              <div key={l.id} className={`${idx > 0 ? 'mt-4 pt-4 border-t' : ''}`} style={idx > 0 ? { borderColor: 'var(--border)' } : {}}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[var(--text-2)]">Line {idx + 1}</span>
                  {lines.length > 1 && (
                    <button onClick={() => removeLine(l.id)} className="p-1 rounded hover:bg-red-50 text-red-500">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                  <Field label="Drawing No.">
                    <input value={l.drawingNumber} onChange={e => updateLine(l.id, 'drawingNumber', e.target.value)} className="eoss-input" />
                  </Field>
                  <Field label="Rev">
                    <input value={l.drawingRevision} onChange={e => updateLine(l.id, 'drawingRevision', e.target.value)} className="eoss-input" />
                  </Field>
                  <Field label="Required By">
                    <input type="date" value={l.requiredDate} onChange={e => updateLine(l.id, 'requiredDate', e.target.value)} className="eoss-input" />
                  </Field>
                  <Field label="Description" className="md:col-span-2">
                    <input value={l.productName} onChange={e => updateLine(l.id, 'productName', e.target.value)} className="eoss-input" />
                  </Field>
                  <Field label="UOM">
                    <select value={l.uom} onChange={e => updateLine(l.id, 'uom', e.target.value)} className="eoss-input">
                      {['Nos', 'Kg', 'Set', 'MT', 'Ltr', 'Mtr'].map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </Field>
                  <Field label="Qty">
                    <input type="number" min={1} value={l.orderedQty} onChange={e => updateLine(l.id, 'orderedQty', parseInt(e.target.value) || 1)} className="eoss-input" />
                  </Field>
                  <Field label="Unit Price (₹)">
                    <input type="number" min={0} value={l.unitPrice} onChange={e => updateLine(l.id, 'unitPrice', parseFloat(e.target.value) || 0)} className="eoss-input" />
                  </Field>
                  <Field label="Line Value">
                    <input value={fmtMoney(l.orderedQty * l.unitPrice)} disabled className="eoss-input opacity-60 cursor-not-allowed font-mono" />
                  </Field>
                </div>
              </div>
            ))}

            <div className="mt-4 pt-3 border-t flex justify-end" style={{ borderColor: 'var(--border)' }}>
              <div className="text-right">
                <div className="text-xs text-[var(--text-3)]">Total Quotation Value</div>
                <div className="text-xl font-bold text-[var(--text)] font-mono">{fmtMoney(totalValue)}</div>
              </div>
            </div>
          </Card>

          {/* Notes */}
          <Card title="Notes to Customer">
            <textarea value={notes} onChange={e => setNotes(e.target.value)} className="eoss-input w-full" rows={3} placeholder="Validity, delivery lead time, exclusions, special terms…" />
          </Card>
        </div>
      </div>

      <div className="flex-shrink-0 px-6 py-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <button onClick={() => navigate(`/sales/rfq/${rfqId}`)} className="px-4 py-2 rounded-lg text-sm border" style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}>
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={lines.some(l => !l.drawingNumber || !l.productName)}
          className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40"
          style={{ background: 'var(--brand)' }}
        >
          <Check size={15} /> Save Quotation
        </button>
      </div>
    </div>
  );
}

function Card({ title, children, trailing }: { title: string; children: React.ReactNode; trailing?: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-[var(--text)]">{title}</h3>
        {trailing}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-[var(--text-2)] mb-1">{label}</label>
      {children}
    </div>
  );
}
