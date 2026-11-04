import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Truck } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';

export default function DispatchDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { dispatches, currentUser, showToast } = useStore();

  const dispatch = dispatches.find(d => d.id === id);
  if (!dispatch) return <div className="p-6 text-[var(--text-2)]">Dispatch not found</div>;

  const canDispatch = ['owner', 'dispatch'].includes(currentUser.role);

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate('/dispatch')} className="text-[var(--text-3)] hover:text-[var(--text)]"><ArrowLeft size={16} /></button>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm font-bold text-[var(--brand)]">{dispatch.dispatchNumber}</span>
            <StatusChip status={dispatch.status} />
          </div>
          <p className="text-sm text-[var(--text-2)] mt-0.5">{dispatch.customerName}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Dispatch Details</h3>
            <dl className="space-y-2.5 text-sm">
              <Field label="Job #" value={dispatch.jobNumber} mono />
              <Field label="Customer PO" value={dispatch.customerPoNumber ?? '—'} mono />
              <Field label="Mode" value={dispatch.mode} />
              {dispatch.courierName && <Field label="Courier" value={dispatch.courierName} />}
              {dispatch.awbNumber && <Field label="AWB / Tracking" value={dispatch.awbNumber} mono />}
              {dispatch.vehicleNumber && <Field label="Vehicle" value={dispatch.vehicleNumber} mono />}
              {dispatch.driverName && <Field label="Driver" value={dispatch.driverName} />}
              {dispatch.dispatchDate && <Field label="Dispatch Date" value={new Date(dispatch.dispatchDate).toLocaleDateString('en-IN')} />}
              {dispatch.eta && <Field label="ETA" value={new Date(dispatch.eta).toLocaleDateString('en-IN')} />}
              {dispatch.deliveredAt && <Field label="Delivered" value={new Date(dispatch.deliveredAt).toLocaleDateString('en-IN')} />}
              {dispatch.invoiceNumber && <Field label="Invoice #" value={dispatch.invoiceNumber} mono />}
              {dispatch.lrNumber && <Field label="LR Number" value={dispatch.lrNumber} mono />}
            </dl>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Quantity</h3>
            <dl className="space-y-2 text-sm">
              <Field label="Dispatched Qty" value={`${dispatch.dispatchedQty} ${dispatch.uom}`} />
              {dispatch.packages && <Field label="Packages" value={String(dispatch.packages)} />}
              {dispatch.grossWeight && <Field label="Gross Weight" value={`${dispatch.grossWeight} kg`} />}
            </dl>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Delivery Address</h3>
            {dispatch.deliveryAddress ? (
              <p className="text-sm text-[var(--text)] whitespace-pre-line">{dispatch.deliveryAddress}</p>
            ) : <p className="text-sm text-[var(--text-3)]">No address recorded</p>}
          </div>

          {canDispatch && dispatch.status === 'ready' && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Dispatch Actions</h3>
              <div className="space-y-2">
                <button onClick={() => showToast({ type: 'success', title: 'Dispatched', body: `${dispatch.dispatchNumber} marked in transit` })} className="w-full py-2.5 bg-[var(--brand)] text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                  <Truck size={14} /> Mark Dispatched
                </button>
                <button className="w-full py-2 border border-[var(--border)] text-[var(--text)] rounded-lg text-sm">Generate E-Way Bill</button>
              </div>
            </div>
          )}

          {dispatch.status === 'in_transit' && canDispatch && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <button onClick={() => showToast({ type: 'success', title: 'Delivered', body: `${dispatch.dispatchNumber} marked as delivered` })} className="w-full py-2.5 bg-[var(--success)] text-white rounded-lg text-sm font-medium">
                Confirm Delivery
              </button>
            </div>
          )}
        </div>
      </div>
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
