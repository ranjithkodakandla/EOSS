import React from 'react';
import { CheckSquare, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';

export default function WaitingOnMeCard() {
  const navigate = useNavigate();
  const { approvalRequests, resolveApproval, currentUser, showToast } = useStore();
  const pending = approvalRequests.filter(a => a.status === 'pending');

  return (
    <div
      className="p-3.5 rounded-2xl border flex flex-col h-full min-h-0"
      style={{ background: 'var(--card-gradient, var(--surface))', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2">
          <CheckSquare size={15} style={{ color: 'var(--brand)' }} />
          <h3 className="text-sm font-bold text-[var(--text)] tracking-tight">Inbox</h3>
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: pending.length > 0 ? 'var(--warning-bg,#FFFBEB)' : 'var(--surface-2)',
              color: pending.length > 0 ? 'var(--warning,#D97706)' : 'var(--text-3)',
            }}
          >
            {pending.length}
          </span>
        </div>
        <button
          type="button"
          onClick={() => navigate('/procurement?tab=approvals')}
          className="text-[11px] font-semibold text-[var(--brand)] hover:underline inline-flex items-center gap-0.5"
        >
          View all ({pending.length}) <ChevronRight size={12} />
        </button>
      </div>

      {pending.length === 0 ? (
        <p className="text-sm text-[var(--text-2)] py-2">All approvals are clear.</p>
      ) : (
        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {pending.slice(0, 5).map(req => {
            const isSpo = req.requestType.toLowerCase().includes('supplier po') || req.entityRef.startsWith('SPO-');
            const path = isSpo
              ? `/procurement/spo/${req.entityId}`
              : `/procurement/pr/${req.entityId}`;
            const refCode = req.entityRef.match(/^(?:PR|SPO|GRN|INV|QT|CPO)-\d+-\d+/)?.[0] ?? req.entityRef.split(' — ')[0];
            return (
              <div key={req.id} className="flex items-center gap-2 py-1.5 min-w-0">
                <CheckSquare size={14} className="flex-shrink-0" style={{ color: 'var(--warning,#D97706)' }} />
                <div className="min-w-0 flex-1 text-[12.5px] leading-snug line-clamp-2">
                  <button
                    type="button"
                    onClick={() => navigate(path)}
                    className="font-mono text-xs font-bold text-[var(--brand)] hover:underline mr-1.5"
                  >
                    {refCode}
                  </button>
                  <span className="text-[var(--text)]">{req.description}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      resolveApproval(req.id, 'approved', currentUser.name, 'Approved from Inbox');
                      showToast({ type: 'success', title: 'Approved', body: `${req.entityRef} has been approved.` });
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white"
                    style={{ background: 'var(--success,#16A34A)' }}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(path)}
                    className="px-2 py-1 rounded-lg border text-xs font-medium text-[var(--text-2)] hover:text-[var(--text)]"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    Open
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
