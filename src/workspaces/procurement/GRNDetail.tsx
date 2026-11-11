import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, ClipboardCheck } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';
import DocumentActions from '../../components/workflow/DocumentActions';

export default function GRNDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    grns, supplierPoLines, lots, inspections, currentUser,
    rejectGRN, startInspectionForGRN, showToast,
  } = useStore();
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const grn = grns.find(g => g.id === id);
  if (!grn) {
    return (
      <div className="p-6 text-sm text-[var(--text-2)]">
        GRN not found. <Link to="/procurement?tab=grn" className="text-[var(--brand)] underline">Back to Receipts</Link>
      </div>
    );
  }

  const storedLines = grn.lines ?? [];
  const spoLinesFallback = supplierPoLines.filter(l => l.spoId === grn.spoId);
  const grnLots = lots.filter(l => l.grnId === grn.id);
  const linkedInspections = inspections.filter(i => i.grnId === grn.id || grnLots.some(l => l.id === i.lotId));
  const canInspectOrApprove = ['owner', 'storekeeper', 'buyer', 'qc'].includes(currentUser.role);
  const hasHoldLots = grnLots.some(l => l.status === 'qc_hold');

  const handleStartInspection = (lotId?: string) => {
    const ins = startInspectionForGRN(grn.id, lotId);
    if (!ins) {
      showToast({ type: 'error', title: 'Could not start inspection', body: 'No lot or line item available to inspect.' });
      return;
    }
    navigate(`/quality/inspection/${ins.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex items-start gap-3 mb-5 flex-wrap">
        <button
          type="button"
          onClick={() => navigate(`/procurement/spo/${grn.spoId}`)}
          className="text-[var(--text-3)] hover:text-[var(--text)] mt-1"
          title={`Back to ${grn.spoNumber}`}
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-bold text-[var(--text)] font-mono">{grn.grnNumber}</h1>
            <StatusChip status={grn.status} />
          </div>
          <p className="text-sm text-[var(--text-2)]">{grn.supplierName}</p>
          <div className="mt-3">
            <DocumentActions
              documentType="Goods Receipt Note"
              reference={grn.grnNumber}
              date={grn.receivedDate}
              partyName={grn.supplierName}
              status={grn.status}
              lines={storedLines.length > 0
                ? storedLines.map(l => ({ description: l.materialName, quantity: l.receivedQty, uom: l.uom }))
                : spoLinesFallback.map(l => ({ description: l.materialName, quantity: l.receivedQty, uom: l.uom, amount: l.value }))}
              references={[`Supplier PO: ${grn.spoNumber}`, grn.siteName ? `Site: ${grn.siteName}` : ''].filter(Boolean)}
            />
          </div>
        </div>
        <Link
          to={`/procurement/spo/${grn.spoId}`}
          className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-xs font-mono font-semibold text-[var(--brand)] hover:underline"
        >
          PO: {grn.spoNumber} →
        </Link>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 mb-4">
        <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Receipt Details</h3>
        <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3 text-sm">
          <Field label="GRN Number" value={grn.grnNumber} mono />
          <Field label="Supplier" value={grn.supplierName} />
          <div>
            <dt className="text-xs text-[var(--text-3)]">Originating Supplier PO</dt>
            <dd className="text-sm font-mono mt-0.5">
              <Link to={`/procurement/spo/${grn.spoId}`} className="font-semibold text-[var(--brand)] hover:underline">
                {grn.spoNumber}
              </Link>
            </dd>
          </div>
          <Field label="Received Date" value={new Date(grn.receivedDate).toLocaleDateString('en-IN')} />
          <Field label="Received By" value={grn.receivedBy} />
          {grn.deliveryChallan && <Field label="Delivery Challan" value={grn.deliveryChallan} mono />}
          {grn.vehicleNumber && <Field label="Vehicle" value={grn.vehicleNumber} mono />}
          <Field label="Receiving Site / Store" value={grn.siteName ? `${grn.siteName}${grn.storeLocationName ? ` · ${grn.storeLocationName}` : ''}` : (grn.storeLocationName || '—')} />
          <Field label="Lines Recorded" value={String(grn.lineCount)} />
        </dl>
        {grn.notes && (
          <p className="text-xs text-[var(--text-2)] mt-3 pt-3 border-t border-[var(--border)]">Notes: {grn.notes}</p>
        )}
      </div>

      {/* Received Lines Table */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden mb-4">
        <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-2)]">
          <h3 className="font-semibold text-sm text-[var(--text)]">Received Items</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="eoss-table">
            <thead>
              <tr><th>Material</th><th>Grade</th><th>Ordered</th><th>Prev. Received</th><th>This Receipt</th><th>UOM</th><th>Lots</th></tr>
            </thead>
            <tbody>
              {storedLines.length > 0 ? storedLines.map(l => (
                <tr key={l.id}>
                  <td>
                    <div className="text-sm font-medium">{l.materialName}</div>
                    {l.materialCode && <div className="font-mono text-[11px] text-[var(--text-3)]">{l.materialCode}</div>}
                  </td>
                  <td className="text-xs text-[var(--text-2)]">{l.grade || '—'}</td>
                  <td className="font-mono text-sm">{l.orderedQty}</td>
                  <td className="font-mono text-sm">{l.previouslyReceivedQty}</td>
                  <td className="font-mono text-sm font-semibold">{l.receivedQty}</td>
                  <td className="text-xs text-[var(--text-2)]">{l.uom}</td>
                  <td className="font-mono text-xs">{l.lots.length} lot(s)</td>
                </tr>
              )) : spoLinesFallback.map(l => (
                <tr key={l.id}>
                  <td className="text-sm font-medium">{l.materialName}</td>
                  <td className="text-xs text-[var(--text-2)]">{l.grade || '—'}</td>
                  <td className="font-mono text-sm">{l.orderedQty}</td>
                  <td className="font-mono text-sm">—</td>
                  <td className="font-mono text-sm font-semibold">{l.receivedQty}</td>
                  <td className="text-xs text-[var(--text-2)]">{l.uom}</td>
                  <td className="font-mono text-xs">—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lots Created / Associated */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden mb-4">
        <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-between">
          <h3 className="font-semibold text-sm text-[var(--text)]">Received Material Lots ({grnLots.length})</h3>
          {canInspectOrApprove && hasHoldLots && (
            <button
              type="button"
              onClick={() => handleStartInspection()}
              className="btn-primary text-xs inline-flex items-center gap-1"
            >
              <ClipboardCheck size={13} /> Start Inspection
            </button>
          )}
        </div>
        {grnLots.length === 0 ? (
          <p className="p-4 text-xs text-[var(--text-3)]">No lot records associated with this receipt yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="eoss-table">
              <thead>
                <tr><th>Lot #</th><th>Supplier Lot / Heat</th><th>Material & Grade</th><th>Qty</th><th>Store</th><th>Status</th><th>Inspection</th></tr>
              </thead>
              <tbody>
                {grnLots.map(lot => {
                  const lotIns = linkedInspections.find(i => i.lotId === lot.id);
                  return (
                    <tr key={lot.id}>
                      <td>
                        <Link to={`/inventory/lot/${lot.id}`} className="font-mono font-bold text-xs text-[var(--brand)] hover:underline">
                          {lot.lotNumber}
                        </Link>
                      </td>
                      <td className="font-mono text-xs">{lot.supplierBatchRef || lot.heatNumber || '—'}</td>
                      <td className="text-xs">
                        <div className="font-medium text-[var(--text)]">{lot.materialName}</div>
                        <div className="text-[var(--text-3)]">{lot.grade || 'Standard'}</div>
                      </td>
                      <td className="font-mono text-xs font-semibold">{lot.primaryQty} {lot.primaryUom}</td>
                      <td className="text-xs">{lot.storeLocationName}</td>
                      <td><StatusChip status={lot.status} size="sm" /></td>
                      <td>
                        {lotIns ? (
                          <Link to={`/quality/inspection/${lotIns.id}`} className="font-mono text-xs font-semibold text-[var(--brand)] hover:underline">
                            {lotIns.inspectionNumber} ({lotIns.result})
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleStartInspection(lot.id)}
                            className="text-xs font-semibold text-[var(--brand)] hover:underline"
                          >
                            Start Inspection
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(grn.status === 'pending_qc' || grn.status === 'qc_hold') && (
        <div className="bg-[var(--warning-bg)] border border-[var(--warning)] rounded-xl p-4 mb-4">
          <p className="font-semibold text-sm text-[var(--warning)]">Awaiting Incoming Quality Inspection</p>
          <p className="text-xs text-[var(--text-2)] mt-1">
            Material lots remain in <strong>Quality Hold</strong> and are excluded from freely available stock until inspection accepts them.
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {canInspectOrApprove && (
              <button
                type="button"
                onClick={() => handleStartInspection()}
                className="px-3 py-1.5 bg-[var(--warning)] text-white text-xs rounded-lg font-semibold inline-flex items-center gap-1.5"
              >
                <ClipboardCheck size={13} /> {linkedInspections.length > 0 ? 'Open Inspection' : 'Start Inspection'}
              </button>
            )}
            <button
              type="button"
              onClick={() => setRejectModal(true)}
              className="px-3 py-1.5 border border-[var(--error)] text-[var(--error)] text-xs rounded-lg font-semibold inline-flex items-center gap-1"
            >
              <XCircle size={13} /> Reject GRN
            </button>
          </div>
        </div>
      )}

      {grn.status === 'accepted' && (
        <div className="bg-[var(--success-bg)] border border-[var(--success)] rounded-xl p-4 flex items-center gap-2 text-xs text-[var(--text)]">
          <CheckCircle size={15} className="text-[var(--success)]" />
          <span>GRN accepted — approved lots have entered available inventory.</span>
        </div>
      )}

      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 w-full max-w-sm space-y-3">
            <h3 className="text-sm font-bold text-[var(--text)]">Reject {grn.grnNumber}</h3>
            <p className="text-xs text-[var(--text-2)]">All pending QC lots in this receipt will be segregated out of available inventory.</p>
            <textarea
              rows={3}
              className="eoss-input w-full"
              placeholder="Reason for rejecting this delivery..."
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setRejectModal(false)} className="btn-ghost text-xs">Cancel</button>
              <button
                type="button"
                onClick={() => {
                  rejectGRN(grn.id, currentUser.name, rejectReason);
                  setRejectModal(false);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[var(--error)]"
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

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-[var(--text-3)]">{label}</dt>
      <dd className={`text-sm text-[var(--text)] mt-0.5 ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  );
}
