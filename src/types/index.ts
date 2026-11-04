// ── EOSS View Model Types ──
// Lightweight typed interfaces for the prototype's mock-service layer.
// These are view models, not production ORM entities.

export type ID = string;

// ── Roles & Auth ──
export type RoleKey =
  | 'owner' | 'sales' | 'buyer' | 'storekeeper'
  | 'supervisor' | 'operator' | 'qc' | 'maintenance'
  | 'dispatch' | 'auditor';

export interface DemoUser {
  id: ID;
  name: string;
  role: RoleKey;
  email: string;
  avatar: string; // initials
  site: string;
  employeeId?: string;
}

// ── Status ──
export type StatusKey =
  | 'draft' | 'pending' | 'active' | 'hold' | 'warning'
  | 'complete' | 'failed' | 'overdue' | 'expired' | 'archived'
  | 'approved' | 'rejected' | 'in_progress' | 'on_order' | 'received'
  | 'dispatched' | 'partial' | 'cancelled' | 'open' | 'closed'
  | 'pass' | 'fail' | 'qc_hold' | 'available' | 'reserved' | 'issued';

export interface StatusConfig {
  label: string;
  color: string; // tailwind bg class or CSS var
  textColor: string;
  icon?: string;
}

// ── Sites & Locations ──
export interface Site {
  id: ID;
  name: string;
  code: string;
  city: string;
}

export interface StoreLocation {
  id: ID;
  siteId: ID;
  name: string;
  code: string;
  locationType: 'RM' | 'WIP' | 'FG' | 'Quarantine' | 'Spares' | 'Dispatch' | 'Warehouse';
}

// ── Parties ──
export interface Party {
  id: ID;
  partyType: 'Customer' | 'Supplier' | 'Both';
  legalName: string;
  tradingName: string;
  panNumber: string;
  gstin: string;
  state: string;
  paymentTerms: string;
  creditLimit?: number;
  currency: string;
  category?: string; // for suppliers
  rating?: number; // 1-5
  status: 'active' | 'inactive';
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  since: string; // year
}

// ── Materials ──
export interface MaterialItem {
  id: ID;
  itemCode: string;
  name: string;
  categoryId: ID;
  categoryName: string;
  primaryUom: string;
  secondaryUom?: string;
  conversionFactor?: number;
  conversionMethod?: 'direct_factor' | 'weight_per_area' | 'weight_per_length';
  trackingMode: 'none' | 'lot' | 'heat' | 'serial';
  reorderPoint: number;
  standardGrade?: string;
}

export interface MaterialLot {
  id: ID;
  lotNumber: string;
  heatNumber?: string;
  materialItemId: ID;
  materialName: string;
  supplierId: ID;
  supplierName: string;
  grnId?: ID;
  receivedDate: string;
  grade?: string;
  status: 'available' | 'reserved' | 'issued' | 'qc_hold' | 'scrapped' | 'dispatched';
  storeLocationId: ID;
  storeLocationName: string;
  primaryQty: number;
  primaryUom: string;
  secondaryQty?: number;
  secondaryUom?: string;
  certStatus: 'none' | 'pending' | 'extracted' | 'verified' | 'missing';
  parentLotId?: ID; // for remnants
}

// ── Customer Orders ──
export interface CustomerRFQ {
  id: ID;
  rfqNumber: string;
  customerId: ID;
  customerName: string;
  receivedDate: string;
  requiredBy: string;
  status: 'open' | 'quoted' | 'converted' | 'lost' | 'cancelled';
  lineCount: number;
  channel: string;
  owner: string;
}

export interface CustomerPO {
  id: ID;
  poNumber: string;
  customerId: ID;
  customerName: string;
  acceptedDate: string;
  paymentTerms: string;
  status: 'active' | 'partial' | 'complete' | 'cancelled' | 'on_hold';
  totalValue: number;
  currency: string;
  lineCount: number;
  quotationRef?: string;
  deliveryTerms: string;
  hasAmendment?: boolean;
}

export interface POLine {
  id: ID;
  poId: ID;
  drawingNumber: string;
  revision: string;
  description: string;
  orderedQty: number;
  uom: string;
  requiredDate: string;
  rate: number;
  value: number;
  jobId?: ID;
  jobNumber?: string;
  status: 'pending' | 'in_progress' | 'complete' | 'cancelled';
}

// ── Supplier Orders ──
export interface SupplierPO {
  id: ID;
  poNumber: string;
  spoNumber?: string;
  orderDate?: string;
  supplierId: ID;
  supplierName: string;
  raisedDate: string;
  committedDate: string;
  status: 'draft' | 'sent' | 'confirmed' | 'partial' | 'received' | 'overdue' | 'cancelled';
  totalValue: number;
  currency: string;
  paymentTerms: string;
  prId?: ID;
  jobRef?: string;
  lineCount: number;
  hasAmendment?: boolean;
}

export interface SupplierPOLine {
  id: ID;
  spoId: ID;
  materialItemId: ID;
  materialName: string;
  orderedQty: number;
  primaryQty?: number;
  secondaryQty?: number;
  uom: string;
  rate: number;
  value: number;
  committedDate: string;
  receivedQty: number;
  acceptedQty: number;
  rejectedQty: number;
  tolerancePct: number;
  status: 'pending' | 'partial' | 'received' | 'overdue';
}

export interface PurchaseRequisition {
  id: ID;
  prNumber: string;
  raisedBy: string;
  raisedDate: string;
  requiredBy: string;
  jobId?: ID;
  jobNumber?: string;
  status: 'draft' | 'pending' | 'approved' | 'converted' | 'cancelled';
  lineCount: number;
  totalQty: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

// ── Jobs ──
export type JobStatus = 'draft' | 'active' | 'hold' | 'complete' | 'cancelled';
export type JobPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Job {
  id: ID;
  jobNumber: string;
  customerId: ID;
  customerName: string;
  customerPoId?: ID;
  customerPoNumber?: string;
  drawingRef?: string;
  description: string;
  siteId: ID;
  siteName: string;
  status: JobStatus;
  priority: JobPriority;
  plannedStart: string;
  plannedEnd: string;
  actualStart?: string;
  actualEnd?: string;
  owner: string;
  currentStage: string;
  stages: JobStage[];
  materialReadiness: 'ready' | 'partial' | 'shortage' | 'pending';
  hasBlocker: boolean;
  value?: number;
}

export interface JobStage {
  id: ID;
  jobId: ID;
  sequence: number;
  name: string;
  status: 'pending' | 'in_progress' | 'complete' | 'hold' | 'rework';
  plannedStart: string;
  plannedEnd: string;
  actualStart?: string;
  actualEnd?: string;
  owner?: string;
  workCentre?: string;
  inputQty: number;
  completedGoodQty: number;
  rejectedQty: number;
  reworkQty: number;
  scrapQty: number;
  uom: string;
}

export interface JobUpdate {
  id: ID;
  jobStageId: ID;
  stageName: string;
  action: 'continue' | 'hold' | 'complete' | 'rework';
  completedGoodQty: number;
  rejectedQty: number;
  reworkQty: number;
  scrapQty: number;
  notes: string;
  performedByEmployeeId: ID;
  performedByName: string; // employee name
  loggedByUserId: ID;
  loggedByName: string; // user who entered
  timestamp: string;
  hasPhoto: boolean;
}

export interface JobMaterialReq {
  id: ID;
  jobId: ID;
  stageId: ID;
  stageName: string;
  materialItemId: ID;
  materialName: string;
  requiredQty: number;
  reservedQty: number;
  issuedQty: number;
  uom: string;
  shortage: boolean;
  lotIds: ID[];
}

export interface JobBlocker {
  id: ID;
  jobId: ID;
  stageId?: ID;
  type: 'Material' | 'Machine' | 'Manpower' | 'Customer' | 'Design' | 'Other';
  description: string;
  raisedBy: string;
  raisedAt: string;
  resolvedAt?: string;
  status: 'open' | 'resolved';
}

// ── GRN ──
export interface GoodsReceipt {
  id: ID;
  grnNumber: string;
  supplierId: ID;
  supplierName: string;
  spoId: ID;
  spoNumber: string;
  receivedDate: string;
  receivedBy: string;
  deliveryChallan: string;
  vehicleNumber?: string;
  status: 'draft' | 'pending_qc' | 'qc_hold' | 'accepted' | 'partial';
  lineCount: number;
  hasOfflineDraft?: boolean;
}

// ── Stock Movements ──
export type MovementType = 'Receipt' | 'Issue' | 'Return' | 'Transfer-In' | 'Transfer-Out' | 'Adjustment' | 'Dispatch-Out' | 'Scrap';

export interface StockMovement {
  id: ID;
  lotId: ID;
  movementType: MovementType;
  primaryQty: number;
  secondaryQty?: number;
  uom: string;
  fromLocation?: string;
  toLocation?: string;
  referenceType: string;
  referenceId: ID;
  referenceNumber: string;
  performedBy: string;
  timestamp: string;
  notes?: string;
}

// ── Inventory (derived view) ──
export interface InventoryItem {
  id: ID;
  materialItemId: ID;
  materialCode: string;
  materialName: string;
  categoryName: string;
  locationId: ID;
  locationName: string;
  onHandQty: number;
  availableQty: number;
  reservedQty: number;
  qcHoldQty: number;
  inTransitQty: number;
  primaryUom: string;
  secondaryQty?: number;
  secondaryUom?: string;
  reorderPoint: number;
  shortage: boolean;
  lotCount: number;
}

// ── Quality ──
export interface MaterialCertificate {
  id: ID;
  certNumber: string;
  certType: string;
  supplierId: ID;
  supplierName: string;
  issueDate: string;
  heatNumber: string;
  grade: string;
  dimensionsPrimary?: string;
  dimensionsSecondary?: string;
  yieldStrength?: number;
  tensileStrength?: number;
  elongationPct?: number;
  hardnessHB?: number;
  verificationStatus: 'pending' | 'ai_extracted' | 'verified' | 'rejected';
  extractedBy?: string;
  confidence?: 'High' | 'Medium' | 'Low';
  linkedLots: ID[];
}

export interface Inspection {
  id: ID;
  inspectionNumber: string;
  type: 'Incoming' | 'In-Process' | 'Final';
  lotId?: ID;
  jobId?: ID;
  jobNumber?: string;
  stageId?: ID;
  stageName?: string;
  inspectorId: ID;
  inspectorName: string;
  date: string;
  templateName: string;
  sampleQty: number;
  acceptedQty: number;
  rejectedQty: number;
  result: 'pass' | 'fail' | 'hold' | 'pending';
  ncrId?: ID;
  ncrNumber?: string;
}

export interface NCR {
  id: ID;
  ncrNumber: string;
  inspectionId: ID;
  sourceType: 'Incoming' | 'In-Process' | 'Customer-Return';
  severity: 'Minor' | 'Major' | 'Critical';
  description: string;
  affectedQty: number;
  disposition: 'Rework' | 'Return' | 'Scrap' | 'Accept-on-Deviation' | 'Pending';
  raisedBy: string;
  raisedAt: string;
  status: 'open' | 'in_progress' | 'closed';
  lotId?: ID;
  jobId?: ID;
}

export interface QualityRelease {
  id: ID;
  jobId: ID;
  jobNumber: string;
  inspectionId: ID;
  releasedBy: string;
  releasedAt: string;
  certDossierComplete: boolean;
  notes?: string;
}

// ── Assets & Maintenance ──
export type AssetStatus = 'operational' | 'in_maintenance' | 'breakdown' | 'retired' | 'pm_overdue';

export interface Asset {
  id: ID;
  assetCode: string;
  name: string;
  category: string;
  subCategory?: string;
  siteId: ID;
  location?: string;
  workCentre?: string;
  criticality: 'Low' | 'Medium' | 'High' | 'Critical';
  status: AssetStatus;
  lastServiceDate?: string;
  nextServiceDate?: string;
  purchaseDate: string;
  purchaseYear?: number;
  manufacturer: string;
  model?: string;
  serialNumber?: string;
  meterType?: 'hours' | 'cycles' | 'none';
  pmFrequencyHours?: number;
  currentReading?: number;
}

export interface MaintenanceEvent {
  id: ID;
  eventNumber: string;
  type: 'Breakdown' | 'Preventive' | 'Corrective';
  assetId: ID;
  assetName: string;
  assetCode: string;
  severity?: 'Low' | 'Medium' | 'High' | 'Critical';
  symptom: string;
  diagnosis?: string;
  rootCause?: string;
  workDone?: string;
  correctiveAction?: string;
  technicianId: ID;
  technicianName: string;
  downtimeStart: string;
  downtimeEnd?: string;
  status: 'open' | 'in_progress' | 'closed' | 'pending_approval';
  affectedJobs: { jobId: ID; jobNumber: string; impact: string }[];
  sparesUsed: { materialName: string; qty: number; uom: string }[];
  partsUsed?: { materialName?: string; partName?: string; qty: number; uom?: string }[];
}

// ── Dispatch ──
export interface Dispatch {
  id: ID;
  dispatchNumber: string;
  customerId: ID;
  customerName: string;
  dispatchDate: string;
  carrier?: string;
  vehicleNumber?: string;
  lrNumber?: string;
  expectedDelivery?: string;
  status: 'draft' | 'pending_docs' | 'dispatched' | 'delivered' | 'short_delivery';
  lineCount: number;
  totalQty: number;
  hasPoD: boolean;
  jobs: string[];
}

// ── Documents ──
export interface VaultDocument {
  id: ID;
  title: string;
  docType: string;
  category: string;
  siteId?: ID;
  uploadedBy: string;
  uploadedAt: string;
  issueDate?: string;
  expiryDate?: string;
  version: number;
  fileSize: string;
  linkedEntities: { type: string; ref: string }[];
  certStatus?: 'ai_extracted' | 'verified' | 'pending';
  aiClassification?: string;
  obligation?: { renewalDue: string; responsible: string };
}

// ── Approval Requests ──
export interface ApprovalRequest {
  id: ID;
  requestType: string;
  entityRef: string;
  entityId: ID;
  description: string;
  requestedBy: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  thresholdValue?: number;
  currentValue?: number;
  notes?: string;
}

// ── Notifications ──
export interface AppNotification {
  id: ID;
  type: 'reminder' | 'warning' | 'action' | 'success' | 'info';
  title: string;
  body: string;
  entityType?: string;
  entityId?: ID;
  entityRef?: string;
  timestamp: string;
  read: boolean;
}

// ── Home Pulse Exceptions ──
export interface PulseException {
  id: ID;
  category: 'material' | 'procurement' | 'production' | 'quality' | 'asset' | 'document' | 'dispatch';
  priority: 'critical' | 'warning' | 'info';
  title: string;
  body: string;
  affectedRef: string;
  affectedId: ID;
  workspacePath: string;
  cta: string;
  since: string;
  aiReason?: string;
}

// ── Employees ──
export interface Employee {
  id: ID;
  userId: ID;
  employeeCode: string;
  name: string;
  role: RoleKey;
  department: string;
  designation: string;
  joiningDate: string;
  siteId: ID;
}

// ── Reports ──
export interface ReportDataPoint {
  label: string;
  value: number;
  value2?: number;
  value3?: number;
}

// ── AI ──
export interface AIProposal {
  id: ID;
  runType: string;
  confidence: 'High' | 'Medium' | 'Low';
  fields: { label: string; extracted: string; verified?: boolean }[];
  status: 'pending' | 'confirmed' | 'edited' | 'dismissed';
}

// ── Supplier Quotation ──
export interface SupplierQuotation {
  id: ID;
  quoteNumber: string;
  supplierId: ID;
  supplierName: string;
  prId?: ID;
  prNumber?: string;
  quoteDate: string;
  validUntil: string;
  currency: string;
  status: 'received' | 'selected' | 'rejected' | 'expired';
  attachmentRef?: string;
  paymentTerms: string;
  deliveryDays: number;
  lines: SupplierQuotationLine[];
  notes?: string;
}

export interface SupplierQuotationLine {
  id: ID;
  quoteId: ID;
  materialItemId: ID;
  materialName: string;
  quotedQty: number;
  uom: string;
  unitPrice: number;
  taxPct: number;
  freightIncluded: boolean;
  discountPct: number;
  moq?: number;
  lineTotal: number;
}

// ── Customer Account ──
// A dedicated profile linked to Party, capturing customer-specific business terms
export interface CustomerAccount {
  id: ID;
  partyId: ID;
  accountCode: string;
  creditDays: number;
  creditLimit: number;
  discountPct?: number;
  pricingTier?: string;
  salesOwnerId?: ID;
  salesOwnerName?: string;
  createdAt: string;
  notes?: string;
}

// ── Audit Event (append-only) ──
export interface AuditEvent {
  id: ID;
  actor: string;
  actorId: ID;
  scope: string;          // e.g. 'Job', 'CustomerPO', 'SupplierPO'
  action: string;         // e.g. 'create', 'update', 'approve', 'reject'
  entityId: ID;
  entityRef: string;      // human-readable reference number
  timestamp: string;
  source: 'ui' | 'api' | 'system';
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  reason?: string;
  correlationRef?: string;
}

// ── Approval Policy ──
export interface ApprovalPolicy {
  id: ID;
  scope: string;          // entity type this policy applies to
  condition: string;      // human-readable condition description
  thresholdType: 'value' | 'quantity' | 'always' | 'never';
  thresholdValue?: number;
  requiredRole: string;
  escalationRole?: string;
  active: boolean;
}
