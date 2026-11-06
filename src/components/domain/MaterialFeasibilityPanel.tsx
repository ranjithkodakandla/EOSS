import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, ArrowRightLeft, Package } from 'lucide-react';
import { useStore } from '../../store';
import { computeMaterialFeasibility } from '../../domain/materialFeasibility';
import SupplierRecommendationPanel from './SupplierRecommendationPanel';
import clsx from 'clsx';

interface Props {
  materialItemId: string;
  materialName: string;
  uom: string;
  requiredQty: number;
  assignedSiteId: string;
  isPreliminary?: boolean;
}

export default function MaterialFeasibilityPanel({ materialItemId, materialName, uom, requiredQty, assignedSiteId, isPreliminary }: Props) {
  const { lots, storeLocations, sites, supplierPos, supplierPoLines } = useStore();
  const navigate = useNavigate();
  const [showRecommend, setShowRecommend] = useState(false);

  const feasibility = computeMaterialFeasibility({
    materialItemId, uom, requiredQty, assignedSiteId, lots, storeLocations, sites, supplierPos, supplierPoLines, isPreliminary,
  });

  const ok = feasibility.shortage <= 0;

  return (
    <div className={clsx('rounded-xl border p-4 space-y-3', ok ? 'border-[var(--border)] bg-[var(--surface)]' : 'border-[var(--error-border)] bg-[var(--error-bg)]/10')}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {ok ? <CheckCircle2 size={15} className="text-[var(--success)]" /> : <AlertTriangle size={15} className="text-[var(--error)]" />}
          <span className="font-semibold text-sm text-[var(--text)]">{materialName}</span>
          {isPreliminary && <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[var(--surface-3)] text-[var(--text-3)]">Preliminary estimate</span>}
        </div>
        <span className="text-xs font-mono text-[var(--text-3)]">Required: {requiredQty} {uom}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
        <Stat label="Physical" value={`${feasibility.physicalOnHand} ${uom}`} />
        <Stat label="Reserved" value={`${feasibility.reserved} ${uom}`} />
        <Stat label="Available (eligible)" value={`${feasibility.available} ${uom}`} accent="success" />
        <Stat label="Shortage" value={`${feasibility.shortage} ${uom}`} accent={feasibility.shortage > 0 ? 'error' : undefined} />
        <Stat label="Incoming (SPO)" value={`${feasibility.incomingQty} ${uom}`} accent="info" />
      </div>

      {feasibility.incoming.length > 0 && (
        <div className="text-xs text-[var(--text-2)] space-y-1">
          {feasibility.incoming.map(i => (
            <div key={i.spoId} className="flex items-center justify-between">
              <span>
                <button onClick={() => navigate(`/procurement/spo/${i.spoId}`)} className="font-mono text-[var(--brand)] hover:underline">{i.spoNumber}</button>
                {' '}· {i.supplierName} · {i.pendingQty} {uom} pending
              </span>
              <span className="text-[var(--text-3)]">ETA {new Date(i.expectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
            </div>
          ))}
        </div>
      )}

      {feasibility.otherSiteStock.length > 0 && (
        <div className="text-xs text-[var(--text-2)] space-y-1 border-t border-[var(--border)] pt-2">
          <div className="font-semibold text-[var(--text-3)] uppercase text-[10px] tracking-wide">Other site stock (transferable, not automatically available)</div>
          {feasibility.otherSiteStock.map(b => (
            <div key={b.siteId} className="flex items-center justify-between">
              <span>{b.siteName}: {b.available} {uom} available{b.qcHold > 0 ? `, ${b.qcHold} ${uom} on QC hold` : ''}</span>
              {b.available > 0 && (
                <button onClick={() => navigate('/inventory/transfer')} className="text-[var(--brand)] hover:underline font-medium flex items-center gap-1">
                  <ArrowRightLeft size={11} /> Transfer
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="text-xs font-medium text-[var(--text)] border-t border-[var(--border)] pt-2 flex items-center justify-between gap-2 flex-wrap">
        <span>Recommended action: {feasibility.recommendedAction}</span>
        {feasibility.shortage > 0 && (
          <button onClick={() => setShowRecommend(v => !v)} className="text-[var(--brand)] hover:underline font-semibold whitespace-nowrap flex items-center gap-1">
            <Package size={12} /> {showRecommend ? 'Hide' : 'Find'} supplier
          </button>
        )}
      </div>

      {showRecommend && <SupplierRecommendationPanel materialItemId={materialItemId} />}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: 'success' | 'error' | 'info' }) {
  const color = accent === 'success' ? 'text-[var(--success)]' : accent === 'error' ? 'text-[var(--error)]' : accent === 'info' ? 'text-[var(--info)]' : 'text-[var(--text)]';
  return (
    <div className="p-2 rounded-lg bg-[var(--surface-muted)]">
      <div className="text-[10px] text-[var(--text-3)] font-medium">{label}</div>
      <div className={clsx('font-mono font-bold mt-0.5', color)}>{value}</div>
    </div>
  );
}
