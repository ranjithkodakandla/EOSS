import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  DemoUser, RoleKey, Job, JobStage, JobUpdate, MaterialLot,
  InventoryItem, StockMovement, Asset, MaintenanceEvent,
  Dispatch, VaultDocument, ApprovalRequest, AppNotification,
  PulseException, CustomerPO, SupplierPO, CustomerRFQ, GoodsReceipt, GoodsReceiptLine,
  Inspection, NCR, MaterialCertificate, Employee, StoreLocation,
  SupplierQuotation, AuditEvent, ApprovalPolicy,
  CustomerInvoice, SupplierInvoice, PaymentRecord, OnboardingState,
  Invoice, InvoiceLine, Payment, PaymentAllocation, CollectionActivity,
  FinishedProduct, SiteAllocation, CustomerQuotation, CustomerQuotationLine, POLine,
  PurchaseRequisition, Site, MaterialItem, InventoryTransfer, MaterialReturn, JobCancellationDisposition,
  MeterReading, QualityRelease, InspectionTemplate, StageTemplate,
  JobMaterialReq, JobBlocker, SupplierPOLine, POAmendment, SupplierInvitation,
  Party, SupplierBill, SupplierBillLine, SupplierPayment, SupplierPaymentAllocation,
  InboxMessage, InboxMessageStatus,
} from '../types';
import { SEED_INBOX_MESSAGES } from '../data/inboxSeed';
import { stampPlaces } from '../domain/places';
import { assessOrderMaterialRequirements } from '../domain/materialFeasibility';
import { createAuditEventRecord, diffRecordFields } from '../domain/audit';
import { computeGstTotals, computeThreeWayMatch } from '../domain/finance';
import { nextSequentialNumber } from '../domain/docNumbers';
import {
  SEED_UNIFIED_INVOICES,
  SEED_UNIFIED_INVOICE_LINES,
  SEED_UNIFIED_PAYMENTS,
  SEED_UNIFIED_PAYMENT_ALLOCATIONS,
  SEED_SUPPLIER_BILLS,
  SEED_SUPPLIER_BILL_LINES,
  SEED_SUPPLIER_PAYMENTS,
  SEED_SUPPLIER_PAYMENT_ALLOCATIONS,
} from '../data/financeSeed';
import { SEED_RICH_AUDIT_EVENTS } from '../data/auditSeed';
import {
  DEMO_SCENARIO_PRS,
  DEMO_SUPPLIER_INVITATIONS,
  DEMO_SUPPLIER_QUOTATIONS,
  DEMO_SUPPLIER_POS,
  DEMO_SUPPLIER_PO_LINES,
  DEMO_GRNS,
  DEMO_LOTS,
  DEMO_INSPECTIONS,
  DEMO_SALES_RFQS,
  DEMO_CUSTOMER_QUOTATIONS,
  DEMO_CUSTOMER_QUOTATION_LINES,
  DEMO_SALES_POS,
  DEMO_SALES_PO_LINES,
  DEMO_SALES_JOBS,
  DEMO_SALES_JOB_REQS,
  DEMO_SALES_DISPATCHES,
} from '../data/demoScenarios';
import {
  DEMO_USERS, JOBS, MATERIAL_LOTS, INVENTORY, STOCK_MOVEMENTS,
  ASSETS, MAINTENANCE_EVENTS, DISPATCHES, VAULT_DOCUMENTS,
  APPROVAL_REQUESTS, NOTIFICATIONS, PULSE_EXCEPTIONS, CUSTOMER_POS,
  SUPPLIER_POS, RFQS, GRNS, INSPECTIONS, NCRS, CERTIFICATES,
  CUSTOMERS as CUSTOMERS_BASE, SUPPLIERS, SUPPLIER_PO_LINES, JOB_BLOCKERS, PURCHASE_REQS,
  EMPLOYEES, STORE_LOCATIONS, SUPPLIER_QUOTATIONS, AUDIT_EVENTS, APPROVAL_POLICIES,
  CUSTOMER_INVOICES, SUPPLIER_INVOICES, PAYMENT_RECORDS, COMPANY_CONFIG,
  GERMAN_CUSTOMER, FLAGSHIP_RFQ, ADDITIONAL_RFQ, FLAGSHIP_PO, FLAGSHIP_JOBS, FLAGSHIP_DISPATCHES,
  FLAGSHIP_INVOICES, FLAGSHIP_INVOICE_LINES, FLAGSHIP_PAYMENTS, FLAGSHIP_PAYMENT_ALLOCATIONS,
  COLLECTION_ACTIVITIES, FINISHED_PRODUCTS, FLAGSHIP_SITE_ALLOCATIONS,
  FLAGSHIP_INSPECTIONS, FLAGSHIP_NCRS,
  SITES, FLAGSHIP_QUOTATION, FLAGSHIP_QUOTATION_LINES, FLAGSHIP_PO_LINES,
  FLAGSHIP_GRNS, FLAGSHIP_SUPPLIER_RFQS, FLAGSHIP_PURCHASE_REQS,
  MATERIALS, QUALITY_RELEASES, JOB_MATERIAL_REQS,
  STAGE_TEMPLATES, INSPECTION_TEMPLATES,
  CUSTOMER_POS_DEMO, JOBS_DEMO, MATERIAL_LOTS_DEMO, INVENTORY_DEMO,
  SUPPLIER_POS_DEMO, SUPPLIER_PO_LINES_DEMO, JOB_MATERIAL_REQS_DEMO,
  JOB_BLOCKERS_DEMO, ASSETS_DEMO, METER_READINGS_DEMO, MAINTENANCE_EVENTS_DEMO,
  INSPECTIONS_DEMO, NCRS_DEMO, QUALITY_RELEASES_DEMO, DISPATCHES_DEMO,
  VAULT_DOCUMENTS_DEMO, AUDIT_EVENTS_DEMO,
} from '../data/seed';
import { RFQS_FULL } from '../db/seedData';

// ── App State ──

export type ThemeMode = 'system' | 'light' | 'dark';
export type EOSSTheme = 'aurora' | 'ocean' | 'graphite';

interface EOSSState {
  // Session
  currentUser: DemoUser;
  customers: Party[];
  suppliers: Party[];
  purchaseReqs: PurchaseRequisition[];
  theme: ThemeMode;
  eossTheme: EOSSTheme;
  sidebarCollapsed: boolean;
  notifications: AppNotification[];
  unreadCount: number;

  // Data (mutable for interactions)
  jobs: Job[];
  jobUpdates: JobUpdate[];
  transfers: InventoryTransfer[];
  materialReturns: MaterialReturn[];
  lots: MaterialLot[];
  inventory: InventoryItem[];
  movements: StockMovement[];
  assets: Asset[];
  maintenanceEvents: MaintenanceEvent[];
  dispatches: Dispatch[];
  documents: VaultDocument[];
  approvalRequests: ApprovalRequest[];
  inboxMessages: InboxMessage[];
  pulseExceptions: PulseException[];
  customerPos: CustomerPO[];
  supplierPos: SupplierPO[];
  supplierPoLines: SupplierPOLine[];
  poAmendments: POAmendment[];
  rfqs: CustomerRFQ[];
  quotations: CustomerQuotation[];
  quotationLines: CustomerQuotationLine[];
  poLines: POLine[];
  grns: GoodsReceipt[];
  inspections: Inspection[];
  ncrs: NCR[];
  certificates: MaterialCertificate[];
  employees: Employee[];
  storeLocations: StoreLocation[];
  supplierInvitations: SupplierInvitation[];
  supplierQuotations: SupplierQuotation[];
  auditEvents: AuditEvent[];
  approvalPolicies: ApprovalPolicy[];
  sites: Site[];
  materials: MaterialItem[];
  meterReadings: MeterReading[];
  qualityReleases: QualityRelease[];
  inspectionTemplates: InspectionTemplate[];
  stageTemplates: StageTemplate[];
  jobMaterialReqs: JobMaterialReq[];
  jobBlockers: JobBlocker[];

  // Toast
  toasts: Toast[];

  // Actions
  setCurrentUser: (user: DemoUser) => void;
  switchRole: (role: RoleKey) => void;
  setTheme: (t: ThemeMode) => void;
  setEOSSTheme: (theme: EOSSTheme) => void;
  toggleSidebar: () => void;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;

  // Job actions
  updateJobStage: (jobId: string, stageId: string, update: Partial<JobStage>) => void;
  skipJobStage: (jobId: string, stageId: string, reason: string, by: string) => void;
  addJobUpdate: (jobId: string, update: JobUpdate) => void;
  setJobStatus: (jobId: string, status: Job['status']) => void;
  resolveBlocker: (blockerId: string) => void;
  addJobBlocker: (blocker: JobBlocker) => void;

  // Material master actions
  addMaterial: (material: MaterialItem) => void;
  updateMaterial: (id: string, update: Partial<MaterialItem>) => void;

  // Maintenance actions
  addMeterReading: (reading: MeterReading) => void;

  // Quality release action
  addQualityRelease: (release: QualityRelease) => void;

  // Inventory actions
  issueMaterial: (lotId: string, qty: number, jobId: string, jobNumber: string, by: string) => void;
  reserveMaterial: (requirementId: string, qty: number, by: string) => void;
  returnMaterial: (lotId: string, qty: number, jobId: string, jobNumber: string, by: string) => void;
  createMaterialReturn: (lotId: string, qty: number, jobId: string, jobNumber: string, by: string, notes?: string) => void;
  acceptMaterialReturn: (returnId: string, by: string) => void;
  rejectMaterialReturn: (returnId: string, by: string, reason?: string) => void;
  updateInventoryItem: (id: string, partial: Partial<InventoryItem>) => void;
  addInventoryItem: (item: InventoryItem) => void;
  transferLot: (lotId: string, toLocation: string, by: string) => void;
  createStockTransfer: (lotId: string, destinationLocationId: string, qty: number, by: string, notes?: string) => void;
  receiveStockTransfer: (transferId: string, by: string) => void;
  setLotStatus: (lotId: string, status: MaterialLot['status']) => void;
  releaseLotFromHold: (lotId: string, decision: 'available' | 'scrapped', by: string, reason?: string) => void;

  // Asset actions
  addAsset: (asset: Asset) => void;
  archiveAsset: (assetId: string, reason: string, by: string) => void;
  setAssetStatus: (assetId: string, status: Asset['status']) => void;
  addMaintenanceEvent: (event: MaintenanceEvent) => void;
  closeMaintenanceEvent: (eventId: string, diagnosis: string, workDone: string, options?: { downtimeEnd?: string; completionDate?: string; notes?: string }) => void;

  // Procurement actions
  addPurchaseReq: (pr: PurchaseRequisition) => void;
  updatePurchaseReq: (id: string, partial: Partial<PurchaseRequisition>) => void;
  setSupplierPoStatus: (spoId: string, status: SupplierPO['status']) => void;
  addPoAmendment: (amendment: POAmendment) => void;
  resolvePoAmendment: (amendmentId: string, resolution: 'approved' | 'rejected', by: string) => void;

  // Approval actions
  resolveApproval: (aprId: string, resolution: 'approved' | 'rejected', by: string, notes?: string) => void;
  addApprovalRequest: (request: ApprovalRequest) => void;

  // Inbox actions
  markInboxMessageRead: (messageId: string, read?: boolean) => void;
  archiveInboxMessage: (messageId: string, archived?: boolean) => void;
  replyToInboxMessage: (messageId: string, body: string) => void;
  completeInboxAction: (messageId: string, outcome: 'approved' | 'rejected' | 'confirmed' | 'completed', notes?: string) => void;

  // Document actions
  addDocument: (doc: VaultDocument) => void;
  updateCertStatus: (certId: string, status: MaterialCertificate['verificationStatus']) => void;
  addDocumentVersion: (previousDocId: string, newDoc: VaultDocument) => void;
  renewDocument: (previousDocId: string, payload: { title?: string; fileName: string; fileSize: string; issueDate?: string; expiryDate: string; reminderDays?: number; uploadedBy?: string }) => VaultDocument | undefined;
  archiveDocument: (docId: string, reason: string, by?: string) => void;

  // Dispatch actions
  setDispatchStatus: (dspId: string, status: Dispatch['status']) => void;
  addDispatch: (dispatch: Dispatch) => void;
  recordPoD: (dspId: string, payload?: { deliveredDate?: string; receivedByName?: string; condition?: Dispatch['deliveryCondition']; podReference?: string; notes?: string }) => void;

  // NCR actions
  addNCR: (ncr: NCR) => void;
  closeNCR: (ncrId: string, resolution: string) => void;
  linkNCRToInspection: (inspectionId: string, ncrId: string, ncrNumber: string) => void;

  // Supplier Invitations & Quotations & PO Lifecycle actions
  sendSupplierInvitations: (payload: {
    prId: string;
    supplierIds: string[];
    channel: SupplierInvitation['channel'];
    responseDueDate?: string;
    requestedLineIds?: string[];
    notes?: string;
    matchReasons?: Record<string, string>;
  }) => SupplierInvitation[];
  updateSupplierInvitation: (id: string, partial: Partial<SupplierInvitation>) => void;
  addSupplierQuotation: (quote: SupplierQuotation) => void;
  updateSupplierQuotation: (id: string, partial: Partial<SupplierQuotation>) => void;
  selectQuotation: (quoteId: string, overrideReason?: string) => void;
  approveFinalizeQuotation: (quoteId: string, approverName: string, notes?: string) => void;
  rejectQuotationApproval: (quoteId: string, rejectedBy: string, reason: string) => void;
  generateSPOFromQuotation: (quoteId: string, opts?: { deliverToSiteId?: string; deliverToStoreId?: string; paymentTerms?: string; committedDate?: string; notes?: string }) => { spo?: SupplierPO; error?: string };
  confirmAndIssueSPO: (spoId: string, issuedBy: string, opts?: { paymentTerms?: string; committedDate?: string; notes?: string }) => { spo?: SupplierPO; nonSelectedInvitations: SupplierInvitation[]; error?: string };
  notifyNonSelectedSuppliers: (spoId: string, recipients: { supplierId: string; supplierName: string; email?: string; message: string }[], sentBy: string) => void;
  recordSupplierPOConfirmation: (spoId: string, decision: 'accepted' | 'declined', data: { confirmedDate?: string; supplierRefNumber?: string; notes?: string; declineReason?: string; recordedBy: string }) => { spo?: SupplierPO; error?: string };

  // Sales actions
  addRfq: (rfq: CustomerRFQ) => void;
  addQuotation: (q: CustomerQuotation, lines: CustomerQuotationLine[]) => void;
  createDirectQuotation: (q: CustomerQuotation, lines: CustomerQuotationLine[]) => void;
  reviseQuotation: (parentQuotationId: string, nextQuotation: CustomerQuotation, nextLines: CustomerQuotationLine[]) => void;
  updateQuotation: (id: string, partial: Partial<CustomerQuotation>) => void;
  convertQuotationToPO: (quotationId: string, po: CustomerPO, poLines: POLine[]) => void;
  addCustomerPO: (po: CustomerPO, lines?: POLine[]) => void;
  assessAndAllocateCustomerPO: (poId: string, actorName: string, opts?: { siteId?: string; jobId?: string }) => {
    status: 'available' | 'partially_available' | 'awaiting_procurement';
    reservedCount: number;
    createdPr?: PurchaseRequisition;
    message: string;
  } | { error: string };
  createJobWithNewCustomerPO: (payload: { job: Job; po?: CustomerPO; poLines?: POLine[] }) => { job: Job; po?: CustomerPO };
  addSupplierPO: (po: SupplierPO, lines?: SupplierPOLine[]) => void;
  addGRN: (grn: GoodsReceipt) => void;
  recordGRNReceipt: (input: {
    spoId: string;
    receivedDate: string;
    deliveryChallan: string;
    vehicleNumber?: string;
    siteId?: string;
    storeLocationId?: string;
    receivedBy: string;
    notes?: string;
    lines: {
      spoLineId: string;
      receivedQty: number;
      lots: {
        lotNumber: string;
        supplierLotRef?: string;
        grade?: string;
        qty: number;
        mfgDate?: string;
        expiryDate?: string;
        notes?: string;
      }[];
      notes?: string;
    }[];
  }) => { grn?: GoodsReceipt; error?: string };
  acceptGRN: (grnId: string, by: string) => void;
  rejectGRN: (grnId: string, by: string, reason?: string) => void;
  startInspectionForGRN: (grnId: string, lotId?: string) => Inspection | undefined;
  startInspectionForLot: (lotId: string) => Inspection | undefined;
  completeIncomingInspection: (inspectionId: string, payload: { acceptedQty: number; rejectedQty: number; result: Inspection['result']; remarks?: string; by?: string; measurements?: Inspection['measurements'] }) => void;
  addJob: (job: Job) => void;
  addInspection: (ins: Inspection) => void;
  addDispatchRecord: (d: Dispatch) => void;

  // Finance state (legacy types)
  customerInvoices: CustomerInvoice[];
  supplierInvoices: SupplierInvoice[];
  paymentRecords: PaymentRecord[];
  // Finance state (rich flagship + unified AR/AP types)
  invoices: Invoice[];
  invoiceLines: InvoiceLine[];
  payments: Payment[];
  paymentAllocations: PaymentAllocation[];
  collectionActivities: CollectionActivity[];
  supplierBills: SupplierBill[];
  supplierBillLines: SupplierBillLine[];
  supplierPayments: SupplierPayment[];
  supplierPaymentAllocations: SupplierPaymentAllocation[];
  // Product & allocation catalogue
  finishedProducts: FinishedProduct[];
  siteAllocations: SiteAllocation[];

  // Finance actions (legacy)
  addCustomerInvoice: (inv: CustomerInvoice) => void;
  addSupplierInvoice: (inv: SupplierInvoice) => void;
  addPaymentRecord: (pay: PaymentRecord) => void;
  recordPaymentAgainstInvoice: (invoiceId: string, direction: 'inbound' | 'outbound', amount: number) => void;
  // Finance actions (rich Order-to-Cash & Procure-to-Pay)
  addInvoice: (inv: Invoice) => void;
  addPayment: (pay: Payment) => void;
  addPaymentAllocation: (pa: PaymentAllocation) => void;
  addCollectionActivity: (ca: CollectionActivity) => void;
  createCustomerInvoice: (payload: {
    poId: string;
    dispatchIds?: string[];
    invoiceDate: string;
    dueDate: string;
    paymentTerms?: string;
    taxType: 'CGST_SGST' | 'IGST' | 'Export_LUT';
    discountAmount?: number;
    freightAmount?: number;
    otherCharges?: number;
    notes?: string;
    issueNow?: boolean;
    lines: Array<{
      poLineId?: string;
      productId?: string;
      productName: string;
      drawingNumber: string;
      hsnSac?: string;
      quantity: number;
      uom: string;
      unitPrice: number;
      discountPct?: number;
      taxPct: number;
      dispatchId?: string;
      dispatchNumber?: string;
    }>;
  }) => { ok: boolean; invoice?: Invoice; error?: string };
  updateCustomerInvoiceDraft: (invoiceId: string, payload: Partial<Pick<Invoice, 'invoiceDate' | 'dueDate' | 'paymentTerms' | 'taxType' | 'discountAmount' | 'freightAmount' | 'otherCharges' | 'notes'>> & {
    lines?: Array<{
      id?: string;
      poLineId?: string;
      productId?: string;
      productName: string;
      drawingNumber: string;
      hsnSac?: string;
      quantity: number;
      uom: string;
      unitPrice: number;
      discountPct?: number;
      taxPct: number;
    }>;
  }) => { ok: boolean; error?: string };
  issueCustomerInvoice: (invoiceId: string) => { ok: boolean; error?: string };
  voidCustomerInvoice: (invoiceId: string, reason: string) => { ok: boolean; error?: string };
  recordCustomerPayment: (payload: {
    customerId: string;
    receiptDate: string;
    amount: number;
    paymentMethod: Payment['paymentMethod'];
    transactionRef: string;
    receivingAccount: string;
    notes?: string;
    isAdvance?: boolean;
    allocations?: Array<{ invoiceId: string; amount: number; notes?: string }>;
  }) => { ok: boolean; payment?: Payment; error?: string };
  allocateCustomerPayment: (paymentId: string, allocations: Array<{ invoiceId: string; amount: number; notes?: string }>) => { ok: boolean; error?: string };
  reverseCustomerPayment: (paymentId: string, reason: string) => { ok: boolean; error?: string };
  createSupplierBill: (payload: {
    supplierId: string;
    supplierInvoiceNo: string;
    spoId?: string;
    grnIds?: string[];
    billDate: string;
    receivedDate?: string;
    dueDate: string;
    paymentTerms?: string;
    taxType?: 'CGST_SGST' | 'IGST';
    otherCharges?: number;
    mismatchNotes?: string;
    notes?: string;
    lines: Array<{
      spoLineId?: string;
      materialItemId?: string;
      materialCode?: string;
      description: string;
      hsnSac?: string;
      billedQty: number;
      uom: string;
      unitRate: number;
      taxPct: number;
    }>;
  }) => { ok: boolean; bill?: SupplierBill; error?: string };
  approveSupplierBill: (billId: string, notes?: string) => { ok: boolean; error?: string };
  holdOrDisputeSupplierBill: (billId: string, status: 'on_hold' | 'disputed', reason: string) => { ok: boolean; error?: string };
  rejectSupplierBill: (billId: string, reason: string) => { ok: boolean; error?: string };
  recordSupplierPayment: (payload: {
    supplierId: string;
    paymentDate: string;
    amount: number;
    paymentMethod: SupplierPayment['paymentMethod'];
    transactionRef: string;
    payingAccount: string;
    notes?: string;
    isAdvance?: boolean;
    allocations?: Array<{ billId: string; amount: number; notes?: string }>;
  }) => { ok: boolean; payment?: SupplierPayment; error?: string };
  allocateSupplierPayment: (paymentId: string, allocations: Array<{ billId: string; amount: number; notes?: string }>) => { ok: boolean; error?: string };
  reverseSupplierPayment: (paymentId: string, reason: string) => { ok: boolean; error?: string };

  // Update / soft-delete actions
  updateCustomerPo: (id: string, partial: Partial<CustomerPO>) => void;
  updateCustomer: (id: string, partial: Partial<Party>) => void;
  addCustomer: (customer: Party) => void;
  updateSupplier: (id: string, partial: Partial<Party>) => void;
  addSupplier: (supplier: Party) => void;
  updateRfq: (id: string, partial: Partial<CustomerRFQ>) => void;
  updateSupplierPo: (id: string, partial: Partial<SupplierPO>) => void;
  updateJob: (id: string, partial: Partial<Job>) => void;
  cancelJob: (id: string, reason: string, by: string, disposition: Pick<JobCancellationDisposition, 'wip' | 'finishedGoods'>) => void;
  updateInspection: (id: string, partial: Partial<Inspection>) => void;
  setInspectionStatus: (id: string, result: Inspection['result']) => void;
  updateNCR: (id: string, partial: Partial<NCR>) => void;
  setNCRStatus: (id: string, status: NCR['status']) => void;
  updateAsset: (id: string, partial: Partial<Asset>) => { ok: boolean; error?: string };
  updateEmployee: (id: string, partial: Partial<Employee>) => void;

  // Onboarding state
  onboarding: OnboardingState;
  companyConfig: typeof COMPANY_CONFIG;

  // Onboarding actions
  updateOnboarding: (partial: Partial<OnboardingState>) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  updateCompanyConfig: (partial: Partial<typeof COMPANY_CONFIG>) => void;

  // Audit actions (append-only)
  appendAuditEvent: (event: Omit<AuditEvent, 'id'>) => void;

  // Toast actions
  showToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;

  // Demo data lifecycle
  resetDemoData: () => void;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  body?: string;
  duration?: number;
}

let toastSeq = 0;

function isQuarantineLocation(loc?: StoreLocation | null): boolean {
  if (!loc) return false;
  return loc.id === 'loc-qrn' || loc.locationType.toLowerCase() === 'quarantine' || loc.name.toLowerCase().includes('quarantine');
}

/** Relocate released stock out of Quarantine Store into the site's Raw Material Store and clamp qcHoldQty <= onHandQty. */
function applyReleasedStockLocation(params: {
  inventory: InventoryItem[];
  storeLocations: StoreLocation[];
  materials: MaterialItem[];
  lot: MaterialLot;
  acceptedQty: number;
  rejectedQty: number;
}): {
  inventory: InventoryItem[];
  targetStoreId: string;
  targetStoreName: string;
} {
  const { storeLocations, materials, lot, acceptedQty, rejectedQty } = params;
  let inventory = [...params.inventory];
  const curLoc = storeLocations.find(sl => sl.id === lot.storeLocationId);
  const inQuarantine = isQuarantineLocation(curLoc) || lot.storeLocationName.toLowerCase().includes('quarantine');
  const rmStore = inQuarantine
    ? (storeLocations.find(sl => sl.siteId === curLoc?.siteId && (sl.locationType === 'RM' || sl.id === 'loc-rm'))
      ?? storeLocations.find(sl => sl.id === 'loc-rm'))
    : undefined;
  const targetStoreId = rmStore?.id ?? lot.storeLocationId;
  const targetStoreName = rmStore?.name ?? lot.storeLocationName;
  const movedOutFromSource = (inQuarantine ? acceptedQty : 0) + rejectedQty;
  const removedHold = acceptedQty + rejectedQty;

  const srcIdx = inventory.findIndex(i => i.materialItemId === lot.materialItemId && i.locationId === lot.storeLocationId);
  if (srcIdx >= 0) {
    const src = inventory[srcIdx];
    const nextOnHand = Math.max(0, src.onHandQty - movedOutFromSource);
    const nextHold = Math.min(nextOnHand, Math.max(0, src.qcHoldQty - removedHold));
    const nextAvail = inQuarantine ? src.availableQty : src.availableQty + acceptedQty;
    inventory[srcIdx] = {
      ...src,
      onHandQty: nextOnHand,
      qcHoldQty: nextHold,
      availableQty: nextAvail,
      lotCount: Math.max(0, src.lotCount - (inQuarantine && acceptedQty === lot.primaryQty ? 1 : rejectedQty === lot.primaryQty ? 1 : 0)),
      shortage: nextAvail < src.reorderPoint,
    };
  }

  if (inQuarantine && acceptedQty > 0) {
    const dstIdx = inventory.findIndex(i => i.materialItemId === lot.materialItemId && i.locationId === targetStoreId);
    if (dstIdx >= 0) {
      const dst = inventory[dstIdx];
      const nextOnHand = dst.onHandQty + acceptedQty;
      const nextAvail = dst.availableQty + acceptedQty;
      inventory[dstIdx] = {
        ...dst,
        onHandQty: nextOnHand,
        availableQty: nextAvail,
        qcHoldQty: Math.min(nextOnHand, dst.qcHoldQty),
        lotCount: dst.lotCount + 1,
        shortage: nextAvail < dst.reorderPoint,
      };
    } else {
      const mat = materials.find(m => m.id === lot.materialItemId);
      inventory.unshift({
        id: `inv-${Date.now()}-${lot.materialItemId}-${targetStoreId}`,
        materialItemId: lot.materialItemId,
        materialCode: mat?.itemCode ?? lot.materialItemId,
        materialName: lot.materialName,
        categoryName: mat?.categoryName ?? 'Uncategorised',
        locationId: targetStoreId,
        locationName: targetStoreName,
        onHandQty: acceptedQty,
        availableQty: acceptedQty,
        reservedQty: 0,
        qcHoldQty: 0,
        inTransitQty: 0,
        primaryUom: lot.primaryUom,
        reorderPoint: mat?.reorderPoint ?? 0,
        shortage: acceptedQty < (mat?.reorderPoint ?? 0),
        lotCount: 1,
      });
    }
  }

  return { inventory, targetStoreId, targetStoreName };
}

/** When newly accepted inventory becomes available, recalculate originating Customer POs & Jobs awaiting procurement. */
function reconcilePendingOrdersOnStockAccepted(params: {
  customerPos: CustomerPO[];
  jobs: Job[];
  jobMaterialReqs: JobMaterialReq[];
  poLines: POLine[];
  materials: MaterialItem[];
  lots: MaterialLot[];
  storeLocations: StoreLocation[];
  sites: Site[];
  supplierPos: SupplierPO[];
  supplierPoLines: SupplierPOLine[];
  purchaseReqs: PurchaseRequisition[];
  acceptedMaterialItemId?: string;
  actor: string;
  actorId: string;
  role: RoleKey;
  timestamp: string;
}): {
  customerPos: CustomerPO[];
  jobs: Job[];
  jobMaterialReqs: JobMaterialReq[];
  auditEvents: AuditEvent[];
} {
  let customerPos = [...params.customerPos];
  let jobs = [...params.jobs];
  let jobMaterialReqs = [...params.jobMaterialReqs];
  const auditEvents: AuditEvent[] = [];

  const candidatePos = customerPos.filter(
    po => po.availabilityStatus === 'partially_available' || po.availabilityStatus === 'awaiting_procurement'
  );

  for (const po of candidatePos) {
    const linkedJobs = jobs.filter(j => j.customerPoId === po.id || j.customerPoNumber === po.poNumber);
    const targetJob = linkedJobs[0];
    const jobReqs = targetJob ? jobMaterialReqs.filter(r => r.jobId === targetJob.id) : [];
    const siteId = targetJob?.siteId ?? po.deliverToSiteId ?? params.sites[0]?.id ?? 'site-hyd';

    const reqInputs = jobReqs.length > 0
      ? jobReqs.map(r => {
          const mat = params.materials.find(m => m.id === r.materialItemId);
          return {
            materialItemId: r.materialItemId,
            materialCode: mat?.itemCode,
            materialName: r.materialName,
            grade: mat?.standardGrade,
            requiredQty: Math.max(0, r.requiredQty - r.reservedQty),
            uom: r.uom,
          };
        }).filter(x => x.requiredQty > 0)
      : params.poLines.filter(l => l.poId === po.id).map(l => {
          const mat = params.materials.find(m =>
            l.description.toLowerCase().includes(m.name.toLowerCase())
            || (l.description.toLowerCase().includes('pipe') && m.id === 'mat-msp')
            || (l.description.toLowerCase().includes('8mm') && m.id === 'mat-ms8')
            || (l.description.toLowerCase().includes('12mm') && m.id === 'mat-ms12')
            || (l.description.toLowerCase().includes('304l') && m.id === 'mat-ss3')
          );
          return mat ? {
            materialItemId: mat.id,
            materialCode: mat.itemCode,
            materialName: mat.name,
            grade: mat.standardGrade,
            requiredQty: l.orderedQty,
            uom: l.uom || mat.primaryUom,
          } : null;
        }).filter((x): x is NonNullable<typeof x> => Boolean(x));

    if (reqInputs.length === 0) continue;
    if (params.acceptedMaterialItemId && !reqInputs.some(r => r.materialItemId === params.acceptedMaterialItemId)) {
      continue;
    }

    const assessment = assessOrderMaterialRequirements({
      requirements: reqInputs,
      assignedSiteId: siteId,
      lots: params.lots,
      storeLocations: params.storeLocations,
      sites: params.sites,
      supplierPos: params.supplierPos,
      supplierPoLines: params.supplierPoLines,
    });

    const nextAvailability = assessment.overallStatus;
    const nextJobReadiness: Job['materialReadiness'] = nextAvailability === 'available'
      ? 'ready'
      : nextAvailability === 'partially_available'
        ? 'partial'
        : 'awaiting_procurement';

    if (nextAvailability !== po.availabilityStatus) {
      const prev = po.availabilityStatus ?? 'awaiting_procurement';
      customerPos = customerPos.map(c => c.id === po.id ? { ...c, availabilityStatus: nextAvailability } : c);
      auditEvents.push(createAuditEventRecord({
        actor: params.actor,
        actorId: params.actorId,
        role: params.role,
        module: 'Sales',
        scope: 'CustomerPO',
        action: 'recalculate_readiness',
        entityId: po.id,
        entityRef: po.poNumber,
        timestamp: params.timestamp,
        description: `Recalculated material readiness for ${po.poNumber} after accepted inventory became available (${prev} → ${nextAvailability}).`,
        changes: [{ field: 'availabilityStatus', label: 'Material Availability', previousValue: prev, newValue: nextAvailability }],
      }));
    }

    if (targetJob && targetJob.materialReadiness !== nextJobReadiness) {
      const prevReadiness = targetJob.materialReadiness;
      jobs = jobs.map(j => j.id === targetJob.id ? {
        ...j,
        materialReadiness: nextJobReadiness,
        hasBlocker: nextJobReadiness === 'ready' ? false : j.hasBlocker,
      } : j);
      jobMaterialReqs = jobMaterialReqs.map(r => {
        if (r.jobId !== targetJob.id) return r;
        const itemAssess = assessment.items.find(i => i.materialItemId === r.materialItemId);
        return itemAssess ? { ...r, shortage: itemAssess.shortageQty > 0 } : r;
      });
      auditEvents.push(createAuditEventRecord({
        actor: params.actor,
        actorId: params.actorId,
        role: params.role,
        module: 'Production',
        scope: 'Job',
        action: 'recalculate_readiness',
        entityId: targetJob.id,
        entityRef: targetJob.jobNumber,
        timestamp: params.timestamp,
        description: `Updated ${targetJob.jobNumber} material readiness from ${prevReadiness} to ${nextJobReadiness} upon QC inventory acceptance.`,
        changes: [{ field: 'materialReadiness', label: 'Material Readiness', previousValue: prevReadiness, newValue: nextJobReadiness }],
      }));
    }
  }

  return { customerPos, jobs, jobMaterialReqs, auditEvents };
}

// Everything the demo scenario seeds — rebuilt fresh on first load AND on an
// explicit "Reset Demo Data". Kept as one function so both call sites can
// never drift apart.
function buildInitialData() {
  const raw = buildSeed();
  return stampPlaces(raw);
}

function buildSeed() {
  const flagshipRfq = RFQS_FULL[0];
  const seededFlagshipRfq: CustomerRFQ = {
    ...flagshipRfq,
    status: ['open', 'quoted', 'converted', 'lost', 'cancelled'].includes(flagshipRfq.status) ? flagshipRfq.status as CustomerRFQ['status'] : 'open',
    lineCount: flagshipRfq.lines.length,
  };
  return {
    currentUser: DEMO_USERS[0], // owner by default
    customers: [...CUSTOMERS_BASE, GERMAN_CUSTOMER],
    suppliers: [...SUPPLIERS],
    notifications: [...NOTIFICATIONS],
    unreadCount: NOTIFICATIONS.filter(n => !n.read).length,

    jobs: [...JOBS, ...FLAGSHIP_JOBS, ...JOBS_DEMO, ...DEMO_SALES_JOBS].map(j => {
      const snapshotTemplate = j.stageTemplateId
        ? STAGE_TEMPLATES.find(template => template.id === j.stageTemplateId)
        : STAGE_TEMPLATES.find(template => template.stages.length === j.stages.length) ?? STAGE_TEMPLATES[0];
      return {
        ...j,
        stageTemplateId: j.stageTemplateId ?? snapshotTemplate?.id,
        stageTemplateName: j.stageTemplateName && !j.stageTemplateName.toLowerCase().startsWith('custom') ? j.stageTemplateName : snapshotTemplate?.name,
        stages: [...j.stages],
      };
    }),
    jobUpdates: [] as JobUpdate[],
    transfers: [] as InventoryTransfer[],
    materialReturns: [] as MaterialReturn[],
    lots: [...MATERIAL_LOTS, ...MATERIAL_LOTS_DEMO, ...DEMO_LOTS],
    inventory: [...INVENTORY, ...INVENTORY_DEMO],
    movements: [...STOCK_MOVEMENTS],
    assets: [...ASSETS, ...ASSETS_DEMO],
    maintenanceEvents: [...MAINTENANCE_EVENTS, ...MAINTENANCE_EVENTS_DEMO],
    dispatches: [...DISPATCHES, ...FLAGSHIP_DISPATCHES, ...DISPATCHES_DEMO, ...DEMO_SALES_DISPATCHES],
    documents: [...VAULT_DOCUMENTS, ...VAULT_DOCUMENTS_DEMO],
    approvalRequests: [...APPROVAL_REQUESTS],
    inboxMessages: [...SEED_INBOX_MESSAGES],
    pulseExceptions: [...PULSE_EXCEPTIONS],
    customerPos: [...CUSTOMER_POS, FLAGSHIP_PO, ...CUSTOMER_POS_DEMO, ...DEMO_SALES_POS],
    supplierPos: [...SUPPLIER_POS, ...SUPPLIER_POS_DEMO, ...DEMO_SUPPLIER_POS],
    supplierPoLines: [...SUPPLIER_PO_LINES, ...SUPPLIER_PO_LINES_DEMO, ...DEMO_SUPPLIER_PO_LINES],
    poAmendments: [],
    purchaseReqs: [...PURCHASE_REQS, ...FLAGSHIP_PURCHASE_REQS, ...DEMO_SCENARIO_PRS],
    rfqs: [...RFQS, seededFlagshipRfq, ADDITIONAL_RFQ, ...DEMO_SALES_RFQS],
    quotations: [FLAGSHIP_QUOTATION, ...DEMO_CUSTOMER_QUOTATIONS],
    quotationLines: [...FLAGSHIP_QUOTATION_LINES, ...DEMO_CUSTOMER_QUOTATION_LINES],
    poLines: [...FLAGSHIP_PO_LINES, ...DEMO_SALES_PO_LINES],
    grns: [...GRNS, ...FLAGSHIP_GRNS, ...DEMO_GRNS],
    inspections: [...INSPECTIONS, ...FLAGSHIP_INSPECTIONS, ...INSPECTIONS_DEMO, ...DEMO_INSPECTIONS],
    ncrs: [...NCRS, ...FLAGSHIP_NCRS, ...NCRS_DEMO],
    certificates: [...CERTIFICATES],
    employees: [...EMPLOYEES],
    storeLocations: [...STORE_LOCATIONS],
    supplierInvitations: [...DEMO_SUPPLIER_INVITATIONS],
    supplierQuotations: [...SUPPLIER_QUOTATIONS, ...FLAGSHIP_SUPPLIER_RFQS, ...DEMO_SUPPLIER_QUOTATIONS],
    auditEvents: [...AUDIT_EVENTS, ...AUDIT_EVENTS_DEMO, ...SEED_RICH_AUDIT_EVENTS],
    approvalPolicies: [...APPROVAL_POLICIES],
    customerInvoices: [...CUSTOMER_INVOICES],
    supplierInvoices: [...SUPPLIER_INVOICES],
    paymentRecords: [...PAYMENT_RECORDS],
    invoices: [...FLAGSHIP_INVOICES, ...SEED_UNIFIED_INVOICES],
    invoiceLines: [...FLAGSHIP_INVOICE_LINES, ...SEED_UNIFIED_INVOICE_LINES],
    payments: [...FLAGSHIP_PAYMENTS, ...SEED_UNIFIED_PAYMENTS],
    paymentAllocations: [...FLAGSHIP_PAYMENT_ALLOCATIONS, ...SEED_UNIFIED_PAYMENT_ALLOCATIONS],
    collectionActivities: [...COLLECTION_ACTIVITIES],
    supplierBills: [...SEED_SUPPLIER_BILLS],
    supplierBillLines: [...SEED_SUPPLIER_BILL_LINES],
    supplierPayments: [...SEED_SUPPLIER_PAYMENTS],
    supplierPaymentAllocations: [...SEED_SUPPLIER_PAYMENT_ALLOCATIONS],
    finishedProducts: [...FINISHED_PRODUCTS],
    siteAllocations: [...FLAGSHIP_SITE_ALLOCATIONS],
    onboarding: { status: 'complete' as const, completedSteps: [1, 2, 3, 4, 5, 6, 7] },
    companyConfig: { ...COMPANY_CONFIG },
    sites: [...SITES],
    materials: [...MATERIALS],
    meterReadings: [...METER_READINGS_DEMO],
    qualityReleases: [...QUALITY_RELEASES, ...QUALITY_RELEASES_DEMO],
    inspectionTemplates: [...INSPECTION_TEMPLATES],
    stageTemplates: [...STAGE_TEMPLATES],
    jobMaterialReqs: [...JOB_MATERIAL_REQS, ...JOB_MATERIAL_REQS_DEMO, ...DEMO_SALES_JOB_REQS],
    jobBlockers: [...JOB_BLOCKERS, ...JOB_BLOCKERS_DEMO],
    toasts: [] as Toast[],
  };
}

export const useStore = create<EOSSState>()(persist((set, get) => ({
  // ── Initial State ──
  theme: (typeof window !== 'undefined' && localStorage.getItem('eoss-theme') === 'dark' ? 'dark' : 'light'),
  eossTheme: (typeof window !== 'undefined' && (localStorage.getItem('eoss-palette') as EOSSTheme)) || 'aurora',
  sidebarCollapsed: false,
  ...buildInitialData(),

  // ── Session Actions ──
  setCurrentUser: (user) => set({ currentUser: user }),

  switchRole: (role) => {
    const user = DEMO_USERS.find(u => u.role === role);
    if (user) set({ currentUser: user });
  },

  setTheme: (theme) => {
    const root = document.documentElement;
    lockThemeTransition(root);
    const mode = theme === 'dark' ? 'dark' : 'light';
    set({ theme: mode });
    root.setAttribute('data-theme', mode);
    try { localStorage.setItem('eoss-theme', mode); } catch (_) {}
  },

  setEOSSTheme: (eossTheme) => {
    const root = document.documentElement;
    lockThemeTransition(root);
    set({ eossTheme });
    root.classList.remove('theme-aurora', 'theme-ocean', 'theme-graphite');
    root.classList.add(`theme-${eossTheme}`);
    try { localStorage.setItem('eoss-palette', eossTheme); } catch (_) {}
  },

  toggleSidebar: () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  markNotificationRead: (id) => set(s => {
    const notifications = s.notifications.map(n => n.id === id ? { ...n, read: true } : n);
    return { notifications, unreadCount: notifications.filter(n => !n.read).length };
  }),

  markAllRead: () => set(s => ({
    notifications: s.notifications.map(n => ({ ...n, read: true })),
    unreadCount: 0,
  })),

  // ── Job Actions ──
  updateJobStage: (jobId, stageId, update) => set(s => ({
    jobs: s.jobs.map(j => j.id !== jobId ? j : (() => {
      const stages = j.stages.map(st => st.id !== stageId ? st : { ...st, ...update });
      const nextStage = stages.find(st => st.status === 'in_progress') ?? stages.find(st => st.status === 'pending');
      return {
        ...j,
        currentStage: nextStage?.name ?? j.currentStage,
        stages,
      };
    })()),
  })),

  skipJobStage: (jobId, stageId, reason, by) => set(s => {
    if (!reason.trim()) return s;
    const timestamp = new Date().toISOString();
    const job = s.jobs.find(j => j.id === jobId);
    if (!job) return s;
    const stages = job.stages.map(st => st.id === stageId ? { ...st, status: 'skipped' as const, skipReason: reason.trim(), skippedAt: timestamp, skippedBy: by } : st);
    const nextStage = stages.find(st => st.status === 'in_progress') ?? stages.find(st => st.status === 'pending');
    return { jobs: s.jobs.map(j => j.id === jobId ? { ...j, stages, currentStage: nextStage?.name ?? j.currentStage } : j), auditEvents: [...s.auditEvents, { id: `ae-${Date.now()}`, actor: by, actorId: s.currentUser.id, scope: 'Job', action: 'stage_skip', entityId: stageId, entityRef: job.jobNumber, timestamp, source: 'ui', reason, after: { status: 'skipped', jobId } }] };
  }),

  addJobUpdate: (jobId, update) => {
    const { updateJobStage, showToast } = get();
    set(s => ({ jobUpdates: [...s.jobUpdates, update] }));
    updateJobStage(jobId, update.jobStageId, {
      completedGoodQty: update.completedGoodQty,
      rejectedQty: update.rejectedQty,
      reworkQty: update.reworkQty,
      scrapQty: update.scrapQty,
      status: update.action === 'complete' ? 'complete' : update.action === 'hold' ? 'hold' : 'in_progress',
      actualEnd: update.action === 'complete' ? update.timestamp : undefined,
    });
    showToast({ type: 'success', title: 'Stage updated', body: `${update.stageName} progress recorded.` });
  },

  setJobStatus: (jobId, status) => set(s => ({
    jobs: s.jobs.map(j => j.id !== jobId ? j : { ...j, status }),
    auditEvents: [...s.auditEvents, {
      id: `ae-${Date.now()}`, actor: s.currentUser.name, actorId: s.currentUser.id,
      scope: 'Job', action: 'status_change', entityId: jobId, entityRef: s.jobs.find(j => j.id === jobId)?.jobNumber ?? jobId,
      timestamp: new Date().toISOString(), source: 'ui', after: { status },
    }],
  })),

  resolveBlocker: (blockerId) => {
    set(s => {
      const blocker = s.jobBlockers.find(b => b.id === blockerId);
      if (!blocker) return s;
      const resolvedAt = new Date().toISOString();
      const jobBlockers = s.jobBlockers.map(b => b.id === blockerId ? { ...b, status: 'resolved' as const, resolvedAt } : b);
      const stillOpenForJob = jobBlockers.some(b => b.jobId === blocker.jobId && b.status === 'open');
      const jobs = s.jobs.map(j => j.id === blocker.jobId ? { ...j, hasBlocker: stillOpenForJob } : j);
      return { jobBlockers, jobs };
    });
    get().showToast({ type: 'success', title: 'Blocker resolved', body: `Blocker ${blockerId} marked as resolved.` });
  },

  addJobBlocker: (blocker) => set(s => ({
    jobBlockers: [...s.jobBlockers, blocker],
    jobs: s.jobs.map(j => j.id === blocker.jobId ? { ...j, hasBlocker: true } : j),
  })),

  // ── Material Master Actions ──
  addMaterial: (material) => set(s => ({ materials: [...s.materials, material] })),

  updateMaterial: (id, update) => set(s => ({
    materials: s.materials.map(m => m.id !== id ? m : { ...m, ...update }),
  })),

  // ── Maintenance Actions ──
  addMeterReading: (reading) => set(s => ({
    meterReadings: [...s.meterReadings, reading],
    assets: s.assets.map(a => a.id !== reading.assetId ? a : { ...a, currentReading: reading.reading }),
  })),

  // ── Quality Release / Inspection Actions ──
  addQualityRelease: (release) => {
    set(s => ({ qualityReleases: [...s.qualityReleases, release] }));
    get().showToast({ type: 'success', title: 'Quality release issued', body: `${release.jobNumber} cleared for dispatch.` });
  },

  // ── Inventory Actions ──
  updateInventoryItem: (id, partial) => set(s => ({
    inventory: s.inventory.map(i => i.id === id ? { ...i, ...partial } : i),
  })),

  addInventoryItem: (item) => set(s => ({ inventory: [item, ...s.inventory] })),

  issueMaterial: (lotId, qty, jobId, jobNumber, by) => {
    const timestamp = new Date().toISOString();
    set(s => {
      const lot = s.lots.find(l => l.id === lotId);
      const stock = lot ? s.inventory.find(i => i.materialItemId === lot.materialItemId && i.locationId === lot.storeLocationId) : undefined;
      if (!lot || !stock || !['available', 'reserved'].includes(lot.status) || qty <= 0 || qty > stock.availableQty) return s;
      const newMovement: StockMovement = {
        id: `sm-${Date.now()}`, lotId, movementType: 'Issue', primaryQty: qty,
        uom: lot.primaryUom, fromLocation: lot.storeLocationName, toLocation: 'WIP Store',
        referenceType: 'Job', referenceId: jobId, referenceNumber: jobNumber, performedBy: by, timestamp,
      };
      return {
        lots: s.lots.map(l => l.id !== lotId ? l : { ...l, primaryQty: Math.max(0, l.primaryQty - qty), status: l.primaryQty - qty <= 0 ? 'issued' as const : l.status }),
        movements: [...s.movements, newMovement],
        inventory: s.inventory.map(inv => inv.id !== stock.id ? inv
          : { ...inv, onHandQty: Math.max(0, inv.onHandQty - qty), availableQty: Math.max(0, inv.availableQty - qty), reservedQty: Math.max(0, inv.reservedQty - Math.min(inv.reservedQty, qty)), shortage: inv.availableQty - qty < inv.reorderPoint }),
        jobMaterialReqs: s.jobMaterialReqs.map(req => req.jobId !== jobId || req.materialItemId !== lot.materialItemId ? req : { ...req, issuedQty: req.issuedQty + qty }),
        auditEvents: [...s.auditEvents, { id: `ae-${Date.now()}`, actor: by, actorId: s.currentUser.id, scope: 'Inventory', action: 'issue', entityId: lotId, entityRef: jobNumber, timestamp, source: 'ui', after: { qty, jobId } }],
      };
    });
    get().showToast({ type: 'success', title: 'Material issued', body: `${qty} ${get().lots.find(l => l.id === lotId)?.primaryUom ?? ''} issued to ${jobNumber}.` });
  },

  reserveMaterial: (requirementId, qty, by) => {
    set(s => {
      const req = s.jobMaterialReqs.find(r => r.id === requirementId);
      const job = req ? s.jobs.find(j => j.id === req.jobId) : undefined;
      if (!req || !job || qty <= 0) return s;
      const siteLocationIds = new Set(s.storeLocations.filter(l => l.siteId === job.siteId).map(l => l.id));
      const stock = s.inventory.find(i => i.materialItemId === req.materialItemId && siteLocationIds.has(i.locationId) && i.availableQty >= qty);
      if (!stock) return s;
      const lotId = req.lotIds[0] ?? s.lots.find(l => l.materialItemId === req.materialItemId)?.id ?? '';
      const timestamp = new Date().toISOString();
      return {
        inventory: s.inventory.map(i => i.id !== stock.id ? i : { ...i, availableQty: i.availableQty - qty, reservedQty: i.reservedQty + qty }),
        jobMaterialReqs: s.jobMaterialReqs.map(r => r.id !== requirementId ? r : {
          ...r, reservedQty: r.reservedQty + qty, shortage: r.requiredQty > r.reservedQty + qty,
        }),
        movements: [...s.movements, {
          id: `sm-${Date.now()}`, lotId, movementType: 'Reservation' as const, primaryQty: qty, uom: req.uom,
          fromLocation: stock.locationName, toLocation: `Reserved for ${job.jobNumber}`, referenceType: 'Job', referenceId: job.id,
          referenceNumber: job.jobNumber, performedBy: by, timestamp,
        }],
        auditEvents: [...s.auditEvents, {
          id: `ae-${Date.now()}`, actor: by, actorId: s.currentUser.id, scope: 'Inventory', action: 'reserve', entityId: requirementId,
          entityRef: job.jobNumber, timestamp, source: 'ui', after: { qty, materialItemId: req.materialItemId, jobId: job.id },
        }],
      };
    });
    get().showToast({ type: 'success', title: 'Material reserved', body: 'The reservation is now reflected in Stock on Hand and Site Need.' });
  },

  returnMaterial: (lotId, qty, jobId, jobNumber, by) => {
    set(s => {
      const lot = s.lots.find(l => l.id === lotId);
      if (!lot || qty <= 0) return s;
      const inventoryRow = s.inventory.find(i => i.materialItemId === lot.materialItemId && i.locationName === lot.storeLocationName)
        ?? s.inventory.find(i => i.materialItemId === lot.materialItemId);
      if (!inventoryRow) return s;
      const timestamp = new Date().toISOString();
      return {
        lots: s.lots.map(l => l.id !== lotId ? l : { ...l, primaryQty: l.primaryQty + qty, status: 'available' as const }),
        inventory: s.inventory.map(i => i.id !== inventoryRow.id ? i : { ...i, onHandQty: i.onHandQty + qty, availableQty: i.availableQty + qty, shortage: i.availableQty + qty < i.reorderPoint }),
        movements: [...s.movements, {
          id: `sm-${Date.now()}`, lotId, movementType: 'Return' as const, primaryQty: qty, uom: lot.primaryUom,
          fromLocation: `Job ${jobNumber}`, toLocation: lot.storeLocationName, referenceType: 'Job Return', referenceId: jobId,
          referenceNumber: jobNumber, performedBy: by, timestamp, notes: 'Accepted return from cancelled or completed job.',
        }],
        auditEvents: [...s.auditEvents, {
          id: `ae-${Date.now()}`, actor: by, actorId: s.currentUser.id, scope: 'Inventory', action: 'return', entityId: lotId,
          entityRef: jobNumber, timestamp, source: 'ui', after: { qty, jobId, movementType: 'Return' },
        }],
      };
    });
    get().showToast({ type: 'success', title: 'Material return recorded', body: 'Returned material is available only after the return transaction is accepted.' });
  },

  createMaterialReturn: (lotId, qty, jobId, jobNumber, by, notes) => {
    set(s => {
      const lot = s.lots.find(l => l.id === lotId);
      const job = s.jobs.find(j => j.id === jobId);
      const receiving = s.storeLocations.find(l => l.locationType === 'Quarantine') ?? s.storeLocations[0];
      if (!lot || !job || !receiving || qty <= 0) return s;
      const availableToReturn = s.movements.filter(m => m.lotId === lotId && m.referenceId === jobId && m.movementType === 'Issue').reduce((sum, m) => sum + m.primaryQty, 0)
        - s.materialReturns.filter(r => r.originalLotId === lotId && r.jobId === jobId && r.status !== 'rejected').reduce((sum, r) => sum + r.quantity, 0);
      if (qty > availableToReturn) return s;
      const timestamp = new Date().toISOString();
      const returnNumber = `RET-${String(s.materialReturns.length + 1).padStart(4, '0')}`;
      const record: MaterialReturn = { id: `ret-${Date.now()}`, returnNumber, originalLotId: lotId, materialItemId: lot.materialItemId, materialName: lot.materialName, jobId, jobNumber, quantity: qty, uom: lot.primaryUom, receivingLocationId: receiving.id, receivingLocationName: receiving.name, status: 'pending_inspection', raisedAt: timestamp, raisedBy: by, notes };
      return {
        materialReturns: [record, ...s.materialReturns],
        movements: [...s.movements, { id: `sm-${Date.now()}`, lotId, movementType: 'Return' as const, primaryQty: qty, uom: lot.primaryUom, fromLocation: `Job ${jobNumber}`, toLocation: receiving.name, referenceType: 'Material Return', referenceId: record.id, referenceNumber: returnNumber, performedBy: by, timestamp, notes: notes ?? 'Awaiting return inspection.' }],
        auditEvents: [...s.auditEvents, { id: `ae-${Date.now()}`, actor: by, actorId: s.currentUser.id, scope: 'Inventory', action: 'return_request', entityId: record.id, entityRef: returnNumber, timestamp, source: 'ui', after: record as unknown as Record<string, unknown> }],
      };
    });
    get().showToast({ type: 'success', title: 'Material return raised', body: 'The return is awaiting inspection and is not available stock yet.' });
  },

  acceptMaterialReturn: (returnId, by) => {
    set(s => {
      const record = s.materialReturns.find(r => r.id === returnId);
      const sourceLot = record ? s.lots.find(l => l.id === record.originalLotId) : undefined;
      if (!record || !sourceLot || record.status !== 'pending_inspection') return s;
      const destination = s.storeLocations.find(l => l.id === record.receivingLocationId) ?? s.storeLocations[0];
      if (!destination) return s;
      const timestamp = new Date().toISOString();
      const acceptedLotId = `lot-return-${Date.now()}`;
      const acceptedLot: MaterialLot = { ...sourceLot, id: acceptedLotId, lotNumber: `${record.returnNumber}-ACCEPTED`, grnId: undefined, receivedDate: timestamp.slice(0, 10), status: 'available', storeLocationId: destination.id, storeLocationName: destination.name, primaryQty: record.quantity, parentLotId: sourceLot.id };
      const existing = s.inventory.find(i => i.materialItemId === record.materialItemId && i.locationId === destination.id);
      const inventory = existing ? s.inventory.map(i => i.id === existing.id ? { ...i, onHandQty: i.onHandQty + record.quantity, availableQty: i.availableQty + record.quantity, lotCount: i.lotCount + 1, shortage: i.availableQty + record.quantity < i.reorderPoint } : i) : s.inventory;
      if (!existing) {
        const material = s.materials.find(m => m.id === record.materialItemId);
        inventory.unshift({ id: `inv-return-${Date.now()}`, materialItemId: record.materialItemId, materialCode: material?.itemCode ?? record.materialItemId, materialName: record.materialName, categoryName: material?.categoryName ?? 'Returned material', locationId: destination.id, locationName: destination.name, onHandQty: record.quantity, availableQty: record.quantity, reservedQty: 0, qcHoldQty: 0, inTransitQty: 0, primaryUom: record.uom, reorderPoint: material?.reorderPoint ?? 0, shortage: false, lotCount: 1 });
      }
      return {
        materialReturns: s.materialReturns.map(r => r.id === returnId ? { ...r, status: 'accepted' as const, inspectedAt: timestamp, inspectedBy: by } : r),
        lots: [...s.lots, acceptedLot], inventory,
        movements: [...s.movements, { id: `sm-${Date.now()}-accepted`, lotId: acceptedLotId, movementType: 'Adjustment' as const, primaryQty: record.quantity, uom: record.uom, fromLocation: destination.name, toLocation: destination.name, referenceType: 'Accepted Material Return', referenceId: record.id, referenceNumber: record.returnNumber, performedBy: by, timestamp, notes: 'Accepted after return inspection.' }],
        auditEvents: [...s.auditEvents, { id: `ae-${Date.now()}`, actor: by, actorId: s.currentUser.id, scope: 'Inventory', action: 'return_accept', entityId: returnId, entityRef: record.returnNumber, timestamp, source: 'ui', after: { status: 'accepted', quantity: record.quantity } }],
      };
    });
    get().showToast({ type: 'success', title: 'Material return accepted', body: 'Accepted returned material is now available in Inventory.' });
  },

  rejectMaterialReturn: (returnId, by, reason) => {
    set(s => {
      const record = s.materialReturns.find(r => r.id === returnId);
      if (!record || record.status !== 'pending_inspection') return s;
      const timestamp = new Date().toISOString();
      return {
        materialReturns: s.materialReturns.map(r => r.id === returnId ? { ...r, status: 'rejected' as const, inspectedAt: timestamp, inspectedBy: by, notes: reason ?? r.notes } : r),
        movements: [...s.movements, { id: `sm-${Date.now()}-rejected`, lotId: record.originalLotId, movementType: 'Scrap' as const, primaryQty: record.quantity, uom: record.uom, fromLocation: record.receivingLocationName, toLocation: 'Rejected Returns', referenceType: 'Rejected Material Return', referenceId: record.id, referenceNumber: record.returnNumber, performedBy: by, timestamp, notes: reason ?? 'Rejected after return inspection.' }],
        auditEvents: [...s.auditEvents, { id: `ae-${Date.now()}`, actor: by, actorId: s.currentUser.id, scope: 'Inventory', action: 'return_reject', entityId: returnId, entityRef: record.returnNumber, timestamp, source: 'ui', reason }],
      };
    });
    get().showToast({ type: 'info', title: 'Material return rejected', body: 'The quantity was not added to available stock.' });
  },

  createStockTransfer: (lotId, destinationLocationId, qty, by, notes) => {
    const timestamp = new Date().toISOString();
    set(s => {
      const lot = s.lots.find(l => l.id === lotId);
      const destination = s.storeLocations.find(sl => sl.id === destinationLocationId);
      const sourceInventory = lot ? s.inventory.find(i => i.materialItemId === lot.materialItemId && i.locationId === lot.storeLocationId) : undefined;
      if (!lot || !destination || !sourceInventory || lot.status !== 'available' || qty <= 0 || qty > lot.primaryQty || qty > sourceInventory.availableQty || destination.id === lot.storeLocationId) return s;
      const transferNumber = `MV-${String(s.transfers.length + 1).padStart(4, '0')}`;
      const transfer: InventoryTransfer = { id: `mv-${Date.now()}`, transferNumber, lotId, materialItemId: lot.materialItemId, materialName: lot.materialName, grade: lot.grade, sourceLocationId: lot.storeLocationId, sourceLocationName: lot.storeLocationName, destinationLocationId: destination.id, destinationLocationName: destination.name, quantity: qty, uom: lot.primaryUom, status: 'in_transit', initiatedAt: timestamp, initiatedBy: by, dispatchedAt: timestamp, notes };
      const newMovement: StockMovement = {
        id: `sm-${Date.now()}`, lotId, movementType: 'Transfer-Out', primaryQty: qty,
        uom: lot.primaryUom, fromLocation: lot.storeLocationName, toLocation: 'In Transit',
        referenceType: 'Transfer', referenceId: transfer.id, referenceNumber: transferNumber, performedBy: by, timestamp, notes,
      };
      return {
        transfers: [transfer, ...s.transfers],
        lots: s.lots.map(l => l.id !== lotId ? l : { ...l, primaryQty: l.primaryQty - qty, status: l.primaryQty - qty <= 0 ? 'issued' as const : l.status }),
        inventory: s.inventory.map(i => i.id !== sourceInventory.id ? i : { ...i, onHandQty: i.onHandQty - qty, availableQty: i.availableQty - qty, inTransitQty: i.inTransitQty + qty, shortage: i.availableQty - qty < i.reorderPoint }),
        movements: [...s.movements, newMovement],
        auditEvents: [...s.auditEvents, { id: `ae-${Date.now()}`, actor: by, actorId: s.currentUser.id, scope: 'Inventory', action: 'transfer_create', entityId: transfer.id, entityRef: transferNumber, timestamp, source: 'ui', after: transfer as unknown as Record<string, unknown> }],
      };
    });
    get().showToast({ type: 'success', title: 'Transfer in transit', body: 'Source stock was reduced and the transfer awaits destination receipt.' });
  },

  receiveStockTransfer: (transferId, by) => {
    set(s => {
      const transfer = s.transfers.find(t => t.id === transferId);
      const sourceLot = transfer ? s.lots.find(l => l.id === transfer.lotId) : undefined;
      const destination = transfer ? s.storeLocations.find(l => l.id === transfer.destinationLocationId) : undefined;
      if (!transfer || !sourceLot || !destination || transfer.status !== 'in_transit') return s;
      const timestamp = new Date().toISOString();
      const receivedLotId = `lot-transfer-${Date.now()}`;
      const receivedLot: MaterialLot = { ...sourceLot, id: receivedLotId, lotNumber: `${transfer.transferNumber}-${sourceLot.lotNumber}`, storeLocationId: destination.id, storeLocationName: destination.name, primaryQty: transfer.quantity, status: 'available', receivedDate: timestamp.slice(0, 10), parentLotId: sourceLot.id };
      const sourceInventory = s.inventory.find(i => i.materialItemId === transfer.materialItemId && i.locationId === transfer.sourceLocationId);
      const existing = s.inventory.find(i => i.materialItemId === transfer.materialItemId && i.locationId === destination.id);
      const inventory = s.inventory.map(i => {
        if (sourceInventory && i.id === sourceInventory.id) return { ...i, inTransitQty: Math.max(0, i.inTransitQty - transfer.quantity) };
        if (existing && i.id === existing.id) return { ...i, onHandQty: i.onHandQty + transfer.quantity, availableQty: i.availableQty + transfer.quantity, lotCount: i.lotCount + 1, shortage: i.availableQty + transfer.quantity < i.reorderPoint };
        return i;
      });
      if (!existing) {
        const master = s.inventory.find(i => i.materialItemId === transfer.materialItemId);
        if (master) inventory.push({ ...master, id: `inv-transfer-${Date.now()}`, locationId: destination.id, locationName: destination.name, onHandQty: transfer.quantity, availableQty: transfer.quantity, reservedQty: 0, qcHoldQty: 0, inTransitQty: 0, lotCount: 1, shortage: transfer.quantity < master.reorderPoint });
      }
      return {
        transfers: s.transfers.map(t => t.id === transferId ? { ...t, status: 'received' as const, receivedAt: timestamp, receivedBy: by } : t),
        lots: [...s.lots, receivedLot], inventory,
        movements: [...s.movements, { id: `sm-${Date.now()}`, lotId: receivedLotId, movementType: 'Transfer-In' as const, primaryQty: transfer.quantity, uom: transfer.uom, fromLocation: 'In Transit', toLocation: destination.name, referenceType: 'Transfer', referenceId: transfer.id, referenceNumber: transfer.transferNumber, performedBy: by, timestamp }],
        auditEvents: [...s.auditEvents, { id: `ae-${Date.now()}`, actor: by, actorId: s.currentUser.id, scope: 'Inventory', action: 'transfer_receive', entityId: transfer.id, entityRef: transfer.transferNumber, timestamp, source: 'ui', after: { status: 'received', receivedLotId } }],
      };
    });
    get().showToast({ type: 'success', title: 'Transfer received', body: 'Destination inventory now includes the transferred quantity.' });
  },

  transferLot: (lotId, toLocation, by) => {
    const lot = get().lots.find(l => l.id === lotId);
    const destination = get().storeLocations.find(l => l.id === toLocation || l.name === toLocation);
    if (lot && destination) get().createStockTransfer(lotId, destination.id, lot.primaryQty, by);
  },

  setLotStatus: (lotId, status) => set(s => ({
    lots: s.lots.map(l => l.id !== lotId ? l : { ...l, status }),
  })),

  releaseLotFromHold: (lotId, decision, by, reason) => {
    const timestamp = new Date().toISOString();
    set(s => {
      const lot = s.lots.find(l => l.id === lotId);
      if (!lot || lot.status !== 'qc_hold') return s;
      const qty = lot.primaryQty;
      const acceptedQty = decision === 'available' ? qty : 0;
      const rejectedQty = decision === 'scrapped' ? qty : 0;
      const relocated = applyReleasedStockLocation({
        inventory: s.inventory,
        storeLocations: s.storeLocations,
        materials: s.materials,
        lot,
        acceptedQty,
        rejectedQty,
      });
      const movement: StockMovement = {
        id: `sm-${Date.now()}`,
        lotId,
        movementType: decision === 'available' ? 'Transfer-In' : 'Scrap',
        primaryQty: qty,
        uom: lot.primaryUom,
        fromLocation: `${lot.storeLocationName} (QC Hold)`,
        toLocation: decision === 'available' ? relocated.targetStoreName : 'Rejected / Quarantine Scrap',
        referenceType: 'QC Decision',
        referenceId: lot.id,
        referenceNumber: lot.lotNumber,
        performedBy: by,
        timestamp,
        notes: reason,
      };
      const updatedLots = s.lots.map(l => l.id !== lotId ? l : {
        ...l,
        status: decision,
        storeLocationId: decision === 'available' ? relocated.targetStoreId : l.storeLocationId,
        storeLocationName: decision === 'available' ? relocated.targetStoreName : l.storeLocationName,
        acceptedQty,
        rejectedQty,
      });
      const grnStillHasHold = lot.grnId ? updatedLots.some(l => l.grnId === lot.grnId && l.status === 'qc_hold') : false;
      const reconciled = decision === 'available'
        ? reconcilePendingOrdersOnStockAccepted({
            customerPos: s.customerPos,
            jobs: s.jobs,
            jobMaterialReqs: s.jobMaterialReqs,
            poLines: s.poLines,
            materials: s.materials,
            lots: updatedLots,
            storeLocations: s.storeLocations,
            sites: s.sites,
            supplierPos: s.supplierPos,
            supplierPoLines: s.supplierPoLines,
            purchaseReqs: s.purchaseReqs,
            acceptedMaterialItemId: lot.materialItemId,
            actor: by,
            actorId: s.currentUser.id,
            role: s.currentUser.role,
            timestamp,
          })
        : { customerPos: s.customerPos, jobs: s.jobs, jobMaterialReqs: s.jobMaterialReqs, auditEvents: [] };
      return {
        lots: updatedLots,
        customerPos: reconciled.customerPos,
        jobs: reconciled.jobs,
        jobMaterialReqs: reconciled.jobMaterialReqs,
        grns: decision === 'available' && lot.grnId && !grnStillHasHold
          ? s.grns.map(g => g.id === lot.grnId && (g.status === 'qc_hold' || g.status === 'pending_qc') ? { ...g, status: 'accepted' as const } : g)
          : s.grns,
        inventory: relocated.inventory,
        movements: [...s.movements, movement],
        inspections: s.inspections.map(ins => ins.lotId !== lotId || ins.result === 'pass' || ins.result === 'fail' ? ins : {
          ...ins,
          result: decision === 'available' ? 'pass' : 'fail',
          acceptedQty,
          rejectedQty,
          approvedAt: timestamp,
          remarks: reason || ins.remarks,
        }),
        auditEvents: [...s.auditEvents, createAuditEventRecord({
          actor: by,
          actorId: s.currentUser.id,
          role: s.currentUser.role,
          module: 'Quality',
          scope: 'MaterialLot',
          action: `qc_${decision}`,
          entityId: lot.id,
          entityRef: lot.lotNumber,
          timestamp,
          description: `${lot.lotNumber} (${lot.materialName}, ${qty} ${lot.primaryUom}) released from QC Hold to ${decision === 'available' ? relocated.targetStoreName : 'Quarantine Scrap'}`,
          reason,
          after: { status: decision, qty, storeLocationName: decision === 'available' ? relocated.targetStoreName : lot.storeLocationName },
        }), ...reconciled.auditEvents],
      };
    });
    get().showToast({
      type: decision === 'available' ? 'success' : 'warning',
      title: decision === 'available' ? 'Lot released to Available stock' : 'Lot rejected & quarantined',
    });
  },

  // ── Asset Actions ──
  addAsset: (asset) => set(s => ({
    assets: [asset, ...s.assets],
    auditEvents: [...s.auditEvents, createAuditEventRecord({
      actor: s.currentUser.name,
      actorId: s.currentUser.id,
      role: s.currentUser.role,
      scope: 'Asset',
      action: 'create',
      entityId: asset.id,
      entityRef: asset.assetCode,
      description: `Added Asset ${asset.assetCode} — ${asset.name} (${asset.category}, ${asset.workCentre}).`,
      after: { assetCode: asset.assetCode, name: asset.name, status: asset.status, siteId: asset.siteId },
    })],
  })),

  archiveAsset: (assetId, reason, by) => {
    set(s => {
      const asset = s.assets.find(a => a.id === assetId);
      if (!asset || asset.archivedAt) return s;
      const timestamp = new Date().toISOString();
      return {
        assets: s.assets.map(a => a.id === assetId ? {
          ...a,
          status: 'retired' as const,
          archivedAt: timestamp,
          archivedBy: by,
          archiveReason: reason.trim(),
        } : a),
        auditEvents: [...s.auditEvents, createAuditEventRecord({
          actor: by, actorId: s.currentUser.id, role: s.currentUser.role,
          scope: 'Asset', action: 'archive',
          entityId: assetId, entityRef: asset.assetCode, timestamp,
          description: `Retired Asset ${asset.assetCode} (${asset.name}).`,
          reason: reason.trim(),
          before: { status: asset.status },
          after: { status: 'retired', archivedAt: timestamp },
        })],
      };
    });
    get().showToast({ type: 'success', title: 'Asset archived', body: 'The asset is hidden from active lists and its history is preserved.' });
  },

  setAssetStatus: (assetId, status) => set(s => {
    const existing = s.assets.find(a => a.id === assetId);
    if (!existing) return s;
    return {
      assets: s.assets.map(a => a.id !== assetId ? a : { ...a, status }),
      auditEvents: [...s.auditEvents, createAuditEventRecord({
        actor: s.currentUser.name, actorId: s.currentUser.id, role: s.currentUser.role,
        scope: 'Asset', action: 'update', entityId: assetId, entityRef: existing.assetCode,
        description: `Updated ${existing.assetCode} status to ${status}.`,
        before: { status: existing.status }, after: { status },
      })],
    };
  }),

  addMaintenanceEvent: (event) => set(s => {
    const timestamp = new Date().toISOString();
    const isOpenBreakdown = event.type === 'Breakdown' && event.status !== 'closed';
    const newBlockers: JobBlocker[] = isOpenBreakdown
      ? (event.affectedJobs ?? []).map((aj, idx) => ({
          id: `blk-me-${Date.now()}-${idx}`,
          jobId: aj.jobId,
          jobNumber: aj.jobNumber,
          type: 'Machine' as const,
          category: 'Machine',
          description: `Blocked due to ${event.eventNumber} on ${event.assetCode} (${event.assetName}): ${event.symptom}`,
          raisedBy: s.currentUser.name,
          raisedAt: timestamp,
          status: 'open',
          linkedAssetId: event.assetId,
          linkedAssetCode: event.assetCode,
          linkedMaintenanceEventId: event.id,
          linkedMaintenanceEventNumber: event.eventNumber,
        }))
      : [];
    const affectedJobIds = new Set(newBlockers.map(b => b.jobId));
    const jobAuditEvents: AuditEvent[] = newBlockers.map((b, idx) => createAuditEventRecord({
      id: `ae-blk-${Date.now()}-${idx}`,
      actor: s.currentUser.name, actorId: s.currentUser.id, role: s.currentUser.role,
      scope: 'Job', action: 'hold', entityId: b.jobId, entityRef: b.jobNumber ?? b.jobId, timestamp,
      description: `Machine breakdown ${event.eventNumber} (${event.assetCode}) flagged ${b.jobNumber} as blocked.`,
      relatedEntityType: 'Maintenance', relatedEntityId: event.id, relatedEntityRef: event.eventNumber,
    }));
    return {
      maintenanceEvents: [event, ...s.maintenanceEvents],
      assets: s.assets.map(a => {
        if (a.id !== event.assetId || a.status === 'retired') return a;
        if (isOpenBreakdown) return { ...a, status: 'breakdown' as const };
        if ((event.type === 'Preventive' || event.type === 'Corrective') && event.status === 'in_progress' && a.status === 'operational') {
          return { ...a, status: 'in_maintenance' as const };
        }
        return a;
      }),
      jobBlockers: newBlockers.length > 0 ? [...newBlockers, ...s.jobBlockers] : s.jobBlockers,
      jobs: affectedJobIds.size > 0
        ? s.jobs.map(j => affectedJobIds.has(j.id) ? { ...j, hasBlocker: true } : j)
        : s.jobs,
      auditEvents: [
        ...s.auditEvents,
        createAuditEventRecord({
          actor: s.currentUser.name, actorId: s.currentUser.id, role: s.currentUser.role,
          scope: 'Maintenance', action: 'create', entityId: event.id, entityRef: event.eventNumber, timestamp,
          description: `Logged ${event.type} event ${event.eventNumber} on ${event.assetCode} (${event.assetName}): ${event.symptom}.`,
          relatedEntityType: 'Asset', relatedEntityId: event.assetId, relatedEntityRef: event.assetCode,
          after: { type: event.type, status: event.status, severity: event.severity, affectedJobs: event.affectedJobs?.length ?? 0 },
        }),
        ...jobAuditEvents,
      ],
    };
  }),

  closeMaintenanceEvent: (eventId, diagnosis, workDone, options) => {
    set(s => {
      const target = s.maintenanceEvents.find(me => me.id === eventId);
      if (!target) return s;
      const now = new Date().toISOString();
      const endTs = options?.downtimeEnd || target.downtimeEnd || now.slice(0, 16);
      const compDate = options?.completionDate || endTs.slice(0, 10) || now.slice(0, 10);
      const maintenanceEvents = s.maintenanceEvents.map(me =>
        me.id !== eventId ? me : {
          ...me,
          status: 'closed' as const,
          diagnosis,
          workDone,
          notes: options?.notes ?? me.notes,
          downtimeEnd: endTs,
          completionDate: compDate,
        });
      const hasOtherBreakdown = maintenanceEvents.some(me => me.assetId === target.assetId && me.type === 'Breakdown' && me.status !== 'closed');
      const hasOtherInProgress = maintenanceEvents.some(me => me.assetId === target.assetId && me.status === 'in_progress');
      const assets = s.assets.map(a => {
        if (a.id !== target.assetId || a.status === 'retired') return a;
        const nextStatus = hasOtherBreakdown ? 'breakdown' as const
          : hasOtherInProgress ? 'in_maintenance' as const
          : (a.status === 'breakdown' || a.status === 'in_maintenance') ? 'operational' as const : a.status;
        return {
          ...a,
          status: nextStatus,
          ...(target.type === 'Preventive' ? { lastServiceDate: compDate } : {}),
        };
      });
      const updatedBlockers = s.jobBlockers.map(b =>
        b.linkedMaintenanceEventId === eventId && b.status === 'open'
          ? { ...b, status: 'resolved' as const, resolvedAt: now }
          : b
      );
      const jobs = s.jobs.map(j => {
        const hadLinkedBlocker = s.jobBlockers.some(b => b.jobId === j.id && b.linkedMaintenanceEventId === eventId);
        if (!hadLinkedBlocker) return j;
        return { ...j, hasBlocker: updatedBlockers.some(b => b.jobId === j.id && b.status === 'open') };
      });
      return {
        maintenanceEvents,
        assets,
        jobBlockers: updatedBlockers,
        jobs,
        auditEvents: [...s.auditEvents, createAuditEventRecord({
          actor: s.currentUser.name, actorId: s.currentUser.id, role: s.currentUser.role,
          scope: 'Maintenance', action: 'close', entityId: eventId, entityRef: target.eventNumber, timestamp: now,
          description: `Closed ${target.type} event ${target.eventNumber} on ${target.assetCode}. Work done: ${workDone}.`,
          relatedEntityType: 'Asset', relatedEntityId: target.assetId, relatedEntityRef: target.assetCode,
          before: { status: target.status }, after: { status: 'closed', completionDate: compDate },
        })],
      };
    });
    get().showToast({ type: 'success', title: 'Maintenance event closed' });
  },

  // ── Procurement Actions ──
  setSupplierPoStatus: (spoId, status) => set(s => ({
    supplierPos: s.supplierPos.map(po => po.id !== spoId ? po : { ...po, status }),
  })),

  addPoAmendment: (amendment) => set(s => ({
    poAmendments: [amendment, ...s.poAmendments],
    customerPos: amendment.entityType === 'customer_po' ? s.customerPos.map(po => po.id === amendment.poId ? { ...po, hasAmendment: true } : po) : s.customerPos,
    supplierPos: amendment.entityType === 'supplier_po' ? s.supplierPos.map(po => po.id === amendment.poId ? { ...po, hasAmendment: true } : po) : s.supplierPos,
  })),

  resolvePoAmendment: (amendmentId, resolution, by) => {
    const amendment = get().poAmendments.find(a => a.id === amendmentId);
    if (!amendment || amendment.status !== 'pending_approval') return;
    const now = new Date().toISOString();
    const lineChanges = amendment.lineChanges;
    set(s => {
      const poAmendments = s.poAmendments.map(a => a.id === amendmentId ? { ...a, status: resolution, approvedBy: by, approvedAt: now } : a);
      if (resolution === 'rejected') return { poAmendments };
      if (amendment.entityType === 'customer_po') {
        const customerPos = s.customerPos.map(po => po.id !== amendment.poId ? po : {
          ...po,
          ...(amendment.headerChanges?.paymentTerms ? { paymentTerms: amendment.headerChanges.paymentTerms } : {}),
          ...(amendment.headerChanges?.deliveryTerms ? { deliveryTerms: amendment.headerChanges.deliveryTerms } : {}),
          revision: amendment.revision, lastAmendedAt: now, hasAmendment: true,
        });
        const poLines = amendment.lineId && lineChanges ? s.poLines.map(line => line.id !== amendment.lineId ? line : {
          ...line,
          ...(lineChanges.description ? { description: lineChanges.description } : {}),
          ...(lineChanges.drawingRevision ? { revision: lineChanges.drawingRevision } : {}),
          ...(lineChanges.quantity !== undefined ? { orderedQty: lineChanges.quantity, value: lineChanges.quantity * line.rate } : {}),
          ...(lineChanges.rate !== undefined ? { rate: lineChanges.rate, value: line.orderedQty * lineChanges.rate } : {}),
          ...(lineChanges.requiredDate ? { requiredDate: lineChanges.requiredDate } : {}),
        }) : s.poLines;
        return { poAmendments, customerPos, poLines };
      }
      const supplierPos = s.supplierPos.map(po => po.id !== amendment.poId ? po : {
        ...po,
        ...(amendment.headerChanges?.paymentTerms ? { paymentTerms: amendment.headerChanges.paymentTerms } : {}),
        ...(amendment.headerChanges?.committedDate ? { committedDate: amendment.headerChanges.committedDate } : {}),
        revision: amendment.revision, lastAmendedAt: now, hasAmendment: true,
      });
      const supplierPoLines = amendment.lineId && lineChanges ? s.supplierPoLines.map(line => line.id !== amendment.lineId ? line : {
        ...line,
        ...(lineChanges.materialName ? { materialName: lineChanges.materialName } : {}),
        ...(lineChanges.quantity !== undefined ? { orderedQty: lineChanges.quantity, value: lineChanges.quantity * line.rate } : {}),
        ...(lineChanges.rate !== undefined ? { value: lineChanges.quantity !== undefined ? lineChanges.quantity * lineChanges.rate : line.orderedQty * lineChanges.rate } : {}),
        ...(lineChanges.requiredDate ? { committedDate: lineChanges.requiredDate } : {}),
      }) : s.supplierPoLines;
      return { poAmendments, supplierPos, supplierPoLines };
    });
    get().showToast({ type: resolution === 'approved' ? 'success' : 'info', title: resolution === 'approved' ? 'Amendment approved' : 'Amendment rejected', body: resolution === 'approved' ? `${amendment.poNumber} revised to Rev ${amendment.revision}.` : `${amendment.poNumber} remains on its previous revision.` });
  },

  // ── Approval Actions ──
  resolveApproval: (aprId, resolution, by, notes) => {
    set(s => {
      const request = s.approvalRequests.find(a => a.id === aprId);
      if (!request) return s;
      const timestamp = new Date().toISOString();
      const updatedNotifications = s.notifications.map(n =>
        n.entityId === request.entityId || n.entityRef === request.entityRef || n.title.includes(request.entityRef)
          ? { ...n, read: true }
          : n
      );

      let updatedSupplierPos = request.requestType === 'Supplier PO Approval'
        ? s.supplierPos.map(spo => spo.id === request.entityId ? {
            ...spo,
            status: resolution === 'approved' ? 'confirmed' as const : 'draft' as const,
          } : spo)
        : s.supplierPos;

      let updatedSupplierPoLines = s.supplierPoLines;
      const extraChanges: { field: string; label: string; previousValue: string; newValue: string }[] = [];

      // Specific revision handling for SPO-2024-002 quantity reduction (300 -> 200 kg)
      if (request.id === 'apr-001' && resolution === 'approved') {
        const prevSpo = s.supplierPos.find(p => p.id === 'spo-002');
        updatedSupplierPos = updatedSupplierPos.map(spo => spo.id === 'spo-002' ? {
          ...spo,
          status: 'confirmed' as const,
          totalValue: 36000,
          committedDate: '2026-11-10',
          confirmedDate: timestamp.slice(0, 10),
        } : spo);
        updatedSupplierPoLines = s.supplierPoLines.map(line => line.spoId === 'spo-002' ? {
          ...line,
          orderedQty: 200,
          value: 200 * line.rate,
          committedDate: '2026-11-10',
        } : line);
        if (prevSpo) {
          extraChanges.push(
            { field: 'totalValue', label: 'Order Value', previousValue: `₹${prevSpo.totalValue.toLocaleString('en-IN')}`, newValue: '₹36,000' },
            { field: 'orderedQty', label: 'Ordered Qty', previousValue: '300 kg', newValue: '200 kg' },
            { field: 'committedDate', label: 'Committed Date', previousValue: prevSpo.committedDate, newValue: '2026-11-10' },
          );
        }
      }

      // Stock adjustment approval (e.g. apr-002 cycle count variance on inv-008)
      let updatedInventory = s.inventory;
      let updatedMovements = s.movements;
      if (request.requestType === 'Stock Adjustment' && resolution === 'approved') {
        const invItem = s.inventory.find(i => i.id === request.entityId);
        if (invItem) {
          const targetQty = request.id === 'apr-002' ? 120 : Math.max(0, invItem.onHandQty);
          const diff = targetQty - invItem.onHandQty;
          updatedInventory = s.inventory.map(i => i.id === invItem.id ? {
            ...i,
            onHandQty: targetQty,
            availableQty: Math.max(0, targetQty - i.reservedQty - i.qcHoldQty),
            shortage: Math.max(0, targetQty - i.reservedQty - i.qcHoldQty) < i.reorderPoint,
          } : i);
          updatedMovements = [...s.movements, {
            id: `sm-adj-${Date.now()}`,
            lotId: '',
            movementType: 'Adjustment',
            primaryQty: Math.abs(diff),
            uom: invItem.primaryUom,
            fromLocation: invItem.locationName,
            toLocation: 'Cycle Count Write-off',
            referenceType: 'Cycle Count',
            referenceId: invItem.id,
            referenceNumber: invItem.materialCode,
            performedBy: by,
            timestamp,
            notes: notes || request.description,
          }];
          extraChanges.push({
            field: 'onHandQty',
            label: 'On-Hand Qty',
            previousValue: `${invItem.onHandQty} ${invItem.primaryUom}`,
            newValue: `${targetQty} ${invItem.primaryUom}`,
          });
        }
      }

      const updatedInboxMessages = s.inboxMessages.map(msg =>
        msg.approvalRequestId === aprId
          ? {
              ...msg,
              read: true,
              actionCompleted: true,
              actionOutcome: resolution,
              status: 'action_completed' as InboxMessageStatus,
            }
          : msg
      );

      return {
        approvalRequests: s.approvalRequests.map(a =>
          a.id !== aprId ? a : { ...a, status: resolution, approvedBy: by, notes, decisionAt: timestamp }),
        pulseExceptions: s.pulseExceptions.filter(pe => pe.affectedId !== aprId && pe.affectedId !== request.entityId),
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.read).length,
        inboxMessages: updatedInboxMessages,
        inventory: updatedInventory,
        movements: updatedMovements,
        customerPos: request.requestType === 'Customer PO Credit Limit Approval'
          ? s.customerPos.map(po => po.id === request.entityId ? { ...po, status: resolution === 'approved' ? 'active' as const : 'on_hold' as const } : po)
          : s.customerPos,
        purchaseReqs: request.requestType === 'PR Approval'
          ? s.purchaseReqs.map(pr => pr.id === request.entityId ? {
              ...pr,
              status: resolution === 'approved' ? 'approved' as const : 'rejected' as const,
              reason: notes || pr.reason,
              ...(resolution === 'rejected'
                ? { rejectionReason: notes || pr.rejectionReason || pr.reason || 'Rejected during approval review', rejectedBy: by, rejectedAt: timestamp }
                : { approvedBy: by, approvedAt: timestamp }),
            } : pr)
          : s.purchaseReqs,
        supplierPos: updatedSupplierPos,
        supplierPoLines: updatedSupplierPoLines,
        auditEvents: [...s.auditEvents, createAuditEventRecord({
          actor: by,
          actorId: s.currentUser.id,
          role: s.currentUser.role,
          module: 'Approvals',
          scope: request.requestType === 'PR Approval'
            ? 'PurchaseRequisition'
            : request.requestType === 'Supplier PO Approval'
              ? 'SupplierPO'
              : request.requestType === 'Stock Adjustment'
                ? 'Inventory'
                : 'Approval',
          action: resolution === 'approved' ? 'approve' : 'reject',
          entityId: request.entityId,
          entityRef: request.entityRef,
          timestamp,
          description: `${resolution === 'approved' ? 'Approved' : 'Rejected'} ${request.requestType} (${request.entityRef}).`,
          reason: notes,
          changes: extraChanges.length > 0 ? extraChanges : undefined,
          before: { status: request.status },
          after: { status: resolution, approvalId: aprId },
        })],
      };
    });
    get().showToast({ type: resolution === 'approved' ? 'success' : 'info', title: `Request ${resolution}`, body: `Approval request resolved.` });
  },

  markInboxMessageRead: (messageId, read = true) => set(s => ({
    inboxMessages: s.inboxMessages.map(m => {
      if (m.id !== messageId) return m;
      const nextStatus: InboxMessageStatus = m.archived
        ? 'archived'
        : m.actionCompleted
          ? 'action_completed'
          : !read
            ? 'unread'
            : m.actionRequired
              ? 'action_required'
              : m.status === 'replied'
                ? 'replied'
                : 'read';
      return { ...m, read, status: nextStatus };
    }),
  })),

  archiveInboxMessage: (messageId, archived = true) => set(s => ({
    inboxMessages: s.inboxMessages.map(m => {
      if (m.id !== messageId) return m;
      const nextStatus: InboxMessageStatus = archived
        ? 'archived'
        : m.actionCompleted
          ? 'action_completed'
          : m.actionRequired
            ? 'action_required'
            : m.read
              ? 'read'
              : 'unread';
      return { ...m, archived, read: true, status: nextStatus };
    }),
  })),

  replyToInboxMessage: (messageId, body) => {
    const trimmed = body.trim();
    if (!trimmed) return;
    const state = get();
    const msg = state.inboxMessages.find(m => m.id === messageId);
    if (!msg) return;
    const timestamp = new Date().toISOString();
    const actor = state.currentUser.name;
    const roleLabel = state.currentUser.role;
    set(s => ({
      inboxMessages: s.inboxMessages.map(m => m.id !== messageId ? m : {
        ...m,
        read: true,
        status: 'replied' as InboxMessageStatus,
        actionCompleted: m.type === 'customer_delivery_query' ? true : m.actionCompleted,
        actionOutcome: m.type === 'customer_delivery_query' ? 'replied' : m.actionOutcome,
        thread: [
          ...(m.thread ?? []),
          {
            id: `th-${Date.now()}`,
            senderName: actor,
            senderRoleOrOrg: `${roleLabel} · EOSS`,
            timestamp,
            body: trimmed,
            isOutgoing: true,
          },
        ],
      }),
      auditEvents: [...s.auditEvents, createAuditEventRecord({
        actor,
        actorId: state.currentUser.id,
        role: roleLabel,
        module: msg.module,
        scope: msg.relatedEntityType,
        action: 'reply_message',
        entityId: msg.relatedEntityId,
        entityRef: msg.relatedEntityRef,
        timestamp,
        description: `Logged simulated reply to ${msg.senderName} (${msg.senderOrg}) regarding ${msg.relatedEntityRef}.`,
      })],
    }));
    get().showToast({
      type: 'success',
      title: 'Reply recorded (simulated)',
      body: `Logged response to ${msg.senderName} on ${msg.relatedEntityRef}. No external email was sent.`,
    });
  },

  completeInboxAction: (messageId, outcome, notes) => {
    const state = get();
    const msg = state.inboxMessages.find(m => m.id === messageId);
    if (!msg) return;
    const timestamp = new Date().toISOString();
    const actor = state.currentUser.name;

    if (msg.approvalRequestId && (outcome === 'approved' || outcome === 'rejected')) {
      get().resolveApproval(msg.approvalRequestId, outcome, actor, notes || `Resolved from Inbox (${msg.subject})`);
      return;
    }

    // Supplier PO confirmation or delivery extension
    if (msg.relatedEntityType === 'SupplierPO') {
      set(s => {
        const spo = s.supplierPos.find(p => p.id === msg.relatedEntityId);
        const nextSpoStatus = outcome === 'confirmed' || outcome === 'approved' ? 'confirmed' as const : spo?.status;
        const nextCommitted = msg.type === 'supplier_delivery_extension' && outcome === 'approved'
          ? '2026-11-08'
          : spo?.committedDate;
        return {
          supplierPos: s.supplierPos.map(p => p.id !== msg.relatedEntityId ? p : {
            ...p,
            status: nextSpoStatus ?? p.status,
            committedDate: nextCommitted ?? p.committedDate,
            confirmedDate: timestamp.slice(0, 10),
          }),
          inboxMessages: s.inboxMessages.map(m => m.id !== messageId ? m : {
            ...m,
            read: true,
            actionCompleted: true,
            actionOutcome: outcome,
            status: 'action_completed' as InboxMessageStatus,
          }),
          auditEvents: [...s.auditEvents, createAuditEventRecord({
            actor,
            actorId: s.currentUser.id,
            role: s.currentUser.role,
            module: 'Procurement',
            scope: 'SupplierPO',
            action: outcome === 'confirmed' ? 'confirm' : outcome === 'approved' ? 'approve' : 'reject',
            entityId: msg.relatedEntityId,
            entityRef: msg.relatedEntityRef,
            timestamp,
            description: `${outcome === 'confirmed' ? 'Recorded supplier confirmation' : outcome === 'approved' ? 'Approved delivery extension' : 'Rejected request'} for ${msg.relatedEntityRef} from Inbox.`,
            reason: notes,
            changes: spo && nextCommitted && nextCommitted !== spo.committedDate
              ? [{ field: 'committedDate', label: 'Committed Delivery', previousValue: spo.committedDate, newValue: nextCommitted }]
              : undefined,
          })],
        };
      });
      get().showToast({ type: 'success', title: 'Supplier PO updated', body: `${msg.relatedEntityRef} updated from Inbox.` });
      return;
    }

    set(s => ({
      inboxMessages: s.inboxMessages.map(m => m.id !== messageId ? m : {
        ...m,
        read: true,
        actionCompleted: true,
        actionOutcome: outcome,
        status: 'action_completed' as InboxMessageStatus,
      }),
    }));
  },

  addApprovalRequest: (request) => set(s => ({
    approvalRequests: [request, ...s.approvalRequests],
    auditEvents: [...s.auditEvents, createAuditEventRecord({
      actor: s.currentUser.name, actorId: s.currentUser.id, role: s.currentUser.role,
      scope: 'Approval', action: 'create', entityId: request.entityId, entityRef: request.entityRef,
      description: `Submitted approval request for ${request.entityRef} (${request.requestType}).`,
      after: { requestType: request.requestType, status: request.status },
    })],
  })),

  // ── Document Actions ──
  addDocument: (doc) => set(s => ({
    documents: [doc, ...s.documents],
    auditEvents: [...s.auditEvents, createAuditEventRecord({
      actor: s.currentUser.name, actorId: s.currentUser.id, role: s.currentUser.role,
      scope: 'Document', action: 'create', entityId: doc.id, entityRef: doc.title,
      description: `Uploaded document "${doc.title}" (${doc.docType}).`,
    })],
  })),

  addDocumentVersion: (previousDocId, newDoc) => {
    const timestamp = new Date().toISOString();
    set(s => ({
      documents: [
        { ...newDoc, supersedesDocId: previousDocId, status: 'active' as const },
        ...s.documents.map(d => d.id === previousDocId ? { ...d, status: 'superseded' as const } : d),
      ],
      auditEvents: [
        ...s.auditEvents,
        createAuditEventRecord({
          actor: s.currentUser.name,
          actorId: s.currentUser.id,
          role: s.currentUser.role,
          scope: 'Document',
          action: 'revise',
          entityId: newDoc.id,
          entityRef: newDoc.title,
          timestamp,
          description: `Uploaded version ${newDoc.version} of "${newDoc.title}", superseding previous document.`,
          changes: [{ field: 'version', label: 'Version', previousValue: String(Math.max(1, newDoc.version - 1)), newValue: String(newDoc.version) }],
        }),
      ],
    }));
    get().showToast({ type: 'success', title: 'New version uploaded', body: `${newDoc.title} — v${newDoc.version}. Previous version preserved.` });
  },

  renewDocument: (previousDocId, payload) => {
    const state = get();
    const prev = state.documents.find(d => d.id === previousDocId);
    if (!prev) return undefined;
    const timestamp = new Date().toISOString();
    const today = timestamp.slice(0, 10);
    const nextVersion = (prev.version || 1) + 1;
    const renewedDoc: VaultDocument = {
      ...prev,
      id: `doc-${Date.now()}`,
      title: payload.title?.trim() || prev.title,
      fileName: payload.fileName,
      fileSize: payload.fileSize || prev.fileSize,
      uploadedAt: today,
      uploadedBy: payload.uploadedBy || state.currentUser.name,
      issueDate: payload.issueDate || today,
      expiryDate: payload.expiryDate,
      reminderDays: payload.reminderDays ?? prev.reminderDays ?? 30,
      version: nextVersion,
      supersedesDocId: prev.id,
      renewedFromDocId: prev.id,
      status: 'active',
      obligation: {
        renewalDue: payload.expiryDate,
        responsible: prev.obligation?.responsible || state.currentUser.name,
      },
    };
    set(s => ({
      documents: [
        renewedDoc,
        ...s.documents.map(d => d.id === previousDocId ? { ...d, status: 'superseded' as const } : d),
      ],
      auditEvents: [
        ...s.auditEvents,
        createAuditEventRecord({
          actor: state.currentUser.name,
          actorId: state.currentUser.id,
          role: state.currentUser.role,
          scope: 'Document',
          action: 'renew',
          entityId: renewedDoc.id,
          entityRef: renewedDoc.title,
          timestamp,
          description: `Renewed "${renewedDoc.title}" (v${nextVersion}, file: ${payload.fileName}) with new expiry ${payload.expiryDate}.`,
          relatedEntityType: 'Document',
          relatedEntityId: prev.id,
          relatedEntityRef: prev.title,
          before: { version: prev.version, expiryDate: prev.expiryDate, status: prev.status ?? 'expired' },
          after: { version: nextVersion, expiryDate: payload.expiryDate, status: 'active' },
        }),
      ],
    }));
    get().showToast({ type: 'success', title: 'Document renewed', body: `${renewedDoc.title} v${nextVersion} active until ${payload.expiryDate}.` });
    return renewedDoc;
  },

  archiveDocument: (docId, reason, by) => {
    if (!reason.trim()) return;
    const timestamp = new Date().toISOString();
    set(s => {
      const existing = s.documents.find(d => d.id === docId);
      if (!existing || existing.status === 'archived') return s;
      const actor = by || s.currentUser.name;
      return {
        documents: s.documents.map(d => d.id === docId ? {
          ...d,
          status: 'archived' as const,
          archivedAt: timestamp,
          archivedBy: actor,
          archiveReason: reason.trim(),
        } : d),
        auditEvents: [...s.auditEvents, createAuditEventRecord({
          actor,
          actorId: s.currentUser.id,
          role: s.currentUser.role,
          scope: 'Document',
          action: 'archive',
          entityId: docId,
          entityRef: existing.title,
          timestamp,
          description: `Archived document "${existing.title}". History preserved.`,
          reason: reason.trim(),
          before: { status: existing.status ?? 'active' },
          after: { status: 'archived', archiveReason: reason.trim() },
        })],
      };
    });
    get().showToast({ type: 'info', title: 'Document archived', body: 'Document moved to Archive; audit history preserved.' });
  },

  updateCertStatus: (certId, status) => set(s => {
    const existing = s.certificates.find(c => c.id === certId);
    return {
      certificates: s.certificates.map(c => c.id !== certId ? c : { ...c, verificationStatus: status }),
      auditEvents: existing ? [...s.auditEvents, createAuditEventRecord({
        actor: s.currentUser.name, actorId: s.currentUser.id, role: s.currentUser.role,
        scope: 'Document', action: 'update', entityId: certId, entityRef: existing.certNumber,
        description: `Updated certificate ${existing.certNumber} verification status to ${status}.`,
        before: { verificationStatus: existing.verificationStatus }, after: { verificationStatus: status },
      })] : s.auditEvents,
    };
  }),

  // ── Dispatch Actions ──
  setDispatchStatus: (dspId, status) => {
    set(s => {
      const existing = s.dispatches.find(d => d.id === dspId);
      if (!existing) return s;
      const today = new Date().toISOString().slice(0, 10);
      const dispatchDate = status === 'dispatched' && !existing.dispatchDate ? today : existing.dispatchDate;
      const actualDeliveryDate = (status === 'delivered' || status === 'delivery_confirmed') && !existing.actualDeliveryDate ? today : existing.actualDeliveryDate;
      return {
        dispatches: s.dispatches.map(d => d.id !== dspId ? d : { ...d, status, dispatchDate, actualDeliveryDate }),
        auditEvents: [...s.auditEvents, createAuditEventRecord({
          actor: s.currentUser.name, actorId: s.currentUser.id, role: s.currentUser.role,
          scope: 'Dispatch',
          action: status === 'dispatched' ? 'dispatch' : status === 'delivered' ? 'deliver' : 'update',
          entityId: dspId, entityRef: existing.dispatchNumber,
          description: `Updated dispatch ${existing.dispatchNumber} status to ${status.replace(/_/g, ' ')}.`,
          before: { status: existing.status, dispatchDate: existing.dispatchDate, actualDeliveryDate: existing.actualDeliveryDate },
          after: { status, dispatchDate, actualDeliveryDate },
        })],
      };
    });
    get().showToast({ type: 'success', title: 'Dispatch updated', body: `Status changed to ${status.replace('_', ' ')}` });
  },

  addDispatch: (dispatch) => set(s => ({
    dispatches: [dispatch, ...s.dispatches],
    auditEvents: [...s.auditEvents, createAuditEventRecord({
      actor: s.currentUser.name, actorId: s.currentUser.id, role: s.currentUser.role,
      scope: 'Dispatch', action: 'create', entityId: dispatch.id, entityRef: dispatch.dispatchNumber,
      description: `Created dispatch ${dispatch.dispatchNumber} for ${dispatch.customerName} (${dispatch.totalQty} units).`,
      relatedEntityType: dispatch.customerPoId ? 'CustomerPO' : dispatch.jobId ? 'Job' : undefined,
      relatedEntityId: dispatch.customerPoId ?? dispatch.jobId,
      relatedEntityRef: dispatch.customerPoNumber ?? dispatch.jobNumber,
    })],
  })),

  recordPoD: (dspId, payload) => {
    const timestamp = new Date().toISOString();
    const today = timestamp.slice(0, 10);
    set(s => {
      const existing = s.dispatches.find(d => d.id === dspId);
      if (!existing) return s;
      const nextStatus: Dispatch['status'] = payload?.receivedByName || payload?.podReference ? 'delivery_confirmed' : existing.status;
      const deliveredDate = payload?.deliveredDate || existing.actualDeliveryDate || today;
      const receivedByName = payload?.receivedByName?.trim() || existing.receivedByName;
      const deliveryCondition = payload?.condition ?? existing.deliveryCondition ?? 'good';
      const podReference = payload?.podReference?.trim() || existing.podReference || `POD-${existing.dispatchNumber}`;
      const deliveryNotes = payload?.notes?.trim() || existing.deliveryNotes;
      return {
        dispatches: s.dispatches.map(d => d.id !== dspId ? d : {
          ...d,
          hasPoD: true,
          status: nextStatus,
          actualDeliveryDate: deliveredDate,
          receivedByName,
          deliveryCondition,
          podReference,
          deliveryNotes,
          podRecordedAt: timestamp,
          podRecordedBy: s.currentUser.name,
        }),
        auditEvents: [...s.auditEvents, createAuditEventRecord({
          actor: s.currentUser.name, actorId: s.currentUser.id, role: s.currentUser.role,
          scope: 'Dispatch', action: 'deliver', entityId: dspId, entityRef: existing.dispatchNumber,
          timestamp,
          description: `Recorded Proof of Delivery (${podReference}) for ${existing.dispatchNumber}${receivedByName ? ` signed by ${receivedByName}` : ''}.`,
          before: {
            hasPoD: existing.hasPoD,
            status: existing.status,
            actualDeliveryDate: existing.actualDeliveryDate,
            receivedByName: existing.receivedByName,
            podReference: existing.podReference,
          },
          after: {
            hasPoD: true,
            status: nextStatus,
            actualDeliveryDate: deliveredDate,
            receivedByName,
            podReference,
            deliveryCondition,
          },
          reason: deliveryNotes,
        })],
      };
    });
    get().showToast({ type: 'success', title: 'Delivery confirmation & PoD recorded' });
  },

  // ── NCR Actions ──
  addNCR: (ncr) => set(s => ({
    ncrs: [ncr, ...s.ncrs],
    auditEvents: [...s.auditEvents, createAuditEventRecord({
      actor: s.currentUser.name, actorId: s.currentUser.id, role: s.currentUser.role,
      scope: 'NCR', action: 'create', entityId: ncr.id, entityRef: ncr.ncrNumber,
      description: `Raised ${ncr.severity} NCR ${ncr.ncrNumber} (${ncr.affectedQty} units): ${ncr.description.slice(0, 90)}`,
      relatedEntityType: ncr.inspectionId ? 'Inspection' : ncr.jobId ? 'Job' : undefined,
      relatedEntityId: ncr.inspectionId ?? ncr.jobId,
      relatedEntityRef: ncr.jobNumber,
    })],
  })),

  closeNCR: (ncrId, resolution) => {
    set(s => {
      const existing = s.ncrs.find(n => n.id === ncrId);
      if (!existing) return s;
      return {
        ncrs: s.ncrs.map(n => n.id !== ncrId ? n : { ...n, status: 'closed' as const, disposition: resolution as NCR['disposition'] }),
        auditEvents: [...s.auditEvents, createAuditEventRecord({
          actor: s.currentUser.name, actorId: s.currentUser.id, role: s.currentUser.role,
          scope: 'NCR', action: 'close', entityId: ncrId, entityRef: existing.ncrNumber,
          description: `Closed NCR ${existing.ncrNumber} with disposition: ${resolution}.`,
          before: { status: existing.status, disposition: existing.disposition },
          after: { status: 'closed', disposition: resolution },
        })],
      };
    });
    get().showToast({ type: 'success', title: 'NCR closed', body: `Disposition: ${resolution}` });
  },

  linkNCRToInspection: (inspectionId, ncrId, ncrNumber) => set(s => ({
    inspections: s.inspections.map(i => i.id !== inspectionId ? i : { ...i, ncrId, ncrNumber }),
  })),

  // ── Supplier Invitation, Quotation & PO Lifecycle Actions ──
  sendSupplierInvitations: ({ prId, supplierIds, channel, responseDueDate, requestedLineIds, notes, matchReasons }) => {
    const state = get();
    const pr = state.purchaseReqs.find(p => p.id === prId);
    if (!pr || supplierIds.length === 0) return [];
    const now = new Date().toISOString();
    const today = now.slice(0, 10);
    const defaultLineIds = (requestedLineIds && requestedLineIds.length > 0)
      ? requestedLineIds
      : (pr.lines ?? []).map(l => l.id);
    const existingSupIds = new Set(
      state.supplierInvitations
        .filter(i => i.prId === prId && !['declined', 'no_response', 'closed'].includes(i.status))
        .map(i => i.supplierId)
    );
    const created: SupplierInvitation[] = supplierIds
      .filter(sid => !existingSupIds.has(sid))
      .map((sid, idx) => {
        const supplier = state.suppliers.find(sp => sp.id === sid);
        return {
          id: `sinv-${Date.now()}-${idx}`,
          prId: pr.id,
          prNumber: pr.prNumber,
          supplierId: sid,
          supplierName: supplier?.tradingName || supplier?.legalName || sid,
          contactName: supplier?.contactPerson,
          contactEmail: supplier?.email,
          matchReason: matchReasons?.[sid],
          channel,
          requestedLineIds: defaultLineIds,
          createdAt: today,
          sentDate: today,
          responseDueDate,
          status: 'awaiting_quotation',
          notes,
        };
      });
    if (created.length === 0) return [];
    set(s => ({
      supplierInvitations: [...created, ...s.supplierInvitations],
      purchaseReqs: s.purchaseReqs.map(p =>
        p.id === prId && ['draft', 'pending', 'approved'].includes(p.status)
          ? { ...p, status: 'quotation_in_progress' as const }
          : p
      ),
      auditEvents: [...s.auditEvents, createAuditEventRecord({
        actor: s.currentUser.name, actorId: s.currentUser.id, role: s.currentUser.role,
        scope: 'PurchaseRequisition', action: 'send_invitations', entityId: pr.id, entityRef: pr.prNumber,
        timestamp: now,
        description: `Sent quotation requests to ${created.map(c => c.supplierName).join(', ')} via ${channel}.`,
        after: { invitedCount: created.length, suppliers: created.map(c => c.supplierName), channel },
      })],
    }));
    get().showToast({
      type: 'success',
      title: `Quotation requests sent to ${created.length} supplier${created.length > 1 ? 's' : ''}`,
      body: `${pr.prNumber} moved to Quotation In Progress.`,
    });
    return created;
  },

  updateSupplierInvitation: (id, partial) => set(s => ({
    supplierInvitations: s.supplierInvitations.map(i => i.id !== id ? i : { ...i, ...partial }),
  })),

  addSupplierQuotation: (quote) => set(s => {
    const now = new Date().toISOString();
    const matchedInv = quote.invitationId
      ? s.supplierInvitations.find(i => i.id === quote.invitationId)
      : s.supplierInvitations.find(i => i.prId === quote.prId && i.supplierId === quote.supplierId);
    return {
      supplierQuotations: [
        matchedInv && !quote.invitationId ? { ...quote, invitationId: matchedInv.id } : quote,
        ...s.supplierQuotations,
      ],
      supplierInvitations: matchedInv
        ? s.supplierInvitations.map(i => i.id === matchedInv.id ? { ...i, status: 'quotation_received' as const, quotationId: quote.id } : i)
        : s.supplierInvitations,
      purchaseReqs: quote.prId
        ? s.purchaseReqs.map(p => (p.id === quote.prId && ['draft', 'pending', 'approved'].includes(p.status))
          ? { ...p, status: 'quotation_in_progress' as const }
          : p)
        : s.purchaseReqs,
      auditEvents: [...s.auditEvents, createAuditEventRecord({
        actor: s.currentUser.name, actorId: s.currentUser.id, role: s.currentUser.role,
        scope: 'SupplierQuotation', action: 'create', entityId: quote.id, entityRef: quote.quoteNumber,
        timestamp: now,
        description: `Recorded quotation ${quote.quoteNumber} from ${quote.supplierName}${quote.prNumber ? ` for ${quote.prNumber}` : ''}.`,
        after: { supplierName: quote.supplierName, prNumber: quote.prNumber, totalLines: quote.lines.length },
      })],
    };
  }),

  updateSupplierQuotation: (id, partial) => set(s => ({
    supplierQuotations: s.supplierQuotations.map(q => q.id !== id ? q : { ...q, ...partial }),
  })),

  selectQuotation: (quoteId, overrideReason) => set(s => {
    const target = s.supplierQuotations.find(sq => sq.id === quoteId);
    if (!target || ['approval_rejected', 'rejected', 'expired'].includes(target.status)) return s;
    const now = new Date().toISOString();
    return {
      supplierQuotations: s.supplierQuotations.map(q => {
        if (q.id === quoteId) {
          return { ...q, status: 'selected' as const, ...(overrideReason ? { overrideReason } : {}) };
        }
        if (target.prId && q.prId === target.prId && !['approval_rejected', 'rejected', 'expired'].includes(q.status)) {
          return { ...q, status: 'not_selected' as const };
        }
        return q;
      }),
      auditEvents: [...s.auditEvents, createAuditEventRecord({
        actor: s.currentUser.name, actorId: s.currentUser.id, role: s.currentUser.role,
        scope: 'SupplierQuotation', action: 'select', entityId: target.id, entityRef: target.quoteNumber,
        timestamp: now,
        description: `Selected quotation ${target.quoteNumber} (${target.supplierName})${overrideReason ? ` with override reason` : ''}.`,
        reason: overrideReason,
        after: { supplierName: target.supplierName, prNumber: target.prNumber },
      })],
    };
  }),

  approveFinalizeQuotation: (quoteId, approverName, notes) => {
    const state = get();
    const target = state.supplierQuotations.find(q => q.id === quoteId);
    if (!target || ['approval_rejected', 'rejected', 'expired'].includes(target.status)) return;
    const now = new Date().toISOString();
    set(s => ({
      supplierQuotations: s.supplierQuotations.map(q => {
        if (q.id === quoteId) {
          return {
            ...q,
            status: 'selected' as const,
            approvedBy: approverName,
            approvedAt: now,
            notes: notes ? `${q.notes ? `${q.notes} · ` : ''}Approved: ${notes}` : q.notes,
          };
        }
        if (target.prId && q.prId === target.prId && !['approval_rejected', 'rejected', 'expired'].includes(q.status)) {
          return { ...q, status: 'not_selected' as const };
        }
        return q;
      }),
      purchaseReqs: target.prId
        ? s.purchaseReqs.map(p => p.id === target.prId ? { ...p, status: 'approved_for_po' as const } : p)
        : s.purchaseReqs,
      auditEvents: [...s.auditEvents, createAuditEventRecord({
        actor: approverName, actorId: s.currentUser.id, role: s.currentUser.role,
        scope: 'SupplierQuotation', action: 'approve', entityId: target.id, entityRef: target.quoteNumber,
        timestamp: now,
        description: `Approved quotation ${target.quoteNumber} from ${target.supplierName}${notes ? ` (${notes})` : ''}.`,
        reason: notes,
        after: { supplierName: target.supplierName, prNumber: target.prNumber, status: 'selected' },
      })],
    }));
    get().showToast({ type: 'success', title: `Quotation ${target.quoteNumber} approved`, body: `Ready to generate Draft Supplier PO for ${target.supplierName}.` });
  },

  rejectQuotationApproval: (quoteId, rejectedBy, reason) => {
    const state = get();
    const target = state.supplierQuotations.find(q => q.id === quoteId);
    if (!target || !reason.trim()) return;
    const now = new Date().toISOString();
    set(s => ({
      supplierQuotations: s.supplierQuotations.map(q => {
        if (q.id === quoteId) {
          return { ...q, status: 'approval_rejected' as const, rejectedBy, rejectedAt: now, rejectedReason: reason.trim() };
        }
        if (target.prId && q.prId === target.prId && q.status === 'not_selected') {
          return { ...q, status: 'received' as const };
        }
        return q;
      }),
      purchaseReqs: target.prId
        ? s.purchaseReqs.map(p => p.id === target.prId ? { ...p, status: 'quotation_in_progress' as const } : p)
        : s.purchaseReqs,
      auditEvents: [...s.auditEvents, createAuditEventRecord({
        actor: rejectedBy, actorId: s.currentUser.id, role: s.currentUser.role,
        scope: 'SupplierQuotation', action: 'reject_approval', entityId: target.id, entityRef: target.quoteNumber,
        timestamp: now,
        description: `Rejected quotation ${target.quoteNumber} (${target.supplierName}) and returned PR to comparison.`,
        reason: reason.trim(),
        after: { supplierName: target.supplierName, prNumber: target.prNumber, status: 'approval_rejected' },
      })],
    }));
    get().showToast({ type: 'warning', title: `${target.quoteNumber} rejected`, body: 'Decision recorded. Returned PR to quotation comparison.' });
  },

  generateSPOFromQuotation: (quoteId, opts) => {
    const state = get();
    const quote = state.supplierQuotations.find(q => q.id === quoteId);
    if (!quote) return { error: 'Quotation not found.' };
    if (['rejected', 'approval_rejected', 'expired'].includes(quote.status)) {
      return { error: `Quotation ${quote.quoteNumber} has status "${quote.status}" and cannot generate a Supplier PO.` };
    }
    const existingForQuote = state.supplierPos.find(po => po.supplierQuotationId === quoteId && !['cancelled', 'supplier_declined'].includes(po.status));
    if (existingForQuote) {
      return { spo: existingForQuote, error: `Supplier PO ${existingForQuote.poNumber} has already been generated for this quotation.` };
    }
    if (quote.prId) {
      const existingForPr = state.supplierPos.find(po => po.prId === quote.prId && !['cancelled', 'supplier_declined'].includes(po.status));
      if (existingForPr) {
        return { spo: existingForPr, error: `Supplier PO ${existingForPr.poNumber} already exists for this Purchase Requisition.` };
      }
    }
    const pr = quote.prId ? state.purchaseReqs.find(p => p.id === quote.prId) : undefined;
    const siteId = opts?.deliverToSiteId || pr?.deliverToSiteId || state.sites[0]?.id;
    const site = state.sites.find(st => st.id === siteId);
    const storeId = opts?.deliverToStoreId || pr?.deliverToStoreId || state.storeLocations.find(l => l.siteId === siteId)?.id;
    const store = state.storeLocations.find(l => l.id === storeId);
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const committed = opts?.committedDate || new Date(now.getTime() + Math.max(1, quote.deliveryDays || 7) * 86400000).toISOString().slice(0, 10);
    const spoId = `spo-${Date.now()}`;
    const poNumber = nextSequentialNumber(
      `SPO-${now.getFullYear()}`,
      state.supplierPos.map(p => p.poNumber),
      3,
      101,
    );
    const lineTotalValue = quote.lines.reduce((sum, l) => {
      const base = l.lineTotal || (l.quotedQty ?? l.orderedQty ?? l.qty ?? 1) * (l.unitRate ?? l.unitPrice ?? 0);
      const tax = l.taxPct ? base * (l.taxPct / 100) : 0;
      return sum + base + tax;
    }, 0);
    const totalValue = Math.max(0, Math.round(lineTotalValue + (quote.deliveryCharges ?? 0) - (quote.discountAmount ?? 0)));
    const spo: SupplierPO = {
      id: spoId,
      poNumber,
      spoNumber: poNumber,
      orderDate: today,
      supplierId: quote.supplierId,
      supplierName: quote.supplierName,
      raisedDate: today,
      committedDate: committed,
      status: 'draft',
      totalValue,
      currency: quote.currency || 'INR',
      paymentTerms: opts?.paymentTerms || quote.paymentTerms || 'Net 30 days',
      prId: pr?.id,
      prNumber: pr?.prNumber,
      lineCount: Math.max(1, quote.lines.length),
      deliverToSiteId: site?.id,
      deliverToSiteName: site?.name,
      deliverToStoreId: store?.id,
      deliverToStoreName: store?.name,
      supplierQuotationId: quote.id,
      supplierQuotationRef: quote.quoteNumber,
      supplierRfqId: quote.supplierRfqId,
      supplierRfqRef: quote.supplierRfqRef,
      originatingRequirementId: pr?.sourceRefId,
      originatingRequirementLabel: pr?.sourceRefLabel,
      notes: opts?.notes || quote.notes,
    };
    const spoLines: SupplierPOLine[] = quote.lines.map((ql, idx) => {
      const qty = ql.quotedQty ?? ql.orderedQty ?? ql.qty ?? 1;
      const rate = ql.unitRate ?? ql.unitPrice ?? 0;
      const matchedMat = state.materials.find(m =>
        (ql.materialItemId && m.id === ql.materialItemId) ||
        (ql.materialCode && m.itemCode.toLowerCase() === ql.materialCode.toLowerCase()) ||
        m.name.toLowerCase() === ql.materialName.toLowerCase()
      );
      return {
        id: `spol-${Date.now()}-${idx}`,
        spoId,
        materialItemId: matchedMat?.id ?? ql.materialItemId,
        materialCode: matchedMat?.itemCode ?? ql.materialCode,
        materialName: ql.materialName,
        grade: ql.grade,
        orderedQty: qty,
        uom: ql.uom,
        rate,
        value: Math.round(qty * rate),
        committedDate: committed,
        receivedQty: 0,
        acceptedQty: 0,
        rejectedQty: 0,
        tolerancePct: 0,
        status: 'pending',
      };
    });
    set(s => ({
      supplierQuotations: s.supplierQuotations.map(q =>
        q.id === quoteId
          ? { ...q, status: 'selected' as const }
          : (quote.prId && q.prId === quote.prId && !['approval_rejected', 'rejected', 'expired'].includes(q.status))
            ? { ...q, status: 'not_selected' as const }
            : q
      ),
      supplierPos: [spo, ...s.supplierPos],
      supplierPoLines: [...s.supplierPoLines, ...spoLines],
      purchaseReqs: pr ? s.purchaseReqs.map(p => p.id === pr.id ? { ...p, status: 'po_drafted' as const } : p) : s.purchaseReqs,
      auditEvents: [...s.auditEvents, createAuditEventRecord({
        actor: s.currentUser.name, actorId: s.currentUser.id, role: s.currentUser.role,
        scope: 'SupplierPO', action: 'draft_from_quotation',
        entityId: spoId, entityRef: poNumber, timestamp: now.toISOString(),
        description: `Drafted Supplier PO ${poNumber} for ${quote.supplierName} from quotation ${quote.quoteNumber}.`,
        relatedEntityType: 'SupplierQuotation', relatedEntityId: quoteId, relatedEntityRef: quote.quoteNumber,
        after: { quoteNumber: quote.quoteNumber, prNumber: pr?.prNumber, status: 'draft', totalValue: spo.totalValue },
      })],
    }));
    get().showToast({ type: 'success', title: `Draft Supplier PO ${poNumber} prepared`, body: `Review details and click Confirm & Issue PO.` });
    return { spo };
  },

  confirmAndIssueSPO: (spoId, issuedBy, opts) => {
    const state = get();
    const existing = state.supplierPos.find(p => p.id === spoId);
    if (!existing) return { nonSelectedInvitations: [], error: 'Supplier PO not found.' };
    if (!['draft', 'pending_approval'].includes(existing.status)) {
      return { spo: existing, nonSelectedInvitations: [], error: `Supplier PO ${existing.poNumber} is already ${existing.status}.` };
    }
    const now = new Date().toISOString();
    const updatedSpo: SupplierPO = {
      ...existing,
      status: 'awaiting_supplier_confirmation',
      sentAt: now,
      issuedBy,
      supplierResponseStatus: 'pending',
      paymentTerms: opts?.paymentTerms || existing.paymentTerms,
      committedDate: opts?.committedDate || existing.committedDate,
      notes: opts?.notes ?? existing.notes,
    };
    const nonSelectedInvitations = existing.prId
      ? state.supplierInvitations.filter(inv =>
          inv.prId === existing.prId
          && inv.supplierId !== existing.supplierId
          && !['declined', 'no_response', 'closed'].includes(inv.status)
        )
      : [];

    set(s => ({
      supplierPos: s.supplierPos.map(p => p.id === spoId ? updatedSpo : p),
      supplierInvitations: existing.prId
        ? s.supplierInvitations.map(inv => {
            if (inv.prId !== existing.prId) return inv;
            if (inv.supplierId === existing.supplierId) return { ...inv, status: 'quotation_received' as const };
            if (!['declined', 'no_response'].includes(inv.status)) return { ...inv, status: 'not_selected' as const };
            return inv;
          })
        : s.supplierInvitations,
      supplierQuotations: existing.prId
        ? s.supplierQuotations.map(q => {
            if (q.prId !== existing.prId) return q;
            if (q.id === existing.supplierQuotationId) return { ...q, status: 'selected' as const };
            if (!['approval_rejected', 'rejected', 'expired'].includes(q.status)) return { ...q, status: 'not_selected' as const };
            return q;
          })
        : s.supplierQuotations,
      purchaseReqs: existing.prId
        ? s.purchaseReqs.map(pr => pr.id === existing.prId ? { ...pr, status: 'po_issued' as const } : pr)
        : s.purchaseReqs,
      auditEvents: [...s.auditEvents, {
        id: `ae-${Date.now()}`, actor: issuedBy, actorId: s.currentUser.id,
        scope: 'SupplierPO', action: 'confirm_and_issue', entityId: spoId, entityRef: updatedSpo.poNumber,
        timestamp: now, source: 'ui',
        after: { status: updatedSpo.status, supplierName: updatedSpo.supplierName, nonSelectedCount: nonSelectedInvitations.length },
      }],
    }));
    get().showToast({ type: 'success', title: `${updatedSpo.poNumber} confirmed and issued`, body: `Awaiting confirmation from ${updatedSpo.supplierName}.` });
    return { spo: updatedSpo, nonSelectedInvitations };
  },

  notifyNonSelectedSuppliers: (spoId, recipients, sentBy) => {
    const state = get();
    const spo = state.supplierPos.find(p => p.id === spoId);
    if (!spo || recipients.length === 0) return;
    const now = new Date().toISOString();
    const recipientIds = new Set(recipients.map(r => r.supplierId));
    set(s => ({
      supplierInvitations: s.supplierInvitations.map(inv =>
        inv.prId === spo.prId && recipientIds.has(inv.supplierId)
          ? {
              ...inv,
              status: 'not_selected' as const,
              lastNotifiedAt: now,
              notificationNote: recipients.find(r => r.supplierId === inv.supplierId)?.message,
            }
          : inv
      ),
      auditEvents: [...s.auditEvents, {
        id: `ae-${Date.now()}`, actor: sentBy, actorId: s.currentUser.id,
        scope: 'SupplierPO', action: 'notify_non_selected_suppliers', entityId: spo.id, entityRef: spo.poNumber,
        timestamp: now, source: 'ui',
        after: { notifiedSuppliers: recipients.map(r => r.supplierName), mode: 'simulated_email' },
      }],
    }));
    get().showToast({ type: 'success', title: `Notified ${recipients.length} non-selected supplier${recipients.length > 1 ? 's' : ''}`, body: 'Notification recorded in audit history (simulated email).' });
  },

  recordSupplierPOConfirmation: (spoId, decision, data) => {
    const state = get();
    const spo = state.supplierPos.find(p => p.id === spoId);
    if (!spo) return { error: 'Supplier PO not found.' };
    if (decision === 'declined' && !data.declineReason?.trim()) {
      return { error: 'Decline reason is required when supplier declines the PO.' };
    }
    const now = new Date().toISOString();
    const updatedSpo: SupplierPO = decision === 'accepted'
      ? {
          ...spo,
          status: 'confirmed',
          supplierResponseStatus: 'accepted',
          supplierConfirmedDate: data.confirmedDate || spo.committedDate,
          committedDate: data.confirmedDate || spo.committedDate,
          supplierRefNumber: data.supplierRefNumber?.trim() || spo.supplierRefNumber,
          supplierResponseNotes: data.notes?.trim() || spo.supplierResponseNotes,
          supplierRespondedAt: now,
        }
      : {
          ...spo,
          status: 'supplier_declined',
          supplierResponseStatus: 'declined',
          supplierDeclineReason: data.declineReason?.trim(),
          supplierResponseNotes: data.notes?.trim() || spo.supplierResponseNotes,
          supplierRespondedAt: now,
        };

    set(s => ({
      supplierPos: s.supplierPos.map(p => p.id === spoId ? updatedSpo : p),
      supplierPoLines: decision === 'accepted' && data.confirmedDate
        ? s.supplierPoLines.map(l => l.spoId === spoId ? { ...l, committedDate: data.confirmedDate! } : l)
        : s.supplierPoLines,
      supplierQuotations: decision === 'declined' && spo.prId
        ? s.supplierQuotations.map(q => {
            if (q.id === spo.supplierQuotationId) {
              return { ...q, status: 'rejected' as const, rejectedReason: data.declineReason?.trim() };
            }
            if (q.prId === spo.prId && q.status === 'not_selected') {
              return { ...q, status: 'received' as const };
            }
            return q;
          })
        : s.supplierQuotations,
      supplierInvitations: spo.prId
        ? s.supplierInvitations.map(inv => {
            if (inv.prId !== spo.prId) return inv;
            if (decision === 'accepted') return { ...inv, status: 'closed' as const };
            if (inv.supplierId === spo.supplierId) return { ...inv, status: 'declined' as const, declineReason: data.declineReason?.trim() };
            if (inv.status === 'not_selected' && inv.quotationId) return { ...inv, status: 'quotation_received' as const };
            return inv;
          })
        : s.supplierInvitations,
      purchaseReqs: spo.prId
        ? s.purchaseReqs.map(pr => {
            if (pr.id !== spo.prId) return pr;
            return { ...pr, status: decision === 'accepted' ? 'converted' as const : 'quotation_in_progress' as const };
          })
        : s.purchaseReqs,
      auditEvents: [...s.auditEvents, createAuditEventRecord({
        actor: data.recordedBy, actorId: s.currentUser.id, role: s.currentUser.role,
        scope: 'SupplierPO', action: decision === 'accepted' ? 'supplier_confirmed' : 'supplier_declined',
        entityId: spo.id, entityRef: spo.poNumber, timestamp: now,
        description: decision === 'accepted'
          ? `Supplier confirmed ${spo.poNumber} for delivery ${updatedSpo.supplierConfirmedDate}.`
          : `Supplier declined ${spo.poNumber}. Linked PR returned to comparison.`,
        reason: data.declineReason || data.notes,
        after: {
          status: updatedSpo.status,
          confirmedDate: updatedSpo.supplierConfirmedDate,
          supplierRef: updatedSpo.supplierRefNumber,
        },
      })],
    }));

    get().showToast({
      type: decision === 'accepted' ? 'success' : 'warning',
      title: decision === 'accepted' ? `${spo.poNumber} confirmed by supplier` : `${spo.poNumber} declined by supplier`,
      body: decision === 'accepted'
        ? `Confirmed delivery ${updatedSpo.supplierConfirmedDate}. Ready for GRN upon dispatch.`
        : 'Linked PR returned to Quotation Comparison for alternate supplier selection.',
    });
    return { spo: updatedSpo };
  },

  // ── Sales / Cross-entity Actions ──
  addRfq: (rfq) => set(s => ({ rfqs: [rfq, ...s.rfqs] })),
  addQuotation: (q, lines) => set(s => ({ quotations: [q, ...s.quotations], quotationLines: [...s.quotationLines, ...lines] })),
  createDirectQuotation: (q, lines) => set(s => ({
    quotations: [{ ...q, isDirectQuotation: true }, ...s.quotations],
    quotationLines: [...s.quotationLines, ...lines],
    auditEvents: [...s.auditEvents, {
      id: `ae-${Date.now()}`, actor: s.currentUser.name, actorId: s.currentUser.id,
      scope: 'CustomerQuotation', action: 'create_direct', entityId: q.id, entityRef: q.quotationNumber,
      timestamp: new Date().toISOString(), source: 'ui', after: { customerName: q.customerName, totalValue: q.totalValue },
    }],
  })),
  reviseQuotation: (parentQuotationId, nextQuotation, nextLines) => set(s => {
    const now = new Date().toISOString();
    return {
      quotations: [
        { ...nextQuotation, parentQuotationId },
        ...s.quotations.map(q => q.id === parentQuotationId ? { ...q, status: 'superseded' as const, updatedAt: now } : q),
      ],
      quotationLines: [...s.quotationLines, ...nextLines],
      auditEvents: [...s.auditEvents, {
        id: `ae-${Date.now()}`, actor: s.currentUser.name, actorId: s.currentUser.id,
        scope: 'CustomerQuotation', action: 'revise', entityId: nextQuotation.id, entityRef: nextQuotation.quotationNumber,
        timestamp: now, source: 'ui',
        after: { parentQuotationId, revision: nextQuotation.revision, totalValue: nextQuotation.totalValue },
      }],
    };
  }),
  updateQuotation: (id, partial) => set(s => ({ quotations: s.quotations.map(q => q.id === id ? { ...q, ...partial } : q) })),

  assessAndAllocateCustomerPO: (poId, actorName, opts) => {
    const state = get();
    const po = state.customerPos.find(p => p.id === poId);
    if (!po) return { error: 'Customer PO not found.' };
    const siteId = opts?.siteId || po.deliverToSiteId || state.sites[0]?.id || 'site-hyd';
    const site = state.sites.find(st => st.id === siteId);
    const linkedJobs = state.jobs.filter(j => j.customerPoId === po.id);
    const targetJob = opts?.jobId ? state.jobs.find(j => j.id === opts.jobId) : linkedJobs[0];
    const poLinesList = state.poLines.filter(l => l.poId === po.id);

    // Derive requirements either from existing JobMaterialReqs or matching PO line items against materials master
    const existingReqs = targetJob ? state.jobMaterialReqs.filter(r => r.jobId === targetJob.id) : [];
    const reqInputs = existingReqs.length > 0
      ? existingReqs.map(r => {
          const mat = state.materials.find(m => m.id === r.materialItemId);
          return {
            materialItemId: r.materialItemId,
            materialCode: mat?.itemCode,
            materialName: r.materialName,
            grade: mat?.standardGrade,
            requiredQty: Math.max(0, r.requiredQty - r.reservedQty),
            uom: r.uom,
          };
        }).filter(x => x.requiredQty > 0)
      : poLinesList.map(l => {
          const mat = state.materials.find(m =>
            l.description.toLowerCase().includes(m.name.toLowerCase())
            || (l.description.toLowerCase().includes('pipe') && m.id === 'mat-msp')
            || (l.description.toLowerCase().includes('8mm') && m.id === 'mat-ms8')
            || (l.description.toLowerCase().includes('12mm') && m.id === 'mat-ms12')
            || (l.description.toLowerCase().includes('304l') && m.id === 'mat-ss3')
          );
          return mat ? {
            materialItemId: mat.id,
            materialCode: mat.itemCode,
            materialName: mat.name,
            grade: mat.standardGrade,
            requiredQty: l.orderedQty,
            uom: l.uom || mat.primaryUom,
          } : null;
        }).filter((x): x is NonNullable<typeof x> => Boolean(x));

    if (reqInputs.length === 0) {
      return { error: 'No catalog material requirements identified on this Customer PO to check.' };
    }

    const assessment = assessOrderMaterialRequirements({
      requirements: reqInputs,
      assignedSiteId: siteId,
      lots: state.lots,
      storeLocations: state.storeLocations,
      sites: state.sites,
      supplierPos: state.supplierPos,
      supplierPoLines: state.supplierPoLines,
    });

    const now = new Date().toISOString();
    const today = now.slice(0, 10);
    const shortageItems = assessment.items.filter(i => i.shortageQty > 0);
    const reservableItems = assessment.items.filter(i => i.toReserveQty > 0);

    // Avoid duplicate open PR for same PO/requirement
    const existingPr = state.purchaseReqs.find(
      pr => (pr.sourceRefId === po.id || pr.sourceRefLabel === po.poNumber) && !['cancelled', 'closed'].includes(pr.status)
    );

    let createdPr: PurchaseRequisition | undefined;
    if (shortageItems.length > 0 && !existingPr) {
      const prId = `pr-auto-${Date.now()}`;
      const prNumber = nextSequentialNumber(
        `PR-${today.slice(0, 4)}`,
        state.purchaseReqs.map(p => p.prNumber),
        3,
        101,
      );
      const rmStore = state.storeLocations.find(sl => sl.siteId === siteId && sl.locationType === 'RM') ?? state.storeLocations.find(sl => sl.siteId === siteId);
      createdPr = {
        id: prId,
        prNumber,
        raisedBy: `Auto Availability Check (${actorName})`,
        department: 'Procurement',
        raisedDate: today,
        requiredBy: poLinesList[0]?.requiredDate || today,
        sourceType: 'shortage',
        sourceRefId: po.id,
        sourceRefLabel: po.poNumber,
        jobId: targetJob?.id,
        jobNumber: targetJob?.jobNumber,
        status: 'approved',
        lineCount: shortageItems.length,
        totalQty: shortageItems.reduce((s, x) => s + x.shortageQty, 0),
        priority: 'high',
        deliverToSiteId: siteId,
        deliverToSiteName: site?.name ?? po.deliverToSiteName,
        deliverToStoreId: rmStore?.id,
        deliverToStoreName: rmStore?.name,
        purpose: `Shortage cover for ${po.poNumber} (${po.customerName})`,
        lines: shortageItems.map((si, idx) => ({
          id: `${prId}-l${idx + 1}`,
          prId,
          materialItemId: si.materialItemId,
          materialCode: si.materialCode,
          materialName: si.materialName,
          description: si.materialName,
          grade: si.grade,
          requiredQty: si.shortageQty,
          uom: si.uom,
          requiredDate: poLinesList[0]?.requiredDate || today,
        })),
      };
    }

    // Reconcile existing open shortage PR if shortage changed
    let updatedPurchaseReqs = [...state.purchaseReqs];
    if (existingPr && ['draft', 'pending_approval', 'approved'].includes(existingPr.status)) {
      if (shortageItems.length === 0) {
        updatedPurchaseReqs = updatedPurchaseReqs.map(p => p.id === existingPr.id ? { ...p, status: 'closed' as const, totalQty: 0 } : p);
      } else {
        const nextTotal = shortageItems.reduce((s, x) => s + x.shortageQty, 0);
        if (nextTotal !== existingPr.totalQty) {
          updatedPurchaseReqs = updatedPurchaseReqs.map(p => p.id === existingPr.id ? {
            ...p,
            lineCount: shortageItems.length,
            totalQty: nextTotal,
            lines: shortageItems.map((si, idx) => ({
              id: `${existingPr.id}-l${idx + 1}`,
              prId: existingPr.id,
              materialItemId: si.materialItemId,
              materialCode: si.materialCode,
              materialName: si.materialName,
              description: si.materialName,
              grade: si.grade,
              requiredQty: si.shortageQty,
              uom: si.uom,
              requiredDate: poLinesList[0]?.requiredDate || today,
            })),
          } : p);
        }
      }
    } else if (createdPr) {
      updatedPurchaseReqs = [createdPr, ...updatedPurchaseReqs];
    }

    // Reserve available quantities on lots / inventory / jobMaterialReqs
    const siteLocationIds = new Set(state.storeLocations.filter(sl => sl.siteId === siteId).map(sl => sl.id));
    let updatedLots = [...state.lots];
    let updatedInventory = [...state.inventory];
    let updatedReqs = [...state.jobMaterialReqs];
    const newMovements: StockMovement[] = [];
    let reservedCount = 0;

    for (const item of reservableItems) {
      let remLot = item.toReserveQty;
      const nextLots: MaterialLot[] = [];
      for (const lot of updatedLots) {
        if (remLot > 0 && lot.materialItemId === item.materialItemId && lot.status === 'available' && siteLocationIds.has(lot.storeLocationId) && lot.primaryQty > 0) {
          if (lot.primaryQty <= remLot) {
            remLot -= lot.primaryQty;
            nextLots.push({
              ...lot,
              status: 'reserved' as const,
            });
          } else {
            const take = remLot;
            remLot = 0;
            nextLots.push({ ...lot, primaryQty: lot.primaryQty - take });
            nextLots.push({
              ...lot,
              id: `${lot.id}-res-${Date.now().toString(36)}`,
              lotNumber: `${lot.lotNumber}-RES`,
              primaryQty: take,
              status: 'reserved' as const,
              parentLotId: lot.id,
            });
          }
        } else {
          nextLots.push(lot);
        }
      }
      updatedLots = nextLots;

      let rem = item.toReserveQty;
      updatedInventory = updatedInventory.map(inv => {
        if (rem <= 0 || inv.materialItemId !== item.materialItemId || !siteLocationIds.has(inv.locationId) || inv.availableQty <= 0) return inv;
        const take = Math.min(rem, inv.availableQty);
        rem -= take;
        reservedCount += take;
        return { ...inv, reservedQty: inv.reservedQty + take, availableQty: inv.availableQty - take };
      });
      if (targetJob) {
        const existingReq = updatedReqs.find(r => r.jobId === targetJob.id && r.materialItemId === item.materialItemId);
        if (existingReq) {
          updatedReqs = updatedReqs.map(r => r.id === existingReq.id ? {
            ...r,
            reservedQty: r.reservedQty + item.toReserveQty,
            shortage: item.shortageQty > 0,
          } : r);
        } else {
          updatedReqs.push({
            id: `jmr-auto-${Date.now()}-${item.materialItemId}`,
            jobId: targetJob.id,
            stageId: targetJob.stages[0]?.id ?? '',
            stageName: targetJob.stages[0]?.name ?? 'Cutting',
            materialItemId: item.materialItemId,
            materialName: item.materialName,
            requiredQty: item.requiredQty,
            reservedQty: item.toReserveQty,
            issuedQty: 0,
            uom: item.uom,
            shortage: item.shortageQty > 0,
            lotIds: [],
          });
        }
      }
      const matchLot = state.lots.find(l => l.materialItemId === item.materialItemId && l.status === 'available' && siteLocationIds.has(l.storeLocationId));
      newMovements.push({
        id: `sm-res-${Date.now()}-${item.materialItemId}`,
        lotId: matchLot?.id ?? '',
        movementType: 'Reservation',
        primaryQty: item.toReserveQty,
        uom: item.uom,
        fromLocation: site?.name ?? 'Warehouse',
        toLocation: `Reserved for ${po.poNumber}`,
        referenceType: 'Customer PO',
        referenceId: po.id,
        referenceNumber: po.poNumber,
        performedBy: actorName,
        timestamp: now,
        notes: item.shortageQty > 0 ? `Partial reservation (${item.toReserveQty} reserved, ${item.shortageQty} sent to PR)` : 'Full availability reservation',
      });
    }

    const prevAvail = po.availabilityStatus ?? 'unchecked';
    const nextJobReadiness = assessment.overallStatus === 'available'
      ? 'ready'
      : assessment.overallStatus === 'partially_available'
        ? 'partial'
        : 'awaiting_procurement';

    set(s => ({
      lots: updatedLots,
      inventory: updatedInventory,
      jobMaterialReqs: updatedReqs,
      movements: [...s.movements, ...newMovements],
      purchaseReqs: updatedPurchaseReqs,
      customerPos: s.customerPos.map(c => c.id === po.id ? { ...c, availabilityStatus: assessment.overallStatus } : c),
      jobs: targetJob ? s.jobs.map(j => j.id === targetJob.id ? {
        ...j,
        materialReadiness: nextJobReadiness,
      } : j) : s.jobs,
      auditEvents: [...s.auditEvents, createAuditEventRecord({
        actor: actorName,
        actorId: s.currentUser.id,
        role: s.currentUser.role,
        module: 'Sales',
        scope: 'CustomerPO',
        action: 'assess_material_availability',
        entityId: po.id,
        entityRef: po.poNumber,
        timestamp: now,
        description: `Assessed material availability for ${po.poNumber}: ${assessment.overallStatus.replace(/_/g, ' ')} (${reservedCount} reserved${createdPr ? `, auto-raised ${createdPr.prNumber}` : ''}).`,
        changes: [
          { field: 'availabilityStatus', label: 'Material Availability', previousValue: prevAvail, newValue: assessment.overallStatus },
          ...(reservedCount > 0 ? [{ field: 'reservedQty', label: 'Reserved Qty', previousValue: '0', newValue: String(reservedCount) }] : []),
        ],
        after: {
          availabilityStatus: assessment.overallStatus,
          reservedQty: reservedCount,
          createdPrNumber: createdPr?.prNumber ?? existingPr?.prNumber,
        },
      })],
    }));

    const message = assessment.overallStatus === 'available'
      ? `All required materials available at ${site?.name ?? 'site'}. Stock reserved.`
      : assessment.overallStatus === 'partially_available'
        ? `Reserved available stock${createdPr ? ` and raised ${createdPr.prNumber} for the shortage only` : existingPr ? ` (${existingPr.prNumber} already open for shortage)` : ''}.`
        : `${createdPr ? `Raised ${createdPr.prNumber} for unavailable materials` : existingPr ? `Shortage already tracked in ${existingPr.prNumber}` : 'Materials unavailable'}.`;

    get().showToast({
      type: assessment.overallStatus === 'available' ? 'success' : 'warning',
      title: `Material Check: ${assessment.overallStatus.replace(/_/g, ' ')}`,
      body: message,
    });
    return { status: assessment.overallStatus, reservedCount, createdPr, message };
  },
  convertQuotationToPO: (quotationId, po, lines) => set(s => {
    const quotation = s.quotations.find(q => q.id === quotationId);
    const customer = s.customers.find(c => c.id === po.customerId);
    const exposure = s.customerPos
      .filter(p => p.customerId === po.customerId && ['active', 'partial', 'on_hold'].includes(p.status))
      .reduce((sum, p) => sum + p.totalValue, 0);
    const available = (customer?.creditLimit ?? Number.POSITIVE_INFINITY) - exposure;
    const exceedsCredit = Number.isFinite(available) && po.totalValue > available;
    const approvalId = exceedsCredit ? `apr-credit-${po.id}` : undefined;
    const approval: ApprovalRequest | undefined = exceedsCredit ? {
      id: approvalId!, requestType: 'Customer PO Credit Limit Approval', entityRef: po.poNumber,
      entityId: po.id, description: `${po.poNumber} exceeds available credit by ₹${(po.totalValue - available).toLocaleString('en-IN')}.`,
      requestedBy: s.currentUser.name, requestedAt: new Date().toISOString(), status: 'pending',
      thresholdValue: customer?.creditLimit, currentValue: exposure + po.totalValue, approvalCycle: 1,
    } : undefined;
    const nextPo: CustomerPO = {
      ...po,
      quotationId, rfqId: quotation?.rfqId, rfqRef: quotation?.rfqNumber,
      status: exceedsCredit ? 'on_hold' : po.status,
      creditApprovalId: approvalId,
      commercialLocked: false,
    };
    return {
      quotations: s.quotations.map(q => q.id === quotationId ? { ...q, status: 'accepted' as const } : q),
      rfqs: s.rfqs.map(r => r.id === quotation?.rfqId ? { ...r, status: 'converted' as const, quotationId, quotationRef: quotation?.quotationNumber, quotationStatus: 'accepted' as const, convertedPoId: nextPo.id } : r),
      customerPos: [nextPo, ...s.customerPos],
      poLines: [...s.poLines, ...lines],
      ...(approval ? { approvalRequests: [approval, ...s.approvalRequests] } : {}),
      auditEvents: [...s.auditEvents, {
        id: `ae-${Date.now()}`, actor: s.currentUser.name, actorId: s.currentUser.id, scope: 'CustomerPO', action: 'create',
        entityId: nextPo.id, entityRef: nextPo.poNumber, timestamp: new Date().toISOString(), source: 'ui',
        after: nextPo as unknown as Record<string, unknown>, reason: exceedsCredit ? 'Credit limit approval required' : undefined,
      }],
    };
  }),
  addPurchaseReq: (pr) => set(s => ({
    purchaseReqs: [pr, ...s.purchaseReqs],
    auditEvents: [...s.auditEvents, createAuditEventRecord({
      actor: s.currentUser.name, actorId: s.currentUser.id, role: s.currentUser.role,
      scope: 'PurchaseRequisition', action: 'create', entityId: pr.id, entityRef: pr.prNumber,
      description: `Raised Purchase Requisition ${pr.prNumber} (${pr.lineCount} line${pr.lineCount === 1 ? '' : 's'}).`,
      after: { status: pr.status, priority: pr.priority, requiredBy: pr.requiredBy },
    })],
  })),
  updatePurchaseReq: (id, partial) => set(s => {
    const existing = s.purchaseReqs.find(p => p.id === id);
    if (!existing) return s;
    const timestamp = new Date().toISOString();
    const next = { ...existing, ...partial };
    const changes = diffRecordFields(existing as unknown as Record<string, unknown>, next as unknown as Record<string, unknown>);
    const isDecision = partial.status === 'approved' || partial.status === 'rejected';
    const decisionBy = (partial.status === 'approved' ? partial.approvedBy : partial.rejectedBy) ?? s.currentUser.name;
    const decisionReason = partial.rejectionReason || partial.reason;
    const approvalRequests = isDecision
      ? s.approvalRequests.map(a =>
          (a.entityId === id || a.entityRef === existing.prNumber) && a.status === 'pending'
            ? { ...a, status: partial.status as 'approved' | 'rejected', approvedBy: decisionBy, notes: decisionReason ?? a.notes, decisionAt: timestamp }
            : a
        )
      : s.approvalRequests;
    const matchedAprIds = new Set(
      approvalRequests
        .filter(a => (a.entityId === id || a.entityRef === existing.prNumber) && a.status !== 'pending')
        .map(a => a.id)
    );
    const pulseExceptions = isDecision
      ? s.pulseExceptions.filter(pe => pe.affectedId !== id && !matchedAprIds.has(pe.affectedId))
      : s.pulseExceptions;
    const notifications = isDecision
      ? s.notifications.map(n => n.entityId === id || n.entityRef === existing.prNumber || n.title.includes(existing.prNumber) ? { ...n, read: true } : n)
      : s.notifications;
    return {
      purchaseReqs: s.purchaseReqs.map(p => p.id === id ? next : p),
      approvalRequests,
      pulseExceptions,
      notifications,
      unreadCount: notifications.filter(n => !n.read).length,
      auditEvents: (changes.length > 0 || isDecision) ? [...s.auditEvents, createAuditEventRecord({
        actor: decisionBy, actorId: s.currentUser.id, role: s.currentUser.role,
        scope: 'PurchaseRequisition',
        action: partial.status === 'approved' ? 'approve' : partial.status === 'rejected' ? 'reject' : 'update',
        entityId: id, entityRef: existing.prNumber, timestamp,
        description: partial.status === 'approved'
          ? `Approved Purchase Requisition ${existing.prNumber}.`
          : partial.status === 'rejected'
            ? `Rejected Purchase Requisition ${existing.prNumber}.`
            : `Updated Purchase Requisition ${existing.prNumber}.`,
        reason: decisionReason,
        changes,
      })] : s.auditEvents,
    };
  }),
  addCustomerPO: (po, lines) => set(s => {
    const customer = s.customers.find(c => c.id === po.customerId);
    const exposure = s.customerPos.filter(p => p.customerId === po.customerId && ['active', 'partial', 'on_hold'].includes(p.status)).reduce((sum, p) => sum + p.totalValue, 0);
    const available = (customer?.creditLimit ?? Number.POSITIVE_INFINITY) - exposure;
    const exceedsCredit = Number.isFinite(available) && po.totalValue > available;
    const approvalId = exceedsCredit ? `apr-credit-${po.id}` : undefined;
    const nextPo = { ...po, status: exceedsCredit ? 'on_hold' as const : po.status, creditApprovalId: approvalId };
    const approval: ApprovalRequest | undefined = exceedsCredit ? {
      id: approvalId!, requestType: 'Customer PO Credit Limit Approval', entityRef: po.poNumber, entityId: po.id,
      description: `${po.poNumber} exceeds available credit by ₹${(po.totalValue - available).toLocaleString('en-IN')}.`, requestedBy: s.currentUser.name,
      requestedAt: new Date().toISOString(), status: 'pending', thresholdValue: customer?.creditLimit, currentValue: exposure + po.totalValue, approvalCycle: 1,
    } : undefined;
    return {
      customerPos: s.customerPos.some(p => p.id === nextPo.id) ? s.customerPos : [nextPo, ...s.customerPos],
      poLines: lines && lines.length > 0 ? [...s.poLines, ...lines] : s.poLines,
      ...(approval ? { approvalRequests: [approval, ...s.approvalRequests] } : {}),
    };
  }),

  createJobWithNewCustomerPO: ({ job, po, poLines }) => {
    const state = get();
    const existingJob = state.jobs.find(j => j.id === job.id || j.jobNumber === job.jobNumber);
    if (existingJob) {
      const existingPo = existingJob.customerPoId ? state.customerPos.find(p => p.id === existingJob.customerPoId) : undefined;
      return { job: existingJob, po: existingPo };
    }
    const timestamp = new Date().toISOString();
    let createdPo = po;
    let finalJob = job;

    if (po) {
      const dupPo = state.customerPos.find(p => p.id === po.id || p.poNumber.trim().toLowerCase() === po.poNumber.trim().toLowerCase());
      if (dupPo) {
        createdPo = dupPo;
      } else {
        const customer = state.customers.find(c => c.id === po.customerId);
        const exposure = state.customerPos.filter(p => p.customerId === po.customerId && ['active', 'partial', 'on_hold'].includes(p.status)).reduce((sum, p) => sum + p.totalValue, 0);
        const available = (customer?.creditLimit ?? Number.POSITIVE_INFINITY) - exposure;
        const exceedsCredit = Number.isFinite(available) && po.totalValue > available;
        const approvalId = exceedsCredit ? `apr-credit-${po.id}` : undefined;
        createdPo = { ...po, status: exceedsCredit ? 'on_hold' as const : po.status, creditApprovalId: approvalId };
      }
      finalJob = {
        ...job,
        customerPoId: createdPo.id,
        customerPoNumber: createdPo.poNumber,
        poLineId: poLines?.[0]?.id ?? job.poLineId,
      };
    }

    const linkedLines: POLine[] = (poLines ?? []).map(l => ({
      ...l,
      poId: createdPo?.id ?? l.poId,
      jobId: finalJob.id,
      jobNumber: finalJob.jobNumber,
    }));

    set(s => {
      const poAlreadyStored = createdPo ? s.customerPos.some(p => p.id === createdPo!.id) : true;
      const approval: ApprovalRequest | undefined = (!poAlreadyStored && createdPo?.creditApprovalId) ? {
        id: createdPo.creditApprovalId,
        requestType: 'Customer PO Credit Limit Approval',
        entityRef: createdPo.poNumber,
        entityId: createdPo.id,
        description: `${createdPo.poNumber} requires credit limit review.`,
        requestedBy: s.currentUser.name,
        requestedAt: timestamp,
        status: 'pending',
        approvalCycle: 1,
      } : undefined;
      return {
        customerPos: (!poAlreadyStored && createdPo) ? [createdPo, ...s.customerPos] : s.customerPos,
        poLines: linkedLines.length > 0 ? [...s.poLines, ...linkedLines] : s.poLines,
        jobs: [finalJob, ...s.jobs],
        ...(approval ? { approvalRequests: [approval, ...s.approvalRequests] } : {}),
        auditEvents: [
          ...s.auditEvents,
          ...(createdPo && !poAlreadyStored ? [{
            id: `ae-po-${Date.now()}`, actor: s.currentUser.name, actorId: s.currentUser.id, scope: 'CustomerPO', action: 'create_with_job',
            entityId: createdPo.id, entityRef: createdPo.poNumber, timestamp, source: 'ui' as const,
            after: { poNumber: createdPo.poNumber, jobId: finalJob.id, jobNumber: finalJob.jobNumber },
          }] : []),
          {
            id: `ae-job-${Date.now() + 1}`, actor: s.currentUser.name, actorId: s.currentUser.id, scope: 'Job', action: 'create',
            entityId: finalJob.id, entityRef: finalJob.jobNumber, timestamp, source: 'ui' as const,
            after: { jobNumber: finalJob.jobNumber, customerPoId: finalJob.customerPoId, customerPoNumber: finalJob.customerPoNumber },
          },
        ],
      };
    });
    return { job: finalJob, po: createdPo };
  },

  addSupplierPO: (spo, lines) => set(s => ({
    supplierPos: [spo, ...s.supplierPos],
    supplierPoLines: lines && lines.length > 0 ? [...s.supplierPoLines, ...lines] : s.supplierPoLines,
  })),
  addGRN: (grn) => set(s => ({ grns: [grn, ...s.grns] })),

  recordGRNReceipt: (input) => {
    const state = get();
    const spo = state.supplierPos.find(p => p.id === input.spoId);
    if (!spo) return { error: 'Supplier PO not found.' };
    if (['cancelled', 'draft', 'supplier_declined', 'closed', 'received'].includes(spo.status)) {
      return { error: `Cannot record receipt against a ${spo.status} Supplier PO.` };
    }
    const spoLines = state.supplierPoLines.filter(l => l.spoId === spo.id);
    if (spoLines.length === 0) {
      return { error: 'This Supplier PO has no ordered line items to receive.' };
    }
    const activeInputLines = input.lines.filter(l => Number(l.receivedQty) > 0);
    if (activeInputLines.length === 0) {
      return { error: 'Enter a received quantity greater than 0 for at least one line item.' };
    }
    if (!input.deliveryChallan.trim()) {
      return { error: 'Delivery challan reference is required.' };
    }

    const seenLotNumbers = new Set(state.lots.map(l => l.lotNumber.trim().toLowerCase()));
    for (const lineInput of activeInputLines) {
      const spoLine = spoLines.find(l => l.id === lineInput.spoLineId);
      if (!spoLine) return { error: 'Invalid Supplier PO line referenced.' };
      if (lineInput.receivedQty <= 0) return { error: `Received quantity must be positive for ${spoLine.materialName}.` };
      const maxAllowable = spoLine.orderedQty * (1 + (spoLine.tolerancePct ?? 0) / 100) - spoLine.receivedQty;
      if (lineInput.receivedQty > maxAllowable + 1e-6) {
        return {
          error: `Over-receipt blocked for ${spoLine.materialName}: remaining allowable is ${Math.max(0, Number(maxAllowable.toFixed(3)))} ${spoLine.uom}.`,
        };
      }
      if (!lineInput.lots || lineInput.lots.length === 0) {
        return { error: `At least one lot must be recorded for ${spoLine.materialName}.` };
      }
      let lotSum = 0;
      for (const lot of lineInput.lots) {
        if (!lot.lotNumber.trim()) return { error: `Lot number is required for ${spoLine.materialName}.` };
        if (lot.qty <= 0) return { error: `Lot ${lot.lotNumber} quantity must be greater than 0.` };
        const normLot = lot.lotNumber.trim().toLowerCase();
        if (seenLotNumbers.has(normLot)) {
          return { error: `Duplicate lot number "${lot.lotNumber}". Each lot must have a unique reference.` };
        }
        seenLotNumbers.add(normLot);
        lotSum += lot.qty;
      }
      if (Math.abs(lotSum - lineInput.receivedQty) > 1e-6) {
        return {
          error: `Lot quantities (${lotSum} ${spoLine.uom}) must equal actual received quantity (${lineInput.receivedQty} ${spoLine.uom}) for ${spoLine.materialName}.`,
        };
      }
    }

    const now = new Date();
    const timestamp = now.toISOString();
    const siteId = input.siteId || spo.deliverToSiteId || state.sites[0]?.id;
    const site = state.sites.find(st => st.id === siteId);
    const defaultQuarantine = state.storeLocations.find(sl => sl.siteId === siteId && sl.locationType === 'Quarantine')
      || state.storeLocations.find(sl => sl.id === (input.storeLocationId || spo.deliverToStoreId))
      || state.storeLocations.find(sl => sl.siteId === siteId)
      || state.storeLocations[0];
    const storeId = input.storeLocationId || spo.deliverToStoreId || defaultQuarantine?.id || '';
    const storeName = state.storeLocations.find(sl => sl.id === storeId)?.name || spo.deliverToStoreName || defaultQuarantine?.name || 'Quarantine & QC Hold';
    const grnId = `grn-${Date.now()}`;
    const grnNumber = nextSequentialNumber(
      `GRN-${now.getFullYear()}`,
      state.grns.map(g => g.grnNumber),
      3,
      101,
    );

    const newLots: MaterialLot[] = [];
    const newMovements: StockMovement[] = [];
    const grnLines: GoodsReceiptLine[] = [];
    let updatedInventory = [...state.inventory];

    for (const lineInput of activeInputLines) {
      const spoLine = spoLines.find(l => l.id === lineInput.spoLineId)!;
      const material = state.materials.find(m => m.id === spoLine.materialItemId);
      const lotIds: string[] = [];
      const lotAllocations: GoodsReceiptLine['lots'] = [];

      lineInput.lots.forEach((lotInput, idx) => {
        const lotId = `lot-${Date.now()}-${spoLine.id}-${idx}`;
        lotIds.push(lotId);
        const lotGrade = lotInput.grade || spoLine.grade || material?.standardGrade;
        const createdLot: MaterialLot = {
          id: lotId,
          lotNumber: lotInput.lotNumber.trim(),
          heatNumber: lotInput.supplierLotRef?.trim() || undefined,
          supplierBatchRef: lotInput.supplierLotRef?.trim() || undefined,
          materialItemId: spoLine.materialItemId,
          materialName: spoLine.materialName,
          supplierId: spo.supplierId,
          supplierName: spo.supplierName,
          spoId: spo.id,
          grnId,
          receivedDate: input.receivedDate,
          mfgDate: lotInput.mfgDate || undefined,
          expiryDate: lotInput.expiryDate || undefined,
          grade: lotGrade,
          status: 'qc_hold',
          storeLocationId: storeId,
          storeLocationName: storeName,
          primaryQty: lotInput.qty,
          receivedQty: lotInput.qty,
          acceptedQty: 0,
          rejectedQty: 0,
          primaryUom: spoLine.uom,
          certStatus: 'pending',
          notes: lotInput.notes || undefined,
        };
        newLots.push(createdLot);
        lotAllocations.push({
          id: `grnl-${lotId}`,
          lotId,
          lotNumber: createdLot.lotNumber,
          supplierLotRef: createdLot.supplierBatchRef,
          grade: lotGrade,
          qty: lotInput.qty,
          uom: spoLine.uom,
          mfgDate: createdLot.mfgDate,
          expiryDate: createdLot.expiryDate,
          qualityStatus: 'pending_qc',
          notes: lotInput.notes,
        });
        newMovements.push({
          id: `sm-${Date.now()}-${spoLine.id}-${idx}`,
          lotId,
          movementType: 'Receipt',
          primaryQty: lotInput.qty,
          uom: spoLine.uom,
          fromLocation: spo.supplierName,
          toLocation: `${storeName} (Awaiting QC)`,
          referenceType: 'GRN',
          referenceId: grnId,
          referenceNumber: grnNumber,
          performedBy: input.receivedBy,
          timestamp,
          notes: `Received against ${spo.poNumber} (Lot ${createdLot.lotNumber}, pending inspection)`,
        });
      });

      const qtyAdded = lineInput.receivedQty;
      const existingInv = updatedInventory.find(i => i.materialItemId === spoLine.materialItemId && i.locationId === storeId);
      if (existingInv) {
        updatedInventory = updatedInventory.map(i => i.id !== existingInv.id ? i : {
          ...i,
          onHandQty: i.onHandQty + qtyAdded,
          qcHoldQty: i.qcHoldQty + qtyAdded,
          inTransitQty: Math.max(0, i.inTransitQty - qtyAdded),
          lotCount: i.lotCount + lineInput.lots.length,
          shortage: i.availableQty < i.reorderPoint,
        });
      } else {
        updatedInventory.unshift({
          id: `inv-${Date.now()}-${spoLine.materialItemId}-${storeId}`,
          materialItemId: spoLine.materialItemId,
          materialCode: material?.itemCode ?? spoLine.materialCode ?? spoLine.materialItemId,
          materialName: spoLine.materialName,
          categoryName: material?.categoryName ?? 'Uncategorised',
          locationId: storeId,
          locationName: storeName,
          onHandQty: qtyAdded,
          availableQty: 0,
          reservedQty: 0,
          qcHoldQty: qtyAdded,
          inTransitQty: 0,
          primaryUom: spoLine.uom,
          reorderPoint: material?.reorderPoint ?? 0,
          shortage: (material?.reorderPoint ?? 0) > 0,
          lotCount: lineInput.lots.length,
          unitCost: spoLine.rate,
        });
      }

      grnLines.push({
        id: `grnline-${Date.now()}-${spoLine.id}`,
        spoLineId: spoLine.id,
        materialItemId: spoLine.materialItemId,
        materialCode: material?.itemCode ?? spoLine.materialCode,
        materialName: spoLine.materialName,
        grade: spoLine.grade ?? material?.standardGrade,
        orderedQty: spoLine.orderedQty,
        previouslyReceivedQty: spoLine.receivedQty,
        receivedQty: lineInput.receivedQty,
        uom: spoLine.uom,
        lots: lotAllocations,
        notes: lineInput.notes,
      });
    }

    const grn: GoodsReceipt = {
      id: grnId,
      grnNumber,
      supplierId: spo.supplierId,
      supplierName: spo.supplierName,
      spoId: spo.id,
      spoNumber: spo.poNumber,
      receivedDate: input.receivedDate,
      receivedBy: input.receivedBy,
      deliveryChallan: input.deliveryChallan.trim(),
      vehicleNumber: input.vehicleNumber?.trim() || undefined,
      status: 'pending_qc',
      lineCount: grnLines.length,
      siteId: site?.id,
      siteName: site?.name,
      storeLocationId: storeId,
      storeLocationName: storeName,
      lines: grnLines,
      notes: input.notes?.trim() || undefined,
    };

    const nextSpoLines = state.supplierPoLines.map(line => {
      if (line.spoId !== spo.id) return line;
      const lineInput = activeInputLines.find(l => l.spoLineId === line.id);
      if (!lineInput) return line;
      const nextReceived = line.receivedQty + lineInput.receivedQty;
      return {
        ...line,
        receivedQty: nextReceived,
        status: nextReceived >= line.orderedQty ? 'received' as const : 'partial' as const,
      };
    });

    const spoLinesAfter = nextSpoLines.filter(l => l.spoId === spo.id);
    const allLinesReceived = spoLinesAfter.every(l => l.receivedQty >= l.orderedQty);
    const nextSpoStatus: SupplierPO['status'] = allLinesReceived ? 'received' : 'partial';

    set(s => ({
      grns: [grn, ...s.grns],
      lots: [...newLots, ...s.lots],
      movements: [...s.movements, ...newMovements],
      inventory: updatedInventory,
      supplierPoLines: nextSpoLines,
      supplierPos: s.supplierPos.map(p => p.id === spo.id ? { ...p, status: nextSpoStatus } : p),
      auditEvents: [...s.auditEvents, {
        id: `ae-${Date.now()}`,
        actor: input.receivedBy,
        actorId: s.currentUser.id,
        scope: 'GRN',
        action: 'create_receipt',
        entityId: grnId,
        entityRef: grnNumber,
        timestamp,
        source: 'ui',
        after: { spoNumber: spo.poNumber, lotCount: newLots.length, lineCount: grnLines.length, spoStatus: nextSpoStatus },
      }],
    }));

    get().showToast({
      type: 'success',
      title: `GRN ${grnNumber} recorded`,
      body: `${newLots.length} lot(s) placed in QC Hold awaiting incoming inspection.`,
    });
    return { grn };
  },
  acceptGRN: (grnId, by) => {
    set(s => {
      const grn = s.grns.find(g => g.id === grnId);
      if (!grn || grn.status === 'accepted') return s;
      const lines = s.supplierPoLines.filter(line => line.spoId === grn.spoId && line.receivedQty > 0 && line.acceptedQty > 0);
      if (lines.length === 0) return s;
      const timestamp = new Date().toISOString();
      let inventory = [...s.inventory];
      let lots = [...s.lots];
      let movements = [...s.movements];
      for (const line of lines) {
        const material = s.materials.find(m => m.id === line.materialItemId);
        const locationId = grn.storeLocationId ?? s.storeLocations.find(l => l.siteId === grn.siteId)?.id ?? s.storeLocations[0]?.id ?? '';
        const locationName = grn.storeLocationName ?? s.storeLocations.find(l => l.id === locationId)?.name ?? 'Receiving Store';
        const lotId = `lot-${Date.now()}-${line.id}`;
        lots.push({
          id: lotId, lotNumber: `${grn.grnNumber}-${line.materialItemId}`, materialItemId: line.materialItemId,
          materialName: line.materialName, supplierId: grn.supplierId, supplierName: grn.supplierName, grnId,
          receivedDate: grn.receivedDate, grade: material?.standardGrade, status: 'available', storeLocationId: locationId,
          storeLocationName: locationName, primaryQty: line.acceptedQty, primaryUom: line.uom, certStatus: 'pending',
        });
        const existing = inventory.find(i => i.materialItemId === line.materialItemId && i.locationId === locationId);
        if (existing) {
          inventory = inventory.map(i => i.id !== existing.id ? i : {
            ...i, onHandQty: i.onHandQty + line.acceptedQty, availableQty: i.availableQty + line.acceptedQty,
            lotCount: i.lotCount + 1, shortage: i.availableQty + line.acceptedQty < i.reorderPoint,
          });
        } else {
          inventory.unshift({
            id: `inv-${Date.now()}-${line.materialItemId}`, materialItemId: line.materialItemId,
            materialCode: material?.itemCode ?? line.materialItemId, materialName: line.materialName,
            categoryName: material?.categoryName ?? 'Uncategorised', locationId, locationName,
            onHandQty: line.acceptedQty, availableQty: line.acceptedQty, reservedQty: 0, qcHoldQty: 0,
            inTransitQty: 0, primaryUom: line.uom, reorderPoint: material?.reorderPoint ?? 0,
            shortage: line.acceptedQty < (material?.reorderPoint ?? 0), lotCount: 1,
          });
        }
        movements.push({ id: `sm-${Date.now()}-${line.id}`, lotId, movementType: 'Receipt', primaryQty: line.acceptedQty, uom: line.uom,
          toLocation: locationName, referenceType: 'GRN', referenceId: grn.id, referenceNumber: grn.grnNumber, performedBy: by, timestamp });
      }
      return {
        grns: s.grns.map(g => g.id === grnId ? { ...g, status: 'accepted' as const } : g),
        inventory, lots, movements,
        auditEvents: [...s.auditEvents, { id: `ae-${Date.now()}`, actor: by, actorId: s.currentUser.id, scope: 'GRN', action: 'accept',
          entityId: grn.id, entityRef: grn.grnNumber, timestamp, source: 'ui', after: { acceptedLineCount: lines.length } }],
      };
    });
    get().showToast({ type: 'success', title: 'GRN accepted', body: 'Accepted quantities are now available in Inventory. Pending and rejected quantities remain excluded.' });
  },

  rejectGRN: (grnId, by, reason) => {
    const timestamp = new Date().toISOString();
    set(s => {
      const grn = s.grns.find(g => g.id === grnId);
      if (!grn || grn.status === 'rejected') return s;
      const holdLots = s.lots.filter(l => l.grnId === grnId && l.status === 'qc_hold');
      let inventory = [...s.inventory];
      const movements = [...s.movements];
      for (const lot of holdLots) {
        inventory = inventory.map(i => (i.materialItemId === lot.materialItemId && i.locationId === lot.storeLocationId)
          ? {
              ...i,
              onHandQty: Math.max(0, i.onHandQty - lot.primaryQty),
              qcHoldQty: Math.max(0, i.qcHoldQty - lot.primaryQty),
              shortage: i.availableQty < i.reorderPoint,
            }
          : i);
        movements.push({
          id: `sm-rej-${Date.now()}-${lot.id}`,
          lotId: lot.id,
          movementType: 'Scrap',
          primaryQty: lot.primaryQty,
          uom: lot.primaryUom,
          fromLocation: `${lot.storeLocationName} (QC Hold)`,
          toLocation: 'Rejected Quarantine',
          referenceType: 'GRN Rejection',
          referenceId: grn.id,
          referenceNumber: grn.grnNumber,
          performedBy: by,
          timestamp,
          notes: reason || 'Rejected at GRN receiving inspection',
        });
      }
      return {
        grns: s.grns.map(g => g.id === grnId ? { ...g, status: 'rejected' as const } : g),
        lots: s.lots.map(l => l.grnId === grnId && l.status === 'qc_hold' ? { ...l, status: 'scrapped' as const, rejectedQty: l.primaryQty } : l),
        inventory,
        movements,
        auditEvents: [...s.auditEvents, {
          id: `ae-${Date.now()}`, actor: by, actorId: s.currentUser.id, scope: 'GRN', action: 'reject',
          entityId: grn.id, entityRef: grn.grnNumber, timestamp, source: 'ui', reason,
        }],
      };
    });
    get().showToast({ type: 'warning', title: 'GRN rejected', body: 'Received lots were segregated out of available inventory.' });
  },

  startInspectionForLot: (lotId) => {
    const state = get();
    const lot = state.lots.find(l => l.id === lotId);
    if (!lot) return undefined;
    const existing = state.inspections.find(i => i.lotId === lotId && i.type === 'Incoming');
    if (existing) return existing;
    const grn = lot.grnId ? state.grns.find(g => g.id === lot.grnId) : undefined;
    const spoId = lot.spoId ?? grn?.spoId;
    const spo = spoId ? state.supplierPos.find(p => p.id === spoId) : undefined;
    const siteId = grn?.siteId ?? state.storeLocations.find(sl => sl.id === lot.storeLocationId)?.siteId;
    const siteName = grn?.siteName ?? state.sites.find(st => st.id === siteId)?.name;
    const ins: Inspection = {
      id: `ins-${Date.now()}-${lot.id.slice(-4)}`,
      inspectionNumber: nextSequentialNumber(
        `INSP-${new Date().getFullYear()}`,
        state.inspections.map(i => i.inspectionNumber),
        3,
        1,
      ),
      type: 'Incoming',
      origin: 'internal',
      lotId: lot.id,
      grnId: grn?.id,
      grnNumber: grn?.grnNumber,
      poId: spo?.id,
      spoNumber: spo?.poNumber ?? grn?.spoNumber,
      siteId,
      siteName,
      subject: `${lot.materialName} (${lot.lotNumber})`,
      productDescription: `${lot.materialName}${lot.grade ? ` · ${lot.grade}` : ''}`,
      quantityInspected: lot.primaryQty,
      uom: lot.primaryUom,
      inspectorId: state.currentUser.id,
      inspectorName: state.currentUser.name,
      date: new Date().toISOString().slice(0, 10),
      receivedDate: lot.receivedDate,
      templateName: 'Incoming Material Inspection',
      sampleQty: lot.primaryQty,
      acceptedQty: 0,
      rejectedQty: 0,
      result: 'pending',
    };
    set(s => ({ inspections: [ins, ...s.inspections] }));
    return ins;
  },

  startInspectionForGRN: (grnId, lotId) => {
    const state = get();
    const grn = state.grns.find(g => g.id === grnId);
    if (!grn) return undefined;
    const grnLots = state.lots.filter(l => l.grnId === grnId);
    const targetLot = lotId
      ? grnLots.find(l => l.id === lotId) ?? state.lots.find(l => l.id === lotId)
      : grnLots.find(l => l.status === 'qc_hold') ?? grnLots[0];
    if (targetLot) {
      return get().startInspectionForLot(targetLot.id);
    }
    const existingByGrn = state.inspections.find(i => i.grnId === grnId && i.type === 'Incoming');
    if (existingByGrn) return existingByGrn;
    const lineSummary = grn.lines?.[0];
    const ins: Inspection = {
      id: `ins-${Date.now()}`,
      inspectionNumber: nextSequentialNumber(
        `INSP-${new Date().getFullYear()}`,
        state.inspections.map(i => i.inspectionNumber),
        3,
        1,
      ),
      type: 'Incoming',
      origin: 'internal',
      grnId: grn.id,
      grnNumber: grn.grnNumber,
      poId: grn.spoId,
      spoNumber: grn.spoNumber,
      siteId: grn.siteId,
      siteName: grn.siteName,
      subject: lineSummary ? lineSummary.materialName : grn.grnNumber,
      productDescription: lineSummary ? `${lineSummary.materialName}${lineSummary.grade ? ` · ${lineSummary.grade}` : ''}` : `Receipt ${grn.grnNumber}`,
      quantityInspected: lineSummary?.receivedQty ?? grn.lineCount,
      uom: lineSummary?.uom ?? 'Units',
      inspectorId: state.currentUser.id,
      inspectorName: state.currentUser.name,
      date: new Date().toISOString().slice(0, 10),
      receivedDate: grn.receivedDate,
      templateName: 'Incoming Material Inspection',
      sampleQty: lineSummary?.receivedQty ?? 1,
      acceptedQty: 0,
      rejectedQty: 0,
      result: 'pending',
    };
    set(s => ({ inspections: [ins, ...s.inspections] }));
    return ins;
  },

  completeIncomingInspection: (inspectionId, payload) => {
    const timestamp = new Date().toISOString();
    set(s => {
      const ins = s.inspections.find(i => i.id === inspectionId);
      if (!ins) return s;
      const by = payload.by || s.currentUser.name;
      const lot = ins.lotId ? s.lots.find(l => l.id === ins.lotId) : undefined;
      const totalLotQty = lot ? lot.primaryQty : Math.max(0, ins.sampleQty || (payload.acceptedQty + payload.rejectedQty));
      let acceptedQty = Math.max(0, Math.min(payload.acceptedQty, totalLotQty));
      let rejectedQty = Math.max(0, Math.min(payload.rejectedQty, totalLotQty - acceptedQty));
      if (payload.result === 'pass' && acceptedQty === 0 && rejectedQty === 0) acceptedQty = totalLotQty;
      if (payload.result === 'fail' && acceptedQty === 0 && rejectedQty === 0) rejectedQty = totalLotQty;
      if (payload.result === 'hold') {
        acceptedQty = 0;
        rejectedQty = 0;
      }
      const holdQty = Math.max(0, totalLotQty - acceptedQty - rejectedQty);

      let lots = [...s.lots];
      let inventory = [...s.inventory];
      const movements = [...s.movements];
      let supplierPoLines = [...s.supplierPoLines];
      let grns = [...s.grns];

      if (lot && lot.status === 'qc_hold' && payload.result !== 'hold' && (acceptedQty > 0 || rejectedQty > 0)) {
        const relocated = applyReleasedStockLocation({
          inventory,
          storeLocations: s.storeLocations,
          materials: s.materials,
          lot,
          acceptedQty,
          rejectedQty,
        });
        inventory = relocated.inventory;
        const extraLots: MaterialLot[] = [];
        lots = lots.map(l => {
          if (l.id !== lot.id) return l;
          if (acceptedQty > 0 && rejectedQty === 0 && holdQty === 0) {
            return {
              ...l,
              status: 'available' as const,
              storeLocationId: relocated.targetStoreId,
              storeLocationName: relocated.targetStoreName,
              acceptedQty,
              rejectedQty: 0,
            };
          }
          if (acceptedQty === 0 && rejectedQty > 0 && holdQty === 0) {
            return { ...l, status: 'scrapped' as const, acceptedQty: 0, rejectedQty };
          }
          if (acceptedQty > 0) {
            return {
              ...l,
              primaryQty: acceptedQty,
              acceptedQty,
              rejectedQty: 0,
              status: 'available' as const,
              storeLocationId: relocated.targetStoreId,
              storeLocationName: relocated.targetStoreName,
            };
          }
          return { ...l, primaryQty: holdQty, acceptedQty: 0, rejectedQty, status: 'qc_hold' as const };
        });
        if (rejectedQty > 0 && (acceptedQty > 0 || holdQty > 0)) {
          extraLots.push({
            ...lot,
            id: `lot-rej-${lot.id}-${Date.now()}`,
            lotNumber: `${lot.lotNumber}-REJ`,
            parentLotId: lot.id,
            primaryQty: rejectedQty,
            receivedQty: rejectedQty,
            acceptedQty: 0,
            rejectedQty,
            status: 'scrapped',
          });
        }
        if (holdQty > 0 && acceptedQty > 0) {
          extraLots.push({
            ...lot,
            id: `lot-hold-${lot.id}-${Date.now()}`,
            lotNumber: `${lot.lotNumber}-HOLD`,
            parentLotId: lot.id,
            primaryQty: holdQty,
            receivedQty: holdQty,
            acceptedQty: 0,
            rejectedQty: 0,
            status: 'qc_hold',
          });
        }
        if (extraLots.length > 0) {
          lots = [...lots, ...extraLots];
        }

        if (acceptedQty > 0) {
          movements.push({
            id: `sm-insp-acc-${Date.now()}`,
            lotId: lot.id,
            movementType: relocated.targetStoreId !== lot.storeLocationId ? 'Transfer-In' : 'Adjustment',
            primaryQty: acceptedQty,
            uom: lot.primaryUom,
            fromLocation: `${lot.storeLocationName} (QC Hold)`,
            toLocation: relocated.targetStoreName,
            referenceType: 'Incoming Inspection',
            referenceId: ins.id,
            referenceNumber: ins.inspectionNumber,
            performedBy: by,
            timestamp,
            notes: `Released ${acceptedQty} ${lot.primaryUom} after inspection (${payload.result})`,
          });
        }
        if (rejectedQty > 0) {
          movements.push({
            id: `sm-insp-rej-${Date.now() + 1}`,
            lotId: extraLots.find(e => e.status === 'scrapped')?.id ?? lot.id,
            movementType: 'Scrap',
            primaryQty: rejectedQty,
            uom: lot.primaryUom,
            fromLocation: `${lot.storeLocationName} (QC Hold)`,
            toLocation: 'Rejected Quarantine',
            referenceType: 'Incoming Inspection',
            referenceId: ins.id,
            referenceNumber: ins.inspectionNumber,
            performedBy: by,
            timestamp,
            notes: `Rejected ${rejectedQty} ${lot.primaryUom} during incoming inspection`,
          });
        }

        const spoId = lot.spoId ?? ins.poId;
        if (spoId) {
          supplierPoLines = supplierPoLines.map(line => (line.spoId === spoId && line.materialItemId === lot.materialItemId)
            ? {
                ...line,
                acceptedQty: Math.min(line.receivedQty, line.acceptedQty + acceptedQty),
                rejectedQty: Math.min(line.receivedQty, line.rejectedQty + rejectedQty),
              }
            : line);
        }

        const targetGrnId = ins.grnId ?? lot.grnId;
        if (targetGrnId) {
          const grnLots = lots.filter(l => l.grnId === targetGrnId);
          const hasHold = grnLots.some(l => l.status === 'qc_hold');
          const hasAvail = grnLots.some(l => l.status === 'available');
          const hasRej = grnLots.some(l => l.status === 'scrapped');
          const nextGrnStatus: GoodsReceipt['status'] = !hasHold && hasAvail && !hasRej
            ? 'accepted'
            : hasRej && !hasAvail && !hasHold
              ? 'rejected'
              : (hasAvail || hasRej) ? 'partial' : 'qc_hold';
          grns = grns.map(g => g.id === targetGrnId ? { ...g, status: nextGrnStatus } : g);
        }
      } else if (ins.grnId && payload.result === 'hold') {
        grns = grns.map(g => g.id === ins.grnId ? { ...g, status: 'qc_hold' as const } : g);
      }

      const inspections = s.inspections.map(i => i.id !== inspectionId ? i : {
        ...i,
        acceptedQty,
        rejectedQty,
        result: payload.result,
        remarks: payload.remarks ?? i.remarks,
        measurements: payload.measurements ?? i.measurements,
        approvedAt: (payload.result === 'pass' || payload.result === 'partial') ? timestamp : i.approvedAt,
      });

      const reconciled = acceptedQty > 0
        ? reconcilePendingOrdersOnStockAccepted({
            customerPos: s.customerPos,
            jobs: s.jobs,
            jobMaterialReqs: s.jobMaterialReqs,
            poLines: s.poLines,
            materials: s.materials,
            lots,
            storeLocations: s.storeLocations,
            sites: s.sites,
            supplierPos: s.supplierPos,
            supplierPoLines,
            purchaseReqs: s.purchaseReqs,
            acceptedMaterialItemId: lot?.materialItemId,
            actor: by,
            actorId: s.currentUser.id,
            role: s.currentUser.role,
            timestamp,
          })
        : { customerPos: s.customerPos, jobs: s.jobs, jobMaterialReqs: s.jobMaterialReqs, auditEvents: [] };

      return {
        inspections,
        lots,
        inventory,
        movements,
        supplierPoLines,
        grns,
        customerPos: reconciled.customerPos,
        jobs: reconciled.jobs,
        jobMaterialReqs: reconciled.jobMaterialReqs,
        auditEvents: [...s.auditEvents, createAuditEventRecord({
          actor: by,
          actorId: s.currentUser.id,
          role: s.currentUser.role,
          module: 'Quality',
          scope: 'Inspection',
          action: 'complete_incoming',
          entityId: inspectionId,
          entityRef: ins.inspectionNumber,
          timestamp,
          description: `Incoming inspection ${ins.inspectionNumber} completed (${payload.result}): accepted ${acceptedQty}, rejected ${rejectedQty}${lot ? ` on lot ${lot.lotNumber}` : ''}`,
          reason: payload.remarks,
          relatedEntityType: lot ? 'MaterialLot' : undefined,
          relatedEntityId: lot?.id,
          relatedEntityRef: lot?.lotNumber,
          after: { result: payload.result, acceptedQty, rejectedQty, lotId: lot?.id },
        }), ...reconciled.auditEvents],
      };
    });
    get().showToast({ type: 'success', title: 'Inspection recorded', body: 'Lot quality status and inventory availability have been updated.' });
  },
  addJob: (job) => set(s => ({ jobs: [job, ...s.jobs] })),
  addInspection: (ins) => set(s => ({ inspections: [ins, ...s.inspections] })),
  addDispatchRecord: (d) => set(s => ({ dispatches: [d, ...s.dispatches] })),

  // ── Finance Actions ──
  addCustomerInvoice: (inv) => set(s => ({ customerInvoices: [inv, ...s.customerInvoices] })),
  addSupplierInvoice: (inv) => set(s => ({ supplierInvoices: [inv, ...s.supplierInvoices] })),
  addPaymentRecord: (pay) => set(s => ({ paymentRecords: [pay, ...s.paymentRecords] })),
  recordPaymentAgainstInvoice: (invoiceId, direction, amount) => {
    if (direction === 'inbound') {
      set(s => ({
        customerInvoices: s.customerInvoices.map(inv => {
          if (inv.id !== invoiceId) return inv;
          const newPaid = inv.amountPaid + amount;
          const status = newPaid >= inv.amount ? 'paid' : 'partial';
          return { ...inv, amountPaid: newPaid, status: status as CustomerInvoice['status'] };
        }),
      }));
    } else {
      set(s => ({
        supplierInvoices: s.supplierInvoices.map(inv => {
          if (inv.id !== invoiceId) return inv;
          const newPaid = inv.amountPaid + amount;
          const status = newPaid >= inv.amount ? 'paid' : 'partial';
          return { ...inv, amountPaid: newPaid, status: status as SupplierInvoice['status'] };
        }),
      }));
    }
  },

  // ── New Finance Actions (Order-to-Cash & Procure-to-Pay) ──
  addInvoice: (inv) => set(s => ({ invoices: [inv, ...s.invoices] })),
  addPayment: (pay) => set(s => ({ payments: [pay, ...s.payments] })),
  addPaymentAllocation: (pa) => set(s => ({ paymentAllocations: [pa, ...s.paymentAllocations] })),
  addCollectionActivity: (ca) => set(s => ({
    collectionActivities: [ca, ...s.collectionActivities],
    auditEvents: [...s.auditEvents, createAuditEventRecord({
      actor: s.currentUser.name, actorId: s.currentUser.id, role: s.currentUser.role,
      scope: 'CustomerInvoice', action: 'update', entityId: ca.invoiceId, entityRef: ca.invoiceNumber,
      description: `Logged collection follow-up (${ca.collectionNumber} via ${ca.channel}): ${(ca.notes ?? '').slice(0, 90)}`,
    })],
  })),

  createCustomerInvoice: (payload) => {
    const state = get();
    const po = state.customerPos.find(p => p.id === payload.poId);
    if (!po) return { ok: false, error: 'Customer PO not found.' };
    if (payload.lines.length === 0 || payload.lines.every(l => l.quantity <= 0)) {
      return { ok: false, error: 'Add at least one invoice line with quantity > 0.' };
    }
    // Duplicate / over-invoicing guard per PO line
    const poLinesList = state.poLines.filter(l => l.poId === po.id);
    const activeInvIds = new Set(state.invoices.filter(i => i.poId === po.id && !['void', 'cancelled'].includes(i.status)).map(i => i.id));
    const existingInvLines = state.invoiceLines.filter(il => activeInvIds.has(il.invoiceId));
    for (const reqLine of payload.lines) {
      if (reqLine.quantity <= 0) continue;
      const poLine = poLinesList.find(pl => pl.id === reqLine.poLineId || pl.drawingNumber === reqLine.drawingNumber);
      if (poLine) {
        const alreadyInvoiced = existingInvLines
          .filter(il => il.poLineId === poLine.id || il.drawingNumber === poLine.drawingNumber)
          .reduce((s, il) => s + il.quantity, 0);
        if (alreadyInvoiced + reqLine.quantity > poLine.orderedQty) {
          return {
            ok: false,
            error: `Cannot invoice ${reqLine.quantity} ${reqLine.uom} of "${reqLine.productName}": only ${Math.max(0, poLine.orderedQty - alreadyInvoiced)} ${poLine.uom} remaining uninvoiced on ${po.poNumber}.`,
          };
        }
      }
    }

    const totals = computeGstTotals({
      lines: payload.lines,
      taxType: payload.taxType,
      invoiceDiscountAmount: payload.discountAmount,
      freightAmount: payload.freightAmount,
      otherCharges: payload.otherCharges,
    });
    const invId = `cinv-${Date.now()}`;
    const invoiceNumber = nextSequentialNumber(
      `INV-${payload.invoiceDate.slice(0, 4)}`,
      state.invoices.map(i => i.invoiceNumber),
      3,
      1,
    );
    const status: Invoice['status'] = payload.issueNow ? 'issued' : 'draft';
    const linkedDispatches = state.dispatches.filter(d => (payload.dispatchIds ?? []).includes(d.id));
    const now = new Date().toISOString();

    const invoice: Invoice = {
      id: invId,
      invoiceNumber,
      customerId: po.customerId,
      customerName: po.customerName,
      poId: po.id,
      poNumber: po.poNumber,
      dispatchIds: payload.dispatchIds ?? [],
      dispatchNumbers: linkedDispatches.map(d => d.dispatchNumber),
      invoiceDate: payload.invoiceDate,
      dueDate: payload.dueDate,
      paymentTerms: payload.paymentTerms ?? po.paymentTerms,
      currency: po.currency || 'INR',
      status,
      taxType: payload.taxType,
      subtotal: totals.subtotal,
      discountAmount: payload.discountAmount ?? 0,
      freightAmount: payload.freightAmount ?? 0,
      otherCharges: payload.otherCharges ?? 0,
      taxAmount: totals.taxAmount,
      cgstAmount: totals.cgstAmount,
      sgstAmount: totals.sgstAmount,
      igstAmount: totals.igstAmount,
      totalAmount: totals.totalAmount,
      paidAmount: 0,
      outstandingAmount: totals.totalAmount,
      createdBy: state.currentUser.name,
      createdAt: now,
      issuedDate: payload.issueNow ? payload.invoiceDate : undefined,
      issuedBy: payload.issueNow ? state.currentUser.name : undefined,
      notes: payload.notes,
      isSimulated: true,
    };

    const lines: InvoiceLine[] = payload.lines
      .filter(l => l.quantity > 0)
      .map((l, idx) => {
        const calc = totals.computedLines[idx];
        return {
          id: `${invId}-l${idx + 1}`,
          invoiceId: invId,
          poLineId: l.poLineId,
          productId: l.productId ?? `fg-${idx + 1}`,
          productName: l.productName,
          drawingNumber: l.drawingNumber,
          hsnSac: l.hsnSac ?? '7308',
          quantity: l.quantity,
          uom: l.uom,
          unitPrice: l.unitPrice,
          discountPct: l.discountPct ?? 0,
          taxPct: payload.taxType === 'Export_LUT' ? 0 : l.taxPct,
          taxableAmount: calc.taxable,
          taxAmount: calc.tax,
          lineTotal: calc.lineTotal,
          dispatchId: l.dispatchId ?? payload.dispatchIds?.[0],
          dispatchNumber: l.dispatchNumber ?? linkedDispatches[0]?.dispatchNumber,
        };
      });

    set(s => ({
      invoices: [invoice, ...s.invoices],
      invoiceLines: [...s.invoiceLines, ...lines],
      auditEvents: [...s.auditEvents, createAuditEventRecord({
        actor: s.currentUser.name, actorId: s.currentUser.id, role: s.currentUser.role,
        scope: 'CustomerInvoice', action: payload.issueNow ? 'issue' : 'create',
        entityId: invoice.id, entityRef: invoice.invoiceNumber, timestamp: now,
        description: `${payload.issueNow ? 'Created and issued' : 'Created draft'} Customer Invoice ${invoice.invoiceNumber} (₹${invoice.totalAmount.toLocaleString('en-IN')}) for ${po.customerName}.`,
        relatedEntityType: 'CustomerPO', relatedEntityId: po.id, relatedEntityRef: po.poNumber,
      })],
    }));
    get().showToast({ type: 'success', title: `Invoice ${invoiceNumber} ${payload.issueNow ? 'issued' : 'saved as draft'}` });
    return { ok: true, invoice };
  },

  updateCustomerInvoiceDraft: (invoiceId, payload) => {
    const state = get();
    const existing = state.invoices.find(i => i.id === invoiceId);
    if (!existing) return { ok: false, error: 'Invoice not found.' };
    if (existing.status !== 'draft') return { ok: false, error: 'Only draft invoices can be edited. Void and reissue if an issued invoice needs correction.' };

    const existingLines = state.invoiceLines.filter(l => l.invoiceId === invoiceId);
    const nextTaxType = payload.taxType ?? existing.taxType ?? 'CGST_SGST';
    const nextDiscount = payload.discountAmount ?? existing.discountAmount ?? 0;
    const nextFreight = payload.freightAmount ?? existing.freightAmount ?? 0;
    const nextOther = payload.otherCharges ?? existing.otherCharges ?? 0;
    const sourceLines = payload.lines ?? existingLines.map(l => ({
      id: l.id,
      poLineId: l.poLineId,
      productId: l.productId,
      productName: l.productName,
      drawingNumber: l.drawingNumber,
      hsnSac: l.hsnSac,
      quantity: l.quantity,
      uom: l.uom,
      unitPrice: l.unitPrice,
      discountPct: l.discountPct,
      taxPct: l.taxPct,
    }));

    const totals = computeGstTotals({
      lines: sourceLines,
      taxType: nextTaxType,
      invoiceDiscountAmount: nextDiscount,
      freightAmount: nextFreight,
      otherCharges: nextOther,
    });

    const updatedInvoice: Invoice = {
      ...existing,
      invoiceDate: payload.invoiceDate ?? existing.invoiceDate,
      dueDate: payload.dueDate ?? existing.dueDate,
      paymentTerms: payload.paymentTerms ?? existing.paymentTerms,
      taxType: nextTaxType,
      discountAmount: nextDiscount,
      freightAmount: nextFreight,
      otherCharges: nextOther,
      subtotal: totals.subtotal,
      taxAmount: totals.taxAmount,
      cgstAmount: totals.cgstAmount,
      sgstAmount: totals.sgstAmount,
      igstAmount: totals.igstAmount,
      totalAmount: totals.totalAmount,
      outstandingAmount: Math.max(0, totals.totalAmount - existing.paidAmount),
      notes: payload.notes ?? existing.notes,
    };

    const updatedLines: InvoiceLine[] = sourceLines.map((l, idx) => {
      const calc = totals.computedLines[idx];
      return {
        id: l.id ?? `${invoiceId}-l${idx + 1}`,
        invoiceId,
        poLineId: l.poLineId,
        productId: l.productId ?? `fg-${idx + 1}`,
        productName: l.productName,
        drawingNumber: l.drawingNumber,
        hsnSac: l.hsnSac ?? '7308',
        quantity: l.quantity,
        uom: l.uom,
        unitPrice: l.unitPrice,
        discountPct: l.discountPct ?? 0,
        taxPct: nextTaxType === 'Export_LUT' ? 0 : l.taxPct,
        taxableAmount: calc.taxable,
        taxAmount: calc.tax,
        lineTotal: calc.lineTotal,
      };
    });

    set(s => ({
      invoices: s.invoices.map(i => i.id === invoiceId ? updatedInvoice : i),
      invoiceLines: [...s.invoiceLines.filter(l => l.invoiceId !== invoiceId), ...updatedLines],
      auditEvents: [...s.auditEvents, createAuditEventRecord({
        actor: s.currentUser.name, actorId: s.currentUser.id, role: s.currentUser.role,
        scope: 'CustomerInvoice', action: 'edit', entityId: invoiceId, entityRef: existing.invoiceNumber,
        description: `Edited draft invoice ${existing.invoiceNumber} (Updated total: ₹${updatedInvoice.totalAmount.toLocaleString('en-IN')}).`,
        before: { dueDate: existing.dueDate, totalAmount: existing.totalAmount, paymentTerms: existing.paymentTerms, notes: existing.notes },
        after: { dueDate: updatedInvoice.dueDate, totalAmount: updatedInvoice.totalAmount, paymentTerms: updatedInvoice.paymentTerms, notes: updatedInvoice.notes },
      })],
    }));
    get().showToast({ type: 'success', title: `Draft invoice ${existing.invoiceNumber} updated` });
    return { ok: true };
  },

  issueCustomerInvoice: (invoiceId) => {
    const state = get();
    const existing = state.invoices.find(i => i.id === invoiceId);
    if (!existing) return { ok: false, error: 'Invoice not found.' };
    if (existing.status !== 'draft') return { ok: false, error: 'Only draft invoices can be issued.' };
    const today = new Date().toISOString().slice(0, 10);
    set(s => ({
      invoices: s.invoices.map(i => i.id === invoiceId ? { ...i, status: 'issued' as const, issuedDate: today, issuedBy: s.currentUser.name } : i),
      auditEvents: [...s.auditEvents, createAuditEventRecord({
        actor: s.currentUser.name, actorId: s.currentUser.id, role: s.currentUser.role,
        scope: 'CustomerInvoice', action: 'issue', entityId: invoiceId, entityRef: existing.invoiceNumber,
        description: `Issued Customer Invoice ${existing.invoiceNumber} for ₹${existing.totalAmount.toLocaleString('en-IN')} to ${existing.customerName}.`,
        before: { status: existing.status }, after: { status: 'issued', issuedDate: today },
      })],
    }));
    get().showToast({ type: 'success', title: `Invoice ${existing.invoiceNumber} issued` });
    return { ok: true };
  },

  voidCustomerInvoice: (invoiceId, reason) => {
    const state = get();
    const existing = state.invoices.find(i => i.id === invoiceId);
    if (!existing) return { ok: false, error: 'Invoice not found.' };
    if (!reason.trim()) return { ok: false, error: 'Cancellation / void reason is mandatory.' };
    if (existing.paidAmount > 0) return { ok: false, error: 'Cannot void an invoice with active allocated payments. Reverse linked payments first.' };
    const now = new Date().toISOString();
    set(s => ({
      invoices: s.invoices.map(i => i.id === invoiceId ? {
        ...i, status: 'void' as const, outstandingAmount: 0, voidReason: reason.trim(), voidedAt: now, voidedBy: s.currentUser.name,
      } : i),
      auditEvents: [...s.auditEvents, createAuditEventRecord({
        actor: s.currentUser.name, actorId: s.currentUser.id, role: s.currentUser.role,
        scope: 'CustomerInvoice', action: 'void', entityId: invoiceId, entityRef: existing.invoiceNumber, timestamp: now,
        description: `Voided Customer Invoice ${existing.invoiceNumber}.`,
        before: { status: existing.status, outstandingAmount: existing.outstandingAmount },
        after: { status: 'void', outstandingAmount: 0 },
        reason: reason.trim(),
      })],
    }));
    get().showToast({ type: 'info', title: `Invoice ${existing.invoiceNumber} voided` });
    return { ok: true };
  },

  recordCustomerPayment: (payload) => {
    const state = get();
    const customer = state.customers.find(c => c.id === payload.customerId);
    if (!customer) return { ok: false, error: 'Customer not found.' };
    if (!(payload.amount > 0)) return { ok: false, error: 'Payment amount must be greater than zero.' };
    const allocs = (payload.allocations ?? []).filter(a => a.amount > 0);
    const totalAllocated = allocs.reduce((s, a) => s + a.amount, 0);
    if (totalAllocated > payload.amount) return { ok: false, error: 'Total allocated amount exceeds receipt amount.' };

    for (const a of allocs) {
      const inv = state.invoices.find(i => i.id === a.invoiceId);
      if (!inv) return { ok: false, error: `Invoice ${a.invoiceId} not found.` };
      if (['draft', 'void', 'cancelled'].includes(inv.status)) return { ok: false, error: `Invoice ${inv.invoiceNumber} is ${inv.status} and cannot receive payment.` };
      if (a.amount > inv.outstandingAmount) return { ok: false, error: `Allocation ₹${a.amount.toLocaleString('en-IN')} exceeds outstanding ₹${inv.outstandingAmount.toLocaleString('en-IN')} on ${inv.invoiceNumber}.` };
    }

    const now = new Date().toISOString();
    const payId = `pay-${Date.now()}`;
    const paymentNumber = nextSequentialNumber(
      `PAY-${payload.receiptDate.slice(0, 4)}`,
      state.payments.map(p => p.paymentNumber),
      3,
      1,
    );
    const unallocated = Math.max(0, payload.amount - totalAllocated);
    const status: Payment['status'] = totalAllocated === 0 ? 'received' : unallocated > 0 ? 'partially_allocated' : 'allocated';

    const payment: Payment = {
      id: payId,
      paymentNumber,
      customerId: customer.id,
      customerName: customer.tradingName,
      receiptDate: payload.receiptDate,
      currency: customer.currency || 'INR',
      amount: payload.amount,
      paymentMethod: payload.paymentMethod,
      transactionRef: payload.transactionRef.trim() || `SIM-${paymentNumber}`,
      receivingAccount: payload.receivingAccount || 'Apex Precision — HDFC 50200012345',
      status,
      allocatedAmount: totalAllocated,
      unallocatedAmount: unallocated,
      isAdvance: payload.isAdvance || totalAllocated === 0,
      notes: payload.notes,
      createdBy: state.currentUser.name,
      isSimulated: true,
    };

    const newAllocs: PaymentAllocation[] = allocs.map((a, idx) => {
      const inv = state.invoices.find(i => i.id === a.invoiceId)!;
      return {
        id: `pa-${Date.now()}-${idx + 1}`,
        paymentId: payId,
        paymentNumber,
        invoiceId: inv.id,
        invoiceNumber: inv.invoiceNumber,
        customerId: customer.id,
        allocatedAmount: a.amount,
        allocatedDate: payload.receiptDate,
        allocatedBy: state.currentUser.name,
        notes: a.notes,
      };
    });

    const newAuditEvents: AuditEvent[] = [
      createAuditEventRecord({
        actor: state.currentUser.name, actorId: state.currentUser.id, role: state.currentUser.role,
        scope: 'CustomerPayment', action: 'payment_recorded', entityId: payId, entityRef: paymentNumber, timestamp: now,
        description: `Recorded simulated customer payment ${paymentNumber} of ₹${payload.amount.toLocaleString('en-IN')} from ${customer.tradingName} (${payload.paymentMethod.toUpperCase()} · ${payment.transactionRef}).`,
        relatedEntityType: 'Customer', relatedEntityId: customer.id, relatedEntityRef: customer.tradingName,
      }),
    ];

    set(s => {
      const invoices = s.invoices.map(inv => {
        const alloc = allocs.find(a => a.invoiceId === inv.id);
        if (!alloc) return inv;
        const paidAmount = inv.paidAmount + alloc.amount;
        const outstandingAmount = Math.max(0, inv.totalAmount - paidAmount);
        const invStatus: Invoice['status'] = outstandingAmount === 0 ? 'paid' : 'partially_paid';
        newAuditEvents.push(createAuditEventRecord({
          actor: s.currentUser.name, actorId: s.currentUser.id, role: s.currentUser.role,
          scope: 'CustomerInvoice', action: 'allocate', entityId: inv.id, entityRef: inv.invoiceNumber, timestamp: now,
          description: `Allocated ₹${alloc.amount.toLocaleString('en-IN')} from receipt ${paymentNumber} to ${inv.invoiceNumber}.`,
          before: { paidAmount: inv.paidAmount, outstandingAmount: inv.outstandingAmount, status: inv.status },
          after: { paidAmount, outstandingAmount, status: invStatus },
          relatedEntityType: 'CustomerPayment', relatedEntityId: payId, relatedEntityRef: paymentNumber,
        }));
        return { ...inv, paidAmount, outstandingAmount, status: invStatus };
      });
      return {
        payments: [payment, ...s.payments],
        paymentAllocations: [...newAllocs, ...s.paymentAllocations],
        invoices,
        auditEvents: [...s.auditEvents, ...newAuditEvents],
      };
    });

    get().showToast({ type: 'success', title: `Receipt ${paymentNumber} recorded`, body: `₹${payload.amount.toLocaleString('en-IN')} recorded (${unallocated > 0 ? `₹${unallocated.toLocaleString('en-IN')} unallocated advance` : 'fully allocated'}).` });
    return { ok: true, payment };
  },

  allocateCustomerPayment: (paymentId, allocations) => {
    const state = get();
    const pay = state.payments.find(p => p.id === paymentId);
    if (!pay) return { ok: false, error: 'Payment not found.' };
    if (pay.status === 'reversed') return { ok: false, error: 'Cannot allocate a reversed payment.' };
    const validAllocs = allocations.filter(a => a.amount > 0);
    if (validAllocs.length === 0) return { ok: false, error: 'Enter at least one positive allocation amount.' };
    const addTotal = validAllocs.reduce((s, a) => s + a.amount, 0);
    if (addTotal > pay.unallocatedAmount) return { ok: false, error: `Allocation ₹${addTotal.toLocaleString('en-IN')} exceeds unallocated balance ₹${pay.unallocatedAmount.toLocaleString('en-IN')}.` };

    for (const a of validAllocs) {
      const inv = state.invoices.find(i => i.id === a.invoiceId);
      if (!inv || inv.outstandingAmount < a.amount) {
        return { ok: false, error: `Invalid allocation for invoice ${inv?.invoiceNumber ?? a.invoiceId}.` };
      }
    }

    const now = new Date().toISOString();
    const today = now.slice(0, 10);
    const createdAllocs: PaymentAllocation[] = validAllocs.map((a, idx) => {
      const inv = state.invoices.find(i => i.id === a.invoiceId)!;
      return {
        id: `pa-${Date.now()}-${idx + 1}`,
        paymentId: pay.id,
        paymentNumber: pay.paymentNumber,
        invoiceId: inv.id,
        invoiceNumber: inv.invoiceNumber,
        customerId: pay.customerId,
        allocatedAmount: a.amount,
        allocatedDate: today,
        allocatedBy: state.currentUser.name,
        notes: a.notes,
      };
    });

    set(s => {
      const extraEvents: AuditEvent[] = [];
      const nextAllocated = pay.allocatedAmount + addTotal;
      const nextUnallocated = Math.max(0, pay.amount - nextAllocated);
      const nextPayStatus: Payment['status'] = nextUnallocated === 0 ? 'allocated' : 'partially_allocated';
      const invoices = s.invoices.map(inv => {
        const a = validAllocs.find(x => x.invoiceId === inv.id);
        if (!a) return inv;
        const paidAmount = inv.paidAmount + a.amount;
        const outstandingAmount = Math.max(0, inv.totalAmount - paidAmount);
        const status: Invoice['status'] = outstandingAmount === 0 ? 'paid' : 'partially_paid';
        extraEvents.push(createAuditEventRecord({
          actor: s.currentUser.name, actorId: s.currentUser.id, role: s.currentUser.role,
          scope: 'CustomerInvoice', action: 'allocate', entityId: inv.id, entityRef: inv.invoiceNumber, timestamp: now,
          description: `Allocated ₹${a.amount.toLocaleString('en-IN')} from advance/receipt ${pay.paymentNumber}.`,
          before: { paidAmount: inv.paidAmount, outstandingAmount: inv.outstandingAmount, status: inv.status },
          after: { paidAmount, outstandingAmount, status },
          relatedEntityType: 'CustomerPayment', relatedEntityId: pay.id, relatedEntityRef: pay.paymentNumber,
        }));
        return { ...inv, paidAmount, outstandingAmount, status };
      });
      extraEvents.push(createAuditEventRecord({
        actor: s.currentUser.name, actorId: s.currentUser.id, role: s.currentUser.role,
        scope: 'CustomerPayment', action: 'allocate', entityId: pay.id, entityRef: pay.paymentNumber, timestamp: now,
        description: `Allocated ₹${addTotal.toLocaleString('en-IN')} across ${validAllocs.length} invoice(s).`,
        before: { allocatedAmount: pay.allocatedAmount, unallocatedAmount: pay.unallocatedAmount, status: pay.status },
        after: { allocatedAmount: nextAllocated, unallocatedAmount: nextUnallocated, status: nextPayStatus },
      }));
      return {
        payments: s.payments.map(p => p.id === pay.id ? { ...p, allocatedAmount: nextAllocated, unallocatedAmount: nextUnallocated, status: nextPayStatus } : p),
        paymentAllocations: [...createdAllocs, ...s.paymentAllocations],
        invoices,
        auditEvents: [...s.auditEvents, ...extraEvents],
      };
    });
    get().showToast({ type: 'success', title: `Allocated ₹${addTotal.toLocaleString('en-IN')} from ${pay.paymentNumber}` });
    return { ok: true };
  },

  reverseCustomerPayment: (paymentId, reason) => {
    const state = get();
    const pay = state.payments.find(p => p.id === paymentId);
    if (!pay) return { ok: false, error: 'Payment not found.' };
    if (pay.status === 'reversed') return { ok: false, error: 'Payment is already reversed.' };
    if (!reason.trim()) return { ok: false, error: 'Reversal reason is required.' };
    const now = new Date().toISOString();
    const linkedAllocs = state.paymentAllocations.filter(pa => pa.paymentId === paymentId);

    set(s => {
      const extraEvents: AuditEvent[] = [];
      const invoices = s.invoices.map(inv => {
        const reversedAmt = linkedAllocs.filter(pa => pa.invoiceId === inv.id).reduce((sum, pa) => sum + pa.allocatedAmount, 0);
        if (reversedAmt <= 0) return inv;
        const paidAmount = Math.max(0, inv.paidAmount - reversedAmt);
        const outstandingAmount = Math.max(0, inv.totalAmount - paidAmount);
        const status: Invoice['status'] = paidAmount > 0 ? 'partially_paid' : (new Date(inv.dueDate) < new Date(now.slice(0, 10)) ? 'overdue' : 'issued');
        extraEvents.push(createAuditEventRecord({
          actor: s.currentUser.name, actorId: s.currentUser.id, role: s.currentUser.role,
          scope: 'CustomerInvoice', action: 'deallocate', entityId: inv.id, entityRef: inv.invoiceNumber, timestamp: now,
          description: `Reversed ₹${reversedAmt.toLocaleString('en-IN')} allocation following reversal of ${pay.paymentNumber}.`,
          before: { paidAmount: inv.paidAmount, outstandingAmount: inv.outstandingAmount, status: inv.status },
          after: { paidAmount, outstandingAmount, status },
          reason: reason.trim(),
          relatedEntityType: 'CustomerPayment', relatedEntityId: pay.id, relatedEntityRef: pay.paymentNumber,
        }));
        return { ...inv, paidAmount, outstandingAmount, status };
      });
      extraEvents.push(createAuditEventRecord({
        actor: s.currentUser.name, actorId: s.currentUser.id, role: s.currentUser.role,
        scope: 'CustomerPayment', action: 'reverse', entityId: pay.id, entityRef: pay.paymentNumber, timestamp: now,
        description: `Reversed Customer Payment ${pay.paymentNumber} (₹${pay.amount.toLocaleString('en-IN')}).`,
        before: { status: pay.status, allocatedAmount: pay.allocatedAmount },
        after: { status: 'reversed', allocatedAmount: 0 },
        reason: reason.trim(),
      }));
      return {
        payments: s.payments.map(p => p.id === paymentId ? {
          ...p, status: 'reversed' as const, allocatedAmount: 0, unallocatedAmount: 0, reversedReason: reason.trim(), reversedAt: now, reversedBy: s.currentUser.name,
        } : p),
        paymentAllocations: s.paymentAllocations.filter(pa => pa.paymentId !== paymentId),
        invoices,
        auditEvents: [...s.auditEvents, ...extraEvents],
      };
    });
    get().showToast({ type: 'warning', title: `Payment ${pay.paymentNumber} reversed` });
    return { ok: true };
  },

  createSupplierBill: (payload) => {
    const state = get();
    const supplier = state.suppliers.find(sp => sp.id === payload.supplierId);
    if (!supplier) return { ok: false, error: 'Supplier not found.' };
    if (!payload.supplierInvoiceNo.trim()) return { ok: false, error: 'Supplier Invoice Number is required.' };
    const dup = state.supplierBills.find(
      b => b.supplierId === payload.supplierId
        && b.supplierInvoiceNo.trim().toLowerCase() === payload.supplierInvoiceNo.trim().toLowerCase()
        && b.status !== 'void' && b.status !== 'rejected'
    );
    if (dup) {
      return { ok: false, error: `Duplicate supplier invoice "${payload.supplierInvoiceNo}" already captured under ${dup.billNumber}.` };
    }
    if (payload.lines.length === 0 || payload.lines.every(l => l.billedQty <= 0)) {
      return { ok: false, error: 'Add at least one bill line with quantity > 0.' };
    }

    const taxType = payload.taxType ?? 'CGST_SGST';
    const totals = computeGstTotals({
      lines: payload.lines.map(l => ({ quantity: l.billedQty, unitPrice: l.unitRate, taxPct: l.taxPct })),
      taxType,
      otherCharges: payload.otherCharges,
    });
    const billId = `bill-${Date.now()}`;
    const billNumber = nextSequentialNumber(
      `BILL-${payload.billDate.slice(0, 4)}`,
      state.supplierBills.map(b => b.billNumber),
      3,
      1,
    );
    const spo = payload.spoId ? state.supplierPos.find(p => p.id === payload.spoId) : undefined;
    const grnIds = payload.grnIds ?? [];
    const linkedGrns = state.grns.filter(g => grnIds.includes(g.id));

    const billLines: SupplierBillLine[] = payload.lines
      .filter(l => l.billedQty > 0)
      .map((l, idx) => {
        const calc = totals.computedLines[idx];
        return {
          id: `${billId}-l${idx + 1}`,
          billId,
          spoLineId: l.spoLineId,
          materialItemId: l.materialItemId,
          materialCode: l.materialCode,
          description: l.description,
          hsnSac: l.hsnSac ?? '7208',
          billedQty: l.billedQty,
          uom: l.uom,
          unitRate: l.unitRate,
          taxPct: l.taxPct,
          taxAmount: calc.tax,
          lineTotal: calc.lineTotal,
        };
      });

    const match = computeThreeWayMatch({
      bill: { spoId: payload.spoId, grnIds, supplierId: payload.supplierId },
      billLines,
      spo,
      spoLines: state.supplierPoLines,
      grns: state.grns,
      lots: state.lots,
      inspections: state.inspections,
    });

    const initialStatus: SupplierBill['status'] = match.overallStatus === 'matched'
      ? (totals.totalAmount > 100000 ? 'pending_approval' : 'matched')
      : match.overallStatus === 'qc_pending' || match.overallStatus === 'missing_grn'
        ? 'on_hold'
        : 'pending_approval';

    const now = new Date().toISOString();
    const bill: SupplierBill = {
      id: billId,
      billNumber,
      supplierInvoiceNo: payload.supplierInvoiceNo.trim(),
      supplierId: supplier.id,
      supplierName: supplier.tradingName,
      spoId: spo?.id,
      spoNumber: spo?.poNumber,
      grnIds,
      grnNumbers: linkedGrns.map(g => g.grnNumber),
      billDate: payload.billDate,
      receivedDate: payload.receivedDate ?? now.slice(0, 10),
      dueDate: payload.dueDate,
      paymentTerms: payload.paymentTerms ?? spo?.paymentTerms ?? supplier.paymentTerms,
      currency: supplier.currency || 'INR',
      status: initialStatus,
      matchStatus: match.overallStatus,
      taxType,
      subtotal: totals.subtotal,
      taxAmount: totals.taxAmount,
      cgstAmount: totals.cgstAmount,
      sgstAmount: totals.sgstAmount,
      igstAmount: totals.igstAmount,
      otherCharges: payload.otherCharges ?? 0,
      totalAmount: totals.totalAmount,
      paidAmount: 0,
      outstandingAmount: totals.totalAmount,
      mismatchNotes: payload.mismatchNotes || (match.hasMismatch ? match.summaryText : undefined),
      holdReason: initialStatus === 'on_hold' ? match.summaryText : undefined,
      createdBy: state.currentUser.name,
      notes: payload.notes,
      isSimulated: true,
    };

    const approvalReq: ApprovalRequest | undefined = initialStatus === 'pending_approval' ? {
      id: `apr-bill-${billId}`,
      requestType: match.hasMismatch ? 'Supplier Bill Variance Approval' : 'Supplier Bill Approval',
      entityRef: billNumber,
      entityId: billId,
      description: `${billNumber} (${supplier.tradingName}, ₹${totals.totalAmount.toLocaleString('en-IN')}) — ${match.summaryText}`,
      requestedBy: state.currentUser.name,
      requestedAt: now,
      status: 'pending',
      thresholdValue: 100000,
      currentValue: totals.totalAmount,
      approvalCycle: 1,
    } : undefined;

    set(s => ({
      supplierBills: [bill, ...s.supplierBills],
      supplierBillLines: [...s.supplierBillLines, ...billLines],
      ...(approvalReq ? { approvalRequests: [approvalReq, ...s.approvalRequests] } : {}),
      auditEvents: [...s.auditEvents, createAuditEventRecord({
        actor: s.currentUser.name, actorId: s.currentUser.id, role: s.currentUser.role,
        scope: 'SupplierBill', action: 'submit', entityId: billId, entityRef: billNumber, timestamp: now,
        description: `Recorded Supplier Bill ${billNumber} (Vendor Inv: ${bill.supplierInvoiceNo}, ₹${bill.totalAmount.toLocaleString('en-IN')}). 3-Way Match: ${match.overallStatus.replace(/_/g, ' ')}.`,
        reason: bill.mismatchNotes,
        relatedEntityType: spo ? 'SupplierPO' : undefined,
        relatedEntityId: spo?.id,
        relatedEntityRef: spo?.poNumber,
      })],
    }));
    get().showToast({
      type: match.hasMismatch ? 'warning' : 'success',
      title: `Supplier Bill ${billNumber} captured`,
      body: match.summaryText,
    });
    return { ok: true, bill };
  },

  approveSupplierBill: (billId, notes) => {
    const state = get();
    const bill = state.supplierBills.find(b => b.id === billId);
    if (!bill) return { ok: false, error: 'Supplier bill not found.' };
    if (['paid', 'rejected', 'void'].includes(bill.status)) return { ok: false, error: `Cannot approve a bill in status ${bill.status}.` };
    const now = new Date().toISOString();
    const nextStatus: SupplierBill['status'] = bill.paidAmount > 0 ? 'partially_paid' : 'approved';
    set(s => ({
      supplierBills: s.supplierBills.map(b => b.id === billId ? {
        ...b,
        status: nextStatus,
        holdReason: undefined,
        approvedBy: s.currentUser.name,
        approvedAt: now,
        notes: notes?.trim() ? `${b.notes ? `${b.notes}\n` : ''}Approval note: ${notes.trim()}` : b.notes,
      } : b),
      approvalRequests: s.approvalRequests.map(ar => ar.entityId === billId && ar.status === 'pending'
        ? { ...ar, status: 'approved' as const, decidedBy: s.currentUser.name, decidedAt: now, decisionNotes: notes }
        : ar),
      auditEvents: [...s.auditEvents, createAuditEventRecord({
        actor: s.currentUser.name, actorId: s.currentUser.id, role: s.currentUser.role,
        scope: 'SupplierBill', action: 'approve', entityId: billId, entityRef: bill.billNumber, timestamp: now,
        description: `Approved Supplier Bill ${bill.billNumber} (₹${bill.totalAmount.toLocaleString('en-IN')}) for payment.`,
        before: { status: bill.status }, after: { status: nextStatus, approvedBy: s.currentUser.name },
        reason: notes?.trim() || (bill.matchStatus !== 'matched' ? `Approved with variance (${bill.matchStatus.replace(/_/g, ' ')})` : undefined),
      })],
    }));
    get().showToast({ type: 'success', title: `Supplier Bill ${bill.billNumber} approved for payment` });
    return { ok: true };
  },

  holdOrDisputeSupplierBill: (billId, status, reason) => {
    const state = get();
    const bill = state.supplierBills.find(b => b.id === billId);
    if (!bill) return { ok: false, error: 'Supplier bill not found.' };
    if (!reason.trim()) return { ok: false, error: 'Please specify a reason for hold/dispute.' };
    const now = new Date().toISOString();
    set(s => ({
      supplierBills: s.supplierBills.map(b => b.id === billId ? { ...b, status, holdReason: reason.trim() } : b),
      auditEvents: [...s.auditEvents, createAuditEventRecord({
        actor: s.currentUser.name, actorId: s.currentUser.id, role: s.currentUser.role,
        scope: 'SupplierBill', action: status === 'on_hold' ? 'hold' : 'dispute',
        entityId: billId, entityRef: bill.billNumber, timestamp: now,
        description: `Marked Supplier Bill ${bill.billNumber} as ${status === 'on_hold' ? 'On Hold' : 'Disputed'}.`,
        before: { status: bill.status }, after: { status, holdReason: reason.trim() },
        reason: reason.trim(),
      })],
    }));
    get().showToast({ type: 'warning', title: `Bill ${bill.billNumber} placed ${status === 'on_hold' ? 'on hold' : 'under dispute'}` });
    return { ok: true };
  },

  rejectSupplierBill: (billId, reason) => {
    const state = get();
    const bill = state.supplierBills.find(b => b.id === billId);
    if (!bill) return { ok: false, error: 'Supplier bill not found.' };
    if (!reason.trim()) return { ok: false, error: 'Rejection reason is required.' };
    if (bill.paidAmount > 0) return { ok: false, error: 'Cannot reject a bill that already has payments allocated. Reverse payments first.' };
    const now = new Date().toISOString();
    set(s => ({
      supplierBills: s.supplierBills.map(b => b.id === billId ? {
        ...b, status: 'rejected' as const, outstandingAmount: 0, rejectionReason: reason.trim(),
      } : b),
      approvalRequests: s.approvalRequests.map(ar => ar.entityId === billId && ar.status === 'pending'
        ? { ...ar, status: 'rejected' as const, decidedBy: s.currentUser.name, decidedAt: now, decisionNotes: reason.trim() }
        : ar),
      auditEvents: [...s.auditEvents, createAuditEventRecord({
        actor: s.currentUser.name, actorId: s.currentUser.id, role: s.currentUser.role,
        scope: 'SupplierBill', action: 'reject', entityId: billId, entityRef: bill.billNumber, timestamp: now,
        description: `Rejected Supplier Bill ${bill.billNumber}.`,
        before: { status: bill.status, outstandingAmount: bill.outstandingAmount },
        after: { status: 'rejected', outstandingAmount: 0 },
        reason: reason.trim(),
      })],
    }));
    get().showToast({ type: 'info', title: `Supplier Bill ${bill.billNumber} rejected` });
    return { ok: true };
  },

  recordSupplierPayment: (payload) => {
    const state = get();
    const supplier = state.suppliers.find(sp => sp.id === payload.supplierId);
    if (!supplier) return { ok: false, error: 'Supplier not found.' };
    if (!(payload.amount > 0)) return { ok: false, error: 'Payment amount must be greater than zero.' };
    const allocs = (payload.allocations ?? []).filter(a => a.amount > 0);
    const totalAllocated = allocs.reduce((s, a) => s + a.amount, 0);
    if (totalAllocated > payload.amount) return { ok: false, error: 'Total allocated amount exceeds payment amount.' };

    for (const a of allocs) {
      const bill = state.supplierBills.find(b => b.id === a.billId);
      if (!bill) return { ok: false, error: `Supplier Bill ${a.billId} not found.` };
      if (['rejected', 'void', 'on_hold', 'disputed'].includes(bill.status)) {
        return { ok: false, error: `Bill ${bill.billNumber} is ${bill.status.replace(/_/g, ' ')} and cannot be paid until resolved/approved.` };
      }
      if (a.amount > bill.outstandingAmount) {
        return { ok: false, error: `Payment ₹${a.amount.toLocaleString('en-IN')} exceeds outstanding ₹${bill.outstandingAmount.toLocaleString('en-IN')} on ${bill.billNumber}.` };
      }
    }

    const now = new Date().toISOString();
    const payId = `spay-${Date.now()}`;
    const paymentNumber = nextSequentialNumber(
      `SPAY-${payload.paymentDate.slice(0, 4)}`,
      state.supplierPayments.map(p => p.paymentNumber),
      3,
      1,
    );
    const unallocated = Math.max(0, payload.amount - totalAllocated);
    const status: SupplierPayment['status'] = totalAllocated === 0 ? 'recorded' : unallocated > 0 ? 'partially_allocated' : 'allocated';

    const payment: SupplierPayment = {
      id: payId,
      paymentNumber,
      supplierId: supplier.id,
      supplierName: supplier.tradingName,
      paymentDate: payload.paymentDate,
      currency: supplier.currency || 'INR',
      amount: payload.amount,
      paymentMethod: payload.paymentMethod,
      transactionRef: payload.transactionRef.trim() || `SIM-${paymentNumber}`,
      payingAccount: payload.payingAccount || 'Apex Precision — HDFC 50200012345',
      status,
      allocatedAmount: totalAllocated,
      unallocatedAmount: unallocated,
      isAdvance: payload.isAdvance || totalAllocated === 0,
      notes: payload.notes,
      createdBy: state.currentUser.name,
      isSimulated: true,
    };

    const newAllocs: SupplierPaymentAllocation[] = allocs.map((a, idx) => {
      const bill = state.supplierBills.find(b => b.id === a.billId)!;
      return {
        id: `spa-${Date.now()}-${idx + 1}`,
        paymentId: payId,
        paymentNumber,
        billId: bill.id,
        billNumber: bill.billNumber,
        supplierInvoiceNo: bill.supplierInvoiceNo,
        supplierId: supplier.id,
        allocatedAmount: a.amount,
        allocatedDate: payload.paymentDate,
        allocatedBy: state.currentUser.name,
        notes: a.notes,
      };
    });

    const newEvents: AuditEvent[] = [
      createAuditEventRecord({
        actor: state.currentUser.name, actorId: state.currentUser.id, role: state.currentUser.role,
        scope: 'SupplierPayment', action: 'payment_recorded', entityId: payId, entityRef: paymentNumber, timestamp: now,
        description: `Recorded simulated outward supplier payment ${paymentNumber} of ₹${payload.amount.toLocaleString('en-IN')} to ${supplier.tradingName} (${payload.paymentMethod.toUpperCase()} · ${payment.transactionRef}).`,
        relatedEntityType: 'Supplier', relatedEntityId: supplier.id, relatedEntityRef: supplier.tradingName,
      }),
    ];

    set(s => {
      const supplierBills = s.supplierBills.map(bill => {
        const alloc = allocs.find(a => a.billId === bill.id);
        if (!alloc) return bill;
        const paidAmount = bill.paidAmount + alloc.amount;
        const outstandingAmount = Math.max(0, bill.totalAmount - paidAmount);
        const billStatus: SupplierBill['status'] = outstandingAmount === 0 ? 'paid' : 'partially_paid';
        newEvents.push(createAuditEventRecord({
          actor: s.currentUser.name, actorId: s.currentUser.id, role: s.currentUser.role,
          scope: 'SupplierBill', action: 'allocate', entityId: bill.id, entityRef: bill.billNumber, timestamp: now,
          description: `Allocated supplier payment ${paymentNumber} (₹${alloc.amount.toLocaleString('en-IN')}) to ${bill.billNumber}.`,
          before: { paidAmount: bill.paidAmount, outstandingAmount: bill.outstandingAmount, status: bill.status },
          after: { paidAmount, outstandingAmount, status: billStatus },
          relatedEntityType: 'SupplierPayment', relatedEntityId: payId, relatedEntityRef: paymentNumber,
        }));
        return { ...bill, paidAmount, outstandingAmount, status: billStatus };
      });
      return {
        supplierPayments: [payment, ...s.supplierPayments],
        supplierPaymentAllocations: [...newAllocs, ...s.supplierPaymentAllocations],
        supplierBills,
        auditEvents: [...s.auditEvents, ...newEvents],
      };
    });

    get().showToast({ type: 'success', title: `Supplier Payment ${paymentNumber} recorded` });
    return { ok: true, payment };
  },

  allocateSupplierPayment: (paymentId, allocations) => {
    const state = get();
    const pay = state.supplierPayments.find(p => p.id === paymentId);
    if (!pay) return { ok: false, error: 'Supplier payment not found.' };
    if (pay.status === 'reversed') return { ok: false, error: 'Cannot allocate a reversed payment.' };
    const validAllocs = allocations.filter(a => a.amount > 0);
    if (validAllocs.length === 0) return { ok: false, error: 'Enter at least one positive allocation amount.' };
    const addTotal = validAllocs.reduce((s, a) => s + a.amount, 0);
    if (addTotal > pay.unallocatedAmount) return { ok: false, error: `Allocation ₹${addTotal.toLocaleString('en-IN')} exceeds unallocated balance.` };

    for (const a of validAllocs) {
      const bill = state.supplierBills.find(b => b.id === a.billId);
      if (!bill || ['rejected', 'void', 'on_hold', 'disputed'].includes(bill.status) || a.amount > bill.outstandingAmount) {
        return { ok: false, error: `Bill ${bill?.billNumber ?? a.billId} is not eligible for ₹${a.amount.toLocaleString('en-IN')} allocation.` };
      }
    }

    const now = new Date().toISOString();
    const today = now.slice(0, 10);
    const createdAllocs: SupplierPaymentAllocation[] = validAllocs.map((a, idx) => {
      const bill = state.supplierBills.find(b => b.id === a.billId)!;
      return {
        id: `spa-${Date.now()}-${idx + 1}`,
        paymentId: pay.id,
        paymentNumber: pay.paymentNumber,
        billId: bill.id,
        billNumber: bill.billNumber,
        supplierInvoiceNo: bill.supplierInvoiceNo,
        supplierId: pay.supplierId,
        allocatedAmount: a.amount,
        allocatedDate: today,
        allocatedBy: state.currentUser.name,
        notes: a.notes,
      };
    });

    set(s => {
      const extraEvents: AuditEvent[] = [];
      const nextAllocated = pay.allocatedAmount + addTotal;
      const nextUnallocated = Math.max(0, pay.amount - nextAllocated);
      const nextPayStatus: SupplierPayment['status'] = nextUnallocated === 0 ? 'allocated' : 'partially_allocated';
      const supplierBills = s.supplierBills.map(bill => {
        const a = validAllocs.find(x => x.billId === bill.id);
        if (!a) return bill;
        const paidAmount = bill.paidAmount + a.amount;
        const outstandingAmount = Math.max(0, bill.totalAmount - paidAmount);
        const status: SupplierBill['status'] = outstandingAmount === 0 ? 'paid' : 'partially_paid';
        extraEvents.push(createAuditEventRecord({
          actor: s.currentUser.name, actorId: s.currentUser.id, role: s.currentUser.role,
          scope: 'SupplierBill', action: 'allocate', entityId: bill.id, entityRef: bill.billNumber, timestamp: now,
          description: `Allocated ₹${a.amount.toLocaleString('en-IN')} from advance/payment ${pay.paymentNumber}.`,
          before: { paidAmount: bill.paidAmount, outstandingAmount: bill.outstandingAmount, status: bill.status },
          after: { paidAmount, outstandingAmount, status },
          relatedEntityType: 'SupplierPayment', relatedEntityId: pay.id, relatedEntityRef: pay.paymentNumber,
        }));
        return { ...bill, paidAmount, outstandingAmount, status };
      });
      extraEvents.push(createAuditEventRecord({
        actor: s.currentUser.name, actorId: s.currentUser.id, role: s.currentUser.role,
        scope: 'SupplierPayment', action: 'allocate', entityId: pay.id, entityRef: pay.paymentNumber, timestamp: now,
        description: `Allocated ₹${addTotal.toLocaleString('en-IN')} across ${validAllocs.length} supplier bill(s).`,
        before: { allocatedAmount: pay.allocatedAmount, unallocatedAmount: pay.unallocatedAmount, status: pay.status },
        after: { allocatedAmount: nextAllocated, unallocatedAmount: nextUnallocated, status: nextPayStatus },
      }));
      return {
        supplierPayments: s.supplierPayments.map(p => p.id === pay.id ? { ...p, allocatedAmount: nextAllocated, unallocatedAmount: nextUnallocated, status: nextPayStatus } : p),
        supplierPaymentAllocations: [...createdAllocs, ...s.supplierPaymentAllocations],
        supplierBills,
        auditEvents: [...s.auditEvents, ...extraEvents],
      };
    });
    get().showToast({ type: 'success', title: `Allocated ₹${addTotal.toLocaleString('en-IN')} from ${pay.paymentNumber}` });
    return { ok: true };
  },

  reverseSupplierPayment: (paymentId, reason) => {
    const state = get();
    const pay = state.supplierPayments.find(p => p.id === paymentId);
    if (!pay) return { ok: false, error: 'Supplier payment not found.' };
    if (pay.status === 'reversed') return { ok: false, error: 'Payment is already reversed.' };
    if (!reason.trim()) return { ok: false, error: 'Reversal reason is required.' };
    const now = new Date().toISOString();
    const linkedAllocs = state.supplierPaymentAllocations.filter(spa => spa.paymentId === paymentId);

    set(s => {
      const extraEvents: AuditEvent[] = [];
      const supplierBills = s.supplierBills.map(bill => {
        const revAmt = linkedAllocs.filter(a => a.billId === bill.id).reduce((sum, a) => sum + a.allocatedAmount, 0);
        if (revAmt <= 0) return bill;
        const paidAmount = Math.max(0, bill.paidAmount - revAmt);
        const outstandingAmount = Math.max(0, bill.totalAmount - paidAmount);
        const status: SupplierBill['status'] = paidAmount > 0 ? 'partially_paid' : (new Date(bill.dueDate) < new Date(now.slice(0, 10)) ? 'overdue' : 'approved');
        extraEvents.push(createAuditEventRecord({
          actor: s.currentUser.name, actorId: s.currentUser.id, role: s.currentUser.role,
          scope: 'SupplierBill', action: 'deallocate', entityId: bill.id, entityRef: bill.billNumber, timestamp: now,
          description: `Reversed ₹${revAmt.toLocaleString('en-IN')} payment allocation after ${pay.paymentNumber} was reversed.`,
          before: { paidAmount: bill.paidAmount, outstandingAmount: bill.outstandingAmount, status: bill.status },
          after: { paidAmount, outstandingAmount, status },
          reason: reason.trim(),
          relatedEntityType: 'SupplierPayment', relatedEntityId: pay.id, relatedEntityRef: pay.paymentNumber,
        }));
        return { ...bill, paidAmount, outstandingAmount, status };
      });
      extraEvents.push(createAuditEventRecord({
        actor: s.currentUser.name, actorId: s.currentUser.id, role: s.currentUser.role,
        scope: 'SupplierPayment', action: 'reverse', entityId: pay.id, entityRef: pay.paymentNumber, timestamp: now,
        description: `Reversed Supplier Payment ${pay.paymentNumber} (₹${pay.amount.toLocaleString('en-IN')}).`,
        before: { status: pay.status, allocatedAmount: pay.allocatedAmount },
        after: { status: 'reversed', allocatedAmount: 0 },
        reason: reason.trim(),
      }));
      return {
        supplierPayments: s.supplierPayments.map(p => p.id === paymentId ? {
          ...p, status: 'reversed' as const, allocatedAmount: 0, unallocatedAmount: 0, reversedReason: reason.trim(), reversedAt: now, reversedBy: s.currentUser.name,
        } : p),
        supplierPaymentAllocations: s.supplierPaymentAllocations.filter(a => a.paymentId !== paymentId),
        supplierBills,
        auditEvents: [...s.auditEvents, ...extraEvents],
      };
    });
    get().showToast({ type: 'warning', title: `Supplier payment ${pay.paymentNumber} reversed` });
    return { ok: true };
  },

  // ── Update / Soft-delete Actions ──
  updateCustomerPo: (id, partial) => set(s => {
    const current = s.customerPos.find(p => p.id === id);
    if (!current) return s;
    const commercialChange = ['totalValue', 'paymentTerms', 'deliveryTerms', 'poNumber'].some(key => key in partial);
    if (current.commercialLocked && commercialChange) return s;
    const safePartial = { ...partial, poNumber: current.poNumber };
    const next = { ...current, ...safePartial };
    const changes = diffRecordFields(current as unknown as Record<string, unknown>, next as unknown as Record<string, unknown>);
    return {
      customerPos: s.customerPos.map(p => p.id === id ? next : p),
      auditEvents: changes.length > 0 ? [...s.auditEvents, createAuditEventRecord({
        actor: s.currentUser.name, actorId: s.currentUser.id, role: s.currentUser.role,
        scope: 'CustomerPO', action: 'update', entityId: id, entityRef: current.poNumber,
        description: `Updated Customer PO ${current.poNumber}.`,
        changes, before: current as unknown as Record<string, unknown>, after: next as unknown as Record<string, unknown>,
      })] : s.auditEvents,
    };
  }),
  updateCustomer: (id, partial) => set(s => {
    const existing = s.customers.find(c => c.id === id);
    if (!existing) return s;
    const next = { ...existing, ...partial };
    const changes = diffRecordFields(existing as unknown as Record<string, unknown>, next as unknown as Record<string, unknown>);
    return {
      customers: s.customers.map(c => c.id === id ? next : c),
      auditEvents: [...s.auditEvents, createAuditEventRecord({
        actor: s.currentUser.name, actorId: s.currentUser.id, role: s.currentUser.role,
        scope: 'Customer', action: 'update', entityId: id, entityRef: existing.tradingName,
        description: `Updated Customer master record for ${existing.tradingName}.`,
        changes,
      })],
    };
  }),
  addCustomer: (customer) => set(s => ({
    customers: [customer, ...s.customers],
    auditEvents: [...s.auditEvents, createAuditEventRecord({
      actor: s.currentUser.name, actorId: s.currentUser.id, role: s.currentUser.role,
      scope: 'Customer', action: 'create', entityId: customer.id, entityRef: customer.tradingName,
      description: `Created Customer "${customer.tradingName}" (${customer.city}, ${customer.state}).`,
    })],
  })),
  updateSupplier: (id, partial) => set(s => {
    const existing = s.suppliers.find(sup => sup.id === id);
    if (!existing) return s;
    const next = { ...existing, ...partial };
    const changes = diffRecordFields(existing as unknown as Record<string, unknown>, next as unknown as Record<string, unknown>);
    return {
      suppliers: s.suppliers.map(supplier => supplier.id === id ? next : supplier),
      auditEvents: [...s.auditEvents, createAuditEventRecord({
        actor: s.currentUser.name, actorId: s.currentUser.id, role: s.currentUser.role,
        scope: 'Supplier', action: 'update', entityId: id, entityRef: existing.tradingName,
        description: `Updated Supplier master record for ${existing.tradingName}.`,
        changes,
      })],
    };
  }),
  addSupplier: (supplier) => set(s => ({
    suppliers: [supplier, ...s.suppliers],
    auditEvents: [...s.auditEvents, createAuditEventRecord({
      actor: s.currentUser.name, actorId: s.currentUser.id, role: s.currentUser.role,
      scope: 'Supplier', action: 'create', entityId: supplier.id, entityRef: supplier.tradingName,
      description: `Onboarded Supplier "${supplier.tradingName}" (${supplier.city}, ${supplier.state}).`,
    })],
  })),
  updateRfq: (id, partial) => set(s => {
    const existing = s.rfqs.find(r => r.id === id);
    if (!existing) return s;
    const next = { ...existing, ...partial };
    const changes = diffRecordFields(existing as unknown as Record<string, unknown>, next as unknown as Record<string, unknown>);
    return {
      rfqs: s.rfqs.map(r => r.id === id ? next : r),
      auditEvents: changes.length > 0 ? [...s.auditEvents, createAuditEventRecord({
        actor: s.currentUser.name, actorId: s.currentUser.id, role: s.currentUser.role,
        scope: 'CustomerRFQ', action: 'update', entityId: id, entityRef: existing.rfqNumber,
        description: `Updated Customer RFQ ${existing.rfqNumber}.`,
        changes,
      })] : s.auditEvents,
    };
  }),
  updateSupplierPo: (id, partial) => set(s => {
    const existing = s.supplierPos.find(p => p.id === id);
    if (!existing) return s;
    const next = { ...existing, ...partial };
    const changes = diffRecordFields(existing as unknown as Record<string, unknown>, next as unknown as Record<string, unknown>);
    return {
      supplierPos: s.supplierPos.map(p => p.id === id ? next : p),
      auditEvents: changes.length > 0 ? [...s.auditEvents, createAuditEventRecord({
        actor: s.currentUser.name, actorId: s.currentUser.id, role: s.currentUser.role,
        scope: 'SupplierPO', action: 'update', entityId: id, entityRef: existing.poNumber,
        description: `Updated Supplier PO ${existing.poNumber}.`,
        changes,
      })] : s.auditEvents,
    };
  }),
  updateJob: (id, partial) => set(s => {
    const current = s.jobs.find(j => j.id === id);
    if (!current) return s;
    const next = { ...current, ...partial };
    const changes = diffRecordFields(current as unknown as Record<string, unknown>, next as unknown as Record<string, unknown>);
    return {
      jobs: s.jobs.map(j => j.id === id ? next : j),
      auditEvents: changes.length > 0 ? [...s.auditEvents, createAuditEventRecord({
        actor: s.currentUser.name, actorId: s.currentUser.id, role: s.currentUser.role,
        scope: 'Job', action: 'update', entityId: id, entityRef: current.jobNumber,
        description: `Updated Job ${current.jobNumber}.`,
        changes,
      })] : s.auditEvents,
    };
  }),
  cancelJob: (id, reason, by, disposition) => {
    set(s => {
      const job = s.jobs.find(j => j.id === id);
      if (!job || job.status === 'complete' || job.status === 'cancelled' || !reason.trim()) return s;
      const requirements = s.jobMaterialReqs.filter(r => r.jobId === id);
      const issued = requirements.reduce((sum, r) => sum + r.issuedQty, 0);
      const releasable = requirements.reduce((sum, r) => sum + Math.max(0, r.reservedQty - r.issuedQty), 0);
      const siteLocationIds = new Set(s.storeLocations.filter(l => l.siteId === job.siteId).map(l => l.id));
      const inventory = s.inventory.map(item => {
        const req = requirements.find(r => r.materialItemId === item.materialItemId);
        if (!req || !siteLocationIds.has(item.locationId)) return item;
        const release = Math.max(0, req.reservedQty - req.issuedQty);
        return release > 0 ? { ...item, reservedQty: Math.max(0, item.reservedQty - release), availableQty: item.availableQty + release } : item;
      });
      const timestamp = new Date().toISOString();
      const primaryReq = requirements[0];
      const cancellationDisposition: JobCancellationDisposition = {
        reason: reason.trim(),
        materialName: primaryReq?.materialName,
        materialUom: primaryReq?.uom,
        reservedReleasedQty: releasable, issuedQty: issued, consumedQty: issued,
        wip: disposition.wip, finishedGoods: disposition.finishedGoods, recordedAt: timestamp, recordedBy: by,
      };
      const cleanedStages = job.stages.map(st =>
        ['in_progress', 'hold', 'rework'].includes(st.status)
          ? { ...st, status: 'skipped' as const, skipReason: st.skipReason ? `${st.skipReason} (Halted on cancellation)` : 'Halted on job cancellation' }
          : st
      );
      return {
        jobs: s.jobs.map(j => j.id === id ? {
          ...j,
          status: 'cancelled' as const,
          currentStage: 'Cancelled',
          hasBlocker: false,
          stages: cleanedStages,
          cancellationReason: reason.trim(),
          cancelledAt: timestamp,
          cancelledBy: by,
          cancellationDisposition,
        } : j),
        jobBlockers: s.jobBlockers.map(b => b.jobId === id && b.status === 'open' ? { ...b, status: 'resolved' as const, resolvedAt: timestamp } : b),
        inventory,
        jobMaterialReqs: s.jobMaterialReqs.map(r => r.jobId === id ? { ...r, reservedQty: r.issuedQty, shortage: false } : r),
        movements: releasable > 0 ? [...s.movements, ...requirements.filter(r => r.reservedQty > r.issuedQty).map(r => ({
          id: `sm-${Date.now()}-${r.id}`, lotId: r.lotIds[0] ?? '', movementType: 'Reservation-Release' as const,
          primaryQty: Math.max(0, r.reservedQty - r.issuedQty), uom: r.uom, fromLocation: `Reserved for ${job.jobNumber}`,
          toLocation: job.siteName, referenceType: 'Job Cancellation', referenceId: job.id, referenceNumber: job.jobNumber, performedBy: by, timestamp,
        }))] : s.movements,
        auditEvents: [...s.auditEvents, createAuditEventRecord({
          actor: by, actorId: s.currentUser.id, role: s.currentUser.role,
          scope: 'Job', action: 'cancel', entityId: id, entityRef: job.jobNumber, timestamp,
          description: `Cancelled Job ${job.jobNumber}. Reserved unissued stock released.`,
          reason, before: { status: job.status }, after: { status: 'cancelled', releasedQty: releasable },
        })],
      };
    });
    get().showToast({ type: 'success', title: 'Job cancelled', body: 'The job remains in history; reserved but unissued material was released.' });
  },
  updateInspection: (id, partial) => set(s => ({ inspections: s.inspections.map(i => i.id === id ? { ...i, ...partial } : i) })),
  setInspectionStatus: (id, result) => set(s => ({ inspections: s.inspections.map(i => i.id === id ? { ...i, result } : i) })),
  updateNCR: (id, partial) => set(s => ({ ncrs: s.ncrs.map(n => n.id === id ? { ...n, ...partial } : n) })),
  setNCRStatus: (id, status) => set(s => ({ ncrs: s.ncrs.map(n => n.id === id ? { ...n, status } : n) })),
  updateAsset: (id, partial) => {
    const state = get();
    const existing = state.assets.find(a => a.id === id);
    if (!existing) return { ok: false, error: 'Asset not found.' };
    if (partial.status === 'operational') {
      const openBreakdown = state.maintenanceEvents.find(me => me.assetId === id && me.type === 'Breakdown' && me.status !== 'closed');
      if (openBreakdown) {
        const msg = `Cannot mark ${existing.assetCode} operational while breakdown ${openBreakdown.eventNumber} is unresolved.`;
        get().showToast({ type: 'error', title: 'Open Breakdown Exists', body: msg });
        return { ok: false, error: msg };
      }
    }
    const readingChanged = partial.currentReading !== undefined && partial.currentReading !== existing.currentReading;
    const now = new Date().toISOString();
    set(s => {
      const newReadingEntry: MeterReading | undefined = readingChanged ? {
        id: `mr-${Date.now()}`,
        assetId: id,
        assetCode: existing.assetCode,
        previousReading: existing.currentReading ?? 0,
        reading: partial.currentReading!,
        readingDate: now.slice(0, 10),
        recordedByEmployeeId: s.currentUser.id,
        recordedBy: s.currentUser.name,
        readingType: 'routine',
        notes: `Updated via Asset Edit (${existing.currentReading ?? 0} → ${partial.currentReading})`,
      } : undefined;
      const mergedNext = { ...existing, ...partial };
      const changes = diffRecordFields(
        existing as unknown as Record<string, unknown>,
        mergedNext as unknown as Record<string, unknown>,
      );
      return {
        assets: s.assets.map(a => a.id === id ? mergedNext : a),
        meterReadings: newReadingEntry ? [...s.meterReadings, newReadingEntry] : s.meterReadings,
        auditEvents: changes.length > 0 ? [...s.auditEvents, createAuditEventRecord({
          actor: s.currentUser.name, actorId: s.currentUser.id, role: s.currentUser.role,
          scope: 'Asset', action: 'update', entityId: id, entityRef: existing.assetCode, timestamp: now,
          description: `Updated Asset ${existing.assetCode} (${changes.map(c => c.label).join(', ')}).`,
          changes,
        })] : s.auditEvents,
      };
    });
    return { ok: true };
  },
  updateEmployee: (id, partial) => set(s => ({ employees: s.employees.map(e => e.id === id ? { ...e, ...partial } : e) })),

  // ── Onboarding Actions ──
  updateOnboarding: (partial) => set(s => ({ onboarding: { ...s.onboarding, ...partial } })),
  completeOnboarding: () => set({ onboarding: { status: 'complete', completedSteps: [1, 2, 3, 4, 5, 6, 7] } }),
  resetOnboarding: () => set({ onboarding: { status: 'not_started', completedSteps: [] } }),
  updateCompanyConfig: (partial) => set(s => {
    const prev = s.companyConfig as unknown as Record<string, unknown>;
    const next = { ...s.companyConfig, ...partial };
    const changes = diffRecordFields(prev, next as unknown as Record<string, unknown>);
    return {
      companyConfig: next,
      auditEvents: changes.length > 0 ? [...s.auditEvents, createAuditEventRecord({
        actor: s.currentUser.name, actorId: s.currentUser.id, role: s.currentUser.role,
        scope: 'CompanyConfig', action: 'update', entityId: 'company-config', entityRef: next.companyName,
        description: `Updated company profile / statutory configuration.`,
        changes,
      })] : s.auditEvents,
    };
  }),

  // ── Audit Actions (append-only) ──
  appendAuditEvent: (event) => {
    const id = `ae-${Date.now()}`;
    set(s => ({ auditEvents: [...s.auditEvents, createAuditEventRecord({ ...event, id, role: event.role ?? s.currentUser.role })] }));
  },

  // ── Toast Actions ──
  showToast: (toast) => {
    const id = `toast-${++toastSeq}`;
    set(s => ({ toasts: [...s.toasts, { ...toast, id }] }));
    setTimeout(() => get().removeToast(id), toast.duration ?? 4000);
  },

  removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),

  // ── Demo Data Lifecycle ──
  resetDemoData: () => {
    if (typeof window !== 'undefined') {
      try { sessionStorage.clear(); } catch { /* ignore storage restrictions */ }
      try { localStorage.removeItem('eoss-demo-store'); } catch { /* ignore storage restrictions */ }
    }
    set(() => buildInitialData());
    get().showToast({ type: 'success', title: 'Demo data reset', body: 'Restored the original Apex Precision demonstration scenario.' });
    if (typeof window !== 'undefined' && typeof window.location?.reload === 'function') {
      window.location.reload();
    }
  },
}), {
  name: 'eoss-demo-store',
  storage: createJSONStorage(() => localStorage),
  version: 6,
  migrate: (persistedState, version) => {
    let state = persistedState as Partial<EOSSState>;
    const mergeById = <T extends { id: string }>(existing: T[] = [], additions: T[]) => {
      const seen = new Set(existing.map(x => x.id));
      return [...existing, ...additions.filter(a => !seen.has(a.id))];
    };
    if (version < 2) {
      const lots = (state.lots ?? []).map(lot => lot.id === 'lot-301'
        ? { ...lot, grnId: lot.grnId ?? 'grn-rw-003' }
        : lot.id === 'lot-302'
          ? { ...lot, grnId: lot.grnId ?? 'grn-rw-004' }
          : lot);
      const movementIds = new Set((state.movements ?? []).map(movement => movement.id));
      const traceabilityMovements: StockMovement[] = [
        { id: 'sm-301-receipt', lotId: 'lot-301', movementType: 'Receipt', primaryQty: 320, uom: 'kg', toLocation: 'Raw Material Store', referenceType: 'GRN', referenceId: 'grn-rw-003', referenceNumber: 'GRN-2024-198', performedBy: 'Karthik Raju', timestamp: '2024-10-05T10:00:00', notes: 'Accepted incoming billet linked to historical supplier PO.' },
        { id: 'sm-302-receipt', lotId: 'lot-302', movementType: 'Receipt', primaryQty: 600, uom: 'kg', toLocation: 'Pune Raw Material Store', referenceType: 'GRN', referenceId: 'grn-rw-004', referenceNumber: 'GRN-2024-199', performedBy: 'Karthik Raju', timestamp: '2024-10-12T10:00:00', notes: 'Accepted incoming billet available for approved inter-site transfer.' },
      ];
      const grnIds = new Set((state.grns ?? []).map(grn => grn.id));
      state = {
        ...state,
        lots,
        movements: [...(state.movements ?? []), ...traceabilityMovements.filter(movement => !movementIds.has(movement.id))],
        grns: [...(state.grns ?? []), ...FLAGSHIP_GRNS.filter(grn => ['grn-rw-003', 'grn-rw-004'].includes(grn.id) && !grnIds.has(grn.id))],
      };
    }
    if (version < 3) {
      state = {
        ...state,
        purchaseReqs: mergeById(state.purchaseReqs, DEMO_SCENARIO_PRS),
        supplierInvitations: mergeById(state.supplierInvitations, DEMO_SUPPLIER_INVITATIONS),
        supplierQuotations: mergeById(state.supplierQuotations, DEMO_SUPPLIER_QUOTATIONS),
        supplierPos: mergeById(state.supplierPos, DEMO_SUPPLIER_POS),
        supplierPoLines: mergeById(state.supplierPoLines, DEMO_SUPPLIER_PO_LINES),
        grns: mergeById(state.grns, DEMO_GRNS),
        lots: mergeById(state.lots, DEMO_LOTS),
        inspections: mergeById(state.inspections, DEMO_INSPECTIONS),
        rfqs: mergeById(state.rfqs, DEMO_SALES_RFQS),
        quotations: mergeById(state.quotations, DEMO_CUSTOMER_QUOTATIONS),
        quotationLines: mergeById(state.quotationLines, DEMO_CUSTOMER_QUOTATION_LINES),
        customerPos: mergeById(state.customerPos, DEMO_SALES_POS),
        poLines: mergeById(state.poLines, DEMO_SALES_PO_LINES),
        jobs: mergeById(state.jobs, DEMO_SALES_JOBS),
        jobMaterialReqs: mergeById(state.jobMaterialReqs, DEMO_SALES_JOB_REQS),
        dispatches: mergeById(state.dispatches, DEMO_SALES_DISPATCHES),
        materials: [...MATERIALS],
      };
    }
    if (version < 4) {
      state = {
        ...state,
        invoices: mergeById(state.invoices, SEED_UNIFIED_INVOICES),
        invoiceLines: mergeById(state.invoiceLines, SEED_UNIFIED_INVOICE_LINES),
        payments: mergeById(state.payments, SEED_UNIFIED_PAYMENTS),
        paymentAllocations: mergeById(state.paymentAllocations, SEED_UNIFIED_PAYMENT_ALLOCATIONS),
        supplierBills: mergeById(state.supplierBills, SEED_SUPPLIER_BILLS),
        supplierBillLines: mergeById(state.supplierBillLines, SEED_SUPPLIER_BILL_LINES),
        supplierPayments: mergeById(state.supplierPayments, SEED_SUPPLIER_PAYMENTS),
        supplierPaymentAllocations: mergeById(state.supplierPaymentAllocations, SEED_SUPPLIER_PAYMENT_ALLOCATIONS),
        auditEvents: mergeById(state.auditEvents, SEED_RICH_AUDIT_EVENTS),
      };
    }
    if (version < 5) {
      const fresh = buildInitialData();
      const replaceById = <T extends { id: string }>(existing: T[] = [], replacements: T[]) => {
        const repMap = new Map(replacements.map(r => [r.id, r]));
        const updated = existing.map(item => repMap.get(item.id) ?? item);
        return mergeById(updated, replacements);
      };
      state = {
        ...state,
        inventory: replaceById(state.inventory, fresh.inventory).map(inv => ({
          ...inv,
          qcHoldQty: Math.min(inv.qcHoldQty ?? 0, inv.onHandQty ?? 0),
        })),
        assets: replaceById(state.assets, fresh.assets),
        jobBlockers: replaceById(state.jobBlockers, fresh.jobBlockers),
        purchaseReqs: replaceById(state.purchaseReqs, fresh.purchaseReqs.filter(p => ['pr-demo-10', 'pr-demo-12', 'pr-demo-01'].includes(p.id))),
        jobs: replaceById(state.jobs, fresh.jobs.filter(j => j.id === 'job-demo-cancel')),
        jobMaterialReqs: mergeById(state.jobMaterialReqs, fresh.jobMaterialReqs),
        dispatches: replaceById(state.dispatches, fresh.dispatches.filter(d => d.id === 'dsp-demo-201')),
        invoices: replaceById(state.invoices, fresh.invoices.filter(i => ['cinv-004', 'cinv-005', 'cinv-008'].includes(i.id))),
        invoiceLines: replaceById(state.invoiceLines, fresh.invoiceLines.filter(l => ['invl-c04', 'invl-c05'].includes(l.id))),
        supplierBills: replaceById(state.supplierBills, fresh.supplierBills.filter(b => ['sinv-002', 'bill-demo-rw1'].includes(b.id))),
        inspections: replaceById(state.inspections, fresh.inspections),
      };
    }
    if (version < 6) {
      const fresh = buildInitialData();
      const replaceById = <T extends { id: string }>(existing: T[] = [], replacements: T[]) => {
        const repMap = new Map(replacements.map(r => [r.id, r]));
        const updated = existing.map(item => repMap.get(item.id) ?? item);
        return mergeById(updated, replacements);
      };
      state = {
        ...state,
        companyConfig: fresh.companyConfig,
        jobs: replaceById(state.jobs, fresh.jobs.filter(j => j.id === 'job-demo-partial')),
        poLines: replaceById(state.poLines, fresh.poLines.filter(l => l.id === 'cpol-dc1')),
        jobMaterialReqs: mergeById(state.jobMaterialReqs, fresh.jobMaterialReqs.filter(r => r.id === 'jmr-demo-partial')),
      };
    }
    return state;
  },
  // Theme/sidebar prefs already persist themselves via their own localStorage keys;
  // toasts are transient UI state. Everything else is demo business data.
  partialize: (state) => {
    const { toasts, theme, eossTheme, sidebarCollapsed, ...demoData } = state;
    return demoData;
  },
  onRehydrateStorage: () => (state) => {
    if (!state) return;
    const mergeById = <T extends { id: string }>(existing: T[] = [], additions: T[]) => {
      const seen = new Set(existing.map(x => x.id));
      return [...existing, ...additions.filter(a => !seen.has(a.id))];
    };
    const repairedLots = state.lots.map(lot => lot.id === 'lot-301'
      ? { ...lot, grnId: lot.grnId ?? 'grn-rw-003' }
      : lot.id === 'lot-302'
        ? { ...lot, grnId: lot.grnId ?? 'grn-rw-004' }
        : lot);
    const repairedMovementIds = new Set(state.movements.map(movement => movement.id));
    const repairedMovements: StockMovement[] = [
      { id: 'sm-301-receipt', lotId: 'lot-301', movementType: 'Receipt', primaryQty: 320, uom: 'kg', toLocation: 'Raw Material Store', referenceType: 'GRN', referenceId: 'grn-rw-003', referenceNumber: 'GRN-2024-198', performedBy: 'Karthik Raju', timestamp: '2024-10-05T10:00:00', notes: 'Accepted incoming billet linked to historical supplier PO.' },
      { id: 'sm-302-receipt', lotId: 'lot-302', movementType: 'Receipt', primaryQty: 600, uom: 'kg', toLocation: 'Pune Raw Material Store', referenceType: 'GRN', referenceId: 'grn-rw-004', referenceNumber: 'GRN-2024-199', performedBy: 'Karthik Raju', timestamp: '2024-10-12T10:00:00', notes: 'Accepted incoming billet available for approved inter-site transfer.' },
    ];
    const repairedGrnIds = new Set(state.grns.map(grn => grn.id));
    const repairedInspections = state.inspections.map(inspection => {
      if (inspection.id === 'ins-001') return { ...inspection, subject: inspection.subject ?? 'Incoming SS Sheet 3mm 304L', receivedDate: inspection.receivedDate ?? '2026-10-27' };
      if (inspection.id === 'ins-002') return { ...inspection, subject: inspection.subject ?? 'Incoming MS Plate 12mm', receivedDate: inspection.receivedDate ?? '2026-11-03' };
      if (inspection.id === 'ins-003') return { ...inspection, subject: inspection.subject ?? 'J-105 · Welding', approvedAt: inspection.approvedAt ?? '2026-11-02T16:00:00' };
      if (inspection.id === 'ins-004') return { ...inspection, subject: inspection.subject ?? 'J-103 · Final inspection', approvedAt: inspection.approvedAt ?? '2026-10-22T16:00:00' };
      if (inspection.id === 'ins-201') return { ...inspection, approvedAt: inspection.approvedAt ?? '2024-11-03T16:00:00' };
      if (inspection.id === 'ins-202') return { ...inspection, approvedAt: inspection.approvedAt ?? '2024-11-04T16:00:00' };
      return inspection;
    });
    useStore.setState(stampPlaces({
      ...state,
      lots: repairedLots,
      movements: [...state.movements, ...repairedMovements.filter(movement => !repairedMovementIds.has(movement.id))],
      grns: [...state.grns, ...FLAGSHIP_GRNS.filter(grn => ['grn-rw-003', 'grn-rw-004'].includes(grn.id) && !repairedGrnIds.has(grn.id))],
      inspections: repairedInspections,
      jobUpdates: state.jobUpdates ?? [],
      transfers: state.transfers ?? [],
      materialReturns: state.materialReturns ?? [],
      supplierInvitations: state.supplierInvitations ?? [...DEMO_SUPPLIER_INVITATIONS],
      invoices: mergeById(state.invoices, SEED_UNIFIED_INVOICES),
      invoiceLines: mergeById(state.invoiceLines, SEED_UNIFIED_INVOICE_LINES),
      payments: mergeById(state.payments, SEED_UNIFIED_PAYMENTS),
      paymentAllocations: mergeById(state.paymentAllocations, SEED_UNIFIED_PAYMENT_ALLOCATIONS),
      supplierBills: state.supplierBills ?? [...SEED_SUPPLIER_BILLS],
      supplierBillLines: state.supplierBillLines ?? [...SEED_SUPPLIER_BILL_LINES],
      supplierPayments: state.supplierPayments ?? [...SEED_SUPPLIER_PAYMENTS],
      supplierPaymentAllocations: state.supplierPaymentAllocations ?? [...SEED_SUPPLIER_PAYMENT_ALLOCATIONS],
      inboxMessages: mergeById(state.inboxMessages ?? [], SEED_INBOX_MESSAGES),
      auditEvents: mergeById(state.auditEvents, SEED_RICH_AUDIT_EVENTS),
      jobs: state.jobs.map(j => {
        const template = j.stageTemplateId ? STAGE_TEMPLATES.find(t => t.id === j.stageTemplateId) : STAGE_TEMPLATES.find(t => t.stages.length === j.stages.length) ?? STAGE_TEMPLATES[0];
        return { ...j, stageTemplateId: j.stageTemplateId ?? template?.id, stageTemplateName: j.stageTemplateName && !j.stageTemplateName.toLowerCase().startsWith('custom') ? j.stageTemplateName : template?.name };
      }),
    }));
  },
}));

function lockThemeTransition(root: HTMLElement) {
  root.classList.add('theme-switching');
  window.setTimeout(() => root.classList.remove('theme-switching'), 80);
}

// ── Selectors ──
export const selectJob = (id: string) => (s: EOSSState) => s.jobs.find(j => j.id === id);
export const selectLot = (id: string) => (s: EOSSState) => s.lots.find(l => l.id === id);
export const selectAsset = (id: string) => (s: EOSSState) => s.assets.find(a => a.id === id);
export const selectJobMovements = (jobId: string) => (s: EOSSState) =>
  s.movements.filter(m => m.referenceId === jobId);
export const selectLotMovements = (lotId: string) => (s: EOSSState) =>
  s.movements.filter(m => m.lotId === lotId);

// Re-export seed data needed by components
export {
  DEMO_USERS, SUPPLIERS, SUPPLIER_PO_LINES, JOB_BLOCKERS, PURCHASE_REQS, EMPLOYEES, STORE_LOCATIONS,
  SUPPLIER_QUOTATIONS, AUDIT_EVENTS, APPROVAL_POLICIES,
  FINISHED_PRODUCTS, FLAGSHIP_SITE_ALLOCATIONS, FLAGSHIP_INVOICES, FLAGSHIP_PAYMENTS,
  FLAGSHIP_PAYMENT_ALLOCATIONS, COLLECTION_ACTIVITIES, SITES, FLAGSHIP_QUOTATION, FLAGSHIP_RFQ,
  FLAGSHIP_GRNS, FLAGSHIP_PURCHASE_REQS,
};
export const CUSTOMERS = [...CUSTOMERS_BASE, GERMAN_CUSTOMER];
export { FLAGSHIP_PO_LINES, FLAGSHIP_QUOTATION_LINES } from '../data/seed';
export const selectInspectionTemplate = (id: string) => (s: EOSSState) => s.inspectionTemplates.find(t => t.id === id);
export const selectStageTemplate = (id: string) => (s: EOSSState) => s.stageTemplates.find(t => t.id === id);
