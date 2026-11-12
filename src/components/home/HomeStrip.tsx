import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import {
  buildWeeklyActivities,
  type WeeklyActivity,
  type WeeklyActivityStatus,
} from '../../domain/weeklyActivities';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

const STATUS_STYLE: Record<WeeklyActivityStatus, { dot: string; label: string; border?: string }> = {
  completed: { dot: '#16A34A', label: 'Completed' },
  scheduled: { dot: '#2563EB', label: 'Scheduled' },
  upcoming: { dot: '#7C3AED', label: 'Upcoming' },
  pending: { dot: '#D97706', label: 'Pending', border: 'var(--warning-light, #FED7AA)' },
  overdue: { dot: '#DC2626', label: 'Overdue', border: 'var(--error-light, #FECACA)' },
};

function mondayOf(d: Date) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}

function isoDay(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export default function HomeStrip() {
  const navigate = useNavigate();
  const store = useStore();
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({});

  // Always use the browser's local date for dynamic TODAY / TOMORROW highlighting
  const now = new Date();
  const todayKey = isoDay(now);
  const tomorrowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const tomorrowKey = isoDay(tomorrowDate);
  const monday = mondayOf(now);

  const allActivities = useMemo(() => buildWeeklyActivities({
    jobs: store.jobs,
    purchaseReqs: store.purchaseReqs,
    supplierPos: store.supplierPos,
    grns: store.grns,
    inspections: store.inspections,
    dispatches: store.dispatches,
    invoices: store.invoices,
    supplierBills: store.supplierBills,
    assets: store.assets,
    quotations: store.quotations,
    customerPos: store.customerPos,
  }), [
    store.jobs, store.purchaseReqs, store.supplierPos, store.grns,
    store.inspections, store.dispatches, store.invoices, store.supplierBills,
    store.assets, store.quotations, store.customerPos,
  ]);

  const days = WEEKDAYS.map((label, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const key = isoDay(d);
    const dayItems = allActivities.filter(a => a.dayIndex === idx);
    const expanded = Boolean(expandedDays[idx]);
    const visible = expanded ? dayItems : dayItems.slice(0, 2);
    const extraCount = expanded ? 0 : Math.max(0, dayItems.length - 2);
    return {
      idx,
      key,
      label,
      dateNum: d.getDate(),
      isToday: key === todayKey,
      isTomorrow: key === tomorrowKey,
      visible,
      extraCount,
      totalCount: dayItems.length,
      expanded,
    };
  });

  const renderActivity = (act: WeeklyActivity) => {
    const st = STATUS_STYLE[act.status];
    const content = (
      <>
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] font-semibold text-[var(--text-3)]">{act.time}</span>
          <span className="inline-flex items-center gap-1 text-[9.5px] font-semibold" style={{ color: st.dot }}>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: st.dot }} />
            {st.label}
          </span>
        </div>
        <div className="text-[11px] font-semibold text-[var(--text)] truncate leading-tight">
          {act.title}
        </div>
        <div className="font-mono text-[10px] font-bold text-[var(--brand)] truncate">
          {act.ref}
        </div>
      </>
    );

    if (!act.path) {
      return (
        <div
          key={act.id}
          className="text-left px-2 py-1.5 rounded-lg border flex flex-col gap-0.5"
          style={{ background: 'var(--surface)', borderColor: st.border ?? 'var(--border)' }}
        >
          {content}
        </div>
      );
    }

    return (
      <button
        key={act.id}
        type="button"
        onClick={() => navigate(act.path!, { state: { from: '/' } })}
        className="text-left px-2 py-1.5 rounded-lg border flex flex-col gap-0.5 hover:border-[var(--brand)] transition-colors"
        style={{ background: 'var(--surface)', borderColor: st.border ?? 'var(--border)' }}
        title={`${act.time} — ${act.title} (${act.ref})`}
      >
        {content}
      </button>
    );
  };

  return (
    <section
      className="rounded-2xl border px-3 py-2.5 flex flex-col"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-[var(--text)] uppercase tracking-wider">This week</p>
      </div>
      <div className="overflow-x-auto">
        <div className="grid grid-cols-6 gap-2 min-w-[720px] md:min-w-0">
          {days.map(day => (
            <div
              key={day.key}
              className="rounded-xl border px-2 py-1.5 flex flex-col gap-1.5 min-h-[108px]"
              style={{
                borderColor: day.isToday ? 'var(--brand)' : 'var(--border)',
                background: day.isToday ? 'var(--brand-soft)' : 'var(--surface-2)',
              }}
            >
              <div className="flex items-center justify-between gap-1 text-[11px] font-bold">
                <span style={{ color: day.isToday ? 'var(--brand)' : 'var(--text-2)' }}>
                  {day.label} <span className="font-normal opacity-75">{day.dateNum}</span>
                </span>
                {day.isToday && (
                  <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--brand-fill)] text-white">
                    TODAY
                  </span>
                )}
                {!day.isToday && day.isTomorrow && (
                  <span
                    className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{ background: 'var(--surface)', color: 'var(--text-2)', border: '1px solid var(--border)' }}
                  >
                    TOMORROW
                  </span>
                )}
              </div>

              {day.visible.length === 0 ? (
                <span className="text-[11px] text-[var(--text-3)]">No scheduled items</span>
              ) : (
                <div className="flex flex-col gap-1">
                  {day.visible.map(renderActivity)}
                  {day.extraCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setExpandedDays(prev => ({ ...prev, [day.idx]: true }))}
                      className="text-left text-[10px] font-semibold text-[var(--brand)] hover:underline px-1 pt-0.5"
                    >
                      +{day.extraCount} more
                    </button>
                  )}
                  {day.expanded && day.totalCount > 2 && (
                    <button
                      type="button"
                      onClick={() => setExpandedDays(prev => ({ ...prev, [day.idx]: false }))}
                      className="text-left text-[10px] font-semibold text-[var(--text-3)] hover:underline px-1 pt-0.5"
                    >
                      Show less
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
