import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Link2 } from 'lucide-react';
import StatusChip from '../layout/StatusChip';

export interface RelatedRecordLink {
  relationship: 'Upstream' | 'Downstream' | 'Origin' | 'Related';
  typeLabel: string;
  reference: string;
  to?: string;
  status?: string;
  meta?: string;
  state?: Record<string, unknown>;
}

interface Props {
  title?: string;
  originNote?: string;
  records: RelatedRecordLink[];
  emptyMessage?: string;
}

export default function RelatedRecordsPanel({
  title = 'Connected Transaction Traceability',
  originNote,
  records,
  emptyMessage = 'Standalone record — no upstream or downstream documents linked yet.',
}: Props) {
  return (
    <div className="rounded-xl border overflow-hidden mb-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <div className="px-4 py-3 border-b flex items-center justify-between gap-2 flex-wrap" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
        <div className="flex items-center gap-2">
          <Link2 size={14} className="text-[var(--brand)]" />
          <h3 className="font-semibold text-sm text-[var(--text)]">{title}</h3>
        </div>
        {originNote && (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text-2)]">
            {originNote}
          </span>
        )}
      </div>
      {records.length === 0 ? (
        <p className="p-4 text-xs text-[var(--text-3)]">{emptyMessage}</p>
      ) : (
        <div className="divide-y divide-[var(--border)]">
          {records.map((rec, idx) => (
            <div key={`${rec.typeLabel}-${rec.reference}-${idx}`} className="px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-3)] whitespace-nowrap">
                  {rec.relationship}
                </span>
                <span className="text-xs text-[var(--text-3)] whitespace-nowrap">{rec.typeLabel}</span>
                {rec.to ? (
                  <Link
                    to={rec.to}
                    state={rec.state}
                    className="font-mono text-xs font-bold text-[var(--brand)] hover:underline inline-flex items-center gap-1"
                  >
                    {rec.reference}
                    <ArrowRight size={11} />
                  </Link>
                ) : (
                  <span className="font-mono text-xs font-semibold text-[var(--text)]">{rec.reference}</span>
                )}
                {rec.meta && <span className="text-xs text-[var(--text-2)] truncate">· {rec.meta}</span>}
              </div>
              {rec.status && <StatusChip status={rec.status} size="sm" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
