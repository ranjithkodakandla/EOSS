import type {
  CustomerPO,
  CustomerQuotation,
  CustomerQuotationLine,
  CustomerRFQ,
  Dispatch,
  GoodsReceipt,
  Inspection,
  Job,
  JobMaterialReq,
  MaterialLot,
  POLine,
  PurchaseRequisition,
  SupplierInvitation,
  SupplierPO,
  SupplierPOLine,
  SupplierQuotation,
} from '../types';

/**
 * Connected Demo Scenarios (Part L §39)
 * 10 distinct Procurement PR lifecycle scenarios + Customer-to-Production E2E scenarios.
 */

// ── Purchase Requisitions (Scenarios 1–10 + existing baseline PRs stay untouched) ──
export const DEMO_SCENARIO_PRS: PurchaseRequisition[] = [
  // Scenario 1: New PR, no supplier invitations sent yet
  {
    id: 'pr-demo-01',
    prNumber: 'PR-2026-101',
    raisedBy: 'Suresh Kumar',
    department: 'Production',
    raisedDate: '2026-11-05',
    requiredBy: '2026-11-26',
    sourceType: 'manual',
    status: 'approved',
    lineCount: 1,
    totalQty: 250,
    priority: 'normal',
    deliverToSiteId: 'site-hyd',
    deliverToSiteName: 'Hyderabad Plant 1',
    deliverToStoreId: 'loc-rm',
    deliverToStoreName: 'Raw Material Store',
    purpose: 'Scheduled SS 304L sheet restock for Q4 pressure enclosures',
    lines: [
      {
        id: 'prdl-01a',
        prId: 'pr-demo-01',
        materialItemId: 'mat-ss3',
        materialCode: 'SS-SHT-304-3',
        materialName: 'SS Sheet 3mm 304L',
        description: 'SS Sheet 3mm 304L',
        grade: 'ASTM A240 304L',
        requiredQty: 250,
        uom: 'kg',
        requiredDate: '2026-11-22',
        estimatedPrice: 185,
      },
    ],
  },
  // Scenario 2: Multi-line PR with multiple invitations sent, awaiting supplier responses
  {
    id: 'pr-demo-02',
    prNumber: 'PR-2026-102',
    raisedBy: 'Karthik Raju',
    department: 'Stores',
    raisedDate: '2026-11-04',
    requiredBy: '2026-11-20',
    sourceType: 'site_need',
    sourceRefLabel: 'Site Replenishment · Hyderabad',
    status: 'quotation_in_progress',
    lineCount: 2,
    totalQty: 1300,
    priority: 'high',
    deliverToSiteId: 'site-hyd',
    deliverToSiteName: 'Hyderabad Plant 1',
    deliverToStoreId: 'loc-rm',
    deliverToStoreName: 'Raw Material Store',
    purpose: 'Frame plates and structural Grade 8.8 fastener kit',
    lines: [
      {
        id: 'prdl-02a',
        prId: 'pr-demo-02',
        materialItemId: 'mat-ms8',
        materialCode: 'MS-PLT-008',
        materialName: 'MS Plate 8mm',
        description: 'MS Plate 8mm',
        grade: 'IS 2062 E250',
        requiredQty: 300,
        uom: 'kg',
        requiredDate: '2026-11-20',
        estimatedPrice: 80,
      },
      {
        id: 'prdl-02b',
        prId: 'pr-demo-02',
        materialItemId: 'mat-bolt',
        materialCode: 'FST-BLT-M12x50',
        materialName: 'Bolts M12×50 GR8.8',
        description: 'Bolts M12×50 GR8.8',
        grade: 'ISO 898-1 Gr 8.8',
        requiredQty: 1000,
        uom: 'pcs',
        requiredDate: '2026-11-20',
        estimatedPrice: 14,
      },
    ],
  },
  // Scenario 3: Partial supplier responses (2 quotes received, 1 awaiting, 1 declined)
  {
    id: 'pr-demo-03',
    prNumber: 'PR-2026-103',
    raisedBy: 'Asha Nair',
    department: 'Production',
    raisedDate: '2026-11-03',
    requiredBy: '2026-11-18',
    sourceType: 'manual',
    status: 'quotation_in_progress',
    lineCount: 1,
    totalQty: 500,
    priority: 'high',
    deliverToSiteId: 'site-hyd',
    deliverToSiteName: 'Hyderabad Plant 1',
    deliverToStoreId: 'loc-rm',
    deliverToStoreName: 'Raw Material Store',
    purpose: 'Base plate requirement — compare 2 received quotes while awaiting 3rd',
    lines: [
      {
        id: 'prdl-03a',
        prId: 'pr-demo-03',
        materialItemId: 'mat-ms12',
        materialCode: 'MS-PLT-012',
        materialName: 'MS Plate 12mm',
        description: 'MS Plate 12mm',
        grade: 'IS 2062 E250',
        requiredQty: 500,
        uom: 'kg',
        requiredDate: '2026-11-18',
        estimatedPrice: 86,
      },
    ],
  },
  // Scenario 4: Complete quotations with grade/qty/missing-item differences ready to compare
  {
    id: 'pr-demo-04',
    prNumber: 'PR-2026-104',
    raisedBy: 'Suresh Kumar',
    department: 'Machining & Assembly',
    raisedDate: '2026-11-02',
    requiredBy: '2026-11-16',
    sourceType: 'manual',
    status: 'quotation_in_progress',
    lineCount: 3,
    totalQty: 1200,
    priority: 'normal',
    deliverToSiteId: 'site-hyd',
    deliverToSiteName: 'Hyderabad Plant 1',
    deliverToStoreId: 'loc-rm',
    deliverToStoreName: 'Raw Material Store',
    purpose: 'Flat bars and welding bay consumables batch',
    lines: [
      {
        id: 'prdl-04a',
        prId: 'pr-demo-04',
        materialItemId: 'mat-msfb',
        materialCode: 'MS-FLT-50x6',
        materialName: 'MS Flat Bar 50×6',
        description: 'MS Flat Bar 50×6',
        grade: 'IS 2062',
        requiredQty: 150,
        uom: 'kg',
        requiredDate: '2026-11-16',
        estimatedPrice: 78,
      },
      {
        id: 'prdl-04b',
        prId: 'pr-demo-04',
        materialItemId: 'mat-wr',
        materialCode: 'WLD-ROD-E6013',
        materialName: 'Welding Rods E6013 3.15mm',
        description: 'Welding Rods E6013 3.15mm',
        grade: 'AWS E6013',
        requiredQty: 1000,
        uom: 'pcs',
        requiredDate: '2026-11-16',
        estimatedPrice: 7,
      },
      {
        id: 'prdl-04c',
        prId: 'pr-demo-04',
        materialItemId: 'mat-gd',
        materialCode: 'TOL-GRD-125',
        materialName: 'Grinding Disc 125mm',
        description: 'Grinding Disc 125mm',
        grade: 'Standard',
        requiredQty: 50,
        uom: 'pcs',
        requiredDate: '2026-11-16',
        estimatedPrice: 30,
      },
    ],
  },
  // Scenario 5: Quotation approved, Single SPO created in Draft ready for Preview & Issue
  {
    id: 'pr-demo-05',
    prNumber: 'PR-2026-105',
    raisedBy: 'Suresh Kumar',
    department: 'Production',
    raisedDate: '2026-11-01',
    requiredBy: '2026-11-15',
    sourceType: 'manual',
    status: 'po_drafted',
    lineCount: 1,
    totalQty: 8,
    priority: 'high',
    deliverToSiteId: 'site-hyd',
    deliverToSiteName: 'Hyderabad Plant 1',
    deliverToStoreId: 'loc-rm',
    deliverToStoreName: 'Raw Material Store',
    purpose: 'Urgent Argon shielding gas refill for TIG welding cells',
    lines: [
      {
        id: 'prdl-05a',
        prId: 'pr-demo-05',
        materialItemId: 'mat-ar',
        materialCode: 'GAS-ARG-CYL',
        materialName: 'Argon Gas (Cylinder)',
        description: 'Argon Gas (Cylinder)',
        requiredQty: 8,
        uom: 'cyl',
        requiredDate: '2026-11-15',
        estimatedPrice: 1850,
      },
    ],
  },
  // Scenario 6: Quotation rejected at approval stage; PR returned to comparison/selection
  {
    id: 'pr-demo-06',
    prNumber: 'PR-2026-106',
    raisedBy: 'Karthik Raju',
    department: 'Production',
    raisedDate: '2026-11-01',
    requiredBy: '2026-11-24',
    sourceType: 'manual',
    status: 'quotation_in_progress',
    lineCount: 1,
    totalQty: 400,
    priority: 'normal',
    deliverToSiteId: 'site-pun',
    deliverToSiteName: 'Pune Manufacturing Plant',
    deliverToStoreId: 'loc-pun-rm',
    deliverToStoreName: 'Raw Material Store',
    purpose: 'Pune plant billet replenishment after payment-term rejection on initial quote',
    lines: [
      {
        id: 'prdl-06a',
        prId: 'pr-demo-06',
        materialItemId: 'mat-42crmo4',
        materialCode: 'FRG-42CD4-RND',
        materialName: 'Steel Grade 42CrMo4 Forged Round Billet',
        description: 'Steel Grade 42CrMo4 Forged Round Billet',
        grade: 'EN 10083-3 42CrMo4',
        requiredQty: 400,
        uom: 'kg',
        requiredDate: '2026-11-24',
        estimatedPrice: 245,
      },
    ],
  },
  // Scenario 7: Single Supplier PO issued, awaiting supplier confirmation
  {
    id: 'pr-demo-07',
    prNumber: 'PR-2026-107',
    raisedBy: 'Asha Nair',
    department: 'Stores',
    raisedDate: '2026-10-29',
    requiredBy: '2026-11-14',
    sourceType: 'manual',
    status: 'po_issued',
    lineCount: 1,
    totalQty: 120,
    priority: 'normal',
    deliverToSiteId: 'site-hyd',
    deliverToSiteName: 'Hyderabad Plant 1',
    deliverToStoreId: 'loc-rm',
    deliverToStoreName: 'Raw Material Store',
    purpose: 'MIG wire replenishment — PO issued to Apex Consumables, awaiting confirmation',
    lines: [
      {
        id: 'prdl-07a',
        prId: 'pr-demo-07',
        materialItemId: 'mat-mw',
        materialCode: 'WLD-WIR-ER70',
        materialName: 'MIG Wire ER70S-6',
        description: 'MIG Wire ER70S-6',
        requiredQty: 120,
        uom: 'kg',
        requiredDate: '2026-11-14',
        estimatedPrice: 145,
      },
    ],
  },
  // Scenario 8: Supplier declined PO; PR reopened for alternate supplier quote selection
  {
    id: 'pr-demo-08',
    prNumber: 'PR-2026-108',
    raisedBy: 'Suresh Kumar',
    department: 'Production',
    raisedDate: '2026-10-28',
    requiredBy: '2026-11-19',
    sourceType: 'manual',
    status: 'quotation_in_progress',
    lineCount: 1,
    totalQty: 350,
    priority: 'urgent',
    deliverToSiteId: 'site-che',
    deliverToSiteName: 'Chennai Fabrication Unit',
    deliverToStoreId: 'loc-che-rm',
    deliverToStoreName: 'Raw Material Store',
    purpose: 'Chennai structural pipe order reopened after primary supplier capacity decline',
    lines: [
      {
        id: 'prdl-08a',
        prId: 'pr-demo-08',
        materialItemId: 'mat-msp',
        materialCode: 'MS-PPE-100',
        materialName: 'MS Pipe 100NB Sch40',
        description: 'MS Pipe 100NB Sch40',
        grade: 'IS 1239 Heavy',
        requiredQty: 350,
        uom: 'kg',
        requiredDate: '2026-11-19',
        estimatedPrice: 92,
      },
    ],
  },
  // Scenario 9: Supplier confirmed PO with revised delivery date -> GRN recorded -> Multi-lot partial QC hold
  {
    id: 'pr-demo-09',
    prNumber: 'PR-2026-109',
    raisedBy: 'Karthik Raju',
    department: 'Production',
    raisedDate: '2026-10-24',
    requiredBy: '2026-11-12',
    sourceType: 'manual',
    status: 'converted',
    lineCount: 1,
    totalQty: 600,
    priority: 'high',
    deliverToSiteId: 'site-hyd',
    deliverToSiteName: 'Hyderabad Plant 1',
    deliverToStoreId: 'loc-qrn',
    deliverToStoreName: 'Quarantine Store',
    purpose: 'Alloy steel 42CrMo4 forged billets — 2-lot GRN with 1 lot released & 1 on QC hold',
    lines: [
      {
        id: 'prdl-09a',
        prId: 'pr-demo-09',
        materialItemId: 'mat-42crmo4',
        materialCode: 'FRG-42CD4-RND',
        materialName: 'Steel Grade 42CrMo4 Forged Round Billet',
        description: 'Steel Grade 42CrMo4 Forged Round Billet',
        grade: 'EN 10083-3 42CrMo4',
        requiredQty: 600,
        uom: 'kg',
        requiredDate: '2026-11-12',
        estimatedPrice: 240,
      },
    ],
  },
  // Scenario 10: Auto-created PR from Customer PO material shortage
  {
    id: 'pr-demo-10',
    prNumber: 'PR-2026-110',
    raisedBy: 'System Availability Check',
    department: 'Procurement',
    raisedDate: '2026-11-05',
    requiredBy: '2026-11-25',
    sourceType: 'shortage',
    sourceRefId: 'cpo-demo-short',
    sourceRefLabel: 'CPO-2026-201',
    sourceMaterialReqId: 'jmr-demo-b1',
    jobId: 'job-demo-short',
    jobNumber: 'J-210',
    status: 'approved',
    lineCount: 1,
    totalQty: 320,
    priority: 'urgent',
    deliverToSiteId: 'site-hyd',
    deliverToSiteName: 'Hyderabad Plant 1',
    deliverToStoreId: 'loc-rm',
    deliverToStoreName: 'Raw Material Store',
    purpose: 'Shortfall cover (320 kg MS Pipe 100NB Sch40) against Customer PO CPO-2026-201',
    lines: [
      {
        id: 'prdl-10a',
        prId: 'pr-demo-10',
        materialItemId: 'mat-msp',
        materialCode: 'MS-PPE-100',
        materialName: 'MS Pipe 100NB Sch40',
        description: 'MS Pipe 100NB Sch40',
        grade: 'IS 1239 Heavy',
        requiredQty: 320,
        uom: 'kg',
        requiredDate: '2026-11-25',
        estimatedPrice: 90,
      },
    ],
  },
  // Scenario 11: PR Pending Approval (high-value above threshold — ready to test Approve / Reject)
  {
    id: 'pr-demo-11',
    prNumber: 'PR-2026-111',
    raisedBy: 'Karthik Raju',
    department: 'Production',
    raisedDate: '2026-11-05',
    requiredBy: '2026-11-22',
    sourceType: 'manual',
    status: 'pending',
    lineCount: 1,
    totalQty: 750,
    priority: 'urgent',
    deliverToSiteId: 'site-hyd',
    deliverToSiteName: 'Hyderabad Plant 1',
    deliverToStoreId: 'loc-rm',
    deliverToStoreName: 'Raw Material Store',
    purpose: 'Bulk SS Sheet 3mm 304L reserve for Q4 export header batch (₹1,42,500 — exceeds ₹1,00,000 approval threshold)',
    lines: [
      {
        id: 'prdl-11a',
        prId: 'pr-demo-11',
        materialItemId: 'mat-ss3',
        materialCode: 'SS-SHT-304-3',
        materialName: 'SS Sheet 3mm 304L',
        description: 'SS Sheet 3mm 304L',
        grade: 'ASTM A240 304L',
        requiredQty: 750,
        uom: 'kg',
        requiredDate: '2026-11-22',
        estimatedPrice: 190,
      },
    ],
  },
  // Scenario 12: Rejected PR (demonstrates rejection audit trail & blocked downstream quoting)
  {
    id: 'pr-demo-12',
    prNumber: 'PR-2026-112',
    raisedBy: 'Mohan Das',
    department: 'Fabrication',
    raisedDate: '2026-11-02',
    requiredBy: '2026-11-18',
    sourceType: 'site_need',
    status: 'rejected',
    lineCount: 1,
    totalQty: 250,
    priority: 'normal',
    deliverToSiteId: 'site-hyd',
    deliverToSiteName: 'Hyderabad Plant 1',
    deliverToStoreId: 'loc-rm',
    deliverToStoreName: 'Raw Material Store',
    purpose: 'Additional MS Flat Bar 50×6 buffer request',
    reason: 'Rejected by Ranjith Kodakandla (03 Nov): Duplicate buffer request — 236 kg already available in LOT-2024-006.',
    rejectionReason: 'Duplicate buffer request — 236 kg already available in LOT-2024-006.',
    rejectedBy: 'Ranjith Kodakandla',
    rejectedAt: '2026-11-03T11:15:00',
    lines: [
      {
        id: 'prdl-12a',
        prId: 'pr-demo-12',
        materialItemId: 'mat-msfb',
        materialCode: 'MS-FLT-50x6',
        materialName: 'MS Flat Bar 50×6',
        description: 'MS Flat Bar 50×6',
        grade: 'IS 2062',
        requiredQty: 250,
        uom: 'kg',
        requiredDate: '2026-11-18',
        estimatedPrice: 78,
      },
    ],
  },
];

// ── Supplier Invitations (connected across PR scenarios) ──
export const DEMO_SUPPLIER_INVITATIONS: SupplierInvitation[] = [
  // PR-2024-018 baseline historical invitations
  { id: 'sinv-001a', prId: 'pr-001', prNumber: 'PR-2024-018', supplierId: 'supp-ssi', supplierName: 'Stainless Source India', contactName: 'Ramesh Joshi', contactEmail: 'sales@stainlesssource.com', matchReason: 'Associated supplier for SS Sheet 3mm 304L', channel: 'email', requestedLineIds: ['prl-001'], createdAt: '2026-10-26', sentDate: '2026-10-26', responseDueDate: '2026-10-30', status: 'quotation_received', quotationId: 'sq-001' },
  { id: 'sinv-001b', prId: 'pr-001', prNumber: 'PR-2024-018', supplierId: 'supp-msk', supplierName: 'MSK Steel Pvt Ltd', contactName: 'Mahesh Kumar', contactEmail: 'sales@msksteel.com', matchReason: 'Raw Material supplier (Hyderabad)', channel: 'email', requestedLineIds: ['prl-001'], createdAt: '2026-10-26', sentDate: '2026-10-26', responseDueDate: '2026-10-30', status: 'not_selected', quotationId: 'sq-002' },
  // PR-2024-019
  { id: 'sinv-002a', prId: 'pr-002', prNumber: 'PR-2024-019', supplierId: 'supp-apex', supplierName: 'Apex Consumables', contactName: 'Apex Admin', contactEmail: 'orders@apexconsumables.com', matchReason: 'Associated supplier for Grinding Disc & Consumables', channel: 'email', requestedLineIds: ['prl-002a', 'prl-002b'], createdAt: '2026-11-01', sentDate: '2026-11-01', responseDueDate: '2026-11-06', status: 'quotation_received', quotationId: 'sq-003' },
  // Scenario 2 (PR-2026-102): awaiting all 3
  { id: 'sinv-102a', prId: 'pr-demo-02', prNumber: 'PR-2026-102', supplierId: 'supp-msk', supplierName: 'MSK Steel Pvt Ltd', contactName: 'Mahesh Kumar', contactEmail: 'sales@msksteel.com', matchReason: 'Associated supplier for MS Plate 8mm', channel: 'email', requestedLineIds: ['prdl-02a'], createdAt: '2026-11-04', sentDate: '2026-11-04', responseDueDate: '2026-11-09', status: 'awaiting_quotation' },
  { id: 'sinv-102b', prId: 'pr-demo-02', prNumber: 'PR-2026-102', supplierId: 'supp-sct', supplierName: 'SteelCraft Tubes Pvt Ltd', contactName: 'Suresh CT', contactEmail: 'sales@steelcrafttubes.com', matchReason: 'Associated supplier for MS Plate 8mm', channel: 'email', requestedLineIds: ['prdl-02a'], createdAt: '2026-11-04', sentDate: '2026-11-04', responseDueDate: '2026-11-09', status: 'awaiting_quotation' },
  { id: 'sinv-102c', prId: 'pr-demo-02', prNumber: 'PR-2026-102', supplierId: 'supp-rkf', supplierName: 'RK Fasteners & Hardware', contactName: 'Ravi Kumar', contactEmail: 'rkfasteners@gmail.com', matchReason: 'Associated supplier for Bolts M12×50 GR8.8', channel: 'portal', requestedLineIds: ['prdl-02b'], createdAt: '2026-11-04', sentDate: '2026-11-04', responseDueDate: '2026-11-09', status: 'awaiting_quotation' },
  // Scenario 3 (PR-2026-103): 2 received, 1 awaiting, 1 declined
  { id: 'sinv-103a', prId: 'pr-demo-03', prNumber: 'PR-2026-103', supplierId: 'supp-msk', supplierName: 'MSK Steel Pvt Ltd', contactName: 'Mahesh Kumar', contactEmail: 'sales@msksteel.com', matchReason: 'Associated supplier for MS Plate 12mm', channel: 'email', requestedLineIds: ['prdl-03a'], createdAt: '2026-11-03', sentDate: '2026-11-03', responseDueDate: '2026-11-08', status: 'quotation_received', quotationId: 'sq-demo-103a' },
  { id: 'sinv-103b', prId: 'pr-demo-03', prNumber: 'PR-2026-103', supplierId: 'supp-sct', supplierName: 'SteelCraft Tubes Pvt Ltd', contactName: 'Suresh CT', contactEmail: 'sales@steelcrafttubes.com', matchReason: 'Associated supplier for MS Plate 12mm', channel: 'email', requestedLineIds: ['prdl-03a'], createdAt: '2026-11-03', sentDate: '2026-11-03', responseDueDate: '2026-11-08', status: 'quotation_received', quotationId: 'sq-demo-103b' },
  { id: 'sinv-103c', prId: 'pr-demo-03', prNumber: 'PR-2026-103', supplierId: 'supp-ssi', supplierName: 'Stainless Source India', contactName: 'Ramesh Joshi', contactEmail: 'sales@stainlesssource.com', matchReason: 'Raw Material supplier', channel: 'email', requestedLineIds: ['prdl-03a'], createdAt: '2026-11-03', sentDate: '2026-11-03', responseDueDate: '2026-11-08', status: 'awaiting_quotation' },
  { id: 'sinv-103d', prId: 'pr-demo-03', prNumber: 'PR-2026-103', supplierId: 'supp-sfa', supplierName: 'SteelForge Alloys Pvt Ltd', contactName: 'Vikram Deshmukh', contactEmail: 'sales@steelforgealloys.com', matchReason: 'Associated supplier for MS Plate 12mm', channel: 'email', requestedLineIds: ['prdl-03a'], createdAt: '2026-11-03', sentDate: '2026-11-03', responseDueDate: '2026-11-08', status: 'declined', declineReason: 'Rolling mill maintenance through Nov 20' },
  // Scenario 4 (PR-2026-104): 3 received
  { id: 'sinv-104a', prId: 'pr-demo-04', prNumber: 'PR-2026-104', supplierId: 'supp-apex', supplierName: 'Apex Consumables Pvt Ltd', contactName: 'Apex Admin', contactEmail: 'orders@apexconsumables.com', matchReason: 'Associated supplier for Welding Rods & Grinding Discs', channel: 'email', requestedLineIds: ['prdl-04a', 'prdl-04b', 'prdl-04c'], createdAt: '2026-11-02', sentDate: '2026-11-02', responseDueDate: '2026-11-07', status: 'quotation_received', quotationId: 'sq-demo-104a' },
  { id: 'sinv-104b', prId: 'pr-demo-04', prNumber: 'PR-2026-104', supplierId: 'supp-msk', supplierName: 'MSK Steel Pvt Ltd', contactName: 'Mahesh Kumar', contactEmail: 'sales@msksteel.com', matchReason: 'Associated supplier for MS Flat Bar 50×6', channel: 'email', requestedLineIds: ['prdl-04a', 'prdl-04b', 'prdl-04c'], createdAt: '2026-11-02', sentDate: '2026-11-02', responseDueDate: '2026-11-07', status: 'quotation_received', quotationId: 'sq-demo-104b' },
  { id: 'sinv-104c', prId: 'pr-demo-04', prNumber: 'PR-2026-104', supplierId: 'supp-pcl', supplierName: 'Precision Components Ltd', contactName: 'Prakash N', contactEmail: 'subcontract@precisioncomp.com', matchReason: 'Associated supplier for MS Flat Bar 50×6', channel: 'portal', requestedLineIds: ['prdl-04a', 'prdl-04b', 'prdl-04c'], createdAt: '2026-11-02', sentDate: '2026-11-02', responseDueDate: '2026-11-07', status: 'quotation_received', quotationId: 'sq-demo-104c' },
  // Scenario 5 (PR-2026-105): SPO Draft ready
  { id: 'sinv-105a', prId: 'pr-demo-05', prNumber: 'PR-2026-105', supplierId: 'supp-bgs', supplierName: 'Bharat Gas Supply Co', contactName: 'Bhanu Prakash', contactEmail: 'orders@bharatgas.com', matchReason: 'Associated supplier for Argon Gas', channel: 'email', requestedLineIds: ['prdl-05a'], createdAt: '2026-11-01', sentDate: '2026-11-01', responseDueDate: '2026-11-05', status: 'quotation_received', quotationId: 'sq-demo-105a' },
  { id: 'sinv-105b', prId: 'pr-demo-05', prNumber: 'PR-2026-105', supplierId: 'supp-apex', supplierName: 'Apex Consumables Pvt Ltd', contactName: 'Apex Admin', contactEmail: 'orders@apexconsumables.com', matchReason: 'Associated supplier for Argon Gas', channel: 'email', requestedLineIds: ['prdl-05a'], createdAt: '2026-11-01', sentDate: '2026-11-01', responseDueDate: '2026-11-05', status: 'not_selected', quotationId: 'sq-demo-105b' },
  // Scenario 6 (PR-2026-106): Quote rejected during approval
  { id: 'sinv-106a', prId: 'pr-demo-06', prNumber: 'PR-2026-106', supplierId: 'supp-msd', supplierName: 'Metro Scrap Dealers', contactName: 'Metro Admin', contactEmail: 'metro@scrap.com', matchReason: 'Manual invite', channel: 'email', requestedLineIds: ['prdl-06a'], createdAt: '2026-11-01', sentDate: '2026-11-01', status: 'quotation_received', quotationId: 'sq-demo-106a' },
  { id: 'sinv-106b', prId: 'pr-demo-06', prNumber: 'PR-2026-106', supplierId: 'supp-sfa', supplierName: 'SteelForge Alloys Pvt Ltd', contactName: 'Vikram Deshmukh', contactEmail: 'sales@steelforgealloys.com', matchReason: 'Associated supplier for 42CrMo4 Billet', channel: 'email', requestedLineIds: ['prdl-06a'], createdAt: '2026-11-01', sentDate: '2026-11-01', status: 'quotation_received', quotationId: 'sq-demo-106b' },
  { id: 'sinv-106c', prId: 'pr-demo-06', prNumber: 'PR-2026-106', supplierId: 'supp-krn', supplierName: 'Krishna Forgings Ltd', contactName: 'Lakshmi Narayana', contactEmail: 'sales@krishnaforgings.com', matchReason: 'Associated supplier for 42CrMo4 Billet', channel: 'email', requestedLineIds: ['prdl-06a'], createdAt: '2026-11-01', sentDate: '2026-11-01', status: 'quotation_received', quotationId: 'sq-demo-106c' },
  // Scenario 7 (PR-2026-107): Issued SPO awaiting supplier confirmation
  { id: 'sinv-107a', prId: 'pr-demo-07', prNumber: 'PR-2026-107', supplierId: 'supp-apex', supplierName: 'Apex Consumables Pvt Ltd', contactName: 'Apex Admin', contactEmail: 'orders@apexconsumables.com', matchReason: 'Associated supplier for MIG Wire ER70S-6', channel: 'email', requestedLineIds: ['prdl-07a'], createdAt: '2026-10-29', sentDate: '2026-10-29', status: 'quotation_received', quotationId: 'sq-demo-107a' },
  { id: 'sinv-107b', prId: 'pr-demo-07', prNumber: 'PR-2026-107', supplierId: 'supp-bgs', supplierName: 'Bharat Gas Supply Co', contactName: 'Bhanu Prakash', contactEmail: 'orders@bharatgas.com', matchReason: 'Associated supplier for MIG Wire ER70S-6', channel: 'email', requestedLineIds: ['prdl-07a'], createdAt: '2026-10-29', sentDate: '2026-10-29', status: 'not_selected', quotationId: 'sq-demo-107b' },
  // Scenario 8 (PR-2026-108): Supplier declined SPO
  { id: 'sinv-108a', prId: 'pr-demo-08', prNumber: 'PR-2026-108', supplierId: 'supp-sct', supplierName: 'SteelCraft Tubes Pvt Ltd', contactName: 'Suresh CT', contactEmail: 'sales@steelcrafttubes.com', matchReason: 'Associated supplier for MS Pipe 100NB Sch40', channel: 'email', requestedLineIds: ['prdl-08a'], createdAt: '2026-10-28', sentDate: '2026-10-28', status: 'declined', declineReason: 'Rolling schedule full after PO issue', quotationId: 'sq-demo-108a' },
  { id: 'sinv-108b', prId: 'pr-demo-08', prNumber: 'PR-2026-108', supplierId: 'supp-msk', supplierName: 'MSK Steel Pvt Ltd', contactName: 'Mahesh Kumar', contactEmail: 'sales@msksteel.com', matchReason: 'Associated supplier for MS Pipe 100NB Sch40', channel: 'email', requestedLineIds: ['prdl-08a'], createdAt: '2026-10-28', sentDate: '2026-10-28', status: 'quotation_received', quotationId: 'sq-demo-108b' },
  // Scenario 9 (PR-2026-109): Confirmed SPO + GRN + Partial QC Hold
  { id: 'sinv-109a', prId: 'pr-demo-09', prNumber: 'PR-2026-109', supplierId: 'supp-sfa', supplierName: 'SteelForge Alloys Pvt Ltd', contactName: 'Vikram Deshmukh', contactEmail: 'sales@steelforgealloys.com', matchReason: 'Associated supplier for 42CrMo4 Billet', channel: 'email', requestedLineIds: ['prdl-09a'], createdAt: '2026-10-24', sentDate: '2026-10-24', status: 'closed', quotationId: 'sq-demo-109a' },
];

// ── Supplier Quotations (Scenarios 3–9) ──
export const DEMO_SUPPLIER_QUOTATIONS: SupplierQuotation[] = [
  // Scenario 3 (PR-2026-103)
  {
    id: 'sq-demo-103a', quoteNumber: 'SQ-2026-103A', supplierId: 'supp-msk', supplierName: 'MSK Steel Pvt Ltd',
    prId: 'pr-demo-03', prNumber: 'PR-2026-103', invitationId: 'sinv-103a',
    quoteDate: '2026-11-04', validUntil: '2026-11-25', currency: 'INR', status: 'received',
    paymentTerms: 'Net 30', deliveryDays: 6, deliveryCharges: 0, attachmentName: 'MSK_Quote_12mm_Plates.pdf',
    lines: [
      { id: 'sqdl-103a1', quoteId: 'sq-demo-103a', materialItemId: 'mat-ms12', materialCode: 'MS-PLT-012', materialName: 'MS Plate 12mm', grade: 'IS 2062 E250', quotedQty: 500, uom: 'kg', unitPrice: 84, taxPct: 18, freightIncluded: true, lineTotal: 42000 },
    ],
    notes: 'Ready stock in Hyderabad godown; MTC provided.',
  },
  {
    id: 'sq-demo-103b', quoteNumber: 'SQ-2026-103B', supplierId: 'supp-sct', supplierName: 'SteelCraft Tubes Pvt Ltd',
    prId: 'pr-demo-03', prNumber: 'PR-2026-103', invitationId: 'sinv-103b',
    quoteDate: '2026-11-05', validUntil: '2026-11-28', currency: 'INR', status: 'received',
    paymentTerms: 'Net 45', deliveryDays: 9, deliveryCharges: 1800, attachmentName: 'SteelCraft_Plates_Quote.pdf',
    lines: [
      { id: 'sqdl-103b1', quoteId: 'sq-demo-103b', materialItemId: 'mat-ms12', materialCode: 'MS-PLT-012', materialName: 'MS Plate 12mm', grade: 'IS 2062 E250', quotedQty: 500, uom: 'kg', unitPrice: 82, taxPct: 18, freightIncluded: false, lineTotal: 41000 },
    ],
    notes: 'Ex-works Bengaluru; freight ₹1,800 extra.',
  },
  // Scenario 4 (PR-2026-104) — mismatches & omissions comparison showcase
  {
    id: 'sq-demo-104a', quoteNumber: 'SQ-2026-104A', supplierId: 'supp-apex', supplierName: 'Apex Consumables Pvt Ltd',
    prId: 'pr-demo-04', prNumber: 'PR-2026-104', invitationId: 'sinv-104a',
    quoteDate: '2026-11-03', validUntil: '2026-11-25', currency: 'INR', status: 'received',
    paymentTerms: 'Net 30', deliveryDays: 5, deliveryCharges: 0, attachmentName: 'Apex_Batch_Quote_104.pdf',
    lines: [
      { id: 'sqdl-104a1', quoteId: 'sq-demo-104a', materialItemId: 'mat-msfb', materialCode: 'MS-FLT-50x6', materialName: 'MS Flat Bar 50×6', grade: 'IS 2062', quotedQty: 150, uom: 'kg', unitPrice: 77, taxPct: 18, freightIncluded: true, lineTotal: 11550 },
      { id: 'sqdl-104a2', quoteId: 'sq-demo-104a', materialItemId: 'mat-wr', materialCode: 'WLD-ROD-E6013', materialName: 'Welding Rods E6013 3.15mm', grade: 'AWS E6013', quotedQty: 1000, uom: 'pcs', unitPrice: 6.8, taxPct: 18, freightIncluded: true, lineTotal: 6800 },
      { id: 'sqdl-104a3', quoteId: 'sq-demo-104a', materialItemId: 'mat-gd', materialCode: 'TOL-GRD-125', materialName: 'Grinding Disc 125mm', grade: 'Standard', quotedQty: 50, uom: 'pcs', unitPrice: 28, taxPct: 18, freightIncluded: true, lineTotal: 1400 },
    ],
    notes: 'Complete 3-line quote, freight included, shortest lead time.',
  },
  {
    id: 'sq-demo-104b', quoteNumber: 'SQ-2026-104B', supplierId: 'supp-msk', supplierName: 'MSK Steel Pvt Ltd',
    prId: 'pr-demo-04', prNumber: 'PR-2026-104', invitationId: 'sinv-104b',
    quoteDate: '2026-11-04', validUntil: '2026-11-22', currency: 'INR', status: 'received',
    paymentTerms: 'Net 30', deliveryDays: 12, deliveryCharges: 2500,
    lines: [
      { id: 'sqdl-104b1', quoteId: 'sq-demo-104b', materialItemId: 'mat-msfb', materialCode: 'MS-FLT-50x6', materialName: 'MS Flat Bar 50×6', grade: 'IS 2062', quotedQty: 150, uom: 'kg', unitPrice: 74, taxPct: 18, freightIncluded: false, lineTotal: 11100 },
      { id: 'sqdl-104b2', quoteId: 'sq-demo-104b', materialItemId: 'mat-wr', materialCode: 'WLD-ROD-E6013', materialName: 'Welding Rods E6013 3.15mm', grade: 'AWS E6013', quotedQty: 1000, uom: 'pcs', unitPrice: 7.2, taxPct: 18, freightIncluded: false, lineTotal: 7200 },
    ],
    notes: 'Grinding Discs out of stock — omitted from quote.',
  },
  {
    id: 'sq-demo-104c', quoteNumber: 'SQ-2026-104C', supplierId: 'supp-pcl', supplierName: 'Precision Components Ltd',
    prId: 'pr-demo-04', prNumber: 'PR-2026-104', invitationId: 'sinv-104c',
    quoteDate: '2026-11-04', validUntil: '2026-11-18', currency: 'INR', status: 'received',
    paymentTerms: 'Advance', deliveryDays: 16, deliveryCharges: 1200,
    lines: [
      { id: 'sqdl-104c1', quoteId: 'sq-demo-104c', materialItemId: 'mat-msfb', materialCode: 'MS-FLT-50x6', materialName: 'MS Flat Bar 50×6', grade: 'IS 2062 E350', quotedQty: 80, uom: 'kg', unitPrice: 72, taxPct: 18, freightIncluded: false, lineTotal: 5760 },
      { id: 'sqdl-104c2', quoteId: 'sq-demo-104c', materialItemId: 'mat-wr', materialCode: 'WLD-ROD-E6013', materialName: 'Welding Rods E6013 3.15mm', grade: 'AWS E6013', quotedQty: 1000, uom: 'pcs', unitPrice: 6.5, taxPct: 18, freightIncluded: false, lineTotal: 6500 },
      { id: 'sqdl-104c3', quoteId: 'sq-demo-104c', materialItemId: 'mat-gd', materialCode: 'TOL-GRD-125', materialName: 'Grinding Disc 125mm', grade: 'Standard', quotedQty: 50, uom: 'pcs', unitPrice: 27, taxPct: 18, freightIncluded: false, lineTotal: 1350 },
    ],
    notes: 'Only 80 kg available on IS 2062 E350 grade substitute.',
  },
  // Scenario 5 (PR-2026-105)
  {
    id: 'sq-demo-105a', quoteNumber: 'SQ-2026-105A', supplierId: 'supp-bgs', supplierName: 'Bharat Gas Supply Co',
    prId: 'pr-demo-05', prNumber: 'PR-2026-105', invitationId: 'sinv-105a',
    quoteDate: '2026-11-02', validUntil: '2026-11-25', currency: 'INR', status: 'selected',
    approvedBy: 'Ranjith Kodakandla', approvedAt: '2026-11-03T10:30:00',
    paymentTerms: 'Net 15', deliveryDays: 3, deliveryCharges: 0, attachmentName: 'BharatGas_Argon_105.pdf',
    lines: [
      { id: 'sqdl-105a1', quoteId: 'sq-demo-105a', materialItemId: 'mat-ar', materialCode: 'GAS-ARG-CYL', materialName: 'Argon Gas (Cylinder)', quotedQty: 8, uom: 'cyl', unitPrice: 1800, taxPct: 18, freightIncluded: true, lineTotal: 14400 },
    ],
  },
  {
    id: 'sq-demo-105b', quoteNumber: 'SQ-2026-105B', supplierId: 'supp-apex', supplierName: 'Apex Consumables Pvt Ltd',
    prId: 'pr-demo-05', prNumber: 'PR-2026-105', invitationId: 'sinv-105b',
    quoteDate: '2026-11-02', validUntil: '2026-11-25', currency: 'INR', status: 'not_selected',
    paymentTerms: 'Net 30', deliveryDays: 7, deliveryCharges: 600,
    lines: [
      { id: 'sqdl-105b1', quoteId: 'sq-demo-105b', materialItemId: 'mat-ar', materialCode: 'GAS-ARG-CYL', materialName: 'Argon Gas (Cylinder)', quotedQty: 8, uom: 'cyl', unitPrice: 1950, taxPct: 18, freightIncluded: false, lineTotal: 15600 },
    ],
  },
  // Scenario 6 (PR-2026-106) — quotation rejected during approval
  {
    id: 'sq-demo-106a', quoteNumber: 'SQ-2026-106A', supplierId: 'supp-msd', supplierName: 'Metro Scrap Dealers',
    prId: 'pr-demo-06', prNumber: 'PR-2026-106', invitationId: 'sinv-106a',
    quoteDate: '2026-11-02', validUntil: '2026-11-20', currency: 'INR', status: 'approval_rejected',
    rejectedBy: 'Ranjith Kodakandla', rejectedAt: '2026-11-03T16:15:00',
    rejectedReason: '100% Advance payment terms & missing ultrasonic test certification unacceptable; compare SteelForge vs Krishna Forgings.',
    paymentTerms: 'Advance', deliveryDays: 10, deliveryCharges: 0,
    lines: [
      { id: 'sqdl-106a1', quoteId: 'sq-demo-106a', materialItemId: 'mat-42crmo4', materialCode: 'FRG-42CD4-RND', materialName: 'Steel Grade 42CrMo4 Forged Round Billet', grade: 'EN 10083-3 42CrMo4', quotedQty: 400, uom: 'kg', unitPrice: 225, taxPct: 18, freightIncluded: false, lineTotal: 90000 },
    ],
  },
  {
    id: 'sq-demo-106b', quoteNumber: 'SQ-2026-106B', supplierId: 'supp-sfa', supplierName: 'SteelForge Alloys Pvt Ltd',
    prId: 'pr-demo-06', prNumber: 'PR-2026-106', invitationId: 'sinv-106b',
    quoteDate: '2026-11-03', validUntil: '2026-11-30', currency: 'INR', status: 'received',
    paymentTerms: 'Net 30', deliveryDays: 14, deliveryCharges: 0, attachmentName: 'SteelForge_42CrMo4_UT_Quote.pdf',
    lines: [
      { id: 'sqdl-106b1', quoteId: 'sq-demo-106b', materialItemId: 'mat-42crmo4', materialCode: 'FRG-42CD4-RND', materialName: 'Steel Grade 42CrMo4 Forged Round Billet', grade: 'EN 10083-3 42CrMo4', quotedQty: 400, uom: 'kg', unitPrice: 242, taxPct: 18, freightIncluded: true, lineTotal: 96800 },
    ],
    notes: 'EN 10204 3.1 MTC + UT test included.',
  },
  {
    id: 'sq-demo-106c', quoteNumber: 'SQ-2026-106C', supplierId: 'supp-krn', supplierName: 'Krishna Forgings Ltd',
    prId: 'pr-demo-06', prNumber: 'PR-2026-106', invitationId: 'sinv-106c',
    quoteDate: '2026-11-03', validUntil: '2026-11-30', currency: 'INR', status: 'received',
    paymentTerms: 'Net 45', deliveryDays: 16, deliveryCharges: 2200,
    lines: [
      { id: 'sqdl-106c1', quoteId: 'sq-demo-106c', materialItemId: 'mat-42crmo4', materialCode: 'FRG-42CD4-RND', materialName: 'Steel Grade 42CrMo4 Forged Round Billet', grade: 'EN 10083-3 42CrMo4', quotedQty: 400, uom: 'kg', unitPrice: 248, taxPct: 18, freightIncluded: false, lineTotal: 99200 },
    ],
  },
  // Scenario 7 (PR-2026-107) — selected for SPO awaiting supplier confirmation
  {
    id: 'sq-demo-107a', quoteNumber: 'SQ-2026-107A', supplierId: 'supp-apex', supplierName: 'Apex Consumables Pvt Ltd',
    prId: 'pr-demo-07', prNumber: 'PR-2026-107', invitationId: 'sinv-107a',
    quoteDate: '2026-10-30', validUntil: '2026-11-28', currency: 'INR', status: 'selected',
    approvedBy: 'Ranjith Kodakandla', approvedAt: '2026-11-01T11:00:00',
    paymentTerms: 'Net 30', deliveryDays: 5, deliveryCharges: 0,
    lines: [
      { id: 'sqdl-107a1', quoteId: 'sq-demo-107a', materialItemId: 'mat-mw', materialCode: 'WLD-WIR-ER70', materialName: 'MIG Wire ER70S-6', quotedQty: 120, uom: 'kg', unitPrice: 142, taxPct: 18, freightIncluded: true, lineTotal: 17040 },
    ],
  },
  {
    id: 'sq-demo-107b', quoteNumber: 'SQ-2026-107B', supplierId: 'supp-bgs', supplierName: 'Bharat Gas Supply Co',
    prId: 'pr-demo-07', prNumber: 'PR-2026-107', invitationId: 'sinv-107b',
    quoteDate: '2026-10-30', validUntil: '2026-11-28', currency: 'INR', status: 'not_selected',
    paymentTerms: 'Net 15', deliveryDays: 7, deliveryCharges: 500,
    lines: [
      { id: 'sqdl-107b1', quoteId: 'sq-demo-107b', materialItemId: 'mat-mw', materialCode: 'WLD-WIR-ER70', materialName: 'MIG Wire ER70S-6', quotedQty: 120, uom: 'kg', unitPrice: 150, taxPct: 18, freightIncluded: false, lineTotal: 18000 },
    ],
  },
  // Scenario 8 (PR-2026-108) — first supplier declined SPO, second quote open
  {
    id: 'sq-demo-108a', quoteNumber: 'SQ-2026-108A', supplierId: 'supp-sct', supplierName: 'SteelCraft Tubes Pvt Ltd',
    prId: 'pr-demo-08', prNumber: 'PR-2026-108', invitationId: 'sinv-108a',
    quoteDate: '2026-10-29', validUntil: '2026-11-20', currency: 'INR', status: 'rejected',
    rejectedReason: 'Supplier declined PO SPO-2026-108 after issuance due to mill capacity overrun.',
    paymentTerms: 'Net 30', deliveryDays: 8, deliveryCharges: 0,
    lines: [
      { id: 'sqdl-108a1', quoteId: 'sq-demo-108a', materialItemId: 'mat-msp', materialCode: 'MS-PPE-100', materialName: 'MS Pipe 100NB Sch40', grade: 'IS 1239 Heavy', quotedQty: 350, uom: 'kg', unitPrice: 88, taxPct: 18, freightIncluded: true, lineTotal: 30800 },
    ],
  },
  {
    id: 'sq-demo-108b', quoteNumber: 'SQ-2026-108B', supplierId: 'supp-msk', supplierName: 'MSK Steel Pvt Ltd',
    prId: 'pr-demo-08', prNumber: 'PR-2026-108', invitationId: 'sinv-108b',
    quoteDate: '2026-10-30', validUntil: '2026-11-30', currency: 'INR', status: 'received',
    paymentTerms: 'Net 30', deliveryDays: 7, deliveryCharges: 1500, attachmentName: 'MSK_Pipe_100NB_Quote.pdf',
    lines: [
      { id: 'sqdl-108b1', quoteId: 'sq-demo-108b', materialItemId: 'mat-msp', materialCode: 'MS-PPE-100', materialName: 'MS Pipe 100NB Sch40', grade: 'IS 1239 Heavy', quotedQty: 350, uom: 'kg', unitPrice: 91, taxPct: 18, freightIncluded: false, lineTotal: 31850 },
    ],
  },
  // Scenario 9 (PR-2026-109) — confirmed PO + partial GRN QC hold
  {
    id: 'sq-demo-109a', quoteNumber: 'SQ-2026-109A', supplierId: 'supp-sfa', supplierName: 'SteelForge Alloys Pvt Ltd',
    prId: 'pr-demo-09', prNumber: 'PR-2026-109', invitationId: 'sinv-109a',
    quoteDate: '2026-10-25', validUntil: '2026-11-25', currency: 'INR', status: 'selected',
    approvedBy: 'Ranjith Kodakandla', approvedAt: '2026-10-26T09:15:00',
    paymentTerms: 'Net 30', deliveryDays: 14, deliveryCharges: 0,
    lines: [
      { id: 'sqdl-109a1', quoteId: 'sq-demo-109a', materialItemId: 'mat-42crmo4', materialCode: 'FRG-42CD4-RND', materialName: 'Steel Grade 42CrMo4 Forged Round Billet', grade: 'EN 10083-3 42CrMo4', quotedQty: 600, uom: 'kg', unitPrice: 238, taxPct: 18, freightIncluded: true, lineTotal: 142800 },
    ],
  },
];

// ── Supplier POs (Scenarios 5, 7, 8, 9) ──
export const DEMO_SUPPLIER_POS: SupplierPO[] = [
  // Scenario 5: Draft PO waiting Confirm & Issue
  {
    id: 'spo-demo-105', poNumber: 'SPO-2026-105', spoNumber: 'SPO-2026-105', orderDate: '2026-11-04',
    supplierId: 'supp-bgs', supplierName: 'Bharat Gas Supply Co', raisedDate: '2026-11-04', committedDate: '2026-11-18',
    status: 'draft', totalValue: 16992, currency: 'INR', paymentTerms: 'Net 15',
    prId: 'pr-demo-05', prNumber: 'PR-2026-105', supplierQuotationId: 'sq-demo-105a', supplierQuotationRef: 'SQ-2026-105A',
    lineCount: 1, deliverToSiteId: 'site-hyd', deliverToSiteName: 'Hyderabad Plant 1', deliverToStoreId: 'loc-rm', deliverToStoreName: 'Raw Material Store',
    notes: 'Draft PO generated from approved quotation SQ-2026-105A; review commercial terms and confirm to issue.',
  },
  // Scenario 7: Issued SPO awaiting supplier confirmation
  {
    id: 'spo-demo-107', poNumber: 'SPO-2026-107', spoNumber: 'SPO-2026-107', orderDate: '2026-11-02',
    supplierId: 'supp-apex', supplierName: 'Apex Consumables Pvt Ltd', raisedDate: '2026-11-02', committedDate: '2026-11-12',
    status: 'awaiting_supplier_confirmation', totalValue: 20107, currency: 'INR', paymentTerms: 'Net 30',
    prId: 'pr-demo-07', prNumber: 'PR-2026-107', supplierQuotationId: 'sq-demo-107a', supplierQuotationRef: 'SQ-2026-107A',
    sentAt: '2026-11-02T14:30:00', issuedBy: 'Karthik Raju', supplierResponseStatus: 'pending',
    lineCount: 1, deliverToSiteId: 'site-hyd', deliverToSiteName: 'Hyderabad Plant 1', deliverToStoreId: 'loc-rm', deliverToStoreName: 'Raw Material Store',
  },
  // Scenario 8: Supplier declined PO
  {
    id: 'spo-demo-108', poNumber: 'SPO-2026-108', spoNumber: 'SPO-2026-108', orderDate: '2026-10-30',
    supplierId: 'supp-sct', supplierName: 'SteelCraft Tubes Pvt Ltd', raisedDate: '2026-10-30', committedDate: '2026-11-15',
    status: 'supplier_declined', totalValue: 36344, currency: 'INR', paymentTerms: 'Net 30',
    prId: 'pr-demo-08', prNumber: 'PR-2026-108', supplierQuotationId: 'sq-demo-108a', supplierQuotationRef: 'SQ-2026-108A',
    sentAt: '2026-10-30T11:00:00', issuedBy: 'Karthik Raju', supplierResponseStatus: 'declined',
    supplierDeclineReason: 'Rolling schedule full through late Nov — unable to meet Chennai delivery date.',
    supplierRespondedAt: '2026-11-01T16:40:00',
    lineCount: 1, deliverToSiteId: 'site-che', deliverToSiteName: 'Chennai Fabrication Unit', deliverToStoreId: 'loc-che-rm', deliverToStoreName: 'Raw Material Store',
  },
  // Scenario 9: Confirmed PO with supplier confirmed date + partial receipt & QC hold
  {
    id: 'spo-demo-109', poNumber: 'SPO-2026-109', spoNumber: 'SPO-2026-109', orderDate: '2026-10-27',
    supplierId: 'supp-sfa', supplierName: 'SteelForge Alloys Pvt Ltd', raisedDate: '2026-10-27', committedDate: '2026-11-12',
    status: 'partial', totalValue: 168504, currency: 'INR', paymentTerms: 'Net 30',
    prId: 'pr-demo-09', prNumber: 'PR-2026-109', supplierQuotationId: 'sq-demo-109a', supplierQuotationRef: 'SQ-2026-109A',
    sentAt: '2026-10-27T10:15:00', issuedBy: 'Karthik Raju', supplierResponseStatus: 'accepted',
    supplierConfirmedDate: '2026-11-12', supplierRefNumber: 'SFA-ACK-8841', supplierRespondedAt: '2026-10-28T09:45:00',
    supplierResponseNotes: 'Dispatched Heat #HT-SFA-901/902 first 400 kg batch; balance 200 kg in next lot.',
    lineCount: 1, deliverToSiteId: 'site-hyd', deliverToSiteName: 'Hyderabad Plant 1', deliverToStoreId: 'loc-qrn', deliverToStoreName: 'Quarantine Store',
  },
];

export const DEMO_SUPPLIER_PO_LINES: SupplierPOLine[] = [
  { id: 'spold-105a', spoId: 'spo-demo-105', materialItemId: 'mat-ar', materialCode: 'GAS-ARG-CYL', materialName: 'Argon Gas (Cylinder)', orderedQty: 8, uom: 'cyl', rate: 1800, value: 14400, committedDate: '2026-11-10', receivedQty: 0, acceptedQty: 0, rejectedQty: 0, tolerancePct: 0, status: 'pending' },
  { id: 'spold-107a', spoId: 'spo-demo-107', materialItemId: 'mat-mw', materialCode: 'WLD-WIR-ER70', materialName: 'MIG Wire ER70S-6', orderedQty: 120, uom: 'kg', rate: 142, value: 17040, committedDate: '2026-11-12', receivedQty: 0, acceptedQty: 0, rejectedQty: 0, tolerancePct: 5, status: 'pending' },
  { id: 'spold-108a', spoId: 'spo-demo-108', materialItemId: 'mat-msp', materialCode: 'MS-PPE-100', materialName: 'MS Pipe 100NB Sch40', grade: 'IS 1239 Heavy', orderedQty: 350, uom: 'kg', rate: 88, value: 30800, committedDate: '2026-11-15', receivedQty: 0, acceptedQty: 0, rejectedQty: 0, tolerancePct: 5, status: 'pending' },
  { id: 'spold-109a', spoId: 'spo-demo-109', materialItemId: 'mat-42crmo4', materialCode: 'FRG-42CD4-RND', materialName: 'Steel Grade 42CrMo4 Forged Round Billet', grade: 'EN 10083-3 42CrMo4', orderedQty: 600, uom: 'kg', rate: 238, value: 142800, committedDate: '2026-11-12', receivedQty: 400, acceptedQty: 250, rejectedQty: 0, tolerancePct: 5, status: 'partial' },
];

export const DEMO_GRNS: GoodsReceipt[] = [
  {
    id: 'grn-demo-109',
    grnNumber: 'GRN-2026-109',
    supplierId: 'supp-sfa',
    supplierName: 'SteelForge Alloys Pvt Ltd',
    spoId: 'spo-demo-109',
    spoNumber: 'SPO-2026-109',
    receivedDate: '2026-11-04',
    receivedBy: 'Asha Nair',
    deliveryChallan: 'DC-SFA-4410',
    vehicleNumber: 'MH12TR8821',
    status: 'qc_hold',
    lineCount: 1,
    siteId: 'site-hyd',
    siteName: 'Hyderabad Plant 1',
    storeLocationId: 'loc-qrn',
    storeLocationName: 'Quarantine Store',
    lines: [
      {
        id: 'grnld-109a',
        spoLineId: 'spold-109a',
        materialItemId: 'mat-42crmo4',
        materialCode: 'FRG-42CD4-RND',
        materialName: 'Steel Grade 42CrMo4 Forged Round Billet',
        grade: 'EN 10083-3 42CrMo4',
        orderedQty: 600,
        previouslyReceivedQty: 0,
        receivedQty: 400,
        uom: 'kg',
        lots: [
          { id: 'grnlot-109a', lotId: 'lot-demo-109a', lotNumber: 'LOT-2026-109A', supplierLotRef: 'HT-SFA-901', grade: 'EN 10083-3 42CrMo4', qty: 250, uom: 'kg', qualityStatus: 'accepted' },
          { id: 'grnlot-109b', lotId: 'lot-demo-109b', lotNumber: 'LOT-2026-109B', supplierLotRef: 'HT-SFA-902', grade: 'EN 10083-3 42CrMo4', qty: 150, uom: 'kg', qualityStatus: 'qc_hold', notes: 'Ultrasonic spot check pending' },
        ],
      },
    ],
  },
];

export const DEMO_LOTS: MaterialLot[] = [
  { id: 'lot-demo-109a', lotNumber: 'LOT-2026-109A', heatNumber: 'HT-SFA-901', supplierBatchRef: 'HT-SFA-901', materialItemId: 'mat-42crmo4', materialName: 'Steel Grade 42CrMo4 Forged Round Billet', supplierId: 'supp-sfa', supplierName: 'SteelForge Alloys', grnId: 'grn-demo-109', spoId: 'spo-demo-109', receivedDate: '2026-11-04', grade: 'EN 10083-3 42CrMo4', status: 'available', storeLocationId: 'loc-rm', storeLocationName: 'Raw Material Store', primaryQty: 250, primaryUom: 'kg', certStatus: 'verified' },
  { id: 'lot-demo-109b', lotNumber: 'LOT-2026-109B', heatNumber: 'HT-SFA-902', supplierBatchRef: 'HT-SFA-902', materialItemId: 'mat-42crmo4', materialName: 'Steel Grade 42CrMo4 Forged Round Billet', supplierId: 'supp-sfa', supplierName: 'SteelForge Alloys', grnId: 'grn-demo-109', spoId: 'spo-demo-109', receivedDate: '2026-11-04', grade: 'EN 10083-3 42CrMo4', status: 'qc_hold', storeLocationId: 'loc-qrn', storeLocationName: 'Quarantine Store', primaryQty: 150, primaryUom: 'kg', certStatus: 'pending' },
];

export const DEMO_INSPECTIONS: Inspection[] = [
  {
    id: 'ins-demo-109b',
    inspectionNumber: 'INSP-2026-109B',
    type: 'Incoming',
    lotId: 'lot-demo-109b',
    grnId: 'grn-demo-109',
    poId: 'spo-demo-109',
    spoNumber: 'SPO-2026-109',
    subject: 'Incoming Steel Grade 42CrMo4 Forged Round Billet (Lot 109B)',
    inspectorId: 'u-qc',
    inspectorName: 'Priya Patel',
    receivedDate: '2026-11-04',
    date: '2026-11-05',
    templateName: 'Incoming Billet UT & Dimensional Check',
    sampleQty: 150,
    acceptedQty: 0,
    rejectedQty: 0,
    result: 'pending',
    remarks: 'Hold pending UT scan verification on second heat batch HT-SFA-902.',
  },
];

// ── Sales-to-Production End-to-End Scenarios (§39.2) ──
export const DEMO_SALES_RFQS: CustomerRFQ[] = [
  { id: 'rfq-demo-a', rfqNumber: 'RFQ-2026-201', customerId: 'cust-mer', customerName: 'Meridian Engineering', receivedDate: '2026-10-29', requiredBy: '2026-11-28', status: 'converted', lineCount: 1, channel: 'Email', owner: 'Anita Mehta', convertedPoId: 'cpo-demo-a', quotationIds: ['qt-demo-a-r1', 'qt-demo-a'], lines: [{ id: 'rfql-da1', rfqId: 'rfq-demo-a', lineNumber: 1, productName: 'MS Fabricated Pump Skid Base (8mm Plate)', drawingNumber: 'MER-SKD-201', drawingRevision: 'B', description: 'MS Fabricated Pump Skid Base (8mm Plate)', material: 'IS 2062 E250', qty: 20, uom: 'pcs', targetPrice: 12000, requiredDate: '2026-11-28' }] },
  { id: 'rfq-demo-b', rfqNumber: 'RFQ-2026-202', customerId: 'cust-lt', customerName: 'L&T Hydrocarbon', receivedDate: '2026-11-01', requiredBy: '2026-11-30', status: 'converted', lineCount: 1, channel: 'Portal', owner: 'Anita Mehta', convertedPoId: 'cpo-demo-short', quotationIds: ['qt-demo-b'], lines: [{ id: 'rfql-db1', rfqId: 'rfq-demo-b', lineNumber: 1, productName: '100NB Sch40 Process Header Spools', drawingNumber: 'LTH-HDR-202', drawingRevision: 'A', description: '100NB Sch40 Process Header Spools', material: 'IS 1239 Heavy', qty: 20, uom: 'pcs', targetPrice: 16500, requiredDate: '2026-11-30' }] },
];

export const DEMO_CUSTOMER_QUOTATIONS: CustomerQuotation[] = [
  // Superseded Rev 1 of Quote A (demonstrates revision history)
  {
    id: 'qt-demo-a-r1', quotationNumber: 'QT-2026-201', rfqId: 'rfq-demo-a', rfqNumber: 'RFQ-2026-201',
    customerId: 'cust-mer', customerName: 'Meridian Engineering', quotationDate: '2026-10-30', validUntil: '2026-11-20',
    currency: 'INR', status: 'superseded', totalValue: 260000, revision: 1, version: 1, owner: 'Anita Mehta',
    paymentTerms: 'Net 30', deliveryTerms: 'Ex-Works Hyderabad',
    notes: 'Rev 1 revised after customer requested volume discount for 20 units.',
  },
  // Accepted Rev 2 of Quote A
  {
    id: 'qt-demo-a', quotationNumber: 'QT-2026-201-R2', parentQuotationId: 'qt-demo-a-r1', rfqId: 'rfq-demo-a', rfqNumber: 'RFQ-2026-201',
    customerId: 'cust-mer', customerName: 'Meridian Engineering', quotationDate: '2026-11-01', validUntil: '2026-11-30',
    currency: 'INR', status: 'accepted', totalValue: 240000, revision: 2, version: 2, owner: 'Anita Mehta',
    paymentTerms: 'Net 30', deliveryTerms: 'Ex-Works Hyderabad', acceptedDate: '2026-11-02', acceptedBy: 'Anil Nair (Meridian)',
    notes: 'Revised unit rate ₹12,000 accepted by customer PO CPO-2026-200.',
  },
  // Quote B (led to Shortage PO)
  {
    id: 'qt-demo-b', quotationNumber: 'QT-2026-202', rfqId: 'rfq-demo-b', rfqNumber: 'RFQ-2026-202',
    customerId: 'cust-lt', customerName: 'L&T Hydrocarbon', quotationDate: '2026-11-03', validUntil: '2026-11-28',
    currency: 'INR', status: 'accepted', totalValue: 330000, revision: 1, version: 1, owner: 'Anita Mehta',
    paymentTerms: 'Net 45', deliveryTerms: 'DDP Mumbai', acceptedDate: '2026-11-04', acceptedBy: 'Pradeep Shah',
  },
  // Quote C (Submitted Direct Quotation — ready to test Accept / Revise / Convert to PO)
  {
    id: 'qt-demo-c', quotationNumber: 'QT-2026-203', isDirectQuotation: true,
    customerId: 'cust-bpe', customerName: 'Bharat Power Equipment', quotationDate: '2026-11-05', validUntil: '2026-12-05',
    currency: 'INR', status: 'submitted', totalValue: 185000, revision: 1, version: 1, owner: 'Anita Mehta',
    paymentTerms: 'Net 30', deliveryTerms: 'FOR Hyderabad',
    notes: 'Direct quotation submitted against verbal engineering enquiry; awaiting customer acceptance or revision.',
  },
];

export const DEMO_CUSTOMER_QUOTATION_LINES: CustomerQuotationLine[] = [
  { id: 'qdl-a1r1', quotationId: 'qt-demo-a-r1', productId: 'fg-001', productName: 'MS Fabricated Pump Skid Base (8mm Plate)', drawingNumber: 'MER-SKD-201', drawingRevision: 'B', orderedQty: 20, uom: 'pcs', unitPrice: 13000, value: 260000, requiredDate: '2026-11-28' },
  { id: 'qdl-a1', quotationId: 'qt-demo-a', productId: 'fg-001', productName: 'MS Fabricated Pump Skid Base (8mm Plate)', drawingNumber: 'MER-SKD-201', drawingRevision: 'B', orderedQty: 20, uom: 'pcs', unitPrice: 12000, value: 240000, requiredDate: '2026-11-28' },
  { id: 'qdl-b1', quotationId: 'qt-demo-b', productId: 'fg-003', productName: '100NB Sch40 Process Header Spools', drawingNumber: 'LTH-HDR-202', drawingRevision: 'A', orderedQty: 20, uom: 'pcs', unitPrice: 16500, value: 330000, requiredDate: '2026-11-30' },
  { id: 'qdl-c1', quotationId: 'qt-demo-c', productId: 'fg-002', productName: 'Machined Stator Mounting Ring (SS 304L)', drawingNumber: 'BPE-RNG-203', drawingRevision: 'A', orderedQty: 10, uom: 'pcs', unitPrice: 18500, value: 185000, requiredDate: '2026-12-02' },
];

export const DEMO_SALES_POS: CustomerPO[] = [
  // Scenario A: Happy Path — Material Available -> Production -> Ready to Dispatch
  {
    id: 'cpo-demo-a', poNumber: 'CPO-2026-200', customerId: 'cust-mer', customerName: 'Meridian Engineering',
    acceptedDate: '2026-11-02', paymentTerms: 'Net 30', status: 'active', totalValue: 240000, currency: 'INR',
    lineCount: 1, quotationRef: 'QT-2026-201-R2', quotationId: 'qt-demo-a', rfqId: 'rfq-demo-a', rfqRef: 'RFQ-2026-201',
    deliveryTerms: 'Ex-Works Hyderabad', originType: 'from_quotation', availabilityStatus: 'available', deliverToSiteId: 'site-hyd', deliverToSiteName: 'Hyderabad Plant 1',
  },
  // Scenario B: Material Unavailable -> Auto PR (PR-2026-110)
  {
    id: 'cpo-demo-short', poNumber: 'CPO-2026-201', customerId: 'cust-lt', customerName: 'L&T Hydrocarbon',
    acceptedDate: '2026-11-04', paymentTerms: 'Net 45', status: 'active', totalValue: 330000, currency: 'INR',
    lineCount: 1, quotationRef: 'QT-2026-202', quotationId: 'qt-demo-b', rfqId: 'rfq-demo-b', rfqRef: 'RFQ-2026-202',
    deliveryTerms: 'DDP Mumbai', originType: 'from_quotation', availabilityStatus: 'awaiting_procurement', deliverToSiteId: 'site-hyd', deliverToSiteName: 'Hyderabad Plant 1',
  },
  // Scenario C: Ready for live Partial Availability Check (600 kg MS Plate 8mm required vs ~515 kg eligible available)
  {
    id: 'cpo-demo-partial', poNumber: 'CPO-2026-202', customerId: 'cust-af', customerName: 'Anand Fabricators',
    acceptedDate: '2026-11-05', paymentTerms: 'Net 15', status: 'active', totalValue: 195000, currency: 'INR',
    lineCount: 1, deliveryTerms: 'Ex-Works Hyderabad', isDirectOrder: true, originType: 'direct_order',
    directOrderReason: 'Repeat heavy base frame order — partial stock check ready to run',
    availabilityStatus: 'not_assessed', deliverToSiteId: 'site-hyd', deliverToSiteName: 'Hyderabad Plant 1',
  },
  // Scenario D: Direct Customer Order without RFQ or Quotation
  {
    id: 'cpo-demo-direct', poNumber: 'CPO-2026-203', customerId: 'cust-ntpc', customerName: 'NTPC Vendor Division',
    acceptedDate: '2026-11-05', paymentTerms: 'Net 60', status: 'active', totalValue: 165000, currency: 'INR',
    lineCount: 1, deliveryTerms: 'FOR NTPC Ramagundam', isDirectOrder: true, originType: 'direct_order',
    directOrderReason: 'Direct emergency spare flange assembly order against Annual Rate Contract',
    availabilityStatus: 'available', deliverToSiteId: 'site-hyd', deliverToSiteName: 'Hyderabad Plant 1',
  },
];

export const DEMO_SALES_PO_LINES: POLine[] = [
  { id: 'cpol-da1', poId: 'cpo-demo-a', drawingNumber: 'MER-SKD-201', revision: 'B', description: 'MS Fabricated Pump Skid Base (8mm Plate)', orderedQty: 20, uom: 'pcs', requiredDate: '2026-11-28', rate: 12000, value: 240000, jobId: 'job-demo-a', jobNumber: 'J-211', status: 'in_progress' },
  { id: 'cpol-db1', poId: 'cpo-demo-short', drawingNumber: 'LTH-HDR-202', revision: 'A', description: '100NB Sch40 Process Header Spools (320 kg MS Pipe)', orderedQty: 320, uom: 'kg', requiredDate: '2026-11-30', rate: 1031, value: 330000, jobId: 'job-demo-short', jobNumber: 'J-210', status: 'pending' },
  { id: 'cpol-dc1', poId: 'cpo-demo-partial', drawingNumber: 'AF-FRM-600', revision: 'A', description: 'MS Plate 8mm — Heavy Base Frame (600 kg)', orderedQty: 600, uom: 'kg', requiredDate: '2026-11-26', rate: 325, value: 195000, status: 'pending' },
  { id: 'cpol-dd1', poId: 'cpo-demo-direct', drawingNumber: 'NTPC-FLG-203', revision: 'C', description: 'Machined Coupling Flange Set (Grade 10.9 Bolts)', orderedQty: 15, uom: 'sets', requiredDate: '2026-11-22', rate: 11000, value: 165000, jobId: 'job-demo-direct', jobNumber: 'J-213', status: 'in_progress' },
];

export const DEMO_SALES_JOBS: Job[] = [
  // Happy path active job progressing cleanly
  {
    id: 'job-demo-a', jobNumber: 'J-211', customerId: 'cust-mer', customerName: 'Meridian Engineering',
    customerPoId: 'cpo-demo-a', customerPoNumber: 'CPO-2026-200', poLineId: 'cpol-da1', drawingRef: 'MER-SKD-201 Rev B',
    description: 'MS Fabricated Pump Skid Base — 20 pcs', siteId: 'site-hyd', siteName: 'Hyderabad Plant 1',
    status: 'active', priority: 'normal', plannedStart: '2026-11-03', plannedEnd: '2026-11-26', actualStart: '2026-11-03',
    owner: 'Suresh Kumar', currentStage: 'Welding', materialReadiness: 'ready', hasBlocker: false, value: 240000,
    stageTemplateId: 'tmpl-standard-fabrication', stageTemplateName: 'Standard Fabrication Workflow',
    stages: [
      { id: 'stgd-211-1', jobId: 'job-demo-a', sequence: 1, name: 'Cutting', status: 'complete', plannedStart: '2026-11-03', plannedEnd: '2026-11-04', actualStart: '2026-11-03', actualEnd: '2026-11-04', owner: 'Mohan Das', workCentre: 'Cutting Bay', inputQty: 20, completedGoodQty: 20, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'pcs' },
      { id: 'stgd-211-2', jobId: 'job-demo-a', sequence: 2, name: 'Fit-up', status: 'complete', plannedStart: '2026-11-05', plannedEnd: '2026-11-06', actualStart: '2026-11-05', actualEnd: '2026-11-06', owner: 'Mohan Das', workCentre: 'Fabrication Bay', inputQty: 20, completedGoodQty: 20, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'pcs' },
      { id: 'stgd-211-3', jobId: 'job-demo-a', sequence: 3, name: 'Welding', status: 'in_progress', plannedStart: '2026-11-07', plannedEnd: '2026-11-14', actualStart: '2026-11-07', owner: 'Mohan Das', workCentre: 'Welding Bay', inputQty: 20, completedGoodQty: 10, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'pcs' },
      { id: 'stgd-211-4', jobId: 'job-demo-a', sequence: 4, name: 'NDT', status: 'pending', plannedStart: '2026-11-15', plannedEnd: '2026-11-18', owner: '', workCentre: 'QC Bay', inputQty: 20, completedGoodQty: 0, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'pcs' },
      { id: 'stgd-211-5', jobId: 'job-demo-a', sequence: 5, name: 'Painting & Dispatch', status: 'pending', plannedStart: '2026-11-19', plannedEnd: '2026-11-26', owner: '', workCentre: 'Paint Bay', inputQty: 20, completedGoodQty: 0, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'pcs' },
    ],
  },
  // Material shortage job linked to CPO-2026-201 & PR-2026-110
  {
    id: 'job-demo-short', jobNumber: 'J-210', customerId: 'cust-lt', customerName: 'L&T Hydrocarbon',
    customerPoId: 'cpo-demo-short', customerPoNumber: 'CPO-2026-201', poLineId: 'cpol-db1', drawingRef: 'LTH-HDR-202 Rev A',
    description: '100NB Sch40 Process Header Spools — awaiting procurement (PR-2026-110)', siteId: 'site-hyd', siteName: 'Hyderabad Plant 1',
    status: 'hold', priority: 'urgent', plannedStart: '2026-11-06', plannedEnd: '2026-11-29',
    owner: 'Suresh Kumar', currentStage: 'Cutting', materialReadiness: 'awaiting_procurement', hasBlocker: true, value: 330000,
    stageTemplateId: 'tmpl-standard-fabrication', stageTemplateName: 'Standard Fabrication Workflow',
    stages: [
      { id: 'stgd-210-1', jobId: 'job-demo-short', sequence: 1, name: 'Cutting', status: 'hold', plannedStart: '2026-11-06', plannedEnd: '2026-11-10', owner: 'Mohan Das', workCentre: 'Cutting Bay', inputQty: 20, completedGoodQty: 0, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'pcs' },
      { id: 'stgd-210-2', jobId: 'job-demo-short', sequence: 2, name: 'Fit-up', status: 'pending', plannedStart: '2026-11-11', plannedEnd: '2026-11-15', owner: '', workCentre: 'Fabrication Bay', inputQty: 20, completedGoodQty: 0, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'pcs' },
      { id: 'stgd-210-3', jobId: 'job-demo-short', sequence: 3, name: 'Welding', status: 'pending', plannedStart: '2026-11-16', plannedEnd: '2026-11-24', owner: '', workCentre: 'Welding Bay', inputQty: 20, completedGoodQty: 0, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'pcs' },
    ],
  },
  // Direct order active job
  {
    id: 'job-demo-direct', jobNumber: 'J-213', customerId: 'cust-ntpc', customerName: 'NTPC Vendor Division',
    customerPoId: 'cpo-demo-direct', customerPoNumber: 'CPO-2026-203', poLineId: 'cpol-dd1', drawingRef: 'NTPC-FLG-203 Rev C',
    description: 'Direct Order: Machined Coupling Flange Set — 15 sets', siteId: 'site-hyd', siteName: 'Hyderabad Plant 1',
    status: 'active', priority: 'high', plannedStart: '2026-11-05', plannedEnd: '2026-11-21', actualStart: '2026-11-05',
    owner: 'Suresh Kumar', currentStage: 'Machining', materialReadiness: 'ready', hasBlocker: false, value: 165000,
    stageTemplateId: 'tmpl-structural-express', stageTemplateName: 'Express Machined Component Route',
    stages: [
      { id: 'stgd-213-1', jobId: 'job-demo-direct', sequence: 1, name: 'Machining', status: 'in_progress', plannedStart: '2026-11-05', plannedEnd: '2026-11-14', actualStart: '2026-11-05', owner: 'Mohan Das', workCentre: 'Machining Bay', inputQty: 15, completedGoodQty: 5, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'sets' },
      { id: 'stgd-213-2', jobId: 'job-demo-direct', sequence: 2, name: 'Final Inspection', status: 'pending', plannedStart: '2026-11-15', plannedEnd: '2026-11-17', owner: '', workCentre: 'QC Bay', inputQty: 15, completedGoodQty: 0, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'sets' },
      { id: 'stgd-213-3', jobId: 'job-demo-direct', sequence: 3, name: 'Dispatch Prep', status: 'pending', plannedStart: '2026-11-18', plannedEnd: '2026-11-21', owner: '', workCentre: 'Dispatch Bay', inputQty: 15, completedGoodQty: 0, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'sets' },
    ],
  },
  // Cancelled job preserving history and inventory disposition
  {
    id: 'job-demo-cancel', jobNumber: 'J-214', customerId: 'cust-sv', customerName: 'SV Industries',
    drawingRef: 'SV-DWG-092', description: 'Cancelled prototype bracket batch (Customer design change)', siteId: 'site-hyd', siteName: 'Hyderabad Plant 1',
    status: 'cancelled', priority: 'low', plannedStart: '2026-10-28', plannedEnd: '2026-11-15', actualStart: '2026-10-29',
    owner: 'Suresh Kumar', currentStage: 'Cancelled', materialReadiness: 'ready', hasBlocker: false, value: 64000,
    cancellationReason: 'Customer withdrew design Rev A in favour of welded assembly; 80 kg unused reserved MS Flat Bar returned to free stock.',
    cancelledAt: '2026-11-02T15:30:00',
    cancelledBy: 'Ranjith Kodakandla',
    cancellationDisposition: {
      reason: 'Customer design change Rev A -> Rev B',
      materialName: 'MS Flat Bar 50×6',
      materialUom: 'kg',
      reservedReleasedQty: 80,
      issuedQty: 20,
      consumedQty: 20,
      wip: 'retain',
      finishedGoods: 'not_applicable',
      recordedAt: '2026-11-02T15:30:00',
      recordedBy: 'Ranjith Kodakandla',
    },
    stageTemplateId: 'tmpl-structural-express', stageTemplateName: 'Express Machined Component Route',
    stages: [
      { id: 'stgd-214-1', jobId: 'job-demo-cancel', sequence: 1, name: 'Machining', status: 'skipped', plannedStart: '2026-10-29', plannedEnd: '2026-11-05', actualStart: '2026-10-29', owner: 'Mohan Das', workCentre: 'Machining Bay', inputQty: 10, completedGoodQty: 2, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'pcs' },
      { id: 'stgd-214-2', jobId: 'job-demo-cancel', sequence: 2, name: 'Final Inspection', status: 'skipped', plannedStart: '2026-11-06', plannedEnd: '2026-11-08', owner: '', workCentre: 'QC Bay', inputQty: 10, completedGoodQty: 0, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'pcs' },
    ],
  },
];

export const DEMO_SALES_JOB_REQS: JobMaterialReq[] = [
  { id: 'jmr-demo-a1', jobId: 'job-demo-a', stageId: 'stgd-211-1', stageName: 'Cutting', materialItemId: 'mat-ms8', materialName: 'MS Plate 8mm', requiredQty: 180, reservedQty: 180, issuedQty: 180, uom: 'kg', shortage: false, lotIds: ['lot-001'] },
  { id: 'jmr-demo-b1', jobId: 'job-demo-short', stageId: 'stgd-210-1', stageName: 'Cutting', materialItemId: 'mat-msp', materialName: 'MS Pipe 100NB Sch40', requiredQty: 320, reservedQty: 0, issuedQty: 0, uom: 'kg', shortage: true, lotIds: [] },
  { id: 'jmr-demo-d1', jobId: 'job-demo-direct', stageId: 'stgd-213-1', stageName: 'Machining', materialItemId: 'mat-msfb', materialName: 'MS Flat Bar 50×6', requiredQty: 120, reservedQty: 120, issuedQty: 60, uom: 'kg', shortage: false, lotIds: ['lot-006'] },
];

export const DEMO_SALES_DISPATCHES: Dispatch[] = [
  {
    id: 'dsp-demo-201',
    dispatchNumber: 'DSP-2026-201',
    customerId: 'cust-mer',
    customerName: 'Meridian Engineering',
    customerPoId: 'cpo-demo-a',
    customerPoNumber: 'CPO-2026-200',
    poLineId: 'cpol-da1',
    jobId: 'job-demo-a',
    jobNumber: 'J-211',
    jobs: ['J-211'],
    dispatchDate: '2026-11-25',
    expectedDelivery: '2026-11-27',
    carrier: 'Blue Dart Surface',
    vehicleNumber: 'TS09UB7712',
    lrNumber: 'BD-HYD-88291',
    lineCount: 1,
    totalQty: 20,
    status: 'pending_docs',
    hasPoD: false,
    sourceSiteId: 'site-hyd',
    sourceStoreLocationId: 'loc-dsp',
  },
];
