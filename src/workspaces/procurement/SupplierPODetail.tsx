import React, { useState } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Truck, Ban, CheckCircle2, Send } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';
import ConfirmModal from '../../components/feedback/ConfirmModal';
import DocumentActions from '../../components/workflow/DocumentActions';
import WorkflowTimeline from '../../components/workflow/WorkflowTimeline';

export default function SupplierPODetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    supplierPos, supplierPoLines, supplierQuotations, purchaseReqs, grns, poAmendments,
    setSupplierPoStatus, resolvePoAmendment, currentUser, showToast,
  } = useStore();
  const [confirm, setConfirm] = useState(false);

  const po = supplierPos.find(p => p.id === id);
  if (!po) return <div className="p-6 text-[var(--text-2)]">Supplier PO not found</div>;

  const lines = supplierPoLines.filter(l => l.spoId === id);
  const linkedGrns = grns.filter(g => g.spoId === po.id);
  const canEdit = ['owner', 'buyer', 'storekeeper'].includes(currentUser.role);
  const canApprove = currentUser.role === 'owner';
  const pr = purchaseReqs.find(p => p.id === po.prId);
  const selectedQuotation = supplierQuotations.find(q => q.id === po.supplierQuotationId || (po.supplierQuotationRef && q.quoteNumber === po.supplierQuotationRef));
  const amendments = poAmendments.filter(a => a.entityType === 'supplier_po' && a.poId === po.id);
  const pendingAmendment = amendments.find(a => a.status === 'pending_approval');
  const returnTo = searchParams.get('from') || '/procurement?tab=spo';
  const workflowStep = po.status === 'received' ? 6 : linkedGrns.length > 0 || po.status === 'partial' || po.status === 'overdue' ? 4 : po.status === 'confirmed' ? 3 : 2;

  const totalOrdered = lines.reduce((s, l) => s + l.orderedQty, 0);
  const totalReceived = lines.reduce((s, l) => s + l.receivedQty, 0);
  const hasRemainingQty = lines.length === 0 || lines.some(l => l.orderedQty * (1 + (l.tolerancePct ?? 0) / 100) - l.receivedQty > 0);
  const canRecordGrn = canEdit && ['confirmed', 'sent', 'partial', 'overdue'].includes(po.status) && hasRemainingQty;

  const handleCancel = () => {
    setSupplierPoStatus(id!, 'cancelled');
    setConfirm(false);
    showToast({ type: 'info', title: 'PO cancelled' });
    navigate('/procurement?tab=spo');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <button onClick={() => navigate(returnTo)} className="text-[var(--text-3)] hover:text-[var(--text)]"><ArrowLeft size={16} /></button>
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
        {canEdit && po.status !== 'cancelled' && po.status !== 'received' && (
          <button onClick={() => setConfirm(true)} className="px-3 py-1.5 border border-[var(--error)] text-[var(--error)] text-sm rounded-lg hover:bg-[var(--error-bg)]">
            <Ban size={14} className="inline mr-1" /> Cancel Supplier PO
          </button>
        )}
        {canEdit && po.status === 'draft' && (
          <button
            onClick={() => {
              setSupplierPoStatus(po.id, 'pending_approval');
              showToast({ type: 'success', title: 'Supplier PO submitted for approval', body: `${po.poNumber} is waiting for owner review.` });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border"
            style={{ borderColor: 'var(--brand)', color: 'var(--brand)' }}
          >
            <Send size={14} /> Submit for Approval
          </button>
        )}
        {canApprove && po.status === 'pending_approval' && (
          <button
            onClick={() => {
              setSupplierPoStatus(po.id, 'confirmed');
              showToast({ type: 'success', title: 'Supplier PO approved and issued', body: `${po.poNumber} is ready for supplier communication.` });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-white"
            style={{ background: 'var(--success,#16A34A)' }}
          >
            <CheckCircle2 size={14} /> Approve & Issue PO
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

      {po.status === 'overdue' && (
        <div className="bg-[var(--error-bg)] border border-[var(--error)] rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 font-semibold text-sm text-[var(--error)] mb-1">
            <AlertTriangle size={14} /> Delivery Overdue
          </div>
          <p className="text-xs text-[var(--text)]">Committed delivery date was {po.committedDate ? new Date(po.committedDate).toLocaleDateString('en-IN') : '—'}. Record receipt when material arrives.</p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <h3 className="font-semibold text-sm text-[var(--text)] mb-3">PO Details</h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <Field label="Supplier" value={po.supplierName} />
              <Field label="PO Number" value={po.poNumber} mono />
              <Field label="Raised Date" value={new Date(po.raisedDate).toLocaleDateString('en-IN')} />
              <Field label="Committed Date" value={po.committedDate ? new Date(po.committedDate).toLocaleDateString('en-IN') : '—'} />
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
                          <td className="text-xs">{new Date(g.receivedDate).toLocaleDateString('en-IN')}</td>
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
          {!canRecordGrn && canEdit && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-xs text-[var(--text-2)]">
              {po.status === 'received' || !hasRemainingQty
                ? 'All ordered quantities have been received.'
                : po.status === 'cancelled'
                  ? 'Cancelled Supplier POs cannot receive goods.'
                  : `Approve/confirm this PO (${po.status}) before recording a GRN.`}
            </div>
          )}
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
