import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Plus, X, Pencil } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';
import type { Party } from '../../types';
import SortableHeader from '../../components/layout/SortableHeader';
import { sortRows } from '../../domain/tableSort';

type SupplierSortKey = 'supplier' | 'category' | 'rating' | 'terms' | 'gstin' | 'status';

export default function Suppliers() {
  const { currentUser, suppliers, showToast, updateSupplier, addSupplier } = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Party | null>(null);
  const [sortKey, setSortKey] = useState<SupplierSortKey>('supplier');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const filteredBase = suppliers.filter(s => !search || s.tradingName.toLowerCase().includes(search.toLowerCase()) || s.legalName.toLowerCase().includes(search.toLowerCase()) || (s.city ?? '').toLowerCase().includes(search.toLowerCase()));
  const filtered = sortRows(filteredBase, sortKey, sortDir, (s, key) => ({ supplier: s.tradingName, category: s.category, rating: s.rating, terms: s.paymentTerms, gstin: s.gstin, status: s.status }[key as SupplierSortKey]));
  const handleSort = (key: SupplierSortKey) => {
    if (sortKey === key) setSortDir(direction => direction === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-[var(--text)]">Suppliers</h1>
          <p className="text-sm text-[var(--text-2)]">{suppliers.length} suppliers registered</p>
        </div>
        {['owner', 'buyer'].includes(currentUser.role) && (
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-[var(--brand-fill)] text-white rounded-lg text-sm font-medium"><Plus size={16} /> Add Supplier</button>
        )}
      </div>

      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search suppliers…" className="w-full pl-9 pr-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] placeholder:text-[var(--text-3)] focus:outline-none focus:border-[var(--brand)]" />
      </div>

      <div className="md:hidden space-y-2 mb-3">
        {filtered.map(s => (
          <button key={s.id} type="button" onClick={() => navigate(`/suppliers/${s.id}`)}
            className="w-full text-left rounded-xl border p-3" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-[var(--text)]">{s.tradingName}</span>
              <StatusChip status={s.status} size="sm" />
            </div>
            <div className="text-xs text-[var(--text-2)] mt-1">{s.category} · {s.city} · {s.paymentTerms}</div>
          </button>
        ))}
      </div>
      <div className="hidden md:block bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="eoss-table">
            <thead><tr>
              {([['Supplier', 'supplier'], ['Category', 'category'], ['Rating', 'rating'], ['Payment Terms', 'terms'], ['GSTIN', 'gstin'], ['Status', 'status']] as [string, SupplierSortKey][]).map(([label, key]) => <SortableHeader key={label} label={label} active={sortKey === key} direction={sortDir} onSort={() => handleSort(key)} />)}
              <th />
            </tr></thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="cursor-pointer" onClick={() => navigate(`/suppliers/${s.id}`)}>
                  <td>
                    <div className="text-sm font-medium text-[var(--text)]">{s.tradingName}</div>
                    <div className="text-[11px] text-[var(--text-3)]">{s.city}, {s.state}</div>
                  </td>
                  <td className="text-sm text-[var(--text-2)]">{s.category}</td>
                  <td>
                    {s.rating != null ? (
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold text-[var(--text)]">{s.rating.toFixed(1)}</span>
                        <span className="text-xs text-[var(--text-3)]">/ 5</span>
                      </div>
                    ) : '—'}
                  </td>
                  <td className="text-sm text-[var(--text-2)]">{s.paymentTerms}</td>
                  <td className="font-mono text-xs text-[var(--text-2)]">{s.gstin ?? '—'}</td>
                  <td><StatusChip status={s.status} size="sm" /></td>
                  <td className="px-2">
                    <button onClick={e => { e.stopPropagation(); setEditSupplier(s); }} className="p-1.5 rounded hover:bg-[var(--surface-2)] transition-colors" title="Edit supplier">
                      <Pencil size={13} className="text-[var(--text-3)]" />
                    </button>
                  </td>
                  <td><ChevronRight size={14} className="text-[var(--text-3)]" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <AddSupplierModal
          onClose={() => setShowAdd(false)}
          onSave={(form) => {
            const supplier: Party = { id: `supp-${Date.now()}`, partyType: 'Supplier', legalName: form.legalName, tradingName: form.tradingName || form.legalName, panNumber: form.pan, gstin: form.gstin, state: form.state, paymentTerms: form.paymentTerms, currency: 'INR', status: 'active', contactPerson: form.contactPerson, phone: form.phone, email: form.email, city: form.city, since: new Date().getFullYear().toString(), category: form.category };
            addSupplier(supplier);
            showToast({ type: 'success', title: 'Supplier added', body: `${supplier.tradingName} has been registered.` });
            setShowAdd(false);
          }}
        />
      )}
      {editSupplier && (
        <AddSupplierModal
          initialValues={{ tradingName: editSupplier.tradingName, legalName: editSupplier.legalName, category: editSupplier.category ?? 'Raw Material', city: editSupplier.city ?? '', state: editSupplier.state ?? '', gstin: editSupplier.gstin ?? '', pan: editSupplier.panNumber ?? '', paymentTerms: editSupplier.paymentTerms, contactPerson: editSupplier.contactPerson, phone: editSupplier.phone, email: editSupplier.email }}
          editMode
          onClose={() => setEditSupplier(null)}
          onSave={(form) => {
            updateSupplier(editSupplier.id, { legalName: form.legalName, tradingName: form.tradingName || form.legalName, category: form.category, city: form.city, state: form.state, phone: form.phone, email: form.email, contactPerson: form.contactPerson, paymentTerms: form.paymentTerms });
            showToast({ type: 'success', title: 'Supplier updated', body: `${form.tradingName || form.legalName} has been updated.` });
            setEditSupplier(null);
          }}
        />
      )}
    </div>
  );
}

function AddSupplierModal({ onClose, onSave, initialValues, editMode }: { onClose: () => void; onSave: (form: Record<string, string>) => void; initialValues?: Record<string, string>; editMode?: boolean }) {
  const [form, setForm] = useState({ tradingName: '', legalName: '', category: 'Raw Material', city: '', state: '', gstin: '', pan: '', paymentTerms: 'Net 30', contactPerson: '', phone: '', email: '', ...initialValues });
  const [err, setErr] = useState('');
  const save = () => {
    if (!form.legalName || !form.city) { setErr('Legal name and city are required'); return; }
    onSave(form);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-[var(--text)]">{editMode ? 'Edit Supplier' : 'Add Supplier'}</h3>
          <button onClick={onClose}><X size={16} className="text-[var(--text-3)]" /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Legal Name *', key: 'legalName', placeholder: 'As per company registration' },
            { label: 'Trading Name', key: 'tradingName', placeholder: 'Short name' },
            { label: 'City *', key: 'city', placeholder: '' },
            { label: 'State', key: 'state', placeholder: '' },
            { label: 'GSTIN', key: 'gstin', placeholder: '' },
            { label: 'PAN', key: 'pan', placeholder: '' },
            { label: 'Contact Person', key: 'contactPerson', placeholder: '' },
            { label: 'Phone', key: 'phone', placeholder: '' },
            { label: 'Email', key: 'email', placeholder: '' },
          ].map(f => (
            <div key={f.key} className={f.key === 'legalName' || f.key === 'email' ? 'col-span-2' : ''}>
              <label className="block text-xs font-medium text-[var(--text-2)] mb-1">{f.label}</label>
              <input className="eoss-input w-full" value={(form as any)[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} placeholder={f.placeholder} />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Category</label>
            <select className="eoss-input w-full" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {['Raw Material', 'Consumables', 'Fasteners', 'Subcontractor', 'Services', 'Spares', 'Scrap'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Payment Terms</label>
            <select className="eoss-input w-full" value={form.paymentTerms} onChange={e => setForm(f => ({ ...f, paymentTerms: e.target.value }))}>
              {['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Advance'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        {err && <p className="text-xs text-[var(--danger)] mt-2">{err}</p>}
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[var(--border)] rounded-xl text-sm text-[var(--text-2)]">Cancel</button>
          <button onClick={save} className="flex-1 py-2.5 bg-[var(--brand-fill)] text-white rounded-xl text-sm font-medium">Save Supplier</button>
        </div>
      </div>
    </div>
  );
}
