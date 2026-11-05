// Deterministic reference date for all prototype time calculations — do not use new Date()
export const DEMO_NOW = '2026-11-05';

import type {
  DemoUser, Site, StoreLocation, Party, MaterialItem, MaterialLot,
  CustomerRFQ, CustomerPO, POLine, SupplierPO, SupplierPOLine,
  PurchaseRequisition, Job, JobStage, JobUpdate, JobMaterialReq, JobBlocker,
  GoodsReceipt, StockMovement, InventoryItem, MaterialCertificate,
  Inspection, NCR, QualityRelease, Asset, MaintenanceEvent,
  Dispatch, VaultDocument, ApprovalRequest, AppNotification, PulseException,
  Employee, SupplierQuotation, AuditEvent, ApprovalPolicy
} from '../types';

// ── Users ──
export const DEMO_USERS: DemoUser[] = [
  { id: 'u-owner', name: 'Ranjith Kodakandla', role: 'owner', email: 'ranjith@srilakshmitraders.com', avatar: 'RK', site: 'site-hyd' },
  { id: 'u-sales', name: 'Anita Mehta', role: 'sales', email: 'anita@shankarmfg.com', avatar: 'AM', site: 'site-hyd' },
  { id: 'u-buyer', name: 'Karthik Raju', role: 'buyer', email: 'karthik@shankarmfg.com', avatar: 'KR', site: 'site-hyd' },
  { id: 'u-store', name: 'Asha Nair', role: 'storekeeper', email: 'asha@shankarmfg.com', avatar: 'AN', site: 'site-hyd' },
  { id: 'u-super', name: 'Suresh Kumar', role: 'supervisor', email: 'suresh@shankarmfg.com', avatar: 'SK', site: 'site-hyd' },
  { id: 'u-oper', name: 'Mohan Das', role: 'operator', email: 'mohan@shankarmfg.com', avatar: 'MD', site: 'site-hyd' },
  { id: 'u-qc', name: 'Priya Patel', role: 'qc', email: 'priya@shankarmfg.com', avatar: 'PP', site: 'site-hyd' },
  { id: 'u-maint', name: 'Venkat Rao', role: 'maintenance', email: 'venkat@shankarmfg.com', avatar: 'VR', site: 'site-hyd' },
  { id: 'u-disp', name: 'Deepa Singh', role: 'dispatch', email: 'deepa@shankarmfg.com', avatar: 'DS', site: 'site-hyd' },
  { id: 'u-audit', name: 'External Auditor', role: 'auditor', email: 'audit@external.com', avatar: 'EA', site: 'site-hyd' },
];

// ── Employees ──
export const EMPLOYEES: Employee[] = [
  { id: 'emp-001', userId: 'u-owner', employeeCode: 'EMP-001', name: 'Ravi Shankar', role: 'owner', department: 'Management', designation: 'Managing Director', joiningDate: '2010-04-01', siteId: 'site-hyd' },
  { id: 'emp-002', userId: 'u-sales', employeeCode: 'EMP-002', name: 'Anita Mehta', role: 'sales', department: 'Sales', designation: 'Sales Manager', joiningDate: '2016-07-01', siteId: 'site-hyd' },
  { id: 'emp-003', userId: 'u-buyer', employeeCode: 'EMP-003', name: 'Karthik Raju', role: 'buyer', department: 'Purchase', designation: 'Purchase Manager', joiningDate: '2018-03-15', siteId: 'site-hyd' },
  { id: 'emp-004', userId: 'u-store', employeeCode: 'EMP-004', name: 'Asha Nair', role: 'storekeeper', department: 'Store', designation: 'Storekeeper', joiningDate: '2019-06-01', siteId: 'site-hyd' },
  { id: 'emp-005', userId: 'u-super', employeeCode: 'EMP-005', name: 'Suresh Kumar', role: 'supervisor', department: 'Production', designation: 'Production Supervisor', joiningDate: '2015-09-01', siteId: 'site-hyd' },
  { id: 'emp-006', userId: 'u-oper', employeeCode: 'EMP-006', name: 'Mohan Das', role: 'operator', department: 'Production', designation: 'Welding Operator', joiningDate: '2017-02-01', siteId: 'site-hyd' },
  { id: 'emp-007', userId: 'u-qc', employeeCode: 'EMP-007', name: 'Priya Patel', role: 'qc', department: 'Quality', designation: 'QC Inspector', joiningDate: '2020-01-15', siteId: 'site-hyd' },
  { id: 'emp-008', userId: 'u-maint', employeeCode: 'EMP-008', name: 'Venkat Rao', role: 'maintenance', department: 'Maintenance', designation: 'Maintenance Technician', joiningDate: '2016-11-01', siteId: 'site-hyd' },
  { id: 'emp-009', userId: 'u-disp', employeeCode: 'EMP-009', name: 'Deepa Singh', role: 'dispatch', department: 'Dispatch', designation: 'Dispatch Coordinator', joiningDate: '2021-04-01', siteId: 'site-hyd' },
  { id: 'emp-010', userId: 'u-audit', employeeCode: 'EMP-010', name: 'External Auditor', role: 'auditor', department: 'External', designation: 'Quality Auditor', joiningDate: '2026-01-01', siteId: 'site-hyd' },
];

// ── Sites ──
export const SITES: Site[] = [
  { id: 'site-hyd', name: 'Hyderabad Factory', code: 'HYD', city: 'Hyderabad' },
  { id: 'site-wh', name: 'Hyderabad Warehouse', code: 'WHY', city: 'Hyderabad' },
];

export const STORE_LOCATIONS: StoreLocation[] = [
  { id: 'loc-rm', siteId: 'site-hyd', name: 'Raw Material Store', code: 'RM', locationType: 'RM' },
  { id: 'loc-wip', siteId: 'site-hyd', name: 'WIP Store', code: 'WIP', locationType: 'WIP' },
  { id: 'loc-fg', siteId: 'site-hyd', name: 'Finished Goods Store', code: 'FG', locationType: 'FG' },
  { id: 'loc-qrn', siteId: 'site-hyd', name: 'Quarantine Store', code: 'QRN', locationType: 'Quarantine' },
  { id: 'loc-spr', siteId: 'site-hyd', name: 'Spare Parts Store', code: 'SPR', locationType: 'Spares' },
  { id: 'loc-dsp', siteId: 'site-hyd', name: 'Dispatch Bay', code: 'DSP', locationType: 'Dispatch' },
  { id: 'loc-wba', siteId: 'site-wh', name: 'Warehouse Bay A', code: 'WBA', locationType: 'Warehouse' },
  { id: 'loc-wbb', siteId: 'site-wh', name: 'Warehouse Bay B', code: 'WBB', locationType: 'Warehouse' },
];

// ── Parties ──
export const CUSTOMERS: Party[] = [
  { id: 'cust-bpe', partyType: 'Customer', legalName: 'Bharat Power Equipment Ltd', tradingName: 'Bharat Power', panNumber: 'AABCB1234F', gstin: '36AABCB1234F1ZP', state: 'Telangana', paymentTerms: 'Net 45', creditLimit: 5000000, currency: 'INR', status: 'active', contactPerson: 'Ramesh Gupta', phone: '9100001234', email: 'purchase@bharatpower.in', city: 'Hyderabad', since: '2019' },
  { id: 'cust-ntpc', partyType: 'Customer', legalName: 'NTPC Vendor Division', tradingName: 'NTPC', panNumber: 'AAACN1234G', gstin: '07AAACN1234G1ZK', state: 'Delhi', paymentTerms: 'Net 60', creditLimit: 10000000, currency: 'INR', status: 'active', contactPerson: 'Sunil Kapoor', phone: '9811001234', email: 'vendor@ntpc.co.in', city: 'New Delhi', since: '2021' },
  { id: 'cust-mer', partyType: 'Customer', legalName: 'Meridian Engineering Pvt Ltd', tradingName: 'Meridian', panNumber: 'AABCM5678H', gstin: '29AABCM5678H1ZL', state: 'Karnataka', paymentTerms: 'Net 30', creditLimit: 2000000, currency: 'INR', status: 'active', contactPerson: 'Anil Nair', phone: '9845001234', email: 'purchase@meridian-eng.com', city: 'Bengaluru', since: '2020' },
  { id: 'cust-lt', partyType: 'Customer', legalName: 'L&T Hydrocarbon Engineering', tradingName: 'L&T HC', panNumber: 'AAACL9012I', gstin: '27AAACL9012I1ZM', state: 'Maharashtra', paymentTerms: 'Net 45', creditLimit: 8000000, currency: 'INR', status: 'active', contactPerson: 'Pradeep Shah', phone: '9820001234', email: 'subcontract@lthydrocarbon.com', city: 'Mumbai', since: '2022' },
  { id: 'cust-af', partyType: 'Customer', legalName: 'Anand Fabricators', tradingName: 'Anand Fab', panNumber: 'AABCA3456J', gstin: '36AABCA3456J1ZN', state: 'Telangana', paymentTerms: 'Net 15', creditLimit: 500000, currency: 'INR', status: 'active', contactPerson: 'Anand Reddy', phone: '9949001234', email: 'anand@anandfab.com', city: 'Hyderabad', since: '2018' },
  { id: 'cust-sv', partyType: 'Customer', legalName: 'Sri Venkateswara Industries', tradingName: 'SV Industries', panNumber: 'AABCS7890K', gstin: '36AABCS7890K1ZO', state: 'Telangana', paymentTerms: 'Net 30', creditLimit: 1000000, currency: 'INR', status: 'active', contactPerson: 'Venkatesh M', phone: '9966001234', email: 'purchase@svindustries.com', city: 'Warangal', since: '2017' },
];

export const SUPPLIERS: Party[] = [
  { id: 'supp-msk', partyType: 'Supplier', legalName: 'MSK Steel Pvt Ltd', tradingName: 'MSK Steel', panNumber: 'AABCM1111A', gstin: '36AABCM1111A1ZQ', state: 'Telangana', paymentTerms: 'Net 30', currency: 'INR', category: 'Raw Material', rating: 4, status: 'active', contactPerson: 'Mahesh Kumar', phone: '9100005678', email: 'sales@msksteel.com', city: 'Hyderabad', since: '2018' },
  { id: 'supp-ssi', partyType: 'Supplier', legalName: 'Stainless Source India Pvt Ltd', tradingName: 'Stainless Source', panNumber: 'AABCS2222B', gstin: '27AABCS2222B1ZR', state: 'Maharashtra', paymentTerms: 'Net 45', currency: 'INR', category: 'Raw Material', rating: 3, status: 'active', contactPerson: 'Ramesh Joshi', phone: '9820005678', email: 'sales@stainlesssource.com', city: 'Pune', since: '2020' },
  { id: 'supp-rkf', partyType: 'Supplier', legalName: 'RK Fasteners & Hardware', tradingName: 'RK Fasteners', panNumber: 'AABCR3333C', gstin: '36AABCR3333C1ZS', state: 'Telangana', paymentTerms: 'Net 15', currency: 'INR', category: 'Fasteners', rating: 5, status: 'active', contactPerson: 'Ravi Kumar', phone: '9100009012', email: 'rkfasteners@gmail.com', city: 'Hyderabad', since: '2017' },
  { id: 'supp-bgs', partyType: 'Supplier', legalName: 'Bharat Gas Supply Co', tradingName: 'Bharat Gas', panNumber: 'AABCB4444D', gstin: '36AABCB4444D1ZT', state: 'Telangana', paymentTerms: 'Net 15', currency: 'INR', category: 'Consumables', rating: 4, status: 'active', contactPerson: 'Bhanu Prakash', phone: '9100003456', email: 'orders@bharatgas.com', city: 'Hyderabad', since: '2019' },
  { id: 'supp-apex', partyType: 'Supplier', legalName: 'Apex Consumables Pvt Ltd', tradingName: 'Apex Consumables', panNumber: 'AABCA5555E', gstin: '36AABCA5555E1ZU', state: 'Telangana', paymentTerms: 'Net 30', currency: 'INR', category: 'Consumables', rating: 4, status: 'active', contactPerson: 'Apex Admin', phone: '9100007890', email: 'orders@apexconsumables.com', city: 'Hyderabad', since: '2020' },
  { id: 'supp-sct', partyType: 'Supplier', legalName: 'SteelCraft Tubes Pvt Ltd', tradingName: 'SteelCraft', panNumber: 'AABCS6666F', gstin: '29AABCS6666F1ZV', state: 'Karnataka', paymentTerms: 'Net 30', currency: 'INR', category: 'Raw Material', rating: 4, status: 'active', contactPerson: 'Suresh CT', phone: '9845007890', email: 'sales@steelcrafttubes.com', city: 'Bengaluru', since: '2021' },
  { id: 'supp-pcl', partyType: 'Supplier', legalName: 'Precision Components Ltd', tradingName: 'Precision Components', panNumber: 'AABCP7777G', gstin: '36AABCP7777G1ZW', state: 'Telangana', paymentTerms: 'Net 45', currency: 'INR', category: 'Subcontractor', rating: 4, status: 'active', contactPerson: 'Prakash N', phone: '9100002345', email: 'subcontract@precisioncomp.com', city: 'Hyderabad', since: '2020' },
  { id: 'supp-msd', partyType: 'Supplier', legalName: 'Metro Scrap Dealers', tradingName: 'Metro Scrap', panNumber: 'AABCM8888H', gstin: '36AABCM8888H1ZX', state: 'Telangana', paymentTerms: 'Advance', currency: 'INR', category: 'Scrap', rating: 3, status: 'active', contactPerson: 'Metro Admin', phone: '9100006789', email: 'metro@scrap.com', city: 'Hyderabad', since: '2022' },
];

// ── Materials ──
export const MATERIALS: MaterialItem[] = [
  { id: 'mat-ms8', itemCode: 'MS-PLT-008', name: 'MS Plate 8mm', categoryId: 'cat-ms', categoryName: 'MS Steel', primaryUom: 'kg', secondaryUom: 'm²', conversionFactor: 62.8, conversionMethod: 'weight_per_area', trackingMode: 'heat', reorderPoint: 500, standardGrade: 'IS 2062 E250' },
  { id: 'mat-ms12', itemCode: 'MS-PLT-012', name: 'MS Plate 12mm', categoryId: 'cat-ms', categoryName: 'MS Steel', primaryUom: 'kg', secondaryUom: 'm²', conversionFactor: 94.2, conversionMethod: 'weight_per_area', trackingMode: 'heat', reorderPoint: 300, standardGrade: 'IS 2062 E250' },
  { id: 'mat-msp', itemCode: 'MS-PPE-100', name: 'MS Pipe 100NB Sch40', categoryId: 'cat-ms', categoryName: 'MS Steel', primaryUom: 'kg', secondaryUom: 'm', conversionFactor: 16.1, conversionMethod: 'weight_per_length', trackingMode: 'heat', reorderPoint: 200 },
  { id: 'mat-ss3', itemCode: 'SS-SHT-304-3', name: 'SS Sheet 3mm 304L', categoryId: 'cat-ss', categoryName: 'SS Steel', primaryUom: 'kg', secondaryUom: 'sheet', conversionFactor: 72.0, conversionMethod: 'direct_factor', trackingMode: 'heat', reorderPoint: 150, standardGrade: 'ASTM A240 304L' },
  { id: 'mat-msfb', itemCode: 'MS-FLT-50x6', name: 'MS Flat Bar 50×6', categoryId: 'cat-ms', categoryName: 'MS Steel', primaryUom: 'kg', secondaryUom: 'm', conversionFactor: 2.36, conversionMethod: 'weight_per_length', trackingMode: 'lot', reorderPoint: 100 },
  { id: 'mat-wr', itemCode: 'WLD-ROD-E6013', name: 'Welding Rods E6013 3.15mm', categoryId: 'cat-con', categoryName: 'Consumables', primaryUom: 'pcs', trackingMode: 'none', reorderPoint: 1000 },
  { id: 'mat-mw', itemCode: 'WLD-WIR-ER70', name: 'MIG Wire ER70S-6', categoryId: 'cat-con', categoryName: 'Consumables', primaryUom: 'kg', trackingMode: 'lot', reorderPoint: 50 },
  { id: 'mat-bolt', itemCode: 'FST-BLT-M12x50', name: 'Bolts M12×50 GR8.8', categoryId: 'cat-fst', categoryName: 'Fasteners', primaryUom: 'pcs', trackingMode: 'none', reorderPoint: 500 },
  { id: 'mat-nut', itemCode: 'FST-NUT-M12', name: 'Nuts M12 GR8', categoryId: 'cat-fst', categoryName: 'Fasteners', primaryUom: 'pcs', trackingMode: 'none', reorderPoint: 500 },
  { id: 'mat-ar', itemCode: 'GAS-ARG-CYL', name: 'Argon Gas (Cylinder)', categoryId: 'cat-gas', categoryName: 'Gases', primaryUom: 'cyl', trackingMode: 'none', reorderPoint: 5 },
  { id: 'mat-co2', itemCode: 'GAS-CO2-CYL', name: 'CO₂ Gas (Cylinder)', categoryId: 'cat-gas', categoryName: 'Gases', primaryUom: 'cyl', trackingMode: 'none', reorderPoint: 3 },
  { id: 'mat-gd', itemCode: 'TOL-GRD-125', name: 'Grinding Disc 125mm', categoryId: 'cat-con', categoryName: 'Consumables', primaryUom: 'pcs', trackingMode: 'none', reorderPoint: 50 },
  { id: 'mat-prm', itemCode: 'PNT-PRM-RO', name: 'Primer Paint Red Oxide', categoryId: 'cat-paint', categoryName: 'Paints', primaryUom: 'ltr', trackingMode: 'none', reorderPoint: 20 },
  { id: 'mat-asp', itemCode: 'WLD-SPR-AS', name: 'Anti-spatter Spray', categoryId: 'cat-con', categoryName: 'Consumables', primaryUom: 'can', trackingMode: 'none', reorderPoint: 10 },
  { id: 'mat-eho', itemCode: 'SPR-EHO-WM', name: 'Electrode Holder Spare', categoryId: 'cat-spr', categoryName: 'Spares', primaryUom: 'pcs', trackingMode: 'none', reorderPoint: 2 },
];

// ── Lots ──
export const MATERIAL_LOTS: MaterialLot[] = [
  { id: 'lot-001', lotNumber: 'LOT-2024-001', heatNumber: 'HT-MSK-4471', materialItemId: 'mat-ms8', materialName: 'MS Plate 8mm', supplierId: 'supp-msk', supplierName: 'MSK Steel', grnId: 'grn-003', receivedDate: '2026-10-15', grade: 'IS 2062 E250A', status: 'available', storeLocationId: 'loc-rm', storeLocationName: 'Raw Material Store', primaryQty: 450, primaryUom: 'kg', secondaryQty: 7.17, secondaryUom: 'm²', certStatus: 'verified' },
  { id: 'lot-002', lotNumber: 'LOT-2024-002', heatNumber: 'HT-MSK-4472', materialItemId: 'mat-ms8', materialName: 'MS Plate 8mm', supplierId: 'supp-msk', supplierName: 'MSK Steel', receivedDate: '2026-10-15', grade: 'IS 2062 E250A', status: 'reserved', storeLocationId: 'loc-rm', storeLocationName: 'Raw Material Store', primaryQty: 320, primaryUom: 'kg', secondaryQty: 5.1, secondaryUom: 'm²', certStatus: 'verified' },
  { id: 'lot-003', lotNumber: 'LOT-2024-003', heatNumber: 'HT-SCT-2210', materialItemId: 'mat-msp', materialName: 'MS Pipe 100NB Sch40', supplierId: 'supp-sct', supplierName: 'SteelCraft', receivedDate: '2026-10-18', status: 'issued', storeLocationId: 'loc-wip', storeLocationName: 'WIP Store', primaryQty: 161, primaryUom: 'kg', secondaryQty: 10, secondaryUom: 'm', certStatus: 'verified' },
  { id: 'lot-004', lotNumber: 'LOT-2024-004', heatNumber: 'HT-SSI-8831', materialItemId: 'mat-ss3', materialName: 'SS Sheet 3mm 304L', supplierId: 'supp-ssi', supplierName: 'Stainless Source', receivedDate: '2026-10-28', grade: 'ASTM A240 304L', status: 'qc_hold', storeLocationId: 'loc-qrn', storeLocationName: 'Quarantine Store', primaryQty: 216, primaryUom: 'kg', secondaryQty: 3, secondaryUom: 'sheet', certStatus: 'pending' },
  { id: 'lot-005', lotNumber: 'LOT-2024-005', heatNumber: 'HT-SSI-7720', materialItemId: 'mat-ss3', materialName: 'SS Sheet 3mm 304L', supplierId: 'supp-ssi', supplierName: 'Stainless Source', receivedDate: '2026-09-20', grade: 'ASTM A240 304L', status: 'available', storeLocationId: 'loc-rm', storeLocationName: 'Raw Material Store', primaryQty: 108, primaryUom: 'kg', secondaryQty: 1.5, secondaryUom: 'sheet', certStatus: 'verified' },
  { id: 'lot-006', lotNumber: 'LOT-2024-006', materialItemId: 'mat-msfb', materialName: 'MS Flat Bar 50×6', supplierId: 'supp-msk', supplierName: 'MSK Steel', receivedDate: '2026-10-02', status: 'available', storeLocationId: 'loc-rm', storeLocationName: 'Raw Material Store', primaryQty: 236, primaryUom: 'kg', secondaryQty: 100, secondaryUom: 'm', certStatus: 'none' },
  { id: 'lot-007', lotNumber: 'LOT-2024-007', materialItemId: 'mat-wr', materialName: 'Welding Rods E6013', supplierId: 'supp-apex', supplierName: 'Apex Consumables', receivedDate: '2026-10-10', status: 'available', storeLocationId: 'loc-rm', storeLocationName: 'Raw Material Store', primaryQty: 2000, primaryUom: 'pcs', certStatus: 'none' },
  { id: 'lot-008', lotNumber: 'LOT-2024-008', materialItemId: 'mat-ar', materialName: 'Argon Gas', supplierId: 'supp-bgs', supplierName: 'Bharat Gas', receivedDate: '2026-10-25', status: 'available', storeLocationId: 'loc-rm', storeLocationName: 'Raw Material Store', primaryQty: 3, primaryUom: 'cyl', certStatus: 'none' },
  { id: 'lot-009', lotNumber: 'LOT-2024-009', heatNumber: 'HT-MSK-5103', materialItemId: 'mat-ms12', materialName: 'MS Plate 12mm', supplierId: 'supp-msk', supplierName: 'MSK Steel', grnId: 'grn-005', receivedDate: '2026-11-04', grade: 'IS 2062 E250', status: 'qc_hold', storeLocationId: 'loc-qrn', storeLocationName: 'Quarantine Store', primaryQty: 650, primaryUom: 'kg', secondaryQty: 6.9, secondaryUom: 'm²', certStatus: 'pending' },
  { id: 'lot-010', lotNumber: 'LOT-2024-010', materialItemId: 'mat-ss3', materialName: 'SS Sheet 3mm 304L', supplierId: 'supp-ssi', supplierName: 'Stainless Source', receivedDate: '', status: 'available', storeLocationId: 'loc-rm', storeLocationName: 'Raw Material Store', primaryQty: 0, primaryUom: 'kg', certStatus: 'none' },
  { id: 'lot-011', lotNumber: 'LOT-2024-011', materialItemId: 'mat-gd', materialName: 'Grinding Disc 125mm', supplierId: 'supp-apex', supplierName: 'Apex Consumables', receivedDate: '2026-10-10', status: 'available', storeLocationId: 'loc-spr', storeLocationName: 'Spare Parts Store', primaryQty: 120, primaryUom: 'pcs', certStatus: 'none' },
  { id: 'lot-012', lotNumber: 'LOT-2024-012R', heatNumber: 'HT-MSK-4471', materialItemId: 'mat-ms8', materialName: 'MS Plate 8mm (Remnant)', supplierId: 'supp-msk', supplierName: 'MSK Steel', receivedDate: '2026-10-15', grade: 'IS 2062 E250A', status: 'available', storeLocationId: 'loc-rm', storeLocationName: 'Raw Material Store', primaryQty: 65, primaryUom: 'kg', secondaryQty: 1.03, secondaryUom: 'm²', certStatus: 'verified', parentLotId: 'lot-001' },
];

// ── Customer RFQs ──
export const RFQS: CustomerRFQ[] = [
  { id: 'rfq-001', rfqNumber: 'RFQ-2024-089', customerId: 'cust-mer', customerName: 'Meridian Engineering', receivedDate: '2026-10-28', requiredBy: '2026-11-15', status: 'converted', lineCount: 3, channel: 'Email', owner: 'Anita Mehta' },
  { id: 'rfq-002', rfqNumber: 'RFQ-2024-090', customerId: 'cust-bpe', customerName: 'Bharat Power Equipment', receivedDate: '2026-10-30', requiredBy: '2026-11-20', status: 'quoted', lineCount: 2, channel: 'Portal', owner: 'Anita Mehta' },
  { id: 'rfq-003', rfqNumber: 'RFQ-2024-091', customerId: 'cust-lt', customerName: 'L&T Hydrocarbon', receivedDate: '2026-11-01', requiredBy: '2026-11-25', status: 'open', lineCount: 4, channel: 'Email', owner: 'Anita Mehta' },
  { id: 'rfq-004', rfqNumber: 'RFQ-2024-087', customerId: 'cust-ntpc', customerName: 'NTPC Vendor Division', receivedDate: '2026-10-20', requiredBy: '2026-11-10', status: 'lost', lineCount: 5, channel: 'Tender', owner: 'Anita Mehta' },
  { id: 'rfq-005', rfqNumber: 'RFQ-2024-092', customerId: 'cust-af', customerName: 'Anand Fabricators', receivedDate: '2026-11-02', requiredBy: '2026-11-18', status: 'open', lineCount: 1, channel: 'WhatsApp', owner: 'Anita Mehta' },
];

// ── Customer POs ──
export const CUSTOMER_POS: CustomerPO[] = [
  { id: 'cpo-101', poNumber: 'CPO-2024-101', customerId: 'cust-mer', customerName: 'Meridian Engineering', acceptedDate: '2026-11-01', paymentTerms: 'Net 30', status: 'active', totalValue: 485000, currency: 'INR', lineCount: 3, quotationRef: 'QT-2024-089-R2', deliveryTerms: 'Ex-Works Hyderabad' },
  { id: 'cpo-102', poNumber: 'CPO-2024-102', customerId: 'cust-bpe', customerName: 'Bharat Power Equipment', acceptedDate: '2026-11-02', paymentTerms: 'Net 45', status: 'active', totalValue: 320000, currency: 'INR', lineCount: 2, deliveryTerms: 'FOR Hyderabad', hasAmendment: true },
  { id: 'cpo-103', poNumber: 'CPO-2024-098', customerId: 'cust-af', customerName: 'Anand Fabricators', acceptedDate: '2026-10-15', paymentTerms: 'Net 15', status: 'complete', totalValue: 128000, currency: 'INR', lineCount: 1, deliveryTerms: 'Ex-Works' },
  { id: 'cpo-104', poNumber: 'CPO-2024-099', customerId: 'cust-ntpc', customerName: 'NTPC Vendor Division', acceptedDate: '2026-10-18', paymentTerms: 'Net 60', status: 'active', totalValue: 650000, currency: 'INR', lineCount: 2, deliveryTerms: 'FOR Site' },
  { id: 'cpo-105', poNumber: 'CPO-2024-100', customerId: 'cust-lt', customerName: 'L&T Hydrocarbon', acceptedDate: '2026-10-20', paymentTerms: 'Net 45', status: 'active', totalValue: 290000, currency: 'INR', lineCount: 2, deliveryTerms: 'DDP Mumbai' },
  { id: 'cpo-106', poNumber: 'CPO-2024-103', customerId: 'cust-bpe', customerName: 'Bharat Power Equipment', acceptedDate: '2026-11-03', paymentTerms: 'Net 45', status: 'active', totalValue: 180000, currency: 'INR', lineCount: 1, deliveryTerms: 'FOR Hyderabad' },
  { id: 'cpo-107', poNumber: 'CPO-2024-104', customerId: 'cust-sv', customerName: 'SV Industries', acceptedDate: '2026-11-03', paymentTerms: 'Net 30', status: 'active', totalValue: 95000, currency: 'INR', lineCount: 1, deliveryTerms: 'Ex-Works' },
  { id: 'cpo-108', poNumber: 'CPO-2024-095', customerId: 'cust-mer', customerName: 'Meridian Engineering', acceptedDate: '2026-10-01', paymentTerms: 'Net 30', status: 'complete', totalValue: 220000, currency: 'INR', lineCount: 2, deliveryTerms: 'Ex-Works' },
];

// ── Supplier POs ──
export const SUPPLIER_POS: SupplierPO[] = [
  { id: 'spo-001', poNumber: 'SPO-2024-001', supplierId: 'supp-msk', supplierName: 'MSK Steel Pvt Ltd', raisedDate: '2026-10-28', committedDate: '2026-11-08', status: 'confirmed', totalValue: 95000, currency: 'INR', paymentTerms: 'Net 30', jobRef: 'J-106', lineCount: 2 },
  { id: 'spo-002', poNumber: 'SPO-2024-002', supplierId: 'supp-ssi', supplierName: 'Stainless Source India', raisedDate: '2026-10-25', committedDate: '2026-11-02', status: 'overdue', totalValue: 54000, currency: 'INR', paymentTerms: 'Net 45', jobRef: 'J-102', lineCount: 1, hasAmendment: true },
  { id: 'spo-003', poNumber: 'SPO-2024-003', supplierId: 'supp-apex', supplierName: 'Apex Consumables', raisedDate: '2026-10-10', committedDate: '2026-10-18', status: 'received', totalValue: 18500, currency: 'INR', paymentTerms: 'Net 30', lineCount: 2 },
  { id: 'spo-004', poNumber: 'SPO-2024-004', supplierId: 'supp-bgs', supplierName: 'Bharat Gas Supply', raisedDate: '2026-10-20', committedDate: '2026-10-28', status: 'partial', totalValue: 9000, currency: 'INR', paymentTerms: 'Net 15', lineCount: 2 },
  { id: 'spo-005', poNumber: 'SPO-2024-005', supplierId: 'supp-sct', supplierName: 'SteelCraft Tubes', raisedDate: '2026-10-15', committedDate: '2026-11-05', status: 'confirmed', totalValue: 42000, currency: 'INR', paymentTerms: 'Net 30', jobRef: 'J-101', lineCount: 1 },
];

export const SUPPLIER_PO_LINES: SupplierPOLine[] = [
  { id: 'spl-001a', spoId: 'spo-001', materialItemId: 'mat-ms12', materialName: 'MS Plate 12mm', orderedQty: 650, primaryQty: 650, uom: 'kg', rate: 85, value: 55250, committedDate: '2026-11-08', receivedQty: 650, acceptedQty: 650, rejectedQty: 0, tolerancePct: 5, status: 'received' },
  { id: 'spl-001b', spoId: 'spo-001', materialItemId: 'mat-ms8', materialName: 'MS Plate 8mm', orderedQty: 500, uom: 'kg', rate: 79, value: 39500, committedDate: '2026-11-08', receivedQty: 0, acceptedQty: 0, rejectedQty: 0, tolerancePct: 5, status: 'pending' },
  { id: 'spl-002a', spoId: 'spo-002', materialItemId: 'mat-ss3', materialName: 'SS Sheet 3mm 304L', orderedQty: 300, primaryQty: 300, secondaryQty: 4.17, uom: 'kg', rate: 180, value: 54000, committedDate: '2026-11-02', receivedQty: 0, acceptedQty: 0, rejectedQty: 0, tolerancePct: 2, status: 'overdue' },
  { id: 'spl-003a', spoId: 'spo-003', materialItemId: 'mat-wr', materialName: 'Welding Rods E6013', orderedQty: 2000, uom: 'pcs', rate: 7, value: 14000, committedDate: '2026-10-18', receivedQty: 2000, acceptedQty: 2000, rejectedQty: 0, tolerancePct: 0, status: 'received' },
  { id: 'spl-003b', spoId: 'spo-003', materialItemId: 'mat-gd', materialName: 'Grinding Disc 125mm', orderedQty: 150, uom: 'pcs', rate: 30, value: 4500, committedDate: '2026-10-18', receivedQty: 120, acceptedQty: 120, rejectedQty: 0, tolerancePct: 10, status: 'partial' },
];

// ── Purchase Requisitions ──
export const PURCHASE_REQS: PurchaseRequisition[] = [
  { id: 'pr-001', prNumber: 'PR-2024-018', raisedBy: 'Suresh Kumar', raisedDate: '2026-10-26', requiredBy: '2026-11-05', jobId: 'job-102', jobNumber: 'J-102', status: 'converted', lineCount: 1, totalQty: 300, priority: 'urgent' },
  { id: 'pr-002', prNumber: 'PR-2024-019', raisedBy: 'Suresh Kumar', raisedDate: '2026-11-01', requiredBy: '2026-11-10', jobId: 'job-104', jobNumber: 'J-104', status: 'approved', lineCount: 2, totalQty: 150, priority: 'high' },
  { id: 'pr-003', prNumber: 'PR-2024-017', raisedBy: 'Asha Nair', raisedDate: '2026-10-20', requiredBy: '2026-11-01', status: 'approved', lineCount: 3, totalQty: 500, priority: 'normal' },
];

// ── Jobs ──
export const JOBS: Job[] = [
  {
    id: 'job-101', jobNumber: 'J-101', customerId: 'cust-mer', customerName: 'Meridian Engineering', customerPoId: 'cpo-101', customerPoNumber: 'CPO-2024-101', drawingRef: 'MER-DWG-2024-RC-V3', description: 'Pressure vessel assembly – reactor chamber', siteId: 'site-hyd', siteName: 'Hyderabad Factory', status: 'active', priority: 'high', plannedStart: '2026-10-28', plannedEnd: '2026-11-18', actualStart: '2026-10-29', owner: 'Suresh Kumar', currentStage: 'Fit-up', materialReadiness: 'ready', hasBlocker: false, value: 185000,
    stages: [
      { id: 'stg-101-1', jobId: 'job-101', sequence: 1, name: 'Cutting', status: 'complete', plannedStart: '2026-10-28', plannedEnd: '2026-10-31', actualStart: '2026-10-29', actualEnd: '2026-10-31', owner: 'Mohan Das', workCentre: 'Cutting Bay', inputQty: 10, completedGoodQty: 10, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'pcs' },
      { id: 'stg-101-2', jobId: 'job-101', sequence: 2, name: 'Fit-up', status: 'in_progress', plannedStart: '2026-11-01', plannedEnd: '2026-11-05', actualStart: '2026-11-01', owner: 'Mohan Das', workCentre: 'Fabrication Bay', inputQty: 10, completedGoodQty: 6, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'pcs' },
      { id: 'stg-101-3', jobId: 'job-101', sequence: 3, name: 'Welding', status: 'pending', plannedStart: '2026-11-06', plannedEnd: '2026-11-12', owner: '', workCentre: 'Welding Bay', inputQty: 10, completedGoodQty: 0, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'pcs' },
      { id: 'stg-101-4', jobId: 'job-101', sequence: 4, name: 'NDT', status: 'pending', plannedStart: '2026-11-12', plannedEnd: '2026-11-14', owner: '', workCentre: 'QC Bay', inputQty: 10, completedGoodQty: 0, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'pcs' },
      { id: 'stg-101-5', jobId: 'job-101', sequence: 5, name: 'Painting & Dispatch', status: 'pending', plannedStart: '2026-11-15', plannedEnd: '2026-11-18', owner: '', workCentre: 'Paint Bay', inputQty: 10, completedGoodQty: 0, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'pcs' },
    ]
  },
  {
    id: 'job-102', jobNumber: 'J-102', customerId: 'cust-bpe', customerName: 'Bharat Power Equipment', customerPoId: 'cpo-102', customerPoNumber: 'CPO-2024-102', drawingRef: 'BPE-DWG-2024-HX-B', description: 'Heat exchanger shell fabrication – SS', siteId: 'site-hyd', siteName: 'Hyderabad Factory', status: 'hold', priority: 'urgent', plannedStart: '2026-11-04', plannedEnd: '2026-11-22', owner: 'Suresh Kumar', currentStage: 'Material Pending', materialReadiness: 'shortage', hasBlocker: true, value: 320000,
    stages: [
      { id: 'stg-102-1', jobId: 'job-102', sequence: 1, name: 'Cutting', status: 'hold', plannedStart: '2026-11-04', plannedEnd: '2026-11-07', owner: 'Mohan Das', workCentre: 'Cutting Bay', inputQty: 6, completedGoodQty: 0, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'sheets' },
      { id: 'stg-102-2', jobId: 'job-102', sequence: 2, name: 'Rolling', status: 'pending', plannedStart: '2026-11-08', plannedEnd: '2026-11-11', owner: '', workCentre: 'Rolling Bay', inputQty: 6, completedGoodQty: 0, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'sheets' },
      { id: 'stg-102-3', jobId: 'job-102', sequence: 3, name: 'Welding', status: 'pending', plannedStart: '2026-11-12', plannedEnd: '2026-11-18', owner: '', workCentre: 'Welding Bay', inputQty: 6, completedGoodQty: 0, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'pcs' },
      { id: 'stg-102-4', jobId: 'job-102', sequence: 4, name: 'Hydro Test', status: 'pending', plannedStart: '2026-11-19', plannedEnd: '2026-11-21', owner: '', workCentre: 'QC Bay', inputQty: 6, completedGoodQty: 0, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'pcs' },
    ]
  },
  {
    id: 'job-103', jobNumber: 'J-103', customerId: 'cust-af', customerName: 'Anand Fabricators', customerPoId: 'cpo-103', customerPoNumber: 'CPO-2024-098', description: 'Structural skid frame – 2 units', siteId: 'site-hyd', siteName: 'Hyderabad Factory', status: 'complete', priority: 'normal', plannedStart: '2026-10-01', plannedEnd: '2026-10-28', actualStart: '2026-10-02', actualEnd: '2026-10-27', owner: 'Suresh Kumar', currentStage: 'Complete', materialReadiness: 'ready', hasBlocker: false, value: 128000,
    stages: [
      { id: 'stg-103-1', jobId: 'job-103', sequence: 1, name: 'Cutting', status: 'complete', plannedStart: '2026-10-02', plannedEnd: '2026-10-05', actualStart: '2026-10-02', actualEnd: '2026-10-05', owner: 'Mohan Das', workCentre: 'Cutting Bay', inputQty: 2, completedGoodQty: 2, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'units' },
      { id: 'stg-103-2', jobId: 'job-103', sequence: 2, name: 'Fabrication', status: 'complete', plannedStart: '2026-10-07', plannedEnd: '2026-10-18', actualStart: '2026-10-07', actualEnd: '2026-10-19', owner: 'Mohan Das', workCentre: 'Fabrication Bay', inputQty: 2, completedGoodQty: 2, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'units' },
      { id: 'stg-103-3', jobId: 'job-103', sequence: 3, name: 'Final Inspection', status: 'complete', plannedStart: '2026-10-21', plannedEnd: '2026-10-23', actualStart: '2026-10-21', actualEnd: '2026-10-22', owner: 'Priya Patel', workCentre: 'QC Bay', inputQty: 2, completedGoodQty: 2, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'units' },
      { id: 'stg-103-4', jobId: 'job-103', sequence: 4, name: 'Dispatch', status: 'complete', plannedStart: '2026-10-24', plannedEnd: '2026-10-28', actualStart: '2026-10-24', actualEnd: '2026-10-27', owner: 'Deepa Singh', workCentre: 'Dispatch Bay', inputQty: 2, completedGoodQty: 2, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'units' },
    ]
  },
  {
    id: 'job-104', jobNumber: 'J-104', customerId: 'cust-ntpc', customerName: 'NTPC Vendor Division', customerPoId: 'cpo-104', customerPoNumber: 'CPO-2024-099', drawingRef: 'NTPC-DWG-2024-FLG-R1', description: 'Flanged pipe assemblies – 20 sets', siteId: 'site-hyd', siteName: 'Hyderabad Factory', status: 'hold', priority: 'high', plannedStart: '2026-11-01', plannedEnd: '2026-11-20', actualStart: '2026-11-01', owner: 'Suresh Kumar', currentStage: 'Cutting (Blocked)', materialReadiness: 'ready', hasBlocker: true, value: 325000,
    stages: [
      { id: 'stg-104-1', jobId: 'job-104', sequence: 1, name: 'Cutting', status: 'hold', plannedStart: '2026-11-01', plannedEnd: '2026-11-05', actualStart: '2026-11-01', owner: 'Mohan Das', workCentre: 'Cutting Bay', inputQty: 20, completedGoodQty: 8, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'sets' },
      { id: 'stg-104-2', jobId: 'job-104', sequence: 2, name: 'Drilling', status: 'pending', plannedStart: '2026-11-06', plannedEnd: '2026-11-09', owner: '', workCentre: 'Drill Bay', inputQty: 20, completedGoodQty: 0, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'sets' },
      { id: 'stg-104-3', jobId: 'job-104', sequence: 3, name: 'Fit-up & Welding', status: 'pending', plannedStart: '2026-11-10', plannedEnd: '2026-11-16', owner: '', workCentre: 'Welding Bay', inputQty: 20, completedGoodQty: 0, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'sets' },
    ]
  },
  {
    id: 'job-105', jobNumber: 'J-105', customerId: 'cust-lt', customerName: 'L&T Hydrocarbon', customerPoId: 'cpo-105', customerPoNumber: 'CPO-2024-100', drawingRef: 'LTH-DWG-2024-WLD-A2', description: 'Welded pipe spools – 15 pcs', siteId: 'site-hyd', siteName: 'Hyderabad Factory', status: 'active', priority: 'normal', plannedStart: '2026-10-25', plannedEnd: '2026-11-15', actualStart: '2026-10-25', owner: 'Suresh Kumar', currentStage: 'Welding', materialReadiness: 'partial', hasBlocker: false, value: 290000,
    stages: [
      { id: 'stg-105-1', jobId: 'job-105', sequence: 1, name: 'Cutting', status: 'complete', plannedStart: '2026-10-25', plannedEnd: '2026-10-29', actualStart: '2026-10-25', actualEnd: '2026-10-29', owner: 'Mohan Das', workCentre: 'Cutting Bay', inputQty: 15, completedGoodQty: 15, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'pcs' },
      { id: 'stg-105-2', jobId: 'job-105', sequence: 2, name: 'Welding', status: 'in_progress', plannedStart: '2026-10-30', plannedEnd: '2026-11-08', actualStart: '2026-10-30', owner: 'Mohan Das', workCentre: 'Welding Bay', inputQty: 15, completedGoodQty: 9, rejectedQty: 1, reworkQty: 1, scrapQty: 0, uom: 'pcs' },
      { id: 'stg-105-3', jobId: 'job-105', sequence: 3, name: 'RT Testing', status: 'pending', plannedStart: '2026-11-09', plannedEnd: '2026-11-12', owner: '', workCentre: 'QC Bay', inputQty: 15, completedGoodQty: 0, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'pcs' },
    ]
  },
  {
    id: 'job-106', jobNumber: 'J-106', customerId: 'cust-bpe', customerName: 'Bharat Power Equipment', customerPoId: 'cpo-106', customerPoNumber: 'CPO-2024-103', drawingRef: 'BPE-DWG-2024-TK-R1', description: 'Storage tank – 1 unit', siteId: 'site-hyd', siteName: 'Hyderabad Factory', status: 'active', priority: 'normal', plannedStart: '2026-11-04', plannedEnd: '2026-11-28', actualStart: '2026-11-04', owner: 'Suresh Kumar', currentStage: 'NDT', materialReadiness: 'ready', hasBlocker: false, value: 180000,
    stages: [
      { id: 'stg-106-1', jobId: 'job-106', sequence: 1, name: 'Cutting', status: 'complete', plannedStart: '2026-11-04', plannedEnd: '2026-11-06', actualStart: '2026-11-04', actualEnd: '2026-11-06', owner: 'Mohan Das', workCentre: 'Cutting Bay', inputQty: 1, completedGoodQty: 1, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'unit' },
      { id: 'stg-106-2', jobId: 'job-106', sequence: 2, name: 'Fabrication', status: 'complete', plannedStart: '2026-11-07', plannedEnd: '2026-11-14', actualStart: '2026-11-07', actualEnd: '2026-11-14', owner: 'Mohan Das', workCentre: 'Fabrication Bay', inputQty: 1, completedGoodQty: 1, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'unit' },
      { id: 'stg-106-3', jobId: 'job-106', sequence: 3, name: 'Welding', status: 'complete', plannedStart: '2026-11-15', plannedEnd: '2026-11-19', actualStart: '2026-11-15', actualEnd: '2026-11-19', owner: 'Mohan Das', workCentre: 'Welding Bay', inputQty: 1, completedGoodQty: 1, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'unit' },
      { id: 'stg-106-4', jobId: 'job-106', sequence: 4, name: 'NDT', status: 'in_progress', plannedStart: '2026-11-20', plannedEnd: '2026-11-22', actualStart: '2026-11-20', owner: 'Priya Patel', workCentre: 'QC Bay', inputQty: 1, completedGoodQty: 0, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'unit' },
      { id: 'stg-106-5', jobId: 'job-106', sequence: 5, name: 'Painting', status: 'pending', plannedStart: '2026-11-23', plannedEnd: '2026-11-26', owner: '', workCentre: 'Paint Bay', inputQty: 1, completedGoodQty: 0, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'unit' },
    ]
  },
  {
    id: 'job-107', jobNumber: 'J-107', customerId: 'cust-sv', customerName: 'SV Industries', customerPoId: 'cpo-107', customerPoNumber: 'CPO-2024-104', description: 'Conveyor frame – structural', siteId: 'site-hyd', siteName: 'Hyderabad Factory', status: 'active', priority: 'low', plannedStart: '2026-11-01', plannedEnd: '2026-11-20', actualStart: '2026-11-01', owner: 'Suresh Kumar', currentStage: 'Final Inspection', materialReadiness: 'ready', hasBlocker: false, value: 95000,
    stages: [
      { id: 'stg-107-1', jobId: 'job-107', sequence: 1, name: 'Cutting', status: 'complete', plannedStart: '2026-11-01', plannedEnd: '2026-11-04', actualStart: '2026-11-01', actualEnd: '2026-11-04', owner: 'Mohan Das', workCentre: 'Cutting Bay', inputQty: 1, completedGoodQty: 1, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'unit' },
      { id: 'stg-107-2', jobId: 'job-107', sequence: 2, name: 'Fabrication & Welding', status: 'complete', plannedStart: '2026-11-05', plannedEnd: '2026-11-13', actualStart: '2026-11-05', actualEnd: '2026-11-13', owner: 'Mohan Das', workCentre: 'Fabrication Bay', inputQty: 1, completedGoodQty: 1, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'unit' },
      { id: 'stg-107-3', jobId: 'job-107', sequence: 3, name: 'Final Inspection', status: 'in_progress', plannedStart: '2026-11-14', plannedEnd: '2026-11-16', actualStart: '2026-11-14', owner: 'Priya Patel', workCentre: 'QC Bay', inputQty: 1, completedGoodQty: 0, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'unit' },
    ]
  },
  {
    id: 'job-108', jobNumber: 'J-108', customerId: 'cust-mer', customerName: 'Meridian Engineering', customerPoId: 'cpo-108', customerPoNumber: 'CPO-2024-095', description: 'Instrument manifolds – 50 pcs', siteId: 'site-hyd', siteName: 'Hyderabad Factory', status: 'complete', priority: 'normal', plannedStart: '2026-09-15', plannedEnd: '2026-10-10', actualStart: '2026-09-15', actualEnd: '2026-10-08', owner: 'Suresh Kumar', currentStage: 'Dispatched', materialReadiness: 'ready', hasBlocker: false, value: 220000,
    stages: [
      { id: 'stg-108-1', jobId: 'job-108', sequence: 1, name: 'Machining', status: 'complete', plannedStart: '2026-09-15', plannedEnd: '2026-09-25', actualStart: '2026-09-15', actualEnd: '2026-09-24', owner: 'Mohan Das', workCentre: 'Machining Bay', inputQty: 50, completedGoodQty: 48, rejectedQty: 2, reworkQty: 0, scrapQty: 2, uom: 'pcs' },
      { id: 'stg-108-2', jobId: 'job-108', sequence: 2, name: 'Inspection', status: 'complete', plannedStart: '2026-09-26', plannedEnd: '2026-09-28', actualStart: '2026-09-26', actualEnd: '2026-09-27', owner: 'Priya Patel', workCentre: 'QC Bay', inputQty: 48, completedGoodQty: 48, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'pcs' },
      { id: 'stg-108-3', jobId: 'job-108', sequence: 3, name: 'Dispatch', status: 'complete', plannedStart: '2026-10-07', plannedEnd: '2026-10-10', actualStart: '2026-10-07', actualEnd: '2026-10-08', owner: 'Deepa Singh', workCentre: 'Dispatch Bay', inputQty: 48, completedGoodQty: 48, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'pcs' },
    ]
  },
];

// ── Job Blockers ──
export const JOB_BLOCKERS: JobBlocker[] = [
  { id: 'blk-001', jobId: 'job-102', stageId: 'stg-102-1', type: 'Material', description: 'SS Sheet 3mm 304L not received. SPO-2024-002 overdue by 2 days. Only 1.5 sheets available vs 6 required.', raisedBy: 'Suresh Kumar', raisedAt: '2026-11-03T09:30:00', status: 'open' },
  { id: 'blk-002', jobId: 'job-104', stageId: 'stg-104-1', type: 'Machine', description: 'Drill Press DP-01 is in breakdown. Cannot complete flange drilling. Maintenance event ME-2024-012 raised.', raisedBy: 'Suresh Kumar', raisedAt: '2026-11-04T08:00:00', status: 'open' },
];

// ── Job Material Requirements ──
export const JOB_MATERIAL_REQS: JobMaterialReq[] = [
  { id: 'jmr-001', jobId: 'job-102', stageId: 'stg-102-1', stageName: 'Cutting', materialItemId: 'mat-ss3', materialName: 'SS Sheet 3mm 304L', requiredQty: 432, reservedQty: 108, issuedQty: 0, uom: 'kg', shortage: true, lotIds: ['lot-005'] },
  { id: 'jmr-002', jobId: 'job-101', stageId: 'stg-101-2', stageName: 'Fit-up', materialItemId: 'mat-ms8', materialName: 'MS Plate 8mm', requiredQty: 320, reservedQty: 320, issuedQty: 320, uom: 'kg', shortage: false, lotIds: ['lot-001'] },
  { id: 'jmr-003', jobId: 'job-101', stageId: 'stg-101-3', stageName: 'Welding', materialItemId: 'mat-wr', materialName: 'Welding Rods E6013', requiredQty: 200, reservedQty: 200, issuedQty: 0, uom: 'pcs', shortage: false, lotIds: ['lot-007'] },
];

// ── GRNs ──
export const GRNS: GoodsReceipt[] = [
  { id: 'grn-001', grnNumber: 'GRN-2024-001', supplierId: 'supp-apex', supplierName: 'Apex Consumables', spoId: 'spo-003', spoNumber: 'SPO-2024-003', receivedDate: '2026-10-18', receivedBy: 'Asha Nair', deliveryChallan: 'DC-APEX-4521', vehicleNumber: 'TS09BA1234', status: 'accepted', lineCount: 2 },
  { id: 'grn-002', grnNumber: 'GRN-2024-002', supplierId: 'supp-bgs', supplierName: 'Bharat Gas Supply', spoId: 'spo-004', spoNumber: 'SPO-2024-004', receivedDate: '2026-10-26', receivedBy: 'Asha Nair', deliveryChallan: 'DC-BGS-889', status: 'accepted', lineCount: 2 },
  { id: 'grn-003', grnNumber: 'GRN-2024-003', supplierId: 'supp-msk', supplierName: 'MSK Steel Pvt Ltd', spoId: 'spo-001', spoNumber: 'SPO-2024-001', receivedDate: '2026-11-04', receivedBy: 'Asha Nair', deliveryChallan: 'DC-MSK-2201', vehicleNumber: 'TS09CD5678', status: 'pending_qc', lineCount: 1 },
];

// ── Inventory (derived view) ──
export const INVENTORY: InventoryItem[] = [
  { id: 'inv-001', materialItemId: 'mat-ms8', materialCode: 'MS-PLT-008', materialName: 'MS Plate 8mm', categoryName: 'MS Steel', locationId: 'loc-rm', locationName: 'Raw Material Store', onHandQty: 835, availableQty: 515, reservedQty: 320, qcHoldQty: 0, inTransitQty: 500, primaryUom: 'kg', secondaryQty: 13.3, secondaryUom: 'm²', reorderPoint: 500, shortage: false, lotCount: 3 },
  { id: 'inv-002', materialItemId: 'mat-ms12', materialCode: 'MS-PLT-012', materialName: 'MS Plate 12mm', categoryName: 'MS Steel', locationId: 'loc-qrn', locationName: 'Quarantine Store', onHandQty: 650, availableQty: 0, reservedQty: 0, qcHoldQty: 650, inTransitQty: 0, primaryUom: 'kg', secondaryQty: 6.9, secondaryUom: 'm²', reorderPoint: 300, shortage: false, lotCount: 1 },
  { id: 'inv-003', materialItemId: 'mat-msp', materialCode: 'MS-PPE-100', materialName: 'MS Pipe 100NB Sch40', categoryName: 'MS Steel', locationId: 'loc-wip', locationName: 'WIP Store', onHandQty: 161, availableQty: 0, reservedQty: 0, qcHoldQty: 0, inTransitQty: 0, primaryUom: 'kg', secondaryQty: 10, secondaryUom: 'm', reorderPoint: 200, shortage: true, lotCount: 1 },
  { id: 'inv-004', materialItemId: 'mat-ss3', materialCode: 'SS-SHT-304-3', materialName: 'SS Sheet 3mm 304L', categoryName: 'SS Steel', locationId: 'loc-rm', locationName: 'Raw Material Store', onHandQty: 108, availableQty: 108, reservedQty: 0, qcHoldQty: 216, inTransitQty: 300, primaryUom: 'kg', secondaryQty: 1.5, secondaryUom: 'sheet', reorderPoint: 150, shortage: true, lotCount: 2 },
  { id: 'inv-005', materialItemId: 'mat-msfb', materialCode: 'MS-FLT-50x6', materialName: 'MS Flat Bar 50×6', categoryName: 'MS Steel', locationId: 'loc-rm', locationName: 'Raw Material Store', onHandQty: 236, availableQty: 236, reservedQty: 0, qcHoldQty: 0, inTransitQty: 0, primaryUom: 'kg', secondaryQty: 100, secondaryUom: 'm', reorderPoint: 100, shortage: false, lotCount: 1 },
  { id: 'inv-006', materialItemId: 'mat-wr', materialCode: 'WLD-ROD-E6013', materialName: 'Welding Rods E6013', categoryName: 'Consumables', locationId: 'loc-rm', locationName: 'Raw Material Store', onHandQty: 2000, availableQty: 1800, reservedQty: 200, qcHoldQty: 0, inTransitQty: 0, primaryUom: 'pcs', reorderPoint: 1000, shortage: false, lotCount: 1 },
  { id: 'inv-007', materialItemId: 'mat-ar', materialCode: 'GAS-ARG-CYL', materialName: 'Argon Gas', categoryName: 'Gases', locationId: 'loc-rm', locationName: 'Raw Material Store', onHandQty: 3, availableQty: 3, reservedQty: 0, qcHoldQty: 0, inTransitQty: 0, primaryUom: 'cyl', reorderPoint: 5, shortage: true, lotCount: 1 },
  { id: 'inv-008', materialItemId: 'mat-gd', materialCode: 'TOL-GRD-125', materialName: 'Grinding Disc 125mm', categoryName: 'Consumables', locationId: 'loc-spr', locationName: 'Spare Parts Store', onHandQty: 120, availableQty: 120, reservedQty: 0, qcHoldQty: 0, inTransitQty: 0, primaryUom: 'pcs', reorderPoint: 50, shortage: false, lotCount: 1 },
];

// ── Stock Movements ──
export const STOCK_MOVEMENTS: StockMovement[] = [
  { id: 'sm-001', lotId: 'lot-001', movementType: 'Receipt', primaryQty: 450, uom: 'kg', toLocation: 'Raw Material Store', referenceType: 'GRN', referenceId: 'grn-003', referenceNumber: 'GRN-2024-003', performedBy: 'Asha Nair', timestamp: '2026-10-15T10:30:00' },
  { id: 'sm-002', lotId: 'lot-001', movementType: 'Issue', primaryQty: 320, uom: 'kg', fromLocation: 'Raw Material Store', toLocation: 'WIP Store', referenceType: 'Job', referenceId: 'job-101', referenceNumber: 'J-101', performedBy: 'Asha Nair', timestamp: '2026-10-29T09:00:00' },
  { id: 'sm-003', lotId: 'lot-003', movementType: 'Receipt', primaryQty: 161, uom: 'kg', toLocation: 'Raw Material Store', referenceType: 'GRN', referenceId: 'grn-005', referenceNumber: 'GRN-2024-005', performedBy: 'Asha Nair', timestamp: '2026-10-18T14:00:00' },
  { id: 'sm-004', lotId: 'lot-003', movementType: 'Issue', primaryQty: 161, uom: 'kg', fromLocation: 'Raw Material Store', toLocation: 'WIP Store', referenceType: 'Job', referenceId: 'job-101', referenceNumber: 'J-101', performedBy: 'Asha Nair', timestamp: '2026-10-29T09:30:00' },
  { id: 'sm-005', lotId: 'lot-004', movementType: 'Receipt', primaryQty: 216, uom: 'kg', toLocation: 'Quarantine Store', referenceType: 'GRN', referenceId: 'grn-004', referenceNumber: 'GRN-2024-004', performedBy: 'Asha Nair', timestamp: '2026-10-28T11:00:00', notes: 'QC hold – incoming inspection failed' },
  { id: 'sm-006', lotId: 'lot-009', movementType: 'Receipt', primaryQty: 650, uom: 'kg', toLocation: 'Quarantine Store', referenceType: 'GRN', referenceId: 'grn-003', referenceNumber: 'GRN-2024-003', performedBy: 'Asha Nair', timestamp: '2026-11-04T10:00:00' },
];

// ── Quality ──
export const CERTIFICATES: MaterialCertificate[] = [
  { id: 'cert-001', certNumber: 'MTC-2024-047', certType: 'Mill Test Certificate', supplierId: 'supp-msk', supplierName: 'MSK Steel', issueDate: '2026-10-14', heatNumber: 'HT-MSK-4471', grade: 'IS 2062 E250A', dimensionsPrimary: '8mm × 2500 × 6300mm', yieldStrength: 268, tensileStrength: 412, elongationPct: 26, hardnessHB: 118, verificationStatus: 'verified', extractedBy: 'AI (Anthropic)', confidence: 'High', linkedLots: ['lot-001', 'lot-012'] },
  { id: 'cert-002', certNumber: 'MTC-2024-091', certType: 'Mill Test Certificate', supplierId: 'supp-msk', supplierName: 'MSK Steel', issueDate: '2026-11-03', heatNumber: 'HT-MSK-5103', grade: 'IS 2062 E250', verificationStatus: 'pending', linkedLots: ['lot-009'] },
  { id: 'cert-003', certNumber: 'COA-SSI-2024-18', certType: 'Certificate of Conformance', supplierId: 'supp-ssi', supplierName: 'Stainless Source', issueDate: '2026-09-19', heatNumber: 'HT-SSI-7720', grade: 'ASTM A240 304L', yieldStrength: 220, tensileStrength: 520, elongationPct: 40, verificationStatus: 'verified', extractedBy: 'Priya Patel', confidence: 'High', linkedLots: ['lot-005'] },
  { id: 'cert-004', certNumber: 'COA-BGS-2024-ARG', certType: 'Certificate of Analysis', supplierId: 'supp-bgs', supplierName: 'Bharat Gas Supply', issueDate: '2026-10-24', heatNumber: '', grade: 'Industrial Grade 99.998%', verificationStatus: 'verified', extractedBy: 'Asha Nair', linkedLots: ['lot-008'] },
];

export const INSPECTIONS: Inspection[] = [
  { id: 'ins-001', inspectionNumber: 'INS-2024-041', type: 'Incoming', lotId: 'lot-004', inspectorId: 'u-qc', inspectorName: 'Priya Patel', date: '2026-10-28', templateName: 'Incoming SS Sheet', sampleQty: 3, acceptedQty: 0, rejectedQty: 3, result: 'fail', ncrId: 'ncr-001', ncrNumber: 'NCR-2024-007' },
  { id: 'ins-002', inspectionNumber: 'INS-2024-042', type: 'Incoming', lotId: 'lot-009', inspectorId: 'u-qc', inspectorName: 'Priya Patel', date: '2026-11-04', templateName: 'Incoming MS Plate', sampleQty: 5, acceptedQty: 0, rejectedQty: 0, result: 'pending' },
  { id: 'ins-003', inspectionNumber: 'INS-2024-040', type: 'In-Process', jobId: 'job-105', jobNumber: 'J-105', stageId: 'stg-105-2', stageName: 'Welding', inspectorId: 'u-qc', inspectorName: 'Priya Patel', date: '2026-11-02', templateName: 'Weld Visual Inspection', sampleQty: 10, acceptedQty: 9, rejectedQty: 1, result: 'pass' },
  { id: 'ins-004', inspectionNumber: 'INS-2024-039', type: 'Final', jobId: 'job-103', jobNumber: 'J-103', inspectorId: 'u-qc', inspectorName: 'Priya Patel', date: '2026-10-22', templateName: 'Final Inspection – Structural', sampleQty: 2, acceptedQty: 2, rejectedQty: 0, result: 'pass' },
];

export const NCRS: NCR[] = [
  { id: 'ncr-001', ncrNumber: 'NCR-2024-007', inspectionId: 'ins-001', sourceType: 'Incoming', severity: 'Major', description: 'Surface lamination defects found on SS Sheet 304L. Pitting corrosion on 2 of 3 sheets inspected. Deviation from ASTM A240 surface quality spec.', affectedQty: 216, disposition: 'Return', raisedBy: 'Priya Patel', raisedAt: '2026-10-28T14:30:00', status: 'open', lotId: 'lot-004' },
  { id: 'ncr-002', ncrNumber: 'NCR-2024-006', inspectionId: 'ins-003', sourceType: 'In-Process', severity: 'Minor', description: 'Weld undercut on joint J-105-WLD-11. Exceeds AWS D1.1 tolerance by 0.2mm.', affectedQty: 1, disposition: 'Rework', raisedBy: 'Priya Patel', raisedAt: '2026-11-02T16:00:00', status: 'in_progress', jobId: 'job-105' },
];

export const QUALITY_RELEASES: QualityRelease[] = [
  { id: 'qr-001', jobId: 'job-103', jobNumber: 'J-103', inspectionId: 'ins-004', releasedBy: 'Priya Patel', releasedAt: '2026-10-23T10:00:00', certDossierComplete: true, notes: 'All inspection checks passed. Structural skid frames cleared for dispatch.' },
];

// ── Assets ──
export const ASSETS: Asset[] = [
  { id: 'ast-wm01', assetCode: 'WM-01', name: 'Lincoln Welding Machine', category: 'Welding Equipment', siteId: 'site-hyd', workCentre: 'Welding Bay', criticality: 'High', status: 'operational', lastServiceDate: '2026-09-15', nextServiceDate: '2025-03-15', purchaseDate: '2020-06-01', manufacturer: 'Lincoln Electric', model: 'PowerWave S350', meterType: 'hours', currentReading: 2840 },
  { id: 'ast-wm02', assetCode: 'WM-02', name: 'ESAB Welding Machine', category: 'Welding Equipment', siteId: 'site-hyd', workCentre: 'Welding Bay', criticality: 'High', status: 'operational', lastServiceDate: '2026-10-01', nextServiceDate: '2025-04-01', purchaseDate: '2021-02-15', manufacturer: 'ESAB', model: 'Rebel EMP 235ic', meterType: 'hours', currentReading: 1950 },
  { id: 'ast-wm03', assetCode: 'WM-03', name: 'Miller Welding Machine', category: 'Welding Equipment', siteId: 'site-hyd', workCentre: 'Welding Bay', criticality: 'Medium', status: 'in_maintenance', lastServiceDate: '2026-10-28', purchaseDate: '2019-11-20', manufacturer: 'Miller Electric', model: 'Dynasty 280', meterType: 'hours', currentReading: 3200 },
  { id: 'ast-pc01', assetCode: 'PC-01', name: 'Hypertherm Plasma Cutter', category: 'Cutting Equipment', siteId: 'site-hyd', workCentre: 'Cutting Bay', criticality: 'Critical', status: 'operational', lastServiceDate: '2026-10-15', nextServiceDate: '2025-04-15', purchaseDate: '2022-03-10', manufacturer: 'Hypertherm', model: 'MAXPRO200', meterType: 'hours', currentReading: 890 },
  { id: 'ast-pb01', assetCode: 'PB-01', name: 'Press Brake 100T', category: 'Forming Equipment', siteId: 'site-hyd', workCentre: 'Fabrication Bay', criticality: 'High', status: 'pm_overdue', lastServiceDate: '2026-09-30', nextServiceDate: '2026-10-30', purchaseDate: '2018-08-01', manufacturer: 'Amada', model: 'HFE-100', meterType: 'none' },
  { id: 'ast-gc01', assetCode: 'GC-01', name: 'Overhead Crane 5T', category: 'Material Handling', siteId: 'site-hyd', workCentre: 'Main Bay', criticality: 'Critical', status: 'operational', lastServiceDate: '2026-10-20', nextServiceDate: '2025-01-20', purchaseDate: '2017-01-15', manufacturer: 'ElectroMech', model: 'EOT-5T', meterType: 'cycles', currentReading: 48200 },
  { id: 'ast-ag01', assetCode: 'AG-01', name: 'Angle Grinder', category: 'Grinding Equipment', siteId: 'site-hyd', workCentre: 'Fabrication Bay', criticality: 'Low', status: 'operational', lastServiceDate: '2026-11-01', nextServiceDate: '2025-05-01', purchaseDate: '2023-01-10', manufacturer: 'Bosch', model: 'GWS 22-230', meterType: 'none' },
  { id: 'ast-dp01', assetCode: 'DP-01', name: 'Drill Press', category: 'Drilling Equipment', siteId: 'site-hyd', workCentre: 'Drill Bay', criticality: 'High', status: 'breakdown', lastServiceDate: '2026-09-01', purchaseDate: '2019-03-15', manufacturer: 'Bharat Fritz Werner', model: 'RDM-25', meterType: 'hours', currentReading: 4100 },
];

export const MAINTENANCE_EVENTS: MaintenanceEvent[] = [
  { id: 'me-012', eventNumber: 'ME-2024-012', type: 'Breakdown', assetId: 'ast-dp01', assetName: 'Drill Press', assetCode: 'DP-01', severity: 'High', symptom: 'Spindle motor seized. Burning smell noticed during drilling of flange holes. Machine stopped immediately.', technicianId: 'u-maint', technicianName: 'Venkat Rao', downtimeStart: '2026-11-04T07:45:00', status: 'in_progress', affectedJobs: [{ jobId: 'job-104', jobNumber: 'J-104', impact: 'Cannot complete flange drilling. Cutting stage on hold.' }], sparesUsed: [] },
  { id: 'me-011', eventNumber: 'ME-2024-011', type: 'Preventive', assetId: 'ast-wm03', assetName: 'Miller Welding Machine', assetCode: 'WM-03', symptom: 'Scheduled 500-hour service', technicianId: 'u-maint', technicianName: 'Venkat Rao', downtimeStart: '2026-10-28T08:00:00', downtimeEnd: '2026-10-28T17:00:00', diagnosis: 'Wire feed assembly cleaned. Contact tips replaced. Ground cable inspected.', workDone: 'Full 500-hour service completed per OEM checklist.', status: 'closed', affectedJobs: [], sparesUsed: [{ materialName: 'Contact tips', qty: 5, uom: 'pcs' }] },
  { id: 'me-010', eventNumber: 'ME-2024-010', type: 'Corrective', assetId: 'ast-pb01', assetName: 'Press Brake 100T', assetCode: 'PB-01', symptom: 'Back gauge motor noisy. Positional drift of ±1.5mm observed.', technicianId: 'u-maint', technicianName: 'Venkat Rao', downtimeStart: '2026-10-30T10:00:00', downtimeEnd: '2026-10-30T15:30:00', diagnosis: 'Ball screw backlash. Lubrication insufficient.', workDone: 'Ball screw lubricated. Backlash compensation adjusted to ±0.1mm.', status: 'closed', affectedJobs: [], sparesUsed: [] },
];

// ── Dispatch ──
export const DISPATCHES: Dispatch[] = [
  { id: 'dsp-001', dispatchNumber: 'DSP-2024-018', customerId: 'cust-af', customerName: 'Anand Fabricators', dispatchDate: '2026-10-27', carrier: 'SRS Transport', vehicleNumber: 'TS07CE3421', lrNumber: 'SRS-LR-5582', expectedDelivery: '2026-10-29', status: 'delivered', lineCount: 1, totalQty: 2, hasPoD: true, jobs: ['J-103'] },
  { id: 'dsp-002', dispatchNumber: 'DSP-2024-019', customerId: 'cust-mer', customerName: 'Meridian Engineering', dispatchDate: '2026-10-08', carrier: 'VRL Logistics', vehicleNumber: 'KA09MX7812', lrNumber: 'VRL-LR-9901', expectedDelivery: '2026-10-11', status: 'delivered', lineCount: 2, totalQty: 48, hasPoD: true, jobs: ['J-108'] },
  { id: 'dsp-003', dispatchNumber: 'DSP-2024-020', customerId: 'cust-mer', customerName: 'Meridian Engineering', dispatchDate: '', status: 'draft', lineCount: 0, totalQty: 0, hasPoD: false, jobs: ['J-101'] },
];

// ── Documents ──
export const VAULT_DOCUMENTS: VaultDocument[] = [
  { id: 'doc-001', title: 'ISO 9001:2015 Certificate', docType: 'Quality Certificate', category: 'Company Certificates', uploadedBy: 'Ravi Shankar', uploadedAt: '2026-02-10', issueDate: '2026-02-10', expiryDate: '2026-11-22', version: 1, fileSize: '1.2 MB', linkedEntities: [], obligation: { renewalDue: '2026-11-08', responsible: 'Ravi Shankar' } },
  { id: 'doc-002', title: 'Stainless Source Quality Certificate', docType: 'Supplier Certificate', category: 'Supplier Documents', uploadedBy: 'Karthik Raju', uploadedAt: '2026-04-15', issueDate: '2026-04-15', expiryDate: '2026-11-01', version: 1, fileSize: '0.8 MB', linkedEntities: [{ type: 'Supplier', ref: 'Stainless Source India' }] },
  { id: 'doc-003', title: 'MTC-2024-047 – MS Plate 8mm', docType: 'Mill Test Certificate', category: 'Material Certificates', uploadedBy: 'Asha Nair', uploadedAt: '2026-10-15', issueDate: '2026-10-14', version: 1, fileSize: '0.5 MB', linkedEntities: [{ type: 'MaterialLot', ref: 'LOT-2024-001' }, { type: 'GRN', ref: 'GRN-2024-003' }], certStatus: 'verified' },
  { id: 'doc-004', title: 'MTC-2024-091 – MS Plate 12mm', docType: 'Mill Test Certificate', category: 'Material Certificates', uploadedBy: 'Asha Nair', uploadedAt: '2026-11-04', issueDate: '2026-11-03', version: 1, fileSize: '0.4 MB', linkedEntities: [{ type: 'MaterialLot', ref: 'LOT-2024-009' }], certStatus: 'pending', aiClassification: 'Mill Test Certificate – MS Steel (AI suggestion)' },
  { id: 'doc-005', title: 'Meridian Drawing Rev C – J-101', docType: 'Engineering Drawing', category: 'Job Documents', uploadedBy: 'Anita Mehta', uploadedAt: '2026-11-01', issueDate: '2026-10-30', version: 3, fileSize: '5.1 MB', linkedEntities: [{ type: 'Job', ref: 'J-101' }] },
  { id: 'doc-006', title: 'Bharat Power Drawing Rev B – J-102', docType: 'Engineering Drawing', category: 'Job Documents', uploadedBy: 'Anita Mehta', uploadedAt: '2026-11-02', version: 2, fileSize: '4.8 MB', linkedEntities: [{ type: 'Job', ref: 'J-102' }] },
  { id: 'doc-007', title: 'Factory Licence – HYD', docType: 'Statutory Licence', category: 'Company Certificates', uploadedBy: 'Ravi Shankar', uploadedAt: '2023-04-01', issueDate: '2023-04-01', expiryDate: '2025-03-31', version: 1, fileSize: '0.3 MB', linkedEntities: [], obligation: { renewalDue: '2025-02-15', responsible: 'Ravi Shankar' } },
  { id: 'doc-008', title: 'Pressure Vessel Inspection Report – J-103', docType: 'Inspection Report', category: 'Quality Documents', uploadedBy: 'Priya Patel', uploadedAt: '2026-10-22', version: 1, fileSize: '2.1 MB', linkedEntities: [{ type: 'Job', ref: 'J-103' }] },
  { id: 'doc-009', title: 'Argon Gas COA – LOT-008', docType: 'Certificate of Analysis', category: 'Material Certificates', uploadedBy: 'Asha Nair', uploadedAt: '2026-10-25', issueDate: '2026-10-24', version: 1, fileSize: '0.2 MB', linkedEntities: [{ type: 'MaterialLot', ref: 'LOT-2024-008' }], certStatus: 'verified' },
  { id: 'doc-010', title: 'WM-01 Calibration Certificate', docType: 'Calibration Certificate', category: 'Asset Documents', uploadedBy: 'Venkat Rao', uploadedAt: '2026-08-15', issueDate: '2026-08-15', expiryDate: '2026-12-19', version: 1, fileSize: '0.6 MB', linkedEntities: [{ type: 'Asset', ref: 'WM-01' }], obligation: { renewalDue: '2026-12-05', responsible: 'Venkat Rao' } },
];

// ── Approval Requests ──
export const APPROVAL_REQUESTS: ApprovalRequest[] = [
  { id: 'apr-001', requestType: 'Supplier PO Approval', entityRef: 'SPO-2024-002 Revision', entityId: 'spo-002', description: 'Quantity reduction from 300kg to 200kg SS Sheet 304L. Price unchanged at ₹180/kg. Supplier commitment pushed to 10 Nov.', requestedBy: 'Karthik Raju', requestedAt: '2026-11-03T14:00:00', status: 'pending', thresholdValue: 50000, currentValue: 36000 },
  { id: 'apr-002', requestType: 'Stock Adjustment', entityRef: 'Grinding Discs – Cycle Count Variance', entityId: 'inv-008', description: 'Physical count shows 120 pcs vs system quantity of 150 pcs. Variance: -30 pcs (20%). Likely breakage not recorded.', requestedBy: 'Asha Nair', requestedAt: '2026-11-02T11:30:00', status: 'pending' },
];

// ── Notifications ──
export const NOTIFICATIONS: AppNotification[] = [
  { id: 'notif-001', type: 'action', title: 'Approval required: SPO revision', body: 'SPO-2024-002 qty revision pending your approval. ₹36,000 impact.', entityType: 'ApprovalRequest', entityId: 'apr-001', entityRef: 'SPO-2024-002', timestamp: '2026-11-03T14:00:00', read: false },
  { id: 'notif-002', type: 'warning', title: 'Supplier PO overdue – SPO-2024-002', body: 'SS Sheet delivery from Stainless Source is 2 days overdue. J-102 blocked.', entityType: 'SupplierPO', entityId: 'spo-002', entityRef: 'SPO-2024-002', timestamp: '2026-11-04T08:00:00', read: false },
  { id: 'notif-003', type: 'warning', title: 'Machine breakdown: DP-01', body: 'Drill Press breakdown. J-104 flange drilling blocked. Venkat Rao notified.', entityType: 'MaintenanceEvent', entityId: 'me-012', entityRef: 'ME-2024-012', timestamp: '2026-11-04T07:50:00', read: false },
  { id: 'notif-004', type: 'reminder', title: 'ISO 9001 renewal due in 18 days', body: 'ISO 9001:2015 certificate expires 22 Nov. Renewal obligation set.', entityType: 'Document', entityId: 'doc-001', entityRef: 'ISO 9001:2015', timestamp: '2026-11-04T07:00:00', read: false },
  { id: 'notif-005', type: 'warning', title: 'QC hold: LOT-004 (18 hrs)', body: 'SS Sheet LOT-004 on QC hold for 18 hours. NCR-007 awaiting disposition.', entityType: 'MaterialLot', entityId: 'lot-004', entityRef: 'LOT-2024-004', timestamp: '2026-11-03T20:00:00', read: true },
  { id: 'notif-006', type: 'success', title: 'QR-001 issued: J-103 cleared for dispatch', body: 'Quality release issued for J-103. Structural skid frames ready for dispatch.', entityType: 'QualityRelease', entityId: 'qr-001', entityRef: 'J-103', timestamp: '2026-10-23T10:05:00', read: true },
];

// ── Home Pulse Exceptions ──
export const PULSE_EXCEPTIONS: PulseException[] = [
  { id: 'pe-001', category: 'material', priority: 'critical', title: 'Material shortage – J-102 blocked', body: 'SS Sheet 3mm 304L: 108 kg available vs 432 kg required. SPO-2024-002 overdue.', affectedRef: 'J-102', affectedId: 'job-102', workspacePath: '/jobs/job-102', cta: 'View Job', since: '2026-11-03T09:30:00', aiReason: 'Exception auto-detected: required qty exceeds available + in-transit stock. 3 days to planned start.' },
  { id: 'pe-002', category: 'procurement', priority: 'critical', title: 'Supplier PO overdue – 2 days', body: 'SPO-2024-002 (Stainless Source India): committed 2 Nov, still not received. Last commitment update: none.', affectedRef: 'SPO-2024-002', affectedId: 'spo-002', workspacePath: '/procurement/spo/spo-002', cta: 'View PO', since: '2026-11-02T00:00:00' },
  { id: 'pe-003', category: 'asset', priority: 'critical', title: 'Machine breakdown – J-104 blocked', body: 'DP-01 Drill Press: spindle motor seized. J-104 flange drilling on hold. Maintenance event raised.', affectedRef: 'DP-01', affectedId: 'ast-dp01', workspacePath: '/assets/ast-dp01', cta: 'View Asset', since: '2026-11-04T07:45:00' },
  { id: 'pe-004', category: 'asset', priority: 'warning', title: 'PM overdue – Press Brake 100T', body: 'PB-01 preventive maintenance due 30 Oct. Overdue by 5 days. No maintenance event raised.', affectedRef: 'PB-01', affectedId: 'ast-pb01', workspacePath: '/assets/ast-pb01', cta: 'Schedule PM', since: '2026-10-30T00:00:00' },
  { id: 'pe-005', category: 'quality', priority: 'warning', title: 'QC hold unresolved – 18 hours', body: 'LOT-004 SS Sheet on QC hold. NCR-007 raised. Disposition pending: Return to supplier or Scrap.', affectedRef: 'LOT-2024-004', affectedId: 'lot-004', workspacePath: '/inventory/lot-004', cta: 'View NCR', since: '2026-11-03T20:00:00' },
  { id: 'pe-006', category: 'document', priority: 'warning', title: 'Certificate expiring – 18 days', body: 'ISO 9001:2015 expires 22 Nov. Renewal obligation: Ravi Shankar. Reminder set for 8 Nov.', affectedRef: 'ISO 9001:2015', affectedId: 'doc-001', workspacePath: '/documents/doc-001', cta: 'View Document', since: '2026-11-04T07:00:00' },
  { id: 'pe-007', category: 'document', priority: 'info', title: 'Supplier certificate expired', body: 'Stainless Source India quality certificate expired 1 Nov. Renewal not initiated.', affectedRef: 'SSI-CERT-2024', affectedId: 'doc-002', workspacePath: '/documents/doc-002', cta: 'View Document', since: '2026-11-02T00:00:00' },
  { id: 'pe-008', category: 'procurement', priority: 'info', title: 'Approval pending – SPO revision', body: 'SPO-2024-002 qty revision requires Owner approval. Requested by Karthik Raju.', affectedRef: 'APR-001', affectedId: 'apr-001', workspacePath: '/admin', cta: 'Review', since: '2026-11-03T14:00:00' },
];

// ── Supplier Quotations ──
export const SUPPLIER_QUOTATIONS: SupplierQuotation[] = [
  {
    id: 'sq-001', quoteNumber: 'SQ-2024-001', supplierId: 'sup-001', supplierName: 'Stainless Source India',
    prId: 'pr-001', prNumber: 'PR-2024-001', quoteDate: '2026-10-28', validUntil: '2026-11-28',
    currency: 'INR', status: 'selected', paymentTerms: '30 days net', deliveryDays: 7,
    lines: [
      { id: 'sql-001', quoteId: 'sq-001', materialItemId: 'mat-ss304-rod', materialName: 'SS 304 Rod 25mm', quotedQty: 250, uom: 'kg', unitPrice: 320, taxPct: 18, freightIncluded: true, discountPct: 2, lineTotal: 78400 },
    ],
    notes: 'Price includes freight to Hyderabad site.',
  },
  {
    id: 'sq-002', quoteNumber: 'SQ-2024-002', supplierId: 'sup-002', supplierName: 'Metal Masters Pvt Ltd',
    prId: 'pr-001', prNumber: 'PR-2024-001', quoteDate: '2026-10-29', validUntil: '2026-11-15',
    currency: 'INR', status: 'rejected', paymentTerms: '15 days net', deliveryDays: 10,
    lines: [
      { id: 'sql-002', quoteId: 'sq-002', materialItemId: 'mat-ss304-rod', materialName: 'SS 304 Rod 25mm', quotedQty: 250, uom: 'kg', unitPrice: 335, taxPct: 18, freightIncluded: false, discountPct: 0, lineTotal: 99062 },
    ],
    notes: 'Freight extra. Lead time 10 days.',
  },
  {
    id: 'sq-003', quoteNumber: 'SQ-2024-003', supplierId: 'sup-003', supplierName: 'AIS Engineering Supplies',
    prId: 'pr-002', prNumber: 'PR-2024-002', quoteDate: '2026-11-01', validUntil: '2026-11-30',
    currency: 'INR', status: 'received', paymentTerms: '30 days net', deliveryDays: 5,
    lines: [
      { id: 'sql-003', quoteId: 'sq-003', materialItemId: 'mat-en8-rod', materialName: 'EN8 Round Bar 50mm', quotedQty: 100, uom: 'kg', unitPrice: 95, taxPct: 18, freightIncluded: true, discountPct: 0, lineTotal: 11210 },
    ],
  },
];

// ── Audit Events (append-only seed — real events appended in store) ──
export const AUDIT_EVENTS: AuditEvent[] = [
  { id: 'ae-001', actor: 'Karthik Raju', actorId: 'u-buyer', scope: 'SupplierPO', action: 'create', entityId: 'spo-001', entityRef: 'SPO-2024-001', timestamp: '2026-10-15T09:12:00', source: 'ui' },
  { id: 'ae-002', actor: 'Ranjith Kodakandla', actorId: 'u-owner', scope: 'SupplierPO', action: 'approve', entityId: 'spo-001', entityRef: 'SPO-2024-001', timestamp: '2026-10-15T11:30:00', source: 'ui', reason: 'Value within budget; supplier pre-approved.' },
  { id: 'ae-003', actor: 'Asha Nair', actorId: 'u-store', scope: 'GoodsReceipt', action: 'create', entityId: 'grn-001', entityRef: 'GRN-2024-001', timestamp: '2026-10-22T14:05:00', source: 'ui' },
  { id: 'ae-004', actor: 'Priya Patel', actorId: 'u-qc', scope: 'Inspection', action: 'complete', entityId: 'insp-001', entityRef: 'INSP-2024-001', timestamp: '2026-10-22T16:48:00', source: 'ui', after: { result: 'pass' } },
  { id: 'ae-005', actor: 'Anita Mehta', actorId: 'u-sales', scope: 'CustomerPO', action: 'create', entityId: 'cpo-001', entityRef: 'CPO-2024-1245', timestamp: '2026-10-10T10:00:00', source: 'ui' },
  { id: 'ae-006', actor: 'Suresh Kumar', actorId: 'u-super', scope: 'Job', action: 'update', entityId: 'job-101', entityRef: 'J-101', timestamp: '2026-11-04T08:30:00', source: 'ui', after: { currentStage: 'CNC Turning' } },
];

// ── Approval Policies ──
export const APPROVAL_POLICIES: ApprovalPolicy[] = [
  { id: 'ap-001', scope: 'SupplierPO', condition: 'PO value > ₹1,00,000', thresholdType: 'value', thresholdValue: 100000, requiredRole: 'owner', active: true },
  { id: 'ap-002', scope: 'SupplierPO', condition: 'PO value ≤ ₹1,00,000', thresholdType: 'value', thresholdValue: 100000, requiredRole: 'buyer', active: true },
  { id: 'ap-003', scope: 'StockAdjustment', condition: 'Any adjustment > 50 units', thresholdType: 'quantity', thresholdValue: 50, requiredRole: 'owner', active: true },
  { id: 'ap-004', scope: 'CustomerPOAmendment', condition: 'All amendments', thresholdType: 'always', requiredRole: 'owner', escalationRole: 'sales', active: true },
];

// ── Finance Seed Data ──
import type { CustomerInvoice, SupplierInvoice, PaymentRecord } from '../types';

export const CUSTOMER_INVOICES: CustomerInvoice[] = [
  { id: 'cinv-001', invoiceNumber: 'INV-2026-001', customerId: 'cust-mer', customerName: 'Meridian Engineering', customerPoRef: 'CPO-2026-101', customerPoId: 'cpo-101', invoiceDate: '2026-11-01', dueDate: '2026-12-01', amount: 485000, amountPaid: 200000, currency: 'INR', status: 'partial' },
  { id: 'cinv-002', invoiceNumber: 'INV-2026-002', customerId: 'cust-bpe', customerName: 'Bharat Power Equipment', customerPoRef: 'CPO-2026-102', customerPoId: 'cpo-102', invoiceDate: '2026-11-02', dueDate: '2026-12-17', amount: 320000, amountPaid: 0, currency: 'INR', status: 'sent' },
  { id: 'cinv-003', invoiceNumber: 'INV-2026-003', customerId: 'cust-af', customerName: 'Anand Fabricators', customerPoRef: 'CPO-2026-098', customerPoId: 'cpo-103', invoiceDate: '2026-10-15', dueDate: '2026-10-30', amount: 128000, amountPaid: 128000, currency: 'INR', status: 'paid' },
  { id: 'cinv-004', invoiceNumber: 'INV-2026-004', customerId: 'cust-ntpc', customerName: 'NTPC Vendor Division', customerPoRef: 'CPO-2026-099', customerPoId: 'cpo-104', invoiceDate: '2026-10-20', dueDate: '2026-12-19', amount: 650000, amountPaid: 0, currency: 'INR', status: 'sent' },
  { id: 'cinv-005', invoiceNumber: 'INV-2026-005', customerId: 'cust-lt', customerName: 'L&T Hydrocarbon', customerPoRef: 'CPO-2026-100', customerPoId: 'cpo-105', invoiceDate: '2026-10-20', dueDate: '2026-11-04', amount: 290000, amountPaid: 0, currency: 'INR', status: 'overdue' },
  { id: 'cinv-006', invoiceNumber: 'INV-2026-006', customerId: 'cust-mer', customerName: 'Meridian Engineering', customerPoRef: 'CPO-2026-095', customerPoId: 'cpo-108', invoiceDate: '2026-10-01', dueDate: '2026-10-31', amount: 220000, amountPaid: 220000, currency: 'INR', status: 'paid' },
];

export const SUPPLIER_INVOICES: SupplierInvoice[] = [
  { id: 'sinv-001', invoiceNumber: 'SINV-MSK-2026-001', supplierId: 'supp-msk', supplierName: 'MSK Steel Pvt Ltd', supplierPoRef: 'SPO-2026-001', supplierPoId: 'spo-001', invoiceDate: '2026-11-04', dueDate: '2026-12-04', amount: 95000, amountPaid: 0, currency: 'INR', status: 'pending' },
  { id: 'sinv-002', invoiceNumber: 'SINV-SSI-2026-002', supplierId: 'supp-ssi', supplierName: 'Stainless Source India', supplierPoRef: 'SPO-2026-002', supplierPoId: 'spo-002', invoiceDate: '2026-10-25', dueDate: '2026-11-04', amount: 54000, amountPaid: 0, currency: 'INR', status: 'overdue' },
  { id: 'sinv-003', invoiceNumber: 'SINV-APEX-2026-003', supplierId: 'supp-apex', supplierName: 'Apex Consumables', supplierPoRef: 'SPO-2026-003', supplierPoId: 'spo-003', invoiceDate: '2026-10-10', dueDate: '2026-11-09', amount: 18500, amountPaid: 18500, currency: 'INR', status: 'paid' },
  { id: 'sinv-004', invoiceNumber: 'SINV-BGS-2026-004', supplierId: 'supp-bgs', supplierName: 'Bharat Gas Supply', supplierPoRef: 'SPO-2026-004', supplierPoId: 'spo-004', invoiceDate: '2026-10-20', dueDate: '2026-11-04', amount: 9000, amountPaid: 4500, currency: 'INR', status: 'partial' },
  { id: 'sinv-005', invoiceNumber: 'SINV-SCT-2026-005', supplierId: 'supp-sct', supplierName: 'SteelCraft Tubes', supplierPoRef: 'SPO-2026-005', supplierPoId: 'spo-005', invoiceDate: '2026-11-01', dueDate: '2026-12-01', amount: 42000, amountPaid: 0, currency: 'INR', status: 'pending' },
];

export const PAYMENT_RECORDS: PaymentRecord[] = [
  { id: 'pay-001', direction: 'inbound', partyId: 'cust-af', partyName: 'Anand Fabricators', date: '2026-10-30', amount: 128000, currency: 'INR', mode: 'NEFT', reference: 'NEFT26103012345', linkedInvoiceId: 'cinv-003', notes: 'Full payment received' },
  { id: 'pay-002', direction: 'inbound', partyId: 'cust-mer', partyName: 'Meridian Engineering', date: '2026-11-03', amount: 200000, currency: 'INR', mode: 'RTGS', reference: 'RTGS26110300987', linkedInvoiceId: 'cinv-001', notes: 'Advance against Nov invoice' },
  { id: 'pay-003', direction: 'inbound', partyId: 'cust-mer', partyName: 'Meridian Engineering', date: '2026-10-31', amount: 220000, currency: 'INR', mode: 'NEFT', reference: 'NEFT26103044321', linkedInvoiceId: 'cinv-006', notes: 'Full payment CPO-095' },
  { id: 'pay-004', direction: 'outbound', partyId: 'supp-apex', partyName: 'Apex Consumables', date: '2026-10-25', amount: 18500, currency: 'INR', mode: 'NEFT', reference: 'NEFT26102555432', linkedInvoiceId: 'sinv-003', notes: 'Full payment for consumables' },
  { id: 'pay-005', direction: 'outbound', partyId: 'supp-bgs', partyName: 'Bharat Gas Supply', date: '2026-10-28', amount: 4500, currency: 'INR', mode: 'UPI', reference: 'UPI26102867890', linkedInvoiceId: 'sinv-004', notes: 'Partial payment gas cylinders' },
];

// ── Company/Onboarding Config ──
export const COMPANY_CONFIG = {
  companyName: 'Shankar Metalworks Pvt. Ltd.',
  tradingName: 'Shankar Metalworks',
  businessType: 'manufacturing' as const,
  legalName: 'Shankar Metalworks Private Limited',
  entityType: 'Private Limited',
  pan: 'AABCS1234F',
  registeredAddress: 'Plot No. 45, IDA Uppal',
  city: 'Hyderabad',
  state: 'Telangana',
  pincode: '500039',
  phone: '040-12345678',
  email: 'admin@shankarmfg.com',
  financialYear: '2026-27',
  currency: 'INR',
  gstin: '36AABCS1234F1Z5',
  onboardingComplete: true,
};
