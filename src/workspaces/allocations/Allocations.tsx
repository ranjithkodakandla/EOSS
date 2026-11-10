import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import StockWorkspaceNav from '../../components/layout/StockWorkspaceNav';

export default function Allocations() {
  const navigate = useNavigate();
  const { jobMaterialReqs, jobs, inventory, siteAllocations, showToast } = useStore();
  const [extra, setExtra] = useState<Record<string, number>>({});
  const [released, setReleased] = useState<Record<string, number>>({});
  const [showHistory, setShowHistory] = useState(false);

  const rows = useMemo(() => {
    return jobMaterialReqs
      .map(req => {
        const job = jobs.find(j => j.id === req.jobId);
        if (!job || job.status === 'complete' || job.status === 'cancelled') return null;
        const reserved = Math.max(0, req.reservedQty + (extra[req.id] || 0) - (released[req.id] || 0));
        const gap = Math.max(0, req.requiredQty - reserved);
        const places = inventory.filter(i => i.materialItemId === req.materialItemId);
        const freeHere = places.filter(i => i.locationName.toLowerCase().includes(job.siteName.split(' ')[0].toLowerCase()) || i.locationId.startsWith('loc-rm') && job.siteId === 'site-hyd').reduce((s, i) => s + i.availableQty, 0);
        const freeElsewhere = places.filter(i => i.availableQty > 0);
        return { req, job, reserved, gap, freeElsewhere, freeHere };
      })
      .filter((row): row is NonNullable<typeof row> => !!row)
      .sort((a, b) => b.gap - a.gap);
  }, [jobMaterialReqs, jobs, inventory, extra, released]);

  const reserve = (id: string, gap: number, free: number) => {
    const add = Math.max(1, Math.min(gap, free || gap));
    setExtra(s => ({ ...s, [id]: (s[id] || 0) + add }));
    showToast({ type: 'success', title: 'Reserved', body: `${add} held against this job.` });
  };

  const release = (id: string, reserved: number) => {
    const drop = Math.min(reserved, Math.max(1, Math.round(reserved * 0.5) || 1));
    setReleased(s => ({ ...s, [id]: (s[id] || 0) + drop }));
    showToast({ type: 'info', title: 'Released', body: `${drop} returned to free stock.` });
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <StockWorkspaceNav />
      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <h1 className="text-lg font-bold text-[var(--text)]">What each site still needs</h1>
        <p className="text-sm text-[var(--text-2)]">Open jobs first. Reserve what is already here, or move stock that is sitting somewhere else.</p>
      </div>
      <div className="flex-1 overflow-auto p-3 md:p-4 space-y-2 max-w-5xl">
        {rows.map(({ req, job, reserved, gap, freeElsewhere }) => {
          const source = freeElsewhere.find(i => i.availableQty > 0 && gap > 0);
          return (
            <div key={req.id} className="rounded-xl border p-4" style={{ borderColor: gap > 0 ? 'var(--warning,#D97706)' : 'var(--border)', background: 'var(--surface)' }}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <button type="button" onClick={() => navigate(`/jobs/${job.id}`)} className="text-sm font-bold text-[var(--brand)]">{job.jobNumber}</button>
                  <span className="text-sm text-[var(--text-2)]"> · {job.siteName}</span>
                  <div className="text-sm font-semibold text-[var(--text)] mt-1">{req.materialName}</div>
                  <div className="text-sm text-[var(--text)] mt-1">
                    Need {req.requiredQty} {req.uom} · reserved {reserved} · {gap > 0 ? <span className="font-semibold" style={{ color: 'var(--error)' }}>{gap} short</span> : <span className="font-semibold" style={{ color: 'var(--success)' }}>covered</span>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {gap > 0 && (
                    <button type="button" onClick={() => reserve(req.id, gap, source?.availableQty || gap)}
                      className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white" style={{ background: 'var(--brand-fill)' }}>
                      Reserve
                    </button>
                  )}
                  {reserved > 0 && (
                    <button type="button" onClick={() => release(req.id, reserved)}
                      className="px-3 py-1.5 rounded-lg text-sm font-semibold border" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
                      Release
                    </button>
                  )}
                  {source && gap > 0 && source.locationName !== 'WIP Store' && (
                    <button type="button" onClick={() => {
                      const q = new URLSearchParams({
                        material: req.materialName, from: source.locationName, to: 'WIP Store',
                        qty: String(Math.min(source.availableQty, gap)), uom: req.uom, job: job.jobNumber,
                      });
                      navigate(`/transfers?${q.toString()}`);
                    }} className="px-3 py-1.5 rounded-lg text-sm font-semibold border" style={{ borderColor: 'var(--brand)', color: 'var(--brand)' }}>
                      Transfer {Math.min(source.availableQty, gap)} from {source.locationName}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {rows.length === 0 && <p className="text-sm text-[var(--text-2)]">No open job is waiting on material.</p>}

        <button type="button" onClick={() => setShowHistory(v => !v)} className="text-sm font-semibold text-[var(--text-2)] pt-2">
          {showHistory ? 'Hide' : 'Show'} recorded site splits ({siteAllocations.length})
        </button>
        {showHistory && siteAllocations.map(a => (
          <div key={a.id} className="rounded-xl border px-4 py-3 text-sm" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <span className="font-semibold text-[var(--text)]">{a.productName}</span>
            <span className="text-[var(--text-2)]"> · {a.allocatedQty} {a.uom} at {a.siteName} · {a.jobNumber ?? a.poNumber} · {a.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
