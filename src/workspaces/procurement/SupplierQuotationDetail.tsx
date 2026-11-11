import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, FileText, Pencil, Save, XCircle } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';
import RelatedRecordsPanel from '../../components/workflow/RelatedRecordsPanel';
import { useReturnNavigation } from '../../hooks/useReturnNavigation';

const fmt = (d?: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export default function SupplierQuotationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    supplierQuotations, supplierInvitations, purchaseReqs, supplierPos, currentUser,
    updateSupplierQuotation, selectQuotation, approveFinalizeQuotation, rejectQuotationApproval,
    generateSPOFromQuotation, showToast,
  } = useStore();
  const { goBack, originUrl } = useReturnNavigation('/procurement?tab=quotes');

  const quote = supplierQuotations.find(q => q.id === id);
  const [editingPricing, setEditingPricing] = useState(false);
  const [deliveryDays, setDeliveryDays] = useState(String(quote?.deliveryDays ?? 10));
  const [paymentTerms, setPaymentTerms] = useState(quote?.paymentTerms ?? 'Net 30 days');
  const [notes, setNotes] = useState(quote?.notes ?? '');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [linePrices, setLinePrices] = useState<Record<string, number>>(
    Object.fromEntries((quote?.lines ?? []).map(l => [l.id, l.unitPrice ?? l.unitRate ?? 0]))
  );

  if (!quote) {
    return (
      <div className="p-8 text-center text-sm text-[var(--text-2)]">
        Supplier quotation not found.{' '}
        <Link to="/procurement?tab=quotes" className="text-[var(--brand)] underline">Back to Quotations</Link>
      </div>
    );
  }

  const pr = quote.prId ? purchaseReqs.find(p => p.id === quote.prId) : undefined;
  const linkedInvitation = supplierInvitations.find(i => i.id === quote.invitationId || (quote.prId && i.prId === quote.prId && i.supplierId === quote.supplierId));
  const linkedSpo = supplierPos.find(po =>
    (po.supplierQuotationId === quote.id || (quote.prId && po.prId === quote.prId)) && !['cancelled', 'supplier_declined'].includes(po.status)
  );
  const canApprove = ['owner', 'buyer'].includes(currentUser.role);

  const subtotal = quote.lines.reduce((s, l) => s + (l.lineTotal || (l.quotedQty ?? l.orderedQty ?? 1) * (l.unitPrice ?? l.unitRate ?? 0)), 0);
  const taxTotal = quote.taxAmount ?? quote.lines.reduce((s, l) => {
    const base = l.lineTotal || (l.quotedQty ?? l.orderedQty ?? 1) * (l.unitPrice ?? l.unitRate ?? 0);
    return s + base * ((l.taxPct ?? 0) / 100);
  }, 0);
  const grandTotal = Math.round(subtotal + taxTotal + (quote.deliveryCharges ?? 0) - (quote.discountAmount ?? 0));

  const handleSavePricing = () => {
    const updatedLines = quote.lines.map(l => {
      const rate = linePrices[l.id] ?? l.unitPrice ?? l.unitRate ?? 0;
      const qty = l.quotedQty ?? l.orderedQty ?? 1;
      return { ...l, unitPrice: rate, unitRate: rate, lineTotal: Math.round(qty * rate) };
    });
    updateSupplierQuotation(quote.id, {
      status: quote.status === 'pending' ? 'received' : quote.status,
      deliveryDays: Number(deliveryDays) || quote.deliveryDays,
      paymentTerms,
      notes,
      lines: updatedLines,
    });
    setEditingPricing(false);
    showToast({ type: 'success', title: 'Quotation updated', body: `${quote.quoteNumber} pricing and terms saved.` });
  };

  const handleGenerateSPO = () => {
    if (quote.status !== 'selected') {
      approveFinalizeQuotation(quote.id, currentUser.name);
    }
    const res = generateSPOFromQuotation(quote.id);
    if (res.error) {
      showToast({ type: 'warning', title: 'Supplier PO check', body: res.error });
    }
    if (res.spo) {
      navigate(`/procurement/spo/${res.spo.id}`, { state: { from: originUrl } });
    }
  };

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="flex-shrink-0 px-6 py-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-start gap-3">
            <button type="button" onClick={() => goBack()} className="p-1.5 rounded-lg hover:bg-[var(--surface-2)] mt-0.5">
              <ArrowLeft size={18} className="text-[var(--text-2)]" />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-sm font-bold text-[var(--brand)]">{quote.quoteNumber}</span>
                <StatusChip status={quote.status} size="sm" />
              </div>
              <h1 className="text-lg font-bold text-[var(--text)] mt-0.5">{quote.supplierName}</h1>
              <div className="text-xs text-[var(--text-2)] mt-0.5 flex flex-wrap items-center gap-2">
                <span>Quoted: {fmt(quote.quoteDate)}</span>
                <span>·</span>
                <span>Valid Until: {fmt(quote.validUntil)}</span>
                {pr && (
                  <>
                    <span>·</span>
                    <span>
                      Originating PR:{' '}
                      <Link to={`/procurement/pr/${pr.id}`} className="text-[var(--brand)] hover:underline font-mono font-semibold">
                        {pr.prNumber}
                      </Link>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {canApprove && quote.status !== 'selected' && !linkedSpo && (
              <button
                type="button"
                onClick={() => setEditingPricing(v => !v)}
                className="btn-ghost text-xs inline-flex items-center gap-1"
              >
                <Pencil size={13} /> {editingPricing ? 'Cancel Edit' : 'Update Quote Prices'}
              </button>
            )}
            {canApprove && quote.status !== 'selected' && !linkedSpo && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    selectQuotation(quote.id);
                    approveFinalizeQuotation(quote.id, currentUser.name);
                    showToast({ type: 'success', title: 'Quotation approved & finalized', body: `${quote.quoteNumber} ready for Draft Supplier PO.` });
                  }}
                  className="btn-primary text-xs inline-flex items-center gap-1"
                >
                  <CheckCircle2 size={13} /> Approve & Finalize
                </button>
                <button
                  type="button"
                  onClick={() => { setShowRejectModal(true); setRejectReason(''); }}
                  className="px-3 py-1.5 rounded-lg border border-red-300 text-red-700 text-xs font-semibold inline-flex items-center gap-1"
                >
                  <XCircle size={13} /> Reject
                </button>
              </>
            )}
            {canApprove && !linkedSpo && quote.status !== 'approval_rejected' && (
              <button
                type="button"
                onClick={handleGenerateSPO}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white inline-flex items-center gap-1"
                style={{ background: 'var(--success)' }}
              >
                <FileText size={13} /> Draft Supplier PO →
              </button>
            )}
            {linkedSpo && (
              <Link
                to={`/procurement/spo/${linkedSpo.id}`}
                state={{ from: originUrl }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--border)] bg-[var(--surface-2)] text-[var(--brand)] font-mono"
              >
                Supplier PO: {linkedSpo.poNumber} →
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-5">
        <RelatedRecordsPanel
          originNote={
            quote.rejectedReason
              ? `Rejected by ${quote.rejectedBy ?? 'Approver'}: ${quote.rejectedReason}`
              : quote.overrideReason
                ? `Selected with override note: ${quote.overrideReason}`
                : undefined
          }
          records={[
            ...(pr ? [{ relationship: 'Upstream' as const, typeLabel: 'Purchase Requisition', reference: pr.prNumber, to: `/procurement/pr/${pr.id}`, status: pr.status, state: { from: originUrl } }] : []),
            ...(linkedInvitation ? [{ relationship: 'Upstream' as const, typeLabel: 'Supplier Invitation', reference: `${linkedInvitation.channel.toUpperCase()} · ${linkedInvitation.sentDate ?? linkedInvitation.createdAt}`, to: pr ? `/procurement/pr/${pr.id}` : undefined, status: linkedInvitation.status, state: { from: originUrl } }] : []),
            ...(linkedSpo ? [{ relationship: 'Downstream' as const, typeLabel: 'Supplier PO', reference: linkedSpo.poNumber, to: `/procurement/spo/${linkedSpo.id}`, status: linkedSpo.status, state: { from: originUrl } }] : []),
          ]}
        />
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="rounded-2xl border p-6 w-full max-w-md shadow-xl space-y-4 bg-[var(--surface)] border-[var(--border)]">
              <h3 className="font-bold text-[var(--text)]">Reject Quotation {quote.quoteNumber}</h3>
              <p className="text-xs text-[var(--text-2)]">Enter the reason for rejecting {quote.supplierName}'s quotation.</p>
              <textarea className="eoss-input w-full" rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="e.g. Price above target / specification mismatch" />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowRejectModal(false)} className="flex-1 py-2 border border-[var(--border)] rounded-lg text-xs">Cancel</button>
                <button
                  type="button"
                  disabled={!rejectReason.trim()}
                  onClick={() => {
                    rejectQuotationApproval(quote.id, currentUser.name, rejectReason.trim());
                    setShowRejectModal(false);
                    showToast({ type: 'warning', title: 'Quotation rejected', body: `${quote.quoteNumber} marked approval_rejected.` });
                  }}
                  className="flex-1 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold disabled:opacity-40"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl border p-3.5 bg-[var(--surface)] border-[var(--border)]">
            <div className="text-[11px] text-[var(--text-3)]">Payment Terms</div>
            <div className="text-sm font-semibold text-[var(--text)] mt-0.5">{quote.paymentTerms}</div>
          </div>
          <div className="rounded-xl border p-3.5 bg-[var(--surface)] border-[var(--border)]">
            <div className="text-[11px] text-[var(--text-3)]">Delivery Lead Time</div>
            <div className="text-sm font-semibold text-[var(--text)] mt-0.5">{quote.deliveryDays} days</div>
          </div>
          <div className="rounded-xl border p-3.5 bg-[var(--surface)] border-[var(--border)]">
            <div className="text-[11px] text-[var(--text-3)]">Subtotal (Excl. Tax)</div>
            <div className="text-sm font-mono font-semibold text-[var(--text)] mt-0.5">₹{subtotal.toLocaleString('en-IN')}</div>
          </div>
          <div className="rounded-xl border p-3.5 bg-[var(--surface)] border-[var(--border)]">
            <div className="text-[11px] text-[var(--text-3)]">Total Landed Value</div>
            <div className="text-sm font-mono font-bold text-[var(--brand)] mt-0.5">₹{grandTotal.toLocaleString('en-IN')}</div>
          </div>
        </div>

        {editingPricing && (
          <div className="rounded-xl border p-4 bg-[var(--surface)] border-[var(--brand)] space-y-3">
            <div className="text-xs font-bold text-[var(--text)]">Record / Edit Supplier Pricing & Terms</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[var(--text-3)] mb-1">Lead Time (days)</label>
                <input type="number" min={1} className="eoss-input w-full" value={deliveryDays} onChange={e => setDeliveryDays(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-3)] mb-1">Payment Terms</label>
                <input className="eoss-input w-full" value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-[var(--text-3)] mb-1">Notes</label>
                <input className="eoss-input w-full" value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={handleSavePricing} className="btn-primary text-xs inline-flex items-center gap-1">
                <Save size={13} /> Save Quotation Updates
              </button>
            </div>
          </div>
        )}

        <div className="rounded-xl border overflow-x-auto border-[var(--border)] bg-[var(--surface)]">
          <table className="eoss-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Material</th>
                <th>Grade</th>
                <th className="text-right">Qty</th>
                <th>UOM</th>
                <th className="text-right">Unit Rate (₹)</th>
                <th className="text-right">Tax %</th>
                <th>Freight</th>
                <th className="text-right">Line Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {quote.lines.map((l, i) => {
                const rate = l.unitPrice ?? l.unitRate ?? 0;
                const qty = l.quotedQty ?? l.orderedQty ?? 1;
                return (
                  <tr key={l.id}>
                    <td className="text-xs text-[var(--text-3)]">{i + 1}</td>
                    <td>
                      <div className="font-medium text-sm text-[var(--text)]">{l.materialName}</div>
                      {l.materialCode && <div className="font-mono text-[11px] text-[var(--text-3)]">{l.materialCode}</div>}
                    </td>
                    <td className="text-xs text-[var(--text-2)]">{l.grade || '—'}</td>
                    <td className="font-mono text-right">{qty}</td>
                    <td>{l.uom}</td>
                    <td className="font-mono text-right">
                      {editingPricing ? (
                        <input
                          type="number"
                          min={0}
                          className="eoss-input w-24 text-right text-xs"
                          value={linePrices[l.id] ?? rate}
                          onChange={e => setLinePrices(p => ({ ...p, [l.id]: Number(e.target.value) }))}
                        />
                      ) : `₹${rate.toLocaleString('en-IN')}`}
                    </td>
                    <td className="font-mono text-right">{l.taxPct ?? 0}%</td>
                    <td className="text-xs">{l.freightIncluded === false ? 'Extra' : 'Included'}</td>
                    <td className="font-mono text-right font-semibold">₹{(l.lineTotal || Math.round(qty * rate)).toLocaleString('en-IN')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {quote.notes && (
          <div className="rounded-xl border p-4 bg-[var(--surface)] border-[var(--border)]">
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-3)] mb-1">Vendor Notes</div>
            <p className="text-sm text-[var(--text-2)]">{quote.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
