import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, CheckCircle2, AlertTriangle, Split } from 'lucide-react';
import { useStore } from '../../store';
import SiteStoreField from '../../components/forms/SiteStoreField';
import StatusChip from '../../components/layout/StatusChip';
import { DEFAULT_SITE_ID } from '../../domain/recordLists';

interface LotDraft {
  id: string;
  lotNumber: string;
  supplierLotRef: string;
  grade: string;
  qty: string;
  mfgDate: string;
  expiryDate: string;
  notes: string;
}

interface LineReceiptDraft {
  spoLineId: string;
  receivingQty: string;
  lots: LotDraft[];
  notes: string;
}

export default function GRNCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSpoId = searchParams.get('spo') ?? '';

  const {
    supplierPos, supplierPoLines, materials, sites, storeLocations, lots, currentUser,
    recordGRNReceipt, showToast,
  } = useStore();

  const eligiblePos = useMemo(() =>
    supplierPos.filter(po => {
      if (['cancelled', 'draft', 'received'].includes(po.status)) return false;
      const lines = supplierPoLines.filter(l => l.spoId === po.id);
      if (lines.length === 0) return true;
      return lines.some(l => l.orderedQty * (1 + (l.tolerancePct ?? 0) / 100) - l.receivedQty > 0);
    }),
    [supplierPos, supplierPoLines]
  );

  const [selectedSpoId, setSelectedSpoId] = useState(() => initialSpoId || eligiblePos[0]?.id || '');
  const spo = supplierPos.find(p => p.id === selectedSpoId);
  const spoLines = useMemo(() => supplierPoLines.filter(l => l.spoId === selectedSpoId), [supplierPoLines, selectedSpoId]);

  const defaultSiteId = spo?.deliverToSiteId || sites[0]?.id || DEFAULT_SITE_ID;
  const defaultQuarantineStore = storeLocations.find(l => l.siteId === defaultSiteId && l.locationType === 'Quarantine')
    || storeLocations.find(l => l.id === spo?.deliverToStoreId)
    || storeLocations.find(l => l.siteId === defaultSiteId)
    || storeLocations[0];

  const [receivedDate, setReceivedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [deliveryChallan, setDeliveryChallan] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [siteId, setSiteId] = useState(defaultSiteId);
  const [storeLocationId, setStoreLocationId] = useState(defaultQuarantineStore?.id || '');
  const [error, setError] = useState('');

  const buildDraftsForSpo = (targetSpoId: string): Record<string, LineReceiptDraft> => {
    const targetLines = supplierPoLines.filter(l => l.spoId === targetSpoId);
    const baseLotIdx = lots.length + 1;
    const drafts: Record<string, LineReceiptDraft> = {};
    targetLines.forEach((line, idx) => {
      const remaining = Math.max(0, Number((line.orderedQty - line.receivedQty).toFixed(3)));
      const mat = materials.find(m => m.id === line.materialItemId);
      const lotNum = `LOT-${new Date().getFullYear()}-${String(baseLotIdx + idx).padStart(3, '0')}`;
      drafts[line.id] = {
        spoLineId: line.id,
        receivingQty: remaining > 0 ? String(remaining) : '0',
        lots: remaining > 0 ? [{
          id: `ld-${line.id}-0`,
          lotNumber: lotNum,
          supplierLotRef: '',
          grade: line.grade || mat?.standardGrade || '',
          qty: String(remaining),
          mfgDate: '',
          expiryDate: '',
          notes: '',
        }] : [],
        notes: '',
      };
    });
    return drafts;
  };

  const [lineDrafts, setLineDrafts] = useState<Record<string, LineReceiptDraft>>(() => buildDraftsForSpo(selectedSpoId));

  useEffect(() => {
    if (!spo) return;
    const nextSite = spo.deliverToSiteId || sites[0]?.id || DEFAULT_SITE_ID;
    const nextStore = storeLocations.find(l => l.siteId === nextSite && l.locationType === 'Quarantine')
      || storeLocations.find(l => l.id === spo.deliverToStoreId)
      || storeLocations.find(l => l.siteId === nextSite)
      || storeLocations[0];
    setSiteId(nextSite);
    setStoreLocationId(nextStore?.id || '');
    setLineDrafts(buildDraftsForSpo(spo.id));
    setError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSpoId]);

  const updateLineDraft = (spoLineId: string, patch: Partial<LineReceiptDraft>) => {
    setLineDrafts(prev => ({
      ...prev,
      [spoLineId]: { ...prev[spoLineId], ...patch },
    }));
  };

  const handleReceivingQtyChange = (spoLineId: string, val: string) => {
    setLineDrafts(prev => {
      const current = prev[spoLineId];
      if (!current) return prev;
      let nextLots = current.lots;
      if (nextLots.length === 1) {
        nextLots = [{ ...nextLots[0], qty: val }];
      } else if (nextLots.length === 0 && Number(val) > 0) {
        const line = spoLines.find(l => l.id === spoLineId);
        const mat = materials.find(m => m.id === line?.materialItemId);
        nextLots = [{
          id: `ld-${spoLineId}-${Date.now()}`,
          lotNumber: `LOT-${new Date().getFullYear()}-${String(lots.length + 101).padStart(3, '0')}`,
          supplierLotRef: '',
          grade: line?.grade || mat?.standardGrade || '',
          qty: val,
          mfgDate: '',
          expiryDate: '',
          notes: '',
        }];
      }
      return { ...prev, [spoLineId]: { ...current, receivingQty: val, lots: nextLots } };
    });
  };

  const addLotRow = (spoLineId: string) => {
    const line = spoLines.find(l => l.id === spoLineId);
    const mat = materials.find(m => m.id === line?.materialItemId);
    setLineDrafts(prev => {
      const current = prev[spoLineId];
      if (!current) return prev;
      const allocated = current.lots.reduce((s, l) => s + (Number(l.qty) || 0), 0);
      const receiving = Number(current.receivingQty) || 0;
      const diff = Math.max(0, Number((receiving - allocated).toFixed(3)));
      const suffix = String.fromCharCode(65 + current.lots.length);
      const nextNum = `LOT-${new Date().getFullYear()}-${String(lots.length + 100 + current.lots.length).padStart(3, '0')}-${suffix}`;
      return {
        ...prev,
        [spoLineId]: {
          ...current,
          lots: [
            ...current.lots,
            {
              id: `ld-${spoLineId}-${Date.now()}`,
              lotNumber: nextNum,
              supplierLotRef: '',
              grade: line?.grade || mat?.standardGrade || '',
              qty: diff > 0 ? String(diff) : '',
              mfgDate: '',
              expiryDate: '',
              notes: '',
            },
          ],
        },
      };
    });
  };

  const removeLotRow = (spoLineId: string, lotDraftId: string) => {
    setLineDrafts(prev => ({
      ...prev,
      [spoLineId]: {
        ...prev[spoLineId],
        lots: prev[spoLineId].lots.filter(l => l.id !== lotDraftId),
      },
    }));
  };

  const updateLotRow = (spoLineId: string, lotDraftId: string, patch: Partial<LotDraft>) => {
    setLineDrafts(prev => ({
      ...prev,
      [spoLineId]: {
        ...prev[spoLineId],
        lots: prev[spoLineId].lots.map(l => l.id === lotDraftId ? { ...l, ...patch } : l),
      },
    }));
  };

  const validation = useMemo(() => {
    if (!spo) return { valid: false, message: 'Select an eligible Supplier PO.' };
    if (['cancelled', 'draft', 'received'].includes(spo.status)) {
      return { valid: false, message: `Supplier PO ${spo.poNumber} has status "${spo.status}" and cannot receive goods.` };
    }
    if (!deliveryChallan.trim()) return { valid: false, message: 'Delivery Challan reference is required.' };
    if (spoLines.length === 0) return { valid: false, message: 'This PO has no ordered line items.' };

    const activeLines = spoLines.filter(l => (Number(lineDrafts[l.id]?.receivingQty) || 0) > 0);
    if (activeLines.length === 0) return { valid: false, message: 'Enter a receiving quantity greater than 0 for at least one line item.' };

    const batchLots = new Set<string>();
    const existingLots = new Set(lots.map(l => l.lotNumber.trim().toLowerCase()));

    for (const line of activeLines) {
      const draft = lineDrafts[line.id];
      const recQty = Number(draft?.receivingQty || 0);
      if (recQty <= 0) return { valid: false, message: `Quantity must be positive for ${line.materialName}.` };
      const maxAllowable = line.orderedQty * (1 + (line.tolerancePct ?? 0) / 100) - line.receivedQty;
      if (recQty > maxAllowable + 1e-6) {
        return { valid: false, message: `${line.materialName}: received qty (${recQty}) exceeds remaining allowable (${Math.max(0, Number(maxAllowable.toFixed(3)))} ${line.uom}).` };
      }
      if (!draft.lots || draft.lots.length === 0) {
        return { valid: false, message: `Add at least one lot for ${line.materialName}.` };
      }
      let lotSum = 0;
      for (const lot of draft.lots) {
        if (!lot.lotNumber.trim()) return { valid: false, message: `Enter lot number for every lot under ${line.materialName}.` };
        const q = Number(lot.qty || 0);
        if (q <= 0) return { valid: false, message: `Lot ${lot.lotNumber} must have positive quantity.` };
        const norm = lot.lotNumber.trim().toLowerCase();
        if (batchLots.has(norm) || existingLots.has(norm)) {
          return { valid: false, message: `Lot number "${lot.lotNumber}" is already in use.` };
        }
        batchLots.add(norm);
        lotSum += q;
      }
      if (Math.abs(lotSum - recQty) > 1e-6) {
        return { valid: false, message: `${line.materialName}: sum of lot quantities (${lotSum} ${line.uom}) must equal actual received quantity (${recQty} ${line.uom}).` };
      }
    }
    return { valid: true, message: '' };
  }, [spo, spoLines, lineDrafts, deliveryChallan, lots]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validation.valid || !spo) {
      setError(validation.message);
      return;
    }
    const payloadLines = spoLines
      .map(line => {
        const draft = lineDrafts[line.id];
        const qty = Number(draft?.receivingQty || 0);
        if (qty <= 0) return null;
        return {
          spoLineId: line.id,
          receivedQty: qty,
          lots: draft.lots.map(l => ({
            lotNumber: l.lotNumber.trim(),
            supplierLotRef: l.supplierLotRef.trim() || undefined,
            grade: l.grade.trim() || undefined,
            qty: Number(l.qty),
            mfgDate: l.mfgDate || undefined,
            expiryDate: l.expiryDate || undefined,
            notes: l.notes.trim() || undefined,
          })),
          notes: draft.notes.trim() || undefined,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    const res = recordGRNReceipt({
      spoId: spo.id,
      receivedDate,
      deliveryChallan: deliveryChallan.trim(),
      vehicleNumber: vehicleNumber.trim() || undefined,
      siteId,
      storeLocationId,
      receivedBy: currentUser.name,
      notes: notes.trim() || undefined,
      lines: payloadLines,
    });

    if (res.error || !res.grn) {
      setError(res.error || 'Could not record GRN.');
      showToast({ type: 'error', title: 'Receipt failed', body: res.error || 'Validation failed.' });
      return;
    }

    navigate(`/procurement/grn/${res.grn.id}`);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <button
          type="button"
          onClick={() => navigate(spo ? `/procurement/spo/${spo.id}` : '/procurement?tab=grn')}
          className="p-1.5 rounded-lg hover:bg-[var(--surface-2)]"
        >
          <ArrowLeft size={18} className="text-[var(--text-2)]" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-[var(--text)]">Record Goods Receipt Note (GRN)</h1>
          <p className="text-xs text-[var(--text-2)]">
            {spo ? `Receiving against ${spo.poNumber} · ${spo.supplierName}` : 'Receive Supplier PO line items and allocate incoming lots'}
          </p>
        </div>
        {spo && <StatusChip status={spo.status} size="sm" />}
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-5">
          {/* SPO Header & Prepopulated Context */}
          <div className="rounded-xl border p-5 space-y-4 bg-[var(--surface)] border-[var(--border)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-3)] mb-1">Supplier PO *</label>
                <select
                  className="eoss-input w-full font-mono"
                  value={selectedSpoId}
                  onChange={e => setSelectedSpoId(e.target.value)}
                >
                  <option value="">— Select Supplier PO —</option>
                  {eligiblePos.map(po => (
                    <option key={po.id} value={po.id}>{po.poNumber} — {po.supplierName}</option>
                  ))}
                  {spo && !eligiblePos.some(p => p.id === spo.id) && (
                    <option value={spo.id}>{spo.poNumber} — {spo.supplierName} ({spo.status})</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-3)] mb-1">Supplier</label>
                <input className="eoss-input w-full bg-[var(--surface-2)]" readOnly value={spo?.supplierName || '—'} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-3)] mb-1">Receipt Date *</label>
                <input type="date" className="eoss-input w-full" value={receivedDate} onChange={e => setReceivedDate(e.target.value)} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-3)] mb-1">Delivery Challan / Waybill # *</label>
                <input
                  className="eoss-input w-full font-mono"
                  placeholder="e.g. DC-2026-1041"
                  value={deliveryChallan}
                  onChange={e => setDeliveryChallan(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-3)] mb-1">Vehicle Number</label>
                <input
                  className="eoss-input w-full font-mono"
                  placeholder="e.g. TS09CD5678"
                  value={vehicleNumber}
                  onChange={e => setVehicleNumber(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-3)] mb-1">Expected Delivery Date</label>
                <input className="eoss-input w-full bg-[var(--surface-2)]" readOnly value={spo?.committedDate || '—'} />
              </div>
              <div className="md:col-span-2">
                <SiteStoreField
                  siteId={siteId}
                  storeId={storeLocationId}
                  label="Receiving site *"
                  storeLabel="Receiving / quarantine store *"
                  onChange={next => {
                    setSiteId(next.siteId);
                    setStoreLocationId(next.storeId);
                  }}
                />
                <p className="text-[11px] text-[var(--text-3)] mt-1">
                  Received lots are recorded in <strong>Quality Hold (Pending QC)</strong> and do not enter freely available inventory until incoming inspection accepts them.
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-[var(--text-3)] mb-1">Receiving Notes</label>
                <input className="eoss-input w-full" placeholder="Packaging condition, weighbridge slip, partial delivery notes..." value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Line Items & Multi-Lot Breakdown */}
          {spo && spoLines.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[var(--text)]">Ordered Items & Lot Allocation</h2>
                <span className="text-xs text-[var(--text-3)]">{spoLines.length} PO line(s)</span>
              </div>

              {spoLines.map(line => {
                const draft = lineDrafts[line.id];
                const remaining = Math.max(0, Number((line.orderedQty - line.receivedQty).toFixed(3)));
                const maxAllowable = Math.max(0, Number((line.orderedQty * (1 + (line.tolerancePct ?? 0) / 100) - line.receivedQty).toFixed(3)));
                const recQty = Number(draft?.receivingQty || 0);
                const lotSum = (draft?.lots ?? []).reduce((s, l) => s + (Number(l.qty) || 0), 0);
                const isBalanced = recQty === 0 || Math.abs(lotSum - recQty) < 1e-6;
                const remainingAfter = Math.max(0, Number((remaining - recQty).toFixed(3)));

                return (
                  <div key={line.id} className="rounded-xl border p-4 space-y-4 bg-[var(--surface)] border-[var(--border)]">
                    <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-[var(--border)]">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-[var(--text)]">{line.materialName}</span>
                          {line.materialCode && <span className="font-mono text-xs text-[var(--text-3)]">{line.materialCode}</span>}
                          {line.grade && <span className="text-xs px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-2)]">{line.grade}</span>}
                          <StatusChip status={line.status} size="sm" />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2 text-xs">
                          <div><span className="text-[var(--text-3)]">Ordered:</span> <strong className="font-mono">{line.orderedQty} {line.uom}</strong></div>
                          <div><span className="text-[var(--text-3)]">Prev. Received:</span> <strong className="font-mono">{line.receivedQty} {line.uom}</strong></div>
                          <div><span className="text-[var(--text-3)]">Remaining:</span> <strong className="font-mono">{remaining} {line.uom}</strong></div>
                          <div><span className="text-[var(--text-3)]">After Receipt:</span> <strong className="font-mono text-[var(--brand)]">{remainingAfter} {line.uom}</strong></div>
                        </div>
                      </div>

                      <div className="w-44">
                        <label className="block text-[11px] font-medium text-[var(--text-2)] mb-1">
                          Receiving Now ({line.uom})
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={maxAllowable}
                          step="any"
                          disabled={maxAllowable <= 0}
                          className="eoss-input w-full font-mono text-right font-semibold"
                          value={draft?.receivingQty ?? '0'}
                          onChange={e => handleReceivingQtyChange(line.id, e.target.value)}
                        />
                        {maxAllowable <= 0 && <p className="text-[11px] text-[var(--success)] mt-0.5">Fully received</p>}
                      </div>
                    </div>

                    {recQty > 0 && draft && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-semibold text-[var(--text-2)]">Lots Received ({draft.lots.length})</span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[11px] font-semibold ${
                              isBalanced ? 'bg-[var(--success-bg)] text-[var(--success)]' : 'bg-[var(--error-bg)] text-[var(--error)]'
                            }`}>
                              {isBalanced ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
                              Lot Total: {lotSum} / {recQty} {line.uom}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => addLotRow(line.id)}
                            className="btn-ghost text-xs inline-flex items-center gap-1"
                          >
                            <Split size={12} /> + Add Lot
                          </button>
                        </div>

                        <div className="space-y-2.5">
                          {draft.lots.map((lot, idx) => (
                            <div key={lot.id} className="rounded-lg border p-3 bg-[var(--surface-2)] border-[var(--border)]">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[11px] font-semibold text-[var(--text-2)]">Lot #{idx + 1} · Initial Status: Pending QC</span>
                                {draft.lots.length > 1 && (
                                  <button type="button" onClick={() => removeLotRow(line.id, lot.id)} className="text-red-500 hover:opacity-80">
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                                <div>
                                  <label className="block text-[11px] text-[var(--text-3)] mb-1">Lot Number *</label>
                                  <input
                                    className="eoss-input w-full text-xs font-mono"
                                    value={lot.lotNumber}
                                    onChange={e => updateLotRow(line.id, lot.id, { lotNumber: e.target.value })}
                                    placeholder="LOT-2026-..."
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] text-[var(--text-3)] mb-1">Supplier Lot / Heat Ref</label>
                                  <input
                                    className="eoss-input w-full text-xs font-mono"
                                    value={lot.supplierLotRef}
                                    onChange={e => updateLotRow(line.id, lot.id, { supplierLotRef: e.target.value })}
                                    placeholder="e.g. HT-9921"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] text-[var(--text-3)] mb-1">Grade</label>
                                  <input
                                    className="eoss-input w-full text-xs"
                                    value={lot.grade}
                                    onChange={e => updateLotRow(line.id, lot.id, { grade: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] text-[var(--text-3)] mb-1">Qty ({line.uom}) *</label>
                                  <input
                                    type="number"
                                    min="0.01"
                                    step="any"
                                    className="eoss-input w-full text-xs font-mono text-right font-semibold"
                                    value={lot.qty}
                                    onChange={e => updateLotRow(line.id, lot.id, { qty: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] text-[var(--text-3)] mb-1">Mfg Date</label>
                                  <input
                                    type="date"
                                    className="eoss-input w-full text-xs"
                                    value={lot.mfgDate}
                                    onChange={e => updateLotRow(line.id, lot.id, { mfgDate: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] text-[var(--text-3)] mb-1">Expiry Date</label>
                                  <input
                                    type="date"
                                    className="eoss-input w-full text-xs"
                                    value={lot.expiryDate}
                                    onChange={e => updateLotRow(line.id, lot.id, { expiryDate: e.target.value })}
                                  />
                                </div>
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

          {(!validation.valid || error) && (
            <div className="rounded-xl border px-4 py-3 text-xs flex items-center gap-2 bg-[var(--warning-bg)] border-[var(--warning)] text-[var(--text)]">
              <AlertTriangle size={14} className="text-[var(--warning)] flex-shrink-0" />
              <span>{error || validation.message}</span>
            </div>
          )}

          {!spo && (
            <div className="rounded-xl border p-6 text-center text-sm text-[var(--text-3)] bg-[var(--surface)] border-[var(--border)]">
              No eligible open Supplier PO selected.{' '}
              <Link to="/procurement?tab=spo" className="text-[var(--brand)] underline">Return to Supplier POs</Link>
            </div>
          )}
        </div>

        <div className="max-w-4xl mx-auto flex items-center justify-between pt-5 mt-5 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={() => navigate(spo ? `/procurement/spo/${spo.id}` : '/procurement?tab=grn')}
            className="btn-ghost text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!validation.valid}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40 inline-flex items-center gap-1.5"
            style={{ background: 'var(--success)' }}
          >
            <Plus size={15} /> Save GRN & Record Lots
          </button>
        </div>
      </form>
    </div>
  );
}
