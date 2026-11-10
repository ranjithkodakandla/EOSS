import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useStore } from '../../store';
import StockWorkspaceNav from '../../components/layout/StockWorkspaceNav';
import SortableHeader from '../../components/layout/SortableHeader';
import { sortRows } from '../../domain/tableSort';

type SortKey = 'itemCode' | 'name' | 'categoryName' | 'standardGrade' | 'primaryUom' | 'active';

export default function Products() {
  const navigate = useNavigate();
  const { materials } = useStore();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('itemCode');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const rows = useMemo(() => {
    const q = query.toLowerCase();
    return sortRows(materials.filter(m => {
      const matchesQuery = !q || [m.itemCode, m.name, m.categoryName, m.standardGrade ?? ''].some(v => v.toLowerCase().includes(q));
      const matchesActive = active === 'all' || (active === 'active' ? m.active !== false : m.active === false);
      return matchesQuery && matchesActive;
    }), sortKey, sortDir, (row, key) => row[key as SortKey]);
  }, [materials, query, active, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <StockWorkspaceNav />
      <div className="flex-shrink-0 flex items-center gap-3 px-5 py-3 border-b flex-wrap" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div><h1 className="text-lg font-bold text-[var(--text)]">Item Master</h1><p className="text-xs text-[var(--text-2)]">The canonical catalogue of materials and grades. Physical stock belongs in Stock on Hand.</p></div>
        <div className="flex-1" />
        <div className="relative w-64"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search code, item, grade…" className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border outline-none" style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text)' }} /></div>
        <select value={active} onChange={e => setActive(e.target.value as typeof active)} className="eoss-input text-xs py-1.5"><option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select>
      </div>
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[280px_1fr]">
        <div className="border-b lg:border-b-0 lg:border-r overflow-auto" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          {rows.map(item => <button key={item.id} type="button" onClick={() => navigate(`/inventory/item/${item.id}`)} className="w-full text-left px-4 py-3 border-b hover:bg-[var(--surface-2)]" style={{ borderColor: 'var(--border)' }}><div className="font-mono text-xs font-bold text-[var(--brand)]">{item.itemCode}</div><div className="text-sm font-semibold text-[var(--text)] mt-1">{item.name}</div><div className="text-xs text-[var(--text-2)] mt-0.5">{item.categoryName} · {item.standardGrade ?? 'Grade not specified'}</div></button>)}
          {rows.length === 0 && <p className="p-4 text-sm text-[var(--text-3)]">No item master records match this filter.</p>}
        </div>
        <div className="overflow-auto p-4 md:p-5">
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <table className="eoss-table"><thead><tr>
              {([['itemCode', 'Item code'], ['name', 'Item name'], ['categoryName', 'Category'], ['standardGrade', 'Grade / specification'], ['primaryUom', 'UOM'], ['active', 'Status']] as [SortKey, string][]).map(([key, label]) => <SortableHeader key={key} label={label} active={sortKey === key} direction={sortDir} onSort={() => handleSort(key)} />)}
            </tr></thead><tbody>
              {rows.map(item => <tr key={item.id} className="cursor-pointer" onClick={() => navigate(`/inventory/item/${item.id}`)}><td className="font-mono text-xs font-bold text-[var(--brand)]">{item.itemCode}</td><td className="font-semibold">{item.name}</td><td className="text-xs">{item.categoryName}</td><td className="text-xs">{item.standardGrade ?? '—'}</td><td className="text-xs">{item.primaryUom}</td><td className="text-xs">{item.active === false ? 'Inactive' : 'Active'}</td></tr>)}
              {rows.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-sm text-[var(--text-3)]">No records.</td></tr>}
            </tbody></table>
          </div>
          <div className="mt-4 rounded-xl border p-4 text-sm" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}><h2 className="font-bold text-[var(--text)]">Item Master responsibility</h2><p className="text-xs text-[var(--text-2)] mt-1">Item identity, code, category, grade, specifications, UOM and lifecycle only. Use Stock on Hand for site/store, lot and quantity details; use Site Need for demand and shortages.</p></div>
        </div>
      </div>
    </div>
  );
}
