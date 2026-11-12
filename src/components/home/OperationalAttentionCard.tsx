import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, Package, ClipboardCheck, FileText, MoreVertical, Clock,
} from 'lucide-react';
import { useStore } from '../../store';
import RecordSheet from '../layout/RecordSheet';
import {
  buildAttentionItems, dismissAttention, isAttentionHidden, snoozeAttention,
  type AttentionItem,
} from '../../domain/attentionItems';
import { DEMO_DATE } from '../../domain/recordLists';

const PREVIEW = 5;

function RowIcon({ stage, severity }: { stage: AttentionItem['stage']; severity: AttentionItem['severity'] }) {
  const color = severity === 'critical' ? 'var(--error, #DC2626)' : 'var(--warning, #D97706)';
  if (stage === 'Material') return <Package size={14} className="flex-shrink-0" style={{ color }} />;
  if (stage === 'Inspection' || stage === 'Quality hold' || stage === 'Defect report') {
    return <ClipboardCheck size={14} className="flex-shrink-0" style={{ color }} />;
  }
  if (stage === 'Shop floor' || stage === 'Machine') {
    return <AlertTriangle size={14} className="flex-shrink-0" style={{ color }} />;
  }
  return <FileText size={14} className="flex-shrink-0" style={{ color }} />;
}

function splitRecordLink(text: string): { before: string; refId?: string; after: string } {
  const m = text.match(/\b((?:J|DP)-\d+|(?:PR|INSP|NCR|SPO|GRN|LOT|ME)-\d+-[\w-]+)\b/);
  if (!m || m.index == null) return { before: text, after: '' };
  return {
    before: text.slice(0, m.index),
    refId: m[1],
    after: text.slice(m.index + m[1].length),
  };
}

function Row({ item, onHide }: { item: AttentionItem; onHide: () => void }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { before, refId, after } = splitRecordLink(item.text);

  return (
    <div className="flex items-center gap-2 py-1.5 min-w-0 relative">
      <RowIcon stage={item.stage} severity={item.severity} />
      <div className="min-w-0 flex-1 text-[13px] text-[var(--text)] truncate">
        <span>{before}</span>
        {refId && (
          <button
            type="button"
            onClick={() => navigate(item.recordPath)}
            className="font-mono text-xs font-bold text-[var(--brand)] hover:underline"
          >
            {refId}
          </button>
        )}
        <span>{after}</span>
      </div>
      <button
        type="button"
        onClick={() => navigate(item.actionPath)}
        className="flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold text-white"
        style={{ background: 'var(--brand-fill)' }}
      >
        {item.actionLabel}
      </button>
      <div className="relative flex-shrink-0">
        <button
          type="button"
          onClick={() => setMenuOpen(o => !o)}
          className="p-1 rounded-md text-[var(--text-3)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]"
          aria-label="More actions"
        >
          <MoreVertical size={13} />
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
            <div
              className="absolute right-0 mt-1 w-28 rounded-lg border shadow-lg z-30 py-1"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <button
                type="button"
                onClick={() => { setMenuOpen(false); onHide(); }}
                className="w-full px-3 py-1.5 text-left text-xs text-[var(--text-2)] hover:bg-[var(--surface-2)] inline-flex items-center gap-1.5"
              >
                <Clock size={12} /> Later
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function OperationalAttentionCard() {
  const store = useStore();
  const now = DEMO_DATE();
  const [hiddenTick, setHiddenTick] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const items = buildAttentionItems({
    jobs: store.jobs,
    jobBlockers: store.jobBlockers,
    jobMaterialReqs: store.jobMaterialReqs,
    inventory: store.inventory,
    materials: store.materials,
    assets: store.assets,
    meterReadings: store.meterReadings,
    maintenanceEvents: store.maintenanceEvents,
    inspections: store.inspections,
    ncrs: store.ncrs,
    documents: store.documents,
    qualityReleases: store.qualityReleases,
    dispatches: store.dispatches,
    purchaseReqs: store.purchaseReqs,
    approvalRequests: store.approvalRequests,
  }, now).filter(item => item.stage !== 'Approvals' && !isAttentionHidden(item.id, now));
  void hiddenTick;

  const hide = (id: string) => {
    snoozeAttention(id, now);
    setHiddenTick(n => n + 1);
  };
  const done = (id: string) => {
    dismissAttention(id);
    setHiddenTick(n => n + 1);
  };

  const preview = items.slice(0, PREVIEW);

  return (
    <div
      className="p-3.5 rounded-2xl border flex flex-col h-full min-h-0"
      style={{ background: 'var(--card-gradient, var(--surface))', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-[var(--text)] tracking-tight">Today</h3>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--surface-2)', color: 'var(--text-2)' }}>
            {items.length}
          </span>
        </div>
        {items.length > 0 && (
          <button type="button" onClick={() => setShowAll(true)} className="text-[11px] font-semibold text-[var(--brand)] hover:underline">
            View all ({items.length})
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-[var(--text-2)] py-2">Nothing needs attention right now.</p>
      ) : (
        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {preview.map(item => (
            <Row key={item.id} item={item} onHide={() => hide(item.id)} />
          ))}
        </div>
      )}

      {showAll && (
        <RecordSheet
          title="Today — Needs attention"
          subtitle={`${items.length} record${items.length === 1 ? '' : 's'} sorted by urgency`}
          onClose={() => setShowAll(false)}
          width="lg"
        >
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-1">
                <div className="flex-1 min-w-0">
                  <Row item={item} onHide={() => hide(item.id)} />
                </div>
                <button
                  type="button"
                  onClick={() => done(item.id)}
                  className="text-[10px] font-medium text-[var(--text-3)] hover:text-[var(--text)] px-1"
                >
                  Done
                </button>
              </div>
            ))}
          </div>
        </RecordSheet>
      )}
    </div>
  );
}
