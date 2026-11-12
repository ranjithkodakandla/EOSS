import type { InventoryItem, Job, JobMaterialReq, MaterialLot, StoreLocation } from '../types';

export type MaterialReadiness = 'available' | 'partial' | 'shortage' | 'awaiting_procurement' | 'awaiting_grn' | 'quality_hold' | 'reserved' | 'pending';

export const MATERIAL_READINESS_LABELS: Record<string, string> = {
  pending: 'Not Assessed',
  not_assessed: 'Not Assessed',
  ready: 'Available',
  available: 'Available',
  partial: 'Partially Available',
  partially_available: 'Partially Available',
  shortage: 'Shortage',
  awaiting_procurement: 'Awaiting Procurement',
  awaiting_grn: 'Awaiting goods receipt',
  quality_hold: 'Quality Hold',
  qc_hold: 'Quality Hold',
  reserved: 'Reserved',
};

export function getMaterialReadinessLabel(status?: string): string {
  if (!status) return 'Not Assessed';
  return MATERIAL_READINESS_LABELS[status] ?? status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export type InventoryDerivedStatus = 'Available' | 'Shortage' | 'Quality Hold' | 'Reserved' | 'Awaiting goods receipt';

export function deriveInventoryStatus(item: InventoryItem): InventoryDerivedStatus {
  if (item.qcHoldQty > 0 && item.availableQty === 0) return 'Quality Hold';
  if (item.availableQty <= 0 && item.inTransitQty > 0) return 'Awaiting goods receipt';
  if (item.shortage) return 'Shortage';
  if (item.reservedQty > 0 && item.availableQty === 0) return 'Reserved';
  return 'Available';
}

export function materialReadinessForJob(
  job: Job,
  requirements: JobMaterialReq[],
  inventory: InventoryItem[],
  lots: MaterialLot[],
  storeLocations: StoreLocation[],
): MaterialReadiness {
  const jobReqs = requirements.filter(req => req.jobId === job.id);
  if (jobReqs.length === 0) return 'pending';

  let hasAvailable = false;
  let hasShortage = false;
  let hasQualityHold = false;
  let hasIncoming = false;

  for (const req of jobReqs) {
    const siteLocationIds = new Set(storeLocations.filter(l => l.siteId === job.siteId).map(l => l.id));
    const siteStock = inventory.filter(i => i.materialItemId === req.materialItemId && siteLocationIds.has(i.locationId));
    const available = siteStock.reduce((sum, i) => sum + i.availableQty, 0);
    const reserved = req.reservedQty;
    const stillRequired = Math.max(0, req.requiredQty - reserved);
    const qcHold = siteStock.reduce((sum, i) => sum + i.qcHoldQty, 0);
    const incoming = lots.some(l => l.materialItemId === req.materialItemId && l.status === 'qc_hold');

    if (available + reserved >= req.requiredQty) hasAvailable = true;
    if (available + reserved < req.requiredQty) hasShortage = true;
    if (qcHold > 0 || incoming) hasQualityHold = true;
    if (stillRequired > 0 && siteStock.some(i => i.inTransitQty > 0)) hasIncoming = true;
  }

  if (!hasShortage) return 'available';
  if (hasQualityHold && !hasAvailable) return 'quality_hold';
  if (hasIncoming && !hasAvailable) return 'awaiting_procurement';
  if (hasAvailable) return 'partial';
  return 'shortage';
}

export function jobMaterialQuantities(job: Job, requirements: JobMaterialReq[], inventory: InventoryItem[], storeLocations: StoreLocation[]) {
  const siteLocationIds = new Set(storeLocations.filter(l => l.siteId === job.siteId).map(l => l.id));
  return requirements.filter(req => req.jobId === job.id).map(req => {
    const stock = inventory.filter(i => i.materialItemId === req.materialItemId && siteLocationIds.has(i.locationId));
    const available = stock.reduce((sum, i) => sum + i.availableQty, 0);
    const qcHold = stock.reduce((sum, i) => sum + i.qcHoldQty, 0);
    return {
      req,
      availableQty: available,
      reservedQty: req.reservedQty,
      shortageQty: Math.max(0, req.requiredQty - req.reservedQty - available),
      qcHoldQty: qcHold,
    };
  });
}
