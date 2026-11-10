import React, { useState } from 'react';
import { BarChart2, Download, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useStore } from '../../store';
import { SITES } from '../../store';
import StatusChip from '../../components/layout/StatusChip';

const REPORT_TYPES = [
  { id: 'production', label: 'Production Summary', desc: 'Job completion rates, stage cycle times, OEE', icon: '🏭' },
  { id: 'inventory', label: 'Inventory Report', desc: 'Stock levels, movement ledger, slow-moving items', icon: '📦' },
  { id: 'quality', label: 'Quality Report', desc: 'Pass/fail rates, NCR analysis, supplier quality', icon: '✅' },
  { id: 'procurement', label: 'Procurement Report', desc: 'PO status, delivery performance, spend by supplier', icon: '🛒' },
  { id: 'asset', label: 'Asset Utilization', desc: 'Uptime, downtime, maintenance costs, PM compliance', icon: '⚙️' },
  { id: 'dispatch', label: 'Dispatch Report', desc: 'On-time delivery, transit times, customer-wise', icon: '🚚' },
  { id: 'finance', label: 'Financial Summary', desc: 'Revenue, collections, payables, cash position', icon: '💰' },
  { id: 'multisite', label: 'Multi-Site Overview', desc: 'Per-site headcount, job load and production status', icon: '🏗️' },
];

export default function Reports() {
  const { jobs, inventory, inspections, assets, dispatches, maintenanceEvents, supplierPos, customerInvoices, supplierInvoices, employees, showToast } = useStore();
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState('2026-10-01');
  const [dateTo, setDateTo] = useState('2026-11-05');

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
              <button onClick={e => { e.stopPropagation(); setActiveReport(r.id === activeReport ? null : r.id); }} className="text-xs text-[var(--brand)] font-medium hover:underline">View Report →</button>
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
                    <td><StatusChip status={j.status} size="sm" /></td>
                    <td><StatusChip status={j.priority} size="sm" /></td>
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

      {activeReport === 'inventory' && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h3 className="font-semibold text-[var(--text)] mb-4">Inventory Report</h3>
          <div className="grid md:grid-cols-3 gap-4 mb-5">
            <Stat label="Total Items" value={inventory.length} />
            <Stat label="Shortage Items" value={inventory.filter(i => i.shortage).length} color={inventory.filter(i => i.shortage).length > 0 ? 'error' : 'success'} />
            <Stat label="In Transit" value={inventory.filter(i => i.inTransitQty > 0).length} color="info" />
          </div>
          <div className="overflow-x-auto">
            <table className="eoss-table">
              <thead><tr><th>Material</th><th>Location</th><th>On Hand</th><th>Available</th><th>Status</th></tr></thead>
              <tbody>
                {inventory.slice(0, 10).map(i => (
                  <tr key={i.id}>
                    <td className="text-sm font-medium text-[var(--text)]">{i.materialName}</td>
                    <td className="text-xs text-[var(--text-2)]">{i.locationName}</td>
                    <td className="text-sm text-[var(--text)]">{i.onHandQty} {i.primaryUom}</td>
                    <td className="text-sm text-[var(--text-2)]">{i.availableQty}</td>
                    <td><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${i.shortage ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>{i.shortage ? 'Shortage' : 'OK'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReport === 'procurement' && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h3 className="font-semibold text-[var(--text)] mb-4">Procurement Report</h3>
          <div className="grid md:grid-cols-3 gap-4 mb-5">
            <Stat label="Supplier POs" value={supplierPos.length} />
            <Stat label="Overdue POs" value={supplierPos.filter(p => p.status === 'overdue').length} color={supplierPos.filter(p => p.status === 'overdue').length > 0 ? 'error' : 'success'} />
            <Stat label="Total Spend" value={`₹${(supplierPos.reduce((s, p) => s + p.totalValue, 0) / 100000).toFixed(1)}L`} color="info" />
          </div>
          <div className="overflow-x-auto">
            <table className="eoss-table">
              <thead><tr><th>PO Number</th><th>Supplier</th><th>Raised</th><th>Value</th><th>Status</th></tr></thead>
              <tbody>
                {supplierPos.slice(0, 8).map(p => (
                  <tr key={p.id}>
                    <td className="font-mono text-xs font-bold text-[var(--brand)]">{p.poNumber}</td>
                    <td className="text-sm text-[var(--text)]">{p.supplierName}</td>
                    <td className="text-xs text-[var(--text-2)]">{new Date(p.raisedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                    <td className="font-mono text-sm text-[var(--text)]">₹{(p.totalValue / 1000).toFixed(1)}k</td>
                    <td><StatusChip status={p.status} size="sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReport === 'dispatch' && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h3 className="font-semibold text-[var(--text)] mb-4">Dispatch Report</h3>
          <div className="grid md:grid-cols-3 gap-4 mb-5">
            <Stat label="Total Dispatches" value={dispatches.length} />
            <Stat label="Delivered" value={dispatches.filter(d => d.status === 'delivered').length} color="success" />
            <Stat label="In Transit" value={dispatches.filter(d => (d.status as string) === 'in_transit' || d.status === 'dispatched').length} color="info" />
          </div>
          <div className="overflow-x-auto">
            <table className="eoss-table">
              <thead><tr><th>Dispatch #</th><th>Customer</th><th>Date</th><th>Vehicle</th><th>Status</th></tr></thead>
              <tbody>
                {dispatches.slice(0, 8).map(d => (
                  <tr key={d.id}>
                    <td className="font-mono text-xs font-bold text-[var(--brand)]">{d.dispatchNumber}</td>
                    <td className="text-sm text-[var(--text)]">{d.customerName}</td>
                    <td className="text-xs text-[var(--text-2)]">{new Date(d.dispatchDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                    <td className="text-xs text-[var(--text-2)]">{d.vehicleNumber ?? '—'}</td>
                    <td><StatusChip status={d.status} size="sm" /></td>
                  </tr>
                ))}
                {dispatches.length === 0 && <tr><td colSpan={5} className="text-center py-6 text-sm text-[var(--text-3)]">No dispatch records found</td></tr>}
              </tbody>
            </table>
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

      {activeReport === 'multisite' && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h3 className="font-semibold text-[var(--text)] mb-4">Multi-Site Overview — Apex Precision Engineering Pvt Ltd</h3>
          <div className="overflow-x-auto">
            <table className="eoss-table">
              <thead>
                <tr>
                  <th>Site</th>
                  <th>Code</th>
                  <th>City</th>
                  <th>Type</th>
                  <th>Employees</th>
                  <th>Total Jobs</th>
                  <th>Active Jobs</th>
                  <th>Completed Jobs</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {SITES.map(site => {
                  const siteEmps = employees.filter(e => e.siteId === site.id).length;
                  const siteJobs = jobs.filter(j => j.siteId === site.id);
                  const activeJobs = siteJobs.filter(j => j.status === 'active').length;
                  const completedJobs = siteJobs.filter(j => j.status === 'complete').length;
                  return (
                    <tr key={site.id}>
                      <td className="font-medium text-[var(--text)]">{site.name}</td>
                      <td className="font-mono text-xs text-[var(--brand)]">{site.code}</td>
                      <td className="text-xs text-[var(--text-2)]">{site.city}</td>
                      <td className="text-xs text-[var(--text-2)]">{site.siteType ?? '—'}</td>
                      <td className="text-sm font-semibold text-[var(--text)]">{siteEmps}</td>
                      <td className="text-sm text-[var(--text)]">{siteJobs.length}</td>
                      <td className="text-sm text-blue-600">{activeJobs}</td>
                      <td className="text-sm text-emerald-600">{completedJobs}</td>
                      <td><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${site.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{site.status ?? 'active'}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReport === 'finance' && (() => {
        const fmtINR = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
        const revenue = customerInvoices.reduce((s, i) => s + i.amount, 0);
        const collected = customerInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
        const outstandingAR = customerInvoices.filter(i => i.status !== 'paid').reduce((s, i) => s + (i.amount - i.amountPaid), 0);
        const payables = supplierInvoices.reduce((s, i) => s + (i.amount - i.amountPaid), 0);
        return (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
            <h3 className="font-semibold text-[var(--text)] mb-4">Financial Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
              <Stat label="Total Revenue" value={fmtINR(revenue)} color="info" />
              <Stat label="Collected" value={fmtINR(collected)} color="success" />
              <Stat label="Outstanding AR" value={fmtINR(outstandingAR)} color={outstandingAR > 0 ? 'warning' : 'success'} />
              <Stat label="Payables" value={fmtINR(payables)} color={payables > 0 ? 'error' : 'success'} />
            </div>
            <div className="overflow-x-auto">
              <table className="eoss-table">
                <thead><tr><th>Invoice #</th><th>Customer</th><th>Amount</th><th>Due Date</th><th>Status</th></tr></thead>
                <tbody>
                  {customerInvoices.slice(0, 8).map(i => (
                    <tr key={i.id}>
                      <td className="font-mono text-xs font-bold text-[var(--brand)]">{i.invoiceNumber}</td>
                      <td className="text-sm text-[var(--text)]">{i.customerName}</td>
                      <td className="font-mono text-sm text-[var(--text)]">{fmtINR(i.amount)}</td>
                      <td className="text-xs text-[var(--text-2)]">{new Date(i.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                      <td><StatusChip status={i.status} size="sm" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}
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
