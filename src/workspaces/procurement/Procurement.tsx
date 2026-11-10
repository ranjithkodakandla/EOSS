import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, AlertTriangle, Search, ChevronRight, X, Pencil, Trash2, Send } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip, { getStatusLabel } from '../../components/layout/StatusChip';
import type { GoodsReceipt, SupplierPO, SupplierPOLine, SupplierQuotation } from '../../types';
import { DEFAULT_SITE_ID, DEFAULT_SITE_NAME, DEFAULT_STORE_ID, DEFAULT_STORE_NAME, GRN_STORE_ID, GRN_STORE_NAME } from '../../domain/recordLists';
import { placeLabel } from '../../domain/places';
import SiteStoreField from '../../components/forms/SiteStoreField';
import SortableHeader from '../../components/layout/SortableHeader';
import { sortRows } from '../../domain/tableSort';

type ProcTab = 'spo' | 'pr' | 'grn' | 'approvals' | 'quotes';
type ProcurementSortKey = 'number' | 'supplier' | 'date' | 'committedDate' | 'value' | 'lines' | 'job' | 'status' | 'raisedBy' | 'requiredBy' | 'priority' | 'poRef' | 'receivedBy' | 'challan' | 'validUntil' | 'leadTime' | 'terms';

export default function Procurement() {
  const { supplierPos, grns, approvalRequests, supplierQuotations, purchaseReqs, sites, currentUser, showToast, addSupplierPO, resolveApproval, updateSupplierPo, addGRN, supplierPoLines } = useStore();
  const [searchParams] = useSearchParams();
  const receiveParam = searchParams.get('receive');
  const [editSpo, setEditSpo] = useState<SupplierPO | null>(null);

  const handleDeleteSpo = (id: string) => {
    const hasGRN = grns.some(g => g.spoId === id);
    if (hasGRN) { showToast({ type: 'error', title: 'Cannot cancel PO', body: 'This PO has GRN records against it.' }); return; }
    updateSupplierPo(id, { status: 'cancelled' });
    showToast({ type: 'success', title: 'Supplier PO cancelled' });
  };
  const navigate = useNavigate();
  const [tab, setTab] = useState<ProcTab>(receiveParam ? 'grn' : ((searchParams.get('tab') as ProcTab) ?? 'pr'));
  const [search, setSearch] = useState('');
  const [showNewPO, setShowNewPO] = useState(false);
  const [siteFilter, setSiteFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [approvalView, setApprovalView] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [sortKey, setSortKey] = useState<ProcurementSortKey>('number');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const receivablePos = supplierPos.filter(p => ['confirmed', 'partial', 'overdue', 'sent'].includes(p.status));
  const [receivePoId, setReceivePoId] = useState<string | null>(
    receiveParam ? (supplierPos.find(p => p.id === receiveParam)?.id ?? receivablePos[0]?.id ?? null) : null
  );

  const pendingApprovals = approvalRequests.filter(a => a.status === 'pending').length;
  const canCreate = ['owner', 'buyer'].includes(currentUser.role);
  const canApprove = currentUser.role === 'owner';

  const q = search.toLowerCase();
  const matchSite = (siteId?: string) => siteFilter === 'all' || siteId === siteFilter;
  const statusOptions = tab === 'pr'
    ? ['draft', 'pending', 'approved', 'converted', 'cancelled']
    : tab === 'quotes'
      ? ['draft', 'sent', 'received', 'selected', 'rejected', 'expired']
      : tab === 'spo'
        ? ['draft', 'pending_approval', 'sent', 'confirmed', 'partial', 'received', 'overdue', 'cancelled']
        : ['draft', 'pending_qc', 'accepted', 'partial', 'rejected'];
  const matchStatus = (status: string) => statusFilter === 'all' || status === statusFilter;
  const filteredSpoBase = supplierPos.filter(p =>
    matchSite(p.deliverToSiteId) && matchStatus(p.status) && (!overdueOnly || p.status === 'overdue') &&
    (!q || p.poNumber.toLowerCase().includes(q) || p.supplierName.toLowerCase().includes(q))
  );
  const filteredSpo = sortRows(filteredSpoBase, sortKey, sortDir, (p, key) => {
    const values: Record<string, unknown> = { number: p.poNumber, supplier: p.supplierName, date: p.raisedDate, committedDate: p.committedDate, value: p.totalValue, lines: p.lineCount, job: p.jobRef, status: p.status };
    return values[key] ?? p.raisedDate;
  });
  const filteredPrsBase = purchaseReqs.filter(pr =>
    matchSite(pr.deliverToSiteId) && matchStatus(pr.status) &&
    (!q || pr.prNumber.toLowerCase().includes(q) || pr.raisedBy.toLowerCase().includes(q) || (pr.jobNumber ?? '').toLowerCase().includes(q))
  );
  const filteredPrs = sortRows(filteredPrsBase, sortKey, sortDir, (pr, key) => {
    const values: Record<string, unknown> = { number: pr.prNumber, raisedBy: pr.raisedBy, date: pr.raisedDate, requiredBy: pr.requiredBy, job: pr.jobNumber, lines: pr.lineCount, priority: pr.priority, status: pr.status };
    return values[key] ?? pr.raisedDate;
  });
  const filteredGrnsBase = grns.filter(g =>
    matchSite(g.siteId) && matchStatus(g.status) &&
    (!q || g.grnNumber.toLowerCase().includes(q) || g.supplierName.toLowerCase().includes(q))
  );
  const filteredGrns = sortRows(filteredGrnsBase, sortKey, sortDir, (g, key) => {
    const values: Record<string, unknown> = { number: g.grnNumber, supplier: g.supplierName, poRef: g.spoNumber, date: g.receivedDate, receivedBy: g.receivedBy, challan: g.deliveryChallan, status: g.status };
    return values[key] ?? g.receivedDate;
  });
  const filteredQuotesBase = supplierQuotations.filter(qt =>
    matchStatus(qt.status) && (!q || qt.quoteNumber.toLowerCase().includes(q) || qt.supplierName.toLowerCase().includes(q))
  );
  const filteredQuotes = sortRows(filteredQuotesBase, sortKey, sortDir, (qt, key) => {
    const values: Record<string, unknown> = { number: qt.quoteNumber, supplier: qt.supplierName, date: qt.quoteDate, validUntil: qt.validUntil, leadTime: qt.deliveryDays, terms: qt.paymentTerms, value: qt.lines.reduce((s, l) => s + l.lineTotal, 0), status: qt.status };
    return values[key] ?? qt.quoteDate;
  });
  const overduePOs = supplierPos.filter(p => p.status === 'overdue' && matchSite(p.deliverToSiteId) && (!q || p.poNumber.toLowerCase().includes(q) || p.supplierName.toLowerCase().includes(q))).length;
  const approvalSiteId = (id: string) => supplierPos.find(p => p.id === id)?.deliverToSiteId ?? purchaseReqs.find(p => p.id === id)?.deliverToSiteId ?? grns.find(g => g.id === id)?.siteId;
  const visibleApprovals = approvalRequests.filter(a => (approvalView === 'all' || a.status === approvalView) && matchSite(approvalSiteId(a.entityId)));

  const handleSort = (key: ProcurementSortKey) => {
    if (sortKey === key) setSortDir(direction => direction === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const TABS = [
    { id: 'pr' as ProcTab, label: `Purchase Requisitions (${filteredPrs.length})` },
    { id: 'quotes' as ProcTab, label: `Supplier Quotations (${filteredQuotes.length})` },
    { id: 'spo' as ProcTab, label: `Supplier POs (${filteredSpo.length})` },
    { id: 'grn' as ProcTab, label: `Receiving & Inventory (${filteredGrns.length})` },
  ];
  const [compareQuotes, setCompareQuotes] = useState<SupplierQuotation[] | null>(null);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex-shrink-0 flex items-center gap-3 px-5 py-3 border-b flex-wrap"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="eoss-search-wrap flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
          <input type="text" placeholder={tab === 'pr' ? 'Search PR number, requester or job' : tab === 'quotes' ? 'Search quote number or supplier' : tab === 'spo' ? 'Search Supplier PO number or supplier' : 'Search GRN number or supplier'} value={search} onChange={e => setSearch(e.target.value)} className="eoss-search-input" />
        </div>
        <select value={siteFilter} onChange={e => setSiteFilter(e.target.value)} className="eoss-input min-h-[36px]" aria-label="Deliver-to site">
          <option value="all">All sites</option>
          {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        {tab !== 'approvals' && <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="eoss-input min-h-[36px]" aria-label="Procurement status"><option value="all">All {tab === 'pr' ? 'PR' : tab === 'quotes' ? 'quotation' : tab === 'spo' ? 'Supplier PO' : 'GRN'} statuses</option>{statusOptions.map(status => <option key={status} value={status}>{getStatusLabel(status)}</option>)}</select>}
        <div className="flex-1" />
        {overduePOs > 0 && (
          <button type="button" onClick={() => { setTab('spo'); setStatusFilter('all'); setOverdueOnly(v => !v); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{ background: 'var(--error-bg,#FEF2F2)', color: 'var(--error,#DC2626)' }}>
            <AlertTriangle size={13} /> {overduePOs} overdue
          </button>
        )}
        {pendingApprovals > 0 && (
          <button type="button" onClick={() => { setTab('approvals'); setStatusFilter('all'); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{ background: 'var(--warning-bg,#FFFBEB)', color: 'var(--warning,#D97706)' }}>
            {pendingApprovals} to approve
          </button>
        )}
        {canCreate && tab === 'pr' && (
          <button onClick={() => navigate('/procurement/pr/new')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
            style={{ background: 'var(--brand-fill)' }}>
            <Plus size={13} /> New PR
          </button>
        )}
        {canCreate && tab === 'quotes' && (
          <button onClick={() => navigate('/procurement/supplier-rfq/new')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
            style={{ background: 'var(--brand-fill)' }}>
            <Send size={13} /> Request quotations
          </button>
        )}
      </div>

      <div className="flex-shrink-0 px-5 py-2.5 border-b text-xs font-semibold" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)', color: 'var(--text-2)' }}>
        <span style={{ color: tab === 'pr' ? 'var(--brand)' : undefined }}>PR</span><span className="mx-2 text-[var(--text-3)]">→</span><span style={{ color: tab === 'quotes' ? 'var(--brand)' : undefined }}>Supplier Quotations</span><span className="mx-2 text-[var(--text-3)]">→</span><span style={{ color: tab === 'spo' ? 'var(--brand)' : undefined }}>Selected Quotation / Supplier PO</span><span className="mx-2 text-[var(--text-3)]">→</span><span style={{ color: tab === 'grn' ? 'var(--brand)' : undefined }}>Quality / GRN / Inventory</span>
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 flex items-center border-b px-3 overflow-x-auto"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setStatusFilter('all'); setOverdueOnly(false); }}
            className="relative px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap"
            style={{ color: tab === t.id ? 'var(--brand)' : 'var(--text-2)' }}>
            {t.label}
            {tab === t.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full" style={{ background: 'var(--brand-fill)' }} />}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {tab === 'spo' && (
          <>
          <div className="md:hidden p-3 space-y-2">
            {filteredSpo.map(p => (
              <button key={p.id} type="button" onClick={() => navigate(`/procurement/spo/${p.id}`)}
                className="w-full text-left rounded-xl border p-3" style={{ borderColor: 'var(--border)', background: p.status === 'overdue' ? 'var(--error-bg,#FEF2F2)' : 'var(--surface)' }}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold" style={{ color: 'var(--brand)' }}>{p.poNumber}</span>
                  <StatusChip status={p.status} />
                </div>
                <div className="text-sm font-semibold text-[var(--text)] mt-1">{p.supplierName}</div>
                <div className="text-xs text-[var(--text-2)] mt-1">₹{(p.totalValue / 1000).toFixed(1)}k{p.jobRef ? ` · ${p.jobRef}` : ''}</div>
              </button>
            ))}
          </div>
          <table className="eoss-table hidden md:table">
            <thead style={{ position: 'sticky', top: 0, zIndex: 5 }}>
              <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                {([['PO Number', 'number'], ['Supplier', 'supplier'], ['Raised', 'date'], ['Committed', 'committedDate'], ['Lines', 'lines'], ['Value', 'value'], ['Job Ref', 'job'], ['Status', 'status']] as [string, ProcurementSortKey][]).map(([label, key]) => (
                  <SortableHeader key={label} label={label} active={sortKey === key} direction={sortDir} onSort={() => handleSort(key)} className="text-left px-4 py-2.5 text-xs font-semibold font-medium" style={{ color: 'var(--text-3)', borderBottom: '1px solid var(--border)' }} />
                ))}
                <th />
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
                  <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text)' }}>
                    {p.supplierName}
                    <div className="text-[11px] font-normal text-[var(--text-3)]">{placeLabel(p.deliverToSiteName, p.deliverToStoreName)}</div>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{new Date(p.raisedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: p.status === 'overdue' ? 'var(--error,#DC2626)' : 'var(--text-2)', fontWeight: p.status === 'overdue' ? 600 : undefined }}>
                    {p.committedDate ? new Date(p.committedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-center" style={{ color: 'var(--text-2)' }}>{p.lineCount}</td>
                  <td className="px-4 py-3 font-mono text-sm font-semibold" style={{ color: 'var(--text)' }}>₹{(p.totalValue / 1000).toFixed(1)}k</td>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--text-2)' }}>{p.jobRef ?? '—'}</td>
                  <td className="px-4 py-3"><StatusChip status={p.status} /></td>
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
          </>
        )}

        {tab === 'pr' && (
          <table className="eoss-table">
            <thead style={{ position: 'sticky', top: 0, zIndex: 5 }}>
              <tr style={{ background: 'var(--surface-2)' }}>
                {([['PR Number', 'number'], ['Raised By', 'raisedBy'], ['Raised Date', 'date'], ['Required By', 'requiredBy'], ['Job Ref', 'job'], ['Lines', 'lines'], ['Priority', 'priority'], ['Status', 'status']] as [string, ProcurementSortKey][]).map(([label, key]) => (
                  <SortableHeader key={label} label={label} active={sortKey === key} direction={sortDir} onSort={() => handleSort(key)} className="text-left px-4 py-2.5 text-xs font-semibold font-medium" style={{ color: 'var(--text-3)', borderBottom: '1px solid var(--border)' }} />
                ))}
                <th />
              </tr>
            </thead>
            <tbody>
              {filteredPrs.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-sm" style={{ color: 'var(--text-3)' }}>No PRs found</td></tr>
              )}
              {filteredPrs.map(pr => (
                <tr key={pr.id} className="cursor-pointer" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}
                  onClick={() => navigate(`/procurement/pr/${pr.id}`)}>
                  <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: 'var(--brand)' }}>{pr.prNumber}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--text)' }}>
                    {pr.raisedBy}
                    <div className="text-[11px] text-[var(--text-3)]">{placeLabel(pr.deliverToSiteName, pr.deliverToStoreName)}</div>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{new Date(pr.raisedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{new Date(pr.requiredBy).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-2)' }}>{pr.jobNumber ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-center" style={{ color: 'var(--text-2)' }}>{pr.lineCount}</td>
                  <td className="px-4 py-3"><StatusChip status={pr.priority} /></td>
                  <td className="px-4 py-3"><StatusChip status={pr.status} /></td>
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
          <table className="eoss-table">
            <thead style={{ position: 'sticky', top: 0, zIndex: 5 }}>
              <tr style={{ background: 'var(--surface-2)' }}>
                {([['GRN Number', 'number'], ['Supplier', 'supplier'], ['PO Ref', 'poRef'], ['Received', 'date'], ['By', 'receivedBy'], ['Challan', 'challan'], ['Status', 'status']] as [string, ProcurementSortKey][]).map(([label, key]) => (
                  <SortableHeader key={label} label={label} active={sortKey === key} direction={sortDir} onSort={() => handleSort(key)} className="text-left px-4 py-2.5 text-xs font-semibold font-medium" style={{ color: 'var(--text-3)', borderBottom: '1px solid var(--border)' }} />
                ))}
                <th />
              </tr>
            </thead>
            <tbody>
              {filteredGrns.map(g => (
                <tr key={g.id} className="cursor-pointer" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}
                  onClick={() => navigate(`/procurement/grn/${g.id}`)}>
                  <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: 'var(--brand)' }}>{g.grnNumber}</td>
                  <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text)' }}>
                    {g.supplierName}
                    <div className="text-[11px] font-normal text-[var(--text-3)]">{placeLabel(g.siteName, g.storeLocationName)}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-2)' }}>{g.spoNumber}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{new Date(g.receivedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{g.receivedBy}</td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-2)' }}>{g.deliveryChallan}</td>
                  <td className="px-4 py-3"><StatusChip status={g.status} /></td>
                  <td className="px-4 py-3"><ChevronRight size={14} style={{ color: 'var(--text-3)' }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'quotes' && (
          <div className="p-3 md:p-5">
            <div className="md:hidden space-y-2">
              {filteredQuotes.map(qt => {
                const total = qt.lines.reduce((s, l) => s + l.lineTotal, 0);
                const grouped = supplierQuotations.filter(x => x.prId && x.prId === qt.prId);
                return (
                  <div key={qt.id} className="rounded-xl border p-3" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold" style={{ color: 'var(--brand)' }}>{qt.quoteNumber}</span>
                      <StatusChip status={qt.status} />
                    </div>
                    <div className="text-sm font-medium text-[var(--text)] mt-1">{qt.supplierName}</div>
                    <div className="text-xs text-[var(--text-2)] mt-1">
                      ₹{(total / 1000).toFixed(1)}k · {qt.deliveryDays} days · {qt.paymentTerms}
                    </div>
                    {grouped.length > 1 && grouped[0]?.id === qt.id && (
                      <button onClick={() => setCompareQuotes(grouped)}
                        className="mt-2 text-xs px-2 py-1 rounded-lg border font-medium"
                        style={{ borderColor: 'var(--brand)', color: 'var(--brand)' }}>
                        Compare {grouped.length} quotes
                      </button>
                    )}
                  </div>
                );
              })}
              {filteredQuotes.length === 0 && <p className="text-center py-10 text-sm" style={{ color: 'var(--text-3)' }}>No quotations received yet</p>}
            </div>
            <div className="hidden md:block overflow-x-auto">
              <table className="eoss-table">
                <thead><tr>
                  {([['Quote #', 'number'], ['Supplier', 'supplier'], ['Date', 'date'], ['Valid Until', 'validUntil'], ['Lead Time', 'leadTime'], ['Payment Terms', 'terms'], ['Total Value', 'value'], ['Status', 'status']] as [string, ProcurementSortKey][]).map(([label, key]) => (
                    <SortableHeader key={label} label={label} active={sortKey === key} direction={sortDir} onSort={() => handleSort(key)} />
                  ))}
                  <th />
                </tr></thead>
                <tbody>
                  {filteredQuotes.map(q => {
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
                        <td><StatusChip status={q.status} /></td>
                        <td>
                          {grouped.length > 1 && grouped[0]?.id === q.id && (
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
                  {filteredQuotes.length === 0 && <tr><td colSpan={9} className="text-center py-10 text-sm" style={{ color: 'var(--text-3)' }}>No quotations received yet</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'approvals' && (
          <div className="p-5">
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap"><p className="text-xs text-[var(--text-2)]">Pending is the action queue; decisions remain available in the history views.</p><select value={approvalView} onChange={e => setApprovalView(e.target.value as typeof approvalView)} className="eoss-input min-h-[36px]" aria-label="Approval history view"><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="all">All history</option></select></div>
            {visibleApprovals.length === 0 ? (
              <div className="rounded-xl border p-10 text-center" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                <p className="text-sm" style={{ color: 'var(--text-3)' }}>No pending approvals.</p>
              </div>
            ) : (
              <div className="space-y-3 max-w-3xl">
                {visibleApprovals.map(a => (
                  <div key={a.id} className="rounded-xl border p-4 flex items-start justify-between gap-4"
                    style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{a.entityRef}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{a.requestedBy} · {new Date(a.requestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {a.siteName ?? 'Company-wide / unassigned'}</div>
                      {a.description && <div className="text-xs mt-1" style={{ color: 'var(--text-2)' }}>{a.description}</div>}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {a.status !== 'pending' && <StatusChip status={a.status} />}
                      {a.status === 'pending' && canApprove && <button onClick={() => resolveApproval(a.id, 'rejected', currentUser.name, 'Rejected in approval review')}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors"
                        style={{ borderColor: 'var(--error,#DC2626)', color: 'var(--error,#DC2626)', background: 'transparent' }}>
                        Reject
                      </button>}
                      {a.status === 'pending' && canApprove && <button onClick={() => resolveApproval(a.id, 'approved', currentUser.name, 'Approved in approval review')}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg text-white transition-colors"
                        style={{ background: 'var(--success,#16A34A)' }}>
                        Approve
                      </button>}
                      {a.status === 'pending' && !canApprove && <span className="text-[11px] text-[var(--text-3)]">Owner approval required</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {receivePoId && (
        <ReceiveStockModal
          poId={receivePoId}
          pos={receivablePos}
          lines={supplierPoLines}
          receivedBy={currentUser.name}
          onClose={() => setReceivePoId(null)}
          onSave={(grn) => {
            addGRN(grn);
            showToast({ type: 'success', title: 'Stock received', body: `${grn.grnNumber} recorded against ${grn.spoNumber}.` });
            setReceivePoId(null);
            setTab('grn');
          }}
        />
      )}

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
      <div className="flex gap-2 mt-4"><button onClick={onCancel} className="flex-1 py-2 border border-[var(--border)] text-[var(--text)] rounded-lg text-sm">Cancel</button><button onClick={() => onSave(form)} className="flex-1 py-2 bg-[var(--brand-fill)] text-white rounded-lg text-sm font-medium">Save</button></div>
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
              <table className="eoss-table">
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

function ReceiveStockModal({ poId, pos, lines, receivedBy, onClose, onSave }: {
  poId: string;
  pos: SupplierPO[];
  lines: SupplierPOLine[];
  receivedBy: string;
  onClose: () => void;
  onSave: (grn: GoodsReceipt) => void;
}) {
  const [selectedId, setSelectedId] = useState(poId);
  const [challan, setChallan] = useState('');
  const [date, setDate] = useState('2026-11-09');
  const [place, setPlace] = useState({ siteId: DEFAULT_SITE_ID, siteName: DEFAULT_SITE_NAME, storeId: GRN_STORE_ID, storeName: GRN_STORE_NAME });
  const po = pos.find(p => p.id === selectedId) ?? pos[0];
  const poLines = lines.filter(l => l.spoId === po?.id);
  const save = () => {
    if (!po || !challan) return;
    const seq = String(Date.now()).slice(-4);
    onSave({
      id: `grn-${Date.now()}`,
      grnNumber: `GRN-2026-${seq}`,
      supplierId: po.supplierId,
      supplierName: po.supplierName,
      spoId: po.id,
      spoNumber: po.poNumber,
      receivedDate: date,
      receivedBy,
      deliveryChallan: challan,
      siteId: place.siteId,
      siteName: place.siteName,
      storeLocationId: place.storeId,
      storeLocationName: place.storeName,
      status: 'pending_qc',
      lineCount: poLines.length || po.lineCount,
    });
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-[var(--text)]">Receive stock</h3>
          <button onClick={onClose}><X size={16} className="text-[var(--text-3)]" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Supplier PO</label>
            <select className="eoss-input w-full" value={po?.id ?? ''} onChange={e => setSelectedId(e.target.value)}>
              {pos.map(p => <option key={p.id} value={p.id}>{p.poNumber} · {p.supplierName}</option>)}
            </select>
          </div>
          {po && (
            <div className="rounded-lg border p-3 text-xs space-y-1" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
              <div className="font-semibold text-[var(--text)]">{po.supplierName}</div>
              <div className="text-[var(--text-2)]">Committed {po.committedDate ? new Date(po.committedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</div>
              {poLines.length === 0 && <div className="text-[var(--text-2)]">{po.lineCount} lines on this PO</div>}
              {poLines.map(l => (
                <div key={l.id} className="flex justify-between gap-2 text-[var(--text)]">
                  <span>{l.materialName}</span>
                  <span className="font-mono">{Math.max(l.orderedQty - l.receivedQty, 0)} {l.uom} due</span>
                </div>
              ))}
            </div>
          )}
          <SiteStoreField
            siteId={place.siteId}
            storeId={place.storeId}
            label="Receiving site"
            storeLabel="Receiving store"
            onChange={next => setPlace({ siteId: next.siteId, siteName: next.siteName, storeId: next.storeId, storeName: next.storeName })}
          />
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Delivery challan *</label>
            <input className="eoss-input w-full" value={challan} onChange={e => setChallan(e.target.value)} placeholder="DC-1042" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Received date</label>
            <input type="date" className="eoss-input w-full" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="text-xs text-[var(--text-2)]">Received by {receivedBy}. Goods go to incoming QC.</div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[var(--border)] rounded-xl text-sm text-[var(--text-2)]">Cancel</button>
          <button disabled={!challan || !po} onClick={save} className="flex-1 py-2.5 bg-[var(--brand-fill)] text-white rounded-xl text-sm font-medium disabled:opacity-50">Record GRN</button>
        </div>
      </div>
    </div>
  );
}

import { SUPPLIERS } from '../../store';

function NewSupplierPOModal({ onClose, onSave }: { onClose: () => void; onSave: (po: SupplierPO) => void }) {
  const [form, setForm] = useState({
    supplierId: '', supplierName: '', committedDate: '', paymentTerms: 'Net 30', notes: '',
    deliverToSiteId: DEFAULT_SITE_ID, deliverToSiteName: DEFAULT_SITE_NAME,
    deliverToStoreId: DEFAULT_STORE_ID, deliverToStoreName: DEFAULT_STORE_NAME,
  });
  const [err, setErr] = useState('');
  const save = () => {
    if (!form.supplierId || !form.committedDate) { setErr('Supplier and committed delivery date required'); return; }
    const id = `spo-${Date.now()}`;
    const num = `SPO-2026-${String(Math.floor(Math.random() * 900 + 100))}`;
    onSave({
      id, poNumber: num, supplierId: form.supplierId, supplierName: form.supplierName, raisedDate: '2026-11-05',
      committedDate: form.committedDate, status: 'draft', totalValue: 0, currency: 'INR', paymentTerms: form.paymentTerms, lineCount: 0,
      deliverToSiteId: form.deliverToSiteId, deliverToSiteName: form.deliverToSiteName,
      deliverToStoreId: form.deliverToStoreId, deliverToStoreName: form.deliverToStoreName,
    });
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-[var(--text)]">New Supplier PO</h3>
          <button onClick={onClose}><X size={16} className="text-[var(--text-3)]" /></button>
        </div>
        <div className="space-y-3">
          <SiteStoreField
            siteId={form.deliverToSiteId}
            storeId={form.deliverToStoreId}
            label="Deliver-to site"
            storeLabel="Deliver-to store"
            onChange={next => setForm(f => ({ ...f, deliverToSiteId: next.siteId, deliverToSiteName: next.siteName, deliverToStoreId: next.storeId, deliverToStoreName: next.storeName }))}
          />
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
          <button onClick={save} className="flex-1 py-2.5 bg-[var(--brand-fill)] text-white rounded-xl text-sm font-medium">Create PO</button>
        </div>
      </div>
    </div>
  );
}
