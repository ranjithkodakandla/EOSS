import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Inbox as InboxIcon, Mail, MailOpen, AlertCircle, Send, Archive, ArchiveRestore,
  Search, Paperclip, ExternalLink, CheckCircle2, XCircle, Reply, FileText, ArrowLeft,
  MessageSquare, Phone, Settings, Link2, UserCheck, CheckCheck, Clock,
  FilePlus, RefreshCw, X, CheckCircle
} from 'lucide-react';
import clsx from 'clsx';
import { useStore } from '../../store';
import type { InboxFolder, InboxMessage, InboxMessageStatus, ConnectedChannel, CustomerRFQ } from '../../types';
import { formatDisplayDateTime } from '../../domain/dates';

const FOLDERS: { id: InboxFolder; label: string; icon: React.ReactNode }[] = [
  { id: 'inbox', label: 'All Inbox', icon: <InboxIcon size={15} /> },
  { id: 'unread', label: 'Unread', icon: <Mail size={15} /> },
  { id: 'needs_action', label: 'Needs Action', icon: <AlertCircle size={15} /> },
  { id: 'whatsapp', label: 'WhatsApp', icon: <MessageSquare size={15} className="text-emerald-500" /> },
  { id: 'email', label: 'Email (Gmail/Outlook)', icon: <Mail size={15} className="text-blue-500" /> },
  { id: 'customer_rfqs', label: 'Customer RFQs', icon: <FileText size={15} className="text-blue-600" /> },
  { id: 'supplier_quotes', label: 'Supplier Quotes', icon: <FileText size={15} className="text-purple-600" /> },
  { id: 'unassigned', label: 'Unassigned', icon: <Clock size={15} className="text-amber-500" /> },
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
  converted_to_rfq: { label: 'Converted to RFQ', bg: 'var(--success-bg, #F0FDF4)', color: 'var(--success, #16A34A)' },
  converted_to_quote: { label: 'Converted to Quote', bg: 'var(--success-bg, #F0FDF4)', color: 'var(--success, #16A34A)' },
  linked: { label: 'Linked', bg: 'var(--brand-light, #EDE9FE)', color: 'var(--brand)' },
};

const TEAM_MEMBERS = [
  { name: 'Priya Sharma', role: 'Sales Lead' },
  { name: 'Vikram Malhotra', role: 'Procurement Specialist' },
  { name: 'Karthik Raju', role: 'Operations & Production Head' },
  { name: 'Sneha Rao', role: 'Finance Controller' },
  { name: 'Suresh Nair', role: 'Quality Lead' },
];

function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || 'EO';
}

function inFolder(msg: InboxMessage, folder: InboxFolder): boolean {
  if (folder === 'archived') return !!msg.archived;
  if (msg.archived) return false;
  if (folder === 'unread') return !msg.read && msg.direction === 'inbound';
  if (folder === 'needs_action') return !!msg.actionRequired && !msg.actionCompleted;
  if (folder === 'sent') return msg.direction === 'outbound';
  if (folder === 'whatsapp') return msg.channel === 'whatsapp';
  if (folder === 'email') return msg.channel === 'email_gmail' || msg.channel === 'email_outlook';
  if (folder === 'customer_rfqs') return msg.type === 'customer_rfq';
  if (folder === 'supplier_quotes') return msg.type === 'supplier_quotation';
  if (folder === 'unassigned') return !msg.assignedTo;
  return msg.direction === 'inbound';
}

export default function Inbox() {
  const { messageId } = useParams<{ messageId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const replyRef = useRef<HTMLTextAreaElement>(null);

  const {
    inboxMessages,
    connectedChannels,
    markInboxMessageRead,
    archiveInboxMessage,
    replyToInboxMessage,
    completeInboxAction,
    createRFQFromInbox,
    createSupplierQuoteFromInbox,
    linkRecordToInboxMessage,
    assignInboxMessage,
    updateConnectedChannel,
    showToast,
    supplierPos,
    supplierQuotations,
    purchaseReqs,
    rfqs,
    invoices,
    supplierBills,
    dispatches,
    inventory,
    quotations,
    customerPos,
    customers,
    suppliers,
  } = useStore();

  const folderParam = (searchParams.get('folder') as InboxFolder) || 'inbox';
  const activeFolder: InboxFolder = FOLDERS.some(f => f.id === folderParam) ? folderParam : 'inbox';

  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>('All');
  const [replyText, setReplyText] = useState('');

  // Modals state
  const [showChannelsModal, setShowChannelsModal] = useState(false);
  const [showRfqModal, setShowRfqModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [internalNoteText, setInternalNoteText] = useState('');

  // RFQ modal fields
  const [rfqCustomerId, setRfqCustomerId] = useState('');
  const [rfqDueDate, setRfqDueDate] = useState('');
  const [rfqPartDesc, setRfqPartDesc] = useState('');
  const [rfqQty, setRfqQty] = useState('50');

  // Supplier Quote modal fields
  const [sqSupplierId, setSqSupplierId] = useState('');
  const [sqPrId, setSqPrId] = useState('');
  const [sqUnitRate, setSqUnitRate] = useState('185');
  const [sqLeadDays, setSqLeadDays] = useState('7');

  // Link record modal fields
  const [linkEntityType, setLinkEntityType] = useState<'CustomerRFQ' | 'CustomerPO' | 'PurchaseRequisition' | 'SupplierPO' | 'Job'>('CustomerPO');
  const [linkEntityId, setLinkEntityId] = useState('');

  const folderCounts: Record<InboxFolder, number> = useMemo(() => ({
    inbox: inboxMessages.filter(m => inFolder(m, 'inbox')).length,
    unread: inboxMessages.filter(m => inFolder(m, 'unread')).length,
    needs_action: inboxMessages.filter(m => inFolder(m, 'needs_action')).length,
    whatsapp: inboxMessages.filter(m => inFolder(m, 'whatsapp')).length,
    email: inboxMessages.filter(m => inFolder(m, 'email')).length,
    customer_rfqs: inboxMessages.filter(m => inFolder(m, 'customer_rfqs')).length,
    supplier_quotes: inboxMessages.filter(m => inFolder(m, 'supplier_quotes')).length,
    unassigned: inboxMessages.filter(m => inFolder(m, 'unassigned')).length,
    sent: inboxMessages.filter(m => inFolder(m, 'sent')).length,
    archived: inboxMessages.filter(m => inFolder(m, 'archived')).length,
  }), [inboxMessages]);

  const filteredMessages = useMemo(() => {
    const q = search.trim().toLowerCase();
    return inboxMessages
      .filter(m => inFolder(m, activeFolder))
      .filter(m => moduleFilter === 'All' || m.module === moduleFilter)
      .filter(m => !q || [m.senderName, m.senderOrg, m.subject, m.preview, m.relatedEntityRef || '', m.module]
        .some(f => (f || '').toLowerCase().includes(q)))
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [inboxMessages, activeFolder, moduleFilter, search]);

  const selectedMessage = useMemo(() => {
    if (messageId) return inboxMessages.find(m => m.id === messageId) ?? null;
    return filteredMessages[0] ?? null;
  }, [messageId, inboxMessages, filteredMessages]);

  useEffect(() => {
    if (selectedMessage) {
      setInternalNoteText(selectedMessage.internalNotes || '');
    }
  }, [selectedMessage?.id]);

  // Mark selected message as read when opened
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

  const openRelatedRecord = (path?: string, msgId?: string) => {
    if (!path) return;
    const returnTo = activeFolder === 'inbox' ? `/inbox/${msgId}` : `/inbox/${msgId}?folder=${activeFolder}`;
    navigate(path, { state: { from: returnTo } });
  };

  const getLiveRecordStatus = (msg: InboxMessage): string | undefined => {
    if (msg.relatedEntityType === 'SupplierPO') return supplierPos.find(p => p.id === msg.relatedEntityId)?.status;
    if (msg.relatedEntityType === 'SupplierQuotation') return supplierQuotations.find(q => q.id === msg.relatedEntityId)?.status;
    if (msg.relatedEntityType === 'CustomerRFQ') return rfqs.find(r => r.id === msg.relatedEntityId)?.status;
    if (msg.relatedEntityType === 'CustomerQuotation') return quotations.find(q => q.id === msg.relatedEntityId)?.status;
    if (msg.relatedEntityType === 'CustomerPO') return customerPos.find(p => p.id === msg.relatedEntityId)?.status;
    if (msg.relatedEntityType === 'CustomerInvoice') return invoices.find(i => i.id === msg.relatedEntityId)?.status;
    if (msg.relatedEntityType === 'SupplierBill') return supplierBills.find(b => b.id === msg.relatedEntityId)?.status;
    if (msg.relatedEntityType === 'Dispatch') return dispatches.find(d => d.id === msg.relatedEntityId)?.status;
    if (msg.relatedEntityType === 'InventoryItem') {
      const item = inventory.find(i => i.id === msg.relatedEntityId);
      return item ? `${item.onHandQty} ${item.primaryUom} on hand` : undefined;
    }
    return undefined;
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessage || !replyText.trim()) return;
    replyToInboxMessage(selectedMessage.id, replyText);
    setReplyText('');
  };

  const handleOpenRfqModal = () => {
    if (!selectedMessage) return;
    const matchCust = customers.find(c => c.tradingName.toLowerCase().includes(selectedMessage.senderOrg.toLowerCase()));
    setRfqCustomerId(matchCust?.id || customers[0]?.id || 'cust-001');
    // Parse delivery date from message body (e.g. "by 25th December" or "by 25th Dec")
    const dateMatch = selectedMessage.body?.match(/by\s+(\d{1,2}(?:st|nd|rd|th)?\s+\w+(?:\s+\d{4})?)/i);
    const parsedDue = dateMatch ? (() => { try { const d = new Date(dateMatch[1].replace(/st|nd|rd|th/g, '')); return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10); } catch { return null; } })() : null;
    setRfqDueDate(parsedDue || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
    // Strip common channel prefixes from subject
    const cleanSubject = (selectedMessage.subject || '')
      .replace(/^(WhatsApp Enquiry|Email Enquiry|Outlook Enquiry):\s*/i, '')
      .trim() || 'Custom Precision Component';
    setRfqPartDesc(cleanSubject);
    // Try to parse quantity from message body
    const qtyMatch = selectedMessage.body?.match(/(\d[\d,]*)\s*(?:units?|nos?|pcs?|pieces?)/i);
    const parsedQty = qtyMatch ? String(parseInt(qtyMatch[1].replace(/,/g, ''), 10)) : '50';
    setRfqQty(parsedQty);
    setShowRfqModal(true);
  };

  const handleConvertRfq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessage) return;
    const cust = customers.find(c => c.id === rfqCustomerId);
    const rfq = createRFQFromInbox(selectedMessage.id, {
      customerId: rfqCustomerId,
      customerName: cust?.tradingName || selectedMessage.senderOrg,
      requiredBy: rfqDueDate,
      lineCount: 1,
      lines: [
        {
          id: `rfql-${Date.now()}`,
          rfqId: '',
          lineIndex: 1,
          partNumber: 'PART-NEW',
          description: rfqPartDesc,
          quantity: Number(rfqQty) || 50,
          uom: 'nos',
          targetPrice: 2850,
          notes: selectedMessage.attachments?.length ? `Drawings attached: ${selectedMessage.attachments.map(a => a.name).join(', ')}` : '',
        }
      ] as any,
    });
    setShowRfqModal(false);
    navigate(`/sales/rfq/${rfq.id}`);
  };

  const handleOpenQuoteModal = () => {
    if (!selectedMessage) return;
    const matchSup = suppliers.find(s => s.tradingName.toLowerCase().includes(selectedMessage.senderOrg.toLowerCase()));
    setSqSupplierId(matchSup?.id || suppliers[0]?.id || 'sup-001');
    const openPr = purchaseReqs.find(p => ['approved', 'open', 'quotation_in_progress'].includes(p.status));
    setSqPrId(openPr?.id || '');
    // Parse unit rate from body (e.g. "₹85/kg" or "₹185 per unit")
    const rateMatch = selectedMessage.body?.match(/[₹Rs\.]+\s*(\d[\d,]*(?:\.\d+)?)\s*(?:\/|per\s)/i);
    setSqUnitRate(rateMatch ? String(parseFloat(rateMatch[1].replace(/,/g, ''))) : '185');
    // Parse lead days from body (e.g. "5 working days" or "7 days")
    const leadMatch = selectedMessage.body?.match(/(\d+)\s*(?:working\s+)?days?/i);
    setSqLeadDays(leadMatch ? leadMatch[1] : '5');
    setShowQuoteModal(true);
  };

  const handleConvertQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessage) return;
    const sup = suppliers.find(s => s.id === sqSupplierId);
    const pr = purchaseReqs.find(p => p.id === sqPrId);
    const quote = createSupplierQuoteFromInbox(selectedMessage.id, {
      supplierId: sqSupplierId,
      supplierName: sup?.tradingName || selectedMessage.senderOrg,
      prId: sqPrId || undefined,
      prNumber: pr?.prNumber || undefined,
      deliveryDays: Number(sqLeadDays) || 7,
      lines: pr?.lines ? pr.lines.map((l, idx) => ({
        id: `sql-${Date.now()}-${idx + 1}`,
        quoteId: '',
        materialItemId: l.materialItemId,
        materialCode: l.materialCode,
        materialName: l.materialName,
        grade: l.grade,
        quotedQty: l.requiredQty,
        uom: l.uom,
        unitPrice: Number(sqUnitRate) || 185,
        taxPct: 18,
        lineTotal: (l.requiredQty || 1) * (Number(sqUnitRate) || 185),
      })) : undefined,
    });
    setShowQuoteModal(false);
    navigate(`/procurement/quote/${quote.id}`);
  };

  const handleLinkRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessage || !linkEntityId) return;
    let ref = linkEntityId;
    let path = '/';
    if (linkEntityType === 'CustomerPO') {
      const p = customerPos.find(x => x.id === linkEntityId);
      ref = p?.poNumber || linkEntityId;
      path = `/sales/po/${linkEntityId}`;
    } else if (linkEntityType === 'CustomerRFQ') {
      const r = rfqs.find(x => x.id === linkEntityId);
      ref = r?.rfqNumber || linkEntityId;
      path = `/sales/rfq/${linkEntityId}`;
    } else if (linkEntityType === 'PurchaseRequisition') {
      const pr = purchaseReqs.find(x => x.id === linkEntityId);
      ref = pr?.prNumber || linkEntityId;
      path = `/procurement/pr/${linkEntityId}`;
    } else if (linkEntityType === 'SupplierPO') {
      const spo = supplierPos.find(x => x.id === linkEntityId);
      ref = spo?.poNumber || linkEntityId;
      path = `/procurement/po/${linkEntityId}`;
    }

    linkRecordToInboxMessage(selectedMessage.id, linkEntityType as any, linkEntityId, ref, path);
    setShowLinkModal(false);
  };

  const renderChannelBadge = (channel?: string) => {
    if (channel === 'whatsapp') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <MessageSquare size={11} className="text-emerald-600" /> WhatsApp
        </span>
      );
    }
    if (channel === 'email_outlook') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <Mail size={11} className="text-blue-600" /> Outlook
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        <Mail size={11} className="text-rose-600" /> Gmail
      </span>
    );
  };

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col bg-[var(--bg)]">
      {/* Top Header */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 px-4 md:px-6 py-3 border-b flex-shrink-0"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      >
        <div className="flex items-center gap-2.5">
          <InboxIcon size={20} style={{ color: 'var(--brand)' }} />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[var(--text)] leading-tight">Unified Business Inbox</h1>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Simulated · No live internet
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-3)]">
              Channels simulate Gmail, Outlook and WhatsApp messages — no live internet requests are made
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-lg justify-end">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search sender, subject, ref, channel…"
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

          <button
            type="button"
            onClick={() => setShowChannelsModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold text-[var(--text-2)] hover:bg-[var(--surface-2)] transition-colors"
            style={{ borderColor: 'var(--border)' }}
          >
            <Settings size={13} /> Connected Channels
          </button>
        </div>
      </div>

      {/* 3-pane email workspace */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[210px_360px_1fr] lg:grid-cols-[220px_380px_1fr]">
        {/* Left Sidebar: Folders & Channels */}
        <aside
          className="border-b md:border-b-0 md:border-r p-2.5 flex md:flex-col gap-1 overflow-x-auto flex-shrink-0"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        >
          <div className="hidden md:block px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)]">
            Mailboxes & Channels
          </div>
          {FOLDERS.map(f => {
            const active = activeFolder === f.id;
            const count = folderCounts[f.id] || 0;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => selectFolder(f.id)}
                className={clsx(
                  'flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap',
                  active ? 'text-[var(--brand)] font-bold' : 'text-[var(--text-2)] hover:bg-[var(--surface-2)]'
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

          <div className="hidden md:block mt-auto pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="px-3 py-2 rounded-lg bg-[var(--surface-2)] text-[11px] space-y-1">
              <div className="font-semibold text-[var(--text)] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Simulated Ingestion
              </div>
              <p className="text-[10px] text-[var(--text-3)] leading-relaxed">
                Channels simulate incoming emails & WhatsApp messages without making live internet requests.
              </p>
            </div>
          </div>
        </aside>

        {/* Middle: Message List */}
        <section
          className={clsx(
            'border-r overflow-y-auto divide-y',
            messageId ? 'hidden md:block' : 'block'
          )}
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        >
          {filteredMessages.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--text-3)]">
              No conversations in {FOLDERS.find(f => f.id === activeFolder)?.label}.
            </div>
          ) : (
            filteredMessages.map(msg => {
              const selected = selectedMessage?.id === msg.id;
              const badge = STATUS_BADGE[msg.status] || STATUS_BADGE.read;
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
                    className={clsx(
                      'w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5',
                      msg.channel === 'whatsapp' ? 'bg-emerald-600 text-white' : !msg.read ? 'bg-[var(--brand)] text-white' : 'bg-[var(--surface-2)] text-[var(--text-2)]'
                    )}
                  >
                    {msg.channel === 'whatsapp' ? <MessageSquare size={14} /> : initials(msg.senderName)}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className={clsx('text-xs truncate', !msg.read ? 'font-bold text-[var(--text)]' : 'font-semibold text-[var(--text-2)]')}>
                        {msg.senderName}
                      </span>
                      <span className="text-[10px] text-[var(--text-3)] flex-shrink-0">
                        {msg.timestamp.slice(5, 10)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {renderChannelBadge(msg.channel)}
                      <span className="text-[10px] text-[var(--text-3)] truncate">· {msg.senderOrg}</span>
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
                      {msg.assignedTo && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                          👤 {msg.assignedTo.split(' ')[0]}
                        </span>
                      )}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px] text-[var(--text-3)]">
                          <Paperclip size={11} /> {msg.attachments.length}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </section>

        {/* Right: Message Detail */}
        <main className={clsx('overflow-y-auto p-4 md:p-6', !messageId && 'hidden md:block')}>
          {!selectedMessage ? (
            <div className="h-full flex items-center justify-center text-sm text-[var(--text-3)]">
              Select a conversation to view thread details and take action.
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

              {/* Header Box */}
              <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {renderChannelBadge(selectedMessage.channel)}
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-2)]">
                        {selectedMessage.module}
                      </span>
                      <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded"
                        style={{
                          background: STATUS_BADGE[selectedMessage.status]?.bg || 'var(--surface-2)',
                          color: STATUS_BADGE[selectedMessage.status]?.color || 'var(--text-3)'
                        }}
                      >
                        {STATUS_BADGE[selectedMessage.status]?.label || selectedMessage.status}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-[var(--text)]">{selectedMessage.subject}</h2>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Quick convert buttons */}
                    {selectedMessage.type === 'customer_rfq' && (
                      selectedMessage.actionCompleted || selectedMessage.status === 'converted_to_rfq' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--surface-2)] text-[var(--text-3)] border border-[var(--border)]">
                          <CheckCircle size={13} /> Already converted
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleOpenRfqModal}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
                        >
                          <FilePlus size={13} /> Convert to RFQ
                        </button>
                      )
                    )}

                    {selectedMessage.type === 'supplier_quotation' && (
                      selectedMessage.actionCompleted ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--surface-2)] text-[var(--text-3)] border border-[var(--border)]">
                          <CheckCircle size={13} /> Already converted
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleOpenQuoteModal}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 shadow-sm"
                        >
                          <FilePlus size={13} /> Convert to Supplier Quote
                        </button>
                      )
                    )}

                    <button
                      type="button"
                      onClick={() => setShowLinkModal(true)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium text-[var(--text-2)] hover:text-[var(--text)]"
                      style={{ borderColor: 'var(--border)' }}
                      title="Link to existing PO, RFQ, or PR"
                    >
                      <Link2 size={13} /> Link Record
                    </button>

                    <button
                      type="button"
                      onClick={() => markInboxMessageRead(selectedMessage.id, !selectedMessage.read)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium text-[var(--text-2)] hover:text-[var(--text)]"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      {selectedMessage.read ? <Mail size={13} /> : <MailOpen size={13} />}
                      {selectedMessage.read ? 'Unread' : 'Read'}
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

                {/* Sender metadata & Channel details */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t text-xs" style={{ borderColor: 'var(--border)' }}>
                  <div className="space-y-0.5">
                    <div>
                      <span className="font-semibold text-[var(--text)]">{selectedMessage.senderName}</span>{' '}
                      <span className="text-[var(--text-3)]">
                        {selectedMessage.channel === 'whatsapp' ? `(${selectedMessage.senderPhone || '+91 98490 22334'})` : `<${selectedMessage.senderEmail}>`}
                        {' '}· {selectedMessage.senderOrg}
                      </span>
                    </div>
                    <div className="text-[var(--text-3)]">
                      Channel: <span className="text-[var(--text-2)] font-medium">
                        {selectedMessage.channel === 'whatsapp' ? 'WhatsApp Business API (+91 98490 22334)' : selectedMessage.channel === 'email_outlook' ? 'Outlook 365 (sales@apexprecision.in)' : 'Google Workspace (raghav@apexprecision.in)'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[var(--text-3)]">{formatDisplayDateTime(selectedMessage.timestamp)}</span>
                    <div className="flex items-center justify-end gap-1.5 mt-1">
                      <span className="text-[11px] text-[var(--text-3)]">Assigned:</span>
                      <select
                        value={selectedMessage.assignedTo || ''}
                        onChange={e => {
                          const m = TEAM_MEMBERS.find(t => t.name === e.target.value);
                          if (m) assignInboxMessage(selectedMessage.id, m.name, m.role);
                        }}
                        className="text-xs px-2 py-0.5 rounded border outline-none bg-[var(--surface-2)] text-[var(--text)]"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <option value="">Unassigned</option>
                        {TEAM_MEMBERS.map(t => (
                          <option key={t.name} value={t.name}>{t.name} ({t.role.split(' ')[0]})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Linked Record Banner */}
                {selectedMessage.relatedEntityRef && (
                  <div
                    className="rounded-lg border p-3 flex flex-wrap items-center justify-between gap-3"
                    style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
                  >
                    <div className="space-y-0.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)]">
                        Linked BOSS Business Record
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => openRelatedRecord(selectedMessage.actionPath || selectedMessage.relatedPath, selectedMessage.id)}
                          className="font-mono font-bold text-[var(--brand)] hover:underline flex items-center gap-1"
                        >
                          <ExternalLink size={12} /> {selectedMessage.relatedEntityRef}
                        </button>
                        <span className="text-[var(--text-3)]">({selectedMessage.relatedEntityType})</span>
                        {getLiveRecordStatus(selectedMessage) && (
                          <span className="px-2 py-0.5 rounded bg-[var(--surface)] border text-[11px] font-semibold text-[var(--text-2)]" style={{ borderColor: 'var(--border)' }}>
                            Status: {getLiveRecordStatus(selectedMessage)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {selectedMessage.type === 'supplier_po_confirmation' && !selectedMessage.actionCompleted && (
                        <button
                          type="button"
                          onClick={() => completeInboxAction(selectedMessage.id, 'confirmed')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                        >
                          <CheckCircle2 size={13} /> Confirm Supplier PO
                        </button>
                      )}
                      {selectedMessage.type === 'supplier_delivery_extension' && !selectedMessage.actionCompleted && (
                        <>
                          <button
                            type="button"
                            onClick={() => completeInboxAction(selectedMessage.id, 'approved')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                          >
                            <CheckCircle2 size={13} /> Approve Extension
                          </button>
                          <button
                            type="button"
                            onClick={() => completeInboxAction(selectedMessage.id, 'rejected')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-sm"
                          >
                            <XCircle size={13} /> Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Primary Message Body */}
                {selectedMessage.channel === 'whatsapp' ? (
                  /* WhatsApp Chat Style Bubble */
                  <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-emerald-800 font-medium">
                      <span>WhatsApp Business Message</span>
                      <span>{selectedMessage.timestamp.slice(11, 16)}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-white border border-emerald-200 text-xs text-slate-800 shadow-sm whitespace-pre-line leading-relaxed">
                      {selectedMessage.body}
                    </div>
                  </div>
                ) : (
                  /* Email Body */
                  <div className="pt-2 text-sm text-[var(--text)] whitespace-pre-line leading-relaxed">
                    {selectedMessage.body}
                  </div>
                )}

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
                          onClick={() => showToast({ type: 'info', title: 'Attachment Preview', body: `${att.name} (${att.size}) — linked to ${selectedMessage.relatedEntityRef || 'conversation'}.` })}
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

              {/* Internal Team Notes */}
              <div className="rounded-xl border p-4 space-y-2" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text)] flex items-center gap-1.5">
                    <UserCheck size={14} className="text-blue-500" /> Internal Notes (Private to Team)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      showToast({ type: 'success', title: 'Internal Note Saved', body: 'Team note updated for this thread.' });
                    }}
                    className="text-[11px] font-semibold text-[var(--brand)] hover:underline"
                  >
                    Save Notes
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={internalNoteText}
                  onChange={e => setInternalNoteText(e.target.value)}
                  placeholder="Add private operational notes for colleagues (e.g. customer delivery urgency, credit terms discussion)…"
                  className="w-full rounded-lg border p-2 text-xs outline-none bg-[var(--surface-2)] text-[var(--text)]"
                  style={{ borderColor: 'var(--border)' }}
                />
              </div>

              {/* Thread History */}
              {selectedMessage.thread && selectedMessage.thread.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-3)] px-1">
                    Thread History ({selectedMessage.thread.length})
                  </div>
                  {selectedMessage.thread.map(entry => {
                    const isWhatsApp = selectedMessage.channel === 'whatsapp';
                    return (
                      <div
                        key={entry.id}
                        className={clsx(
                          'rounded-xl border p-3.5 text-xs space-y-1',
                          isWhatsApp && entry.isOutgoing && 'ml-8 bg-emerald-50 border-emerald-200',
                          isWhatsApp && !entry.isOutgoing && 'mr-8 bg-white border-slate-200'
                        )}
                        style={!isWhatsApp ? {
                          borderColor: 'var(--border)',
                          background: entry.isOutgoing ? 'var(--surface-2)' : 'var(--surface)',
                        } : undefined}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-[var(--text)]">
                            {entry.senderName}{' '}
                            <span className="font-normal text-[var(--text-3)]">({entry.senderRoleOrOrg})</span>
                          </span>
                          <span className="text-[var(--text-3)] flex items-center gap-1">
                            {formatDisplayDateTime(entry.timestamp)}
                            {entry.isOutgoing && <CheckCheck size={13} className="text-blue-500" />}
                          </span>
                        </div>
                        <p className="text-[var(--text-2)] whitespace-pre-line leading-relaxed">{entry.body}</p>
                      </div>
                    );
                  })}
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
                    <Reply size={13} /> Reply via {selectedMessage.channel === 'whatsapp' ? 'WhatsApp Business' : 'Email'}
                  </span>
                  <span className="text-[11px] text-[var(--text-3)]">
                    Simulated response — logged to thread and audit events
                  </span>
                </div>
                <textarea
                  ref={replyRef}
                  rows={3}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder={`Compose ${selectedMessage.channel === 'whatsapp' ? 'WhatsApp' : 'email'} reply to ${selectedMessage.senderName}…`}
                  className="w-full rounded-lg border p-2.5 text-xs outline-none resize-y"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface-2)', color: 'var(--text)' }}
                />
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-[var(--text-3)]">
                    Recipient: {selectedMessage.channel === 'whatsapp' ? selectedMessage.senderPhone || '+91 98490 22334' : selectedMessage.senderEmail}
                  </span>
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className={clsx(
                      'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-40 transition-colors',
                      selectedMessage.channel === 'whatsapp' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
                    )}
                  >
                    <Send size={12} /> Send Simulated Reply
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Connected Channels Modal */}
      {showChannelsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border p-6 space-y-5 bg-[var(--surface)] text-[var(--text)] shadow-2xl" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <div>
                <h3 className="text-base font-bold">Connected Communication Channels</h3>
                <p className="text-xs text-[var(--text-3)]">Manage email and messaging ingestion channels</p>
              </div>
              <button onClick={() => setShowChannelsModal(false)} className="p-1 rounded-lg hover:bg-[var(--surface-2)]">
                <X size={16} />
              </button>
            </div>

            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed">
              <strong>Simulated Channels Disclaimer:</strong> In this prototype, channels represent simulated enterprise integrations. Ingestion operates locally from seed records and preserves internal message threads without contacting external mail or messaging servers.
            </div>

            <div className="space-y-3">
              {connectedChannels.map(ch => (
                <div
                  key={ch.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs">{ch.name}</span>
                      <span className={clsx('px-1.5 py-0.5 rounded text-[10px] font-semibold', ch.status === 'connected' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700')}>
                        {ch.status === 'connected' ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-3)]">{ch.accountIdentifier}</p>
                    <p className="text-[10px] text-[var(--text-3)]">Last synced: {formatDisplayDateTime(ch.lastSync)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      updateConnectedChannel(ch.id, {
                        status: ch.status === 'connected' ? 'disconnected' : 'connected',
                        lastSync: new Date().toISOString(),
                      });
                    }}
                    className={clsx(
                      'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
                      ch.status === 'connected' ? 'border-rose-300 text-rose-600 hover:bg-rose-50' : 'border-emerald-300 text-emerald-600 hover:bg-emerald-50'
                    )}
                  >
                    {ch.status === 'connected' ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowChannelsModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[var(--brand)]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Convert to RFQ Modal */}
      {showRfqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <form onSubmit={handleConvertRfq} className="w-full max-w-md rounded-2xl border p-6 space-y-4 bg-[var(--surface)] text-[var(--text)] shadow-2xl" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
              <div>
                <h3 className="text-base font-bold">Convert Enquiry to RFQ</h3>
                <p className="text-xs text-[var(--text-3)]">Create draft Customer RFQ from this message</p>
              </div>
              <button type="button" onClick={() => setShowRfqModal(false)} className="p-1 rounded-lg hover:bg-[var(--surface-2)]">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Customer Account</label>
                <select
                  value={rfqCustomerId}
                  onChange={e => setRfqCustomerId(e.target.value)}
                  className="w-full p-2 rounded-lg border bg-[var(--surface-2)] outline-none"
                  style={{ borderColor: 'var(--border)' }}
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.tradingName} ({c.city})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Quotation Due Date</label>
                <input
                  type="date"
                  value={rfqDueDate}
                  onChange={e => setRfqDueDate(e.target.value)}
                  className="w-full p-2 rounded-lg border bg-[var(--surface-2)] outline-none"
                  style={{ borderColor: 'var(--border)' }}
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Component / Scope Description</label>
                <input
                  type="text"
                  value={rfqPartDesc}
                  onChange={e => setRfqPartDesc(e.target.value)}
                  className="w-full p-2 rounded-lg border bg-[var(--surface-2)] outline-none"
                  style={{ borderColor: 'var(--border)' }}
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Enquiry Quantity</label>
                <input
                  type="number"
                  value={rfqQty}
                  onChange={e => setRfqQty(e.target.value)}
                  className="w-full p-2 rounded-lg border bg-[var(--surface-2)] outline-none"
                  style={{ borderColor: 'var(--border)' }}
                />
              </div>

              {selectedMessage?.attachments && selectedMessage.attachments.length > 0 && (
                <div className="p-2 rounded bg-blue-50 text-blue-900 text-[11px]">
                  📎 {selectedMessage.attachments.length} attachment(s) will be automatically linked to this RFQ.
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
              <button
                type="button"
                onClick={() => setShowRfqModal(false)}
                className="px-3.5 py-1.5 rounded-lg border text-xs font-semibold text-[var(--text-2)]"
                style={{ borderColor: 'var(--border)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700"
              >
                Create RFQ & Open
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Convert to Supplier Quote Modal */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <form onSubmit={handleConvertQuote} className="w-full max-w-md rounded-2xl border p-6 space-y-4 bg-[var(--surface)] text-[var(--text)] shadow-2xl" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
              <div>
                <h3 className="text-base font-bold">Record Supplier Quotation</h3>
                <p className="text-xs text-[var(--text-3)]">Create quotation record from supplier message</p>
              </div>
              <button type="button" onClick={() => setShowQuoteModal(false)} className="p-1 rounded-lg hover:bg-[var(--surface-2)]">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Supplier</label>
                <select
                  value={sqSupplierId}
                  onChange={e => setSqSupplierId(e.target.value)}
                  className="w-full p-2 rounded-lg border bg-[var(--surface-2)] outline-none"
                  style={{ borderColor: 'var(--border)' }}
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.tradingName} ({s.city})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Associated Purchase Requisition</label>
                <select
                  value={sqPrId}
                  onChange={e => setSqPrId(e.target.value)}
                  className="w-full p-2 rounded-lg border bg-[var(--surface-2)] outline-none"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <option value="">No PR linked (Direct)</option>
                  {purchaseReqs.map(p => (
                    <option key={p.id} value={p.id}>{p.prNumber} — {p.purpose || p.deliverToSiteName}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Quoted Rate (₹)</label>
                  <input
                    type="number"
                    value={sqUnitRate}
                    onChange={e => setSqUnitRate(e.target.value)}
                    className="w-full p-2 rounded-lg border bg-[var(--surface-2)] outline-none"
                    style={{ borderColor: 'var(--border)' }}
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Lead Time (Days)</label>
                  <input
                    type="number"
                    value={sqLeadDays}
                    onChange={e => setSqLeadDays(e.target.value)}
                    className="w-full p-2 rounded-lg border bg-[var(--surface-2)] outline-none"
                    style={{ borderColor: 'var(--border)' }}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
              <button
                type="button"
                onClick={() => setShowQuoteModal(false)}
                className="px-3.5 py-1.5 rounded-lg border text-xs font-semibold text-[var(--text-2)]"
                style={{ borderColor: 'var(--border)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700"
              >
                Record Quote & Open
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Link Record Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <form onSubmit={handleLinkRecord} className="w-full max-w-md rounded-2xl border p-6 space-y-4 bg-[var(--surface)] text-[var(--text)] shadow-2xl" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
              <div>
                <h3 className="text-base font-bold">Link BOSS Record</h3>
                <p className="text-xs text-[var(--text-3)]">Associate conversation with an existing operational record</p>
              </div>
              <button type="button" onClick={() => setShowLinkModal(false)} className="p-1 rounded-lg hover:bg-[var(--surface-2)]">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Record Type</label>
                <select
                  value={linkEntityType}
                  onChange={e => {
                    setLinkEntityType(e.target.value as any);
                    setLinkEntityId('');
                  }}
                  className="w-full p-2 rounded-lg border bg-[var(--surface-2)] outline-none"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <option value="CustomerPO">Customer PO</option>
                  <option value="CustomerRFQ">Customer RFQ</option>
                  <option value="PurchaseRequisition">Purchase Requisition</option>
                  <option value="SupplierPO">Supplier PO</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Select Record</label>
                <select
                  value={linkEntityId}
                  onChange={e => setLinkEntityId(e.target.value)}
                  className="w-full p-2 rounded-lg border bg-[var(--surface-2)] outline-none"
                  style={{ borderColor: 'var(--border)' }}
                  required
                >
                  <option value="">-- Choose record --</option>
                  {linkEntityType === 'CustomerPO' && customerPos.map(p => (
                    <option key={p.id} value={p.id}>{p.poNumber} — {p.customerName}</option>
                  ))}
                  {linkEntityType === 'CustomerRFQ' && rfqs.map(r => (
                    <option key={r.id} value={r.id}>{r.rfqNumber} — {r.customerName}</option>
                  ))}
                  {linkEntityType === 'PurchaseRequisition' && purchaseReqs.map(p => (
                    <option key={p.id} value={p.id}>{p.prNumber} — {p.purpose || p.deliverToSiteName}</option>
                  ))}
                  {linkEntityType === 'SupplierPO' && supplierPos.map(s => (
                    <option key={s.id} value={s.id}>{s.poNumber} — {s.supplierName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="px-3.5 py-1.5 rounded-lg border text-xs font-semibold text-[var(--text-2)]"
                style={{ borderColor: 'var(--border)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!linkEntityId}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-[var(--brand)] disabled:opacity-40"
              >
                Save Link
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
