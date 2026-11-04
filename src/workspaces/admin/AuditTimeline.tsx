import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import { useStore } from '../../store';

const AUDIT_EVENTS = [
  { ts: '2025-01-25T14:32:00Z', user: 'Ravi Kumar (Owner)', action: 'Approved supplier PO', entity: 'SPO-2025-001', type: 'approval' },
  { ts: '2025-01-25T11:15:00Z', user: 'Priya Sharma (QC)', action: 'Verified material certificate', entity: 'CERT-001', type: 'verify' },
  { ts: '2025-01-25T09:48:00Z', user: 'Mohan Das (Storekeeper)', action: 'Issued material to job', entity: 'JOB-2025-001', type: 'issue' },
  { ts: '2025-01-24T16:20:00Z', user: 'Amit Singh (Buyer)', action: 'Created supplier PO', entity: 'SPO-2025-003', type: 'create' },
  { ts: '2025-01-24T14:05:00Z', user: 'Suresh Patel (Maintenance)', action: 'Logged breakdown event', entity: 'ME-2025-001', type: 'breakdown' },
  { ts: '2025-01-24T10:30:00Z', user: 'Priya Sharma (QC)', action: 'Raised NCR', entity: 'NCR-2025-001', type: 'ncr' },
  { ts: '2025-01-23T15:45:00Z', user: 'Rahul Verma (Dispatch)', action: 'Created dispatch order', entity: 'DIS-2025-001', type: 'dispatch' },
  { ts: '2025-01-23T13:10:00Z', user: 'Kiran Joshi (Sales)', action: 'Accepted customer PO', entity: 'CPO-2025-001', type: 'po' },
  { ts: '2025-01-23T09:00:00Z', user: 'Ravi Kumar (Owner)', action: 'Role-switched to Operator (demo)', entity: 'System', type: 'admin' },
  { ts: '2025-01-22T17:30:00Z', user: 'Mohan Das (Storekeeper)', action: 'Received GRN', entity: 'GRN-2025-001', type: 'grn' },
];

const TYPE_COLORS: Record<string, string> = {
  approval: 'var(--success)', verify: 'var(--info)', issue: 'var(--warning)', create: 'var(--brand)',
  breakdown: 'var(--error)', ncr: 'var(--error)', dispatch: 'var(--info)', po: 'var(--success)',
  admin: 'var(--text-3)', grn: 'var(--brand)',
};

export default function AuditTimeline() {
  const navigate = useNavigate();
  const { currentUser } = useStore();

  if (!['owner', 'auditor'].includes(currentUser.role)) {
    return <div className="p-6 text-sm text-[var(--text-2)]">Audit access restricted.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate('/admin')} className="text-[var(--text-3)] hover:text-[var(--text)]"><ArrowLeft size={16} /></button>
        <div>
          <h1 className="text-lg font-bold text-[var(--text)]">Audit Timeline</h1>
          <p className="text-xs text-[var(--text-3)]">All tracked system actions — read only</p>
        </div>
      </div>

      <div className="space-y-0 relative">
        <div className="absolute left-[22px] top-0 bottom-0 w-px bg-[var(--border)]" />
        {AUDIT_EVENTS.map((e, i) => (
          <div key={i} className="flex gap-4 pb-5 relative">
            <div className="w-11 flex-shrink-0 flex items-start justify-center pt-0.5">
              <div className="w-4 h-4 rounded-full border-2 bg-[var(--surface)] z-10" style={{ borderColor: TYPE_COLORS[e.type] ?? 'var(--border)' }} />
            </div>
            <div className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-medium text-[var(--text)]">{e.action}</div>
                  <div className="text-xs text-[var(--text-3)] mt-0.5">{e.user}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="font-mono text-xs text-[var(--brand)]">{e.entity}</span>
                  <div className="text-[11px] text-[var(--text-3)] mt-0.5">{new Date(e.ts).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
