import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TrendingUp, TrendingDown, AlertCircle, Plus, ArrowUpRight, ArrowDownLeft, Clock, Check, Building2 } from 'lucide-react';
import { useStore, CUSTOMERS } from '../../store';
import { DEMO_NOW } from '../../data/seed';
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<Tab>((searchParams.get('tab') as Tab) ?? 'overview');
  const [showAddInvoice, setShowAddInvoice] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);

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
  ].sort((a, b) => {
    const rank = (s: string) => s === 'overdue' ? 0 : s === 'paid' ? 2 : 1;
    return rank(a.status) - rank(b.status) || b.date.localeCompare(a.date);
  });

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

  const openOnly = searchParams.get('open') === '1';
  const dueWeek = searchParams.get('due') === 'week';
  const weekLimit = new Date(DEMO_NOW).getTime() + 7 * 86400000;
  const visibleReceivables = openOnly ? allReceivables.filter(i => i.status !== 'paid') : allReceivables;
  const visiblePayables = supplierInvoices.filter(i => {
    if (dueWeek) return i.status !== 'paid' && new Date(i.dueDate).getTime() <= weekLimit;
    if (openOnly) return i.status !== 'paid';
    return true;
  });

  const TABS: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'receivables', label: `Receivables (${visibleReceivables.length})` },
    { key: 'payables', label: `Payables (${visiblePayables.length})` },
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
              onClick={() => setShowAddInvoice(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-[var(--brand)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Plus size={15} /> Add Invoice
            </button>
            <button
              onClick={() => setShowAddPayment(true)}
              className="flex items-center gap-2 px-3.5 py-2 border border-[var(--border)] text-[var(--text-2)] rounded-xl text-sm font-medium hover:border-[var(--brand)] transition-colors"
            >
              <Plus size={15} /> Record Payment
            </button>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        {[
          { label: 'Total Receivables', value: fmt(totalReceivables), icon: ArrowUpRight, color: 'text-emerald-500', tab: 'receivables' as Tab },
          { label: 'Overdue AR', value: fmt(overdueReceivables), icon: Clock, color: 'text-red-500', tab: 'receivables' as Tab },
          { label: 'Total Payables', value: fmt(totalPayables), icon: ArrowDownLeft, color: 'text-orange-500', tab: 'payables' as Tab },
          { label: 'Overdue AP', value: fmt(overduePayables), icon: Clock, color: 'text-red-500', tab: 'payables' as Tab },
          { label: 'Total Inflows', value: fmt(totalInflows), icon: TrendingUp, color: 'text-emerald-500', tab: 'payments' as Tab },
          { label: 'Total Outflows', value: fmt(totalOutflows), icon: TrendingDown, color: 'text-orange-500', tab: 'payments' as Tab },
        ].map(({ label, value, icon: Icon, color, tab: next }) => (
          <button key={label} type="button" onClick={() => setTab(next)} className="text-left rounded-xl border p-3" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <Icon size={13} className={color} />
              <span className="text-[11px] text-[var(--text-2)]">{label}</span>
            </div>
            <p className="text-base font-bold text-[var(--text)]">{value}</p>
          </button>
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
        </div>
      )}

      {tab === 'receivables' && (
        <>
        <div className="md:hidden space-y-2">
          {visibleReceivables.map(inv => (
            <button key={inv.id} type="button" onClick={() => navigate(`/finance/invoice/${inv.id}`)}
              className="w-full text-left rounded-xl border p-3" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-[var(--brand)]">{inv.number}</span>
                <StatusChip status={inv.status} size="sm" />
              </div>
              <div className="text-sm font-semibold text-[var(--text)] mt-1">{inv.customer}</div>
              <div className="text-xs text-[var(--text-2)] mt-1">Due {inv.due} · outstanding {fmt(inv.outstanding)}</div>
            </button>
          ))}
        </div>
        <div className="hidden md:block rounded-2xl border overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b" style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                {['Invoice #', 'Customer', 'PO Ref', 'Date', 'Due Date', 'Total', 'Paid', 'Outstanding', 'Status'].map(h => (
                  <th key={h} className="text-left px-3 py-2.5 text-[11px] font-semibold text-[var(--text-2)] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleReceivables.map((inv) => (
                <tr key={inv.id} className="border-b transition-colors hover:bg-[var(--surface-2)] cursor-pointer" style={{ borderColor: 'var(--border)' }} onClick={() => navigate(`/finance/invoice/${inv.id}`)}>
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
        </>
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
              {visiblePayables.map((inv) => (
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
                  <tr key={pay.id} className="border-b transition-colors hover:bg-[var(--surface-2)] cursor-pointer" style={{ borderColor: 'var(--border)' }} onClick={() => navigate(`/finance/payment/${pay.id}`)}>
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

      {showAddInvoice && (
        <MoneyModal title="Add customer invoice" onClose={() => setShowAddInvoice(false)}
          onSave={(partyId, partyName, amount, date) => {
            addCustomerInvoice({
              id: `cinv-${Date.now()}`, invoiceNumber: `INV-2026-${String(Date.now()).slice(-3)}`,
              customerId: partyId, customerName: partyName, invoiceDate: '2026-11-09', dueDate: date,
              amount, amountPaid: 0, currency: 'INR', status: 'sent',
            });
            showToast({ type: 'success', title: 'Invoice added', body: `${partyName} · ${fmt(amount)}` });
            setShowAddInvoice(false);
            setTab('receivables');
          }} />
      )}
      {showAddPayment && (
        <MoneyModal title="Record payment" onClose={() => setShowAddPayment(false)}
          onSave={(partyId, partyName, amount, date) => {
            addPaymentRecord({
              id: `pay-${Date.now()}`, direction: 'inbound', partyId, partyName, date, amount,
              currency: 'INR', mode: 'NEFT', reference: `NEFT-${String(Date.now()).slice(-4)}`,
            });
            showToast({ type: 'success', title: 'Payment recorded', body: `${partyName} · ${fmt(amount)}` });
            setShowAddPayment(false);
            setTab('payments');
          }} />
      )}
    </div>
  );
}

function MoneyModal({ title, onClose, onSave }: { title: string; onClose: () => void; onSave: (id: string, name: string, amount: number, date: string) => void }) {
  const [partyId, setPartyId] = useState(CUSTOMERS[0]?.id ?? '');
  const [amount, setAmount] = useState('50000');
  const [date, setDate] = useState('2026-12-09');
  const party = CUSTOMERS.find(c => c.id === partyId);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 w-full max-w-sm">
        <h2 className="font-bold text-[var(--text)] mb-3">{title}</h2>
        <div className="space-y-3 text-sm">
          <label className="block">Customer
            <select className="eoss-input w-full mt-1" value={partyId} onChange={e => setPartyId(e.target.value)}>
              {CUSTOMERS.map(c => <option key={c.id} value={c.id}>{c.tradingName}</option>)}
            </select>
          </label>
          <label className="block">Amount (₹)
            <input className="eoss-input w-full mt-1" value={amount} onChange={e => setAmount(e.target.value)} />
          </label>
          <label className="block">Date
            <input type="date" className="eoss-input w-full mt-1" value={date} onChange={e => setDate(e.target.value)} />
          </label>
        </div>
        <div className="flex gap-2 mt-4">
          <button type="button" onClick={onClose} className="flex-1 py-2 border border-[var(--border)] rounded-lg">Cancel</button>
          <button type="button" onClick={() => party && onSave(party.id, party.tradingName, Number(amount) || 0, date)}
            className="flex-1 py-2 rounded-lg text-white font-semibold" style={{ background: 'var(--brand)' }}>Save</button>
        </div>
      </div>
    </div>
  );
}
