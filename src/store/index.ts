import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  DemoUser, RoleKey, Job, JobStage, JobUpdate, MaterialLot,
  InventoryItem, StockMovement, Asset, MaintenanceEvent,
  Dispatch, VaultDocument, ApprovalRequest, AppNotification,
  PulseException, CustomerPO, SupplierPO, CustomerRFQ, GoodsReceipt,
  Inspection, NCR, MaterialCertificate, Employee, StoreLocation,
  SupplierQuotation, AuditEvent, ApprovalPolicy,
  CustomerInvoice, SupplierInvoice, PaymentRecord, OnboardingState,
  Invoice, InvoiceLine, Payment, PaymentAllocation, CollectionActivity,
  FinishedProduct, SiteAllocation, CustomerQuotation, CustomerQuotationLine, POLine,
  PurchaseRequisition, Site, MaterialItem, InventoryTransfer, MaterialReturn, JobCancellationDisposition,
  MeterReading, QualityRelease, InspectionTemplate, StageTemplate,
  JobMaterialReq, JobBlocker, SupplierPOLine, POAmendment
  , Party
} from '../types';
import { stampPlaces } from '../domain/places';
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

  // Asset actions
  setAssetStatus: (assetId: string, status: Asset['status']) => void;
  addMaintenanceEvent: (event: MaintenanceEvent) => void;
  closeMaintenanceEvent: (eventId: string, diagnosis: string, workDone: string) => void;

  // Procurement actions
  addPurchaseReq: (pr: PurchaseRequisition) => void;
  updatePurchaseReq: (id: string, partial: Partial<PurchaseRequisition>) => void;
  setSupplierPoStatus: (spoId: string, status: SupplierPO['status']) => void;
  addPoAmendment: (amendment: POAmendment) => void;
  resolvePoAmendment: (amendmentId: string, resolution: 'approved' | 'rejected', by: string) => void;

  // Approval actions
  resolveApproval: (aprId: string, resolution: 'approved' | 'rejected', by: string, notes?: string) => void;
  addApprovalRequest: (request: ApprovalRequest) => void;

  // Document actions
  addDocument: (doc: VaultDocument) => void;
  updateCertStatus: (certId: string, status: MaterialCertificate['verificationStatus']) => void;
  addDocumentVersion: (previousDocId: string, newDoc: VaultDocument) => void;

  // Dispatch actions
  setDispatchStatus: (dspId: string, status: Dispatch['status']) => void;
  addDispatch: (dispatch: Dispatch) => void;
  recordPoD: (dspId: string) => void;

  // NCR actions
  addNCR: (ncr: NCR) => void;
  closeNCR: (ncrId: string, resolution: string) => void;
  linkNCRToInspection: (inspectionId: string, ncrId: string, ncrNumber: string) => void;

  // Supplier Quotation actions
  addSupplierQuotation: (quote: SupplierQuotation) => void;
  selectQuotation: (quoteId: string) => void;

  // Sales actions
  addRfq: (rfq: CustomerRFQ) => void;
  addQuotation: (q: CustomerQuotation, lines: CustomerQuotationLine[]) => void;
  updateQuotation: (id: string, partial: Partial<CustomerQuotation>) => void;
  convertQuotationToPO: (quotationId: string, po: CustomerPO, poLines: POLine[]) => void;
  addCustomerPO: (po: CustomerPO) => void;
  addSupplierPO: (po: SupplierPO) => void;
  addGRN: (grn: GoodsReceipt) => void;
  acceptGRN: (grnId: string, by: string) => void;
  addJob: (job: Job) => void;
  addInspection: (ins: Inspection) => void;
  addDispatchRecord: (d: Dispatch) => void;

  // Finance state (legacy types)
  customerInvoices: CustomerInvoice[];
  supplierInvoices: SupplierInvoice[];
  paymentRecords: PaymentRecord[];
  // Finance state (rich flagship types)
  invoices: Invoice[];
  invoiceLines: InvoiceLine[];
  payments: Payment[];
  paymentAllocations: PaymentAllocation[];
  collectionActivities: CollectionActivity[];
  // Product & allocation catalogue
  finishedProducts: FinishedProduct[];
  siteAllocations: SiteAllocation[];

  // Finance actions (legacy)
  addCustomerInvoice: (inv: CustomerInvoice) => void;
  addSupplierInvoice: (inv: SupplierInvoice) => void;
  addPaymentRecord: (pay: PaymentRecord) => void;
  recordPaymentAgainstInvoice: (invoiceId: string, direction: 'inbound' | 'outbound', amount: number) => void;
  // Finance actions (rich flagship types)
  addInvoice: (inv: Invoice) => void;
  addPayment: (pay: Payment) => void;
  addPaymentAllocation: (pa: PaymentAllocation) => void;
  addCollectionActivity: (ca: CollectionActivity) => void;

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
  updateAsset: (id: string, partial: Partial<Asset>) => void;
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

// Everything the demo scenario seeds — rebuilt fresh on first load AND on an
// explicit "Reset Demo Data". Kept as one function so both call sites can
// never drift apart.
function buildInitialData() {
  const raw = buildSeed();
  return stampPlaces(raw);
}

function buildSeed() {
  return {
    currentUser: DEMO_USERS[0], // owner by default
    customers: [...CUSTOMERS_BASE, GERMAN_CUSTOMER],
    suppliers: [...SUPPLIERS],
    notifications: [...NOTIFICATIONS],
    unreadCount: NOTIFICATIONS.filter(n => !n.read).length,

    jobs: [...JOBS, ...FLAGSHIP_JOBS, ...JOBS_DEMO].map(j => {
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
    lots: [...MATERIAL_LOTS, ...MATERIAL_LOTS_DEMO],
    inventory: [...INVENTORY, ...INVENTORY_DEMO],
    movements: [...STOCK_MOVEMENTS],
    assets: [...ASSETS, ...ASSETS_DEMO],
    maintenanceEvents: [...MAINTENANCE_EVENTS, ...MAINTENANCE_EVENTS_DEMO],
    dispatches: [...DISPATCHES, ...FLAGSHIP_DISPATCHES, ...DISPATCHES_DEMO],
    documents: [...VAULT_DOCUMENTS, ...VAULT_DOCUMENTS_DEMO],
    approvalRequests: [...APPROVAL_REQUESTS],
    pulseExceptions: [...PULSE_EXCEPTIONS],
    customerPos: [...CUSTOMER_POS, FLAGSHIP_PO, ...CUSTOMER_POS_DEMO],
    supplierPos: [...SUPPLIER_POS, ...SUPPLIER_POS_DEMO],
    supplierPoLines: [...SUPPLIER_PO_LINES, ...SUPPLIER_PO_LINES_DEMO],
    poAmendments: [],
    purchaseReqs: [...PURCHASE_REQS, ...FLAGSHIP_PURCHASE_REQS],
    rfqs: [...RFQS, { ...RFQS_FULL[0], lineCount: RFQS_FULL[0].lines.length }, ADDITIONAL_RFQ],
    quotations: [FLAGSHIP_QUOTATION],
    quotationLines: [...FLAGSHIP_QUOTATION_LINES],
    poLines: [...FLAGSHIP_PO_LINES],
    grns: [...GRNS, ...FLAGSHIP_GRNS],
    inspections: [...INSPECTIONS, ...FLAGSHIP_INSPECTIONS, ...INSPECTIONS_DEMO],
    ncrs: [...NCRS, ...FLAGSHIP_NCRS, ...NCRS_DEMO],
    certificates: [...CERTIFICATES],
    employees: [...EMPLOYEES],
    storeLocations: [...STORE_LOCATIONS],
    supplierQuotations: [...SUPPLIER_QUOTATIONS, ...FLAGSHIP_SUPPLIER_RFQS],
    auditEvents: [...AUDIT_EVENTS, ...AUDIT_EVENTS_DEMO],
    approvalPolicies: [...APPROVAL_POLICIES],
    customerInvoices: [...CUSTOMER_INVOICES],
    supplierInvoices: [...SUPPLIER_INVOICES],
    paymentRecords: [...PAYMENT_RECORDS],
    invoices: [...FLAGSHIP_INVOICES],
    invoiceLines: [...FLAGSHIP_INVOICE_LINES],
    payments: [...FLAGSHIP_PAYMENTS],
    paymentAllocations: [...FLAGSHIP_PAYMENT_ALLOCATIONS],
    collectionActivities: [...COLLECTION_ACTIVITIES],
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
    jobMaterialReqs: [...JOB_MATERIAL_REQS, ...JOB_MATERIAL_REQS_DEMO],
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

  // ── Asset Actions ──
  setAssetStatus: (assetId, status) => set(s => ({
    assets: s.assets.map(a => a.id !== assetId ? a : { ...a, status }),
  })),

  addMaintenanceEvent: (event) => set(s => ({
    maintenanceEvents: [event, ...s.maintenanceEvents],
  })),

  closeMaintenanceEvent: (eventId, diagnosis, workDone) => {
    set(s => ({
      maintenanceEvents: s.maintenanceEvents.map(me =>
        me.id !== eventId ? me : { ...me, status: 'closed' as const, diagnosis, workDone, downtimeEnd: new Date().toISOString() }),
    }));
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
        const poLines = amendment.lineId && amendment.lineChanges ? s.poLines.map(line => line.id !== amendment.lineId ? line : {
          ...line,
          ...(amendment.lineChanges.description ? { description: amendment.lineChanges.description } : {}),
          ...(amendment.lineChanges.drawingRevision ? { revision: amendment.lineChanges.drawingRevision } : {}),
          ...(amendment.lineChanges.quantity !== undefined ? { orderedQty: amendment.lineChanges.quantity, value: amendment.lineChanges.quantity * line.rate } : {}),
          ...(amendment.lineChanges.rate !== undefined ? { rate: amendment.lineChanges.rate, value: line.orderedQty * amendment.lineChanges.rate } : {}),
          ...(amendment.lineChanges.requiredDate ? { requiredDate: amendment.lineChanges.requiredDate } : {}),
        }) : s.poLines;
        return { poAmendments, customerPos, poLines };
      }
      const supplierPos = s.supplierPos.map(po => po.id !== amendment.poId ? po : {
        ...po,
        ...(amendment.headerChanges?.paymentTerms ? { paymentTerms: amendment.headerChanges.paymentTerms } : {}),
        ...(amendment.headerChanges?.committedDate ? { committedDate: amendment.headerChanges.committedDate } : {}),
        revision: amendment.revision, lastAmendedAt: now, hasAmendment: true,
      });
      const supplierPoLines = amendment.lineId && amendment.lineChanges ? s.supplierPoLines.map(line => line.id !== amendment.lineId ? line : {
        ...line,
        ...(amendment.lineChanges.materialName ? { materialName: amendment.lineChanges.materialName } : {}),
        ...(amendment.lineChanges.quantity !== undefined ? { orderedQty: amendment.lineChanges.quantity, value: amendment.lineChanges.quantity * line.rate } : {}),
        ...(amendment.lineChanges.rate !== undefined ? { rate: amendment.lineChanges.rate, value: amendment.lineChanges.quantity !== undefined ? amendment.lineChanges.quantity * amendment.lineChanges.rate : line.orderedQty * amendment.lineChanges.rate } : {}),
        ...(amendment.lineChanges.requiredDate ? { committedDate: amendment.lineChanges.requiredDate } : {}),
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
      return {
        approvalRequests: s.approvalRequests.map(a =>
          a.id !== aprId ? a : { ...a, status: resolution, approvedBy: by, notes, decisionAt: new Date().toISOString() }),
        pulseExceptions: s.pulseExceptions.filter(pe => pe.affectedId !== aprId),
        unreadCount: Math.max(0, s.unreadCount - 1),
        customerPos: request.requestType === 'Customer PO Credit Limit Approval'
          ? s.customerPos.map(po => po.id === request.entityId ? { ...po, status: resolution === 'approved' ? 'active' as const : 'on_hold' as const } : po)
          : s.customerPos,
        auditEvents: [...s.auditEvents, {
          id: `ae-${Date.now()}`,
          actor: by, actorId: s.currentUser.id, scope: 'ApprovalRequest', action: resolution,
          entityId: request.entityId, entityRef: request.entityRef, timestamp: new Date().toISOString(),
          source: 'ui', reason: notes, after: { approvalId: aprId, status: resolution },
        }],
      };
    });
    get().showToast({ type: resolution === 'approved' ? 'success' : 'info', title: `Request ${resolution}`, body: `Approval request resolved.` });
  },

  addApprovalRequest: (request) => set(s => ({
    approvalRequests: [request, ...s.approvalRequests],
    auditEvents: [...s.auditEvents, {
      id: `ae-${Date.now()}`, actor: s.currentUser.name, actorId: s.currentUser.id,
      scope: 'ApprovalRequest', action: 'create', entityId: request.entityId, entityRef: request.entityRef,
      timestamp: new Date().toISOString(), source: 'ui', after: request as unknown as Record<string, unknown>,
    }],
  })),

  // ── Document Actions ──
  addDocument: (doc) => set(s => ({ documents: [doc, ...s.documents] })),

  addDocumentVersion: (previousDocId, newDoc) => {
    set(s => ({
      documents: [
        { ...newDoc, supersedesDocId: previousDocId, status: 'active' as const },
        ...s.documents.map(d => d.id === previousDocId ? { ...d, status: 'superseded' as const } : d),
      ],
    }));
    get().showToast({ type: 'success', title: 'New version uploaded', body: `${newDoc.title} — v${newDoc.version}. Previous version preserved.` });
  },

  updateCertStatus: (certId, status) => set(s => ({
    certificates: s.certificates.map(c => c.id !== certId ? c : { ...c, verificationStatus: status }),
  })),

  // ── Dispatch Actions ──
  setDispatchStatus: (dspId, status) => {
    set(s => ({ dispatches: s.dispatches.map(d => d.id !== dspId ? d : { ...d, status }) }));
    get().showToast({ type: 'success', title: 'Dispatch updated', body: `Status changed to ${status.replace('_', ' ')}` });
  },

  addDispatch: (dispatch) => set(s => ({ dispatches: [dispatch, ...s.dispatches] })),

  recordPoD: (dspId) => {
    set(s => ({ dispatches: s.dispatches.map(d => d.id !== dspId ? d : { ...d, hasPoD: true }) }));
    get().showToast({ type: 'success', title: 'Proof of Delivery recorded' });
  },

  // ── NCR Actions ──
  addNCR: (ncr) => set(s => ({ ncrs: [ncr, ...s.ncrs] })),

  closeNCR: (ncrId, resolution) => {
    set(s => ({ ncrs: s.ncrs.map(n => n.id !== ncrId ? n : { ...n, status: 'closed' as const, disposition: resolution as NCR['disposition'] }) }));
    get().showToast({ type: 'success', title: 'NCR closed', body: `Disposition: ${resolution}` });
  },

  linkNCRToInspection: (inspectionId, ncrId, ncrNumber) => set(s => ({
    inspections: s.inspections.map(i => i.id !== inspectionId ? i : { ...i, ncrId, ncrNumber }),
  })),

  // ── Supplier Quotation Actions ──
  addSupplierQuotation: (quote) => set(s => ({ supplierQuotations: [...s.supplierQuotations, quote] })),

  selectQuotation: (quoteId) => set(s => ({
    supplierQuotations: s.supplierQuotations.map(q =>
      q.id === quoteId
        ? { ...q, status: 'selected' as const }
        : q.prId === s.supplierQuotations.find(sq => sq.id === quoteId)?.prId
          ? { ...q, status: q.status === 'selected' ? 'rejected' as const : q.status }
          : q
    ),
  })),

  // ── Sales / Cross-entity Actions ──
  addRfq: (rfq) => set(s => ({ rfqs: [rfq, ...s.rfqs] })),
  addQuotation: (q, lines) => set(s => ({ quotations: [q, ...s.quotations], quotationLines: [...s.quotationLines, ...lines] })),
  updateQuotation: (id, partial) => set(s => ({ quotations: s.quotations.map(q => q.id === id ? { ...q, ...partial } : q) })),
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
  addPurchaseReq: (pr) => set(s => ({ purchaseReqs: [pr, ...s.purchaseReqs] })),
  updatePurchaseReq: (id, partial) => set(s => ({ purchaseReqs: s.purchaseReqs.map(p => p.id === id ? { ...p, ...partial } : p) })),
  addCustomerPO: (po) => set(s => {
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
    return { customerPos: [nextPo, ...s.customerPos], ...(approval ? { approvalRequests: [approval, ...s.approvalRequests] } : {}) };
  }),
  addSupplierPO: (spo) => set(s => ({ supplierPos: [spo, ...s.supplierPos] })),
  addGRN: (grn) => set(s => ({ grns: [grn, ...s.grns] })),
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

  // ── New Finance Actions ──
  addInvoice: (inv) => set(s => ({ invoices: [inv, ...s.invoices] })),
  addPayment: (pay) => set(s => ({ payments: [pay, ...s.payments] })),
  addPaymentAllocation: (pa) => set(s => ({ paymentAllocations: [pa, ...s.paymentAllocations] })),
  addCollectionActivity: (ca) => set(s => ({ collectionActivities: [ca, ...s.collectionActivities] })),

  // ── Update / Soft-delete Actions ──
  updateCustomerPo: (id, partial) => set(s => {
    const current = s.customerPos.find(p => p.id === id);
    if (!current) return s;
    const commercialChange = ['totalValue', 'paymentTerms', 'deliveryTerms', 'poNumber'].some(key => key in partial);
    if (current.commercialLocked && commercialChange) return s;
    const safePartial = { ...partial, poNumber: current.poNumber };
    const next = { ...current, ...safePartial };
    return {
      customerPos: s.customerPos.map(p => p.id === id ? next : p),
      auditEvents: commercialChange ? [...s.auditEvents, {
        id: `ae-${Date.now()}`, actor: s.currentUser.name, actorId: s.currentUser.id, scope: 'CustomerPO', action: 'update',
        entityId: id, entityRef: current.poNumber, timestamp: new Date().toISOString(), source: 'ui', before: current as unknown as Record<string, unknown>, after: next as unknown as Record<string, unknown>,
      }] : s.auditEvents,
    };
  }),
  updateCustomer: (id, partial) => set(s => ({
    customers: s.customers.map(c => c.id === id ? { ...c, ...partial } : c),
    auditEvents: [...s.auditEvents, {
      id: `ae-${Date.now()}`, actor: s.currentUser.name, actorId: s.currentUser.id, scope: 'Customer', action: 'update', entityId: id,
      entityRef: s.customers.find(c => c.id === id)?.tradingName ?? id, timestamp: new Date().toISOString(), source: 'ui', after: partial as Record<string, unknown>,
    }],
  })),
  addCustomer: (customer) => set(s => ({ customers: [customer, ...s.customers] })),
  updateSupplier: (id, partial) => set(s => ({ suppliers: s.suppliers.map(supplier => supplier.id === id ? { ...supplier, ...partial } : supplier) })),
  addSupplier: (supplier) => set(s => ({ suppliers: [supplier, ...s.suppliers] })),
  updateRfq: (id, partial) => set(s => ({ rfqs: s.rfqs.map(r => r.id === id ? { ...r, ...partial } : r) })),
  updateSupplierPo: (id, partial) => set(s => ({ supplierPos: s.supplierPos.map(p => p.id === id ? { ...p, ...partial } : p) })),
  updateJob: (id, partial) => set(s => {
    const current = s.jobs.find(j => j.id === id);
    if (!current) return s;
    const next = { ...current, ...partial };
    return {
      jobs: s.jobs.map(j => j.id === id ? next : j),
      auditEvents: [...s.auditEvents, { id: `ae-${Date.now()}`, actor: s.currentUser.name, actorId: s.currentUser.id, scope: 'Job', action: 'update',
        entityId: id, entityRef: current.jobNumber, timestamp: new Date().toISOString(), source: 'ui', before: current as unknown as Record<string, unknown>, after: next as unknown as Record<string, unknown> }],
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
      const cancellationDisposition: JobCancellationDisposition = {
        reason: reason.trim(), reservedReleasedQty: releasable, issuedQty: issued, consumedQty: issued,
        wip: disposition.wip, finishedGoods: disposition.finishedGoods, recordedAt: timestamp, recordedBy: by,
      };
      return {
        jobs: s.jobs.map(j => j.id === id ? { ...j, status: 'cancelled' as const, cancellationReason: reason.trim(), cancelledAt: timestamp, cancelledBy: by, cancellationDisposition } : j),
        inventory,
        jobMaterialReqs: s.jobMaterialReqs.map(r => r.jobId === id ? { ...r, reservedQty: r.issuedQty, shortage: false } : r),
        movements: releasable > 0 ? [...s.movements, ...requirements.filter(r => r.reservedQty > r.issuedQty).map(r => ({
          id: `sm-${Date.now()}-${r.id}`, lotId: r.lotIds[0] ?? '', movementType: 'Reservation-Release' as const,
          primaryQty: Math.max(0, r.reservedQty - r.issuedQty), uom: r.uom, fromLocation: `Reserved for ${job.jobNumber}`,
          toLocation: job.siteName, referenceType: 'Job Cancellation', referenceId: job.id, referenceNumber: job.jobNumber, performedBy: by, timestamp,
        }))] : s.movements,
        auditEvents: [...s.auditEvents, { id: `ae-${Date.now()}`, actor: by, actorId: s.currentUser.id, scope: 'Job', action: 'cancel', entityId: id,
          entityRef: job.jobNumber, timestamp, source: 'ui', reason, before: { status: job.status }, after: { status: 'cancelled', releasedQty: releasable, disposition: cancellationDisposition } }],
      };
    });
    get().showToast({ type: 'success', title: 'Job cancelled', body: 'The job remains in history; reserved but unissued material was released.' });
  },
  updateInspection: (id, partial) => set(s => ({ inspections: s.inspections.map(i => i.id === id ? { ...i, ...partial } : i) })),
  setInspectionStatus: (id, result) => set(s => ({ inspections: s.inspections.map(i => i.id === id ? { ...i, result } : i) })),
  updateNCR: (id, partial) => set(s => ({ ncrs: s.ncrs.map(n => n.id === id ? { ...n, ...partial } : n) })),
  setNCRStatus: (id, status) => set(s => ({ ncrs: s.ncrs.map(n => n.id === id ? { ...n, status } : n) })),
  updateAsset: (id, partial) => set(s => ({ assets: s.assets.map(a => a.id === id ? { ...a, ...partial } : a) })),
  updateEmployee: (id, partial) => set(s => ({ employees: s.employees.map(e => e.id === id ? { ...e, ...partial } : e) })),

  // ── Onboarding Actions ──
  updateOnboarding: (partial) => set(s => ({ onboarding: { ...s.onboarding, ...partial } })),
  completeOnboarding: () => set({ onboarding: { status: 'complete', completedSteps: [1, 2, 3, 4, 5, 6, 7] } }),
  resetOnboarding: () => set({ onboarding: { status: 'not_started', completedSteps: [] } }),
  updateCompanyConfig: (partial) => set(s => ({ companyConfig: { ...s.companyConfig, ...partial } })),

  // ── Audit Actions (append-only) ──
  appendAuditEvent: (event) => {
    const id = `ae-${Date.now()}`;
    set(s => ({ auditEvents: [...s.auditEvents, { ...event, id }] }));
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
    set(() => buildInitialData());
    get().showToast({ type: 'success', title: 'Demo data reset', body: 'Restored the original Apex Precision demonstration scenario.' });
  },
}), {
  name: 'eoss-demo-store',
  storage: createJSONStorage(() => localStorage),
  version: 1,
  // Theme/sidebar prefs already persist themselves via their own localStorage keys;
  // toasts are transient UI state. Everything else is demo business data.
  partialize: (state) => {
    const { toasts, theme, eossTheme, sidebarCollapsed, ...demoData } = state;
    return demoData;
  },
  onRehydrateStorage: () => (state) => {
    if (!state) return;
    useStore.setState(stampPlaces({
      ...state,
      jobUpdates: state.jobUpdates ?? [],
      transfers: state.transfers ?? [],
      materialReturns: state.materialReturns ?? [],
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
