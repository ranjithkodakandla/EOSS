import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Truck } from 'lucide-react';
import { useStore } from '../../store';
import { SUPPLIER_PO_LINES } from '../../data/seed';
import StatusChip from '../../components/layout/StatusChip';
import ConfirmModal from '../../components/feedback/ConfirmModal';

export default function SupplierPODetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { supplierPos, setSupplierPoStatus, currentUser, showToast } = useStore();
  const [confirm, setConfirm] = useState(false);

  const po = supplierPos.find(p => p.id === id);
  if (!po) return <div className="p-6 text-[var(--text-2)]">PO not found</div>;

  const lines = SUPPLIER_PO_LINES.filter(l => l.spoId === id);
  const canEdit = ['owner', 'buyer'].includes(currentUser.role);

  const handleCancel = () => {
    setSupplierPoStatus(id!, 'cancelled');
    setConfirm(false);
    showToast({ type: 'info', title: 'PO cancelled' });
    navigate('/procurement');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate('/procurement')} className="text-[var(--text-3)] hover:text-[var(--text)]"><ArrowLeft size={16} /></button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-bold text-[var(--text)] font-mono">{po.poNumber}</h1>
            <StatusChip status={po.status} />
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
            Cancel PO
          </button>
        )}
      </div>

      {po.status === 'overdue' && (
        <div className="bg-[var(--error-bg)] border border-[var(--error)] rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 font-semibold text-sm text-[var(--error)] mb-1">
            <AlertTriangle size={14} /> Delivery Overdue
          </div>
          <p className="text-xs text-[var(--text)]">Committed delivery date was {po.committedDate ? new Date(po.committedDate).toLocaleDateString('en-IN') : '—'}. No delivery received. Contact supplier immediately.</p>
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
              {po.jobRef && <Field label="Job Reference" value={po.jobRef} mono />}
            </dl>
          </div>

          {/* Lines */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-2)]">
              <h3 className="font-semibold text-sm text-[var(--text)]">Order Lines ({lines.length})</h3>
            </div>
            <table className="eoss-table">
              <thead>
                <tr><th>Material</th><th>Ordered</th><th>Received</th><th>Accepted</th><th>Rejected</th><th>UOM</th><th>Rate</th><th>Value</th><th>Status</th></tr>
              </thead>
              <tbody>
                {lines.map(l => (
                  <tr key={l.id}>
                    <td className="text-sm text-[var(--text)]">{l.materialName}</td>
                    <td className="font-mono text-sm font-semibold">{l.orderedQty}</td>
                    <td className="font-mono text-sm">{l.receivedQty}</td>
                    <td className="font-mono text-sm text-[var(--success)]">{l.acceptedQty}</td>
                    <td className="font-mono text-sm text-[var(--error)]">{l.rejectedQty > 0 ? l.rejectedQty : '—'}</td>
                    <td className="text-xs text-[var(--text-2)]">{l.uom}</td>
                    <td className="font-mono text-sm">₹{l.rate}</td>
                    <td className="font-mono text-sm font-semibold">₹{l.value?.toLocaleString() ?? '—'}</td>
                    <td><StatusChip status={l.status} size="sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <h3 className="font-semibold text-sm text-[var(--text)] mb-2">Summary</h3>
            <div className="text-3xl font-bold text-[var(--brand)]">₹{(po.totalValue / 1000).toFixed(1)}k</div>
            <div className="text-xs text-[var(--text-2)] mt-1">{lines.length} lines</div>
            <div className="mt-3 pt-3 border-t border-[var(--border)]">
              <StatusChip status={po.status} />
            </div>
          </div>

          {canEdit && po.status === 'confirmed' && (
            <button
              onClick={() => navigate(`/procurement/grn/new?spo=${po.id}`)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[var(--success)] text-white rounded-xl text-sm font-medium"
            >
              <Truck size={15} /> Record GRN
            </button>
          )}
        </div>
      </div>

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

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-[var(--text-3)]">{label}</dt>
      <dd className={`text-sm text-[var(--text)] mt-0.5 ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  );
}
