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
  PurchaseRequisition, Site, MaterialItem,
  MeterReading, QualityRelease, InspectionTemplate, StageTemplate,
  JobMaterialReq, JobBlocker, SupplierPOLine
} from '../types';
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

// ── App State ──

export type ThemeMode = 'system' | 'light' | 'dark';
export type EOSSTheme = 'aurora' | 'ocean' | 'graphite';

interface EOSSState {
  // Session
  currentUser: DemoUser;
  purchaseReqs: PurchaseRequisition[];
  theme: ThemeMode;
  eossTheme: EOSSTheme;
  sidebarCollapsed: boolean;
  notifications: AppNotification[];
  unreadCount: number;

  // Data (mutable for interactions)
  jobs: Job[];
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
  transferLot: (lotId: string, toLocation: string, by: string) => void;
  setLotStatus: (lotId: string, status: MaterialLot['status']) => void;

  // Asset actions
  setAssetStatus: (assetId: string, status: Asset['status']) => void;
  addMaintenanceEvent: (event: MaintenanceEvent) => void;
  closeMaintenanceEvent: (eventId: string, diagnosis: string, workDone: string) => void;

  // Procurement actions
  addPurchaseReq: (pr: PurchaseRequisition) => void;
  updatePurchaseReq: (id: string, partial: Partial<PurchaseRequisition>) => void;
  setSupplierPoStatus: (spoId: string, status: SupplierPO['status']) => void;

  // Approval actions
  resolveApproval: (aprId: string, resolution: 'approved' | 'rejected', by: string, notes?: string) => void;

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
  updateRfq: (id: string, partial: Partial<CustomerRFQ>) => void;
  updateSupplierPo: (id: string, partial: Partial<SupplierPO>) => void;
  updateJob: (id: string, partial: Partial<Job>) => void;
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
  return {
    currentUser: DEMO_USERS[0], // owner by default
    notifications: [...NOTIFICATIONS],
    unreadCount: NOTIFICATIONS.filter(n => !n.read).length,

    jobs: [...JOBS, ...FLAGSHIP_JOBS, ...JOBS_DEMO].map(j => ({ ...j, stages: [...j.stages] })),
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
    purchaseReqs: [...PURCHASE_REQS, ...FLAGSHIP_PURCHASE_REQS],
    rfqs: [...RFQS, FLAGSHIP_RFQ, ADDITIONAL_RFQ],
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
  theme: (typeof window !== 'undefined' && (localStorage.getItem('eoss-theme') as ThemeMode)) || 'light',
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
    set({ theme });
    const root = document.documentElement;
    if (theme === 'system') {
      root.removeAttribute('data-theme');
      try { localStorage.removeItem('eoss-theme'); } catch (_) {}
    } else {
      root.setAttribute('data-theme', theme);
      try { localStorage.setItem('eoss-theme', theme); } catch (_) {}
    }
  },

  setEOSSTheme: (eossTheme) => {
    set({ eossTheme });
    const root = document.documentElement;
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
    jobs: s.jobs.map(j => j.id !== jobId ? j : {
      ...j,
      stages: j.stages.map(st => st.id !== stageId ? st : { ...st, ...update }),
    }),
  })),

  addJobUpdate: (jobId, update) => {
    const { updateJobStage, showToast } = get();
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
  issueMaterial: (lotId, qty, jobId, jobNumber, by) => {
    const timestamp = new Date().toISOString();
    set(s => {
      const lot = s.lots.find(l => l.id === lotId);
      if (!lot) return s;
      const newMovement: StockMovement = {
        id: `sm-${Date.now()}`, lotId, movementType: 'Issue', primaryQty: qty,
        uom: lot.primaryUom, fromLocation: lot.storeLocationName, toLocation: 'WIP Store',
        referenceType: 'Job', referenceId: jobId, referenceNumber: jobNumber, performedBy: by, timestamp,
      };
      return {
        lots: s.lots.map(l => l.id !== lotId ? l : { ...l, primaryQty: l.primaryQty - qty, status: 'issued' as const }),
        movements: [...s.movements, newMovement],
        inventory: s.inventory.map(inv => inv.materialItemId === lot.materialItemId
          ? { ...inv, onHandQty: inv.onHandQty - qty, availableQty: Math.max(0, inv.availableQty - qty) }
          : inv),
      };
    });
    get().showToast({ type: 'success', title: 'Material issued', body: `${qty} ${get().lots.find(l => l.id === lotId)?.primaryUom ?? ''} issued to ${jobNumber}.` });
  },

  transferLot: (lotId, toLocation, by) => {
    const timestamp = new Date().toISOString();
    set(s => {
      const lot = s.lots.find(l => l.id === lotId);
      if (!lot) return s;
      const newMovement: StockMovement = {
        id: `sm-${Date.now()}`, lotId, movementType: 'Transfer-Out', primaryQty: lot.primaryQty,
        uom: lot.primaryUom, fromLocation: lot.storeLocationName, toLocation,
        referenceType: 'Transfer', referenceId: lotId, referenceNumber: lot.lotNumber, performedBy: by, timestamp,
      };
      return {
        lots: s.lots.map(l => l.id !== lotId ? l : { ...l, storeLocationName: toLocation }),
        movements: [...s.movements, newMovement],
      };
    });
    get().showToast({ type: 'success', title: 'Lot transferred', body: `Lot moved to ${toLocation}.` });
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

  // ── Approval Actions ──
  resolveApproval: (aprId, resolution, by, notes) => {
    set(s => ({
      approvalRequests: s.approvalRequests.map(a =>
        a.id !== aprId ? a : { ...a, status: resolution, approvedBy: by, notes }),
      pulseExceptions: s.pulseExceptions.filter(pe => pe.affectedId !== aprId),
      unreadCount: Math.max(0, s.unreadCount - 1),
    }));
    get().showToast({ type: resolution === 'approved' ? 'success' : 'info', title: `Request ${resolution}`, body: `Approval request resolved.` });
  },

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
  convertQuotationToPO: (quotationId, po, lines) => set(s => ({
    quotations: s.quotations.map(q => q.id === quotationId ? { ...q, status: 'accepted' as const } : q),
    rfqs: s.rfqs.map(r => r.id === s.quotations.find(q => q.id === quotationId)?.rfqId ? { ...r, status: 'converted' as const } : r),
    customerPos: [po, ...s.customerPos],
    poLines: [...s.poLines, ...lines],
  })),
  addPurchaseReq: (pr) => set(s => ({ purchaseReqs: [pr, ...s.purchaseReqs] })),
  updatePurchaseReq: (id, partial) => set(s => ({ purchaseReqs: s.purchaseReqs.map(p => p.id === id ? { ...p, ...partial } : p) })),
  addCustomerPO: (po) => set(s => ({ customerPos: [po, ...s.customerPos] })),
  addSupplierPO: (spo) => set(s => ({ supplierPos: [spo, ...s.supplierPos] })),
  addGRN: (grn) => set(s => ({ grns: [grn, ...s.grns] })),
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
  updateCustomerPo: (id, partial) => set(s => ({ customerPos: s.customerPos.map(p => p.id === id ? { ...p, ...partial } : p) })),
  updateRfq: (id, partial) => set(s => ({ rfqs: s.rfqs.map(r => r.id === id ? { ...r, ...partial } : r) })),
  updateSupplierPo: (id, partial) => set(s => ({ supplierPos: s.supplierPos.map(p => p.id === id ? { ...p, ...partial } : p) })),
  updateJob: (id, partial) => set(s => ({ jobs: s.jobs.map(j => j.id === id ? { ...j, ...partial } : j) })),
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
}));

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
