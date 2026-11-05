import Dexie, { type Table } from 'dexie';
import type {
  CustomerRFQFull, CustomerQuotation, CustomerPO, POLine,
  CustomerInvoice, CustomerPayment, CollectionActivity, DeliveryConfirmation,
  Job, GoodsReceipt, SupplierPO, SupplierPOLine, PurchaseRequisition, PRLine,
  MaterialLot, StockMovement, Inspection, NCR, QualityRelease,
  Dispatch, AuditEvent, SiteFull, Party, MaterialItem, Employee,
  StoreLocation, Asset, MaintenanceEvent, VaultDocument, SupplierQuotation,
} from '../types';

export class EOSSDatabase extends Dexie {
  rfqs!: Table<CustomerRFQFull>;
  quotations!: Table<CustomerQuotation>;
  customerPos!: Table<CustomerPO>;
  poLines!: Table<POLine>;
  invoices!: Table<CustomerInvoice>;
  payments!: Table<CustomerPayment>;
  collections!: Table<CollectionActivity>;
  deliveryConfirmations!: Table<DeliveryConfirmation>;
  jobs!: Table<Job>;
  grns!: Table<GoodsReceipt>;
  supplierPos!: Table<SupplierPO>;
  supplierPoLines!: Table<SupplierPOLine>;
  purchaseReqs!: Table<PurchaseRequisition>;
  prLines!: Table<PRLine>;
  lots!: Table<MaterialLot>;
  movements!: Table<StockMovement>;
  inspections!: Table<Inspection>;
  ncrs!: Table<NCR>;
  qualityReleases!: Table<QualityRelease>;
  dispatches!: Table<Dispatch>;
  auditEvents!: Table<AuditEvent>;
  sites!: Table<SiteFull>;
  parties!: Table<Party>;
  materials!: Table<MaterialItem>;
  employees!: Table<Employee>;
  storeLocations!: Table<StoreLocation>;
  assets!: Table<Asset>;
  maintenanceEvents!: Table<MaintenanceEvent>;
  documents!: Table<VaultDocument>;
  supplierQuotations!: Table<SupplierQuotation>;

  constructor() {
    super('eoss-db');
    this.version(1).stores({
      rfqs: 'id, rfqNumber, customerId, status, createdAt',
      quotations: 'id, quotationNumber, rfqId, customerId, status',
      customerPos: 'id, poNumber, customerId, status',
      poLines: 'id, poId, status',
      invoices: 'id, invoiceNumber, customerId, poId, status',
      payments: 'id, paymentNumber, customerId, status',
      collections: 'id, collectionNumber, customerId, invoiceId, status',
      deliveryConfirmations: 'id, dispatchId',
      jobs: 'id, jobNumber, customerId, customerPoId, siteId, status',
      grns: 'id, grnNumber, supplierId, spoId, status',
      supplierPos: 'id, poNumber, supplierId, status',
      supplierPoLines: 'id, spoId',
      purchaseReqs: 'id, prNumber, jobId, status',
      prLines: 'id, prId, jobId',
      lots: 'id, lotNumber, materialItemId, supplierId, storeLocationId, status',
      movements: 'id, lotId, referenceId, movementType',
      inspections: 'id, inspectionNumber, jobId, lotId, result',
      ncrs: 'id, ncrNumber, inspectionId, jobId, status',
      qualityReleases: 'id, jobId, inspectionId',
      dispatches: 'id, dispatchNumber, customerId, status',
      auditEvents: 'id, entityId, scope, timestamp',
      sites: 'id, code, city',
      parties: 'id, partyType, status',
      materials: 'id, itemCode, categoryId',
      employees: 'id, employeeCode, siteId',
      storeLocations: 'id, siteId',
      assets: 'id, assetCode, siteId, status',
      maintenanceEvents: 'id, eventNumber, assetId, status',
      documents: 'id, docType, category',
      supplierQuotations: 'id, quoteNumber, supplierId, prId, status',
    });
  }
}

export const db = new EOSSDatabase();
