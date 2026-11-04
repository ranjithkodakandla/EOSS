import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Truck, Package, CheckCircle } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';

export default function DispatchDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { dispatches, currentUser, setDispatchStatus, recordPoD } = useStore();

  const dispatch = dispatches.find(d => d.id === id);
  if (!dispatch) return <div className="p-6 text-[var(--text-2)]">Dispatch not found</div>;

  const canDispatch = ['owner', 'dispatch'].includes(currentUser.role);

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate('/dispatch')} className="text-[var(--text-3)] hover:text-[var(--text)]">
          <ArrowLeft size={16} />
        </button>
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
              {(dispatch.jobs ?? []).length > 0 && (
                <div>
                  <dt className="text-xs text-[var(--text-3)]">Jobs</dt>
                  <dd className="text-sm text-[var(--text)] mt-0.5 font-mono">{(dispatch.jobs ?? []).join(', ')}</dd>
                </div>
              )}
              {dispatch.carrier && <Field label="Carrier" value={dispatch.carrier} />}
              {dispatch.vehicleNumber && <Field label="Vehicle" value={dispatch.vehicleNumber} mono />}
              {dispatch.lrNumber && <Field label="LR Number" value={dispatch.lrNumber} mono />}
              {dispatch.dispatchDate && <Field label="Dispatch Date" value={new Date(dispatch.dispatchDate).toLocaleDateString('en-IN')} />}
              {dispatch.expectedDelivery && <Field label="Expected Delivery" value={new Date(dispatch.expectedDelivery).toLocaleDateString('en-IN')} />}
            </dl>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <h3 className="font-semibold text-sm text-[var(--text)] mb-3 flex items-center gap-2">
              <Package size={14} /> Shipment Summary
            </h3>
            <dl className="space-y-2 text-sm">
              {dispatch.totalQty != null && <Field label="Total Qty" value={String(dispatch.totalQty)} />}
              {dispatch.lineCount != null && <Field label="Line Count" value={String(dispatch.lineCount)} />}
              <div>
                <dt className="text-xs text-[var(--text-3)]">Proof of Delivery</dt>
                <dd className="text-sm mt-0.5">
                  {dispatch.hasPoD
                    ? <span className="text-[var(--success)] font-medium flex items-center gap-1"><CheckCircle size={12} /> Received</span>
                    : <span className="text-[var(--text-3)]">Not yet received</span>}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="space-y-4">
          {/* Draft → Pending Docs */}
          {canDispatch && dispatch.status === 'draft' && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Dispatch Actions</h3>
              <button
                onClick={() => setDispatchStatus(dispatch.id, 'pending_docs')}
                className="w-full py-2.5 bg-[var(--brand)] text-white rounded-lg text-sm font-medium"
              >
                Prepare Documents
              </button>
            </div>
          )}

          {/* Pending Docs → Dispatched */}
          {canDispatch && dispatch.status === 'pending_docs' && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Dispatch Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setDispatchStatus(dispatch.id, 'dispatched')}
                  className="w-full py-2.5 bg-[var(--brand)] text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Truck size={14} /> Mark Dispatched
                </button>
                <button className="w-full py-2 border border-[var(--border)] text-[var(--text)] rounded-lg text-sm">
                  Generate E-Way Bill
                </button>
              </div>
            </div>
          )}

          {/* Dispatched → Delivered */}
          {canDispatch && dispatch.status === 'dispatched' && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Transit Actions</h3>
              <button
                onClick={() => setDispatchStatus(dispatch.id, 'delivered')}
                className="w-full py-2.5 bg-[var(--success)] text-white rounded-lg text-sm font-medium"
              >
                Confirm Delivery
              </button>
            </div>
          )}

          {/* Delivered — PoD */}
          {dispatch.status === 'delivered' && (
            <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4">
              <div className="flex items-center gap-2 text-[var(--success)] mb-2">
                <Truck size={16} />
                <span className="text-sm font-semibold">Delivered</span>
              </div>
              {!dispatch.hasPoD && canDispatch && (
                <button
                  onClick={() => recordPoD(dispatch.id)}
                  className="w-full py-2 border border-[var(--border)] text-[var(--text)] rounded-lg text-sm"
                >
                  Record Proof of Delivery
                </button>
              )}
              {dispatch.hasPoD && (
                <p className="text-xs text-[var(--success)] flex items-center gap-1 mt-1">
                  <CheckCircle size={12} /> PoD received
                </p>
              )}
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
