import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, CheckCircle2, Info, AlertCircle } from 'lucide-react';
import { useStore } from '../../store';
import { computeGstTotals, computeThreeWayMatch } from '../../domain/finance';
import StatusChip from '../../components/layout/StatusChip';

interface DraftBillLine {
  spoLineId?: string;
  materialItemId?: string;
  materialCode?: string;
  description: string;
  hsnSac: string;
  billedQty: number;
  uom: string;
  unitRate: number;
  taxPct: number;
}

export default function SupplierBillCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const presetSpoId = searchParams.get('spoId') ?? '';
  const presetGrnId = searchParams.get('grnId') ?? '';

  const {
    suppliers, supplierPos, supplierPoLines, grns, lots, inspections,
    createSupplierBill, showToast,
  } = useStore();

  const presetGrn = grns.find(g => g.id === presetGrnId);
  const resolvedSpoId = presetSpoId || presetGrn?.spoId || supplierPos[0]?.id || '';
  const presetSpo = supplierPos.find(p => p.id === resolvedSpoId);

  const [supplierId, setSupplierId] = useState(presetSpo?.supplierId || presetGrn?.supplierId || suppliers[0]?.id || '');
  const [spoId, setSpoId] = useState(resolvedSpoId);
  const [selectedGrnIds, setSelectedGrnIds] = useState<string[]>(presetGrnId ? [presetGrnId] : []);
  const [supplierInvoiceNo, setSupplierInvoiceNo] = useState('');
  const [billDate, setBillDate] = useState('2026-11-12');
  const [dueDate, setDueDate] = useState('2026-12-12');
  const [taxType, setTaxType] = useState<'CGST_SGST' | 'IGST'>('CGST_SGST');
  const [otherCharges, setOtherCharges] = useState('0');
  const [mismatchNotes, setMismatchNotes] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<DraftBillLine[]>([]);
  const [error, setError] = useState('');

  const supplierSpos = useMemo(() => supplierPos.filter(p => p.supplierId === supplierId), [supplierPos, supplierId]);
  const selectedSpo = supplierPos.find(p => p.id === spoId);
  const spoGrns = useMemo(
    () => grns.filter(g => (spoId ? g.spoId === spoId : g.supplierId === supplierId)),
    [grns, spoId, supplierId]
  );

  useEffect(() => {
    const matchedGrns = grns.filter(g => g.spoId === spoId).map(g => g.id);
    if (!presetGrnId) setSelectedGrnIds(matchedGrns);
    const sLines = supplierPoLines.filter(l => l.spoId === spoId);
    if (sLines.length > 0) {
      setLines(sLines.map(sl => ({
        spoLineId: sl.id,
        materialItemId: sl.materialItemId,
        materialCode: sl.materialCode,
        description: sl.materialName,
        hsnSac: '7208',
        billedQty: sl.acceptedQty > 0 ? sl.acceptedQty : (sl.receivedQty > 0 ? sl.receivedQty : sl.orderedQty),
        uom: sl.uom,
        unitRate: sl.rate,
        taxPct: 18,
      })));
    } else if (selectedSpo) {
      setLines([{
        description: `Supplies under ${selectedSpo.poNumber}`,
        hsnSac: '7308',
        billedQty: 1,
        uom: 'Lot',
        unitRate: selectedSpo.totalValue,
        taxPct: 18,
      }]);
    }
  }, [spoId]);

  const totals = useMemo(() => computeGstTotals({
    lines: lines.map(l => ({ quantity: l.billedQty, unitPrice: l.unitRate, taxPct: l.taxPct })),
    taxType,
    otherCharges: Number(otherCharges) || 0,
  }), [lines, taxType, otherCharges]);

  const matchPreview = useMemo(() => computeThreeWayMatch({
    bill: { spoId: spoId || undefined, grnIds: selectedGrnIds, supplierId },
    billLines: lines.map((l, idx) => ({
      id: `preview-${idx}`,
      spoLineId: l.spoLineId,
      materialItemId: l.materialItemId,
      description: l.description,
      billedQty: l.billedQty,
      unitRate: l.unitRate,
      uom: l.uom,
    })),
    spo: selectedSpo,
    spoLines: supplierPoLines,
    grns,
    lots,
    inspections,
  }), [spoId, selectedGrnIds, supplierId, lines, selectedSpo, supplierPoLines, grns, lots, inspections]);

  const handleSubmit = () => {
    setError('');
    const res = createSupplierBill({
      supplierId,
      supplierInvoiceNo,
      spoId: spoId || undefined,
      grnIds: selectedGrnIds,
      billDate,
      dueDate,
      paymentTerms: selectedSpo?.paymentTerms,
      taxType,
      otherCharges: Number(otherCharges) || 0,
      mismatchNotes: mismatchNotes.trim() || undefined,
      notes: notes.trim() || undefined,
      lines,
    });
    if (!res.ok) {
      setError(res.error || 'Failed to capture supplier bill.');
      showToast({ type: 'error', title: 'Supplier Bill error', body: res.error });
      return;
    }
    if (res.bill) navigate(`/finance/bill/${res.bill.id}`);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate('/finance?tab=bills')} className="text-[var(--text-3)] hover:text-[var(--text)]">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-[var(--text)]">Capture Supplier Bill & 3-Way Match</h1>
            <p className="text-xs text-[var(--text-2)]">Verify Supplier PO rates, GRN received quantities, and QC accepted stock before payment approval.</p>
          </div>
        </div>
        <span className="text-[11px] px-2.5 py-1 rounded-full bg-[var(--info-bg)] text-[var(--info)] font-medium inline-flex items-center gap-1">
          <Info size={12} /> Prototype Simulation — Vendor bill entry & matching
        </span>
      </div>

      {error && (
        <div className="rounded-xl border border-[var(--error)] bg-[var(--error-bg)] px-4 py-3 text-sm text-[var(--error)] flex items-center gap-2">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
        <div>
          <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Supplier *</label>
          <select value={supplierId} onChange={(e) => {
            setSupplierId(e.target.value);
            const first = supplierPos.find(p => p.supplierId === e.target.value);
            setSpoId(first?.id ?? '');
          }} className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)]">
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.tradingName}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Supplier PO</label>
          <select value={spoId} onChange={e => setSpoId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)]">
            <option value="">No Linked SPO (Direct Expense)</option>
            {supplierSpos.map(p => (
              <option key={p.id} value={p.id}>{p.poNumber} — ₹{p.totalValue.toLocaleString('en-IN')} ({p.status})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Vendor Invoice Number *</label>
          <input value={supplierInvoiceNo} onChange={e => setSupplierInvoiceNo(e.target.value)} placeholder="e.g. SINV-SFA-2026-881"
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm font-mono text-[var(--text)]" />
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Bill Date *</label>
          <input type="date" value={billDate} onChange={e => setBillDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)]" />
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Due Date *</label>
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)]" />
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--text-2)] mb-1">GST Type</label>
          <select value={taxType} onChange={e => setTaxType(e.target.value as 'CGST_SGST' | 'IGST')}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)]">
            <option value="CGST_SGST">CGST + SGST</option>
            <option value="IGST">IGST</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Linked GRNs</label>
          <div className="flex flex-wrap gap-2">
            {spoGrns.length === 0 ? (
              <span className="text-xs text-[var(--warning)]">No GRNs recorded against this SPO yet — 3-way match will flag Missing GRN.</span>
            ) : spoGrns.map(g => {
              const active = selectedGrnIds.includes(g.id);
              return (
                <button key={g.id} type="button" onClick={() => setSelectedGrnIds(prev => active ? prev.filter(x => x !== g.id) : [...prev, g.id])}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-mono ${active ? 'border-[var(--brand)] bg-[var(--brand)]/10 text-[var(--brand)] font-semibold' : 'border-[var(--border)] text-[var(--text-2)]'}`}>
                  {g.grnNumber} ({g.status.replace(/_/g, ' ')})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Billed Lines */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--text)]">Billed Quantities & Rates vs 3-Way Match</h3>
          <StatusChip status={matchPreview.overallStatus} size="sm" />
        </div>
        <div className="overflow-x-auto">
          <table className="eoss-table">
            <thead>
              <tr>
                <th>Item</th>
                <th className="text-right">PO Qty / Rate</th>
                <th className="text-right">GRN Recv</th>
                <th className="text-right">QC Accepted</th>
                <th className="text-right">Billed Qty</th>
                <th className="text-right">Billed Rate (₹)</th>
                <th className="text-right">Line Total (₹)</th>
                <th>Match Status</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l, idx) => {
                const m = matchPreview.lines[idx];
                const calc = totals.computedLines[idx];
                return (
                  <tr key={`${l.description}-${idx}`}>
                    <td>
                      <div className="text-sm font-medium text-[var(--text)]">{l.description}</div>
                      {m && <div className="text-[11px] text-[var(--text-3)]">{m.message}</div>}
                    </td>
                    <td className="text-right text-xs font-mono text-[var(--text-2)]">
                      {m?.poOrderedQty ?? 0} {l.uom} @ ₹{(m?.poRate ?? 0).toLocaleString('en-IN')}
                    </td>
                    <td className="text-right text-xs font-mono text-[var(--text-2)]">{m?.grnReceivedQty ?? 0} {l.uom}</td>
                    <td className="text-right text-xs font-mono font-semibold text-[var(--success)]">{m?.qcAcceptedQty ?? 0} {l.uom}</td>
                    <td className="text-right">
                      <input type="number" min={0} value={l.billedQty}
                        onChange={e => setLines(prev => prev.map((x, i) => i === idx ? { ...x, billedQty: Math.max(0, Number(e.target.value) || 0) } : x))}
                        className="w-20 px-2 py-1 rounded border border-[var(--border)] bg-[var(--surface)] text-xs font-mono text-right text-[var(--text)]" />
                    </td>
                    <td className="text-right">
                      <input type="number" min={0} value={l.unitRate}
                        onChange={e => setLines(prev => prev.map((x, i) => i === idx ? { ...x, unitRate: Math.max(0, Number(e.target.value) || 0) } : x))}
                        className="w-24 px-2 py-1 rounded border border-[var(--border)] bg-[var(--surface)] text-xs font-mono text-right text-[var(--text)]" />
                    </td>
                    <td className="text-right font-mono text-sm font-semibold text-[var(--text)]">₹{(calc?.lineTotal ?? 0).toLocaleString('en-IN')}</td>
                    <td>{m && <StatusChip status={m.status} size="sm" />}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Match Banner + Totals */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 space-y-3">
          <div className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${matchPreview.hasMismatch ? 'border-[var(--warning)] bg-[var(--warning-bg)] text-[var(--warning)]' : 'border-[var(--success)] bg-[var(--success-bg)] text-[var(--success)]'}`}>
            {matchPreview.hasMismatch ? <AlertTriangle size={15} className="mt-0.5 flex-shrink-0" /> : <CheckCircle2 size={15} className="mt-0.5 flex-shrink-0" />}
            <div>
              <div className="font-semibold">{matchPreview.hasMismatch ? '3-Way Match Exception Detected' : '3-Way Match Clean'}</div>
              <div className="mt-0.5">{matchPreview.summaryText}</div>
            </div>
          </div>
          {matchPreview.hasMismatch && (
            <div>
              <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Variance Explanation Note</label>
              <textarea rows={2} value={mismatchNotes} onChange={e => setMismatchNotes(e.target.value)}
                placeholder="Explain rate/quantity variance for approver review…"
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] resize-none" />
            </div>
          )}
          <div>
            <label className="block text-xs text-[var(--text-3)] mb-1">General Notes</label>
            <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional bill reference or freight note"
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)]" />
          </div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 space-y-2 text-sm">
          <div className="flex justify-between text-[var(--text-2)]"><span>Subtotal</span><span className="font-mono">₹{totals.subtotal.toLocaleString('en-IN')}</span></div>
          <div className="flex justify-between text-[var(--text-2)]"><span>GST ({taxType === 'CGST_SGST' ? 'CGST + SGST' : 'IGST'})</span><span className="font-mono">₹{totals.taxAmount.toLocaleString('en-IN')}</span></div>
          <div>
            <label className="flex justify-between items-center text-[var(--text-2)]">
              <span>Other Charges (₹)</span>
              <input type="number" min={0} value={otherCharges} onChange={e => setOtherCharges(e.target.value)}
                className="w-28 px-2 py-1 rounded border border-[var(--border)] bg-[var(--surface)] text-xs font-mono text-right text-[var(--text)]" />
            </label>
          </div>
          <div className="border-t border-[var(--border)] pt-2 flex justify-between text-base font-bold text-[var(--text)]">
            <span>Bill Total</span>
            <span className="font-mono text-[var(--brand)]">₹{totals.totalAmount.toLocaleString('en-IN')}</span>
          </div>
          <button type="button" onClick={handleSubmit}
            className="w-full mt-2 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: 'var(--brand-fill)' }}>
            Capture Supplier Bill
          </button>
        </div>
      </div>
    </div>
  );
}
