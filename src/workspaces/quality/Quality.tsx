import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, AlertTriangle, CheckCircle } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';
import clsx from 'clsx';

export default function Quality() {
  const { inspections, ncrs, currentUser } = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'inspections' | 'ncrs'>('inspections');

  const openNcrs = ncrs.filter(n => n.status === 'open' || n.status === 'in_progress').length;
  const pendingInspections = inspections.filter(i => i.result === 'pending').length;

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-[var(--text)]">Quality</h1>
          <div className="flex items-center gap-3 mt-0.5">
            <p className="text-sm text-[var(--text-2)]">{inspections.length} inspections</p>
            {openNcrs > 0 && <span className="flex items-center gap-1 text-xs text-[var(--error)] font-semibold"><AlertTriangle size={12} /> {openNcrs} open NCRs</span>}
            {pendingInspections > 0 && <span className="text-xs text-[var(--warning)] font-semibold">{pendingInspections} pending</span>}
          </div>
        </div>
        {['owner', 'qc'].includes(currentUser.role) && (
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--brand)] text-white rounded-lg text-sm font-medium">
            <Plus size={16} /> New Inspection
          </button>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <KpiTile label="Inspections" value={inspections.length} />
        <KpiTile label="Pass Rate" value={`${Math.round((inspections.filter(i => i.result === 'pass').length / Math.max(inspections.filter(i => i.result !== 'pending').length, 1)) * 100)}%`} accent="success" />
        <KpiTile label="Open NCRs" value={openNcrs} accent={openNcrs > 0 ? 'error' : 'neutral'} />
        <KpiTile label="Pending" value={pendingInspections} accent={pendingInspections > 0 ? 'warning' : 'neutral'} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('inspections')} className={clsx('px-4 py-2 rounded-lg text-sm transition-colors', tab === 'inspections' ? 'bg-[var(--brand)] text-white' : 'border border-[var(--border)] text-[var(--text-2)]')}>
          Inspections ({inspections.length})
        </button>
        <button onClick={() => setTab('ncrs')} className={clsx('px-4 py-2 rounded-lg text-sm relative transition-colors', tab === 'ncrs' ? 'bg-[var(--brand)] text-white' : 'border border-[var(--border)] text-[var(--text-2)]')}>
          NCRs ({ncrs.length})
          {openNcrs > 0 && tab !== 'ncrs' && <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--error)] text-white text-[10px] rounded-full flex items-center justify-center font-bold">{openNcrs}</span>}
        </button>
      </div>

      {tab === 'inspections' && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="eoss-table">
              <thead>
                <tr><th>Inspection #</th><th>Type</th><th>Subject</th><th>Date</th><th>Inspector</th><th>Sample</th><th>Accept</th><th>Reject</th><th>Result</th><th></th></tr>
              </thead>
              <tbody>
                {inspections.map(i => (
                  <tr key={i.id} className="cursor-pointer" onClick={() => navigate(`/quality/inspection/${i.id}`)}>
                    <td><span className="font-mono text-xs font-semibold text-[var(--brand)]">{i.inspectionNumber}</span></td>
                    <td><StatusChip status={i.type.toLowerCase().replace('-', '_').replace(' ', '_')} label={i.type} size="sm" /></td>
                    <td className="text-sm text-[var(--text-2)]">
                      {i.jobNumber ? `Job ${i.jobNumber} · ${i.stageName}` : i.lotId ? `Lot` : '—'}
                    </td>
                    <td className="text-sm text-[var(--text-2)]">{new Date(i.date).toLocaleDateString('en-IN')}</td>
                    <td className="text-sm text-[var(--text-2)]">{i.inspectorName}</td>
                    <td className="font-mono text-sm text-center">{i.sampleQty}</td>
                    <td className="font-mono text-sm text-center text-[var(--success)]">{i.acceptedQty > 0 ? i.acceptedQty : '—'}</td>
                    <td className="font-mono text-sm text-center text-[var(--error)]">{i.rejectedQty > 0 ? i.rejectedQty : '—'}</td>
                    <td><StatusChip status={i.result} size="sm" /></td>
                    <td><ChevronRight size={14} className="text-[var(--text-3)]" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'ncrs' && (
        <div className="space-y-3">
          {ncrs.map(n => (
            <div key={n.id} className={clsx('bg-[var(--surface)] border rounded-xl p-4 cursor-pointer hover:border-[var(--brand)] transition-colors', n.severity === 'Major' || n.severity === 'Critical' ? 'border-[var(--error)]' : 'border-[var(--border)]')} onClick={() => navigate(`/quality/ncr/${n.id}`)}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-mono font-semibold text-sm text-[var(--brand)]">{n.ncrNumber}</span>
                    <StatusChip status={n.severity.toLowerCase()} label={n.severity} size="sm" />
                    <StatusChip status={n.status} size="sm" />
                  </div>
                  <p className="text-sm text-[var(--text)]">{n.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-3)]">
                    <span>{n.sourceType}</span>
                    <span>·</span>
                    <span>Disposition: {n.disposition}</span>
                    <span>·</span>
                    <span>{n.affectedQty} units affected</span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-[var(--text-3)] flex-shrink-0 mt-1" />
              </div>
            </div>
          ))}
          {ncrs.length === 0 && <div className="text-center py-10 text-sm text-[var(--text-3)]">No NCRs raised</div>}
        </div>
      )}
    </div>
  );
}

function KpiTile({ label, value, accent = 'neutral' }: { label: string; value: number | string; accent?: string }) {
  const color = { error: 'var(--error)', success: 'var(--success)', info: 'var(--info)', warning: 'var(--warning)', neutral: 'var(--text)' }[accent] ?? 'var(--text)';
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
      <div className="text-xl font-bold" style={{ color }}>{value}</div>
      <div className="text-xs text-[var(--text-2)] mt-0.5">{label}</div>
    </div>
  );
}
