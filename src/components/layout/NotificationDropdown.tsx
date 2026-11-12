import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Bell, X, AlertTriangle, Info, CheckCircle, Clock, ArrowRight, CheckSquare } from 'lucide-react';
import { useStore } from '../../store';
import { useNavigate } from 'react-router-dom';
import { DEMO_NOW } from '../../data/seed';
import { listExpiringDocuments } from '../../domain/documentExpiry';
import { formatDisplayDate } from '../../domain/dates';

const TYPE_ICON = {
  warning: <AlertTriangle size={14} className="text-[var(--warning)]" />,
  action: <AlertTriangle size={14} className="text-[var(--error)]" />,
  success: <CheckCircle size={14} className="text-[var(--success)]" />,
  reminder: <Clock size={14} className="text-[var(--info)]" />,
  info: <Info size={14} className="text-[var(--info)]" />,
};

interface BellEntry {
  id: string;
  kind: 'approval' | 'alert';
  title: string;
  body: string;
  entityRef: string;
  timestamp: string;
  read: boolean;
  iconType: 'warning' | 'action' | 'success' | 'reminder' | 'info';
  path: string;
  notifId?: string;
}

export default function NotificationDropdown() {
  const { notifications, approvalRequests, documents, markNotificationRead, markAllRead } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const { approvalItems, alertItems, badgeCount } = useMemo(() => {
    const approvals: BellEntry[] = [];
    const alerts: BellEntry[] = [];
    const seenEntityIds = new Set<string>();

    // 1. Pending approvals (always separated into Approvals group)
    for (const req of approvalRequests.filter(a => a.status === 'pending')) {
      seenEntityIds.add(req.entityId);
      seenEntityIds.add(req.entityRef);
      const isSpo = req.requestType.toLowerCase().includes('supplier po') || req.entityRef.startsWith('SPO-');
      approvals.push({
        id: `bell-appr-${req.id}`,
        kind: 'approval',
        title: `Approve ${req.entityRef}`,
        body: req.description,
        entityRef: req.entityRef,
        timestamp: req.requestedAt,
        read: false,
        iconType: 'action',
        path: isSpo ? `/procurement/spo/${req.entityId}` : `/procurement/pr/${req.entityId}`,
      });
    }

    // 2. Expired or expiring active documents
    const activeDocs = documents.filter(d => d.status !== 'superseded' && d.status !== 'archived');
    for (const { doc, info } of listExpiringDocuments(activeDocs, new Date(DEMO_NOW))) {
      seenEntityIds.add(doc.id);
      seenEntityIds.add(doc.title);
      const expired = info.status === 'expired';
      const days = info.daysToExpiry ?? 0;
      alerts.push({
        id: `bell-doc-${doc.id}`,
        kind: 'alert',
        title: expired ? `Expired document: ${doc.title}` : `Document expiring soon: ${doc.title}`,
        body: expired
          ? `Expired ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago (${formatDisplayDate(doc.expiryDate)}) — renewal needed.`
          : `Expires in ${days} day${days === 1 ? '' : 's'} (${formatDisplayDate(doc.expiryDate)}).`,
        entityRef: doc.docType,
        timestamp: doc.expiryDate ?? doc.uploadedAt,
        read: false,
        iconType: expired ? 'action' : 'warning',
        path: `/documents/${doc.id}`,
      });
    }

    // 3. Store alerts (unread or recent), deduplicated from approvals & doc alerts above
    for (const n of notifications) {
      if (n.read) continue;
      if ((n.entityId && seenEntityIds.has(n.entityId)) || (n.entityRef && seenEntityIds.has(n.entityRef))) continue;
      const isApprovalNotif = n.entityType === 'ApprovalRequest' || n.title.toLowerCase().includes('approval');
      if (isApprovalNotif) continue; // only live pending approvals belong in Approvals group
      const path =
        n.entityType === 'SupplierPO' ? `/procurement/spo/${n.entityId}` :
        n.entityType === 'MaintenanceEvent' ? `/assets/me/${n.entityId}` :
        n.entityType === 'MaterialLot' ? '/inventory' :
        n.entityType === 'Document' ? `/documents/${n.entityId}` :
        n.entityType === 'QualityRelease' ? '/quality' : '/';
      alerts.push({
        id: `bell-notif-${n.id}`,
        kind: 'alert',
        title: n.title,
        body: n.body,
        entityRef: n.entityRef ?? n.entityType ?? 'Alert',
        timestamp: n.timestamp,
        read: n.read,
        iconType: n.type,
        path,
        notifId: n.id,
      });
    }

    return {
      approvalItems: approvals,
      alertItems: alerts,
      badgeCount: approvals.length + alerts.length,
    };
  }, [approvalRequests, documents, notifications]);

  const handleSelect = (item: BellEntry) => {
    if (item.notifId) markNotificationRead(item.notifId);
    setOpen(false);
    navigate(item.path);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-lg hover:bg-[var(--surface-2)] transition-colors"
        title="Notifications"
        aria-label={`Notifications (${badgeCount})`}
      >
        <Bell size={18} className="text-[var(--text-2)]" />
        {badgeCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-[var(--error)] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {badgeCount > 9 ? '9+' : badgeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-96 max-w-[calc(100vw-2rem)] bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-2)]">
            <span className="font-semibold text-sm text-[var(--text)]">Notifications ({badgeCount})</span>
            <div className="flex items-center gap-2">
              {notifications.some(n => !n.read) && (
                <button onClick={markAllRead} className="text-xs text-[var(--brand)] hover:underline">Mark alerts read</button>
              )}
              <button onClick={() => setOpen(false)} className="text-[var(--text-3)] hover:text-[var(--text)]">
                <X size={14} />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-[var(--border)]">
            {badgeCount === 0 && (
              <div className="px-4 py-8 text-center text-sm text-[var(--text-3)]">No open approvals or alerts</div>
            )}

            {approvalItems.length > 0 && (
              <div>
                <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-[var(--surface-2)] text-[var(--text-3)] flex items-center justify-between">
                  <span className="inline-flex items-center gap-1"><CheckSquare size={11} /> Approvals ({approvalItems.length})</span>
                  <button type="button" onClick={() => { setOpen(false); navigate('/procurement?tab=approvals'); }} className="text-[var(--brand)] hover:underline">
                    View approvals
                  </button>
                </div>
                <div className="divide-y divide-[var(--border)]">
                  {approvalItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className="w-full flex gap-3 px-4 py-2.5 hover:bg-[var(--surface-2)] text-left transition-colors bg-[var(--brand-50)]"
                    >
                      <div className="flex-shrink-0 mt-0.5">{TYPE_ICON[item.iconType]}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[var(--text)] truncate">{item.title}</div>
                        <p className="text-xs text-[var(--text-2)] line-clamp-1 mt-0.5">{item.body}</p>
                        <p className="text-[11px] text-[var(--text-3)] mt-0.5">{item.entityRef} · {formatDisplayDate(item.timestamp)}</p>
                      </div>
                      <ArrowRight size={12} className="text-[var(--text-3)] flex-shrink-0 mt-1" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {alertItems.length > 0 && (
              <div>
                <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-[var(--surface-2)] text-[var(--text-3)]">
                  Alerts ({alertItems.length})
                </div>
                <div className="divide-y divide-[var(--border)]">
                  {alertItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className="w-full flex gap-3 px-4 py-2.5 hover:bg-[var(--surface-2)] text-left transition-colors"
                    >
                      <div className="flex-shrink-0 mt-0.5">{TYPE_ICON[item.iconType]}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[var(--text)] truncate">{item.title}</div>
                        <p className="text-xs text-[var(--text-2)] line-clamp-2 mt-0.5">{item.body}</p>
                        <p className="text-[11px] text-[var(--text-3)] mt-0.5">{item.entityRef} · {formatDisplayDate(item.timestamp)}</p>
                      </div>
                      <ArrowRight size={12} className="text-[var(--text-3)] flex-shrink-0 mt-1" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
