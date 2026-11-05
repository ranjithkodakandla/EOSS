import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, ChevronRight, ArrowUpRight, Calendar,
  FileText, Briefcase, DollarSign, Clock, User, X
} from 'lucide-react';
import { useStore, CUSTOMERS } from '../../store';
import StatusChip from '../../components/layout/StatusChip';
import clsx from 'clsx';
import type { CustomerRFQ } from '../../types';

type POTab = 'pos' | 'rfqs' | 'customers';

export default function Sales() {
  const { rfqs, customerPos, jobs, currentUser, showToast } = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<POTab>('pos');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPoId, setSelectedPoId] = useState<string | null>(null);
  const [showNewRFQ, setShowNewRFQ] = useState(false);

  const canCreate = ['owner', 'sales'].includes(currentUser.role);

  const filteredPos = customerPos.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.poNumber.toLowerCase().includes(q) || p.customerName.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredRfqs = rfqs.filter(r => {
    const q = search.toLowerCase();
    return !q || r.rfqNumber.toLowerCase().includes(q) || r.customerName.toLowerCase().includes(q);
  });

  const selectedPo = customerPos.find(p => p.id === selectedPoId);
  const poJobs = selectedPo ? jobs.filter(j => j.customerPoId === selectedPo.id) : [];

  const totalActive = customerPos.filter(p => p.status === 'active').reduce((s, p) => s + p.totalValue, 0);

  const poStatuses = ['all', 'active', 'complete', 'cancelled'];

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });

  return (
    <div className="flex flex-col h-full">
      {/* Page Header */}
      <div
        className="flex-shrink-0 px-6 py-4 border-b flex items-center justify-between gap-4"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      >
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--text)' }}>Sales</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>
            {customerPos.filter(p => p.status === 'active').length} active POs · ₹{(totalActive / 100000).toFixed(1)}L in progress
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowNewRFQ(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--brand)' }}
          >
            <Plus size={15} /> New RFQ
          </button>
        )}
      </div>

      {/* Workspace Tabs — amber underline style */}
      <div
        className="flex-shrink-0 flex items-center gap-0 px-6 border-b"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      >
        {([
          { id: 'pos', label: `Customer POs (${customerPos.length})` },
          { id: 'rfqs', label: `RFQs (${rfqs.length})` },
          { id: 'customers', label: 'Customer Directory' },
        ] as { id: POTab; label: string }[]).map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); if (t.id === 'customers') navigate('/sales/customers'); }}
            className={clsx(
              'px-4 py-3 text-sm font-medium transition-colors relative whitespace-nowrap',
              tab === t.id
                ? 'font-semibold'
                : 'hover:opacity-80'
            )}
            style={{ color: tab === t.id ? 'var(--brand)' : 'var(--text-2)' }}
          >
            {t.label}
            {tab === t.id && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                style={{ background: 'var(--brand)' }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div
        className="flex-shrink-0 flex items-center gap-3 px-6 py-3 border-b"
        style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
      >
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search PO number, customer…"
            className="w-full pl-8 pr-3 py-1.5 rounded-lg text-sm border focus:outline-none focus:ring-1"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--surface)',
              color: 'var(--text)',
              focusRingColor: 'var(--brand)',
            }}
          />
        </div>
        {tab === 'pos' && (
          <div className="flex items-center gap-1.5">
            {poStatuses.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize"
                style={
                  statusFilter === s
                    ? { background: 'var(--brand)', color: '#fff' }
                    : { background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-2)' }
                }
              >
                {s === 'all' ? 'All' : s}
              </button>
            ))}
          </div>
        )}
        {search && (
          <button
            onClick={() => setSearch('')}
            className="text-xs underline"
            style={{ color: 'var(--text-3)' }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Content — master-detail split */}
      <div className="flex flex-1 overflow-hidden">
        {/* List panel */}
        <div
          className={clsx(
            'overflow-auto',
            selectedPo ? 'w-[58%] border-r' : 'w-full'
          )}
          style={{ borderColor: 'var(--border)' }}
        >
          {tab === 'pos' && (
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 z-10" style={{ background: 'var(--surface-2)' }}>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['PO Number', 'Customer', 'Date', 'Value', 'Lines', 'Terms', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold font-medium" style={{ color: 'var(--text-3)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPos.map(p => {
                  const isSelected = p.id === selectedPoId;
                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedPoId(isSelected ? null : p.id)}
                      className="cursor-pointer transition-colors"
                      style={{
                        borderBottom: '1px solid var(--border)',
                        background: isSelected ? 'var(--brand-50, rgba(var(--brand-rgb,112,72,245),0.06))' : 'var(--surface)',
                        borderLeft: isSelected ? '3px solid var(--brand)' : '3px solid transparent',
                      }}
                      onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
                      onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}
                    >
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs font-bold" style={{ color: 'var(--brand)' }}>{p.poNumber}</div>
                        {p.hasAmendment && <div className="text-[10px] mt-0.5 font-medium" style={{ color: 'var(--warning)' }}>Amendment</div>}
                      </td>
                      <td className="px-4 py-3 font-medium" style={{ color: 'var(--text)' }}>{p.customerName}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>
                        {fmt(p.acceptedDate)}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-xs" style={{ color: 'var(--text)' }}>
                        ₹{(p.totalValue / 100000).toFixed(1)}L
                      </td>
                      <td className="px-4 py-3 text-center text-xs" style={{ color: 'var(--text-2)' }}>{p.lineCount}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{p.paymentTerms}</td>
                      <td className="px-4 py-3">
                        <StatusChip status={p.status} size="sm" />
                      </td>
                    </tr>
                  );
                })}
                {filteredPos.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-12 text-sm" style={{ color: 'var(--text-3)' }}>No POs match the current filters</td></tr>
                )}
              </tbody>
            </table>
          )}

          {tab === 'rfqs' && (
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 z-10" style={{ background: 'var(--surface-2)' }}>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['RFQ Number', 'Customer', 'Received', 'Required By', 'Lines', 'Channel', 'Status', 'Owner'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold font-medium" style={{ color: 'var(--text-3)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRfqs.map(r => (
                  <tr
                    key={r.id}
                    className="cursor-pointer transition-colors"
                    style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}
                    onClick={() => navigate(`/sales/rfq/${r.id}`)}
                  >
                    <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: 'var(--brand)' }}>{r.rfqNumber}</td>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--text)' }}>{r.customerName}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{fmt(r.receivedDate)}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{fmt(r.requiredBy)}</td>
                    <td className="px-4 py-3 text-center text-xs" style={{ color: 'var(--text-2)' }}>{r.lineCount}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{r.channel}</td>
                    <td className="px-4 py-3"><StatusChip status={r.status} size="sm" /></td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{r.owner}</td>
                  </tr>
                ))}
                {filteredRfqs.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-12 text-sm" style={{ color: 'var(--text-3)' }}>No RFQs found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Detail Preview Panel */}
        {selectedPo && (
          <div className="w-[42%] overflow-auto flex flex-col" style={{ background: 'var(--surface)' }}>
            {/* Preview Header */}
            <div className="px-5 py-4 border-b flex items-start justify-between" style={{ borderColor: 'var(--border)' }}>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-base" style={{ color: 'var(--brand)' }}>{selectedPo.poNumber}</span>
                  <StatusChip status={selectedPo.status} />
                  {selectedPo.hasAmendment && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full border font-medium" style={{ background: 'var(--warning-bg)', color: 'var(--warning)', borderColor: 'var(--warning)' }}>
                      Amendment
                    </span>
                  )}
                </div>
                <p className="text-sm mt-0.5 font-medium" style={{ color: 'var(--text)' }}>{selectedPo.customerName}</p>
              </div>
              <button
                onClick={() => navigate(`/sales/po/${selectedPo.id}`)}
                className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors hover:opacity-80"
                style={{ borderColor: 'var(--brand)', color: 'var(--brand)' }}
              >
                Open full record <ArrowUpRight size={12} />
              </button>
            </div>

            {/* Value Summary */}
            <div className="px-5 py-4 border-b grid grid-cols-3 gap-4" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
              <Metric icon={<DollarSign size={14} />} label="Total Value" value={`₹${(selectedPo.totalValue / 100000).toFixed(2)}L`} />
              <Metric icon={<FileText size={14} />} label="Line Items" value={String(selectedPo.lineCount)} />
              <Metric icon={<Clock size={14} />} label="Terms" value={selectedPo.paymentTerms} small />
            </div>

            {/* Detail Fields */}
            <div className="px-5 py-4 space-y-4 flex-1">
              <Section title="PO Details">
                <Field label="Accepted Date" value={fmt(selectedPo.acceptedDate)} />
                <Field label="Delivery Terms" value={selectedPo.deliveryTerms} />
                <Field label="Currency" value={selectedPo.currency} />
                {selectedPo.quotationRef && <Field label="Quotation Ref" value={selectedPo.quotationRef} mono />}
              </Section>

              <Section title={`Linked Jobs (${poJobs.length})`}>
                {poJobs.length === 0 ? (
                  <p className="text-xs" style={{ color: 'var(--text-3)' }}>No jobs linked to this PO yet.</p>
                ) : (
                  <div className="space-y-2">
                    {poJobs.map(j => (
                      <button
                        key={j.id}
                        onClick={() => navigate(`/jobs/${j.id}`)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg border text-left hover:opacity-80 transition-opacity"
                        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
                      >
                        <div>
                          <div className="text-xs font-mono font-bold" style={{ color: 'var(--brand)' }}>{j.jobNumber}</div>
                          <div className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>{j.currentStage} · {j.status}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusChip status={j.status} size="sm" />
                          <ChevronRight size={12} style={{ color: 'var(--text-3)' }} />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </Section>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => navigate(`/sales/po/${selectedPo.id}`)}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: 'var(--brand)' }}
                >
                  Open Full Record
                </button>
                <button
                  onClick={() => navigate(`/sales/po/${selectedPo.id}/amend`)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold border transition-colors hover:opacity-80"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
                >
                  Amend
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New RFQ Modal */}
      {showNewRFQ && (
        <NewRFQModal
          onClose={() => setShowNewRFQ(false)}
          onSave={(rfq) => {
            showToast({ type: 'success', title: 'RFQ created', body: `${rfq.rfqNumber} opened.` });
            setShowNewRFQ(false);
            setTab('rfqs');
          }}
        />
      )}
    </div>
  );
}

function NewRFQModal({ onClose, onSave }: { onClose: () => void; onSave: (r: CustomerRFQ) => void }) {
  const { currentUser, addRfq } = useStore();
  const [form, setForm] = useState({
    customerId: '', customerName: '', requiredBy: '', channel: 'Email', lineCount: '1',
  });
  const [err, setErr] = useState('');
  const save = () => {
    if (!form.customerId || !form.requiredBy) { setErr('Customer and required-by date are required'); return; }
    const id = `rfq-${Date.now()}`;
    const num = `RFQ-2026-${String(Math.floor(Math.random() * 900 + 100))}`;
    const rfq: CustomerRFQ = { id, rfqNumber: num, customerId: form.customerId, customerName: form.customerName, receivedDate: '2026-11-05', requiredBy: form.requiredBy, status: 'open', lineCount: Number(form.lineCount), channel: form.channel as CustomerRFQ['channel'], owner: currentUser.name };
    addRfq(rfq);
    onSave(rfq);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-[var(--text)]">New RFQ</h3>
          <button onClick={onClose}><X size={16} className="text-[var(--text-3)]" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Customer *</label>
            <select className="eoss-input w-full" value={form.customerId} onChange={e => {
              const c = CUSTOMERS.find(x => x.id === e.target.value);
              setForm(f => ({ ...f, customerId: e.target.value, customerName: c?.tradingName ?? c?.legalName ?? '' }));
            }}>
              <option value="">Select customer…</option>
              {CUSTOMERS.map(c => <option key={c.id} value={c.id}>{c.tradingName ?? c.legalName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Required By *</label>
            <input type="date" className="eoss-input w-full" value={form.requiredBy} onChange={e => setForm(f => ({ ...f, requiredBy: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Channel</label>
              <select className="eoss-input w-full" value={form.channel} onChange={e => setForm(f => ({ ...f, channel: e.target.value }))}>
                {['Email', 'Portal', 'WhatsApp', 'Phone', 'Tender'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Line Items</label>
              <input type="number" className="eoss-input w-full" value={form.lineCount} onChange={e => setForm(f => ({ ...f, lineCount: e.target.value }))} min="1" />
            </div>
          </div>
        </div>
        {err && <p className="text-xs text-[var(--danger)] mt-2">{err}</p>}
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[var(--border)] rounded-xl text-sm text-[var(--text-2)]">Cancel</button>
          <button onClick={save} className="flex-1 py-2.5 bg-[var(--brand)] text-white rounded-xl text-sm font-medium">Create RFQ</button>
        </div>
      </div>
    </div>
  );
}

function Metric({ icon, label, value, small }: { icon: React.ReactNode; label: string; value: string; small?: boolean }) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-1" style={{ color: 'var(--text-3)' }}>
        {icon}
        <span className="text-[10px] font-medium">{label}</span>
      </div>
      <div className={clsx('font-bold', small ? 'text-sm' : 'text-base')} style={{ color: 'var(--text)' }}>{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold font-medium mb-2" style={{ color: 'var(--text-3)' }}>{title}</div>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-baseline gap-2">
      <span className="text-xs" style={{ color: 'var(--text-3)' }}>{label}</span>
      <span className={clsx('text-xs font-medium text-right', mono ? 'font-mono' : '')} style={{ color: 'var(--text)' }}>{value}</span>
    </div>
  );
}
