// Material availability / feasibility computation.
// Pure functions over real persisted records — never invents quantities.
import type { MaterialLot, SupplierPO, SupplierPOLine, StoreLocation, Site } from '../types';

export interface SiteStockBreakdown {
  siteId: string;
  siteName: string;
  physical: number;
  reserved: number;
  qcHold: number;
  available: number;
}

export interface IncomingLine {
  spoId: string;
  spoNumber: string;
  supplierName: string;
  orderedQty: number;
  receivedQty: number;
  pendingQty: number;
  expectedDate: string;
  status: SupplierPOLine['status'];
}

export interface MaterialFeasibility {
  materialItemId: string;
  uom: string;
  requiredQty: number;
  assignedSiteId: string;
  physicalOnHand: number;
  reserved: number;
  qcHold: number;
  available: number;
  shortage: number;
  incomingQty: number;
  incoming: IncomingLine[];
  otherSiteStock: SiteStockBreakdown[];
  recommendedAction: string;
  isPreliminary: boolean;
}

function siteOfLocation(storeLocationId: string, storeLocations: StoreLocation[]): string | undefined {
  return storeLocations.find(l => l.id === storeLocationId)?.siteId;
}

export function computeMaterialFeasibility(params: {
  materialItemId: string;
  uom: string;
  requiredQty: number;
  assignedSiteId: string;
  lots: MaterialLot[];
  storeLocations: StoreLocation[];
  sites: Site[];
  supplierPos: SupplierPO[];
  supplierPoLines: SupplierPOLine[];
  isPreliminary?: boolean;
}): MaterialFeasibility {
  const { materialItemId, uom, requiredQty, assignedSiteId, lots, storeLocations, sites, supplierPos, supplierPoLines, isPreliminary } = params;

  const matLots = lots.filter(l => l.materialItemId === materialItemId);

  const bySite = new Map<string, SiteStockBreakdown>();
  for (const site of sites) {
    bySite.set(site.id, { siteId: site.id, siteName: site.name, physical: 0, reserved: 0, qcHold: 0, available: 0 });
  }

  for (const lot of matLots) {
    const siteId = siteOfLocation(lot.storeLocationId, storeLocations) ?? 'unknown';
    if (!bySite.has(siteId)) {
      bySite.set(siteId, { siteId, siteName: sites.find(s => s.id === siteId)?.name ?? 'Unknown Site', physical: 0, reserved: 0, qcHold: 0, available: 0 });
    }
    const bucket = bySite.get(siteId)!;
    if (lot.status === 'qc_hold') {
      bucket.qcHold += lot.primaryQty;
    } else if (lot.status === 'reserved') {
      bucket.physical += lot.primaryQty;
      bucket.reserved += lot.primaryQty;
    } else if (lot.status === 'available') {
      bucket.physical += lot.primaryQty;
      bucket.available += lot.primaryQty;
    } else {
      // issued / dispatched / scrapped lots are not available physical stock
      bucket.physical += 0;
    }
  }

  const assigned = bySite.get(assignedSiteId) ?? { siteId: assignedSiteId, siteName: 'Assigned Site', physical: 0, reserved: 0, qcHold: 0, available: 0 };
  const otherSiteStock = Array.from(bySite.values()).filter(b => b.siteId !== assignedSiteId && (b.physical > 0 || b.qcHold > 0));

  // Incoming = open/pending/overdue/partial supplier PO lines for this material, regardless of site (incoming to the company).
  const incoming: IncomingLine[] = [];
  for (const line of supplierPoLines) {
    if (line.materialItemId !== materialItemId) continue;
    if (line.status === 'received') continue;
    const spo = supplierPos.find(p => p.id === line.spoId);
    if (!spo) continue;
    const pendingQty = Math.max(0, line.orderedQty - line.receivedQty);
    if (pendingQty <= 0) continue;
    incoming.push({
      spoId: spo.id,
      spoNumber: spo.poNumber,
      supplierName: spo.supplierName,
      orderedQty: line.orderedQty,
      receivedQty: line.receivedQty,
      pendingQty,
      expectedDate: line.committedDate,
      status: line.status,
    });
  }
  const incomingQty = incoming.reduce((s, i) => s + i.pendingQty, 0);

  const shortage = Math.max(0, requiredQty - assigned.available);

  let recommendedAction: string;
  if (shortage <= 0) {
    recommendedAction = 'Sufficient stock available at assigned site. No action needed.';
  } else {
    const altAvailable = otherSiteStock.reduce((s, b) => s + b.available, 0);
    const parts: string[] = [];
    if (altAvailable > 0) {
      parts.push(`Transfer ${Math.min(shortage, altAvailable)} ${uom} from ${otherSiteStock.filter(b => b.available > 0).map(b => b.siteName).join(', ')}`);
    }
    if (incomingQty > 0) {
      parts.push(`${incomingQty} ${uom} incoming (${incoming.map(i => i.spoNumber).join(', ')})`);
    }
    const stillShort = Math.max(0, shortage - altAvailable - incomingQty);
    if (stillShort > 0) {
      parts.push(`Procure remaining ${stillShort} ${uom}`);
    }
    recommendedAction = parts.length > 0 ? parts.join(' + ') : `Procure ${shortage} ${uom} — no transferable stock or incoming supply found`;
  }

  return {
    materialItemId,
    uom,
    requiredQty,
    assignedSiteId,
    physicalOnHand: assigned.physical,
    reserved: assigned.reserved,
    qcHold: assigned.qcHold,
    available: assigned.available,
    shortage,
    incomingQty,
    incoming,
    otherSiteStock,
    recommendedAction,
    isPreliminary: !!isPreliminary,
  };
}
