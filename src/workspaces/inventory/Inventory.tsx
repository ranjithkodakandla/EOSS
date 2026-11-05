import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRightLeft, ArrowUpDown, ArrowUp, ArrowDown, ShieldAlert } from 'lucide-react';
import { useStore } from '../../store';
import { STORE_LOCATIONS } from '../../data/seed';
import StatusChip from '../../components/layout/StatusChip';
import clsx from 'clsx';

type SortKey = 'materialCode' | 'materialName' | 'locationName' | 'onHandQty' | 'reservedQty' | 'qcHoldQty' | 'inTransitQty' | 'availableQty' | 'reorderPoint';
type SortDir = 'asc' | 'desc';

export default function Inventory() {
  const { inventory, lots, currentUser } = useStore();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('materialCode');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const shortageCount = inventory.filter(i => i.shortage).length;
  const shortageValue = inventory.filter(i => i.shortage).length;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return inventory
      .filter(i => {
        const matchLoc = selectedLocation === 'all' || i.locationName === selectedLocation;
        const matchSearch = !q || i.materialCode.toLowerCase().includes(q) || i.materialName.toLowerCase().includes(q) || i.categoryName.toLowerCase().includes(q) || i.locationName.toLowerCase().includes(q);
        return matchLoc && matchSearch;
      })
      .sort((a, b) => {
        let av: string | number = a[sortKey] ?? '';
        let bv: string | number = b[sortKey] ?? '';
        if (typeof av === 'string') av = av.toLowerCase();
        if (typeof bv === 'string') bv = bv.toLowerCase();
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return sortDir === 'asc' ? cmp : -cmp;
      });
  }, [inventory, search, selectedLocation, sortKey, sortDir]);

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ArrowUpDown size={12} className="opacity-40" />;
    return sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div
        className="flex-shrink-0 flex items-center gap-3 px-5 py-3 border-b flex-wrap"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
          <input
            type="text"
            placeholder="Search material, code, location…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border outline-none"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text)' }}
          />
        </div>

        {/* Location filter chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setSelectedLocation('all')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
            style={{
              background: selectedLocation === 'all' ? 'var(--brand)' : 'var(--surface)',
              color: selectedLocation === 'all' ? '#fff' : 'var(--text-2)',
              borderColor: selectedLocation === 'all' ? 'var(--brand)' : 'var(--border)',
            }}
          >
            All Stores
          </button>
          {STORE_LOCATIONS.map(loc => (
            <button
              key={loc.id}
              onClick={() => setSelectedLocation(loc.name)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap"
              style={{
                background: selectedLocation === loc.name ? 'var(--brand)' : 'var(--surface)',
                color: selectedLocation === loc.name ? '#fff' : 'var(--text-2)',
                borderColor: selectedLocation === loc.name ? 'var(--brand)' : 'var(--border)',
              }}
            >
              {loc.code}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Summary badges */}
        {shortageCount > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: 'var(--error-bg,#FEF2F2)', color: 'var(--error,#DC2626)' }}>
            <ShieldAlert size={13} />
            {shortageCount} shortage{shortageCount !== 1 ? 's' : ''}
          </div>
        )}

        {currentUser.role !== 'operator' && (
          <button
            onClick={() => navigate('/inventory/transfer')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
            style={{ background: 'var(--brand)' }}
          >
            <ArrowRightLeft size={13} /> Transfer
          </button>
        )}
      </div>

      {/* Store tiles summary row */}
      <div
        className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 overflow-x-auto scrollbar-none border-b"
        style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
      >
        {STORE_LOCATIONS.map(loc => {
          const items = inventory.filter(i => i.locationName === loc.name);
          const hasShortage = items.some(i => i.shortage);
          const isSelected = selectedLocation === loc.name;
          return (
            <button
              key={loc.id}
              onClick={() => setSelectedLocation(isSelected ? 'all' : loc.name)}
              className="flex-shrink-0 flex flex-col items-start px-3 py-2 rounded-xl border text-left transition-all hover:opacity-90"
              style={{
                minWidth: 110,
                borderColor: isSelected ? 'var(--brand)' : 'var(--border)',
                background: isSelected ? 'rgba(var(--brand-rgb,112,72,245),0.07)' : 'var(--surface)',
                boxShadow: isSelected ? '0 0 0 1.5px var(--brand)' : undefined,
              }}
            >
              <div className="flex items-center justify-between w-full gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: isSelected ? 'var(--brand)' : 'var(--text-3)' }}>
                  {loc.code}
                </span>
                {hasShortage && <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />}
              </div>
              <span className="text-xs font-semibold mt-0.5 leading-tight" style={{ color: 'var(--text)' }}>
                {items.length} items
              </span>
              <span className="text-[10px] mt-0.5 leading-tight truncate w-full" style={{ color: 'var(--text-3)', maxWidth: 100 }}>
                {loc.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm border-separate border-spacing-0" style={{ minWidth: 900 }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
            <tr style={{ background: 'var(--surface-2)', borderBottom: '2px solid var(--border)' }}>
              {([
                ['materialCode', 'Code'],
                ['materialName', 'Material / Specification'],
                ['locationName', 'Location'],
                ['onHandQty', 'On Hand'],
                ['reservedQty', 'Reserved'],
                ['qcHoldQty', 'QC Hold'],
                ['inTransitQty', 'In Transit'],
                ['availableQty', 'Available'],
                ['reorderPoint', 'Reorder Pt'],
                [null, 'Status'],
              ] as [SortKey | null, string][]).map(([key, label]) => (
                <th
                  key={label}
                  onClick={key ? () => handleSort(key) : undefined}
                  className={clsx('px-4 py-3 text-left text-xs font-semibold font-medium', key ? 'cursor-pointer select-none hover:opacity-70' : '')}
                  style={{ color: 'var(--text-3)', borderBottom: '1px solid var(--border)' }}
                >
                  <span className="flex items-center gap-1">
                    {label}
                    {key && <SortIcon k={key} />}
                  </span>
                </th>
              ))}
              <th className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }} />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-10 text-center text-sm" style={{ color: 'var(--text-3)' }}>
                  No inventory items match your filter.
                </td>
              </tr>
            ) : (
              filtered.map((item, idx) => {
                const isLow = item.shortage || item.availableQty <= item.reorderPoint * 0.5;
                return (
                  <tr
                    key={item.id}
                    className="cursor-pointer"
                    style={{
                      background: idx % 2 === 0 ? 'var(--surface)' : 'var(--surface-2)',
                      borderBottom: '1px solid var(--border)',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(var(--brand-rgb,112,72,245),0.04)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = idx % 2 === 0 ? 'var(--surface)' : 'var(--surface-2)'; }}
                    onClick={() => {
                      const firstLot = lots.find(l => l.materialItemId === item.materialItemId);
                      if (firstLot) navigate(`/inventory/lot/${firstLot.id}`);
                    }}
                  >
                    <td className="px-4 py-3 font-mono text-xs font-bold whitespace-nowrap" style={{ color: 'var(--brand)' }}>
                      {item.materialCode}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>{item.materialName}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{item.categoryName}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-md border" style={{ borderColor: 'var(--border)', color: 'var(--text-2)', background: 'var(--surface)' }}>
                        {item.locationName}
                      </span>
                    </td>
                    <QtyCell qty={item.onHandQty} uom={item.primaryUom} />
                    <QtyCell qty={item.reservedQty} uom={item.primaryUom} dim />
                    <QtyCell qty={item.qcHoldQty} uom={item.primaryUom} warn={item.qcHoldQty > 0} dim />
                    <QtyCell qty={item.inTransitQty} uom={item.primaryUom} dim />
                    <QtyCell qty={item.availableQty} uom={item.primaryUom} emphasis low={item.shortage} />
                    <QtyCell qty={item.reorderPoint} uom={item.primaryUom} dim />
                    <td className="px-4 py-3">
                      {item.shortage ? (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--error-bg,#FEF2F2)', color: 'var(--error,#DC2626)' }}>Shortage</span>
                      ) : isLow ? (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--warning-bg,#FFFBEB)', color: 'var(--warning,#D97706)' }}>Low</span>
                      ) : (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--success-bg,#F0FDF4)', color: 'var(--success,#16A34A)' }}>OK</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.lotCount > 0 && (
                          <span className="text-xs" style={{ color: 'var(--text-3)' }}>{item.lotCount} lot{item.lotCount !== 1 ? 's' : ''}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer summary */}
      <div
        className="flex-shrink-0 flex items-center gap-6 px-5 py-2 border-t text-xs"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text-3)' }}
      >
        <span>{filtered.length} of {inventory.length} items</span>
        <span>·</span>
        <span>{STORE_LOCATIONS.length} store locations</span>
        {shortageCount > 0 && (
          <>
            <span>·</span>
            <span style={{ color: 'var(--error,#DC2626)', fontWeight: 600 }}>{shortageCount} shortage{shortageCount !== 1 ? 's' : ''}</span>
          </>
        )}
      </div>
    </div>
  );
}

function QtyCell({ qty, uom, emphasis, dim, low, warn }: {
  qty: number;
  uom: string;
  emphasis?: boolean;
  dim?: boolean;
  low?: boolean;
  warn?: boolean;
}) {
  const color = low ? 'var(--error,#DC2626)' : warn ? 'var(--warning,#D97706)' : emphasis ? 'var(--text)' : 'var(--text-2)';
  return (
    <td className="px-4 py-3 font-mono text-sm tabular-nums" style={{ color }}>
      {qty > 0 ? (
        <span className={clsx(emphasis ? 'font-bold' : '', low ? 'font-bold' : '')}>
          {qty.toLocaleString('en-IN')}
          <span className="text-[10px] ml-1" style={{ color: 'var(--text-3)' }}>{uom}</span>
        </span>
      ) : (
        <span style={{ color: 'var(--text-4,#C1C4CC)' }}>—</span>
      )}
    </td>
  );
}
