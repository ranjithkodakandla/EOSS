import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, Search, X } from 'lucide-react';
import { useStore } from '../../store';
import { CUSTOMERS } from '../../store';
import StatusChip from '../../components/layout/StatusChip';

export default function Dispatch() {
  const { dispatches, currentUser, showToast } = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ customerName: '', carrier: '', vehicleNumber: '', lrNumber: '', dispatchDate: '', jobs: '' });

  const readyToDispatch = dispatches.filter(d => d.status === 'ready').length;
  const inTransit = dispatches.filter(d => d.status === 'in_transit').length;

  const filtered = dispatches.filter(d =>
    !search ||
    d.dispatchNumber.toLowerCase().includes(search.toLowerCase()) ||
    d.customerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-[var(--text)]">Dispatch</h1>
          <div className="flex items-center gap-3 mt-0.5">
            <p className="text-sm text-[var(--text-2)]">{dispatches.length} shipments</p>
            {readyToDispatch > 0 && <span className="text-xs text-[var(--warning)] font-semibold">{readyToDispatch} ready</span>}
            {inTransit > 0 && <span className="text-xs text-[var(--info)] font-semibold">{inTransit} in transit</span>}
          </div>
        </div>
        {['owner', 'dispatch'].includes(currentUser.role) && (
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[var(--brand)] text-white rounded-lg text-sm font-medium"><Plus size={16} /> New Dispatch</button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <KpiTile label="Total" value={dispatches.length} />
        <KpiTile label="Ready" value={readyToDispatch} accent={readyToDispatch > 0 ? 'warning' : 'neutral'} />
        <KpiTile label="In Transit" value={inTransit} accent={inTransit > 0 ? 'info' : 'neutral'} />
        <KpiTile label="Delivered" value={dispatches.filter(d => d.status === 'delivered').length} accent="success" />
      </div>

      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search dispatches…" className="w-full pl-9 pr-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] placeholder:text-[var(--text-3)] focus:outline-none focus:border-[var(--brand)]" />
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="eoss-table">
            <thead><tr><th>Dispatch #</th><th>Customer</th><th>Jobs</th><th>Carrier / Vehicle</th><th>Dispatch Date</th><th>Expected Delivery</th><th>Qty</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id} className="cursor-pointer" onClick={() => navigate(`/dispatch/${d.id}`)}>
                  <td><span className="font-mono text-xs font-semibold text-[var(--brand)]">{d.dispatchNumber}</span></td>
                  <td className="text-sm text-[var(--text)]">{d.customerName}</td>
                  <td><span className="font-mono text-xs text-[var(--text-2)]">{(d.jobs ?? []).join(', ') || '—'}</span></td>
                  <td className="text-sm text-[var(--text-2)]">{d.carrier ?? d.vehicleNumber ?? '—'}</td>
                  <td className="text-sm text-[var(--text-2)]">{d.dispatchDate ? new Date(d.dispatchDate).toLocaleDateString('en-IN') : '—'}</td>
                  <td className="text-sm text-[var(--text-2)]">{d.expectedDelivery ? new Date(d.expectedDelivery).toLocaleDateString('en-IN') : '—'}</td>
                  <td className="text-sm text-[var(--text-2)]">{d.totalQty ?? '—'}</td>
                  <td><StatusChip status={d.status} size="sm" /></td>
                  <td><ChevronRight size={14} className="text-[var(--text-3)]" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
                <select value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--brand)]">
                  <option value="">Select customer…</option>
                  {CUSTOMERS.map(c => <option key={c.id} value={c.tradingName}>{c.tradingName}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--text-3)] block mb-1">Jobs (comma separated)</label>
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
                disabled={!form.customerName || !form.dispatchDate}
                onClick={() => {
                  showToast({ type: 'success', title: 'Dispatch Created', body: `New dispatch created for ${form.customerName}` });
                  setShowModal(false);
                  setForm({ customerName: '', carrier: '', vehicleNumber: '', lrNumber: '', dispatchDate: '', jobs: '' });
                }}
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
