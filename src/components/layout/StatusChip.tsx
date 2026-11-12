import React from 'react';
import clsx from 'clsx';
import type { StatusKey } from '../../types';

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  draft: { label: 'Draft', cls: 'bg-[var(--surface-2)] text-[var(--text-2)]' },
  pending: { label: 'Pending', cls: 'bg-[var(--warning-bg)] text-[var(--warning)]' },
  pending_approval: { label: 'Pending Approval', cls: 'bg-[var(--warning-bg)] text-[var(--warning)]' },
  active: { label: 'Active', cls: 'bg-[var(--info-bg)] text-[var(--info)]' },
  inactive: { label: 'Inactive', cls: 'bg-[var(--surface-2)] text-[var(--text-3)]' },
  hold: { label: 'On Hold', cls: 'bg-[var(--hold-bg)] text-[var(--hold)]' },
  warning: { label: 'Warning', cls: 'bg-[var(--warning-bg)] text-[var(--warning)]' },
  complete: { label: 'Complete', cls: 'bg-[var(--success-bg)] text-[var(--success)]' },
  failed: { label: 'Failed', cls: 'bg-[var(--error-bg)] text-[var(--error)]' },
  overdue: { label: 'Overdue', cls: 'bg-[var(--error-bg)] text-[var(--error)]' },
  expired: { label: 'Expired', cls: 'bg-[var(--error-bg)] text-[var(--error)]' },
  archived: { label: 'Archived', cls: 'bg-[var(--surface-2)] text-[var(--text-3)]' },
  approved: { label: 'Approved', cls: 'bg-[var(--success-bg)] text-[var(--success)]' },
  rejected: { label: 'Rejected', cls: 'bg-[var(--error-bg)] text-[var(--error)]' },
  accepted: { label: 'Accepted', cls: 'bg-[var(--success-bg)] text-[var(--success)]' },
  in_progress: { label: 'In Progress', cls: 'bg-[var(--info-bg)] text-[var(--info)]' },
  on_order: { label: 'On Order', cls: 'bg-[var(--info-bg)] text-[var(--info)]' },
  received: { label: 'Received', cls: 'bg-[var(--success-bg)] text-[var(--success)]' },
  dispatched: { label: 'Dispatched', cls: 'bg-[var(--success-bg)] text-[var(--success)]' },
  partial: { label: 'Partial', cls: 'bg-[var(--warning-bg)] text-[var(--warning)]' },
  cancelled: { label: 'Cancelled', cls: 'bg-[var(--surface-2)] text-[var(--text-3)]' },
  open: { label: 'Open', cls: 'bg-[var(--info-bg)] text-[var(--info)]' },
  scheduled: { label: 'Scheduled', cls: 'bg-[var(--info-bg)] text-[var(--info)]' },
  in_transit: { label: 'In Transit', cls: 'bg-[var(--warning-bg)] text-[var(--warning)]' },
  pending_inspection: { label: 'Pending Inspection', cls: 'bg-[var(--warning-bg)] text-[var(--warning)]' },
  under_review: { label: 'Under Review', cls: 'bg-[var(--warning-bg)] text-[var(--warning)]' },
  quotation_in_progress: { label: 'Quotation In Progress', cls: 'bg-[var(--info-bg)] text-[var(--info)]' },
  awaiting_quotation: { label: 'Awaiting Quotation', cls: 'bg-[var(--warning-bg)] text-[var(--warning)]' },
  quotation_received: { label: 'Quotation Received', cls: 'bg-[var(--info-bg)] text-[var(--info)]' },
  ready_to_send: { label: 'Ready To Send', cls: 'bg-[var(--surface-2)] text-[var(--text-2)]' },
  declined: { label: 'Declined', cls: 'bg-[var(--error-bg)] text-[var(--error)]' },
  no_response: { label: 'No Response', cls: 'bg-[var(--surface-2)] text-[var(--text-3)]' },
  not_selected: { label: 'Not Selected', cls: 'bg-[var(--surface-2)] text-[var(--text-3)]' },
  approval_rejected: { label: 'Approval Rejected', cls: 'bg-[var(--error-bg)] text-[var(--error)]' },
  approved_for_po: { label: 'Approved For PO', cls: 'bg-[var(--success-bg)] text-[var(--success)]' },
  po_drafted: { label: 'PO Drafted', cls: 'bg-[var(--warning-bg)] text-[var(--warning)]' },
  po_issued: { label: 'PO Issued', cls: 'bg-[var(--info-bg)] text-[var(--info)]' },
  awaiting_supplier_confirmation: { label: 'Awaiting Supplier Confirmation', cls: 'bg-[var(--warning-bg)] text-[var(--warning)]' },
  supplier_accepted: { label: 'Supplier Accepted', cls: 'bg-[var(--success-bg)] text-[var(--success)]' },
  supplier_declined: { label: 'Supplier Declined', cls: 'bg-[var(--error-bg)] text-[var(--error)]' },
  direct_order: { label: 'Direct Order', cls: 'bg-[var(--info-bg)] text-[var(--info)]' },
  review: { label: 'Under Review', cls: 'bg-[var(--warning-bg)] text-[var(--warning)]' },
  closed: { label: 'Closed', cls: 'bg-[var(--surface-2)] text-[var(--text-2)]' },
  pass: { label: 'Pass', cls: 'bg-[var(--success-bg)] text-[var(--success)]' },
  fail: { label: 'Fail', cls: 'bg-[var(--error-bg)] text-[var(--error)]' },
  qc_hold: { label: 'Quality Hold', cls: 'bg-[var(--hold-bg)] text-[var(--hold)]' },
  quality_hold: { label: 'Quality Hold', cls: 'bg-[var(--hold-bg)] text-[var(--hold)]' },
  available: { label: 'Available', cls: 'bg-[var(--success-bg)] text-[var(--success)]' },
  ready: { label: 'Available', cls: 'bg-[var(--success-bg)] text-[var(--success)]' },
  partially_available: { label: 'Partially Available', cls: 'bg-[var(--warning-bg)] text-[var(--warning)]' },
  awaiting_procurement: { label: 'Awaiting Procurement', cls: 'bg-[var(--info-bg)] text-[var(--info)]' },
  awaiting_grn: { label: 'Awaiting goods receipt', cls: 'bg-[var(--info-bg)] text-[var(--info)]' },
  not_assessed: { label: 'Not Assessed', cls: 'bg-[var(--surface-2)] text-[var(--text-2)]' },
  reserved: { label: 'Reserved', cls: 'bg-[var(--warning-bg)] text-[var(--warning)]' },
  issued: { label: 'Issued', cls: 'bg-[var(--info-bg)] text-[var(--info)]' },
  converted: { label: 'Converted', cls: 'bg-[var(--success-bg)] text-[var(--success)]' },
  quoted: { label: 'Quoted', cls: 'bg-[var(--info-bg)] text-[var(--info)]' },
  selected: { label: 'Selected', cls: 'bg-[var(--success-bg)] text-[var(--success)]' },
  lost: { label: 'Lost', cls: 'bg-[var(--surface-2)] text-[var(--text-3)]' },
  confirmed: { label: 'Confirmed', cls: 'bg-[var(--success-bg)] text-[var(--success)]' },
  revised: { label: 'Revised', cls: 'bg-[var(--warning-bg)] text-[var(--warning)]' },
  superseded: { label: 'Superseded', cls: 'bg-[var(--surface-2)] text-[var(--text-3)]' },
  sent: { label: 'Sent', cls: 'bg-[var(--info-bg)] text-[var(--info)]' },
  paid: { label: 'Paid', cls: 'bg-[var(--success-bg)] text-[var(--success)]' },
  partially_paid: { label: 'Partially Paid', cls: 'bg-[var(--warning-bg)] text-[var(--warning)]' },
  disputed: { label: 'Disputed', cls: 'bg-[var(--error-bg)] text-[var(--error)]' },
  void: { label: 'Void', cls: 'bg-[var(--surface-2)] text-[var(--text-3)]' },
  on_hold: { label: 'On Hold', cls: 'bg-[var(--hold-bg)] text-[var(--hold)]' },
  submitted: { label: 'Submitted', cls: 'bg-[var(--info-bg)] text-[var(--info)]' },
  matched: { label: 'Matched', cls: 'bg-[var(--success-bg)] text-[var(--success)]' },
  mismatch: { label: 'Mismatch', cls: 'bg-[var(--error-bg)] text-[var(--error)]' },
  qty_mismatch: { label: 'Qty Mismatch', cls: 'bg-[var(--error-bg)] text-[var(--error)]' },
  rate_mismatch: { label: 'Rate Mismatch', cls: 'bg-[var(--warning-bg)] text-[var(--warning)]' },
  missing_grn: { label: 'Missing GRN', cls: 'bg-[var(--error-bg)] text-[var(--error)]' },
  qc_pending: { label: 'QC Pending', cls: 'bg-[var(--warning-bg)] text-[var(--warning)]' },
  allocated: { label: 'Allocated', cls: 'bg-[var(--success-bg)] text-[var(--success)]' },
  partially_allocated: { label: 'Partially Allocated', cls: 'bg-[var(--warning-bg)] text-[var(--warning)]' },
  unallocated: { label: 'Unallocated', cls: 'bg-[var(--info-bg)] text-[var(--info)]' },
  recorded: { label: 'Recorded', cls: 'bg-[var(--info-bg)] text-[var(--info)]' },
  reversed: { label: 'Reversed', cls: 'bg-[var(--error-bg)] text-[var(--error)]' },
  delivery_confirmed: { label: 'Delivery Confirmed', cls: 'bg-[var(--success-bg)] text-[var(--success)]' },
  delayed: { label: 'Delayed', cls: 'bg-[var(--error-bg)] text-[var(--error)]' },
  pending_qc: { label: 'Pending QC', cls: 'bg-[var(--warning-bg)] text-[var(--warning)]' },
  delivered: { label: 'Delivered', cls: 'bg-[var(--success-bg)] text-[var(--success)]' },
  pending_docs: { label: 'Pending Docs', cls: 'bg-[var(--warning-bg)] text-[var(--warning)]' },
  breakdown: { label: 'Breakdown', cls: 'bg-[var(--error-bg)] text-[var(--error)]' },
  in_maintenance: { label: 'In Maintenance', cls: 'bg-[var(--hold-bg)] text-[var(--hold)]' },
  pm_overdue: { label: 'PM Overdue', cls: 'bg-[var(--warning-bg)] text-[var(--warning)]' },
  operational: { label: 'Operational', cls: 'bg-[var(--success-bg)] text-[var(--success)]' },
  retired: { label: 'Retired', cls: 'bg-[var(--surface-2)] text-[var(--text-3)]' },
  shortage: { label: 'Shortage', cls: 'bg-[var(--error-bg)] text-[var(--error)]' },
  verified: { label: 'Verified', cls: 'bg-[var(--success-bg)] text-[var(--success)]' },
  ai_extracted: { label: 'AI Extracted', cls: 'bg-[var(--info-bg)] text-[var(--info)]' },
  missing: { label: 'Missing', cls: 'bg-[var(--error-bg)] text-[var(--error)]' },
  none: { label: '—', cls: 'bg-[var(--surface-2)] text-[var(--text-3)]' },
  rework: { label: 'Rework', cls: 'bg-[var(--warning-bg)] text-[var(--warning)]' },
  scrapped: { label: 'Scrapped', cls: 'bg-[var(--surface-2)] text-[var(--text-3)]' },
  urgent: { label: 'Urgent', cls: 'bg-[var(--error-bg)] text-[var(--error)]' },
  high: { label: 'High', cls: 'bg-[var(--warning-bg)] text-[var(--warning)]' },
  normal: { label: 'Normal', cls: 'bg-[var(--info-bg)] text-[var(--info)]' },
  low: { label: 'Low', cls: 'bg-[var(--surface-2)] text-[var(--text-2)]' },
};

export function getStatusLabel(status: string) {
  return STATUS_MAP[status]?.label ?? status.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
}

interface Props {
  status: string;
  label?: string;
  size?: 'sm' | 'md';
  dot?: boolean;
}

export default function StatusChip({ status, label, size = 'md', dot = false }: Props) {
  const cfg = STATUS_MAP[status] ?? { label: status, cls: 'bg-[var(--surface-2)] text-[var(--text-2)]' };
  const displayLabel = label ?? cfg.label;
  return (
    <span className={clsx(
      'inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap',
      size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-0.5 text-xs',
      cfg.cls
    )}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {displayLabel}
    </span>
  );
}
