import React, { useState } from 'react';
import { BarChart2, Download, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useStore } from '../../store';
import { useNavigate } from 'react-router-dom';

const REPORT_TYPES = [
  { id: 'production', label: 'Production Summary', desc: 'Job completion rates, stage cycle times, OEE', icon: '🏭' },
  { id: 'inventory', label: 'Inventory Report', desc: 'Stock levels, movement ledger, slow-moving items', icon: '📦' },
  { id: 'quality', label: 'Quality Report', desc: 'Pass/fail rates, NCR analysis, supplier quality', icon: '✅' },
  { id: 'procurement', label: 'Procurement Report', desc: 'PO status, delivery performance, spend by supplier', icon: '🛒' },
  { id: 'asset', label: 'Asset Utilization', desc: 'Uptime, downtime, maintenance costs, PM compliance', icon: '⚙️' },
  { id: 'dispatch', label: 'Dispatch Report', desc: 'On-time delivery, transit times, customer-wise', icon: '🚚' },
];

export default function Reports() {
  const { jobs, inventory, inspections, assets, dispatches, maintenanceEvents, showToast } = useStore();
  const navigate = useNavigate();
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState('2026-10-01');
  const [dateTo, setDateTo] = useState('2026-11-05');

  const REPORT_ROUTES: Record<string, string> = { production: '/jobs', inventory: '/inventory', quality: '/quality', procurement: '/procurement', asset: '/assets', dispatch: '/dispatch' };

  const completedJobs = jobs.filter(j => j.status === 'complete').length;
  const inProgressJobs = jobs.filter(j => j.status === 'active').length;
  const passRate = Math.round((inspections.filter(i => i.result === 'pass').length / Math.max(inspections.filter(i => i.result !== 'pending').length, 1)) * 100);
  const assetUptime = Math.round(((assets.length - assets.filter(a => a.status === 'breakdown').length) / assets.length) * 100);

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-[var(--text)]">Reports & Analytics</h1>
          <p className="text-sm text-[var(--text-2)] mt-0.5">Business intelligence across all workspaces</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-[var(--text-2)]">Period:</span>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="eoss-input text-xs py-1.5" />
          <span className="text-xs text-[var(--text-3)]">to</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="eoss-input text-xs py-1.5" />
        </div>
      </div>

      {/* Headline KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Jobs Completed" value={completedJobs} total={jobs.length} trend="up" />
        <KpiCard label="Quality Pass Rate" value={`${passRate}%`} trend={passRate >= 90 ? 'up' : passRate >= 75 ? 'flat' : 'down'} />
        <KpiCard label="Asset Uptime" value={`${assetUptime}%`} trend={assetUptime >= 95 ? 'up' : 'down'} />
        <KpiCard label="In-Progress Jobs" value={inProgressJobs} trend="flat" />
      </div>

      {/* Report tiles */}
      <h2 className="text-sm font-semibold text-[var(--text-2)] font-medium mb-3">Available Reports</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {REPORT_TYPES.map(r => (
          <div key={r.id} onClick={() => setActiveReport(r.id === activeReport ? null : r.id)} className={`bg-[var(--surface)] border rounded-xl p-4 cursor-pointer transition-colors ${activeReport === r.id ? 'border-[var(--brand)] ring-1 ring-[var(--brand)]' : 'border-[var(--border)] hover:border-[var(--brand)]'}`}>
            <div className="text-2xl mb-2">{r.icon}</div>
            <div className="font-semibold text-sm text-[var(--text)]">{r.label}</div>
            <div className="text-xs text-[var(--text-3)] mt-1">{r.desc}</div>
            <div className="mt-3 flex items-center gap-2">
              <button onClick={e => { e.stopPropagation(); setActiveReport(r.id); navigate(REPORT_ROUTES[r.id] ?? '/reports'); }} className="text-xs text-[var(--brand)] font-medium hover:underline">View Report →</button>
              <button onClick={e => { e.stopPropagation(); showToast({ type: 'info', title: 'Export queued', body: `${r.label} (${dateFrom} – ${dateTo}) will download shortly.` }); }} className="ml-auto text-[var(--text-3)] hover:text-[var(--brand)]"><Download size={13} /></button>
            </div>
          </div>
        ))}
      </div>

      {activeReport === 'production' && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h3 className="font-semibold text-[var(--text)] mb-4">Production Summary</h3>
          <div className="grid md:grid-cols-3 gap-4 mb-5">
            <Stat label="Total Jobs" value={jobs.length} />
            <Stat label="Completed" value={completedJobs} sub={`${Math.round(completedJobs/jobs.length*100)}% completion rate`} color="success" />
            <Stat label="In Progress" value={inProgressJobs} color="info" />
          </div>
          <div className="overflow-x-auto">
            <table className="eoss-table">
              <thead><tr><th>Job #</th><th>Customer</th><th>Status</th><th>Priority</th><th>Planned End</th></tr></thead>
              <tbody>
                {jobs.slice(0, 5).map(j => (
                  <tr key={j.id}>
                    <td className="font-mono text-xs text-[var(--brand)]">{j.jobNumber}</td>
                    <td className="text-sm text-[var(--text)]">{j.customerName}</td>
                    <td><span className="text-xs text-[var(--text-2)]">{j.status}</span></td>
                    <td><span className="text-xs text-[var(--text-2)]">{j.priority}</span></td>
                    <td className="text-sm text-[var(--text-2)]">{j.plannedEnd ? new Date(j.plannedEnd).toLocaleDateString('en-IN') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReport === 'quality' && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h3 className="font-semibold text-[var(--text)] mb-4">Quality Report</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Stat label="Inspections" value={inspections.length} />
            <Stat label="Pass Rate" value={`${passRate}%`} color={passRate >= 90 ? 'success' : 'warning'} />
            <Stat label="Failed" value={inspections.filter(i => i.result === 'fail').length} color="error" />
          </div>
        </div>
      )}

      {activeReport === 'asset' && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h3 className="font-semibold text-[var(--text)] mb-4">Asset Utilization</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Stat label="Total Assets" value={assets.length} />
            <Stat label="Uptime" value={`${assetUptime}%`} color={assetUptime >= 95 ? 'success' : 'warning'} />
            <Stat label="Maintenance Events" value={maintenanceEvents.length} />
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value, total, trend, }: { label: string; value: string | number; total?: number; trend: 'up' | 'down' | 'flat' }) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xl font-bold text-[var(--text)]">{value}</div>
          {total && <div className="text-xs text-[var(--text-3)]">of {total}</div>}
        </div>
        {trend === 'up' && <TrendingUp size={16} className="text-[var(--success)]" />}
        {trend === 'down' && <TrendingDown size={16} className="text-[var(--error)]" />}
        {trend === 'flat' && <Minus size={16} className="text-[var(--text-3)]" />}
      </div>
      <div className="text-xs text-[var(--text-2)] mt-1">{label}</div>
    </div>
  );
}

function Stat({ label, value, sub, color = 'neutral' }: { label: string; value: string | number; sub?: string; color?: string }) {
  const colorMap: Record<string, string> = { success: 'var(--success)', error: 'var(--error)', warning: 'var(--warning)', info: 'var(--info)', neutral: 'var(--text)' };
  return (
    <div className="text-center bg-[var(--surface-2)] rounded-xl p-4">
      <div className="text-2xl font-bold" style={{ color: colorMap[color] ?? colorMap.neutral }}>{value}</div>
      <div className="text-xs text-[var(--text-2)] mt-1">{label}</div>
      {sub && <div className="text-[11px] text-[var(--text-3)] mt-0.5">{sub}</div>}
    </div>
  );
}
