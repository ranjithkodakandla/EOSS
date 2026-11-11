import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, XCircle, Pencil, Plus,
  Scale, FileText, Truck, Award, Paperclip
} from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';
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
  }, 0);
}

export default function PRDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    purchaseReqs, supplierQuotations, supplierPos, grns, currentUser,
    updatePurchaseReq, selectQuotation, generateSPOFromQuotation, showToast,
  } = useStore();

  const pr = purchaseReqs.find(p => p.id === id);
  const [confirming, setConfirming] = useState<'approve' | 'reject' | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [showCompare, setShowCompare] = useState(true);

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
  const selectedQuotation = prQuotations.find(q => q.status === 'selected');
  const linkedSpo = supplierPos.find(s => s.prId === pr.id && s.status !== 'cancelled');
  const linkedGrns = linkedSpo ? grns.filter(g => g.spoId === linkedSpo.id) : [];

  const minQuoteTotal = prQuotations.length > 0 ? Math.min(...prQuotations.map(quoteTotal)) : 0;
  const minDeliveryDays = prQuotations.length > 0 ? Math.min(...prQuotations.map(q => q.deliveryDays)) : 0;

  const handleApprove = () => {
    updatePurchaseReq(pr.id, { status: 'approved' });
    showToast({ type: 'success', title: 'PR Approved', body: `${pr.prNumber} approved.` });
    setConfirming(null);
  };

  const handleReject = () => {
    updatePurchaseReq(pr.id, { status: 'cancelled' });
    showToast({ type: 'info', title: 'PR Rejected', body: rejectNote || 'Requirement cancelled.' });
    setConfirming(null);
  };

  const handleSelectQuote = (quoteId: string) => {
    if (linkedSpo) {
      showToast({ type: 'warning', title: 'PO already issued', body: `Supplier PO ${linkedSpo.poNumber} has already been generated for ${pr.prNumber}.` });
      return;
    }
    selectQuotation(quoteId);
    const chosen = prQuotations.find(q => q.id === quoteId);
    showToast({ type: 'success', title: 'Quotation finalized', body: `${chosen?.quoteNumber} (${chosen?.supplierName}) selected.` });
  };

  const handleGenerateSpo = (quoteId: string) => {
    const res = generateSPOFromQuotation(quoteId);
    if (res.error && !res.spo) {
      showToast({ type: 'error', title: 'Cannot create Supplier PO', body: res.error });
      return;
    }
    if (res.error) {
      showToast({ type: 'warning', title: 'Duplicate prevented', body: res.error });
    }
    if (res.spo) {
      navigate(`/procurement/spo/${res.spo.id}`);
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
          <button type="button" onClick={() => navigate('/procurement?tab=pr')} className="p-1.5 rounded-lg hover:bg-[var(--surface-2)] mt-0.5">
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
            {!linkedSpo && pr.status !== 'cancelled' && (
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
              {!linkedSpo && pr.status !== 'cancelled' && (
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
                    return (
                      <tr key={q.id}>
                        <td>
                          <Link to={`/procurement/quote/${q.id}`} className="font-mono text-xs font-bold text-[var(--brand)] hover:underline">
                            {q.quoteNumber}
                          </Link>
                        </td>
                        <td className="font-medium text-sm">{q.supplierName}</td>
                        <td className="font-mono text-right font-semibold">
                          {fmtMoney(total)}
                          {isLowest && <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-[var(--success-bg)] text-[var(--success)] font-sans font-semibold">Lowest</span>}
                        </td>
                        <td className="font-mono text-right text-xs">
                          {q.deliveryDays}d
                          {isFastest && <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-[var(--info-bg)] text-[var(--info)] font-sans font-semibold">Fastest</span>}
                        </td>
                        <td className="text-xs">{q.paymentTerms}</td>
                        <td className="text-xs">{q.lines.some(l => l.freightIncluded === false) ? 'Extra' : 'Included'}</td>
                        <td className="text-xs">{fmt(q.validUntil)}</td>
                        <td><StatusChip status={q.status} size="sm" /></td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {q.status !== 'selected' && !linkedSpo && canApprove && (
                              <button type="button" onClick={() => handleSelectQuote(q.id)} className="px-2.5 py-1 rounded border text-xs font-semibold border-[var(--brand)] text-[var(--brand)] hover:bg-[var(--brand)] hover:text-white transition-colors">
                                Select
                              </button>
                            )}
                            {q.status === 'selected' && !linkedSpo && canApprove && (
                              <button type="button" onClick={() => handleGenerateSpo(q.id)} className="px-2.5 py-1 rounded text-xs font-semibold text-white" style={{ background: 'var(--success)' }}>
                                Create SPO
                              </button>
                            )}
                            <Link to={`/procurement/quote/${q.id}`} className="btn-ghost text-xs py-1 px-2">View</Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {showCompare && prQuotations.length >= 2 && (
            <div className="rounded-xl border p-4 space-y-2 bg-[var(--surface-2)] border-[var(--border)]">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--text)]">
                <Scale size={14} className="text-[var(--brand)]" />
                Side-by-Side Line Item Comparison ({prQuotations.length} Vendors)
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-[var(--text-3)] text-left">
                      <th className="py-1.5 pr-3">Material</th>
                      {prQuotations.map(q => (
                        <th key={q.id} className="py-1.5 px-3">
                          {q.supplierName} ({q.quoteNumber})
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(lines.length > 0 ? lines.map(l => l.description || l.materialName) : Array.from(new Set(prQuotations.flatMap(q => q.lines.map(l => l.materialName))))).map((matName, idx) => (
                      <tr key={idx} className="border-b border-[var(--border)]/60">
                        <td className="py-2 pr-3 font-medium text-[var(--text)]">{matName}</td>
                        {prQuotations.map(q => {
                          const match = q.lines.find(l => l.materialName.toLowerCase() === matName.toLowerCase()) ?? q.lines[idx];
                          if (!match) return <td key={q.id} className="py-2 px-3 text-[var(--text-3)]">—</td>;
                          const rate = match.unitPrice ?? match.unitRate ?? 0;
                          return (
                            <td key={q.id} className="py-2 px-3 font-mono text-[var(--text)]">
                              ₹{rate.toLocaleString('en-IN')}/{match.uom} × {match.quotedQty ?? match.orderedQty} = ₹{(match.lineTotal || 0).toLocaleString('en-IN')}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
            <p className="text-sm text-[var(--text-2)] mb-3">This will cancel {pr.prNumber}.</p>
            <textarea className="eoss-input w-full mb-4" rows={2} placeholder="Reason for rejection..." value={rejectNote} onChange={e => setRejectNote(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={() => setConfirming(null)} className="flex-1 py-2 border border-[var(--border)] text-[var(--text)] rounded-lg text-sm">Cancel</button>
              <button onClick={handleReject} className="flex-1 py-2 text-white rounded-lg text-sm font-semibold" style={{ background: 'var(--error,#DC2626)' }}>Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
