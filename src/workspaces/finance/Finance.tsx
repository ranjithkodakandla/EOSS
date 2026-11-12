import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Plus, Search, ArrowDownLeft, ArrowUpRight,
  Building2, History, Scale, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { useStore } from '../../store';
import { computeAgeingBucket, computeDaysOverdue, isRecordOverdue } from '../../domain/finance';
import StatusChip from '../../components/layout/StatusChip';
import { getAuditActionLabel, getAuditEntityRoute, formatRoleLabel } from '../../domain/audit';

const fmtINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const fmtDate = (d?: string) => {
  if (!d) return '—';
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? d : dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

type FinanceTab =
  | 'overview'
  | 'invoices'
  | 'payments'
  | 'receivables'
  | 'bills'
  | 'supplier_payments'
  | 'payables'
  | 'collections';

const VALID_TABS: FinanceTab[] = [
  'overview',
  'invoices',
  'payments',
  'receivables',
  'bills',
  'supplier_payments',
  'payables',
  'collections',
];

const TAB_LABELS: Record<FinanceTab, string> = {
  overview: 'Overview',
  invoices: 'Customer Invoices',
  payments: 'Customer Payments',
  receivables: 'Receivables & Ageing',
  bills: 'Supplier Bills',
  supplier_payments: 'Supplier Payments',
  payables: 'Payables & Ageing',
  collections: 'Statements & History',
};

export default function Finance() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') as FinanceTab | null;
  const [tab, setTab] = useState<FinanceTab>(
    initialTab && VALID_TABS.includes(initialTab) ? initialTab : 'overview',
  );

  useEffect(() => {
    const q = searchParams.get('tab') as FinanceTab | null;
    if (q && VALID_TABS.includes(q) && q !== tab) {
      setTab(q);
    }
  }, [searchParams, tab]);

  const switchTab = (next: FinanceTab) => {
    setTab(next);
    setSearchParams({ tab: next }, { replace: true });
  };

  const invoices = useStore(s => s.invoices);
  const payments = useStore(s => s.payments);
  const supplierBills = useStore(s => s.supplierBills);
  const supplierPayments = useStore(s => s.supplierPayments);
  const customers = useStore(s => s.customers);
  const suppliers = useStore(s => s.suppliers);
  const auditEvents = useStore(s => s.auditEvents);
  const currentRole = useStore(s => s.currentUser.role);

  const [search, setSearch] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [billStatusFilter, setBillStatusFilter] = useState<string>('all');
  const [spayStatusFilter, setSpayStatusFilter] = useState<string>('all');
  const [statementPartyId, setStatementPartyId] = useState<string>('');

  const canTransact =
    currentRole === 'owner' || currentRole === 'sales' || currentRole === 'buyer' || currentRole === 'dispatch';

  // KPI calculations
  const metrics = useMemo(() => {
    let openAR = 0;
    let overdueAR = 0;
    let arOverdueCount = 0;
    const arBuckets = { current: 0, '1_30': 0, '31_60': 0, '60_plus': 0 };

    for (const inv of invoices) {
      if (inv.status === 'void' || inv.status === 'cancelled' || inv.status === 'draft') continue;
      if (inv.outstandingAmount > 0) {
        openAR += inv.outstandingAmount;
        const bucket = computeAgeingBucket(inv.dueDate);
        arBuckets[bucket] += inv.outstandingAmount;
        if (isRecordOverdue(inv.status, inv.dueDate, inv.outstandingAmount)) {
          overdueAR += inv.outstandingAmount;
          arOverdueCount++;
        }
      }
    }

    let openAP = 0;
    let overdueAP = 0;
    let dueSoonAP = 0;
    let heldBillsCount = 0;
    let heldBillsAmount = 0;
    const apBuckets = { current: 0, '1_30': 0, '31_60': 0, '60_plus': 0 };

    for (const bill of supplierBills) {
      if (bill.status === 'rejected' || bill.status === 'void') continue;
      if (
        bill.status === 'on_hold' ||
        bill.status === 'disputed' ||
        bill.matchStatus === 'qty_mismatch' ||
        bill.matchStatus === 'rate_mismatch'
      ) {
        if (bill.outstandingAmount > 0) {
          heldBillsCount++;
          heldBillsAmount += bill.outstandingAmount;
        }
      }
      if (bill.outstandingAmount > 0) {
        openAP += bill.outstandingAmount;
        const bucket = computeAgeingBucket(bill.dueDate);
        apBuckets[bucket] += bill.outstandingAmount;
        const overdue = isRecordOverdue(bill.status, bill.dueDate, bill.outstandingAmount);
        if (overdue) {
          overdueAP += bill.outstandingAmount;
        } else {
          const daysPastDue = computeDaysOverdue(bill.dueDate);
          if (daysPastDue >= -7 && daysPastDue <= 0) {
            dueSoonAP += bill.outstandingAmount;
          }
        }
      }
    }

    const activeReceipts = payments.filter(p => p.status !== 'reversed');
    const collectedTotal = activeReceipts.reduce((s, p) => s + p.amount, 0);
    const unallocatedReceipts = activeReceipts.reduce((s, p) => s + (p.unallocatedAmount || 0), 0);

    const activePayouts = supplierPayments.filter(p => p.status !== 'reversed');
    const paidSuppliersTotal = activePayouts.reduce((s, p) => s + p.amount, 0);

    return {
      openAR,
      overdueAR,
      arOverdueCount,
      arBuckets,
      openAP,
      overdueAP,
      dueSoonAP,
      apBuckets,
      heldBillsCount,
      heldBillsAmount,
      collectedTotal,
      unallocatedReceipts,
      paidSuppliersTotal,
      netWorkingPosition: openAR - openAP,
    };
  }, [invoices, supplierBills, payments, supplierPayments]);

  const customerExposure = useMemo(() => {
    const map = new Map<string, { partyId: string; name: string; billed: number; collected: number; open: number; overdue: number; count: number }>();
    for (const inv of invoices) {
      if (inv.status === 'void' || inv.status === 'cancelled' || inv.status === 'draft') continue;
      const cur = map.get(inv.customerId) || {
        partyId: inv.customerId,
        name: inv.customerName,
        billed: 0,
        collected: 0,
        open: 0,
        overdue: 0,
        count: 0,
      };
      cur.billed += inv.totalAmount;
      cur.collected += inv.paidAmount;
      cur.open += inv.outstandingAmount;
      cur.count++;
      if (isRecordOverdue(inv.status, inv.dueDate, inv.outstandingAmount)) {
        cur.overdue += inv.outstandingAmount;
      }
      map.set(inv.customerId, cur);
    }
    return Array.from(map.values()).sort((a, b) => b.open - a.open);
  }, [invoices]);

  const supplierExposure = useMemo(() => {
    const map = new Map<string, { partyId: string; name: string; billed: number; paid: number; open: number; overdue: number; held: number; count: number }>();
    for (const bill of supplierBills) {
      if (bill.status === 'rejected' || bill.status === 'void') continue;
      const cur = map.get(bill.supplierId) || {
        partyId: bill.supplierId,
        name: bill.supplierName,
        billed: 0,
        paid: 0,
        open: 0,
        overdue: 0,
        held: 0,
        count: 0,
      };
      cur.billed += bill.totalAmount;
      cur.paid += bill.paidAmount;
      cur.open += bill.outstandingAmount;
      cur.count++;
      if (isRecordOverdue(bill.status, bill.dueDate, bill.outstandingAmount)) cur.overdue += bill.outstandingAmount;
      if (bill.status === 'on_hold' || bill.status === 'disputed') cur.held += bill.outstandingAmount;
      map.set(bill.supplierId, cur);
    }
    return Array.from(map.values()).sort((a, b) => b.open - a.open);
  }, [supplierBills]);

  const q = search.trim().toLowerCase();

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const effectiveOverdue = isRecordOverdue(inv.status, inv.dueDate, inv.outstandingAmount);
      const matchStatus =
        invoiceStatusFilter === 'all' ||
        (invoiceStatusFilter === 'overdue' ? effectiveOverdue || inv.status === 'overdue' : inv.status === invoiceStatusFilter);
      const matchQuery =
        !q ||
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.customerName.toLowerCase().includes(q) ||
        (inv.poNumber || '').toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [invoices, invoiceStatusFilter, q]);

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const unalloc = p.unallocatedAmount ?? (p.amount - p.allocatedAmount);
      const matchStatus =
        paymentStatusFilter === 'all' ||
        (paymentStatusFilter === 'unallocated' ? unalloc > 0 && p.status !== 'reversed' : p.status === paymentStatusFilter);
      const matchQuery =
        !q ||
        p.paymentNumber.toLowerCase().includes(q) ||
        p.customerName.toLowerCase().includes(q) ||
        p.transactionRef.toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [payments, paymentStatusFilter, q]);

  const filteredBills = useMemo(() => {
    return supplierBills.filter(b => {
      const effectiveOverdue = isRecordOverdue(b.status, b.dueDate, b.outstandingAmount);
      const matchStatus =
        billStatusFilter === 'all' ||
        (billStatusFilter === 'overdue' ? effectiveOverdue || b.status === 'overdue' : b.status === billStatusFilter);
      const matchQuery =
        !q ||
        b.billNumber.toLowerCase().includes(q) ||
        b.supplierName.toLowerCase().includes(q) ||
        b.supplierInvoiceNo.toLowerCase().includes(q) ||
        (b.spoNumber || '').toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [supplierBills, billStatusFilter, q]);

  const filteredSupplierPayments = useMemo(() => {
    return supplierPayments.filter(p => {
      const matchStatus =
        spayStatusFilter === 'all' ||
        (spayStatusFilter === 'unallocated' ? p.unallocatedAmount > 0 && p.status !== 'reversed' : p.status === spayStatusFilter);
      const matchQuery =
        !q ||
        p.paymentNumber.toLowerCase().includes(q) ||
        p.supplierName.toLowerCase().includes(q) ||
        p.transactionRef.toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [supplierPayments, spayStatusFilter, q]);

  const allStatementParties = useMemo(
    () => [
      ...customers.map(c => ({ id: c.id, name: c.tradingName, kind: 'Customer' as const })),
      ...suppliers.map(s => ({ id: s.id, name: s.tradingName, kind: 'Supplier' as const })),
    ],
    [customers, suppliers],
  );
  const selectedParty = allStatementParties.find(p => p.id === statementPartyId) || allStatementParties[0];

  const statementLedger = useMemo(() => {
    if (!selectedParty) return [];
    const entries: Array<{
      id: string;
      date: string;
      docType: string;
      ref: string;
      route: string;
      debit: number;
      credit: number;
      status: string;
    }> = [];

    if (selectedParty.kind === 'Customer') {
      for (const inv of invoices.filter(i => i.customerId === selectedParty.id && i.status !== 'draft' && i.status !== 'void' && i.status !== 'cancelled')) {
        entries.push({
          id: `inv-${inv.id}`,
          date: inv.invoiceDate,
          docType: 'Customer Invoice',
          ref: inv.invoiceNumber,
          route: `/finance/invoice/${inv.id}`,
          debit: inv.totalAmount,
          credit: 0,
          status: inv.status,
        });
      }
      for (const pay of payments.filter(p => p.customerId === selectedParty.id && p.status !== 'reversed')) {
        entries.push({
          id: `pay-${pay.id}`,
          date: pay.receiptDate,
          docType: 'Payment Receipt',
          ref: `${pay.paymentNumber} (${pay.transactionRef})`,
          route: `/finance/payment/${pay.id}`,
          debit: 0,
          credit: pay.amount,
          status: pay.status,
        });
      }
    } else {
      for (const bill of supplierBills.filter(b => b.supplierId === selectedParty.id && b.status !== 'rejected' && b.status !== 'void')) {
        entries.push({
          id: `bill-${bill.id}`,
          date: bill.billDate,
          docType: `Supplier Bill (${bill.supplierInvoiceNo})`,
          ref: bill.billNumber,
          route: `/finance/bill/${bill.id}`,
          debit: 0,
          credit: bill.totalAmount,
          status: bill.status,
        });
      }
      for (const spay of supplierPayments.filter(p => p.supplierId === selectedParty.id && p.status !== 'reversed')) {
        entries.push({
          id: `spay-${spay.id}`,
          date: spay.paymentDate,
          docType: 'Supplier Payment',
          ref: `${spay.paymentNumber} (${spay.transactionRef})`,
          route: `/finance/supplier-payment/${spay.id}`,
          debit: spay.amount,
          credit: 0,
          status: spay.status,
        });
      }
    }

    entries.sort((a, b) => a.date.localeCompare(b.date));
    let running = 0;
    return entries.map(e => {
      running += e.debit - e.credit;
      return { ...e, runningBalance: running };
    });
  }, [selectedParty, invoices, payments, supplierBills, supplierPayments]);

  const financeAuditEvents = useMemo(() => {
    const finScopes = new Set([
      'Invoice',
      'CustomerInvoice',
      'Payment',
      'CustomerPayment',
      'SupplierBill',
      'SupplierPayment',
    ]);
    return [...auditEvents]
      .filter(e => e.module === 'Finance' || finScopes.has(e.scope))
      .sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''))
      .slice(0, 40);
  }, [auditEvents]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-1)] tracking-tight">Finance — Receivables &amp; Payables</h1>
          <p className="text-xs text-[var(--text-3)] mt-0.5">
            Order-to-Cash invoicing &amp; collections · Procure-to-Pay 3-way matched vendor bills &amp; settlements
          </p>
        </div>
        {canTransact && (
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/finance/invoice/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-fg)] rounded-lg transition-colors"
            >
              <Plus size={13} /> Customer Invoice
            </Link>
            <Link
              to="/finance/payment/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text-1)] border border-[var(--border)] rounded-lg transition-colors"
            >
              <ArrowDownLeft size={13} className="text-[var(--success)]" /> Customer Payment
            </Link>
            <Link
              to="/finance/bill/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text-1)] border border-[var(--border)] rounded-lg transition-colors"
            >
              <Plus size={13} /> Supplier Bill
            </Link>
            <Link
              to="/finance/supplier-payment/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text-1)] border border-[var(--border)] rounded-lg transition-colors"
            >
              <ArrowUpRight size={13} className="text-amber-400" /> Pay Supplier
            </Link>
          </div>
        )}
      </div>

      <div className="mb-5 px-3.5 py-2 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/25 text-xs text-[var(--text-2)] flex items-center gap-2">
        <ShieldAlert size={14} className="text-[var(--accent)] shrink-0" />
        <span>
          <strong>Prototype Simulation:</strong> Banking transfers, GST filings, and ledger updates are simulated for operational workflow walkthroughs.
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-[var(--border)] mb-5 pb-px">
        {VALID_TABS.map(t => (
          <button
            key={t}
            onClick={() => switchTab(t)}
            className={`px-3.5 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === t
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-transparent text-[var(--text-3)] hover:text-[var(--text-1)]'
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {(tab === 'invoices' || tab === 'payments' || tab === 'bills' || tab === 'supplier_payments') && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search number, party, PO, or reference..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-[var(--text-1)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
        </div>
      )}

      {/* TAB 1: OVERVIEW */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => switchTab('receivables')}
              className="text-left bg-[var(--surface-2)] hover:border-[var(--accent)]/50 border border-[var(--border)] rounded-xl p-4 transition-colors"
            >
              <div className="flex items-center justify-between text-[var(--text-3)] text-[11px] uppercase tracking-wider">
                <span>Open Receivables (AR)</span>
                <ArrowDownLeft size={14} className="text-[var(--success)]" />
              </div>
              <p className="text-xl font-bold text-[var(--text-1)] tabular-nums mt-1.5">{fmtINR(metrics.openAR)}</p>
              <p className="text-[11px] text-[var(--danger)] mt-1">
                {metrics.arOverdueCount} overdue ({fmtINR(metrics.overdueAR)})
              </p>
            </button>

            <button
              onClick={() => switchTab('payables')}
              className="text-left bg-[var(--surface-2)] hover:border-[var(--accent)]/50 border border-[var(--border)] rounded-xl p-4 transition-colors"
            >
              <div className="flex items-center justify-between text-[var(--text-3)] text-[11px] uppercase tracking-wider">
                <span>Open Payables (AP)</span>
                <ArrowUpRight size={14} className="text-amber-400" />
              </div>
              <p className="text-xl font-bold text-[var(--text-1)] tabular-nums mt-1.5">{fmtINR(metrics.openAP)}</p>
              <p className="text-[11px] text-amber-400 mt-1">
                Overdue {fmtINR(metrics.overdueAP)} · Due 7d {fmtINR(metrics.dueSoonAP)}
              </p>
            </button>

            <button
              onClick={() => switchTab('payments')}
              className="text-left bg-[var(--surface-2)] hover:border-[var(--accent)]/50 border border-[var(--border)] rounded-xl p-4 transition-colors"
            >
              <div className="flex items-center justify-between text-[var(--text-3)] text-[11px] uppercase tracking-wider">
                <span>Cash Collected</span>
                <CheckCircle2 size={14} className="text-[var(--success)]" />
              </div>
              <p className="text-xl font-bold text-[var(--success)] tabular-nums mt-1.5">{fmtINR(metrics.collectedTotal)}</p>
              <p className="text-[11px] text-[var(--text-3)] mt-1">
                Unallocated advances: {fmtINR(metrics.unallocatedReceipts)}
              </p>
            </button>

            <button
              onClick={() => { setBillStatusFilter('on_hold'); switchTab('bills'); }}
              className="text-left bg-[var(--surface-2)] hover:border-[var(--accent)]/50 border border-[var(--border)] rounded-xl p-4 transition-colors"
            >
              <div className="flex items-center justify-between text-[var(--text-3)] text-[11px] uppercase tracking-wider">
                <span>Held / Mismatched Bills</span>
                <Scale size={14} className="text-amber-400" />
              </div>
              <p className="text-xl font-bold text-amber-300 tabular-nums mt-1.5">{metrics.heldBillsCount} bills</p>
              <p className="text-[11px] text-[var(--text-3)] mt-1">
                Exposure: {fmtINR(metrics.heldBillsAmount)} · Net AR-AP: {fmtINR(metrics.netWorkingPosition)}
              </p>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-[var(--text-1)]">Top Customer Receivables</h2>
                <button onClick={() => switchTab('receivables')} className="text-xs text-[var(--accent)] hover:underline">
                  View Ageing →
                </button>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {customerExposure.slice(0, 5).map(row => (
                  <div key={row.partyId} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <Link to={`/sales/customers/${row.partyId}`} className="font-medium text-[var(--text-1)] hover:text-[var(--accent)]">
                        {row.name}
                      </Link>
                      <p className="text-[11px] text-[var(--text-3)]">
                        {row.count} invoice{row.count === 1 ? '' : 's'} · Collected {fmtINR(row.collected)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[var(--text-1)] tabular-nums">{fmtINR(row.open)}</p>
                      {row.overdue > 0 && <p className="text-[10px] text-[var(--danger)] tabular-nums">Overdue {fmtINR(row.overdue)}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-[var(--text-1)]">Supplier Payables &amp; Approvals</h2>
                <button onClick={() => switchTab('bills')} className="text-xs text-[var(--accent)] hover:underline">
                  Manage Bills →
                </button>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {supplierExposure.slice(0, 5).map(row => (
                  <div key={row.partyId} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <Link to={`/suppliers/${row.partyId}`} className="font-medium text-[var(--text-1)] hover:text-[var(--accent)]">
                        {row.name}
                      </Link>
                      <p className="text-[11px] text-[var(--text-3)]">
                        {row.count} bill{row.count === 1 ? '' : 's'} · Paid {fmtINR(row.paid)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[var(--text-1)] tabular-nums">{fmtINR(row.open)}</p>
                      {row.held > 0 ? (
                        <p className="text-[10px] text-amber-400 tabular-nums">Held {fmtINR(row.held)}</p>
                      ) : row.overdue > 0 ? (
                        <p className="text-[10px] text-[var(--danger)] tabular-nums">Overdue {fmtINR(row.overdue)}</p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <History size={15} className="text-[var(--accent)]" />
                <h2 className="text-sm font-semibold text-[var(--text-1)]">Recent Finance Activity</h2>
              </div>
              <button onClick={() => switchTab('collections')} className="text-xs text-[var(--accent)] hover:underline">
                Full Statements &amp; History →
              </button>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {financeAuditEvents.slice(0, 6).map(ev => {
                const route = getAuditEntityRoute(ev.scope, ev.entityId);
                return (
                  <div key={ev.id} className="py-2.5 flex items-start justify-between gap-4 text-xs">
                    <div>
                      <span className="font-medium text-[var(--text-1)]">{getAuditActionLabel(ev.action)}</span>
                      {' — '}
                      {route ? (
                        <Link to={route} className="font-mono text-[var(--accent)] hover:underline">
                          {ev.entityRef || ev.entityId}
                        </Link>
                      ) : (
                        <span className="font-mono text-[var(--text-2)]">{ev.entityRef || ev.entityId}</span>
                      )}
                      <p className="text-[11px] text-[var(--text-2)] mt-0.5">{ev.description || ev.reason || 'Recorded transaction'}</p>
                    </div>
                    <div className="text-right shrink-0 text-[11px] text-[var(--text-3)]">
                      <p>{ev.actor} ({formatRoleLabel(ev.role)})</p>
                      <p>{fmtDate(ev.timestamp)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOMER INVOICES */}
      {tab === 'invoices' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {['all', 'draft', 'issued', 'partially_paid', 'paid', 'overdue', 'void'].map(st => (
              <button
                key={st}
                onClick={() => setInvoiceStatusFilter(st)}
                className={`px-3 py-1 text-xs rounded-full border capitalize transition-colors ${
                  invoiceStatusFilter === st
                    ? 'bg-[var(--accent)]/15 border-[var(--accent)] text-[var(--accent)] font-medium'
                    : 'bg-[var(--surface-2)] border-[var(--border)] text-[var(--text-3)] hover:text-[var(--text-1)]'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--text-3)] text-[11px] uppercase bg-[var(--surface-3)]/30">
                    <th className="text-left px-4 py-3 font-medium">Invoice #</th>
                    <th className="text-left px-4 py-3 font-medium">Customer</th>
                    <th className="text-left px-3 py-3 font-medium">Customer PO</th>
                    <th className="text-left px-3 py-3 font-medium">Date</th>
                    <th className="text-left px-3 py-3 font-medium">Due Date</th>
                    <th className="text-right px-3 py-3 font-medium">Total</th>
                    <th className="text-right px-3 py-3 font-medium">Balance</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-[var(--text-3)]">
                        No customer invoices match the current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map(inv => {
                      const overdue = isRecordOverdue(inv.status, inv.dueDate, inv.outstandingAmount);
                      return (
                        <tr key={inv.id} className="hover:bg-[var(--surface-3)]/30 transition-colors">
                          <td className="px-4 py-3 font-mono font-semibold">
                            <Link to={`/finance/invoice/${inv.id}`} className="text-[var(--accent)] hover:underline">
                              {inv.invoiceNumber}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-[var(--text-1)]">{inv.customerName}</td>
                          <td className="px-3 py-3 font-mono text-[var(--text-2)]">{inv.poNumber || '—'}</td>
                          <td className="px-3 py-3 text-[var(--text-2)]">{fmtDate(inv.invoiceDate)}</td>
                          <td className="px-3 py-3 text-[var(--text-2)]">{fmtDate(inv.dueDate)}</td>
                          <td className="px-3 py-3 text-right tabular-nums text-[var(--text-1)]">{fmtINR(inv.totalAmount)}</td>
                          <td className="px-3 py-3 text-right tabular-nums font-semibold text-[var(--text-1)]">{fmtINR(inv.outstandingAmount)}</td>
                          <td className="px-4 py-3">
                            <StatusChip status={overdue && inv.status !== 'overdue' ? 'overdue' : inv.status} size="sm" />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOMER PAYMENTS */}
      {tab === 'payments' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {['all', 'allocated', 'partially_allocated', 'received', 'unallocated', 'reversed'].map(st => (
              <button
                key={st}
                onClick={() => setPaymentStatusFilter(st)}
                className={`px-3 py-1 text-xs rounded-full border capitalize transition-colors ${
                  paymentStatusFilter === st
                    ? 'bg-[var(--accent)]/15 border-[var(--accent)] text-[var(--accent)] font-medium'
                    : 'bg-[var(--surface-2)] border-[var(--border)] text-[var(--text-3)] hover:text-[var(--text-1)]'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--text-3)] text-[11px] uppercase bg-[var(--surface-3)]/30">
                    <th className="text-left px-4 py-3 font-medium">Receipt #</th>
                    <th className="text-left px-4 py-3 font-medium">Customer</th>
                    <th className="text-left px-3 py-3 font-medium">Date</th>
                    <th className="text-left px-3 py-3 font-medium">Method / Ref</th>
                    <th className="text-right px-3 py-3 font-medium">Received</th>
                    <th className="text-right px-3 py-3 font-medium">Unallocated</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredPayments.map(p => (
                    <tr key={p.id} className="hover:bg-[var(--surface-3)]/30 transition-colors">
                      <td className="px-4 py-3 font-mono font-semibold">
                        <Link to={`/finance/payment/${p.id}`} className="text-[var(--accent)] hover:underline">
                          {p.paymentNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-[var(--text-1)]">{p.customerName}</td>
                      <td className="px-3 py-3 text-[var(--text-2)]">{fmtDate(p.receiptDate)}</td>
                      <td className="px-3 py-3 text-[var(--text-2)]">
                        {p.paymentMethod.toUpperCase()} · <span className="font-mono text-[11px]">{p.transactionRef}</span>
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums font-medium text-[var(--text-1)]">{fmtINR(p.amount)}</td>
                      <td className="px-3 py-3 text-right tabular-nums text-[var(--warning)]">
                        {fmtINR(p.unallocatedAmount ?? (p.amount - p.allocatedAmount))}
                      </td>
                      <td className="px-4 py-3">
                        <StatusChip status={p.status} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ACCOUNTS RECEIVABLE AGEING */}
      {tab === 'receivables' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Current (Not Yet Due)', value: metrics.arBuckets.current, tone: 'text-[var(--success)]' },
              { label: '1 – 30 Days Past Due', value: metrics.arBuckets['1_30'], tone: 'text-amber-300' },
              { label: '31 – 60 Days Past Due', value: metrics.arBuckets['31_60'], tone: 'text-orange-400' },
              { label: '60+ Days Past Due', value: metrics.arBuckets['60_plus'], tone: 'text-[var(--danger)]' },
            ].map(b => (
              <div key={b.label} className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4">
                <p className="text-[11px] text-[var(--text-3)]">{b.label}</p>
                <p className={`text-lg font-bold tabular-nums mt-1 ${b.tone}`}>{fmtINR(b.value)}</p>
              </div>
            ))}
          </div>

          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[var(--border)]">
              <h2 className="text-sm font-semibold text-[var(--text-1)]">Customer Exposure Breakdown</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--text-3)] text-[11px] uppercase bg-[var(--surface-3)]/30">
                    <th className="text-left px-4 py-2.5">Customer</th>
                    <th className="text-right px-3 py-2.5">Invoices</th>
                    <th className="text-right px-3 py-2.5">Total Billed</th>
                    <th className="text-right px-3 py-2.5">Collected</th>
                    <th className="text-right px-3 py-2.5">Open AR</th>
                    <th className="text-right px-4 py-2.5">Overdue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {customerExposure.map(row => (
                    <tr key={row.partyId} className="hover:bg-[var(--surface-3)]/30">
                      <td className="px-4 py-3 font-medium">
                        <Link to={`/sales/customers/${row.partyId}`} className="text-[var(--accent)] hover:underline">
                          {row.name}
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-[var(--text-2)]">{row.count}</td>
                      <td className="px-3 py-3 text-right tabular-nums text-[var(--text-2)]">{fmtINR(row.billed)}</td>
                      <td className="px-3 py-3 text-right tabular-nums text-[var(--success)]">{fmtINR(row.collected)}</td>
                      <td className="px-3 py-3 text-right tabular-nums font-semibold text-[var(--text-1)]">{fmtINR(row.open)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-[var(--danger)]">{fmtINR(row.overdue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SUPPLIER BILLS */}
      {tab === 'bills' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {['all', 'pending_approval', 'approved', 'on_hold', 'disputed', 'partially_paid', 'paid', 'overdue', 'rejected'].map(st => (
              <button
                key={st}
                onClick={() => setBillStatusFilter(st)}
                className={`px-3 py-1 text-xs rounded-full border capitalize transition-colors ${
                  billStatusFilter === st
                    ? 'bg-[var(--accent)]/15 border-[var(--accent)] text-[var(--accent)] font-medium'
                    : 'bg-[var(--surface-2)] border-[var(--border)] text-[var(--text-3)] hover:text-[var(--text-1)]'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--text-3)] text-[11px] uppercase bg-[var(--surface-3)]/30">
                    <th className="text-left px-4 py-3 font-medium">Bill #</th>
                    <th className="text-left px-4 py-3 font-medium">Supplier</th>
                    <th className="text-left px-3 py-3 font-medium">Vendor Inv / SPO</th>
                    <th className="text-left px-3 py-3 font-medium">Due Date</th>
                    <th className="text-right px-3 py-3 font-medium">Total</th>
                    <th className="text-right px-3 py-3 font-medium">Balance</th>
                    <th className="text-left px-3 py-3 font-medium">3-Way Match</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredBills.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-[var(--text-3)]">
                        No supplier bills match the current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredBills.map(b => {
                      const overdue = isRecordOverdue(b.status, b.dueDate, b.outstandingAmount);
                      return (
                        <tr key={b.id} className="hover:bg-[var(--surface-3)]/30 transition-colors">
                          <td className="px-4 py-3 font-mono font-semibold">
                            <Link to={`/finance/bill/${b.id}`} className="text-[var(--accent)] hover:underline">
                              {b.billNumber}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-[var(--text-1)]">{b.supplierName}</td>
                          <td className="px-3 py-3 text-[var(--text-2)]">
                            <span className="font-mono">{b.supplierInvoiceNo}</span>
                            {b.spoNumber && <span className="text-[var(--text-3)] ml-1.5">({b.spoNumber})</span>}
                          </td>
                          <td className="px-3 py-3 text-[var(--text-2)]">{fmtDate(b.dueDate)}</td>
                          <td className="px-3 py-3 text-right tabular-nums text-[var(--text-1)]">{fmtINR(b.totalAmount)}</td>
                          <td className="px-3 py-3 text-right tabular-nums font-semibold text-[var(--text-1)]">{fmtINR(b.outstandingAmount)}</td>
                          <td className="px-3 py-3">
                            <StatusChip status={b.matchStatus} size="sm" />
                          </td>
                          <td className="px-4 py-3">
                            <StatusChip status={overdue && b.status !== 'overdue' ? 'overdue' : b.status} size="sm" />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SUPPLIER PAYMENTS */}
      {tab === 'supplier_payments' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {['all', 'allocated', 'partially_allocated', 'recorded', 'unallocated', 'reversed'].map(st => (
              <button
                key={st}
                onClick={() => setSpayStatusFilter(st)}
                className={`px-3 py-1 text-xs rounded-full border capitalize transition-colors ${
                  spayStatusFilter === st
                    ? 'bg-[var(--accent)]/15 border-[var(--accent)] text-[var(--accent)] font-medium'
                    : 'bg-[var(--surface-2)] border-[var(--border)] text-[var(--text-3)] hover:text-[var(--text-1)]'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--text-3)] text-[11px] uppercase bg-[var(--surface-3)]/30">
                    <th className="text-left px-4 py-3 font-medium">Payment #</th>
                    <th className="text-left px-4 py-3 font-medium">Supplier</th>
                    <th className="text-left px-3 py-3 font-medium">Date</th>
                    <th className="text-left px-3 py-3 font-medium">Method / Ref</th>
                    <th className="text-right px-3 py-3 font-medium">Paid</th>
                    <th className="text-right px-3 py-3 font-medium">Unallocated</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredSupplierPayments.map(p => (
                    <tr key={p.id} className="hover:bg-[var(--surface-3)]/30 transition-colors">
                      <td className="px-4 py-3 font-mono font-semibold">
                        <Link to={`/finance/supplier-payment/${p.id}`} className="text-[var(--accent)] hover:underline">
                          {p.paymentNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-[var(--text-1)]">{p.supplierName}</td>
                      <td className="px-3 py-3 text-[var(--text-2)]">{fmtDate(p.paymentDate)}</td>
                      <td className="px-3 py-3 text-[var(--text-2)]">
                        {p.paymentMethod.toUpperCase()} · <span className="font-mono text-[11px]">{p.transactionRef}</span>
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums font-medium text-[var(--text-1)]">{fmtINR(p.amount)}</td>
                      <td className="px-3 py-3 text-right tabular-nums text-[var(--warning)]">{fmtINR(p.unallocatedAmount)}</td>
                      <td className="px-4 py-3">
                        <StatusChip status={p.status} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: ACCOUNTS PAYABLE AGEING */}
      {tab === 'payables' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Current (Not Yet Due)', value: metrics.apBuckets.current, tone: 'text-[var(--success)]' },
              { label: '1 – 30 Days Past Due', value: metrics.apBuckets['1_30'], tone: 'text-amber-300' },
              { label: '31 – 60 Days Past Due', value: metrics.apBuckets['31_60'], tone: 'text-orange-400' },
              { label: '60+ Days Past Due', value: metrics.apBuckets['60_plus'], tone: 'text-[var(--danger)]' },
            ].map(b => (
              <div key={b.label} className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4">
                <p className="text-[11px] text-[var(--text-3)]">{b.label}</p>
                <p className={`text-lg font-bold tabular-nums mt-1 ${b.tone}`}>{fmtINR(b.value)}</p>
              </div>
            ))}
          </div>

          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[var(--border)]">
              <h2 className="text-sm font-semibold text-[var(--text-1)]">Supplier Exposure Breakdown</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--text-3)] text-[11px] uppercase bg-[var(--surface-3)]/30">
                    <th className="text-left px-4 py-2.5">Supplier</th>
                    <th className="text-right px-3 py-2.5">Bills</th>
                    <th className="text-right px-3 py-2.5">Total Billed</th>
                    <th className="text-right px-3 py-2.5">Paid</th>
                    <th className="text-right px-3 py-2.5">Open AP</th>
                    <th className="text-right px-3 py-2.5">Held / Disputed</th>
                    <th className="text-right px-4 py-2.5">Overdue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {supplierExposure.map(row => (
                    <tr key={row.partyId} className="hover:bg-[var(--surface-3)]/30">
                      <td className="px-4 py-3 font-medium">
                        <Link to={`/suppliers/${row.partyId}`} className="text-[var(--accent)] hover:underline">
                          {row.name}
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-[var(--text-2)]">{row.count}</td>
                      <td className="px-3 py-3 text-right tabular-nums text-[var(--text-2)]">{fmtINR(row.billed)}</td>
                      <td className="px-3 py-3 text-right tabular-nums text-[var(--success)]">{fmtINR(row.paid)}</td>
                      <td className="px-3 py-3 text-right tabular-nums font-semibold text-[var(--text-1)]">{fmtINR(row.open)}</td>
                      <td className="px-3 py-3 text-right tabular-nums text-amber-400">{fmtINR(row.held)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-[var(--danger)]">{fmtINR(row.overdue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: PARTY STATEMENTS & AUDIT HISTORY */}
      {tab === 'collections' && (
        <div className="space-y-6">
          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-sm font-semibold text-[var(--text-1)] flex items-center gap-2">
                  <Building2 size={15} className="text-[var(--accent)]" />
                  Party Statement Ledger
                </h2>
                <p className="text-xs text-[var(--text-3)]">
                  Chronological statement of invoices/bills and payments with running balance
                </p>
              </div>
              <select
                value={selectedParty?.id || ''}
                onChange={e => setStatementPartyId(e.target.value)}
                className="px-3 py-1.5 text-xs bg-[var(--surface-3)] border border-[var(--border)] rounded-lg text-[var(--text-1)] min-w-[240px]"
              >
                {allStatementParties.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.kind})
                  </option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--text-3)] text-[11px] uppercase bg-[var(--surface-3)]/20">
                    <th className="text-left px-3 py-2.5">Date</th>
                    <th className="text-left px-3 py-2.5">Document Type</th>
                    <th className="text-left px-3 py-2.5">Reference</th>
                    <th className="text-right px-3 py-2.5">Debit</th>
                    <th className="text-right px-3 py-2.5">Credit</th>
                    <th className="text-right px-3 py-2.5">Running Net</th>
                    <th className="text-left px-3 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {statementLedger.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-[var(--text-3)]">
                        No posted financial transactions for {selectedParty?.name}.
                      </td>
                    </tr>
                  ) : (
                    statementLedger.map(row => (
                      <tr key={row.id} className="hover:bg-[var(--surface-3)]/30">
                        <td className="px-3 py-2.5 text-[var(--text-2)]">{fmtDate(row.date)}</td>
                        <td className="px-3 py-2.5 text-[var(--text-1)]">{row.docType}</td>
                        <td className="px-3 py-2.5 font-mono">
                          <Link to={row.route} className="text-[var(--accent)] hover:underline">
                            {row.ref}
                          </Link>
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-[var(--text-1)]">
                          {row.debit > 0 ? fmtINR(row.debit) : '—'}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-[var(--success)]">
                          {row.credit > 0 ? fmtINR(row.credit) : '—'}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-[var(--text-1)]">
                          {fmtINR(row.runningBalance)}
                        </td>
                        <td className="px-3 py-2.5">
                          <StatusChip status={row.status} size="sm" />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[var(--text-1)]">Finance Audit History</h2>
              <Link to="/audit" className="text-xs text-[var(--accent)] hover:underline">
                Open Global Audit Trail →
              </Link>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {financeAuditEvents.map(ev => {
                const route = getAuditEntityRoute(ev.scope, ev.entityId);
                return (
                  <div key={ev.id} className="py-2.5 flex items-start justify-between gap-4 text-xs">
                    <div>
                      <span className="font-medium text-[var(--text-1)]">{getAuditActionLabel(ev.action)}</span>
                      {' · '}
                      <span className="text-[var(--text-3)]">{ev.scope}</span>{' '}
                      {route ? (
                        <Link to={route} className="font-mono text-[var(--accent)] hover:underline">
                          {ev.entityRef || ev.entityId}
                        </Link>
                      ) : (
                        <span className="font-mono text-[var(--text-2)]">{ev.entityRef || ev.entityId}</span>
                      )}
                      <p className="text-[11px] text-[var(--text-2)] mt-0.5">{ev.description || ev.reason || 'Recorded transaction'}</p>
                    </div>
                    <div className="text-right shrink-0 text-[11px] text-[var(--text-3)]">
                      <p>{ev.actor} · {formatRoleLabel(ev.role)}</p>
                      <p>{fmtDate(ev.timestamp)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
