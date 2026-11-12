import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { History, ChevronDown, ChevronRight, ArrowUpDown, ExternalLink, Search } from 'lucide-react';
import { useStore } from '../../store';
import {
  extractEventChanges,
  formatRoleLabel,
  getAuditActionLabel,
  getAuditEntityRoute,
  getAuditModule,
  getAuditScopeLabel,
} from '../../domain/audit';

interface RecordHistoryPanelProps {
  entityId: string;
  entityRef?: string;
  relatedIds?: string[];
  relatedRefs?: string[];
  scopes?: string[];
  title?: string;
  subtitle?: string;
}

const fmtDateTime = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function RecordHistoryPanel({
  entityId,
  entityRef,
  relatedIds = [],
  relatedRefs = [],
  scopes,
  title = 'Activity & Audit History',
  subtitle = 'Chronological record of actions, decisions, approvals, and field changes.',
}: RecordHistoryPanelProps) {
  const { auditEvents } = useStore();
  const [newestFirst, setNewestFirst] = useState(true);
  const [query, setQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const idSet = useMemo(() => new Set([entityId, ...relatedIds].filter(Boolean)), [entityId, relatedIds]);
  const refSet = useMemo(
    () => new Set([entityRef, ...relatedRefs].filter((x): x is string => Boolean(x)).map(x => x.toLowerCase())),
    [entityRef, relatedRefs]
  );

  const matchingEvents = useMemo(() => {
    const base = auditEvents.filter((e) => {
      if (scopes && scopes.length > 0 && !scopes.includes(e.scope)) {
        // Still allow events where relatedEntityId matches this record directly
        if (!e.relatedEntityId || !idSet.has(e.relatedEntityId)) return false;
      }
      const matchesId = idSet.has(e.entityId) || (e.relatedEntityId ? idSet.has(e.relatedEntityId) : false);
      const matchesRef = refSet.has(e.entityRef.toLowerCase()) || (e.relatedEntityRef ? refSet.has(e.relatedEntityRef.toLowerCase()) : false);
      return matchesId || matchesRef;
    });

    const searched = query.trim()
      ? base.filter((e) => {
          const q = query.trim().toLowerCase();
          return (
            e.actor.toLowerCase().includes(q)
            || getAuditActionLabel(e.action).toLowerCase().includes(q)
            || (e.description ?? '').toLowerCase().includes(q)
            || (e.reason ?? '').toLowerCase().includes(q)
            || e.entityRef.toLowerCase().includes(q)
          );
        })
      : base;

    return [...searched].sort((a, b) =>
      newestFirst ? b.timestamp.localeCompare(a.timestamp) : a.timestamp.localeCompare(b.timestamp)
    );
  }, [auditEvents, scopes, idSet, refSet, query, newestFirst]);

  const toggleExpand = (id: string) => setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text)] flex items-center gap-2">
            <History size={15} className="text-[var(--brand)]" />
            {title}
            <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] text-[var(--text-2)]">
              {matchingEvents.length}
            </span>
          </h3>
          {subtitle && <p className="text-xs text-[var(--text-3)] mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter history…"
              className="pl-7 pr-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text)] placeholder:text-[var(--text-3)] focus:outline-none focus:border-[var(--brand)] w-40"
            />
          </div>
          <button
            type="button"
            onClick={() => setNewestFirst(v => !v)}
            className="px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text-2)] hover:text-[var(--text)] inline-flex items-center gap-1"
          >
            <ArrowUpDown size={11} />
            {newestFirst ? 'Newest first' : 'Oldest first'}
          </button>
          <Link
            to={`/audit${entityRef ? `?search=${encodeURIComponent(entityRef)}` : ''}`}
            className="px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs font-medium text-[var(--brand)] hover:underline inline-flex items-center gap-1"
          >
            Global Audit <ExternalLink size={11} />
          </Link>
        </div>
      </div>

      <div className="p-4">
        {matchingEvents.length === 0 ? (
          <div className="py-6 text-center text-xs text-[var(--text-3)]">
            No audit activity recorded yet for {entityRef || 'this record'}. Actions performed here will appear chronologically.
          </div>
        ) : (
          <div className="space-y-3">
            {matchingEvents.map((ev) => {
              const changes = extractEventChanges(ev);
              const isExpanded = expandedIds[ev.id] ?? changes.length <= 3;
              const actionLabel = getAuditActionLabel(ev.action);
              const scopeLabel = getAuditScopeLabel(ev.scope);
              const moduleLabel = getAuditModule(ev.scope, ev.module);
              const roleLabel = ev.role ?? formatRoleLabel(undefined);
              const relRoute = ev.relatedEntityType && ev.relatedEntityId
                ? getAuditEntityRoute(ev.relatedEntityType, ev.relatedEntityId)
                : null;
              const isDirect = idSet.has(ev.entityId) && ev.entityId === entityId;

              return (
                <div key={ev.id} className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] text-[var(--text)]">
                        {actionLabel}
                      </span>
                      <span className="text-xs font-medium text-[var(--text-2)]">
                        {scopeLabel}
                        {!isDirect && ev.entityRef ? ` · ${ev.entityRef}` : ''}
                      </span>
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-3)]">
                        {moduleLabel}
                      </span>
                    </div>
                    <span className="text-xs text-[var(--text-3)] font-mono">{fmtDateTime(ev.timestamp)}</span>
                  </div>

                  {ev.description && (
                    <p className="text-sm text-[var(--text)] mt-1.5 leading-snug">{ev.description}</p>
                  )}

                  <div className="flex items-center gap-3 flex-wrap mt-1.5 text-xs text-[var(--text-2)]">
                    <span>
                      Actor: <strong className="text-[var(--text)]">{ev.actor}</strong>
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] text-[11px] text-[var(--text-2)]">
                      Role: {roleLabel}
                    </span>
                    {ev.relatedEntityRef && (
                      <span>
                        Related:{' '}
                        {relRoute ? (
                          <Link to={relRoute} className="font-mono font-semibold text-[var(--brand)] hover:underline">
                            {ev.relatedEntityRef}
                          </Link>
                        ) : (
                          <span className="font-mono font-semibold text-[var(--text)]">{ev.relatedEntityRef}</span>
                        )}
                      </span>
                    )}
                  </div>

                  {ev.reason && (
                    <div className="mt-2 px-2.5 py-1.5 rounded bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text-2)]">
                      <span className="font-semibold text-[var(--text)]">Reason:</span> {ev.reason}
                    </div>
                  )}

                  {changes.length > 0 && (
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => toggleExpand(ev.id)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-[var(--brand)] hover:underline"
                      >
                        {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                        {isExpanded ? 'Hide' : 'Show'} {changes.length} field change{changes.length === 1 ? '' : 's'}
                      </button>

                      {isExpanded && (
                        <div className="mt-2 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--surface)]">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-[var(--border)] bg-[var(--surface-2)] text-left text-[var(--text-3)]">
                                <th className="px-2.5 py-1.5 font-medium">Field</th>
                                <th className="px-2.5 py-1.5 font-medium">Previous value</th>
                                <th className="px-2.5 py-1.5 font-medium">New value</th>
                              </tr>
                            </thead>
                            <tbody>
                              {changes.map((c, idx) => (
                                <tr key={`${ev.id}-${c.field}-${idx}`} className="border-b last:border-b-0 border-[var(--border)]">
                                  <td className="px-2.5 py-1.5 font-medium text-[var(--text)]">{c.label}</td>
                                  <td className="px-2.5 py-1.5 text-[var(--text-3)] line-through decoration-[var(--text-3)]/40">{c.previousValue}</td>
                                  <td className="px-2.5 py-1.5 font-semibold text-[var(--text)]">{c.newValue}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
