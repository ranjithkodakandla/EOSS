import type {
  ApprovalRequest, Asset, Dispatch, Inspection, InventoryItem, Job, JobBlocker, JobMaterialReq,
  MaintenanceEvent, MaterialItem, MeterReading, NCR, PurchaseRequisition, QualityRelease, VaultDocument,
} from '../types';
import { DEMO_NOW } from '../data/seed';
import { computeMaintenanceDue } from './maintenanceDue';
import { computeProductionStatus } from './productionStatus';
import { documentsDue, maintenanceOverdue } from './recordLists';

export type AttentionStage = 'Approvals' | 'Material' | 'Machine' | 'Shop floor' | 'Quality hold' | 'Defect report' | 'Inspection';

export interface AttentionItem {
  id: string;
  stage: AttentionStage;
  /** Optional internal code shown only in tooltip. */
  code?: string;
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
  purchaseReqs?: PurchaseRequisition[];
  approvalRequests?: ApprovalRequest[];
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
  const lateJobsCovered = new Set<string>();

  const activePRFor = (jobId?: string, materialId?: string, materialName?: string) => {
    const prs = (src.purchaseReqs ?? []).filter(
      pr => !['cancelled', 'rejected', 'approval_rejected'].includes(pr.status),
    );
    return prs.find(pr =>
      (jobId && pr.jobId === jobId) ||
      (materialId && pr.lines?.some(l => l.materialItemId === materialId)) ||
      (materialName && pr.lines?.some(l => (l.description ?? l.materialName ?? '').toLowerCase().includes(materialName.toLowerCase())))
    );
  };

  // 0. Open shop-floor & machine blockers (highest urgency)
  for (const blocker of src.jobBlockers.filter(b => b.status === 'open')) {
    const job = jobById.get(blocker.jobId);
    if (!job || job.status === 'complete' || job.status === 'cancelled') continue;
    if (blocker.type === 'Material') continue;
    const event = src.maintenanceEvents.find(e =>
      e.id === blocker.linkedMaintenanceEventId ||
      (e.status !== 'closed' && e.affectedJobs?.some(a => a.jobId === job.id))
    );
    const code = blocker.linkedAssetCode ?? event?.assetCode;
    if (event) assetsWithBreakdownRow.add(event.assetId);
    lateJobsCovered.add(job.id);
    items.push({
      id: `blocker-${blocker.id}`,
      stage: blocker.type === 'Machine' ? 'Machine' : 'Shop floor',
      code: blocker.type === 'Machine' ? 'MACHINE' : 'FLOOR',
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

  // 0.5 Late / delayed jobs (projected completion > target completion)
  for (const job of src.jobs) {
    if (job.status === 'complete' || job.status === 'cancelled') continue;
    const status = computeProductionStatus(job, now);
    const projectedPast = Boolean(status.projectedCompletion && job.plannedEnd && status.projectedCompletion > job.plannedEnd);
    if (status.risk === 'delayed' || projectedPast) {
      if (lateJobsCovered.has(job.id)) continue;
      lateJobsCovered.add(job.id);
      items.push({
        id: `late-${job.id}`,
        stage: 'Shop floor',
        code: 'FLOOR',
        severity: 'critical',
        rank: 0.5,
        text: `${job.jobNumber} is running late — ${job.currentStage}`,
        recordPath: `/jobs/${job.id}`,
        actionLabel: 'Open',
        actionPath: `/jobs/${job.id}`,
      });
    }
  }

  // 1. Approvals waiting on me
  for (const req of (src.approvalRequests ?? []).filter(a => a.status === 'pending')) {
    const isSpo = req.requestType.toLowerCase().includes('supplier po') || req.entityRef.startsWith('SPO-');
    const path = isSpo
      ? `/procurement/spo/${req.entityId}`
      : `/procurement/pr/${req.entityId}`;
    items.push({
      id: `appr-${req.id}`,
      stage: 'Approvals',
      code: 'APPROVAL',
      severity: 'watch',
      rank: 1,
      text: `Approve ${req.entityRef} — ${req.description}`,
      recordPath: path,
      actionLabel: 'Review',
      actionPath: '/procurement?tab=approvals',
    });
  }

  // 2. Material shortages — reflect existing PR status instead of prompting "Raise PR"
  for (const req of src.jobMaterialReqs.filter(r => r.shortage)) {
    const job = jobById.get(req.jobId);
    if (!job || job.status === 'complete' || job.status === 'cancelled') continue;
    const gap = Math.max(0, req.requiredQty - req.reservedQty - req.issuedQty);
    if (gap <= 0) continue;
    const code = materialById.get(req.materialItemId)?.itemCode;
    const existingPr = activePRFor(job.id, req.materialItemId, req.materialName);
    coveredMaterials.add(req.materialItemId);
    jobsWithMaterialRow.add(job.id);
    if (existingPr) {
      const prStatusLabel = existingPr.status === 'pending' ? 'pending approval' : existingPr.status.replace(/_/g, ' ');
      items.push({
        id: `req-${req.id}`,
        stage: 'Material',
        code: 'PR',
        severity: 'watch',
        rank: 2,
        text: `${job.jobNumber} short ${qtyLabel(gap)} ${req.uom} ${req.materialName} — ${existingPr.prNumber} (${prStatusLabel})`,
        recordPath: `/procurement/pr/${existingPr.id}`,
        actionLabel: 'Open',
        actionPath: `/procurement/pr/${existingPr.id}`,
      });
    } else {
      items.push({
        id: `req-${req.id}`,
        stage: 'Material',
        severity: 'critical',
        rank: 2,
        text: `${job.jobNumber} short ${qtyLabel(gap)} ${req.uom} ${req.materialName}`,
        recordPath: `/jobs/${job.id}`,
        actionLabel: 'Raise PR',
        actionPath: prPath({ code, name: req.materialName, qty: gap, uom: req.uom, jobId: job.id }),
      });
    }
  }

  // 3. Pending inspections, open defect reports (NCRs), and Quality holds
  for (const ins of src.inspections.filter(i => i.result === 'pending')) {
    items.push({
      id: `ins-${ins.id}`,
      stage: 'Inspection',
      code: 'INSP',
      severity: 'critical',
      rank: 3,
      text: `${ins.inspectionNumber} awaiting inspection result`,
      recordPath: `/quality/inspection/${ins.id}`,
      actionLabel: 'Record',
      actionPath: `/quality/inspection/${ins.id}?record=1`,
    });
  }

  for (const ncr of src.ncrs.filter(n => n.status === 'open' || n.status === 'in_progress')) {
    items.push({
      id: `ncr-${ncr.id}`,
      stage: 'Defect report',
      code: 'NCR',
      severity: 'critical',
      rank: 3.5,
      text: ncr.jobId
        ? `${ncr.ncrNumber} open on ${jobById.get(ncr.jobId)?.jobNumber ?? 'a job'}`
        : `${ncr.ncrNumber} still open`,
      recordPath: `/quality/ncr/${ncr.id}`,
      actionLabel: 'Open',
      actionPath: `/quality/ncr/${ncr.id}`,
    });
  }

  // 4. Preventive maintenance overdue — collapse ancient (>30d) items into one grouped line
  const ancientOverdue: Asset[] = [];
  for (const asset of maintenanceOverdue(src.assets, src.meterReadings, now)) {
    if (assetsWithBreakdownRow.has(asset.id)) continue;
    const due = computeMaintenanceDue(asset, src.meterReadings, now);
    const days = due.remainingDays != null && due.remainingDays < 0 ? Math.abs(due.remainingDays) : null;
    if (days != null && days > 30) {
      ancientOverdue.push(asset);
      continue;
    }
    items.push({
      id: `asset-${asset.id}`,
      stage: 'Machine',
      code: 'PM',
      severity: 'critical',
      rank: 4,
      text: days != null
        ? `${asset.assetCode} service overdue ${days} day${days === 1 ? '' : 's'}`
        : `${asset.assetCode} service is overdue`,
      recordPath: `/assets/${asset.id}`,
      actionLabel: 'Schedule',
      actionPath: `/assets?focus=overdue&log=${asset.id}`,
    });
  }
  if (ancientOverdue.length > 0) {
    items.push({
      id: 'asset-pm-overdue-backlog',
      stage: 'Machine',
      code: 'PM',
      severity: 'watch',
      rank: 4.5,
      text: `${ancientOverdue.length} machine${ancientOverdue.length === 1 ? '' : 's'} with overdue preventive service (>30 days)`,
      recordPath: '/assets?focus=overdue',
      actionLabel: 'Review',
      actionPath: '/assets?focus=overdue',
    });
  }

  // 5. Expiring / expired documents
  for (const doc of documentsDue(src.documents, now)) {
    const days = doc.info.daysToExpiry ?? 0;
    const expired = doc.info.status === 'expired';
    items.push({
      id: `doc-${doc.doc.id}`,
      stage: 'Quality hold',
      code: 'DOC',
      severity: expired ? 'critical' : 'watch',
      rank: expired ? 5 : 6,
      text: expired
        ? `${doc.doc.title} expired ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago`
        : `${doc.doc.title} expires in ${days} day${days === 1 ? '' : 's'}`,
      recordPath: '/documents?attention=due',
      actionLabel: 'Renew',
      actionPath: `/documents?attention=due&renew=${doc.doc.id}`,
    });
  }

  // 6. Stock below reorder (excluding covered shortages & those with active PR)
  for (const item of src.inventory.filter(i => i.shortage && !coveredMaterials.has(i.materialItemId))) {
    const gap = Math.max(item.reorderPoint - item.availableQty, 1);
    const existingPr = activePRFor(undefined, item.materialItemId, item.materialName);
    if (existingPr) continue;
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

  // 7. At-risk jobs or released & not shipped
  for (const job of src.jobs) {
    if (job.status === 'complete' || job.status === 'cancelled') continue;
    if (jobsWithMaterialRow.has(job.id) || lateJobsCovered.has(job.id)) continue;
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
        stage: 'Quality hold',
        code: 'RELEASE',
        severity: 'watch',
        rank: 6.5,
        text: `${job.jobNumber} is released and ready to ship`,
        recordPath: `/jobs/${job.id}`,
        actionLabel: 'Open',
        actionPath: `/dispatch?plan=${job.id}`,
      });
      continue;
    }
    items.push({
      id: `risk-${job.id}`,
      stage: 'Shop floor',
      code: 'FLOOR',
      severity: risk === 'delayed' ? 'critical' : 'watch',
      rank: risk === 'delayed' ? 1 : 8,
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
