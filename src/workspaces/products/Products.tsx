import React, { useState } from 'react';
import { X, Pencil, Archive, Search } from 'lucide-react';
import { useStore } from '../../store';
import type { FinishedProduct } from '../../types';

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

export default function Products() {
  const { currentUser, showToast, finishedProducts } = useStore();
  const [search, setSearch] = useState('');
  const [editProduct, setEditProduct] = useState<FinishedProduct | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState(0);
  const [archivedIds, setArchivedIds] = useState<Set<string>>(new Set());

  const canManage = ['owner', 'sales', 'supervisor'].includes(currentUser.role);

  const filtered = finishedProducts.filter(p =>
    !archivedIds.has(p.id) &&
    (!search || p.name.toLowerCase().includes(search.toLowerCase()) || p.productCode.toLowerCase().includes(search.toLowerCase()))
  );

  const handleArchive = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setArchivedIds(prev => new Set([...prev, id]));
    showToast({ type: 'success', title: 'Product archived' });
  };

  const openEdit = (p: FinishedProduct) => {
    setEditProduct(p);
    setEditName(p.name);
    setEditPrice(p.unitPriceInr);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 flex items-center gap-3 px-5 py-3 border-b flex-wrap" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…"
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border outline-none"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text)' }} />
        </div>
        <div className="flex-1" />
        <span className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: 'var(--surface-2)', color: 'var(--text-2)' }}>
          {filtered.length} products
        </span>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm border-separate border-spacing-0" style={{ minWidth: 700 }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 5 }}>
            <tr style={{ background: 'var(--surface-2)' }}>
              {['Product Code', 'Name', 'Category', 'UoM', 'Unit Price (INR)', 'Drawing', 'Material', ''].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold" style={{ color: 'var(--text-3)', borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}>
                <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: 'var(--brand)' }}>{p.productCode}</td>
                <td className="px-4 py-3 font-medium text-sm" style={{ color: 'var(--text)' }}>{p.name}</td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{p.categoryName}</td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{p.primaryUom}</td>
                <td className="px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text)' }}>{p.unitPriceInr ? fmt(p.unitPriceInr) : '—'}</td>
                <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--text-2)' }}>{p.drawingNumber} Rev {p.drawingRevision}</td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{p.materialSpec}</td>
                <td className="px-4 py-3">
                  {canManage && (
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(p)} className="p-1 rounded hover:bg-[var(--surface-2)]" title="Edit"><Pencil size={12} style={{ color: 'var(--text-3)' }} /></button>
                      <button onClick={e => handleArchive(p.id, e)} className="p-1 rounded hover:bg-[var(--surface-2)]" title="Archive"><Archive size={12} style={{ color: 'var(--error,#DC2626)' }} /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-sm" style={{ color: 'var(--text-3)' }}>No products found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editProduct && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-[var(--text)]">Edit — {editProduct.productCode}</h2>
              <button onClick={() => setEditProduct(null)} className="text-[var(--text-3)]"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[var(--text-3)] block mb-1">Name</label>
                <input value={editName} onChange={e => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)]" />
              </div>
              <div>
                <label className="text-xs text-[var(--text-3)] block mb-1">Unit Price (₹)</label>
                <input type="number" value={editPrice} onChange={e => setEditPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)]" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setEditProduct(null)} className="flex-1 py-2 border border-[var(--border)] text-[var(--text)] rounded-lg text-sm">Cancel</button>
              <button onClick={() => { showToast({ type: 'success', title: 'Product updated' }); setEditProduct(null); }}
                className="flex-1 py-2 bg-[var(--brand)] text-white rounded-lg text-sm font-medium">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
