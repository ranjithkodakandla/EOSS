import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, AlertTriangle, Search, ChevronRight, X, Pencil, Trash2, Send } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';
import type { SupplierPO, SupplierQuotation } from '../../types';

type ProcTab = 'spo' | 'pr' | 'grn' | 'approvals' | 'quotes';

export default function Procurement() {
  const { supplierPos, grns, approvalRequests, supplierQuotations, purchaseReqs, currentUser, showToast, addSupplierPO, resolveApproval, updateSupplierPo } = useStore();
  const [searchParams] = useSearchParams();
  const [editSpo, setEditSpo] = useState<SupplierPO | null>(null);

  const handleDeleteSpo = (id: string) => {
    const hasGRN = grns.some(g => g.spoId === id);
    if (hasGRN) { showToast({ type: 'error', title: 'Cannot cancel PO', body: 'This PO has GRN records against it.' }); return; }
    updateSupplierPo(id, { status: 'cancelled' });
    showToast({ type: 'success', title: 'Supplier PO cancelled' });
  };
  const navigate = useNavigate();
  const [tab, setTab] = useState<ProcTab>((searchParams.get('tab') as ProcTab) ?? 'spo');
  const [search, setSearch] = useState('');
  const [showNewPO, setShowNewPO] = useState(false);

  const overduePOs = supplierPos.filter(p => p.status === 'overdue').length;
  const pendingApprovals = approvalRequests.filter(a => a.status === 'pending').length;
  const canCreate = ['owner', 'buyer'].includes(currentUser.role);

  const filteredSpo = supplierPos.filter(p =>
    !search || p.poNumber.toLowerCase().includes(search.toLowerCase()) ||
    p.supplierName.toLowerCase().includes(search.toLowerCase())
  );

  const TABS = [
    { id: 'spo' as ProcTab, label: `Supplier POs (${supplierPos.length})` },
    { id: 'pr' as ProcTab, label: `PRs (${purchaseReqs.length})` },
    { id: 'grn' as ProcTab, label: `GRNs (${grns.length})` },
    { id: 'quotes' as ProcTab, label: `Quotations (${supplierQuotations.length})` },
    { id: 'approvals' as ProcTab, label: `Approvals${pendingApprovals > 0 ? ` · ${pendingApprovals}` : ''}` },
  ];
  const [compareQuotes, setCompareQuotes] = useState<SupplierQuotation[] | null>(null);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex-shrink-0 flex items-center gap-3 px-5 py-3 border-b flex-wrap"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
          <input type="text" placeholder="Search PO, supplier…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border outline-none"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text)' }} />
        </div>
        <div className="flex-1" />
        {overduePOs > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{ background: 'var(--error-bg,#FEF2F2)', color: 'var(--error,#DC2626)' }}>
            <AlertTriangle size={13} /> {overduePOs} overdue
          </div>
        )}
        {pendingApprovals > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{ background: 'var(--warning-bg,#FFFBEB)', color: 'var(--warning,#D97706)' }}>
            {pendingApprovals} pending approval
          </div>
        )}
        {canCreate && (
          <>
            <button onClick={() => navigate('/procurement/supplier-return')}
              className="px-3 py-1.5 rounded-lg border text-xs font-medium hover:opacity-80"
              style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}>
              Supplier Return
            </button>
            <button onClick={() => navigate('/procurement/pr/new')}
              className="px-3 py-1.5 rounded-lg border text-xs font-medium hover:opacity-80"
              style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}>
              New PR
            </button>
            <button onClick={() => setShowNewPO(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
              style={{ background: 'var(--brand)' }}>
              <Plus size={13} /> New PO
            </button>
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 flex items-center border-b px-5"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="relative px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap"
            style={{ color: tab === t.id ? 'var(--brand)' : 'var(--text-2)' }}>
            {t.label}
            {tab === t.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full" style={{ background: 'var(--brand)' }} />}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {tab === 'spo' && (
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead style={{ position: 'sticky', top: 0, zIndex: 5 }}>
              <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                {['PO Number', 'Supplier', 'Raised', 'Committed', 'Lines', 'Value', 'Job Ref', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold font-medium" style={{ color: 'var(--text-3)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredSpo.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-sm" style={{ color: 'var(--text-3)' }}>No POs found</td></tr>
              ) : filteredSpo.map(p => (
                <tr key={p.id} className="cursor-pointer"
                  style={{ borderBottom: '1px solid var(--border)', background: p.status === 'overdue' ? 'var(--error-bg,#FEF2F2)' : 'var(--surface)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = p.status === 'overdue' ? 'var(--error-bg,#FEF2F2)' : 'var(--surface)'; }}
                  onClick={() => navigate(`/procurement/spo/${p.id}`)}>
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs font-bold" style={{ color: 'var(--brand)' }}>{p.poNumber}</div>
                    {p.hasAmendment && <div className="text-[11px]" style={{ color: 'var(--warning,#D97706)' }}>Amendment</div>}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text)' }}>{p.supplierName}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{new Date(p.raisedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: p.status === 'overdue' ? 'var(--error,#DC2626)' : 'var(--text-2)', fontWeight: p.status === 'overdue' ? 600 : undefined }}>
                    {p.committedDate ? new Date(p.committedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-center" style={{ color: 'var(--text-2)' }}>{p.lineCount}</td>
                  <td className="px-4 py-3 font-mono text-sm font-semibold" style={{ color: 'var(--text)' }}>₹{(p.totalValue / 1000).toFixed(1)}k</td>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--text-2)' }}>{p.jobRef ?? '—'}</td>
                  <td className="px-4 py-3"><StatusChip status={p.status} size="sm" /></td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      {canCreate && p.status !== 'cancelled' && (
                        <button onClick={() => setEditSpo(p)} className="p-1 rounded hover:bg-[var(--surface-2)]" title="Edit"><Pencil size={12} style={{ color: 'var(--text-3)' }} /></button>
                      )}
                      {canCreate && p.status !== 'cancelled' && (
                        <button onClick={() => handleDeleteSpo(p.id)} className="p-1 rounded hover:bg-[var(--surface-2)]" title="Cancel"><Trash2 size={12} style={{ color: 'var(--error,#DC2626)' }} /></button>
                      )}
                      <ChevronRight size={14} style={{ color: 'var(--text-3)' }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'pr' && (
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead style={{ position: 'sticky', top: 0, zIndex: 5 }}>
              <tr style={{ background: 'var(--surface-2)' }}>
                {['PR Number', 'Raised By', 'Raised Date', 'Required By', 'Job Ref', 'Lines', 'Priority', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold font-medium" style={{ color: 'var(--text-3)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {purchaseReqs.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-sm" style={{ color: 'var(--text-3)' }}>No PRs found</td></tr>
              )}
              {purchaseReqs.map(pr => (
                <tr key={pr.id} className="cursor-pointer" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}
                  onClick={() => navigate(`/procurement/pr/${pr.id}`)}>
                  <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: 'var(--brand)' }}>{pr.prNumber}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--text)' }}>{pr.raisedBy}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{new Date(pr.raisedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{new Date(pr.requiredBy).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-2)' }}>{pr.jobNumber ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-center" style={{ color: 'var(--text-2)' }}>{pr.lineCount}</td>
                  <td className="px-4 py-3"><StatusChip status={pr.priority} size="sm" /></td>
                  <td className="px-4 py-3"><StatusChip status={pr.status} size="sm" /></td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    {pr.status === 'approved' && (
                      <button onClick={() => navigate(`/procurement/supplier-rfq/new?prId=${pr.id}`)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium"
                        style={{ borderColor: 'var(--brand)', color: 'var(--brand)' }}>
                        <Send size={11} /> RFQ
                      </button>
                    )}
                    {pr.status !== 'approved' && <ChevronRight size={14} style={{ color: 'var(--text-3)' }} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'grn' && (
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead style={{ position: 'sticky', top: 0, zIndex: 5 }}>
              <tr style={{ background: 'var(--surface-2)' }}>
                {['GRN Number', 'Supplier', 'PO Ref', 'Received', 'By', 'Challan', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold font-medium" style={{ color: 'var(--text-3)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grns.map(g => (
                <tr key={g.id} className="cursor-pointer" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}
                  onClick={() => navigate(`/procurement/grn/${g.id}`)}>
                  <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: 'var(--brand)' }}>{g.grnNumber}</td>
                  <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text)' }}>{g.supplierName}</td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-2)' }}>{g.spoNumber}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{new Date(g.receivedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{g.receivedBy}</td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-2)' }}>{g.deliveryChallan}</td>
                  <td className="px-4 py-3"><StatusChip status={g.status} size="sm" /></td>
                  <td className="px-4 py-3"><ChevronRight size={14} style={{ color: 'var(--text-3)' }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'quotes' && (
          <div className="p-5">
            <div className="overflow-x-auto">
              <table className="eoss-table">
                <thead><tr><th>Quote #</th><th>Supplier</th><th>Date</th><th>Valid Until</th><th>Lead Time</th><th>Payment Terms</th><th>Total Value</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {supplierQuotations.map(q => {
                    const total = q.lines.reduce((s, l) => s + l.lineTotal, 0);
                    const grouped = supplierQuotations.filter(x => x.prId && x.prId === q.prId);
                    return (
                      <tr key={q.id} style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                        <td className="font-mono text-xs font-bold" style={{ color: 'var(--brand)' }}>{q.quoteNumber}</td>
                        <td className="text-sm font-medium" style={{ color: 'var(--text)' }}>{q.supplierName}</td>
                        <td className="text-xs" style={{ color: 'var(--text-2)' }}>{new Date(q.quoteDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                        <td className="text-xs" style={{ color: 'var(--text-2)' }}>{new Date(q.validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                        <td className="text-xs" style={{ color: 'var(--text-2)' }}>{q.deliveryDays} days</td>
                        <td className="text-xs" style={{ color: 'var(--text-2)' }}>{q.paymentTerms}</td>
                        <td className="font-mono text-sm font-semibold" style={{ color: 'var(--text)' }}>₹{(total / 1000).toFixed(1)}k</td>
                        <td><StatusChip status={q.status} size="sm" /></td>
                        <td>
                          {grouped.length > 1 && (
                            <button onClick={() => setCompareQuotes(grouped)}
                              className="text-xs px-2 py-1 rounded-lg border font-medium transition-colors"
                              style={{ borderColor: 'var(--brand)', color: 'var(--brand)' }}>
                              Compare
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {supplierQuotations.length === 0 && <tr><td colSpan={9} className="text-center py-10 text-sm" style={{ color: 'var(--text-3)' }}>No quotations received yet</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'approvals' && (
          <div className="p-5">
            <div className="mb-4 p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--text-2)]">
              <strong className="text-[var(--text)]">Auto-Approval Rules:</strong> PRs &lt; ₹10,000 and repeat purchases from approved vendors are auto-approved <span className="font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded ml-1">Auto</span>. Items above threshold or new vendors require manual approval <span className="font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded ml-1">Manual</span>.
            </div>
            {approvalRequests.filter(a => a.status === 'pending').length === 0 ? (
              <div className="rounded-xl border p-10 text-center" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                <p className="text-sm" style={{ color: 'var(--text-3)' }}>No pending approvals.</p>
              </div>
            ) : (
              <div className="space-y-3 max-w-3xl">
                {approvalRequests.filter(a => a.status === 'pending').map(a => (
                  <div key={a.id} className="rounded-xl border p-4 flex items-start justify-between gap-4"
                    style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{a.entityRef}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{a.requestedBy} · {new Date(a.requestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                      {a.description && <div className="text-xs mt-1" style={{ color: 'var(--text-2)' }}>{a.description}</div>}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => resolveApproval(a.id, 'rejected', currentUser.name)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors"
                        style={{ borderColor: 'var(--error,#DC2626)', color: 'var(--error,#DC2626)', background: 'transparent' }}>
                        Reject
                      </button>
                      <button onClick={() => resolveApproval(a.id, 'approved', currentUser.name)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg text-white transition-colors"
                        style={{ background: 'var(--success,#16A34A)' }}>
                        Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showNewPO && (
        <NewSupplierPOModal
          onClose={() => setShowNewPO(false)}
          onSave={(po) => {
            addSupplierPO(po);
            showToast({ type: 'success', title: 'Supplier PO created', body: `${po.poNumber} raised.` });
            setShowNewPO(false);
            navigate(`/procurement/spo/${po.id}`);
          }}
        />
      )}

      {compareQuotes && (
        <QuoteCompareModal quotes={compareQuotes} onClose={() => setCompareQuotes(null)}
          onSelect={(q) => { showToast({ type: 'success', title: 'Quote selected', body: `Quote from ${q.supplierName} has been selected.` }); setCompareQuotes(null); }} />
      )}

      {editSpo && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-[var(--text)]">Edit SPO — {editSpo.poNumber}</h2>
              <button onClick={() => setEditSpo(null)} className="text-[var(--text-3)]"><X size={18} /></button>
            </div>
            <EditSPOForm spo={editSpo} onSave={(partial) => { updateSupplierPo(editSpo.id, partial); setEditSpo(null); showToast({ type: 'success', title: 'Supplier PO updated' }); }} onCancel={() => setEditSpo(null)} />
          </div>
        </div>
      )}
    </div>
  );
}

function EditSPOForm({ spo, onSave, onCancel }: { spo: SupplierPO; onSave: (p: Partial<SupplierPO>) => void; onCancel: () => void }) {
  const [form, setForm] = useState({ poNumber: spo.poNumber, paymentTerms: spo.paymentTerms, totalValue: spo.totalValue });
  return (
    <div className="space-y-3">
      <div><label className="text-xs text-[var(--text-3)] block mb-1">PO Number</label><input value={form.poNumber} onChange={e => setForm(f => ({ ...f, poNumber: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)]" /></div>
      <div><label className="text-xs text-[var(--text-3)] block mb-1">Payment Terms</label><input value={form.paymentTerms} onChange={e => setForm(f => ({ ...f, paymentTerms: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)]" /></div>
      <div><label className="text-xs text-[var(--text-3)] block mb-1">Total Value (₹)</label><input type="number" value={form.totalValue} onChange={e => setForm(f => ({ ...f, totalValue: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)]" /></div>
      <div className="flex gap-2 mt-4"><button onClick={onCancel} className="flex-1 py-2 border border-[var(--border)] text-[var(--text)] rounded-lg text-sm">Cancel</button><button onClick={() => onSave(form)} className="flex-1 py-2 bg-[var(--brand)] text-white rounded-lg text-sm font-medium">Save</button></div>
    </div>
  );
}

function QuoteCompareModal({ quotes, onClose, onSelect }: { quotes: SupplierQuotation[]; onClose: () => void; onSelect: (q: SupplierQuotation) => void }) {
  const totals = quotes.map(q => q.lines.reduce((s, l) => s + l.lineTotal, 0));
  const minTotal = Math.min(...totals);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-bold text-[var(--text)]">Quote Comparison</h3>
          <button onClick={onClose}><X size={16} className="text-[var(--text-3)]" /></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', background: 'var(--surface-2)' }}>
                <th className="text-left p-3 text-xs font-semibold text-[var(--text-2)]">Criteria</th>
                {quotes.map(q => (
                  <th key={q.id} className="text-left p-3 text-xs font-semibold text-[var(--text-2)]">{q.supplierName}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Quote #', render: (q: SupplierQuotation) => <span className="font-mono text-xs text-[var(--brand)]">{q.quoteNumber}</span> },
                { label: 'Lead Time', render: (q: SupplierQuotation) => `${q.deliveryDays} days` },
                { label: 'Payment Terms', render: (q: SupplierQuotation) => q.paymentTerms },
                { label: 'Valid Until', render: (q: SupplierQuotation) => new Date(q.validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) },
                { label: 'Total Value', render: (q: SupplierQuotation, i: number) => (
                  <span className={`font-semibold ${totals[i] === minTotal ? 'text-green-600' : 'text-[var(--text)]'}`}>
                    ₹{totals[i].toLocaleString('en-IN')}
                    {totals[i] === minTotal && <span className="ml-1 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Lowest</span>}
                  </span>
                ) },
              ].map(row => (
                <tr key={row.label} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="p-3 text-xs font-medium text-[var(--text-3)]">{row.label}</td>
                  {quotes.map((q, i) => (
                    <td key={q.id} className="p-3 text-sm text-[var(--text)]">{(row.render as any)(q, i)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-3 mt-5 flex-wrap">
          {quotes.map((q, i) => (
            <button key={q.id} onClick={() => onSelect(q)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90 ${totals[i] === minTotal ? '' : 'opacity-80'}`}
              style={{ background: totals[i] === minTotal ? 'var(--success,#16A34A)' : 'var(--brand)' }}>
              Select {q.supplierName}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

import { SUPPLIERS } from '../../store';

function NewSupplierPOModal({ onClose, onSave }: { onClose: () => void; onSave: (po: SupplierPO) => void }) {
  const [form, setForm] = useState({ supplierId: '', supplierName: '', committedDate: '', paymentTerms: 'Net 30', notes: '' });
  const [err, setErr] = useState('');
  const save = () => {
    if (!form.supplierId || !form.committedDate) { setErr('Supplier and committed delivery date required'); return; }
    const id = `spo-${Date.now()}`;
    const num = `SPO-2026-${String(Math.floor(Math.random() * 900 + 100))}`;
    onSave({ id, poNumber: num, supplierId: form.supplierId, supplierName: form.supplierName, raisedDate: '2026-11-05', committedDate: form.committedDate, status: 'draft', totalValue: 0, currency: 'INR', paymentTerms: form.paymentTerms, lineCount: 0 });
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-[var(--text)]">New Supplier PO</h3>
          <button onClick={onClose}><X size={16} className="text-[var(--text-3)]" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Supplier *</label>
            <select className="eoss-input w-full" value={form.supplierId} onChange={e => {
              const s = SUPPLIERS.find(x => x.id === e.target.value);
              setForm(f => ({ ...f, supplierId: e.target.value, supplierName: s?.tradingName ?? s?.legalName ?? '' }));
            }}>
              <option value="">Select supplier…</option>
              {SUPPLIERS.map(s => <option key={s.id} value={s.id}>{s.tradingName ?? s.legalName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Committed Delivery *</label>
            <input type="date" className="eoss-input w-full" value={form.committedDate} onChange={e => setForm(f => ({ ...f, committedDate: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Payment Terms</label>
            <select className="eoss-input w-full" value={form.paymentTerms} onChange={e => setForm(f => ({ ...f, paymentTerms: e.target.value }))}>
              {['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Advance'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        {err && <p className="text-xs text-[var(--danger)] mt-2">{err}</p>}
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[var(--border)] rounded-xl text-sm text-[var(--text-2)]">Cancel</button>
          <button onClick={save} className="flex-1 py-2.5 bg-[var(--brand)] text-white rounded-xl text-sm font-medium">Create PO</button>
        </div>
      </div>
    </div>
  );
}
