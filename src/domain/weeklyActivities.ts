import type {
  Asset, CustomerPO, CustomerQuotation, Dispatch, GoodsReceipt,
  Inspection, Invoice, Job, PurchaseRequisition, SupplierBill, SupplierPO,
} from '../types';

export type WeeklyActivityStatus = 'completed' | 'scheduled' | 'upcoming' | 'pending' | 'overdue';

export interface WeeklyActivity {
  id: string;
  dayIndex: 0 | 1 | 2 | 3 | 4 | 5; // 0 = Mon .. 5 = Sat
  time: string;
  title: string;
  ref: string;
  module: 'Sales' | 'Procurement' | 'Inventory' | 'Quality' | 'Production' | 'Maintenance' | 'Dispatch' | 'Finance';
  status: WeeklyActivityStatus;
  path?: string;
}

export interface WeeklyActivityStoreSlice {
  jobs: Job[];
  purchaseReqs: PurchaseRequisition[];
  supplierPos: SupplierPO[];
  grns: GoodsReceipt[];
  inspections: Inspection[];
  dispatches: Dispatch[];
  invoices: Invoice[];
  supplierBills: SupplierBill[];
  assets: Asset[];
  quotations: CustomerQuotation[];
  customerPos: CustomerPO[];
}

export function buildWeeklyActivities(store: WeeklyActivityStoreSlice): WeeklyActivity[] {
  const candidates: Array<{
    id: string;
    dayIndex: 0 | 1 | 2 | 3 | 4 | 5;
    time: string;
    title: string;
    ref: string;
    module: WeeklyActivity['module'];
    status: WeeklyActivityStatus;
    path: string;
    exists: boolean;
  }> = [
    // Monday (0)
    {
      id: 'wk-mon-1',
      dayIndex: 0,
      time: '09:30 AM',
      title: 'Production review',
      ref: 'J-104',
      module: 'Production',
      status: 'overdue',
      path: '/jobs/job-104',
      exists: store.jobs.some(j => j.id === 'job-104'),
    },
    {
      id: 'wk-mon-2',
      dayIndex: 0,
      time: '02:00 PM',
      title: 'Customer PO review',
      ref: 'CPO-2024-101',
      module: 'Sales',
      status: 'completed',
      path: '/sales/po/cpo-101',
      exists: store.customerPos.some(p => p.id === 'cpo-101'),
    },
    {
      id: 'wk-mon-3',
      dayIndex: 0,
      time: '04:30 PM',
      title: 'Customer payment due',
      ref: 'INV-2026-001',
      module: 'Finance',
      status: 'pending',
      path: '/finance/invoice/cinv-001',
      exists: store.invoices.some(i => i.id === 'cinv-001'),
    },

    // Tuesday (1)
    {
      id: 'wk-tue-1',
      dayIndex: 1,
      time: '10:00 AM',
      title: 'Supplier quotation review',
      ref: 'PR-2026-103',
      module: 'Procurement',
      status: 'completed',
      path: '/procurement/pr/pr-demo-03',
      exists: store.purchaseReqs.some(p => p.id === 'pr-demo-03'),
    },
    {
      id: 'wk-tue-2',
      dayIndex: 1,
      time: '03:00 PM',
      title: 'Quotation follow-up',
      ref: 'QT-2026-201',
      module: 'Sales',
      status: 'completed',
      path: '/sales/quotation/qt-demo-a-r1',
      exists: store.quotations.some(q => q.id === 'qt-demo-a-r1'),
    },

    // Wednesday (2)
    {
      id: 'wk-wed-1',
      dayIndex: 2,
      time: '11:00 AM',
      title: 'Incoming material inspection',
      ref: 'GRN-2024-003',
      module: 'Quality',
      status: 'pending',
      path: '/procurement/grn/grn-003',
      exists: store.grns.some(g => g.id === 'grn-003'),
    },
    {
      id: 'wk-wed-2',
      dayIndex: 2,
      time: '02:30 PM',
      title: 'Quality clearance check',
      ref: 'INSP-2024-002',
      module: 'Quality',
      status: 'pending',
      path: '/quality/inspection/ins-002',
      exists: store.inspections.some(i => i.id === 'ins-002'),
    },
    {
      id: 'wk-wed-3',
      dayIndex: 2,
      time: '04:00 PM',
      title: '3-way bill match review',
      ref: 'BILL-2026-001',
      module: 'Finance',
      status: 'pending',
      path: '/finance/bill/sinv-001',
      exists: store.supplierBills.some(b => b.id === 'sinv-001'),
    },

    // Thursday (3)
    {
      id: 'wk-thu-1',
      dayIndex: 3,
      time: '10:30 AM',
      title: 'Supplier delivery follow-up',
      ref: 'SPO-2024-002',
      module: 'Procurement',
      status: 'overdue',
      path: '/procurement/spo/spo-002',
      exists: store.supplierPos.some(p => p.id === 'spo-002'),
    },
    {
      id: 'wk-thu-2',
      dayIndex: 3,
      time: '02:00 PM',
      title: 'Production stage review',
      ref: 'J-105',
      module: 'Production',
      status: 'scheduled',
      path: '/jobs/job-105',
      exists: store.jobs.some(j => j.id === 'job-105'),
    },
    {
      id: 'wk-thu-3',
      dayIndex: 3,
      time: '05:00 PM',
      title: 'PR approval check',
      ref: 'PR-2026-111',
      module: 'Procurement',
      status: 'pending',
      path: '/procurement/pr/pr-demo-11',
      exists: store.purchaseReqs.some(p => p.id === 'pr-demo-11'),
    },

    // Friday (4)
    {
      id: 'wk-fri-1',
      dayIndex: 4,
      time: '11:30 AM',
      title: 'Customer dispatch',
      ref: 'DSP-2026-201',
      module: 'Dispatch',
      status: 'upcoming',
      path: '/dispatch/dsp-demo-201',
      exists: store.dispatches.some(d => d.id === 'dsp-demo-201'),
    },
    {
      id: 'wk-fri-2',
      dayIndex: 4,
      time: '03:30 PM',
      title: 'Supplier delivery receipt',
      ref: 'SPO-2024-001',
      module: 'Inventory',
      status: 'scheduled',
      path: '/procurement/spo/spo-001',
      exists: store.supplierPos.some(p => p.id === 'spo-001'),
    },
    {
      id: 'wk-fri-3',
      dayIndex: 4,
      time: '05:00 PM',
      title: 'Customer receipt follow-up',
      ref: 'INV-2026-002',
      module: 'Finance',
      status: 'upcoming',
      path: '/finance/invoice/cinv-002',
      exists: store.invoices.some(i => i.id === 'cinv-002'),
    },

    // Saturday (5)
    {
      id: 'wk-sat-1',
      dayIndex: 5,
      time: '09:00 AM',
      title: 'Preventive maintenance',
      ref: 'DP-01',
      module: 'Maintenance',
      status: 'scheduled',
      path: '/assets/ast-dp01',
      exists: store.assets.some(a => a.id === 'ast-dp01'),
    },
    {
      id: 'wk-sat-2',
      dayIndex: 5,
      time: '12:00 PM',
      title: 'Completion target check',
      ref: 'J-101',
      module: 'Production',
      status: 'upcoming',
      path: '/jobs/job-101',
      exists: store.jobs.some(j => j.id === 'job-101'),
    },
  ];

  return candidates.map(({ exists, path, ...rest }) => ({
    ...rest,
    path: exists ? path : undefined,
  }));
}
