import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, AlertTriangle, Search, ChevronRight } from 'lucide-react';
import { useStore, PURCHASE_REQS } from '../../store';
import StatusChip from '../../components/layout/StatusChip';

type ProcTab = 'spo' | 'pr' | 'grn' | 'approvals';

export default function Procurement() {
  const { supplierPos, grns, approvalRequests, currentUser } = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<ProcTab>('spo');
  const [search, setSearch] = useState('');

  const overduePOs = supplierPos.filter(p => p.status === 'overdue').length;
  const pendingApprovals = approvalRequests.filter(a => a.status === 'pending').length;
  const canCreate = ['owner', 'buyer'].includes(currentUser.role);

  const filteredSpo = supplierPos.filter(p =>
    !search || p.poNumber.toLowerCase().includes(search.toLowerCase()) ||
    p.supplierName.toLowerCase().includes(search.toLowerCase())
  );

  const TABS = [
    { id: 'spo' as ProcTab, label: `Supplier POs (${supplierPos.length})` },
    { id: 'pr' as ProcTab, label: `PRs (${PURCHASE_REQS.length})` },
    { id: 'grn' as ProcTab, label: `GRNs (${grns.length})` },
    { id: 'approvals' as ProcTab, label: `Approvals${pendingApprovals > 0 ? ` · ${pendingApprovals}` : ''}` },
  ];

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
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
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
              <tr style={{ background: 'var(--surface-muted,#F8F9FC)', borderBottom: '1px solid var(--border)' }}>
                {['PO Number', 'Supplier', 'Raised', 'Committed', 'Lines', 'Value', 'Job Ref', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredSpo.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-sm" style={{ color: 'var(--text-3)' }}>No POs found</td></tr>
              ) : filteredSpo.map(p => (
                <tr key={p.id} className="cursor-pointer"
                  style={{ borderBottom: '1px solid var(--border)', background: p.status === 'overdue' ? 'var(--error-bg,#FEF2F2)' : 'var(--surface)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-muted,#F8F9FC)'; }}
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
                  <td className="px-4 py-3"><ChevronRight size={14} style={{ color: 'var(--text-3)' }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'pr' && (
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead style={{ position: 'sticky', top: 0, zIndex: 5 }}>
              <tr style={{ background: 'var(--surface-muted,#F8F9FC)' }}>
                {['PR Number', 'Raised By', 'Raised Date', 'Required By', 'Job Ref', 'Lines', 'Priority', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PURCHASE_REQS.map(pr => (
                <tr key={pr.id} style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-muted,#F8F9FC)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}>
                  <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: 'var(--brand)' }}>{pr.prNumber}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--text)' }}>{pr.raisedBy}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{new Date(pr.raisedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{new Date(pr.requiredBy).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-2)' }}>{pr.jobNumber ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-center" style={{ color: 'var(--text-2)' }}>{pr.lineCount}</td>
                  <td className="px-4 py-3"><StatusChip status={pr.priority} size="sm" /></td>
                  <td className="px-4 py-3"><StatusChip status={pr.status} size="sm" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'grn' && (
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead style={{ position: 'sticky', top: 0, zIndex: 5 }}>
              <tr style={{ background: 'var(--surface-muted,#F8F9FC)' }}>
                {['GRN Number', 'Supplier', 'PO Ref', 'Received', 'By', 'Challan', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grns.map(g => (
                <tr key={g.id} className="cursor-pointer" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-muted,#F8F9FC)'; }}
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

        {tab === 'approvals' && (
          <div className="p-5">
            {approvalRequests.filter(a => a.status === 'pending').length === 0 ? (
              <div className="rounded-xl border p-10 text-center" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                <p className="text-sm" style={{ color: 'var(--text-3)' }}>No pending approvals.</p>
              </div>
            ) : (
              <div className="space-y-3 max-w-3xl">
                {approvalRequests.filter(a => a.status === 'pending').map(a => (
                  <div key={a.id} className="rounded-xl border p-4 flex items-start justify-between gap-4"
                    style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                    <div>
                      <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{a.entityRef}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{a.requestedBy} · {new Date(a.requestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                    </div>
                    <StatusChip status={a.status} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
