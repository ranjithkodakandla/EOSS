import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Building2, Package, Receipt, CreditCard, ClipboardList } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';
import RecordHistoryPanel from '../../components/workflow/RecordHistoryPanel';

const fmtINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const fmtDate = (d?: string) => {
  if (!d) return '—';
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? d : dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function SupplierDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    suppliers, supplierPos, materials, grns, supplierBills, supplierPayments,
  } = useStore();

  const supplier = suppliers.find(s => s.id === id);
  const pos = useMemo(() => supplierPos.filter(p => p.supplierId === id), [supplierPos, id]);
  const supplierGrns = useMemo(() => grns.filter(g => g.supplierId === id), [grns, id]);
  const bills = useMemo(() => supplierBills.filter(b => b.supplierId === id), [supplierBills, id]);
  const payouts = useMemo(() => supplierPayments.filter(p => p.supplierId === id), [supplierPayments, id]);
  const suppliedItems = useMemo(
    () => materials.filter(m => m.preferredSupplierIds?.includes(id ?? '')),
    [materials, id],
  );

  if (!supplier) return <div className="p-6 text-[var(--text-2)]">Supplier not found</div>;

  const activeBills = bills.filter(b => b.status !== 'rejected' && b.status !== 'void');
  const totalBilled = activeBills.reduce((s, b) => s + b.totalAmount, 0);
  const totalPaid = activeBills.reduce((s, b) => s + b.paidAmount, 0);
  const openPayable = activeBills.reduce((s, b) => s + b.outstandingAmount, 0);
  const heldBillsCount = activeBills.filter(b => b.status === 'on_hold' || b.status === 'disputed').length;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/suppliers')} className="text-[var(--text-3)] hover:text-[var(--text)]">
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs text-[var(--text-3)]">{supplier.id}</span>
              <StatusChip status={supplier.status} />
            </div>
            <h1 className="text-lg font-bold text-[var(--text)]">{supplier.tradingName}</h1>
            {supplier.legalName !== supplier.tradingName && (
              <p className="text-xs text-[var(--text-3)]">{supplier.legalName}</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/finance/bill/new`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text)] border border-[var(--border)] rounded-lg"
          >
            <Plus size={13} /> Record Bill
          </Link>
          <Link
            to={`/finance/supplier-payment/new?supplierId=${supplier.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[var(--brand-fill)] text-white rounded-lg hover:opacity-90"
          >
            <CreditCard size={13} /> Pay Supplier
          </Link>
        </div>
      </div>

      {/* AP Exposure KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3.5">
          <p className="text-[11px] uppercase tracking-wider text-[var(--text-3)]">Supplier POs</p>
          <p className="text-lg font-bold text-[var(--text)] tabular-nums mt-1">{pos.length}</p>
          <p className="text-[11px] text-[var(--text-3)] mt-0.5">{supplierGrns.length} GRNs received</p>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3.5">
          <p className="text-[11px] uppercase tracking-wider text-[var(--text-3)]">Total Billed</p>
          <p className="text-lg font-bold text-[var(--text)] tabular-nums mt-1">{fmtINR(totalBilled)}</p>
          <p className="text-[11px] text-[var(--text-3)] mt-0.5">{activeBills.length} active bills</p>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3.5">
          <p className="text-[11px] uppercase tracking-wider text-[var(--text-3)]">Paid to Date</p>
          <p className="text-lg font-bold text-[var(--success,#16A34A)] tabular-nums mt-1">{fmtINR(totalPaid)}</p>
          <p className="text-[11px] text-[var(--text-3)] mt-0.5">{payouts.length} payment records</p>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3.5">
          <p className="text-[11px] uppercase tracking-wider text-[var(--text-3)]">Open Payable (AP)</p>
          <p className="text-lg font-bold text-amber-500 tabular-nums mt-1">{fmtINR(openPayable)}</p>
          <p className="text-[11px] text-[var(--text-3)] mt-0.5">{heldBillsCount} on hold / disputed</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {/* Left column: Master Info */}
        <div className="space-y-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <h3 className="font-semibold text-sm text-[var(--text)] mb-3 flex items-center gap-2">
              <Building2 size={14} className="text-[var(--brand)]" /> Supplier Details
            </h3>
            <dl className="space-y-2.5 text-sm">
              <Field label="Category" value={supplier.category ?? '—'} />
              <Field label="City / State" value={`${supplier.city}, ${supplier.state}`} />
              {supplier.gstin && <Field label="GSTIN" value={supplier.gstin} mono />}
              {supplier.panNumber && <Field label="PAN" value={supplier.panNumber} mono />}
              <Field label="Payment Terms" value={supplier.paymentTerms} />
              {supplier.rating != null && <Field label="Rating" value={`${supplier.rating.toFixed(1)} / 5.0`} />}
              {supplier.since && <Field label="Partner Since" value={supplier.since} />}
            </dl>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Primary Contact</h3>
            <dl className="space-y-2.5 text-sm">
              {supplier.contactPerson && <Field label="Contact Person" value={supplier.contactPerson} />}
              {supplier.phone && <Field label="Phone" value={supplier.phone} mono />}
              {supplier.email && <Field label="Email" value={supplier.email} />}
            </dl>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <h3 className="font-semibold text-sm text-[var(--text)] mb-3 flex items-center gap-2">
              <Package size={14} className="text-[var(--brand)]" /> Supplied Items ({suppliedItems.length})
            </h3>
            {suppliedItems.length === 0 ? (
              <p className="text-xs text-[var(--text-3)]">No supplier-item associations recorded.</p>
            ) : (
              <div className="space-y-2">
                {suppliedItems.map(item => (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/inventory/${item.id}`)}
                    className="flex items-center justify-between rounded-lg border p-2.5 cursor-pointer hover:bg-[var(--surface-2)]"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <div>
                      <div className="text-xs font-medium text-[var(--text)]">{item.name}</div>
                      <div className="text-[11px] text-[var(--text-3)]">{item.itemCode} · {item.categoryName}</div>
                    </div>
                    <span className="text-xs text-[var(--text-2)]">{item.primaryUom}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 2 columns: POs, GRNs, Bills, Payments, History */}
        <div className="md:col-span-2 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <h3 className="font-semibold text-sm text-[var(--text)] mb-3 flex items-center gap-2">
                <ClipboardList size={14} className="text-[var(--brand)]" /> Supplier POs ({pos.length})
              </h3>
              {pos.length === 0 ? (
                <p className="text-xs text-[var(--text-3)]">No POs placed with this supplier.</p>
              ) : (
                <div className="space-y-2">
                  {pos.map(p => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between cursor-pointer hover:bg-[var(--surface-2)] -mx-2 px-2 py-1.5 rounded-lg"
                      onClick={() => navigate(`/procurement/spo/${p.id}`)}
                    >
                      <div>
                        <div className="font-mono text-xs font-semibold text-[var(--brand)]">{p.spoNumber || p.poNumber}</div>
                        <div className="text-[11px] text-[var(--text-3)]">{fmtDate(p.raisedDate)}</div>
                      </div>
                      <div className="text-right">
                        <StatusChip status={p.status} size="sm" />
                        <div className="text-xs text-[var(--text-2)] mt-0.5 tabular-nums">{fmtINR(p.totalValue)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Goods Receipts (GRN · {supplierGrns.length})</h3>
              {supplierGrns.length === 0 ? (
                <p className="text-xs text-[var(--text-3)]">No GRNs recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {supplierGrns.map(g => (
                    <div
                      key={g.id}
                      onClick={() => navigate(`/procurement/grn/${g.id}`)}
                      className="flex items-center justify-between cursor-pointer hover:bg-[var(--surface-2)] -mx-2 px-2 py-1.5 rounded-lg"
                    >
                      <div>
                        <div className="font-mono text-xs font-semibold text-[var(--brand)]">{g.grnNumber}</div>
                        <div className="text-[11px] text-[var(--text-3)]">{fmtDate(g.receivedDate)}</div>
                      </div>
                      <StatusChip status={g.status} size="sm" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-[var(--text)] flex items-center gap-2">
                <Receipt size={14} className="text-[var(--brand)]" /> Supplier Bills ({bills.length})
              </h3>
              <Link to="/finance?tab=bills" className="text-xs text-[var(--brand)] hover:underline">
                View in Finance →
              </Link>
            </div>
            {bills.length === 0 ? (
              <p className="text-xs text-[var(--text-3)]">No vendor bills recorded for this supplier.</p>
            ) : (
              <div className="divide-y divide-[var(--border)] text-xs">
                {bills.map(b => (
                  <div
                    key={b.id}
                    onClick={() => navigate(`/finance/bill/${b.id}`)}
                    className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-[var(--surface-2)] -mx-2 px-2 rounded-lg"
                  >
                    <div>
                      <span className="font-mono font-semibold text-[var(--brand)]">{b.billNumber}</span>
                      <span className="text-[var(--text-3)] ml-2">Vendor Inv {b.supplierInvoiceNo} · Due {fmtDate(b.dueDate)}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <StatusChip status={b.matchStatus} size="sm" />
                      <StatusChip status={b.status} size="sm" />
                      <span className="font-semibold tabular-nums text-[var(--text)]">{fmtINR(b.outstandingAmount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <h3 className="font-semibold text-sm text-[var(--text)] flex items-center gap-2 mb-3">
              <CreditCard size={14} className="text-[var(--brand)]" /> Supplier Payments ({payouts.length})
            </h3>
            {payouts.length === 0 ? (
              <p className="text-xs text-[var(--text-3)]">No payouts made to this supplier yet.</p>
            ) : (
              <div className="divide-y divide-[var(--border)] text-xs">
                {payouts.map(p => (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/finance/supplier-payment/${p.id}`)}
                    className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-[var(--surface-2)] -mx-2 px-2 rounded-lg"
                  >
                    <div>
                      <span className="font-mono font-semibold text-[var(--brand)]">{p.paymentNumber}</span>
                      <span className="text-[var(--text-3)] ml-2">{fmtDate(p.paymentDate)} · {p.transactionRef}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <StatusChip status={p.status} size="sm" />
                      <span className="font-semibold tabular-nums text-[var(--text)]">{fmtINR(p.amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <RecordHistoryPanel
            entityId={supplier.id}
            entityRef={supplier.tradingName}
            relatedIds={[...pos.map(p => p.id), ...bills.map(b => b.id), ...payouts.map(p => p.id)]}
            title="Supplier Activity & Audit Trail"
            subtitle="Master record updates, POs, goods receipts, vendor bills, and payouts"
          />
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-[var(--text-3)]">{label}</dt>
      <dd className={`text-sm text-[var(--text)] mt-0.5 ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  );
}
