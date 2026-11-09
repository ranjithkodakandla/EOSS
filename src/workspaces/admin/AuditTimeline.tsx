import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Shield } from 'lucide-react';
import { useStore } from '../../store';

const ACTION_COLOR: Record<string, string> = {
  approve: 'var(--success)', create: 'var(--brand)', update: 'var(--info)',
  complete: 'var(--success)', reject: 'var(--error)', delete: 'var(--error)',
};

export default function AuditTimeline() {
  const navigate = useNavigate();
  const { currentUser, auditEvents } = useStore();
  const [scopeFilter, setScopeFilter] = useState('all');

  if (!['owner', 'auditor'].includes(currentUser.role)) {
    return <div className="p-6 text-sm text-[var(--text-2)]">Audit access restricted to Owner and Auditor roles.</div>;
  }

  const scopes = Array.from(new Set(auditEvents.map(e => e.scope)));
  const filtered = [...auditEvents]
    .filter(e => scopeFilter === 'all' || e.scope === scopeFilter)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate('/admin')} className="text-[var(--text-3)] hover:text-[var(--text)] cursor-pointer"><ArrowLeft size={16} /></button>
        <div>
          <h1 className="text-lg font-bold text-[var(--text)]">Audit & Activity Timeline</h1>
          <p className="text-xs text-[var(--text-3)]">Append-only record of all system actions · {filtered.length} events</p>
        </div>
      </div>

      {/* Scope filter */}
      <div className="flex gap-2 flex-wrap mb-5">
        {['all', ...scopes].map(s => (
          <button
            key={s}
            onClick={() => setScopeFilter(s)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition ${scopeFilter === s ? 'text-white' : 'border'}`}
            style={scopeFilter === s ? { background: 'var(--brand-fill)' } : { borderColor: 'var(--border)', color: 'var(--text-2)' }}
          >
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      <div className="space-y-0 relative">
        <div className="absolute left-[22px] top-0 bottom-0 w-px bg-[var(--border)]" />
        {filtered.map((e, i) => (
          <div key={e.id} className="flex gap-4 pb-4 relative">
            <div className="w-11 flex-shrink-0 flex items-start justify-center pt-0.5">
              <div
                className="w-4 h-4 rounded-full border-2 bg-[var(--surface)] z-10"
                style={{ borderColor: ACTION_COLOR[e.action] ?? 'var(--border)' }}
              />
            </div>
            <div className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <div className="text-sm font-semibold text-[var(--text)] capitalize">{e.action} · {e.scope}</div>
                  <div className="text-xs text-[var(--text-3)] mt-0.5">{e.actor} · {e.source}</div>
                  {e.reason && <div className="text-xs text-[var(--text-2)] mt-0.5 italic">"{e.reason}"</div>}
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="font-mono text-xs text-[var(--brand)]">{e.entityRef}</span>
                  <div className="text-[11px] text-[var(--text-3)] mt-0.5">
                    {new Date(e.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
              {e.after && Object.keys(e.after).length > 0 && (
                <div className="mt-2 p-2 rounded-lg bg-[var(--surface-2)] text-[11px] font-mono text-[var(--text-3)]">
                  {JSON.stringify(e.after)}
                </div>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="pl-14 py-6 text-sm text-[var(--text-3)]">No events match current filter.</div>
        )}
      </div>
    </div>
  );
}
