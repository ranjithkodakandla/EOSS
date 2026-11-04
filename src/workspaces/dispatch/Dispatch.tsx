import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, Truck, Search } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';
import clsx from 'clsx';

export default function Dispatch() {
  const { dispatches, currentUser } = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const readyToDispatch = dispatches.filter(d => d.status === 'ready').length;
  const inTransit = dispatches.filter(d => d.status === 'in_transit').length;

  const filtered = dispatches.filter(d => !search || d.dispatchNumber.toLowerCase().includes(search.toLowerCase()) || d.customerName.toLowerCase().includes(search.toLowerCase()));

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
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--brand)] text-white rounded-lg text-sm font-medium"><Plus size={16} /> New Dispatch</button>
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
            <thead><tr><th>Dispatch #</th><th>Customer</th><th>Job #</th><th>Mode</th><th>Courier / Vehicle</th><th>Dispatch Date</th><th>ETA</th><th>Invoiced</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id} className="cursor-pointer" onClick={() => navigate(`/dispatch/${d.id}`)}>
                  <td><span className="font-mono text-xs font-semibold text-[var(--brand)]">{d.dispatchNumber}</span></td>
                  <td className="text-sm text-[var(--text)]">{d.customerName}</td>
                  <td><span className="font-mono text-xs text-[var(--text-2)]">{d.jobNumber}</span></td>
                  <td className="text-sm text-[var(--text-2)]">{d.mode}</td>
                  <td className="text-sm text-[var(--text-2)]">{d.courierName ?? d.vehicleNumber ?? '—'}</td>
                  <td className="text-sm text-[var(--text-2)]">{d.dispatchDate ? new Date(d.dispatchDate).toLocaleDateString('en-IN') : '—'}</td>
                  <td className="text-sm text-[var(--text-2)]">{d.eta ? new Date(d.eta).toLocaleDateString('en-IN') : '—'}</td>
                  <td>
                    {d.invoiceNumber
                      ? <span className="font-mono text-xs text-[var(--success)]">{d.invoiceNumber}</span>
                      : <span className="text-xs text-[var(--text-3)]">—</span>}
                  </td>
                  <td><StatusChip status={d.status} size="sm" /></td>
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

function KpiTile({ label, value, accent = 'neutral' }: { label: string; value: number; accent?: string }) {
  const color = { error: 'var(--error)', success: 'var(--success)', info: 'var(--info)', warning: 'var(--warning)', neutral: 'var(--text)' }[accent] ?? 'var(--text)';
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
      <div className="text-xl font-bold" style={{ color }}>{value}</div>
      <div className="text-xs text-[var(--text-2)] mt-0.5">{label}</div>
    </div>
  );
}
