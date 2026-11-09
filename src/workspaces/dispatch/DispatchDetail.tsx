import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Truck, Package, CheckCircle, Box } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';

export default function DispatchDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { dispatches, currentUser, setDispatchStatus, recordPoD, qualityReleases } = useStore();

  const dispatch = dispatches.find(d => d.id === id);
  if (!dispatch) return <div className="p-6 text-[var(--text-2)]">Dispatch not found</div>;
  const release = dispatch.qualityReleaseId ? qualityReleases.find(r => r.id === dispatch.qualityReleaseId) : null;

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
              {dispatch.customerPoNumber && <Field label="Customer PO" value={dispatch.customerPoNumber} mono />}
              {dispatch.jobNumber && <Field label="Job" value={dispatch.jobNumber} mono />}
              {dispatch.destination && <Field label="Destination" value={dispatch.destination} />}
              {dispatch.sourceStoreLocationName && <Field label="Source Location" value={dispatch.sourceStoreLocationName} />}
              {dispatch.carrier && <Field label="Carrier" value={dispatch.carrier} />}
              {dispatch.vehicleNumber && <Field label="Vehicle" value={dispatch.vehicleNumber} mono />}
              {dispatch.driverName && <Field label="Driver" value={dispatch.driverName} />}
              {dispatch.lrNumber && <Field label="LR / Consignment No." value={dispatch.lrNumber} mono />}
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
                <dt className="text-xs text-[var(--text-3)]">Quality Release</dt>
                <dd className="text-sm mt-0.5">
                  {release
                    ? <button onClick={() => navigate(`/quality/inspection/${release.inspectionId}`)} className="text-[var(--success)] font-medium flex items-center gap-1 hover:underline"><CheckCircle size={12} /> {release.id} — released by {release.releasedBy}</button>
                    : <span className="text-[var(--text-3)]">No linked release</span>}
                </dd>
              </div>
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

          {dispatch.packages && dispatch.packages.length > 0 && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <h3 className="font-semibold text-sm text-[var(--text)] mb-3 flex items-center gap-2">
                <Box size={14} /> Packages ({dispatch.packages.length})
              </h3>
              <div className="space-y-2">
                {dispatch.packages.map(p => (
                  <div key={p.id} className="p-3 rounded-lg bg-[var(--surface-muted)] border border-[var(--border)] text-xs space-y-1">
                    <div className="flex items-center justify-between font-semibold text-[var(--text)]">
                      <span className="font-mono">{p.packageCode}</span>
                      <span>{p.packageType}</span>
                    </div>
                    <div className="text-[var(--text-2)]">{p.productDescription}</div>
                    <div className="flex items-center gap-3 text-[var(--text-3)]">
                      <span>Qty: {p.qty} {p.uom}</span>
                      {p.weightKg != null && <span>Weight: {p.weightKg} kg</span>}
                      {p.lengthMm && <span>{p.lengthMm}×{p.widthMm}×{p.heightMm} mm</span>}
                    </div>
                    {p.packingNotes && <div className="text-[var(--text-3)] italic">{p.packingNotes}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Draft → Pending Docs */}
          {canDispatch && dispatch.status === 'draft' && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Dispatch Actions</h3>
              <button
                onClick={() => setDispatchStatus(dispatch.id, 'pending_docs')}
                className="w-full py-2.5 bg-[var(--brand-fill)] text-white rounded-lg text-sm font-medium"
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
                  className="w-full py-2.5 bg-[var(--brand-fill)] text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Truck size={14} /> Mark Dispatched
                </button>
                <button className="w-full py-2 border border-[var(--border)] text-[var(--text)] rounded-lg text-sm">
                  Generate E-Way Bill
                </button>
              </div>
            </div>
          )}

          {/* Dispatched → In Transit → Delivered */}
          {canDispatch && dispatch.status === 'dispatched' && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Transit Actions</h3>
              <button
                onClick={() => setDispatchStatus(dispatch.id, 'in_transit')}
                className="w-full py-2.5 border border-[var(--border)] text-[var(--text)] rounded-lg text-sm font-medium mb-2"
              >
                Mark In Transit
              </button>
              <button
                onClick={() => setDispatchStatus(dispatch.id, 'delivered')}
                className="w-full py-2.5 bg-[var(--success)] text-white rounded-lg text-sm font-medium"
              >
                Confirm Delivery
              </button>
            </div>
          )}

          {canDispatch && dispatch.status === 'in_transit' && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Transit Actions</h3>
              <button
                onClick={() => setDispatchStatus(dispatch.id, 'delivered')}
                className="w-full py-2.5 bg-[var(--success)] text-white rounded-lg text-sm font-medium mb-2"
              >
                Confirm Delivery
              </button>
              <button
                onClick={() => setDispatchStatus(dispatch.id, 'delayed')}
                className="w-full py-2 border border-[var(--warning)] text-[var(--warning)] rounded-lg text-sm"
              >
                Report Delay
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
