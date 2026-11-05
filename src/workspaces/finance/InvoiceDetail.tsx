import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, FileText, CreditCard, ExternalLink } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';

const fmt = (d?: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const fmtMoney = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { invoices, invoiceLines, payments, paymentAllocations, customerPos } = useStore();

  const invoice = invoices.find(i => i.id === id);
  if (!invoice) return (
    <div className="p-8 text-center text-sm text-[var(--text-2)]">
      Invoice not found. <Link to="/finance" className="text-[var(--brand)] underline">Back to Finance</Link>
    </div>
  );

  const lines = invoiceLines.filter(l => l.invoiceId === invoice.id);
  const allocations = paymentAllocations.filter(a => a.invoiceId === invoice.id);
  const linkedPayments = allocations.map(a => payments.find(p => p.id === a.paymentId)).filter(Boolean);
  const po = customerPos.find(p => p.id === invoice.poId);

  const taxPct = lines.length > 0 ? lines[0].taxPct : 18;

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="flex-shrink-0 px-6 py-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/finance?tab=receivables')} className="p-1.5 rounded-lg hover:bg-[var(--surface-2)]">
              <ArrowLeft size={18} className="text-[var(--text-2)]" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-[var(--brand)]">{invoice.invoiceNumber}</span>
                <StatusChip status={invoice.status} size="sm" />
              </div>
              <h1 className="text-lg font-bold text-[var(--text)] mt-0.5">{invoice.customerName}</h1>
              <p className="text-xs text-[var(--text-2)]">
                Invoice date: {fmt(invoice.invoiceDate)} · Due: {fmt(invoice.dueDate)}
              </p>
            </div>
          </div>
          {invoice.outstandingAmount > 0 && (
            <button
              onClick={() => navigate(`/finance/payment/new?invoiceId=${invoice.id}`)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ background: 'var(--brand)' }}
            >
              <CreditCard size={15} /> Record Payment
            </button>
          )}
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {[
            { label: 'Invoice Amount', value: fmtMoney(invoice.totalAmount), highlight: false },
            { label: 'Paid', value: fmtMoney(invoice.paidAmount), highlight: false },
            { label: 'Outstanding', value: fmtMoney(invoice.outstandingAmount), highlight: invoice.outstandingAmount > 0 },
            { label: 'PO Reference', value: invoice.poNumber },
          ].map((c, i) => (
            <div key={i} className={`rounded-lg border p-3 ${c.highlight ? 'border-orange-200 bg-orange-50' : ''}`}
              style={c.highlight ? {} : { borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
              <div className="text-[11px] text-[var(--text-3)]">{c.label}</div>
              <div className={`text-sm font-semibold mt-0.5 font-mono ${c.highlight ? 'text-orange-700' : 'text-[var(--text)]'}`}>{c.value}</div>
            </div>
          ))}
        </div>

        {po && (
          <div className="mt-3 flex items-center gap-2 text-xs bg-[var(--surface-2)] rounded-lg px-3 py-2 border" style={{ borderColor: 'var(--border)' }}>
            <FileText size={12} className="text-[var(--text-3)]" />
            <span>PO:</span>
            <Link to={`/sales/po/${po.id}`} className="font-mono font-semibold text-[var(--brand)] hover:underline">{po.poNumber}</Link>
            <span className="text-[var(--text-3)]">·</span>
            <span>{fmtMoney(po.totalValue)}</span>
            <span className="text-[var(--text-3)]">·</span>
            <StatusChip status={po.status} size="sm" />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-5">
        {/* Invoice lines */}
        <div>
          <h2 className="text-sm font-bold text-[var(--text)] mb-3">Invoice Lines</h2>
          {lines.length === 0 ? (
            <p className="text-sm text-[var(--text-3)]">No line detail available.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border)' }}>
              <table className="eoss-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Drawing No.</th>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>UOM</th>
                    <th>Unit Price</th>
                    <th>Tax %</th>
                    <th>Tax Amt</th>
                    <th>Line Total</th>
                    <th>Dispatch</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l, i) => (
                    <tr key={l.id}>
                      <td className="font-mono text-xs text-[var(--text-3)]">{i + 1}</td>
                      <td className="font-mono text-xs font-semibold text-[var(--brand)]">{l.drawingNumber}</td>
                      <td className="text-sm text-[var(--text)]">{l.productName}</td>
                      <td className="font-mono text-sm text-right">{l.quantity}</td>
                      <td className="text-xs text-[var(--text-2)]">{l.uom}</td>
                      <td className="font-mono text-sm text-right">{fmtMoney(l.unitPrice)}</td>
                      <td className="font-mono text-xs text-right">{l.taxPct}%</td>
                      <td className="font-mono text-sm text-right">{fmtMoney(l.taxAmount)}</td>
                      <td className="font-mono text-sm text-right font-semibold">{fmtMoney(l.lineTotal)}</td>
                      <td className="font-mono text-xs text-[var(--text-2)]">{l.dispatchNumber ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={7} className="text-right text-xs font-bold text-[var(--text-2)] pr-2">Subtotal (excl. tax)</td>
                    <td className="font-mono text-sm text-right">{fmtMoney(invoice.subtotal)}</td>
                    <td colSpan={2} />
                  </tr>
                  <tr>
                    <td colSpan={7} className="text-right text-xs font-bold text-[var(--text-2)] pr-2">Tax ({taxPct}%)</td>
                    <td className="font-mono text-sm text-right">{fmtMoney(invoice.taxAmount)}</td>
                    <td colSpan={2} />
                  </tr>
                  <tr>
                    <td colSpan={7} className="text-right text-sm font-bold text-[var(--text)] pr-2">Total</td>
                    <td className="font-mono text-base font-bold text-[var(--text)] text-right">{fmtMoney(invoice.totalAmount)}</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Payment history */}
        <div>
          <h2 className="text-sm font-bold text-[var(--text)] mb-3">Payment History</h2>
          {allocations.length === 0 ? (
            <p className="text-sm text-[var(--text-3)]">No payments recorded yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border)' }}>
              <table className="eoss-table">
                <thead>
                  <tr>
                    <th>Payment Ref</th>
                    <th>Date</th>
                    <th>Method</th>
                    <th>Transaction Ref</th>
                    <th>Allocated Amount</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {allocations.map((a, i) => {
                    const pay = linkedPayments.find(p => p?.id === a.paymentId);
                    return (
                      <tr key={a.id}>
                        <td>
                          <Link to={`/finance/payment/${a.paymentId}`} className="font-mono text-xs font-semibold text-[var(--brand)] hover:underline">
                            {a.paymentNumber}
                          </Link>
                        </td>
                        <td className="text-sm text-[var(--text-2)]">{fmt(a.allocatedDate)}</td>
                        <td className="text-xs text-[var(--text-2)]">{pay?.paymentMethod?.replace('_', ' ') ?? '—'}</td>
                        <td className="font-mono text-xs text-[var(--text-3)]">{pay?.transactionRef ?? '—'}</td>
                        <td className="font-mono text-sm font-semibold text-right">{fmtMoney(a.allocatedAmount)}</td>
                        <td className="text-xs text-[var(--text-2)]">{a.notes ?? '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} className="text-right text-xs font-bold text-[var(--text-2)] pr-2">Total Paid</td>
                    <td className="font-mono text-sm font-bold text-right text-green-600">
                      {fmtMoney(allocations.reduce((s, a) => s + a.allocatedAmount, 0))}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {invoice.notes && (
          <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <div className="text-xs font-bold text-[var(--text-3)] uppercase tracking-wider mb-2">Notes</div>
            <p className="text-sm text-[var(--text-2)]">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
