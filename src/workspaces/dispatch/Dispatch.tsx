import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, Search, X } from 'lucide-react';
import { useStore, CUSTOMERS } from '../../store';
import type { Dispatch } from '../../types';
import StatusChip from '../../components/layout/StatusChip';

let dspSeq = 100;

export default function DispatchWorkspace() {
  const { dispatches, currentUser, addDispatch } = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    customerId: '', customerName: '', carrier: '',
    vehicleNumber: '', lrNumber: '', dispatchDate: '', jobs: '',
  });

  const pendingDocs = dispatches.filter(d => d.status === 'pending_docs').length;
  const dispatched  = dispatches.filter(d => d.status === 'dispatched').length;
  const delivered   = dispatches.filter(d => d.status === 'delivered').length;

  const filtered = dispatches.filter(d =>
    !search ||
    d.dispatchNumber.toLowerCase().includes(search.toLowerCase()) ||
    d.customerName.toLowerCase().includes(search.toLowerCase())
  );

  function handleCreate() {
    const customer = CUSTOMERS.find(c => c.id === form.customerId);
    const newDispatch: Dispatch = {
      id: `dsp-new-${++dspSeq}`,
      dispatchNumber: `DSP-2024-${String(100 + dspSeq).slice(-3)}`,
      customerId: form.customerId,
      customerName: customer?.tradingName ?? form.customerName,
      dispatchDate: form.dispatchDate,
      carrier: form.carrier || undefined,
      vehicleNumber: form.vehicleNumber || undefined,
      lrNumber: form.lrNumber || undefined,
      status: 'pending_docs',
      lineCount: 0,
      totalQty: 0,
      hasPoD: false,
      jobs: form.jobs ? form.jobs.split(',').map(s => s.trim()).filter(Boolean) : [],
    };
    addDispatch(newDispatch);
    setShowModal(false);
    setForm({ customerId: '', customerName: '', carrier: '', vehicleNumber: '', lrNumber: '', dispatchDate: '', jobs: '' });
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex-shrink-0 flex items-center gap-3 px-5 py-3 border-b flex-wrap" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search dispatches…"
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border outline-none"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text)' }} />
        </div>
        <div className="flex-1" />
        {pendingDocs > 0 && <span className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: 'var(--warning-bg,#FFFBEB)', color: 'var(--warning,#D97706)' }}>{pendingDocs} pending docs</span>}
        {dispatched > 0 && <span className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: 'var(--info-bg,#EFF6FF)', color: 'var(--info,#2563EB)' }}>{dispatched} in transit</span>}
        {['owner', 'dispatch'].includes(currentUser.role) && (
          <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: 'var(--brand)' }}>
            <Plus size={13} /> New Dispatch
          </button>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm border-separate border-spacing-0" style={{ minWidth: 800 }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 5 }}>
            <tr style={{ background: 'var(--surface-muted,#F8F9FC)' }}>
              {['Dispatch #', 'Customer', 'Jobs', 'Carrier / Vehicle', 'Dispatch Date', 'Expected Delivery', 'Qty', 'Status', ''].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)', borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(d => (
              <tr key={d.id} className="cursor-pointer" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-muted,#F8F9FC)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}
                onClick={() => navigate(`/dispatch/${d.id}`)}>
                <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: 'var(--brand)' }}>{d.dispatchNumber}</td>
                <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text)' }}>{d.customerName}</td>
                <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-2)' }}>{(d.jobs ?? []).join(', ') || '—'}</td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{d.carrier ?? d.vehicleNumber ?? '—'}</td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{d.dispatchDate ? new Date(d.dispatchDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{d.expectedDelivery ? new Date(d.expectedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</td>
                <td className="px-4 py-3 text-xs text-center" style={{ color: 'var(--text-2)' }}>{d.totalQty ?? '—'}</td>
                <td className="px-4 py-3"><StatusChip status={d.status} size="sm" /></td>
                <td className="px-4 py-3"><ChevronRight size={14} style={{ color: 'var(--text-3)' }} /></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-10 text-center text-sm" style={{ color: 'var(--text-3)' }}>No dispatches found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-[var(--text)]">New Dispatch</h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--text-3)] hover:text-[var(--text)]"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[var(--text-3)] block mb-1">Customer *</label>
                <select
                  value={form.customerId}
                  onChange={e => {
                    const c = CUSTOMERS.find(c => c.id === e.target.value);
                    setForm(f => ({ ...f, customerId: e.target.value, customerName: c?.tradingName ?? '' }));
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--brand)]"
                >
                  <option value="">Select customer…</option>
                  {CUSTOMERS.map(c => <option key={c.id} value={c.id}>{c.tradingName}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--text-3)] block mb-1">Jobs (comma separated job numbers)</label>
                <input value={form.jobs} onChange={e => setForm(f => ({ ...f, jobs: e.target.value }))} placeholder="J-101, J-105" className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--brand)]" />
              </div>
              <div>
                <label className="text-xs text-[var(--text-3)] block mb-1">Carrier</label>
                <input value={form.carrier} onChange={e => setForm(f => ({ ...f, carrier: e.target.value }))} placeholder="DTDC / Blue Dart…" className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--brand)]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[var(--text-3)] block mb-1">Vehicle No.</label>
                  <input value={form.vehicleNumber} onChange={e => setForm(f => ({ ...f, vehicleNumber: e.target.value }))} placeholder="TS09XX0000" className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--brand)]" />
                </div>
                <div>
                  <label className="text-xs text-[var(--text-3)] block mb-1">LR Number</label>
                  <input value={form.lrNumber} onChange={e => setForm(f => ({ ...f, lrNumber: e.target.value }))} placeholder="LR-XXXX" className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--brand)]" />
                </div>
              </div>
              <div>
                <label className="text-xs text-[var(--text-3)] block mb-1">Dispatch Date *</label>
                <input type="date" value={form.dispatchDate} onChange={e => setForm(f => ({ ...f, dispatchDate: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--brand)]" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 border border-[var(--border)] text-[var(--text)] rounded-lg text-sm">Cancel</button>
              <button
                disabled={!form.customerId || !form.dispatchDate}
                onClick={handleCreate}
                className="flex-1 py-2 bg-[var(--brand)] text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                Create Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KpiTile({ label, value, accent = 'neutral' }: { label: string; value: number; accent?: string }) {
  const color = { error: 'var(--error)', success: 'var(--success)', info: 'var(--info)', warning: 'var(--warning)', neutral: 'var(--text)' }[accent] ?? 'var(--text)';
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
      <div className="text-xl font-bold" style={{ color }}>{value}</div>
      <div className="text-xs text-[var(--text-2)] mt-0.5">{label}</div>
    </div>
  );
}
