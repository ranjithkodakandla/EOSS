import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Layers, AlertTriangle, CheckCircle } from 'lucide-react';
import { useStore } from '../../store';

export default function StockTransfer() {
  const navigate = useNavigate();
  const { lots, storeLocations, transferLot, currentUser } = useStore();

  const [selectedLot, setSelectedLot] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [transferNote, setTransferNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const availableLots = lots.filter(l => l.status === 'available' || l.status === 'reserved');
  const lotObj = lots.find(l => l.id === selectedLot);

  const isCrossGstin = false; // In prototype: flag when from/to sites differ — placeholder

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLot || !toLocation) return;
    const toLocName = storeLocations.find(sl => sl.id === toLocation)?.name ?? toLocation;
    transferLot(selectedLot, toLocName, currentUser.name);
    setSubmitted(true);
    setTimeout(() => navigate('/inventory'), 1500);
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
          Move a material lot between store locations within the same site.
        </p>
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
            <option value="">Select a lot to transfer…</option>
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
              <div className="font-semibold text-[var(--text)] text-xs">{lotObj.storeLocationName}</div>
            </div>
            <ArrowRight size={16} className="text-[var(--brand)] flex-shrink-0 mx-auto" />
            <div className="text-center flex-1">
              <div className="text-[11px] text-[var(--text-2)] mb-1">To</div>
              {toLocation
                ? <div className="font-semibold text-[var(--brand)] text-xs">{storeLocations.find(sl => sl.id === toLocation)?.name ?? '—'}</div>
                : <div className="text-xs text-[var(--text-2)]">Select below</div>
              }
            </div>
          </div>
        )}

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
              .filter(sl => !lotObj || sl.name !== lotObj.storeLocationName)
              .map(sl => (
                <option key={sl.id} value={sl.id}>
                  {sl.name} ({sl.locationType})
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
            className="px-4 py-2 rounded-lg text-sm font-semibold border cursor-pointer hover:bg-[var(--surface-2)] transition"
            style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitted || !selectedLot || !toLocation}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition disabled:opacity-40"
            style={{ background: 'var(--brand)' }}
          >
            {submitted ? <CheckCircle size={14} /> : <Layers size={14} />}
            {submitted ? 'Transferred' : 'Confirm Transfer'}
          </button>
        </div>
      </form>
    </div>
  );
}
