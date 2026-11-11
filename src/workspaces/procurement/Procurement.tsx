import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, AlertTriangle, Search, X, Pencil, Trash2, Send, Scale, Sparkles, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip, { getStatusLabel } from '../../components/layout/StatusChip';
import type { PurchaseRequisition, SupplierPO, SupplierQuotation } from '../../types';
import { compareAndRecommendQuotations } from '../../domain/quotationComparison';
import { DEFAULT_SITE_ID, DEFAULT_SITE_NAME, DEFAULT_STORE_ID, DEFAULT_STORE_NAME } from '../../domain/recordLists';
import { placeLabel } from '../../domain/places';
import SiteStoreField from '../../components/forms/SiteStoreField';
import SortableHeader from '../../components/layout/SortableHeader';
import { sortRows } from '../../domain/tableSort';

type ProcTab = 'spo' | 'pr' | 'grn' | 'approvals' | 'quotes';
type ProcurementSortKey = 'number' | 'supplier' | 'date' | 'committedDate' | 'value' | 'lines' | 'dept' | 'source' | 'status' | 'raisedBy' | 'requiredBy' | 'priority' | 'poRef' | 'receivedBy' | 'challan' | 'validUntil' | 'leadTime' | 'terms';

export default function Procurement() {
  const {
    supplierPos, grns, approvalRequests, supplierQuotations, supplierInvitations,
    purchaseReqs, suppliers, sites, currentUser, showToast,
    addSupplierPO, resolveApproval, updateSupplierPo, updateSupplierInvitation,
    selectQuotation, approveFinalizeQuotation, rejectQuotationApproval, generateSPOFromQuotation,
  } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const openWithOrigin = (path: string) => navigate(path, { state: { from: `${location.pathname}${location.search}` } });
  const [selectedQuoteIds, setSelectedQuoteIds] = useState<string[]>([]);
  const receiveParam = searchParams.get('receive');
  const [editSpo, setEditSpo] = useState<SupplierPO | null>(null);

  const handleDeleteSpo = (id: string) => {
    const hasGRN = grns.some(g => g.spoId === id);
    if (hasGRN) { showToast({ type: 'error', title: 'Cannot cancel PO', body: 'This PO has GRN records against it.' }); return; }
    updateSupplierPo(id, { status: 'cancelled' });
    showToast({ type: 'success', title: 'Supplier PO cancelled' });
  };
  const navigate = useNavigate();
  useEffect(() => {
    if (receiveParam) {
      navigate(`/procurement/grn/new?spo=${encodeURIComponent(receiveParam)}`, { replace: true });
    }
  }, [receiveParam, navigate]);
  const [tab, setTab] = useState<ProcTab>(receiveParam ? 'grn' : ((searchParams.get('tab') as ProcTab) ?? 'pr'));
  const [search, setSearch] = useState(() => searchParams.get('q') ?? '');
  const [showNewPO, setShowNewPO] = useState(false);
  const [siteFilter, setSiteFilter] = useState(() => searchParams.get('site') ?? 'all');
  const [statusFilter, setStatusFilter] = useState(() => searchParams.get('status') ?? 'all');
  const [overdueOnly, setOverdueOnly] = useState(() => searchParams.get('overdue') === '1');
  const [approvalView, setApprovalView] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [sortKey, setSortKey] = useState<ProcurementSortKey>(() => (searchParams.get('sort') as ProcurementSortKey) || 'number');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(() => (searchParams.get('dir') === 'desc' ? 'desc' : 'asc'));

  useEffect(() => {
    if (location.key === 'bg') return;
    const next = new URLSearchParams();
    next.set('tab', tab);
    if (search.trim()) next.set('q', search.trim());
    if (siteFilter !== 'all') next.set('site', siteFilter);
    if (statusFilter !== 'all') next.set('status', statusFilter);
    if (overdueOnly) next.set('overdue', '1');
    if (sortKey !== 'number') next.set('sort', sortKey);
    if (sortDir !== 'asc') next.set('dir', sortDir);
    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
  }, [tab, search, siteFilter, statusFilter, overdueOnly, sortKey, sortDir, searchParams, setSearchParams, location.key]);

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
    (!q || p.poNumber.toLowerCase().includes(q) || p.supplierName.toLowerCase().includes(q) || (p.prNumber ?? '').toLowerCase().includes(q))
  );
  const filteredSpo = sortRows(filteredSpoBase, sortKey, sortDir, (p, key) => {
    const values: Record<string, unknown> = { number: p.poNumber, supplier: p.supplierName, date: p.raisedDate, committedDate: p.committedDate, value: p.totalValue, lines: p.lineCount, source: p.prNumber || p.supplierQuotationRef || '', status: p.status };
    return values[key] ?? p.raisedDate;
  });
  const filteredPrsBase = purchaseReqs.filter(pr =>
    matchSite(pr.deliverToSiteId) && matchStatus(pr.status) &&
    (!q || pr.prNumber.toLowerCase().includes(q) || pr.raisedBy.toLowerCase().includes(q) || (pr.department ?? '').toLowerCase().includes(q) || (pr.purpose ?? '').toLowerCase().includes(q))
  );
  const filteredPrs = sortRows(filteredPrsBase, sortKey, sortDir, (pr, key) => {
    const values: Record<string, unknown> = { number: pr.prNumber, raisedBy: pr.raisedBy, date: pr.raisedDate, requiredBy: pr.requiredBy, dept: pr.department ?? 'Production', lines: pr.lineCount, priority: pr.priority, status: pr.status };
    return values[key] ?? pr.raisedDate;
  });
  const filteredGrnsBase = grns.filter(g =>
    matchSite(g.siteId) && matchStatus(g.status) &&
    (!q || g.grnNumber.toLowerCase().includes(q) || g.supplierName.toLowerCase().includes(q) || g.spoNumber.toLowerCase().includes(q))
  );
  const filteredGrns = sortRows(filteredGrnsBase, sortKey, sortDir, (g, key) => {
    const values: Record<string, unknown> = { number: g.grnNumber, supplier: g.supplierName, poRef: g.spoNumber, date: g.receivedDate, receivedBy: g.receivedBy, challan: g.deliveryChallan, status: g.status };
    return values[key] ?? g.receivedDate;
  });
  const filteredQuotesBase = supplierQuotations.filter(qt =>
    matchStatus(qt.status) && (!q || qt.quoteNumber.toLowerCase().includes(q) || qt.supplierName.toLowerCase().includes(q) || (qt.prNumber ?? '').toLowerCase().includes(q))
  );
  const filteredQuotes = sortRows(filteredQuotesBase, sortKey, sortDir, (qt, key) => {
    const values: Record<string, unknown> = { number: qt.quoteNumber, supplier: qt.supplierName, date: qt.quoteDate, validUntil: qt.validUntil, leadTime: qt.deliveryDays, terms: qt.paymentTerms, value: qt.lines.reduce((s, l) => s + l.lineTotal, 0), status: qt.status };
    return values[key] ?? qt.quoteDate;
  });
  const overduePOs = supplierPos.filter(p => p.status === 'overdue' && matchSite(p.deliverToSiteId) && (!q || p.poNumber.toLowerCase().includes(q) || p.supplierName.toLowerCase().includes(q))).length;
  const approvalSiteId = (id: string) => supplierPos.find(p => p.id === id)?.deliverToSiteId ?? purchaseReqs.find(p => p.id === id)?.deliverToSiteId ?? grns.find(g => g.id === id)?.siteId;
  const visibleApprovals = approvalRequests.filter(a => (approvalView === 'all' || a.status === approvalView) && matchSite(approvalSiteId(a.entityId)));

  const hasFilters = Boolean(search.trim() || siteFilter !== 'all' || statusFilter !== 'all' || overdueOnly);
  const clearFilters = () => { setSearch(''); setSiteFilter('all'); setStatusFilter('all'); setOverdueOnly(false); };

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
          <input type="text" placeholder={tab === 'pr' ? 'Search PR number, requester or department' : tab === 'quotes' ? 'Search quote, PR or supplier' : tab === 'spo' ? 'Search Supplier PO, PR or supplier' : 'Search GRN, PO or supplier'} value={search} onChange={e => setSearch(e.target.value)} className="eoss-search-input" />
        </div>
        <select value={siteFilter} onChange={e => setSiteFilter(e.target.value)} className="eoss-input min-h-[36px]" aria-label="Deliver-to site">
          <option value="all">All sites</option>
          {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        {tab !== 'approvals' && <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="eoss-input min-h-[36px]" aria-label="Procurement status"><option value="all">All {tab === 'pr' ? 'PR' : tab === 'quotes' ? 'quotation' : tab === 'spo' ? 'Supplier PO' : 'GRN'} statuses</option>{statusOptions.map(status => <option key={status} value={status}>{getStatusLabel(status)}</option>)}</select>}
        {hasFilters && (
          <button type="button" onClick={clearFilters} className="text-xs font-medium px-2.5 py-1.5 rounded-lg border" style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}>
            Clear filters
          </button>
        )}
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
          <button onClick={() => openWithOrigin('/procurement/pr/new')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
            style={{ background: 'var(--brand-fill)' }}>
            <Plus size={13} /> New PR
          </button>
        )}
        {canCreate && tab === 'quotes' && (
          <button onClick={() => openWithOrigin('/procurement/supplier-rfq/new')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
            style={{ background: 'var(--brand-fill)' }}>
            <Send size={13} /> Request quotations
          </button>
        )}
        {canCreate && tab === 'grn' && (
          <button onClick={() => openWithOrigin('/procurement/grn/new')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
            style={{ background: 'var(--brand-fill)' }}>
            <Plus size={13} /> Record GRN
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
              <button key={p.id} type="button" onClick={() => openWithOrigin(`/procurement/spo/${p.id}`)}
                className="w-full text-left rounded-xl border p-3" style={{ borderColor: 'var(--border)', background: p.status === 'overdue' ? 'var(--error-bg,#FEF2F2)' : 'var(--surface)' }}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold" style={{ color: 'var(--brand)' }}>{p.poNumber}</span>
                  <StatusChip status={p.status} />
                </div>
                <div className="text-sm font-semibold text-[var(--text)] mt-1">{p.supplierName}</div>
                <div className="text-xs text-[var(--text-2)] mt-1">₹{(p.totalValue / 1000).toFixed(1)}k{p.prNumber ? ` · ${p.prNumber}` : ''}</div>
              </button>
            ))}
          </div>
          <table className="eoss-table hidden md:table">
            <thead style={{ position: 'sticky', top: 0, zIndex: 5 }}>
              <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                {([['PO Number', 'number'], ['Supplier', 'supplier'], ['Raised', 'date'], ['Committed', 'committedDate'], ['Lines', 'lines'], ['Value', 'value'], ['PR / Quote Ref', 'source'], ['Status', 'status']] as [string, ProcurementSortKey][]).map(([label, key]) => (
                  <SortableHeader key={label} label={label} active={sortKey === key} direction={sortDir} onSort={() => handleSort(key)} className="text-left px-4 py-2.5 text-xs font-semibold font-medium" style={{ color: 'var(--text-3)', borderBottom: '1px solid var(--border)' }} />
                ))}
                <th />
              </tr>
            </thead>
            <tbody>
              {filteredSpo.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-sm" style={{ color: 'var(--text-3)' }}>No Supplier POs found</td></tr>
              ) : filteredSpo.map(p => (
                <tr key={p.id} className="cursor-pointer"
                  style={{ borderBottom: '1px solid var(--border)', background: p.status === 'overdue' ? 'var(--error-bg,#FEF2F2)' : 'var(--surface)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = p.status === 'overdue' ? 'var(--error-bg,#FEF2F2)' : 'var(--surface)'; }}
                  onClick={() => openWithOrigin(`/procurement/spo/${p.id}`)}>
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
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--text-2)' }} onClick={e => e.stopPropagation()}>
                    {p.prId ? (
                      <button type="button" onClick={() => openWithOrigin(`/procurement/pr/${p.prId}`)} className="text-[var(--brand)] hover:underline">{p.prNumber ?? purchaseReqs.find(r => r.id === p.prId)?.prNumber ?? 'PR'}</button>
                    ) : p.supplierQuotationId ? (
                      <button type="button" onClick={() => openWithOrigin(`/procurement/quote/${p.supplierQuotationId}`)} className="text-[var(--brand)] hover:underline">{p.supplierQuotationRef ?? 'Quote'}</button>
                    ) : (
                      <span>{p.prNumber || p.supplierQuotationRef || '—'}</span>
                    )}
                  </td>
                  <td className="px-4 py-3"><StatusChip status={p.status} /></td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      {canCreate && p.status !== 'cancelled' && (
                        <button onClick={() => setEditSpo(p)} className="p-1 rounded hover:bg-[var(--surface-2)]" title="Edit"><Pencil size={12} style={{ color: 'var(--text-3)' }} /></button>
                      )}
                      {canCreate && p.status !== 'cancelled' && (
                        <button onClick={() => handleDeleteSpo(p.id)} className="p-1 rounded hover:bg-[var(--surface-2)]" title="Cancel"><Trash2 size={12} style={{ color: 'var(--error,#DC2626)' }} /></button>
                      )}
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
                {([['PR Number', 'number'], ['Raised By', 'raisedBy'], ['Raised Date', 'date'], ['Required By', 'requiredBy'], ['Department', 'dept'], ['Lines', 'lines'], ['Priority', 'priority'], ['Status', 'status']] as [string, ProcurementSortKey][]).map(([label, key]) => (
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
                  onClick={() => openWithOrigin(`/procurement/pr/${pr.id}`)}>
                  <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: 'var(--brand)' }}>{pr.prNumber}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--text)' }}>
                    {pr.raisedBy}
                    <div className="text-[11px] text-[var(--text-3)]">{placeLabel(pr.deliverToSiteName, pr.deliverToStoreName)}</div>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{new Date(pr.raisedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{new Date(pr.requiredBy).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{pr.department || 'Production'}</td>
                  <td className="px-4 py-3 text-sm text-center" style={{ color: 'var(--text-2)' }}>{pr.lineCount}</td>
                  <td className="px-4 py-3"><StatusChip status={pr.priority} /></td>
                  <td className="px-4 py-3"><StatusChip status={pr.status} /></td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    {pr.status === 'approved' && (
                      <button onClick={() => openWithOrigin(`/procurement/supplier-rfq/new?mode=invite&pr=${pr.id}`)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium"
                        style={{ borderColor: 'var(--brand)', color: 'var(--brand)' }}>
                        <Send size={11} /> RFQ
                      </button>
                    )}
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
              </tr>
            </thead>
            <tbody>
              {filteredGrns.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-sm" style={{ color: 'var(--text-3)' }}>No goods receipts found</td></tr>
              )}
              {filteredGrns.map(g => (
                <tr key={g.id} className="cursor-pointer" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}
                  onClick={() => openWithOrigin(`/procurement/grn/${g.id}`)}>
                  <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: 'var(--brand)' }}>{g.grnNumber}</td>
                  <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text)' }}>
                    {g.supplierName}
                    <div className="text-[11px] font-normal text-[var(--text-3)]">{placeLabel(g.siteName, g.storeLocationName)}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs" onClick={e => e.stopPropagation()}>
                    <button type="button" onClick={() => openWithOrigin(`/procurement/spo/${g.spoId}`)} className="text-[var(--brand)] hover:underline">{g.spoNumber}</button>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{new Date(g.receivedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{g.receivedBy}</td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-2)' }}>{g.deliveryChallan}</td>
                  <td className="px-4 py-3"><StatusChip status={g.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'quotes' && (() => {
          const selectedQuoteObjs = supplierQuotations.filter(q => selectedQuoteIds.includes(q.id));
          const distinctPrIds = Array.from(new Set(selectedQuoteObjs.map(q => q.prId).filter(Boolean)));
          const crossPrBlocked = selectedQuoteObjs.length >= 2 && (distinctPrIds.length !== 1 || selectedQuoteObjs.some(q => !q.prId));
          const canCompareSelected = selectedQuoteObjs.length >= 2 && !crossPrBlocked;
          const toggleQuoteSelect = (id: string) =>
            setSelectedQuoteIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));

          const prFilteredInvs = supplierInvitations.filter(inv => {
            if (!search.trim()) return true;
            const s = search.toLowerCase();
            return (
              inv.supplierName.toLowerCase().includes(s) ||
              inv.prNumber.toLowerCase().includes(s) ||
              inv.status.toLowerCase().includes(s)
            );
          });

          return (
            <div className="p-3 md:p-5 space-y-5">
              {/* Multi-quote selection comparison toolbar */}
              {selectedQuoteObjs.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                  <div className="text-xs text-[var(--text-2)] flex items-center gap-2">
                    <Scale size={14} className="text-[var(--brand)]" />
                    <span>
                      <strong>{selectedQuoteObjs.length}</strong> quotation(s) selected
                      {crossPrBlocked && (
                        <span className="ml-2 text-red-600 font-semibold">
                          — Cross-PR comparison is blocked. Select quotations for the same Purchase Requisition.
                        </span>
                      )}
                      {!crossPrBlocked && selectedQuoteObjs.length === 1 && (
                        <span className="ml-2 text-[var(--text-3)]">— Select at least one more quote on the same PR ({selectedQuoteObjs[0].prNumber ?? 'PR'}) to compare.</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedQuoteIds([])}
                      className="btn-ghost text-xs"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      disabled={!canCompareSelected}
                      onClick={() => {
                        setCompareQuotes(selectedQuoteObjs);
                      }}
                      className="btn-primary text-xs disabled:opacity-40 inline-flex items-center gap-1.5"
                    >
                      <Scale size={13} /> Compare Selected ({selectedQuoteObjs.length})
                    </button>
                  </div>
                </div>
              )}

              {/* Received & Evaluated Supplier Quotations */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--text-3)]">
                    Supplier Quotations ({filteredQuotes.length})
                  </h3>
                  <span className="text-[11px] text-[var(--text-3)]">
                    Check 2+ quotes on the same PR to run side-by-side comparison
                  </span>
                </div>
                <div className="md:hidden space-y-2">
                  {filteredQuotes.map(qt => {
                    const total = qt.lines.reduce((s, l) => s + l.lineTotal, 0) + (qt.taxAmount ?? 0) + (qt.deliveryCharges ?? 0) - (qt.discountAmount ?? 0);
                    const grouped = supplierQuotations.filter(x => x.prId && x.prId === qt.prId);
                    const checked = selectedQuoteIds.includes(qt.id);
                    return (
                      <div key={qt.id} onClick={() => openWithOrigin(`/procurement/quote/${qt.id}`)} className="rounded-xl border p-3 cursor-pointer" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                            <input type="checkbox" checked={checked} onChange={() => toggleQuoteSelect(qt.id)} />
                            <span className="font-mono text-xs font-bold" style={{ color: 'var(--brand)' }}>{qt.quoteNumber}</span>
                          </span>
                          <StatusChip status={qt.status} />
                        </div>
                        <div className="text-sm font-medium text-[var(--text)] mt-1">{qt.supplierName}</div>
                        <div className="text-xs text-[var(--text-2)] mt-1">
                          ₹{(total / 1000).toFixed(1)}k · {qt.deliveryDays} days · {qt.paymentTerms}
                          {qt.prNumber && <> · <button type="button" onClick={e => { e.stopPropagation(); if (qt.prId) openWithOrigin(`/procurement/pr/${qt.prId}`); }} className="text-[var(--brand)] underline">{qt.prNumber}</button></>}
                        </div>
                        {grouped.length > 1 && grouped[0]?.id === qt.id && (
                          <button onClick={e => { e.stopPropagation(); setCompareQuotes(grouped); }}
                            className="mt-2 text-xs px-2 py-1 rounded-lg border font-medium"
                            style={{ borderColor: 'var(--brand)', color: 'var(--brand)' }}>
                            Compare {grouped.length} PR quotes
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {filteredQuotes.length === 0 && <p className="text-center py-8 text-sm" style={{ color: 'var(--text-3)' }}>No quotations received yet</p>}
                </div>

                <table className="eoss-table hidden md:table">
                  <thead><tr>
                    <th className="w-8" />
                    {([['Quote #', 'number'], ['Supplier', 'supplier'], ['PR Ref', 'source'], ['Date', 'date'], ['Valid Until', 'validUntil'], ['Lead Time', 'leadTime'], ['Payment Terms', 'terms'], ['Landed Total', 'value'], ['Status', 'status']] as [string, ProcurementSortKey][]).map(([label, key]) => (
                      <SortableHeader key={label} label={label} active={sortKey === key} direction={sortDir} onSort={() => handleSort(key)} />
                    ))}
                    <th />
                  </tr></thead>
                  <tbody>
                    {filteredQuotes.map(q => {
                      const total = q.lines.reduce((s, l) => s + l.lineTotal, 0) + (q.taxAmount ?? 0) + (q.deliveryCharges ?? 0) - (q.discountAmount ?? 0);
                      const grouped = supplierQuotations.filter(x => x.prId && x.prId === q.prId);
                      const checked = selectedQuoteIds.includes(q.id);
                      return (
                        <tr key={q.id} onClick={() => openWithOrigin(`/procurement/quote/${q.id}`)} className="cursor-pointer" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}>
                          <td onClick={e => e.stopPropagation()}>
                            <input type="checkbox" checked={checked} onChange={() => toggleQuoteSelect(q.id)} aria-label={`Select ${q.quoteNumber}`} />
                          </td>
                          <td className="font-mono text-xs font-bold" style={{ color: 'var(--brand)' }}>{q.quoteNumber}</td>
                          <td className="text-sm font-medium" style={{ color: 'var(--text)' }}>{q.supplierName}</td>
                          <td className="font-mono text-xs" onClick={e => e.stopPropagation()}>
                            {q.prId ? (
                              <button type="button" onClick={() => openWithOrigin(`/procurement/pr/${q.prId}`)} className="text-[var(--brand)] hover:underline">{q.prNumber ?? q.prId}</button>
                            ) : (
                              <span className="text-[var(--text-3)]">{q.prNumber || '—'}</span>
                            )}
                          </td>
                          <td className="text-xs" style={{ color: 'var(--text-2)' }}>{new Date(q.quoteDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                          <td className="text-xs" style={{ color: 'var(--text-2)' }}>{new Date(q.validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                          <td className="text-xs" style={{ color: 'var(--text-2)' }}>{q.deliveryDays} days</td>
                          <td className="text-xs" style={{ color: 'var(--text-2)' }}>{q.paymentTerms}</td>
                          <td className="font-mono text-sm font-semibold" style={{ color: 'var(--text)' }}>₹{(total / 1000).toFixed(1)}k</td>
                          <td><StatusChip status={q.status} /></td>
                          <td onClick={e => e.stopPropagation()}>
                            {grouped.length > 1 && grouped[0]?.id === q.id && (
                              <button onClick={() => setCompareQuotes(grouped)}
                                className="text-xs px-2 py-1 rounded-lg border font-medium transition-colors"
                                style={{ borderColor: 'var(--brand)', color: 'var(--brand)' }}>
                                Compare ({grouped.length})
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {filteredQuotes.length === 0 && <tr><td colSpan={11} className="text-center py-8 text-sm" style={{ color: 'var(--text-3)' }}>No quotations received yet</td></tr>}
                  </tbody>
                </table>
              </div>

              {/* Supplier Invitations / Requested RFQs */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--text-3)]">
                    Supplier Quotation Invitations ({prFilteredInvs.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => openWithOrigin('/procurement/supplier-rfq/new?mode=invite')}
                    className="btn-ghost text-xs inline-flex items-center gap-1"
                  >
                    <Send size={12} /> Invite Suppliers for PR
                  </button>
                </div>
                <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                  <table className="eoss-table">
                    <thead>
                      <tr>
                        <th>PR Ref</th>
                        <th>Invited Supplier</th>
                        <th>Channel</th>
                        <th>Invited On</th>
                        <th>Response Due</th>
                        <th>Status</th>
                        <th className="text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prFilteredInvs.map(inv => (
                        <tr key={inv.id}>
                          <td className="font-mono text-xs">
                            <button type="button" onClick={() => openWithOrigin(`/procurement/pr/${inv.prId}`)} className="text-[var(--brand)] hover:underline">
                              {inv.prNumber}
                            </button>
                          </td>
                          <td>
                            <div className="text-sm font-medium text-[var(--text)]">{inv.supplierName}</div>
                            {inv.matchReason && <div className="text-[11px] text-[var(--text-3)]">{inv.matchReason}</div>}
                          </td>
                          <td className="text-xs uppercase text-[var(--text-2)]">{inv.channel}</td>
                          <td className="text-xs text-[var(--text-2)]">{inv.sentDate ?? inv.createdAt}</td>
                          <td className="text-xs text-[var(--text-2)]">{inv.responseDueDate ?? '—'}</td>
                          <td><StatusChip status={inv.status} /></td>
                          <td className="text-right space-x-1.5">
                            {['sent', 'awaiting_quotation'].includes(inv.status) && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => openWithOrigin(`/procurement/supplier-rfq/new?invitationId=${inv.id}`)}
                                  className="text-xs px-2.5 py-1 rounded-lg bg-[var(--brand-fill)] text-white font-medium"
                                >
                                  Record Quote
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateSupplierInvitation(inv.id, { status: 'declined' })}
                                  className="text-xs px-2 py-1 rounded-lg border border-[var(--border)] text-[var(--text-2)] hover:text-[var(--danger)]"
                                >
                                  Declined
                                </button>
                              </>
                            )}
                            {inv.quotationId && (
                              <button
                                type="button"
                                onClick={() => openWithOrigin(`/procurement/quote/${inv.quotationId}`)}
                                className="text-xs text-[var(--brand)] hover:underline font-medium"
                              >
                                View Quote
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {prFilteredInvs.length === 0 && (
                        <tr><td colSpan={7} className="text-center py-6 text-xs text-[var(--text-3)]">No supplier invitations sent yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}

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
        <QuoteCompareModal
          quotes={compareQuotes}
          pr={purchaseReqs.find(p => p.id === compareQuotes[0]?.prId)}
          suppliers={suppliers}
          supplierPos={supplierPos}
          onClose={() => setCompareQuotes(null)}
          onApproveWinner={(q, overrideReason, notes) => {
            if (overrideReason) selectQuotation(q.id, overrideReason);
            approveFinalizeQuotation(q.id, currentUser.name, notes);
            showToast({ type: 'success', title: 'Quotation Approved', body: `${q.quoteNumber} (${q.supplierName}) finalized for ${q.prNumber ?? 'PR'}.` });
            setCompareQuotes(null);
          }}
          onGenerateDraftPO={(q, overrideReason, notes) => {
            if (overrideReason) selectQuotation(q.id, overrideReason);
            approveFinalizeQuotation(q.id, currentUser.name, notes);
            const res = generateSPOFromQuotation(q.id);
            setCompareQuotes(null);
            if (res.spo) {
              showToast({ type: 'success', title: 'Draft PO Created', body: `${res.spo.poNumber} drafted for review & issuance.` });
              openWithOrigin(`/procurement/spo/${res.spo.id}`);
            } else if (res.error) {
              showToast({ type: 'error', title: 'Draft PO Blocked', body: res.error });
            }
          }}
          onRejectQuote={(q, reason) => {
            rejectQuotationApproval(q.id, currentUser.name, reason);
            showToast({ type: 'warning', title: 'Quotation Rejected', body: `${q.quoteNumber} marked approval_rejected.` });
            setCompareQuotes(null);
          }}
        />
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

function QuoteCompareModal({
  quotes,
  pr,
  suppliers,
  supplierPos,
  onClose,
  onApproveWinner,
  onGenerateDraftPO,
  onRejectQuote,
}: {
  quotes: SupplierQuotation[];
  pr?: PurchaseRequisition;
  suppliers: ReturnType<typeof useStore.getState>['suppliers'];
  supplierPos: SupplierPO[];
  onClose: () => void;
  onApproveWinner: (q: SupplierQuotation, overrideReason?: string, notes?: string) => void;
  onGenerateDraftPO: (q: SupplierQuotation, overrideReason?: string, notes?: string) => void;
  onRejectQuote: (q: SupplierQuotation, reason: string) => void;
}) {
  const comparison = useMemo(
    () => compareAndRecommendQuotations(pr, quotes, suppliers, supplierPos),
    [pr, quotes, suppliers, supplierPos],
  );
  const [chosenId, setChosenId] = useState<string>(
    comparison.recommendedQuoteId ?? quotes[0]?.id ?? '',
  );
  const [overrideReason, setOverrideReason] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [err, setErr] = useState('');

  const chosenQuote = quotes.find(q => q.id === chosenId) ?? quotes[0];
  const isOverriding = Boolean(comparison.recommendedQuoteId && chosenId !== comparison.recommendedQuoteId);

  const validateApprove = () => {
    if (!chosenQuote) return false;
    if (isOverriding && !overrideReason.trim()) {
      setErr('Override reason is required when selecting a supplier other than the system recommendation.');
      return false;
    }
    setErr('');
    return true;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-4xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto space-y-5">
        <div className="flex justify-between items-start gap-3">
          <div>
            <h3 className="font-bold text-base text-[var(--text)]">
              Side-by-Side Quotation Comparison {pr ? `— ${pr.prNumber}` : ''}
            </h3>
            {pr && (
              <p className="text-xs text-[var(--text-3)] mt-0.5">
                {pr.purpose || 'Purchase Requisition'} · Required by {pr.requiredBy} · {pr.deliverToSiteName ?? 'Site'}
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--surface-2)]">
            <X size={16} className="text-[var(--text-3)]" />
          </button>
        </div>

        {!comparison.valid ? (
          <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-xs text-red-700">
            {comparison.reason}
          </div>
        ) : (
          <>
            {/* Recommendation Summary Banner */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <Sparkles size={14} /> Recommendation Summary
                </span>
                {comparison.recommendedQuoteId && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-700 text-white">
                    Recommended: {quotes.find(q => q.id === comparison.recommendedQuoteId)?.supplierName}
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-900">{comparison.recommendationSummary}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 text-[11px]">
                {comparison.advantages.length > 0 && (
                  <div>
                    <div className="font-semibold text-emerald-800">Advantages</div>
                    <ul className="list-disc pl-4 text-emerald-900">
                      {comparison.advantages.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  </div>
                )}
                {comparison.disadvantages.length > 0 && (
                  <div>
                    <div className="font-semibold text-amber-800">Trade-offs</div>
                    <ul className="list-disc pl-4 text-amber-900">
                      {comparison.disadvantages.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                  </div>
                )}
                {(comparison.missingInfo.length > 0 || comparison.warnings.length > 0) && (
                  <div>
                    <div className="font-semibold text-red-800">Missing Info / Warnings</div>
                    <ul className="list-disc pl-4 text-red-700">
                      {[...comparison.missingInfo, ...comparison.warnings].map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Line-Item Matrix */}
            <div className="overflow-x-auto border border-[var(--border)] rounded-xl">
              <table className="eoss-table">
                <thead>
                  <tr style={{ background: 'var(--surface-2)' }}>
                    <th className="text-xs">Item / Req.</th>
                    {quotes.map(q => (
                      <th key={q.id} className="text-xs">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="radio"
                            name="winner-quote-modal"
                            checked={chosenId === q.id}
                            onChange={() => { setChosenId(q.id); setErr(''); }}
                          />
                          <span>{q.supplierName}</span>
                          {q.id === comparison.recommendedQuoteId && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-semibold">Best</span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-[var(--text-3)] mt-0.5">{q.quoteNumber}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparison.rows.map(row => (
                    <tr key={row.prLineId}>
                      <td>
                        <div className="font-medium text-xs text-[var(--text)]">{row.materialName}</div>
                        <div className="text-[11px] text-[var(--text-3)]">
                          Req: {row.requiredQty} {row.uom}{row.requiredGrade ? ` · ${row.requiredGrade}` : ''}
                        </div>
                      </td>
                      {row.cells.map(cell => (
                        <td key={cell.quoteId} className="text-xs">
                          {cell.missing ? (
                            <span className="inline-block px-2 py-0.5 rounded bg-red-50 text-red-700 text-[11px] font-medium">
                              Not Quoted
                            </span>
                          ) : (
                            <div className="space-y-0.5">
                              <div className="font-mono font-semibold text-[var(--text)]">
                                ₹{cell.unitPrice.toLocaleString('en-IN')}/{row.uom}
                                {row.lowestUnitPrice === cell.unitPrice && (
                                  <span className="ml-1 px-1 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px]">Lowest</span>
                                )}
                              </div>
                              <div className="text-[11px] text-[var(--text-2)]">
                                Qty: {cell.quotedQty}{cell.qtyMismatch && <span className="text-amber-700 font-semibold"> (Diff)</span>}
                                {' · '}₹{cell.lineTotal.toLocaleString('en-IN')}
                              </div>
                              {cell.gradeMismatch && (
                                <div className="text-[11px] text-amber-700 font-semibold">
                                  Grade diff: {cell.grade || 'Unspecified'}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {/* Totals & Terms Footer Rows */}
                  <tr className="bg-[var(--surface-2)]/60 font-semibold">
                    <td className="text-xs text-[var(--text-2)]">Landed Total (incl. Tax & Freight)</td>
                    {comparison.evaluations.map(ev => (
                      <td key={ev.quote.id} className="font-mono text-sm text-[var(--text)]">
                        ₹{ev.landedTotal.toLocaleString('en-IN')}
                        <div className="text-[11px] font-normal text-[var(--text-3)]">
                          {ev.coveragePct}% lines · {ev.quote.deliveryDays}d lead · {ev.quote.paymentTerms}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Decision Inputs */}
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/40 space-y-3">
              {isOverriding && (
                <div>
                  <label className="block text-xs font-semibold text-amber-800 mb-1">
                    Override Reason (Required since selection differs from recommendation) *
                  </label>
                  <input
                    className="eoss-input w-full"
                    placeholder="e.g. Faster delivery needed for urgent shutdown window / approved MTC lot available"
                    value={overrideReason}
                    onChange={e => setOverrideReason(e.target.value)}
                  />
                </div>
              )}
              {!rejectMode ? (
                <div>
                  <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Approval / Selection Notes (optional)</label>
                  <input
                    className="eoss-input w-full"
                    placeholder="e.g. Commercial terms verified by buyer"
                    value={approvalNotes}
                    onChange={e => setApprovalNotes(e.target.value)}
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-red-700 mb-1">
                    Rejection Reason for {chosenQuote?.supplierName} ({chosenQuote?.quoteNumber}) *
                  </label>
                  <input
                    className="eoss-input w-full"
                    placeholder="e.g. Price above budget & grade deviation unacceptable"
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                  />
                </div>
              )}
              {err && <p className="text-xs text-red-600">{err}</p>}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setRejectMode(r => !r); setErr(''); }}
                  className="text-xs text-red-600 hover:underline font-medium"
                >
                  {rejectMode ? '← Back to Approval Actions' : 'Reject Selected Quotation Instead'}
                </button>
                <div className="flex flex-wrap gap-2">
                  {rejectMode ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (!chosenQuote || !rejectReason.trim()) {
                          setErr('Please enter a mandatory rejection reason.');
                          return;
                        }
                        onRejectQuote(chosenQuote, rejectReason.trim());
                      }}
                      className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold"
                    >
                      Confirm Reject {chosenQuote?.quoteNumber}
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          if (!validateApprove() || !chosenQuote) return;
                          onApproveWinner(chosenQuote, isOverriding ? overrideReason.trim() : undefined, approvalNotes.trim() || undefined);
                        }}
                        className="px-4 py-2 rounded-xl border border-[var(--brand)] text-[var(--brand)] text-xs font-semibold inline-flex items-center gap-1"
                      >
                        <CheckCircle2 size={13} /> Approve Winner ({chosenQuote?.supplierName})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!validateApprove() || !chosenQuote) return;
                          onGenerateDraftPO(chosenQuote, isOverriding ? overrideReason.trim() : undefined, approvalNotes.trim() || undefined);
                        }}
                        className="btn-primary text-xs inline-flex items-center gap-1.5"
                      >
                        Approve & Draft Supplier PO →
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
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
