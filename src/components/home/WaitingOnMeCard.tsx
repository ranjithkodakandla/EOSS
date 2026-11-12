import React from 'react';
import { Inbox, ChevronRight, Paperclip } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';

export default function WaitingOnMeCard() {
  const navigate = useNavigate();
  const { inboxMessages } = useStore();
  const inbound = inboxMessages.filter(m => !m.archived && m.direction === 'inbound');
  const unreadCount = inbound.filter(m => !m.read).length;

  const previewMessages = [...inbound]
    .sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1;
      if ((a.actionRequired && !a.actionCompleted) !== (b.actionRequired && !b.actionCompleted)) {
        return a.actionRequired && !a.actionCompleted ? -1 : 1;
      }
      return b.timestamp.localeCompare(a.timestamp);
    })
    .slice(0, 5);

  return (
    <div
      className="p-3.5 rounded-2xl border flex flex-col h-full min-h-0"
      style={{ background: 'var(--card-gradient, var(--surface))', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2">
          <Inbox size={15} style={{ color: 'var(--brand)' }} />
          <h3 className="text-sm font-bold text-[var(--text)] tracking-tight">Inbox</h3>
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: unreadCount > 0 ? 'var(--brand-light, #EDE9FE)' : 'var(--surface-2)',
              color: unreadCount > 0 ? 'var(--brand)' : 'var(--text-3)',
            }}
          >
            {unreadCount} unread
          </span>
        </div>
        <button
          type="button"
          onClick={() => navigate('/inbox')}
          className="text-[11px] font-semibold text-[var(--brand)] hover:underline inline-flex items-center gap-0.5"
        >
          View all ({inbound.length}) <ChevronRight size={12} />
        </button>
      </div>

      {previewMessages.length === 0 ? (
        <p className="text-sm text-[var(--text-2)] py-2">No messages in your inbox.</p>
      ) : (
        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {previewMessages.map(msg => (
            <button
              key={msg.id}
              type="button"
              onClick={() => navigate(`/inbox/${msg.id}`)}
              className="w-full text-left flex items-start gap-2.5 py-2 min-w-0 hover:bg-[var(--surface-2)]/60 rounded-lg px-1 -mx-1 transition-colors"
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                style={{ background: !msg.read ? 'var(--brand)' : 'transparent' }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs truncate ${!msg.read ? 'font-bold text-[var(--text)]' : 'font-semibold text-[var(--text-2)]'}`}>
                    {msg.senderName} · <span className="font-normal text-[var(--text-3)]">{msg.senderOrg}</span>
                  </span>
                  <span className="text-[10px] text-[var(--text-3)] flex-shrink-0 flex items-center gap-1">
                    {msg.attachments && msg.attachments.length > 0 && <Paperclip size={10} />}
                    {msg.timestamp.slice(5, 10)}
                  </span>
                </div>
                <div className={`text-[12.5px] truncate ${!msg.read ? 'font-semibold text-[var(--text)]' : 'text-[var(--text)]'}`}>
                  {msg.subject}
                </div>
                <div className="text-[11px] text-[var(--text-3)] truncate">{msg.preview}</div>
              </div>
              {msg.actionRequired && !msg.actionCompleted && (
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5"
                  style={{ background: 'var(--warning-bg,#FFFBEB)', color: 'var(--warning,#D97706)' }}
                >
                  Action
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
