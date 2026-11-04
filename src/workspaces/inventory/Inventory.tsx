import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, AlertTriangle, Package, ChevronRight, ArrowRightLeft } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';
import clsx from 'clsx';

const LOCATION_COLORS: Record<string, string> = {
  'Raw Material Store': 'bg-blue-50 text-blue-700 border-blue-200',
  'WIP Store': 'bg-amber-50 text-amber-700 border-amber-200',
  'Finished Goods Store': 'bg-green-50 text-green-700 border-green-200',
  'Quarantine Store': 'bg-red-50 text-red-700 border-red-200',
  'Spare Parts Store': 'bg-purple-50 text-purple-700 border-purple-200',
};

export default function Inventory() {
  const { inventory, lots, currentUser } = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [view, setView] = useState<'items' | 'lots'>('items');

  const locations = ['all', ...Array.from(new Set(inventory.map(i => i.locationName)))];

  const filteredItems = inventory.filter(i => {
    const ms = !search || i.materialName.toLowerCase().includes(search.toLowerCase()) ||
      i.materialCode.toLowerCase().includes(search.toLowerCase());
    const ml = locationFilter === 'all' || i.locationName === locationFilter;
    return ms && ml;
  });

  const filteredLots = lots.filter(l => {
    return !search || l.lotNumber.toLowerCase().includes(search.toLowerCase()) ||
      l.materialName.toLowerCase().includes(search.toLowerCase()) ||
      (l.heatNumber?.toLowerCase().includes(search.toLowerCase()) ?? false);
  });

  const shortageCount = inventory.filter(i => i.shortage).length;
  const qcHoldCount = inventory.filter(i => i.qcHoldQty > 0).length;

  const canTransfer = ['owner', 'storekeeper'].includes(currentUser.role);

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-[var(--text)]">Inventory</h1>
          <div className="flex items-center gap-3 mt-0.5">
            <p className="text-sm text-[var(--text-2)]">{inventory.length} items across {locations.length - 1} locations</p>
            {shortageCount > 0 && (
              <span className="flex items-center gap-1 text-xs text-[var(--error)] font-semibold">
                <AlertTriangle size={12} /> {shortageCount} shortages
              </span>
            )}
            {qcHoldCount > 0 && (
              <span className="text-xs text-[var(--hold)] font-semibold">{qcHoldCount} QC hold</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {canTransfer && (
            <button className="flex items-center gap-2 px-3 py-2 border border-[var(--border)] rounded-lg text-sm text-[var(--text-2)] hover:bg-[var(--surface-2)]">
              <ArrowRightLeft size={14} /> Transfer
            </button>
          )}
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <KpiTile label="Total Items" value={inventory.length} />
        <KpiTile label="Shortages" value={shortageCount} accent={shortageCount > 0 ? 'error' : 'neutral'} />
        <KpiTile label="QC Hold" value={qcHoldCount} accent={qcHoldCount > 0 ? 'warning' : 'neutral'} />
        <KpiTile label="Total Lots" value={lots.length} />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search item, code, lot number, heat number…"
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] placeholder:text-[var(--text-3)] focus:outline-none focus:border-[var(--brand)]"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView('items')} className={clsx('px-3 py-2 rounded-lg text-sm transition-colors', view === 'items' ? 'bg-[var(--brand)] text-white' : 'border border-[var(--border)] text-[var(--text-2)]')}>Items</button>
          <button onClick={() => setView('lots')} className={clsx('px-3 py-2 rounded-lg text-sm transition-colors', view === 'lots' ? 'bg-[var(--brand)] text-white' : 'border border-[var(--border)] text-[var(--text-2)]')}>Lots</button>
        </div>
      </div>

      {view === 'items' && (
        <>
          {/* Location filter */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {locations.map(l => (
              <button key={l} onClick={() => setLocationFilter(l)} className={clsx('px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors', locationFilter === l ? 'bg-[var(--brand)] text-white' : 'border border-[var(--border)] text-[var(--text-2)] hover:bg-[var(--surface-2)]')}>
                {l === 'all' ? 'All Locations' : l}
              </button>
            ))}
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="eoss-table">
                <thead>
                  <tr>
                    <th>Item Code</th>
                    <th>Material</th>
                    <th>Location</th>
                    <th>On Hand</th>
                    <th>Available</th>
                    <th>Reserved</th>
                    <th>QC Hold</th>
                    <th>In Transit</th>
                    <th>UOM</th>
                    <th>Lots</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map(i => (
                    <tr key={i.id} className={i.shortage ? 'bg-[var(--error-bg)]' : ''}>
                      <td><span className="font-mono text-xs text-[var(--text-2)]">{i.materialCode}</span></td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          {i.shortage && <AlertTriangle size={12} className="text-[var(--error)] flex-shrink-0" />}
                          <span className="text-sm font-medium text-[var(--text)]">{i.materialName}</span>
                        </div>
                        <div className="text-[11px] text-[var(--text-3)]">{i.categoryName}</div>
                      </td>
                      <td>
                        <span className={clsx('text-xs px-2 py-0.5 rounded border', LOCATION_COLORS[i.locationName] ?? 'bg-[var(--surface-2)] text-[var(--text-2)] border-[var(--border)]')}>
                          {i.locationName}
                        </span>
                      </td>
                      <td className="font-mono text-sm font-semibold text-[var(--text)]">{i.onHandQty.toLocaleString()}</td>
                      <td className={clsx('font-mono text-sm font-semibold', i.shortage ? 'text-[var(--error)]' : 'text-[var(--success)]')}>{i.availableQty.toLocaleString()}</td>
                      <td className="font-mono text-sm text-[var(--warning)]">{i.reservedQty > 0 ? i.reservedQty.toLocaleString() : '—'}</td>
                      <td className="font-mono text-sm text-[var(--hold)]">{i.qcHoldQty > 0 ? i.qcHoldQty.toLocaleString() : '—'}</td>
                      <td className="font-mono text-sm text-[var(--info)]">{i.inTransitQty > 0 ? i.inTransitQty.toLocaleString() : '—'}</td>
                      <td className="text-xs text-[var(--text-2)]">
                        {i.primaryUom}
                        {i.secondaryUom && <div className="text-[11px] text-[var(--text-3)]">/{i.secondaryUom}</div>}
                      </td>
                      <td className="text-sm text-[var(--text-2)]">{i.lotCount}</td>
                      <td><ChevronRight size={14} className="text-[var(--text-3)]" /></td>
                    </tr>
                  ))}
                  {filteredItems.length === 0 && (
                    <tr><td colSpan={11} className="text-center py-10 text-sm text-[var(--text-3)]">No items found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {view === 'lots' && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="eoss-table">
              <thead>
                <tr>
                  <th>Lot Number</th>
                  <th>Heat #</th>
                  <th>Material</th>
                  <th>Supplier</th>
                  <th>Location</th>
                  <th>Qty</th>
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
                    <td><span className="font-mono text-xs font-semibold text-[var(--brand)]">{l.lotNumber}</span></td>
                    <td><span className="font-mono text-xs text-[var(--text-2)]">{l.heatNumber ?? '—'}</span></td>
                    <td className="text-sm text-[var(--text)]">{l.materialName}</td>
                    <td className="text-sm text-[var(--text-2)]">{l.supplierName}</td>
                    <td className="text-sm text-[var(--text-2)]">{l.storeLocationName}</td>
                    <td className="font-mono text-sm font-semibold text-[var(--text)]">{l.primaryQty.toLocaleString()}</td>
                    <td className="text-xs text-[var(--text-2)]">{l.primaryUom}</td>
                    <td className="text-xs text-[var(--text-2)]">{l.grade ?? '—'}</td>
                    <td><StatusChip status={l.status} size="sm" /></td>
                    <td>
                      <span className={clsx('text-xs font-medium',
                        l.certStatus === 'verified' ? 'text-[var(--success)]' :
                        l.certStatus === 'pending' ? 'text-[var(--warning)]' : 'text-[var(--text-3)]'
                      )}>
                        {l.certStatus === 'verified' ? '✓' : l.certStatus === 'pending' ? '⏳' : '—'}
                      </span>
                    </td>
                    <td><ChevronRight size={14} className="text-[var(--text-3)]" /></td>
                  </tr>
                ))}
                {filteredLots.length === 0 && (
                  <tr><td colSpan={11} className="text-center py-10 text-sm text-[var(--text-3)]">No lots found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function KpiTile({ label, value, accent = 'neutral' }: { label: string; value: number; accent?: 'error' | 'warning' | 'neutral' }) {
  const color = { error: 'var(--error)', warning: 'var(--warning)', neutral: 'var(--text)' }[accent];
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3">
      <div className="text-xl font-bold" style={{ color }}>{value}</div>
      <div className="text-xs text-[var(--text-2)] mt-0.5">{label}</div>
    </div>
  );
}
