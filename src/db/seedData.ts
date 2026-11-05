/**
 * EOSS Demo Seed Data — Apex Precision Engineering Pvt Ltd
 * Manufacturer of precision-machined turbine-related industrial components
 * Primary customer: RheinWerk Turbinenanlagen GmbH
 * Reference date: 2024-11-04
 */
import type {
  SiteFull, StoreLocation, Party, MaterialItem, Employee,
  CustomerRFQFull, CustomerQuotation, CustomerPO, POLine,
  CustomerInvoice, CustomerPayment, CollectionActivity,
  Job, JobStage, GoodsReceipt, SupplierPO, SupplierPOLine,
  PurchaseRequisition, MaterialLot, StockMovement,
  Inspection, NCR, QualityRelease, Dispatch,
  AuditEvent, Asset, VaultDocument, SupplierQuotation,
} from '../types';

// ── Sites (5 independent sites) ──
export const SITES_FULL: SiteFull[] = [
  {
    id: 'site-001', code: 'HYD-P1', name: 'Hyderabad Plant 1', city: 'Hyderabad',
    type: 'Manufacturing', address: 'Plot 42, Phase II, IDA Jeedimetla', buildingPlot: 'Plot No. 42',
    industrialArea: 'IDA Jeedimetla', district: 'Medchal-Malkajgiri', state: 'Telangana',
    country: 'India', pincode: '500055', siteManager: 'Suresh Kumar',
    contactPhone: '040-23094567', contactEmail: 'plant1@apexprecision.in',
    operationalStatus: 'active', lat: 17.5169, lng: 78.4116,
  },
  {
    id: 'site-002', code: 'HYD-P2', name: 'Hyderabad Plant 2', city: 'Hyderabad',
    type: 'Manufacturing', address: 'Plot 88, Phase IV, IDA Balanagar', buildingPlot: 'Plot No. 88',
    industrialArea: 'IDA Balanagar', district: 'Medchal-Malkajgiri', state: 'Telangana',
    country: 'India', pincode: '500037', siteManager: 'Ravi Shankar',
    contactPhone: '040-23491234', contactEmail: 'plant2@apexprecision.in',
    operationalStatus: 'active', lat: 17.4762, lng: 78.4134,
  },
  {
    id: 'site-003', code: 'HYD-WH', name: 'Hyderabad Central Warehouse', city: 'Hyderabad',
    type: 'Warehouse', address: 'Survey No. 112, IDA Nacharam', buildingPlot: 'Survey No. 112',
    industrialArea: 'IDA Nacharam', district: 'Medchal-Malkajgiri', state: 'Telangana',
    country: 'India', pincode: '500076', siteManager: 'Asha Nair',
    contactPhone: '040-27172345', contactEmail: 'warehouse@apexprecision.in',
    operationalStatus: 'active', lat: 17.3976, lng: 78.5417,
  },
  {
    id: 'site-004', code: 'PUN-MFG', name: 'Pune Manufacturing Plant', city: 'Pune',
    type: 'Manufacturing', address: 'Gat No. 234, MIDC Bhosari', buildingPlot: 'Gat No. 234',
    industrialArea: 'MIDC Bhosari', district: 'Pune', state: 'Maharashtra',
    country: 'India', pincode: '411026', siteManager: 'Prakash N',
    contactPhone: '020-27113456', contactEmail: 'pune@apexprecision.in',
    operationalStatus: 'active', lat: 18.6373, lng: 73.8463,
  },
  {
    id: 'site-005', code: 'CHN-FAB', name: 'Chennai Fabrication Unit', city: 'Chennai',
    type: 'Fabrication', address: 'Plot 56, SIDCO Industrial Estate, Ambattur',
    buildingPlot: 'Plot No. 56', industrialArea: 'SIDCO Ambattur', district: 'Tiruvallur',
    state: 'Tamil Nadu', country: 'India', pincode: '600098', siteManager: 'Suresh CT',
    contactPhone: '044-26258765', contactEmail: 'chennai@apexprecision.in',
    operationalStatus: 'active', lat: 13.0989, lng: 80.1739,
  },
];

// ── Store Locations (expanded for 5 sites) ──
export const STORE_LOCATIONS: StoreLocation[] = [
  // Site 001
  { id: 'loc-001-rm', siteId: 'site-001', name: 'Raw Material Store', code: 'RM-P1', locationType: 'RM' },
  { id: 'loc-001-wip', siteId: 'site-001', name: 'WIP Store', code: 'WIP-P1', locationType: 'WIP' },
  { id: 'loc-001-fg', siteId: 'site-001', name: 'Finished Goods Store', code: 'FG-P1', locationType: 'FG' },
  { id: 'loc-001-qrn', siteId: 'site-001', name: 'Quarantine Store', code: 'QRN-P1', locationType: 'Quarantine' },
  { id: 'loc-001-spr', siteId: 'site-001', name: 'Spare Parts Store', code: 'SPR-P1', locationType: 'Spares' },
  { id: 'loc-001-dsp', siteId: 'site-001', name: 'Dispatch Bay', code: 'DSP-P1', locationType: 'Dispatch' },
  // Site 002
  { id: 'loc-002-rm', siteId: 'site-002', name: 'Raw Material Store', code: 'RM-P2', locationType: 'RM' },
  { id: 'loc-002-wip', siteId: 'site-002', name: 'WIP Store', code: 'WIP-P2', locationType: 'WIP' },
  { id: 'loc-002-fg', siteId: 'site-002', name: 'Finished Goods Store', code: 'FG-P2', locationType: 'FG' },
  { id: 'loc-002-qrn', siteId: 'site-002', name: 'Quarantine Store', code: 'QRN-P2', locationType: 'Quarantine' },
  // Site 003
  { id: 'loc-003-wa', siteId: 'site-003', name: 'Warehouse Bay A', code: 'WH-A', locationType: 'Warehouse' },
  { id: 'loc-003-wb', siteId: 'site-003', name: 'Warehouse Bay B', code: 'WH-B', locationType: 'Warehouse' },
  // Site 004
  { id: 'loc-004-rm', siteId: 'site-004', name: 'Raw Material Store', code: 'RM-PUN', locationType: 'RM' },
  { id: 'loc-004-fg', siteId: 'site-004', name: 'Finished Goods Store', code: 'FG-PUN', locationType: 'FG' },
  // Site 005
  { id: 'loc-005-rm', siteId: 'site-005', name: 'Raw Material Store', code: 'RM-CHN', locationType: 'RM' },
  { id: 'loc-005-fg', siteId: 'site-005', name: 'Finished Goods Store', code: 'FG-CHN', locationType: 'FG' },
];

// ── Parties (Customers + Suppliers) ──
export const CUSTOMERS: Party[] = [
  {
    id: 'cust-rw', partyType: 'Customer', legalName: 'RheinWerk Turbinenanlagen GmbH',
    tradingName: 'RheinWerk', panNumber: 'N/A', gstin: 'N/A (Germany)',
    state: 'Bavaria', paymentTerms: 'Net 60', creditLimit: 20000000, currency: 'INR',
    status: 'active', contactPerson: 'Klaus Weber', phone: '+49-89-55012345',
    email: 'purchase@rheinwerk-turbinen.de', city: 'Munich', since: '2022',
  },
  {
    id: 'cust-bpe', partyType: 'Customer', legalName: 'Bharat Power Equipment Ltd',
    tradingName: 'Bharat Power', panNumber: 'AABCB1234F', gstin: '36AABCB1234F1ZP',
    state: 'Telangana', paymentTerms: 'Net 45', creditLimit: 5000000, currency: 'INR',
    status: 'active', contactPerson: 'Ramesh Gupta', phone: '9100001234',
    email: 'purchase@bharatpower.in', city: 'Hyderabad', since: '2019',
  },
  {
    id: 'cust-ntpc', partyType: 'Customer', legalName: 'NTPC Vendor Division',
    tradingName: 'NTPC', panNumber: 'AAACN1234G', gstin: '07AAACN1234G1ZK',
    state: 'Delhi', paymentTerms: 'Net 60', creditLimit: 10000000, currency: 'INR',
    status: 'active', contactPerson: 'Sunil Kapoor', phone: '9811001234',
    email: 'vendor@ntpc.co.in', city: 'New Delhi', since: '2021',
  },
  {
    id: 'cust-mer', partyType: 'Customer', legalName: 'Meridian Engineering Pvt Ltd',
    tradingName: 'Meridian', panNumber: 'AABCM5678H', gstin: '29AABCM5678H1ZL',
    state: 'Karnataka', paymentTerms: 'Net 30', creditLimit: 2000000, currency: 'INR',
    status: 'active', contactPerson: 'Anil Nair', phone: '9845001234',
    email: 'purchase@meridian-eng.com', city: 'Bengaluru', since: '2020',
  },
  {
    id: 'cust-lt', partyType: 'Customer', legalName: 'L&T Hydrocarbon Engineering',
    tradingName: 'L&T HC', panNumber: 'AAACL9012I', gstin: '27AAACL9012I1ZM',
    state: 'Maharashtra', paymentTerms: 'Net 45', creditLimit: 8000000, currency: 'INR',
    status: 'active', contactPerson: 'Pradeep Shah', phone: '9820001234',
    email: 'subcontract@lthydrocarbon.com', city: 'Mumbai', since: '2022',
  },
  {
    id: 'cust-af', partyType: 'Customer', legalName: 'Anand Fabricators',
    tradingName: 'Anand Fab', panNumber: 'AABCA3456J', gstin: '36AABCA3456J1ZN',
    state: 'Telangana', paymentTerms: 'Net 15', creditLimit: 500000, currency: 'INR',
    status: 'active', contactPerson: 'Anand Reddy', phone: '9949001234',
    email: 'anand@anandfab.com', city: 'Hyderabad', since: '2018',
  },
];

export const SUPPLIERS: Party[] = [
  {
    id: 'supp-msk', partyType: 'Supplier', legalName: 'MSK Steel Pvt Ltd',
    tradingName: 'MSK Steel', panNumber: 'AABCM1111A', gstin: '36AABCM1111A1ZQ',
    state: 'Telangana', paymentTerms: 'Net 30', currency: 'INR', category: 'Raw Material',
    rating: 4, status: 'active', contactPerson: 'Mahesh Kumar', phone: '9100005678',
    email: 'sales@msksteel.com', city: 'Hyderabad', since: '2018',
  },
  {
    id: 'supp-ssi', partyType: 'Supplier', legalName: 'Stainless Source India Pvt Ltd',
    tradingName: 'Stainless Source', panNumber: 'AABCS2222B', gstin: '27AABCS2222B1ZR',
    state: 'Maharashtra', paymentTerms: 'Net 45', currency: 'INR', category: 'Raw Material',
    rating: 3, status: 'active', contactPerson: 'Ramesh Joshi', phone: '9820005678',
    email: 'sales@stainlesssource.com', city: 'Pune', since: '2020',
  },
  {
    id: 'supp-rkf', partyType: 'Supplier', legalName: 'RK Fasteners & Hardware',
    tradingName: 'RK Fasteners', panNumber: 'AABCR3333C', gstin: '36AABCR3333C1ZS',
    state: 'Telangana', paymentTerms: 'Net 15', currency: 'INR', category: 'Fasteners',
    rating: 5, status: 'active', contactPerson: 'Ravi Kumar', phone: '9100009012',
    email: 'rkfasteners@gmail.com', city: 'Hyderabad', since: '2017',
  },
  {
    id: 'supp-bgs', partyType: 'Supplier', legalName: 'Bharat Gas Supply Co',
    tradingName: 'Bharat Gas', panNumber: 'AABCB4444D', gstin: '36AABCB4444D1ZT',
    state: 'Telangana', paymentTerms: 'Net 15', currency: 'INR', category: 'Consumables',
    rating: 4, status: 'active', contactPerson: 'Bhanu Prakash', phone: '9100003456',
    email: 'orders@bharatgas.com', city: 'Hyderabad', since: '2019',
  },
  {
    id: 'supp-apex-c', partyType: 'Supplier', legalName: 'Apex Consumables Pvt Ltd',
    tradingName: 'Apex Consumables', panNumber: 'AABCA5555E', gstin: '36AABCA5555E1ZU',
    state: 'Telangana', paymentTerms: 'Net 30', currency: 'INR', category: 'Consumables',
    rating: 4, status: 'active', contactPerson: 'Apex Admin', phone: '9100007890',
    email: 'orders@apexconsumables.com', city: 'Hyderabad', since: '2020',
  },
  {
    id: 'supp-sct', partyType: 'Supplier', legalName: 'SteelCraft Tubes Pvt Ltd',
    tradingName: 'SteelCraft', panNumber: 'AABCS6666F', gstin: '29AABCS6666F1ZV',
    state: 'Karnataka', paymentTerms: 'Net 30', currency: 'INR', category: 'Raw Material',
    rating: 4, status: 'active', contactPerson: 'Suresh CT', phone: '9845007890',
    email: 'sales@steelcrafttubes.com', city: 'Bengaluru', since: '2021',
  },
  {
    id: 'supp-pcl', partyType: 'Supplier', legalName: 'Precision Components Ltd',
    tradingName: 'Precision Components', panNumber: 'AABCP7777G', gstin: '36AABCP7777G1ZW',
    state: 'Telangana', paymentTerms: 'Net 45', currency: 'INR', category: 'Subcontractor',
    rating: 4, status: 'active', contactPerson: 'Prakash N', phone: '9100002345',
    email: 'subcontract@precisioncomp.com', city: 'Hyderabad', since: '2020',
  },
];

// ── Material Items ──
export const MATERIAL_ITEMS: MaterialItem[] = [
  { id: 'mat-en8', itemCode: 'RM-EN8-01', name: 'EN8 Round Bar 60mm dia', categoryId: 'cat-rm', categoryName: 'Raw Material', primaryUom: 'kg', trackingMode: 'heat', reorderPoint: 500, standardGrade: 'EN8' },
  { id: 'mat-ss316', itemCode: 'RM-SS316-01', name: 'SS 316L Sheet 10mm', categoryId: 'cat-rm', categoryName: 'Raw Material', primaryUom: 'kg', trackingMode: 'heat', reorderPoint: 200, standardGrade: 'SS316L' },
  { id: 'mat-en24', itemCode: 'RM-EN24-01', name: 'EN24 Round Bar 80mm dia', categoryId: 'cat-rm', categoryName: 'Raw Material', primaryUom: 'kg', trackingMode: 'heat', reorderPoint: 300, standardGrade: 'EN24T' },
  { id: 'mat-ms-plt', itemCode: 'RM-MSP-01', name: 'MS Plate 25mm IS2062', categoryId: 'cat-rm', categoryName: 'Raw Material', primaryUom: 'kg', trackingMode: 'heat', reorderPoint: 1000, standardGrade: 'IS2062 E250' },
  { id: 'mat-wr', itemCode: 'CON-WR-01', name: 'Welding Rods E6013', categoryId: 'cat-con', categoryName: 'Consumables', primaryUom: 'pcs', trackingMode: 'none', reorderPoint: 500 },
  { id: 'mat-gd', itemCode: 'CON-GD-01', name: 'Grinding Disc 125mm', categoryId: 'cat-con', categoryName: 'Consumables', primaryUom: 'pcs', trackingMode: 'none', reorderPoint: 50 },
  { id: 'mat-bolt', itemCode: 'RM-BLT-01', name: 'M20 Hex Bolts Class 8.8', categoryId: 'cat-fas', categoryName: 'Fasteners', primaryUom: 'pcs', trackingMode: 'none', reorderPoint: 200 },
  { id: 'mat-en19', itemCode: 'RM-EN19-01', name: 'EN19 Round Bar 100mm dia', categoryId: 'cat-rm', categoryName: 'Raw Material', primaryUom: 'kg', trackingMode: 'heat', reorderPoint: 200, standardGrade: 'EN19' },
];

// ── Employees ──
export const EMPLOYEES: Employee[] = [
  { id: 'emp-001', userId: 'u-owner', employeeCode: 'APE-001', name: 'Ravi Shankar', role: 'owner', department: 'Management', designation: 'Managing Director', joiningDate: '2010-04-01', siteId: 'site-001' },
  { id: 'emp-002', userId: 'u-sales', employeeCode: 'APE-002', name: 'Anita Mehta', role: 'sales', department: 'Sales', designation: 'Sales Manager', joiningDate: '2016-07-01', siteId: 'site-001' },
  { id: 'emp-003', userId: 'u-buyer', employeeCode: 'APE-003', name: 'Karthik Raju', role: 'buyer', department: 'Purchase', designation: 'Purchase Manager', joiningDate: '2018-03-15', siteId: 'site-001' },
  { id: 'emp-004', userId: 'u-store', employeeCode: 'APE-004', name: 'Asha Nair', role: 'storekeeper', department: 'Store', designation: 'Storekeeper', joiningDate: '2019-06-01', siteId: 'site-001' },
  { id: 'emp-005', userId: 'u-super', employeeCode: 'APE-005', name: 'Suresh Kumar', role: 'supervisor', department: 'Production', designation: 'Production Supervisor', joiningDate: '2015-09-01', siteId: 'site-001' },
  { id: 'emp-006', userId: 'u-oper', employeeCode: 'APE-006', name: 'Mohan Das', role: 'operator', department: 'Production', designation: 'CNC Operator', joiningDate: '2017-02-01', siteId: 'site-001' },
  { id: 'emp-007', userId: 'u-qc', employeeCode: 'APE-007', name: 'Priya Patel', role: 'qc', department: 'Quality', designation: 'QC Inspector', joiningDate: '2020-01-15', siteId: 'site-001' },
  { id: 'emp-008', userId: 'u-maint', employeeCode: 'APE-008', name: 'Venkat Rao', role: 'maintenance', department: 'Maintenance', designation: 'Maintenance Technician', joiningDate: '2016-11-01', siteId: 'site-001' },
  { id: 'emp-009', userId: 'u-disp', employeeCode: 'APE-009', name: 'Deepa Singh', role: 'dispatch', department: 'Dispatch', designation: 'Dispatch Coordinator', joiningDate: '2021-04-01', siteId: 'site-001' },
  { id: 'emp-010', userId: 'u-audit', employeeCode: 'APE-010', name: 'External Auditor', role: 'auditor', department: 'External', designation: 'Quality Auditor', joiningDate: '2024-01-01', siteId: 'site-001' },
];

// ── RheinWerk RFQ ──
export const RFQS_FULL: CustomerRFQFull[] = [
  {
    id: 'rfq-rw-001',
    rfqNumber: 'RFQ-2024-0101',
    title: 'Precision Machined Components – Turbine Auxiliary System',
    customerId: 'cust-rw',
    customerName: 'RheinWerk Turbinenanlagen GmbH',
    customerContactPerson: 'Klaus Weber',
    customerEmail: 'purchase@rheinwerk-turbinen.de',
    customerPhone: '+49-89-55012345',
    customerEnquiryRef: 'RW-ENQ-2024-0892',
    customerProjectRef: 'RW-PROJ-TAS-2024',
    receivedDate: '2024-10-01',
    quotationDueDate: '2024-10-15',
    requiredBy: '2024-12-15',
    channel: 'Email',
    priority: 'High',
    owner: 'Anita Mehta',
    currency: 'INR',
    deliveryLocation: 'RheinWerk GmbH, Munich, Germany (Ex-Works Hyderabad)',
    status: 'converted',
    requirementsSummary: 'RheinWerk requires a batch of precision-machined components for their turbine auxiliary systems. The order covers five product lines: bearing housing assemblies, shaft sleeves, coupling hubs, mounting flange assemblies, and seal plate sets. All components are to be machined from customer-approved grades. Material Test Certificates (MTC) are mandatory for all items. Dimensional inspection reports are required for each piece. Customer witness inspection is not required for this order. Delivery in two batches: first batch (Lines 1–3) by 30 Nov 2024, second batch (Lines 4–5) by 15 Dec 2024.',
    customerInstructions: 'All components to be supplied with material test certificates. Dimensional reports required for each piece. Pack individually in VCI bags. Mark with drawing number, revision, heat number and quantity.',
    internalNotes: 'High-value export customer. Confirm MTC availability from supplier before quoting. Refer approved drawing set RW-DWG-2024-TAS.',
    mtcRequired: true,
    dimensionalInspection: true,
    ndtRequired: false,
    heatTreatment: false,
    traceabilityRequired: true,
    customerWitnessRequired: false,
    requiredQualityDocs: 'Dimensional Inspection Report, Material Test Certificate, Packing List',
    packagingPreservation: 'Individual VCI bags. Wooden crate export packing.',
    applicableStandards: 'DIN 5401, ISO 1101',
    deliveryTerms: 'Ex-Works Hyderabad',
    paymentExpectation: 'As per agreed commercial terms',
    quoteValidityExpected: '30 days',
    revisionNumber: 0,
    quotationIds: ['qt-rw-001'],
    convertedPoId: 'cpo-rw-001',
    createdAt: '2024-10-01T09:00:00',
    updatedAt: '2024-10-18T11:00:00',
    createdBy: 'Anita Mehta',
    lines: [
      {
        id: 'rfql-rw-001-1', rfqId: 'rfq-rw-001', lineNumber: 1,
        customerItemRef: 'RW-BH-001', productName: 'Bearing Housing Assembly',
        description: 'Precision-machined bearing housing, EN19 grade, complete with bore and face machining',
        drawingNumber: 'RW-DWG-BH-001', drawingRevision: 'Rev B',
        material: 'EN19', grade: 'EN19 (BS970)', dimensions: 'OD 180mm × L 120mm',
        tolerances: 'Bore: H7, Face runout < 0.02mm', qty: 10, uom: 'Nos',
        requiredDate: '2024-11-30', targetPrice: 120000,
        inspectionReqs: '100% dimensional inspection',
        certificationReqs: 'MTC mandatory',
        packagingReqs: 'VCI bag + individual wooden crate',
      },
      {
        id: 'rfql-rw-001-2', rfqId: 'rfq-rw-001', lineNumber: 2,
        customerItemRef: 'RW-SS-002', productName: 'Shaft Sleeve',
        description: 'Precision-turned shaft sleeve, SS316L, ground finish',
        drawingNumber: 'RW-DWG-SS-002', drawingRevision: 'Rev A',
        material: 'SS316L', grade: 'SS316L (ASTM A276)', dimensions: 'OD 85mm × ID 65mm × L 200mm',
        tolerances: 'OD: h6, ID: H7', qty: 20, uom: 'Nos',
        requiredDate: '2024-11-30', targetPrice: 90000,
        inspectionReqs: 'Dimensional inspection + surface roughness',
        certificationReqs: 'MTC + material analysis report',
      },
      {
        id: 'rfql-rw-001-3', rfqId: 'rfq-rw-001', lineNumber: 3,
        customerItemRef: 'RW-CH-003', productName: 'Coupling Hub',
        description: 'Coupling hub machined from EN8, keyway as per drawing',
        drawingNumber: 'RW-DWG-CH-003', drawingRevision: 'Rev A',
        material: 'EN8', grade: 'EN8 (BS970)', dimensions: 'OD 160mm × L 90mm',
        tolerances: 'Bore: H7, keyway: JS9', qty: 8, uom: 'Nos',
        requiredDate: '2024-11-30', targetPrice: 60000,
        inspectionReqs: 'Dimensional inspection',
        certificationReqs: 'MTC required',
      },
      {
        id: 'rfql-rw-001-4', rfqId: 'rfq-rw-001', lineNumber: 4,
        customerItemRef: 'RW-MF-004', productName: 'Mounting Flange Assembly',
        description: 'Mounting flange assembly, MS IS2062, 8-bolt PCD as per drawing',
        drawingNumber: 'RW-DWG-MF-004', drawingRevision: 'Rev C',
        material: 'MS IS2062', grade: 'IS2062 E250', dimensions: 'OD 300mm × Bore 180mm × T 30mm',
        tolerances: 'PCD ±0.05mm, flatness < 0.03mm', qty: 12, uom: 'Nos',
        requiredDate: '2024-12-15', targetPrice: 108000,
        inspectionReqs: 'Dimensional inspection + flatness check',
        certificationReqs: 'MTC required',
      },
      {
        id: 'rfql-rw-001-5', rfqId: 'rfq-rw-001', lineNumber: 5,
        customerItemRef: 'RW-SP-005', productName: 'Seal Plate Set',
        description: 'Seal plate set (2 plates per set), SS316L, lapped finish',
        drawingNumber: 'RW-DWG-SP-005', drawingRevision: 'Rev A',
        material: 'SS316L', grade: 'SS316L (ASTM A240)', dimensions: 'OD 220mm × T 15mm per plate',
        tolerances: 'Flatness < 0.01mm, parallelism < 0.015mm', qty: 10, uom: 'Sets',
        requiredDate: '2024-12-15', targetPrice: 80000,
        inspectionReqs: 'Flatness measurement, surface roughness Ra ≤ 0.8',
        certificationReqs: 'MTC + dimensional report per piece',
      },
    ],
    documents: [
      {
        id: 'rfqdoc-001', rfqId: 'rfq-rw-001', filename: 'RW-ENQ-2024-0892.pdf',
        docType: 'RFQ Document', uploadedBy: 'Anita Mehta', uploadedAt: '2024-10-01T09:15:00', fileSize: '2.4 MB',
      },
      {
        id: 'rfqdoc-002', rfqId: 'rfq-rw-001', rfqLineId: 'rfql-rw-001-1',
        filename: 'RW-DWG-BH-001-RevB.pdf', docType: 'Drawing', version: 'Rev B',
        uploadedBy: 'Anita Mehta', uploadedAt: '2024-10-01T09:20:00', fileSize: '1.8 MB',
      },
      {
        id: 'rfqdoc-003', rfqId: 'rfq-rw-001', rfqLineId: 'rfql-rw-001-2',
        filename: 'RW-DWG-SS-002-RevA.pdf', docType: 'Drawing', version: 'Rev A',
        uploadedBy: 'Anita Mehta', uploadedAt: '2024-10-01T09:22:00', fileSize: '1.2 MB',
      },
      {
        id: 'rfqdoc-004', rfqId: 'rfq-rw-001',
        filename: 'RW-Quality-Spec-2024.pdf', docType: 'Quality Spec',
        uploadedBy: 'Anita Mehta', uploadedAt: '2024-10-01T09:25:00', fileSize: '0.8 MB',
      },
    ],
    clarifications: [
      {
        id: 'rfqcl-001', rfqId: 'rfq-rw-001', rfqLineId: 'rfql-rw-001-1',
        reference: 'CL-001', date: '2024-10-03',
        question: 'Drawing RW-DWG-BH-001 Rev B specifies surface treatment as "as machined". Please confirm if any coating or surface protection is required for corrosion protection during transit to Germany.',
        raisedBy: 'Anita Mehta', customerResponse: 'No coating required. VCI bag packing is sufficient for corrosion protection.',
        responseDate: '2024-10-04', status: 'answered',
      },
    ],
  },
];

// ── Customer Quotation ──
export const CUSTOMER_QUOTATIONS: CustomerQuotation[] = [
  {
    id: 'qt-rw-001',
    quotationNumber: 'QT-2024-0101',
    rfqId: 'rfq-rw-001',
    rfqNumber: 'RFQ-2024-0101',
    customerId: 'cust-rw',
    customerName: 'RheinWerk Turbinenanlagen GmbH',
    quotationDate: '2024-10-14',
    validUntil: '2024-11-13',
    status: 'accepted',
    currency: 'INR',
    deliveryTerms: 'Ex-Works Hyderabad',
    paymentTerms: 'Net 60',
    subtotal: 5084746,
    taxAmount: 915254,
    totalAmount: 6000000,
    totalValue: 6000000,
    revision: 1,
    owner: 'Anita Mehta',
    version: 1,
    acceptedDate: '2024-10-18',
    acceptedBy: 'Klaus Weber',
    createdAt: '2024-10-14T10:00:00',
    updatedAt: '2024-10-18T11:00:00',
    lines: [
      { id: 'qtl-rw-001-1', quotationId: 'qt-rw-001', rfqLineId: 'rfql-rw-001-1', lineNumber: 1, productName: 'Bearing Housing Assembly', description: 'EN19, machined as per RW-DWG-BH-001 Rev B', drawingNumber: 'RW-DWG-BH-001', drawingRevision: 'Rev B', qty: 10, uom: 'Nos', unitPrice: 110000, taxPct: 18, lineTotal: 1298000, requiredDate: '2024-11-30' },
      { id: 'qtl-rw-001-2', quotationId: 'qt-rw-001', rfqLineId: 'rfql-rw-001-2', lineNumber: 2, productName: 'Shaft Sleeve', description: 'SS316L, ground finish, as per RW-DWG-SS-002 Rev A', drawingNumber: 'RW-DWG-SS-002', drawingRevision: 'Rev A', qty: 20, uom: 'Nos', unitPrice: 42000, taxPct: 18, lineTotal: 991200, requiredDate: '2024-11-30' },
      { id: 'qtl-rw-001-3', quotationId: 'qt-rw-001', rfqLineId: 'rfql-rw-001-3', lineNumber: 3, productName: 'Coupling Hub', description: 'EN8, keyway as per RW-DWG-CH-003 Rev A', drawingNumber: 'RW-DWG-CH-003', drawingRevision: 'Rev A', qty: 8, uom: 'Nos', unitPrice: 68750, taxPct: 18, lineTotal: 649700, requiredDate: '2024-11-30' },
      { id: 'qtl-rw-001-4', quotationId: 'qt-rw-001', rfqLineId: 'rfql-rw-001-4', lineNumber: 4, productName: 'Mounting Flange Assembly', description: 'MS IS2062, 8-bolt PCD as per RW-DWG-MF-004 Rev C', drawingNumber: 'RW-DWG-MF-004', drawingRevision: 'Rev C', qty: 12, uom: 'Nos', unitPrice: 85000, taxPct: 18, lineTotal: 1204800, requiredDate: '2024-12-15' },
      { id: 'qtl-rw-001-5', quotationId: 'qt-rw-001', rfqLineId: 'rfql-rw-001-5', lineNumber: 5, productName: 'Seal Plate Set', description: 'SS316L, lapped finish, 2 plates per set, as per RW-DWG-SP-005 Rev A', drawingNumber: 'RW-DWG-SP-005', drawingRevision: 'Rev A', qty: 10, uom: 'Sets', unitPrice: 68000, taxPct: 18, lineTotal: 802400, requiredDate: '2024-12-15' },
    ],
  },
];

// ── Customer PO (RheinWerk) ──
// Total value: ₹60,00,000 as per financial scenario
export const CUSTOMER_POS: CustomerPO[] = [
  {
    id: 'cpo-rw-001', poNumber: 'CPO-2024-RW-001',
    customerId: 'cust-rw', customerName: 'RheinWerk Turbinenanlagen GmbH',
    acceptedDate: '2024-10-18', paymentTerms: 'Net 60',
    status: 'complete', totalValue: 6000000, currency: 'INR', lineCount: 5,
    quotationRef: 'QT-2024-0101', deliveryTerms: 'Ex-Works Hyderabad',
  },
  {
    id: 'cpo-101', poNumber: 'CPO-2024-101', customerId: 'cust-mer',
    customerName: 'Meridian Engineering', acceptedDate: '2024-11-01',
    paymentTerms: 'Net 30', status: 'active', totalValue: 485000, currency: 'INR',
    lineCount: 3, quotationRef: 'QT-2024-089-R2', deliveryTerms: 'Ex-Works Hyderabad',
  },
  {
    id: 'cpo-102', poNumber: 'CPO-2024-102', customerId: 'cust-bpe',
    customerName: 'Bharat Power Equipment', acceptedDate: '2024-11-02',
    paymentTerms: 'Net 45', status: 'active', totalValue: 320000, currency: 'INR',
    lineCount: 2, deliveryTerms: 'FOR Hyderabad', hasAmendment: true,
  },
];

// ── PO Lines (RheinWerk) ──
export const PO_LINES: POLine[] = [
  { id: 'pol-rw-001-1', poId: 'cpo-rw-001', drawingNumber: 'RW-DWG-BH-001', revision: 'Rev B', description: 'Bearing Housing Assembly – EN19', orderedQty: 10, uom: 'Nos', requiredDate: '2024-11-30', rate: 110000, value: 1100000, jobId: 'job-rw-001', jobNumber: 'JOB-2024-0201', status: 'complete' },
  { id: 'pol-rw-001-2', poId: 'cpo-rw-001', drawingNumber: 'RW-DWG-SS-002', revision: 'Rev A', description: 'Shaft Sleeve – SS316L', orderedQty: 20, uom: 'Nos', requiredDate: '2024-11-30', rate: 42000, value: 840000, jobId: 'job-rw-002', jobNumber: 'JOB-2024-0202', status: 'complete' },
  { id: 'pol-rw-001-3', poId: 'cpo-rw-001', drawingNumber: 'RW-DWG-CH-003', revision: 'Rev A', description: 'Coupling Hub – EN8', orderedQty: 8, uom: 'Nos', requiredDate: '2024-11-30', rate: 68750, value: 550000, jobId: 'job-rw-003', jobNumber: 'JOB-2024-0203', status: 'complete' },
  { id: 'pol-rw-001-4', poId: 'cpo-rw-001', drawingNumber: 'RW-DWG-MF-004', revision: 'Rev C', description: 'Mounting Flange Assembly – MS IS2062', orderedQty: 12, uom: 'Nos', requiredDate: '2024-12-15', rate: 85000, value: 1020000, jobId: 'job-rw-004', jobNumber: 'JOB-2024-0204', status: 'complete' },
  { id: 'pol-rw-001-5', poId: 'cpo-rw-001', drawingNumber: 'RW-DWG-SP-005', revision: 'Rev A', description: 'Seal Plate Set – SS316L (2 plates per set)', orderedQty: 10, uom: 'Sets', requiredDate: '2024-12-15', rate: 68000, value: 680000, jobId: 'job-rw-005', jobNumber: 'JOB-2024-0205', status: 'complete' },
];

// ── Jobs (RheinWerk production jobs) ──
const makeStages = (jobId: string, route: { name: string }[]): JobStage[] =>
  route.map((s, i) => ({
    id: `${jobId}-s${i + 1}`,
    jobId,
    sequence: i + 1,
    name: s.name,
    status: 'complete' as const,
    plannedStart: '2024-10-28',
    plannedEnd: '2024-11-25',
    actualStart: '2024-10-29',
    actualEnd: '2024-11-25',
    inputQty: 0, completedGoodQty: 0, rejectedQty: 0, reworkQty: 0, scrapQty: 0, uom: 'Nos',
  }));

export const JOBS: Job[] = [
  {
    id: 'job-rw-001', jobNumber: 'JOB-2024-0201', customerId: 'cust-rw',
    customerName: 'RheinWerk Turbinenanlagen GmbH', customerPoId: 'cpo-rw-001',
    customerPoNumber: 'CPO-2024-RW-001', drawingRef: 'RW-DWG-BH-001 Rev B',
    description: 'Bearing Housing Assembly – 10 Nos', siteId: 'site-001', siteName: 'Hyderabad Plant 1 (SITE-001)',
    status: 'complete', priority: 'high', plannedStart: '2024-10-28', plannedEnd: '2024-11-25',
    actualStart: '2024-10-29', actualEnd: '2024-11-24', owner: 'Suresh Kumar',
    currentStage: 'Complete', materialReadiness: 'ready', hasBlocker: false, value: 1100000,
    stages: makeStages('job-rw-001', [{ name: 'Turning' }, { name: 'Milling' }, { name: 'Boring' }, { name: 'Final Inspection' }]),
  },
  {
    id: 'job-rw-002', jobNumber: 'JOB-2024-0202', customerId: 'cust-rw',
    customerName: 'RheinWerk Turbinenanlagen GmbH', customerPoId: 'cpo-rw-001',
    customerPoNumber: 'CPO-2024-RW-001', drawingRef: 'RW-DWG-SS-002 Rev A',
    description: 'Shaft Sleeve – 20 Nos', siteId: 'site-002', siteName: 'Hyderabad Plant 2 (SITE-002)',
    status: 'complete', priority: 'high', plannedStart: '2024-10-28', plannedEnd: '2024-11-25',
    actualStart: '2024-10-29', actualEnd: '2024-11-25', owner: 'Suresh Kumar',
    currentStage: 'Complete', materialReadiness: 'ready', hasBlocker: false, value: 840000,
    stages: makeStages('job-rw-002', [{ name: 'Turning' }, { name: 'Grinding' }, { name: 'Final Inspection' }]),
  },
  {
    id: 'job-rw-003', jobNumber: 'JOB-2024-0203', customerId: 'cust-rw',
    customerName: 'RheinWerk Turbinenanlagen GmbH', customerPoId: 'cpo-rw-001',
    customerPoNumber: 'CPO-2024-RW-001', drawingRef: 'RW-DWG-CH-003 Rev A',
    description: 'Coupling Hub – 8 Nos', siteId: 'site-001', siteName: 'Hyderabad Plant 1 (SITE-001)',
    status: 'complete', priority: 'normal', plannedStart: '2024-10-28', plannedEnd: '2024-11-20',
    actualStart: '2024-10-29', actualEnd: '2024-11-19', owner: 'Suresh Kumar',
    currentStage: 'Complete', materialReadiness: 'ready', hasBlocker: false, value: 550000,
    stages: makeStages('job-rw-003', [{ name: 'Turning' }, { name: 'Milling (keyway)' }, { name: 'Final Inspection' }]),
  },
  {
    id: 'job-rw-004', jobNumber: 'JOB-2024-0204', customerId: 'cust-rw',
    customerName: 'RheinWerk Turbinenanlagen GmbH', customerPoId: 'cpo-rw-001',
    customerPoNumber: 'CPO-2024-RW-001', drawingRef: 'RW-DWG-MF-004 Rev C',
    description: 'Mounting Flange Assembly – 12 Nos', siteId: 'site-001', siteName: 'Hyderabad Plant 1 (SITE-001)',
    status: 'complete', priority: 'normal', plannedStart: '2024-11-01', plannedEnd: '2024-12-05',
    actualStart: '2024-11-02', actualEnd: '2024-12-04', owner: 'Suresh Kumar',
    currentStage: 'Complete', materialReadiness: 'ready', hasBlocker: false, value: 1020000,
    stages: makeStages('job-rw-004', [{ name: 'Cutting' }, { name: 'Turning' }, { name: 'Drilling' }, { name: 'Final Inspection' }]),
  },
  {
    id: 'job-rw-005', jobNumber: 'JOB-2024-0205', customerId: 'cust-rw',
    customerName: 'RheinWerk Turbinenanlagen GmbH', customerPoId: 'cpo-rw-001',
    customerPoNumber: 'CPO-2024-RW-001', drawingRef: 'RW-DWG-SP-005 Rev A',
    description: 'Seal Plate Set – 10 Sets', siteId: 'site-002', siteName: 'Hyderabad Plant 2 (SITE-002)',
    status: 'complete', priority: 'normal', plannedStart: '2024-11-05', plannedEnd: '2024-12-10',
    actualStart: '2024-11-06', actualEnd: '2024-12-09', owner: 'Suresh Kumar',
    currentStage: 'Complete', materialReadiness: 'ready', hasBlocker: false, value: 680000,
    stages: makeStages('job-rw-005', [{ name: 'Turning' }, { name: 'Lapping' }, { name: 'Final Inspection' }]),
  },
  // Other existing jobs
  {
    id: 'job-101', jobNumber: 'J-101', customerId: 'cust-mer', customerName: 'Meridian Engineering',
    customerPoId: 'cpo-101', customerPoNumber: 'CPO-2024-101', drawingRef: 'MER-DWG-2024-RC-V3',
    description: 'Pressure vessel assembly – reactor chamber', siteId: 'site-001', siteName: 'Hyderabad Plant 1 (SITE-001)',
    status: 'active', priority: 'high', plannedStart: '2024-10-28', plannedEnd: '2024-11-18',
    actualStart: '2024-10-29', owner: 'Suresh Kumar', currentStage: 'Fit-up',
    materialReadiness: 'ready', hasBlocker: false, value: 185000,
    stages: makeStages('job-101', [{ name: 'Cutting' }, { name: 'Fit-up' }, { name: 'Welding' }, { name: 'NDT' }, { name: 'Final Inspection' }]),
  },
  {
    id: 'job-102', jobNumber: 'J-102', customerId: 'cust-bpe', customerName: 'Bharat Power Equipment',
    customerPoId: 'cpo-102', customerPoNumber: 'CPO-2024-102', drawingRef: 'BPE-DWG-2024-HX-B',
    description: 'Heat exchanger shell fabrication – SS', siteId: 'site-001', siteName: 'Hyderabad Plant 1 (SITE-001)',
    status: 'hold', priority: 'urgent', plannedStart: '2024-11-04', plannedEnd: '2024-11-22',
    owner: 'Suresh Kumar', currentStage: 'Material Pending',
    materialReadiness: 'shortage', hasBlocker: true, value: 320000,
    stages: makeStages('job-102', [{ name: 'Cutting' }, { name: 'Rolling' }, { name: 'Welding' }, { name: 'Final Inspection' }]),
  },
];

// ── Supplier POs (with correct references for GRNs) ──
export const SUPPLIER_POS: SupplierPO[] = [
  { id: 'spo-rw-001', poNumber: 'SPO-2024-RW-001', spoNumber: 'SPO-2024-RW-001', orderDate: '2024-10-20', supplierId: 'supp-msk', supplierName: 'MSK Steel Pvt Ltd', raisedDate: '2024-10-20', committedDate: '2024-10-30', status: 'received', totalValue: 220000, currency: 'INR', paymentTerms: 'Net 30', jobRef: 'JOB-2024-0201,JOB-2024-0203', lineCount: 2 },
  { id: 'spo-rw-002', poNumber: 'SPO-2024-RW-002', spoNumber: 'SPO-2024-RW-002', orderDate: '2024-10-20', supplierId: 'supp-ssi', supplierName: 'Stainless Source India', raisedDate: '2024-10-20', committedDate: '2024-10-30', status: 'received', totalValue: 185000, currency: 'INR', paymentTerms: 'Net 45', jobRef: 'JOB-2024-0202,JOB-2024-0205', lineCount: 2 },
  { id: 'spo-001', poNumber: 'SPO-2024-001', supplierId: 'supp-msk', supplierName: 'MSK Steel Pvt Ltd', raisedDate: '2024-10-28', committedDate: '2024-11-08', status: 'confirmed', totalValue: 95000, currency: 'INR', paymentTerms: 'Net 30', jobRef: 'J-101', lineCount: 2 },
  { id: 'spo-002', poNumber: 'SPO-2024-002', supplierId: 'supp-ssi', supplierName: 'Stainless Source India', raisedDate: '2024-10-25', committedDate: '2024-11-02', status: 'overdue', totalValue: 54000, currency: 'INR', paymentTerms: 'Net 45', jobRef: 'J-102', lineCount: 1, hasAmendment: true },
  { id: 'spo-003', poNumber: 'SPO-2024-003', supplierId: 'supp-apex-c', supplierName: 'Apex Consumables', raisedDate: '2024-10-10', committedDate: '2024-10-18', status: 'received', totalValue: 18500, currency: 'INR', paymentTerms: 'Net 30', lineCount: 2 },
];

export const SUPPLIER_PO_LINES: SupplierPOLine[] = [
  { id: 'spol-rw-001-1', spoId: 'spo-rw-001', materialItemId: 'mat-en19', materialName: 'EN19 Round Bar 100mm dia', orderedQty: 320, uom: 'kg', rate: 450, value: 144000, committedDate: '2024-10-30', receivedQty: 320, acceptedQty: 315, rejectedQty: 5, tolerancePct: 2, status: 'received' },
  { id: 'spol-rw-001-2', spoId: 'spo-rw-001', materialItemId: 'mat-en8', materialName: 'EN8 Round Bar 60mm dia', orderedQty: 180, uom: 'kg', rate: 422, value: 76000, committedDate: '2024-10-30', receivedQty: 180, acceptedQty: 180, rejectedQty: 0, tolerancePct: 2, status: 'received' },
  { id: 'spol-rw-002-1', spoId: 'spo-rw-002', materialItemId: 'mat-ss316', materialName: 'SS 316L Sheet 10mm', orderedQty: 250, uom: 'kg', rate: 460, value: 115000, committedDate: '2024-10-30', receivedQty: 250, acceptedQty: 248, rejectedQty: 2, tolerancePct: 2, status: 'received' },
  { id: 'spol-rw-002-2', spoId: 'spo-rw-002', materialItemId: 'mat-ss316', materialName: 'SS 316L Sheet 10mm (additional)', orderedQty: 150, uom: 'kg', rate: 467, value: 70000, committedDate: '2024-10-30', receivedQty: 150, acceptedQty: 150, rejectedQty: 0, tolerancePct: 2, status: 'received' },
  { id: 'spol-001-1', spoId: 'spo-001', materialItemId: 'mat-ms-plt', materialName: 'MS Plate 25mm IS2062', orderedQty: 500, uom: 'kg', rate: 95, value: 47500, committedDate: '2024-11-08', receivedQty: 0, acceptedQty: 0, rejectedQty: 0, tolerancePct: 2, status: 'pending' },
  { id: 'spol-001-2', spoId: 'spo-001', materialItemId: 'mat-en8', materialName: 'EN8 Round Bar 60mm dia', orderedQty: 110, uom: 'kg', rate: 430, value: 47300, committedDate: '2024-11-08', receivedQty: 0, acceptedQty: 0, rejectedQty: 0, tolerancePct: 2, status: 'pending' },
];

// ── GRNs (referencing valid SPOs) ──
export const GRNS: GoodsReceipt[] = [
  { id: 'grn-rw-001', grnNumber: 'GRN-2024-RW-001', supplierId: 'supp-msk', supplierName: 'MSK Steel Pvt Ltd', spoId: 'spo-rw-001', spoNumber: 'SPO-2024-RW-001', receivedDate: '2024-10-30', receivedBy: 'Asha Nair', deliveryChallan: 'DC-MSK-7892', vehicleNumber: 'TS09BA5678', status: 'accepted', lineCount: 2 },
  { id: 'grn-rw-002', grnNumber: 'GRN-2024-RW-002', supplierId: 'supp-ssi', supplierName: 'Stainless Source India', spoId: 'spo-rw-002', spoNumber: 'SPO-2024-RW-002', receivedDate: '2024-10-30', receivedBy: 'Asha Nair', deliveryChallan: 'DC-SSI-3421', vehicleNumber: 'MH12BC3456', status: 'accepted', lineCount: 2 },
  { id: 'grn-001', grnNumber: 'GRN-2024-001', supplierId: 'supp-apex-c', supplierName: 'Apex Consumables', spoId: 'spo-003', spoNumber: 'SPO-2024-003', receivedDate: '2024-10-18', receivedBy: 'Asha Nair', deliveryChallan: 'DC-APEX-4521', vehicleNumber: 'TS09BA1234', status: 'accepted', lineCount: 2 },
];

export const PURCHASE_REQS: PurchaseRequisition[] = [
  { id: 'pr-001', prNumber: 'PR-2024-001', raisedBy: 'Suresh Kumar', raisedDate: '2024-10-19', requiredBy: '2024-10-28', jobId: 'job-rw-001', jobNumber: 'JOB-2024-0201', status: 'converted', lineCount: 2, totalQty: 500, priority: 'high' },
  { id: 'pr-002', prNumber: 'PR-2024-002', raisedBy: 'Suresh Kumar', raisedDate: '2024-10-19', requiredBy: '2024-10-28', jobId: 'job-rw-002', jobNumber: 'JOB-2024-0202', status: 'converted', lineCount: 1, totalQty: 400, priority: 'high' },
];

export const MATERIAL_LOTS: MaterialLot[] = [
  { id: 'lot-en19-01', lotNumber: 'LOT-2024-EN19-01', heatNumber: 'HT-MSK-7892-A', materialItemId: 'mat-en19', materialName: 'EN19 Round Bar 100mm dia', supplierId: 'supp-msk', supplierName: 'MSK Steel Pvt Ltd', grnId: 'grn-rw-001', receivedDate: '2024-10-30', grade: 'EN19', status: 'issued', storeLocationId: 'loc-001-rm', storeLocationName: 'Raw Material Store (SITE-001)', primaryQty: 315, primaryUom: 'kg', certStatus: 'verified' },
  { id: 'lot-en8-01', lotNumber: 'LOT-2024-EN8-01', heatNumber: 'HT-MSK-7892-B', materialItemId: 'mat-en8', materialName: 'EN8 Round Bar 60mm dia', supplierId: 'supp-msk', supplierName: 'MSK Steel Pvt Ltd', grnId: 'grn-rw-001', receivedDate: '2024-10-30', grade: 'EN8', status: 'issued', storeLocationId: 'loc-001-rm', storeLocationName: 'Raw Material Store (SITE-001)', primaryQty: 180, primaryUom: 'kg', certStatus: 'verified' },
  { id: 'lot-ss316-01', lotNumber: 'LOT-2024-SS316-01', heatNumber: 'HT-SSI-3421-A', materialItemId: 'mat-ss316', materialName: 'SS 316L Sheet 10mm', supplierId: 'supp-ssi', supplierName: 'Stainless Source India', grnId: 'grn-rw-002', receivedDate: '2024-10-30', grade: 'SS316L', status: 'issued', storeLocationId: 'loc-002-rm', storeLocationName: 'Raw Material Store (SITE-002)', primaryQty: 398, primaryUom: 'kg', certStatus: 'verified' },
  { id: 'lot-wr-01', lotNumber: 'LOT-2024-007', materialItemId: 'mat-wr', materialName: 'Welding Rods E6013', supplierId: 'supp-apex-c', supplierName: 'Apex Consumables', receivedDate: '2024-10-10', status: 'available', storeLocationId: 'loc-001-rm', storeLocationName: 'Raw Material Store (SITE-001)', primaryQty: 2000, primaryUom: 'pcs', certStatus: 'none' },
  { id: 'lot-gd-01', lotNumber: 'LOT-2024-011', materialItemId: 'mat-gd', materialName: 'Grinding Disc 125mm', supplierId: 'supp-apex-c', supplierName: 'Apex Consumables', receivedDate: '2024-10-10', status: 'available', storeLocationId: 'loc-001-spr', storeLocationName: 'Spare Parts Store (SITE-001)', primaryQty: 120, primaryUom: 'pcs', certStatus: 'none' },
];

export const STOCK_MOVEMENTS: StockMovement[] = [
  { id: 'sm-001', lotId: 'lot-en19-01', movementType: 'Receipt', primaryQty: 315, uom: 'kg', toLocation: 'Raw Material Store (SITE-001)', referenceType: 'GRN', referenceId: 'grn-rw-001', referenceNumber: 'GRN-2024-RW-001', performedBy: 'Asha Nair', timestamp: '2024-10-30T10:00:00' },
  { id: 'sm-002', lotId: 'lot-ss316-01', movementType: 'Receipt', primaryQty: 398, uom: 'kg', toLocation: 'Raw Material Store (SITE-002)', referenceType: 'GRN', referenceId: 'grn-rw-002', referenceNumber: 'GRN-2024-RW-002', performedBy: 'Asha Nair', timestamp: '2024-10-30T10:30:00' },
  { id: 'sm-003', lotId: 'lot-en19-01', movementType: 'Issue', primaryQty: 315, uom: 'kg', fromLocation: 'Raw Material Store (SITE-001)', toLocation: 'WIP Store (SITE-001)', referenceType: 'Job', referenceId: 'job-rw-001', referenceNumber: 'JOB-2024-0201', performedBy: 'Asha Nair', timestamp: '2024-10-29T08:00:00' },
  { id: 'sm-004', lotId: 'lot-ss316-01', movementType: 'Issue', primaryQty: 398, uom: 'kg', fromLocation: 'Raw Material Store (SITE-002)', toLocation: 'WIP Store (SITE-002)', referenceType: 'Job', referenceId: 'job-rw-002', referenceNumber: 'JOB-2024-0202', performedBy: 'Asha Nair', timestamp: '2024-10-29T08:00:00' },
];

export const INSPECTIONS: Inspection[] = [
  { id: 'insp-rw-001', inspectionNumber: 'INSP-2024-0101', type: 'Final', jobId: 'job-rw-001', jobNumber: 'JOB-2024-0201', stageId: 'job-rw-001-s4', stageName: 'Final Inspection', inspectorId: 'emp-007', inspectorName: 'Priya Patel', date: '2024-11-24', templateName: 'Machined Component Final Inspection', sampleQty: 10, acceptedQty: 10, rejectedQty: 0, result: 'pass' },
  { id: 'insp-rw-002', inspectionNumber: 'INSP-2024-0102', type: 'Final', jobId: 'job-rw-002', jobNumber: 'JOB-2024-0202', stageId: 'job-rw-002-s3', stageName: 'Final Inspection', inspectorId: 'emp-007', inspectorName: 'Priya Patel', date: '2024-11-25', templateName: 'Machined Component Final Inspection', sampleQty: 20, acceptedQty: 20, rejectedQty: 0, result: 'pass' },
  { id: 'insp-rw-003', inspectionNumber: 'INSP-2024-0103', type: 'Final', jobId: 'job-rw-003', jobNumber: 'JOB-2024-0203', stageId: 'job-rw-003-s3', stageName: 'Final Inspection', inspectorId: 'emp-007', inspectorName: 'Priya Patel', date: '2024-11-19', templateName: 'Machined Component Final Inspection', sampleQty: 8, acceptedQty: 8, rejectedQty: 0, result: 'pass' },
  { id: 'insp-rw-004', inspectionNumber: 'INSP-2024-0104', type: 'Final', jobId: 'job-rw-004', jobNumber: 'JOB-2024-0204', stageId: 'job-rw-004-s4', stageName: 'Final Inspection', inspectorId: 'emp-007', inspectorName: 'Priya Patel', date: '2024-12-04', templateName: 'Machined Component Final Inspection', sampleQty: 12, acceptedQty: 12, rejectedQty: 0, result: 'pass' },
  { id: 'insp-rw-005', inspectionNumber: 'INSP-2024-0105', type: 'Final', jobId: 'job-rw-005', jobNumber: 'JOB-2024-0205', stageId: 'job-rw-005-s3', stageName: 'Final Inspection', inspectorId: 'emp-007', inspectorName: 'Priya Patel', date: '2024-12-09', templateName: 'Machined Component Final Inspection', sampleQty: 10, acceptedQty: 10, rejectedQty: 0, result: 'pass' },
];

export const NCRS: NCR[] = [];

export const QUALITY_RELEASES: QualityRelease[] = [
  { id: 'qr-rw-001', jobId: 'job-rw-001', jobNumber: 'JOB-2024-0201', inspectionId: 'insp-rw-001', releasedBy: 'Priya Patel', releasedAt: '2024-11-24T17:00:00', certDossierComplete: true, notes: 'All 10 pieces pass dimensional inspection. MTC verified.' },
  { id: 'qr-rw-002', jobId: 'job-rw-002', jobNumber: 'JOB-2024-0202', inspectionId: 'insp-rw-002', releasedBy: 'Priya Patel', releasedAt: '2024-11-25T17:00:00', certDossierComplete: true, notes: 'All 20 pieces pass. Surface roughness within spec.' },
  { id: 'qr-rw-003', jobId: 'job-rw-003', jobNumber: 'JOB-2024-0203', inspectionId: 'insp-rw-003', releasedBy: 'Priya Patel', releasedAt: '2024-11-19T16:30:00', certDossierComplete: true },
  { id: 'qr-rw-004', jobId: 'job-rw-004', jobNumber: 'JOB-2024-0204', inspectionId: 'insp-rw-004', releasedBy: 'Priya Patel', releasedAt: '2024-12-04T17:00:00', certDossierComplete: true },
  { id: 'qr-rw-005', jobId: 'job-rw-005', jobNumber: 'JOB-2024-0205', inspectionId: 'insp-rw-005', releasedBy: 'Priya Patel', releasedAt: '2024-12-09T17:00:00', certDossierComplete: true, notes: 'Flatness < 0.01mm confirmed for all seal plates.' },
];

// ── Dispatches ──
export const DISPATCHES: Dispatch[] = [
  {
    id: 'dsp-rw-001', dispatchNumber: 'DSP-2024-0101',
    customerId: 'cust-rw', customerName: 'RheinWerk Turbinenanlagen GmbH',
    dispatchDate: '2024-11-28', carrier: 'DB Schenker',
    vehicleNumber: 'TS09CA1122', lrNumber: 'LR-DBS-2024-7721',
    expectedDelivery: '2024-12-10',
    status: 'delivered', lineCount: 3, totalQty: 38, hasPoD: true,
    jobs: ['JOB-2024-0201', 'JOB-2024-0202', 'JOB-2024-0203'],
  },
  {
    id: 'dsp-rw-002', dispatchNumber: 'DSP-2024-0102',
    customerId: 'cust-rw', customerName: 'RheinWerk Turbinenanlagen GmbH',
    dispatchDate: '2024-12-12', carrier: 'DB Schenker',
    vehicleNumber: 'TS09CA3344', lrNumber: 'LR-DBS-2024-8834',
    expectedDelivery: '2024-12-24',
    status: 'delivered', lineCount: 2, totalQty: 22, hasPoD: true,
    jobs: ['JOB-2024-0204', 'JOB-2024-0205'],
  },
];

// ── Invoices (reconciled with PO) ──
// Customer PO: ₹60,00,000 (before tax this would be ~₹50,84,746 + 18% GST = ₹60,00,000)
// Invoice 1: ₹36,00,000 covering Lines 1-3 (Dispatch 1)
// Invoice 2: ₹24,00,000 covering Lines 4-5 (Dispatch 2)
export const INVOICES: CustomerInvoice[] = [
  {
    id: 'inv-rw-001', invoiceNumber: 'INV-2024-APE-0101',
    customerId: 'cust-rw', customerName: 'RheinWerk Turbinenanlagen GmbH',
    poId: 'cpo-rw-001', poNumber: 'CPO-2024-RW-001',
    dispatchId: 'dsp-rw-001', dispatchNumber: 'DSP-2024-0101',
    invoiceDate: '2024-11-28', dueDate: '2025-01-27',
    currency: 'INR',
    subtotal: 3050847,
    taxAmount: 549153,
    totalAmount: 3600000,
    paidAmount: 3600000,
    amount: 3600000,
    amountPaid: 3600000,
    outstandingAmount: 0,
    status: 'paid',
    createdBy: 'Anita Mehta', createdAt: '2024-11-28T10:00:00',
    lines: [
      { id: 'invl-rw-001-1', invoiceId: 'inv-rw-001', poLineId: 'pol-rw-001-1', poLineDesc: 'Bearing Housing Assembly', dispatchRef: 'DSP-2024-0101', productName: 'Bearing Housing Assembly', description: 'EN19, 10 Nos, as per RW-DWG-BH-001 Rev B', qty: 10, uom: 'Nos', unitPrice: 110000, taxPct: 18, lineTotal: 1298000 },
      { id: 'invl-rw-001-2', invoiceId: 'inv-rw-001', poLineId: 'pol-rw-001-2', poLineDesc: 'Shaft Sleeve', dispatchRef: 'DSP-2024-0101', productName: 'Shaft Sleeve', description: 'SS316L, 20 Nos, as per RW-DWG-SS-002 Rev A', qty: 20, uom: 'Nos', unitPrice: 42000, taxPct: 18, lineTotal: 991200 },
      { id: 'invl-rw-001-3', invoiceId: 'inv-rw-001', poLineId: 'pol-rw-001-3', poLineDesc: 'Coupling Hub', dispatchRef: 'DSP-2024-0101', productName: 'Coupling Hub', description: 'EN8, 8 Nos, as per RW-DWG-CH-003 Rev A', qty: 8, uom: 'Nos', unitPrice: 68750, taxPct: 18, lineTotal: 649700 },
    ],
  },
  {
    id: 'inv-rw-002', invoiceNumber: 'INV-2024-APE-0102',
    customerId: 'cust-rw', customerName: 'RheinWerk Turbinenanlagen GmbH',
    poId: 'cpo-rw-001', poNumber: 'CPO-2024-RW-001',
    dispatchId: 'dsp-rw-002', dispatchNumber: 'DSP-2024-0102',
    invoiceDate: '2024-12-12', dueDate: '2025-02-10',
    currency: 'INR',
    subtotal: 2033898,
    taxAmount: 366102,
    totalAmount: 2400000,
    paidAmount: 2400000,
    amount: 2400000,
    amountPaid: 2400000,
    outstandingAmount: 0,
    status: 'paid',
    createdBy: 'Anita Mehta', createdAt: '2024-12-12T10:00:00',
    lines: [
      { id: 'invl-rw-002-4', invoiceId: 'inv-rw-002', poLineId: 'pol-rw-001-4', poLineDesc: 'Mounting Flange Assembly', dispatchRef: 'DSP-2024-0102', productName: 'Mounting Flange Assembly', description: 'MS IS2062, 12 Nos, as per RW-DWG-MF-004 Rev C', qty: 12, uom: 'Nos', unitPrice: 85000, taxPct: 18, lineTotal: 1204800 },
      { id: 'invl-rw-002-5', invoiceId: 'inv-rw-002', poLineId: 'pol-rw-001-5', poLineDesc: 'Seal Plate Set', dispatchRef: 'DSP-2024-0102', productName: 'Seal Plate Set', description: 'SS316L, 10 Sets, as per RW-DWG-SP-005 Rev A', qty: 10, uom: 'Sets', unitPrice: 68000, taxPct: 18, lineTotal: 802400 },
    ],
  },
];

// ── Payments (₹60,00,000 total — fully settled) ──
export const PAYMENTS: CustomerPayment[] = [
  {
    id: 'pay-rw-001', paymentNumber: 'PAY-2024-APE-001',
    customerId: 'cust-rw', customerName: 'RheinWerk Turbinenanlagen GmbH',
    paymentDate: '2024-12-15', amount: 1000000, currency: 'INR',
    method: 'RTGS', transactionRef: 'RTGS240912345678',
    status: 'cleared', unallocatedAmount: 0,
    createdBy: 'Anita Mehta', createdAt: '2024-12-15T14:00:00',
    allocations: [{ id: 'pa-001', paymentId: 'pay-rw-001', invoiceId: 'inv-rw-001', invoiceNumber: 'INV-2024-APE-0101', allocatedAmount: 1000000, allocationDate: '2024-12-15' }],
  },
  {
    id: 'pay-rw-002', paymentNumber: 'PAY-2024-APE-002',
    customerId: 'cust-rw', customerName: 'RheinWerk Turbinenanlagen GmbH',
    paymentDate: '2025-01-10', amount: 2600000, currency: 'INR',
    method: 'RTGS', transactionRef: 'RTGS250101234567',
    status: 'cleared', unallocatedAmount: 0,
    createdBy: 'Anita Mehta', createdAt: '2025-01-10T11:00:00',
    allocations: [{ id: 'pa-002', paymentId: 'pay-rw-002', invoiceId: 'inv-rw-001', invoiceNumber: 'INV-2024-APE-0101', allocatedAmount: 2600000, allocationDate: '2025-01-10' }],
  },
  {
    id: 'pay-rw-003', paymentNumber: 'PAY-2024-APE-003',
    customerId: 'cust-rw', customerName: 'RheinWerk Turbinenanlagen GmbH',
    paymentDate: '2025-01-28', amount: 2400000, currency: 'INR',
    method: 'RTGS', transactionRef: 'RTGS250128987654',
    status: 'cleared', unallocatedAmount: 0,
    createdBy: 'Anita Mehta', createdAt: '2025-01-28T15:00:00',
    allocations: [{ id: 'pa-003', paymentId: 'pay-rw-003', invoiceId: 'inv-rw-002', invoiceNumber: 'INV-2024-APE-0102', allocatedAmount: 2400000, allocationDate: '2025-01-28' }],
  },
];

export const COLLECTIONS: CollectionActivity[] = [];

export const AUDIT_EVENTS: AuditEvent[] = [
  { id: 'ae-001', actor: 'Anita Mehta', actorId: 'u-sales', scope: 'CustomerRFQ', action: 'create', entityId: 'rfq-rw-001', entityRef: 'RFQ-2024-0101', timestamp: '2024-10-01T09:00:00', source: 'ui' },
  { id: 'ae-002', actor: 'Anita Mehta', actorId: 'u-sales', scope: 'CustomerQuotation', action: 'create', entityId: 'qt-rw-001', entityRef: 'QT-2024-0101', timestamp: '2024-10-14T10:00:00', source: 'ui' },
  { id: 'ae-003', actor: 'Anita Mehta', actorId: 'u-sales', scope: 'CustomerPO', action: 'create', entityId: 'cpo-rw-001', entityRef: 'CPO-2024-RW-001', timestamp: '2024-10-18T11:00:00', source: 'ui' },
  { id: 'ae-004', actor: 'Deepa Singh', actorId: 'u-disp', scope: 'Dispatch', action: 'create', entityId: 'dsp-rw-001', entityRef: 'DSP-2024-0101', timestamp: '2024-11-28T08:00:00', source: 'ui' },
  { id: 'ae-005', actor: 'Anita Mehta', actorId: 'u-sales', scope: 'CustomerInvoice', action: 'create', entityId: 'inv-rw-001', entityRef: 'INV-2024-APE-0101', timestamp: '2024-11-28T10:00:00', source: 'ui' },
  { id: 'ae-006', actor: 'Deepa Singh', actorId: 'u-disp', scope: 'Dispatch', action: 'create', entityId: 'dsp-rw-002', entityRef: 'DSP-2024-0102', timestamp: '2024-12-12T08:00:00', source: 'ui' },
  { id: 'ae-007', actor: 'Anita Mehta', actorId: 'u-sales', scope: 'CustomerInvoice', action: 'create', entityId: 'inv-rw-002', entityRef: 'INV-2024-APE-0102', timestamp: '2024-12-12T10:00:00', source: 'ui' },
  { id: 'ae-008', actor: 'Anita Mehta', actorId: 'u-sales', scope: 'CustomerPayment', action: 'record', entityId: 'pay-rw-001', entityRef: 'PAY-2024-APE-001', timestamp: '2024-12-15T14:00:00', source: 'ui' },
  { id: 'ae-009', actor: 'Anita Mehta', actorId: 'u-sales', scope: 'CustomerPayment', action: 'record', entityId: 'pay-rw-002', entityRef: 'PAY-2024-APE-002', timestamp: '2025-01-10T11:00:00', source: 'ui' },
  { id: 'ae-010', actor: 'Anita Mehta', actorId: 'u-sales', scope: 'CustomerPayment', action: 'record', entityId: 'pay-rw-003', entityRef: 'PAY-2024-APE-003', timestamp: '2025-01-28T15:00:00', source: 'ui' },
];

export const ASSETS: Asset[] = [
  { id: 'ast-wm01', assetCode: 'WM-01', name: 'Lincoln Welding Machine', category: 'Welding Equipment', siteId: 'site-001', workCentre: 'Welding Bay', criticality: 'High', status: 'operational', lastServiceDate: '2024-09-15', nextServiceDate: '2025-03-15', purchaseDate: '2020-06-01', manufacturer: 'Lincoln Electric', model: 'PowerWave S350', meterType: 'hours', currentReading: 2840 },
  { id: 'ast-lt001', assetCode: 'LT-01', name: 'CNC Lathe 500mm Swing', category: 'Turning Equipment', siteId: 'site-001', workCentre: 'Turning Bay', criticality: 'Critical', status: 'operational', lastServiceDate: '2024-10-01', nextServiceDate: '2025-04-01', purchaseDate: '2019-08-01', manufacturer: 'HMT', model: 'NH-22', meterType: 'hours', currentReading: 5600 },
  { id: 'ast-vm001', assetCode: 'VM-01', name: 'VMC Machining Centre', category: 'Milling Equipment', siteId: 'site-001', workCentre: 'Milling Bay', criticality: 'Critical', status: 'operational', lastServiceDate: '2024-10-15', nextServiceDate: '2025-04-15', purchaseDate: '2021-03-01', manufacturer: 'BFW', model: 'Vf-5', meterType: 'hours', currentReading: 2100 },
  { id: 'ast-lt002', assetCode: 'LT-02', name: 'CNC Lathe 300mm Swing (Plant 2)', category: 'Turning Equipment', siteId: 'site-002', workCentre: 'Turning Bay', criticality: 'High', status: 'operational', lastServiceDate: '2024-09-01', nextServiceDate: '2025-03-01', purchaseDate: '2020-05-01', manufacturer: 'HMT', model: 'NH-22', meterType: 'hours', currentReading: 3800 },
  { id: 'ast-gr001', assetCode: 'GR-01', name: 'Surface Grinder (Plant 2)', category: 'Grinding Equipment', siteId: 'site-002', workCentre: 'Grinding Bay', criticality: 'High', status: 'operational', lastServiceDate: '2024-10-20', nextServiceDate: '2025-04-20', purchaseDate: '2022-01-01', manufacturer: 'Micromatic', model: 'GU-20-40', meterType: 'hours', currentReading: 980 },
];

export const VAULT_DOCUMENTS: VaultDocument[] = [
  { id: 'doc-001', title: 'ISO 9001:2015 Certificate', docType: 'Quality Certificate', category: 'Company Certificates', uploadedBy: 'Ravi Shankar', uploadedAt: '2024-02-10', issueDate: '2024-02-10', expiryDate: '2024-11-22', version: 1, fileSize: '1.2 MB', linkedEntities: [], obligation: { renewalDue: '2024-11-08', responsible: 'Ravi Shankar' } },
  { id: 'doc-002', title: 'Factory Licence – HYD Plant 1', docType: 'Statutory Licence', category: 'Company Certificates', uploadedBy: 'Ravi Shankar', uploadedAt: '2023-04-01', issueDate: '2023-04-01', expiryDate: '2025-03-31', version: 1, fileSize: '0.3 MB', linkedEntities: [], obligation: { renewalDue: '2025-02-15', responsible: 'Ravi Shankar' } },
  { id: 'doc-003', title: 'RheinWerk CPO-2024-RW-001', docType: 'Customer PO', category: 'Sales', uploadedBy: 'Anita Mehta', uploadedAt: '2024-10-18', version: 1, fileSize: '0.8 MB', linkedEntities: [{ type: 'CustomerPO', ref: 'CPO-2024-RW-001' }] },
];

export const SUPPLIER_QUOTATIONS: SupplierQuotation[] = [
  {
    id: 'sq-rw-001', quoteNumber: 'SQ-2024-MSK-001', supplierId: 'supp-msk', supplierName: 'MSK Steel Pvt Ltd',
    prId: 'pr-001', prNumber: 'PR-2024-001', quoteDate: '2024-10-19', validUntil: '2024-11-18',
    currency: 'INR', status: 'selected', paymentTerms: 'Net 30', deliveryDays: 7,
    lines: [
      { id: 'sql-001-1', quoteId: 'sq-rw-001', materialItemId: 'mat-en19', materialName: 'EN19 Round Bar 100mm dia', quotedQty: 320, uom: 'kg', unitPrice: 450, taxPct: 18, freightIncluded: false, discountPct: 0, lineTotal: 144000 },
      { id: 'sql-001-2', quoteId: 'sq-rw-001', materialItemId: 'mat-en8', materialName: 'EN8 Round Bar 60mm dia', quotedQty: 180, uom: 'kg', unitPrice: 422, taxPct: 18, freightIncluded: false, discountPct: 0, lineTotal: 75960 },
    ],
  },
  {
    id: 'sq-rw-002', quoteNumber: 'SQ-2024-SSI-001', supplierId: 'supp-ssi', supplierName: 'Stainless Source India',
    prId: 'pr-002', prNumber: 'PR-2024-002', quoteDate: '2024-10-19', validUntil: '2024-11-18',
    currency: 'INR', status: 'selected', paymentTerms: 'Net 45', deliveryDays: 10,
    lines: [
      { id: 'sql-002-1', quoteId: 'sq-rw-002', materialItemId: 'mat-ss316', materialName: 'SS 316L Sheet 10mm', quotedQty: 400, uom: 'kg', unitPrice: 462, taxPct: 18, freightIncluded: false, discountPct: 0, lineTotal: 184800 },
    ],
  },
];
