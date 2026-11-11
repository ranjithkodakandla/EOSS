import React, { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, XCircle, Pencil, Plus, Send, Sparkles,
  Scale, FileText, Truck, Award, Paperclip
} from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';
import RelatedRecordsPanel from '../../components/workflow/RelatedRecordsPanel';
import { compareAndRecommendQuotations } from '../../domain/quotationComparison';
import { useReturnNavigation } from '../../hooks/useReturnNavigation';
import type { SupplierQuotation } from '../../types';

const fmt = (d?: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const fmtMoney = (n: number) => n ? `₹${Math.round(n).toLocaleString('en-IN')}` : '—';

function quoteTotal(q: SupplierQuotation) {
  return q.lines.reduce((sum, l) => {
    const qty = l.quotedQty ?? l.orderedQty ?? 1;
    const rate = l.unitPrice ?? l.unitRate ?? 0;
    const base = l.lineTotal || qty * rate;
    const tax = l.taxPct ? base * (l.taxPct / 100) : 0;
    return sum + base + tax;
  }, 0) + (q.taxAmount ?? 0) + (q.deliveryCharges ?? 0) - (q.discountAmount ?? 0);
}

export default function PRDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    purchaseReqs, supplierQuotations, supplierInvitations, supplierPos, grns, suppliers, currentUser,
    updatePurchaseReq, updateSupplierInvitation, selectQuotation,
    approveFinalizeQuotation, rejectQuotationApproval, generateSPOFromQuotation, showToast,
  } = useStore();
  const { goBack, originUrl } = useReturnNavigation('/procurement?tab=pr');

  const pr = purchaseReqs.find(p => p.id === id);
  const [confirming, setConfirming] = useState<'approve' | 'reject' | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [showCompare, setShowCompare] = useState(true);
  const [chosenQuoteId, setChosenQuoteId] = useState<string>('');
  const [overrideReason, setOverrideReason] = useState('');
  const [rejectQuoteModal, setRejectQuoteModal] = useState<SupplierQuotation | null>(null);
  const [quoteRejectReason, setQuoteRejectReason] = useState('');

  if (!pr) {
    return (
      <div className="p-8 text-center text-sm text-[var(--text-2)]">
        PR not found. <Link to="/procurement?tab=pr" className="text-[var(--brand)] underline">Back</Link>
      </div>
    );
  }

  const canApprove = ['owner', 'buyer'].includes(currentUser.role);
  const canEditPr = ['owner', 'buyer', 'supervisor'].includes(currentUser.role) && !['converted', 'cancelled'].includes(pr.status);
  const lines = pr.lines ?? [];
  const totalEstValue = lines.reduce((s, l) => s + (l.estimatedPrice ?? 0) * (l.requiredQty ?? 0), 0);

  const prQuotations = supplierQuotations.filter(q => q.prId === pr.id);
  const prInvitations = supplierInvitations.filter(i => i.prId === pr.id);
  const selectedQuotation = prQuotations.find(q => q.status === 'selected');
  const linkedSpo = supplierPos.find(s => s.prId === pr.id && !['cancelled', 'supplier_declined'].includes(s.status));
  const linkedGrns = linkedSpo ? grns.filter(g => g.spoId === linkedSpo.id) : [];

  const minQuoteTotal = prQuotations.length > 0 ? Math.min(...prQuotations.map(quoteTotal)) : 0;
  const minDeliveryDays = prQuotations.length > 0 ? Math.min(...prQuotations.map(q => q.deliveryDays)) : 0;

  const prComparison = useMemo(
    () => (prQuotations.length >= 2 ? compareAndRecommendQuotations(pr, prQuotations, suppliers, supplierPos) : null),
    [pr, prQuotations, suppliers, supplierPos],
  );
  const effectiveWinnerId = chosenQuoteId || selectedQuotation?.id || prComparison?.recommendedQuoteId || prQuotations[0]?.id || '';
  const isOverridingRec = Boolean(prComparison?.recommendedQuoteId && effectiveWinnerId && effectiveWinnerId !== prComparison.recommendedQuoteId);

  const handleApprove = () => {
    updatePurchaseReq(pr.id, { status: 'approved' });
    showToast({ type: 'success', title: 'PR Approved', body: `${pr.prNumber} approved.` });
    setConfirming(null);
  };

  const handleReject = () => {
    updatePurchaseReq(pr.id, { status: 'rejected' });
    showToast({ type: 'info', title: 'PR Rejected', body: rejectNote || 'Requirement rejected.' });
    setConfirming(null);
  };

  const handleSelectQuote = (quoteId: string) => {
    if (linkedSpo) {
      showToast({ type: 'warning', title: 'PO already created', body: `Supplier PO ${linkedSpo.poNumber} is already linked to ${pr.prNumber}.` });
      return;
    }
    if (isOverridingRec && quoteId === effectiveWinnerId && !overrideReason.trim()) {
      showToast({ type: 'warning', title: 'Override reason required', body: 'Please enter an override reason before approving a non-recommended quote.' });
      return;
    }
    if (isOverridingRec && quoteId === effectiveWinnerId && overrideReason.trim()) {
      selectQuotation(quoteId, overrideReason.trim());
    }
    approveFinalizeQuotation(quoteId, currentUser.name, overrideReason.trim() || undefined);
    const chosen = prQuotations.find(q => q.id === quoteId);
    showToast({ type: 'success', title: 'Quotation finalized', body: `${chosen?.quoteNumber} (${chosen?.supplierName}) approved for PO.` });
  };

  const handleGenerateSpo = (quoteId: string) => {
    const qObj = prQuotations.find(q => q.id === quoteId);
    if (qObj && qObj.status !== 'selected') {
      if (isOverridingRec && quoteId === effectiveWinnerId && !overrideReason.trim()) {
        showToast({ type: 'warning', title: 'Override reason required', body: 'Please enter an override reason first.' });
        return;
      }
      if (overrideReason.trim()) selectQuotation(quoteId, overrideReason.trim());
      approveFinalizeQuotation(quoteId, currentUser.name, overrideReason.trim() || undefined);
    }
    const res = generateSPOFromQuotation(quoteId);
    if (res.error && !res.spo) {
      showToast({ type: 'error', title: 'Cannot create Supplier PO', body: res.error });
      return;
    }
    if (res.error) {
      showToast({ type: 'warning', title: 'Duplicate prevented', body: res.error });
    }
    if (res.spo) {
      navigate(`/procurement/spo/${res.spo.id}`, { state: { from: originUrl } });
    }
  };

  const priorityColor: Record<string, string> = {
    urgent: 'var(--error,#DC2626)',
    high: 'var(--warning,#D97706)',
    normal: 'var(--brand)',
    low: 'var(--text-2)',
  };

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="flex-shrink-0 px-6 py-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="flex items-start gap-3 flex-wrap">
          <button type="button" onClick={() => goBack()} className="p-1.5 rounded-lg hover:bg-[var(--surface-2)] mt-0.5">
            <ArrowLeft size={18} className="text-[var(--text-2)]" />
          </button>
          <div className="flex-1 min-w-[220px]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm font-bold text-[var(--brand)]">{pr.prNumber}</span>
              <StatusChip status={pr.status} size="sm" />
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'var(--surface-2)', color: priorityColor[pr.priority] ?? 'var(--text-2)' }}>
                {pr.priority.charAt(0).toUpperCase() + pr.priority.slice(1)} Priority
              </span>
            </div>
            <div className="text-xs text-[var(--text-2)] mt-1 flex flex-wrap items-center gap-2">
              <span>Requester: <strong>{pr.raisedBy}</strong>{pr.department ? ` (${pr.department})` : ''}</span>
              <span>·</span>
              <span>Raised: {fmt(pr.raisedDate)}</span>
              <span>·</span>
              <span>Required By: <strong>{fmt(pr.requiredBy)}</strong></span>
              {pr.deliverToSiteName && (
                <>
                  <span>·</span>
                  <span>Deliver to: <strong>{pr.deliverToSiteName}</strong>{pr.deliverToStoreName ? ` · ${pr.deliverToStoreName}` : ''}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
            {canEditPr && (
              <button
                type="button"
                onClick={() => navigate(`/procurement/pr/${pr.id}/edit`)}
                className="btn-ghost text-xs inline-flex items-center gap-1"
              >
                <Pencil size={13} /> Edit PR
              </button>
            )}
            {pr.status === 'pending' && canApprove && (
              <>
                <button
                  type="button"
                  onClick={() => setConfirming('reject')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold"
                  style={{ borderColor: 'var(--error,#DC2626)', color: 'var(--error,#DC2626)' }}>
                  <XCircle size={13} /> Reject
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming('approve')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                  style={{ background: 'var(--success,#16A34A)' }}>
                  <CheckCircle2 size={13} /> Approve
                </button>
              </>
            )}
            {!linkedSpo && !['cancelled', 'rejected'].includes(pr.status) && (
              <Link
                to={`/procurement/supplier-rfq/new?prId=${pr.id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                style={{ background: 'var(--brand-fill)' }}
              >
                <Plus size={13} /> Add Supplier Quote
              </Link>
            )}
            {linkedSpo && (
              <Link
                to={`/procurement/spo/${linkedSpo.id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                style={{ background: 'var(--surface-2)', color: 'var(--brand)', border: '1px solid var(--border)' }}>
                Supplier PO: <span className="font-mono">{linkedSpo.poNumber}</span> →
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {[
            { label: 'Material Lines', value: `${lines.length} item${lines.length !== 1 ? 's' : ''}` },
            { label: 'Total Quantity', value: String(pr.totalQty) },
            { label: 'Estimated Value', value: fmtMoney(totalEstValue) },
            { label: 'Reason / Purpose', value: pr.purpose || pr.reason || '—' },
          ].map((c, i) => (
            <div key={i} className="rounded-lg border p-3" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
              <div className="text-[11px] text-[var(--text-3)]">{c.label}</div>
              <div className="text-sm font-semibold text-[var(--text)] mt-0.5 truncate" title={c.value}>{c.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <RelatedRecordsPanel
          originNote={
            pr.sourceType === 'shortage' && pr.sourceRefLabel
              ? `Origin: Auto-created from material shortage (${pr.sourceRefLabel})`
              : pr.sourceType === 'manual'
                ? 'Origin: Manual Purchase Requisition'
                : undefined
          }
          records={[
            ...(pr.sourceRefId && pr.sourceRefLabel
              ? [{
                  relationship: 'Origin' as const,
                  typeLabel: pr.sourceType === 'shortage' ? 'Customer Order / Req' : 'Source Reference',
                  reference: pr.sourceRefLabel,
                  to: pr.sourceRefId.startsWith('cpo') ? `/sales/po/${pr.sourceRefId}` : pr.sourceRefId.startsWith('J-') ? `/jobs/${pr.sourceRefId}` : '/procurement?tab=pr',
                  state: { from: originUrl },
                }]
              : []),
            ...prInvitations.slice(0, 3).map(inv => ({
              relationship: 'Downstream' as const,
              typeLabel: 'Supplier Invitation',
              reference: inv.supplierName,
              to: inv.quotationId ? `/procurement/quote/${inv.quotationId}` : `/procurement/supplier-rfq/new?invitationId=${inv.id}`,
              status: inv.status,
              state: { from: originUrl },
            })),
            ...prQuotations.map(q => ({
              relationship: 'Downstream' as const,
              typeLabel: 'Supplier Quote',
              reference: `${q.quoteNumber} · ${q.supplierName}`,
              to: `/procurement/quote/${q.id}`,
              status: q.status,
              state: { from: originUrl },
            })),
            ...(linkedSpo
              ? [{
                  relationship: 'Downstream' as const,
                  typeLabel: 'Supplier PO',
                  reference: `${linkedSpo.poNumber} · ${linkedSpo.supplierName}`,
                  to: `/procurement/spo/${linkedSpo.id}`,
                  status: linkedSpo.status,
                  state: { from: originUrl },
                }]
              : []),
            ...linkedGrns.map(g => ({
              relationship: 'Downstream' as const,
              typeLabel: 'GRN',
              reference: g.grnNumber,
              to: `/procurement/grn/${g.id}`,
              status: g.status,
              state: { from: originUrl },
            })),
          ]}
        />

        {/* Supplier Invitations & RFQ Outreach */}
        <div className="eoss-card p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-[var(--text)]">Supplier Quotation Invitations ({prInvitations.length})</h2>
              <p className="text-xs text-[var(--text-3)]">
                Match and invite suppliers for {pr.prNumber}, track responses, and record received quotations.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate(`/procurement/supplier-rfq/new?mode=invite&pr=${pr.id}`, { state: { from: originUrl } })}
                className="btn-primary text-xs inline-flex items-center gap-1.5"
              >
                <Send size={12} /> Invite Suppliers
              </button>
              <button
                type="button"
                onClick={() => navigate(`/procurement/supplier-rfq/new?mode=quote&pr=${pr.id}`, { state: { from: originUrl } })}
                className="btn-ghost text-xs inline-flex items-center gap-1.5"
              >
                <Plus size={12} /> Record Quote Manually
              </button>
            </div>
          </div>

          {prInvitations.length === 0 ? (
            <p className="text-xs text-[var(--text-3)] py-2">
              No supplier invitations dispatched for this PR yet. Click <strong>Invite Suppliers</strong> to select matched vendors and preview recipients.
            </p>
          ) : (
            <div className="overflow-x-auto border border-[var(--border)] rounded-xl">
              <table className="eoss-table">
                <thead>
                  <tr>
                    <th>Supplier</th>
                    <th>Match Basis</th>
                    <th>Channel</th>
                    <th>Sent / Due</th>
                    <th>Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {prInvitations.map(inv => (
                    <tr key={inv.id}>
                      <td>
                        <div className="font-medium text-xs text-[var(--text)]">{inv.supplierName}</div>
                        <div className="text-[11px] text-[var(--text-3)]">{inv.contactEmail ?? inv.contactName ?? ''}</div>
                      </td>
                      <td className="text-xs text-[var(--text-2)]">{inv.matchReason ?? 'Selected manually'}</td>
                      <td className="text-xs uppercase text-[var(--text-2)]">{inv.channel}</td>
                      <td className="text-xs text-[var(--text-2)]">
                        {inv.sentDate ?? inv.createdAt} {inv.responseDueDate ? `· Due ${inv.responseDueDate}` : ''}
                      </td>
                      <td><StatusChip status={inv.status} /></td>
                      <td className="text-right space-x-1.5">
                        {['sent', 'awaiting_quotation'].includes(inv.status) && (
                          <>
                            <button
                              type="button"
                              onClick={() => navigate(`/procurement/supplier-rfq/new?invitationId=${inv.id}`, { state: { from: originUrl } })}
                              className="px-2.5 py-1 rounded-lg bg-[var(--brand-fill)] text-white text-xs font-medium"
                            >
                              Record Quote
                            </button>
                            <button
                              type="button"
                              onClick={() => updateSupplierInvitation(inv.id, { status: 'declined' })}
                              className="px-2 py-1 rounded-lg border border-[var(--border)] text-xs text-[var(--text-2)] hover:text-[var(--danger)]"
                            >
                              Declined
                            </button>
                          </>
                        )}
                        {inv.quotationId && (
                          <Link
                            to={`/procurement/quote/${inv.quotationId}`}
                            state={{ from: originUrl }}
                            className="text-xs text-[var(--brand)] hover:underline font-medium"
                          >
                            View Quote
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 1. Material Lines */}
        <section>
          <h2 className="text-sm font-bold text-[var(--text)] mb-3">Material Lines</h2>
          {lines.length === 0 ? (
            <p className="text-sm text-[var(--text-3)]">No line items recorded.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              <table className="eoss-table">
                <thead>
                  <tr>
                    <th>#</th><th>Code</th><th>Material Description</th><th>Grade</th><th>Qty</th><th>UOM</th><th>Est. Rate</th><th>Est. Value</th><th>Req. By</th><th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l, i) => (
                    <tr key={l.id ?? i}>
                      <td className="text-xs text-[var(--text-3)]">{i + 1}</td>
                      <td className="font-mono text-xs">{l.materialCode || '—'}</td>
                      <td className="text-sm font-medium">{l.description || l.materialName}</td>
                      <td className="text-xs text-[var(--text-2)]">{l.grade || '—'}</td>
                      <td className="font-mono text-right">{l.requiredQty}</td>
                      <td>{l.uom}</td>
                      <td className="font-mono text-right">{l.estimatedPrice ? fmtMoney(l.estimatedPrice) : '—'}</td>
                      <td className="font-mono text-right">{l.estimatedPrice && l.requiredQty ? fmtMoney(l.estimatedPrice * l.requiredQty) : '—'}</td>
                      <td className="text-xs text-[var(--text-2)]">{l.requiredDate ? fmt(l.requiredDate) : '—'}</td>
                      <td className="text-xs text-[var(--text-2)]">{l.notes || l.justification || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* 2. Supplier Quotations & Side-by-Side Comparison */}
        <section className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-sm font-bold text-[var(--text)]">
                Supplier Quotations ({prQuotations.length})
              </h2>
              <p className="text-xs text-[var(--text-3)]">
                Compare competing supplier quotes side by side, finalize one winning quote, and issue one Supplier PO.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {prQuotations.length >= 2 && (
                <button type="button" onClick={() => setShowCompare(v => !v)} className="btn-ghost text-xs inline-flex items-center gap-1">
                  <Scale size={13} /> {showCompare ? 'Hide Comparison' : 'Compare Quotations'}
                </button>
              )}
              {!linkedSpo && !['cancelled', 'rejected'].includes(pr.status) && (
                <Link to={`/procurement/supplier-rfq/new?prId=${pr.id}`} className="btn-primary text-xs inline-flex items-center gap-1">
                  <Plus size={13} /> Add Quotation
                </Link>
              )}
            </div>
          </div>

          {prQuotations.length === 0 ? (
            <div className="rounded-xl border p-6 text-center text-sm text-[var(--text-3)]" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              No supplier quotations recorded against {pr.prNumber} yet. Add multiple vendor quotes to compare and issue a Supplier PO.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              <table className="eoss-table">
                <thead>
                  <tr>
                    <th>Quote #</th>
                    <th>Supplier</th>
                    <th className="text-right">Landed Total</th>
                    <th className="text-right">Lead Time</th>
                    <th>Payment Terms</th>
                    <th>Freight</th>
                    <th>Valid Until</th>
                    <th>Status</th>
                    <th className="text-right">Decision</th>
                  </tr>
                </thead>
            <tbody>
              {prQuotations.map(q => {
                const total = quoteTotal(q);
                const isLowest = prQuotations.length > 1 && total === minQuoteTotal && total > 0;
                const isFastest = prQuotations.length > 1 && q.deliveryDays === minDeliveryDays;
                const isWinnerRadio = effectiveWinnerId === q.id;
                return (
                  <tr key={q.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        {!linkedSpo && prQuotations.length >= 2 && (
                          <input
                            type="radio"
                            name="pr-winner-quote"
                            checked={isWinnerRadio}
                            onChange={() => setChosenQuoteId(q.id)}
                          />
                        )}
                        <Link to={`/procurement/quote/${q.id}`} state={{ from: originUrl }} className="font-mono text-xs font-bold text-[var(--brand)] hover:underline">
                          {q.quoteNumber}
                        </Link>
                      </div>
                    </td>
                    <td className="font-medium text-sm">
                      {q.supplierName}
                      {prComparison?.recommendedQuoteId === q.id && (
                        <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-semibold">Recommended</span>
                      )}
                    </td>
                    <td className="font-mono text-right font-semibold">
                      {fmtMoney(total)}
                      {isLowest && <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-[var(--success-bg)] text-[var(--success)] font-sans font-semibold">Lowest</span>}
                    </td>
                    <td className="font-mono text-right text-xs">
                      {q.deliveryDays}d
                      {isFastest && <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-[var(--info-bg)] text-[var(--info)] font-sans font-semibold">Fastest</span>}
                    </td>
                    <td className="text-xs">{q.paymentTerms}</td>
                    <td className="text-xs">{q.deliveryCharges ? `₹${q.deliveryCharges}` : q.lines.some(l => l.freightIncluded === false) ? 'Extra' : 'Included'}</td>
                    <td className="text-xs">{fmt(q.validUntil)}</td>
                    <td><StatusChip status={q.status} size="sm" /></td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {q.status !== 'selected' && !linkedSpo && canApprove && (
                          <>
                            <button type="button" onClick={() => handleSelectQuote(q.id)} className="px-2.5 py-1 rounded border text-xs font-semibold border-[var(--brand)] text-[var(--brand)] hover:bg-[var(--brand)] hover:text-white transition-colors">
                              Approve Winner
                            </button>
                            <button type="button" onClick={() => { setRejectQuoteModal(q); setQuoteRejectReason(''); }} className="px-2 py-1 rounded border text-xs border-[var(--border)] text-[var(--text-2)] hover:text-red-600">
                              Reject
                            </button>
                          </>
                        )}
                        {!linkedSpo && canApprove && (q.status === 'selected' || isWinnerRadio) && (
                          <button type="button" onClick={() => handleGenerateSpo(q.id)} className="px-2.5 py-1 rounded text-xs font-semibold text-white" style={{ background: 'var(--success)' }}>
                            Draft Supplier PO →
                          </button>
                        )}
                        <Link to={`/procurement/quote/${q.id}`} state={{ from: originUrl }} className="btn-ghost text-xs py-1 px-2">View</Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
          )}

          {showCompare && prComparison && prComparison.valid && (
            <div className="rounded-xl border p-4 space-y-3 bg-[var(--surface-2)] border-[var(--border)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--text)]">
                  <Sparkles size={14} className="text-emerald-600" />
                  Side-by-Side Line Item Comparison & Recommendation ({prQuotations.length} Quotes)
                </div>
                {prComparison.recommendedQuoteId && (
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-700 text-white">
                    Recommended: {prQuotations.find(q => q.id === prComparison.recommendedQuoteId)?.supplierName}
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--text-2)]">{prComparison.recommendationSummary}</p>

              {(prComparison.advantages.length > 0 || prComparison.disadvantages.length > 0 || prComparison.missingInfo.length > 0 || prComparison.warnings.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] bg-[var(--surface)] p-3 rounded-lg border border-[var(--border)]">
                  <div>
                    <div className="font-semibold text-emerald-700">Advantages</div>
                    <ul className="list-disc pl-4 text-[var(--text-2)]">{prComparison.advantages.map((a, i) => <li key={i}>{a}</li>)}</ul>
                  </div>
                  <div>
                    <div className="font-semibold text-amber-700">Trade-offs</div>
                    <ul className="list-disc pl-4 text-[var(--text-2)]">{prComparison.disadvantages.map((d, i) => <li key={i}>{d}</li>)}</ul>
                  </div>
                  <div>
                    <div className="font-semibold text-red-700">Missing / Warnings</div>
                    <ul className="list-disc pl-4 text-red-600">{[...prComparison.missingInfo, ...prComparison.warnings].map((w, i) => <li key={i}>{w}</li>)}</ul>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto bg-[var(--surface)] rounded-lg border border-[var(--border)]">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-[var(--text-3)] text-left bg-[var(--surface-2)]/60">
                      <th className="py-2 px-3">Material / Req.</th>
                      {prQuotations.map(q => (
                        <th key={q.id} className="py-2 px-3">
                          {q.supplierName} ({q.quoteNumber})
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {prComparison.rows.map(row => (
                      <tr key={row.prLineId} className="border-b border-[var(--border)]/60">
                        <td className="py-2 px-3">
                          <div className="font-medium text-[var(--text)]">{row.materialName}</div>
                          <div className="text-[11px] text-[var(--text-3)]">{row.requiredQty} {row.uom} {row.requiredGrade ? `· ${row.requiredGrade}` : ''}</div>
                        </td>
                        {row.cells.map(cell => (
                          <td key={cell.quoteId} className="py-2 px-3 font-mono text-[var(--text)]">
                            {cell.missing ? (
                              <span className="text-red-600 font-sans font-semibold">Missing / Not Quoted</span>
                            ) : (
                              <div>
                                ₹{cell.unitPrice.toLocaleString('en-IN')}/{row.uom} × {cell.quotedQty}
                                {row.lowestUnitPrice === cell.unitPrice && <span className="ml-1 px-1 rounded bg-emerald-100 text-emerald-700 font-sans text-[10px]">Lowest</span>}
                                {cell.qtyMismatch && <div className="text-amber-700 font-sans text-[10px]">Qty variance vs {row.requiredQty}</div>}
                                {cell.gradeMismatch && <div className="text-amber-700 font-sans text-[10px]">Grade diff: {cell.grade}</div>}
                              </div>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {isOverridingRec && !linkedSpo && canApprove && (
                <div>
                  <label className="block text-xs font-semibold text-amber-800 mb-1">
                    Override Reason (required since chosen quote differs from system recommendation) *
                  </label>
                  <input
                    className="eoss-input w-full"
                    placeholder="Explain why a non-recommended quote is chosen…"
                    value={overrideReason}
                    onChange={e => setOverrideReason(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}
        </section>

        {/* 3. End-to-End Traceability Chain: Selected Quote → Supplier PO → GRNs */}
        <section className="grid md:grid-cols-3 gap-4">
          <div className="rounded-xl border p-4 bg-[var(--surface)] border-[var(--border)] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-3)]">
              <Award size={13} className="text-[var(--brand)]" /> Selected Quotation
            </div>
            {selectedQuotation ? (
              <div className="space-y-1 text-xs">
                <Link to={`/procurement/quote/${selectedQuotation.id}`} className="font-mono font-bold text-sm text-[var(--brand)] hover:underline">
                  {selectedQuotation.quoteNumber}
                </Link>
                <div className="font-semibold text-[var(--text)]">{selectedQuotation.supplierName}</div>
                <div className="text-[var(--text-2)]">Landed Value: {fmtMoney(quoteTotal(selectedQuotation))} · Lead: {selectedQuotation.deliveryDays}d</div>
                {!linkedSpo && canApprove && (
                  <button
                    type="button"
                    onClick={() => handleGenerateSpo(selectedQuotation.id)}
                    className="mt-2 w-full py-1.5 rounded-lg text-xs font-semibold text-white"
                    style={{ background: 'var(--success)' }}
                  >
                    Generate Supplier PO
                  </button>
                )}
              </div>
            ) : (
              <p className="text-xs text-[var(--text-3)]">No winning quotation finalized yet.</p>
            )}
          </div>

          <div className="rounded-xl border p-4 bg-[var(--surface)] border-[var(--border)] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-3)]">
              <FileText size={13} className="text-[var(--brand)]" /> Supplier Purchase Order
            </div>
            {linkedSpo ? (
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <Link to={`/procurement/spo/${linkedSpo.id}`} className="font-mono font-bold text-sm text-[var(--brand)] hover:underline">
                    {linkedSpo.poNumber}
                  </Link>
                  <StatusChip status={linkedSpo.status} size="sm" />
                </div>
                <div className="font-semibold text-[var(--text)]">{linkedSpo.supplierName}</div>
                <div className="text-[var(--text-2)]">Value: {fmtMoney(linkedSpo.totalValue)} · Due: {fmt(linkedSpo.committedDate)}</div>
              </div>
            ) : (
              <p className="text-xs text-[var(--text-3)]">Finalize one quotation to issue a single Supplier PO.</p>
            )}
          </div>

          <div className="rounded-xl border p-4 bg-[var(--surface)] border-[var(--border)] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-3)]">
              <Truck size={13} className="text-[var(--brand)]" /> Linked GRNs ({linkedGrns.length})
            </div>
            {linkedGrns.length > 0 ? (
              <div className="space-y-1.5">
                {linkedGrns.map(g => (
                  <div key={g.id} className="flex items-center justify-between text-xs border-b border-[var(--border)]/60 pb-1 last:border-b-0">
                    <Link to={`/procurement/grn/${g.id}`} className="font-mono font-bold text-[var(--brand)] hover:underline">
                      {g.grnNumber}
                    </Link>
                    <span className="text-[var(--text-2)]">{fmt(g.receivedDate)}</span>
                    <StatusChip status={g.status} size="sm" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--text-3)]">
                {linkedSpo ? 'No receipts recorded yet against this PO.' : 'Available once Supplier PO is issued.'}
              </p>
            )}
          </div>
        </section>

        {/* 4. Notes & Attachments */}
        {(pr.notes || (pr.attachments && pr.attachments.length > 0)) && (
          <section className="rounded-xl border p-4 space-y-2" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            {pr.notes && (
              <div>
                <h3 className="text-xs font-bold text-[var(--text-3)] uppercase tracking-wider mb-1">Notes</h3>
                <p className="text-sm text-[var(--text-2)]">{pr.notes}</p>
              </div>
            )}
            {pr.attachments && pr.attachments.length > 0 && (
              <div className="pt-1">
                <h3 className="text-xs font-bold text-[var(--text-3)] uppercase tracking-wider mb-1">Attachments</h3>
                <div className="flex flex-wrap gap-2">
                  {pr.attachments.map(a => (
                    <span key={a.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)]">
                      <Paperclip size={11} /> {a.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      {confirming === 'approve' && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl border p-6 w-full max-w-sm shadow-xl" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <h3 className="font-bold text-[var(--text)] mb-2">Approve PR?</h3>
            <p className="text-sm text-[var(--text-2)] mb-5">{pr.prNumber} · {lines.length} lines · Est. {fmtMoney(totalEstValue)}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirming(null)} className="flex-1 py-2 border border-[var(--border)] text-[var(--text)] rounded-lg text-sm">Cancel</button>
              <button onClick={handleApprove} className="flex-1 py-2 text-white rounded-lg text-sm font-semibold" style={{ background: 'var(--success,#16A34A)' }}>Approve</button>
            </div>
          </div>
        </div>
      )}

      {confirming === 'reject' && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl border p-6 w-full max-w-sm shadow-xl" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <h3 className="font-bold text-[var(--text)] mb-2">Reject PR?</h3>
            <p className="text-sm text-[var(--text-2)] mb-3">This will mark {pr.prNumber} rejected.</p>
            <textarea className="eoss-input w-full mb-4" rows={2} placeholder="Reason for rejection..." value={rejectNote} onChange={e => setRejectNote(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={() => setConfirming(null)} className="flex-1 py-2 border border-[var(--border)] text-[var(--text)] rounded-lg text-sm">Cancel</button>
              <button onClick={handleReject} className="flex-1 py-2 text-white rounded-lg text-sm font-semibold" style={{ background: 'var(--error,#DC2626)' }}>Reject</button>
            </div>
          </div>
        </div>
      )}

      {rejectQuoteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl border p-6 w-full max-w-md shadow-xl space-y-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div>
              <h3 className="font-bold text-[var(--text)]">Reject Quotation {rejectQuoteModal.quoteNumber}?</h3>
              <p className="text-xs text-[var(--text-2)] mt-1">
                {rejectQuoteModal.supplierName} — recorded as <span className="font-mono">approval_rejected</span> with audit reason.
              </p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-2)] mb-1">Rejection Reason *</label>
              <textarea
                className="eoss-input w-full"
                rows={3}
                placeholder="e.g. Quoted grade does not match spec / delivery lead time exceeds schedule."
                value={quoteRejectReason}
                onChange={e => setQuoteRejectReason(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setRejectQuoteModal(null)} className="flex-1 py-2 border border-[var(--border)] text-[var(--text)] rounded-lg text-sm">Cancel</button>
              <button
                disabled={!quoteRejectReason.trim()}
                onClick={() => {
                  rejectQuotationApproval(rejectQuoteModal.id, currentUser.name, quoteRejectReason.trim());
                  showToast({ type: 'warning', title: 'Quotation Rejected', body: `${rejectQuoteModal.quoteNumber} rejected.` });
                  setRejectQuoteModal(null);
                }}
                className="flex-1 py-2 text-white rounded-lg text-sm font-semibold disabled:opacity-40"
                style={{ background: 'var(--error,#DC2626)' }}
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
