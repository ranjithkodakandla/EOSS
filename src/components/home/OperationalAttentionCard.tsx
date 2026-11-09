import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import RecordSheet from '../layout/RecordSheet';
import {
  buildAttentionItems, dismissAttention, isAttentionHidden, snoozeAttention,
  type AttentionItem,
} from '../../domain/attentionItems';
import { DEMO_DATE } from '../../domain/recordLists';

const PREVIEW = 4;

const DOT = {
  critical: 'var(--error, #DC2626)',
  watch: 'var(--warning, #D97706)',
};

function Row({ item, onHide }: { item: AttentionItem; onHide: () => void }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-2 py-1.5 min-w-0">
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: DOT[item.severity] }} />
      <button
        type="button"
        onClick={() => navigate(item.recordPath)}
        className="min-w-0 flex-1 text-left"
      >
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)]">{item.stage}</span>
        <span className="block text-[13px] font-medium text-[var(--text)] leading-snug truncate">{item.text}</span>
      </button>
      <button
        type="button"
        onClick={() => navigate(item.actionPath)}
        className="flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold text-white"
        style={{ background: 'var(--brand-fill)' }}
      >
        {item.actionLabel}
      </button>
      <button
        type="button"
        onClick={onHide}
        className="flex-shrink-0 text-[10px] font-medium text-[var(--text-3)] hover:text-[var(--text)]"
        title="Hide until tomorrow"
      >
        Later
      </button>
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
  }, now).filter(item => !isAttentionHidden(item.id, now));
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
      className="p-3 rounded-2xl border flex flex-col h-full min-h-0"
      style={{ background: 'var(--card-gradient, var(--surface))', borderColor: 'var(--border)' }}
    >
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <h3 className="text-sm font-bold text-[var(--text)] tracking-tight">Needs attention</h3>
        {items.length > PREVIEW && (
          <button type="button" onClick={() => setShowAll(true)} className="text-[11px] font-semibold text-[var(--text-3)] hover:text-[var(--brand)]">
            View all {items.length}
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-[var(--text-2)] py-2">Nothing is waiting on you right now.</p>
      ) : (
        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {preview.map(item => (
            <Row key={item.id} item={item} onHide={() => hide(item.id)} />
          ))}
        </div>
      )}

      {showAll && (
        <RecordSheet
          title="Needs attention"
          subtitle={`${items.length} record${items.length === 1 ? '' : 's'} waiting on a next step`}
          onClose={() => setShowAll(false)}
          width="lg"
        >
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {items.map(item => (
              <div key={item.id} className="flex items-start gap-1">
                <div className="flex-1 min-w-0">
                  <Row item={item} onHide={() => hide(item.id)} />
                </div>
                <button
                  type="button"
                  onClick={() => done(item.id)}
                  className="mt-3 text-[10px] font-medium text-[var(--text-3)] hover:text-[var(--text)]"
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
