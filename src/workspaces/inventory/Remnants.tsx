import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Scissors, Trash2, Package, CheckCircle } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';

export default function Remnants() {
  const navigate = useNavigate();
  const { lots, showToast, setLotStatus } = useStore();

  const [filter, setFilter] = useState<'all' | 'remnants' | 'scrap'>('all');
  const [scrapTarget, setScrapTarget] = useState<string | null>(null);

  // Remnants: lots with parentLotId set; Scrap: lots in scrapped status
  const remnants = lots.filter(l => l.parentLotId);
  const scrapped = lots.filter(l => l.status === 'scrapped');

  const display = filter === 'remnants' ? remnants : filter === 'scrap' ? scrapped : [...remnants, ...scrapped.filter(s => !remnants.find(r => r.id === s.id))];

  const handleScrap = (lotId: string, lotNumber: string) => {
    setLotStatus(lotId, 'scrapped');
    setScrapTarget(null);
    showToast({ type: 'info', title: 'Lot scrapped', body: `${lotNumber} moved to Scrap. Stock reduced.` });
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
          <Scissors size={20} className="text-[var(--brand)]" />
          <h1 className="text-xl font-bold text-[var(--text)]">Remnants & Scrap</h1>
        </div>
        <p className="text-sm text-[var(--text-2)] mt-1">
          Off-cuts, partial lots, and scrapped material. Remnants can be re-issued or scrapped; scrap is tracked for disposal reporting.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: 'Remnant Lots', value: remnants.length, color: 'var(--brand)' },
          { label: 'Scrapped Lots', value: scrapped.length, color: '#EF4444' },
          { label: 'Reusable Remnants', value: remnants.filter(r => r.status === 'available').length, color: '#16A34A' },
        ].map(stat => (
          <div
            key={stat.label}
            className="rounded-xl p-3 border"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
          >
            <div className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-xs text-[var(--text-2)] mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'remnants', 'scrap'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize cursor-pointer transition ${filter === f ? 'text-white' : 'border'}`}
            style={filter === f
              ? { background: 'var(--brand)', border: 'none' }
              : { borderColor: 'var(--border)', color: 'var(--text-2)' }
            }
          >
            {f === 'all' ? 'All' : f === 'remnants' ? 'Remnants' : 'Scrap'}
          </button>
        ))}
      </div>

      {/* Table */}
      {display.length === 0 ? (
        <div className="text-center py-12 text-sm text-[var(--text-2)]">
          <Package size={32} className="mx-auto mb-2 opacity-30" />
          No items in this view.
        </div>
      ) : (
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                {['Lot', 'Material', 'Qty', 'Location', 'Type', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-[var(--text-2)] font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {display.map((lot, i) => (
                <tr
                  key={lot.id}
                  style={{ borderBottom: i < display.length - 1 ? '1px solid var(--border)' : 'none' }}
                >
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/inventory/lot/${lot.id}`)}
                      className="font-semibold text-[var(--brand)] hover:underline cursor-pointer text-xs"
                    >
                      {lot.lotNumber}
                    </button>
                    {lot.heatNumber && (
                      <div className="text-[11px] text-[var(--text-2)]">Heat: {lot.heatNumber}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--text)]">{lot.materialName}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-[var(--text)]">
                    {lot.primaryQty} {lot.primaryUom}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--text-2)]">{lot.storeLocationName}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${lot.parentLotId ? 'bg-purple-50 text-purple-700' : 'bg-red-50 text-red-700'}`}>
                      {lot.parentLotId ? 'Remnant' : 'Scrap'}
                    </span>
                  </td>
                  <td className="px-4 py-3"><StatusChip status={lot.status} /></td>
                  <td className="px-4 py-3">
                    {lot.status !== 'scrapped' && (
                      scrapTarget === lot.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleScrap(lot.id, lot.lotNumber)}
                            className="text-xs font-semibold text-red-600 hover:underline cursor-pointer"
                          >
                            Confirm Scrap
                          </button>
                          <button
                            onClick={() => setScrapTarget(null)}
                            className="text-xs text-[var(--text-2)] hover:underline cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setScrapTarget(lot.id)}
                          className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 cursor-pointer transition"
                        >
                          <Trash2 size={12} /> Scrap
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
