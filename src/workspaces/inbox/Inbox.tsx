import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Inbox as InboxIcon, Mail, MailOpen, AlertCircle, Send, Archive, ArchiveRestore,
  Search, Paperclip, ExternalLink, CheckCircle2, XCircle, Reply, FileText, ArrowLeft,
} from 'lucide-react';
import clsx from 'clsx';
import { useStore } from '../../store';
import type { InboxFolder, InboxMessage, InboxMessageStatus } from '../../types';
import { formatDisplayDateTime } from '../../domain/dates';

const FOLDERS: { id: InboxFolder; label: string; icon: React.ReactNode }[] = [
  { id: 'inbox', label: 'Inbox', icon: <InboxIcon size={15} /> },
  { id: 'unread', label: 'Unread', icon: <Mail size={15} /> },
  { id: 'needs_action', label: 'Needs Action', icon: <AlertCircle size={15} /> },
  { id: 'sent', label: 'Sent', icon: <Send size={15} /> },
  { id: 'archived', label: 'Archived', icon: <Archive size={15} /> },
];

const STATUS_BADGE: Record<InboxMessageStatus, { label: string; bg: string; color: string }> = {
  unread: { label: 'Unread', bg: 'var(--info-bg, #EFF6FF)', color: 'var(--info, #2563EB)' },
  read: { label: 'Read', bg: 'var(--surface-2)', color: 'var(--text-3)' },
  action_required: { label: 'Action Required', bg: 'var(--warning-bg, #FFFBEB)', color: 'var(--warning, #D97706)' },
  action_completed: { label: 'Action Completed', bg: 'var(--success-bg, #F0FDF4)', color: 'var(--success, #16A34A)' },
  replied: { label: 'Replied', bg: 'var(--brand-light, #EDE9FE)', color: 'var(--brand)' },
  archived: { label: 'Archived', bg: 'var(--surface-2)', color: 'var(--text-3)' },
};

function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || 'EO';
}

function inFolder(msg: InboxMessage, folder: InboxFolder): boolean {
  if (folder === 'archived') return msg.archived;
  if (msg.archived) return false;
  if (folder === 'unread') return !msg.read && msg.direction === 'inbound';
  if (folder === 'needs_action') return msg.actionRequired && !msg.actionCompleted;
  if (folder === 'sent') return msg.direction === 'outbound';
  return msg.direction === 'inbound';
}

export default function Inbox() {
  const { messageId } = useParams<{ messageId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const replyRef = useRef<HTMLTextAreaElement>(null);

  const {
    inboxMessages,
    markInboxMessageRead,
    archiveInboxMessage,
    replyToInboxMessage,
    completeInboxAction,
    showToast,
    supplierPos,
    supplierQuotations,
    rfqs,
    invoices,
    supplierBills,
    dispatches,
    inventory,
    quotations,
  } = useStore();

  const folderParam = (searchParams.get('folder') as InboxFolder) || 'inbox';
  const activeFolder: InboxFolder = FOLDERS.some(f => f.id === folderParam) ? folderParam : 'inbox';

  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>('All');
  const [replyText, setReplyText] = useState('');

  const folderCounts = useMemo(() => ({
    inbox: inboxMessages.filter(m => inFolder(m, 'inbox')).length,
    unread: inboxMessages.filter(m => inFolder(m, 'unread')).length,
    needs_action: inboxMessages.filter(m => inFolder(m, 'needs_action')).length,
    sent: inboxMessages.filter(m => inFolder(m, 'sent')).length,
    archived: inboxMessages.filter(m => inFolder(m, 'archived')).length,
  }), [inboxMessages]);

  const filteredMessages = useMemo(() => {
    const q = search.trim().toLowerCase();
    return inboxMessages
      .filter(m => inFolder(m, activeFolder))
      .filter(m => moduleFilter === 'All' || m.module === moduleFilter)
      .filter(m => !q || [m.senderName, m.senderOrg, m.subject, m.preview, m.relatedEntityRef, m.module]
        .some(f => f.toLowerCase().includes(q)))
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [inboxMessages, activeFolder, moduleFilter, search]);

  const selectedMessage = useMemo(() => {
    if (messageId) return inboxMessages.find(m => m.id === messageId) ?? null;
    return filteredMessages[0] ?? null;
  }, [messageId, inboxMessages, filteredMessages]);

  // Mark selected message as read when opened via URL
  useEffect(() => {
    if (messageId && selectedMessage && !selectedMessage.read) {
      markInboxMessageRead(selectedMessage.id, true);
    }
  }, [messageId, selectedMessage?.id, selectedMessage?.read, markInboxMessageRead]);

  const selectFolder = (folder: InboxFolder) => {
    setSearchParams(folder === 'inbox' ? {} : { folder });
    if (messageId) {
      navigate(folder === 'inbox' ? '/inbox' : `/inbox?folder=${folder}`);
    }
  };

  const openMessage = (msg: InboxMessage) => {
    if (!msg.read) markInboxMessageRead(msg.id, true);
    const q = activeFolder === 'inbox' ? '' : `?folder=${activeFolder}`;
    navigate(`/inbox/${msg.id}${q}`);
  };

  const openRelatedRecord = (path: string, msgId: string) => {
    const returnTo = activeFolder === 'inbox' ? `/inbox/${msgId}` : `/inbox/${msgId}?folder=${activeFolder}`;
    navigate(path, { state: { from: returnTo } });
  };

  const getLiveRecordStatus = (msg: InboxMessage): string | undefined => {
    if (msg.relatedEntityType === 'SupplierPO') return supplierPos.find(p => p.id === msg.relatedEntityId)?.status;
    if (msg.relatedEntityType === 'SupplierQuotation') return supplierQuotations.find(q => q.id === msg.relatedEntityId)?.status;
    if (msg.relatedEntityType === 'CustomerRFQ') return rfqs.find(r => r.id === msg.relatedEntityId)?.status;
    if (msg.relatedEntityType === 'CustomerQuotation') return quotations.find(q => q.id === msg.relatedEntityId)?.status;
    if (msg.relatedEntityType === 'CustomerInvoice') return invoices.find(i => i.id === msg.relatedEntityId)?.status;
    if (msg.relatedEntityType === 'SupplierBill') return supplierBills.find(b => b.id === msg.relatedEntityId)?.status;
    if (msg.relatedEntityType === 'Dispatch') return dispatches.find(d => d.id === msg.relatedEntityId)?.status;
    if (msg.relatedEntityType === 'InventoryItem') {
      const item = inventory.find(i => i.id === msg.relatedEntityId);
      return item ? `${item.onHandQty} ${item.primaryUom} on hand` : undefined;
    }
    return undefined;
  };

  const renderContextActions = (msg: InboxMessage) => {
    const done = Boolean(msg.actionCompleted);
    const btnSecondary = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors';
    const btnPrimary = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90';

    const openBtn = (label: string, path = msg.relatedPath) => (
      <button key={label} type="button" onClick={() => openRelatedRecord(path, msg.id)} className={btnSecondary} style={{ borderColor: 'var(--border)' }}>
        <ExternalLink size={13} /> {label}
      </button>
    );

    switch (msg.type) {
      case 'customer_rfq':
        return (
          <>
            {openBtn('Open RFQ')}
            <button
              type="button"
              onClick={() => openRelatedRecord(`/sales/rfq/${msg.relatedEntityId}/quotation/new`, msg.id)}
              className={btnPrimary}
              style={{ background: 'var(--brand-fill)' }}
            >
              Prepare Quotation
            </button>
          </>
        );
      case 'supplier_quotation': {
        const sq = supplierQuotations.find(q => q.id === msg.relatedEntityId);
        return (
          <>
            {openBtn('Review Quote')}
            {sq?.prId && openBtn('Compare Quotes on PR', `/procurement/pr/${sq.prId}`)}
          </>
        );
      }
      case 'supplier_po_confirmation':
        return (
          <>
            {openBtn('Open PO')}
            {!done && (
              <button
                type="button"
                onClick={() => completeInboxAction(msg.id, 'confirmed')}
                className={btnPrimary}
                style={{ background: 'var(--success, #16A34A)' }}
              >
                <CheckCircle2 size={13} /> Record Confirmation
              </button>
            )}
          </>
        );
      case 'supplier_po_amendment':
      case 'supplier_delivery_extension':
        return (
          <>
            {openBtn('Review PO')}
            {!done && (
              <>
                <button
                  type="button"
                  onClick={() => completeInboxAction(msg.id, 'approved')}
                  className={btnPrimary}
                  style={{ background: 'var(--success, #16A34A)' }}
                >
                  <CheckCircle2 size={13} /> Approve
                </button>
                <button
                  type="button"
                  onClick={() => completeInboxAction(msg.id, 'rejected')}
                  className={btnPrimary}
                  style={{ background: 'var(--error, #DC2626)' }}
                >
                  <XCircle size={13} /> Reject
                </button>
              </>
            )}
          </>
        );
      case 'cycle_count_variance':
      case 'stock_adjustment_request':
        return (
          <>
            {openBtn('Review Item')}
            {!done && (
              <>
                <button
                  type="button"
                  onClick={() => completeInboxAction(msg.id, 'approved')}
                  className={btnPrimary}
                  style={{ background: 'var(--success, #16A34A)' }}
                >
                  <CheckCircle2 size={13} /> Approve Adjustment
                </button>
                <button
                  type="button"
                  onClick={() => completeInboxAction(msg.id, 'rejected')}
                  className={btnPrimary}
                  style={{ background: 'var(--error, #DC2626)' }}
                >
                  <XCircle size={13} /> Reject
                </button>
              </>
            )}
          </>
        );
      case 'supplier_invoice':
        return (
          <>
            {openBtn('Review Bill')}
            <button
              type="button"
              onClick={() => openRelatedRecord(msg.relatedPath, msg.id)}
              className={btnPrimary}
              style={{ background: 'var(--brand-fill)' }}
            >
              Match PO / GRN
            </button>
          </>
        );
      case 'customer_payment_confirmation':
        return (
          <>
            {openBtn('Review Invoice')}
            <button
              type="button"
              onClick={() => openRelatedRecord(`/finance/payment/new?invoiceId=${msg.relatedEntityId}`, msg.id)}
              className={btnPrimary}
              style={{ background: 'var(--brand-fill)' }}
            >
              Record Receipt
            </button>
          </>
        );
      case 'customer_delivery_query':
        return (
          <>
            {openBtn('View Dispatch')}
            <button
              type="button"
              onClick={() => replyRef.current?.focus()}
              className={btnPrimary}
              style={{ background: 'var(--brand-fill)' }}
            >
              <Reply size={13} /> Reply
            </button>
          </>
        );
      default:
        return openBtn(`Open ${msg.relatedEntityRef}`);
    }
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessage || !replyText.trim()) return;
    replyToInboxMessage(selectedMessage.id, replyText);
    setReplyText('');
  };

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col bg-[var(--bg)]">
      {/* Header */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 px-4 md:px-6 py-3 border-b flex-shrink-0"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      >
        <div className="flex items-center gap-2.5">
          <InboxIcon size={18} style={{ color: 'var(--brand)' }} />
          <div>
            <h1 className="text-base font-bold text-[var(--text)] leading-tight">Business Inbox</h1>
            <p className="text-[11px] text-[var(--text-3)]">
              Supplier, customer, and internal operational communications linked to EOSS records
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-1 max-w-md justify-end">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search sender, subject, or ref…"
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border text-xs outline-none"
              style={{ borderColor: 'var(--border)', background: 'var(--surface-2)', color: 'var(--text)' }}
            />
          </div>
          <select
            value={moduleFilter}
            onChange={e => setModuleFilter(e.target.value)}
            aria-label="Filter by module"
            className="px-2.5 py-1.5 rounded-lg border text-xs outline-none"
            style={{ borderColor: 'var(--border)', background: 'var(--surface-2)', color: 'var(--text)' }}
          >
            {['All', 'Procurement', 'Sales', 'Inventory', 'Dispatch', 'Finance'].map(m => (
              <option key={m} value={m}>{m === 'All' ? 'All Modules' : m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 3-pane email workspace */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[190px_330px_1fr] lg:grid-cols-[205px_360px_1fr]">
        {/* Folders sidebar */}
        <aside
          className="border-b md:border-b-0 md:border-r p-2.5 flex md:flex-col gap-1 overflow-x-auto flex-shrink-0"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        >
          {FOLDERS.map(f => {
            const active = activeFolder === f.id;
            const count = folderCounts[f.id];
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => selectFolder(f.id)}
                className={clsx(
                  'flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap',
                  active ? 'text-[var(--brand)]' : 'text-[var(--text-2)] hover:bg-[var(--surface-2)]'
                )}
                style={active ? { background: 'var(--brand-light, rgba(112,72,245,0.1))' } : undefined}
              >
                <span className="flex items-center gap-2">
                  {f.icon}
                  {f.label}
                </span>
                {count > 0 && (
                  <span
                    className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                    style={{
                      background: active ? 'var(--brand-fill)' : 'var(--surface-2)',
                      color: active ? '#FFFFFF' : 'var(--text-3)',
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Message List */}
        <section
          className={clsx(
            'border-r overflow-y-auto divide-y',
            messageId ? 'hidden md:block' : 'block'
          )}
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        >
          {filteredMessages.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--text-3)]">
              No messages in {FOLDERS.find(f => f.id === activeFolder)?.label}.
            </div>
          ) : (
            filteredMessages.map(msg => {
              const selected = selectedMessage?.id === msg.id;
              const badge = STATUS_BADGE[msg.status];
              return (
                <button
                  key={msg.id}
                  type="button"
                  onClick={() => openMessage(msg)}
                  className={clsx(
                    'w-full text-left px-3.5 py-3 transition-colors flex gap-2.5 items-start',
                    selected ? 'bg-[var(--surface-2)]' : 'hover:bg-[var(--surface-2)]/60'
                  )}
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5"
                    style={{
                      background: !msg.read ? 'var(--brand-fill)' : 'var(--surface-2)',
                      color: !msg.read ? '#FFFFFF' : 'var(--text-2)',
                    }}
                  >
                    {initials(msg.senderName)}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={clsx('text-xs truncate', !msg.read ? 'font-bold text-[var(--text)]' : 'font-semibold text-[var(--text-2)]')}>
                        {msg.senderName}
                      </span>
                      <span className="text-[10px] text-[var(--text-3)] flex-shrink-0">
                        {msg.timestamp.slice(5, 10)}
                      </span>
                    </div>
                    <div className={clsx('text-xs truncate', !msg.read ? 'font-bold text-[var(--text)]' : 'font-medium text-[var(--text)]')}>
                      {!msg.read && <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--brand)] mr-1.5 align-middle" />}
                      {msg.subject}
                    </div>
                    <p className="text-[11px] text-[var(--text-3)] line-clamp-2 leading-snug">{msg.preview}</p>
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-2)]">
                        {msg.module}
                      </span>
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                        style={{ background: badge.bg, color: badge.color }}
                      >
                        {badge.label}
                      </span>
                      {msg.attachments && msg.attachments.length > 0 && (
                        <Paperclip size={11} className="text-[var(--text-3)]" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </section>

        {/* Message Detail */}
        <main className={clsx('overflow-y-auto p-4 md:p-6', !messageId && 'hidden md:block')}>
          {!selectedMessage ? (
            <div className="h-full flex items-center justify-center text-sm text-[var(--text-3)]">
              Select a message to read details and take action.
            </div>
          ) : (
            <div className="max-w-3xl space-y-4">
              {messageId && (
                <button
                  type="button"
                  onClick={() => navigate(activeFolder === 'inbox' ? '/inbox' : `/inbox?folder=${activeFolder}`)}
                  className="md:hidden inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand)]"
                >
                  <ArrowLeft size={14} /> Back to {FOLDERS.find(f => f.id === activeFolder)?.label}
                </button>
              )}

              {/* Subject & Toolbar */}
              <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-2)]">
                        {selectedMessage.module}
                      </span>
                      <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded"
                        style={{ background: STATUS_BADGE[selectedMessage.status].bg, color: STATUS_BADGE[selectedMessage.status].color }}
                      >
                        {STATUS_BADGE[selectedMessage.status].label}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-[var(--text)]">{selectedMessage.subject}</h2>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => markInboxMessageRead(selectedMessage.id, !selectedMessage.read)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium text-[var(--text-2)] hover:text-[var(--text)]"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      {selectedMessage.read ? <Mail size={13} /> : <MailOpen size={13} />}
                      {selectedMessage.read ? 'Mark Unread' : 'Mark Read'}
                    </button>
                    <button
                      type="button"
                      onClick={() => archiveInboxMessage(selectedMessage.id, !selectedMessage.archived)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium text-[var(--text-2)] hover:text-[var(--text)]"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      {selectedMessage.archived ? <ArchiveRestore size={13} /> : <Archive size={13} />}
                      {selectedMessage.archived ? 'Unarchive' : 'Archive'}
                    </button>
                  </div>
                </div>

                {/* Sender / Recipient */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t text-xs" style={{ borderColor: 'var(--border)' }}>
                  <div className="space-y-0.5">
                    <div>
                      <span className="font-semibold text-[var(--text)]">{selectedMessage.senderName}</span>{' '}
                      <span className="text-[var(--text-3)]">&lt;{selectedMessage.senderEmail}&gt; · {selectedMessage.senderOrg}</span>
                    </div>
                    <div className="text-[var(--text-3)]">
                      To: <span className="text-[var(--text-2)]">{selectedMessage.recipientName} &lt;{selectedMessage.recipientEmail}&gt;</span>
                    </div>
                  </div>
                  <span className="text-[var(--text-3)]">{formatDisplayDateTime(selectedMessage.timestamp)}</span>
                </div>

                {/* Linked EOSS Business Record + Context Actions */}
                <div
                  className="rounded-lg border p-3 flex flex-wrap items-center justify-between gap-3"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
                >
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)]">
                      Related EOSS Record
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => openRelatedRecord(selectedMessage.relatedPath, selectedMessage.id)}
                        className="font-mono font-bold text-[var(--brand)] hover:underline"
                      >
                        {selectedMessage.relatedEntityRef}
                      </button>
                      <span className="text-[var(--text-3)]">({selectedMessage.relatedEntityType})</span>
                      {getLiveRecordStatus(selectedMessage) && (
                        <span className="px-2 py-0.5 rounded bg-[var(--surface)] border text-[11px] font-semibold text-[var(--text-2)]" style={{ borderColor: 'var(--border)' }}>
                          Record Status: {getLiveRecordStatus(selectedMessage)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {renderContextActions(selectedMessage)}
                  </div>
                </div>

                {/* Body */}
                <div className="pt-2 text-sm text-[var(--text)] whitespace-pre-line leading-relaxed">
                  {selectedMessage.body}
                </div>

                {/* Attachments */}
                {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                  <div className="pt-3 border-t space-y-1.5" style={{ borderColor: 'var(--border)' }}>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-3)]">
                      Attachments ({selectedMessage.attachments.length})
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedMessage.attachments.map(att => (
                        <button
                          key={att.id}
                          type="button"
                          onClick={() => showToast({ type: 'info', title: 'Attachment preview (simulated)', body: `${att.name} (${att.size}) — linked to ${selectedMessage.relatedEntityRef}.` })}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs text-[var(--text)] hover:bg-[var(--surface-2)]"
                          style={{ borderColor: 'var(--border)' }}
                        >
                          <FileText size={13} style={{ color: 'var(--brand)' }} />
                          <span className="font-medium">{att.name}</span>
                          <span className="text-[10px] text-[var(--text-3)]">{att.size}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Conversation Thread */}
              {selectedMessage.thread && selectedMessage.thread.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-3)] px-1">
                    Thread History ({selectedMessage.thread.length})
                  </div>
                  {selectedMessage.thread.map(entry => (
                    <div
                      key={entry.id}
                      className="rounded-xl border p-3.5 text-xs space-y-1"
                      style={{
                        borderColor: 'var(--border)',
                        background: entry.isOutgoing ? 'var(--surface-2)' : 'var(--surface)',
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-[var(--text)]">
                          {entry.senderName}{' '}
                          <span className="font-normal text-[var(--text-3)]">({entry.senderRoleOrOrg})</span>
                        </span>
                        <span className="text-[var(--text-3)]">{formatDisplayDateTime(entry.timestamp)}</span>
                      </div>
                      <p className="text-[var(--text-2)] whitespace-pre-line leading-relaxed">{entry.body}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Simulated Reply Composer */}
              <form
                onSubmit={handleReplySubmit}
                className="rounded-xl border p-4 space-y-2.5"
                style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text)] flex items-center gap-1.5">
                    <Reply size={13} /> Reply to {selectedMessage.senderName}
                  </span>
                  <span className="text-[11px] text-[var(--text-3)]">
                    Simulated communication — logged to thread & audit trail (no external email sent)
                  </span>
                </div>
                <textarea
                  ref={replyRef}
                  rows={3}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder={`Write a reply regarding ${selectedMessage.relatedEntityRef}…`}
                  className="w-full rounded-lg border p-2.5 text-xs outline-none resize-y"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface-2)', color: 'var(--text)' }}
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-40"
                    style={{ background: 'var(--brand-fill)' }}
                  >
                    <Send size={12} /> Record Reply
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
