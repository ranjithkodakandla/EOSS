import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ArrowRightLeft, ShieldAlert, Plus, Pencil, X } from 'lucide-react';
import { useStore } from '../../store';
import SiteStoreField from '../../components/forms/SiteStoreField';
import { placeLabel } from '../../domain/places';
import type { MaterialItem } from '../../types';
import StatusChip from '../../components/layout/StatusChip';
import StockWorkspaceNav from '../../components/layout/StockWorkspaceNav';
import clsx from 'clsx';
import SortableHeader from '../../components/layout/SortableHeader';
import { sortRows } from '../../domain/tableSort';
import { deriveInventoryStatus } from '../../domain/inventory';

type SortKey = 'materialCode' | 'materialName' | 'locationName' | 'onHandQty' | 'reservedQty' | 'qcHoldQty' | 'inTransitQty' | 'availableQty' | 'reorderPoint' | 'status';
type SortDir = 'asc' | 'desc';

const emptyMaterialForm = {
  itemCode: '', name: '', categoryName: '', primaryUom: 'kg', standardGrade: '',
  dimensions: '', reorderPoint: 0, leadTimeDays: '', trackingMode: 'lot' as MaterialItem['trackingMode'],
  siteId: 'site-hyd', siteName: 'Hyderabad Plant 1', storeId: 'loc-rm', storeName: 'Raw Material Store',
  inventoryId: '' as string,
};

export default function Inventory() {
  const { inventory, lots, sites, storeLocations, currentUser, materials, addMaterial, updateMaterial, addInventoryItem, updateInventoryItem, showToast } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const openWithOrigin = (path: string) => navigate(path, { state: { from: `${location.pathname}${location.search}` } });
  const shortageFocus = searchParams.get('focus') === 'shortage';

  const [search, setSearch] = useState(searchParams.get('q') ?? searchParams.get('search') ?? '');
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('store') ?? 'all');
  const [statusFilter, setStatusFilter] = useState<string>(shortageFocus ? 'Shortage' : (searchParams.get('status') ?? 'all'));
  const [sortKey, setSortKey] = useState<SortKey>('materialCode');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  React.useEffect(() => {
    if (location.key === 'bg') return;
    const next = new URLSearchParams();
    if (shortageFocus) next.set('focus', 'shortage');
    if (search.trim()) next.set('q', search.trim());
    if (selectedLocation !== 'all') next.set('store', selectedLocation);
    if (statusFilter !== 'all' && !(shortageFocus && statusFilter === 'Shortage')) next.set('status', statusFilter);
    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
  }, [shortageFocus, search, selectedLocation, statusFilter, searchParams, setSearchParams, location.key]);

  const getInventoryRowStatus = (item: (typeof inventory)[number]) => {
    if (item.availableQty <= 0 && item.inTransitQty > 0 && item.qcHoldQty === 0) return 'Awaiting GRN';
    return deriveInventoryStatus(item);
  };

  const shortageCount = inventory.filter(i => {
    if (!i.shortage) return false;
    if (selectedLocation !== 'all' && i.locationId !== selectedLocation) return false;
    const q = search.toLowerCase();
    return !q || i.materialCode.toLowerCase().includes(q) || i.materialName.toLowerCase().includes(q) || i.categoryName.toLowerCase().includes(q) || i.locationName.toLowerCase().includes(q);
  }).length;

  // Material Add/Edit Modal State
  const [materialModalOpen, setMaterialModalOpen] = useState(false);
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
  const [materialForm, setMaterialForm] = useState(emptyMaterialForm);

  const openAddMaterial = () => {
    setEditingMaterialId(null);
    setMaterialForm(emptyMaterialForm);
    setMaterialModalOpen(true);
  };

  const openEditMaterial = (m: MaterialItem, inventoryId?: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const row = inventory.find(i => i.id === inventoryId);
    const loc = storeLocations.find(l => l.id === row?.locationId);
    const site = sites.find(s => s.id === loc?.siteId);
    setEditingMaterialId(m.id);
    setMaterialForm({
      itemCode: m.itemCode, name: m.name, categoryName: m.categoryName, primaryUom: m.primaryUom,
      standardGrade: m.standardGrade ?? '', dimensions: m.dimensions ?? '', reorderPoint: m.reorderPoint,
      leadTimeDays: m.leadTimeDays != null ? String(m.leadTimeDays) : '', trackingMode: m.trackingMode,
      siteId: site?.id ?? 'site-hyd', siteName: site?.name ?? 'Hyderabad Plant 1',
      storeId: loc?.id ?? 'loc-rm', storeName: loc?.name ?? row?.locationName ?? 'Raw Material Store',
      inventoryId: inventoryId ?? '',
    });
    setMaterialModalOpen(true);
  };

  const handleSaveMaterial = () => {
    if (editingMaterialId) {
      updateMaterial(editingMaterialId, {
        name: materialForm.name, categoryName: materialForm.categoryName, primaryUom: materialForm.primaryUom,
        standardGrade: materialForm.standardGrade || undefined, dimensions: materialForm.dimensions || undefined,
        reorderPoint: Number(materialForm.reorderPoint), leadTimeDays: materialForm.leadTimeDays ? Number(materialForm.leadTimeDays) : undefined,
        trackingMode: materialForm.trackingMode,
      });
      if (materialForm.inventoryId) {
        updateInventoryItem(materialForm.inventoryId, { locationId: materialForm.storeId, locationName: materialForm.storeName });
      }
      showToast({ type: 'success', title: 'Material updated', body: `${materialForm.name} saved at ${materialForm.storeName}.` });
    } else {
      const newMaterial: MaterialItem = {
        id: `mat-${Date.now()}`, itemCode: materialForm.itemCode || `MAT-${Date.now().toString().slice(-6)}`,
        name: materialForm.name, categoryId: `cat-${materialForm.categoryName.toLowerCase().replace(/\s+/g, '-')}`,
        categoryName: materialForm.categoryName, primaryUom: materialForm.primaryUom, trackingMode: materialForm.trackingMode,
        reorderPoint: Number(materialForm.reorderPoint) || 0, standardGrade: materialForm.standardGrade || undefined,
        dimensions: materialForm.dimensions || undefined, leadTimeDays: materialForm.leadTimeDays ? Number(materialForm.leadTimeDays) : undefined,
        active: true,
      };
      addMaterial(newMaterial);
      addInventoryItem({
        id: `inv-${Date.now()}`, materialItemId: newMaterial.id, materialCode: newMaterial.itemCode, materialName: newMaterial.name,
        categoryName: newMaterial.categoryName, locationId: materialForm.storeId, locationName: materialForm.storeName,
        onHandQty: 0, availableQty: 0, reservedQty: 0, qcHoldQty: 0, inTransitQty: 0, primaryUom: newMaterial.primaryUom,
        reorderPoint: newMaterial.reorderPoint, shortage: newMaterial.reorderPoint > 0, lotCount: 0,
      });
      showToast({ type: 'success', title: 'Material added', body: `${newMaterial.name} is stocked at ${materialForm.storeName}.` });
    }
    setMaterialModalOpen(false);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const filteredRows = inventory
      .filter(i => {
        const matchLoc = selectedLocation === 'all' || i.locationId === selectedLocation;
        const matchSearch = !q || i.materialCode.toLowerCase().includes(q) || i.materialName.toLowerCase().includes(q) || i.categoryName.toLowerCase().includes(q) || i.locationName.toLowerCase().includes(q);
        const derivedStatus = getInventoryRowStatus(i);
        const matchStatus = statusFilter === 'all' || derivedStatus === statusFilter;
        return matchLoc && matchSearch && matchStatus;
      });
    return sortRows(filteredRows, sortKey, sortDir, (row, key) =>
      key === 'status' ? getInventoryRowStatus(row) : row[key as Exclude<SortKey, 'status'>]
    );
  }, [inventory, search, selectedLocation, statusFilter, sortKey, sortDir]);

  const inventoryStatusOptions = ['Available', 'Shortage', 'Quality Hold', 'Reserved', 'Awaiting GRN'] as const;
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of inventoryStatusOptions) counts[s] = 0;
    for (const item of inventory) {
      if (selectedLocation !== 'all' && item.locationId !== selectedLocation) continue;
      const st = getInventoryRowStatus(item);
      counts[st] = (counts[st] ?? 0) + 1;
    }
    return counts;
  }, [inventory, selectedLocation]);
  const hasFilters = Boolean(search.trim() || selectedLocation !== 'all' || statusFilter !== 'all');
  const clearFilters = () => { setSearch(''); setSelectedLocation('all'); setStatusFilter('all'); };

  const raisePr = (item: { materialCode: string; materialName: string; primaryUom: string; reorderPoint: number; availableQty: number }, grade?: string) => {
    const qty = Math.max(item.reorderPoint - item.availableQty, item.reorderPoint || 1);
    const q = new URLSearchParams({ code: item.materialCode, name: item.materialName, qty: String(qty), uom: item.primaryUom, ...(grade ? { grade } : {}) });
    navigate(`/procurement/pr/new?${q.toString()}`);
  };

  return (
    <div className="flex flex-col h-full">
      <StockWorkspaceNav />
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

        <select
          aria-label="Stock status filter"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="eoss-input min-h-[36px] text-xs"
        >
          <option value="all">All Statuses ({inventory.filter(i => selectedLocation === 'all' || i.locationId === selectedLocation).length})</option>
          {inventoryStatusOptions.map(s => (
            <option key={s} value={s}>{s} ({statusCounts[s] ?? 0})</option>
          ))}
        </select>

        {hasFilters && (
          <button type="button" onClick={clearFilters} className="px-2.5 py-1.5 rounded-lg border text-xs font-medium" style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}>
            Clear filters
          </button>
        )}

        <div className="flex-1" />

        {shortageCount > 0 && (
          <button
            type="button"
            onClick={() => setStatusFilter(prev => prev === 'Shortage' ? 'all' : 'Shortage')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border"
            style={{
              background: statusFilter === 'Shortage' ? 'var(--error-bg,#FEF2F2)' : 'var(--surface)',
              color: 'var(--error,#DC2626)',
              borderColor: statusFilter === 'Shortage' ? 'var(--error,#DC2626)' : 'var(--border)',
            }}
          >
            <ShieldAlert size={13} />
            {shortageCount} shortage{shortageCount !== 1 ? 's' : ''}
          </button>
        )}

        {currentUser.role !== 'operator' && (
          <button
            onClick={() => navigate('/inventory/transfer')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border"
            style={{ borderColor: 'var(--border)', color: 'var(--text-2)', background: 'var(--surface)' }}
          >
            <ArrowRightLeft size={13} /> Transfer
          </button>
        )}

        {currentUser.role !== 'operator' && (
          <button
            onClick={() => navigate('/procurement/pr/new')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
            style={{ background: 'var(--brand-fill)' }}
          >
            <Plus size={13} /> Create Purchase Requisition
          </button>
        )}
      </div>

      {/* Store tiles summary row */}
      <div
        className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 overflow-x-auto scrollbar-none border-b"
        style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
      >
        <button
          type="button"
          onClick={() => setSelectedLocation('all')}
          className="flex-shrink-0 px-3 py-2 rounded-xl border text-xs font-semibold"
          style={{
            borderColor: selectedLocation === 'all' ? 'var(--brand)' : 'var(--border)',
            background: selectedLocation === 'all' ? 'var(--brand)' : 'var(--surface)',
            color: selectedLocation === 'all' ? '#fff' : 'var(--text-2)',
          }}
        >
          All stores
        </button>
        {storeLocations.filter(loc => loc.locationType !== 'Dispatch').map(loc => {
          const items = inventory.filter(i => i.locationId === loc.id);
          const hasShortage = items.some(i => i.shortage);
          const isSelected = selectedLocation === loc.id;
          const siteCode = sites.find(s => s.id === loc.siteId)?.code;
          return (
            <button
              key={loc.id}
              onClick={() => setSelectedLocation(isSelected ? 'all' : loc.id)}
              className="flex-shrink-0 flex flex-col items-start px-3 py-2 rounded-xl border text-left transition-all hover:opacity-90"
              style={{
                minWidth: 120,
                borderColor: isSelected ? 'var(--brand)' : 'var(--border)',
                background: isSelected ? 'rgba(var(--brand-rgb,112,72,245),0.07)' : 'var(--surface)',
                boxShadow: isSelected ? '0 0 0 1.5px var(--brand)' : undefined,
              }}
            >
              <div className="flex items-center justify-between w-full gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: isSelected ? 'var(--brand)' : 'var(--text-3)' }}>
                  {siteCode ? `${siteCode} · ${loc.code}` : loc.code}
                </span>
                {hasShortage && <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />}
              </div>
              <span className="text-xs font-semibold mt-0.5 leading-tight" style={{ color: 'var(--text)' }}>
                {items.length} item{items.length === 1 ? '' : 's'}
              </span>
              <span className="text-[10px] mt-0.5 leading-tight truncate w-full" style={{ color: 'var(--text-3)', maxWidth: 120 }}>
                {loc.name}
              </span>
            </button>
          );
        })}
      </div>

      {shortageFocus && (
        <div className="px-4 py-2 text-sm border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
          Showing materials below what the shop needs. Raise a purchase request for the shortfall.
        </div>
      )}

      <div className="md:hidden flex-1 overflow-auto p-3 space-y-2">
        {filtered.length === 0 && (
          <p className="px-2 py-8 text-center text-sm" style={{ color: 'var(--text-3)' }}>No inventory items match your filter.</p>
        )}
        {filtered.map(item => {
          const rowStatus = getInventoryRowStatus(item);
          return (
            <div
              key={item.id}
              role="link"
              onClick={() => {
                openWithOrigin(`/inventory/item/${item.materialItemId}`);
              }}
              className="w-full text-left rounded-xl border p-3 cursor-pointer"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[var(--text)]">{item.materialName}</div>
                  <div className="text-[11px] font-mono mt-0.5" style={{ color: 'var(--brand)' }}>{item.materialCode}</div>
                </div>
                <StatusChip status={rowStatus.toLowerCase().replace(/\s+/g, '_')} label={rowStatus} size="sm" />
              </div>
              <div className="mt-2 flex items-baseline justify-between gap-2">
                <span className="text-xs" style={{ color: 'var(--text-2)' }}>{item.locationName}</span>
                <span className="font-mono text-sm font-bold" style={{ color: item.shortage ? 'var(--error,#DC2626)' : 'var(--text)' }}>
                  {item.availableQty.toLocaleString('en-IN')} <span className="text-[10px] font-medium" style={{ color: 'var(--text-3)' }}>{item.primaryUom} free</span>
                </span>
              </div>
              {(item.reservedQty > 0 || item.qcHoldQty > 0) && (
                <div className="mt-1 text-[11px]" style={{ color: 'var(--text-3)' }}>
                  {item.onHandQty.toLocaleString('en-IN')} on hand
                  {item.reservedQty > 0 && ` · ${item.reservedQty.toLocaleString('en-IN')} reserved`}
                  {item.qcHoldQty > 0 && ` · ${item.qcHoldQty.toLocaleString('en-IN')} on QC hold`}
                </div>
              )}
              {item.shortage && (
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={e => { e.stopPropagation(); raisePr(item, materials.find(m => m.id === item.materialItemId)?.standardGrade); }}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white" style={{ background: 'var(--brand-fill)' }}>
                    Create PR
                  </button>
                  <MoveStockButton item={item} inventory={inventory} navigate={navigate} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="hidden md:block flex-1 overflow-auto">
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
                ['status', 'Status'],
              ] as [SortKey | null, string][]).map(([key, label]) => (
                <SortableHeader
                  key={label}
                  label={label}
                  onSort={key ? () => handleSort(key) : undefined}
                  active={key === sortKey}
                  direction={sortDir}
                  className={clsx('px-4 py-3 text-left text-xs font-semibold font-medium', key ? 'cursor-pointer select-none hover:opacity-70' : '')}
                  style={{ color: 'var(--text-3)', borderBottom: '1px solid var(--border)' }}
                />
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
                const rowStatus = getInventoryRowStatus(item);
                const seedMaterial = materials.find(m => m.itemCode === item.materialCode);
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
                    onClick={() => openWithOrigin(`/inventory/item/${item.materialItemId}`)}
                  >
                    <td className="px-4 py-3 font-mono text-xs font-bold whitespace-nowrap" style={{ color: 'var(--brand)' }}>
                      <button type="button" className="hover:underline" onClick={e => { e.stopPropagation(); openWithOrigin(`/inventory/item/${item.materialItemId}`); }}>{item.materialCode}</button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>{item.materialName}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
                        {item.categoryName}
                        {seedMaterial?.standardGrade && <span className="ml-1.5 font-mono">· {seedMaterial.standardGrade}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-md border" style={{ borderColor: 'var(--border)', color: 'var(--text-2)', background: 'var(--surface)' }}>
                        {placeLabel(sites.find(s => s.id === storeLocations.find(l => l.id === item.locationId)?.siteId)?.code, item.locationName)}
                      </span>
                    </td>
                    <QtyCell qty={item.onHandQty} uom={item.primaryUom} />
                    <QtyCell qty={item.reservedQty} uom={item.primaryUom} dim />
                    <QtyCell qty={item.qcHoldQty} uom={item.primaryUom} warn={item.qcHoldQty > 0} dim />
                    <QtyCell qty={item.inTransitQty} uom={item.primaryUom} dim />
                    <QtyCell qty={item.availableQty} uom={item.primaryUom} emphasis low={item.shortage} />
                    <QtyCell qty={item.reorderPoint} uom={item.primaryUom} dim />
                    <td className="px-4 py-3">
                      <StatusChip status={rowStatus.toLowerCase().replace(/\s+/g, '_')} label={rowStatus} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {item.lotCount > 0 && (
                          <button type="button" className="text-xs hover:underline" style={{ color: 'var(--brand)' }} onClick={() => openWithOrigin(`/inventory/item/${item.materialItemId}?view=lots`)}>{item.lotCount} lot{item.lotCount !== 1 ? 's' : ''}</button>
                        )}
                        {item.shortage && (
                          <>
                            <button type="button" onClick={() => raisePr(item, materials.find(m => m.id === item.materialItemId)?.standardGrade)} className="px-2 py-1 rounded-lg text-xs font-semibold text-white" style={{ background: 'var(--brand-fill)' }}>
                              Create PR
                            </button>
                            <MoveStockButton item={item} inventory={inventory} navigate={navigate} />
                          </>
                        )}
                        {seedMaterial && currentUser.role !== 'operator' && (
                          <button onClick={e => openEditMaterial(seedMaterial, item.id, e)} className="p-1 rounded hover:bg-[var(--surface-2)]" title="Edit material master">
                            <Pencil size={12} style={{ color: 'var(--text-3)' }} />
                          </button>
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
        <span>{filtered.length} of {inventory.length} stock rows</span>
        <span>·</span>
        <span>{inventory.filter(i => selectedLocation === 'all' || i.locationId === selectedLocation).reduce((sum, i) => sum + i.availableQty, 0).toLocaleString('en-IN')} available</span>
        <span>·</span>
        <span>{inventory.filter(i => selectedLocation === 'all' || i.locationId === selectedLocation).reduce((sum, i) => sum + i.reservedQty, 0).toLocaleString('en-IN')} reserved</span>
        <span>·</span>
        <span>{inventory.filter(i => selectedLocation === 'all' || i.locationId === selectedLocation).reduce((sum, i) => sum + i.qcHoldQty, 0).toLocaleString('en-IN')} QC hold</span>
        {shortageCount > 0 && (
          <>
            <span>·</span>
            <span style={{ color: 'var(--error,#DC2626)', fontWeight: 600 }}>{shortageCount} shortage{shortageCount !== 1 ? 's' : ''}</span>
          </>
        )}
      </div>

      {/* Material Add/Edit Modal */}
      {materialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl p-5 space-y-4 bg-[var(--surface)] border border-[var(--border)]">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h3 className="text-sm font-bold text-[var(--text)]">{editingMaterialId ? 'Edit Material' : 'Add Material'}</h3>
              <button onClick={() => setMaterialModalOpen(false)} className="text-[var(--text-3)] hover:text-[var(--text)]">
                <X size={16} />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <Field2 label="Item Code" value={materialForm.itemCode} onChange={v => setMaterialForm(f => ({ ...f, itemCode: v }))} disabled={!!editingMaterialId} placeholder="e.g. FRG-42CD4-RND" />
              <Field2 label="Material Name *" value={materialForm.name} onChange={v => setMaterialForm(f => ({ ...f, name: v }))} placeholder="e.g. Steel Grade 42CrMo4 Billet" />
              <Field2 label="Category" value={materialForm.categoryName} onChange={v => setMaterialForm(f => ({ ...f, categoryName: v }))} placeholder="e.g. Alloy Steel Forgings" />
              <Field2 label="Grade / Specification" value={materialForm.standardGrade} onChange={v => setMaterialForm(f => ({ ...f, standardGrade: v }))} placeholder="e.g. EN 10083-3 42CrMo4" />
              <Field2 label="Dimensions" value={materialForm.dimensions} onChange={v => setMaterialForm(f => ({ ...f, dimensions: v }))} placeholder="e.g. Ø280mm x 650mm" />
              <Field2 label="UOM" value={materialForm.primaryUom} onChange={v => setMaterialForm(f => ({ ...f, primaryUom: v }))} placeholder="kg / pcs / m" />
              <Field2 label="Reorder Level" value={String(materialForm.reorderPoint)} onChange={v => setMaterialForm(f => ({ ...f, reorderPoint: Number(v) || 0 }))} type="number" />
              <Field2 label="Lead Time (days)" value={materialForm.leadTimeDays} onChange={v => setMaterialForm(f => ({ ...f, leadTimeDays: v }))} type="number" />
              <div className="sm:col-span-2">
                <SiteStoreField
                  siteId={materialForm.siteId}
                  storeId={materialForm.storeId}
                  label="Site"
                  storeLabel="Store"
                  onChange={next => setMaterialForm(f => ({ ...f, siteId: next.siteId, siteName: next.siteName, storeId: next.storeId, storeName: next.storeName }))}
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase text-[var(--text-3)] mb-1">Tracking Mode</label>
                <select
                  value={materialForm.trackingMode}
                  onChange={e => setMaterialForm(f => ({ ...f, trackingMode: e.target.value as MaterialItem['trackingMode'] }))}
                  className="w-full p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)]"
                >
                  <option value="none">None</option>
                  <option value="lot">Lot</option>
                  <option value="heat">Heat</option>
                  <option value="serial">Serial</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
              <button onClick={() => setMaterialModalOpen(false)} className="btn-ghost text-xs py-1.5 px-3">Cancel</button>
              <button disabled={!materialForm.name} onClick={handleSaveMaterial} className="btn-primary text-xs py-1.5 px-4 disabled:opacity-50">
                {editingMaterialId ? 'Save Changes' : 'Create Material'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field2({ label, value, onChange, placeholder, type = 'text', disabled }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; disabled?: boolean }) {
  return (
    <div>
      <label className="block text-[11px] font-mono uppercase text-[var(--text-3)] mb-1">{label}</label>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] disabled:opacity-50"
      />
    </div>
  );
}

function MoveStockButton({ item, inventory, navigate }: {
  item: { materialItemId: string; materialName: string; locationId: string; locationName: string; availableQty: number; reorderPoint: number; primaryUom: string };
  inventory: { materialItemId: string; locationId: string; locationName: string; availableQty: number }[];
  navigate: (path: string) => void;
}) {
  const source = inventory.find(o => o.materialItemId === item.materialItemId && o.locationId !== item.locationId && o.availableQty > 0);
  if (!source) return null;
  const qty = Math.min(source.availableQty, Math.max(item.reorderPoint - item.availableQty, 1));
  const q = new URLSearchParams({
    material: item.materialName,
    from: source.locationName,
    to: item.locationName,
    qty: String(qty),
    uom: item.primaryUom,
  });
  return (
    <button type="button" onClick={e => { e.stopPropagation(); navigate(`/inventory/transfer?${q.toString()}`); }}
      className="px-2 py-1 rounded-lg text-xs font-semibold border" style={{ borderColor: 'var(--brand)', color: 'var(--brand)' }}>
      Move stock
    </button>
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
