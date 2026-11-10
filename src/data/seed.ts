// Deterministic reference date for all prototype time calculations — do not use new Date()
export const DEMO_NOW = '2026-11-05';

import type {
  DemoUser, Site, StoreLocation, Party, MaterialItem, MaterialLot,
  CustomerRFQ, CustomerPO, POLine, SupplierPO, SupplierPOLine,
  PurchaseRequisition, Job, JobStage, JobUpdate, JobMaterialReq, JobBlocker,
  GoodsReceipt, StockMovement, InventoryItem, MaterialCertificate,
  Inspection, NCR, QualityRelease, Asset, MaintenanceEvent,
  Dispatch, VaultDocument, ApprovalRequest, AppNotification, PulseException,
  Employee, SupplierQuotation, AuditEvent, ApprovalPolicy,
  FinishedProduct, CustomerQuotation, CustomerQuotationLine, SiteAllocation,
  Invoice, InvoiceLine, Payment, PaymentAllocation, CollectionActivity,
  MeterReading, InspectionTemplate, StageTemplate, DispatchPackage
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
  // Hyderabad Plant 2
  { id: 'emp-011', userId: '', employeeCode: 'EMP-011', name: 'Ravi Shankar', role: 'supervisor', department: 'Production', designation: 'Plant Supervisor', joiningDate: '2016-04-01', siteId: 'site-hyd2' },
  { id: 'emp-012', userId: '', employeeCode: 'EMP-012', name: 'Ramesh Nair', role: 'operator', department: 'Production', designation: 'CNC Operator', joiningDate: '2019-07-01', siteId: 'site-hyd2' },
  { id: 'emp-013', userId: '', employeeCode: 'EMP-013', name: 'Latha Krishnan', role: 'qc', department: 'Quality', designation: 'QC Inspector', joiningDate: '2020-03-01', siteId: 'site-hyd2' },
  { id: 'emp-014', userId: '', employeeCode: 'EMP-014', name: 'Srikanth B', role: 'storekeeper', department: 'Store', designation: 'Storekeeper', joiningDate: '2021-01-15', siteId: 'site-hyd2' },
  { id: 'emp-015', userId: '', employeeCode: 'EMP-015', name: 'Naresh M', role: 'maintenance', department: 'Maintenance', designation: 'Maintenance Technician', joiningDate: '2020-09-01', siteId: 'site-hyd2' },
  // Pune Manufacturing Plant
  { id: 'emp-016', userId: '', employeeCode: 'EMP-016', name: 'Ajay Kulkarni', role: 'supervisor', department: 'Production', designation: 'Plant Manager', joiningDate: '2015-05-01', siteId: 'site-pun' },
  { id: 'emp-017', userId: '', employeeCode: 'EMP-017', name: 'Santosh Desai', role: 'operator', department: 'Production', designation: 'VMC Operator', joiningDate: '2018-11-01', siteId: 'site-pun' },
  { id: 'emp-018', userId: '', employeeCode: 'EMP-018', name: 'Meena Joshi', role: 'qc', department: 'Quality', designation: 'Quality Engineer', joiningDate: '2019-04-01', siteId: 'site-pun' },
  { id: 'emp-019', userId: '', employeeCode: 'EMP-019', name: 'Prakash Mane', role: 'storekeeper', department: 'Store', designation: 'Store Incharge', joiningDate: '2017-06-01', siteId: 'site-pun' },
  { id: 'emp-020', userId: '', employeeCode: 'EMP-020', name: 'Vikas Pawar', role: 'maintenance', department: 'Maintenance', designation: 'Electrical Technician', joiningDate: '2019-08-01', siteId: 'site-pun' },
  // Chennai Fabrication Unit
  { id: 'emp-021', userId: '', employeeCode: 'EMP-021', name: 'Selvam Murugan', role: 'supervisor', department: 'Production', designation: 'Unit Head', joiningDate: '2016-02-01', siteId: 'site-che' },
  { id: 'emp-022', userId: '', employeeCode: 'EMP-022', name: 'Arjun Raghunathan', role: 'operator', department: 'Production', designation: 'Welding Operator', joiningDate: '2020-05-01', siteId: 'site-che' },
  { id: 'emp-023', userId: '', employeeCode: 'EMP-023', name: 'Kavitha Sundaram', role: 'qc', department: 'Quality', designation: 'NDT Technician', joiningDate: '2021-02-01', siteId: 'site-che' },
  { id: 'emp-024', userId: '', employeeCode: 'EMP-024', name: 'Dinesh Kumar C', role: 'storekeeper', department: 'Store', designation: 'Storekeeper', joiningDate: '2020-10-01', siteId: 'site-che' },
  { id: 'emp-025', userId: '', employeeCode: 'EMP-025', name: 'Balaji R', role: 'maintenance', department: 'Maintenance', designation: 'Fitter', joiningDate: '2019-12-01', siteId: 'site-che' },
];

// ── Sites ──
export const SITES: Site[] = [
  { id: 'site-hyd', name: 'Hyderabad Plant 1', code: 'HYD1', city: 'Hyderabad', siteType: 'Precision Machining', address: 'Plot 42, IDA Nacharam, Hyderabad', state: 'Telangana', pinCode: '500076', siteManager: 'Suresh Kumar', phone: '+91-40-27172100', status: 'active' },
  { id: 'site-wh', name: 'Hyderabad Central Warehouse', code: 'HYDWH', city: 'Hyderabad', siteType: 'Warehouse', address: 'Survey No 112, Medchal Road, Hyderabad', state: 'Telangana', pinCode: '500055', siteManager: 'Asha Nair', phone: '+91-40-27172200', status: 'active' },
  { id: 'site-hyd2', name: 'Hyderabad Plant 2', code: 'HYD2', city: 'Hyderabad', siteType: 'Manufacturing', address: 'Plot 88, IDA Jeedimetla, Hyderabad', state: 'Telangana', pinCode: '500055', siteManager: 'Ravi Shankar', phone: '+91-40-27172300', status: 'active' },
  { id: 'site-pun', name: 'Pune Manufacturing Plant', code: 'PUN1', city: 'Pune', siteType: 'Manufacturing', address: 'D-14, MIDC Bhosari, Pune', state: 'Maharashtra', pinCode: '411026', siteManager: 'Ajay Kulkarni', phone: '+91-20-27485100', status: 'active' },
  { id: 'site-che', name: 'Chennai Fabrication Unit', code: 'CHE1', city: 'Chennai', siteType: 'Fabrication', address: 'Plot 23, SIPCOT Ambattur, Chennai', state: 'Tamil Nadu', pinCode: '600058', siteManager: 'Selvam Murugan', phone: '+91-44-26583100', status: 'active' },
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
  // Hyderabad Plant 2
  { id: 'loc-hyd2-rm', siteId: 'site-hyd2', name: 'Raw Material Store', code: 'RM', locationType: 'RM' },
  { id: 'loc-hyd2-wip', siteId: 'site-hyd2', name: 'WIP Store', code: 'WIP', locationType: 'WIP' },
  { id: 'loc-hyd2-fg', siteId: 'site-hyd2', name: 'Finished Goods Store', code: 'FG', locationType: 'FG' },
  // Pune Manufacturing Plant
  { id: 'loc-pun-rm', siteId: 'site-pun', name: 'Raw Material Store', code: 'RM', locationType: 'RM' },
  { id: 'loc-pun-wip', siteId: 'site-pun', name: 'WIP Store', code: 'WIP', locationType: 'WIP' },
  { id: 'loc-pun-fg', siteId: 'site-pun', name: 'Finished Goods Store', code: 'FG', locationType: 'FG' },
  // Chennai Fabrication Unit
  { id: 'loc-che-rm', siteId: 'site-che', name: 'Raw Material Store', code: 'RM', locationType: 'RM' },
  { id: 'loc-che-wip', siteId: 'site-che', name: 'Fabrication Floor', code: 'FAB', locationType: 'WIP' },
  { id: 'loc-che-fg', siteId: 'site-che', name: 'Finished Goods Store', code: 'FG', locationType: 'FG' },
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
  { id: 'supp-sfa', partyType: 'Supplier', legalName: 'SteelForge Alloys Pvt Ltd', tradingName: 'SteelForge Alloys', panNumber: 'AABCS9999J', gstin: '27AABCS9999J1ZY', state: 'Maharashtra', paymentTerms: 'Net 30', currency: 'INR', category: 'Forgings', rating: 4, status: 'active', contactPerson: 'Vikram Deshmukh', phone: '9820012345', email: 'sales@steelforgealloys.com', city: 'Pune', since: '2019' },
  { id: 'supp-krn', partyType: 'Supplier', legalName: 'Krishna Forgings Ltd', tradingName: 'Krishna Forgings', panNumber: 'AABCK1010K', gstin: '36AABCK1010K1ZZ', state: 'Telangana', paymentTerms: 'Net 45', currency: 'INR', category: 'Forgings', rating: 4, status: 'active', contactPerson: 'Lakshmi Narayana', phone: '9100098765', email: 'sales@krishnaforgings.com', city: 'Hyderabad', since: '2021' },
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
  { id: 'mat-42crmo4', itemCode: 'FRG-42CD4-RND', name: 'Steel Grade 42CrMo4 Forged Round Billet', categoryId: 'cat-alloy', categoryName: 'Alloy Steel Forgings', primaryUom: 'kg', trackingMode: 'heat', reorderPoint: 400, standardGrade: 'EN 10083-3 42CrMo4', dimensions: 'Ø280mm × 650mm billet', leadTimeDays: 18, certRequired: true, preferredSupplierIds: ['supp-sfa', 'supp-krn'], active: true },
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
function weekOut(id: string, jobNumber: string, customerId: string, customerName: string, plannedEnd: string, actualEnd: string | undefined, qty: number, uom: string, status: 'complete' | 'active'): Job {
  const done = status === 'complete';
  return {
    id, jobNumber, customerId, customerName, description: `Dispatch ${jobNumber} — ${qty} ${uom}`,
    siteId: 'site-hyd', siteName: 'Hyderabad Factory', status, priority: done ? 'normal' : 'high',
    plannedStart: '2026-10-20', plannedEnd, actualStart: '2026-10-20', actualEnd, owner: 'Suresh Kumar',
    currentStage: done ? 'Dispatched' : 'Dispatch', materialReadiness: 'ready', hasBlocker: false,
    stages: [
      { id: `${id}-s1`, jobId: id, sequence: 1, name: 'Fabrication', status: 'complete', plannedStart: '2026-10-20', plannedEnd: '2026-10-31', actualStart: '2026-10-20', actualEnd: '2026-10-31', owner: 'Mohan Das', workCentre: 'Fabrication Bay', inputQty: qty, completedGoodQty: qty, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom },
      { id: `${id}-s2`, jobId: id, sequence: 2, name: 'Dispatch', status: done ? 'complete' : 'in_progress', plannedStart: plannedEnd, plannedEnd, actualStart: done ? plannedEnd : '2026-11-05', actualEnd: done ? plannedEnd : undefined, owner: 'Deepa Singh', workCentre: 'Dispatch Bay', inputQty: qty, completedGoodQty: done ? qty : 0, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom },
    ],
  };
}

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
  // Week of 2–7 Nov 2026 (demo clock Thu 5 Nov). Past and today have already been packed.
  weekOut('job-109', 'J-109', 'cust-mer', 'Meridian Engineering', '2026-11-02', '2026-11-02', 4, 'crates', 'complete'),
  weekOut('job-110', 'J-110', 'cust-bpe', 'Bharat Power Equipment', '2026-11-02', '2026-11-02', 6, 'pcs', 'complete'),
  weekOut('job-111', 'J-111', 'cust-lt', 'L&T Hydrocarbon', '2026-11-03', '2026-11-03', 8, 'pcs', 'complete'),
  weekOut('job-112', 'J-112', 'cust-sv', 'SV Industries', '2026-11-04', '2026-11-04', 2, 'units', 'complete'),
  weekOut('job-113', 'J-113', 'cust-af', 'Anand Fabricators', '2026-11-05', '2026-11-05', 3, 'crates', 'complete'),
  weekOut('job-114', 'J-114', 'cust-ntpc', 'NTPC Vendor Division', '2026-11-05', '2026-11-05', 12, 'pcs', 'complete'),
  weekOut('job-115', 'J-115', 'cust-mer', 'Meridian Engineering', '2026-11-06', undefined, 5, 'crates', 'active'),
  weekOut('job-116', 'J-116', 'cust-bpe', 'Bharat Power Equipment', '2026-11-06', undefined, 2, 'units', 'active'),
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
  { id: 'dsp-109', dispatchNumber: 'DSP-2026-021', customerId: 'cust-mer', customerName: 'Meridian Engineering', jobId: 'job-109', jobNumber: 'J-109', dispatchDate: '2026-11-02', status: 'delivered', lineCount: 1, totalQty: 4, hasPoD: true, jobs: ['J-109'], carrier: 'SRS Transport', sourceSiteId: 'site-hyd', sourceStoreLocationName: 'Dispatch Bay' },
  { id: 'dsp-110', dispatchNumber: 'DSP-2026-022', customerId: 'cust-bpe', customerName: 'Bharat Power Equipment', jobId: 'job-110', jobNumber: 'J-110', dispatchDate: '2026-11-02', status: 'delivered', lineCount: 1, totalQty: 6, hasPoD: true, jobs: ['J-110'], carrier: 'VRL Logistics', sourceSiteId: 'site-hyd', sourceStoreLocationName: 'Dispatch Bay' },
  { id: 'dsp-111', dispatchNumber: 'DSP-2026-023', customerId: 'cust-lt', customerName: 'L&T Hydrocarbon', jobId: 'job-111', jobNumber: 'J-111', dispatchDate: '2026-11-03', status: 'dispatched', lineCount: 1, totalQty: 8, hasPoD: false, jobs: ['J-111'], carrier: 'TCI Freight', sourceSiteId: 'site-hyd', sourceStoreLocationName: 'Dispatch Bay' },
  { id: 'dsp-112', dispatchNumber: 'DSP-2026-024', customerId: 'cust-sv', customerName: 'SV Industries', jobId: 'job-112', jobNumber: 'J-112', dispatchDate: '2026-11-04', status: 'delivered', lineCount: 1, totalQty: 2, hasPoD: true, jobs: ['J-112'], carrier: 'SRS Transport', sourceSiteId: 'site-hyd', sourceStoreLocationName: 'Dispatch Bay' },
  { id: 'dsp-113', dispatchNumber: 'DSP-2026-025', customerId: 'cust-af', customerName: 'Anand Fabricators', jobId: 'job-113', jobNumber: 'J-113', dispatchDate: '2026-11-05', status: 'ready', lineCount: 1, totalQty: 3, hasPoD: false, jobs: ['J-113'], carrier: 'Loading bay', sourceSiteId: 'site-hyd', sourceStoreLocationName: 'Dispatch Bay' },
  { id: 'dsp-114', dispatchNumber: 'DSP-2026-026', customerId: 'cust-ntpc', customerName: 'NTPC Vendor Division', jobId: 'job-114', jobNumber: 'J-114', dispatchDate: '2026-11-05', status: 'pending_docs', lineCount: 1, totalQty: 12, hasPoD: false, jobs: ['J-114'], sourceSiteId: 'site-hyd', sourceStoreLocationName: 'Dispatch Bay' },
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

// ═══════════════════════════════════════════════════════════════════
// RHEINWERK FLAGSHIP SCENARIO — Apex Precision Engineering Pvt Ltd
// Customer: RheinWerk Turbinenanlagen GmbH (Düsseldorf, Germany)
// All financial values in INR only
// ═══════════════════════════════════════════════════════════════════

export const GERMAN_CUSTOMER: Party = {
  id: 'cust-rw', partyType: 'Customer',
  legalName: 'RheinWerk Turbinenanlagen GmbH',
  tradingName: 'RheinWerk',
  panNumber: 'AABCR9900Z',
  gstin: '',
  state: 'Export',
  paymentTerms: 'Net 60',
  creditLimit: 10000000,
  currency: 'INR',
  status: 'active',
  contactPerson: 'Klaus Werner',
  phone: '+49-211-98765400',
  email: 'purchase@rheinwerk-turbinen.de',
  city: 'Düsseldorf',
  since: '2024',
};

export const FINISHED_PRODUCTS: FinishedProduct[] = [
  { id: 'fg-001', productCode: 'APE-TC-001', name: 'Turbine Casing Cover Plate', description: 'High-precision cover plate for turbine casing, CNC machined SS304', categoryId: 'cat-precision', categoryName: 'Precision Components', primaryUom: 'Nos', drawingNumber: 'DWG-TC-001', drawingRevision: 'C', materialSpec: 'SS304 Grade', netWeightKg: 4.2, grossWeightKg: 4.8, primaryDimension: '450×320×18 mm', manufacturingRoute: 'CNC Turning → Milling → Inspection', status: 'active', unitPriceInr: 45000 },
  { id: 'fg-002', productCode: 'APE-SB-001', name: 'Shaft Bearing Housing', description: 'Precision bearing housing for turbine shaft, toleranced to H7', categoryId: 'cat-precision', categoryName: 'Precision Components', primaryUom: 'Nos', drawingNumber: 'DWG-SB-001', drawingRevision: 'B', materialSpec: 'EN8 Steel', netWeightKg: 6.5, grossWeightKg: 7.2, primaryDimension: '220×220×180 mm', manufacturingRoute: 'CNC Turning → Boring → Honing → Inspection', status: 'active', unitPriceInr: 8750 },
  { id: 'fg-003', productCode: 'APE-NZ-001', name: 'Steam Nozzle Block', description: 'Steam distribution nozzle block, investment cast and precision machined', categoryId: 'cat-precision', categoryName: 'Precision Components', primaryUom: 'Nos', drawingNumber: 'DWG-NZ-001', drawingRevision: 'A', materialSpec: 'SS316L', netWeightKg: 2.8, grossWeightKg: 3.2, primaryDimension: '180×90×75 mm', manufacturingRoute: 'CNC Milling → EDM → CMM Inspection', status: 'active', unitPriceInr: 10000 },
  { id: 'fg-004', productCode: 'APE-RF-001', name: 'Rotor Flange Assembly', description: 'Precision rotor flange with bolt circle, dynamic balanced', categoryId: 'cat-precision', categoryName: 'Precision Components', primaryUom: 'Nos', drawingNumber: 'DWG-RF-001', drawingRevision: 'D', materialSpec: 'Alloy Steel 42CrMo4', netWeightKg: 18.5, grossWeightKg: 20.0, primaryDimension: 'Ø520×85 mm', manufacturingRoute: 'Rough Turning → Heat Treatment → Finish Turning → Grinding → Balance', status: 'active', unitPriceInr: 50000 },
  { id: 'fg-005', productCode: 'APE-SP-001', name: 'Seal Plate Set', description: 'Labyrinth seal plate set for turbine end cover, 4-piece', categoryId: 'cat-precision', categoryName: 'Precision Components', primaryUom: 'Set', drawingNumber: 'DWG-SP-001', drawingRevision: 'B', materialSpec: 'SS410', netWeightKg: 1.4, grossWeightKg: 1.6, primaryDimension: 'Ø180×12 mm each', manufacturingRoute: 'CNC Turning → Wire EDM → Deburr → Inspection', status: 'active', unitPriceInr: 16000 },
  { id: 'fg-006', productCode: 'APE-DP-001', name: 'Diaphragm Plate', description: 'Stage diaphragm plate for steam turbine, precision EDM slots', categoryId: 'cat-precision', categoryName: 'Precision Components', primaryUom: 'Nos', drawingNumber: 'DWG-DP-001', drawingRevision: 'A', materialSpec: 'SS316', netWeightKg: 9.2, grossWeightKg: 10.0, primaryDimension: 'Ø380×25 mm', manufacturingRoute: 'CNC Turning → EDM → CMM', status: 'active', unitPriceInr: 32000 },
  { id: 'fg-007', productCode: 'APE-CB-001', name: 'Coupling Bolt Set', description: 'High-strength coupling bolt set M24×200, 8-piece with nuts', categoryId: 'cat-fastener', categoryName: 'Precision Fasteners', primaryUom: 'Set', drawingNumber: 'DWG-CB-001', drawingRevision: 'A', materialSpec: 'High Tensile Grade 10.9', netWeightKg: 3.6, grossWeightKg: 4.0, primaryDimension: 'M24×200 mm', manufacturingRoute: 'Thread Rolling → Heat Treatment → Plating → Inspection', status: 'active', unitPriceInr: 5500 },
];

export const FLAGSHIP_RFQ: CustomerRFQ = {
  id: 'rfq-rw-001', rfqNumber: 'RFQ-0001', customerId: 'cust-rw', customerName: 'RheinWerk Turbinenanlagen GmbH',
  receivedDate: '2024-10-01', requiredBy: '2024-11-30',
  status: 'converted', lineCount: 5, channel: 'Email', owner: 'Anita Mehta',
};

export const FLAGSHIP_QUOTATION: CustomerQuotation = {
  id: 'qt-rw-001', quotationNumber: 'QT-0001', rfqId: 'rfq-rw-001', rfqNumber: 'RFQ-0001',
  customerId: 'cust-rw', customerName: 'RheinWerk Turbinenanlagen GmbH',
  quotationDate: '2024-10-07', validUntil: '2024-11-07', currency: 'INR',
  status: 'accepted', totalValue: 6000000, revision: 1, owner: 'Anita Mehta',
  notes: 'Quotation accepted by Klaus Werner on 12-Oct-2024.',
};

export const FLAGSHIP_QUOTATION_LINES: CustomerQuotationLine[] = [
  { id: 'qtl-001', quotationId: 'qt-rw-001', productId: 'fg-001', productName: 'Turbine Casing Cover Plate', drawingNumber: 'DWG-TC-001', drawingRevision: 'C', orderedQty: 40, uom: 'Nos', unitPrice: 45000, value: 1800000, requiredDate: '2024-11-20' },
  { id: 'qtl-002', quotationId: 'qt-rw-001', productId: 'fg-002', productName: 'Shaft Bearing Housing', drawingNumber: 'DWG-SB-001', drawingRevision: 'B', orderedQty: 80, uom: 'Nos', unitPrice: 8750, value: 700000, requiredDate: '2024-11-20' },
  { id: 'qtl-003', quotationId: 'qt-rw-001', productId: 'fg-003', productName: 'Steam Nozzle Block', drawingNumber: 'DWG-NZ-001', drawingRevision: 'A', orderedQty: 120, uom: 'Nos', unitPrice: 10000, value: 1200000, requiredDate: '2024-11-25' },
  { id: 'qtl-004', quotationId: 'qt-rw-001', productId: 'fg-004', productName: 'Rotor Flange Assembly', drawingNumber: 'DWG-RF-001', drawingRevision: 'D', orderedQty: 30, uom: 'Nos', unitPrice: 50000, value: 1500000, requiredDate: '2024-11-28' },
  { id: 'qtl-005', quotationId: 'qt-rw-001', productId: 'fg-005', productName: 'Seal Plate Set', drawingNumber: 'DWG-SP-001', drawingRevision: 'B', orderedQty: 50, uom: 'Set', unitPrice: 16000, value: 800000, requiredDate: '2024-11-25' },
];

export const FLAGSHIP_PO: CustomerPO = {
  id: 'cpo-rw-001', poNumber: 'CPO-0001', customerId: 'cust-rw', customerName: 'RheinWerk Turbinenanlagen GmbH',
  acceptedDate: '2024-10-14', currency: 'INR', totalValue: 6000000, lineCount: 5,
  status: 'complete', paymentTerms: 'Net 60', deliveryTerms: 'FOB Hyderabad — ICD Patparganj, New Delhi',
  quotationRef: 'QT-0001',
};

export const FLAGSHIP_PO_LINES: POLine[] = [
  { id: 'cpl-001', poId: 'cpo-rw-001', drawingNumber: 'DWG-TC-001', revision: 'C', description: 'Turbine Casing Cover Plate (APE-TC-001)', orderedQty: 40, uom: 'Nos', rate: 45000, value: 1800000, requiredDate: '2024-11-20', status: 'complete' },
  { id: 'cpl-002', poId: 'cpo-rw-001', drawingNumber: 'DWG-SB-001', revision: 'B', description: 'Shaft Bearing Housing (APE-SB-001)', orderedQty: 80, uom: 'Nos', rate: 8750, value: 700000, requiredDate: '2024-11-20', status: 'complete' },
  { id: 'cpl-003', poId: 'cpo-rw-001', drawingNumber: 'DWG-NZ-001', revision: 'A', description: 'Steam Nozzle Block (APE-NZ-001)', orderedQty: 120, uom: 'Nos', rate: 10000, value: 1200000, requiredDate: '2024-11-25', status: 'complete' },
  { id: 'cpl-004', poId: 'cpo-rw-001', drawingNumber: 'DWG-RF-001', revision: 'D', description: 'Rotor Flange Assembly (APE-RF-001)', orderedQty: 30, uom: 'Nos', rate: 50000, value: 1500000, requiredDate: '2024-11-28', status: 'complete' },
  { id: 'cpl-005', poId: 'cpo-rw-001', drawingNumber: 'DWG-SP-001', revision: 'B', description: 'Seal Plate Set (APE-SP-001)', orderedQty: 50, uom: 'Set', rate: 16000, value: 800000, requiredDate: '2024-11-25', status: 'complete' },
];

export const FLAGSHIP_SITE_ALLOCATIONS: SiteAllocation[] = [
  { id: 'sa-001', poId: 'cpo-rw-001', poNumber: 'CPO-0001', poLineId: 'cpl-001', productId: 'fg-001', productName: 'Turbine Casing Cover Plate', siteId: 'site-hyd', siteName: 'Hyderabad Plant 1', allocatedQty: 25, uom: 'Nos', jobId: 'job-rw-001', jobNumber: 'JOB-0001', status: 'complete', allocatedDate: '2024-10-15', allocatedBy: 'Suresh Kumar' },
  { id: 'sa-002', poId: 'cpo-rw-001', poNumber: 'CPO-0001', poLineId: 'cpl-001', productId: 'fg-001', productName: 'Turbine Casing Cover Plate', siteId: 'site-hyd2', siteName: 'Hyderabad Plant 2', allocatedQty: 15, uom: 'Nos', jobId: 'job-rw-002', jobNumber: 'JOB-0002', status: 'complete', allocatedDate: '2024-10-15', allocatedBy: 'Suresh Kumar' },
  { id: 'sa-003', poId: 'cpo-rw-001', poNumber: 'CPO-0001', poLineId: 'cpl-002', productId: 'fg-002', productName: 'Shaft Bearing Housing', siteId: 'site-pun', siteName: 'Pune Manufacturing Plant', allocatedQty: 80, uom: 'Nos', jobId: 'job-rw-003', jobNumber: 'JOB-0003', status: 'complete', allocatedDate: '2024-10-15', allocatedBy: 'Suresh Kumar' },
  { id: 'sa-004', poId: 'cpo-rw-001', poNumber: 'CPO-0001', poLineId: 'cpl-003', productId: 'fg-003', productName: 'Steam Nozzle Block', siteId: 'site-hyd', siteName: 'Hyderabad Plant 1', allocatedQty: 60, uom: 'Nos', jobId: 'job-rw-004', jobNumber: 'JOB-0004', status: 'complete', allocatedDate: '2024-10-16', allocatedBy: 'Suresh Kumar' },
  { id: 'sa-005', poId: 'cpo-rw-001', poNumber: 'CPO-0001', poLineId: 'cpl-003', productId: 'fg-003', productName: 'Steam Nozzle Block', siteId: 'site-che', siteName: 'Chennai Fabrication Unit', allocatedQty: 60, uom: 'Nos', jobId: 'job-rw-005', jobNumber: 'JOB-0005', status: 'complete', allocatedDate: '2024-10-16', allocatedBy: 'Suresh Kumar' },
  { id: 'sa-006', poId: 'cpo-rw-001', poNumber: 'CPO-0001', poLineId: 'cpl-004', productId: 'fg-004', productName: 'Rotor Flange Assembly', siteId: 'site-hyd', siteName: 'Hyderabad Plant 1', allocatedQty: 30, uom: 'Nos', jobId: 'job-rw-006', jobNumber: 'JOB-0006', status: 'complete', allocatedDate: '2024-10-16', allocatedBy: 'Suresh Kumar' },
  { id: 'sa-007', poId: 'cpo-rw-001', poNumber: 'CPO-0001', poLineId: 'cpl-005', productId: 'fg-005', productName: 'Seal Plate Set', siteId: 'site-hyd2', siteName: 'Hyderabad Plant 2', allocatedQty: 50, uom: 'Set', jobId: 'job-rw-007', jobNumber: 'JOB-0007', status: 'complete', allocatedDate: '2024-10-17', allocatedBy: 'Suresh Kumar' },
];

function rwStages(jobId: string, qty: number): JobStage[] {
  return [
    { id: `${jobId}-s1`, jobId, sequence: 1, name: 'Material Preparation', status: 'complete', plannedStart: '2024-10-18', plannedEnd: '2024-10-20', actualStart: '2024-10-18', actualEnd: '2024-10-20', owner: 'Mohan Das', workCentre: 'Prep Bay', inputQty: qty, completedGoodQty: qty, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'Nos' },
    { id: `${jobId}-s2`, jobId, sequence: 2, name: 'CNC Machining', status: 'complete', plannedStart: '2024-10-21', plannedEnd: '2024-10-28', actualStart: '2024-10-21', actualEnd: '2024-10-27', owner: 'Mohan Das', workCentre: 'CNC-1', inputQty: qty, completedGoodQty: qty, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'Nos' },
    { id: `${jobId}-s3`, jobId, sequence: 3, name: 'Quality Inspection', status: 'complete', plannedStart: '2024-10-28', plannedEnd: '2024-10-29', actualStart: '2024-10-28', actualEnd: '2024-10-29', owner: 'Priya Patel', workCentre: 'QC Lab', inputQty: qty, completedGoodQty: qty, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'Nos' },
    { id: `${jobId}-s4`, jobId, sequence: 4, name: 'Packaging', status: 'complete', plannedStart: '2024-10-30', plannedEnd: '2024-10-30', actualStart: '2024-10-30', actualEnd: '2024-10-30', owner: 'Deepa Singh', workCentre: 'Pack Bay', inputQty: qty, completedGoodQty: qty, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'Nos' },
  ];
}

export const FLAGSHIP_JOBS: Job[] = [
  { id: 'job-rw-001', jobNumber: 'JOB-0001', customerId: 'cust-rw', customerName: 'RheinWerk', customerPoId: 'cpo-rw-001', customerPoNumber: 'CPO-0001', drawingRef: 'DWG-TC-001 Rev C', description: 'Turbine Casing Cover Plate — 25 Nos', siteId: 'site-hyd', siteName: 'Hyderabad Plant 1', plannedStart: '2024-10-18', plannedEnd: '2024-11-10', actualStart: '2024-10-18', actualEnd: '2024-11-08', status: 'complete', currentStage: 'Packaging', priority: 'high', owner: 'Suresh Kumar', materialReadiness: 'ready', hasBlocker: false, stages: rwStages('job-rw-001', 25), value: 1125000 },
  { id: 'job-rw-002', jobNumber: 'JOB-0002', customerId: 'cust-rw', customerName: 'RheinWerk', customerPoId: 'cpo-rw-001', customerPoNumber: 'CPO-0001', drawingRef: 'DWG-TC-001 Rev C', description: 'Turbine Casing Cover Plate — 15 Nos', siteId: 'site-hyd2', siteName: 'Hyderabad Plant 2', plannedStart: '2024-10-18', plannedEnd: '2024-11-10', actualStart: '2024-10-18', actualEnd: '2024-11-09', status: 'complete', currentStage: 'Packaging', priority: 'high', owner: 'Ravi Shankar', materialReadiness: 'ready', hasBlocker: false, stages: rwStages('job-rw-002', 15), value: 675000 },
  { id: 'job-rw-003', jobNumber: 'JOB-0003', customerId: 'cust-rw', customerName: 'RheinWerk', customerPoId: 'cpo-rw-001', customerPoNumber: 'CPO-0001', drawingRef: 'DWG-SB-001 Rev B', description: 'Shaft Bearing Housing — 80 Nos', siteId: 'site-pun', siteName: 'Pune Manufacturing Plant', plannedStart: '2024-10-18', plannedEnd: '2024-11-15', actualStart: '2024-10-19', actualEnd: '2024-11-13', status: 'complete', currentStage: 'Packaging', priority: 'normal', owner: 'Ajay Kulkarni', materialReadiness: 'ready', hasBlocker: false, stages: rwStages('job-rw-003', 80), value: 700000 },
  { id: 'job-rw-004', jobNumber: 'JOB-0004', customerId: 'cust-rw', customerName: 'RheinWerk', customerPoId: 'cpo-rw-001', customerPoNumber: 'CPO-0001', drawingRef: 'DWG-NZ-001 Rev A', description: 'Steam Nozzle Block — 60 Nos', siteId: 'site-hyd', siteName: 'Hyderabad Plant 1', plannedStart: '2024-10-20', plannedEnd: '2024-11-18', actualStart: '2024-10-20', actualEnd: '2024-11-16', status: 'complete', currentStage: 'Packaging', priority: 'normal', owner: 'Suresh Kumar', materialReadiness: 'ready', hasBlocker: false, stages: rwStages('job-rw-004', 60), value: 600000 },
  { id: 'job-rw-005', jobNumber: 'JOB-0005', customerId: 'cust-rw', customerName: 'RheinWerk', customerPoId: 'cpo-rw-001', customerPoNumber: 'CPO-0001', drawingRef: 'DWG-NZ-001 Rev A', description: 'Steam Nozzle Block — 60 Nos', siteId: 'site-che', siteName: 'Chennai Fabrication Unit', plannedStart: '2024-10-20', plannedEnd: '2024-11-18', actualStart: '2024-10-21', actualEnd: '2024-11-17', status: 'complete', currentStage: 'Packaging', priority: 'normal', owner: 'Selvam Murugan', materialReadiness: 'ready', hasBlocker: false, stages: rwStages('job-rw-005', 60), value: 600000 },
  { id: 'job-rw-006', jobNumber: 'JOB-0006', customerId: 'cust-rw', customerName: 'RheinWerk', customerPoId: 'cpo-rw-001', customerPoNumber: 'CPO-0001', drawingRef: 'DWG-RF-001 Rev D', description: 'Rotor Flange Assembly — 30 Nos', siteId: 'site-hyd', siteName: 'Hyderabad Plant 1', plannedStart: '2024-10-18', plannedEnd: '2024-11-22', actualStart: '2024-10-18', actualEnd: '2024-11-20', status: 'complete', currentStage: 'Packaging', priority: 'high', owner: 'Suresh Kumar', materialReadiness: 'ready', hasBlocker: false, stages: rwStages('job-rw-006', 30), value: 1500000 },
  { id: 'job-rw-007', jobNumber: 'JOB-0007', customerId: 'cust-rw', customerName: 'RheinWerk', customerPoId: 'cpo-rw-001', customerPoNumber: 'CPO-0001', drawingRef: 'DWG-SP-001 Rev B', description: 'Seal Plate Set — 50 Sets', siteId: 'site-hyd2', siteName: 'Hyderabad Plant 2', plannedStart: '2024-10-20', plannedEnd: '2024-11-18', actualStart: '2024-10-20', actualEnd: '2024-11-15', status: 'complete', currentStage: 'Packaging', priority: 'normal', owner: 'Ravi Shankar', materialReadiness: 'ready', hasBlocker: false, stages: rwStages('job-rw-007', 50), value: 800000 },
];

export const FLAGSHIP_DISPATCHES: Dispatch[] = [
  { id: 'dsp-rw-001', dispatchNumber: 'DSP-0001', customerId: 'cust-rw', customerName: 'RheinWerk Turbinenanlagen GmbH', dispatchDate: '2024-11-18', carrier: 'DB Schenker India Pvt Ltd', vehicleNumber: 'TS09EE4521', lrNumber: 'DBK-IND-24-110892', expectedDelivery: '2024-11-21', lineCount: 3, totalQty: 120, status: 'delivered', hasPoD: true, jobs: ['job-rw-001', 'job-rw-002', 'job-rw-003'] },
  { id: 'dsp-rw-002', dispatchNumber: 'DSP-0002', customerId: 'cust-rw', customerName: 'RheinWerk Turbinenanlagen GmbH', dispatchDate: '2024-11-22', carrier: 'DB Schenker India Pvt Ltd', vehicleNumber: 'TS09EE4789', lrNumber: 'DBK-IND-24-111234', expectedDelivery: '2024-11-25', lineCount: 4, totalQty: 200, status: 'delivered', hasPoD: true, jobs: ['job-rw-004', 'job-rw-005', 'job-rw-006', 'job-rw-007'] },
];

// INV-0001: ₹36,00,000 (Lines 1+2+3 partial)  INV-0002: ₹24,00,000 (Lines 3 remainder + 4 + 5)
// INV-0001 paid: PAY-0001 (₹10L) + PAY-0002 (₹26L) = ₹36L
// INV-0002 paid: PAY-0003 (₹24L)
export const FLAGSHIP_INVOICES: Invoice[] = [
  { id: 'inv-rw-001', invoiceNumber: 'INV-0001', customerId: 'cust-rw', customerName: 'RheinWerk Turbinenanlagen GmbH', poId: 'cpo-rw-001', poNumber: 'CPO-0001', dispatchIds: ['dsp-rw-001'], invoiceDate: '2024-11-21', dueDate: '2025-01-20', currency: 'INR', status: 'paid', subtotal: 3050847, taxAmount: 549153, totalAmount: 3600000, paidAmount: 3600000, outstandingAmount: 0, createdBy: 'Anita Mehta', notes: 'First dispatch invoice — DSP-0001. Tax: GST 18% (IGST — Export under LUT).' },
  { id: 'inv-rw-002', invoiceNumber: 'INV-0002', customerId: 'cust-rw', customerName: 'RheinWerk Turbinenanlagen GmbH', poId: 'cpo-rw-001', poNumber: 'CPO-0001', dispatchIds: ['dsp-rw-002'], invoiceDate: '2024-11-25', dueDate: '2025-01-24', currency: 'INR', status: 'paid', subtotal: 2033898, taxAmount: 366102, totalAmount: 2400000, paidAmount: 2400000, outstandingAmount: 0, createdBy: 'Anita Mehta', notes: 'Second dispatch invoice — DSP-0002.' },
];

export const FLAGSHIP_INVOICE_LINES: InvoiceLine[] = [
  { id: 'invl-001', invoiceId: 'inv-rw-001', productId: 'fg-001', productName: 'Turbine Casing Cover Plate', drawingNumber: 'DWG-TC-001', quantity: 40, uom: 'Nos', unitPrice: 45000, taxPct: 18, taxAmount: 324000, lineTotal: 2124000, dispatchId: 'dsp-rw-001', dispatchNumber: 'DSP-0001' },
  { id: 'invl-002', invoiceId: 'inv-rw-001', productId: 'fg-002', productName: 'Shaft Bearing Housing', drawingNumber: 'DWG-SB-001', quantity: 80, uom: 'Nos', unitPrice: 8750, taxPct: 18, taxAmount: 126000, lineTotal: 826000, dispatchId: 'dsp-rw-001', dispatchNumber: 'DSP-0001' },
  { id: 'invl-003', invoiceId: 'inv-rw-002', productId: 'fg-003', productName: 'Steam Nozzle Block', drawingNumber: 'DWG-NZ-001', quantity: 120, uom: 'Nos', unitPrice: 10000, taxPct: 18, taxAmount: 216000, lineTotal: 1416000, dispatchId: 'dsp-rw-002', dispatchNumber: 'DSP-0002' },
  { id: 'invl-004', invoiceId: 'inv-rw-002', productId: 'fg-004', productName: 'Rotor Flange Assembly', drawingNumber: 'DWG-RF-001', quantity: 30, uom: 'Nos', unitPrice: 50000, taxPct: 18, taxAmount: 270000, lineTotal: 1770000, dispatchId: 'dsp-rw-002', dispatchNumber: 'DSP-0002' },
];

export const FLAGSHIP_PAYMENTS: Payment[] = [
  { id: 'pay-rw-001', paymentNumber: 'PAY-0001', customerId: 'cust-rw', customerName: 'RheinWerk Turbinenanlagen GmbH', receiptDate: '2024-12-05', currency: 'INR', amount: 1000000, paymentMethod: 'bank_transfer', transactionRef: 'SWIFT-RW-241205-001', receivingAccount: 'Apex Precision — HDFC 50200012345', status: 'allocated', allocatedAmount: 1000000, unallocatedAmount: 0, createdBy: 'Anita Mehta', notes: 'Advance tranche 1 against INV-0001' },
  { id: 'pay-rw-002', paymentNumber: 'PAY-0002', customerId: 'cust-rw', customerName: 'RheinWerk Turbinenanlagen GmbH', receiptDate: '2024-12-20', currency: 'INR', amount: 2600000, paymentMethod: 'bank_transfer', transactionRef: 'SWIFT-RW-241220-002', receivingAccount: 'Apex Precision — HDFC 50200012345', status: 'allocated', allocatedAmount: 2600000, unallocatedAmount: 0, createdBy: 'Anita Mehta', notes: 'Balance against INV-0001' },
  { id: 'pay-rw-003', paymentNumber: 'PAY-0003', customerId: 'cust-rw', customerName: 'RheinWerk Turbinenanlagen GmbH', receiptDate: '2025-01-10', currency: 'INR', amount: 2400000, paymentMethod: 'bank_transfer', transactionRef: 'SWIFT-RW-250110-003', receivingAccount: 'Apex Precision — HDFC 50200012345', status: 'allocated', allocatedAmount: 2400000, unallocatedAmount: 0, createdBy: 'Anita Mehta', notes: 'Full settlement of INV-0002' },
];

export const FLAGSHIP_PAYMENT_ALLOCATIONS: PaymentAllocation[] = [
  { id: 'pa-001', paymentId: 'pay-rw-001', paymentNumber: 'PAY-0001', invoiceId: 'inv-rw-001', invoiceNumber: 'INV-0001', customerId: 'cust-rw', allocatedAmount: 1000000, allocatedDate: '2024-12-05', allocatedBy: 'Anita Mehta', notes: 'Partial payment against INV-0001' },
  { id: 'pa-002', paymentId: 'pay-rw-002', paymentNumber: 'PAY-0002', invoiceId: 'inv-rw-001', invoiceNumber: 'INV-0001', customerId: 'cust-rw', allocatedAmount: 2600000, allocatedDate: '2024-12-20', allocatedBy: 'Anita Mehta', notes: 'Balance of INV-0001 fully cleared' },
  { id: 'pa-003', paymentId: 'pay-rw-003', paymentNumber: 'PAY-0003', invoiceId: 'inv-rw-002', invoiceNumber: 'INV-0002', customerId: 'cust-rw', allocatedAmount: 2400000, allocatedDate: '2025-01-10', allocatedBy: 'Anita Mehta', notes: 'INV-0002 fully cleared' },
];

export const COLLECTION_ACTIVITIES: CollectionActivity[] = [
  { id: 'col-001', collectionNumber: 'COL-0001', customerId: 'cust-rw', customerName: 'RheinWerk Turbinenanlagen GmbH', invoiceId: 'inv-rw-001', invoiceNumber: 'INV-0001', assignedTo: 'Anita Mehta', followUpDate: '2024-12-02', channel: 'email', notes: 'Sent payment reminder for INV-0001 (₹36L). Due 20-Jan-2025.', promiseToPayDate: '2024-12-05', outcome: 'Klaus Werner confirmed payment in 2–3 days.', status: 'resolved', createdAt: '2024-12-02T10:00:00' },
  { id: 'col-002', collectionNumber: 'COL-0002', customerId: 'cust-rw', customerName: 'RheinWerk Turbinenanlagen GmbH', invoiceId: 'inv-rw-001', invoiceNumber: 'INV-0001', assignedTo: 'Anita Mehta', followUpDate: '2024-12-18', channel: 'phone', notes: 'Called Klaus Werner — balance of ₹26L to arrive by 20-Dec-2024.', promiseToPayDate: '2024-12-20', outcome: 'Payment received on 20-Dec-2024 as promised.', status: 'resolved', createdAt: '2024-12-18T14:30:00' },
  { id: 'col-003', collectionNumber: 'COL-0003', customerId: 'cust-rw', customerName: 'RheinWerk Turbinenanlagen GmbH', invoiceId: 'inv-rw-002', invoiceNumber: 'INV-0002', assignedTo: 'Anita Mehta', followUpDate: '2025-01-07', channel: 'email', notes: 'Advance notice sent for INV-0002 due 24-Jan-2025. ₹24L outstanding.', status: 'resolved', createdAt: '2025-01-07T09:00:00' },
];

// ── RheinWerk Quality Inspections ──
export const FLAGSHIP_INSPECTIONS: Inspection[] = [
  { id: 'ins-rw-001', inspectionNumber: 'QI-RW-001', type: 'Final', jobId: 'job-rw-001', jobNumber: 'JOB-0001', inspectorId: 'u-qc', inspectorName: 'Priya Patel', date: '2024-10-29', templateName: 'Precision Machining Final', sampleQty: 25, acceptedQty: 25, rejectedQty: 0, result: 'pass' },
  { id: 'ins-rw-002', inspectionNumber: 'QI-RW-002', type: 'Final', jobId: 'job-rw-003', jobNumber: 'JOB-0003', inspectorId: 'emp-018', inspectorName: 'Meena Joshi', date: '2024-11-13', templateName: 'Bearing Housing Final', sampleQty: 80, acceptedQty: 78, rejectedQty: 2, result: 'pass' },
  { id: 'ins-rw-003', inspectionNumber: 'QI-RW-003', type: 'Final', jobId: 'job-rw-006', jobNumber: 'JOB-0006', inspectorId: 'u-qc', inspectorName: 'Priya Patel', date: '2024-11-20', templateName: 'Flange Assembly Final', sampleQty: 30, acceptedQty: 30, rejectedQty: 0, result: 'pass' },
];

export const FLAGSHIP_NCRS: NCR[] = [
  { id: 'ncr-rw-001', ncrNumber: 'NCR-RW-001', inspectionId: 'ins-rw-002', sourceType: 'In-Process', severity: 'Minor', description: 'Minor burr on bearing bore on 2 of 80 Shaft Bearing Housings. Burr height >0.1mm detected during post-machining inspection.', affectedQty: 2, disposition: 'Rework', raisedBy: 'Meena Joshi', raisedAt: '2024-11-13T10:30:00', status: 'closed', jobId: 'job-rw-003' },
];

export const FLAGSHIP_PURCHASE_REQS: PurchaseRequisition[] = [
  { id: 'pr-rw-001', prNumber: 'PR-RW-001', raisedBy: 'Karthik Raju', raisedDate: '2024-10-15', requiredBy: '2024-10-25', jobId: 'job-rw-001', jobNumber: 'JOB-0001', status: 'converted', lineCount: 1, totalQty: 850, priority: 'high' },
  { id: 'pr-rw-002', prNumber: 'PR-RW-002', raisedBy: 'Karthik Raju', raisedDate: '2024-10-15', requiredBy: '2024-10-25', jobId: 'job-rw-003', jobNumber: 'JOB-0003', status: 'converted', lineCount: 1, totalQty: 1200, priority: 'high' },
];

export const ADDITIONAL_RFQ: CustomerRFQ = {
  id: 'rfq-rw-002', rfqNumber: 'RFQ-0002', customerId: 'cust-rw', customerName: 'RheinWerk Turbinenanlagen GmbH',
  receivedDate: '2024-10-28', requiredBy: '2025-01-31',
  status: 'open', lineCount: 2, channel: 'Email', owner: 'Anita Mehta',
};

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

export const FLAGSHIP_GRNS: GoodsReceipt[] = [
  {
    id: 'grn-rw-001', grnNumber: 'GRN-0001',
    supplierId: 'supp-msk', supplierName: 'MSK Steel Pvt Ltd',
    spoId: 'spo-rw-001', spoNumber: 'SPO-0001',
    receivedDate: '2024-10-28', receivedBy: 'Karthik Raju',
    deliveryChallan: 'DC-MSK-2024-1041',
    vehicleNumber: 'TS09EF1234',
    status: 'accepted', lineCount: 3, hasOfflineDraft: false,
  },
  {
    id: 'grn-rw-002', grnNumber: 'GRN-0002',
    supplierId: 'supp-ssi', supplierName: 'Stainless Source India',
    spoId: 'spo-rw-002', spoNumber: 'SPO-0002',
    receivedDate: '2024-10-30', receivedBy: 'Karthik Raju',
    deliveryChallan: 'DC-SSI-2024-0892',
    vehicleNumber: 'MH12PQ5678',
    status: 'accepted', lineCount: 2, hasOfflineDraft: false,
  },
];

export const FLAGSHIP_SUPPLIER_RFQS: SupplierQuotation[] = [
  {
    id: 'srfq-rw-001', quoteNumber: 'SRFQ-0001',
    supplierId: 'supp-msk', supplierName: 'MSK Steel Pvt Ltd',
    quoteDate: '2024-10-17', validUntil: '2024-10-31',
    currency: 'INR', status: 'selected',
    paymentTerms: 'Net 30', deliveryDays: 10,
    lines: [],
  },
  {
    id: 'srfq-rw-002', quoteNumber: 'SRFQ-0002',
    supplierId: 'supp-ssi', supplierName: 'Stainless Source India',
    quoteDate: '2024-10-17', validUntil: '2024-10-31',
    currency: 'INR', status: 'selected',
    paymentTerms: 'Net 30', deliveryDays: 12,
    lines: [],
  },
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

// ── Demonstration Scenario: Apex Precision Engineering ×
//    RheinWerk Turbinenanlagen GmbH (PRD §12) ──
// Added additively — does not alter any existing seed records above.
// ═══════════════════════════════════════════════════════════════════

// ── Production Stage Templates (configurable routes) ──
export const STAGE_TEMPLATES: StageTemplate[] = [
  {
    id: 'tmpl-standard-fabrication', name: 'Standard Fabrication Workflow', appliesToCategory: 'Fabrication / Welded Assemblies',
    description: 'Default route for the existing fabrication jobs; the instantiated stage sequence is snapshotted on each job.',
    stages: [
      { sequence: 1, name: 'Cutting', workCentre: 'Cutting Bay', plannedDurationDays: 3, inspectionRequired: false },
      { sequence: 2, name: 'Fit-up', workCentre: 'Fabrication Bay', plannedDurationDays: 3, inspectionRequired: false, dependsOnSequence: 1 },
      { sequence: 3, name: 'Welding', workCentre: 'Welding Bay', plannedDurationDays: 5, inspectionRequired: false, dependsOnSequence: 2 },
      { sequence: 4, name: 'NDT', workCentre: 'QC Bay', plannedDurationDays: 2, inspectionRequired: true, dependsOnSequence: 3 },
      { sequence: 5, name: 'Painting & Dispatch', workCentre: 'Paint Bay', plannedDurationDays: 2, inspectionRequired: false, dependsOnSequence: 4 },
    ],
  },
  {
    id: 'tmpl-heavy-fab', name: 'Heavy Forged Component Route', appliesToCategory: 'Heavy Forgings / Pressure Parts',
    description: 'For large forged/machined pressure-boundary components requiring NDT and final inspection before dispatch.',
    stages: [
      { sequence: 1, name: 'Billet Cutting & Prep', workCentre: 'Cutting Bay', plannedDurationDays: 4, inspectionRequired: false },
      { sequence: 2, name: 'Rough Machining (Lathe)', workCentre: 'Machining Bay', plannedDurationDays: 8, inspectionRequired: false, dependsOnSequence: 1 },
      { sequence: 3, name: 'CNC Finish Machining', workCentre: 'CNC Bay', plannedDurationDays: 10, inspectionRequired: false, dependsOnSequence: 2 },
      { sequence: 4, name: 'NDT (Ultrasonic Test)', workCentre: 'QC Bay', plannedDurationDays: 3, inspectionRequired: true, dependsOnSequence: 3 },
      { sequence: 5, name: 'Final Inspection', workCentre: 'QC Bay', plannedDurationDays: 2, inspectionRequired: true, dependsOnSequence: 4 },
      { sequence: 6, name: 'Painting & Dispatch Prep', workCentre: 'Paint Bay', plannedDurationDays: 3, inspectionRequired: false, dependsOnSequence: 5 },
    ],
  },
  {
    id: 'tmpl-structural-express', name: 'Express Machined Component Route', appliesToCategory: 'Small Machined Components',
    description: 'For smaller machined parts with a single final-inspection gate before dispatch.',
    stages: [
      { sequence: 1, name: 'Machining', workCentre: 'Machining Bay', plannedDurationDays: 6, inspectionRequired: false },
      { sequence: 2, name: 'Final Inspection', workCentre: 'QC Bay', plannedDurationDays: 2, inspectionRequired: true, dependsOnSequence: 1 },
      { sequence: 3, name: 'Dispatch Prep', workCentre: 'Dispatch Bay', plannedDurationDays: 2, inspectionRequired: false, dependsOnSequence: 2 },
    ],
  },
];

// ── Inspection Templates (configurable checklists) ──
export const INSPECTION_TEMPLATES: InspectionTemplate[] = [
  {
    id: 'tmpl-insp-casing', name: 'Turbine Casing – Final Dimensional & NDT Checklist', appliesTo: 'Final',
    productOrCategory: 'Turbine Casing', drawingRef: 'RHW-DWG-TC-2024-REV2', stageName: 'Final Inspection', version: 'v2',
    parameters: [
      { parameter: 'Bore Diameter', description: 'Inner bore diameter at mounting face', acceptanceCriteria: 'Ø420.00 +0.05/-0.00 mm', unit: 'mm', min: 420.00, max: 420.05, method: 'CMM', mandatory: true },
      { parameter: 'Flatness – Mounting Face', acceptanceCriteria: '≤ 0.05mm over 600mm', unit: 'mm', max: 0.05, method: 'Surface Plate + Dial Gauge', mandatory: true },
      { parameter: 'Surface Hardness', acceptanceCriteria: '280–320 HB', unit: 'HB', min: 280, max: 320, method: 'Brinell Hardness Tester', mandatory: true },
      { parameter: 'Ultrasonic Flaw Detection', acceptanceCriteria: 'No indications > 3mm equivalent per ASME SA-388', method: 'UT Scan', mandatory: true },
      { parameter: 'Visual & Dimensional – Overall', acceptanceCriteria: 'Per drawing RHW-DWG-TC-2024-REV2, all critical dimensions within tolerance', method: 'Visual + CMM', mandatory: true },
    ],
  },
  {
    id: 'tmpl-insp-weld-visual', name: 'Weld Visual Inspection', appliesTo: 'Job Stage', stageName: 'Welding', version: 'v1',
    parameters: [
      { parameter: 'Weld Undercut', acceptanceCriteria: '≤ 0.5mm per AWS D1.1', unit: 'mm', max: 0.5, method: 'Visual + Gauge', mandatory: true },
      { parameter: 'Porosity', acceptanceCriteria: 'No visible porosity > 1.5mm', method: 'Visual', mandatory: true },
    ],
  },
];

// ── Customer PO: RheinWerk Turbinenanlagen (2 product lines, 2 different routes) ──
export const CUSTOMER_POS_DEMO: CustomerPO[] = [
  { id: 'cpo-200', poNumber: 'CPO-2024-200', customerId: 'cust-rw', customerName: 'RheinWerk Turbinenanlagen GmbH', acceptedDate: '2024-10-20', paymentTerms: 'Net 45 (LC)', status: 'active', totalValue: 3400000, currency: 'INR', lineCount: 2, deliveryTerms: 'CIF Chennai Port', quotationRef: 'QT-2024-RHW-01' },
];

// ── Jobs: two product lines on the same PO, two different stage-template routes ──
export const JOBS_DEMO: Job[] = [
  {
    id: 'job-200', jobNumber: 'J-200', customerId: 'cust-rw', customerName: 'RheinWerk Turbinenanlagen GmbH', customerPoId: 'cpo-200', customerPoNumber: 'CPO-2024-200', poLineId: 'cpo-200-l1',
    drawingRef: 'RHW-DWG-TC-2024-REV2', description: 'Turbine Casing – Lower Half (Steam Turbine Housing)', siteId: 'site-hyd', siteName: 'Hyderabad Plant 1',
    status: 'active', priority: 'urgent', plannedStart: '2024-10-22', plannedEnd: '2024-11-22', actualStart: '2024-10-22', owner: 'Suresh Kumar',
    currentStage: 'CNC Finish Machining', materialReadiness: 'shortage', hasBlocker: true, value: 2800000,
    stageTemplateId: 'tmpl-heavy-fab', stageTemplateName: 'Heavy Forged Component Route',
    stages: [
      { id: 'stg-200-1', jobId: 'job-200', sequence: 1, name: 'Billet Cutting & Prep', status: 'complete', plannedStart: '2024-10-22', plannedEnd: '2024-10-26', actualStart: '2024-10-22', actualEnd: '2024-10-26', owner: 'Mohan Das', workCentre: 'Cutting Bay', inputQty: 1, completedGoodQty: 1, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'unit' },
      { id: 'stg-200-2', jobId: 'job-200', sequence: 2, name: 'Rough Machining (Lathe)', status: 'complete', plannedStart: '2024-10-27', plannedEnd: '2024-11-04', actualStart: '2024-10-27', actualEnd: '2024-11-03', owner: 'Mohan Das', workCentre: 'Machining Bay', inputQty: 1, completedGoodQty: 1, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'unit' },
      { id: 'stg-200-3', jobId: 'job-200', sequence: 3, name: 'CNC Finish Machining', status: 'in_progress', plannedStart: '2024-11-04', plannedEnd: '2024-11-14', actualStart: '2024-11-04', owner: 'Mohan Das', workCentre: 'CNC Bay', inputQty: 1, completedGoodQty: 0, rejectedQty: 0, reworkQty: 1, scrapQty: 0, uom: 'unit' },
      { id: 'stg-200-4', jobId: 'job-200', sequence: 4, name: 'NDT (Ultrasonic Test)', status: 'pending', plannedStart: '2024-11-15', plannedEnd: '2024-11-17', owner: '', workCentre: 'QC Bay', inputQty: 1, completedGoodQty: 0, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'unit' },
      { id: 'stg-200-5', jobId: 'job-200', sequence: 5, name: 'Final Inspection', status: 'pending', plannedStart: '2024-11-18', plannedEnd: '2024-11-19', owner: '', workCentre: 'QC Bay', inputQty: 1, completedGoodQty: 0, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'unit' },
      { id: 'stg-200-6', jobId: 'job-200', sequence: 6, name: 'Painting & Dispatch Prep', status: 'pending', plannedStart: '2024-11-20', plannedEnd: '2024-11-22', owner: '', workCentre: 'Paint Bay', inputQty: 1, completedGoodQty: 0, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'unit' },
    ],
  },
  {
    id: 'job-201', jobNumber: 'J-201', customerId: 'cust-rw', customerName: 'RheinWerk Turbinenanlagen GmbH', customerPoId: 'cpo-200', customerPoNumber: 'CPO-2024-200', poLineId: 'cpo-200-l2',
    drawingRef: 'RHW-DWG-RSC-2024-REV1', description: 'Rotor Shaft Coupling Flange Set (6 units)', siteId: 'site-hyd', siteName: 'Hyderabad Plant 1',
    status: 'active', priority: 'normal', plannedStart: '2024-10-25', plannedEnd: '2024-11-20', actualStart: '2024-10-25', owner: 'Suresh Kumar',
    currentStage: 'Final Inspection', materialReadiness: 'ready', hasBlocker: false, value: 600000,
    stageTemplateId: 'tmpl-structural-express', stageTemplateName: 'Express Machined Component Route',
    stages: [
      { id: 'stg-201-1', jobId: 'job-201', sequence: 1, name: 'Machining', status: 'complete', plannedStart: '2024-10-25', plannedEnd: '2024-10-31', actualStart: '2024-10-25', actualEnd: '2024-10-30', owner: 'Mohan Das', workCentre: 'Machining Bay', inputQty: 6, completedGoodQty: 6, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'pcs' },
      { id: 'stg-201-2', jobId: 'job-201', sequence: 2, name: 'Final Inspection', status: 'in_progress', plannedStart: '2024-11-01', plannedEnd: '2024-11-03', actualStart: '2024-11-01', owner: 'Priya Patel', workCentre: 'QC Bay', inputQty: 6, completedGoodQty: 0, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'pcs' },
      { id: 'stg-201-3', jobId: 'job-201', sequence: 3, name: 'Dispatch Prep', status: 'pending', plannedStart: '2024-11-04', plannedEnd: '2024-11-06', owner: '', workCentre: 'Dispatch Bay', inputQty: 6, completedGoodQty: 0, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'pcs' },
    ],
  },
];

// ── Material shortage demonstration: 42CrMo4 forged billet (PRD §3.6) ──
export const MATERIAL_LOTS_DEMO: MaterialLot[] = [
  { id: 'lot-301', lotNumber: 'LOT-2024-301', heatNumber: 'HT-KRN-7701', materialItemId: 'mat-42crmo4', materialName: 'Steel Grade 42CrMo4 Forged Round Billet', supplierId: 'supp-krn', supplierName: 'Krishna Forgings', receivedDate: '2024-10-05', grade: 'EN 10083-3 42CrMo4', status: 'reserved', storeLocationId: 'loc-rm', storeLocationName: 'Raw Material Store', primaryQty: 320, primaryUom: 'kg', certStatus: 'verified' },
  { id: 'lot-302', lotNumber: 'LOT-2024-302', heatNumber: 'HT-SFA-2209', materialItemId: 'mat-42crmo4', materialName: 'Steel Grade 42CrMo4 Forged Round Billet', supplierId: 'supp-sfa', supplierName: 'SteelForge Alloys', receivedDate: '2024-10-12', grade: 'EN 10083-3 42CrMo4', status: 'available', storeLocationId: 'loc-pun-rm', storeLocationName: 'Pune Raw Material Store', primaryQty: 600, primaryUom: 'kg', certStatus: 'verified' },
];

export const INVENTORY_DEMO: InventoryItem[] = [
  { id: 'inv-101', materialItemId: 'mat-42crmo4', materialCode: 'FRG-42CD4-RND', materialName: 'Steel Grade 42CrMo4 Forged Round Billet', categoryName: 'Alloy Steel Forgings', locationId: 'loc-rm', locationName: 'Raw Material Store', onHandQty: 320, availableQty: 0, reservedQty: 320, qcHoldQty: 0, inTransitQty: 200, primaryUom: 'kg', reorderPoint: 400, shortage: true, lotCount: 1 },
  { id: 'inv-102', materialItemId: 'mat-42crmo4', materialCode: 'FRG-42CD4-RND', materialName: 'Steel Grade 42CrMo4 Forged Round Billet', categoryName: 'Alloy Steel Forgings', locationId: 'loc-pun-rm', locationName: 'Pune Raw Material Store', onHandQty: 600, availableQty: 600, reservedQty: 0, qcHoldQty: 0, inTransitQty: 0, primaryUom: 'kg', reorderPoint: 400, shortage: false, lotCount: 1 },
];

// Incoming Supplier PO (confirmed, not yet received — "incoming" ≠ on-hand) + historical evidence for supplier recommendation
export const SUPPLIER_POS_DEMO: SupplierPO[] = [
  { id: 'spo-200', poNumber: 'SPO-2024-200', supplierId: 'supp-krn', supplierName: 'Krishna Forgings', raisedDate: '2024-10-25', committedDate: '2024-11-12', status: 'confirmed', totalValue: 176000, currency: 'INR', paymentTerms: 'Net 45', jobRef: 'J-200', lineCount: 1 },
  { id: 'spo-199', poNumber: 'SPO-2024-199', supplierId: 'supp-sfa', supplierName: 'SteelForge Alloys', raisedDate: '2024-08-01', committedDate: '2024-08-16', status: 'received', totalValue: 492000, currency: 'INR', paymentTerms: 'Net 30', lineCount: 1 },
  { id: 'spo-198', poNumber: 'SPO-2024-198', supplierId: 'supp-krn', supplierName: 'Krishna Forgings', raisedDate: '2024-06-01', committedDate: '2024-06-25', status: 'received', totalValue: 270000, currency: 'INR', paymentTerms: 'Net 45', lineCount: 1 },
];

export const SUPPLIER_PO_LINES_DEMO: SupplierPOLine[] = [
  { id: 'spl-200a', spoId: 'spo-200', materialItemId: 'mat-42crmo4', materialName: 'Steel Grade 42CrMo4 Forged Round Billet', orderedQty: 200, uom: 'kg', rate: 880, value: 176000, committedDate: '2024-11-12', receivedQty: 0, acceptedQty: 0, rejectedQty: 0, tolerancePct: 5, status: 'pending' },
  { id: 'spl-199a', spoId: 'spo-199', materialItemId: 'mat-42crmo4', materialName: 'Steel Grade 42CrMo4 Forged Round Billet', orderedQty: 600, uom: 'kg', rate: 820, value: 492000, committedDate: '2024-08-16', receivedQty: 600, acceptedQty: 595, rejectedQty: 5, tolerancePct: 5, status: 'received' },
  { id: 'spl-198a', spoId: 'spo-198', materialItemId: 'mat-42crmo4', materialName: 'Steel Grade 42CrMo4 Forged Round Billet', orderedQty: 300, uom: 'kg', rate: 900, value: 270000, committedDate: '2024-06-25', receivedQty: 300, acceptedQty: 300, rejectedQty: 0, tolerancePct: 5, status: 'received' },
];

export const JOB_MATERIAL_REQS_DEMO: JobMaterialReq[] = [
  { id: 'jmr-200', jobId: 'job-200', stageId: 'stg-200-3', stageName: 'CNC Finish Machining', materialItemId: 'mat-42crmo4', materialName: 'Steel Grade 42CrMo4 Forged Round Billet', requiredQty: 500, reservedQty: 320, issuedQty: 0, uom: 'kg', shortage: true, lotIds: ['lot-301'] },
];

export const JOB_BLOCKERS_DEMO: JobBlocker[] = [
  { id: 'blk-200', jobId: 'job-200', stageId: 'stg-200-3', type: 'Material', description: 'Forged billet 42CrMo4 shortage: 320kg reserved vs 500kg required for the second casing billet. SPO-2024-200 (Krishna Forgings) confirms 200kg by 12 Nov; 600kg additional stock is available at the Pune Plant pending transfer approval.', raisedBy: 'Suresh Kumar', raisedAt: '2024-11-04T09:00:00', status: 'open' },
];

// ── Asset: CNC Machine 04, calendar + running-hour maintenance schedule ──
export const ASSETS_DEMO: Asset[] = [
  { id: 'ast-cnc04', assetCode: 'CNC-04', name: 'CNC Vertical Machining Centre 04', category: 'Machining Equipment', siteId: 'site-hyd', workCentre: 'CNC Bay', criticality: 'Critical', status: 'operational', manufacturer: 'DMG MORI', model: 'DMU 50', serialNumber: 'DMG-50-88213', meterType: 'hours', currentReading: 2850, lastServiceReading: 2400, pmFrequencyHours: 600, pmFrequencyDays: 90, lastServiceDate: '2024-09-10', nextServiceDate: '2024-12-09', purchaseDate: '2021-05-15', installationDate: '2021-06-01', commissioningDate: '2021-06-10', responsiblePerson: 'Venkat Rao' },
];

export const METER_READINGS_DEMO: MeterReading[] = [
  { id: 'mr-001', assetId: 'ast-cnc04', assetCode: 'CNC-04', reading: 2400, readingDate: '2024-09-10', recordedBy: 'Venkat Rao', readingType: 'post-maintenance', notes: 'Reading at last 600-hour service.' },
  { id: 'mr-002', assetId: 'ast-cnc04', assetCode: 'CNC-04', reading: 2620, readingDate: '2024-10-05', recordedBy: 'Mohan Das', readingType: 'routine' },
  { id: 'mr-003', assetId: 'ast-cnc04', assetCode: 'CNC-04', reading: 2850, readingDate: '2024-11-04', recordedBy: 'Mohan Das', readingType: 'routine', notes: 'Shift-end reading.' },
];

export const MAINTENANCE_EVENTS_DEMO: MaintenanceEvent[] = [
  { id: 'me-020', eventNumber: 'ME-2024-020', type: 'Preventive', assetId: 'ast-cnc04', assetName: 'CNC Vertical Machining Centre 04', assetCode: 'CNC-04', symptom: 'Scheduled 600-hour preventive service', technicianId: 'u-maint', technicianName: 'Venkat Rao', downtimeStart: '2024-09-10T07:00:00', downtimeEnd: '2024-09-10T15:00:00', diagnosis: 'Spindle bearing inspected, coolant filter replaced, ways lubricated.', workDone: 'Full 600-hour preventive maintenance checklist completed per DMG MORI schedule.', status: 'closed', affectedJobs: [], sparesUsed: [{ materialName: 'Coolant Filter', qty: 1, uom: 'pcs' }, { materialName: 'Way Lube', qty: 2, uom: 'ltr' }] },
];

// ── Inspections: internal fail → rework → internal pass, plus external witness inspection ──
export const INSPECTIONS_DEMO: Inspection[] = [
  {
    id: 'ins-200', inspectionNumber: 'INS-2024-200', type: 'In-Process', origin: 'internal', jobId: 'job-200', jobNumber: 'J-200', stageId: 'stg-200-3', stageName: 'CNC Finish Machining',
    productDescription: 'Turbine Casing – Lower Half', quantityInspected: 1, uom: 'unit',
    inspectorId: 'u-qc', inspectorName: 'Priya Patel', date: '2024-11-01', templateId: 'tmpl-insp-casing', templateName: 'Turbine Casing – Final Dimensional & NDT Checklist', checklistVersion: 'v2',
    measurements: [
      { parameter: 'Bore Diameter', unit: 'mm', acceptanceCriteria: 'Ø420.00 +0.05/-0.00 mm', actual: '420.08 mm', passed: false },
      { parameter: 'Surface Hardness', unit: 'HB', acceptanceCriteria: '280–320 HB', actual: '302 HB', passed: true },
    ],
    sampleQty: 1, acceptedQty: 0, rejectedQty: 1, result: 'fail', ncrId: 'ncr-200', ncrNumber: 'NCR-2024-200',
  },
  {
    id: 'ins-201', inspectionNumber: 'INS-2024-201', type: 'Final', origin: 'internal', jobId: 'job-200', jobNumber: 'J-200', stageId: 'stg-200-5', stageName: 'Final Inspection',
    productDescription: 'Turbine Casing – Lower Half', quantityInspected: 1, uom: 'unit',
    inspectorId: 'u-qc', inspectorName: 'Priya Patel', date: '2024-11-03', templateId: 'tmpl-insp-casing', templateName: 'Turbine Casing – Final Dimensional & NDT Checklist', checklistVersion: 'v2',
    measurements: [
      { parameter: 'Bore Diameter', unit: 'mm', acceptanceCriteria: 'Ø420.00 +0.05/-0.00 mm', actual: '420.03 mm', passed: true },
      { parameter: 'Flatness – Mounting Face', unit: 'mm', acceptanceCriteria: '≤ 0.05mm over 600mm', actual: '0.02 mm', passed: true },
      { parameter: 'Surface Hardness', unit: 'HB', acceptanceCriteria: '280–320 HB', actual: '302 HB', passed: true },
      { parameter: 'Ultrasonic Flaw Detection', acceptanceCriteria: 'No indications > 3mm equivalent', actual: 'No indications detected', passed: true },
    ],
    sampleQty: 1, acceptedQty: 1, rejectedQty: 0, result: 'pass', reworkOfInspectionId: 'ins-200',
  },
  {
    id: 'ins-202', inspectionNumber: 'INS-2024-202', type: 'Final', origin: 'external', jobId: 'job-200', jobNumber: 'J-200',
    productDescription: 'Turbine Casing – Lower Half', quantityInspected: 1, uom: 'unit',
    inspectorId: 'ext-tuv', inspectorName: 'Markus Weber', externalOrgName: 'TÜV SÜD Industrie Service GmbH (witnessing on behalf of RheinWerk QA)', externalScope: 'Third-party witness inspection of turbine casing lower half per RheinWerk QAP-2024-07', reportRef: 'TUV-WPR-2024-1187',
    date: '2024-11-04', templateId: 'tmpl-insp-casing', templateName: 'Turbine Casing – Final Dimensional & NDT Checklist', checklistVersion: 'v2',
    sampleQty: 1, acceptedQty: 1, rejectedQty: 0, result: 'pass',
    remarks: 'Witnessed CMM dimensional check and UT scan. All results conform to RheinWerk QAP-2024-07. Release recommended.',
  },
];

export const NCRS_DEMO: NCR[] = [
  { id: 'ncr-200', ncrNumber: 'NCR-2024-200', inspectionId: 'ins-200', sourceType: 'In-Process', severity: 'Major', description: 'Bore diameter measured 420.08mm against drawing tolerance Ø420.00 +0.05/-0.00mm (0.03mm oversize). Root cause: CNC finishing pass undersized by one micro-pass.', affectedQty: 1, disposition: 'Rework', raisedBy: 'Priya Patel', raisedAt: '2024-11-01T15:00:00', status: 'closed', jobId: 'job-200' },
];

export const QUALITY_RELEASES_DEMO: QualityRelease[] = [
  { id: 'qr-200', jobId: 'job-200', jobNumber: 'J-200', inspectionId: 'ins-202', releasedBy: 'Priya Patel', releasedAt: '2024-11-04T16:00:00', certDossierComplete: true, notes: 'Rework re-inspection (INS-2024-201) and external witness inspection (INS-2024-202 / TUV-WPR-2024-1187) both passed. Cleared for partial dispatch.' },
];

// ── Dispatch: partial shipment with package-level and transport detail ──
export const DISPATCHES_DEMO: Dispatch[] = [
  {
    id: 'dsp-200', dispatchNumber: 'DSP-2024-200', customerId: 'cust-rw', customerName: 'RheinWerk Turbinenanlagen GmbH', customerPoId: 'cpo-200', customerPoNumber: 'CPO-2024-200',
    jobId: 'job-200', jobNumber: 'J-200', qualityReleaseId: 'qr-200', sourceSiteId: 'site-hyd', sourceStoreLocationName: 'Finished Goods Store',
    destination: 'RheinWerk Turbinenanlagen GmbH, Cologne, Germany (via Chennai Port)', dispatchDate: '2024-11-05',
    carrier: 'DHL Global Forwarding (Ocean Freight)', vehicleNumber: 'TS09EF7788', driverName: 'Md. Yusuf', lrNumber: 'DHL-OFR-88213',
    expectedDelivery: '2024-12-02', status: 'dispatched', lineCount: 1, totalQty: 1, dispatchedQty: 1, hasPoD: false, jobs: ['J-200'],
    packages: [
      { id: 'pkg-200a', dispatchId: 'dsp-200', packageCode: 'CR-2024-200-01', packageType: 'Crate', lengthMm: 1800, widthMm: 1200, heightMm: 1100, weightKg: 1850, productDescription: 'Turbine Casing – Lower Half (machined, 42CrMo4)', qty: 1, uom: 'unit', lotIds: ['lot-301'], packingDate: '2024-11-05', packingNotes: 'Export crate, desiccant + vapour barrier, CE-marked lifting points.' },
      { id: 'pkg-200b', dispatchId: 'dsp-200', packageCode: 'CR-2024-200-02', packageType: 'Box', weightKg: 45, productDescription: 'Mill certs, inspection reports & TÜV witness report dossier', qty: 1, uom: 'set', packingDate: '2024-11-05' },
    ],
  },
];

// ── Documents: external inspection report + an asset calibration certificate nearing expiry ──
export const VAULT_DOCUMENTS_DEMO: VaultDocument[] = [
  { id: 'doc-011', title: 'TÜV Witness Inspection Report – J-200', docType: 'Inspection Report', category: 'Quality Documents', uploadedBy: 'Priya Patel', uploadedAt: '2024-11-04', issueDate: '2024-11-04', version: 1, fileSize: '3.4 MB', linkedEntities: [{ type: 'Job', ref: 'J-200' }, { type: 'Inspection', ref: 'INS-2024-202' }], certStatus: 'verified', status: 'active' },
  { id: 'doc-012', title: 'CNC-04 Calibration Certificate', docType: 'Calibration Certificate', category: 'Asset Documents', uploadedBy: 'Venkat Rao', uploadedAt: '2024-09-10', issueDate: '2024-09-10', expiryDate: '2024-11-20', version: 1, fileSize: '0.5 MB', linkedEntities: [{ type: 'Asset', ref: 'CNC-04' }], obligation: { renewalDue: '2024-11-10', responsible: 'Venkat Rao' }, status: 'active' },
];

export const AUDIT_EVENTS_DEMO: AuditEvent[] = [
  { id: 'ae-101', actor: 'Anita Mehta', actorId: 'u-sales', scope: 'CustomerPO', action: 'create', entityId: 'cpo-200', entityRef: 'CPO-2024-200', timestamp: '2024-10-20T10:00:00', source: 'ui' },
  { id: 'ae-102', actor: 'Suresh Kumar', actorId: 'u-super', scope: 'Job', action: 'create', entityId: 'job-200', entityRef: 'J-200', timestamp: '2024-10-22T08:00:00', source: 'ui', after: { stageTemplateId: 'tmpl-heavy-fab' } },
  { id: 'ae-103', actor: 'Priya Patel', actorId: 'u-qc', scope: 'Inspection', action: 'fail', entityId: 'ins-200', entityRef: 'INS-2024-200', timestamp: '2024-11-01T15:00:00', source: 'ui', after: { result: 'fail' } },
  { id: 'ae-104', actor: 'Priya Patel', actorId: 'u-qc', scope: 'NCR', action: 'create', entityId: 'ncr-200', entityRef: 'NCR-2024-200', timestamp: '2024-11-01T15:05:00', source: 'ui', reason: 'Bore diameter oversize; disposition: rework.' },
  { id: 'ae-105', actor: 'Priya Patel', actorId: 'u-qc', scope: 'Inspection', action: 'pass', entityId: 'ins-201', entityRef: 'INS-2024-201', timestamp: '2024-11-03T12:00:00', source: 'ui', after: { result: 'pass' } },
  { id: 'ae-106', actor: 'Markus Weber', actorId: 'ext-tuv', scope: 'Inspection', action: 'pass', entityId: 'ins-202', entityRef: 'INS-2024-202', timestamp: '2024-11-04T14:00:00', source: 'ui', after: { result: 'pass' } },
  { id: 'ae-107', actor: 'Priya Patel', actorId: 'u-qc', scope: 'QualityRelease', action: 'create', entityId: 'qr-200', entityRef: 'J-200', timestamp: '2024-11-04T16:00:00', source: 'ui' },
  { id: 'ae-108', actor: 'Deepa Singh', actorId: 'u-dispatch', scope: 'Dispatch', action: 'create', entityId: 'dsp-200', entityRef: 'DSP-2024-200', timestamp: '2024-11-05T09:00:00', source: 'ui', reason: 'Partial dispatch — only J-200 released; J-201 still in final inspection.' },
];
