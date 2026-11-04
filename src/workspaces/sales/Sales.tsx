import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, Search, TrendingUp } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';
import clsx from 'clsx';

export default function Sales() {
  const { rfqs, customerPos, currentUser } = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'rfqs' | 'pos' | 'customers'>('pos');
  const [search, setSearch] = useState('');

  const filteredPos = customerPos.filter(p =>
    !search || p.poNumber.toLowerCase().includes(search.toLowerCase()) || p.customerName.toLowerCase().includes(search.toLowerCase())
  );
  const filteredRfqs = rfqs.filter(r =>
    !search || r.rfqNumber.toLowerCase().includes(search.toLowerCase()) || r.customerName.toLowerCase().includes(search.toLowerCase())
  );

  const totalActive = customerPos.filter(p => p.status === 'active').reduce((s, p) => s + p.totalValue, 0);
  const canCreate = ['owner', 'sales'].includes(currentUser.role);

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-[var(--text)]">Sales</h1>
          <p className="text-sm text-[var(--text-2)]">
            {customerPos.filter(p => p.status === 'active').length} active POs · ₹{(totalActive / 100000).toFixed(1)}L in progress
          </p>
        </div>
        {canCreate && (
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--brand)] text-white rounded-lg text-sm font-medium">
            <Plus size={16} /> New RFQ
          </button>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <KpiTile label="Open RFQs" value={rfqs.filter(r => r.status === 'open').length} accent="info" />
        <KpiTile label="Active POs" value={customerPos.filter(p => p.status === 'active').length} accent="success" />
        <KpiTile label="Total PO Value" value={`₹${(totalActive / 100000).toFixed(1)}L`} accent="info" isString />
        <KpiTile label="Completed" value={customerPos.filter(p => p.status === 'complete').length} accent="neutral" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('pos')} className={clsx('px-4 py-2 rounded-lg text-sm transition-colors', tab === 'pos' ? 'bg-[var(--brand)] text-white' : 'border border-[var(--border)] text-[var(--text-2)]')}>
          Customer POs ({customerPos.length})
        </button>
        <button onClick={() => setTab('rfqs')} className={clsx('px-4 py-2 rounded-lg text-sm transition-colors', tab === 'rfqs' ? 'bg-[var(--brand)] text-white' : 'border border-[var(--border)] text-[var(--text-2)]')}>
          RFQs ({rfqs.length})
        </button>
        <button onClick={() => navigate('/sales/customers')} className="px-4 py-2 rounded-lg text-sm transition-colors border border-[var(--border)] text-[var(--text-2)] hover:bg-[var(--surface-muted,#F8F9FC)]">
          Customer Directory
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="w-full pl-9 pr-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] placeholder:text-[var(--text-3)] focus:outline-none focus:border-[var(--brand)]" />
      </div>

      {tab === 'pos' && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="eoss-table">
              <thead>
                <tr><th>PO Number</th><th>Customer</th><th>Accepted</th><th>Payment Terms</th><th>Lines</th><th>Value</th><th>Status</th><th>Notes</th><th></th></tr>
              </thead>
              <tbody>
                {filteredPos.map(p => (
                  <tr key={p.id} className="cursor-pointer" onClick={() => navigate(`/sales/po/${p.id}`)}>
                    <td>
                      <div className="font-mono text-xs font-semibold text-[var(--brand)]">{p.poNumber}</div>
                      {p.hasAmendment && <div className="text-[11px] text-[var(--warning)]">Amendment pending</div>}
                    </td>
                    <td className="text-sm text-[var(--text)]">{p.customerName}</td>
                    <td className="text-sm text-[var(--text-2)]">{new Date(p.acceptedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                    <td className="text-sm text-[var(--text-2)]">{p.paymentTerms}</td>
                    <td className="text-sm text-center">{p.lineCount}</td>
                    <td className="font-mono text-sm font-semibold text-[var(--text)]">₹{(p.totalValue / 1000).toFixed(0)}k</td>
                    <td><StatusChip status={p.status} size="sm" /></td>
                    <td className="text-xs text-[var(--text-2)]">{p.deliveryTerms}</td>
                    <td><ChevronRight size={14} className="text-[var(--text-3)]" /></td>
                  </tr>
                ))}
                {filteredPos.length === 0 && <tr><td colSpan={9} className="text-center py-8 text-sm text-[var(--text-3)]">No POs found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'rfqs' && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="eoss-table">
              <thead>
                <tr><th>RFQ Number</th><th>Customer</th><th>Received</th><th>Required By</th><th>Lines</th><th>Channel</th><th>Status</th><th>Owner</th></tr>
              </thead>
              <tbody>
                {filteredRfqs.map(r => (
                  <tr key={r.id}>
                    <td><span className="font-mono text-xs font-semibold text-[var(--brand)]">{r.rfqNumber}</span></td>
                    <td className="text-sm text-[var(--text)]">{r.customerName}</td>
                    <td className="text-sm text-[var(--text-2)]">{new Date(r.receivedDate).toLocaleDateString('en-IN')}</td>
                    <td className="text-sm text-[var(--text-2)]">{new Date(r.requiredBy).toLocaleDateString('en-IN')}</td>
                    <td className="text-center text-sm">{r.lineCount}</td>
                    <td className="text-sm text-[var(--text-2)]">{r.channel}</td>
                    <td><StatusChip status={r.status} size="sm" /></td>
                    <td className="text-sm text-[var(--text-2)]">{r.owner}</td>
                  </tr>
                ))}
                {filteredRfqs.length === 0 && <tr><td colSpan={8} className="text-center py-8 text-sm text-[var(--text-3)]">No RFQs found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function KpiTile({ label, value, accent, isString }: { label: string; value: number | string; accent: string; isString?: boolean }) {
  const color = { error: 'var(--error)', success: 'var(--success)', info: 'var(--info)', warning: 'var(--warning)', neutral: 'var(--text)' }[accent] ?? 'var(--text)';
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
      <div className="text-xl font-bold" style={{ color }}>{value}</div>
      <div className="text-xs text-[var(--text-2)] mt-0.5">{label}</div>
    </div>
  );
}
