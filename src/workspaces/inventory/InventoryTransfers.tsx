import React from 'react';
import { ArrowLeft, CheckCircle, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';

const date = (value?: string) => value ? new Date(value).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

export default function InventoryTransfers() {
  const navigate = useNavigate();
  const { transfers, receiveStockTransfer, currentUser } = useStore();
  return <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-5">
    <div className="flex items-start justify-between gap-3">
      <div><button onClick={() => navigate('/inventory')} className="flex items-center gap-1.5 text-sm text-[var(--text-2)] mb-3"><ArrowLeft size={14} /> Inventory</button><h1 className="text-xl font-bold text-[var(--text)]">Inventory transfers</h1><p className="text-sm text-[var(--text-2)] mt-1">Dispatches remain in transit until the destination store receives them.</p></div>
      <button onClick={() => navigate('/inventory/transfer')} className="btn-primary text-xs">New transfer</button>
    </div>
    <div className="space-y-3">
      {transfers.length === 0 && <div className="rounded-xl border p-10 text-center text-sm text-[var(--text-3)]" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>No stock transfers recorded.</div>}
      {transfers.map(t => <div key={t.id} className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2"><span className="font-mono font-bold text-sm text-[var(--brand)]">{t.transferNumber}</span><span className="text-xs rounded-full px-2 py-0.5" style={{ background: t.status === 'in_transit' ? 'var(--warning-bg)' : 'var(--success-bg)', color: t.status === 'in_transit' ? 'var(--warning)' : 'var(--success)' }}>{t.status.replace('_', ' ')}</span></div><div className="font-semibold text-sm text-[var(--text)] mt-1">{t.materialName} · {t.quantity} {t.uom}</div><div className="text-xs text-[var(--text-2)] mt-1">{t.sourceLocationName} → {t.destinationLocationName} · {t.grade || 'Grade not specified'}</div></div>{t.status === 'in_transit' && <button onClick={() => receiveStockTransfer(t.id, currentUser.name)} className="btn-primary text-xs inline-flex items-center gap-1"><CheckCircle size={13} /> Receive at destination</button>}</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 pt-3 border-t text-xs text-[var(--text-2)]" style={{ borderColor: 'var(--border)' }}><span><Truck size={12} className="inline mr-1" />Dispatched {date(t.dispatchedAt)}</span><span>By {t.initiatedBy}</span><span>Received {date(t.receivedAt)}</span><span>{t.receivedBy ? `By ${t.receivedBy}` : t.notes || 'Awaiting receipt'}</span></div>
      </div>)}
    </div>
  </div>;
}
