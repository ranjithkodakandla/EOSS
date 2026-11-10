import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building2, Phone, Mail, ChevronRight, Star, X, Pencil } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip, { getStatusLabel } from '../../components/layout/StatusChip';
import EmptyState from '../../components/feedback/EmptyState';
import type { Party } from '../../types';

export default function CustomerDirectory() {
  const navigate = useNavigate();
  const { customers, customerPos, rfqs, showToast, updateCustomer, addCustomer } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Party | null>(null);

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.legalName.toLowerCase().includes(q) || c.tradingName.toLowerCase().includes(q) || c.gstin.includes(q) || c.city.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-5">
      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center border-b pb-4" style={{ borderColor: 'var(--border)' }}>
        <div className="eoss-search-wrap flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-2)]" />
          <input
            type="text"
            placeholder="Search customer name, GSTIN or city"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="eoss-search-input"
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)} className="eoss-input min-h-[36px]" aria-label="Customer status">
          <option value="all">All customer statuses</option>
          <option value="active">{getStatusLabel('active')}</option>
          <option value="inactive">{getStatusLabel('inactive')}</option>
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState icon={<Building2 size={22} />} title="No customers found" body="Try adjusting your search or filters." />
      ) : (
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        >
          <table className="eoss-table">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                {['Customer', 'GSTIN / State', 'Contact', 'Terms', 'Customer POs', 'RFQs', 'Rating', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-[var(--text-2)] font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr
                  key={c.id}
                  className="hover:bg-[var(--surface-2)] cursor-pointer transition-colors"
                  style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}
                  onClick={() => navigate(`/sales/customers/${c.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="font-semibold text-[var(--text)]">{c.tradingName}</div>
                    <div className="text-xs text-[var(--text-2)]">{c.legalName}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs font-mono text-[var(--text)]">{c.gstin}</div>
                    <div className="text-xs text-[var(--text-2)] whitespace-nowrap">{c.state} · {c.city}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-xs text-[var(--text-2)]">
                      <Phone size={11} /> {c.phone}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[var(--text-2)] mt-0.5 truncate max-w-[15rem]">
                      <Mail size={11} /> {c.email}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--text-2)]">{c.paymentTerms}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); navigate(`/sales?tab=pos&customer=${encodeURIComponent(c.id)}`); }}
                      className="text-xs font-semibold text-[var(--brand)] hover:underline"
                    >
                      {customerPos.filter(po => po.customerId === c.id).length} PO{customerPos.filter(po => po.customerId === c.id).length !== 1 ? 's' : ''}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); navigate(`/sales?tab=rfqs&customer=${encodeURIComponent(c.id)}`); }}
                      className="text-xs font-semibold text-[var(--brand)] hover:underline"
                    >
                      {rfqs.filter(rfq => rfq.customerId === c.id).length} RFQ{rfqs.filter(rfq => rfq.customerId === c.id).length !== 1 ? 's' : ''}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    {c.rating != null && (
                      <div className="flex items-center gap-1 text-xs">
                        <Star size={11} className="text-amber-400 fill-amber-400" />
                        <span className="font-semibold text-[var(--text)]">{c.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusChip status={c.status as 'active' | 'archived'} />
                  </td>
                  <td className="px-4 py-3 text-right flex items-center justify-end gap-1">
                    <button onClick={e => { e.stopPropagation(); navigate(`/sales/customers/${c.id}/edit`); }} className="p-1 rounded hover:bg-[var(--surface-2)]" title="Edit customer">
                      <Pencil size={13} className="text-[var(--text-3)]" />
                    </button>
                    <ChevronRight size={15} className="text-[var(--text-2)]" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && (
        <AddCustomerModal
          onClose={() => setShowAdd(false)}
          onSave={(form) => {
            const customer: Party = { id: `cust-${Date.now()}`, partyType: 'Customer', legalName: form.legalName, tradingName: form.tradingName || form.legalName, panNumber: form.pan, gstin: form.gstin, state: form.state, paymentTerms: form.paymentTerms, currency: 'INR', status: 'active', contactPerson: form.contactPerson, phone: form.phone, email: form.email, city: form.city, since: new Date().getFullYear().toString() };
            addCustomer(customer);
            showToast({ type: 'success', title: 'Customer added', body: `${customer.tradingName} has been registered.` });
            setShowAdd(false);
          }}
        />
      )}
      {editCustomer && (
        <AddCustomerModal
          editMode
          initialValues={{ legalName: editCustomer.legalName, tradingName: editCustomer.tradingName ?? '', gstin: editCustomer.gstin, pan: editCustomer.panNumber, city: editCustomer.city, state: editCustomer.state, phone: editCustomer.phone, email: editCustomer.email, paymentTerms: editCustomer.paymentTerms, contactPerson: editCustomer.contactPerson }}
          onClose={() => setEditCustomer(null)}
          onSave={(form) => {
            updateCustomer(editCustomer.id, { legalName: form.legalName, tradingName: form.tradingName || form.legalName, city: form.city, state: form.state, phone: form.phone, email: form.email, contactPerson: form.contactPerson, paymentTerms: form.paymentTerms });
            showToast({ type: 'success', title: 'Customer updated', body: `${form.tradingName || form.legalName} has been updated.` });
            setEditCustomer(null);
          }}
        />
      )}
    </div>
  );
}

function AddCustomerModal({ onClose, onSave, initialValues, editMode }: { onClose: () => void; onSave: (form: Record<string, string>) => void; initialValues?: Record<string, string>; editMode?: boolean }) {
  const [form, setForm] = useState({ legalName: '', tradingName: '', gstin: '', pan: '', city: '', state: '', phone: '', email: '', paymentTerms: 'Net 30', contactPerson: '', ...initialValues });
  const [err, setErr] = useState('');
  const save = () => {
    if (!form.legalName || !form.city) { setErr('Legal name and city are required'); return; }
    onSave(form);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-[var(--text)]">{editMode ? 'Edit Customer' : 'Add Customer'}</h3>
          <button onClick={onClose}><X size={16} className="text-[var(--text-3)]" /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Legal Name *', key: 'legalName', placeholder: 'As per company registration', span: true },
            { label: 'Trading Name', key: 'tradingName', placeholder: 'Short name', span: false },
            { label: 'City *', key: 'city', placeholder: '', span: false },
            { label: 'State', key: 'state', placeholder: '', span: false },
            { label: 'GSTIN', key: 'gstin', placeholder: '', span: false },
            { label: 'PAN', key: 'pan', placeholder: '', span: false },
            { label: 'Contact Person', key: 'contactPerson', placeholder: '', span: false },
            { label: 'Phone', key: 'phone', placeholder: '', span: false },
            { label: 'Email', key: 'email', placeholder: '', span: true },
          ].map(f => (
            <div key={f.key} className={f.span ? 'col-span-2' : ''}>
              <label className="block text-xs font-medium text-[var(--text-2)] mb-1">{f.label}</label>
              <input className="eoss-input w-full" value={(form as any)[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} placeholder={f.placeholder} />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Payment Terms</label>
            <select className="eoss-input w-full" value={form.paymentTerms} onChange={e => setForm(f => ({ ...f, paymentTerms: e.target.value }))}>
              {['Advance', 'Net 15', 'Net 30', 'Net 45', 'Net 60'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        {err && <p className="text-xs text-[var(--danger)] mt-2">{err}</p>}
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[var(--border)] rounded-xl text-sm text-[var(--text-2)]">Cancel</button>
          <button onClick={save} className="flex-1 py-2.5 bg-[var(--brand-fill)] text-white rounded-xl text-sm font-medium">Save Customer</button>
        </div>
      </div>
    </div>
  );
}
