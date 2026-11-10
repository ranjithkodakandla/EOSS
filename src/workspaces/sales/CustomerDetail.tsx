import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Edit2, Phone, Mail, Star, Upload } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';

type Tab = 'overview' | 'orders' | 'rfqs' | 'contacts' | 'documents';

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customers, customerPos, rfqs, documents, customerInvoices, addDocument, currentUser, showToast } = useStore();
  const [tab, setTab] = useState<Tab>('overview');

  const customer = customers.find(c => c.id === id);
  if (!customer) return (
    <div className="p-8 text-center text-sm" style={{ color: 'var(--text-2)' }}>
      Customer not found.{' '}
      <button onClick={() => navigate('/sales?tab=customers')} className="underline" style={{ color: 'var(--brand)' }}>Back to directory</button>
    </div>
  );

  const orders = customerPos.filter(po => po.customerId === id);
  const customerRfqs = rfqs.filter(r => r.customerId === id);
  const customerDocuments = documents.filter(d => d.linkedEntities.some(e => e.type === 'Customer' && (e.ref === id || e.ref === customer?.tradingName)));
  const customerInvoiceRecords = customerInvoices.filter(invoice => invoice.customerId === id);
  const orderedValue = orders.reduce((sum, po) => sum + po.totalValue, 0);
  const invoicedValue = customerInvoiceRecords.reduce((sum, invoice) => sum + invoice.amount, 0);
  const paidValue = customerInvoiceRecords.reduce((sum, invoice) => sum + invoice.amountPaid, 0);
  const outstandingValue = Math.max(0, invoicedValue - paidValue);
  const overdueValue = customerInvoiceRecords.filter(invoice => invoice.status === 'overdue').reduce((sum, invoice) => sum + Math.max(0, invoice.amount - invoice.amountPaid), 0);
  const availableCredit = customer.creditLimit == null ? undefined : Math.max(0, customer.creditLimit - outstandingValue);
  const creditUtilization = customer.creditLimit && customer.creditLimit > 0 ? Math.min(100, (outstandingValue / customer.creditLimit) * 100) : undefined;
  const TABS: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'orders', label: `Customer POs (${orders.length})` },
    { key: 'rfqs', label: `RFQs (${customerRfqs.length})` },
    { key: 'contacts', label: 'Contacts' },
    { key: 'documents', label: 'Documents' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="flex items-center gap-1.5 text-xs mb-3" style={{ color: 'var(--text-3)' }}>
          <button onClick={() => navigate('/sales')} className="hover:underline" style={{ color: 'var(--brand)' }}>Sales</button>
          <ChevronRight size={12} />
          <button onClick={() => navigate('/sales?tab=customers')} className="hover:underline">Customer Directory</button>
          <ChevronRight size={12} />
          <span style={{ color: 'var(--text)' }}>{customer.tradingName}</span>
        </div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <button onClick={() => navigate('/sales?tab=customers')} className="mt-0.5 p-1.5 rounded-lg hover:opacity-70" style={{ color: 'var(--text-3)' }}>
              <ArrowLeft size={16} />
            </button>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>{customer.tradingName}</h1>
                <StatusChip status={customer.status as 'active' | 'archived'} />
              </div>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-2)' }}>{customer.legalName} · {customer.city}, {customer.state}</p>
            </div>
          </div>
          <button onClick={() => navigate(`/sales/customers/${customer.id}/edit`)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium hover:opacity-80"
            style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}>
            <Edit2 size={13} /> Edit
          </button>
        </div>
        <div className="mt-4 flex items-center gap-6 flex-wrap">
          <SBadge label="Customer Since" value={customer.since} />
          <SBadge label="Payment Terms" value={customer.paymentTerms} />
          <SBadge label="Currency" value={customer.currency} />
          {customer.creditLimit != null && <SBadge label="Credit Limit" value={`₹${customer.creditLimit.toLocaleString('en-IN')}`} emphasis />}
          {customer.rating != null && <SBadge label="Rating" value={`${customer.rating.toFixed(1)} / 5`} />}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 flex items-center border-b px-6" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="relative px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap"
            style={{ color: tab === t.key ? 'var(--brand)' : 'var(--text-2)' }}>
            {t.label}
            {tab === t.key && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full" style={{ background: 'var(--brand-fill)' }} />}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {tab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 max-w-5xl">
            <div className="lg:col-span-2 space-y-4">
              <Card title="Identity">
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <DL label="PAN" value={customer.panNumber} mono />
                  <DL label="GSTIN" value={customer.gstin} mono />
                  <DL label="State" value={customer.state} />
                  <DL label="City" value={customer.city} />
                </dl>
              </Card>
              <Card title="Contact">
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <DL label="Contact Person" value={customer.contactPerson} />
                  <DL label="Email" value={customer.email} />
                  <DL label="Phone" value={customer.phone} />
                </dl>
              </Card>
            </div>
            <div className="space-y-4">
              <Card title="Commercial">
                <div className="space-y-3">
                  <DL label="Payment Terms" value={customer.paymentTerms} />
                  <DL label="Currency" value={customer.currency} />
                  {customer.creditLimit != null && <DL label="Credit Limit" value={`₹${customer.creditLimit.toLocaleString('en-IN')}`} />}
                  {customer.rating != null && (
                    <div>
                      <dt className="text-xs" style={{ color: 'var(--text-3)' }}>Rating</dt>
                      <dd className="text-sm mt-0.5 font-semibold flex items-center gap-1" style={{ color: 'var(--text)' }}>
                        <Star size={12} className="fill-current text-amber-500" />
                        {customer.rating.toFixed(1)} / 5
                      </dd>
                    </div>
                  )}
                </div>
              </Card>
              <Card title="Account Exposure">
                <div className="grid grid-cols-2 gap-3">
                  <DL label="Customer POs" value={`${orders.length} · ₹${(orderedValue / 100000).toFixed(2)}L`} />
                  <DL label="Invoiced" value={`₹${(invoicedValue / 100000).toFixed(2)}L`} />
                  <DL label="Paid" value={`₹${(paidValue / 100000).toFixed(2)}L`} />
                  <DL label="Outstanding" value={`₹${(outstandingValue / 100000).toFixed(2)}L`} />
                  <DL label="Overdue" value={`₹${(overdueValue / 100000).toFixed(2)}L`} />
                  <DL label="Available Credit" value={availableCredit == null ? 'Not configured' : `₹${(availableCredit / 100000).toFixed(2)}L`} />
                </div>
                <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center justify-between text-xs"><span style={{ color: 'var(--text-3)' }}>Credit utilisation</span><span className="font-semibold" style={{ color: 'var(--text-2)' }}>{creditUtilization == null ? 'Not configured' : `${creditUtilization.toFixed(0)}%`}</span></div>
                  <div className="h-1.5 rounded-full mt-1.5" style={{ background: 'var(--surface-2)' }}><div className="h-full rounded-full" style={{ width: `${creditUtilization ?? 0}%`, background: overdueValue > 0 ? 'var(--error,#DC2626)' : 'var(--brand-fill)' }} /></div>
                  <div className="text-xs mt-2" style={{ color: 'var(--text-3)' }}>{customerInvoiceRecords.length === 0 ? 'Not Enough Payment History' : overdueValue > 0 ? 'Payment history shows overdue receivables' : 'Payments currently on time'}</div>
                </div>
              </Card>
              <Card title="Quick Links">
                <div className="space-y-2">
                  <button onClick={() => setTab('orders')} className="w-full text-left px-3 py-2 rounded-lg border text-xs font-medium hover:opacity-80"
                    style={{ borderColor: 'var(--border)', background: 'var(--surface-2)', color: 'var(--text-2)' }}>
                    {orders.length} Purchase Order{orders.length !== 1 ? 's' : ''}
                  </button>
                  <button onClick={() => setTab('rfqs')} className="w-full text-left px-3 py-2 rounded-lg border text-xs font-medium hover:opacity-80"
                    style={{ borderColor: 'var(--border)', background: 'var(--surface-2)', color: 'var(--text-2)' }}>
                    {customerRfqs.length} Customer RFQ{customerRfqs.length !== 1 ? 's' : ''}
                  </button>
                  <button onClick={() => setTab('documents')} className="w-full text-left px-3 py-2 rounded-lg border text-xs font-medium hover:opacity-80"
                    style={{ borderColor: 'var(--border)', background: 'var(--surface-2)', color: 'var(--text-2)' }}>
                    {customerDocuments.length} Customer Document{customerDocuments.length !== 1 ? 's' : ''} →
                  </button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div className="max-w-5xl">
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              <table className="w-full text-sm">
                <thead style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                  <tr>
                    {['PO Number', 'Accepted', 'Value', 'Lines', 'Payment', 'Status'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold font-medium" style={{ color: 'var(--text-3)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-10 text-center text-sm" style={{ color: 'var(--text-3)' }}>No orders on record.</td></tr>
                  ) : orders.map(po => (
                    <tr key={po.id} className="cursor-pointer" style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}
                      onClick={() => navigate(`/sales/po/${po.id}`)}>
                      <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: 'var(--brand)' }}>{po.poNumber}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{new Date(po.acceptedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td className="px-4 py-3 font-mono text-sm font-semibold" style={{ color: 'var(--text)' }}>₹{(po.totalValue / 100000).toFixed(2)}L</td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{po.lineCount}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{po.paymentTerms}</td>
                      <td className="px-4 py-3"><StatusChip status={po.status} size="sm" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'rfqs' && (
          <div className="max-w-5xl">
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              <table className="w-full text-sm">
                <thead style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                  <tr>
                    {['RFQ Number', 'Received', 'Required By', 'Lines', 'Status'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold font-medium" style={{ color: 'var(--text-3)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {customerRfqs.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-10 text-center text-sm" style={{ color: 'var(--text-3)' }}>No RFQs on record.</td></tr>
                  ) : customerRfqs.map(rfq => (
                    <tr key={rfq.id} className="cursor-pointer" style={{ borderBottom: '1px solid var(--border)' }} onClick={() => navigate(`/sales/rfq/${rfq.id}?from=${encodeURIComponent(`/sales?tab=customers&customer=${customer.id}`)}`)}>
                      <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: 'var(--brand)' }}>{rfq.rfqNumber}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{new Date(rfq.receivedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{new Date(rfq.requiredBy).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{rfq.lineCount}</td>
                      <td className="px-4 py-3"><StatusChip status={rfq.status} size="sm" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'contacts' && (
          <div className="max-w-2xl">
            <Card title="Primary Contact">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0" style={{ background: 'var(--brand-fill)' }}>
                  {customer.contactPerson.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{customer.contactPerson}</div>
                  <div className="text-xs mt-0.5 flex items-center gap-3" style={{ color: 'var(--text-3)' }}>
                    <span className="flex items-center gap-1"><Mail size={11} />{customer.email}</span>
                    <span className="flex items-center gap-1"><Phone size={11} />{customer.phone}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {tab === 'documents' && (
          <div className="max-w-2xl">
            <Card title="Documents">
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer mb-4" style={{ background: 'var(--brand-fill)' }}><Upload size={14} /> Upload Customer Document<input type="file" className="hidden" onChange={e => { const file = e.target.files?.[0]; if (!file) return; addDocument({ id: `doc-customer-${Date.now()}`, title: file.name, docType: 'Customer Document', category: 'Customer Documents', uploadedBy: currentUser.name, uploadedAt: new Date().toISOString().slice(0, 10), version: 1, fileSize: `${Math.max(1, Math.round(file.size / 1024))} KB`, linkedEntities: [{ type: 'Customer', ref: customer.id }, { type: 'Customer', ref: customer.tradingName }] }); showToast({ type: 'success', title: 'Customer document uploaded', body: `${file.name} is associated with ${customer.tradingName}.` }); e.target.value = ''; }} /></label>
              {customerDocuments.length === 0 ? <p className="text-sm text-center py-6" style={{ color: 'var(--text-3)' }}>No customer documents attached.</p> : <div className="space-y-2">{customerDocuments.map(d => <div key={d.id} className="rounded-lg border p-3" style={{ borderColor: 'var(--border)' }}><div className="flex items-start justify-between gap-3"><div><div className="text-sm font-semibold text-[var(--text)]">{d.title}</div><div className="text-xs mt-1 text-[var(--text-2)]">{d.docType} · {d.fileSize} · Uploaded {d.uploadedAt} by {d.uploadedBy}</div><div className="text-[11px] mt-1 text-[var(--text-3)]">Status: {d.status ?? 'Active'} · Customer-scoped document</div></div><div className="flex items-center gap-2"><button type="button" onClick={() => showToast({ type: 'info', title: 'Customer document', body: `${d.title} is available in the ${customer.tradingName} document context.` })} className="text-xs font-semibold" style={{ color: 'var(--brand)' }}>View</button><button type="button" onClick={() => showToast({ type: 'info', title: 'Customer document', body: `Download requested for ${d.title}.` })} className="text-xs font-semibold" style={{ color: 'var(--text-2)' }}>Download</button></div></div></div>)}</div>}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function SBadge({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-medium" style={{ color: 'var(--text-3)' }}>{label}</span>
      <span className="text-sm font-semibold" style={{ color: emphasis ? 'var(--brand)' : 'var(--text)' }}>{value}</span>
    </div>
  );
}
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <div className="px-4 py-3 border-b text-sm font-semibold" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)', color: 'var(--text)' }}>{title}</div>
      <div className="p-4">{children}</div>
    </div>
  );
}
function DL({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs" style={{ color: 'var(--text-3)' }}>{label}</dt>
      <dd className={`text-sm mt-0.5 font-medium${mono ? ' font-mono' : ''}`} style={{ color: 'var(--text)' }}>{value}</dd>
    </div>
  );
}
