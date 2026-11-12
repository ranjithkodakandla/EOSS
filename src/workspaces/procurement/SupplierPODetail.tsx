import React, { useState } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Truck, Ban, CheckCircle2, Send, Mail, XCircle } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';
import ConfirmModal from '../../components/feedback/ConfirmModal';
import DocumentActions from '../../components/workflow/DocumentActions';
import WorkflowTimeline from '../../components/workflow/WorkflowTimeline';
import RelatedRecordsPanel from '../../components/workflow/RelatedRecordsPanel';
import RecordHistoryPanel from '../../components/workflow/RecordHistoryPanel';
import { useReturnNavigation } from '../../hooks/useReturnNavigation';
import { formatDisplayDate } from '../../domain/dates';

export default function SupplierPODetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    supplierPos, supplierPoLines, supplierQuotations, supplierInvitations, purchaseReqs, suppliers, grns, poAmendments,
    supplierBills, supplierPayments, supplierPaymentAllocations,
    setSupplierPoStatus, confirmAndIssueSPO, notifyNonSelectedSuppliers, recordSupplierPOConfirmation,
    resolvePoAmendment, currentUser, showToast,
  } = useStore();
  const [confirm, setConfirm] = useState(false);

  const po = supplierPos.find(p => p.id === id);
  const { goBack, originUrl } = useReturnNavigation('/procurement?tab=spo');
  const [draftTerms, setDraftTerms] = useState(po?.paymentTerms ?? 'Net 30');
  const [draftDate, setDraftDate] = useState(po?.committedDate ?? '');
  const [draftNotes, setDraftNotes] = useState(po?.notes ?? '');
  const [notifyList, setNotifyList] = useState<Array<{ supplierId: string; supplierName: string; email?: string; message: string; send: boolean }> | null>(null);
  const [supplierDecisionModal, setSupplierDecisionModal] = useState<'accepted' | 'declined' | null>(null);
  const [supConfirmedDate, setSupConfirmedDate] = useState(po?.committedDate ?? '2026-11-18');
  const [supRefNumber, setSupRefNumber] = useState('');
  const [supConfirmNotes, setSupConfirmNotes] = useState('');
  const [supDeclineReason, setSupDeclineReason] = useState('');

  if (!po) return <div className="p-6 text-[var(--text-2)]">Supplier PO not found</div>;

  const lines = supplierPoLines.filter(l => l.spoId === id);
  const linkedGrns = grns.filter(g => g.spoId === po.id);
  const linkedBills = supplierBills.filter(b => b.spoId === po.id && b.status !== 'void');
  const linkedBillPayIds = new Set(
    supplierPaymentAllocations.filter(a => linkedBills.some(b => b.id === a.billId)).map(a => a.paymentId)
  );
  const linkedSupplierPayments = supplierPayments.filter(p => linkedBillPayIds.has(p.id) && p.status !== 'reversed');
  const canEdit = ['owner', 'buyer', 'storekeeper'].includes(currentUser.role);
  const canApprove = ['owner', 'buyer'].includes(currentUser.role);
  const pr = purchaseReqs.find(p => p.id === po.prId);
  const selectedQuotation = supplierQuotations.find(q => q.id === po.supplierQuotationId || (po.supplierQuotationRef && q.quoteNumber === po.supplierQuotationRef));
  const prInvitations = pr ? supplierInvitations.filter(i => i.prId === pr.id) : [];
  const amendments = poAmendments.filter(a => a.entityType === 'supplier_po' && a.poId === po.id);
  const pendingAmendment = amendments.find(a => a.status === 'pending_approval');
  const workflowStep = po.status === 'received' || po.status === 'closed'
    ? 6
    : linkedGrns.length > 0 || po.status === 'partial' || po.status === 'overdue'
      ? 4
      : ['confirmed', 'supplier_accepted', 'awaiting_supplier_confirmation'].includes(po.status)
        ? 3
        : 2;

  const totalOrdered = lines.reduce((s, l) => s + l.orderedQty, 0);
  const totalReceived = lines.reduce((s, l) => s + l.receivedQty, 0);
  const hasRemainingQty = lines.length === 0 || lines.some(l => l.orderedQty * (1 + (l.tolerancePct ?? 0) / 100) - l.receivedQty > 0);
  const canRecordGrn = canEdit && ['confirmed', 'supplier_accepted', 'partial', 'overdue'].includes(po.status) && hasRemainingQty;

  const handleCancel = () => {
    setSupplierPoStatus(id!, 'cancelled');
    setConfirm(false);
    showToast({ type: 'info', title: 'PO cancelled' });
    goBack();
  };

  const handleIssuePO = () => {
    const res = confirmAndIssueSPO(po.id, currentUser.name, {
      paymentTerms: draftTerms || po.paymentTerms,
      committedDate: draftDate || po.committedDate,
      notes: draftNotes,
    });
    if (res.error) {
      showToast({ type: 'error', title: 'Cannot issue PO', body: res.error });
      return;
    }
    showToast({
      type: 'success',
      title: 'PO Confirmed & Issued',
      body: `${po.poNumber} issued to ${po.supplierName}. Awaiting supplier confirmation.`,
    });
    if (res.nonSelectedInvitations.length > 0) {
      setNotifyList(
        res.nonSelectedInvitations.map(inv => {
          const sup = suppliers.find(s => s.id === inv.supplierId);
          return {
            supplierId: inv.supplierId,
            supplierName: inv.supplierName,
            email: inv.contactEmail ?? sup?.email,
            message: `Dear ${inv.supplierName}, thank you for quoting on ${pr?.prNumber ?? 'our requirement'}. We have awarded this order to another vendor for this cycle and appreciate your timely response.`,
            send: true,
          };
        }),
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <button onClick={() => goBack()} className="text-[var(--text-3)] hover:text-[var(--text)]"><ArrowLeft size={16} /></button>
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-bold text-[var(--text)] font-mono">{po.poNumber}</h1>
            <StatusChip status={po.status} />
            {po.directProcurement && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-[var(--surface-2)] text-[var(--text-2)] border border-[var(--border)]">
                Direct Procurement
              </span>
            )}
            {pendingAmendment && <StatusChip status="pending_approval" size="sm" />}
            {po.revision && <span className="text-xs text-[var(--text-3)]">Rev {po.revision}</span>}
            {po.status === 'overdue' && (
              <span className="flex items-center gap-1 text-xs text-[var(--error)] font-semibold">
                <AlertTriangle size={12} /> Delivery overdue
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--text-2)]">{po.supplierName}</p>
        </div>
        {canEdit && !['cancelled', 'received', 'supplier_declined', 'closed'].includes(po.status) && (
          <button onClick={() => setConfirm(true)} className="px-3 py-1.5 border border-[var(--error)] text-[var(--error)] text-sm rounded-lg hover:bg-[var(--error-bg)]">
            <Ban size={14} className="inline mr-1" /> Cancel Supplier PO
          </button>
        )}
        {canApprove && pendingAmendment && (
          <>
            <button onClick={() => resolvePoAmendment(pendingAmendment.id, 'approved', currentUser.name)} className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white" style={{ background: 'var(--success,#16A34A)' }}>
              Approve Amendment
            </button>
            <button onClick={() => resolvePoAmendment(pendingAmendment.id, 'rejected', currentUser.name)} className="px-3 py-1.5 rounded-lg text-sm font-semibold border" style={{ borderColor: 'var(--error)', color: 'var(--error)' }}>
              Reject Amendment
            </button>
          </>
        )}
        {canEdit && !['cancelled', 'received'].includes(po.status) && (
          <button onClick={() => navigate(`/procurement/spo/${po.id}/amend`)} className="px-3 py-1.5 rounded-lg text-sm font-semibold border" style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}>
            <FileEditIcon /> Amend PO
          </button>
        )}
        <DocumentActions
          documentType="Supplier PO"
          reference={po.poNumber}
          date={po.raisedDate}
          partyName={po.supplierName}
          status={po.status}
          total={po.totalValue}
          lines={lines.map(l => ({ description: l.materialName, quantity: l.orderedQty, uom: l.uom, amount: l.value }))}
          references={[
            pr ? `Originating PR: ${pr.prNumber}` : '',
            selectedQuotation ? `Selected quotation: ${selectedQuotation.quoteNumber}` : '',
            po.deliverToSiteName ? `Receiving site: ${po.deliverToSiteName}` : '',
          ].filter(Boolean)}
        />
      </div>

      <WorkflowTimeline steps={['Purchase Requisition', 'Supplier Quotations', 'Selected Quotation', 'Supplier PO', 'Receiving / GRN', 'Quality / Inspection', 'Inventory']} current={workflowStep} />

      <div className="my-4">
        <RelatedRecordsPanel
          originNote={
            po.originatingRequirementLabel
              ? `Originating Demand: ${po.originatingRequirementLabel}`
              : po.directProcurement
                ? `Direct Procurement: ${po.directProcurementReason ?? 'No prior PR/Quote'}`
                : undefined
          }
          records={[
            ...(po.originatingRequirementId && po.originatingRequirementLabel
              ? [{
                  relationship: 'Origin' as const,
                  typeLabel: 'Customer Requirement',
                  reference: po.originatingRequirementLabel,
                  to: po.originatingRequirementId.startsWith('cpo') ? `/sales/po/${po.originatingRequirementId}` : `/jobs/${po.originatingRequirementId}`,
                  state: { from: originUrl },
                }]
              : []),
            ...(pr ? [{ relationship: 'Upstream' as const, typeLabel: 'Purchase Requisition', reference: pr.prNumber, to: `/procurement/pr/${pr.id}`, status: pr.status, state: { from: originUrl } }] : []),
            ...(selectedQuotation ? [{ relationship: 'Upstream' as const, typeLabel: 'Selected Quote', reference: selectedQuotation.quoteNumber, to: `/procurement/quote/${selectedQuotation.id}`, status: selectedQuotation.status, state: { from: originUrl } }] : []),
            ...linkedGrns.map(g => ({ relationship: 'Downstream' as const, typeLabel: 'GRN', reference: g.grnNumber, to: `/procurement/grn/${g.id}`, status: g.status, state: { from: originUrl } })),
            ...linkedBills.map(b => ({ relationship: 'Downstream' as const, typeLabel: 'Supplier Bill', reference: b.billNumber, to: `/finance/bill/${b.id}`, status: b.status, state: { from: originUrl } })),
            ...linkedSupplierPayments.map(p => ({ relationship: 'Downstream' as const, typeLabel: 'Supplier Payment', reference: p.paymentNumber, to: `/finance/supplier-payment/${p.id}`, status: p.status, state: { from: originUrl } })),
          ]}
        />
      </div>

      {/* Draft PO Review Banner */}
      {canApprove && ['draft', 'pending_approval'].includes(po.status) && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 mb-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-blue-950">Draft Supplier PO — Review Before Issuing</h3>
              <p className="text-xs text-blue-900">
                Verify delivery schedule, payment terms, and instructions before confirming and dispatching to {po.supplierName}.
              </p>
            </div>
            <button
              type="button"
              onClick={handleIssuePO}
              className="btn-primary text-xs inline-flex items-center gap-1.5"
            >
              <Send size={13} /> Issue Supplier PO
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-blue-900 mb-1">Payment Terms</label>
              <input className="eoss-input w-full text-xs" value={draftTerms} onChange={e => setDraftTerms(e.target.value)} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-blue-900 mb-1">Committed Delivery Date</label>
              <input type="date" className="eoss-input w-full text-xs" value={draftDate} onChange={e => setDraftDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-blue-900 mb-1">PO Instructions / Notes</label>
              <input className="eoss-input w-full text-xs" value={draftNotes} onChange={e => setDraftNotes(e.target.value)} placeholder="MTC required on delivery" />
            </div>
          </div>
        </div>
      )}

      {/* Awaiting Supplier Confirmation Banner */}
      {po.status === 'awaiting_supplier_confirmation' && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-amber-950">Awaiting Supplier Confirmation</div>
            <p className="text-xs text-amber-900 mt-0.5">
              Issued {formatDisplayDate(po.sentAt ?? po.raisedDate)} by {po.issuedBy ?? 'Buyer'}. Record {po.supplierName}'s acknowledgement or decline to update procurement &amp; receiving readiness.
            </p>
          </div>
          {canApprove && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { setSupConfirmedDate(po.committedDate || '2026-11-18'); setSupplierDecisionModal('accepted'); }}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold inline-flex items-center gap-1"
              >
                <CheckCircle2 size={13} /> Record Acceptance
              </button>
              <button
                type="button"
                onClick={() => { setSupDeclineReason(''); setSupplierDecisionModal('declined'); }}
                className="px-3 py-1.5 rounded-lg border border-red-300 bg-white text-red-700 text-xs font-semibold inline-flex items-center gap-1"
              >
                <XCircle size={13} /> Record Decline
              </button>
            </div>
          )}
        </div>
      )}

      {/* Supplier Declined Alert Banner */}
      {po.status === 'supplier_declined' && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-red-900 flex items-center gap-1.5">
              <XCircle size={15} /> Supplier Declined This Purchase Order
            </div>
            <p className="text-xs text-red-800 mt-1">
              Reason: <strong>{po.supplierDeclineReason ?? 'Not specified'}</strong>. {pr ? `${pr.prNumber} has been reopened to Quotation In Progress so an alternate vendor can be selected.` : ''}
            </p>
          </div>
          {pr && (
            <Link to={`/procurement/pr/${pr.id}`} className="px-3 py-1.5 rounded-lg bg-red-700 text-white text-xs font-semibold">
              Return to {pr.prNumber} Quotes →
            </Link>
          )}
        </div>
      )}

      {/* Non-Selected Supplier Notification Modal */}
      {notifyList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-2xl p-6 shadow-2xl max-h-[88vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-[var(--text)] flex items-center gap-2">
                  <Mail size={16} className="text-[var(--brand)]" />
                  Notify Non-Selected Suppliers?
                </h3>
                <p className="text-xs text-[var(--text-3)] mt-0.5">
                  Prototype simulation: review or edit closing messages for suppliers who participated in {pr?.prNumber ?? 'this PR'}.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {notifyList.map((item, idx) => (
                <div key={item.supplierId} className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/40 space-y-2">
                  <label className="flex items-center justify-between text-xs font-semibold text-[var(--text)]">
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={item.send}
                        onChange={e =>
                          setNotifyList(prev =>
                            prev ? prev.map((x, i) => (i === idx ? { ...x, send: e.target.checked } : x)) : null,
                          )
                        }
                      />
                      {item.supplierName}
                    </span>
                    <span className="font-normal text-[var(--text-3)]">{item.email ?? 'No email on file'}</span>
                  </label>
                  <textarea
                    className="eoss-input w-full text-xs"
                    rows={2}
                    disabled={!item.send}
                    value={item.message}
                    onChange={e =>
                      setNotifyList(prev =>
                        prev ? prev.map((x, i) => (i === idx ? { ...x, message: e.target.value } : x)) : null,
                      )
                    }
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setNotifyList(null)} className="px-4 py-2 rounded-lg border border-[var(--border)] text-xs font-medium text-[var(--text-2)]">
                Skip Notifications
              </button>
              <button
                type="button"
                onClick={() => {
                  const chosen = notifyList.filter(x => x.send);
                  if (chosen.length > 0) {
                    notifyNonSelectedSuppliers(po.id, chosen, currentUser.name);
                    showToast({ type: 'success', title: 'Notifications Logged', body: `Recorded closing notice for ${chosen.length} non-selected supplier(s).` });
                  }
                  setNotifyList(null);
                }}
                className="btn-primary text-xs"
              >
                Send Notifications ({notifyList.filter(x => x.send).length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supplier Acceptance / Decline Modal */}
      {supplierDecisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-[var(--text)]">
              {supplierDecisionModal === 'accepted' ? 'Record Supplier Acceptance' : 'Record Supplier Decline'}
            </h3>
            {supplierDecisionModal === 'accepted' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Supplier Confirmed Delivery Date</label>
                  <input type="date" className="eoss-input w-full" value={supConfirmedDate} onChange={e => setSupConfirmedDate(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Supplier Sales Order / Ref #</label>
                  <input className="eoss-input w-full font-mono" placeholder="e.g. SUP-ACK-2041" value={supRefNumber} onChange={e => setSupRefNumber(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Confirmation Notes</label>
                  <textarea className="eoss-input w-full" rows={2} value={supConfirmNotes} onChange={e => setSupConfirmNotes(e.target.value)} placeholder="e.g. Dispatch scheduled ex-works Mumbai" />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-red-700 mb-1">Decline Reason (Mandatory) *</label>
                <textarea className="eoss-input w-full" rows={3} value={supDeclineReason} onChange={e => setSupDeclineReason(e.target.value)} placeholder="e.g. Mill batch sold out; unable to commit delivery timeline" />
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setSupplierDecisionModal(null)} className="px-4 py-2 rounded-lg border border-[var(--border)] text-xs">Cancel</button>
              <button
                type="button"
                disabled={supplierDecisionModal === 'declined' && !supDeclineReason.trim()}
                onClick={() => {
                  const res = recordSupplierPOConfirmation(po.id, supplierDecisionModal, {
                    confirmedDate: supConfirmedDate,
                    supplierRefNumber: supRefNumber.trim() || undefined,
                    notes: supConfirmNotes.trim() || undefined,
                    declineReason: supDeclineReason.trim() || undefined,
                    recordedBy: currentUser.name,
                  });
                  if (res.error) {
                    showToast({ type: 'error', title: 'Update Failed', body: res.error });
                  } else {
                    showToast({
                      type: supplierDecisionModal === 'accepted' ? 'success' : 'warning',
                      title: supplierDecisionModal === 'accepted' ? 'Supplier PO Confirmed' : 'Supplier Declined PO',
                      body: supplierDecisionModal === 'accepted'
                        ? `${po.poNumber} confirmed by ${po.supplierName}. Ready for GRN upon delivery.`
                        : `${po.poNumber} declined and ${pr?.prNumber ?? 'PR'} returned for alternate sourcing.`,
                    });
                  }
                  setSupplierDecisionModal(null);
                }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-40 ${
                  supplierDecisionModal === 'accepted' ? 'bg-emerald-600' : 'bg-red-600'
                }`}
              >
                {supplierDecisionModal === 'accepted' ? 'Confirm Acceptance' : 'Record Decline'}
              </button>
            </div>
          </div>
        </div>
      )}

      {po.status === 'overdue' && (
        <div className="bg-[var(--error-bg)] border border-[var(--error)] rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 font-semibold text-sm text-[var(--error)] mb-1">
            <AlertTriangle size={14} /> Delivery Overdue
          </div>
          <p className="text-xs text-[var(--text)]">Committed delivery date was {formatDisplayDate(po.committedDate)}. Record receipt when material arrives.</p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <h3 className="font-semibold text-sm text-[var(--text)] mb-3">PO Details</h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <Field label="Supplier" value={po.supplierName} />
              <Field label="PO Number" value={po.poNumber} mono />
              <Field label="Raised Date" value={formatDisplayDate(po.raisedDate)} />
              <Field label="Committed Date" value={formatDisplayDate(po.committedDate)} />
              <Field label="Payment Terms" value={po.paymentTerms} />
              <Field label="Total Value" value={`₹${po.totalValue.toLocaleString('en-IN')}`} />
              {pr && <Field label="Originating PR" value={pr.prNumber} mono link={`/procurement/pr/${pr.id}`} navigate={navigate} />}
              {selectedQuotation && <Field label="Selected Quotation" value={selectedQuotation.quoteNumber} mono link={`/procurement/quote/${selectedQuotation.id}`} navigate={navigate} />}
              {po.deliverToSiteName && <Field label="Receiving Site" value={`${po.deliverToSiteName}${po.deliverToStoreName ? ` · ${po.deliverToStoreName}` : ''}`} />}
              {po.directProcurement && po.directProcurementReason && <Field label="Direct Reason" value={po.directProcurementReason} />}
            </dl>
          </div>

          {/* Order Lines */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-between">
              <h3 className="font-semibold text-sm text-[var(--text)]">Order Lines ({lines.length})</h3>
              {totalOrdered > 0 && (
                <span className="text-xs text-[var(--text-3)] font-mono">
                  Received {totalReceived} / {totalOrdered}
                </span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="eoss-table">
                <thead>
                  <tr><th>Material</th><th>Ordered</th><th>Received</th><th>Accepted</th><th>Rejected</th><th>UOM</th><th>Rate</th><th>Value</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {lines.length === 0 ? (
                    <tr><td colSpan={9} className="text-center py-6 text-xs text-[var(--text-3)]">No line items recorded on this PO.</td></tr>
                  ) : lines.map(l => (
                    <tr key={l.id}>
                      <td className="text-sm text-[var(--text)]">
                        <div>{l.materialName}</div>
                        {l.grade && <div className="text-[11px] text-[var(--text-3)]">{l.grade}</div>}
                      </td>
                      <td className="font-mono text-sm font-semibold">{l.orderedQty}</td>
                      <td className="font-mono text-sm">{l.receivedQty}</td>
                      <td className="font-mono text-sm text-[var(--success)]">{l.acceptedQty}</td>
                      <td className="font-mono text-sm text-[var(--error)]">{l.rejectedQty > 0 ? l.rejectedQty : '—'}</td>
                      <td className="text-xs text-[var(--text-2)]">{l.uom}</td>
                      <td className="font-mono text-sm">₹{l.rate}</td>
                      <td className="font-mono text-sm font-semibold">₹{l.value?.toLocaleString('en-IN') ?? '—'}</td>
                      <td><StatusChip status={l.status} size="sm" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Linked GRNs */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-between">
              <h3 className="font-semibold text-sm text-[var(--text)]">Goods Receipt Notes ({linkedGrns.length})</h3>
            </div>
            {linkedGrns.length === 0 ? (
              <p className="p-4 text-xs text-[var(--text-3)]">No GRNs recorded against {po.poNumber} yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="eoss-table">
                  <thead>
                    <tr><th>GRN #</th><th>Received Date</th><th>Challan</th><th>Qty Summary</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {linkedGrns.map(g => {
                      const recTotal = (g.lines ?? []).reduce((s, l) => s + l.receivedQty, 0);
                      return (
                        <tr key={g.id} className="cursor-pointer hover:bg-[var(--surface-2)]" onClick={() => navigate(`/procurement/grn/${g.id}`)}>
                          <td>
                            <Link to={`/procurement/grn/${g.id}`} onClick={e => e.stopPropagation()} className="font-mono font-bold text-xs text-[var(--brand)] hover:underline">
                              {g.grnNumber}
                            </Link>
                          </td>
                          <td className="text-xs">{formatDisplayDate(g.receivedDate)}</td>
                          <td className="font-mono text-xs">{g.deliveryChallan || '—'}</td>
                          <td className="font-mono text-xs">{recTotal > 0 ? `${recTotal} (${g.lineCount} lines)` : `${g.lineCount} lines`}</td>
                          <td><StatusChip status={g.status} size="sm" /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <h3 className="font-semibold text-sm text-[var(--text)] mb-2">Summary</h3>
            <div className="text-3xl font-bold text-[var(--brand)]">₹{(po.totalValue / 1000).toFixed(1)}k</div>
            <div className="text-xs text-[var(--text-2)] mt-1">{lines.length} line(s) · {linkedGrns.length} GRN(s)</div>
            <div className="mt-3 pt-3 border-t border-[var(--border)]">
              <StatusChip status={po.status} />
            </div>
          </div>

          {canRecordGrn && (
            <button
              type="button"
              onClick={() => navigate(`/procurement/grn/new?spo=${po.id}`)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[var(--success)] text-white rounded-xl text-sm font-medium hover:opacity-95"
            >
              <Truck size={15} /> Record GRN
            </button>
          )}
          {linkedGrns.length > 0 && (
            <button
              type="button"
              onClick={() => navigate(`/finance/bill/new?spoId=${po.id}&grnId=${linkedGrns[0].id}`)}
              className="w-full flex items-center justify-center gap-2 py-2 border border-[var(--border)] bg-[var(--surface)] text-[var(--brand)] rounded-xl text-xs font-semibold hover:border-[var(--brand)]"
            >
              + Record Supplier Bill
            </button>
          )}
          {!canRecordGrn && canEdit && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-xs text-[var(--text-2)]">
              {po.status === 'received' || !hasRemainingQty
                ? 'All ordered quantities have been received.'
                : po.status === 'cancelled'
                  ? 'Cancelled Supplier POs cannot receive goods.'
                  : po.status === 'awaiting_supplier_confirmation' || po.status === 'sent'
                    ? 'Awaiting supplier confirmation — confirm supplier acceptance before recording a GRN.'
                    : `Approve/confirm this PO (${po.status}) before recording a GRN.`}
            </div>
          )}

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 space-y-2">
            <h3 className="font-semibold text-sm text-[var(--text)]">
              Bills & Payments ({linkedBills.length} / {linkedSupplierPayments.length})
            </h3>
            {linkedBills.length === 0 && linkedSupplierPayments.length === 0 ? (
              <p className="text-xs text-[var(--text-3)]">No supplier bills or payments recorded yet.</p>
            ) : (
              <div className="space-y-1.5 text-xs">
                {linkedBills.map(b => (
                  <Link
                    key={b.id}
                    to={`/finance/bill/${b.id}`}
                    state={{ from: originUrl }}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded border border-[var(--border)] hover:bg-[var(--surface-2)]"
                  >
                    <div>
                      <span className="font-mono font-semibold text-[var(--brand)]">{b.billNumber}</span>
                      <span className="ml-2 text-[var(--text-3)]">₹{b.totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <StatusChip status={b.status} size="sm" />
                  </Link>
                ))}
                {linkedSupplierPayments.map(p => (
                  <Link
                    key={p.id}
                    to={`/finance/supplier-payment/${p.id}`}
                    state={{ from: originUrl }}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded border border-[var(--border)] hover:bg-[var(--surface-2)]"
                  >
                    <div>
                      <span className="font-mono font-semibold text-emerald-600">{p.paymentNumber}</span>
                      <span className="ml-2 text-[var(--text-3)]">Paid ₹{p.amount.toLocaleString('en-IN')}</span>
                    </div>
                    <StatusChip status={p.status} size="sm" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {amendments.length > 0 && (
        <div className="mt-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
          <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Amendment History</h3>
          <div className="space-y-2">
            {amendments.map(a => (
              <div key={a.id} className="flex items-start justify-between gap-3 rounded-lg border p-3" style={{ borderColor: 'var(--border)' }}>
                <div>
                  <div className="text-sm font-medium text-[var(--text)]">Rev {a.revision} · {a.reason.replace(/_/g, ' ')}</div>
                  <div className="text-xs mt-1 text-[var(--text-2)]">{a.changeNote}</div>
                  <div className="text-xs mt-1 text-[var(--text-3)]">Requested by {a.requestedBy}</div>
                </div>
                <StatusChip status={a.status} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirm}
        title="Cancel Supplier PO"
        body={`Cancel ${po.poNumber}? This cannot be undone. The supplier will need to be informed separately.`}
        confirmLabel="Cancel PO"
        variant="danger"
        onConfirm={handleCancel}
        onCancel={() => setConfirm(false)}
      />

      <div className="mt-5">
        <RecordHistoryPanel
          entityId={po.id}
          entityRef={po.poNumber}
          relatedIds={linkedGrns.map(g => g.id)}
          title="Supplier PO Activity & Audit Trail"
          subtitle="Drafting, issuance, supplier confirmation/decline, amendments, and goods receipts"
        />
      </div>
    </div>
  );
}

function Field({ label, value, mono, link, navigate }: { label: string; value: string; mono?: boolean; link?: string; navigate?: (to: string) => void }) {
  return (
    <div>
      <dt className="text-xs text-[var(--text-3)]">{label}</dt>
      <dd className={`text-sm mt-0.5 ${mono ? 'font-mono' : ''}`}>
        {link && navigate
          ? <button type="button" onClick={() => navigate(link)} className="font-semibold text-[var(--brand)] hover:underline">{value}</button>
          : <span className="text-[var(--text)]">{value}</span>}
      </dd>
    </div>
  );
}

function FileEditIcon() { return <span className="inline-block mr-1">✎</span>; }
