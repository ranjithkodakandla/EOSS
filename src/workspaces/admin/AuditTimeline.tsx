import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { History, Search, ChevronDown, ChevronRight, ExternalLink, ArrowUpDown, Filter, RotateCcw } from 'lucide-react';
import { useStore } from '../../store';
import {
  extractEventChanges,
  formatRoleLabel,
  getAuditActionLabel,
  getAuditEntityRoute,
  getAuditModule,
  getAuditScopeLabel,
} from '../../domain/audit';

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

export default function AuditTimeline() {
  const { auditEvents } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [scopeFilter, setScopeFilter] = useState('All');
  const [actionFilter, setActionFilter] = useState('All');
  const [actorFilter, setActorFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [newestFirst, setNewestFirst] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const enriched = useMemo(() => auditEvents.map((e) => ({
    ...e,
    moduleLabel: getAuditModule(e.scope, e.module),
    scopeLabel: getAuditScopeLabel(e.scope),
    actionLabel: getAuditActionLabel(e.action),
    roleLabel: formatRoleLabel(e.role, e.actorId),
    changesList: extractEventChanges(e),
    route: getAuditEntityRoute(e.scope, e.entityId),
  })), [auditEvents]);

  const modules = useMemo(() => ['All', ...Array.from(new Set(enriched.map(e => e.moduleLabel))).sort()], [enriched]);
  const scopes = useMemo(() => ['All', ...Array.from(new Set(enriched.map(e => e.scope))).sort()], [enriched]);
  const actions = useMemo(() => ['All', ...Array.from(new Set(enriched.map(e => e.action))).sort()], [enriched]);
  const actors = useMemo(() => ['All', ...Array.from(new Set(enriched.map(e => e.actor))).sort()], [enriched]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return enriched
      .filter((e) => {
        if (moduleFilter !== 'All' && e.moduleLabel !== moduleFilter) return false;
        if (scopeFilter !== 'All' && e.scope !== scopeFilter) return false;
        if (actionFilter !== 'All' && e.action !== actionFilter) return false;
        if (actorFilter !== 'All' && e.actor !== actorFilter) return false;
        const day = e.timestamp.slice(0, 10);
        if (dateFrom && day < dateFrom) return false;
        if (dateTo && day > dateTo) return false;
        if (q) {
          const hit = (
            e.entityRef.toLowerCase().includes(q)
            || e.actor.toLowerCase().includes(q)
            || e.actionLabel.toLowerCase().includes(q)
            || e.scopeLabel.toLowerCase().includes(q)
            || (e.description ?? '').toLowerCase().includes(q)
            || (e.reason ?? '').toLowerCase().includes(q)
            || (e.relatedEntityRef ?? '').toLowerCase().includes(q)
          );
          if (!hit) return false;
        }
        return true;
      })
      .sort((a, b) => (newestFirst ? b.timestamp.localeCompare(a.timestamp) : a.timestamp.localeCompare(b.timestamp)));
  }, [enriched, moduleFilter, scopeFilter, actionFilter, actorFilter, dateFrom, dateTo, search, newestFirst]);

  const resetFilters = () => {
    setSearch('');
    setModuleFilter('All');
    setScopeFilter('All');
    setActionFilter('All');
    setActorFilter('All');
    setDateFrom('');
    setDateTo('');
    if (searchParams.has('search')) setSearchParams({});
  };

  const toggleExpand = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-[var(--text)] flex items-center gap-2">
            <History size={20} className="text-[var(--brand)]" />
            Business Activity & Audit Trail
          </h1>
          <p className="text-sm text-[var(--text-2)] mt-0.5">
            Append-only history across Sales, Procurement, Inventory, Quality, Production, Dispatch, Maintenance, Finance, and Master Data.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setNewestFirst(v => !v)}
          className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs font-medium text-[var(--text-2)] hover:text-[var(--text)] inline-flex items-center gap-1.5"
        >
          <ArrowUpDown size={13} />
          {newestFirst ? 'Newest first' : 'Oldest first'}
        </button>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3.5">
          <div className="text-xs text-[var(--text-3)]">Total Audit Events</div>
          <div className="text-2xl font-bold text-[var(--text)] mt-1">{auditEvents.length}</div>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3.5">
          <div className="text-xs text-[var(--text-3)]">Matching Current Filter</div>
          <div className="text-2xl font-bold text-[var(--brand)] mt-1">{filtered.length}</div>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3.5">
          <div className="text-xs text-[var(--text-3)]">Field-Level Change Events</div>
          <div className="text-2xl font-bold text-[var(--text)] mt-1">{enriched.filter(e => e.changesList.length > 0).length}</div>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3.5">
          <div className="text-xs text-[var(--text-3)]">Approvals, Holds & Reversals</div>
          <div className="text-2xl font-bold text-[var(--text)] mt-1">
            {enriched.filter(e => ['approve', 'reject', 'void', 'reverse', 'hold', 'dispute', 'cancel'].includes(e.action)).length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs font-semibold text-[var(--text-2)] inline-flex items-center gap-1.5">
            <Filter size={13} /> Search & Filters
          </span>
          {(search || moduleFilter !== 'All' || scopeFilter !== 'All' || actionFilter !== 'All' || actorFilter !== 'All' || dateFrom || dateTo) && (
            <button type="button" onClick={resetFilters} className="text-xs font-medium text-[var(--brand)] hover:underline inline-flex items-center gap-1">
              <RotateCcw size={11} /> Clear filters
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
          <div className="sm:col-span-2 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference #, actor, description, reason…"
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] placeholder:text-[var(--text-3)] focus:outline-none focus:border-[var(--brand)]"
            />
          </div>
          <select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} aria-label="Filter by module"
            className="px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text)]">
            {modules.map(m => <option key={m} value={m}>{m === 'All' ? 'All Modules' : m}</option>)}
          </select>
          <select value={scopeFilter} onChange={(e) => setScopeFilter(e.target.value)} aria-label="Filter by record type"
            className="px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text)]">
            {scopes.map(sc => <option key={sc} value={sc}>{sc === 'All' ? 'All Record Types' : getAuditScopeLabel(sc)}</option>)}
          </select>
          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} aria-label="Filter by action"
            className="px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text)]">
            {actions.map(ac => <option key={ac} value={ac}>{ac === 'All' ? 'All Actions' : getAuditActionLabel(ac)}</option>)}
          </select>
          <select value={actorFilter} onChange={(e) => setActorFilter(e.target.value)} aria-label="Filter by actor"
            className="px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text)]">
            {actors.map(actor => <option key={actor} value={actor}>{actor === 'All' ? 'All Users / Actors' : actor}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-3 flex-wrap text-xs text-[var(--text-2)]">
          <label className="inline-flex items-center gap-1.5">
            <span>From:</span>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-2 py-1 rounded border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text)]" />
          </label>
          <label className="inline-flex items-center gap-1.5">
            <span>To:</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-2 py-1 rounded border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text)]" />
          </label>
        </div>
      </div>

      {/* Timeline list */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-10 text-center text-sm text-[var(--text-3)]">
            No audit events match the selected criteria.
          </div>
        ) : (
          filtered.map((e) => {
            const isExpanded = expanded[e.id] ?? false;
            const relRoute = e.relatedEntityType && e.relatedEntityId
              ? getAuditEntityRoute(e.relatedEntityType, e.relatedEntityId)
              : null;

            return (
              <div key={e.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)]">
                      {e.moduleLabel}
                    </span>
                    <span className="text-xs font-medium text-[var(--text-2)]">{e.scopeLabel}</span>
                    {e.route ? (
                      <Link to={e.route} className="font-mono text-xs font-bold text-[var(--brand)] hover:underline inline-flex items-center gap-1">
                        {e.entityRef} <ExternalLink size={11} />
                      </Link>
                    ) : (
                      <span className="font-mono text-xs font-bold text-[var(--text)]">{e.entityRef}</span>
                    )}
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--info-bg)] text-[var(--info)]">
                      {e.actionLabel}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--text-3)] font-mono">{fmtDateTime(e.timestamp)}</span>
                </div>

                {e.description && (
                  <p className="text-sm text-[var(--text)] mt-2">{e.description}</p>
                )}

                <div className="flex items-center gap-3 flex-wrap mt-2 text-xs text-[var(--text-2)]">
                  <span>Actor: <strong className="text-[var(--text)]">{e.actor}</strong></span>
                  <span className="px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-2)]">Role: {e.roleLabel}</span>
                  <span className="text-[var(--text-3)]">Ref ID: <span className="font-mono">{e.id}</span></span>
                  {e.relatedEntityRef && (
                    <span>
                      Linked Record:{' '}
                      {relRoute ? (
                        <Link to={relRoute} className="font-mono font-semibold text-[var(--brand)] hover:underline">
                          {e.relatedEntityRef}
                        </Link>
                      ) : (
                        <span className="font-mono font-semibold text-[var(--text)]">{e.relatedEntityRef}</span>
                      )}
                    </span>
                  )}
                </div>

                {e.reason && (
                  <div className="mt-2 px-3 py-1.5 rounded-lg bg-[var(--surface-2)] text-xs text-[var(--text-2)]">
                    <span className="font-semibold text-[var(--text)]">Reason:</span> {e.reason}
                  </div>
                )}

                {e.changesList.length > 0 && (
                  <div className="mt-2.5">
                    <button
                      type="button"
                      onClick={() => toggleExpand(e.id)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[var(--brand)] hover:underline"
                    >
                      {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                      {isExpanded ? 'Hide' : 'Inspect'} {e.changesList.length} changed field{e.changesList.length === 1 ? '' : 's'}
                    </button>
                    {isExpanded && (
                      <div className="mt-2 overflow-x-auto rounded-lg border border-[var(--border)]">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-[var(--border)] bg-[var(--surface-2)] text-left text-[var(--text-3)]">
                              <th className="px-3 py-1.5 font-medium">Field</th>
                              <th className="px-3 py-1.5 font-medium">Previous value</th>
                              <th className="px-3 py-1.5 font-medium">New value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {e.changesList.map((c, idx) => (
                              <tr key={`${e.id}-${c.field}-${idx}`} className="border-b last:border-b-0 border-[var(--border)]">
                                <td className="px-3 py-1.5 font-medium text-[var(--text)]">{c.label}</td>
                                <td className="px-3 py-1.5 text-[var(--text-3)] line-through">{c.previousValue}</td>
                                <td className="px-3 py-1.5 font-semibold text-[var(--text)]">{c.newValue}</td>
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
          })
        )}
      </div>
    </div>
  );
}
