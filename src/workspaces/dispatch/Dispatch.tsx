import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, ChevronRight, Search, X, PackageCheck, Trash2 } from 'lucide-react';
import { useStore, CUSTOMERS } from '../../store';
import type { Dispatch } from '../../types';
import { checkDispatchEligibility } from '../../domain/dispatchEligibility';
import { dispatchesReady, isReadyToShip, DEFAULT_SITE_ID, DEFAULT_SITE_NAME, SHIP_STORE_ID, SHIP_STORE_NAME } from '../../domain/recordLists';
import SiteStoreField from '../../components/forms/SiteStoreField';
import { placeLabel } from '../../domain/places';
import StatusChip from '../../components/layout/StatusChip';
import SortableHeader from '../../components/layout/SortableHeader';
import { sortRows } from '../../domain/tableSort';

type DispatchSortKey = 'number' | 'customer' | 'jobs' | 'carrier' | 'dispatchDate' | 'expectedDelivery' | 'qty' | 'status';

let dspSeq = 100;

export default function DispatchWorkspace() {
  const { dispatches, invoices, sites, currentUser, addDispatch, recordPoD, showToast, jobs, qualityReleases, inspections } = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [podDispatchId, setPodDispatchId] = useState<string | null>(null);
  const [deletedDispatchIds, setDeletedDispatchIds] = useState<Set<string>>(new Set());
  const [selectedJobId, setSelectedJobId] = useState('');
  const canManage = ['owner', 'dispatch'].includes(currentUser.role);

  const handleDeleteDispatch = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const hasInvoice = invoices.some(inv => Array.isArray((inv as any).dispatchIds) && (inv as any).dispatchIds.includes(id));
    if (hasInvoice) { showToast({ type: 'error', title: 'Cannot delete', body: 'Dispatch is linked to an invoice.' }); return; }
    setDeletedDispatchIds(prev => new Set([...prev, id]));
    showToast({ type: 'success', title: 'Dispatch removed' });
  };
  const [form, setForm] = useState({
    customerId: '', customerName: '', carrier: '',
    vehicleNumber: '', lrNumber: '', dispatchDate: '', jobs: '',
    sourceSiteId: DEFAULT_SITE_ID, sourceSiteName: DEFAULT_SITE_NAME,
    sourceStoreLocationId: SHIP_STORE_ID, sourceStoreLocationName: SHIP_STORE_NAME,
  });

  useEffect(() => {
    const plan = searchParams.get('plan');
    if (!plan) return;
    const job = jobs.find(j => j.id === plan) ?? jobs.find(j => qualityReleases.some(r => r.jobId === j.id));
    if (!job) return;
    setSelectedJobId(job.id);
    setForm(f => ({
      ...f,
      customerId: job.customerId,
      customerName: job.customerName,
      dispatchDate: '2026-11-09',
    }));
    setShowModal(true);
    // Prefill once from the Home action.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const eligibleJob = jobs.find(j => j.id === selectedJobId);
  const eligibility = eligibleJob ? checkDispatchEligibility({ job: eligibleJob, qualityReleases, inspections }) : null;

  const [statusFocus, setStatusFocus] = useState<string | null>(searchParams.get('status'));
  const [siteFilter, setSiteFilter] = useState('all');
  const base = dispatches.filter(d => !deletedDispatchIds.has(d.id) && (siteFilter === 'all' || d.sourceSiteId === siteFilter) && (!search || d.dispatchNumber.toLowerCase().includes(search.toLowerCase()) || d.customerName.toLowerCase().includes(search.toLowerCase())));
  const pendingDocs = base.filter(d => d.status === 'pending_docs').length;
  const dispatched  = base.filter(d => d.status === 'dispatched').length;
  const readyCount = dispatchesReady(base).length;
  const passesStatus = (status: string, focus: string | null) => !focus || (focus === 'ready' ? isReadyToShip(status) : status === focus);
  const filteredBase = dispatches.filter(d =>
    !deletedDispatchIds.has(d.id) &&
    passesStatus(d.status, statusFocus) &&
    (siteFilter === 'all' || d.sourceSiteId === siteFilter) &&
    (!search ||
    d.dispatchNumber.toLowerCase().includes(search.toLowerCase()) ||
    d.customerName.toLowerCase().includes(search.toLowerCase()))
  );
  const [sortKey, setSortKey] = useState<DispatchSortKey>('number');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const filtered = sortRows(filteredBase, sortKey, sortDir, (d, key) => ({
    number: d.dispatchNumber, customer: d.customerName, jobs: (d.jobs ?? []).join(', '), carrier: d.carrier ?? d.vehicleNumber,
    dispatchDate: d.dispatchDate, expectedDelivery: d.expectedDelivery, qty: d.totalQty, status: d.status,
  }[key as DispatchSortKey]));
  const handleSort = (key: DispatchSortKey) => {
    if (sortKey === key) setSortDir(direction => direction === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  function handleCreate() {
    if (eligibleJob && eligibility && !eligibility.eligible) {
      showToast({ type: 'error', title: 'Not dispatch-eligible', body: eligibility.reason });
      return;
    }
    const customer = CUSTOMERS.find(c => c.id === form.customerId);
    const newDispatch: Dispatch = {
      id: `dsp-new-${++dspSeq}`,
      dispatchNumber: `DSP-2024-${String(100 + dspSeq).slice(-3)}`,
      customerId: form.customerId,
      customerName: customer?.tradingName ?? form.customerName,
      jobId: eligibleJob?.id, jobNumber: eligibleJob?.jobNumber,
      customerPoId: eligibleJob?.customerPoId, customerPoNumber: eligibleJob?.customerPoNumber,
      qualityReleaseId: eligibility?.qualityReleaseId,
      sourceSiteId: form.sourceSiteId,
      sourceStoreLocationId: form.sourceStoreLocationId,
      sourceStoreLocationName: form.sourceStoreLocationName,
      dispatchDate: form.dispatchDate,
      carrier: form.carrier || undefined,
      vehicleNumber: form.vehicleNumber || undefined,
      lrNumber: form.lrNumber || undefined,
      status: 'pending_docs',
      lineCount: 0,
      totalQty: 0,
      hasPoD: false,
      jobs: eligibleJob ? [eligibleJob.jobNumber] : (form.jobs ? form.jobs.split(',').map(s => s.trim()).filter(Boolean) : []),
    };
    addDispatch(newDispatch);
    setShowModal(false);
    setSelectedJobId('');
    setForm({ customerId: '', customerName: '', carrier: '', vehicleNumber: '', lrNumber: '', dispatchDate: '', jobs: '', sourceSiteId: DEFAULT_SITE_ID, sourceSiteName: DEFAULT_SITE_NAME, sourceStoreLocationId: SHIP_STORE_ID, sourceStoreLocationName: SHIP_STORE_NAME });
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex-shrink-0 flex items-center gap-3 px-5 py-3 border-b flex-wrap" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search dispatches…"
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border outline-none"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text)' }} />
        </div>
        <select value={siteFilter} onChange={e => setSiteFilter(e.target.value)} className="eoss-input text-xs py-1.5 max-w-[11rem]" aria-label="Ship-from site">
          <option value="all">All sites</option>
          {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <div className="flex-1" />
        {readyCount > 0 && <button type="button" onClick={() => setStatusFocus(statusFocus === 'ready' ? null : 'ready')} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: 'var(--success-bg,#F0FDF4)', color: 'var(--success,#16A34A)' }}>{readyCount} ready</button>}
        {pendingDocs > 0 && <button type="button" onClick={() => setStatusFocus(statusFocus === 'pending_docs' ? null : 'pending_docs')} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: 'var(--warning-bg,#FFFBEB)', color: 'var(--warning,#D97706)' }}>{pendingDocs} pending docs</button>}
        {dispatched > 0 && <button type="button" onClick={() => setStatusFocus(statusFocus === 'dispatched' ? null : 'dispatched')} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: 'var(--info-bg,#EFF6FF)', color: 'var(--info,#2563EB)' }}>{dispatched} in transit</button>}
        {['owner', 'dispatch'].includes(currentUser.role) && (
          <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: 'var(--brand-fill)' }}>
            <Plus size={13} /> New Dispatch
          </button>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <div className="md:hidden p-3 space-y-2">
          {filtered.map(d => (
            <button key={d.id} type="button" onClick={() => navigate(`/dispatch/${d.id}`)}
              className="w-full text-left rounded-xl border p-3" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold" style={{ color: 'var(--brand)' }}>{d.dispatchNumber}</span>
                <StatusChip status={d.status} size="sm" />
              </div>
              <div className="text-sm font-semibold text-[var(--text)] mt-1">{d.customerName}</div>
              <div className="text-xs text-[var(--text-2)] mt-1">{placeLabel(sites.find(s => s.id === d.sourceSiteId)?.name, d.sourceStoreLocationName)} · {(d.jobs ?? []).join(', ') || 'No job'}</div>
            </button>
          ))}
        </div>
        <table className="hidden md:table w-full text-sm border-separate border-spacing-0" style={{ minWidth: 800 }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 5 }}>
            <tr style={{ background: 'var(--surface-2)' }}>
              {([['Dispatch #', 'number'], ['Customer', 'customer'], ['Jobs', 'jobs'], ['Carrier / Vehicle', 'carrier'], ['Dispatch Date', 'dispatchDate'], ['Expected Delivery', 'expectedDelivery'], ['Qty', 'qty'], ['Status', 'status']] as [string, DispatchSortKey][]).map(([label, key]) => (
                <SortableHeader key={label} label={label} active={sortKey === key} direction={sortDir} onSort={() => handleSort(key)} className="text-left px-4 py-2.5 text-xs font-semibold font-medium" style={{ color: 'var(--text-3)', borderBottom: '1px solid var(--border)' }} />
              ))}
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map(d => (
              <tr key={d.id} className="cursor-pointer" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}
                onClick={() => navigate(`/dispatch/${d.id}`)}>
                <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: 'var(--brand)' }}>{d.dispatchNumber}</td>
                <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text)' }}>
                  {d.customerName}
                  <div className="text-[11px] font-normal text-[var(--text-3)]">{placeLabel(sites.find(s => s.id === d.sourceSiteId)?.name, d.sourceStoreLocationName)}</div>
                </td>
                <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-2)' }}>{(d.jobs ?? []).join(', ') || '—'}</td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{d.carrier ?? d.vehicleNumber ?? '—'}</td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{d.dispatchDate ? new Date(d.dispatchDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{d.expectedDelivery ? new Date(d.expectedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</td>
                <td className="px-4 py-3 text-xs text-center" style={{ color: 'var(--text-2)' }}>{d.totalQty ?? '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 flex-wrap">
                    <StatusChip status={d.status} size="sm" />
                    {d.status === 'pending_docs' && d.totalQty === 0 && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">Ready Stock</span>}
                  </div>
                </td>
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-1">
                    {d.status === 'dispatched' && !d.hasPoD && (
                      <button onClick={e => { e.stopPropagation(); setPodDispatchId(d.id); }}
                        className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg border font-medium transition-colors"
                        style={{ borderColor: 'var(--brand)', color: 'var(--brand)' }} title="Record Proof of Delivery">
                        <PackageCheck size={11} /> PoD
                      </button>
                    )}
                    {canManage && d.status !== 'delivered' && (
                      <button onClick={e => handleDeleteDispatch(d.id, e)} className="p-1 rounded hover:bg-[var(--surface-2)]" title="Remove dispatch"><Trash2 size={12} style={{ color: 'var(--error,#DC2626)' }} /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-10 text-center text-sm" style={{ color: 'var(--text-3)' }}>No dispatches found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-[var(--text)]">New Dispatch</h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--text-3)] hover:text-[var(--text)]"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <SiteStoreField
                siteId={form.sourceSiteId}
                storeId={form.sourceStoreLocationId}
                label="Ship-from site"
                storeLabel="Ship-from store"
                onChange={next => setForm(f => ({ ...f, sourceSiteId: next.siteId, sourceSiteName: next.siteName, sourceStoreLocationId: next.storeId, sourceStoreLocationName: next.storeName }))}
              />
              <div>
                <label className="text-xs text-[var(--text-3)] block mb-1">Customer *</label>
                <select
                  value={form.customerId}
                  onChange={e => {
                    const c = CUSTOMERS.find(c => c.id === e.target.value);
                    setForm(f => ({ ...f, customerId: e.target.value, customerName: c?.tradingName ?? '' }));
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--brand)]"
                >
                  <option value="">Select customer…</option>
                  {CUSTOMERS.map(c => <option key={c.id} value={c.id}>{c.tradingName}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--text-3)] block mb-1">Job (checks quality release before dispatch)</label>
                <select
                  value={selectedJobId}
                  onChange={e => setSelectedJobId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--brand)]"
                >
                  <option value="">No specific job (free dispatch)</option>
                  {jobs.map(j => <option key={j.id} value={j.id}>{j.jobNumber} — {j.description}</option>)}
                </select>
                {eligibility && (
                  <p className={`text-xs mt-1.5 ${eligibility.eligible ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                    {eligibility.eligible ? `✓ Dispatch-eligible — ${eligibility.reason}` : `✗ Not eligible — ${eligibility.reason}`}
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs text-[var(--text-3)] block mb-1">Carrier</label>
                <input value={form.carrier} onChange={e => setForm(f => ({ ...f, carrier: e.target.value }))} placeholder="DTDC / Blue Dart…" className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--brand)]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[var(--text-3)] block mb-1">Vehicle No.</label>
                  <input value={form.vehicleNumber} onChange={e => setForm(f => ({ ...f, vehicleNumber: e.target.value }))} placeholder="TS09XX0000" className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--brand)]" />
                </div>
                <div>
                  <label className="text-xs text-[var(--text-3)] block mb-1">LR Number</label>
                  <input value={form.lrNumber} onChange={e => setForm(f => ({ ...f, lrNumber: e.target.value }))} placeholder="LR-XXXX" className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--brand)]" />
                </div>
              </div>
              <div>
                <label className="text-xs text-[var(--text-3)] block mb-1">Dispatch Date *</label>
                <input type="date" value={form.dispatchDate} onChange={e => setForm(f => ({ ...f, dispatchDate: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--brand)]" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 border border-[var(--border)] text-[var(--text)] rounded-lg text-sm">Cancel</button>
              <button
                disabled={!form.customerId || !form.dispatchDate || (!!eligibility && !eligibility.eligible)}
                onClick={handleCreate}
                className="flex-1 py-2 bg-[var(--brand-fill)] text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                Create Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PoD Modal */}
      {podDispatchId && (
        <PodModal
          onClose={() => setPodDispatchId(null)}
          onSave={() => {
            recordPoD(podDispatchId);
            showToast({ type: 'success', title: 'Proof of Delivery recorded', body: 'Dispatch marked as delivered.' });
            setPodDispatchId(null);
          }}
        />
      )}
    </div>
  );
}

function PodModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({ receivedBy: '', receivedDate: '2026-11-05', condition: 'Good', notes: '' });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-[var(--text)]">Record Proof of Delivery</h3>
          <button onClick={onClose}><X size={16} className="text-[var(--text-3)]" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Received By *</label>
            <input className="eoss-input w-full" value={form.receivedBy} onChange={e => setForm(f => ({ ...f, receivedBy: e.target.value }))} placeholder="Name of person who received" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Received Date</label>
            <input type="date" className="eoss-input w-full" value={form.receivedDate} onChange={e => setForm(f => ({ ...f, receivedDate: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Condition</label>
            <select className="eoss-input w-full" value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}>
              {['Good', 'Damaged', 'Partial'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Notes</label>
            <input className="eoss-input w-full" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes" />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[var(--border)] rounded-xl text-sm text-[var(--text-2)]">Cancel</button>
          <button onClick={() => { if (!form.receivedBy) return; onSave(); }} className="flex-1 py-2.5 bg-[var(--brand-fill)] text-white rounded-xl text-sm font-medium">Confirm PoD</button>
        </div>
      </div>
    </div>
  );
}

function KpiTile({ label, value, accent = 'neutral' }: { label: string; value: number; accent?: string }) {
  const color = { error: 'var(--error)', success: 'var(--success)', info: 'var(--info)', warning: 'var(--warning)', neutral: 'var(--text)' }[accent] ?? 'var(--text)';
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
      <div className="text-xl font-bold" style={{ color }}>{value}</div>
      <div className="text-xs text-[var(--text-2)] mt-0.5">{label}</div>
    </div>
  );
}
