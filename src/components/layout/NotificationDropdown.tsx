import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, AlertTriangle, Info, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { useStore } from '../../store';
import { useNavigate } from 'react-router-dom';

const TYPE_ICON = {
  warning: <AlertTriangle size={14} className="text-[var(--warning)]" />,
  action: <AlertTriangle size={14} className="text-[var(--error)]" />,
  success: <CheckCircle size={14} className="text-[var(--success)]" />,
  reminder: <Clock size={14} className="text-[var(--info)]" />,
  info: <Info size={14} className="text-[var(--info)]" />,
};

export default function NotificationDropdown() {
  const { notifications, unreadCount, markNotificationRead, markAllRead } = useStore();
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

  const handleClick = (n: typeof notifications[0]) => {
    markNotificationRead(n.id);
    if (n.entityType === 'SupplierPO' || n.entityType === 'ApprovalRequest') navigate('/procurement');
    else if (n.entityType === 'MaintenanceEvent') navigate('/assets');
    else if (n.entityType === 'MaterialLot') navigate('/inventory');
    else if (n.entityType === 'Document') navigate('/documents');
    else if (n.entityType === 'QualityRelease') navigate('/quality');
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-lg hover:bg-[var(--surface-2)] transition-colors"
        title="Notifications"
      >
        <Bell size={18} className="text-[var(--text-2)]" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-[var(--error)] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-96 max-w-[calc(100vw-2rem)] bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-2)]">
            <span className="font-semibold text-sm text-[var(--text)]">Notifications</span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-[var(--brand)] hover:underline">Mark all read</button>
              )}
              <button onClick={() => setOpen(false)} className="text-[var(--text-3)] hover:text-[var(--text)]">
                <X size={14} />
              </button>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto divide-y divide-[var(--border)]">
            {notifications.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-[var(--text-3)]">No notifications</div>
            )}
            {notifications.map(n => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={`w-full flex gap-3 px-4 py-3 hover:bg-[var(--surface-2)] text-left transition-colors ${!n.read ? 'bg-[var(--brand-50)]' : ''}`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {TYPE_ICON[n.type] ?? <Info size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium text-[var(--text)] line-clamp-1">{n.title}</span>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-[var(--brand)] flex-shrink-0 mt-1" />}
                  </div>
                  <p className="text-xs text-[var(--text-2)] line-clamp-2 mt-0.5">{n.body}</p>
                  <p className="text-[11px] text-[var(--text-3)] mt-1">{n.entityRef} • {new Date(n.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <ArrowRight size={12} className="text-[var(--text-3)] flex-shrink-0 mt-1" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
