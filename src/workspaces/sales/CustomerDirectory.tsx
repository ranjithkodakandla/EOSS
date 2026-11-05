import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Building2, Phone, Mail, ChevronRight, Star, X } from 'lucide-react';
import { CUSTOMERS, useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';
import EmptyState from '../../components/feedback/EmptyState';

export default function CustomerDirectory() {
  const navigate = useNavigate();
  const { showToast } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showAdd, setShowAdd] = useState(false);

  const filtered = CUSTOMERS.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.legalName.toLowerCase().includes(q) || c.tradingName.toLowerCase().includes(q) || c.gstin.includes(q) || c.city.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-[var(--text)]">Customer Directory</h1>
          <p className="text-sm text-[var(--text-2)] mt-0.5">
            {CUSTOMERS.filter(c => c.status === 'active').length} active customers
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity"
          style={{ background: 'var(--brand)' }}
        >
          <Plus size={15} />
          Add Customer
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-2)]" />
          <input
            type="text"
            placeholder="Search by name, GSTIN or city…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-[var(--surface)] focus:outline-none focus:ring-2"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          />
        </div>
        {(['all', 'active', 'inactive'] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-colors cursor-pointer ${statusFilter === s ? 'text-white border-transparent' : 'border-transparent bg-transparent'}`}
            style={statusFilter === s ? { background: 'var(--brand)' } : { color: 'var(--text-2)' }}
          >
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState icon={<Building2 size={22} />} title="No customers found" body="Try adjusting your search or filters." />
      ) : (
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                {['Customer', 'GSTIN / State', 'Contact', 'Terms', 'Rating', 'Status', ''].map(h => (
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
                    <div className="text-xs text-[var(--text-2)]">{c.state} · {c.city}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-xs text-[var(--text-2)]">
                      <Phone size={11} /> {c.phone}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[var(--text-2)] mt-0.5">
                      <Mail size={11} /> {c.email}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--text-2)]">{c.paymentTerms}</td>
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
                  <td className="px-4 py-3 text-right">
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
          onSave={(name) => {
            showToast({ type: 'success', title: 'Customer added', body: `${name} has been registered.` });
            setShowAdd(false);
          }}
        />
      )}
    </div>
  );
}

function AddCustomerModal({ onClose, onSave }: { onClose: () => void; onSave: (name: string) => void }) {
  const [form, setForm] = useState({ legalName: '', tradingName: '', gstin: '', pan: '', city: '', state: '', phone: '', email: '', paymentTerms: 'Net 30', contactPerson: '' });
  const [err, setErr] = useState('');
  const save = () => {
    if (!form.legalName || !form.city) { setErr('Legal name and city are required'); return; }
    onSave(form.tradingName || form.legalName);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-[var(--text)]">Add Customer</h3>
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
          <button onClick={save} className="flex-1 py-2.5 bg-[var(--brand)] text-white rounded-xl text-sm font-medium">Save Customer</button>
        </div>
      </div>
    </div>
  );
}
