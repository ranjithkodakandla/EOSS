import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import StockWorkspaceNav from '../../components/layout/StockWorkspaceNav';
import type { FinishedProduct } from '../../types';

function specToken(spec: string) {
  const s = spec.toLowerCase();
  if (s.includes('42cr')) return '42cr';
  if (s.includes('304')) return '304';
  if (s.includes('316')) return '316';
  if (s.includes('410')) return '410';
  if (s.includes('en8')) return 'en8';
  return '';
}

function matchesSpec(name: string, token: string) {
  if (!token) return false;
  return name.toLowerCase().includes(token);
}

export default function Products() {
  const navigate = useNavigate();
  const {
    finishedProducts, inventory, lots, certificates, jobs, poLines, customerPos,
    siteAllocations, jobMaterialReqs, supplierPoLines, supplierPos, rfqs, showToast,
  } = useStore();
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(finishedProducts.find(p => p.materialSpec.toLowerCase().includes('42cr'))?.id ?? finishedProducts[0]?.id ?? '');
  const [checking, setChecking] = useState(false);

  const visible = finishedProducts.filter(p =>
    !query || p.name.toLowerCase().includes(query.toLowerCase()) || p.productCode.toLowerCase().includes(query.toLowerCase()) || p.materialSpec.toLowerCase().includes(query.toLowerCase())
  );
  const product = finishedProducts.find(p => p.id === selectedId) ?? visible[0];

  const context = useMemo(() => {
    if (!product) return null;
    const token = specToken(product.materialSpec);
    const stock = inventory.filter(i => matchesSpec(i.materialName, token));
    const materialIds = new Set(stock.map(i => i.materialItemId));
    const stockLots = lots.filter(l => materialIds.has(l.materialItemId) && l.primaryQty > 0);
    const certs = certificates.filter(c => c.linkedLots?.some(id => stockLots.some(l => l.id === id)) || matchesSpec(c.grade || '', token));
    const openJobs = jobs.filter(j => j.status !== 'complete' && j.status !== 'cancelled' && (
      (j.drawingRef || '').includes(product.drawingNumber) || j.description.toLowerCase().includes(product.name.split(' ')[0].toLowerCase())
      || jobMaterialReqs.some(r => r.jobId === j.id && materialIds.has(r.materialItemId))
    ));
    const lines = poLines.filter(l => l.drawingNumber === product.drawingNumber || l.description.includes(product.productCode));
    const orders = lines.map(l => ({ line: l, po: customerPos.find(p => p.id === l.poId) })).filter(x => x.po);
    const allocations = siteAllocations.filter(a => a.productId === product.id);
    const buyLines = supplierPoLines.filter(l => materialIds.has(l.materialItemId) && l.status !== 'received');
    const needs = jobMaterialReqs.filter(r => materialIds.has(r.materialItemId) && jobs.some(j => j.id === r.jobId && j.status !== 'complete'));
    const free = stock.reduce((s, i) => s + i.availableQty, 0);
    return { token, stock, stockLots, certs, openJobs, orders, allocations, buyLines, needs, free };
  }, [product, inventory, lots, certificates, jobs, poLines, customerPos, siteAllocations, jobMaterialReqs, supplierPoLines]);

  if (!product || !context) return <div className="p-6 text-sm text-[var(--text-2)]">No products in the master.</div>;

  const short = context.needs.find(n => n.shortage);
  const openRfq = rfqs.find(r => r.status === 'open');

  return (
    <div className="flex flex-col h-full min-h-0">
      <StockWorkspaceNav />
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[280px_1fr]">
        <div className="border-b lg:border-b-0 lg:border-r overflow-auto" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <div className="p-3">
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Find an item or spec…"
              className="w-full px-3 py-2 text-sm rounded-lg border outline-none" style={{ borderColor: 'var(--border)', color: 'var(--text)', background: 'var(--surface-2)' }} />
          </div>
          {visible.map(p => (
            <button key={p.id} type="button" onClick={() => { setSelectedId(p.id); setChecking(false); }}
              className="w-full text-left px-3 py-2.5 border-t" style={{ borderColor: 'var(--border)', background: p.id === product.id ? 'var(--surface-2)' : 'transparent' }}>
              <div className="text-sm font-semibold text-[var(--text)]">{p.name}</div>
              <div className="text-xs text-[var(--text-2)]">{p.productCode} · {p.materialSpec}</div>
            </button>
          ))}
        </div>

        <div className="overflow-auto p-4 md:p-5 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-[var(--text)]">{product.name}</h1>
              <p className="text-sm text-[var(--text-2)] mt-1">{product.productCode} · {product.drawingNumber} Rev {product.drawingRevision}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setChecking(v => !v)} className="px-3 py-2 rounded-lg text-sm font-semibold border" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
                Check availability
              </button>
              <button type="button" onClick={() => {
                const qty = short ? Math.max(short.requiredQty - short.reservedQty, 1) : 1;
                const q = new URLSearchParams({ name: context.stock[0]?.materialName || product.materialSpec, code: context.stock[0]?.materialCode || product.productCode, qty: String(qty), uom: context.stock[0]?.primaryUom || product.primaryUom });
                navigate(`/procurement/pr/new?${q.toString()}`);
              }} className="px-3 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: 'var(--brand-fill)' }}>
                Create purchase request
              </button>
              <button type="button" onClick={() => {
                showToast({ type: 'info', title: 'Add to quote', body: `${product.name} is ready to drop onto ${openRfq ? openRfq.rfqNumber : 'a new customer enquiry'}.` });
                navigate(openRfq ? `/sales/rfq/${openRfq.id}/quotation/new` : '/sales/rfq/new');
              }} className="px-3 py-2 rounded-lg text-sm font-semibold border" style={{ borderColor: 'var(--brand)', color: 'var(--brand)' }}>
                Add to quote
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3 text-sm">
            <Fact label="Spec" value={`${product.materialSpec} · ${product.primaryDimension}`} />
            <Fact label="Route" value={product.manufacturingRoute} />
            <Fact label="Weight" value={`${product.netWeightKg} kg net`} />
            <Fact label="Free stock of spec" value={context.stock.length ? `${context.free.toLocaleString('en-IN')} ${context.stock[0].primaryUom}` : 'No matching material on hand'} />
          </div>

          {checking && (
            <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              <h2 className="text-sm font-bold text-[var(--text)] mb-2">Availability against open jobs</h2>
              {context.needs.length === 0 && <p className="text-sm text-[var(--text-2)]">No open job is calling for this spec.</p>}
              {context.needs.map(n => {
                const job = jobs.find(j => j.id === n.jobId);
                const gap = n.requiredQty - n.reservedQty;
                return (
                  <div key={n.id} className="flex flex-wrap items-center justify-between gap-2 py-2 border-t text-sm" style={{ borderColor: 'var(--border)' }}>
                    <div>
                      <span className="font-semibold text-[var(--text)]">{job?.jobNumber}</span>
                      <span className="text-[var(--text-2)]"> needs {n.requiredQty} {n.uom}, {n.reservedQty} reserved{gap > 0 ? `, ${gap} short` : ''}.</span>
                    </div>
                    <button type="button" onClick={() => navigate(`/jobs/${n.jobId}`)} className="text-sm font-semibold text-[var(--brand)]">Open job</button>
                  </div>
                );
              })}
            </div>
          )}

          <section>
            <h2 className="text-sm font-bold text-[var(--text)] mb-2">Where the material sits</h2>
            {context.stock.length === 0 && <p className="text-sm text-[var(--text-2)]">Nothing in stores matches {product.materialSpec}.</p>}
            <div className="grid sm:grid-cols-2 gap-2">
              {context.stock.map(s => (
                <button key={s.id} type="button" onClick={() => navigate(`/inventory?focus=${s.shortage ? 'shortage' : 'all'}`)}
                  className="text-left rounded-xl border p-3" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                  <div className="text-sm font-semibold text-[var(--text)]">{s.locationName}</div>
                  <div className="text-sm text-[var(--text-2)]">{s.materialName}</div>
                  <div className="text-sm mt-1"><span className="font-semibold text-[var(--text)]">{s.availableQty.toLocaleString('en-IN')} {s.primaryUom} free</span> · {s.onHandQty.toLocaleString('en-IN')} on hand{s.shortage ? ' · short' : ''}</div>
                </button>
              ))}
            </div>
          </section>

          <section className="grid md:grid-cols-2 gap-4">
            <LinkList title="Certificates" empty="No certificate linked to this spec." items={context.certs.slice(0, 4).map(c => ({
              key: c.id, label: `${c.certNumber} · ${c.grade}`, path: `/inventory/cert/${c.id}`,
            }))} onOpen={navigate} />
            <LinkList title="Open supplier orders" empty="No open buy for this spec." items={context.buyLines.slice(0, 4).map(l => {
              const po = supplierPos.find(p => p.id === l.spoId);
              return { key: l.id, label: `${po?.poNumber ?? 'PO'} · ${l.materialName} · ${Math.max(l.orderedQty - l.receivedQty, 0)} ${l.uom} due`, path: po ? `/procurement/spo/${po.id}` : '/procurement' };
            })} onOpen={navigate} />
            <LinkList title="Customer orders using the drawing" empty="No customer PO line uses this drawing." items={context.orders.slice(0, 4).map(({ line, po }) => ({
              key: line.id, label: `${po!.poNumber} · ${line.orderedQty} ${line.uom} · ${po!.status}`, path: `/sales/po/${po!.id}`,
            }))} onOpen={navigate} />
            <LinkList title="Where it is allocated" empty="Not reserved to a site yet." items={context.allocations.slice(0, 4).map(a => ({
              key: a.id, label: `${a.siteName} · ${a.allocatedQty} ${a.uom} · ${a.jobNumber ?? a.poNumber}`, path: a.jobId ? `/jobs/${a.jobId}` : '/allocations',
            }))} onOpen={navigate} />
          </section>
        </div>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border p-3" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <div className="text-xs text-[var(--text-3)]">{label}</div>
      <div className="text-sm font-medium text-[var(--text)] mt-1">{value}</div>
    </div>
  );
}

function LinkList({ title, empty, items, onOpen }: { title: string; empty: string; items: { key: string; label: string; path: string }[]; onOpen: (path: string) => void }) {
  return (
    <div>
      <h2 className="text-sm font-bold text-[var(--text)] mb-2">{title}</h2>
      {items.length === 0 && <p className="text-sm text-[var(--text-2)]">{empty}</p>}
      <div className="space-y-1">
        {items.map(item => (
          <button key={item.key} type="button" onClick={() => onOpen(item.path)} className="block w-full text-left text-sm text-[var(--brand)] py-1">{item.label}</button>
        ))}
      </div>
    </div>
  );
}
