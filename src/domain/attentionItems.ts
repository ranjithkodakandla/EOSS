import type {
  Asset, Dispatch, Inspection, InventoryItem, Job, JobBlocker, JobMaterialReq,
  MaintenanceEvent, MaterialItem, MeterReading, NCR, QualityRelease, VaultDocument,
} from '../types';
import { DEMO_NOW } from '../data/seed';
import { computeMaintenanceDue } from './maintenanceDue';
import { computeProductionStatus } from './productionStatus';
import { documentsDue, maintenanceOverdue } from './recordLists';

export type AttentionStage = 'Material' | 'Machine' | 'Floor' | 'Release';

export interface AttentionItem {
  id: string;
  stage: AttentionStage;
  severity: 'critical' | 'watch';
  rank: number;
  /** One line: what is wrong and which record. */
  text: string;
  recordPath: string;
  actionLabel: string;
  actionPath: string;
}

export interface AttentionSource {
  jobs: Job[];
  jobBlockers: JobBlocker[];
  jobMaterialReqs: JobMaterialReq[];
  inventory: InventoryItem[];
  materials: MaterialItem[];
  assets: Asset[];
  meterReadings: MeterReading[];
  maintenanceEvents: MaintenanceEvent[];
  inspections: Inspection[];
  ncrs: NCR[];
  documents: VaultDocument[];
  qualityReleases: QualityRelease[];
  dispatches: Dispatch[];
}

const SNOOZE_KEY = 'eoss-attention-snooze';

function daysFrom(now: Date, iso: string) {
  return Math.ceil((new Date(iso).getTime() - now.getTime()) / 86400000);
}

function qtyLabel(n: number) {
  return Number.isInteger(n) ? String(n) : String(Math.round(n * 10) / 10);
}

function prPath(opts: { code?: string; name: string; qty: number; uom: string; jobId?: string }) {
  const q = new URLSearchParams({
    name: opts.name,
    qty: String(Math.max(1, Math.ceil(opts.qty))),
    uom: opts.uom,
  });
  if (opts.code) q.set('code', opts.code);
  if (opts.jobId) q.set('job', opts.jobId);
  return `/procurement/pr/new?${q.toString()}`;
}

export function buildAttentionItems(src: AttentionSource, now = new Date(DEMO_NOW)): AttentionItem[] {
  const items: AttentionItem[] = [];
  const jobById = new Map(src.jobs.map(j => [j.id, j]));
  const materialById = new Map(src.materials.map(m => [m.id, m]));
  const coveredMaterials = new Set<string>();
  const jobsWithMaterialRow = new Set<string>();
  const assetsWithBreakdownRow = new Set<string>();

  for (const blocker of src.jobBlockers.filter(b => b.status === 'open')) {
    const job = jobById.get(blocker.jobId);
    if (!job || job.status === 'complete' || job.status === 'cancelled') continue;
    if (blocker.type === 'Material') continue;
    const event = src.maintenanceEvents.find(e =>
      e.status !== 'closed' && e.affectedJobs?.some(a => a.jobId === job.id)
    );
    const code = event?.assetCode;
    if (event) assetsWithBreakdownRow.add(event.assetId);
    items.push({
      id: `blocker-${blocker.id}`,
      stage: blocker.type === 'Machine' ? 'Machine' : 'Floor',
      severity: 'critical',
      rank: 0,
      text: code
        ? `${job.jobNumber} held — ${code} is down`
        : `${job.jobNumber} held — ${blocker.description.split('.')[0]}`,
      recordPath: `/jobs/${job.id}`,
      actionLabel: 'Open',
      actionPath: event ? `/assets/me/${event.id}` : `/jobs/${job.id}`,
    });
  }

  for (const req of src.jobMaterialReqs.filter(r => r.shortage)) {
    const job = jobById.get(req.jobId);
    if (!job || job.status === 'complete' || job.status === 'cancelled') continue;
    const gap = Math.max(0, req.requiredQty - req.reservedQty - req.issuedQty);
    if (gap <= 0) continue;
    const code = materialById.get(req.materialItemId)?.itemCode;
    coveredMaterials.add(req.materialItemId);
    jobsWithMaterialRow.add(job.id);
    items.push({
      id: `req-${req.id}`,
      stage: 'Material',
      severity: 'critical',
      rank: 1,
      text: `${job.jobNumber} short ${qtyLabel(gap)} ${req.uom} ${req.materialName}`,
      recordPath: `/jobs/${job.id}`,
      actionLabel: 'Raise PR',
      actionPath: prPath({ code, name: req.materialName, qty: gap, uom: req.uom, jobId: job.id }),
    });
  }

  for (const ins of src.inspections.filter(i => i.result === 'pending')) {
    items.push({
      id: `ins-${ins.id}`,
      stage: 'Release',
      severity: 'critical',
      rank: 2,
      text: `${ins.inspectionNumber} awaiting result`,
      recordPath: `/quality/inspection/${ins.id}`,
      actionLabel: 'Record',
      actionPath: `/quality/inspection/${ins.id}?record=1`,
    });
  }

  for (const asset of maintenanceOverdue(src.assets, src.meterReadings, now)) {
    if (assetsWithBreakdownRow.has(asset.id)) continue;
    const due = computeMaintenanceDue(asset, src.meterReadings, now);
    const days = due.remainingDays != null && due.remainingDays < 0 ? Math.abs(due.remainingDays) : null;
    const staleDate = asset.nextServiceDate && asset.lastServiceDate && asset.nextServiceDate < asset.lastServiceDate;
    const flagged = asset.status === 'pm_overdue' || asset.status === 'breakdown';
    items.push({
      id: `asset-${asset.id}`,
      stage: 'Machine',
      severity: 'critical',
      rank: flagged && !staleDate ? 3 : 8,
      text: days != null
        ? `${asset.assetCode} service overdue ${days} day${days === 1 ? '' : 's'}`
        : `${asset.assetCode} service is overdue`,
      recordPath: `/assets/${asset.id}`,
      actionLabel: 'Schedule',
      actionPath: `/assets?focus=overdue&log=${asset.id}`,
    });
  }

  for (const doc of documentsDue(src.documents, now)) {
    const days = doc.info.daysToExpiry ?? 0;
    const expired = doc.info.status === 'expired';
    items.push({
      id: `doc-${doc.doc.id}`,
      stage: 'Release',
      severity: expired ? 'critical' : 'watch',
      rank: expired ? 4 : 6,
      text: expired
        ? `${doc.doc.title} expired ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago`
        : `${doc.doc.title} expires in ${days} day${days === 1 ? '' : 's'}`,
      recordPath: '/documents?attention=due',
      actionLabel: 'Renew',
      actionPath: `/documents?attention=due&renew=${doc.doc.id}`,
    });
  }

  for (const ncr of src.ncrs.filter(n => n.status === 'open' || n.status === 'in_progress')) {
    items.push({
      id: `ncr-${ncr.id}`,
      stage: 'Release',
      severity: 'critical',
      rank: 5,
      text: ncr.jobId
        ? `${ncr.ncrNumber} still open on ${jobById.get(ncr.jobId)?.jobNumber ?? 'a job'}`
        : `${ncr.ncrNumber} still open`,
      recordPath: `/quality/ncr/${ncr.id}`,
      actionLabel: 'Open',
      actionPath: `/quality/ncr/${ncr.id}`,
    });
  }

  for (const item of src.inventory.filter(i => i.shortage && !coveredMaterials.has(i.materialItemId))) {
    const gap = Math.max(item.reorderPoint - item.availableQty, 1);
    items.push({
      id: `stock-${item.id}`,
      stage: 'Material',
      severity: 'watch',
      rank: 7,
      text: `${item.materialName} is ${qtyLabel(gap)} ${item.primaryUom} under reorder`,
      recordPath: '/inventory?focus=shortage',
      actionLabel: 'Raise PR',
      actionPath: prPath({ code: item.materialCode, name: item.materialName, qty: gap, uom: item.primaryUom }),
    });
  }

  for (const job of src.jobs) {
    if (job.status === 'complete' || job.status === 'cancelled') continue;
    if (jobsWithMaterialRow.has(job.id)) continue;
    if (src.jobBlockers.some(b => b.jobId === job.id && b.status === 'open')) continue;
    const risk = computeProductionStatus(job, now).risk;
    if (risk !== 'at_risk' && risk !== 'delayed') continue;
    const released = src.qualityReleases.some(r => r.jobId === job.id);
    const alreadyShipped = src.dispatches.some(d =>
      d.jobId === job.id || (d.jobs ?? []).includes(job.jobNumber) || (d.jobs ?? []).includes(job.id)
    );
    if (released && !alreadyShipped) {
      items.push({
        id: `ship-${job.id}`,
        stage: 'Release',
        severity: 'watch',
        rank: 6,
        text: `${job.jobNumber} is released and not shipped`,
        recordPath: `/jobs/${job.id}`,
        actionLabel: 'Open',
        actionPath: `/dispatch?plan=${job.id}`,
      });
      continue;
    }
    items.push({
      id: `risk-${job.id}`,
      stage: 'Floor',
      severity: risk === 'delayed' ? 'critical' : 'watch',
      rank: risk === 'delayed' ? 9 : 10,
      text: `${job.jobNumber} ${risk === 'delayed' ? 'is past its plan' : 'is slipping'} — ${job.currentStage}`,
      recordPath: `/jobs/${job.id}`,
      actionLabel: 'Update',
      actionPath: `/jobs/${job.id}?update=1`,
    });
  }

  return items.sort((a, b) => a.rank - b.rank || a.text.localeCompare(b.text));
}

type SnoozeMap = Record<string, string>;

function readSnooze(): SnoozeMap {
  try {
    const raw = localStorage.getItem(SNOOZE_KEY);
    return raw ? JSON.parse(raw) as SnoozeMap : {};
  } catch {
    return {};
  }
}

function writeSnooze(map: SnoozeMap) {
  try { localStorage.setItem(SNOOZE_KEY, JSON.stringify(map)); } catch { /* prototype only */ }
}

export function isAttentionHidden(id: string, now = new Date(DEMO_NOW)) {
  const mark = readSnooze()[id];
  if (!mark) return false;
  if (mark === 'done') return true;
  return new Date(mark).getTime() > now.getTime();
}

export function snoozeAttention(id: string, now = new Date(DEMO_NOW)) {
  const until = new Date(now);
  until.setDate(until.getDate() + 1);
  const map = readSnooze();
  map[id] = until.toISOString().slice(0, 10);
  writeSnooze(map);
}

export function dismissAttention(id: string) {
  const map = readSnooze();
  map[id] = 'done';
  writeSnooze(map);
}
