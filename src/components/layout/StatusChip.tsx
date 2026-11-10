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
  in_progress: { label: 'In Progress', cls: 'bg-[var(--info-bg)] text-[var(--info)]' },
  on_order: { label: 'On Order', cls: 'bg-[var(--info-bg)] text-[var(--info)]' },
  received: { label: 'Received', cls: 'bg-[var(--success-bg)] text-[var(--success)]' },
  dispatched: { label: 'Dispatched', cls: 'bg-[var(--success-bg)] text-[var(--success)]' },
  partial: { label: 'Partial', cls: 'bg-[var(--warning-bg)] text-[var(--warning)]' },
  cancelled: { label: 'Cancelled', cls: 'bg-[var(--surface-2)] text-[var(--text-3)]' },
  open: { label: 'Open', cls: 'bg-[var(--info-bg)] text-[var(--info)]' },
  under_review: { label: 'Under Review', cls: 'bg-[var(--warning-bg)] text-[var(--warning)]' },
  quotation_in_progress: { label: 'Quotation In Progress', cls: 'bg-[var(--info-bg)] text-[var(--info)]' },
  review: { label: 'Under Review', cls: 'bg-[var(--warning-bg)] text-[var(--warning)]' },
  closed: { label: 'Closed', cls: 'bg-[var(--surface-2)] text-[var(--text-2)]' },
  pass: { label: 'Pass', cls: 'bg-[var(--success-bg)] text-[var(--success)]' },
  fail: { label: 'Fail', cls: 'bg-[var(--error-bg)] text-[var(--error)]' },
  qc_hold: { label: 'QC Hold', cls: 'bg-[var(--hold-bg)] text-[var(--hold)]' },
  available: { label: 'Available', cls: 'bg-[var(--success-bg)] text-[var(--success)]' },
  reserved: { label: 'Reserved', cls: 'bg-[var(--warning-bg)] text-[var(--warning)]' },
  issued: { label: 'Issued', cls: 'bg-[var(--info-bg)] text-[var(--info)]' },
  converted: { label: 'Converted', cls: 'bg-[var(--success-bg)] text-[var(--success)]' },
  quoted: { label: 'Quoted', cls: 'bg-[var(--info-bg)] text-[var(--info)]' },
  lost: { label: 'Lost', cls: 'bg-[var(--surface-2)] text-[var(--text-3)]' },
  confirmed: { label: 'Confirmed', cls: 'bg-[var(--success-bg)] text-[var(--success)]' },
  revised: { label: 'Revised', cls: 'bg-[var(--warning-bg)] text-[var(--warning)]' },
  superseded: { label: 'Superseded', cls: 'bg-[var(--surface-2)] text-[var(--text-3)]' },
  sent: { label: 'Sent', cls: 'bg-[var(--info-bg)] text-[var(--info)]' },
  paid: { label: 'Paid', cls: 'bg-[var(--success-bg)] text-[var(--success)]' },
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
  return STATUS_MAP[status]?.label ?? status.replaceAll('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
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
