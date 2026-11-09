import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { DEMO_NOW } from '../../data/seed';
import { buildAttentionItems } from '../../domain/attentionItems';
import { computeProductionStatus } from '../../domain/productionStatus';
import type { Job } from '../../types';

export type HomeStripMode = 'week' | 'machines' | 'activity';

const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function parseDay(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

function isoDay(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function mondayOf(d: Date) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}

function shortParty(name: string) {
  return name.split(' ').slice(0, 2).join(' ');
}

function attentionIds() {
  const s = useStore.getState();
  const items = buildAttentionItems({
    jobs: s.jobs,
    jobBlockers: s.jobBlockers,
    jobMaterialReqs: s.jobMaterialReqs,
    inventory: s.inventory,
    materials: s.materials,
    assets: s.assets,
    meterReadings: s.meterReadings,
    maintenanceEvents: s.maintenanceEvents,
    inspections: s.inspections,
    ncrs: s.ncrs,
    documents: s.documents,
    qualityReleases: s.qualityReleases,
    dispatches: s.dispatches,
  });
  const ids = new Set<string>();
  for (const item of items) {
    const bits = item.recordPath.split(/[/?=&]/);
    bits.forEach(b => { if (b) ids.add(b); });
    const code = item.text.match(/\b([A-Z]{1,3}-\d+)\b/);
    if (code) ids.add(code[1]);
    const job = item.text.match(/\b(J-\d+)\b/);
    if (job) ids.add(job[1]);
  }
  return ids;
}

function shipTone(job: Job, now: Date) {
  const risk = computeProductionStatus(job, now).risk;
  return job.hasBlocker || risk === 'at_risk' || risk === 'delayed' || risk === 'blocked' ? 'risk' : 'ok';
}

export default function HomeStrip({ mode }: { mode: HomeStripMode }) {
  const navigate = useNavigate();
  const store = useStore();
  const now = parseDay(DEMO_NOW);
  const skip = attentionIds();

  return (
    <section
      className="h-full min-h-0 rounded-2xl border px-3 py-2.5 flex flex-col"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      {mode === 'week' && <Week now={now} skip={skip} onOpen={navigate} />}
      {mode === 'machines' && <Machines now={parseDay(DEMO_NOW)} skip={skip} onOpen={navigate} jobs={store.jobs} assets={store.assets} />}
      {mode === 'activity' && <Activity now={now} skip={skip} onOpen={navigate} />}
    </section>
  );
}

function Week({ now, skip, onOpen }: { now: Date; skip: Set<string>; onOpen: (p: string) => void }) {
  const { jobs, dispatches } = useStore();
  const start = mondayOf(now);
  const today = isoDay(now);
  const days = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = isoDay(d);
    const departures: { id: string; text: string; path: string; tone: 'ok' | 'risk' }[] = [];
    for (const dsp of dispatches) {
      if ((dsp.dispatchDate || '').slice(0, 10) !== key) continue;
      const jobNo = dsp.jobs?.[0];
      if (jobNo && (skip.has(jobNo) || skip.has(dsp.id))) continue;
      const job = jobs.find(j => j.jobNumber === jobNo || j.id === jobNo);
      const uom = job?.stages[job.stages.length - 1]?.uom ?? 'units';
      departures.push({
        id: dsp.id,
        text: `${jobNo ?? dsp.dispatchNumber} · ${shortParty(dsp.customerName)} · ${dsp.totalQty} ${uom}`,
        path: `/dispatch/${dsp.id}`,
        tone: dsp.status === 'delivered' || dsp.status === 'dispatched' ? 'ok' : 'risk',
      });
    }
    for (const job of jobs) {
      if ((job.plannedEnd || '').slice(0, 10) !== key) continue;
      if (job.status === 'cancelled' || skip.has(job.id) || skip.has(job.jobNumber)) continue;
      if (dispatches.some(d => (d.dispatchDate || '').slice(0, 10) === key && (d.jobs ?? []).includes(job.jobNumber))) continue;
      const last = job.stages[job.stages.length - 1];
      departures.push({
        id: job.id,
        text: `${job.jobNumber} · ${shortParty(job.customerName)} · ${last?.inputQty ?? ''} ${last?.uom ?? ''}`.trim(),
        path: `/jobs/${job.id}`,
        tone: shipTone(job, now),
      });
    }
    return { key, label: DAY[d.getDay()], date: d.getDate(), today: key === today, departures: departures.slice(0, 2) };
  });

  return (
    <div className="h-full min-h-0 flex flex-col">
      <p className="text-sm font-bold text-[var(--text)] mb-2 shrink-0">This week</p>
      <div className="flex-1 min-h-0 grid grid-cols-3 sm:grid-cols-6 gap-2">
        {days.map(day => (
          <div
            key={day.key}
            className="min-h-0 rounded-xl border px-2 py-1.5 flex flex-col"
            style={{
              borderColor: day.today ? 'var(--brand)' : 'var(--border)',
              background: day.today ? 'var(--surface-2)' : 'transparent',
              boxShadow: day.today ? 'inset 0 0 0 1px var(--brand)' : undefined,
            }}
          >
            <div className="text-[11px] font-bold text-[var(--text)] shrink-0">
              {day.label} <span className="font-medium text-[var(--text-3)]">{day.date}</span>
            </div>
            <div className="flex-1 min-h-0 flex flex-col justify-center gap-1 mt-1">
              {day.departures.length === 0 ? (
                <span className="text-sm text-[var(--text-3)]">—</span>
              ) : day.departures.map(item => (
                <button key={item.id} type="button" onClick={() => onOpen(item.path)} className="flex items-start gap-1.5 text-left min-w-0">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: item.tone === 'ok' ? 'var(--success, #16A34A)' : 'var(--warning, #D97706)' }} />
                  <span className="text-[11px] leading-snug text-[var(--text)] line-clamp-3">{item.text}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Machines({ now, skip, onOpen, jobs, assets }: {
  now: Date;
  skip: Set<string>;
  onOpen: (p: string) => void;
  jobs: Job[];
  assets: { id: string; assetCode: string; name: string; category?: string; workCentre?: string; status: string }[];
}) {
  const runningJob = (workCentre?: string) => {
    if (!workCentre) return undefined;
    return jobs.find(j => {
      if (j.status === 'complete' || j.status === 'cancelled') return false;
      return j.stages.some(st => st.status === 'in_progress' && st.workCentre === workCentre && (!st.actualStart || st.actualStart.slice(0, 10) <= isoDay(now)));
    });
  };

  const claimed = new Set<string>();
  const floor = new Set(['WM-01', 'WM-02', 'WM-03', 'PC-01', 'GC-01', 'AG-01']);
  const chips = assets
    .filter(a => floor.has(a.assetCode))
    .map(a => {
      const candidate = a.status === 'operational' ? runningJob(a.workCentre) : undefined;
      const primary = a.category !== 'Grinding Equipment' && a.category !== 'Material Handling';
      const job = candidate && primary && a.workCentre && !claimed.has(a.workCentre) ? candidate : undefined;
      if (job && a.workCentre) claimed.add(a.workCentre);
      let state: 'Running' | 'Idle' | 'Down' | 'Service due' = 'Idle';
      if (a.status === 'breakdown') state = 'Down';
      else if (a.status === 'in_maintenance') state = 'Service due';
      else if (job) state = 'Running';
      const dot = state === 'Running' ? 'var(--success, #16A34A)' : state === 'Idle' ? 'var(--text-3)' : state === 'Down' ? 'var(--error, #DC2626)' : 'var(--warning, #D97706)';
      return { ...a, state, dot, job };
    })
    .sort((a, b) => Number(b.state === 'Running') - Number(a.state === 'Running') || a.assetCode.localeCompare(b.assetCode))
    .slice(0, 6);

  return (
    <div className="h-full min-h-0 flex flex-col">
      <p className="text-sm font-bold text-[var(--text)] mb-2 shrink-0">Machines now</p>
      <div className="flex-1 min-h-0 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2">
        {chips.map(a => (
          <button
            key={a.id}
            type="button"
            onClick={() => onOpen(`/assets/${a.id}`)}
            className="h-full text-left rounded-xl border px-3 py-2 min-w-0 flex flex-col justify-center"
            style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: a.dot }} />
              <span className="text-xs font-bold text-[var(--text)] truncate">{a.assetCode}</span>
              <span className="text-[10px] font-semibold text-[var(--text-2)] ml-auto">{a.state}</span>
            </div>
            <div className="text-[11px] text-[var(--text-2)] truncate mt-0.5">{a.name}</div>
            {a.job && <div className="text-[11px] font-medium text-[var(--text)] truncate">{a.job.jobNumber} · {a.job.currentStage}</div>}
          </button>
        ))}
      </div>
    </div>
  );
}

function Activity({ now, skip, onOpen }: { now: Date; skip: Set<string>; onOpen: (p: string) => void }) {
  const { grns, inspections, jobs, rfqs, auditEvents } = useStore();
  const today = isoDay(now);
  const events: { at: string; text: string; path: string }[] = [];

  for (const g of grns) {
    if (!g.receivedDate || g.receivedDate > today || skip.has(g.id)) continue;
    events.push({ at: g.receivedDate, text: `GRN received from ${shortParty(g.supplierName)}`, path: `/procurement/grn/${g.id}` });
  }
  for (const ins of inspections) {
    if (ins.result !== 'pass' || !ins.date || ins.date > today || skip.has(ins.id)) continue;
    events.push({ at: ins.date, text: `${ins.inspectionNumber} passed`, path: `/quality/inspection/${ins.id}` });
  }
  for (const job of jobs) {
    if (skip.has(job.id) || skip.has(job.jobNumber)) continue;
    for (const st of job.stages) {
      const end = st.actualEnd?.slice(0, 10);
      if (!end || end > today || st.status !== 'complete') continue;
      events.push({ at: end, text: `${job.jobNumber} finished ${st.name}`, path: `/jobs/${job.id}` });
    }
  }
  for (const r of rfqs) {
    if (!r.receivedDate || r.receivedDate > today || skip.has(r.id)) continue;
    events.push({ at: r.receivedDate, text: `${r.rfqNumber} in from ${shortParty(r.customerName)}`, path: `/sales/rfq/${r.id}` });
  }
  for (const ev of auditEvents) {
    if (!ev.timestamp || ev.timestamp.slice(0, 10) > today) continue;
    if (skip.has(ev.entityId) || skip.has(ev.entityRef)) continue;
    if (ev.scope === 'Job' && ev.action === 'update') {
      events.push({ at: ev.timestamp.slice(0, 10), text: `${ev.entityRef} stage updated`, path: `/jobs/${ev.entityId}` });
    }
  }

  const latest = events
    .sort((a, b) => b.at.localeCompare(a.at) || a.text.localeCompare(b.text))
    .filter((ev, i, arr) => arr.findIndex(x => x.text === ev.text) === i)
    .slice(0, 5);

  const rel = (iso: string) => {
    const days = Math.round((now.getTime() - parseDay(iso).getTime()) / 86400000);
    if (days <= 0) return 'today';
    if (days === 1) return 'yesterday';
    return `${days} days ago`;
  };

  return (
    <div className="h-full min-h-0 flex flex-col">
      <p className="text-sm font-bold text-[var(--text)] mb-1 shrink-0">Recent activity</p>
      <div className="flex-1 min-h-0 flex flex-col">
        {latest.map(ev => (
          <button key={ev.text} type="button" onClick={() => onOpen(ev.path)} className="flex-1 flex items-center gap-3 text-left min-w-0">
            <span className="text-[11px] text-[var(--text-3)] w-20 shrink-0">{rel(ev.at)}</span>
            <span className="text-[13px] font-medium text-[var(--text)] truncate">{ev.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
