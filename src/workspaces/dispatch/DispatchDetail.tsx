import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Truck, Package, CheckCircle, Box, FileText, Plus } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';
import RecordHistoryPanel from '../../components/workflow/RecordHistoryPanel';
import type { Dispatch } from '../../types';

export default function DispatchDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { dispatches, currentUser, setDispatchStatus, recordPoD, qualityReleases, invoices, customerPos, inspections, jobs } = useStore();

  const dispatch = dispatches.find(d => d.id === id);
  const [deliveredDate, setDeliveredDate] = useState(dispatch?.actualDeliveryDate || '2026-11-12');
  const [receivedByName, setReceivedByName] = useState(dispatch?.receivedByName || '');
  const [condition, setCondition] = useState<NonNullable<Dispatch['deliveryCondition']>>(dispatch?.deliveryCondition || 'good');
  const [podReference, setPodReference] = useState(dispatch?.podReference || '');
  const [deliveryNotes, setDeliveryNotes] = useState(dispatch?.deliveryNotes || '');

  if (!dispatch) return <div className="p-6 text-[var(--text-2)]">Dispatch not found</div>;
  const release = dispatch.qualityReleaseId ? qualityReleases.find(r => r.id === dispatch.qualityReleaseId) : null;
  const relevantJob = dispatch.jobNumber ? jobs.find(j => j.jobNumber === dispatch.jobNumber) : undefined;
  const failedInspection = inspections.find(
    i => (i.jobNumber === dispatch.jobNumber || (relevantJob && i.jobId === relevantJob.id)) && i.result === 'fail'
  );
  const isQCGateBlocked = Boolean(failedInspection && !release);

  const linkedPO = dispatch.customerPoId
    ? customerPos.find(p => p.id === dispatch.customerPoId)
    : dispatch.customerPoNumber
    ? customerPos.find(p => p.poNumber === dispatch.customerPoNumber)
    : undefined;
  const linkedInvoices = invoices.filter(
    inv => inv.dispatchIds?.includes(dispatch.id) || (linkedPO && inv.poId === linkedPO.id),
  );

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
          {/* Quality Inspection Gate Blocker */}
          {isQCGateBlocked && (
            <div className="p-4 rounded-xl border border-rose-300 bg-rose-50 text-rose-900 space-y-2.5 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-sm text-rose-800">
                <Box size={16} className="text-rose-600" /> Dispatch Blocked — Quality Inspection Gate Active
              </div>
              <p className="text-xs leading-relaxed text-rose-700">
                Dispatch execution is locked because final inspection <strong>{failedInspection?.inspectionNumber}</strong> failed dimensional tolerances.
                {failedInspection?.ncrNumber ? ` Linked Non-Conformance: ${failedInspection.ncrNumber}.` : ''}
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => navigate(`/quality/inspection/${failedInspection?.id}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm"
                >
                  Review Inspection & Authorize QA Concession →
                </button>
              </div>
            </div>
          )}

          {/* Draft → Pending Docs */}
          {canDispatch && dispatch.status === 'draft' && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Dispatch Actions</h3>
              <button
                disabled={isQCGateBlocked}
                onClick={() => setDispatchStatus(dispatch.id, 'pending_docs')}
                className="w-full py-2.5 bg-[var(--brand-fill)] text-white rounded-lg text-sm font-medium disabled:opacity-40"
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
                  disabled={isQCGateBlocked}
                  onClick={() => setDispatchStatus(dispatch.id, 'dispatched')}
                  className="w-full py-2.5 bg-[var(--brand-fill)] text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  <Truck size={14} /> Mark Dispatched
                </button>
                <button
                  disabled={isQCGateBlocked}
                  className="w-full py-2 border border-[var(--border)] text-[var(--text)] rounded-lg text-sm disabled:opacity-40"
                >
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

          {/* Delivered — Delivery Confirmation & PoD */}
          {(dispatch.status === 'delivered' || dispatch.status === 'delivery_confirmed' || dispatch.status === 'dispatched' || dispatch.status === 'in_transit' || dispatch.hasPoD) && (
            <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[var(--success)]">
                  <Truck size={16} />
                  <span className="text-sm font-semibold">
                    {dispatch.hasPoD ? 'Delivery Confirmed (PoD)' : 'Delivery Confirmation & PoD'}
                  </span>
                </div>
                {dispatch.podReference && (
                  <span className="text-xs font-mono text-[var(--text-3)]">{dispatch.podReference}</span>
                )}
              </div>

              {dispatch.hasPoD ? (
                <div className="space-y-1.5 text-xs text-[var(--text-2)]">
                  <p className="text-[var(--success)] flex items-center gap-1 font-medium">
                    <CheckCircle size={12} /> Proof of delivery confirmed
                  </p>
                  <p>Delivered Date: <strong>{dispatch.actualDeliveryDate || dispatch.dispatchDate}</strong></p>
                  {dispatch.receivedByName && <p>Received By: <strong>{dispatch.receivedByName}</strong></p>}
                  {dispatch.deliveryCondition && <p>Condition: <strong className="capitalize">{dispatch.deliveryCondition.replace('_', ' ')}</strong></p>}
                  {dispatch.deliveryNotes && <p className="text-[var(--text-3)]">{dispatch.deliveryNotes}</p>}
                </div>
              ) : canDispatch ? (
                <div className="space-y-2.5 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-[var(--text-3)] mb-1">Delivered Date</label>
                      <input
                        type="date"
                        value={deliveredDate}
                        onChange={e => setDeliveredDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text)]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[var(--text-3)] mb-1">Condition</label>
                      <select
                        value={condition}
                        onChange={e => setCondition(e.target.value as NonNullable<Dispatch['deliveryCondition']>)}
                        className="w-full px-2.5 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text)]"
                      >
                        <option value="good">Good — Full Qty</option>
                        <option value="shortage">Shortage Reported</option>
                        <option value="partial_damage">Partial Damage</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-[var(--text-3)] mb-1">Received By</label>
                      <input
                        type="text"
                        placeholder="Customer receiver name"
                        value={receivedByName}
                        onChange={e => setReceivedByName(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text)]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[var(--text-3)] mb-1">PoD Reference</label>
                      <input
                        type="text"
                        placeholder={`POD-${dispatch.dispatchNumber}`}
                        value={podReference}
                        onChange={e => setPodReference(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text)]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] text-[var(--text-3)] mb-1">Delivery Notes</label>
                    <input
                      type="text"
                      placeholder="Optional site unloading remarks"
                      value={deliveryNotes}
                      onChange={e => setDeliveryNotes(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text)]"
                    />
                  </div>
                  <button
                    onClick={() =>
                      recordPoD(dispatch.id, {
                        deliveredDate,
                        receivedByName: receivedByName.trim() || undefined,
                        condition,
                        podReference: podReference.trim() || undefined,
                        notes: deliveryNotes.trim() || undefined,
                      })
                    }
                    className="w-full py-2 bg-[var(--success)] text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity"
                  >
                    Confirm Delivery &amp; Record PoD
                  </button>
                </div>
              ) : null}
            </div>
          )}

          {/* Customer Invoicing */}
          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[var(--text)]">
                <FileText size={15} className="text-[var(--brand)]" />
                <span className="text-sm font-semibold">Customer Invoicing</span>
              </div>
              {linkedPO && (
                <Link
                  to={`/finance/invoice/new?poId=${linkedPO.id}&dispatchId=${dispatch.id}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-[var(--brand-fill)] text-white rounded-lg text-xs font-semibold hover:opacity-90"
                >
                  <Plus size={12} /> Create Invoice
                </Link>
              )}
            </div>
            {linkedInvoices.length === 0 ? (
              <p className="text-xs text-[var(--text-3)]">
                {linkedPO ? 'Ready to create tax invoice from this dispatch.' : 'Link a Customer PO to raise an invoice.'}
              </p>
            ) : (
              <div className="space-y-1.5">
                {linkedInvoices.map(inv => (
                  <Link
                    key={inv.id}
                    to={`/finance/invoice/${inv.id}`}
                    className="flex items-center justify-between px-2.5 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--brand)] text-xs"
                  >
                    <span className="font-mono font-semibold text-[var(--brand)]">{inv.invoiceNumber}</span>
                    <StatusChip status={inv.status} size="sm" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <RecordHistoryPanel
          entityId={dispatch.id}
          entityRef={dispatch.dispatchNumber}
          relatedIds={[...(linkedPO ? [linkedPO.id] : []), ...linkedInvoices.map(i => i.id)]}
          title="Dispatch & Delivery Activity History"
          subtitle="Dispatch creation, status updates, PoD confirmation, and customer billing events"
        />
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
