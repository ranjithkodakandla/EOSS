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
  | 'pass' | 'fail' | 'qc_hold' | 'available' | 'reserved' | 'issued'
  | 'quotation_in_progress' | 'awaiting_quotation' | 'quotation_received'
  | 'declined' | 'no_response' | 'not_selected' | 'ready_to_send' | 'sent'
  | 'awaiting_supplier_confirmation' | 'supplier_accepted' | 'supplier_declined'
  | 'approval_rejected' | 'approved_for_po' | 'po_drafted' | 'po_issued' | 'direct_order';

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
  siteType?: 'Manufacturing' | 'Warehouse' | 'Office' | 'Fabrication' | 'Precision Machining';
  address?: string;
  state?: string;
  pinCode?: string;
  siteManager?: string;
  phone?: string;
  status?: 'active' | 'inactive';
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
  dimensions?: string;
  preferredSupplierIds?: ID[];
  leadTimeDays?: number;
  certRequired?: boolean;
  active?: boolean;
}

export interface MaterialLot {
  id: ID;
  lotNumber: string;
  heatNumber?: string;
  supplierBatchRef?: string;
  materialItemId: ID;
  materialName: string;
  supplierId: ID;
  supplierName: string;
  spoId?: ID;
  grnId?: ID;
  receivedDate: string;
  mfgDate?: string;
  expiryDate?: string;
  grade?: string;
  status: 'available' | 'reserved' | 'issued' | 'qc_hold' | 'scrapped' | 'dispatched';
  storeLocationId: ID;
  storeLocationName: string;
  primaryQty: number;
  receivedQty?: number;
  acceptedQty?: number;
  rejectedQty?: number;
  primaryUom: string;
  secondaryQty?: number;
  secondaryUom?: string;
  certStatus: 'none' | 'pending' | 'extracted' | 'verified' | 'missing';
  parentLotId?: ID; // for remnants
  notes?: string;
}

export type InventoryTransferStatus = 'in_transit' | 'received' | 'cancelled';

export interface InventoryTransfer {
  id: ID;
  transferNumber: string;
  lotId: ID;
  materialItemId: ID;
  materialName: string;
  grade?: string;
  sourceLocationId: ID;
  sourceLocationName: string;
  destinationLocationId: ID;
  destinationLocationName: string;
  quantity: number;
  uom: string;
  status: InventoryTransferStatus;
  initiatedAt: string;
  initiatedBy: string;
  dispatchedAt: string;
  receivedAt?: string;
  receivedBy?: string;
  notes?: string;
}

export type MaterialReturnStatus = 'pending_inspection' | 'accepted' | 'rejected';

export interface MaterialReturn {
  id: ID;
  returnNumber: string;
  originalLotId: ID;
  materialItemId: ID;
  materialName: string;
  jobId: ID;
  jobNumber: string;
  quantity: number;
  uom: string;
  receivingLocationId: ID;
  receivingLocationName: string;
  status: MaterialReturnStatus;
  raisedAt: string;
  raisedBy: string;
  inspectedAt?: string;
  inspectedBy?: string;
  notes?: string;
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
  quotationId?: ID;
  quotationRef?: string;
  quotationStatus?: CustomerQuotation['status'];
  title?: string;
  customerContactPerson?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerEnquiryRef?: string;
  customerProjectRef?: string;
  quotationDueDate?: string;
  priority?: 'Low' | 'Normal' | 'High' | 'Urgent';
  currency?: string;
  deliveryLocation?: string;
  requirementsSummary?: string;
  customerInstructions?: string;
  internalNotes?: string;
  paymentTerms?: string;
  deliveryTerms?: string;
  freightResponsibility?: string;
  paymentExpectation?: string;
  quoteValidityExpected?: string;
  priceExpectation?: string;
  specialCommercialConditions?: string;
  applicableStandards?: string;
  materialStandards?: string;
  mtcRequired?: boolean;
  dimensionalInspection?: boolean;
  ndtRequired?: boolean;
  heatTreatment?: boolean;
  surfaceTreatment?: string;
  traceabilityRequired?: boolean;
  customerWitnessRequired?: boolean;
  requiredQualityDocs?: string;
  packagingPreservation?: string;
  specialQualityReqs?: string;
  lines?: RFQLine[];
  documents?: RFQDocument[];
  clarifications?: RFQClarification[];
  revisions?: RFQRevision[];
  revisionNumber?: number;
  quotationIds?: ID[];
  convertedPoId?: ID;
  technicalRequirements?: Record<string, unknown>;
}

export interface RFQRevision {
  id: ID;
  revision: number;
  changedBy: string;
  changeDescription: string;
  changedAt: string;
}

export interface CustomerPO {
  id: ID;
  poNumber: string;
  customerId: ID;
  customerName: string;
  acceptedDate: string;
  paymentTerms: string;
  status: 'pending' | 'active' | 'partial' | 'complete' | 'cancelled' | 'on_hold';
  totalValue: number;
  currency: string;
  lineCount: number;
  quotationRef?: string;
  quotationId?: ID;
  rfqId?: ID;
  rfqRef?: string;
  deliveryTerms: string;
  isDirectOrder?: boolean;
  originType?: 'from_quotation' | 'direct_order';
  directOrderReason?: string;
  availabilityStatus?: 'not_assessed' | 'available' | 'partially_available' | 'awaiting_procurement';
  deliverToSiteId?: ID;
  deliverToSiteName?: string;
  hasAmendment?: boolean;
  commercialLocked?: boolean;
  commercialLockReason?: string;
  creditApprovalId?: ID;
  revision?: number;
  lastAmendedAt?: string;
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
  status: 'draft' | 'pending_approval' | 'sent' | 'awaiting_supplier_confirmation' | 'confirmed' | 'supplier_accepted' | 'supplier_declined' | 'partial' | 'received' | 'overdue' | 'closed' | 'cancelled';
  totalValue: number;
  currency: string;
  paymentTerms: string;
  prId?: ID;
  prNumber?: string;
  jobRef?: string;
  lineCount: number;
  hasAmendment?: boolean;
  deliverToSiteId?: ID;
  deliverToSiteName?: string;
  deliverToStoreId?: ID;
  deliverToStoreName?: string;
  supplierQuotationId?: ID;
  supplierQuotationRef?: string;
  supplierRfqId?: ID;
  supplierRfqRef?: string;
  directProcurement?: boolean;
  directProcurementReason?: string;
  revision?: number;
  lastAmendedAt?: string;
  sentAt?: string;
  issuedBy?: string;
  supplierResponseStatus?: 'pending' | 'accepted' | 'declined';
  supplierConfirmedDate?: string;
  supplierRefNumber?: string;
  supplierResponseNotes?: string;
  supplierDeclineReason?: string;
  supplierRespondedAt?: string;
  originatingRequirementId?: ID;
  originatingRequirementLabel?: string;
  notes?: string;
}

export type POAmendmentEntity = 'customer_po' | 'supplier_po';
export type POAmendmentStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected';

export interface POAmendment {
  id: ID;
  entityType: POAmendmentEntity;
  poId: ID;
  poNumber: string;
  revision: number;
  reason: string;
  changeNote: string;
  status: POAmendmentStatus;
  requestedBy: string;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  attachmentName?: string;
  lineId?: ID;
  lineChanges?: { description?: string; drawingRevision?: string; materialName?: string; quantity?: number; rate?: number; requiredDate?: string };
  headerChanges?: { paymentTerms?: string; deliveryTerms?: string; committedDate?: string };
  beforeSnapshot: Record<string, unknown>;
  afterSnapshot?: Record<string, unknown>;
}

export interface SupplierPOLine {
  id: ID;
  spoId: ID;
  materialItemId: ID;
  materialCode?: string;
  materialName: string;
  grade?: string;
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
  department?: string;
  raisedDate: string;
  requiredBy: string;
  jobId?: ID;
  jobNumber?: string;
  sourceType?: 'manual' | 'shortage' | 'site_need';
  sourceRefId?: ID;
  sourceRefLabel?: string;
  sourceMaterialReqId?: ID;
  status: 'draft' | 'pending' | 'approved' | 'quotation_in_progress' | 'approved_for_po' | 'po_drafted' | 'po_issued' | 'converted' | 'closed' | 'cancelled' | 'rejected';
  lineCount: number;
  totalQty: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  deliverToSiteId?: ID;
  deliverToSiteName?: string;
  deliverToStoreId?: ID;
  deliverToStoreName?: string;
  purpose?: string;
  reason?: string;
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  notes?: string;
  attachments?: { id: string; name: string; size?: string }[];
  lines?: PRLine[];
}

export interface SupplierInvitation {
  id: ID;
  prId: ID;
  prNumber: string;
  supplierId: ID;
  supplierName: string;
  contactName?: string;
  contactEmail?: string;
  matchReason?: string;
  channel: 'email' | 'portal' | 'phone' | 'whatsapp';
  requestedLineIds: ID[];
  createdAt: string;
  sentDate?: string;
  responseDueDate?: string;
  status: 'draft' | 'ready_to_send' | 'sent' | 'awaiting_quotation' | 'quotation_received' | 'declined' | 'no_response' | 'not_selected' | 'closed';
  quotationId?: ID;
  declineReason?: string;
  lastNotifiedAt?: string;
  notificationNote?: string;
  notes?: string;
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
  materialReadiness: 'ready' | 'available' | 'partial' | 'shortage' | 'pending' | 'awaiting_procurement' | 'quality_hold';
  hasBlocker: boolean;
  value?: number;
  stageTemplateId?: ID;
  stageTemplateName?: string;
  poLineId?: ID;
  cancellationReason?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  operationalNotes?: string;
  cancellationDisposition?: JobCancellationDisposition;
}

export type JobDisposition = 'not_applicable' | 'retain' | 'rework' | 'scrap' | 'return_after_inspection';

export interface JobCancellationDisposition {
  reason: string;
  materialName?: string;
  materialUom?: string;
  reservedReleasedQty: number;
  issuedQty: number;
  consumedQty: number;
  wip: JobDisposition;
  finishedGoods: JobDisposition;
  recordedAt: string;
  recordedBy: string;
}

export interface JobStage {
  id: ID;
  jobId: ID;
  sequence: number;
  name: string;
  status: 'pending' | 'in_progress' | 'complete' | 'hold' | 'rework' | 'skipped';
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
  skipReason?: string;
  skippedAt?: string;
  skippedBy?: string;
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
  jobNumber?: string;
  stageId?: ID;
  type: 'Material' | 'Machine' | 'Manpower' | 'Customer' | 'Design' | 'Other';
  category?: string;
  description: string;
  linkedAssetId?: ID;
  linkedAssetCode?: string;
  linkedMaintenanceEventId?: ID;
  linkedMaintenanceEventNumber?: string;
  raisedBy: string;
  raisedAt: string;
  resolvedAt?: string;
  status: 'open' | 'resolved';
}

// ── GRN ──
export interface GoodsReceiptLotAllocation {
  id: ID;
  lotId?: ID;
  lotNumber: string;
  supplierLotRef?: string;
  grade?: string;
  qty: number;
  uom: string;
  mfgDate?: string;
  expiryDate?: string;
  qualityStatus: 'pending_qc' | 'qc_hold' | 'accepted' | 'rejected';
  notes?: string;
}

export interface GoodsReceiptLine {
  id: ID;
  spoLineId: ID;
  materialItemId: ID;
  materialCode?: string;
  materialName: string;
  grade?: string;
  orderedQty: number;
  previouslyReceivedQty: number;
  receivedQty: number;
  uom: string;
  lots: GoodsReceiptLotAllocation[];
  notes?: string;
}

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
  status: 'draft' | 'pending_qc' | 'qc_hold' | 'accepted' | 'partial' | 'rejected';
  lineCount: number;
  hasOfflineDraft?: boolean;
  siteId?: ID;
  siteName?: string;
  storeLocationId?: ID;
  storeLocationName?: string;
  lines?: GoodsReceiptLine[];
  notes?: string;
}

// ── Stock Movements ──
export type MovementType = 'Receipt' | 'Issue' | 'Return' | 'Reservation' | 'Reservation-Release' | 'Transfer-In' | 'Transfer-Out' | 'Adjustment' | 'Dispatch-Out' | 'Scrap';

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
  unitCost?: number;
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

export interface InspectionMeasurement {
  parameter: string;
  description?: string;
  unit?: string;
  acceptanceCriteria: string;
  actual: string;
  passed: boolean;
}

export interface Inspection {
  id: ID;
  inspectionNumber: string;
  type: 'Incoming' | 'In-Process' | 'Final' | 'Dispatch-Readiness';
  origin?: 'internal' | 'external';
  lotId?: ID;
  grnId?: ID;
  grnNumber?: string;
  jobId?: ID;
  jobNumber?: string;
  poId?: ID;
  spoNumber?: string;
  poLineId?: ID;
  siteId?: ID;
  siteName?: string;
  stageId?: ID;
  stageName?: string;
  subject?: string;
  productDescription?: string;
  quantityInspected?: number;
  uom?: string;
  inspectorId: ID;
  inspectorName: string;
  externalOrgName?: string;
  externalScope?: string;
  reportRef?: string;
  date: string;
  receivedDate?: string;
  approvedAt?: string;
  templateId?: ID;
  templateName: string;
  checklistVersion?: string;
  measurements?: InspectionMeasurement[];
  sampleQty: number;
  acceptedQty: number;
  rejectedQty: number;
  result: 'pass' | 'fail' | 'hold' | 'pending' | 'partial';
  ncrId?: ID;
  ncrNumber?: string;
  reworkOfInspectionId?: ID;
  remarks?: string;
}

// ── Inspection Templates (configurable checklists) ──
export interface InspectionTemplateParameter {
  parameter: string;
  description?: string;
  acceptanceCriteria: string;
  unit?: string;
  min?: number;
  max?: number;
  method?: string;
  mandatory: boolean;
}

export interface InspectionTemplate {
  id: ID;
  name: string;
  appliesTo: 'Product' | 'Material' | 'Job Stage' | 'Final' | 'Dispatch Readiness';
  productOrCategory?: string;
  drawingRef?: string;
  stageName?: string;
  version: string;
  parameters: InspectionTemplateParameter[];
}

// ── Production Stage Templates (configurable routes) ──
export interface StageTemplateStage {
  sequence: number;
  name: string;
  workCentre: string;
  plannedDurationDays: number;
  inspectionRequired: boolean;
  dependsOnSequence?: number;
}

export interface StageTemplate {
  id: ID;
  name: string;
  appliesToCategory: string;
  description?: string;
  stages: StageTemplateStage[];
}

export interface NCR {
  id: ID;
  ncrNumber: string;
  inspectionId?: ID;
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
  jobNumber?: string;
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
  meterType?: 'hours' | 'cycles' | 'km' | 'none';
  pmFrequencyHours?: number;
  pmFrequencyMetric?: number;
  pmFrequencyDays?: number;
  lastServiceReading?: number;
  currentReading?: number;
  responsiblePerson?: string;
  installationDate?: string;
  commissioningDate?: string;
  archivedAt?: string;
  archivedBy?: string;
  archiveReason?: string;
}

// ── Meter Readings (manual running-hour log) ──
export interface MeterReading {
  id: ID;
  assetId: ID;
  assetCode: string;
  previousReading?: number;
  reading: number;
  readingDate: string;
  recordedByEmployeeId?: ID;
  recordedBy: string;
  readingType: 'routine' | 'shift-end' | 'post-maintenance' | 'correction';
  notes?: string;
}

// ── Maintenance Work Orders (scheduled → due → assigned → in progress → completed) ──
export interface MaintenanceWorkOrder {
  id: ID;
  woNumber: string;
  assetId: ID;
  assetCode: string;
  assetName: string;
  triggerType: 'calendar' | 'hours' | 'manual';
  status: 'scheduled' | 'due' | 'assigned' | 'in_progress' | 'completed';
  assignedTechnicianId?: ID;
  assignedTechnicianName?: string;
  dueDate?: string;
  dueReading?: number;
  startedAt?: string;
  completedAt?: string;
  readingAtCompletion?: number;
  workPerformed?: string;
  downtimeMinutes?: number;
  observations?: string;
  sparesConsumed?: { materialName: string; qty: number; uom: string }[];
  nextDueDate?: string;
  nextDueReading?: number;
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
  responsiblePerson?: string;
  plannedDate?: string;
  expectedDurationHours?: number;
  downtimeStart: string;
  downtimeEnd?: string;
  completionDate?: string;
  notes?: string;
  status: 'open' | 'in_progress' | 'scheduled' | 'closed' | 'pending_approval';
  affectedJobs: { jobId: ID; jobNumber: string; impact: string }[];
  sparesUsed: { materialName: string; qty: number; uom: string }[];
  partsUsed?: { materialName?: string; partName?: string; qty: number; uom?: string }[];
}

// ── Dispatch ──
export interface DispatchPackage {
  id: ID;
  dispatchId: ID;
  packageCode: string;
  packageType: 'Crate' | 'Pallet' | 'Box' | 'Bundle' | 'Loose';
  lengthMm?: number;
  widthMm?: number;
  heightMm?: number;
  weightKg?: number;
  productDescription: string;
  qty: number;
  uom: string;
  lotIds?: ID[];
  packingDate?: string;
  packingNotes?: string;
}

export interface Dispatch {
  id: ID;
  dispatchNumber: string;
  customerId: ID;
  customerName: string;
  customerPoId?: ID;
  customerPoNumber?: string;
  poLineId?: ID;
  jobId?: ID;
  jobNumber?: string;
  qualityReleaseId?: ID;
  sourceSiteId?: ID;
  sourceStoreLocationId?: ID;
  sourceStoreLocationName?: string;
  destination?: string;
  dispatchDate: string;
  carrier?: string;
  vehicleNumber?: string;
  driverName?: string;
  lrNumber?: string;
  expectedDelivery?: string;
  actualDeliveryDate?: string;
  receivedByName?: string;
  status: 'draft' | 'ready' | 'pending_docs' | 'dispatched' | 'in_transit' | 'delivered' | 'delivery_confirmed' | 'short_delivery' | 'damaged' | 'delayed' | 'discrepancy';
  lineCount: number;
  totalQty: number;
  dispatchedQty?: number;
  hasPoD: boolean;
  podReference?: string;
  deliveryCondition?: 'good' | 'partial_damage' | 'shortage';
  deliveryNotes?: string;
  podRecordedAt?: string;
  podRecordedBy?: string;
  jobs: string[];
  packages?: DispatchPackage[];
  discrepancyNotes?: string;
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
  fileName?: string;
  reminderDays?: number;
  linkedEntities: { type: string; ref: string }[];
  certStatus?: 'ai_extracted' | 'verified' | 'pending';
  aiClassification?: string;
  obligation?: { renewalDue: string; responsible: string };
  supersedesDocId?: ID;
  renewedFromDocId?: ID;
  status?: 'active' | 'superseded' | 'expired' | 'archived';
  archivedAt?: string;
  archivedBy?: string;
  archiveReason?: string;
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
  siteId?: ID;
  siteName?: string;
  decisionAt?: string;
  approvalCycle?: number;
  previousRequestId?: ID;
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
  invitationId?: ID;
  quoteDate: string;
  validUntil: string;
  currency?: string;
  status: 'received' | 'selected' | 'rejected' | 'not_selected' | 'approval_rejected' | 'expired' | 'pending';
  attachmentRef?: string;
  attachmentName?: string;
  paymentTerms: string;
  deliveryDays: number;
  deliveryCharges?: number;
  discountAmount?: number;
  taxAmount?: number;
  lines: SupplierQuotationLine[];
  notes?: string;
  supplierRfqId?: ID;
  supplierRfqRef?: string;
  recordType?: 'rfq' | 'quotation';
  overrideReason?: string;
  rejectedReason?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  revisionNumber?: number;
}

export interface SupplierQuotationLine {
  id: ID;
  quoteId: ID;
  materialItemId: ID;
  materialCode?: string;
  materialName: string;
  grade?: string;
  quotedQty?: number;
  orderedQty?: number;
  qty?: number;
  uom: string;
  unitPrice?: number;
  unitRate?: number;
  taxPct?: number;
  freightIncluded?: boolean;
  discountPct?: number;
  moq?: number;
  lineTotal: number;
  leadTimeDays?: number;
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
export interface AuditChange {
  field: string;
  label: string;
  previousValue: string;
  newValue: string;
}

export interface AuditEvent {
  id: ID;
  actor: string;
  actorId: ID;
  role?: string;          // Actor's business role (e.g. Owner / MD, Sales, Procurement)
  module?: string;        // e.g. Sales, Procurement, Inventory, Quality, Production, Dispatch, Maintenance, Finance, Master Data
  scope: string;          // e.g. 'Job', 'CustomerPO', 'SupplierPO', 'CustomerInvoice', 'SupplierBill'
  action: string;         // e.g. 'create', 'update', 'approve', 'reject', 'issue', 'payment_recorded'
  entityId: ID;
  entityRef: string;      // human-readable reference number
  timestamp: string;
  source: 'ui' | 'api' | 'system';
  description?: string;   // Human-readable business summary
  changes?: AuditChange[];
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  reason?: string;
  correlationRef?: string;
  relatedEntityType?: string;
  relatedEntityId?: ID;
  relatedEntityRef?: string;
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

// ── Finished Product ──
export interface FinishedProduct {
  id: ID;
  productCode: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  primaryUom: string;
  drawingNumber: string;
  drawingRevision: string;
  materialSpec: string;
  netWeightKg: number;
  grossWeightKg: number;
  primaryDimension: string;
  manufacturingRoute: string;
  status: 'active' | 'inactive';
  unitPriceInr: number;
}

// ── Customer Quotation ──
export interface CustomerQuotation {
  id: ID;
  quotationNumber: string;
  rfqId?: ID;
  rfqNumber?: string;
  isDirectQuotation?: boolean;
  parentQuotationId?: ID;
  customerId: ID;
  customerName: string;
  quotationDate: string;
  validUntil: string;
  currency: string;
  status: 'draft' | 'submitted' | 'accepted' | 'rejected' | 'expired' | 'revised' | 'superseded';
  totalValue: number;
  revision?: number;
  owner: string;
  deliveryTerms?: string;
  paymentTerms?: string;
  subtotal?: number;
  discountAmount?: number;
  taxRatePct?: number;
  taxAmount?: number;
  totalAmount?: number;
  version?: number;
  acceptedDate?: string;
  acceptedAt?: string;
  acceptedBy?: string;
  acceptanceNotes?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  lines?: any[];
}

export interface CustomerQuotationLine {
  id: ID;
  quotationId: ID;
  productId: ID;
  productName: string;
  drawingNumber: string;
  drawingRevision: string;
  orderedQty: number;
  uom: string;
  unitPrice: number;
  value: number;
  requiredDate: string;
}

// ── Site Allocation ──
export interface SiteAllocation {
  id: ID;
  poId: ID;
  poNumber: string;
  poLineId: ID;
  productId: ID;
  productName: string;
  siteId: ID;
  siteName: string;
  allocatedQty: number;
  uom: string;
  jobId?: ID;
  jobNumber?: string;
  status: 'pending' | 'in_progress' | 'complete' | 'cancelled';
  allocatedDate: string;
  allocatedBy: string;
}

// ── Finance ──
export interface CustomerInvoice {
  id: ID;
  invoiceNumber: string;
  customerId: ID;
  customerName: string;
  customerPoRef?: string;
  customerPoId?: ID;
  poId?: ID;
  poNumber?: string;
  dispatchId?: ID;
  dispatchNumber?: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  amountPaid: number;
  subtotal?: number;
  taxAmount?: number;
  totalAmount?: number;
  paidAmount?: number;
  outstandingAmount?: number;
  currency: string;
  status: 'draft' | 'sent' | 'partial' | 'paid' | 'overdue' | 'disputed';
  createdBy?: string;
  createdAt?: string;
  lines?: any[];
}

export interface SupplierInvoice {
  id: ID;
  invoiceNumber: string;
  supplierId: ID;
  supplierName: string;
  supplierPoRef?: string;
  supplierPoId?: ID;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  amountPaid: number;
  currency: string;
  status: 'pending' | 'partial' | 'paid' | 'overdue' | 'disputed';
}

export interface PaymentRecord {
  id: ID;
  direction: 'inbound' | 'outbound';
  partyId: ID;
  partyName: string;
  date: string;
  amount: number;
  currency: string;
  mode: 'NEFT' | 'RTGS' | 'IMPS' | 'Cheque' | 'UPI' | 'Cash' | 'Other';
  reference: string;
  linkedInvoiceId?: ID;
  notes?: string;
}

// ── Onboarding ──
export type OnboardingStatus = 'not_started' | 'in_progress' | 'complete';

export interface OnboardingState {
  status: OnboardingStatus;
  completedSteps: number[];
  companyProfile?: {
    companyName: string;
    tradingName: string;
    businessType: 'manufacturing' | 'fabrication' | 'trading' | 'mixed';
    legalName: string;
    entityType: string;
    pan: string;
    registeredAddress: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
    email: string;
    financialYear: string;
    currency: string;
  };
  gstRegistrations?: Array<{
    gstin: string;
    state: string;
    type: string;
    notApplicable?: boolean;
  }>;
  sites?: Array<{
    id: string;
    name: string;
    type: 'factory' | 'warehouse' | 'office' | 'branch';
    address: string;
    city: string;
    state: string;
    isPrimary: boolean;
  }>;
  storeLocations?: Array<{
    siteId: string;
    name: string;
    code: string;
  }>;
}

// ── Invoice (AR) ──
export interface Invoice {
  id: ID;
  invoiceNumber: string;
  customerId: ID;
  customerName: string;
  poId: ID;
  poNumber: string;
  dispatchIds: ID[];
  dispatchNumbers?: string[];
  invoiceDate: string;
  dueDate: string;
  paymentTerms?: string;
  currency: string;
  status: 'draft' | 'issued' | 'partially_paid' | 'paid' | 'overdue' | 'disputed' | 'void' | 'cancelled';
  taxType?: 'CGST_SGST' | 'IGST' | 'Export_LUT';
  subtotal: number;
  discountAmount?: number;
  freightAmount?: number;
  otherCharges?: number;
  taxAmount: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  overdueDays?: number;
  createdBy: string;
  createdAt?: string;
  issuedDate?: string;
  issuedBy?: string;
  voidReason?: string;
  voidedAt?: string;
  voidedBy?: string;
  notes?: string;
  isSimulated?: boolean;
}

export interface InvoiceLine {
  id: ID;
  invoiceId: ID;
  poLineId?: ID;
  productId: ID;
  productName: string;
  drawingNumber: string;
  hsnSac?: string;
  quantity: number;
  uom: string;
  unitPrice: number;
  discountPct?: number;
  taxPct: number;
  taxableAmount?: number;
  taxAmount: number;
  lineTotal: number;
  dispatchId?: ID;
  dispatchNumber?: string;
}

// ── Payment (Customer Receipt AR) ──
export interface Payment {
  id: ID;
  paymentNumber: string;
  customerId: ID;
  customerName: string;
  receiptDate: string;
  currency: string;
  amount: number;
  paymentMethod: 'bank_transfer' | 'neft' | 'rtgs' | 'imps' | 'upi' | 'cheque' | 'cash' | 'other';
  transactionRef: string;
  receivingAccount: string;
  status: 'received' | 'allocated' | 'partially_allocated' | 'reversed';
  allocatedAmount: number;
  unallocatedAmount: number;
  isAdvance?: boolean;
  notes?: string;
  createdBy: string;
  reversedReason?: string;
  reversedAt?: string;
  reversedBy?: string;
  isSimulated?: boolean;
}

export interface PaymentAllocation {
  id: ID;
  paymentId: ID;
  paymentNumber?: string;
  invoiceId: ID;
  invoiceNumber: string;
  customerId?: ID;
  allocatedAmount: number;
  allocatedDate?: string;
  allocationDate?: string;
  allocatedBy?: string;
  notes?: string;
}

// ── Collection Activity ──
export interface CollectionActivity {
  id: ID;
  collectionNumber: string;
  customerId: ID;
  customerName: string;
  invoiceId: ID;
  invoiceNumber: string;
  assignedTo?: string;
  owner?: string;
  followUpDate: string;
  channel: string;
  notes?: string;
  promiseToPayDate?: string;
  promiseToPay?: string;
  nextFollowUpDate?: string;
  nextFollowUp?: string;
  outcome?: string;
  status: any;
  createdAt: string;
  history?: { date: string; action: string; by: string; notes?: string }[];
  outstandingAmount?: number;
  dueDate?: string;
}

// ── Extended Schema & Full Models ──
export interface SiteFull extends Site {
  type: 'Manufacturing' | 'Warehouse' | 'Fabrication' | 'Assembly' | 'Office';
  address: string;
  buildingPlot?: string;
  industrialArea?: string;
  district: string;
  state: string;
  country: string;
  pincode: string;
  siteManager: string;
  contactPhone: string;
  contactEmail: string;
  operationalStatus: 'active' | 'inactive' | 'under_construction';
  lat?: number;
  lng?: number;
}

export type RFQStatus =
  | 'draft' | 'open' | 'under_review' | 'quotation_in_progress'
  | 'quoted' | 'accepted' | 'rejected' | 'expired' | 'converted';

export interface RFQLine {
  id: ID;
  rfqId: ID;
  lineNumber: number;
  customerItemRef?: string;
  productId?: ID;
  productName: string;
  description: string;
  drawingNumber?: string;
  drawingRevision?: string;
  material?: string;
  grade?: string;
  dimensions?: string;
  tolerances?: string;
  qty: number;
  uom: string;
  requiredDate: string;
  targetPrice?: number;
  manufacturingReqs?: string;
  inspectionReqs?: string;
  certificationReqs?: string;
  packagingReqs?: string;
  technicalNotes?: string;
}

export interface RFQDocument {
  id: ID;
  rfqId: ID;
  rfqLineId?: ID;
  filename: string;
  docType: 'RFQ Document' | 'Drawing' | 'Specification' | 'BOM' | 'Image' | 'Quality Spec' | 'Other';
  version?: string;
  uploadedBy: string;
  uploadedAt: string;
  fileSize?: string;
  notes?: string;
}

export interface RFQClarification {
  id: ID;
  rfqId: ID;
  rfqLineId?: ID;
  reference: string;
  date: string;
  question: string;
  raisedBy: string;
  customerResponse?: string;
  responseDate?: string;
  status: 'open' | 'answered' | 'closed';
  notes?: string;
  relatedDoc?: string;
}

export interface CustomerRFQFull {
  id: ID;
  rfqNumber: string;
  title: string;
  customerId: ID;
  customerName: string;
  customerContactPerson?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerEnquiryRef?: string;
  customerProjectRef?: string;
  receivedDate: string;
  quotationDueDate?: string;
  requiredBy: string;
  channel: 'Email' | 'Portal' | 'Phone' | 'Meeting' | 'Other';
  priority: 'Low' | 'Normal' | 'High' | 'Urgent';
  owner: string;
  currency: string;
  deliveryLocation?: string;
  status: RFQStatus;
  requirementsSummary?: string;
  customerInstructions?: string;
  internalNotes?: string;
  applicableStandards?: string;
  materialStandards?: string;
  mtcRequired?: boolean;
  dimensionalInspection?: boolean;
  ndtRequired?: boolean;
  heatTreatment?: boolean;
  surfaceTreatment?: string;
  traceabilityRequired?: boolean;
  customerWitnessRequired?: boolean;
  requiredQualityDocs?: string;
  packagingPreservation?: string;
  specialQualityReqs?: string;
  deliveryTerms?: string;
  freightResponsibility?: string;
  paymentExpectation?: string;
  quoteValidityExpected?: string;
  priceExpectation?: string;
  specialCommercialConditions?: string;
  lines: RFQLine[];
  documents: RFQDocument[];
  clarifications: RFQClarification[];
  revisionNumber: number;
  quotationIds: ID[];
  convertedPoId?: ID;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export type QuotationStatus =
  | 'draft' | 'review' | 'issued' | 'accepted' | 'rejected' | 'expired' | 'superseded';

export interface QuotationLine {
  id: ID;
  quotationId: ID;
  rfqLineId?: ID;
  lineNumber: number;
  productName: string;
  description: string;
  drawingNumber?: string;
  drawingRevision?: string;
  qty: number;
  uom: string;
  unitPrice: number;
  discountPct?: number;
  taxPct: number;
  lineTotal: number;
  requiredDate: string;
  deliveryDays?: number;
  notes?: string;
}

export type PaymentMethod = 'NEFT' | 'RTGS' | 'IMPS' | 'Cheque' | 'Cash' | 'UPI' | 'Other';
export type PaymentStatus = 'pending' | 'cleared' | 'bounced' | 'cancelled';
export type CollectionStatus = 'pending' | 'contacted' | 'promise_to_pay' | 'disputed' | 'escalated' | 'resolved';

export interface CustomerPayment {
  id: ID;
  paymentNumber: string;
  customerId: ID;
  customerName: string;
  paymentDate: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  transactionRef: string;
  receivingAccount?: string;
  status: PaymentStatus;
  allocations: PaymentAllocation[];
  unallocatedAmount: number;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface DeliveryConfirmation {
  id: ID;
  dispatchId: ID;
  dispatchNumber: string;
  customerId: ID;
  deliveredDate: string;
  receivedBy?: string;
  podRef?: string;
  notes?: string;
  confirmedAt: string;
}

export interface PRLine {
  id: ID;
  prId: ID;
  materialItemId: ID;
  materialCode?: string;
  materialName: string;
  description?: string;
  grade?: string;
  requiredQty: number;
  uom: string;
  requiredDate: string;
  jobId?: ID;
  jobNumber?: string;
  stageId?: ID;
  stageName?: string;
  estimatedPrice?: number;
  justification?: string;
  notes?: string;
}

// ── Supplier Bills & Procure-to-Pay (AP) ──
export type SupplierBillStatus =
  | 'draft'
  | 'submitted'
  | 'matched'
  | 'mismatch'
  | 'pending_approval'
  | 'approved'
  | 'on_hold'
  | 'disputed'
  | 'rejected'
  | 'partially_paid'
  | 'paid'
  | 'overdue'
  | 'void';

export type ThreeWayMatchStatus =
  | 'matched'
  | 'qty_mismatch'
  | 'rate_mismatch'
  | 'missing_grn'
  | 'qc_pending'
  | 'partial';

export interface ThreeWayMatchLineResult {
  lineId: ID;
  description: string;
  materialItemId?: ID;
  poOrderedQty: number;
  poRate: number;
  grnReceivedQty: number;
  qcAcceptedQty: number;
  qcRejectedQty: number;
  billedQty: number;
  billedRate: number;
  uom: string;
  qtyVariance: number;
  rateVariance: number;
  amountVariance: number;
  status: 'matched' | 'qty_mismatch' | 'rate_mismatch' | 'qc_pending' | 'missing_grn';
  message: string;
}

export interface ThreeWayMatchSummary {
  overallStatus: ThreeWayMatchStatus;
  lines: ThreeWayMatchLineResult[];
  hasMismatch: boolean;
  totalVarianceAmount: number;
  summaryText: string;
}

export interface SupplierBillLine {
  id: ID;
  billId: ID;
  spoLineId?: ID;
  materialItemId?: ID;
  materialCode?: string;
  description: string;
  hsnSac?: string;
  billedQty: number;
  uom: string;
  unitRate: number;
  taxPct: number;
  taxAmount: number;
  lineTotal: number;
}

export interface SupplierBill {
  id: ID;
  billNumber: string;
  supplierInvoiceNo: string;
  supplierId: ID;
  supplierName: string;
  spoId?: ID;
  spoNumber?: string;
  grnIds: ID[];
  grnNumbers?: string[];
  billDate: string;
  receivedDate: string;
  dueDate: string;
  paymentTerms?: string;
  currency: string;
  status: SupplierBillStatus;
  matchStatus: ThreeWayMatchStatus;
  taxType?: 'CGST_SGST' | 'IGST';
  subtotal: number;
  taxAmount: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  otherCharges?: number;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  mismatchNotes?: string;
  holdReason?: string;
  rejectionReason?: string;
  voidReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdBy: string;
  notes?: string;
  isSimulated?: boolean;
}

export interface SupplierPayment {
  id: ID;
  paymentNumber: string;
  supplierId: ID;
  supplierName: string;
  paymentDate: string;
  currency: string;
  amount: number;
  paymentMethod: 'neft' | 'rtgs' | 'imps' | 'upi' | 'cheque' | 'bank_transfer' | 'cash' | 'other';
  transactionRef: string;
  payingAccount: string;
  status: 'recorded' | 'partially_allocated' | 'allocated' | 'reversed';
  allocatedAmount: number;
  unallocatedAmount: number;
  isAdvance?: boolean;
  notes?: string;
  createdBy: string;
  reversedReason?: string;
  reversedAt?: string;
  reversedBy?: string;
  isSimulated?: boolean;
}

export interface SupplierPaymentAllocation {
  id: ID;
  paymentId: ID;
  paymentNumber: string;
  billId: ID;
  billNumber: string;
  supplierInvoiceNo: string;
  supplierId: ID;
  allocatedAmount: number;
  allocatedDate: string;
  allocatedBy: string;
  notes?: string;
}

// ── Inbox / Business Communication Centre ──
export type InboxFolder = 'inbox' | 'unread' | 'needs_action' | 'sent' | 'archived';

export type InboxMessageStatus =
  | 'unread'
  | 'read'
  | 'action_required'
  | 'action_completed'
  | 'replied'
  | 'archived';

export type InboxMessageType =
  | 'supplier_po_amendment'
  | 'supplier_quotation'
  | 'supplier_po_confirmation'
  | 'supplier_delivery_extension'
  | 'cycle_count_variance'
  | 'stock_adjustment_request'
  | 'customer_rfq'
  | 'customer_quote_revision'
  | 'customer_delivery_query'
  | 'customer_payment_confirmation'
  | 'supplier_invoice'
  | 'general';

export interface InboxAttachment {
  id: ID;
  name: string;
  size: string;
  kind: 'pdf' | 'xlsx' | 'img' | 'doc';
}

export interface InboxThreadEntry {
  id: ID;
  senderName: string;
  senderRoleOrOrg: string;
  timestamp: string;
  body: string;
  isOutgoing?: boolean;
}

export interface InboxMessage {
  id: ID;
  type: InboxMessageType;
  senderName: string;
  senderEmail: string;
  senderOrg: string;
  recipientName: string;
  recipientEmail: string;
  subject: string;
  preview: string;
  body: string;
  timestamp: string;
  read: boolean;
  archived: boolean;
  direction: 'inbound' | 'outbound';
  status: InboxMessageStatus;
  actionRequired: boolean;
  actionCompleted?: boolean;
  actionOutcome?: 'approved' | 'rejected' | 'confirmed' | 'replied' | 'completed';
  module: 'Sales' | 'Procurement' | 'Inventory' | 'Dispatch' | 'Finance' | 'Quality';
  relatedEntityType:
    | 'CustomerRFQ'
    | 'CustomerQuotation'
    | 'CustomerPO'
    | 'PurchaseRequisition'
    | 'SupplierQuotation'
    | 'SupplierPO'
    | 'GoodsReceipt'
    | 'Dispatch'
    | 'CustomerInvoice'
    | 'SupplierBill'
    | 'InventoryItem';
  relatedEntityId: ID;
  relatedEntityRef: string;
  relatedPath: string;
  approvalRequestId?: ID;
  attachments?: InboxAttachment[];
  thread?: InboxThreadEntry[];
  metadata?: Record<string, string | number>;
}

