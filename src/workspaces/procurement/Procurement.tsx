import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, AlertTriangle, ChevronRight, Search, Clock } from 'lucide-react';
import { useStore, PURCHASE_REQS } from '../../store';
import { SUPPLIER_PO_LINES } from '../../data/seed';
import StatusChip from '../../components/layout/StatusChip';
import clsx from 'clsx';

export default function Procurement() {
  const { supplierPos, grns, approvalRequests, currentUser } = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'spo' | 'pr' | 'grn' | 'approvals'>('spo');
  const [search, setSearch] = useState('');

  const overduePOs = supplierPos.filter(p => p.status === 'overdue').length;
  const pendingApprovals = approvalRequests.filter(a => a.status === 'pending').length;
  const canCreate = ['owner', 'buyer'].includes(currentUser.role);
  const canApprove = ['owner'].includes(currentUser.role);

  const filteredSpo = supplierPos.filter(p => !search || p.poNumber.toLowerCase().includes(search.toLowerCase()) || p.supplierName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-[var(--text)]">Procurement</h1>
          <div className="flex items-center gap-3 mt-0.5">
            <p className="text-sm text-[var(--text-2)]">{supplierPos.length} supplier POs</p>
            {overduePOs > 0 && <span className="text-xs text-[var(--error)] font-semibold flex items-center gap-1"><AlertTriangle size={12} /> {overduePOs} overdue</span>}
            {pendingApprovals > 0 && <span className="text-xs text-[var(--warning)] font-semibold">{pendingApprovals} pending approval</span>}
          </div>
        </div>
        {canCreate && (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => navigate('/procurement/supplier-return')}
              className="flex items-center gap-2 px-3 py-2 border border-[var(--border)] rounded-lg text-sm text-[var(--text-2)] hover:bg-[var(--surface-2)] cursor-pointer"
            >
              Supplier Return
            </button>
            <button className="flex items-center gap-2 px-3 py-2 border border-[var(--border)] rounded-lg text-sm text-[var(--text-2)] hover:bg-[var(--surface-2)]">
              <Plus size={14} /> New PR
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[var(--brand)] text-white rounded-lg text-sm font-medium">
              <Plus size={16} /> New PO
            </button>
          </div>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <KpiTile label="Supplier POs" value={supplierPos.length} />
        <KpiTile label="Overdue" value={overduePOs} accent="error" />
        <KpiTile label="GRNs (MTD)" value={grns.length} accent="success" />
        <KpiTile label="Pending Approval" value={pendingApprovals} accent={pendingApprovals > 0 ? 'warning' : 'neutral'} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {[
          { id: 'spo', label: `Supplier POs (${supplierPos.length})` },
          { id: 'pr', label: `PRs (${PURCHASE_REQS.length})` },
          { id: 'grn', label: `GRNs (${grns.length})` },
          { id: 'approvals', label: `Approvals (${pendingApprovals})`, badge: pendingApprovals > 0 },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)} className={clsx('px-3 py-2 rounded-lg text-sm whitespace-nowrap relative transition-colors',
            tab === t.id ? 'bg-[var(--brand)] text-white' : 'border border-[var(--border)] text-[var(--text-2)] hover:bg-[var(--surface-2)]'
          )}>
            {t.label}
            {t.badge && tab !== t.id && <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--error)] text-white text-[10px] rounded-full flex items-center justify-center font-bold">{pendingApprovals}</span>}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="w-full pl-9 pr-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] placeholder:text-[var(--text-3)] focus:outline-none focus:border-[var(--brand)]" />
      </div>

      {tab === 'spo' && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="eoss-table">
              <thead>
                <tr><th>PO Number</th><th>Supplier</th><th>Raised</th><th>Committed</th><th>Lines</th><th>Value</th><th>Job Ref</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {filteredSpo.map(p => (
                  <tr key={p.id} className={clsx('cursor-pointer', p.status === 'overdue' ? 'bg-[var(--error-bg)]' : '')} onClick={() => navigate(`/procurement/spo/${p.id}`)}>
                    <td>
                      <div className="font-mono text-xs font-semibold text-[var(--brand)]">{p.poNumber}</div>
                      {p.hasAmendment && <div className="text-[11px] text-[var(--warning)]">Amendment</div>}
                    </td>
                    <td className="text-sm text-[var(--text)]">{p.supplierName}</td>
                    <td className="text-sm text-[var(--text-2)]">{new Date(p.raisedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                    <td>
                      <div className={clsx('text-sm', p.status === 'overdue' ? 'text-[var(--error)] font-semibold' : 'text-[var(--text-2)]')}>
                        {p.committedDate ? new Date(p.committedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                        {p.status === 'overdue' && <span className="ml-1 text-[11px]">(OVERDUE)</span>}
                      </div>
                    </td>
                    <td className="text-center text-sm">{p.lineCount}</td>
                    <td className="font-mono text-sm font-semibold">₹{(p.totalValue / 1000).toFixed(1)}k</td>
                    <td className="text-sm text-[var(--text-2)]">{p.jobRef ?? '—'}</td>
                    <td><StatusChip status={p.status} size="sm" /></td>
                    <td><ChevronRight size={14} className="text-[var(--text-3)]" /></td>
                  </tr>
                ))}
                {filteredSpo.length === 0 && <tr><td colSpan={9} className="text-center py-8 text-sm text-[var(--text-3)]">No POs found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'pr' && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="eoss-table">
              <thead><tr><th>PR Number</th><th>Raised By</th><th>Raised Date</th><th>Required By</th><th>Job Ref</th><th>Lines</th><th>Priority</th><th>Status</th></tr></thead>
              <tbody>
                {PURCHASE_REQS.map(pr => (
                  <tr key={pr.id}>
                    <td><span className="font-mono text-xs font-semibold text-[var(--brand)]">{pr.prNumber}</span></td>
                    <td className="text-sm text-[var(--text)]">{pr.raisedBy}</td>
                    <td className="text-sm text-[var(--text-2)]">{new Date(pr.raisedDate).toLocaleDateString('en-IN')}</td>
                    <td className="text-sm text-[var(--text-2)]">{new Date(pr.requiredBy).toLocaleDateString('en-IN')}</td>
                    <td className="text-sm text-[var(--text-2)] font-mono">{pr.jobNumber ?? '—'}</td>
                    <td className="text-center text-sm">{pr.lineCount}</td>
                    <td><StatusChip status={pr.priority} size="sm" /></td>
                    <td><StatusChip status={pr.status} size="sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'grn' && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="eoss-table">
              <thead><tr><th>GRN Number</th><th>Supplier</th><th>PO Ref</th><th>Received</th><th>By</th><th>Challan</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {grns.map(g => (
                  <tr key={g.id} className="cursor-pointer" onClick={() => navigate(`/procurement/grn/${g.id}`)}>
                    <td><span className="font-mono text-xs font-semibold text-[var(--brand)]">{g.grnNumber}</span></td>
                    <td className="text-sm text-[var(--text)]">{g.supplierName}</td>
                    <td className="font-mono text-xs text-[var(--text-2)]">{g.spoNumber}</td>
                    <td className="text-sm text-[var(--text-2)]">{new Date(g.receivedDate).toLocaleDateString('en-IN')}</td>
                    <td className="text-sm text-[var(--text-2)]">{g.receivedBy}</td>
                    <td className="font-mono text-xs text-[var(--text-2)]">{g.deliveryChallan}</td>
                    <td><StatusChip status={g.status} size="sm" /></td>
                    <td><ChevronRight size={14} className="text-[var(--text-3)]" /></td>
                  </tr>
                ))}
                {grns.length === 0 && <tr><td colSpan={8} className="text-center py-8 text-sm text-[var(--text-3)]">No GRNs recorded</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'approvals' && (
        <div className="space-y-3">
          {approvalRequests.length === 0 && <div className="text-center py-10 text-sm text-[var(--text-3)]">No pending approvals</div>}
          {approvalRequests.map(a => (
            <ApprovalCard key={a.id} approval={a} canApprove={canApprove} />
          ))}
        </div>
      )}
    </div>
  );
}

function ApprovalCard({ approval, canApprove }: { approval: any; canApprove: boolean }) {
  const { resolveApproval, currentUser } = useStore();
  return (
    <div className={clsx('bg-[var(--surface)] border rounded-xl p-4', approval.status === 'pending' ? 'border-[var(--warning)]' : 'border-[var(--border)]')}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-[var(--text)]">{approval.requestType}</span>
            <StatusChip status={approval.status} size="sm" />
          </div>
          <p className="text-xs text-[var(--text-2)] mb-1">{approval.description}</p>
          <p className="text-xs text-[var(--text-3)]">Requested by {approval.requestedBy} · {new Date(approval.requestedAt).toLocaleDateString('en-IN')}</p>
          {approval.thresholdValue && (
            <p className="text-xs text-[var(--text-3)] mt-0.5">Threshold: ₹{approval.thresholdValue.toLocaleString()} · Current: ₹{approval.currentValue?.toLocaleString()}</p>
          )}
        </div>
        {canApprove && approval.status === 'pending' && (
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => resolveApproval(approval.id, 'approved', currentUser.name)} className="px-3 py-1.5 bg-[var(--success)] text-white text-xs rounded-lg font-medium">Approve</button>
            <button onClick={() => resolveApproval(approval.id, 'rejected', currentUser.name)} className="px-3 py-1.5 bg-[var(--error)] text-white text-xs rounded-lg font-medium">Reject</button>
          </div>
        )}
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
