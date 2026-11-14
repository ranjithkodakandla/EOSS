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

export default function PaymentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const payments = useStore(s => s.payments);
  const paymentAllocations = useStore(s => s.paymentAllocations);
  const invoices = useStore(s => s.invoices);
  const customers = useStore(s => s.customers);
  const currentRole = useStore(s => s.currentUser.role);
  const allocateCustomerPayment = useStore(s => s.allocateCustomerPayment);
  const reverseCustomerPayment = useStore(s => s.reverseCustomerPayment);

  const payment = payments.find(p => p.id === id);

  const [allocMap, setAllocMap] = useState<Record<string, number>>({});
  const [showReverseModal, setShowReverseModal] = useState(false);
  const [reverseReason, setReverseReason] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  const customer = payment ? customers.find(c => c.id === payment.customerId) : undefined;

  const existingAllocations = useMemo(() => {
    if (!payment) return [];
    return paymentAllocations
      .filter(a => a.paymentId === payment.id)
      .map(a => ({
        allocation: a,
        invoice: invoices.find(inv => inv.id === a.invoiceId),
      }));
  }, [paymentAllocations, invoices, payment]);

  const openCustomerInvoices = useMemo(() => {
    if (!payment) return [];
    return invoices.filter(
      inv =>
        inv.customerId === payment.customerId &&
        inv.outstandingAmount > 0 &&
        inv.status !== 'draft' &&
        inv.status !== 'void' &&
        inv.status !== 'cancelled',
    );
  }, [invoices, payment]);

  if (!payment) {
    return (
      <div className="p-8 text-center">
        <p className="text-[var(--text-2)]">Customer payment receipt not found.</p>
        <button onClick={() => navigate('/finance?tab=payments')} className="mt-4 text-sm text-[var(--accent)] hover:underline">
          Back to Finance
        </button>
      </div>
    );
  }

  const canManageFinance = currentRole === 'owner' || currentRole === 'sales';
  const unallocated = Math.max(0, payment.unallocatedAmount ?? (payment.amount - payment.allocatedAmount));
  const pendingAllocSum = Object.values(allocMap).reduce((sum, v) => sum + (Number(v) || 0), 0);

  const handleAllocateAdvance = () => {
    const items = Object.entries(allocMap)
      .filter(([, amt]) => amt > 0)
      .map(([invoiceId, amount]) => ({ invoiceId, amount }));
    if (items.length === 0) return;
    const res = allocateCustomerPayment(payment.id, items);
    if (res.ok) {
      setAllocMap({});
      setFeedback({ type: 'ok', msg: 'Advance/unallocated funds applied to selected invoices.' });
    } else {
      setFeedback({ type: 'err', msg: res.error || 'Could not allocate receipt.' });
    }
  };

  const handleReverse = () => {
    if (!reverseReason.trim()) return;
    const res = reverseCustomerPayment(payment.id, reverseReason.trim());
    if (res.ok) {
      setShowReverseModal(false);
      setReverseReason('');
      setFeedback({ type: 'ok', msg: 'Receipt reversed. Invoice balances and audit history updated.' });
    } else {
      setFeedback({ type: 'err', msg: res.error || 'Failed to reverse payment.' });
    }
  };

  const relatedRecords: RelatedRecordLink[] = [
    ...(customer ? [{
      relationship: 'Origin' as const,
      typeLabel: 'Customer',
      reference: customer.tradingName,
      to: `/sales/customers/${customer.id}`,
      status: customer.status,
      meta: customer.city,
    }] : []),
    ...existingAllocations
      .filter(x => x.invoice)
      .map(x => ({
        relationship: 'Downstream' as const,
        typeLabel: 'Customer Invoice',
        reference: x.invoice!.invoiceNumber,
        to: `/finance/invoice/${x.invoice!.id}`,
        status: x.invoice!.status,
        meta: `${fmtINR(x.allocation.allocatedAmount)} applied`,
      })),
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-5">
        <Link to="/finance?tab=payments" className="inline-flex items-center gap-1.5 text-xs text-[var(--text-3)] hover:text-[var(--text-1)] mb-2">
          <ArrowLeft size={13} /> Back to Customer Payments
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold font-mono text-[var(--text-1)]">{payment.paymentNumber}</h1>
              <StatusChip status={payment.status} />
            </div>
            <p className="text-xs text-[var(--text-2)] mt-1">
              {customer?.tradingName || payment.customerName} · {payment.paymentMethod.toUpperCase()} · {fmtDate(payment.receiptDate)}
            </p>
          </div>
          {payment.status !== 'reversed' && canManageFinance && (
            <button
              onClick={() => setShowReverseModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition-colors"
            >
              <RotateCcw size={13} /> Reverse Receipt
            </button>
          )}
        </div>
      </div>

      <div className="mb-4 px-3.5 py-2.5 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/25 text-xs text-[var(--text-2)] flex items-center gap-2">
        <ShieldAlert size={14} className="text-[var(--accent)] shrink-0" />
        <span>
          <strong>Prototype Simulation:</strong> Bank UTR / NEFT / Cheque receipt and settlement updates are simulated within BOSS. No live bank reconciliation occurred.
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
            <p className="text-sm font-semibold text-red-400">Payment Receipt Reversed</p>
            <p className="text-xs text-[var(--text-2)] mt-0.5">
              Reason: {payment.reversedReason || 'Reversed / Bounced'} {payment.reversedAt ? `· on ${fmtDate(payment.reversedAt)}` : ''}
            </p>
          </div>
        </div>
      )}

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-[11px] uppercase tracking-wider text-[var(--text-3)]">Receipt Amount</p>
          <p className="text-xl font-bold text-[var(--text-1)] tabular-nums mt-1">{fmtINR(payment.amount)}</p>
          <p className="text-[11px] text-[var(--text-3)] mt-0.5">{payment.isAdvance ? 'Advance / On-Account Receipt' : 'Invoice Collection'}</p>
        </div>
        <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-[11px] uppercase tracking-wider text-[var(--text-3)]">Allocated to Invoices</p>
          <p className="text-xl font-bold text-[var(--success)] tabular-nums mt-1">{fmtINR(payment.allocatedAmount)}</p>
          <p className="text-[11px] text-[var(--text-3)] mt-0.5">{existingAllocations.length} allocation line{existingAllocations.length === 1 ? '' : 's'}</p>
        </div>
        <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-[11px] uppercase tracking-wider text-[var(--text-3)]">Unallocated Credit</p>
          <p className={`text-xl font-bold tabular-nums mt-1 ${unallocated > 0 ? 'text-[var(--warning)]' : 'text-[var(--text-2)]'}`}>
            {fmtINR(unallocated)}
          </p>
          <p className="text-[11px] text-[var(--text-3)] mt-0.5">{payment.receivingAccount || 'HDFC Current A/c'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Receipt Details */}
          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={16} className="text-[var(--accent)]" />
              <h2 className="text-sm font-semibold text-[var(--text-1)]">Receipt Details</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[var(--text-3)] block text-[11px]">Customer</span>
                {customer ? (
                  <Link to={`/sales/customers/${customer.id}`} className="font-medium text-[var(--accent)] hover:underline">
                    {customer.tradingName}
                  </Link>
                ) : (
                  <span className="font-medium text-[var(--text-1)]">{payment.customerName}</span>
                )}
              </div>
              <div>
                <span className="text-[var(--text-3)] block text-[11px]">Receipt Date</span>
                <span className="font-medium text-[var(--text-1)]">{fmtDate(payment.receiptDate)}</span>
              </div>
              <div>
                <span className="text-[var(--text-3)] block text-[11px]">Payment Mode</span>
                <span className="font-medium text-[var(--text-1)] uppercase">{payment.paymentMethod}</span>
              </div>
              <div>
                <span className="text-[var(--text-3)] block text-[11px]">Reference / UTR</span>
                <span className="font-mono font-medium text-[var(--text-1)]">{payment.transactionRef}</span>
              </div>
              <div>
                <span className="text-[var(--text-3)] block text-[11px]">Deposited Account</span>
                <span className="font-medium text-[var(--text-1)]">{payment.receivingAccount || 'HDFC Current A/c'}</span>
              </div>
              <div>
                <span className="text-[var(--text-3)] block text-[11px]">Recorded By</span>
                <span className="font-medium text-[var(--text-1)]">{payment.createdBy || 'Finance Team'}</span>
              </div>
            </div>
            {payment.foreignCurrency && (
              <div className="mt-4 pt-3 border-t border-[var(--border)] grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[var(--text-3)] block text-[11px]">Foreign Currency</span>
                  <span className="font-medium text-[var(--text-1)]">{payment.foreignCurrency} {payment.foreignAmount?.toLocaleString('en-IN')}</span>
                </div>
                {payment.exchangeRate && (
                  <div>
                    <span className="text-[var(--text-3)] block text-[11px]">Exchange Rate</span>
                    <span className="font-medium text-[var(--text-1)]">1 {payment.foreignCurrency} = ₹{payment.exchangeRate.toFixed(4)}</span>
                  </div>
                )}
                {payment.swiftReference && (
                  <div>
                    <span className="text-[var(--text-3)] block text-[11px]">SWIFT / Wire Ref</span>
                    <span className="font-mono font-medium text-[var(--text-1)]">{payment.swiftReference}</span>
                  </div>
                )}
                {payment.remittanceBank && (
                  <div>
                    <span className="text-[var(--text-3)] block text-[11px]">Remittance Bank</span>
                    <span className="font-medium text-[var(--text-1)]">{payment.remittanceBank}</span>
                  </div>
                )}
                {payment.bankChargesInr !== undefined && (
                  <div>
                    <span className="text-[var(--text-3)] block text-[11px]">Bank Charges (INR)</span>
                    <span className="font-medium text-[var(--text-1)]">₹{payment.bankChargesInr.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>
            )}
            {payment.notes && (
              <div className="mt-4 pt-3 border-t border-[var(--border)] text-xs text-[var(--text-2)]">
                <span className="font-medium text-[var(--text-1)]">Notes: </span>
                {payment.notes}
              </div>
            )}
          </div>

          {/* Existing Allocations */}
          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-5">
            <h2 className="text-sm font-semibold text-[var(--text-1)] mb-3">Allocated Invoices</h2>
            {existingAllocations.length === 0 ? (
              <p className="text-xs text-[var(--text-3)]">No invoice allocations applied to this receipt yet.</p>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {existingAllocations.map(({ allocation, invoice }) => (
                  <div key={allocation.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      {invoice ? (
                        <Link to={`/finance/invoice/${invoice.id}`} className="font-mono font-semibold text-[var(--accent)] hover:underline">
                          {invoice.invoiceNumber}
                        </Link>
                      ) : (
                        <span className="font-mono text-[var(--text-2)]">{allocation.invoiceNumber || allocation.invoiceId}</span>
                      )}
                      {invoice && (
                        <span className="text-[var(--text-3)] ml-2">
                          Invoice Total {fmtINR(invoice.totalAmount)} · Balance {fmtINR(invoice.outstandingAmount)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {invoice && <StatusChip status={invoice.status} size="sm" />}
                      <span className="font-semibold text-[var(--text-1)] tabular-nums">{fmtINR(allocation.allocatedAmount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Allocate Unallocated Advance Credit */}
          {payment.status !== 'reversed' && unallocated > 0 && canManageFinance && (
            <div className="bg-[var(--surface-2)] border border-[var(--accent)]/30 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-sm font-semibold text-[var(--text-1)] flex items-center gap-1.5">
                    <Plus size={15} className="text-[var(--accent)]" />
                    Allocate Unallocated Credit ({fmtINR(unallocated)})
                  </h2>
                  <p className="text-xs text-[var(--text-3)] mt-0.5">
                    Apply available advance/unallocated funds against open customer invoices.
                  </p>
                </div>
                <span className="text-xs font-mono text-[var(--text-2)]">
                  Selected: {fmtINR(pendingAllocSum)} / {fmtINR(unallocated)}
                </span>
              </div>

              {openCustomerInvoices.length === 0 ? (
                <p className="text-xs text-[var(--text-3)]">No open issued invoices currently due for this customer.</p>
              ) : (
                <>
                  <div className="space-y-2 mb-4">
                    {openCustomerInvoices.map(inv => {
                      const maxAlloc = Math.min(inv.outstandingAmount, unallocated);
                      return (
                        <div key={inv.id} className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-[var(--surface-3)]/50 text-xs">
                          <div>
                            <Link to={`/finance/invoice/${inv.id}`} className="font-mono font-semibold text-[var(--accent)] hover:underline">
                              {inv.invoiceNumber}
                            </Link>
                            <p className="text-[11px] text-[var(--text-3)]">
                              Due {fmtDate(inv.dueDate)} · Open Balance {fmtINR(inv.outstandingAmount)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setAllocMap(prev => ({ ...prev, [inv.id]: maxAlloc }))}
                              className="px-2 py-1 text-[10px] rounded bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-2)] hover:text-[var(--text-1)]"
                            >
                              Fill
                            </button>
                            <input
                              type="number"
                              min={0}
                              max={maxAlloc}
                              value={allocMap[inv.id] || ''}
                              placeholder="0"
                              onChange={e => {
                                const val = Math.max(0, Math.min(maxAlloc, Number(e.target.value) || 0));
                                setAllocMap(prev => ({ ...prev, [inv.id]: val }));
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
                      onClick={handleAllocateAdvance}
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

          {/* Record History */}
          <RecordHistoryPanel
            entityId={payment.id}
            entityRef={payment.paymentNumber}
            relatedIds={existingAllocations.map(x => x.allocation.invoiceId)}
            title="Receipt Activity & Audit Trail"
            subtitle="Receipt creation, invoice allocations, and reversal history"
          />
        </div>

        <div className="space-y-4">
          <RelatedRecordsPanel records={relatedRecords} title="Linked Customer & Invoices" />
        </div>
      </div>

      {showReverseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center gap-2 text-red-400">
              <RotateCcw size={18} />
              <h3 className="text-sm font-semibold">Reverse Receipt {payment.paymentNumber}</h3>
            </div>
            <p className="text-xs text-[var(--text-2)]">
              Reversing this receipt will restore the open balance on all linked invoices and append an audit trail entry.
            </p>
            <div>
              <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Reversal Reason *</label>
              <textarea
                rows={3}
                value={reverseReason}
                onChange={e => setReverseReason(e.target.value)}
                placeholder="e.g. Cheque returned / bank transfer bounced"
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
