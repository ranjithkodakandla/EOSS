import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { useStore } from '../../store';
import { SUPPLIER_PO_LINES } from '../../data/seed';
import StatusChip from '../../components/layout/StatusChip';
import DocumentActions from '../../components/workflow/DocumentActions';

export default function GRNDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { grns, currentUser, showToast } = useStore();

  const grn = grns.find(g => g.id === id);
  if (!grn) return <div className="p-6 text-[var(--text-2)]">GRN not found</div>;

  const lines = SUPPLIER_PO_LINES.filter(l => l.spoId === grn.spoId);
  const canApprove = ['owner', 'storekeeper', 'buyer'].includes(currentUser.role);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate('/procurement')} className="text-[var(--text-3)] hover:text-[var(--text)]"><ArrowLeft size={16} /></button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-[var(--text)] font-mono">{grn.grnNumber}</h1>
            <StatusChip status={grn.status} />
          </div>
          <p className="text-sm text-[var(--text-2)]">{grn.supplierName}</p>
          <div className="mt-3"><DocumentActions documentType="Goods Receipt Note" reference={grn.grnNumber} date={grn.receivedDate} partyName={grn.supplierName} status={grn.status} lines={lines.map(l => ({ description: l.materialName, quantity: l.receivedQty, uom: l.uom, amount: l.value }))} references={[`Supplier PO: ${grn.spoNumber}`]} /></div>
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 mb-4">
        <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Receipt Details</h3>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <Field label="GRN Number" value={grn.grnNumber} mono />
          <Field label="Supplier" value={grn.supplierName} />
          <Field label="PO Reference" value={grn.spoNumber} mono />
          <Field label="Received Date" value={new Date(grn.receivedDate).toLocaleDateString('en-IN')} />
          <Field label="Received By" value={grn.receivedBy} />
          {grn.deliveryChallan && <Field label="Delivery Challan" value={grn.deliveryChallan} mono />}
          {grn.vehicleNumber && <Field label="Vehicle" value={grn.vehicleNumber} mono />}
          <Field label="Lines" value={String(grn.lineCount)} />
        </dl>
      </div>

      {lines.length > 0 && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden mb-4">
          <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-2)]">
            <h3 className="font-semibold text-sm text-[var(--text)]">Line Items</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="eoss-table">
              <thead><tr><th>Material</th><th>Ordered</th><th>Received</th><th>Accepted</th><th>Rejected</th><th>UOM</th><th>Status</th></tr></thead>
              <tbody>
                {lines.map(l => (
                  <tr key={l.id}>
                    <td className="text-sm">{l.materialName}</td>
                    <td className="font-mono text-sm">{l.orderedQty}</td>
                    <td className="font-mono text-sm">{l.receivedQty}</td>
                    <td className="font-mono text-sm text-[var(--success)]">{l.acceptedQty}</td>
                    <td className="font-mono text-sm text-[var(--error)]">{l.rejectedQty}</td>
                    <td className="text-xs text-[var(--text-2)]">{l.uom}</td>
                    <td><StatusChip status={l.status} size="sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {grn.status === 'pending_qc' && (
        <div className="bg-[var(--warning-bg)] border border-[var(--warning)] rounded-xl p-4 mb-4">
          <p className="font-semibold text-sm text-[var(--warning)]">Pending QC Inspection</p>
          <p className="text-xs text-[var(--text-2)] mt-1">This GRN is waiting for incoming inspection. Navigate to Quality to record inspection results.</p>
          <button onClick={() => navigate('/quality')} className="mt-2 px-3 py-1.5 bg-[var(--warning)] text-white text-xs rounded-lg font-medium">Go to Quality</button>
        </div>
      )}

      {canApprove && grn.status === 'pending_qc' && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
          <h3 className="font-semibold text-sm text-[var(--text)] mb-3">GRN Actions</h3>
          <div className="flex gap-2">
            <button
              onClick={() => showToast({ type: 'success', title: 'GRN Accepted', body: `${grn.grnNumber} accepted and stock updated` })}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--success)] text-white rounded-lg text-sm font-medium"
            >
              <CheckCircle size={14} /> Accept GRN
            </button>
            <button
              onClick={() => showToast({ type: 'error', title: 'GRN Rejected', body: `${grn.grnNumber} rejected — materials returned to supplier` })}
              className="flex items-center gap-2 px-4 py-2 border border-[var(--error)] text-[var(--error)] rounded-lg text-sm font-medium"
            >
              <XCircle size={14} /> Reject GRN
            </button>
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
