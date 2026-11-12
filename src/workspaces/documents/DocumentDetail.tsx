import React, { useState } from 'react';
import { ArrowLeft, FileText, ExternalLink, RefreshCw, Archive, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../store';
import { computeDocumentExpiry } from '../../domain/documentExpiry';
import { DEMO_NOW } from '../../data/seed';
import { formatDisplayDate } from '../../domain/dates';
import StatusChip from '../../components/layout/StatusChip';
import RecordHistoryPanel from '../../components/workflow/RecordHistoryPanel';
import { RenewDocumentModal } from './Documents';

export default function DocumentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    documents, suppliers, customers, jobs, assets, customerPos, supplierPos,
    purchaseReqs, inspections, dispatches, invoices, grns, maintenanceEvents,
    currentUser, renewDocument, archiveDocument, showToast,
  } = useStore();
  const document = documents.find(doc => doc.id === id);
  const [showRenew, setShowRenew] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [archiveReason, setArchiveReason] = useState('');

  if (!document) {
    return (
      <div className="p-8 text-center text-sm" style={{ color: 'var(--text-2)' }}>
        Document not found.{' '}
        <button type="button" onClick={() => navigate('/documents')} className="underline" style={{ color: 'var(--brand)' }}>
          Back to Document Vault
        </button>
      </div>
    );
  }

  const expiry = computeDocumentExpiry(document, new Date(DEMO_NOW));
  const isArchived = document.status === 'archived';
  const canManage = ['owner', 'buyer', 'qc'].includes(currentUser.role);

  const resolveLinkedPath = (entity: { type: string; ref: string }): string | null => {
    const t = entity.type.toLowerCase();
    const refLower = entity.ref.toLowerCase();
    if (t.includes('supplier') && !t.includes('po')) {
      const m = suppliers.find(s => s.id.toLowerCase() === refLower || s.tradingName.toLowerCase() === refLower || s.legalName.toLowerCase() === refLower);
      return m ? `/suppliers/${m.id}` : '/suppliers';
    }
    if (t.includes('customer') && !t.includes('po') && !t.includes('invoice')) {
      const m = customers.find(c => c.id.toLowerCase() === refLower || c.tradingName.toLowerCase() === refLower || c.legalName.toLowerCase() === refLower);
      return m ? `/sales/customers/${m.id}` : '/sales';
    }
    if (t === 'job' || refLower.startsWith('j-')) {
      const m = jobs.find(j => j.id.toLowerCase() === refLower || j.jobNumber.toLowerCase() === refLower);
      return m ? `/jobs/${m.id}` : '/jobs';
    }
    if (t === 'asset' || t.includes('machine')) {
      const m = assets.find(a => a.id.toLowerCase() === refLower || refLower.startsWith(a.assetCode.toLowerCase()) || a.name.toLowerCase() === refLower);
      return m ? `/assets/${m.id}` : '/assets';
    }
    if (t.includes('maintenance') || refLower.startsWith('me-')) {
      const m = maintenanceEvents.find(me => me.id.toLowerCase() === refLower || me.eventNumber.toLowerCase() === refLower);
      return m ? `/assets/me/${m.id}` : '/assets';
    }
    if (t.includes('customer po') || refLower.startsWith('cpo-')) {
      const m = customerPos.find(po => po.id.toLowerCase() === refLower || po.poNumber.toLowerCase() === refLower);
      return m ? `/sales/po/${m.id}` : '/sales';
    }
    if (t.includes('supplier po') || refLower.startsWith('spo-')) {
      const m = supplierPos.find(spo => spo.id.toLowerCase() === refLower || spo.poNumber.toLowerCase() === refLower);
      return m ? `/procurement/spo/${m.id}` : '/procurement';
    }
    if (t.includes('requisition') || t === 'pr' || refLower.startsWith('pr-')) {
      const m = purchaseReqs.find(pr => pr.id.toLowerCase() === refLower || pr.prNumber.toLowerCase() === refLower);
      return m ? `/procurement/pr/${m.id}` : '/procurement';
    }
    if (t.includes('inspection') || refLower.startsWith('ins')) {
      const m = inspections.find(i => i.id.toLowerCase() === refLower || i.inspectionNumber.toLowerCase() === refLower);
      return m ? `/quality/inspection/${m.id}` : '/quality';
    }
    if (t.includes('grn') || refLower.startsWith('grn-')) {
      const m = grns.find(g => g.id.toLowerCase() === refLower || g.grnNumber.toLowerCase() === refLower);
      return m ? `/procurement/grn/${m.id}` : '/procurement';
    }
    if (t.includes('dispatch') || refLower.startsWith('dsp-')) {
      const m = dispatches.find(d => d.id.toLowerCase() === refLower || d.dispatchNumber.toLowerCase() === refLower);
      return m ? `/dispatch/${m.id}` : '/dispatch';
    }
    if (t.includes('invoice') || refLower.startsWith('inv-')) {
      const m = invoices.find(i => i.id.toLowerCase() === refLower || i.invoiceNumber.toLowerCase() === refLower);
      return m ? `/finance/invoice/${m.id}` : '/finance';
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 px-6 py-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="flex items-center gap-2 text-xs mb-3" style={{ color: 'var(--text-3)' }}>
          <button type="button" onClick={() => navigate('/documents')} className="hover:underline" style={{ color: 'var(--brand)' }}>
            Document Vault
          </button>
          <span>›</span>
          <span style={{ color: 'var(--text)' }}>{document.title}</span>
        </div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <button type="button" onClick={() => navigate('/documents')} className="mt-0.5 p-1.5 rounded-lg hover:opacity-70" style={{ color: 'var(--text-3)' }} aria-label="Back to Document Vault">
              <ArrowLeft size={16} />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>{document.title}</h1>
                {isArchived && <StatusChip status="archived" size="sm" />}
                {document.certStatus && <StatusChip status={document.certStatus} size="sm" />}
                {!isArchived && expiry.status === 'expired' && <StatusChip status="expired" size="sm" />}
                {!isArchived && expiry.status === 'expiring' && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--warning-bg,#FFFBEB)', color: 'var(--warning,#D97706)' }}>
                    Expiring in {expiry.daysToExpiry}d
                  </span>
                )}
              </div>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-2)' }}>{document.docType} · {document.category}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {canManage && !isArchived && document.status !== 'superseded' && (
              <button
                type="button"
                onClick={() => setShowRenew(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-white"
                style={{ background: 'var(--brand-fill)' }}
              >
                <RefreshCw size={13} /> Renew
              </button>
            )}
            {canManage && !isArchived && (
              <button
                type="button"
                onClick={() => setShowArchive(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium"
                style={{ borderColor: 'var(--border)', color: 'var(--error,#DC2626)' }}
              >
                <Archive size={13} /> Archive
              </button>
            )}
            <button type="button" onClick={() => navigate('/documents')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium" style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}>
              <ExternalLink size={13} /> Document Vault
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl space-y-5">
          {isArchived && (
            <div className="rounded-xl border p-4 text-sm" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)', color: 'var(--text-2)' }}>
              <strong style={{ color: 'var(--text)' }}>Archived</strong> on {formatDisplayDate(document.archivedAt)} by {document.archivedBy ?? 'System'}
              {document.archiveReason && <> — Reason: {document.archiveReason}</>}
            </div>
          )}

          <div className="rounded-xl border p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--surface-2)' }}>
                <FileText size={22} style={{ color: 'var(--brand)' }} />
              </div>
              <div>
                <div className="font-semibold" style={{ color: 'var(--text)' }}>{document.title}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
                  {document.fileName ? `${document.fileName} · ` : ''}{document.fileSize} · Version {document.version}
                </div>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
              <Detail label="Document type" value={document.docType} />
              <Detail label="Category" value={document.category} />
              <Detail label="Uploaded by" value={document.uploadedBy} />
              <Detail label="Uploaded on" value={formatDisplayDate(document.uploadedAt)} />
              <Detail label="Issue date" value={formatDisplayDate(document.issueDate)} />
              <Detail label="Expiry date" value={formatDisplayDate(document.expiryDate)} />
              {document.reminderDays !== undefined && (
                <Detail label="Renewal reminder" value={`${document.reminderDays} days before expiry`} />
              )}
            </dl>
          </div>

          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <div className="px-4 py-3 border-b text-sm font-semibold" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)', color: 'var(--text)' }}>
              Linked records
            </div>
            <div className="p-4">
              {document.linkedEntities.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--text-3)' }}>No linked records.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {document.linkedEntities.map(entity => {
                    const path = resolveLinkedPath(entity);
                    return path ? (
                      <button
                        key={`${entity.type}-${entity.ref}`}
                        type="button"
                        onClick={() => navigate(path)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium hover:underline"
                        style={{ borderColor: 'var(--border)', color: 'var(--brand)', background: 'var(--surface-2)' }}
                      >
                        {entity.type}: {entity.ref}
                        <ExternalLink size={11} />
                      </button>
                    ) : (
                      <span key={`${entity.type}-${entity.ref}`} className="px-3 py-1.5 rounded-lg border text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}>
                        {entity.type}: {entity.ref}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border p-4 text-sm" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)', color: 'var(--text-2)' }}>
            Prototype simulation: file metadata, expiry alerts, and renewal versions are tracked locally; real file storage is not connected.
          </div>

          <RecordHistoryPanel
            entityId={document.id}
            entityRef={document.title}
            title="Document Activity & Audit Trail"
            subtitle="Uploads, versions, renewals, archiving, and linked entity associations"
          />
        </div>
      </div>

      {showRenew && (
        <RenewDocumentModal
          doc={document}
          currentUser={currentUser}
          onClose={() => setShowRenew(false)}
          onSave={(payload) => {
            renewDocument(document.id, payload);
            showToast({ type: 'success', title: 'Document renewed', body: `${document.title} renewed until ${formatDisplayDate(payload.expiryDate)}.` });
            setShowRenew(false);
          }}
        />
      )}

      {showArchive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-[var(--text)]">Archive Document</h3>
              <button onClick={() => setShowArchive(false)}><X size={16} className="text-[var(--text-3)]" /></button>
            </div>
            <p className="text-xs mb-3" style={{ color: 'var(--text-2)' }}>
              Archiving removes <strong>{document.title}</strong> from active alerts and expiry reminders while preserving its full audit history.
            </p>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Archive reason *</label>
            <textarea
              rows={3}
              className="eoss-input w-full text-sm"
              value={archiveReason}
              onChange={e => setArchiveReason(e.target.value)}
              placeholder="e.g. Superseded by new plant certificate, contract ended…"
            />
            <div className="flex gap-3 mt-5">
              <button type="button" onClick={() => setShowArchive(false)} className="flex-1 py-2.5 border border-[var(--border)] rounded-xl text-sm text-[var(--text-2)]">
                Cancel
              </button>
              <button
                type="button"
                disabled={!archiveReason.trim()}
                onClick={() => {
                  archiveDocument(document.id, archiveReason.trim(), currentUser.name);
                  showToast({ type: 'info', title: 'Document archived', body: `${document.title} has been archived.` });
                  setShowArchive(false);
                }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: 'var(--error,#DC2626)' }}
              >
                Archive Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs" style={{ color: 'var(--text-3)' }}>{label}</dt>
      <dd className="text-sm mt-0.5 font-medium" style={{ color: 'var(--text)' }}>{value}</dd>
    </div>
  );
}
