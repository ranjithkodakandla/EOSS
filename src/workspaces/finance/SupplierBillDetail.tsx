import React, { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, FileText, CheckCircle2, AlertTriangle, PauseCircle, XCircle, Scale, ShieldAlert, Plus
} from 'lucide-react';
import { useStore } from '../../store';
import { computeThreeWayMatch, computeDaysOverdue, isRecordOverdue } from '../../domain/finance';
import RelatedRecordsPanel, { RelatedRecordLink } from '../../components/workflow/RelatedRecordsPanel';
import RecordHistoryPanel from '../../components/workflow/RecordHistoryPanel';
import StatusChip from '../../components/layout/StatusChip';

const fmtINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const fmtDate = (d?: string) => {
  if (!d) return '—';
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? d : dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function SupplierBillDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const supplierBills = useStore(s => s.supplierBills);
  const supplierBillLines = useStore(s => s.supplierBillLines);
  const supplierPayments = useStore(s => s.supplierPayments);
  const supplierPaymentAllocations = useStore(s => s.supplierPaymentAllocations);
  const supplierPos = useStore(s => s.supplierPos);
  const supplierPoLines = useStore(s => s.supplierPoLines);
  const grns = useStore(s => s.grns);
  const lots = useStore(s => s.lots);
  const inspections = useStore(s => s.inspections);
  const suppliers = useStore(s => s.suppliers);
  const currentRole = useStore(s => s.currentUser.role);
  const approveSupplierBill = useStore(s => s.approveSupplierBill);
  const holdOrDisputeSupplierBill = useStore(s => s.holdOrDisputeSupplierBill);
  const rejectSupplierBill = useStore(s => s.rejectSupplierBill);

  const bill = supplierBills.find(b => b.id === id);

  const [actionModal, setActionModal] = useState<'approve' | 'on_hold' | 'disputed' | 'reject' | null>(null);
  const [reasonText, setReasonText] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  const supplier = bill ? suppliers.find(s => s.id === bill.supplierId) : undefined;
  const linkedSPO = bill?.spoId ? supplierPos.find(s => s.id === bill.spoId) : undefined;
  const linkedGrns = useMemo(
    () => (bill ? grns.filter(g => bill.grnIds.includes(g.id)) : []),
    [grns, bill],
  );
  const lines = useMemo(
    () => (bill ? supplierBillLines.filter(l => l.billId === bill.id) : []),
    [supplierBillLines, bill],
  );

  const matchSummary = useMemo(() => {
    if (!bill) return null;
    const spoLinesForSpo = linkedSPO ? supplierPoLines.filter(l => l.spoId === linkedSPO.id) : [];
    return computeThreeWayMatch({
      bill,
      billLines: lines,
      spo: linkedSPO,
      spoLines: spoLinesForSpo,
      grns: linkedGrns,
      lots,
      inspections,
    });
  }, [bill, lines, linkedSPO, supplierPoLines, linkedGrns, lots, inspections]);

  const linkedAllocations = useMemo(() => {
    if (!bill) return [];
    return supplierPaymentAllocations
      .filter(a => a.billId === bill.id)
      .map(a => ({
        allocation: a,
        payment: supplierPayments.find(p => p.id === a.paymentId),
      }))
      .filter(x => x.payment);
  }, [supplierPaymentAllocations, supplierPayments, bill]);

  if (!bill) {
    return (
      <div className="p-8 text-center">
        <p className="text-[var(--text-2)]">Supplier bill not found.</p>
        <button onClick={() => navigate('/finance?tab=bills')} className="mt-4 text-sm text-[var(--accent)] hover:underline">
          Back to Finance
        </button>
      </div>
    );
  }

  const canManageAP = currentRole === 'owner' || currentRole === 'buyer';
  const isClosed = bill.status === 'rejected' || bill.status === 'void';
  const overdue = isRecordOverdue(bill.status, bill.dueDate, bill.outstandingAmount);
  const daysOverdue = bill.outstandingAmount > 0 && !isClosed ? computeDaysOverdue(bill.dueDate) : 0;
  const canPay =
    (bill.status === 'approved' || bill.status === 'partially_paid' || bill.status === 'overdue' || bill.status === 'matched') &&
    bill.outstandingAmount > 0 &&
    canManageAP;

  const handleConfirmAction = () => {
    if (!actionModal) return;
    if (actionModal === 'approve') {
      const res = approveSupplierBill(bill.id, reasonText.trim() || undefined);
      setActionModal(null);
      setReasonText('');
      setFeedback(
        res.ok
          ? { type: 'ok', msg: 'Supplier bill approved and unlocked for payment.' }
          : { type: 'err', msg: res.error || 'Could not approve bill.' },
      );
      return;
    }
    if (!reasonText.trim()) return;
    if (actionModal === 'on_hold' || actionModal === 'disputed') {
      const res = holdOrDisputeSupplierBill(bill.id, actionModal, reasonText.trim());
      setActionModal(null);
      setReasonText('');
      setFeedback(
        res.ok
          ? { type: 'ok', msg: `Bill marked as ${actionModal.replace('_', ' ')} with audit trail note.` }
          : { type: 'err', msg: res.error || 'Update failed.' },
      );
      return;
    }
    if (actionModal === 'reject') {
      const res = rejectSupplierBill(bill.id, reasonText.trim());
      setActionModal(null);
      setReasonText('');
      setFeedback(
        res.ok
          ? { type: 'ok', msg: 'Supplier bill rejected.' }
          : { type: 'err', msg: res.error || 'Rejection failed.' },
      );
    }
  };

  const relatedRecords: RelatedRecordLink[] = [
    ...(supplier ? [{
      relationship: 'Origin' as const,
      typeLabel: 'Supplier',
      reference: supplier.tradingName,
      to: `/suppliers/${supplier.id}`,
      status: supplier.status,
      meta: supplier.gstin || supplier.city,
    }] : []),
    ...(linkedSPO ? [{
      relationship: 'Upstream' as const,
      typeLabel: 'Supplier PO',
      reference: linkedSPO.spoNumber || linkedSPO.poNumber,
      to: `/procurement/spo/${linkedSPO.id}`,
      status: linkedSPO.status,
      meta: fmtINR(linkedSPO.totalValue),
    }] : []),
    ...linkedGrns.map(g => ({
      relationship: 'Upstream' as const,
      typeLabel: 'GRN',
      reference: g.grnNumber,
      to: `/procurement/grn/${g.id}`,
      status: g.status,
      meta: fmtDate(g.receivedDate),
    })),
    ...linkedAllocations.map(({ payment, allocation }) => ({
      relationship: 'Downstream' as const,
      typeLabel: 'Supplier Payment',
      reference: payment!.paymentNumber,
      to: `/finance/supplier-payment/${payment!.id}`,
      status: payment!.status,
      meta: fmtINR(allocation.allocatedAmount),
    })),
  ];

  const effectiveMatchStatus = matchSummary?.overallStatus || bill.matchStatus;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-5">
        <Link to="/finance?tab=bills" className="inline-flex items-center gap-1.5 text-xs text-[var(--text-3)] hover:text-[var(--text-1)] mb-2">
          <ArrowLeft size={13} /> Back to Supplier Bills
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold font-mono text-[var(--text-1)]">{bill.billNumber}</h1>
              <StatusChip status={overdue && bill.status !== 'overdue' ? 'overdue' : bill.status} />
            </div>
            <p className="text-xs text-[var(--text-2)] mt-1">
              {supplier?.tradingName || bill.supplierName} · Vendor Inv: {bill.supplierInvoiceNo} · 3-Way Match: {effectiveMatchStatus.replace('_', ' ')}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!isClosed && bill.status !== 'paid' && bill.status !== 'approved' && canManageAP && (
              <button
                onClick={() => { setReasonText(''); setActionModal('approve'); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[var(--success)] text-white rounded-lg hover:opacity-90"
              >
                <CheckCircle2 size={13} /> Approve Bill
              </button>
            )}
            {!isClosed && bill.status !== 'paid' && canManageAP && (
              <>
                <button
                  onClick={() => { setReasonText(''); setActionModal('on_hold'); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-lg hover:bg-amber-500/25"
                >
                  <PauseCircle size={13} /> Hold / Dispute
                </button>
                {bill.paidAmount === 0 && (
                  <button
                    onClick={() => { setReasonText(''); setActionModal('reject'); }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20"
                  >
                    <XCircle size={13} /> Reject
                  </button>
                )}
              </>
            )}
            {canPay && (
              <Link
                to={`/finance/supplier-payment/new?supplierId=${bill.supplierId}&billId=${bill.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-fg)] rounded-lg"
              >
                <Plus size={13} /> Pay Supplier ({fmtINR(bill.outstandingAmount)})
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mb-4 px-3.5 py-2.5 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/25 text-xs text-[var(--text-2)] flex items-center gap-2">
        <ShieldAlert size={14} className="text-[var(--accent)] shrink-0" />
        <span>
          <strong>Prototype Simulation:</strong> Vendor invoice GST credit verification and 3-way matching checks run against simulated EOSS procurement &amp; QC records.
        </span>
      </div>

      {feedback && (
        <div
          className={`mb-4 px-3.5 py-2.5 rounded-lg border text-xs flex items-center gap-2 ${
            feedback.type === 'ok'
              ? 'bg-[var(--success)]/10 border-[var(--success)]/30 text-[var(--success)]'
              : 'bg-[var(--danger)]/10 border-[var(--danger)]/30 text-[var(--danger)]'
          }`}
        >
          {feedback.type === 'ok' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
          <span>{feedback.msg}</span>
        </div>
      )}

      {(bill.status === 'on_hold' || bill.status === 'disputed' || bill.status === 'rejected') && (
        <div className="mb-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-300 capitalize">
              Bill {bill.status.replace('_', ' ')}
            </p>
            <p className="text-xs text-[var(--text-2)] mt-0.5">
              {bill.holdReason || bill.rejectionReason || bill.mismatchNotes || 'Held pending procurement/vendor resolution.'}
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3.5">
          <p className="text-[11px] uppercase tracking-wider text-[var(--text-3)]">Billed Total</p>
          <p className="text-lg font-bold text-[var(--text-1)] tabular-nums mt-1">{fmtINR(bill.totalAmount)}</p>
          <p className="text-[11px] text-[var(--text-3)] mt-0.5">Taxable {fmtINR(bill.subtotal)} + GST {fmtINR(bill.taxAmount)}</p>
        </div>
        <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3.5">
          <p className="text-[11px] uppercase tracking-wider text-[var(--text-3)]">3-Way Match Status</p>
          <div className="mt-1.5">
            <StatusChip status={effectiveMatchStatus} />
          </div>
          <p className="text-[11px] text-[var(--text-3)] mt-1">
            {matchSummary && matchSummary.totalVarianceAmount !== 0
              ? `Variance: ${fmtINR(matchSummary.totalVarianceAmount)}`
              : 'PO vs GRN vs QC vs Bill'}
          </p>
        </div>
        <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3.5">
          <p className="text-[11px] uppercase tracking-wider text-[var(--text-3)]">Paid Amount</p>
          <p className="text-lg font-bold text-[var(--success)] tabular-nums mt-1">{fmtINR(bill.paidAmount)}</p>
          <p className="text-[11px] text-[var(--text-3)] mt-0.5">{linkedAllocations.length} payment{linkedAllocations.length === 1 ? '' : 's'}</p>
        </div>
        <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3.5">
          <p className="text-[11px] uppercase tracking-wider text-[var(--text-3)]">Balance Payable</p>
          <p className={`text-lg font-bold tabular-nums mt-1 ${bill.outstandingAmount > 0 && !isClosed ? 'text-[var(--warning)]' : 'text-[var(--success)]'}`}>
            {fmtINR(bill.outstandingAmount)}
          </p>
          <p className="text-[11px] text-[var(--text-3)] mt-0.5">
            {daysOverdue > 0 ? `Overdue by ${daysOverdue}d` : `Due ${fmtDate(bill.dueDate)}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* 3-Way Match Comparison Panel */}
          {matchSummary && (
            <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[var(--border)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scale size={16} className="text-[var(--accent)]" />
                  <h2 className="text-sm font-semibold text-[var(--text-1)]">
                    3-Way Match Verification (PO vs GRN vs QC Accepted vs Supplier Bill)
                  </h2>
                </div>
                <StatusChip status={matchSummary.overallStatus} size="sm" />
              </div>

              <div className="px-5 py-3 bg-[var(--surface-3)]/40 border-b border-[var(--border)]">
                <p className="text-xs text-[var(--text-2)] flex items-center gap-2">
                  {matchSummary.overallStatus === 'matched' ? (
                    <CheckCircle2 size={13} className="text-[var(--success)] shrink-0" />
                  ) : (
                    <AlertTriangle size={13} className="text-amber-400 shrink-0" />
                  )}
                  <span>{matchSummary.summaryText}</span>
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-[var(--text-3)] text-[11px] uppercase bg-[var(--surface-3)]/20">
                      <th className="text-left px-4 py-2.5 font-medium">Material</th>
                      <th className="text-right px-3 py-2.5 font-medium">PO Qty</th>
                      <th className="text-right px-3 py-2.5 font-medium">GRN Recd</th>
                      <th className="text-right px-3 py-2.5 font-medium">QC Acc</th>
                      <th className="text-right px-3 py-2.5 font-medium">Billed Qty</th>
                      <th className="text-right px-3 py-2.5 font-medium">PO Rate</th>
                      <th className="text-right px-3 py-2.5 font-medium">Bill Rate</th>
                      <th className="text-left px-4 py-2.5 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {matchSummary.lines.map((row, idx) => (
                      <tr key={row.lineId || idx}>
                        <td className="px-4 py-3 font-medium text-[var(--text-1)]">
                          {row.description}
                          <p className="text-[10px] text-[var(--text-3)] font-normal">{row.message}</p>
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums text-[var(--text-2)]">{row.poOrderedQty}</td>
                        <td className="px-3 py-3 text-right tabular-nums text-[var(--text-2)]">{row.grnReceivedQty}</td>
                        <td className="px-3 py-3 text-right tabular-nums text-[var(--text-2)]">{row.qcAcceptedQty}</td>
                        <td className="px-3 py-3 text-right tabular-nums font-semibold text-[var(--text-1)]">{row.billedQty}</td>
                        <td className="px-3 py-3 text-right tabular-nums text-[var(--text-2)]">{fmtINR(row.poRate)}</td>
                        <td className="px-3 py-3 text-right tabular-nums font-semibold text-[var(--text-1)]">{fmtINR(row.billedRate)}</td>
                        <td className="px-4 py-3">
                          <StatusChip status={row.status} size="sm" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Billed Line Breakdown */}
          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-[var(--accent)]" />
                <h2 className="text-sm font-semibold text-[var(--text-1)]">Vendor Bill Line Items</h2>
              </div>
              <span className="text-xs font-mono text-[var(--text-3)]">{supplier?.gstin || 'GSTIN N/A'}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--text-3)] text-[11px] uppercase bg-[var(--surface-3)]/20">
                    <th className="text-left px-4 py-2.5 font-medium">Item / Code</th>
                    <th className="text-right px-3 py-2.5 font-medium">Billed Qty</th>
                    <th className="text-right px-3 py-2.5 font-medium">Rate</th>
                    <th className="text-right px-3 py-2.5 font-medium">GST %</th>
                    <th className="text-right px-4 py-2.5 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {lines.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-[var(--text-3)]">
                        Summary bill — Taxable {fmtINR(bill.subtotal)} + Tax {fmtINR(bill.taxAmount)}
                      </td>
                    </tr>
                  ) : (
                    lines.map(l => (
                      <tr key={l.id}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-[var(--text-1)]">{l.description}</p>
                          {l.materialCode && <p className="text-[10px] font-mono text-[var(--text-3)]">{l.materialCode}</p>}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums text-[var(--text-1)]">{l.billedQty} {l.uom}</td>
                        <td className="px-3 py-3 text-right tabular-nums text-[var(--text-2)]">{fmtINR(l.unitRate)}</td>
                        <td className="px-3 py-3 text-right tabular-nums text-[var(--text-2)]">{l.taxPct}%</td>
                        <td className="px-4 py-3 text-right tabular-nums font-medium text-[var(--text-1)]">{fmtINR(l.lineTotal)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-3)]/20 flex justify-end">
              <div className="w-64 space-y-1 text-xs">
                <div className="flex justify-between text-[var(--text-2)]">
                  <span>Taxable Subtotal</span>
                  <span className="tabular-nums">{fmtINR(bill.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[var(--text-2)]">
                  <span>GST ({bill.taxType === 'IGST' ? 'IGST' : 'CGST + SGST'})</span>
                  <span className="tabular-nums">{fmtINR(bill.taxAmount)}</span>
                </div>
                {(bill.otherCharges || 0) > 0 && (
                  <div className="flex justify-between text-[var(--text-2)]">
                    <span>Other Charges</span>
                    <span className="tabular-nums">{fmtINR(bill.otherCharges || 0)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-[var(--text-1)] pt-1.5 border-t border-[var(--border)]">
                  <span>Total Payable</span>
                  <span className="tabular-nums">{fmtINR(bill.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Linked Supplier Payments */}
          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[var(--text-1)]">Supplier Payment Settlements</h2>
              {canPay && (
                <Link
                  to={`/finance/supplier-payment/new?supplierId=${bill.supplierId}&billId=${bill.id}`}
                  className="text-xs font-medium text-[var(--accent)] hover:underline"
                >
                  + Pay Bill
                </Link>
              )}
            </div>
            {linkedAllocations.length === 0 ? (
              <p className="text-xs text-[var(--text-3)]">No supplier payments allocated to this bill yet.</p>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {linkedAllocations.map(({ allocation, payment }) => (
                  <div key={allocation.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <Link to={`/finance/supplier-payment/${payment!.id}`} className="font-mono font-semibold text-[var(--accent)] hover:underline">
                        {payment!.paymentNumber}
                      </Link>
                      <span className="text-[var(--text-3)] ml-2">
                        {fmtDate(payment!.paymentDate)} · {payment!.paymentMethod.toUpperCase()} ({payment!.transactionRef})
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusChip status={payment!.status} size="sm" />
                      <span className="font-semibold text-[var(--text-1)] tabular-nums">{fmtINR(allocation.allocatedAmount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <RecordHistoryPanel
            entityId={bill.id}
            entityRef={bill.billNumber}
            relatedIds={linkedAllocations.map(x => x.payment!.id)}
            title="Supplier Bill Activity & Audit Trail"
            subtitle="Submission, 3-way match results, hold/dispute reasons, approval, and payment settlement"
          />
        </div>

        <div className="space-y-4">
          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4 space-y-2.5 text-xs">
            <p className="font-semibold text-[var(--text-1)] mb-1">Bill Metadata</p>
            <div className="flex justify-between">
              <span className="text-[var(--text-3)]">Vendor Inv No</span>
              <span className="font-mono text-[var(--text-1)]">{bill.supplierInvoiceNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-3)]">Bill Date</span>
              <span className="text-[var(--text-1)]">{fmtDate(bill.billDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-3)]">Due Date</span>
              <span className="text-[var(--text-1)]">{fmtDate(bill.dueDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-3)]">Terms</span>
              <span className="text-[var(--text-1)]">{bill.paymentTerms || 'Net 30'}</span>
            </div>
            {bill.approvedBy && (
              <div className="flex justify-between">
                <span className="text-[var(--text-3)]">Approved By</span>
                <span className="text-[var(--text-1)]">{bill.approvedBy}</span>
              </div>
            )}
          </div>

          <RelatedRecordsPanel records={relatedRecords} title="Related Procure-to-Pay Records" />
        </div>
      </div>

      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl max-w-md w-full p-5 space-y-4">
            <h3 className="text-sm font-semibold text-[var(--text-1)] capitalize">
              {actionModal === 'approve'
                ? `Approve Supplier Bill ${bill.billNumber}`
                : actionModal === 'reject'
                ? `Reject Supplier Bill ${bill.billNumber}`
                : `Mark Bill ${bill.billNumber} as Hold / Disputed`}
            </h3>
            {(actionModal === 'on_hold' || actionModal === 'disputed') && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActionModal('on_hold')}
                  className={`flex-1 py-1.5 text-xs rounded-lg border ${
                    actionModal === 'on_hold' ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'border-[var(--border)] text-[var(--text-2)]'
                  }`}
                >
                  On Hold
                </button>
                <button
                  type="button"
                  onClick={() => setActionModal('disputed')}
                  className={`flex-1 py-1.5 text-xs rounded-lg border ${
                    actionModal === 'disputed' ? 'bg-red-500/20 border-red-500 text-red-300' : 'border-[var(--border)] text-[var(--text-2)]'
                  }`}
                >
                  Disputed
                </button>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-[var(--text-2)] mb-1">
                {actionModal === 'approve' ? 'Approval Note (optional)' : 'Reason *'}
              </label>
              <textarea
                rows={3}
                value={reasonText}
                onChange={e => setReasonText(e.target.value)}
                placeholder={
                  actionModal === 'approve'
                    ? 'e.g. Variance verified with vendor debit note'
                    : 'Specify qty/rate discrepancy or rejection reason'
                }
                className="w-full px-3 py-2 text-xs bg-[var(--surface-3)] border border-[var(--border)] rounded-lg text-[var(--text-1)]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setActionModal(null)}
                className="px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] text-[var(--text-2)]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={actionModal !== 'approve' && !reasonText.trim()}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg disabled:opacity-40 text-white ${
                  actionModal === 'approve' ? 'bg-[var(--success)]' : actionModal === 'reject' ? 'bg-red-600' : 'bg-amber-600'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
