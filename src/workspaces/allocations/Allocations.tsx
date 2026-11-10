import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useStore } from '../../store';
import StockWorkspaceNav from '../../components/layout/StockWorkspaceNav';
import { jobMaterialQuantities } from '../../domain/inventory';

export default function Allocations() {
  const navigate = useNavigate();
  const { jobMaterialReqs, jobs, inventory, storeLocations, purchaseReqs, reserveMaterial, showToast } = useStore();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');

  const rows = useMemo(() => jobs.filter(j => !['complete', 'cancelled'].includes(j.status)).flatMap(job => jobMaterialQuantities(job, jobMaterialReqs, inventory, storeLocations).map(row => ({ ...row, job }))).filter(row => {
    const q = query.toLowerCase();
    const shortage = row.shortageQty > 0;
    return (!q || `${row.job.jobNumber} ${row.job.siteName} ${row.req.materialName}`.toLowerCase().includes(q)) && (status === 'all' || (status === 'shortage' ? shortage : status === 'covered' ? !shortage : true));
  }).sort((a, b) => b.shortageQty - a.shortageQty), [jobs, jobMaterialReqs, inventory, storeLocations, query, status]);

  const reserve = (row: (typeof rows)[number]) => {
    const available = Math.min(row.shortageQty, row.availableQty);
    if (available <= 0) return;
    reserveMaterial(row.req.id, available, useStore.getState().currentUser.name);
  };

  const raisePr = (row: (typeof rows)[number]) => {
    const uncovered = row.shortageQty;
    const duplicate = purchaseReqs.some(pr => pr.jobId === row.job.id && pr.status !== 'cancelled' && (pr as PurchaseRequisitionWithLines).lines?.some(line => line.materialCode === row.req.materialItemId || line.description === row.req.materialName));
    if (duplicate) { showToast({ type: 'info', title: 'Procurement already in progress', body: 'An open PR already covers this job requirement.' }); return; }
    const q = new URLSearchParams({ job: row.job.id, name: row.req.materialName, code: row.req.materialItemId, qty: String(uncovered), uom: row.req.uom, site: row.job.siteId });
    navigate(`/procurement/pr/new?${q.toString()}`);
  };

  return <div className="flex flex-col h-full min-h-0"><StockWorkspaceNav /><div className="flex-shrink-0 px-4 py-3 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}><h1 className="text-lg font-bold text-[var(--text)]">Site Need</h1><p className="text-sm text-[var(--text-2)]">Demand and fulfilment planning by site — not another item catalogue or stock listing.</p><div className="mt-3 flex flex-wrap gap-2"><div className="relative flex-1 min-w-[220px] max-w-sm"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search job, site or item…" className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border outline-none" style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text)' }} /></div><select value={status} onChange={e => setStatus(e.target.value)} className="eoss-input text-xs"><option value="all">All requirements</option><option value="shortage">Shortage</option><option value="covered">Covered</option></select></div></div><div className="flex-1 overflow-auto p-3 md:p-4"><div className="rounded-xl border overflow-x-auto" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}><table className="eoss-table"><thead><tr><th>Site</th><th>Item</th><th>Required</th><th>Available</th><th>Reserved</th><th>Shortage</th><th>Required by</th><th>Source / action</th></tr></thead><tbody>{rows.map(row => { const reqOpen = purchaseReqs.some(pr => pr.jobId === row.job.id && pr.status !== 'cancelled' && (pr as PurchaseRequisitionWithLines).lines?.some(line => line.description === row.req.materialName)); return <tr key={row.req.id}><td><button type="button" onClick={() => navigate(`/jobs/${row.job.id}`)} className="text-left"><div className="text-xs font-semibold text-[var(--brand)]">{row.job.siteName}</div><div className="text-[11px] text-[var(--text-3)]">{row.job.jobNumber}</div></button></td><td><div className="text-sm font-semibold">{row.req.materialName}</div><div className="text-xs text-[var(--text-3)]">{row.req.uom}</div></td><td className="font-mono text-xs">{row.req.requiredQty}</td><td className="font-mono text-xs">{row.availableQty}</td><td className="font-mono text-xs">{row.reservedQty}</td><td className="font-mono text-xs font-bold" style={{ color: row.shortageQty ? 'var(--error)' : 'var(--success)' }}>{row.shortageQty}</td><td className="text-xs">{row.job.plannedEnd}</td><td><div className="flex flex-wrap gap-1.5">{row.shortageQty > 0 && row.availableQty > 0 && <button type="button" onClick={() => reserve(row)} className="px-2 py-1 rounded text-xs font-semibold text-white" style={{ background: 'var(--brand-fill)' }}>Reserve {Math.min(row.shortageQty, row.availableQty)}</button>}{row.shortageQty > 0 && <button type="button" onClick={() => raisePr(row)} className="px-2 py-1 rounded text-xs font-semibold border" style={{ borderColor: 'var(--brand)', color: 'var(--brand)' }}>{reqOpen ? 'Open PR' : 'Create PR'}</button>}{row.shortageQty === 0 && <span className="text-xs font-semibold text-[var(--success)]">Covered</span>}</div></td></tr>; })}{rows.length === 0 && <tr><td colSpan={8} className="py-10 text-center text-sm text-[var(--text-3)]">No active site requirements.</td></tr>}</tbody></table></div></div></div>;
}

type PurchaseRequisitionWithLines = { lines?: { materialCode?: string; description?: string }[] };
