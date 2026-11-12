import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, FileText, Info, AlertCircle } from 'lucide-react';
import { useStore } from '../../store';
import { computeGstTotals, getEligiblePOLinesForInvoice, inferTaxTypeFromGstins } from '../../domain/finance';

interface DraftLine {
  poLineId?: string;
  drawingNumber: string;
  productName: string;
  hsnSac: string;
  orderedQty: number;
  alreadyInvoicedQty: number;
  remainingQty: number;
  quantity: number;
  uom: string;
  unitPrice: number;
  discountPct: number;
  taxPct: number;
}

const addDays = (dateStr: string, days: number) => {
  const d = new Date(dateStr || new Date().toISOString().slice(0, 10));
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const parsePaymentDays = (terms?: string) => {
  const m = terms?.match(/(\d+)/);
  return m ? Number(m[1]) : 30;
};

export default function InvoiceCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialPoId = searchParams.get('poId') ?? '';
  const initialDispatchId = searchParams.get('dispatchId') ?? '';

  const {
    customerPos, poLines, dispatches, invoices, invoiceLines, customers, companyConfig,
    createCustomerInvoice, showToast,
  } = useStore();

  const preselectedDispatch = dispatches.find(d => d.id === initialDispatchId);
  const resolvedInitialPoId = initialPoId
    || preselectedDispatch?.customerPoId
    || customerPos.find(p => p.poNumber === preselectedDispatch?.customerPoNumber)?.id
    || customerPos.find(p => p.status !== 'cancelled')?.id
    || '';

  const [poId, setPoId] = useState(resolvedInitialPoId);
  const [selectedDispatchIds, setSelectedDispatchIds] = useState<string[]>(initialDispatchId ? [initialDispatchId] : []);
  const [invoiceDate, setInvoiceDate] = useState('2026-11-12');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [dueDate, setDueDate] = useState('2026-12-12');
  const [taxType, setTaxType] = useState<'CGST_SGST' | 'IGST' | 'Export_LUT'>('CGST_SGST');
  const [discountAmount, setDiscountAmount] = useState('0');
  const [freightAmount, setFreightAmount] = useState('0');
  const [otherCharges, setOtherCharges] = useState('0');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<DraftLine[]>([]);
  const [error, setError] = useState('');

  const po = customerPos.find(p => p.id === poId);
  const customer = po ? customers.find(c => c.id === po.customerId) : undefined;
  const poDispatches = useMemo(
    () => (po ? dispatches.filter(d => d.customerPoId === po.id || d.customerPoNumber === po.poNumber || d.customerId === po.customerId) : []),
    [po, dispatches]
  );

  useEffect(() => {
    if (!po) {
      setLines([]);
      return;
    }
    const eligible = getEligiblePOLinesForInvoice({
      po,
      poLines,
      dispatches,
      invoices,
      invoiceLines,
    });
    const days = parsePaymentDays(po.paymentTerms);
    setPaymentTerms(po.paymentTerms || 'Net 30');
    setDueDate(addDays(invoiceDate, days));
    setTaxType(inferTaxTypeFromGstins({
      sellerGstin: companyConfig.gstin,
      buyerGstin: customer?.gstin,
      buyerState: customer?.state,
      buyerCountry: customer?.currency && customer.currency !== 'INR' ? 'Export' : undefined,
    }));

    if (eligible.length > 0) {
      setLines(eligible.map(e => ({
        poLineId: e.poLineId,
        drawingNumber: e.drawingNumber,
        productName: e.description,
        hsnSac: '7308',
        orderedQty: e.orderedQty,
        alreadyInvoicedQty: e.alreadyInvoicedQty,
        remainingQty: e.remainingQty,
        quantity: e.remainingQty,
        uom: e.uom,
        unitPrice: e.unitRate,
        discountPct: 0,
        taxPct: 18,
      })));
    } else {
      setLines([{
        drawingNumber: po.poNumber,
        productName: `Supply against ${po.poNumber}`,
        hsnSac: '7308',
        orderedQty: 1,
        alreadyInvoicedQty: 0,
        remainingQty: 1,
        quantity: 1,
        uom: 'Lot',
        unitPrice: po.totalValue,
        discountPct: 0,
        taxPct: 18,
      }]);
    }
  }, [poId]);

  const totals = useMemo(() => computeGstTotals({
    lines: lines.map(l => ({ quantity: l.quantity, unitPrice: l.unitPrice, discountPct: l.discountPct, taxPct: l.taxPct })),
    taxType,
    invoiceDiscountAmount: Number(discountAmount) || 0,
    freightAmount: Number(freightAmount) || 0,
    otherCharges: Number(otherCharges) || 0,
  }), [lines, taxType, discountAmount, freightAmount, otherCharges]);

  const handleSubmit = (issueNow: boolean) => {
    setError('');
    if (!po) {
      setError('Select a Customer PO to invoice.');
      return;
    }
    const res = createCustomerInvoice({
      poId: po.id,
      dispatchIds: selectedDispatchIds,
      invoiceDate,
      dueDate,
      paymentTerms,
      taxType,
      discountAmount: Number(discountAmount) || 0,
      freightAmount: Number(freightAmount) || 0,
      otherCharges: Number(otherCharges) || 0,
      notes: notes.trim() || undefined,
      issueNow,
      lines: lines.map(l => ({
        poLineId: l.poLineId,
        drawingNumber: l.drawingNumber,
        productName: l.productName,
        hsnSac: l.hsnSac,
        quantity: l.quantity,
        uom: l.uom,
        unitPrice: l.unitPrice,
        discountPct: l.discountPct,
        taxPct: l.taxPct,
        dispatchId: selectedDispatchIds[0],
      })),
    });
    if (!res.ok) {
      setError(res.error || 'Could not create invoice.');
      showToast({ type: 'error', title: 'Invoice validation failed', body: res.error });
      return;
    }
    if (res.invoice) navigate(`/finance/invoice/${res.invoice.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate('/finance?tab=invoices')} className="text-[var(--text-3)] hover:text-[var(--text)]">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-[var(--text)] flex items-center gap-2">
              <FileText size={18} className="text-[var(--brand)]" />
              Create Customer Invoice
            </h1>
            <p className="text-xs text-[var(--text-2)]">Generate a GST tax invoice linked to a Customer PO and Dispatch(es).</p>
          </div>
        </div>
        <span className="text-[11px] px-2.5 py-1 rounded-full bg-[var(--info-bg)] text-[var(--info)] font-medium inline-flex items-center gap-1">
          <Info size={12} /> Prototype Simulation — No GST e-Invoice API call
        </span>
      </div>

      {error && (
        <div className="rounded-xl border border-[var(--error)] bg-[var(--error-bg)] px-4 py-3 text-sm text-[var(--error)] flex items-center gap-2">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
        <div>
          <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Customer PO *</label>
          <select
            value={poId}
            onChange={(e) => setPoId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)]"
          >
            <option value="">Select Customer PO…</option>
            {customerPos.filter(p => p.status !== 'cancelled').map(p => (
              <option key={p.id} value={p.id}>
                {p.poNumber} — {p.customerName} (₹{p.totalValue.toLocaleString('en-IN')})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Tax Treatment</label>
          <select
            value={taxType}
            onChange={(e) => setTaxType(e.target.value as 'CGST_SGST' | 'IGST' | 'Export_LUT')}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)]"
          >
            <option value="CGST_SGST">Intra-State (CGST + SGST)</option>
            <option value="IGST">Inter-State (IGST)</option>
            <option value="Export_LUT">Export under LUT (0% Tax)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Invoice Date *</label>
          <input
            type="date"
            value={invoiceDate}
            onChange={(e) => {
              setInvoiceDate(e.target.value);
              setDueDate(addDays(e.target.value, parsePaymentDays(paymentTerms)));
            }}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Due Date *</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Payment Terms</label>
          <input
            value={paymentTerms}
            onChange={(e) => setPaymentTerms(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Linked Dispatches (optional)</label>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {poDispatches.length === 0 ? (
              <span className="text-xs text-[var(--text-3)]">No dispatches recorded for this customer/PO yet.</span>
            ) : (
              poDispatches.map(d => {
                const checked = selectedDispatchIds.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDispatchIds(prev => checked ? prev.filter(x => x !== d.id) : [...prev, d.id])}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-mono ${checked ? 'border-[var(--brand)] bg-[var(--brand)]/10 text-[var(--brand)] font-semibold' : 'border-[var(--border)] text-[var(--text-2)]'}`}
                  >
                    {d.dispatchNumber} ({d.status.replace(/_/g, ' ')})
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Lines */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--text)]">Invoice Line Items (Over-Invoicing Protected)</h3>
          {po && (
            <Link to={`/sales/po/${po.id}`} className="text-xs font-mono text-[var(--brand)] hover:underline">
              Open {po.poNumber} →
            </Link>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="eoss-table">
            <thead>
              <tr>
                <th>Item / Drawing</th>
                <th>HSN/SAC</th>
                <th className="text-right">Ordered</th>
                <th className="text-right">Invoiced</th>
                <th className="text-right">Invoice Qty</th>
                <th className="text-right">Rate (₹)</th>
                <th className="text-right">GST %</th>
                <th className="text-right">Line Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l, idx) => {
                const lineCalc = totals.computedLines[idx];
                return (
                  <tr key={`${l.drawingNumber}-${idx}`}>
                    <td>
                      <div className="text-sm font-medium text-[var(--text)]">{l.productName}</div>
                      <div className="text-xs font-mono text-[var(--text-3)]">{l.drawingNumber}</div>
                    </td>
                    <td>
                      <input
                        value={l.hsnSac}
                        onChange={(e) => setLines(prev => prev.map((x, i) => i === idx ? { ...x, hsnSac: e.target.value } : x))}
                        className="w-20 px-2 py-1 rounded border border-[var(--border)] bg-[var(--surface)] text-xs font-mono text-[var(--text)]"
                      />
                    </td>
                    <td className="text-right text-xs font-mono text-[var(--text-2)]">{l.orderedQty} {l.uom}</td>
                    <td className="text-right text-xs font-mono text-[var(--text-3)]">{l.alreadyInvoicedQty} {l.uom}</td>
                    <td className="text-right">
                      <input
                        type="number"
                        min={0}
                        max={Math.max(l.remainingQty, l.orderedQty)}
                        value={l.quantity}
                        onChange={(e) => setLines(prev => prev.map((x, i) => i === idx ? { ...x, quantity: Math.max(0, Number(e.target.value) || 0) } : x))}
                        className="w-20 px-2 py-1 rounded border border-[var(--border)] bg-[var(--surface)] text-xs font-mono text-right text-[var(--text)]"
                      />
                    </td>
                    <td className="text-right">
                      <input
                        type="number"
                        min={0}
                        value={l.unitPrice}
                        onChange={(e) => setLines(prev => prev.map((x, i) => i === idx ? { ...x, unitPrice: Math.max(0, Number(e.target.value) || 0) } : x))}
                        className="w-24 px-2 py-1 rounded border border-[var(--border)] bg-[var(--surface)] text-xs font-mono text-right text-[var(--text)]"
                      />
                    </td>
                    <td className="text-right">
                      <input
                        type="number"
                        min={0}
                        max={28}
                        disabled={taxType === 'Export_LUT'}
                        value={taxType === 'Export_LUT' ? 0 : l.taxPct}
                        onChange={(e) => setLines(prev => prev.map((x, i) => i === idx ? { ...x, taxPct: Math.max(0, Number(e.target.value) || 0) } : x))}
                        className="w-16 px-2 py-1 rounded border border-[var(--border)] bg-[var(--surface)] text-xs font-mono text-right text-[var(--text)] disabled:opacity-50"
                      />
                    </td>
                    <td className="text-right font-mono text-sm font-semibold text-[var(--text)]">
                      ₹{(lineCalc?.lineTotal ?? 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Additional charges & Summary */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs text-[var(--text-3)] mb-1">Discount (₹)</label>
              <input type="number" min={0} value={discountAmount} onChange={e => setDiscountAmount(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm font-mono text-[var(--text)]" />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-3)] mb-1">Freight (₹)</label>
              <input type="number" min={0} value={freightAmount} onChange={e => setFreightAmount(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm font-mono text-[var(--text)]" />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-3)] mb-1">Other (₹)</label>
              <input type="number" min={0} value={otherCharges} onChange={e => setOtherCharges(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm font-mono text-[var(--text)]" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-[var(--text-3)] mb-1">Invoice Remarks / E-Way Bill / Terms Notes</label>
            <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Delivery challan or milestone remarks…"
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] resize-none" />
          </div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 space-y-2 text-sm">
          <div className="flex justify-between text-[var(--text-2)]"><span>Taxable Subtotal</span><span className="font-mono">₹{totals.subtotal.toLocaleString('en-IN')}</span></div>
          {taxType === 'CGST_SGST' && (
            <>
              <div className="flex justify-between text-[var(--text-2)]"><span>CGST</span><span className="font-mono">₹{totals.cgstAmount.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between text-[var(--text-2)]"><span>SGST</span><span className="font-mono">₹{totals.sgstAmount.toLocaleString('en-IN')}</span></div>
            </>
          )}
          {taxType === 'IGST' && (
            <div className="flex justify-between text-[var(--text-2)]"><span>IGST</span><span className="font-mono">₹{totals.igstAmount.toLocaleString('en-IN')}</span></div>
          )}
          {taxType === 'Export_LUT' && (
            <div className="flex justify-between text-[var(--text-2)]"><span>Export Tax (LUT)</span><span className="font-mono">₹0</span></div>
          )}
          <div className="border-t border-[var(--border)] pt-2 flex justify-between text-base font-bold text-[var(--text)]">
            <span>Invoice Total</span>
            <span className="font-mono text-[var(--brand)]">₹{totals.totalAmount.toLocaleString('en-IN')}</span>
          </div>
          <div className="pt-3 flex gap-2">
            <button type="button" onClick={() => handleSubmit(false)}
              className="flex-1 py-2.5 rounded-lg border border-[var(--border)] text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-2)]">
              Save as Draft
            </button>
            <button type="button" onClick={() => handleSubmit(true)}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: 'var(--brand-fill)' }}>
              Issue Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
