import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, ArrowRightLeft, Package, ChevronDown, ChevronUp,
  FileCheck, ArrowRight, ShieldAlert, X
} from 'lucide-react';
import { useStore } from '../../store';
import { MATERIALS } from '../../data/seed';
import StatusChip from '../../components/layout/StatusChip';
import clsx from 'clsx';

export default function Inventory() {
  const { inventory, lots, currentUser, transferLot, showToast } = useStore();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'table' | 'lots'>('list');
  const [expandedMaterial, setExpandedMaterial] = useState<string | null>(null);

  // Transfer Modal State
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferLotId, setTransferLotId] = useState<string>(lots[0]?.id || '');
  const [targetLocation, setTargetLocation] = useState('WIP Store');

  // Multi-UOM Safe Aggregations (Never aggregate incompatible units)
  const structuralTotalKg = inventory.filter(i => i.materialCode.startsWith('MS-')).reduce((sum, i) => sum + i.onHandQty, 0);
  const stainlessTotalKg  = inventory.filter(i => i.materialCode.startsWith('SS-')).reduce((sum, i) => sum + i.onHandQty, 0);
  const hardwareTotalPcs  = inventory.filter(i => i.primaryUom === 'pcs').reduce((sum, i) => sum + i.onHandQty, 0);
  const shortageCount     = inventory.filter(i => i.shortage).length;
  const qcHoldCount       = inventory.filter(i => i.qcHoldQty > 0).length;

  // Filtered Inventory
  const filteredItems = useMemo(() => {
    return inventory.filter(item => {
      const matchSearch = !search ||
        item.materialName.toLowerCase().includes(search.toLowerCase()) ||
        item.materialCode.toLowerCase().includes(search.toLowerCase());
      const matchLocation = selectedLocation === 'all' || item.locationName === selectedLocation;
      return matchSearch && matchLocation;
    });
  }, [inventory, search, selectedLocation]);

  const handleOpenTransferForMaterial = (itemCode: string) => {
    const matchingLot = lots.find(l =>
      l.materialItemId === itemCode ||
      l.materialName.toLowerCase().includes(itemCode.toLowerCase().split('-')[0])
    ) || lots[0];

    if (matchingLot) setTransferLotId(matchingLot.id);
    setTransferModalOpen(true);
  };

  const handleExecuteTransfer = () => {
    const lotToTransfer = lots.find(l => l.id === transferLotId);
    if (!lotToTransfer) return;
    transferLot(transferLotId, targetLocation, currentUser.name);
    setTransferModalOpen(false);
    showToast({
      type: 'success',
      title: 'Stock Transferred',
      body: `Lot ${lotToTransfer.lotNumber} (${lotToTransfer.primaryQty} ${lotToTransfer.primaryUom}) moved to ${targetLocation}.`,
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">

      {/* ── 1. Clean Header with Immediate Actions ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--text)]">
            Inventory & Material Stocks
          </h1>
          <p className="text-sm text-[var(--text-2)] mt-1">
            Real-time stock availability, allocation buffers, and metallurgical certificates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTransferModalOpen(true)}
            className="btn-ghost text-xs py-2 px-3.5 flex items-center gap-1.5"
          >
            <ArrowRightLeft size={13} />
            Transfer Stock
          </button>
          <button
            onClick={() => navigate('/procurement')}
            className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5"
          >
            <Package size={13} />
            Log GRN Receipt
          </button>
        </div>
      </div>

      {/* ── 2. Glance: Multi-UOM Safe Telemetry Strip (Calm & Scannable) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
          <div className="text-xs text-[var(--text-3)] font-medium">MS Heavy Steel</div>
          <div className="text-xl font-bold font-mono text-[var(--text)] mt-1">
            {structuralTotalKg.toLocaleString('en-IN')} <span className="text-xs font-normal text-[var(--text-3)]">kg</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
          <div className="text-xs text-[var(--text-3)] font-medium">Stainless 304L</div>
          <div className="text-xl font-bold font-mono text-[var(--text)] mt-1">
            {stainlessTotalKg} <span className="text-xs font-normal text-[var(--text-3)]">kg</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
          <div className="text-xs text-[var(--text-3)] font-medium">Fasteners & Rods</div>
          <div className="text-xl font-bold font-mono text-[var(--text)] mt-1">
            {hardwareTotalPcs.toLocaleString('en-IN')} <span className="text-xs font-normal text-[var(--text-3)]">pcs</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--error-border)]/60">
          <div className="text-xs text-[var(--error)] font-medium">Shortage Risks</div>
          <div className="text-xl font-bold font-mono text-[var(--error)] mt-1">
            {shortageCount} <span className="text-xs font-normal">items</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--hold-border)]/60">
          <div className="text-xs text-[var(--hold)] font-medium">QC Quarantine</div>
          <div className="text-xl font-bold font-mono text-[var(--hold)] mt-1">
            {qcHoldCount} <span className="text-xs font-normal">lots</span>
          </div>
        </div>
      </div>

      {/* ── 3. Simple Filters & Search ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Stores' },
            { id: 'Raw Material Store', label: 'Raw Materials' },
            { id: 'Quarantine Store', label: 'Quarantine Bay' },
            { id: 'WIP Store', label: 'WIP Shop Floor' },
            { id: 'Spare Parts Store', label: 'Spares' },
          ].map(loc => (
            <button
              key={loc.id}
              onClick={() => setSelectedLocation(loc.id)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
                selectedLocation === loc.id
                  ? 'bg-[var(--surface-3)] text-[var(--text)] font-semibold'
                  : 'text-[var(--text-3)] hover:text-[var(--text)]'
              )}
            >
              {loc.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search material or code..."
              className="w-full pl-9 pr-3 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-xs text-[var(--text)] placeholder-[var(--text-3)] focus:outline-none focus:border-[var(--cyan-border)]"
            />
          </div>

          <div className="flex items-center rounded-lg bg-[var(--surface)] p-0.5 border border-[var(--border)]">
            <button
              onClick={() => setViewMode('list')}
              className={clsx('px-2.5 py-1 rounded text-xs font-medium', viewMode === 'list' ? 'bg-[var(--surface-2)] text-[var(--text)] font-bold' : 'text-[var(--text-3)]')}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={clsx('px-2.5 py-1 rounded text-xs font-medium', viewMode === 'table' ? 'bg-[var(--surface-2)] text-[var(--text)] font-bold' : 'text-[var(--text-3)]')}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* ── 4. Clean Material List (Progressive Disclosure) ── */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {filteredItems.map(item => {
            const seedMaterial = MATERIALS.find(m => m.itemCode === item.materialCode);
            const itemLots = lots.filter(l =>
              l.materialItemId === item.materialItemId ||
              l.materialName.toLowerCase().includes(item.materialName.toLowerCase().split(' ')[0])
            );
            const isExpanded = expandedMaterial === item.materialCode;
            const isShortage = item.shortage;
            const isQcHold = item.qcHoldQty > 0;

            const totalStock = item.onHandQty + (item.inTransitQty || 0);
            const availPct = totalStock > 0 ? (item.availableQty / totalStock) * 100 : 0;
            const resPct   = totalStock > 0 ? (item.reservedQty / totalStock) * 100 : 0;

            return (
              <div
                key={item.id}
                className={clsx(
                  'rounded-xl border bg-[var(--surface)] transition-all overflow-hidden',
                  isShortage ? 'border-[var(--error-border)]/70' :
                  isQcHold ? 'border-[var(--hold-border)]/70' :
                  'border-[var(--border)] hover:border-[var(--border-strong)]'
                )}
              >
                {/* Clean, readable top row */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[var(--cyan-bright)]">
                        {item.materialCode}
                      </span>
                      <span className="text-xs text-[var(--text-3)]">·</span>
                      <span className="text-xs text-[var(--text-2)]">{item.locationName}</span>
                      {seedMaterial?.standardGrade && (
                        <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-[var(--surface-2)] text-[var(--text-3)]">
                          {seedMaterial.standardGrade}
                        </span>
                      )}
                    </div>
                    <div className="text-base font-bold text-[var(--text)]">
                      {item.materialName}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6 flex-wrap sm:flex-nowrap">
                    {/* Available Stock */}
                    <div className="text-left sm:text-right">
                      <div className="text-xs text-[var(--text-3)] font-medium">Available</div>
                      <div className="text-lg font-bold font-mono text-[var(--text)]">
                        {item.availableQty.toLocaleString('en-IN')}{' '}
                        <span className="text-xs font-normal text-[var(--text-3)]">{item.primaryUom}</span>
                      </div>
                      {item.secondaryUom && item.secondaryQty && (
                        <div className="text-xs font-mono text-[var(--cyan-bright)]">
                          {item.secondaryQty} {item.secondaryUom}
                        </div>
                      )}
                    </div>

                    {/* Status Pill */}
                    <div>
                      {isShortage ? (
                        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[var(--error-bg)] text-[var(--error)] border border-[var(--error-border)]">
                          Shortage Risk
                        </span>
                      ) : isQcHold ? (
                        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[var(--hold-bg)] text-[var(--hold)] border border-[var(--hold-border)]">
                          QC Hold
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[var(--success-bg)] text-[var(--success)]">
                          Available
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenTransferForMaterial(item.materialCode)}
                        className="btn-ghost text-xs py-1.5 px-3"
                      >
                        Transfer
                      </button>
                      <button
                        onClick={() => setExpandedMaterial(isExpanded ? null : item.materialCode)}
                        className="btn-ghost text-xs py-1.5 px-3 inline-flex items-center gap-1 text-[var(--text-2)] hover:text-[var(--text)]"
                      >
                        <span>{isExpanded ? 'Hide' : 'Details'}</span>
                        {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sleek, simple stock allocation bar */}
                <div className="px-4 sm:px-5 pb-3">
                  <div className="w-full bg-[var(--surface-3)] h-1.5 rounded-full overflow-hidden flex">
                    <div className="bg-emerald-500 h-full" style={{ width: `${availPct}%` }} />
                    <div className="bg-amber-500 h-full" style={{ width: `${resPct}%` }} />
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-[var(--text-3)] mt-1.5">
                    <span>Avail: {item.availableQty} {item.primaryUom} · Reserved: {item.reservedQty} {item.primaryUom}</span>
                    <span>Reorder point: {item.reorderPoint} {item.primaryUom}</span>
                  </div>
                </div>

                {/* Level 2 Investigate: Expanded lot details & certificates */}
                {isExpanded && (
                  <div className="border-t border-[var(--border)] bg-[var(--surface-2)] p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[var(--text)]">Traceable Lots ({itemLots.length})</span>
                      {seedMaterial?.conversionFactor && (
                        <span className="font-mono text-[var(--cyan-bright)]">
                          Formula: 1 {seedMaterial.secondaryUom} = {seedMaterial.conversionFactor} {seedMaterial.primaryUom}
                        </span>
                      )}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      {itemLots.map(lot => (
                        <div key={lot.id} className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs space-y-1">
                          <div className="flex justify-between items-center font-bold">
                            <span className="font-mono text-[var(--text)]">{lot.lotNumber}</span>
                            <span className="font-mono text-emerald-400">{lot.primaryQty} {lot.primaryUom}</span>
                          </div>
                          <div className="text-[var(--text-3)]">
                            Supplier: {lot.supplierName} · Heat: {lot.heatNumber || '—'}
                          </div>
                          <div className="text-[var(--text-3)]">
                            Bin: {lot.storeLocationName}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── 5. Alternative Table View (Clean & Compact) ── */}
      {viewMode === 'table' && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--surface-2)] text-xs text-[var(--text-3)] font-mono border-b border-[var(--border)]">
              <tr>
                <th className="py-3 px-4">Code & Material</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Available</th>
                <th className="py-3 px-4">Reserved</th>
                <th className="py-3 px-4">Dual UOM</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredItems.map(i => (
                <tr key={i.id} className="hover:bg-[var(--surface-2)] transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-mono text-xs font-bold text-[var(--cyan-bright)]">{i.materialCode}</div>
                    <div className="font-medium text-[var(--text)]">{i.materialName}</div>
                  </td>
                  <td className="py-3 px-4 text-xs text-[var(--text-2)]">{i.locationName}</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400">{i.availableQty} {i.primaryUom}</td>
                  <td className="py-3 px-4 font-mono text-amber-400">{i.reservedQty} {i.primaryUom}</td>
                  <td className="py-3 px-4 font-mono text-xs text-[var(--text-3)]">
                    {i.secondaryUom ? `${i.secondaryQty} ${i.secondaryUom}` : '—'}
                  </td>
                  <td className="py-3 px-4">
                    {i.shortage ? (
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-[var(--error-bg)] text-[var(--error)]">Shortage</span>
                    ) : i.qcHoldQty > 0 ? (
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-[var(--hold-bg)] text-[var(--hold)]">QC Hold</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-[var(--success-bg)] text-[var(--success)]">Nominal</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleOpenTransferForMaterial(i.materialCode)}
                      className="text-xs text-[var(--brand)] hover:underline font-medium"
                    >
                      Transfer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── 6. Streamlined Transfer Modal (2 Clicks) ── */}
      {transferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl p-5 space-y-4 bg-[var(--surface)] border border-[var(--border)]">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h3 className="text-sm font-bold text-[var(--text)]">Transfer Material Stock</h3>
              <button onClick={() => setTransferModalOpen(false)} className="text-[var(--text-3)] hover:text-[var(--text)]">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-mono uppercase text-[var(--text-3)] mb-1">
                  Material Lot to Move
                </label>
                <select
                  value={transferLotId}
                  onChange={e => setTransferLotId(e.target.value)}
                  className="w-full p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] font-mono text-xs"
                >
                  {lots.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.lotNumber} · {l.materialName} ({l.primaryQty} {l.primaryUom} in {l.storeLocationName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[var(--text-3)] mb-1">
                  Target Store
                </label>
                <select
                  value={targetLocation}
                  onChange={e => setTargetLocation(e.target.value)}
                  className="w-full p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)]"
                >
                  <option value="Raw Material Store">Raw Material Store</option>
                  <option value="Quarantine Store">Quarantine Store</option>
                  <option value="WIP Store">WIP Shop Floor</option>
                  <option value="Spare Parts Store">Spare Parts Store</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
              <button onClick={() => setTransferModalOpen(false)} className="btn-ghost text-xs py-1.5 px-3">
                Cancel
              </button>
              <button onClick={handleExecuteTransfer} className="btn-primary text-xs py-1.5 px-4">
                Confirm Move
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
