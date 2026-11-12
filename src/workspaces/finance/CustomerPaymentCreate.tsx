import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Info, AlertCircle } from 'lucide-react';
import { useStore } from '../../store';
import type { Payment } from '../../types';

export default function CustomerPaymentCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const presetCustomerId = searchParams.get('customerId') ?? '';
  const presetInvoiceId = searchParams.get('invoiceId') ?? '';

  const { customers, invoices, recordCustomerPayment, showToast } = useStore();
  const presetInvoice = invoices.find(i => i.id === presetInvoiceId);

  const [customerId, setCustomerId] = useState(presetCustomerId || presetInvoice?.customerId || customers[0]?.id || '');
  const [receiptDate, setReceiptDate] = useState('2026-11-12');
  const [paymentMethod, setPaymentMethod] = useState<Payment['paymentMethod']>('neft');
  const [transactionRef, setTransactionRef] = useState('');
  const [receivingAccount, setReceivingAccount] = useState('Apex Precision — HDFC 50200012345');
  const [amount, setAmount] = useState(presetInvoice ? String(presetInvoice.outstandingAmount) : '');
  const [notes, setNotes] = useState('');
  const [allocMap, setAllocMap] = useState<Record<string, string>>(
    presetInvoice ? { [presetInvoice.id]: String(presetInvoice.outstandingAmount) } : {}
  );
  const [error, setError] = useState('');

  const openCustomerInvoices = useMemo(
    () => invoices.filter(
      i => i.customerId === customerId && !['draft', 'void', 'cancelled', 'paid'].includes(i.status) && i.outstandingAmount > 0
    ),
    [invoices, customerId]
  );

  useEffect(() => {
    if (presetInvoice && presetInvoice.customerId === customerId) {
      setAllocMap({ [presetInvoice.id]: String(presetInvoice.outstandingAmount) });
      setAmount(String(presetInvoice.outstandingAmount));
    } else {
      setAllocMap({});
    }
  }, [customerId]);

  const numericAmount = Number(amount) || 0;
  const allocatedSum = openCustomerInvoices.reduce((s, inv) => s + (Number(allocMap[inv.id]) || 0), 0);
  const unallocated = Math.max(0, numericAmount - allocatedSum);

  const autoDistribute = () => {
    let remaining = numericAmount;
    const next: Record<string, string> = {};
    for (const inv of openCustomerInvoices) {
      if (remaining <= 0) break;
      const take = Math.min(remaining, inv.outstandingAmount);
      next[inv.id] = String(take);
      remaining -= take;
    }
    setAllocMap(next);
  };

  const handleSave = () => {
    setError('');
    if (!customerId) {
      setError('Select a customer.');
      return;
    }
    if (!(numericAmount > 0)) {
      setError('Enter a valid receipt amount.');
      return;
    }
    if (allocatedSum > numericAmount) {
      setError('Allocated total cannot exceed receipt amount.');
      return;
    }
    const allocations = openCustomerInvoices
      .map(inv => ({ invoiceId: inv.id, amount: Number(allocMap[inv.id]) || 0 }))
      .filter(a => a.amount > 0);

    const res = recordCustomerPayment({
      customerId,
      receiptDate,
      amount: numericAmount,
      paymentMethod,
      transactionRef: transactionRef || `SIM-NEFT-${Date.now().toString().slice(-6)}`,
      receivingAccount,
      notes: notes.trim() || undefined,
      isAdvance: allocations.length === 0,
      allocations,
    });

    if (!res.ok) {
      setError(res.error || 'Could not record payment.');
      showToast({ type: 'error', title: 'Payment validation error', body: res.error });
      return;
    }
    if (res.payment) navigate(`/finance/payment/${res.payment.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate('/finance?tab=payments')} className="text-[var(--text-3)] hover:text-[var(--text)]">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-[var(--text)]">Record Customer Payment Receipt</h1>
            <p className="text-xs text-[var(--text-2)]">Capture customer receipts, allocate across multiple open invoices, or hold as customer advance.</p>
          </div>
        </div>
        <span className="text-[11px] px-2.5 py-1 rounded-full bg-[var(--info-bg)] text-[var(--info)] font-medium inline-flex items-center gap-1">
          <Info size={12} /> Prototype Simulation — No real bank settlement occurs
        </span>
      </div>

      {error && (
        <div className="rounded-xl border border-[var(--error)] bg-[var(--error-bg)] px-4 py-3 text-sm text-[var(--error)] flex items-center gap-2">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
        <div>
          <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Customer *</label>
          <select value={customerId} onChange={e => setCustomerId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)]">
            {customers.map(c => <option key={c.id} value={c.id}>{c.tradingName}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Receipt Amount (₹) *</label>
          <input type="number" min={1} value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 285000"
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm font-mono text-[var(--text)]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Payment Mode *</label>
          <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as Payment['paymentMethod'])}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)]">
            <option value="neft">NEFT</option>
            <option value="rtgs">RTGS</option>
            <option value="imps">IMPS</option>
            <option value="upi">UPI</option>
            <option value="cheque">Cheque</option>
            <option value="bank_transfer">Bank Transfer / SWIFT</option>
            <option value="cash">Cash</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--text-2)] mb-1">UTR / Cheque / Reference #</label>
          <input value={transactionRef} onChange={e => setTransactionRef(e.target.value)} placeholder="e.g. NEFT26111200412"
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm font-mono text-[var(--text)]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Receipt Date *</label>
          <input type="date" value={receiptDate} onChange={e => setReceiptDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Receiving Bank Account</label>
          <input value={receivingAccount} onChange={e => setReceivingAccount(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)]" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Notes</label>
          <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Remittance advice / TDS deduction note…"
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)]" />
        </div>
      </div>

      {/* Allocation Table */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-between gap-2 flex-wrap">
          <div>
            <h3 className="text-sm font-semibold text-[var(--text)]">Allocate to Open Customer Invoices (Optional)</h3>
            <p className="text-xs text-[var(--text-3)]">Leave allocations blank or partial to retain the remainder as an Unallocated Customer Advance.</p>
          </div>
          {openCustomerInvoices.length > 0 && numericAmount > 0 && (
            <button type="button" onClick={autoDistribute}
              className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs font-medium text-[var(--brand)] hover:underline">
              Auto-Allocate Oldest Due First
            </button>
          )}
        </div>
        {openCustomerInvoices.length === 0 ? (
          <div className="p-6 text-center text-xs text-[var(--text-3)]">
            No open invoices with outstanding balance for this customer. Saving will record an unallocated advance receipt.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="eoss-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer PO</th>
                  <th>Due Date</th>
                  <th className="text-right">Invoice Total</th>
                  <th className="text-right">Outstanding</th>
                  <th className="text-right">Allocate (₹)</th>
                </tr>
              </thead>
              <tbody>
                {openCustomerInvoices.map(inv => (
                  <tr key={inv.id}>
                    <td className="font-mono text-xs font-bold text-[var(--brand)]">{inv.invoiceNumber}</td>
                    <td className="font-mono text-xs text-[var(--text-2)]">{inv.poNumber}</td>
                    <td className="text-xs text-[var(--text-2)]">{new Date(inv.dueDate).toLocaleDateString('en-IN')}</td>
                    <td className="text-right font-mono text-xs text-[var(--text)]">₹{inv.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="text-right font-mono text-xs font-semibold text-[var(--warning)]">₹{inv.outstandingAmount.toLocaleString('en-IN')}</td>
                    <td className="text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <input
                          type="number"
                          min={0}
                          max={inv.outstandingAmount}
                          value={allocMap[inv.id] ?? ''}
                          onChange={e => setAllocMap(prev => ({ ...prev, [inv.id]: e.target.value }))}
                          placeholder="0"
                          className="w-28 px-2.5 py-1 rounded border border-[var(--border)] bg-[var(--surface)] text-xs font-mono text-right text-[var(--text)]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const maxTake = Math.min(inv.outstandingAmount, Math.max(0, numericAmount - (allocatedSum - (Number(allocMap[inv.id]) || 0))));
                            setAllocMap(prev => ({ ...prev, [inv.id]: String(maxTake || inv.outstandingAmount) }));
                            if (!amount) setAmount(String(inv.outstandingAmount));
                          }}
                          className="text-[11px] font-medium text-[var(--brand)] hover:underline"
                        >
                          Max
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-4 py-3 border-t border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-between text-xs flex-wrap gap-3">
          <div className="flex gap-4">
            <span className="text-[var(--text-2)]">Receipt: <strong className="font-mono text-[var(--text)]">₹{numericAmount.toLocaleString('en-IN')}</strong></span>
            <span className="text-[var(--text-2)]">Allocated: <strong className="font-mono text-[var(--success)]">₹{allocatedSum.toLocaleString('en-IN')}</strong></span>
            <span className="text-[var(--text-2)]">Unallocated Advance: <strong className="font-mono text-[var(--info)]">₹{unallocated.toLocaleString('en-IN')}</strong></span>
          </div>
          <button type="button" onClick={handleSave}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white inline-flex items-center gap-1.5" style={{ background: 'var(--brand-fill)' }}>
            <CheckCircle2 size={14} /> Record Simulated Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
