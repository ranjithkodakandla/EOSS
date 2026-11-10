import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Edit2, Building2, Phone, Mail, MapPin, FileText, Star, X } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';

type Tab = 'overview' | 'orders' | 'contacts' | 'documents';

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customers, customerPos, rfqs, documents, updateCustomer, showToast } = useStore();
  const [tab, setTab] = useState<Tab>('overview');
  const [showEdit, setShowEdit] = useState(false);

  const customer = customers.find(c => c.id === id);
  if (!customer) return (
    <div className="p-8 text-center text-sm" style={{ color: 'var(--text-2)' }}>
      Customer not found.{' '}
      <button onClick={() => navigate('/sales/customers')} className="underline" style={{ color: 'var(--brand)' }}>Back to directory</button>
    </div>
  );

  const orders = customerPos.filter(po => po.customerId === id);
  const customerRfqs = rfqs.filter(r => r.customerId === id);
  const customerDocuments = documents.filter(d => d.linkedEntities.some(e => e.type === 'Customer' && (e.ref === id || e.ref === customer?.tradingName)));
  const TABS: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'orders', label: `Orders (${orders.length})` },
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
          <button onClick={() => navigate('/sales/customers')} className="hover:underline">Customer Directory</button>
          <ChevronRight size={12} />
          <span style={{ color: 'var(--text)' }}>{customer.tradingName}</span>
        </div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <button onClick={() => navigate('/sales/customers')} className="mt-0.5 p-1.5 rounded-lg hover:opacity-70" style={{ color: 'var(--text-3)' }}>
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
          <button onClick={() => setShowEdit(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium hover:opacity-80"
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
              <Card title="Quick Links">
                <div className="space-y-2">
                  <button onClick={() => setTab('orders')} className="w-full text-left px-3 py-2 rounded-lg border text-xs font-medium hover:opacity-80"
                    style={{ borderColor: 'var(--border)', background: 'var(--surface-2)', color: 'var(--text-2)' }}>
                    {orders.length} Purchase Order{orders.length !== 1 ? 's' : ''}
                  </button>
                  <button onClick={() => navigate(`/sales?tab=rfqs&customer=${id}`)} className="w-full text-left px-3 py-2 rounded-lg border text-xs font-medium hover:opacity-80"
                    style={{ borderColor: 'var(--border)', background: 'var(--surface-2)', color: 'var(--text-2)' }}>
                    {customerRfqs.length} Customer RFQ{customerRfqs.length !== 1 ? 's' : ''}
                  </button>
                  <button onClick={() => navigate('/documents')} className="w-full text-left px-3 py-2 rounded-lg border text-xs font-medium hover:opacity-80"
                    style={{ borderColor: 'var(--border)', background: 'var(--surface-2)', color: 'var(--text-2)' }}>
                    Document Vault →
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
              {customerDocuments.length === 0 ? <p className="text-sm text-center py-6" style={{ color: 'var(--text-3)' }}>No customer-linked documents. Documents are managed in the Document Vault.</p> : <div className="space-y-2 mb-4">{customerDocuments.map(d => <button key={d.id} type="button" onClick={() => navigate(`/documents?search=${encodeURIComponent(d.title)}`)} className="w-full text-left rounded-lg border p-3" style={{ borderColor: 'var(--border)' }}><div className="text-sm font-semibold text-[var(--text)]">{d.title}</div><div className="text-xs text-[var(--text-2)]">{d.docType} · Uploaded {d.uploadedAt}</div></button>)}</div>}
              <div className="text-center">
                <button onClick={() => navigate('/documents')} className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: 'var(--brand-fill)' }}>
                  Open Document Vault
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
      {showEdit && <EditCustomerModal customer={customer} onClose={() => setShowEdit(false)} onSave={(partial) => { updateCustomer(customer.id, partial); showToast({ type: 'success', title: 'Customer updated' }); setShowEdit(false); }} />}
    </div>
  );
}

function EditCustomerModal({ customer, onClose, onSave }: { customer: any; onClose: () => void; onSave: (partial: Record<string, string>) => void }) {
  const [form, setForm] = useState({ contactPerson: customer.contactPerson, phone: customer.phone, email: customer.email, city: customer.city, state: customer.state, paymentTerms: customer.paymentTerms });
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><div className="w-full max-w-md rounded-2xl border p-6 shadow-2xl" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}><div className="flex items-center justify-between mb-4"><h2 className="font-bold text-[var(--text)]">Edit customer details</h2><button type="button" onClick={onClose}><X size={16} /></button></div><div className="space-y-3">{(['contactPerson', 'phone', 'email', 'city', 'state'] as const).map(key => <label key={key} className="block text-xs text-[var(--text-2)] capitalize">{key.replace(/([A-Z])/g, ' $1')}<input className="eoss-input w-full mt-1" value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} /></label>)}<label className="block text-xs text-[var(--text-2)]">Payment terms<select className="eoss-input w-full mt-1" value={form.paymentTerms} onChange={e => setForm({ ...form, paymentTerms: e.target.value })}>{['Advance', 'Net 15', 'Net 30', 'Net 45', 'Net 60'].map(t => <option key={t}>{t}</option>)}</select></label></div><div className="flex gap-2 mt-5"><button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--border)' }}>Cancel</button><button type="button" onClick={() => onSave(form)} className="flex-1 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: 'var(--brand-fill)' }}>Save changes</button></div></div></div>;
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
