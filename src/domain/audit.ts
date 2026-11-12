import type { AuditChange, AuditEvent } from '../types';
import { formatDisplayDate, formatDisplayDateTime } from './dates';

export const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner / Managing Director',
  sales: 'Sales & Commercial',
  buyer: 'Procurement',
  storekeeper: 'Storekeeper / Inventory',
  qc: 'Quality Control',
  supervisor: 'Production Supervisor',
  operator: 'Shop Floor Operator',
  maintenance: 'Maintenance Engineering',
  dispatch: 'Logistics & Dispatch',
  finance: 'Finance & Accounts',
  auditor: 'Internal Audit / Reviewer',
};

const SCOPE_META: Record<string, { label: string; module: string; route: (id: string) => string }> = {
  Customer: { label: 'Customer', module: 'Master Data', route: (id) => `/sales/customers/${id}` },
  CustomerRFQ: { label: 'Customer RFQ', module: 'Sales', route: (id) => `/sales/rfq/${id}` },
  RFQ: { label: 'Customer RFQ', module: 'Sales', route: (id) => `/sales/rfq/${id}` },
  CustomerQuotation: { label: 'Customer Quotation', module: 'Sales', route: (id) => `/sales/quotation/${id}` },
  Quotation: { label: 'Customer Quotation', module: 'Sales', route: (id) => `/sales/quotation/${id}` },
  CustomerPO: { label: 'Customer PO', module: 'Sales', route: (id) => `/sales/po/${id}` },
  Supplier: { label: 'Supplier', module: 'Master Data', route: (id) => `/suppliers/${id}` },
  PurchaseRequisition: { label: 'Purchase Requisition', module: 'Procurement', route: (id) => `/procurement/pr/${id}` },
  PR: { label: 'Purchase Requisition', module: 'Procurement', route: (id) => `/procurement/pr/${id}` },
  SupplierInvitation: { label: 'Supplier Invitation', module: 'Procurement', route: (id) => `/procurement/pr/${id}` },
  SupplierQuotation: { label: 'Supplier Quotation', module: 'Procurement', route: (id) => `/procurement/quote/${id}` },
  SupplierPO: { label: 'Supplier PO', module: 'Procurement', route: (id) => `/procurement/spo/${id}` },
  GRN: { label: 'Goods Receipt (GRN)', module: 'Procurement', route: (id) => `/procurement/grn/${id}` },
  GoodsReceipt: { label: 'Goods Receipt (GRN)', module: 'Procurement', route: (id) => `/procurement/grn/${id}` },
  Lot: { label: 'Material Lot', module: 'Inventory', route: (id) => `/inventory/lot/${id}` },
  MaterialLot: { label: 'Material Lot', module: 'Inventory', route: (id) => `/inventory/lot/${id}` },
  Inventory: { label: 'Inventory', module: 'Inventory', route: () => `/inventory` },
  Material: { label: 'Material Item', module: 'Inventory', route: (id) => `/inventory/item/${id}` },
  Inspection: { label: 'Quality Inspection', module: 'Quality', route: (id) => `/quality/inspection/${id}` },
  NCR: { label: 'Non-Conformance (NCR)', module: 'Quality', route: (id) => `/quality/ncr/${id}` },
  Job: { label: 'Production Job', module: 'Production', route: (id) => `/jobs/${id}` },
  Dispatch: { label: 'Dispatch', module: 'Dispatch', route: (id) => `/dispatch/${id}` },
  Asset: { label: 'Asset', module: 'Maintenance', route: (id) => `/assets/${id}` },
  Maintenance: { label: 'Maintenance Event', module: 'Maintenance', route: (id) => `/assets/me/${id}` },
  CustomerInvoice: { label: 'Customer Invoice', module: 'Finance', route: (id) => `/finance/invoice/${id}` },
  CustomerPayment: { label: 'Customer Payment', module: 'Finance', route: (id) => `/finance/payment/${id}` },
  SupplierBill: { label: 'Supplier Bill', module: 'Finance', route: (id) => `/finance/bill/${id}` },
  SupplierPayment: { label: 'Supplier Payment', module: 'Finance', route: (id) => `/finance/supplier-payment/${id}` },
  Approval: { label: 'Approval Request', module: 'Approvals', route: () => `/admin` },
  Document: { label: 'Document', module: 'Documents', route: (id) => `/documents/${id}` },
  CompanyConfig: { label: 'Company Profile', module: 'Master Data', route: () => `/admin?tab=company` },
};

const FIELD_LABELS: Record<string, string> = {
  status: 'Status',
  availabilityStatus: 'Material Availability',
  totalValue: 'Order Value',
  totalAmount: 'Total Amount',
  paidAmount: 'Paid Amount',
  outstandingAmount: 'Outstanding Balance',
  allocatedAmount: 'Allocated Amount',
  unallocatedAmount: 'Unallocated Balance',
  paymentTerms: 'Payment Terms',
  deliveryTerms: 'Delivery Terms',
  expectedDelivery: 'Expected Delivery',
  dueDate: 'Due Date',
  invoiceDate: 'Invoice Date',
  billDate: 'Bill Date',
  acceptedDate: 'Accepted Date',
  confirmedDeliveryDate: 'Confirmed Delivery',
  actualDeliveryDate: 'Delivered Date',
  receivedByName: 'Received By',
  hasPoD: 'Proof of Delivery',
  podReference: 'PoD Reference',
  deliveryCondition: 'Delivery Condition',
  priority: 'Priority',
  owner: 'Owner',
  assignedTo: 'Assigned To',
  currentStage: 'Current Stage',
  materialReadiness: 'Material Readiness',
  currentReading: 'Operating Hours / Meter',
  lastServiceDate: 'Last Service Date',
  nextServiceDate: 'Next Service Date',
  creditLimit: 'Credit Limit',
  legalName: 'Legal Name',
  tradingName: 'Trading Name',
  gstin: 'GSTIN',
  panNumber: 'PAN',
  email: 'Email',
  phone: 'Phone',
  city: 'City',
  state: 'State',
  result: 'Inspection Result',
  acceptedQty: 'Accepted Qty',
  rejectedQty: 'Rejected Qty',
  receivedQty: 'Received Qty',
  orderedQty: 'Ordered Qty',
  reservedQty: 'Reserved Qty',
  shortageQty: 'Shortage Qty',
  disposition: 'Disposition',
  matchStatus: 'Three-Way Match',
  holdReason: 'Hold Reason',
  rejectionReason: 'Rejection Reason',
  voidReason: 'Void Reason',
  reversedReason: 'Reversal Reason',
  mismatchNotes: 'Mismatch Explanation',
  notes: 'Notes',
  remarks: 'Remarks',
  amendmentSummary: 'Amendment Summary',
  revision: 'Revision',
  supplierConfirmationStatus: 'Supplier Confirmation',
  supplierQuoteRef: 'Supplier Quote Ref',
  unitRate: 'Unit Rate',
  qty: 'Quantity',
  primaryQty: 'Lot Quantity',
  storeLocationName: 'Store Location',
  deliverToSiteName: 'Delivery Site',
};

const ACTION_LABELS: Record<string, string> = {
  create: 'Created',
  update: 'Updated',
  edit: 'Edited',
  approve: 'Approved',
  reject: 'Rejected',
  cancel: 'Cancelled',
  void: 'Voided',
  issue: 'Issued',
  submit: 'Submitted',
  send: 'Sent',
  accept: 'Accepted',
  decline: 'Declined',
  revise: 'Revised',
  amend: 'Amended',
  convert: 'Converted',
  select: 'Selected',
  confirm: 'Confirmed',
  receive: 'Received',
  allocate: 'Allocated',
  deallocate: 'Allocation Updated',
  reverse: 'Reversed',
  release: 'Released',
  hold: 'Placed on Hold',
  dispute: 'Disputed / Flagged',
  dispatch: 'Dispatched',
  deliver: 'Delivery Confirmed',
  close: 'Closed / Resolved',
  complete: 'Completed',
  assess_material_availability: 'Assessed Material Availability',
  stage_update: 'Stage Progress Updated',
  stage_skip: 'Stage Skipped',
  issue_material: 'Material Issued',
  return_request: 'Material Return Requested',
  return_accept: 'Material Return Accepted',
  return_reject: 'Material Return Rejected',
  transfer_create: 'Stock Transfer Initiated',
  transfer_receive: 'Stock Transfer Received',
  complete_incoming: 'Incoming Inspection Recorded',
  payment_recorded: 'Payment Recorded',
  email_sent: 'Email Simulated',
  renew: 'Renewed',
  archive: 'Archived',
  qc_available: 'QC Released to Stock',
  qc_scrapped: 'QC Rejected / Scrapped',
  reject_approval: 'Quote Rejected',
  draft_from_quotation: 'Draft PO Created',
  confirm_and_issue: 'Confirmed & Issued',
  supplier_confirmed: 'Supplier Confirmed',
  supplier_declined: 'Supplier Declined',
  notify_non_selected_suppliers: 'Suppliers Notified',
  create_direct: 'Direct Quotation Created',
};

const DEFAULT_ROLE_BY_ACTOR_ID: Record<string, string> = {
  'u-owner': 'owner',
  'u-sales': 'sales',
  'u-buyer': 'buyer',
  'u-store': 'storekeeper',
  'u-super': 'supervisor',
  'u-oper': 'operator',
  'u-qc': 'qc',
  'u-maint': 'maintenance',
  'u-disp': 'dispatch',
  'u-audit': 'auditor',
  'ext-tuv': 'qc',
};

export function formatRoleLabel(role?: string, actorId?: string): string {
  const effectiveRole = role || (actorId ? DEFAULT_ROLE_BY_ACTOR_ID[actorId] : undefined);
  if (!effectiveRole) return 'Operations';
  const normalized = effectiveRole.trim();
  if (ROLE_LABELS[normalized]) return ROLE_LABELS[normalized];
  if (Object.values(ROLE_LABELS).includes(normalized)) return normalized;
  return normalized.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function getAuditModule(scope: string, explicitModule?: string): string {
  if (explicitModule) return explicitModule;
  return SCOPE_META[scope]?.module ?? 'Operations';
}

export function getAuditScopeLabel(scope: string): string {
  return SCOPE_META[scope]?.label ?? scope.replace(/([a-z])([A-Z])/g, '$1 $2');
}

export function getAuditActionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action.replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function getAuditEntityRoute(scope: string, entityId: string): string | null {
  if (!entityId) return null;
  const meta = SCOPE_META[scope];
  return meta ? meta.route(entityId) : null;
}

function formatFieldLabel(field: string): string {
  if (FIELD_LABELS[field]) return FIELD_LABELS[field];
  return field
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function stringifyVal(val: unknown): string {
  if (val === undefined || val === null || val === '') return '—';
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  if (typeof val === 'number') return Number.isInteger(val) ? val.toLocaleString('en-IN') : String(val);
  if (Array.isArray(val)) return `${val.length} item${val.length === 1 ? '' : 's'}`;
  if (typeof val === 'object') {
    const entries = Object.entries(val as Record<string, unknown>).slice(0, 4);
    return entries.map(([k, v]) => `${formatFieldLabel(k)}: ${stringifyVal(v)}`).join(', ');
  }
  const str = String(val);
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return formatDisplayDate(str);
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(str)) return formatDisplayDateTime(str);
  if (/^[a-z0-9]+(_[a-z0-9]+)+$/.test(str)) {
    return str.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
  return str;
}

const SKIP_DIFF_KEYS = new Set([
  'id', 'stages', 'lines', 'lineItems', 'packages', 'linkedEntities', 'createdAt', 'updatedAt', 'actorId',
]);

export function diffRecordFields(
  before?: Record<string, unknown>,
  after?: Record<string, unknown>,
  customLabels?: Record<string, string>
): AuditChange[] {
  const b = before ?? {};
  const a = after ?? {};
  const keys = Array.from(new Set([...Object.keys(b), ...Object.keys(a)]));
  const changes: AuditChange[] = [];
  for (const key of keys) {
    if (SKIP_DIFF_KEYS.has(key)) continue;
    const prevRaw = b[key];
    const nextRaw = a[key];
    if (prevRaw === nextRaw) continue;
    if (prevRaw === undefined && nextRaw === undefined) continue;
    const prevStr = stringifyVal(prevRaw);
    const nextStr = stringifyVal(nextRaw);
    if (prevStr === nextStr) continue;
    changes.push({
      field: key,
      label: customLabels?.[key] ?? formatFieldLabel(key),
      previousValue: prevRaw === undefined ? '—' : prevStr,
      newValue: nextStr,
    });
  }
  return changes;
}

export function extractEventChanges(event: AuditEvent): AuditChange[] {
  if (event.changes && event.changes.length > 0) return event.changes;
  if (!event.before && !event.after) return [];
  return diffRecordFields(event.before, event.after);
}

export function createAuditEventRecord(params: {
  id?: string;
  actor: string;
  actorId: string;
  role?: string;
  module?: string;
  scope: string;
  action: string;
  entityId: string;
  entityRef: string;
  timestamp?: string;
  source?: 'ui' | 'api' | 'system';
  description?: string;
  changes?: AuditChange[];
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  reason?: string;
  correlationRef?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  relatedEntityRef?: string;
}): AuditEvent {
  const changes = params.changes ?? (params.before || params.after ? diffRecordFields(params.before, params.after) : undefined);
  return {
    id: params.id ?? `ae-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    actor: params.actor,
    actorId: params.actorId,
    role: params.role ? formatRoleLabel(params.role) : undefined,
    module: getAuditModule(params.scope, params.module),
    scope: params.scope,
    action: params.action,
    entityId: params.entityId,
    entityRef: params.entityRef,
    timestamp: params.timestamp ?? new Date().toISOString(),
    source: params.source ?? 'ui',
    description: params.description,
    changes: changes && changes.length > 0 ? changes : undefined,
    before: params.before,
    after: params.after,
    reason: params.reason,
    correlationRef: params.correlationRef,
    relatedEntityType: params.relatedEntityType,
    relatedEntityId: params.relatedEntityId,
    relatedEntityRef: params.relatedEntityRef,
  };
}
