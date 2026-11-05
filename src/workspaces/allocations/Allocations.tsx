import React, { useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';

const SITES = [
  { id: 'all', label: 'All Sites' },
  { id: 'site-hyd', label: 'HYD Plant 1' },
  { id: 'site-hyd2', label: 'HYD Plant 2' },
  { id: 'site-wh', label: 'HYD Warehouse' },
  { id: 'site-pun', label: 'Pune Plant' },
  { id: 'site-che', label: 'Chennai Fab' },
];

export default function Allocations() {
  const { siteAllocations, jobs } = useStore();
  const [siteFilter, setSiteFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = siteAllocations.filter(a =>
    (siteFilter === 'all' || a.siteId === siteFilter) &&
    (!search || (a.jobNumber ?? '').toLowerCase().includes(search.toLowerCase()) || a.siteName.toLowerCase().includes(search.toLowerCase()) || a.productName.toLowerCase().includes(search.toLowerCase()))
  );

  const kpis = SITES.slice(1).map(s => ({
    ...s,
    count: siteAllocations.filter(a => a.siteId === s.id).length,
    activeJobs: jobs.filter(j => j.siteId === s.id && j.status === 'active').length,
  }));

  return (
    <div className="flex flex-col h-full">
      {/* KPI Strip */}
      <div className="flex-shrink-0 px-5 py-3 border-b overflow-x-auto" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="flex gap-3 min-w-max">
          {kpis.map(k => (
            <button key={k.id} onClick={() => setSiteFilter(siteFilter === k.id ? 'all' : k.id)}
              className="px-4 py-2 rounded-xl border text-left transition-all min-w-[120px]"
              style={{ borderColor: siteFilter === k.id ? 'var(--brand)' : 'var(--border)', background: siteFilter === k.id ? 'var(--brand)' : 'var(--surface-2)', color: siteFilter === k.id ? 'white' : 'var(--text)' }}>
              <div className="text-xs font-bold whitespace-nowrap">{k.label}</div>
              <div className="text-xs opacity-80 mt-0.5">{k.count} alloc · {k.activeJobs} jobs</div>
            </button>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex-shrink-0 flex items-center gap-3 px-5 py-2 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <Search size={14} style={{ color: 'var(--text-3)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by job, site, product…"
          className="flex-1 py-1.5 text-sm outline-none bg-transparent" style={{ color: 'var(--text)' }} />
        <span className="text-xs" style={{ color: 'var(--text-3)' }}>{filtered.length} records</span>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm border-separate border-spacing-0" style={{ minWidth: 750 }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 5 }}>
            <tr style={{ background: 'var(--surface-2)' }}>
              {['PO #', 'Job #', 'Product', 'Site', 'Qty', 'UoM', 'Date', 'By', 'Status'].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold" style={{ color: 'var(--text-3)', borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id} style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}>
                <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: 'var(--brand)' }}>{a.poNumber}</td>
                <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-2)' }}>{a.jobNumber ?? '—'}</td>
                <td className="px-4 py-3 text-xs font-medium" style={{ color: 'var(--text)' }}>{a.productName}</td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>
                  <div className="flex items-center gap-1"><MapPin size={10} />{a.siteName}</div>
                </td>
                <td className="px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text)' }}>{a.allocatedQty}</td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{a.uom}</td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{new Date(a.allocatedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{a.allocatedBy}</td>
                <td className="px-4 py-3"><StatusChip status={a.status} size="sm" /></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-10 text-center text-sm" style={{ color: 'var(--text-3)' }}>No allocations found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
