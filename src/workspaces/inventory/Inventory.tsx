import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, AlertTriangle, ChevronRight, ArrowRightLeft, Package, Layers } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';
import clsx from 'clsx';

const LOC_COLOR: Record<string, { dot: string; track: string }> = {
  'Raw Material Store':    { dot: '#1849A9', track: '#DBEAFE' },
  'WIP Store':             { dot: '#B45309', track: '#FDE68A' },
  'Finished Goods Store':  { dot: '#15803D', track: '#BBF7D0' },
  'Quarantine Store':      { dot: '#B91C1C', track: '#FECACA' },
  'Spare Parts Store':     { dot: '#6D28D9', track: '#DDD6FE' },
  'Scrap Yard':            { dot: '#6B7280', track: '#E5E7EB' },
  'Bonded Store':          { dot: '#0369A1', track: '#BAE6FD' },
  'Tool Crib':             { dot: '#C2410C', track: '#FED7AA' },
};

function getDotColor(name: string) {
  return LOC_COLOR[name]?.dot ?? '#94A3B8';
}
function getTrackColor(name: string) {
  return LOC_COLOR[name]?.track ?? '#E2E8F0';
}

export default function Inventory() {
  const { inventory, lots, currentUser } = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [view, setView] = useState<'items' | 'lots'>('items');

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
  const totalValue    = inventory.reduce((s, i) => s + i.onHandQty, 0);

  const canTransfer = ['owner', 'storekeeper'].includes(currentUser.role);

  // Location utilization data
  const locationStats = useMemo(() => {
    const map: Record<string, { name: string; items: number; onHand: number; shortages: number }> = {};
    inventory.forEach(i => {
      if (!map[i.locationName]) map[i.locationName] = { name: i.locationName, items: 0, onHand: 0, shortages: 0 };
      map[i.locationName].items++;
      map[i.locationName].onHand += i.onHandQty;
      if (i.shortage) map[i.locationName].shortages++;
    });
    return Object.values(map).sort((a, b) => b.onHand - a.onHand);
  }, [inventory]);

  const maxOnHand = Math.max(...locationStats.map(l => l.onHand), 1);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>Inventory</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-2)' }}>
            {inventory.length} items across {locations.length - 1} locations
            {shortageCount > 0 && (
              <span className="ml-2 font-semibold" style={{ color: 'var(--error)' }}>
                · {shortageCount} shortage{shortageCount > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {canTransfer && (
            <button className="btn-ghost">
              <ArrowRightLeft size={14} /> Transfer
            </button>
          )}
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Items" value={inventory.length} sub="across all locations" color="var(--text)" />
        <KpiCard label="Stock Shortages" value={shortageCount} sub="below reorder point"
          color={shortageCount > 0 ? 'var(--error)' : 'var(--success)'}
          alert={shortageCount > 0}
        />
        <KpiCard label="QC Hold" value={qcHoldCount} sub="units held for inspection"
          color={qcHoldCount > 0 ? 'var(--hold)' : 'var(--text-3)'}
        />
        <KpiCard label="Total Lots" value={lots.length} sub="active material lots" color="var(--brand)" />
      </div>

      {/* Location utilization panel */}
      <div className="eoss-card overflow-hidden">
        <div className="eoss-card-header">
          <div className="flex items-center gap-2">
            <Package size={14} style={{ color: 'var(--text-2)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Location Breakdown</span>
          </div>
          <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>By on-hand quantity</span>
        </div>
        <div className="p-4 grid gap-3">
          {locationStats.map(loc => (
            <button
              key={loc.name}
              onClick={() => { setView('items'); setLocationFilter(loc.name); }}
              className="flex items-center gap-3 w-full text-left group"
              title={`Filter to ${loc.name}`}
            >
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0 ring-2"
                style={{ background: getDotColor(loc.name), ringColor: getTrackColor(loc.name) }}
              />
              <div className="w-36 text-xs font-medium truncate flex-shrink-0" style={{ color: 'var(--text-2)' }}>
                {loc.name}
              </div>
              <div className="flex-1 relative h-2 rounded-full" style={{ background: 'var(--surface-3)' }}>
                <div
                  className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(loc.onHand / maxOnHand) * 100}%`,
                    background: getDotColor(loc.name),
                    opacity: 0.75,
                  }}
                />
              </div>
              <div className="w-14 text-right font-mono text-[11px] flex-shrink-0" style={{ color: 'var(--text-2)' }}>
                {loc.onHand.toLocaleString()}
              </div>
              <div className="w-12 text-right flex-shrink-0">
                <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>{loc.items} items</span>
              </div>
              {loc.shortages > 0 && (
                <div className="flex-shrink-0">
                  <span className="pill text-[10px]" style={{ background: 'var(--error-bg)', borderColor: 'var(--error-border)', color: 'var(--error)' }}>
                    {loc.shortages} short
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Search + view toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search item, code, lot number, heat number…"
            className="w-full pl-9 pr-4 py-2 rounded-[var(--radius-sm)] text-sm focus:outline-none focus:ring-1"
            style={{
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text)',
              focusRingColor: 'var(--brand)',
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

      {view === 'items' && (
        <>
          {/* Location filter chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {locations.map(l => (
              <button
                key={l}
                onClick={() => setLocationFilter(l)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] text-xs whitespace-nowrap font-medium transition-all flex-shrink-0"
                style={locationFilter === l
                  ? { background: 'var(--brand)', color: 'white' }
                  : { background: 'var(--surface)', color: 'var(--text-2)', border: '1px solid var(--border)' }
                }
              >
                {l !== 'all' && (
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: getDotColor(l) }} />
                )}
                {l === 'all' ? 'All Locations' : l}
              </button>
            ))}
          </div>

          <div className="eoss-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="eoss-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Material</th>
                    <th>Location</th>
                    <th className="text-right">On Hand</th>
                    <th className="text-right">Available</th>
                    <th className="text-right">Reserved</th>
                    <th className="text-right">QC Hold</th>
                    <th className="text-right">In Transit</th>
                    <th>UOM</th>
                    <th className="text-right">Lots</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map(i => (
                    <tr key={i.id} style={i.shortage ? { background: 'var(--error-bg)' } : {}}>
                      <td>
                        <span className="font-mono text-xs" style={{ color: 'var(--text-3)' }}>{i.materialCode}</span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          {i.shortage && <AlertTriangle size={11} style={{ color: 'var(--error)', flexShrink: 0 }} />}
                          <div>
                            <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>{i.materialName}</div>
                            <div className="text-[11px]" style={{ color: 'var(--text-3)' }}>{i.categoryName}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ background: getDotColor(i.locationName) }}
                          />
                          <span className="text-xs" style={{ color: 'var(--text-2)' }}>{i.locationName}</span>
                        </div>
                      </td>
                      <td className="text-right">
                        <span className="font-mono text-sm font-semibold" style={{ color: 'var(--text)' }}>
                          {i.onHandQty.toLocaleString()}
                        </span>
                      </td>
                      <td className="text-right">
                        <div>
                          <span
                            className="font-mono text-sm font-semibold"
                            style={{ color: i.shortage ? 'var(--error)' : 'var(--success)' }}
                          >
                            {i.availableQty.toLocaleString()}
                          </span>
                          {i.onHandQty > 0 && (
                            <div className="mt-1 progress-bar w-16 ml-auto">
                              <div
                                className="progress-bar-fill"
                                style={{
                                  width: `${Math.min(100, (i.availableQty / i.onHandQty) * 100)}%`,
                                  background: i.shortage ? 'var(--error)' : 'var(--success)',
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="text-right font-mono text-sm" style={{ color: 'var(--warning)' }}>
                        {i.reservedQty > 0 ? i.reservedQty.toLocaleString() : <span style={{ color: 'var(--text-4)' }}>—</span>}
                      </td>
                      <td className="text-right font-mono text-sm" style={{ color: 'var(--hold)' }}>
                        {i.qcHoldQty > 0 ? i.qcHoldQty.toLocaleString() : <span style={{ color: 'var(--text-4)' }}>—</span>}
                      </td>
                      <td className="text-right font-mono text-sm" style={{ color: 'var(--info)' }}>
                        {i.inTransitQty > 0 ? i.inTransitQty.toLocaleString() : <span style={{ color: 'var(--text-4)' }}>—</span>}
                      </td>
                      <td className="text-xs" style={{ color: 'var(--text-2)' }}>
                        {i.primaryUom}
                        {i.secondaryUom && <div className="text-[10px]" style={{ color: 'var(--text-3)' }}>/{i.secondaryUom}</div>}
                      </td>
                      <td className="text-right">
                        <span className="text-xs font-mono" style={{ color: 'var(--text-2)' }}>{i.lotCount}</span>
                      </td>
                      <td><ChevronRight size={13} style={{ color: 'var(--text-3)' }} /></td>
                    </tr>
                  ))}
                  {filteredItems.length === 0 && (
                    <tr><td colSpan={11} className="text-center py-10 text-sm" style={{ color: 'var(--text-3)' }}>No items found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

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
  );
}

function KpiCard({ label, value, sub, color, alert }: {
  label: string; value: number; sub: string; color: string; alert?: boolean;
}) {
  return (
    <div
      className="eoss-card p-4"
      style={alert ? { borderColor: 'var(--error-border)' } : {}}
    >
      <div
        className="text-2xl font-bold font-mono leading-none"
        style={{ color }}
      >
        {value}
      </div>
      <div className="text-xs font-semibold mt-1.5" style={{ color: 'var(--text)' }}>{label}</div>
      <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-3)' }}>{sub}</div>
    </div>
  );
}
