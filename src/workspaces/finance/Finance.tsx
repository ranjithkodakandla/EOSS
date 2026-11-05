import React, { useState } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, Calendar, Plus, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const daysOverdue = (dueDate: string) => {
  const due = new Date(dueDate);
  const now = new Date('2026-11-05');
  const diff = Math.floor((now.getTime() - due.getTime()) / 86400000);
  return diff > 0 ? diff : 0;
};

const ageing = (dueDate: string): string => {
  const d = daysOverdue(dueDate);
  if (d === 0) return 'Current';
  if (d <= 30) return '1–30 days';
  if (d <= 60) return '31–60 days';
  if (d <= 90) return '61–90 days';
  return '90+ days';
};

type Tab = 'overview' | 'receivables' | 'payables' | 'payments';

export default function Finance() {
  const { customerInvoices, supplierInvoices, paymentRecords, addCustomerInvoice, addSupplierInvoice, addPaymentRecord, recordPaymentAgainstInvoice, showToast, currentUser } = useStore();
  const [tab, setTab] = useState<Tab>('overview');
  const [showAddInvoice, setShowAddInvoice] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [invoiceType, setInvoiceType] = useState<'customer' | 'supplier'>('customer');

  // KPIs
  const totalReceivables = customerInvoices.filter(i => i.status !== 'paid').reduce((s, i) => s + (i.amount - i.amountPaid), 0);
  const totalPayables = supplierInvoices.filter(i => i.status !== 'paid').reduce((s, i) => s + (i.amount - i.amountPaid), 0);
  const overdueReceivables = customerInvoices.filter(i => i.status === 'overdue').reduce((s, i) => s + (i.amount - i.amountPaid), 0);
  const overduePayables = supplierInvoices.filter(i => i.status === 'overdue').reduce((s, i) => s + (i.amount - i.amountPaid), 0);
  const totalInflows = paymentRecords.filter(p => p.direction === 'inbound').reduce((s, p) => s + p.amount, 0);
  const totalOutflows = paymentRecords.filter(p => p.direction === 'outbound').reduce((s, p) => s + p.amount, 0);

  const isReadOnly = currentUser.role === 'auditor';

  const TABS: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'receivables', label: 'Receivables' },
    { key: 'payables', label: 'Payables' },
    { key: 'payments', label: 'Payments' },
  ];

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-[var(--text)]">Finance</h1>
          <p className="text-sm text-[var(--text-2)] mt-0.5">Receivables, payables and payment records — operational finance overview</p>
        </div>
        {!isReadOnly && (
          <div className="flex gap-2">
            <button
              onClick={() => { setInvoiceType('customer'); setShowAddInvoice(true); }}
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
      <div className="mb-4 px-3 py-2.5 rounded-xl border border-[var(--warning)]/30 bg-[var(--warning)]/8 flex items-start gap-2 text-xs text-[var(--text-2)]">
        <AlertCircle size={14} className="mt-0.5 flex-shrink-0 text-[var(--warning)]" />
        <span>Operational finance only — not an accounting ledger. No double-entry, no statutory tax calculations. Values come from recorded demo transactions.</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-5 border-b border-[var(--border)]">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t.key
                ? 'border-[var(--brand)] text-[var(--brand)]'
                : 'border-transparent text-[var(--text-2)] hover:text-[var(--text)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div className="space-y-5">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Receivables', value: totalReceivables, icon: ArrowUpRight, color: 'text-[var(--success)]', bg: 'bg-green-50 dark:bg-green-950/20' },
              { label: 'Total Payables', value: totalPayables, icon: ArrowDownLeft, color: 'text-[var(--danger)]', bg: 'bg-red-50 dark:bg-red-950/20' },
              { label: 'Overdue (AR)', value: overdueReceivables, icon: Clock, color: 'text-[var(--warning)]', bg: 'bg-amber-50 dark:bg-amber-950/20' },
              { label: 'Overdue (AP)', value: overduePayables, icon: AlertCircle, color: 'text-[var(--danger)]', bg: 'bg-red-50 dark:bg-red-950/20' },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4">
                <div className={`w-9 h-9 rounded-xl ${kpi.bg} flex items-center justify-center mb-3`}>
                  <kpi.icon size={18} className={kpi.color} />
                </div>
                <div className="text-lg font-bold text-[var(--text)]">{fmt(kpi.value)}</div>
                <div className="text-xs text-[var(--text-3)] mt-0.5">{kpi.label}</div>
              </div>
            ))}
          </div>

          {/* Cash Flow Summary */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-[var(--text)] mb-4">Cash Flow Summary (Demo Period)</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-[var(--text-3)] mb-1 flex items-center gap-1"><TrendingUp size={12} className="text-[var(--success)]" /> Total Inflows Recorded</div>
                <div className="text-xl font-bold text-[var(--success)]">{fmt(totalInflows)}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--text-3)] mb-1 flex items-center gap-1"><TrendingDown size={12} className="text-[var(--danger)]" /> Total Outflows Recorded</div>
                <div className="text-xl font-bold text-[var(--danger)]">{fmt(totalOutflows)}</div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-[var(--text)] mb-4">Recent Payment Activity</h2>
            <div className="space-y-3">
              {paymentRecords.slice(0, 5).map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${p.direction === 'inbound' ? 'bg-green-100 dark:bg-green-950/30' : 'bg-red-100 dark:bg-red-950/30'}`}>
                      {p.direction === 'inbound' ? <ArrowUpRight size={14} className="text-[var(--success)]" /> : <ArrowDownLeft size={14} className="text-[var(--danger)]" />}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[var(--text)]">{p.partyName}</div>
                      <div className="text-xs text-[var(--text-3)]">{p.mode} · {p.reference}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${p.direction === 'inbound' ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                      {p.direction === 'inbound' ? '+' : '−'}{fmt(p.amount)}
                    </div>
                    <div className="text-xs text-[var(--text-3)]">{p.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Receivables Tab */}
      {tab === 'receivables' && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="eoss-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>PO Ref</th>
                  <th>Invoice Date</th>
                  <th>Due Date</th>
                  <th className="text-right">Amount</th>
                  <th className="text-right">Paid</th>
                  <th className="text-right">Outstanding</th>
                  <th>Ageing</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {customerInvoices.map(inv => (
                  <tr key={inv.id}>
                    <td className="font-mono text-xs text-[var(--brand)]">{inv.invoiceNumber}</td>
                    <td className="font-medium text-sm">{inv.customerName}</td>
                    <td className="text-xs text-[var(--text-3)]">{inv.customerPoRef ?? '—'}</td>
                    <td className="text-xs text-[var(--text-2)]">{inv.invoiceDate}</td>
                    <td className="text-xs text-[var(--text-2)]">{inv.dueDate}</td>
                    <td className="text-right font-medium text-sm">{fmt(inv.amount)}</td>
                    <td className="text-right text-sm text-[var(--success)]">{fmt(inv.amountPaid)}</td>
                    <td className="text-right font-semibold text-sm">{fmt(inv.amount - inv.amountPaid)}</td>
                    <td className="text-xs">{inv.status === 'paid' ? '—' : ageing(inv.dueDate)}</td>
                    <td><StatusChip status={inv.status} size="sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payables Tab */}
      {tab === 'payables' && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="eoss-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Supplier</th>
                  <th>PO Ref</th>
                  <th>Invoice Date</th>
                  <th>Due Date</th>
                  <th className="text-right">Amount</th>
                  <th className="text-right">Paid</th>
                  <th className="text-right">Outstanding</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {supplierInvoices.map(inv => (
                  <tr key={inv.id}>
                    <td className="font-mono text-xs text-[var(--brand)]">{inv.invoiceNumber}</td>
                    <td className="font-medium text-sm">{inv.supplierName}</td>
                    <td className="text-xs text-[var(--text-3)]">{inv.supplierPoRef ?? '—'}</td>
                    <td className="text-xs text-[var(--text-2)]">{inv.invoiceDate}</td>
                    <td className="text-xs text-[var(--text-2)]">{inv.dueDate}</td>
                    <td className="text-right font-medium text-sm">{fmt(inv.amount)}</td>
                    <td className="text-right text-sm text-[var(--success)]">{fmt(inv.amountPaid)}</td>
                    <td className="text-right font-semibold text-sm">{fmt(inv.amount - inv.amountPaid)}</td>
                    <td><StatusChip status={inv.status} size="sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {tab === 'payments' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-[var(--text-2)]">{paymentRecords.length} payment records</div>
            {!isReadOnly && (
              <button
                onClick={() => setShowAddPayment(true)}
                className="flex items-center gap-2 px-3.5 py-2 bg-[var(--brand)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Plus size={15} /> Record Payment
              </button>
            )}
          </div>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="eoss-table">
                <thead>
                  <tr>
                    <th>Direction</th>
                    <th>Party</th>
                    <th>Date</th>
                    <th>Mode</th>
                    <th>Reference</th>
                    <th className="text-right">Amount</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentRecords.map(p => (
                    <tr key={p.id}>
                      <td>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.direction === 'inbound' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {p.direction === 'inbound' ? '↑ Inbound' : '↓ Outbound'}
                        </span>
                      </td>
                      <td className="font-medium text-sm">{p.partyName}</td>
                      <td className="text-xs text-[var(--text-2)]">{p.date}</td>
                      <td className="text-xs text-[var(--text-2)]">{p.mode}</td>
                      <td className="font-mono text-xs text-[var(--text-3)]">{p.reference}</td>
                      <td className="text-right font-semibold text-sm">{fmt(p.amount)}</td>
                      <td className="text-xs text-[var(--text-3)] max-w-[200px] truncate">{p.notes ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Invoice Modal */}
      {showAddInvoice && (
        <AddInvoiceModal
          type={invoiceType}
          onTypeChange={setInvoiceType}
          onClose={() => setShowAddInvoice(false)}
          onSave={(inv) => {
            if (invoiceType === 'customer') addCustomerInvoice(inv as CustomerInvoice);
            else addSupplierInvoice(inv as SupplierInvoice);
            showToast({ type: 'success', title: 'Invoice recorded', body: `${inv.invoiceNumber} saved.` });
            setShowAddInvoice(false);
          }}
        />
      )}

      {/* Add Payment Modal */}
      {showAddPayment && (
        <AddPaymentModal
          invoices={{ customer: customerInvoices, supplier: supplierInvoices }}
          onClose={() => setShowAddPayment(false)}
          onSave={(pay, linkedInvId, dir) => {
            addPaymentRecord(pay);
            if (linkedInvId) recordPaymentAgainstInvoice(linkedInvId, dir, pay.amount);
            showToast({ type: 'success', title: 'Payment recorded', body: `${fmt(pay.amount)} recorded.` });
            setShowAddPayment(false);
          }}
        />
      )}
    </div>
  );
}

import type { CustomerInvoice, SupplierInvoice, PaymentRecord } from '../../types';

interface AddInvoiceModalProps {
  type: 'customer' | 'supplier';
  onTypeChange: (t: 'customer' | 'supplier') => void;
  onClose: () => void;
  onSave: (inv: CustomerInvoice | SupplierInvoice) => void;
}

function AddInvoiceModal({ type, onTypeChange, onClose, onSave }: AddInvoiceModalProps) {
  const { CUSTOMERS, SUPPLIERS } = useStore() as unknown as { CUSTOMERS: any[]; SUPPLIERS: any[] };
  const store = useStore();
  const [form, setForm] = useState({
    invoiceNumber: `INV-2026-${String(Date.now()).slice(-4)}`,
    partyId: '',
    partyName: '',
    poRef: '',
    invoiceDate: '2026-11-05',
    dueDate: '2026-12-05',
    amount: '',
    hsnCode: '',
    taxType: 'cgst_sgst' as 'cgst_sgst' | 'igst',
    taxRate: '18',
  });
  const [err, setErr] = useState('');

  const baseAmt = Number(form.amount) || 0;
  const taxRate = Number(form.taxRate) / 100;
  const taxAmt = baseAmt * taxRate;
  const halfTax = taxAmt / 2;

  const parties = type === 'customer'
    ? store.customerPos.reduce((acc: {id: string; name: string}[], po) => {
        if (!acc.find(p => p.id === po.customerId)) acc.push({ id: po.customerId, name: po.customerName });
        return acc;
      }, [])
    : store.supplierPos.reduce((acc: {id: string; name: string}[], po) => {
        if (!acc.find(p => p.id === po.supplierId)) acc.push({ id: po.supplierId, name: po.supplierName });
        return acc;
      }, []);

  const save = () => {
    if (!form.partyId || !form.amount || !form.invoiceDate || !form.dueDate) {
      setErr('Please fill all required fields'); return;
    }
    const id = `${type === 'customer' ? 'cinv' : 'sinv'}-${Date.now()}`;
    if (type === 'customer') {
      onSave({ id, invoiceNumber: form.invoiceNumber, customerId: form.partyId, customerName: form.partyName, customerPoRef: form.poRef || undefined, invoiceDate: form.invoiceDate, dueDate: form.dueDate, amount: Number(form.amount), amountPaid: 0, currency: 'INR', status: 'sent' });
    } else {
      onSave({ id, invoiceNumber: form.invoiceNumber, supplierId: form.partyId, supplierName: form.partyName, supplierPoRef: form.poRef || undefined, invoiceDate: form.invoiceDate, dueDate: form.dueDate, amount: Number(form.amount), amountPaid: 0, currency: 'INR', status: 'pending' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <h3 className="text-base font-bold text-[var(--text)] mb-4">Add Invoice</h3>
        <div className="flex gap-2 mb-4">
          {(['customer', 'supplier'] as const).map(t => (
            <button key={t} onClick={() => onTypeChange(t)} className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${type === t ? 'bg-[var(--brand)] text-white border-[var(--brand)]' : 'border-[var(--border)] text-[var(--text-2)]'}`}>
              {t === 'customer' ? 'Customer Invoice' : 'Supplier Invoice'}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Invoice Number *</label>
            <input className="eoss-input w-full" value={form.invoiceNumber} onChange={e => setForm(f => ({ ...f, invoiceNumber: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">{type === 'customer' ? 'Customer' : 'Supplier'} *</label>
            <select className="eoss-input w-full" value={form.partyId} onChange={e => {
              const p = parties.find(x => x.id === e.target.value);
              setForm(f => ({ ...f, partyId: e.target.value, partyName: p?.name ?? '' }));
            }}>
              <option value="">Select…</option>
              {parties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">PO Reference</label>
            <input className="eoss-input w-full" value={form.poRef} onChange={e => setForm(f => ({ ...f, poRef: e.target.value }))} placeholder="Optional" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Invoice Date *</label>
              <input type="date" className="eoss-input w-full" value={form.invoiceDate} onChange={e => setForm(f => ({ ...f, invoiceDate: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Due Date *</label>
              <input type="date" className="eoss-input w-full" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Base Amount (₹) *</label>
            <input type="number" className="eoss-input w-full" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="e.g. 150000" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-2)] mb-1">HSN Code</label>
              <input className="eoss-input w-full" value={form.hsnCode} onChange={e => setForm(f => ({ ...f, hsnCode: e.target.value }))} placeholder="e.g. 7208" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Tax Rate</label>
              <select className="eoss-input w-full" value={form.taxRate} onChange={e => setForm(f => ({ ...f, taxRate: e.target.value }))}>
                {['0','5','12','18','28'].map(r => <option key={r} value={r}>{r}%</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Tax Type</label>
            <div className="flex gap-2">
              {(['cgst_sgst', 'igst'] as const).map(t => (
                <button key={t} type="button" onClick={() => setForm(f => ({ ...f, taxType: t }))}
                  className={`flex-1 py-1.5 rounded-lg text-xs border font-medium transition-colors ${form.taxType === t ? 'bg-[var(--brand)] text-white border-[var(--brand)]' : 'border-[var(--border)] text-[var(--text-2)]'}`}>
                  {t === 'cgst_sgst' ? 'CGST + SGST (Intra-state)' : 'IGST (Inter-state)'}
                </button>
              ))}
            </div>
          </div>
          {baseAmt > 0 && Number(form.taxRate) > 0 && (
            <div className="text-xs rounded-xl p-3 space-y-1" style={{ background: 'var(--surface-2)', color: 'var(--text-2)' }}>
              <div className="flex justify-between"><span>Base Amount</span><span>{fmt(baseAmt)}</span></div>
              {form.taxType === 'cgst_sgst' ? (
                <>
                  <div className="flex justify-between"><span>CGST ({Number(form.taxRate)/2}%)</span><span>{fmt(halfTax)}</span></div>
                  <div className="flex justify-between"><span>SGST ({Number(form.taxRate)/2}%)</span><span>{fmt(halfTax)}</span></div>
                </>
              ) : (
                <div className="flex justify-between"><span>IGST ({form.taxRate}%)</span><span>{fmt(taxAmt)}</span></div>
              )}
              <div className="flex justify-between font-semibold pt-1 border-t border-[var(--border)]" style={{ color: 'var(--text)' }}>
                <span>Total</span><span>{fmt(baseAmt + taxAmt)}</span>
              </div>
            </div>
          )}
        </div>
        {err && <p className="text-xs text-[var(--danger)] mt-2">{err}</p>}
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[var(--border)] rounded-xl text-sm text-[var(--text-2)] hover:border-[var(--brand)] transition-colors">Cancel</button>
          <button onClick={save} className="flex-1 py-2.5 bg-[var(--brand)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">Save Invoice</button>
        </div>
      </div>
    </div>
  );
}

interface AddPaymentModalProps {
  invoices: { customer: CustomerInvoice[]; supplier: SupplierInvoice[] };
  onClose: () => void;
  onSave: (pay: PaymentRecord, linkedInvId: string | undefined, dir: 'inbound' | 'outbound') => void;
}

function AddPaymentModal({ invoices, onClose, onSave }: AddPaymentModalProps) {
  const [form, setForm] = useState({
    direction: 'inbound' as 'inbound' | 'outbound',
    partyName: '',
    date: '2026-11-05',
    amount: '',
    mode: 'NEFT',
    reference: '',
    linkedInvoiceId: '',
    notes: '',
  });
  const [err, setErr] = useState('');

  const availableInvoices = form.direction === 'inbound'
    ? invoices.customer.filter(i => i.status !== 'paid')
    : invoices.supplier.filter(i => i.status !== 'paid');

  const save = () => {
    if (!form.partyName || !form.amount || !form.reference) { setErr('Party name, amount and reference are required'); return; }
    const selectedInv = availableInvoices.find(i => i.id === form.linkedInvoiceId);
    const partyId = selectedInv ? (form.direction === 'inbound' ? (selectedInv as CustomerInvoice).customerId : (selectedInv as SupplierInvoice).supplierId) : `party-${Date.now()}`;
    onSave({
      id: `pay-${Date.now()}`,
      direction: form.direction,
      partyId,
      partyName: form.partyName,
      date: form.date,
      amount: Number(form.amount),
      currency: 'INR',
      mode: form.mode as PaymentRecord['mode'],
      reference: form.reference,
      linkedInvoiceId: form.linkedInvoiceId || undefined,
      notes: form.notes || undefined,
    }, form.linkedInvoiceId || undefined, form.direction);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <h3 className="text-base font-bold text-[var(--text)] mb-4">Record Payment</h3>
        <div className="flex gap-2 mb-4">
          {(['inbound', 'outbound'] as const).map(d => (
            <button key={d} onClick={() => setForm(f => ({ ...f, direction: d, linkedInvoiceId: '' }))} className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${form.direction === d ? 'bg-[var(--brand)] text-white border-[var(--brand)]' : 'border-[var(--border)] text-[var(--text-2)]'}`}>
              {d === 'inbound' ? '↑ Customer Receipt' : '↓ Supplier Payment'}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Link to Invoice (optional)</label>
            <select className="eoss-input w-full" value={form.linkedInvoiceId} onChange={e => {
              const inv = availableInvoices.find(i => i.id === e.target.value);
              const name = inv ? (form.direction === 'inbound' ? (inv as CustomerInvoice).customerName : (inv as SupplierInvoice).supplierName) : '';
              setForm(f => ({ ...f, linkedInvoiceId: e.target.value, partyName: name || f.partyName }));
            }}>
              <option value="">No invoice linked</option>
              {availableInvoices.map(i => <option key={i.id} value={i.id}>{i.invoiceNumber} — {form.direction === 'inbound' ? (i as CustomerInvoice).customerName : (i as SupplierInvoice).supplierName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Party Name *</label>
            <input className="eoss-input w-full" value={form.partyName} onChange={e => setForm(f => ({ ...f, partyName: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Date *</label>
              <input type="date" className="eoss-input w-full" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Amount (₹) *</label>
              <input type="number" className="eoss-input w-full" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Mode</label>
              <select className="eoss-input w-full" value={form.mode} onChange={e => setForm(f => ({ ...f, mode: e.target.value }))}>
                {['NEFT', 'RTGS', 'IMPS', 'UPI', 'Cheque', 'Cash', 'Other'].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Reference *</label>
              <input className="eoss-input w-full" value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} placeholder="NEFT/UTR/Ref" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Notes</label>
            <input className="eoss-input w-full" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
        </div>
        {err && <p className="text-xs text-[var(--danger)] mt-2">{err}</p>}
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[var(--border)] rounded-xl text-sm text-[var(--text-2)] hover:border-[var(--brand)] transition-colors">Cancel</button>
          <button onClick={save} className="flex-1 py-2.5 bg-[var(--brand)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">Save Payment</button>
        </div>
      </div>
    </div>
  );
}
