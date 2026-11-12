import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Info, AlertCircle } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';
import type { SupplierPayment } from '../../types';

export default function SupplierPaymentCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const presetSupplierId = searchParams.get('supplierId') ?? '';
  const presetBillId = searchParams.get('billId') ?? '';

  const { suppliers, supplierBills, recordSupplierPayment, showToast } = useStore();
  const presetBill = supplierBills.find(b => b.id === presetBillId);

  const [supplierId, setSupplierId] = useState(presetSupplierId || presetBill?.supplierId || suppliers[0]?.id || '');
  const [paymentDate, setPaymentDate] = useState('2026-11-12');
  const [paymentMethod, setPaymentMethod] = useState<SupplierPayment['paymentMethod']>('neft');
  const [transactionRef, setTransactionRef] = useState('');
  const [payingAccount, setPayingAccount] = useState('Apex Precision — HDFC 50200012345');
  const [amount, setAmount] = useState(presetBill ? String(presetBill.outstandingAmount) : '');
  const [notes, setNotes] = useState('');
  const [allocMap, setAllocMap] = useState<Record<string, string>>(
    presetBill ? { [presetBill.id]: String(presetBill.outstandingAmount) } : {}
  );
  const [error, setError] = useState('');

  const payableBills = useMemo(
    () => supplierBills.filter(
      b => b.supplierId === supplierId
        && !['rejected', 'void', 'paid', 'on_hold', 'disputed'].includes(b.status)
        && b.outstandingAmount > 0
    ),
    [supplierBills, supplierId]
  );

  useEffect(() => {
    if (presetBill && presetBill.supplierId === supplierId) {
      setAllocMap({ [presetBill.id]: String(presetBill.outstandingAmount) });
      setAmount(String(presetBill.outstandingAmount));
    } else {
      setAllocMap({});
    }
  }, [supplierId]);

  const numericAmount = Number(amount) || 0;
  const allocatedSum = payableBills.reduce((s, b) => s + (Number(allocMap[b.id]) || 0), 0);
  const unallocated = Math.max(0, numericAmount - allocatedSum);

  const handleSave = () => {
    setError('');
    if (!(numericAmount > 0)) {
      setError('Enter a valid payment amount.');
      return;
    }
    const allocations = payableBills
      .map(b => ({ billId: b.id, amount: Number(allocMap[b.id]) || 0 }))
      .filter(a => a.amount > 0);
    const res = recordSupplierPayment({
      supplierId,
      paymentDate,
      amount: numericAmount,
      paymentMethod,
      transactionRef: transactionRef || `SIM-SPAY-${Date.now().toString().slice(-6)}`,
      payingAccount,
      notes: notes.trim() || undefined,
      isAdvance: allocations.length === 0,
      allocations,
    });
    if (!res.ok) {
      setError(res.error || 'Could not record supplier payment.');
      showToast({ type: 'error', title: 'Payment error', body: res.error });
      return;
    }
    if (res.payment) navigate(`/finance/supplier-payment/${res.payment.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate('/finance?tab=supplier_payments')} className="text-[var(--text-3)] hover:text-[var(--text)]">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-[var(--text)]">Record Supplier Payment</h1>
            <p className="text-xs text-[var(--text-2)]">Pay approved supplier bills across one or multiple invoices, or record an advance deposit.</p>
          </div>
        </div>
        <span className="text-[11px] px-2.5 py-1 rounded-full bg-[var(--info-bg)] text-[var(--info)] font-medium inline-flex items-center gap-1">
          <Info size={12} /> Prototype Simulation — No real bank payout executed
        </span>
      </div>

      {error && (
        <div className="rounded-xl border border-[var(--error)] bg-[var(--error-bg)] px-4 py-3 text-sm text-[var(--error)] flex items-center gap-2">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
        <div>
          <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Supplier *</label>
          <select value={supplierId} onChange={e => setSupplierId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)]">
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.tradingName}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Payment Amount (₹) *</label>
          <input type="number" min={1} value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 49560"
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm font-mono text-[var(--text)]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Payment Mode *</label>
          <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as SupplierPayment['paymentMethod'])}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)]">
            <option value="neft">NEFT</option>
            <option value="rtgs">RTGS</option>
            <option value="imps">IMPS</option>
            <option value="upi">UPI</option>
            <option value="cheque">Cheque</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cash">Cash</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--text-2)] mb-1">UTR / Bank Reference #</label>
          <input value={transactionRef} onChange={e => setTransactionRef(e.target.value)} placeholder="e.g. NEFT26111299801"
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm font-mono text-[var(--text)]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Payment Date *</label>
          <input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Paying Account</label>
          <input value={payingAccount} onChange={e => setPayingAccount(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)]" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Notes</label>
          <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Payment batch / TDS / settlement remarks…"
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)]" />
        </div>
      </div>

      {/* Allocation Table */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-2)]">
          <h3 className="text-sm font-semibold text-[var(--text)]">Allocate to Eligible Supplier Bills (On-Hold / Disputed / Rejected Excluded)</h3>
        </div>
        {payableBills.length === 0 ? (
          <div className="p-6 text-center text-xs text-[var(--text-3)]">
            No approved unpaid bills for this supplier. Recording payment will create an unallocated supplier advance.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="eoss-table">
              <thead>
                <tr>
                  <th>Bill #</th>
                  <th>Vendor Invoice #</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th className="text-right">Outstanding</th>
                  <th className="text-right">Pay Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {payableBills.map(bill => (
                  <tr key={bill.id}>
                    <td className="font-mono text-xs font-bold text-[var(--brand)]">{bill.billNumber}</td>
                    <td className="font-mono text-xs text-[var(--text-2)]">{bill.supplierInvoiceNo}</td>
                    <td className="text-xs text-[var(--text-2)]">{new Date(bill.dueDate).toLocaleDateString('en-IN')}</td>
                    <td><StatusChip status={bill.status} size="sm" /></td>
                    <td className="text-right font-mono text-xs font-semibold text-[var(--warning)]">₹{bill.outstandingAmount.toLocaleString('en-IN')}</td>
                    <td className="text-right">
                      <input
                        type="number"
                        min={0}
                        max={bill.outstandingAmount}
                        value={allocMap[bill.id] ?? ''}
                        onChange={e => setAllocMap(prev => ({ ...prev, [bill.id]: e.target.value }))}
                        placeholder="0"
                        className="w-28 px-2.5 py-1 rounded border border-[var(--border)] bg-[var(--surface)] text-xs font-mono text-right text-[var(--text)]"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-4 py-3 border-t border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-between text-xs flex-wrap gap-3">
          <div className="flex gap-4">
            <span className="text-[var(--text-2)]">Payout: <strong className="font-mono text-[var(--text)]">₹{numericAmount.toLocaleString('en-IN')}</strong></span>
            <span className="text-[var(--text-2)]">Allocated: <strong className="font-mono text-[var(--success)]">₹{allocatedSum.toLocaleString('en-IN')}</strong></span>
            <span className="text-[var(--text-2)]">Unallocated Advance: <strong className="font-mono text-[var(--info)]">₹{unallocated.toLocaleString('en-IN')}</strong></span>
          </div>
          <button type="button" onClick={handleSave}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white inline-flex items-center gap-1.5" style={{ background: 'var(--brand-fill)' }}>
            <CheckCircle2 size={14} /> Record Simulated Payout
          </button>
        </div>
      </div>
    </div>
  );
}
