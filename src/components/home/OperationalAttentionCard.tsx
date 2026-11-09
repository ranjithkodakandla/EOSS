import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import {
  shortageItems, jobsShortOfMaterial, jobsAtRisk, jobsBlocked,
  openInspections, maintenanceOverdue, maintenanceDueSoon, documentsDue, DEMO_DATE,
} from '../../domain/recordLists';

type Tone = 'critical' | 'watch' | 'calm';

interface Item {
  id: string;
  label: string;
  short: string;
  value: number;
  path: string;
  tone: Tone;
  group: string;
}

const TONE = {
  critical: { color: 'var(--error, #DC2626)', wash: 'rgba(220, 38, 38, 0.08)', bar: '#DC2626' },
  watch: { color: 'var(--warning, #D97706)', wash: 'rgba(217, 119, 6, 0.1)', bar: '#D97706' },
  calm: { color: 'var(--text-2)', wash: 'var(--surface-2)', bar: 'var(--border)' },
};

export default function OperationalAttentionCard() {
  const navigate = useNavigate();
  const { jobs, inventory, assets, meterReadings, inspections, documents } = useStore();
  const now = DEMO_DATE();

  const items: Item[] = [
    { id: 'blocked', group: 'Floor', label: 'Blocked jobs', short: 'Blocked', value: jobsBlocked(jobs, now).length, path: '/jobs?risk=blocked', tone: 'critical' },
    { id: 'overdue', group: 'Machines', label: 'Overdue maintenance', short: 'Overdue', value: maintenanceOverdue(assets, meterReadings, now).length, path: '/assets?focus=overdue', tone: 'critical' },
    { id: 'short', group: 'Material', label: 'Material shortages', short: 'Shortages', value: shortageItems(inventory).length, path: '/inventory?focus=shortage', tone: 'critical' },
    { id: 'jobs-short', group: 'Material', label: 'Jobs short of material', short: 'Jobs short', value: jobsShortOfMaterial(jobs).length, path: '/jobs?focus=shortage', tone: 'critical' },
    { id: 'risk', group: 'Floor', label: 'Jobs at risk', short: 'At risk', value: jobsAtRisk(jobs, now).length, path: '/jobs?risk=watch', tone: 'watch' },
    { id: 'inspect', group: 'Release', label: 'Open inspections', short: 'Inspections', value: openInspections(inspections).length, path: '/quality?result=open', tone: 'watch' },
    { id: 'docs', group: 'Release', label: 'Documents due', short: 'Documents', value: documentsDue(documents, now).length, path: '/documents?attention=due', tone: 'watch' },
    { id: 'due', group: 'Machines', label: 'Maintenance due', short: 'Due soon', value: maintenanceDueSoon(assets, meterReadings, now).length, path: '/assets?focus=due', tone: 'watch' },
  ];

  const open = items.filter(i => i.value > 0);
  const urgent = open[0];
  const groups = ['Material', 'Machines', 'Floor', 'Release'];

  return (
    <div
      className="p-3 rounded-2xl border h-full flex flex-col min-h-0"
      style={{ background: 'var(--card-gradient, var(--surface))', borderColor: 'var(--border)' }}
    >
      <div className="flex items-baseline justify-between gap-2 mb-2 shrink-0">
        <h3 className="text-base font-bold text-[var(--text)] tracking-tight">Needs attention</h3>
        <span className="text-[11px] font-semibold text-[var(--text-3)]">{open.length === 0 ? 'Clear' : `${open.reduce((s, i) => s + i.value, 0)} items`}</span>
      </div>

      {open.length === 0 ? (
        <p className="text-sm text-[var(--text-2)]">Nothing is waiting on you right now.</p>
      ) : (
        <>
          {urgent && (
            <button
              type="button"
              onClick={() => navigate(urgent.path)}
              className="w-full text-left rounded-xl px-3 py-2 mb-2 shrink-0 flex items-center gap-3"
              style={{ background: TONE[urgent.tone].wash, boxShadow: `inset 3px 0 0 ${TONE[urgent.tone].bar}` }}
            >
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: TONE[urgent.tone].color }}>
                  Most urgent · {urgent.group}
                </div>
                <div className="text-sm font-semibold text-[var(--text)] truncate">{urgent.label}</div>
              </div>
              <div className="text-xl font-extrabold tabular-nums leading-none" style={{ color: TONE[urgent.tone].color }}>{urgent.value}</div>
            </button>
          )}
          <div className="grid grid-cols-2 gap-1.5 flex-1 min-h-0 content-start">
            {groups.map(group => {
              const rows = items.filter(i => i.group === group);
              return (
                <div key={group} className="rounded-xl border px-2.5 py-1.5 min-w-0" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)] mb-0.5">{group}</div>
                  {rows.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => item.value > 0 && navigate(item.path)}
                      disabled={item.value === 0}
                      className="w-full flex items-center gap-1.5 py-0.5 text-left disabled:opacity-40"
                    >
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: item.value > 0 ? TONE[item.tone].bar : 'var(--border)' }} />
                      <span className="flex-1 text-[12px] text-[var(--text)] truncate">{item.short}</span>
                      <span className="text-xs font-bold tabular-nums" style={{ color: item.value > 0 ? TONE[item.tone].color : 'var(--text-3)' }}>{item.value}</span>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
