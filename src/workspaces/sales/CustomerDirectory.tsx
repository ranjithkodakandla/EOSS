import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Building2, Phone, Mail, ChevronRight, Star, X, Pencil } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';
import EmptyState from '../../components/feedback/EmptyState';
import WorkspaceNav from '../../components/workflow/WorkspaceNav';

export default function CustomerDirectory() {
  const navigate = useNavigate();
  const { customers } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.legalName.toLowerCase().includes(q) || c.tradingName.toLowerCase().includes(q) || c.gstin.includes(q) || c.city.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 px-6 py-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <h1 className="text-lg font-bold" style={{ color: 'var(--text)' }}>Sales · Customers</h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>Customer master data and related sales records</p>
      </div>
      <WorkspaceNav activeId="customers" items={[
        { id: 'pos', label: 'Customer POs', to: '/sales?tab=pos' },
        { id: 'rfqs', label: 'Customer RFQs', to: '/sales?tab=rfqs' },
        { id: 'customers', label: 'Customers', to: '/sales/customers' },
      ]} />
      <div className="flex-1 overflow-auto p-4 md:p-6 max-w-6xl w-full mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-[var(--text)]">Customer Directory</h1>
          <p className="text-sm text-[var(--text-2)] mt-0.5">
            {customers.filter(c => c.status === 'active').length} active customers
          </p>
        </div>
        <button
          onClick={() => navigate('/sales/customers/new')}
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
                  <td className="px-4 py-3 text-right flex items-center justify-end gap-1">
                    <button onClick={e => { e.stopPropagation(); navigate(`/sales/customers/${c.id}?edit=1`); }} className="p-1 rounded hover:bg-[var(--surface-2)]" title="Edit customer">
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

      </div>
    </div>
  );
}
