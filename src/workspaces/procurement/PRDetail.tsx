import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';
import type { SupplierPO } from '../../types';

const fmt = (d: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const fmtMoney = (n: number) => n ? `₹${n.toLocaleString('en-IN')}` : '—';

let spoSeq = 200;

export default function PRDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { purchaseReqs, supplierPos, currentUser, updatePurchaseReq, addSupplierPO, showToast } = useStore();

  const pr = purchaseReqs.find(p => p.id === id) as (typeof purchaseReqs[0] & Record<string, any>) | undefined;
  const [confirming, setConfirming] = useState<'approve' | 'reject' | 'convert' | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  if (!pr) return (
    <div className="p-8 text-center text-sm text-[var(--text-2)]">
      PR not found. <Link to="/procurement?tab=pr" className="text-[var(--brand)] underline">Back</Link>
    </div>
  );

  const canApprove = ['owner', 'buyer'].includes(currentUser.role);
  const lines: any[] = pr.lines ?? [];
  const totalEstValue = lines.reduce((s: number, l: any) => s + (l.targetRate ?? 0) * (l.requiredQty ?? 0), 0);
  const linkedSpo = supplierPos.find(s => s.prId === pr.id);

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

  const handleConvert = () => {
    const seq = ++spoSeq;
    const spoId = `spo-pr-${seq}`;
    const spo: SupplierPO = {
      id: spoId,
      poNumber: `SPO-${String(seq).padStart(4, '0')}`,
      supplierId: 'supp-tbd',
      supplierName: 'TBD — Pending Vendor Selection',
      raisedDate: '2026-11-05',
      committedDate: pr.requiredBy,
      status: 'draft',
      totalValue: totalEstValue,
      currency: 'INR',
      paymentTerms: 'Net 30',
      prId: pr.id,
      jobRef: pr.jobNumber,
      lineCount: lines.length,
    };
    addSupplierPO(spo);
    updatePurchaseReq(pr.id, { status: 'converted' });
    showToast({ type: 'success', title: 'SPO Created', body: `${spo.poNumber} raised from ${pr.prNumber}.` });
    setConfirming(null);
    navigate(`/procurement/spo/${spoId}`);
  };

  const statusColor: Record<string, string> = {
    draft: 'var(--text-2)',
    pending: 'var(--warning,#D97706)',
    approved: 'var(--success,#16A34A)',
    converted: 'var(--brand)',
    cancelled: 'var(--error,#DC2626)',
  };

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="flex items-start gap-3">
          <button onClick={() => navigate('/procurement?tab=pr')} className="p-1.5 rounded-lg hover:bg-[var(--surface-2)] mt-0.5">
            <ArrowLeft size={18} className="text-[var(--text-2)]" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm font-bold" style={{ color: 'var(--brand)' }}>{pr.prNumber}</span>
              <StatusChip status={pr.status} size="sm" />
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'var(--surface-2)', color: statusColor[pr.priority] ?? 'var(--text-2)' }}>
                {pr.priority.charAt(0).toUpperCase() + pr.priority.slice(1)} Priority
              </span>
            </div>
            <div className="text-xs text-[var(--text-2)] mt-1">
              Raised by <strong>{pr.raisedBy}</strong> · {fmt(pr.raisedDate)} · Required by <strong>{fmt(pr.requiredBy)}</strong>
              {pr.jobNumber && <> · Job: <span className="font-mono">{pr.jobNumber}</span></>}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-shrink-0">
            {pr.status === 'pending' && canApprove && (
              <>
                <button onClick={() => setConfirming('reject')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold"
                  style={{ borderColor: 'var(--error,#DC2626)', color: 'var(--error,#DC2626)' }}>
                  <XCircle size={13} /> Reject
                </button>
                <button onClick={() => setConfirming('approve')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                  style={{ background: 'var(--success,#16A34A)' }}>
                  <CheckCircle2 size={13} /> Approve
                </button>
              </>
            )}
            {pr.status === 'approved' && canApprove && !linkedSpo && (
              <button onClick={() => setConfirming('convert')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                style={{ background: 'var(--brand)' }}>
                <ChevronRight size={13} /> Convert to SPO
              </button>
            )}
            {linkedSpo && (
              <Link to={`/procurement/spo/${linkedSpo.id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                style={{ background: 'var(--surface-2)', color: 'var(--brand)', border: '1px solid var(--border)' }}>
                SPO: <span className="font-mono">{linkedSpo.poNumber}</span> →
              </Link>
            )}
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {[
            { label: 'Lines', value: `${lines.length} item${lines.length !== 1 ? 's' : ''}` },
            { label: 'Total Qty', value: pr.totalQty.toString() },
            { label: 'Est. Value', value: fmtMoney(totalEstValue) },
            { label: 'Purpose', value: pr.purpose || '—' },
          ].map((c, i) => (
            <div key={i} className="rounded-lg border p-3" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
              <div className="text-[11px] text-[var(--text-3)]">{c.label}</div>
              <div className="text-sm font-semibold text-[var(--text)] mt-0.5 truncate">{c.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto p-6 space-y-5">
        {/* Lines table */}
        <div>
          <h2 className="text-sm font-bold text-[var(--text)] mb-3">Material Lines</h2>
          {lines.length === 0 ? (
            <p className="text-sm text-[var(--text-3)]">No lines recorded (legacy PR).</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border)' }}>
              <table className="eoss-table">
                <thead>
                  <tr>
                    <th>#</th><th>Code</th><th>Description</th><th>Qty</th><th>UOM</th><th>Target Rate</th><th>Est. Value</th><th>Req. By</th><th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l: any, i: number) => (
                    <tr key={l.id ?? i}>
                      <td className="text-xs text-[var(--text-3)]">{i + 1}</td>
                      <td className="font-mono text-xs">{l.materialCode || '—'}</td>
                      <td className="text-sm">{l.description}</td>
                      <td className="font-mono text-right">{l.requiredQty}</td>
                      <td>{l.uom}</td>
                      <td className="font-mono text-right">{l.targetRate ? fmtMoney(l.targetRate) : '—'}</td>
                      <td className="font-mono text-right">{l.targetRate && l.requiredQty ? fmtMoney(l.targetRate * l.requiredQty) : '—'}</td>
                      <td className="text-xs text-[var(--text-2)]">{l.requiredBy ? fmt(l.requiredBy) : '—'}</td>
                      <td className="text-xs text-[var(--text-2)]">{l.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
                {totalEstValue > 0 && (
                  <tfoot>
                    <tr>
                      <td colSpan={6} className="text-right text-xs font-bold text-[var(--text-2)] pr-2">Total Est. Value</td>
                      <td className="font-mono text-sm font-bold text-right">{fmtMoney(totalEstValue)}</td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </div>

        {/* Meta */}
        {pr.notes && (
          <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <h3 className="text-xs font-bold text-[var(--text-3)] uppercase tracking-wider mb-2">Notes</h3>
            <p className="text-sm text-[var(--text-2)]">{pr.notes}</p>
          </div>
        )}
      </div>

      {/* Confirmation dialogs */}
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

      {confirming === 'convert' && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl border p-6 w-full max-w-sm shadow-xl" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <h3 className="font-bold text-[var(--text)] mb-2">Convert to Supplier PO?</h3>
            <p className="text-sm text-[var(--text-2)] mb-2">A draft SPO will be created from {pr.prNumber}. You can then assign a vendor and confirm.</p>
            <p className="text-xs text-[var(--text-3)] mb-5">Lines: {lines.length} · Est. value: {fmtMoney(totalEstValue)}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirming(null)} className="flex-1 py-2 border border-[var(--border)] text-[var(--text)] rounded-lg text-sm">Cancel</button>
              <button onClick={handleConvert} className="flex-1 py-2 text-white rounded-lg text-sm font-semibold" style={{ background: 'var(--brand)' }}>Create SPO</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
