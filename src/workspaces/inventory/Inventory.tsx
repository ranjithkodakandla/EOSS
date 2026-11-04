import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, AlertTriangle, ChevronRight, ArrowRightLeft, Package, Layers,
  ChevronDown, ChevronUp, MapPin, Shield, ArrowUpRight,
} from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';
import clsx from 'clsx';

const LOC_COLOR: Record<string, { dot: string; track: string; bg: string }> = {
  'Raw Material Store':    { dot: '#3B82F6', track: 'rgba(59,130,246,0.2)',  bg: 'rgba(59,130,246,0.08)' },
  'WIP Store':             { dot: '#F59E0B', track: 'rgba(245,158,11,0.2)',  bg: 'rgba(245,158,11,0.08)' },
  'Finished Goods Store':  { dot: '#10B981', track: 'rgba(16,185,129,0.2)',  bg: 'rgba(16,185,129,0.08)' },
  'Quarantine Store':      { dot: '#EF4444', track: 'rgba(239,68,68,0.2)',   bg: 'rgba(239,68,68,0.08)' },
  'Spare Parts Store':     { dot: '#8B5CF6', track: 'rgba(139,92,246,0.2)',  bg: 'rgba(139,92,246,0.08)' },
  'Scrap Yard':            { dot: '#6B7280', track: 'rgba(107,114,128,0.2)', bg: 'rgba(107,114,128,0.08)' },
  'Bonded Store':          { dot: '#06B6D4', track: 'rgba(6,182,212,0.2)',   bg: 'rgba(6,182,212,0.08)' },
  'Tool Crib':             { dot: '#F97316', track: 'rgba(249,115,22,0.2)',  bg: 'rgba(249,115,22,0.08)' },
  'Dispatch Bay':          { dot: '#06B6D4', track: 'rgba(6,182,212,0.2)',   bg: 'rgba(6,182,212,0.08)' },
  'Warehouse Bay A':       { dot: '#14B8A6', track: 'rgba(20,184,166,0.2)',  bg: 'rgba(20,184,166,0.08)' },
  'Warehouse Bay B':       { dot: '#14B8A6', track: 'rgba(20,184,166,0.2)',  bg: 'rgba(20,184,166,0.08)' },
};

function getDotColor(name: string)  { return LOC_COLOR[name]?.dot   ?? '#94A3B8'; }
function getTrackColor(name: string){ return LOC_COLOR[name]?.track ?? '#E2E8F0'; }
function getBgColor(name: string)   { return LOC_COLOR[name]?.bg    ?? '#F8FAFC'; }

export default function Inventory() {
  const { inventory, lots, currentUser } = useStore();
  const navigate = useNavigate();
  const [search, setSearch]           = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [view, setView]               = useState<'items' | 'lots'>('items');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const locations = useMemo(() =>
    ['all', ...Array.from(new Set(inventory.map(i => i.locationName)))],
    [inventory]
  );

  const filteredItems = useMemo(() => inventory.filter(i => {
    const ms = !search || i.materialName.toLowerCase().includes(search.toLowerCase()) ||
      i.materialCode.toLowerCase().includes(search.toLowerCase());
    const ml = locationFilter === 'all' || i.locationName === locationFilter;
    return ms && ml;
  }), [inventory, search, locationFilter]);

  const filteredLots = useMemo(() => lots.filter(l =>
    !search || l.lotNumber.toLowerCase().includes(search.toLowerCase()) ||
    l.materialName.toLowerCase().includes(search.toLowerCase()) ||
    (l.heatNumber?.toLowerCase().includes(search.toLowerCase()) ?? false)
  ), [lots, search]);

  const shortageCount = inventory.filter(i => i.shortage).length;
  const qcHoldCount   = inventory.filter(i => i.qcHoldQty > 0).length;

  const canTransfer = ['owner', 'storekeeper'].includes(currentUser.role);

  const locationStats = useMemo(() => {
    const map: Record<string, { name: string; items: number; onHand: number; shortages: number; qcHold: number }> = {};
    inventory.forEach(i => {
      if (!map[i.locationName]) map[i.locationName] = { name: i.locationName, items: 0, onHand: 0, shortages: 0, qcHold: 0 };
      map[i.locationName].items++;
      map[i.locationName].onHand += i.onHandQty;
      if (i.shortage) map[i.locationName].shortages++;
      if (i.qcHoldQty > 0) map[i.locationName].qcHold++;
    });
    return Object.values(map).sort((a, b) => b.items - a.items);
  }, [inventory]);

  const maxItems = Math.max(...locationStats.map(l => l.items), 1);

  // Items that are in QC hold (quarantine)
  const qcHoldItems = inventory.filter(i => i.qcHoldQty > 0);

  function toggleExpand(id: string) {
    setExpandedItems(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function getLotsByMaterial(materialCode: string) {
    return lots.filter(l => l.materialItemId && inventory.find(i => i.materialCode === materialCode && i.materialCode === l.materialName.slice(0, materialCode.length)));
  }

  function getLotsForItem(item: typeof inventory[0]) {
    return lots.filter(l =>
      l.materialName === item.materialName ||
      l.storeLocationName === item.locationName && l.materialName.includes(item.materialName.split(' ')[0])
    ).slice(0, 5);
  }

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-4">

      {/* ── Header row ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>Inventory</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="pill" style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-2)' }}>
              <Package size={10} /> {inventory.length} items
            </span>
            <span className="pill" style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-2)' }}>
              <Layers size={10} /> {lots.length} lots
            </span>
            {shortageCount > 0 && (
              <span className="pill" style={{ background: 'var(--error-bg)', borderColor: 'var(--error-border)', color: 'var(--error)' }}>
                <AlertTriangle size={10} /> {shortageCount} shortage{shortageCount > 1 ? 's' : ''}
              </span>
            )}
            {qcHoldCount > 0 && (
              <span className="pill" style={{ background: 'var(--hold-bg)', borderColor: 'var(--hold-border)', color: 'var(--hold)' }}>
                <Shield size={10} /> {qcHoldCount} QC hold
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {canTransfer && (
            <button className="btn-ghost">
              <ArrowRightLeft size={14} /> Transfer
            </button>
          )}
        </div>
      </div>

      {/* ── QC Hold alert ── */}
      {qcHoldItems.length > 0 && (
        <div
          className="rounded-[var(--radius)] px-4 py-3 flex items-center gap-3"
          style={{ background: 'var(--hold-bg)', border: '1px solid var(--hold-border)' }}
        >
          <Shield size={14} style={{ color: 'var(--hold)', flexShrink: 0 }} />
          <div className="flex-1">
            <span className="text-xs font-semibold" style={{ color: 'var(--hold)' }}>
              {qcHoldItems.length} material{qcHoldItems.length > 1 ? 's' : ''} in QC hold
            </span>
            <span className="text-xs ml-2" style={{ color: 'var(--text-2)' }}>
              {qcHoldItems.map(i => i.materialName).join(', ')}
            </span>
          </div>
          <button
            onClick={() => setLocationFilter('Quarantine Store')}
            className="text-xs font-semibold flex items-center gap-1"
            style={{ color: 'var(--hold)' }}
          >
            View <ChevronRight size={12} />
          </button>
        </div>
      )}

      {/* ── Main two-column layout ── */}
      <div className="grid lg:grid-cols-[260px_1fr] gap-4">

        {/* ── Location intelligence panel ── */}
        <div className="space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider px-1" style={{ color: 'var(--text-3)' }}>
            Locations · {locationStats.length}
          </div>
          <button
            onClick={() => setLocationFilter('all')}
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-[var(--radius-sm)] text-left transition-all"
            style={
              locationFilter === 'all'
                ? { background: 'var(--brand)', color: 'white', boxShadow: 'var(--shadow-sm)' }
                : { background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-2)' }
            }
          >
            <MapPin size={13} />
            <span className="text-xs font-medium flex-1">All Locations</span>
            <span className="text-[11px] font-mono">{inventory.length}</span>
          </button>

          {locationStats.map(loc => {
            const isActive = locationFilter === loc.name;
            return (
              <button
                key={loc.name}
                onClick={() => setLocationFilter(loc.name)}
                className="w-full text-left rounded-[var(--radius-sm)] overflow-hidden transition-all"
                style={{
                  border: isActive ? `2px solid ${getDotColor(loc.name)}` : '1px solid var(--border)',
                  background: isActive ? getBgColor(loc.name) : 'var(--surface)',
                  boxShadow: isActive ? 'var(--shadow-sm)' : '',
                }}
              >
                {/* Color strip header */}
                <div
                  className="h-1 w-full"
                  style={{ background: getDotColor(loc.name) }}
                />
                <div className="px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-semibold truncate" style={{ color: isActive ? getDotColor(loc.name) : 'var(--text)' }}>
                      {loc.name}
                    </span>
                    <span className="text-[11px] font-mono flex-shrink-0" style={{ color: 'var(--text-2)' }}>
                      {loc.items}
                    </span>
                  </div>
                  {/* Item count bar */}
                  <div className="relative h-1.5 rounded-full" style={{ background: getTrackColor(loc.name) }}>
                    <div
                      className="absolute left-0 top-0 h-full rounded-full"
                      style={{
                        width: `${(loc.items / maxItems) * 100}%`,
                        background: getDotColor(loc.name),
                      }}
                    />
                  </div>
                  {(loc.shortages > 0 || loc.qcHold > 0) && (
                    <div className="flex gap-1.5 mt-1.5">
                      {loc.shortages > 0 && (
                        <span className="text-[10px] font-medium" style={{ color: 'var(--error)' }}>
                          {loc.shortages} short
                        </span>
                      )}
                      {loc.qcHold > 0 && (
                        <span className="text-[10px] font-medium" style={{ color: 'var(--hold)' }}>
                          {loc.qcHold} QC hold
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Right: search + catalog ── */}
        <div className="space-y-3 min-w-0">

          {/* Search + view toggle row */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search item, code, lot number, heat number…"
                className="w-full pl-9 pr-4 py-2 rounded-[var(--radius-sm)] text-sm focus:outline-none"
                style={{
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text)',
                }}
              />
            </div>
            <div className="flex gap-1 p-1 rounded-[var(--radius-sm)]" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <button
                onClick={() => setView('items')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
                style={view === 'items'
                  ? { background: 'var(--surface)', color: 'var(--text)', boxShadow: 'var(--shadow-sm)' }
                  : { color: 'var(--text-2)' }
                }
              >
                <Package size={12} /> Items
              </button>
              <button
                onClick={() => setView('lots')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
                style={view === 'lots'
                  ? { background: 'var(--surface)', color: 'var(--text)', boxShadow: 'var(--shadow-sm)' }
                  : { color: 'var(--text-2)' }
                }
              >
                <Layers size={12} /> Lots
              </button>
            </div>
          </div>

          {/* Items view */}
          {view === 'items' && (
            <div className="space-y-2">
              {filteredItems.length === 0 && (
                <div className="eoss-card py-12 text-center text-sm" style={{ color: 'var(--text-3)' }}>
                  No items found
                </div>
              )}
              {filteredItems.map(item => {
                const isExpanded = expandedItems.has(item.id);
                const itemLots = lots.filter(l => l.materialName === item.materialName);
                const availPct = item.onHandQty > 0 ? Math.round((item.availableQty / item.onHandQty) * 100) : 0;

                return (
                  <div
                    key={item.id}
                    className="eoss-card overflow-hidden transition-all"
                    style={item.shortage ? { borderColor: 'var(--error-border)' } : {}}
                  >
                    {/* Item header row */}
                    <div className="flex items-center gap-3 px-4 py-3">
                      {/* Location color dot */}
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ background: getDotColor(item.locationName) }}
                      />

                      {/* Name + code */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {item.shortage && <AlertTriangle size={12} style={{ color: 'var(--error)', flexShrink: 0 }} />}
                          <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{item.materialName}</span>
                          <span className="font-mono text-[11px]" style={{ color: 'var(--text-3)' }}>{item.materialCode}</span>
                          {item.shortage && (
                            <span className="pill" style={{ background: 'var(--error-bg)', borderColor: 'var(--error-border)', color: 'var(--error)' }}>
                              Shortage
                            </span>
                          )}
                          {item.qcHoldQty > 0 && (
                            <span className="pill" style={{ background: 'var(--hold-bg)', borderColor: 'var(--hold-border)', color: 'var(--hold)' }}>
                              QC hold
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-3)' }}>
                          {item.locationName} · {item.categoryName}
                        </div>
                      </div>

                      {/* Qty summary */}
                      <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
                        <div className="text-right">
                          <div
                            className="text-sm font-bold font-mono"
                            style={{ color: item.shortage ? 'var(--error)' : 'var(--text)' }}
                          >
                            {item.availableQty.toLocaleString()}
                          </div>
                          <div className="text-[10px]" style={{ color: 'var(--text-3)' }}>
                            avail / {item.onHandQty.toLocaleString()} {item.primaryUom}
                          </div>
                        </div>

                        {/* Availability bar */}
                        <div className="w-16">
                          <div className="progress-bar" style={{ height: 5 }}>
                            <div
                              className="progress-bar-fill"
                              style={{
                                width: `${availPct}%`,
                                background: item.shortage ? 'var(--error)' : availPct > 70 ? 'var(--success)' : 'var(--warning)',
                              }}
                            />
                          </div>
                          <div className="text-[10px] text-right mt-0.5" style={{ color: 'var(--text-3)' }}>
                            {availPct}%
                          </div>
                        </div>
                      </div>

                      {/* Lot badge */}
                      {itemLots.length > 0 && (
                        <span
                          className="text-[11px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: 'var(--brand-50)', color: 'var(--brand)', border: '1px solid var(--brand-muted)' }}
                        >
                          {itemLots.length} lot{itemLots.length !== 1 ? 's' : ''}
                        </span>
                      )}

                      {/* Expand + navigate */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {itemLots.length > 0 && (
                          <button
                            onClick={() => toggleExpand(item.id)}
                            className="p-1.5 rounded-md transition-colors"
                            style={{ color: 'var(--text-3)' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}
                          >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/inventory/lot/${itemLots[0]?.id ?? ''}`)}
                          className="p-1.5 rounded-md transition-colors"
                          style={{ color: 'var(--text-3)' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}
                        >
                          <ArrowUpRight size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Reserved / QC hold / in-transit strip */}
                    {(item.reservedQty > 0 || item.qcHoldQty > 0 || item.inTransitQty > 0) && (
                      <div
                        className="flex gap-4 px-4 py-2 text-[11px]"
                        style={{ borderTop: '1px solid var(--border)', background: 'var(--surface-2)' }}
                      >
                        {item.reservedQty > 0 && (
                          <span style={{ color: 'var(--warning)' }}>
                            {item.reservedQty} {item.primaryUom} reserved
                          </span>
                        )}
                        {item.qcHoldQty > 0 && (
                          <span style={{ color: 'var(--hold)' }}>
                            {item.qcHoldQty} {item.primaryUom} QC hold
                          </span>
                        )}
                        {item.inTransitQty > 0 && (
                          <span style={{ color: 'var(--info)' }}>
                            {item.inTransitQty} {item.primaryUom} in transit
                          </span>
                        )}
                      </div>
                    )}

                    {/* Inline lots expansion */}
                    {isExpanded && itemLots.length > 0 && (
                      <div style={{ borderTop: '1px solid var(--border)' }}>
                        <div
                          className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider"
                          style={{ background: 'var(--surface-2)', color: 'var(--text-3)' }}
                        >
                          Lots
                        </div>
                        {itemLots.map((lot, idx) => (
                          <button
                            key={lot.id}
                            onClick={() => navigate(`/inventory/lot/${lot.id}`)}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors"
                            style={{
                              borderTop: idx > 0 ? '1px solid var(--border)' : undefined,
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}
                          >
                            <span className="font-mono text-xs font-semibold" style={{ color: 'var(--brand)' }}>
                              {lot.lotNumber}
                            </span>
                            {lot.heatNumber && (
                              <span className="font-mono text-[11px]" style={{ color: 'var(--text-3)' }}>
                                HT: {lot.heatNumber}
                              </span>
                            )}
                            <span className="text-[11px]" style={{ color: 'var(--text-2)' }}>
                              {lot.storeLocationName}
                            </span>
                            <span className="ml-auto font-mono text-xs font-semibold" style={{ color: 'var(--text)' }}>
                              {lot.primaryQty.toLocaleString()} {lot.primaryUom}
                            </span>
                            <StatusChip status={lot.status} size="sm" />
                            <span
                              className="pill text-[10px]"
                              style={
                                lot.certStatus === 'verified'
                                  ? { background: 'var(--success-bg)', borderColor: 'var(--success-border)', color: 'var(--success)' }
                                  : lot.certStatus === 'pending'
                                  ? { background: 'var(--warning-bg)', borderColor: 'var(--warning-border)', color: 'var(--warning)' }
                                  : { background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-3)' }
                              }
                            >
                              {lot.certStatus === 'verified' ? 'Cert ✓' : lot.certStatus === 'pending' ? 'Cert pending' : 'No cert'}
                            </span>
                            <ChevronRight size={12} style={{ color: 'var(--text-3)' }} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Lots view */}
          {view === 'lots' && (
            <div className="eoss-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="eoss-table">
                  <thead>
                    <tr>
                      <th>Lot Number</th>
                      <th>Heat #</th>
                      <th>Material</th>
                      <th>Supplier</th>
                      <th>Location</th>
                      <th className="text-right">Qty</th>
                      <th>UOM</th>
                      <th>Grade</th>
                      <th>Status</th>
                      <th>Cert</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLots.map(l => (
                      <tr key={l.id} className="cursor-pointer" onClick={() => navigate(`/inventory/lot/${l.id}`)}>
                        <td>
                          <span className="font-mono text-xs font-semibold" style={{ color: 'var(--brand)' }}>{l.lotNumber}</span>
                        </td>
                        <td>
                          <span className="font-mono text-xs" style={{ color: 'var(--text-2)' }}>{l.heatNumber ?? '—'}</span>
                        </td>
                        <td className="text-sm" style={{ color: 'var(--text)' }}>{l.materialName}</td>
                        <td className="text-sm" style={{ color: 'var(--text-2)' }}>{l.supplierName}</td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: getDotColor(l.storeLocationName) }} />
                            <span className="text-xs" style={{ color: 'var(--text-2)' }}>{l.storeLocationName}</span>
                          </div>
                        </td>
                        <td className="text-right">
                          <span className="font-mono text-sm font-semibold" style={{ color: 'var(--text)' }}>
                            {l.primaryQty.toLocaleString()}
                          </span>
                        </td>
                        <td className="text-xs" style={{ color: 'var(--text-2)' }}>{l.primaryUom}</td>
                        <td className="text-xs" style={{ color: 'var(--text-2)' }}>{l.grade ?? '—'}</td>
                        <td><StatusChip status={l.status} size="sm" /></td>
                        <td>
                          <span
                            className="pill text-[10px]"
                            style={
                              l.certStatus === 'verified'
                                ? { background: 'var(--success-bg)', borderColor: 'var(--success-border)', color: 'var(--success)' }
                                : l.certStatus === 'pending'
                                ? { background: 'var(--warning-bg)', borderColor: 'var(--warning-border)', color: 'var(--warning)' }
                                : { background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-3)' }
                            }
                          >
                            {l.certStatus === 'verified' ? 'Verified' : l.certStatus === 'pending' ? 'Pending' : 'None'}
                          </span>
                        </td>
                        <td><ChevronRight size={13} style={{ color: 'var(--text-3)' }} /></td>
                      </tr>
                    ))}
                    {filteredLots.length === 0 && (
                      <tr><td colSpan={11} className="text-center py-10 text-sm" style={{ color: 'var(--text-3)' }}>No lots found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
