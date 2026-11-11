import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Layers, AlertTriangle, CheckCircle } from 'lucide-react';
import { useStore } from '../../store';

export default function StockTransfer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { lots, storeLocations, sites, createStockTransfer, currentUser } = useStore();
  const placeOf = (siteId: string, name: string) => `${sites.find(s => s.id === siteId)?.name ?? 'Site'} · ${name}`;

  const [selectedLot, setSelectedLot] = useState('');
  const requestedDestination = searchParams.get('to') ?? '';
  const [toLocation, setToLocation] = useState(() => storeLocations.find(l => l.name === requestedDestination || `${sites.find(s => s.id === l.siteId)?.name} · ${l.name}` === requestedDestination)?.id ?? '');
  const [transferNote, setTransferNote] = useState(() => searchParams.get('job') ? `For ${searchParams.get('job')}` : '');
  const [quantity, setQuantity] = useState(() => searchParams.get('qty') ?? '');
  const [submitted, setSubmitted] = useState(false);

  const availableLots = lots.filter(l => l.status === 'available' && l.primaryQty > 0);
  const lotObj = lots.find(l => l.id === selectedLot);

  const isCrossGstin = false; // In prototype: flag when from/to sites differ — placeholder

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(quantity);
    if (!selectedLot || !toLocation || !lotObj || !Number.isFinite(qty) || qty <= 0 || qty > lotObj.primaryQty) return;
    createStockTransfer(selectedLot, toLocation, qty, currentUser.name, transferNote.trim() || undefined);
    setSubmitted(true);
    setTimeout(() => navigate('/inventory/transfers'), 800);
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5">
      <div>
        <button
          onClick={() => navigate('/inventory')}
          className="flex items-center gap-1.5 text-sm text-[var(--text-2)] hover:text-[var(--brand)] mb-3 cursor-pointer transition-colors"
        >
          <ArrowLeft size={14} /> Inventory
        </button>
        <div className="flex items-center gap-2">
          <Layers size={20} className="text-[var(--brand)]" />
          <h1 className="text-xl font-bold text-[var(--text)]">Stock Transfer</h1>
        </div>
        <p className="text-sm text-[var(--text-2)] mt-1">
          Move an accepted stock lot between stores. The transfer remains in transit until the destination store receives it.
        </p>
        {searchParams.get('job') && <div className="mt-3 rounded-lg border px-3 py-2 text-xs" style={{ borderColor: 'var(--info)', background: 'var(--info-bg)', color: 'var(--text-2)' }}><strong>Job {searchParams.get('job')}</strong> requested this transfer to cover a material shortage.</div>}
      </div>

      {isCrossGstin && (
        <div
          className="flex items-start gap-3 p-3.5 rounded-xl"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}
        >
          <AlertTriangle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-red-700">
            <strong>Cross-GSTIN transfer flagged.</strong> This transfer moves stock between different GST registrations. Ensure e-way bill and delivery challan documents are attached before confirming.
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border p-5 space-y-4"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      >
        <div>
          <label className="block text-xs font-semibold text-[var(--text-2)] mb-1.5">Material Lot *</label>
          <select
            required
            value={selectedLot}
            onChange={e => setSelectedLot(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            <option value="">Select an accepted lot to transfer…</option>
            {availableLots.map(l => (
              <option key={l.id} value={l.id}>
                {l.lotNumber} · {l.materialName} · {l.primaryQty} {l.primaryUom} · {l.storeLocationName}
              </option>
            ))}
          </select>
        </div>

        {lotObj && (
          <div
            className="flex items-center gap-4 p-3 rounded-lg text-sm"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <div className="text-center">
              <div className="text-[11px] text-[var(--text-2)] mb-1">From</div>
              <div className="font-semibold text-[var(--text)] text-xs">{placeOf(lotObj.storeLocationId ? storeLocations.find(s => s.id === lotObj.storeLocationId)?.siteId ?? '' : '', lotObj.storeLocationName)}</div>
            </div>
            <ArrowRight size={16} className="text-[var(--brand)] flex-shrink-0 mx-auto" />
            <div className="text-center flex-1">
              <div className="text-[11px] text-[var(--text-2)] mb-1">To</div>
              {toLocation
                ? <div className="font-semibold text-[var(--brand)] text-xs">{(() => { const sl = storeLocations.find(s => s.id === toLocation); return sl ? placeOf(sl.siteId, sl.name) : '—'; })()}</div>
                : <div className="text-xs text-[var(--text-2)]">Select below</div>
              }
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-[var(--text-2)] mb-1.5">Quantity to dispatch *</label>
          <div className="flex items-center gap-2">
            <input type="number" min="0.01" max={lotObj?.primaryQty ?? undefined} step="any" required value={quantity}
              onChange={e => setQuantity(e.target.value)} placeholder={lotObj ? String(lotObj.primaryQty) : 'Select a lot first'}
              className="flex-1 px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--border)', color: 'var(--text)' }} />
            <span className="text-xs text-[var(--text-2)]">{lotObj?.primaryUom ?? 'UOM'}</span>
          </div>
          {lotObj && <p className="text-[11px] text-[var(--text-3)] mt-1">Available in selected lot: {lotObj.primaryQty} {lotObj.primaryUom}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--text-2)] mb-1.5">Destination Location *</label>
          <select
            required
            value={toLocation}
            onChange={e => setToLocation(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            <option value="">Select destination…</option>
            {storeLocations
              .filter(sl => !lotObj || sl.id !== lotObj.storeLocationId)
              .map(sl => (
                <option key={sl.id} value={sl.id}>
                  {placeOf(sl.siteId, sl.name)} ({sl.locationType})
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--text-2)] mb-1.5">Transfer Note</label>
          <textarea
            value={transferNote}
            onChange={e => setTransferNote(e.target.value)}
            rows={2}
            placeholder="Optional reason or reference…"
            className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 resize-none"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/inventory')}
            className="btn-ghost"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitted || !selectedLot || !toLocation || !quantity || Number(quantity) <= 0 || Number(quantity) > (lotObj?.primaryQty ?? 0)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition disabled:opacity-40"
            style={{ background: 'var(--brand-fill)' }}
          >
            {submitted ? <CheckCircle size={14} /> : <Layers size={14} />}
            {submitted ? 'Dispatched' : 'Dispatch Transfer'}
          </button>
        </div>
      </form>
    </div>
  );
}
