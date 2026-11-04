import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Plus } from 'lucide-react';
import { useStore, SUPPLIERS } from '../../store';
import StatusChip from '../../components/layout/StatusChip';

export default function Suppliers() {
  const { currentUser } = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const filtered = SUPPLIERS.filter(s => !search || s.tradingName.toLowerCase().includes(search.toLowerCase()) || s.legalName.toLowerCase().includes(search.toLowerCase()) || s.city.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-[var(--text)]">Suppliers</h1>
          <p className="text-sm text-[var(--text-2)]">{SUPPLIERS.length} suppliers registered</p>
        </div>
        {['owner', 'buyer'].includes(currentUser.role) && (
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--brand)] text-white rounded-lg text-sm font-medium"><Plus size={16} /> Add Supplier</button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4"><div className="text-xl font-bold text-[var(--text)]">{SUPPLIERS.length}</div><div className="text-xs text-[var(--text-2)] mt-0.5">Total Suppliers</div></div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4"><div className="text-xl font-bold text-[var(--success)]">{SUPPLIERS.filter(s => s.status === 'active').length}</div><div className="text-xs text-[var(--text-2)] mt-0.5">Active</div></div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4"><div className="text-xl font-bold text-[var(--warning)]">{SUPPLIERS.filter(s => (s.rating ?? 0) >= 4).length}</div><div className="text-xs text-[var(--text-2)] mt-0.5">High Rated (≥4)</div></div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4"><div className="text-xl font-bold text-[var(--text)]">{[...new Set(SUPPLIERS.map(s => s.category))].length}</div><div className="text-xs text-[var(--text-2)] mt-0.5">Categories</div></div>
      </div>

      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search suppliers…" className="w-full pl-9 pr-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] placeholder:text-[var(--text-3)] focus:outline-none focus:border-[var(--brand)]" />
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="eoss-table">
            <thead><tr><th>Supplier</th><th>Category</th><th>Rating</th><th>Payment Terms</th><th>GSTIN</th><th>Status</th><th></th></tr></thead>
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
                  <td><ChevronRight size={14} className="text-[var(--text-3)]" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
