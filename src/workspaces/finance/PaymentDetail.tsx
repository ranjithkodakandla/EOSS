import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';

const fmt = (d: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const fmtMoney = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export default function PaymentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { payments, paymentAllocations, invoices } = useStore();

  const payment = payments.find(p => p.id === id);
  if (!payment) return (
    <div className="p-8 text-center text-sm text-[var(--text-2)]">
      Payment not found. <Link to="/finance" className="text-[var(--brand)] underline">Back to Finance</Link>
    </div>
  );

  const allocations = paymentAllocations.filter(a => a.paymentId === payment.id);
  const methodLabel = payment.paymentMethod.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="flex-shrink-0 px-6 py-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/finance?tab=payments')} className="p-1.5 rounded-lg hover:bg-[var(--surface-2)]">
            <ArrowLeft size={18} className="text-[var(--text-2)]" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-[var(--brand)]">{payment.paymentNumber}</span>
              <StatusChip status={payment.status} size="sm" />
            </div>
            <h1 className="text-lg font-bold text-[var(--text)] mt-0.5">{payment.customerName}</h1>
            <p className="text-xs text-[var(--text-2)]">Received {fmt(payment.receiptDate)} · {methodLabel}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {[
            { label: 'Payment Amount', value: fmtMoney(payment.amount) },
            { label: 'Allocated', value: fmtMoney(payment.allocatedAmount) },
            { label: 'Unallocated', value: fmtMoney(payment.unallocatedAmount) },
            { label: 'Transaction Ref', value: payment.transactionRef ?? '—' },
          ].map((c, i) => (
            <div key={i} className="rounded-lg border p-3" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
              <div className="text-[11px] text-[var(--text-3)]">{c.label}</div>
              <div className="text-sm font-semibold font-mono text-[var(--text)] mt-0.5 truncate">{c.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-5">
        {/* Allocations */}
        <div>
          <h2 className="text-sm font-bold text-[var(--text)] mb-3">Invoice Allocations</h2>
          {allocations.length === 0 ? (
            <p className="text-sm text-[var(--text-3)]">No allocations recorded.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border)' }}>
              <table className="eoss-table">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Customer</th>
                    <th>Allocated Date</th>
                    <th>Allocated By</th>
                    <th>Amount</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {allocations.map(a => {
                    const inv = invoices.find(i => i.id === a.invoiceId);
                    return (
                      <tr key={a.id}>
                        <td>
                          <Link to={`/finance/invoice/${a.invoiceId}`} className="font-mono text-xs font-semibold text-[var(--brand)] hover:underline">
                            {a.invoiceNumber}
                          </Link>
                        </td>
                        <td className="text-sm text-[var(--text-2)]">{a.customerId ? payment.customerName : '—'}</td>
                        <td className="text-sm text-[var(--text-2)]">{fmt(a.allocatedDate)}</td>
                        <td className="text-sm text-[var(--text-2)]">{a.allocatedBy}</td>
                        <td className="font-mono text-sm font-semibold text-right">{fmtMoney(a.allocatedAmount)}</td>
                        <td className="text-xs text-[var(--text-2)]">{a.notes ?? '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} className="text-right text-xs font-bold text-[var(--text-2)] pr-2">Total Allocated</td>
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

        {/* Meta */}
        <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <h3 className="text-xs font-bold text-[var(--text-3)] uppercase tracking-wider mb-3">Payment Details</h3>
          <dl className="grid md:grid-cols-2 gap-x-6 gap-y-2">
            {[
              { label: 'Method', value: methodLabel },
              { label: 'Receiving Account', value: payment.receivingAccount ?? '—' },
              { label: 'Created By', value: payment.createdBy },
              { label: 'Currency', value: payment.currency },
            ].map((f, i) => (
              <div key={i}>
                <dt className="text-xs text-[var(--text-3)]">{f.label}</dt>
                <dd className="text-sm font-medium text-[var(--text)] mt-0.5">{f.value}</dd>
              </div>
            ))}
          </dl>
          {payment.notes && (
            <div className="mt-3 pt-3 border-t text-sm text-[var(--text-2)]" style={{ borderColor: 'var(--border)' }}>{payment.notes}</div>
          )}
        </div>
      </div>
    </div>
  );
}
