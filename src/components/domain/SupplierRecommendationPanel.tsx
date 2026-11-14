import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Info } from 'lucide-react';
import { useStore, SUPPLIERS } from '../../store';
import { recommendSuppliers } from '../../domain/supplierRecommendation';
import clsx from 'clsx';

export default function SupplierRecommendationPanel({ materialItemId }: { materialItemId: string }) {
  const { supplierPos, supplierPoLines } = useStore();
  const navigate = useNavigate();
  const suppliers = SUPPLIERS;

  const result = recommendSuppliers({ materialItemId, supplierPos, supplierPoLines, suppliers });

  if (!result.hasSufficientHistory) {
    return (
      <div className="mt-2 p-3 rounded-lg bg-[var(--surface-muted)] text-xs text-[var(--text-2)] flex items-start gap-2">
        <Info size={13} className="mt-0.5 flex-shrink-0" />
        <span>{result.reason}</span>
      </div>
    );
  }

  return (
    <div className="mt-2 p-3 rounded-lg bg-[var(--surface-muted)] space-y-2">
      <div className="text-xs font-semibold text-[var(--text)]">{result.reason}</div>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px] text-left">
          <thead className="text-[var(--text-3)] font-mono">
            <tr>
              <th className="py-1 pr-3">Supplier</th>
              <th className="py-1 pr-3">Orders</th>
              <th className="py-1 pr-3">Avg Rate</th>
              <th className="py-1 pr-3">Avg Lead Time</th>
              <th className="py-1 pr-3">Rejection Rate</th>
            </tr>
          </thead>
          <tbody>
            {result.evidence.map(e => (
              <tr key={e.supplierId} className={clsx(e.supplierId === result.recommendedSupplierId && 'font-bold text-[var(--success)]')}>
                <td className="py-1 pr-3">
                  <button onClick={() => navigate(`/suppliers/${e.supplierId}`)} className="hover:underline text-left">{e.supplierName}</button>
                  {e.supplierId === result.recommendedSupplierId && <span className="ml-1 text-[10px] font-mono uppercase">Recommended</span>}
                </td>
                <td className="py-1 pr-3">{e.ordersCount}</td>
                <td className="py-1 pr-3 font-mono">₹{e.avgRate}</td>
                <td className="py-1 pr-3 font-mono">{e.avgLeadTimeDays != null ? `${e.avgLeadTimeDays}d` : '—'}</td>
                <td className="py-1 pr-3 font-mono">{e.rejectionRatePct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-[var(--text-3)]">You make the final supplier selection — BOSS does not auto-create a Supplier PO.</p>
    </div>
  );
}
