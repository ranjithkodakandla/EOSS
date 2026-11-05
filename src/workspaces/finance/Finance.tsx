import React, { useState } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, Plus, ArrowUpRight, ArrowDownLeft, Clock, Check, Building2 } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

type Tab = 'overview' | 'receivables' | 'payables' | 'payments' | 'collections';

export default function Finance() {
  const {
    customerInvoices, supplierInvoices, paymentRecords,
    invoices, payments, paymentAllocations, collectionActivities,
    addCustomerInvoice, addSupplierInvoice, addPaymentRecord,
    recordPaymentAgainstInvoice, showToast, currentUser
  } = useStore();
  const [tab, setTab] = useState<Tab>('overview');
  const [showAddInvoice, setShowAddInvoice] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [invoiceType, setInvoiceType] = useState<'customer' | 'supplier'>('customer');

  // Suppress unused-variable warnings for modal state setters
  void showAddInvoice; void showAddPayment; void invoiceType;

  // Combined receivables: old CustomerInvoice + new Invoice (rich flagship)
  const allReceivables = [
    ...customerInvoices.map(i => ({
      id: i.id, number: i.invoiceNumber, customer: i.customerName,
      poRef: i.customerPoRef ?? '', date: i.invoiceDate, due: i.dueDate,
      total: i.amount, paid: i.amountPaid, outstanding: i.amount - i.amountPaid,
      status: i.status as string,
    })),
    ...invoices.map(i => ({
      id: i.id, number: i.invoiceNumber, customer: i.customerName,
      poRef: i.poNumber, date: i.invoiceDate, due: i.dueDate,
      total: i.totalAmount, paid: i.paidAmount, outstanding: i.outstandingAmount,
      status: i.status as string,
    })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  // Combined inbound payments: old PaymentRecord + new Payment
  const allPayments = [
    ...paymentRecords.filter(p => p.direction === 'inbound').map(p => ({
      id: p.id, number: p.reference || p.id, customer: p.partyName,
      date: p.date, amount: p.amount, method: p.mode, ref: p.reference,
      status: 'received' as string,
    })),
    ...payments.map(p => ({
      id: p.id, number: p.paymentNumber, customer: p.customerName,
      date: p.receiptDate, amount: p.amount, method: p.paymentMethod.replace('_', ' '),
      ref: p.transactionRef, status: p.status as string,
    })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  // KPIs
  const totalReceivables = allReceivables.filter(i => i.status !== 'paid').reduce((s, i) => s + i.outstanding, 0);
  const totalPayables = supplierInvoices.filter(i => i.status !== 'paid').reduce((s, i) => s + (i.amount - i.amountPaid), 0);
  const overdueReceivables = allReceivables.filter(i => i.status === 'overdue').reduce((s, i) => s + i.outstanding, 0);
  const overduePayables = supplierInvoices.filter(i => i.status === 'overdue').reduce((s, i) => s + (i.amount - i.amountPaid), 0);
  const totalInflows = allPayments.reduce((s, p) => s + p.amount, 0);
  const totalOutflows = paymentRecords.filter(p => p.direction === 'outbound').reduce((s, p) => s + p.amount, 0);

  const isReadOnly = currentUser.role === 'auditor';

  const TABS: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'receivables', label: `Receivables (${allReceivables.length})` },
    { key: 'payables', label: `Payables (${supplierInvoices.length})` },
    { key: 'payments', label: `Payments (${allPayments.length})` },
    { key: 'collections', label: `Collections (${collectionActivities.length})` },
  ];

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-[var(--text)]">Finance</h1>
          <p className="text-sm text-[var(--text-2)] mt-0.5">Invoicing, receivables, payables and collections — operational finance overview</p>
        </div>
        {!isReadOnly && (
          <div className="flex gap-2">
            <button
              onClick={() => { setInvoiceType('customer'); setShowAddInvoice(true); showToast({ type: 'info', title: 'Add Invoice', body: 'Invoice creation form coming soon.' }); }}
              className="flex items-center gap-2 px-3.5 py-2 bg-[var(--brand)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Plus size={15} /> Add Invoice
            </button>
            <button
              onClick={() => { setShowAddPayment(true); showToast({ type: 'info', title: 'Record Payment', body: 'Payment recording form coming soon.' }); }}
              className="flex items-center gap-2 px-3.5 py-2 border border-[var(--border)] text-[var(--text-2)] rounded-xl text-sm font-medium hover:border-[var(--brand)] transition-colors"
            >
              <Plus size={15} /> Record Payment
            </button>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="mb-4 px-3 py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/5 flex items-start gap-2 text-xs text-[var(--text-2)]">
        <AlertCircle size={14} className="mt-0.5 flex-shrink-0 text-amber-500" />
        <span>Operational finance only — not an accounting ledger. No double-entry, no statutory tax calculations. Values come from recorded demo transactions.</span>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        {[
          { label: 'Total Receivables', value: fmt(totalReceivables), icon: ArrowUpRight, color: 'text-emerald-500' },
          { label: 'Overdue AR', value: fmt(overdueReceivables), icon: Clock, color: 'text-red-500' },
          { label: 'Total Payables', value: fmt(totalPayables), icon: ArrowDownLeft, color: 'text-orange-500' },
          { label: 'Overdue AP', value: fmt(overduePayables), icon: Clock, color: 'text-red-500' },
          { label: 'Total Inflows', value: fmt(totalInflows), icon: TrendingUp, color: 'text-emerald-500' },
          { label: 'Total Outflows', value: fmt(totalOutflows), icon: TrendingDown, color: 'text-orange-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border p-3" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <Icon size={13} className={color} />
              <span className="text-[11px] text-[var(--text-2)]">{label}</span>
            </div>
            <p className="text-base font-bold text-[var(--text)]">{value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-[var(--border)] overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors -mb-px whitespace-nowrap ${
              tab === t.key
                ? 'text-[var(--brand)] border-b-2 border-[var(--brand)] bg-[var(--surface)]'
                : 'text-[var(--text-2)] hover:text-[var(--text)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* AR Summary */}
            <div className="rounded-2xl border p-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <h3 className="text-sm font-semibold text-[var(--text)] mb-3">Accounts Receivable Summary</h3>
              <div className="space-y-2">
                {(['paid', 'partial', 'sent', 'overdue'] as const).map(s => {
                  const items = allReceivables.filter(i => i.status === s);
                  const total = items.reduce((sum, i) => sum + i.outstanding, 0);
                  if (items.length === 0) return null;
                  return (
                    <div key={s} className="flex items-center justify-between py-1.5 border-b border-[var(--border)] last:border-0">
                      <div className="flex items-center gap-2">
                        <StatusChip status={s} />
                        <span className="text-xs text-[var(--text-2)]">{items.length} invoice{items.length > 1 ? 's' : ''}</span>
                      </div>
                      <span className="text-sm font-semibold text-[var(--text)]">{fmt(total)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* AP Summary */}
            <div className="rounded-2xl border p-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <h3 className="text-sm font-semibold text-[var(--text)] mb-3">Accounts Payable Summary</h3>
              <div className="space-y-2">
                {(['paid', 'partial', 'pending', 'overdue'] as const).map(s => {
                  const items = supplierInvoices.filter(i => i.status === s);
                  const total = items.reduce((sum, i) => sum + (i.amount - i.amountPaid), 0);
                  if (items.length === 0) return null;
                  return (
                    <div key={s} className="flex items-center justify-between py-1.5 border-b border-[var(--border)] last:border-0">
                      <div className="flex items-center gap-2">
                        <StatusChip status={s} />
                        <span className="text-xs text-[var(--text-2)]">{items.length} invoice{items.length > 1 ? 's' : ''}</span>
                      </div>
                      <span className="text-sm font-semibold text-[var(--text)]">{fmt(total)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {/* Flagship Order Summary */}
          <div className="rounded-2xl border p-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Building2 size={15} className="text-[var(--brand)]" />
              <h3 className="text-sm font-semibold text-[var(--text)]">RheinWerk Turbinenanlagen GmbH — CPO-0001 (₹60,00,000)</h3>
              <StatusChip status="complete" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'PO Value', value: '₹60,00,000' },
                { label: 'Invoiced', value: fmt(invoices.reduce((s, i) => s + i.totalAmount, 0)) },
                { label: 'Collected', value: fmt(payments.reduce((s, p) => s + p.amount, 0)) },
                { label: 'Outstanding', value: fmt(invoices.reduce((s, i) => s + i.outstandingAmount, 0)) },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg p-3" style={{ background: 'var(--surface-2)' }}>
                  <p className="text-[11px] text-[var(--text-2)]">{label}</p>
                  <p className="text-sm font-bold text-[var(--text)] mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'receivables' && (
        <div className="rounded-2xl border overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b" style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                {['Invoice #', 'Customer', 'PO Ref', 'Date', 'Due Date', 'Total', 'Paid', 'Outstanding', 'Status'].map(h => (
                  <th key={h} className="text-left px-3 py-2.5 text-[11px] font-semibold text-[var(--text-2)] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allReceivables.map((inv, i) => (
                <tr key={inv.id} className={`border-b transition-colors hover:bg-[var(--surface-2)] ${i % 2 === 0 ? '' : ''}`} style={{ borderColor: 'var(--border)' }}>
                  <td className="px-3 py-2.5 font-mono text-[var(--brand)] font-medium text-xs">{inv.number}</td>
                  <td className="px-3 py-2.5 text-[var(--text)] text-xs font-medium">{inv.customer}</td>
                  <td className="px-3 py-2.5 text-[var(--text-2)] text-xs">{inv.poRef}</td>
                  <td className="px-3 py-2.5 text-[var(--text-2)] text-xs">{inv.date}</td>
                  <td className="px-3 py-2.5 text-[var(--text-2)] text-xs">{inv.due}</td>
                  <td className="px-3 py-2.5 text-[var(--text)] text-xs font-semibold">{fmt(inv.total)}</td>
                  <td className="px-3 py-2.5 text-emerald-600 text-xs font-semibold">{fmt(inv.paid)}</td>
                  <td className="px-3 py-2.5 text-[var(--text)] text-xs font-semibold">{fmt(inv.outstanding)}</td>
                  <td className="px-3 py-2.5"><StatusChip status={inv.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'payables' && (
        <div className="rounded-2xl border overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b" style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                {['Invoice #', 'Supplier', 'PO Ref', 'Date', 'Due Date', 'Amount', 'Paid', 'Outstanding', 'Status'].map(h => (
                  <th key={h} className="text-left px-3 py-2.5 text-[11px] font-semibold text-[var(--text-2)] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {supplierInvoices.map((inv, i) => (
                <tr key={inv.id} className="border-b transition-colors hover:bg-[var(--surface-2)]" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-3 py-2.5 font-mono text-[var(--brand)] font-medium text-xs">{inv.invoiceNumber}</td>
                  <td className="px-3 py-2.5 text-[var(--text)] text-xs font-medium">{inv.supplierName}</td>
                  <td className="px-3 py-2.5 text-[var(--text-2)] text-xs">{inv.supplierPoRef}</td>
                  <td className="px-3 py-2.5 text-[var(--text-2)] text-xs">{inv.invoiceDate}</td>
                  <td className="px-3 py-2.5 text-[var(--text-2)] text-xs">{inv.dueDate}</td>
                  <td className="px-3 py-2.5 text-[var(--text)] text-xs font-semibold">{fmt(inv.amount)}</td>
                  <td className="px-3 py-2.5 text-emerald-600 text-xs font-semibold">{fmt(inv.amountPaid)}</td>
                  <td className="px-3 py-2.5 text-[var(--text)] text-xs font-semibold">{fmt(inv.amount - inv.amountPaid)}</td>
                  <td className="px-3 py-2.5"><StatusChip status={inv.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'payments' && (
        <div className="space-y-3">
          <div className="rounded-2xl border overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b" style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                  {['Payment #', 'Customer / Party', 'Date', 'Amount', 'Method', 'Reference', 'Status'].map(h => (
                    <th key={h} className="text-left px-3 py-2.5 text-[11px] font-semibold text-[var(--text-2)] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allPayments.map((pay, i) => (
                  <tr key={pay.id} className="border-b transition-colors hover:bg-[var(--surface-2)]" style={{ borderColor: 'var(--border)' }}>
                    <td className="px-3 py-2.5 font-mono text-[var(--brand)] font-medium text-xs">{pay.number}</td>
                    <td className="px-3 py-2.5 text-[var(--text)] text-xs font-medium">{pay.customer}</td>
                    <td className="px-3 py-2.5 text-[var(--text-2)] text-xs">{pay.date}</td>
                    <td className="px-3 py-2.5 text-emerald-600 text-xs font-bold">{fmt(pay.amount)}</td>
                    <td className="px-3 py-2.5 text-[var(--text-2)] text-xs capitalize">{pay.method}</td>
                    <td className="px-3 py-2.5 font-mono text-[var(--text-2)] text-[11px]">{pay.ref}</td>
                    <td className="px-3 py-2.5"><StatusChip status={pay.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Payment Allocations */}
          {paymentAllocations.length > 0 && (
            <div className="rounded-2xl border p-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <h3 className="text-sm font-semibold text-[var(--text)] mb-3">Payment Allocations — RheinWerk CPO-0001</h3>
              <div className="space-y-1.5">
                {paymentAllocations.map(pa => (
                  <div key={pa.id} className="flex items-center justify-between py-1.5 border-b border-[var(--border)] last:border-0 text-xs gap-2 flex-wrap">
                    <span className="font-mono text-[var(--brand)] font-medium">{pa.paymentNumber}</span>
                    <ArrowUpRight size={12} className="text-[var(--text-2)]" />
                    <span className="font-mono text-[var(--text-2)]">{pa.invoiceNumber}</span>
                    <span className="text-[var(--text-2)]">{pa.allocatedDate}</span>
                    <span className="font-bold text-[var(--text)]">{fmt(pa.allocatedAmount)}</span>
                    <span className="text-[var(--text-2)]">{pa.allocatedBy}</span>
                    <Check size={12} className="text-emerald-500" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'collections' && (
        <div className="space-y-3">
          {collectionActivities.map(col => (
            <div key={col.id} className="rounded-2xl border p-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="flex items-start justify-between mb-2 gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs text-[var(--brand)] font-medium">{col.collectionNumber}</span>
                  <span className="text-xs text-[var(--text-2)]">·</span>
                  <span className="text-xs font-medium text-[var(--text)]">{col.customerName}</span>
                  <span className="text-xs text-[var(--text-2)]">→</span>
                  <span className="font-mono text-xs text-[var(--text-2)]">{col.invoiceNumber}</span>
                </div>
                <StatusChip status={col.status} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mb-2">
                <div><span className="text-[var(--text-2)]">Follow-up: </span><span className="text-[var(--text)]">{col.followUpDate}</span></div>
                <div><span className="text-[var(--text-2)]">Channel: </span><span className="text-[var(--text)] capitalize">{col.channel}</span></div>
                <div><span className="text-[var(--text-2)]">Assigned: </span><span className="text-[var(--text)]">{col.assignedTo}</span></div>
                {col.promiseToPayDate && <div><span className="text-[var(--text-2)]">PTP: </span><span className="text-[var(--text)]">{col.promiseToPayDate}</span></div>}
              </div>
              <p className="text-xs text-[var(--text-2)]">{col.notes}</p>
              {col.outcome && <p className="text-xs text-emerald-600 mt-1 font-medium">Outcome: {col.outcome}</p>}
            </div>
          ))}
          {collectionActivities.length === 0 && (
            <div className="text-center py-12 text-[var(--text-2)] text-sm">No collection activities recorded.</div>
          )}
        </div>
      )}
    </div>
  );
}
