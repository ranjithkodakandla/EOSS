/**
 * Initializes the EOSS IndexedDB database with demo data.
 * Only runs if the DB is empty (first time). Does NOT overwrite user changes on reload.
 * Call resetDemo() to restore to baseline.
 */
import { db } from './database';
import {
  SITES_FULL, CUSTOMERS, SUPPLIERS, MATERIAL_ITEMS, STORE_LOCATIONS,
  EMPLOYEES, RFQS_FULL, CUSTOMER_QUOTATIONS, CUSTOMER_POS, PO_LINES,
  INVOICES, PAYMENTS, COLLECTIONS, JOBS, GRNS, SUPPLIER_POS,
  SUPPLIER_PO_LINES, PURCHASE_REQS, MATERIAL_LOTS, STOCK_MOVEMENTS,
  INSPECTIONS, NCRS, QUALITY_RELEASES, DISPATCHES, AUDIT_EVENTS,
  ASSETS, VAULT_DOCUMENTS, SUPPLIER_QUOTATIONS,
} from './seedData';

export async function initializeDatabase(): Promise<void> {
  const count = await db.sites.count();
  if (count > 0) return; // Already seeded
  await seedAll();
}

export async function resetDemo(): Promise<void> {
  await db.transaction('rw', [
    db.rfqs, db.quotations, db.customerPos, db.poLines,
    db.invoices, db.payments, db.collections, db.deliveryConfirmations,
    db.jobs, db.grns, db.supplierPos, db.supplierPoLines,
    db.purchaseReqs, db.prLines, db.lots, db.movements,
    db.inspections, db.ncrs, db.qualityReleases, db.dispatches,
    db.auditEvents, db.sites, db.parties, db.materials,
    db.employees, db.storeLocations, db.assets, db.maintenanceEvents,
    db.documents, db.supplierQuotations,
  ], async () => {
      await Promise.all([
        db.rfqs.clear(), db.quotations.clear(), db.customerPos.clear(),
        db.poLines.clear(), db.invoices.clear(), db.payments.clear(),
        db.collections.clear(), db.deliveryConfirmations.clear(),
        db.jobs.clear(), db.grns.clear(), db.supplierPos.clear(),
        db.supplierPoLines.clear(), db.purchaseReqs.clear(), db.prLines.clear(),
        db.lots.clear(), db.movements.clear(), db.inspections.clear(),
        db.ncrs.clear(), db.qualityReleases.clear(), db.dispatches.clear(),
        db.auditEvents.clear(), db.sites.clear(), db.parties.clear(),
        db.materials.clear(), db.employees.clear(), db.storeLocations.clear(),
        db.assets.clear(), db.maintenanceEvents.clear(), db.documents.clear(),
        db.supplierQuotations.clear(),
      ]);
      await seedAll();
    });
}

async function seedAll(): Promise<void> {
  await db.transaction('rw', [
    db.sites, db.parties, db.materials, db.employees, db.storeLocations,
    db.rfqs, db.quotations, db.customerPos, db.poLines,
    db.invoices, db.payments, db.collections,
    db.jobs, db.grns, db.supplierPos, db.supplierPoLines,
    db.purchaseReqs, db.lots, db.movements, db.inspections,
    db.ncrs, db.qualityReleases, db.dispatches, db.auditEvents,
    db.assets, db.maintenanceEvents, db.documents, db.supplierQuotations,
  ], async () => {
      await db.sites.bulkAdd(SITES_FULL);
      await db.storeLocations.bulkAdd(STORE_LOCATIONS);
      await db.parties.bulkAdd([...CUSTOMERS, ...SUPPLIERS]);
      await db.materials.bulkAdd(MATERIAL_ITEMS);
      await db.employees.bulkAdd(EMPLOYEES);
      await db.rfqs.bulkAdd(RFQS_FULL);
      await db.quotations.bulkAdd(CUSTOMER_QUOTATIONS);
      await db.customerPos.bulkAdd(CUSTOMER_POS);
      await db.poLines.bulkAdd(PO_LINES);
      await db.invoices.bulkAdd(INVOICES);
      await db.payments.bulkAdd(PAYMENTS);
      await db.collections.bulkAdd(COLLECTIONS);
      await db.jobs.bulkAdd(JOBS);
      await db.grns.bulkAdd(GRNS);
      await db.supplierPos.bulkAdd(SUPPLIER_POS);
      await db.supplierPoLines.bulkAdd(SUPPLIER_PO_LINES);
      await db.purchaseReqs.bulkAdd(PURCHASE_REQS);
      await db.lots.bulkAdd(MATERIAL_LOTS);
      await db.movements.bulkAdd(STOCK_MOVEMENTS);
      await db.inspections.bulkAdd(INSPECTIONS);
      await db.ncrs.bulkAdd(NCRS);
      await db.qualityReleases.bulkAdd(QUALITY_RELEASES);
      await db.dispatches.bulkAdd(DISPATCHES);
      await db.auditEvents.bulkAdd(AUDIT_EVENTS);
      await db.assets.bulkAdd(ASSETS);
      await db.maintenanceEvents.bulkAdd([]);
      await db.documents.bulkAdd(VAULT_DOCUMENTS);
      await db.supplierQuotations.bulkAdd(SUPPLIER_QUOTATIONS);
    });
}
