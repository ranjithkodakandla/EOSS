import React, { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, RotateCcw, CheckCircle2, AlertTriangle, ShieldAlert, Plus } from 'lucide-react';
import { useStore } from '../../store';
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

export default function SupplierPaymentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const supplierPayments = useStore(s => s.supplierPayments);
  const supplierPaymentAllocations = useStore(s => s.supplierPaymentAllocations);
  const supplierBills = useStore(s => s.supplierBills);
  const suppliers = useStore(s => s.suppliers);
  const currentRole = useStore(s => s.currentUser.role);
  const allocateSupplierPayment = useStore(s => s.allocateSupplierPayment);
  const reverseSupplierPayment = useStore(s => s.reverseSupplierPayment);

  const payment = supplierPayments.find(p => p.id === id);

  const [allocMap, setAllocMap] = useState<Record<string, number>>({});
  const [showReverseModal, setShowReverseModal] = useState(false);
  const [reverseReason, setReverseReason] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  const supplier = payment ? suppliers.find(s => s.id === payment.supplierId) : undefined;

  const existingAllocations = useMemo(() => {
    if (!payment) return [];
    return supplierPaymentAllocations
      .filter(a => a.paymentId === payment.id)
      .map(a => ({
        allocation: a,
        bill: supplierBills.find(b => b.id === a.billId),
      }));
  }, [supplierPaymentAllocations, supplierBills, payment]);

  const openApprovedBills = useMemo(() => {
    if (!payment) return [];
    return supplierBills.filter(
      b =>
        b.supplierId === payment.supplierId &&
        b.outstandingAmount > 0 &&
        (b.status === 'approved' || b.status === 'partially_paid' || b.status === 'overdue' || b.status === 'matched'),
    );
  }, [supplierBills, payment]);

  if (!payment) {
    return (
      <div className="p-8 text-center">
        <p className="text-[var(--text-2)]">Supplier payment not found.</p>
        <button onClick={() => navigate('/finance?tab=supplier_payments')} className="mt-4 text-sm text-[var(--accent)] hover:underline">
          Back to Finance
        </button>
      </div>
    );
  }

  const canManageAP = currentRole === 'owner' || currentRole === 'buyer';
  const unallocated = Math.max(0, payment.unallocatedAmount);
  const pendingAllocSum = Object.values(allocMap).reduce((sum, v) => sum + (Number(v) || 0), 0);

  const handleAllocate = () => {
    const items = Object.entries(allocMap)
      .filter(([, amt]) => amt > 0)
      .map(([billId, amount]) => ({ billId, amount }));
    if (items.length === 0) return;
    const res = allocateSupplierPayment(payment.id, items);
    if (res.ok) {
      setAllocMap({});
      setFeedback({ type: 'ok', msg: 'Unallocated supplier advance applied to selected approved bills.' });
    } else {
      setFeedback({ type: 'err', msg: res.error || 'Allocation failed.' });
    }
  };

  const handleReverse = () => {
    if (!reverseReason.trim()) return;
    const res = reverseSupplierPayment(payment.id, reverseReason.trim());
    if (res.ok) {
      setShowReverseModal(false);
      setReverseReason('');
      setFeedback({ type: 'ok', msg: 'Supplier payment reversed and bill balances restored.' });
    } else {
      setFeedback({ type: 'err', msg: res.error || 'Failed to reverse payment.' });
    }
  };

  const relatedRecords: RelatedRecordLink[] = [
    ...(supplier ? [{
      relationship: 'Origin' as const,
      typeLabel: 'Supplier',
      reference: supplier.tradingName,
      to: `/suppliers/${supplier.id}`,
      status: supplier.status,
      meta: supplier.city,
    }] : []),
    ...existingAllocations
      .filter(x => x.bill)
      .map(x => ({
        relationship: 'Downstream' as const,
        typeLabel: 'Supplier Bill',
        reference: x.bill!.billNumber,
        to: `/finance/bill/${x.bill!.id}`,
        status: x.bill!.status,
        meta: `${fmtINR(x.allocation.allocatedAmount)} paid`,
      })),
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-5">
        <Link to="/finance?tab=supplier_payments" className="inline-flex items-center gap-1.5 text-xs text-[var(--text-3)] hover:text-[var(--text-1)] mb-2">
          <ArrowLeft size={13} /> Back to Supplier Payments
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold font-mono text-[var(--text-1)]">{payment.paymentNumber}</h1>
              <StatusChip status={payment.status} />
            </div>
            <p className="text-xs text-[var(--text-2)] mt-1">
              {supplier?.tradingName || payment.supplierName} · {payment.paymentMethod.toUpperCase()} · {fmtDate(payment.paymentDate)}
            </p>
          </div>
          {payment.status !== 'reversed' && canManageAP && (
            <button
              onClick={() => setShowReverseModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition-colors"
            >
              <RotateCcw size={13} /> Reverse Payment
            </button>
          )}
        </div>
      </div>

      <div className="mb-4 px-3.5 py-2.5 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/25 text-xs text-[var(--text-2)] flex items-center gap-2">
        <ShieldAlert size={14} className="text-[var(--accent)] shrink-0" />
        <span>
          <strong>Prototype Simulation:</strong> Vendor NEFT/RTGS payout and UTR references are simulated locally in BOSS. No live bank transfer was executed.
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

      {payment.status === 'reversed' && (
        <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
          <RotateCcw size={18} className="text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-400">Supplier Payment Reversed</p>
            <p className="text-xs text-[var(--text-2)] mt-0.5">
              Reason: {payment.reversedReason || 'Reversed'} {payment.reversedAt ? `· on ${fmtDate(payment.reversedAt)}` : ''}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-[11px] uppercase tracking-wider text-[var(--text-3)]">Payment Amount</p>
          <p className="text-xl font-bold text-[var(--text-1)] tabular-nums mt-1">{fmtINR(payment.amount)}</p>
          <p className="text-[11px] text-[var(--text-3)] mt-0.5">{payment.isAdvance ? 'Vendor Advance' : 'Bill Settlement'}</p>
        </div>
        <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-[11px] uppercase tracking-wider text-[var(--text-3)]">Allocated to Bills</p>
          <p className="text-xl font-bold text-[var(--success)] tabular-nums mt-1">{fmtINR(payment.allocatedAmount)}</p>
          <p className="text-[11px] text-[var(--text-3)] mt-0.5">{existingAllocations.length} bill allocation{existingAllocations.length === 1 ? '' : 's'}</p>
        </div>
        <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-[11px] uppercase tracking-wider text-[var(--text-3)]">Unallocated Advance</p>
          <p className={`text-xl font-bold tabular-nums mt-1 ${unallocated > 0 ? 'text-[var(--warning)]' : 'text-[var(--text-2)]'}`}>
            {fmtINR(unallocated)}
          </p>
          <p className="text-[11px] text-[var(--text-3)] mt-0.5">{payment.payingAccount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={16} className="text-[var(--accent)]" />
              <h2 className="text-sm font-semibold text-[var(--text-1)]">Payout Metadata</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[var(--text-3)] block text-[11px]">Supplier</span>
                {supplier ? (
                  <Link to={`/suppliers/${supplier.id}`} className="font-medium text-[var(--accent)] hover:underline">
                    {supplier.tradingName}
                  </Link>
                ) : (
                  <span className="font-medium text-[var(--text-1)]">{payment.supplierName}</span>
                )}
              </div>
              <div>
                <span className="text-[var(--text-3)] block text-[11px]">Payment Date</span>
                <span className="font-medium text-[var(--text-1)]">{fmtDate(payment.paymentDate)}</span>
              </div>
              <div>
                <span className="text-[var(--text-3)] block text-[11px]">Mode</span>
                <span className="font-medium text-[var(--text-1)] uppercase">{payment.paymentMethod}</span>
              </div>
              <div>
                <span className="text-[var(--text-3)] block text-[11px]">Transaction / UTR</span>
                <span className="font-mono font-medium text-[var(--text-1)]">{payment.transactionRef}</span>
              </div>
              <div>
                <span className="text-[var(--text-3)] block text-[11px]">Paying Account</span>
                <span className="font-medium text-[var(--text-1)]">{payment.payingAccount}</span>
              </div>
              <div>
                <span className="text-[var(--text-3)] block text-[11px]">Created By</span>
                <span className="font-medium text-[var(--text-1)]">{payment.createdBy}</span>
              </div>
            </div>
            {payment.notes && (
              <div className="mt-4 pt-3 border-t border-[var(--border)] text-xs text-[var(--text-2)]">
                <span className="font-medium text-[var(--text-1)]">Notes: </span>
                {payment.notes}
              </div>
            )}
          </div>

          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-5">
            <h2 className="text-sm font-semibold text-[var(--text-1)] mb-3">Allocated Supplier Bills</h2>
            {existingAllocations.length === 0 ? (
              <p className="text-xs text-[var(--text-3)]">No supplier bills settled with this payment yet.</p>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {existingAllocations.map(({ allocation, bill }) => (
                  <div key={allocation.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      {bill ? (
                        <Link to={`/finance/bill/${bill.id}`} className="font-mono font-semibold text-[var(--accent)] hover:underline">
                          {bill.billNumber}
                        </Link>
                      ) : (
                        <span className="font-mono text-[var(--text-2)]">{allocation.billNumber || allocation.billId}</span>
                      )}
                      {bill && (
                        <span className="text-[var(--text-3)] ml-2">
                          Vendor Inv {bill.supplierInvoiceNo} · Balance {fmtINR(bill.outstandingAmount)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {bill && <StatusChip status={bill.status} size="sm" />}
                      <span className="font-semibold text-[var(--text-1)] tabular-nums">{fmtINR(allocation.allocatedAmount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {payment.status !== 'reversed' && unallocated > 0 && canManageAP && (
            <div className="bg-[var(--surface-2)] border border-[var(--accent)]/30 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-sm font-semibold text-[var(--text-1)] flex items-center gap-1.5">
                    <Plus size={15} className="text-[var(--accent)]" />
                    Allocate Vendor Advance ({fmtINR(unallocated)})
                  </h2>
                  <p className="text-xs text-[var(--text-3)] mt-0.5">
                    Apply advance payout against approved unpaid bills from this supplier.
                  </p>
                </div>
                <span className="text-xs font-mono text-[var(--text-2)]">
                  Selected: {fmtINR(pendingAllocSum)} / {fmtINR(unallocated)}
                </span>
              </div>

              {openApprovedBills.length === 0 ? (
                <p className="text-xs text-[var(--text-3)]">No approved unpaid bills currently open for this supplier.</p>
              ) : (
                <>
                  <div className="space-y-2 mb-4">
                    {openApprovedBills.map(bill => {
                      const maxAlloc = Math.min(bill.outstandingAmount, unallocated);
                      return (
                        <div key={bill.id} className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-[var(--surface-3)]/50 text-xs">
                          <div>
                            <Link to={`/finance/bill/${bill.id}`} className="font-mono font-semibold text-[var(--accent)] hover:underline">
                              {bill.billNumber}
                            </Link>
                            <p className="text-[11px] text-[var(--text-3)]">
                              Due {fmtDate(bill.dueDate)} · Open Balance {fmtINR(bill.outstandingAmount)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setAllocMap(prev => ({ ...prev, [bill.id]: maxAlloc }))}
                              className="px-2 py-1 text-[10px] rounded bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-2)]"
                            >
                              Fill
                            </button>
                            <input
                              type="number"
                              min={0}
                              max={maxAlloc}
                              value={allocMap[bill.id] || ''}
                              placeholder="0"
                              onChange={e => {
                                const val = Math.max(0, Math.min(maxAlloc, Number(e.target.value) || 0));
                                setAllocMap(prev => ({ ...prev, [bill.id]: val }));
                              }}
                              className="w-28 px-2.5 py-1 text-right bg-[var(--surface-2)] border border-[var(--border)] rounded text-[var(--text-1)] tabular-nums"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleAllocate}
                      disabled={pendingAllocSum <= 0 || pendingAllocSum > unallocated}
                      className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-40 text-[var(--accent-fg)]"
                    >
                      Apply Allocation ({fmtINR(pendingAllocSum)})
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          <RecordHistoryPanel
            entityId={payment.id}
            entityRef={payment.paymentNumber}
            relatedIds={existingAllocations.map(x => x.allocation.billId)}
            title="Supplier Payment Activity & Audit Trail"
            subtitle="Payout creation, bill settlements, and reversal decisions"
          />
        </div>

        <div className="space-y-4">
          <RelatedRecordsPanel records={relatedRecords} title="Linked Supplier & Bills" />
        </div>
      </div>

      {showReverseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center gap-2 text-red-400">
              <RotateCcw size={18} />
              <h3 className="text-sm font-semibold">Reverse Payment {payment.paymentNumber}</h3>
            </div>
            <p className="text-xs text-[var(--text-2)]">
              Reversing this payout will restore the open payable balance on linked supplier bills and record an audit event.
            </p>
            <div>
              <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Reversal Reason *</label>
              <textarea
                rows={3}
                value={reverseReason}
                onChange={e => setReverseReason(e.target.value)}
                placeholder="e.g. NEFT returned due to beneficiary IFSC mismatch"
                className="w-full px-3 py-2 text-xs bg-[var(--surface-3)] border border-[var(--border)] rounded-lg text-[var(--text-1)]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowReverseModal(false)}
                className="px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] text-[var(--text-2)]"
              >
                Cancel
              </button>
              <button
                onClick={handleReverse}
                disabled={!reverseReason.trim()}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white"
              >
                Confirm Reversal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
