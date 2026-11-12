import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { DEMO_NOW } from '../../data/seed';
import { buildAttentionItems, isAttentionHidden } from '../../domain/attentionItems';
import { computeProductionStatus } from '../../domain/productionStatus';
import type { Dispatch, Job } from '../../types';

const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TOP_ATTENTION = 4;

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

function topAttentionIds(now: Date) {
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
    purchaseReqs: s.purchaseReqs,
    approvalRequests: s.approvalRequests,
  }, now).filter(item => !isAttentionHidden(item.id, now)).slice(0, TOP_ATTENTION);
  const ids = new Set<string>();
  for (const item of items) {
    item.recordPath.split(/[/?=&]/).forEach(bit => { if (bit) ids.add(bit); });
    const job = item.text.match(/\b(J-\d+)\b/);
    if (job) ids.add(job[1]);
  }
  return ids;
}

function shipTone(job: Job, now: Date) {
  const risk = computeProductionStatus(job, now).risk;
  return job.hasBlocker || risk === 'at_risk' || risk === 'delayed' || risk === 'blocked' ? 'risk' : 'ok';
}

function dispatchTone(dsp: Dispatch, job: Job | undefined, now: Date) {
  if (job && job.status !== 'complete' && shipTone(job, now) === 'risk') return 'risk' as const;
  if (dsp.status === 'delivered' || dsp.status === 'dispatched' || dsp.status === 'in_transit' || dsp.status === 'ready' || dsp.status === 'pending_docs') return 'ok' as const;
  return 'risk' as const;
}

export default function HomeStrip() {
  const navigate = useNavigate();
  const { jobs, dispatches } = useStore();
  const now = parseDay(DEMO_NOW);
  const skip = topAttentionIds(now);
  const start = mondayOf(now);
  const today = isoDay(now);

  const days = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = isoDay(d);
    const departures: { id: string; text: string; path: string; tone: 'ok' | 'risk' }[] = [];
    for (const dsp of dispatches) {
      if ((dsp.dispatchDate || '').slice(0, 10) !== key) continue;
      const jobNo = dsp.jobNumber ?? dsp.jobs?.[0];
      if (jobNo && skip.has(jobNo)) continue;
      const job = jobs.find(j => j.jobNumber === jobNo || j.id === jobNo);
      const uom = job?.stages[job.stages.length - 1]?.uom ?? 'units';
      departures.push({
        id: dsp.id,
        text: `${jobNo ?? dsp.dispatchNumber} · ${shortParty(dsp.customerName)} · ${dsp.totalQty} ${uom}`,
        path: job ? `/jobs/${job.id}` : `/dispatch/${dsp.id}`,
        tone: dispatchTone(dsp, job, now),
      });
    }
    for (const job of jobs) {
      if ((job.plannedEnd || '').slice(0, 10) !== key) continue;
      if (job.status === 'cancelled' || skip.has(job.id) || skip.has(job.jobNumber)) continue;
      if (dispatches.some(d => (d.dispatchDate || '').slice(0, 10) === key && ((d.jobs ?? []).includes(job.jobNumber) || d.jobId === job.id))) continue;
      const last = job.stages[job.stages.length - 1];
      departures.push({
        id: job.id,
        text: `${job.jobNumber} · ${shortParty(job.customerName)} · ${last?.inputQty ?? ''} ${last?.uom ?? ''}`.trim(),
        path: `/jobs/${job.id}`,
        tone: shipTone(job, now),
      });
    }
    return {
      key,
      label: DAY[d.getDay()],
      today: key === today,
      departures: departures.slice(0, 2),
      extraCount: Math.max(0, departures.length - 2),
    };
  });

  return (
    <section
      className="rounded-2xl border px-3 py-2 flex flex-col"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-xs font-bold text-[var(--text)] uppercase tracking-wider">This week</p>
      </div>
      <div className="overflow-x-auto">
        <div className="grid grid-cols-6 gap-2 min-w-[600px] md:min-w-0">
          {days.map(day => (
            <div
              key={day.key}
              className="rounded-xl border px-2 py-1.5 flex flex-col gap-1 min-h-[68px]"
              style={{
                borderColor: day.today ? 'var(--brand)' : 'var(--border)',
                background: day.today ? 'var(--brand-soft)' : 'var(--surface-2)',
              }}
            >
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span style={{ color: day.today ? 'var(--brand)' : 'var(--text-2)' }}>{day.label}</span>
                {day.today && <span className="text-[9px] uppercase tracking-wider text-[var(--brand)]">Today</span>}
              </div>
              {day.departures.length === 0 ? (
                <span className="text-[11px] text-[var(--text-3)]">—</span>
              ) : (
                <div className="flex flex-col gap-1">
                  {day.departures.map(dep => (
                    <button
                      key={dep.id}
                      type="button"
                      onClick={() => navigate(dep.path)}
                      className="text-left text-[11px] font-medium px-1.5 py-0.5 rounded-md border truncate hover:border-[var(--brand)]"
                      style={{
                        background: 'var(--surface)',
                        borderColor: dep.tone === 'risk' ? 'var(--warning-light, #FED7AA)' : 'var(--border)',
                        color: 'var(--text)',
                      }}
                      title={dep.text}
                    >
                      {dep.text}
                    </button>
                  ))}
                  {day.extraCount > 0 && (
                    <span className="text-[10px] font-semibold text-[var(--text-3)] px-1">+{day.extraCount} more</span>
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
