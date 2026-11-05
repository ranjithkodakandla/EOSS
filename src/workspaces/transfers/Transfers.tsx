import React, { useState } from 'react';
import { Plus, ArrowRight, X, Package } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';

type TransferStatus = 'pending' | 'in_transit' | 'received';

interface Transfer {
  id: string;
  transferNumber: string;
  fromSite: string;
  toSite: string;
  items: string;
  qty: number;
  uom: string;
  date: string;
  status: TransferStatus;
}

const SEED_TRANSFERS: Transfer[] = [
  { id: 'ist-001', transferNumber: 'IST-0001', fromSite: 'HYD Plant 1', toSite: 'HYD Plant 2', items: 'EN8 Steel Bar', qty: 200, uom: 'kg', date: '2024-10-20', status: 'received' },
  { id: 'ist-002', transferNumber: 'IST-0002', fromSite: 'HYD Warehouse', toSite: 'Pune Plant', items: 'SS316 Plate', qty: 150, uom: 'kg', date: '2024-10-22', status: 'received' },
  { id: 'ist-003', transferNumber: 'IST-0003', fromSite: 'HYD Plant 1', toSite: 'Chennai Fab', items: 'Bearing Housing FG-001', qty: 12, uom: 'pcs', date: '2024-10-25', status: 'received' },
];

const SITE_OPTIONS = ['HYD Plant 1', 'HYD Plant 2', 'HYD Warehouse', 'Pune Plant', 'Chennai Fab'];

export default function Transfers() {
  const { currentUser, showToast } = useStore();
  const [transfers, setTransfers] = useState<Transfer[]>(SEED_TRANSFERS);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ fromSite: '', toSite: '', items: '', qty: '', uom: 'kg' });

  const canCreate = ['owner', 'storekeeper', 'supervisor'].includes(currentUser.role);

  const handleCreate = () => {
    if (!form.fromSite || !form.toSite || !form.items) {
      showToast({ type: 'error', title: 'Fill required fields', body: 'From site, to site, and items are required.' });
      return;
    }
    if (form.fromSite === form.toSite) {
      showToast({ type: 'error', title: 'Invalid transfer', body: 'From and to sites must be different.' });
      return;
    }
    const newT: Transfer = {
      id: `ist-${Date.now()}`,
      transferNumber: `IST-${String(transfers.length + 1).padStart(4, '0')}`,
      fromSite: form.fromSite,
      toSite: form.toSite,
      items: form.items,
      qty: Number(form.qty) || 0,
      uom: form.uom,
      date: new Date().toISOString().slice(0, 10),
      status: 'received',
    };
    setTransfers(prev => [newT, ...prev]);
    setShowModal(false);
    setForm({ fromSite: '', toSite: '', items: '', qty: '', uom: 'kg' });
    showToast({ type: 'success', title: 'Transfer created', body: `${newT.transferNumber} recorded.` });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 flex items-center gap-3 px-5 py-3 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <Package size={16} style={{ color: 'var(--brand)' }} />
        <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Inter-Site Transfers</span>
        <div className="flex-1" />
        <span className="text-xs px-3 py-1.5 rounded-lg" style={{ background: 'var(--surface-2)', color: 'var(--text-2)' }}>
          {transfers.length} transfers
        </span>
        {canCreate && (
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
            style={{ background: 'var(--brand)' }}>
            <Plus size={13} /> New Transfer
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm border-separate border-spacing-0" style={{ minWidth: 650 }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 5 }}>
            <tr style={{ background: 'var(--surface-2)' }}>
              {['Transfer #', 'From', '', 'To', 'Items', 'Qty', 'Date', 'Status'].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold" style={{ color: 'var(--text-3)', borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transfers.map(t => (
              <tr key={t.id} style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}>
                <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: 'var(--brand)' }}>{t.transferNumber}</td>
                <td className="px-4 py-3 text-xs font-medium" style={{ color: 'var(--text-2)' }}>{t.fromSite}</td>
                <td className="px-2 py-3"><ArrowRight size={12} style={{ color: 'var(--text-3)' }} /></td>
                <td className="px-4 py-3 text-xs font-medium" style={{ color: 'var(--text-2)' }}>{t.toSite}</td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--text)' }}>{t.items}</td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{t.qty} {t.uom}</td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>
                  {new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                </td>
                <td className="px-4 py-3"><StatusChip status={t.status} size="sm" /></td>
              </tr>
            ))}
            {transfers.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-sm" style={{ color: 'var(--text-3)' }}>No transfers found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-[var(--text)]">New Inter-Site Transfer</h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--text-3)]"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[var(--text-3)] block mb-1">From Site *</label>
                <select value={form.fromSite} onChange={e => setForm(f => ({ ...f, fromSite: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)]">
                  <option value="">Select…</option>
                  {SITE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--text-3)] block mb-1">To Site *</label>
                <select value={form.toSite} onChange={e => setForm(f => ({ ...f, toSite: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)]">
                  <option value="">Select…</option>
                  {SITE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--text-3)] block mb-1">Items / Description *</label>
                <input value={form.items} onChange={e => setForm(f => ({ ...f, items: e.target.value }))}
                  placeholder="EN8 Steel Bar"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[var(--text-3)] block mb-1">Quantity</label>
                  <input type="number" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)]" />
                </div>
                <div>
                  <label className="text-xs text-[var(--text-3)] block mb-1">UoM</label>
                  <input value={form.uom} onChange={e => setForm(f => ({ ...f, uom: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)]" />
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-2 border border-[var(--border)] text-[var(--text)] rounded-lg text-sm">Cancel</button>
              <button onClick={handleCreate}
                className="flex-1 py-2 bg-[var(--brand)] text-white rounded-lg text-sm font-medium">Create Transfer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
