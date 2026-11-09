import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRightLeft, ArrowUpDown, ArrowUp, ArrowDown, ShieldAlert, Plus, Pencil, X } from 'lucide-react';
import { useStore } from '../../store';
import { SITES, STORE_LOCATIONS } from '../../data/seed';
import type { MaterialItem } from '../../types';
import StatusChip from '../../components/layout/StatusChip';
import clsx from 'clsx';

type SortKey = 'materialCode' | 'materialName' | 'locationName' | 'onHandQty' | 'reservedQty' | 'qcHoldQty' | 'inTransitQty' | 'availableQty' | 'reorderPoint';
type SortDir = 'asc' | 'desc';

const emptyMaterialForm = {
  itemCode: '', name: '', categoryName: '', primaryUom: 'kg', standardGrade: '',
  dimensions: '', reorderPoint: 0, leadTimeDays: '', trackingMode: 'lot' as MaterialItem['trackingMode'],
};

export default function Inventory() {
  const { inventory, lots, currentUser, materials, addMaterial, updateMaterial, showToast } = useStore();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [shortagesOnly, setShortagesOnly] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('materialCode');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const shortageCount = inventory.filter(i => i.shortage).length;

  // Material Add/Edit Modal State
  const [materialModalOpen, setMaterialModalOpen] = useState(false);
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
  const [materialForm, setMaterialForm] = useState(emptyMaterialForm);

  const openAddMaterial = () => {
    setEditingMaterialId(null);
    setMaterialForm(emptyMaterialForm);
    setMaterialModalOpen(true);
  };

  const openEditMaterial = (m: MaterialItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingMaterialId(m.id);
    setMaterialForm({
      itemCode: m.itemCode, name: m.name, categoryName: m.categoryName, primaryUom: m.primaryUom,
      standardGrade: m.standardGrade ?? '', dimensions: m.dimensions ?? '', reorderPoint: m.reorderPoint,
      leadTimeDays: m.leadTimeDays != null ? String(m.leadTimeDays) : '', trackingMode: m.trackingMode,
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
      showToast({ type: 'success', title: 'Material updated', body: `${materialForm.name} saved.` });
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
      showToast({ type: 'success', title: 'Material added', body: `${newMaterial.name} (${newMaterial.itemCode}) created.` });
    }
    setMaterialModalOpen(false);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return inventory
      .filter(i => {
        const matchLoc = selectedLocation === 'all' || i.locationId === selectedLocation;
        const matchSearch = !q || i.materialCode.toLowerCase().includes(q) || i.materialName.toLowerCase().includes(q) || i.categoryName.toLowerCase().includes(q) || i.locationName.toLowerCase().includes(q);
        const matchShortage = !shortagesOnly || i.shortage;
        return matchLoc && matchSearch && matchShortage;
      })
      .sort((a, b) => {
        let av: string | number = a[sortKey] ?? '';
        let bv: string | number = b[sortKey] ?? '';
        if (typeof av === 'string') av = av.toLowerCase();
        if (typeof bv === 'string') bv = bv.toLowerCase();
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return sortDir === 'asc' ? cmp : -cmp;
      });
  }, [inventory, search, selectedLocation, shortagesOnly, sortKey, sortDir]);

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

        <div className="flex-1" />

        {shortageCount > 0 && (
          <button
            type="button"
            onClick={() => setShortagesOnly(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border"
            style={{
              background: shortagesOnly ? 'var(--error-bg,#FEF2F2)' : 'var(--surface)',
              color: 'var(--error,#DC2626)',
              borderColor: shortagesOnly ? 'var(--error,#DC2626)' : 'var(--border)',
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
            onClick={openAddMaterial}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
            style={{ background: 'var(--brand)' }}
          >
            <Plus size={13} /> Add Material
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
        {STORE_LOCATIONS.filter(loc => inventory.some(i => i.locationId === loc.id)).map(loc => {
          const items = inventory.filter(i => i.locationId === loc.id);
          const hasShortage = items.some(i => i.shortage);
          const isSelected = selectedLocation === loc.id;
          const siteCode = SITES.find(s => s.id === loc.siteId)?.code;
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

      <div className="md:hidden flex-1 overflow-auto p-3 space-y-2">
        {filtered.length === 0 && (
          <p className="px-2 py-8 text-center text-sm" style={{ color: 'var(--text-3)' }}>No inventory items match your filter.</p>
        )}
        {filtered.map(item => {
          const isLow = item.shortage || item.availableQty <= item.reorderPoint * 0.5;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                const firstLot = lots.find(l => l.materialItemId === item.materialItemId);
                if (firstLot) navigate(`/inventory/lot/${firstLot.id}`);
              }}
              className="w-full text-left rounded-xl border p-3"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[var(--text)]">{item.materialName}</div>
                  <div className="text-[11px] font-mono mt-0.5" style={{ color: 'var(--brand)' }}>{item.materialCode}</div>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{
                  background: item.shortage ? 'var(--error-bg,#FEF2F2)' : isLow ? 'var(--warning-bg,#FFFBEB)' : 'var(--success-bg,#F0FDF4)',
                  color: item.shortage ? 'var(--error,#DC2626)' : isLow ? 'var(--warning,#D97706)' : 'var(--success,#16A34A)',
                }}>
                  {item.shortage ? 'Shortage' : isLow ? 'Low' : 'OK'}
                </span>
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
            </button>
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
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
                        {item.categoryName}
                        {seedMaterial?.standardGrade && <span className="ml-1.5 font-mono">· {seedMaterial.standardGrade}</span>}
                      </div>
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
                    <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {item.lotCount > 0 && (
                          <span className="text-xs" style={{ color: 'var(--text-3)' }}>{item.lotCount} lot{item.lotCount !== 1 ? 's' : ''}</span>
                        )}
                        {seedMaterial && currentUser.role !== 'operator' && (
                          <button onClick={e => openEditMaterial(seedMaterial, e)} className="p-1 rounded hover:bg-[var(--surface-2)]" title="Edit material master">
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
