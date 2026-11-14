import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, FileText, Mail, Paperclip, Send, Sparkles, Truck, Users, X,
} from 'lucide-react';
import { useStore } from '../../store';
import { matchSuppliersForPR } from '../../domain/quotationComparison';
import { useReturnNavigation } from '../../hooks/useReturnNavigation';
import StatusChip from '../../components/layout/StatusChip';
import type { PurchaseRequisition, SupplierInvitation, SupplierQuotationLine } from '../../types';

const TODAY = '2026-04-17';

function addDays(base: string, days: number): string {
  const dt = new Date(base);
  if (Number.isNaN(dt.getTime())) return base;
  dt.setDate(dt.getDate() + days);
  return dt.toISOString().slice(0, 10);
}

interface QuoteLineDraft {
  prLineId: string;
  materialItemId: string;
  materialCode?: string;
  description: string;
  grade: string;
  requestedQty: number;
  quotedQty: number;
  uom: string;
  unitPrice: number;
  included: boolean;
}

export default function SupplierRFQCreate() {
  const [searchParams] = useSearchParams();

  const prParam = searchParams.get('pr') ?? searchParams.get('prId') ?? '';
  const invitationIdParam = searchParams.get('invitationId') ?? '';
  const supplierParam = searchParams.get('supplier') ?? '';
  const modeParam = searchParams.get('mode');

  const {
    purchaseReqs, suppliers, materials, supplierPos, sites, supplierInvitations, supplierQuotations,
    sendSupplierInvitations, addSupplierQuotation,
  } = useStore();

  const existingInvitation: SupplierInvitation | undefined = useMemo(
    () => (invitationIdParam ? supplierInvitations.find(i => i.id === invitationIdParam) : undefined),
    [invitationIdParam, supplierInvitations],
  );

  const initialMode: 'invite' | 'quote' =
    existingInvitation || modeParam === 'quote' || Boolean(supplierParam && modeParam !== 'invite')
      ? 'quote'
      : 'invite';

  const [mode, setMode] = useState<'invite' | 'quote'>(initialMode);

  const eligiblePrs = useMemo(
    () => purchaseReqs.filter(p => !['closed', 'rejected', 'cancelled'].includes(p.status)),
    [purchaseReqs],
  );

  const [prId, setPrId] = useState<string>(() => {
    if (existingInvitation?.prId) return existingInvitation.prId;
    if (prParam) return prParam;
    const preferred = eligiblePrs.find(p => ['approved', 'open', 'quotation_in_progress'].includes(p.status));
    return preferred?.id ?? eligiblePrs[0]?.id ?? '';
  });

  const selectedPr: PurchaseRequisition | undefined = useMemo(
    () => purchaseReqs.find(p => p.id === prId),
    [purchaseReqs, prId],
  );

  const selectedPrLines = useMemo(() => selectedPr?.lines ?? [], [selectedPr]);

  const prEstimatedValue = useMemo(
    () => selectedPrLines.reduce((sum, l) => sum + (l.estimatedPrice ?? 0) * l.requiredQty, 0),
    [selectedPrLines],
  );

  const { goBack } = useReturnNavigation(
    selectedPr ? `/procurement/pr/${selectedPr.id}` : '/procurement?tab=quotes',
  );

  // ── INVITE MODE STATE ──────────────────────────────────────────────────────
  const matchedSuppliers = useMemo(
    () => (selectedPr ? matchSuppliersForPR(selectedPr, suppliers, materials, supplierPos, sites) : []),
    [selectedPr, suppliers, materials, supplierPos, sites],
  );

  const existingInvitationsForPr = useMemo(
    () => supplierInvitations.filter(inv => inv.prId === prId),
    [supplierInvitations, prId],
  );

  const [selectedSupplierIds, setSelectedSupplierIds] = useState<string[]>([]);
  const [selectedLineIds, setSelectedLineIds] = useState<string[]>([]);
  const [channel, setChannel] = useState<SupplierInvitation['channel']>('email');
  const [responseDueDate, setResponseDueDate] = useState<string>(addDays(TODAY, 5));
  const [inviteNotes, setInviteNotes] = useState<string>('');
  const [inviteStep, setInviteStep] = useState<'select' | 'review'>('select');
  const [showAllSuppliers, setShowAllSuppliers] = useState(false);

  useEffect(() => {
    if (!selectedPr) return;
    const lines = selectedPr.lines ?? [];
    setSelectedLineIds(lines.map(l => l.id));
    const alreadyActiveIds = new Set(
      supplierInvitations
        .filter(inv => inv.prId === selectedPr.id && !['declined', 'no_response'].includes(inv.status))
        .map(inv => inv.supplierId),
    );
    const defaultRecommended = matchedSuppliers
      .filter(m => m.recommended && !alreadyActiveIds.has(m.supplier.id))
      .slice(0, 3)
      .map(m => m.supplier.id);
    setSelectedSupplierIds(defaultRecommended);
    setInviteNotes(
      `Quotation request for ${selectedPr.prNumber} (${lines.map(l => l.materialName || l.description).slice(0, 2).join(', ')}). Delivery required by ${selectedPr.requiredBy} at ${selectedPr.deliverToSiteName ?? 'site'}.`,
    );
    setInviteStep('select');
  }, [selectedPr?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleSupplier = (id: string) => {
    setSelectedSupplierIds(prev => (prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]));
  };

  const togglePrLine = (lineId: string) => {
    setSelectedLineIds(prev => (prev.includes(lineId) ? prev.filter(id => id !== lineId) : [...prev, lineId]));
  };

  const handleConfirmSendInvitations = () => {
    if (!selectedPr || selectedSupplierIds.length === 0) return;
    const matchReasons: Record<string, string> = {};
    matchedSuppliers.forEach(m => {
      matchReasons[m.supplier.id] = m.basis.join(' · ');
    });
    sendSupplierInvitations({
      prId: selectedPr.id,
      supplierIds: selectedSupplierIds,
      channel,
      responseDueDate,
      requestedLineIds: selectedLineIds,
      notes: inviteNotes,
      matchReasons,
    });
    goBack();
  };

  // ── QUOTE RECORD MODE STATE ────────────────────────────────────────────────
  const [quoteSupplierId, setQuoteSupplierId] = useState<string>(
    existingInvitation?.supplierId ?? supplierParam ?? '',
  );
  const [quoteNumber, setQuoteNumber] = useState<string>(
    `QT-${String(supplierQuotations.length + 101)}`,
  );
  const [quoteDate, setQuoteDate] = useState<string>(TODAY);
  const [validUntil, setValidUntil] = useState<string>(addDays(TODAY, 30));
  const [leadTimeDays, setLeadTimeDays] = useState<number>(10);
  const [paymentTerms, setPaymentTerms] = useState<string>('Net 30');
  const [taxRatePct, setTaxRatePct] = useState<number>(18);
  const [deliveryCharges, setDeliveryCharges] = useState<number>(1500);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [attachmentName, setAttachmentName] = useState<string>('');
  const [quoteNotes, setQuoteNotes] = useState<string>('');
  const [quoteLines, setQuoteLines] = useState<QuoteLineDraft[]>([]);
  const [quoteErr, setQuoteErr] = useState<string>('');

  useEffect(() => {
    if (!selectedPr) {
      setQuoteLines([]);
      return;
    }
    const requestedSet =
      existingInvitation?.requestedLineIds && existingInvitation.requestedLineIds.length > 0
        ? new Set(existingInvitation.requestedLineIds)
        : null;
    setQuoteLines(
      (selectedPr.lines ?? [])
        .filter(l => !requestedSet || requestedSet.has(l.id))
        .map(l => ({
          prLineId: l.id,
          materialItemId: l.materialItemId,
          materialCode: l.materialCode,
          description: l.materialName || l.description || 'Material item',
          grade: l.grade ?? '',
          requestedQty: l.requiredQty,
          quotedQty: l.requiredQty,
          uom: l.uom,
          unitPrice: l.estimatedPrice && l.estimatedPrice > 0 ? l.estimatedPrice : 0,
          included: true,
        })),
    );
  }, [selectedPr?.id, existingInvitation?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const includedQuoteLines = useMemo(
    () => quoteLines.filter(l => l.included),
    [quoteLines],
  );

  const subtotal = useMemo(
    () => includedQuoteLines.reduce((sum, l) => sum + l.quotedQty * l.unitPrice, 0),
    [includedQuoteLines],
  );
  const discountedSubtotal = Math.max(0, subtotal - (discountAmount || 0));
  const taxAmount = Math.round((discountedSubtotal * (taxRatePct || 0)) / 100);
  const landedTotal = discountedSubtotal + taxAmount + (deliveryCharges || 0);

  const handleSaveQuote = () => {
    if (!selectedPr) { setQuoteErr('Select a Purchase Requisition first.'); return; }
    if (!quoteSupplierId) { setQuoteErr('Select the supplier who submitted this quotation.'); return; }
    if (includedQuoteLines.length === 0) { setQuoteErr('Include at least one quoted line item.'); return; }
    if (includedQuoteLines.some(l => l.unitPrice <= 0 || l.quotedQty <= 0)) {
      setQuoteErr('Every included line must have positive quantity and unit price.');
      return;
    }
    const sup = suppliers.find(s => s.id === quoteSupplierId);
    const matchingInv = existingInvitation
      ?? supplierInvitations.find(i => i.prId === selectedPr.id && i.supplierId === quoteSupplierId);

    const newQuoteId = `sq-${Date.now()}`;
    const leadDays = Number(leadTimeDays) || 10;

    const linesPayload: SupplierQuotationLine[] = includedQuoteLines.map((l, idx) => ({
      id: `sql-${Date.now()}-${idx}`,
      quoteId: newQuoteId,
      materialItemId: l.materialItemId || 'custom',
      materialCode: l.materialCode,
      materialName: l.description,
      grade: l.grade || undefined,
      quotedQty: l.quotedQty,
      uom: l.uom,
      unitPrice: l.unitPrice,
      taxPct: taxRatePct,
      lineTotal: Math.round(l.quotedQty * l.unitPrice),
      leadTimeDays: leadDays,
    }));

    addSupplierQuotation({
      id: newQuoteId,
      quoteNumber: quoteNumber.trim() || `QT-${Date.now()}`,
      prId: selectedPr.id,
      prNumber: selectedPr.prNumber,
      invitationId: matchingInv?.id,
      supplierId: quoteSupplierId,
      supplierName: sup?.tradingName ?? sup?.legalName ?? 'Supplier',
      quoteDate,
      validUntil,
      currency: 'INR',
      deliveryDays: leadDays,
      paymentTerms,
      deliveryCharges: Number(deliveryCharges) || 0,
      discountAmount: Number(discountAmount) || 0,
      taxAmount,
      attachmentName: attachmentName.trim() || undefined,
      lines: linesPayload,
      notes: quoteNotes.trim() || undefined,
      status: 'received',
      recordType: 'quotation',
    });

    goBack();
  };

  const recommendedMatches = matchedSuppliers.filter(m => m.recommended);
  const otherMatches = matchedSuppliers.filter(m => !m.recommended);
  const visibleSupplierList = showAllSuppliers
    ? matchedSuppliers
    : (recommendedMatches.length > 0 ? recommendedMatches : matchedSuppliers);

  const selectedMatchCards = matchedSuppliers.filter(m => selectedSupplierIds.includes(m.supplier.id));

  return (
    <div className="h-full flex flex-col bg-[var(--bg)]">
      {/* Top Sheet Header */}
      <div className="flex-shrink-0 flex items-center justify-between gap-4 px-6 py-4 border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => goBack()}
            className="p-2 rounded-lg border border-[var(--border)] text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]"
            title="Back"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-[var(--text)] truncate">
              {mode === 'invite' ? 'Invite Suppliers for Quotation' : 'Record Supplier Quotation'}
            </h1>
            <p className="text-xs text-[var(--text-3)] truncate">
              {selectedPr
                ? `${selectedPr.prNumber} · Deliver to ${selectedPr.deliverToSiteName ?? 'Site'} · Required by ${selectedPr.requiredBy}`
                : 'Select a Purchase Requisition to begin'}
            </p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
          <button
            type="button"
            onClick={() => setMode('invite')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              mode === 'invite'
                ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm'
                : 'text-[var(--text-2)] hover:text-[var(--text)]'
            }`}
          >
            <Users size={12} className="inline mr-1.5" />
            Invite Suppliers
          </button>
          <button
            type="button"
            onClick={() => setMode('quote')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              mode === 'quote'
                ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm'
                : 'text-[var(--text-2)] hover:text-[var(--text)]'
            }`}
          >
            <FileText size={12} className="inline mr-1.5" />
            Record Quote
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-5">
          {/* Purchase Requisition Selector */}
          <div className="eoss-card p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[var(--text-2)] mb-1">
                  Purchase Requisition *
                </label>
                <select
                  className="eoss-input w-full"
                  value={prId}
                  onChange={e => setPrId(e.target.value)}
                  disabled={Boolean(existingInvitation)}
                >
                  <option value="">Select PR…</option>
                  {eligiblePrs.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.prNumber} — {p.purpose || (p.lines ?? []).map(l => l.materialName || l.description).join(', ')} ({p.deliverToSiteName ?? 'Site'}, due {p.requiredBy})
                    </option>
                  ))}
                </select>
              </div>
              {selectedPr && (
                <div className="text-xs space-y-1 p-3 rounded-lg bg-[var(--surface-2)]">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-3)]">PR Status</span>
                    <StatusChip status={selectedPr.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-3)]">Lines / Est. Value</span>
                    <span className="font-mono font-semibold text-[var(--text)]">
                      {selectedPrLines.length} · ₹{prEstimatedValue.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {!selectedPr && (
            <div className="eoss-card p-8 text-center text-sm text-[var(--text-2)]">
              Please select an active Purchase Requisition above.
            </div>
          )}

          {/* ── INVITE MODE ──────────────────────────────────────────────────── */}
          {selectedPr && mode === 'invite' && inviteStep === 'select' && (
            <>
              <div className="eoss-card p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-bold text-[var(--text)] flex items-center gap-1.5">
                      <Sparkles size={14} className="text-[var(--brand)]" />
                      Matched & Registered Suppliers
                    </h2>
                    <p className="text-xs text-[var(--text-3)] mt-0.5">
                      Matched by material category, preferred supplier list, grade capability, and historical PO performance. Select who should receive this quotation request.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAllSuppliers(s => !s)}
                    className="btn-ghost text-xs"
                  >
                    {showAllSuppliers
                      ? `Show Matched Only (${recommendedMatches.length})`
                      : `Show All Suppliers (${suppliers.length}${otherMatches.length > 0 ? `, +${otherMatches.length} more` : ''})`}
                  </button>
                </div>

                <div className="space-y-2.5">
                  {visibleSupplierList.map(m => {
                    const checked = selectedSupplierIds.includes(m.supplier.id);
                    const priorInv = existingInvitationsForPr.find(i => i.supplierId === m.supplier.id);
                    return (
                      <label
                        key={m.supplier.id}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                          checked
                            ? 'border-[var(--brand)] bg-[var(--brand-subtle)]/40'
                            : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="mt-1 accent-[var(--brand)]"
                          checked={checked}
                          onChange={() => toggleSupplier(m.supplier.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-[var(--text)]">
                              {m.supplier.tradingName ?? m.supplier.legalName}
                            </span>
                            {m.recommended && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Recommended Match
                              </span>
                            )}
                            {priorInv && <StatusChip status={priorInv.status} />}
                            <span className="text-[11px] text-[var(--text-3)] ml-auto font-mono">
                              ★ {(m.supplier.rating ?? 4.0).toFixed(1)} · {m.supplier.paymentTerms} · {m.historicalPoCount} PO(s)
                            </span>
                          </div>
                          <div className="text-xs text-[var(--text-2)] mt-1">
                            {m.supplier.contactPerson} · {m.supplier.email} · {m.supplier.phone}
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {m.basis.map((b, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md text-[11px] bg-[var(--surface-2)] text-[var(--text-2)] border border-[var(--border)]"
                              >
                                {b}
                              </span>
                            ))}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="eoss-card p-5 space-y-4">
                <h2 className="text-sm font-bold text-[var(--text)]">Request Scope & Delivery Details</h2>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-2)] mb-2">
                    PR Line Items Included ({selectedLineIds.length}/{selectedPrLines.length})
                  </label>
                  <div className="space-y-1.5">
                    {selectedPrLines.map(line => {
                      const included = selectedLineIds.includes(line.id);
                      return (
                        <label
                          key={line.id}
                          className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)]/50 cursor-pointer text-xs"
                        >
                          <span className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={included}
                              onChange={() => togglePrLine(line.id)}
                              className="accent-[var(--brand)]"
                            />
                            <span className="font-mono text-[var(--text-3)]">{line.materialCode ?? 'ITEM'}</span>
                            <span className="font-medium text-[var(--text)]">{line.materialName || line.description}</span>
                            {line.grade && <span className="text-[var(--text-3)]">({line.grade})</span>}
                          </span>
                          <span className="font-mono font-semibold text-[var(--text)]">
                            {line.requiredQty} {line.uom}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Dispatch Channel</label>
                    <select
                      className="eoss-input w-full"
                      value={channel}
                      onChange={e => setChannel(e.target.value as SupplierInvitation['channel'])}
                    >
                      <option value="email">Email (with RFQ PDF attachment)</option>
                      <option value="portal">Supplier Portal Link</option>
                      <option value="whatsapp">WhatsApp Business Message</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Response Due Date</label>
                    <input
                      type="date"
                      className="eoss-input w-full"
                      value={responseDueDate}
                      onChange={e => setResponseDueDate(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Message / Instructions to Suppliers</label>
                    <textarea
                      className="eoss-input w-full"
                      rows={3}
                      value={inviteNotes}
                      onChange={e => setInviteNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Step 2: Review Recipients & Preview Invitation Request */}
          {selectedPr && mode === 'invite' && inviteStep === 'review' && (
            <div className="eoss-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
                    <Mail size={15} className="text-[var(--brand)]" />
                    Review Recipients Before Sending ({selectedMatchCards.length})
                  </h2>
                  <p className="text-xs text-[var(--text-3)] mt-0.5">
                    Prototype notice: No live external emails/messages are dispatched; invitation records will be created in BOSS with audit tracking.
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--surface-2)] font-medium text-[var(--text-2)]">
                  Channel: {channel.toUpperCase()} · Due {responseDueDate}
                </span>
              </div>

              <div className="space-y-2.5">
                {selectedMatchCards.map(m => (
                  <div
                    key={m.supplier.id}
                    className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/60"
                  >
                    <div>
                      <div className="text-sm font-semibold text-[var(--text)]">
                        {m.supplier.tradingName ?? m.supplier.legalName}
                      </div>
                      <div className="text-xs text-[var(--text-2)]">
                        To: {m.supplier.contactPerson} &lt;{m.supplier.email}&gt; · {m.supplier.phone}
                      </div>
                      <div className="text-[11px] text-[var(--text-3)] mt-0.5">
                        Match basis: {m.basis.join(' · ')}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleSupplier(m.supplier.id)}
                      className="p-1.5 rounded-lg text-[var(--text-3)] hover:text-[var(--danger)] hover:bg-[var(--surface)]"
                      title="Remove recipient"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/40 text-xs space-y-2">
                <div className="font-semibold text-[var(--text)]">Request Summary</div>
                <div className="text-[var(--text-2)]">
                  <strong>PR:</strong> {selectedPr.prNumber} · <strong>Items:</strong> {selectedLineIds.length} of {selectedPrLines.length} selected · <strong>Deliver to:</strong> {selectedPr.deliverToSiteName ?? 'Site'}
                </div>
                <div className="text-[var(--text-2)] whitespace-pre-wrap">{inviteNotes}</div>
              </div>
            </div>
          )}

          {/* ── RECORD QUOTE MODE ────────────────────────────────────────────── */}
          {selectedPr && mode === 'quote' && (
            <>
              <div className="eoss-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-[var(--text)]">Supplier Quotation Details</h2>
                  {existingInvitation && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                      Linked to Invitation {existingInvitation.id}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Supplier *</label>
                    <select
                      className="eoss-input w-full"
                      value={quoteSupplierId}
                      onChange={e => setQuoteSupplierId(e.target.value)}
                      disabled={Boolean(existingInvitation)}
                    >
                      <option value="">Select supplier…</option>
                      {suppliers.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.tradingName ?? s.legalName} ({s.paymentTerms})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Supplier Quote # *</label>
                    <input
                      className="eoss-input w-full font-mono"
                      value={quoteNumber}
                      onChange={e => setQuoteNumber(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Quote Date</label>
                    <input
                      type="date"
                      className="eoss-input w-full"
                      value={quoteDate}
                      onChange={e => setQuoteDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Valid Until</label>
                    <input
                      type="date"
                      className="eoss-input w-full"
                      value={validUntil}
                      onChange={e => setValidUntil(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Payment Terms</label>
                    <select
                      className="eoss-input w-full"
                      value={paymentTerms}
                      onChange={e => setPaymentTerms(e.target.value)}
                    >
                      {['Net 15', 'Net 30', 'Net 45', 'Net 60', '50% Advance / 50% Delivery', '100% Advance'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Delivery Lead Time (Days)</label>
                    <input
                      type="number"
                      min={1}
                      className="eoss-input w-full"
                      value={leadTimeDays}
                      onChange={e => setLeadTimeDays(Number(e.target.value) || 0)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-[var(--text-2)] mb-1 flex items-center gap-1">
                      <Paperclip size={11} /> Quote Document Attachment
                    </label>
                    <input
                      className="eoss-input w-full"
                      placeholder="e.g. Quote-Apex-304L.pdf"
                      value={attachmentName}
                      onChange={e => setAttachmentName(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Line Pricing Table */}
              <div className="eoss-card p-5 space-y-3">
                <h2 className="text-sm font-bold text-[var(--text)]">Quoted Line Items</h2>
                <div className="overflow-x-auto border border-[var(--border)] rounded-xl">
                  <table className="eoss-table">
                    <thead>
                      <tr>
                        <th>Inc.</th>
                        <th>Description</th>
                        <th>Quoted Grade / Spec</th>
                        <th className="text-right">Req. Qty</th>
                        <th className="text-right">Quoted Qty</th>
                        <th className="text-right">Unit Price (₹)</th>
                        <th className="text-right">Line Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quoteLines.map((line, idx) => (
                        <tr key={line.prLineId} className={!line.included ? 'opacity-50' : ''}>
                          <td>
                            <input
                              type="checkbox"
                              checked={line.included}
                              onChange={e =>
                                setQuoteLines(prev =>
                                  prev.map((l, i) => (i === idx ? { ...l, included: e.target.checked } : l)),
                                )
                              }
                            />
                          </td>
                          <td>
                            <div className="font-medium text-xs text-[var(--text)]">{line.description}</div>
                            <div className="text-[11px] font-mono text-[var(--text-3)]">{line.materialCode ?? line.uom}</div>
                          </td>
                          <td>
                            <input
                              className="eoss-input py-1 px-2 text-xs w-32"
                              value={line.grade}
                              disabled={!line.included}
                              onChange={e =>
                                setQuoteLines(prev =>
                                  prev.map((l, i) => (i === idx ? { ...l, grade: e.target.value } : l)),
                                )
                              }
                            />
                          </td>
                          <td className="text-right font-mono text-xs text-[var(--text-3)]">
                            {line.requestedQty} {line.uom}
                          </td>
                          <td className="text-right">
                            <input
                              type="number"
                              min={0}
                              step="any"
                              disabled={!line.included}
                              className="eoss-input py-1 px-2 text-xs w-24 text-right font-mono"
                              value={line.quotedQty}
                              onChange={e =>
                                setQuoteLines(prev =>
                                  prev.map((l, i) => (i === idx ? { ...l, quotedQty: Number(e.target.value) } : l)),
                                )
                              }
                            />
                          </td>
                          <td className="text-right">
                            <input
                              type="number"
                              min={0}
                              step="any"
                              disabled={!line.included}
                              className="eoss-input py-1 px-2 text-xs w-28 text-right font-mono"
                              value={line.unitPrice}
                              onChange={e =>
                                setQuoteLines(prev =>
                                  prev.map((l, i) => (i === idx ? { ...l, unitPrice: Number(e.target.value) } : l)),
                                )
                              }
                            />
                          </td>
                          <td className="text-right font-mono text-xs font-semibold">
                            {line.included ? `₹${Math.round(line.quotedQty * line.unitPrice).toLocaleString('en-IN')}` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Charges & Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-3">
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-2)] mb-1">GST / Tax (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={28}
                      className="eoss-input w-full font-mono"
                      value={taxRatePct}
                      onChange={e => setTaxRatePct(Number(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-2)] mb-1 flex items-center gap-1">
                      <Truck size={11} /> Freight / Delivery (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      className="eoss-input w-full font-mono"
                      value={deliveryCharges}
                      onChange={e => setDeliveryCharges(Number(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Discount (₹)</label>
                    <input
                      type="number"
                      min={0}
                      className="eoss-input w-full font-mono"
                      value={discountAmount}
                      onChange={e => setDiscountAmount(Number(e.target.value) || 0)}
                    />
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--surface-2)] text-right space-y-0.5">
                    <div className="text-[11px] text-[var(--text-3)]">
                      Sub ₹{subtotal.toLocaleString('en-IN')} + Tax ₹{taxAmount.toLocaleString('en-IN')} + Frt ₹{deliveryCharges.toLocaleString('en-IN')}
                    </div>
                    <div className="text-xs text-[var(--text-2)]">Landed Quote Total</div>
                    <div className="text-base font-bold font-mono text-[var(--text)]">
                      ₹{Math.round(landedTotal).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Supplier Conditions / Notes</label>
                  <textarea
                    className="eoss-input w-full"
                    rows={2}
                    placeholder="e.g. Includes EN 10204 3.1 MTC; ex-works freight extra."
                    value={quoteNotes}
                    onChange={e => setQuoteNotes(e.target.value)}
                  />
                </div>
                {quoteErr && <p className="text-xs text-[var(--danger)]">{quoteErr}</p>}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-t border-[var(--border)] bg-[var(--surface)]">
        <button
          type="button"
          onClick={() => {
            if (mode === 'invite' && inviteStep === 'review') setInviteStep('select');
            else goBack();
          }}
          className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm font-medium text-[var(--text-2)]"
        >
          {mode === 'invite' && inviteStep === 'review' ? '← Edit Selection' : 'Cancel'}
        </button>

        {mode === 'invite' && inviteStep === 'select' && (
          <button
            type="button"
            disabled={!selectedPr || selectedSupplierIds.length === 0 || selectedLineIds.length === 0}
            onClick={() => setInviteStep('review')}
            className="btn-primary text-sm inline-flex items-center gap-1.5 disabled:opacity-40"
          >
            Review Recipients ({selectedSupplierIds.length}) →
          </button>
        )}

        {mode === 'invite' && inviteStep === 'review' && (
          <button
            type="button"
            disabled={!selectedPr || selectedSupplierIds.length === 0}
            onClick={handleConfirmSendInvitations}
            className="btn-primary text-sm inline-flex items-center gap-1.5 disabled:opacity-40"
          >
            <Send size={14} /> Confirm & Send Quotation Requests ({selectedSupplierIds.length})
          </button>
        )}

        {mode === 'quote' && (
          <button
            type="button"
            disabled={!selectedPr}
            onClick={handleSaveQuote}
            className="btn-primary text-sm inline-flex items-center gap-1.5 disabled:opacity-40"
          >
            <CheckCircle2 size={14} /> Save Supplier Quotation
          </button>
        )}
      </div>
    </div>
  );
}
