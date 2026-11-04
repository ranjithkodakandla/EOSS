import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, AlertTriangle, ChevronRight, ArrowRightLeft, Package, Layers,
  ChevronDown, ChevronUp, MapPin, Shield, ArrowUpRight, CheckCircle,
  FileCheck, Sparkles, Filter, ExternalLink, ArrowRight, ShieldAlert,
  SlidersHorizontal, Check, RefreshCw, X, Box
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
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'lots'>('cards');
  const [expandedMaterial, setExpandedMaterial] = useState<string | null>('MS-PLT-008');

  // Transfer Modal State
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferLotId, setTransferLotId] = useState<string>(lots[0]?.id || '');
  const [targetLocation, setTargetLocation] = useState('Raw Material Store');

  // Multi-UOM Safe Aggregations (Never aggregate incompatible units!)
  const structuralMetals = inventory.filter(i => i.materialCode.startsWith('MS-'));
  const structuralTotalKg = structuralMetals.reduce((sum, i) => sum + i.onHandQty, 0);

  const stainlessMetals = inventory.filter(i => i.materialCode.startsWith('SS-'));
  const stainlessTotalKg = stainlessMetals.reduce((sum, i) => sum + i.onHandQty, 0);

  const hardwareItems = inventory.filter(i => i.primaryUom === 'pcs');
  const hardwareTotalPcs = hardwareItems.reduce((sum, i) => sum + i.onHandQty, 0);

  const gasItems = inventory.filter(i => i.primaryUom === 'cyl');
  const gasTotalCyl = gasItems.reduce((sum, i) => sum + i.onHandQty, 0);

  const shortageCount = inventory.filter(i => i.shortage).length;
  const qcHoldCount   = inventory.filter(i => i.qcHoldQty > 0).length;
  const inTransitTotal = inventory.reduce((sum, i) => sum + (i.inTransitQty || 0), 0);

  // Storage Locations
  const storeLocations = [
    { id: 'all', name: 'All Plant Locations', code: 'ALL', count: inventory.length },
    { id: 'Raw Material Store', name: 'Raw Material Store', code: 'RM', count: inventory.filter(i => i.locationName === 'Raw Material Store').length, role: 'Primary Stock' },
    { id: 'Quarantine Store', name: 'Quarantine Bay', code: 'QRN', count: inventory.filter(i => i.locationName === 'Quarantine Store').length, role: 'QC Hold / Rejects', hasAlert: qcHoldCount > 0 },
    { id: 'WIP Store', name: 'WIP Shop Floor', code: 'WIP', count: inventory.filter(i => i.locationName === 'WIP Store').length, role: 'Issued to Active Jobs' },
    { id: 'Spare Parts Store', name: 'Spares & Tool Crib', code: 'SPR', count: inventory.filter(i => i.locationName === 'Spare Parts Store').length, role: 'Maintenance Consumables' },
  ];

  // Material Categories
  const categories = ['all', 'MS Steel', 'SS Steel', 'Consumables', 'Gases'];

  // Filtered Inventory
  const filteredItems = useMemo(() => {
    return inventory.filter(item => {
      const matchSearch = !search ||
        item.materialName.toLowerCase().includes(search.toLowerCase()) ||
        item.materialCode.toLowerCase().includes(search.toLowerCase());
      const matchLocation = selectedLocation === 'all' || item.locationName === selectedLocation;
      const matchCategory = selectedCategory === 'all' || item.categoryName === selectedCategory;
      return matchSearch && matchLocation && matchCategory;
    });
  }, [inventory, search, selectedLocation, selectedCategory]);

  const handleExecuteTransfer = () => {
    const lotToTransfer = lots.find(l => l.id === transferLotId);
    if (!lotToTransfer) return;
    transferLot(transferLotId, targetLocation, currentUser.name);
    setTransferModalOpen(false);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1520px] mx-auto space-y-6">

      {/* ── 1. Visual Inventory Intelligence Header ── */}
      <div className="industrial-panel p-5 md:p-6 panel-accent-top">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="heat-badge text-[11px]">
                <Package size={12} />
                VISUAL INVENTORY INTELLIGENCE
              </span>
              <span className="text-[11px] font-mono text-[var(--text-3)]">
                HYDERABAD PLANT · REALTIME STOCK LEDGER
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--text)]">
              Material Stocks & Traceability
            </h1>
            <p className="text-xs md:text-sm text-[var(--text-2)] max-w-3xl leading-relaxed">
              Real-time multi-UOM inventory control across 5 plant storage zones. Lot traceability, heat numbers, Mill Test Certificates (MTC), and reservation pipelines linked directly to customer production orders.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
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
              Goods Receipt (GRN)
            </button>
          </div>
        </div>

        {/* Multi-UOM Safe Metric Band */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-[var(--border)]">
          <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
            <div className="text-[10px] font-mono uppercase text-[var(--text-3)]">Heavy MS Steel</div>
            <div className="stat-metric text-lg font-bold text-[var(--text)] mt-0.5">
              {structuralTotalKg.toLocaleString('en-IN')} <span className="text-xs font-normal text-[var(--text-2)]">kg</span>
            </div>
            <div className="text-[10px] font-mono text-[var(--cyan-bright)] mt-0.5">35.2 m² · 110 m linear</div>
          </div>

          <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
            <div className="text-[10px] font-mono uppercase text-[var(--text-3)]">Stainless Steel 304L</div>
            <div className="stat-metric text-lg font-bold text-[var(--text)] mt-0.5">
              {stainlessTotalKg} <span className="text-xs font-normal text-[var(--text-2)]">kg</span>
            </div>
            <div className="text-[10px] font-mono text-[var(--cyan-bright)] mt-0.5">4.5 sheets (ASTM A240)</div>
          </div>

          <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
            <div className="text-[10px] font-mono uppercase text-[var(--text-3)]">Hardware & Rods</div>
            <div className="stat-metric text-lg font-bold text-[var(--text)] mt-0.5">
              {hardwareTotalPcs.toLocaleString('en-IN')} <span className="text-xs font-normal text-[var(--text-2)]">pcs</span>
            </div>
            <div className="text-[10px] font-mono text-[var(--text-3)] mt-0.5">Fasteners & Consumables</div>
          </div>

          <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
            <div className="text-[10px] font-mono uppercase text-[var(--text-3)]">Shielding Gases</div>
            <div className="stat-metric text-lg font-bold text-[var(--text)] mt-0.5">
              {gasTotalCyl} <span className="text-xs font-normal text-[var(--text-2)]">cyl</span>
            </div>
            <div className="text-[10px] font-mono text-[var(--text-3)] mt-0.5">Argon (99.998% Purity)</div>
          </div>

          <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--error-border)]">
            <div className="text-[10px] font-mono uppercase text-[var(--error)]">Shortage Risks</div>
            <div className="stat-metric text-lg font-bold text-[var(--error)] mt-0.5">
              {shortageCount} <span className="text-xs font-normal">items</span>
            </div>
            <div className="text-[10px] text-[var(--error)] font-medium mt-0.5">SS3, Pipe 100NB, Argon</div>
          </div>

          <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--hold-border)]">
            <div className="text-[10px] font-mono uppercase text-[var(--hold)]">Quarantine Hold</div>
            <div className="stat-metric text-lg font-bold text-[var(--hold)] mt-0.5">
              {qcHoldCount} <span className="text-xs font-normal">materials</span>
            </div>
            <div className="text-[10px] text-[var(--hold)] font-medium mt-0.5">866 kg under QC review</div>
          </div>
        </div>
      </div>

      {/* ── 2. Storage Location Facility Strip ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[var(--text-3)]">
            Facility Storage Zones
          </span>
          <span className="text-[11px] text-[var(--text-3)] font-mono">
            Filter by physical shop-floor location
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {storeLocations.map(loc => {
            const isSelected = selectedLocation === loc.name || (loc.id === 'all' && selectedLocation === 'all');
            return (
              <button
                key={loc.id}
                onClick={() => setSelectedLocation(loc.id === 'all' ? 'all' : loc.name)}
                className={clsx(
                  'text-left p-3 rounded-xl border transition-all duration-150 relative overflow-hidden',
                  isSelected
                    ? 'bg-[var(--surface-2)] border-[var(--cyan-border)] shadow-sm'
                    : 'bg-[var(--surface)] border-[var(--border)] hover:border-[var(--border-strong)]'
                )}
              >
                {isSelected && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-[var(--cyan-bright)]" />
                )}
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono text-[10px] font-bold text-[var(--cyan-bright)]">
                    {loc.code}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface-3)] text-[var(--text)]">
                    {loc.count} items
                  </span>
                </div>
                <div className="text-xs font-bold text-[var(--text)] truncate">{loc.name}</div>
                {loc.role && (
                  <div className="text-[10px] text-[var(--text-3)] truncate mt-0.5">{loc.role}</div>
                )}
                {loc.hasAlert && (
                  <div className="mt-1 text-[10px] font-semibold text-[var(--error)] flex items-center gap-1">
                    <ShieldAlert size={10} /> Active QC Hold
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3. Search, Category Filters & View Toggle ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search material code, description, grade or heat..."
            className="w-full pl-9 pr-3 py-1.5 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-xs text-[var(--text)] placeholder-[var(--text-3)] focus:outline-none focus:border-[var(--cyan-border)]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={clsx(
                'px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors',
                selectedCategory === cat
                  ? 'bg-[var(--surface-3)] text-[var(--cyan-bright)] border border-[var(--cyan-border)]'
                  : 'text-[var(--text-2)] hover:text-[var(--text)]'
              )}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex items-center rounded-lg bg-[var(--surface-2)] p-0.5 border border-[var(--border)]">
          <button
            onClick={() => setViewMode('cards')}
            className={clsx(
              'px-2.5 py-1 rounded text-xs font-medium transition-colors',
              viewMode === 'cards' ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs' : 'text-[var(--text-3)] hover:text-[var(--text-2)]'
            )}
          >
            Visual Cards
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={clsx(
              'px-2.5 py-1 rounded text-xs font-medium transition-colors',
              viewMode === 'table' ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs' : 'text-[var(--text-3)] hover:text-[var(--text-2)]'
            )}
          >
            Dense Table
          </button>
          <button
            onClick={() => setViewMode('lots')}
            className={clsx(
              'px-2.5 py-1 rounded text-xs font-medium transition-colors',
              viewMode === 'lots' ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs' : 'text-[var(--text-3)] hover:text-[var(--text-2)]'
            )}
          >
            Lot Ledger ({lots.length})
          </button>
        </div>
      </div>

      {/* ── 4. Main Inventory Representation ── */}
      {viewMode === 'cards' && (
        <div className="space-y-4">
          {filteredItems.map(item => {
            const seedMaterial = MATERIALS.find(m => m.itemCode === item.materialCode);
            const itemLots = lots.filter(l =>
              l.materialItemId === item.materialItemId ||
              l.materialName.toLowerCase().includes(item.materialName.toLowerCase().split(' ')[0])
            );
            const isExpanded = expandedMaterial === item.materialCode;

            // Pipeline segment calculations
            const totalStock = item.onHandQty + (item.inTransitQty || 0);
            const availPct = totalStock > 0 ? (item.availableQty / totalStock) * 100 : 0;
            const resPct   = totalStock > 0 ? (item.reservedQty / totalStock) * 100 : 0;
            const holdPct  = totalStock > 0 ? (item.qcHoldQty / totalStock) * 100 : 0;
            const transitPct = totalStock > 0 ? ((item.inTransitQty || 0) / totalStock) * 100 : 0;

            const isShortage = item.shortage;
            const isQcHold = item.qcHoldQty > 0;

            return (
              <div
                key={item.id}
                className={clsx(
                  'industrial-panel transition-all duration-200 overflow-hidden',
                  isShortage ? 'border-[var(--error-border)]/60' :
                  isQcHold ? 'border-[var(--hold-border)]/60' : ''
                )}
              >
                {/* Main Card Header & Metrics */}
                <div className="p-4 md:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Identity & Specs */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[var(--cyan-bright)] px-2 py-0.5 rounded bg-[var(--surface-3)] border border-[var(--border)]">
                        {item.materialCode}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-2)] border border-[var(--border)]">
                        {item.locationName}
                      </span>
                      {seedMaterial?.standardGrade && (
                        <span className="heat-badge text-[10px]">
                          {seedMaterial.standardGrade}
                        </span>
                      )}
                      {seedMaterial?.trackingMode && (
                        <span className="text-[10px] font-mono text-[var(--text-3)] uppercase">
                          {seedMaterial.trackingMode}-Tracked
                        </span>
                      )}
                    </div>
                    <h2 className="text-base font-bold text-[var(--text)]">
                      {item.materialName}
                    </h2>
                    <div className="flex items-center gap-3 text-xs text-[var(--text-3)]">
                      <span>Category: <strong className="text-[var(--text-2)]">{item.categoryName}</strong></span>
                      <span>·</span>
                      <span>Reorder Threshold: <strong className="text-[var(--text-2)] font-mono">{item.reorderPoint} {item.primaryUom}</strong></span>
                      {seedMaterial?.conversionFactor && (
                        <>
                          <span>·</span>
                          <span className="font-mono text-[var(--cyan-bright)]">
                            Formula: 1 {seedMaterial.secondaryUom} = {seedMaterial.conversionFactor} {seedMaterial.primaryUom}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right: Dual-UOM Telemetry */}
                  <div className="flex items-center gap-4 sm:gap-6 flex-wrap lg:flex-nowrap border-t lg:border-t-0 pt-3 lg:pt-0">
                    {/* Primary Available */}
                    <div className="text-left sm:text-right">
                      <div className="text-[10px] font-mono uppercase text-[var(--text-3)]">Available To Promise</div>
                      <div className="stat-metric text-xl font-bold text-[var(--text)] mt-0.5">
                        {item.availableQty.toLocaleString('en-IN')}{' '}
                        <span className="text-xs font-normal text-[var(--text-2)]">{item.primaryUom}</span>
                      </div>
                      {item.secondaryUom && item.secondaryQty && (
                        <div className="text-[11px] font-mono text-[var(--cyan-bright)] mt-0.5">
                          {item.secondaryQty} {item.secondaryUom} equiv.
                        </div>
                      )}
                    </div>

                    {/* Stock Status Badge */}
                    <div className="min-w-[110px]">
                      {isShortage ? (
                        <div className="px-2.5 py-1 rounded-md bg-[var(--error-bg)] border border-[var(--error-border)] text-[var(--error)] text-xs font-bold text-center">
                          SHORTAGE RISK
                        </div>
                      ) : isQcHold ? (
                        <div className="px-2.5 py-1 rounded-md bg-[var(--hold-bg)] border border-[var(--hold-border)] text-[var(--hold)] text-xs font-bold text-center">
                          QC QUARANTINE
                        </div>
                      ) : (
                        <div className="px-2.5 py-1 rounded-md bg-[var(--success-bg)] border border-[var(--success-border)] text-[var(--success)] text-xs font-bold text-center">
                          STOCKED NOMINAL
                        </div>
                      )}
                    </div>

                    {/* Expand Toggle */}
                    <button
                      onClick={() => setExpandedMaterial(isExpanded ? null : item.materialCode)}
                      className="p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-2)] hover:text-[var(--text)] hover:border-[var(--border-strong)] transition-colors"
                      title="Inspect lot traceability & certificates"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Visual Pipeline Bar */}
                <div className="px-4 md:px-5 pb-4 space-y-2">
                  <div className="flex h-3 w-full rounded-full overflow-hidden bg-[var(--surface-3)] p-0.5 border border-[var(--border)]">
                    {availPct > 0 && (
                      <div
                        className="h-full bg-emerald-500 rounded-l-full transition-all"
                        style={{ width: `${availPct}%` }}
                        title={`Available: ${item.availableQty} ${item.primaryUom}`}
                      />
                    )}
                    {resPct > 0 && (
                      <div
                        className="h-full bg-amber-500 transition-all"
                        style={{ width: `${resPct}%` }}
                        title={`Reserved for Jobs: ${item.reservedQty} ${item.primaryUom}`}
                      />
                    )}
                    {holdPct > 0 && (
                      <div
                        className="h-full bg-purple-500 transition-all"
                        style={{ width: `${holdPct}%` }}
                        title={`Quarantine Hold: ${item.qcHoldQty} ${item.primaryUom}`}
                      />
                    )}
                    {transitPct > 0 && (
                      <div
                        className="h-full bg-cyan-500/50 border border-cyan-400 rounded-r-full transition-all"
                        style={{ width: `${transitPct}%` }}
                        title={`In Transit: ${item.inTransitQty} ${item.primaryUom}`}
                      />
                    )}
                  </div>

                  {/* Stock Breakdown Legend */}
                  <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-[var(--text-2)] gap-2">
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>Available: <strong>{item.availableQty} {item.primaryUom}</strong></span>
                      </span>
                      {item.reservedQty > 0 && (
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          <span>Reserved for Jobs: <strong>{item.reservedQty} {item.primaryUom}</strong></span>
                        </span>
                      )}
                      {item.qcHoldQty > 0 && (
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-purple-500" />
                          <span>QC Hold: <strong>{item.qcHoldQty} {item.primaryUom}</strong></span>
                        </span>
                      )}
                      {(item.inTransitQty || 0) > 0 && (
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-cyan-400" />
                          <span>In-Transit (PO): <strong>{item.inTransitQty} {item.primaryUom}</strong></span>
                        </span>
                      )}
                    </div>
                    <span className="text-[var(--text-3)]">
                      Total Inventory Position: <strong className="text-[var(--text)]">{totalStock} {item.primaryUom}</strong>
                    </span>
                  </div>
                </div>

                {/* Expanded Lot & Certificate Traceability Drawer */}
                {isExpanded && (
                  <div className="border-t border-[var(--border)] bg-[var(--surface-2)] p-4 md:p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Layers size={14} className="text-[var(--cyan-bright)]" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                          Traceable Material Lots ({itemLots.length})
                        </h3>
                      </div>
                      <span className="text-[11px] text-[var(--text-3)] font-mono">
                        Physical Lot & Heat Traceability with Mill Test Certificates
                      </span>
                    </div>

                    {itemLots.length === 0 ? (
                      <div className="p-4 rounded-lg bg-[var(--surface)] text-center text-xs text-[var(--text-3)]">
                        No lots recorded for this material.
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {itemLots.map(lot => {
                          const isLotHold = lot.status === 'qc_hold';
                          const isLotRes  = lot.status === 'reserved';
                          return (
                            <div
                              key={lot.id}
                              className={clsx(
                                'p-3.5 rounded-xl border bg-[var(--surface)] space-y-2.5 transition-all',
                                isLotHold ? 'border-[var(--hold-border)]' :
                                isLotRes ? 'border-[var(--warning-border)]' :
                                'border-[var(--border)] hover:border-[var(--cyan-border)]'
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-xs font-bold text-[var(--text)]">
                                  {lot.lotNumber}
                                </span>
                                <StatusChip status={lot.status} size="sm" />
                              </div>

                              {lot.heatNumber && (
                                <div className="flex items-center gap-1.5 text-xs">
                                  <span className="text-[var(--text-3)] text-[10px] uppercase font-mono">Heat No:</span>
                                  <span className="heat-badge text-[10px]">{lot.heatNumber}</span>
                                </div>
                              )}

                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-[var(--text-3)]">Primary Qty:</span>
                                  <span className="font-mono font-bold text-[var(--text)]">
                                    {lot.primaryQty} {lot.primaryUom}
                                  </span>
                                </div>
                                {lot.secondaryQty && lot.secondaryUom && (
                                  <div className="flex justify-between text-[11px]">
                                    <span className="text-[var(--text-3)]">Secondary Qty:</span>
                                    <span className="font-mono text-[var(--cyan-bright)]">
                                      {lot.secondaryQty} {lot.secondaryUom}
                                    </span>
                                  </div>
                                )}
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-[var(--text-3)]">Supplier:</span>
                                  <span className="text-[var(--text-2)]">{lot.supplierName}</span>
                                </div>
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-[var(--text-3)]">Store Location:</span>
                                  <span className="text-[var(--text-2)]">{lot.storeLocationName}</span>
                                </div>
                                {lot.parentLotId && (
                                  <div className="text-[10px] font-mono text-[var(--warning)]">
                                    Remnant cut from parent lot {lot.parentLotId}
                                  </div>
                                )}
                              </div>

                              <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-[11px]">
                                <span className={clsx(
                                  'font-mono text-[10px] flex items-center gap-1',
                                  lot.certStatus === 'verified' ? 'text-[var(--success)] font-semibold' :
                                  lot.certStatus === 'pending' ? 'text-[var(--warning)] font-semibold' :
                                  'text-[var(--text-3)]'
                                )}>
                                  <FileCheck size={12} />
                                  MTC: {lot.certStatus.toUpperCase()}
                                </span>
                                <button
                                  onClick={() => navigate(`/inventory/lot/${lot.id}`)}
                                  className="text-[var(--cyan-bright)] hover:underline flex items-center gap-0.5 text-xs font-medium"
                                >
                                  Lot Dossier <ArrowRight size={11} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── 5. Dense Table View Option ── */}
      {viewMode === 'table' && (
        <div className="industrial-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="eoss-table">
              <thead>
                <tr>
                  <th>Material Code & Name</th>
                  <th>Location</th>
                  <th>Grade</th>
                  <th>On Hand</th>
                  <th>Available</th>
                  <th>Reserved</th>
                  <th>QC Hold</th>
                  <th>Dual UOM</th>
                  <th>Reorder Pt</th>
                  <th>Lots</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(i => {
                  const seed = MATERIALS.find(m => m.itemCode === i.materialCode);
                  return (
                    <tr key={i.id} className="hover:bg-[var(--surface-2)] transition-colors">
                      <td>
                        <div className="font-mono text-xs font-bold text-[var(--cyan-bright)]">{i.materialCode}</div>
                        <div className="text-xs text-[var(--text)]">{i.materialName}</div>
                      </td>
                      <td>
                        <span className="text-xs text-[var(--text-2)]">{i.locationName}</span>
                      </td>
                      <td>
                        <span className="text-xs font-mono text-[var(--text-3)]">{seed?.standardGrade || '—'}</span>
                      </td>
                      <td>
                        <span className="font-mono text-xs font-bold text-[var(--text)]">{i.onHandQty} {i.primaryUom}</span>
                      </td>
                      <td>
                        <span className="font-mono text-xs font-bold text-emerald-400">{i.availableQty} {i.primaryUom}</span>
                      </td>
                      <td>
                        <span className="font-mono text-xs text-amber-400">{i.reservedQty} {i.primaryUom}</span>
                      </td>
                      <td>
                        <span className={clsx('font-mono text-xs', i.qcHoldQty > 0 ? 'text-purple-400 font-bold' : 'text-[var(--text-3)]')}>
                          {i.qcHoldQty} {i.primaryUom}
                        </span>
                      </td>
                      <td>
                        {i.secondaryUom ? (
                          <span className="font-mono text-[11px] text-[var(--cyan-bright)]">
                            {i.secondaryQty} {i.secondaryUom}
                          </span>
                        ) : (
                          <span className="text-[var(--text-3)]">—</span>
                        )}
                      </td>
                      <td>
                        <span className="font-mono text-xs text-[var(--text-3)]">{i.reorderPoint} {i.primaryUom}</span>
                      </td>
                      <td>
                        <span className="font-mono text-xs text-[var(--text-2)]">{i.lotCount}</span>
                      </td>
                      <td>
                        {i.shortage ? (
                          <span className="pill text-[10px] bg-red-500/20 text-red-400 border-red-500/30">Shortage</span>
                        ) : i.qcHoldQty > 0 ? (
                          <span className="pill text-[10px] bg-purple-500/20 text-purple-400 border-purple-500/30">QC Hold</span>
                        ) : (
                          <span className="pill text-[10px] bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Nominal</span>
                        )}
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => {
                            setExpandedMaterial(i.materialCode);
                            setViewMode('cards');
                          }}
                          className="text-xs text-[var(--brand)] hover:underline inline-flex items-center gap-1 font-medium"
                        >
                          Trace <ChevronRight size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 6. Full Lot Ledger View Option ── */}
      {viewMode === 'lots' && (
        <div className="industrial-panel overflow-hidden">
          <div className="p-4 border-b border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[var(--text)]">Shop-Floor Material Lot Ledger</h3>
              <p className="text-[11px] font-mono text-[var(--text-3)]">All 12 physical lots with heat numbers and MTC verification status</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="eoss-table">
              <thead>
                <tr>
                  <th>Lot Number</th>
                  <th>Material & Grade</th>
                  <th>Heat Number</th>
                  <th>Primary Qty</th>
                  <th>Secondary Qty</th>
                  <th>Location</th>
                  <th>Supplier</th>
                  <th>Status</th>
                  <th>MTC Verification</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {lots.map(l => (
                  <tr key={l.id} className="hover:bg-[var(--surface-2)] transition-colors">
                    <td>
                      <span className="font-mono text-xs font-bold text-[var(--text)]">{l.lotNumber}</span>
                      {l.parentLotId && (
                        <div className="text-[9px] font-mono text-amber-400">Child remnant</div>
                      )}
                    </td>
                    <td>
                      <div className="text-xs font-semibold text-[var(--text)]">{l.materialName}</div>
                      <div className="text-[10px] font-mono text-[var(--text-3)]">{l.grade || 'Commercial Grade'}</div>
                    </td>
                    <td>
                      {l.heatNumber ? (
                        <span className="heat-badge text-[10px]">{l.heatNumber}</span>
                      ) : (
                        <span className="text-[var(--text-3)] text-xs">—</span>
                      )}
                    </td>
                    <td>
                      <span className="font-mono text-xs font-bold text-[var(--text)]">{l.primaryQty} {l.primaryUom}</span>
                    </td>
                    <td>
                      {l.secondaryQty && l.secondaryUom ? (
                        <span className="font-mono text-xs text-[var(--cyan-bright)]">{l.secondaryQty} {l.secondaryUom}</span>
                      ) : (
                        <span className="text-[var(--text-3)] text-xs">—</span>
                      )}
                    </td>
                    <td>
                      <span className="text-xs text-[var(--text-2)]">{l.storeLocationName}</span>
                    </td>
                    <td>
                      <span className="text-xs text-[var(--text-2)]">{l.supplierName}</span>
                    </td>
                    <td>
                      <StatusChip status={l.status} size="sm" />
                    </td>
                    <td>
                      <span className={clsx(
                        'text-xs font-mono font-semibold flex items-center gap-1',
                        l.certStatus === 'verified' ? 'text-emerald-400' :
                        l.certStatus === 'pending' ? 'text-amber-400' :
                        'text-[var(--text-3)]'
                      )}>
                        <FileCheck size={12} />
                        {l.certStatus.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => navigate(`/inventory/lot/${l.id}`)}
                        className="btn-ghost text-xs py-1 px-2.5 inline-flex items-center gap-1"
                      >
                        Inspect <ArrowRight size={11} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 7. Working Interactive Transfer Modal ── */}
      {transferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md industrial-panel p-5 space-y-4 bg-[var(--surface)] border border-[var(--border-strong)]">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                <ArrowRightLeft size={16} className="text-[var(--cyan-bright)]" />
                <h3 className="text-sm font-bold text-[var(--text)]">Inter-Store Material Transfer</h3>
              </div>
              <button
                onClick={() => setTransferModalOpen(false)}
                className="text-[var(--text-3)] hover:text-[var(--text)]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-mono uppercase text-[var(--text-3)] mb-1">
                  Select Material Lot To Move
                </label>
                <select
                  value={transferLotId}
                  onChange={e => setTransferLotId(e.target.value)}
                  className="w-full p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-[var(--cyan-border)]"
                >
                  {lots.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.lotNumber} — {l.materialName} ({l.primaryQty} {l.primaryUom} in {l.storeLocationName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[var(--text-3)] mb-1">
                  Target Facility Store Location
                </label>
                <select
                  value={targetLocation}
                  onChange={e => setTargetLocation(e.target.value)}
                  className="w-full p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-[var(--cyan-border)]"
                >
                  <option value="Raw Material Store">Raw Material Store (loc-rm)</option>
                  <option value="Quarantine Store">Quarantine Store (loc-qrn)</option>
                  <option value="WIP Store">WIP Store (loc-wip)</option>
                  <option value="Spare Parts Store">Spare Parts Store (loc-spr)</option>
                  <option value="Dispatch Bay">Dispatch Bay (loc-dsp)</option>
                </select>
              </div>

              <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
                <div className="text-[10px] font-mono text-[var(--text-3)]">Movement Note</div>
                <div className="text-[11px] text-[var(--text-2)]">
                  Moving this lot updates the active inventory store location and records an append-only <strong className="text-[var(--text)]">StockMovement (Transfer)</strong> in the ledger.
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
              <button
                onClick={() => setTransferModalOpen(false)}
                className="btn-ghost text-xs py-1.5 px-3"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteTransfer}
                className="btn-primary text-xs py-1.5 px-4"
              >
                Confirm Transfer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
