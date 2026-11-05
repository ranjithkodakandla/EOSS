import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ClipboardList, CheckCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';

interface CountLine {
  invId: string;
  materialCode: string;
  materialName: string;
  locationName: string;
  systemQty: number;
  countedQty: string;
  uom: string;
}

export default function CycleCount() {
  const navigate = useNavigate();
  const { inventory, currentUser, showToast } = useStore();

  const [locationFilter, setLocationFilter] = useState('all');
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [lines, setLines] = useState<CountLine[]>([]);

  const locations = Array.from(new Set(inventory.map(i => i.locationName)));

  const handleStart = () => {
    const filtered = inventory.filter(i => locationFilter === 'all' || i.locationName === locationFilter);
    setLines(filtered.map(i => ({
      invId: i.id,
      materialCode: i.materialCode,
      materialName: i.materialName,
      locationName: i.locationName,
      systemQty: i.onHandQty,
      countedQty: '',
      uom: i.primaryUom,
    })));
    setStarted(true);
  };

  const updateCounted = (invId: string, val: string) => {
    setLines(prev => prev.map(l => l.invId === invId ? { ...l, countedQty: val } : l));
  };

  const variances = lines.filter(l => l.countedQty !== '' && Number(l.countedQty) !== l.systemQty);
  const counted = lines.filter(l => l.countedQty !== '').length;

  const handleSubmit = () => {
    setSubmitted(true);
    showToast({
      type: variances.length > 0 ? 'warning' : 'success',
      title: 'Cycle count submitted',
      body: variances.length > 0
        ? `${variances.length} variance(s) flagged for review.`
        : 'No variances found. Count reconciled.',
    });
    setTimeout(() => navigate('/inventory'), 1800);
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-5">
      <div>
        <button
          onClick={() => navigate('/inventory')}
          className="flex items-center gap-1.5 text-sm text-[var(--text-2)] hover:text-[var(--brand)] mb-3 cursor-pointer transition-colors"
        >
          <ArrowLeft size={14} /> Inventory
        </button>
        <div className="flex items-center gap-2">
          <ClipboardList size={20} className="text-[var(--brand)]" />
          <h1 className="text-xl font-bold text-[var(--text)]">Cycle Count</h1>
        </div>
        <p className="text-sm text-[var(--text-2)] mt-1">
          Physical count of a store location. Variances are flagged for approval before stock adjustment.
        </p>
      </div>

      {!started ? (
        <div
          className="rounded-2xl border p-6 space-y-4 max-w-md"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        >
          <h3 className="font-semibold text-[var(--text)]">Start Count Session</h3>
          <div>
            <label className="block text-xs font-semibold text-[var(--text-2)] mb-1.5">Store Location</label>
            <select
              value={locationFilter}
              onChange={e => setLocationFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              <option value="all">All Locations</option>
              {locations.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="text-xs text-[var(--text-2)]">
            Counted by: <strong>{currentUser.name}</strong> · {new Date().toLocaleDateString('en-IN')}
          </div>
          <button
            onClick={handleStart}
            className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition"
            style={{ background: 'var(--brand)' }}
          >
            Begin Count
          </button>
        </div>
      ) : (
        <>
          {/* Progress */}
          <div className="flex items-center gap-4 flex-wrap">
            <div
              className="rounded-xl px-4 py-2 text-sm"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <span className="text-[var(--text-2)]">Progress: </span>
              <strong className="text-[var(--text)]">{counted}/{lines.length}</strong>
            </div>
            {variances.length > 0 && (
              <div
                className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm text-amber-700"
                style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)' }}
              >
                <AlertTriangle size={14} />
                {variances.length} variance{variances.length > 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Count Table */}
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                  {['Material', 'Location', 'System Qty', 'Counted Qty', 'Variance'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-[var(--text-2)] font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lines.map((l, i) => {
                  const diff = l.countedQty !== '' ? Number(l.countedQty) - l.systemQty : null;
                  const hasVariance = diff !== null && diff !== 0;
                  return (
                    <tr
                      key={l.invId}
                      style={{
                        borderBottom: i < lines.length - 1 ? '1px solid var(--border)' : 'none',
                        background: hasVariance ? 'rgba(245,158,11,0.04)' : 'transparent',
                      }}
                    >
                      <td className="px-4 py-2.5">
                        <div className="font-semibold text-xs text-[var(--text)]">{l.materialName}</div>
                        <div className="text-[11px] text-[var(--text-2)]">{l.materialCode}</div>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-[var(--text-2)]">{l.locationName}</td>
                      <td className="px-4 py-2.5 text-xs font-semibold text-[var(--text)]">
                        {l.systemQty} {l.uom}
                      </td>
                      <td className="px-4 py-2.5">
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          value={l.countedQty}
                          onChange={e => updateCounted(l.invId, e.target.value)}
                          placeholder="Enter count"
                          className="w-24 px-2 py-1 rounded-lg border text-xs focus:outline-none focus:ring-2 text-right"
                          style={{ borderColor: hasVariance ? '#F59E0B' : 'var(--border)', color: 'var(--text)' }}
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        {diff !== null && (
                          <span
                            className={`text-xs font-bold ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-500' : 'text-[var(--text-2)]'}`}
                          >
                            {diff > 0 ? '+' : ''}{diff.toFixed(2)} {l.uom}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => { setStarted(false); setLines([]); }}
              className="px-4 py-2 rounded-lg text-sm font-semibold border cursor-pointer hover:bg-[var(--surface-2)] transition"
              style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
            >
              Discard
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitted || counted === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition disabled:opacity-40"
              style={{ background: 'var(--brand)' }}
            >
              {submitted ? <CheckCircle size={14} /> : <ClipboardList size={14} />}
              {submitted ? 'Submitted' : 'Submit Count'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
