import { create } from 'zustand';
import type {
  DemoUser, RoleKey, Job, JobStage, JobUpdate, MaterialLot,
  InventoryItem, StockMovement, Asset, MaintenanceEvent,
  Dispatch, VaultDocument, ApprovalRequest, AppNotification,
  PulseException, CustomerPO, SupplierPO, CustomerRFQ, GoodsReceipt,
  Inspection, NCR, MaterialCertificate, Party
} from '../types';
import {
  DEMO_USERS, JOBS, MATERIAL_LOTS, INVENTORY, STOCK_MOVEMENTS,
  ASSETS, MAINTENANCE_EVENTS, DISPATCHES, VAULT_DOCUMENTS,
  APPROVAL_REQUESTS, NOTIFICATIONS, PULSE_EXCEPTIONS, CUSTOMER_POS,
  SUPPLIER_POS, RFQS, GRNS, INSPECTIONS, NCRS, CERTIFICATES,
  CUSTOMERS, SUPPLIERS, SUPPLIER_PO_LINES, JOB_BLOCKERS, PURCHASE_REQS
} from '../data/seed';

// ── App State ──

export type ThemeMode = 'system' | 'light' | 'dark';

interface EOSSState {
  // Session
  currentUser: DemoUser;
  theme: ThemeMode;
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
  rfqs: CustomerRFQ[];
  grns: GoodsReceipt[];
  inspections: Inspection[];
  ncrs: NCR[];
  certificates: MaterialCertificate[];

  // Toast
  toasts: Toast[];

  // Actions
  setCurrentUser: (user: DemoUser) => void;
  switchRole: (role: RoleKey) => void;
  setTheme: (t: ThemeMode) => void;
  toggleSidebar: () => void;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;

  // Job actions
  updateJobStage: (jobId: string, stageId: string, update: Partial<JobStage>) => void;
  addJobUpdate: (jobId: string, update: JobUpdate) => void;
  setJobStatus: (jobId: string, status: Job['status']) => void;
  resolveBlocker: (blockerId: string) => void;

  // Inventory actions
  issueMaterial: (lotId: string, qty: number, jobId: string, jobNumber: string, by: string) => void;
  transferLot: (lotId: string, toLocation: string, by: string) => void;
  setLotStatus: (lotId: string, status: MaterialLot['status']) => void;

  // Asset actions
  setAssetStatus: (assetId: string, status: Asset['status']) => void;
  addMaintenanceEvent: (event: MaintenanceEvent) => void;
  closeMaintenanceEvent: (eventId: string, diagnosis: string, workDone: string) => void;

  // Procurement actions
  setSupplierPoStatus: (spoId: string, status: SupplierPO['status']) => void;

  // Approval actions
  resolveApproval: (aprId: string, resolution: 'approved' | 'rejected', by: string, notes?: string) => void;

  // Document actions
  addDocument: (doc: VaultDocument) => void;
  updateCertStatus: (certId: string, status: MaterialCertificate['verificationStatus']) => void;

  // Dispatch actions
  setDispatchStatus: (dspId: string, status: Dispatch['status']) => void;

  // Toast actions
  showToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  body?: string;
  duration?: number;
}

let toastSeq = 0;

export const useStore = create<EOSSState>((set, get) => ({
  // ── Initial State ──
  currentUser: DEMO_USERS[0], // owner by default
  theme: 'system',
  sidebarCollapsed: false,
  notifications: [...NOTIFICATIONS],
  unreadCount: NOTIFICATIONS.filter(n => !n.read).length,

  jobs: JOBS.map(j => ({ ...j, stages: [...j.stages] })),
  lots: [...MATERIAL_LOTS],
  inventory: [...INVENTORY],
  movements: [...STOCK_MOVEMENTS],
  assets: [...ASSETS],
  maintenanceEvents: [...MAINTENANCE_EVENTS],
  dispatches: [...DISPATCHES],
  documents: [...VAULT_DOCUMENTS],
  approvalRequests: [...APPROVAL_REQUESTS],
  pulseExceptions: [...PULSE_EXCEPTIONS],
  customerPos: [...CUSTOMER_POS],
  supplierPos: [...SUPPLIER_POS],
  rfqs: [...RFQS],
  grns: [...GRNS],
  inspections: [...INSPECTIONS],
  ncrs: [...NCRS],
  certificates: [...CERTIFICATES],
  toasts: [],

  // ── Session Actions ──
  setCurrentUser: (user) => set({ currentUser: user }),

  switchRole: (role) => {
    const user = DEMO_USERS.find(u => u.role === role);
    if (user) set({ currentUser: user });
  },

  setTheme: (theme) => {
    set({ theme });
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
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
    // Find which job this blocker belongs to and clear hasBlocker flag if no other open blockers
    const { showToast } = get();
    // In prototype: just show toast
    showToast({ type: 'success', title: 'Blocker resolved', body: `Blocker ${blockerId} marked as resolved.` });
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

  updateCertStatus: (certId, status) => set(s => ({
    certificates: s.certificates.map(c => c.id !== certId ? c : { ...c, verificationStatus: status }),
  })),

  // ── Dispatch Actions ──
  setDispatchStatus: (dspId, status) => set(s => ({
    dispatches: s.dispatches.map(d => d.id !== dspId ? d : { ...d, status }),
  })),

  // ── Toast Actions ──
  showToast: (toast) => {
    const id = `toast-${++toastSeq}`;
    set(s => ({ toasts: [...s.toasts, { ...toast, id }] }));
    setTimeout(() => get().removeToast(id), toast.duration ?? 4000);
  },

  removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
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
export { DEMO_USERS, CUSTOMERS, SUPPLIERS, SUPPLIER_PO_LINES, JOB_BLOCKERS, PURCHASE_REQS };
