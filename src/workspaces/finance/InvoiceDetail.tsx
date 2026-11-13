import React, { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, FileText, CreditCard, AlertTriangle, CheckCircle2, Ban, Edit3, Send, ShieldAlert, Plus,
  QrCode, FileCheck2
} from 'lucide-react';
import { useStore } from '../../store';
import { computeDaysOverdue, isRecordOverdue, computeGstTotals } from '../../domain/finance';
import RelatedRecordsPanel, { RelatedRecordLink } from '../../components/workflow/RelatedRecordsPanel';
import DocumentActions from '../../components/workflow/DocumentActions';
import RecordHistoryPanel from '../../components/workflow/RecordHistoryPanel';
import StatusChip from '../../components/layout/StatusChip';
import { Invoice } from '../../types';

const fmtINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const fmtDate = (d?: string) => {
  if (!d) return '—';
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? d : dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const invoices = useStore(s => s.invoices);
  const invoiceLines = useStore(s => s.invoiceLines);
  const payments = useStore(s => s.payments);
  const paymentAllocations = useStore(s => s.paymentAllocations);
  const customerPos = useStore(s => s.customerPos);
  const dispatches = useStore(s => s.dispatches);
  const customers = useStore(s => s.customers);
  const companyConfig = useStore(s => s.companyConfig);
  const currentRole = useStore(s => s.currentUser.role);
  const issueCustomerInvoice = useStore(s => s.issueCustomerInvoice);
  const updateCustomerInvoiceDraft = useStore(s => s.updateCustomerInvoiceDraft);
  const voidCustomerInvoice = useStore(s => s.voidCustomerInvoice);
  const generateEInvoiceIRN = useStore(s => s.generateEInvoiceIRN);
  const cancelEInvoiceIRN = useStore(s => s.cancelEInvoiceIRN);

  const invoice = invoices.find(i => i.id === id);

  const [editingDraft, setEditingDraft] = useState(false);
  const [showCancelIrnModal, setShowCancelIrnModal] = useState(false);
  const [cancelIrnReason, setCancelIrnReason] = useState('');
  const [draftInvoiceDate, setDraftInvoiceDate] = useState('');
  const [draftDueDate, setDraftDueDate] = useState('');
  const [draftPaymentTerms, setDraftPaymentTerms] = useState('');
  const [draftTaxType, setDraftTaxType] = useState<'CGST_SGST' | 'IGST' | 'Export_LUT'>('CGST_SGST');
  const [draftFreight, setDraftFreight] = useState(0);
  const [draftOther, setDraftOther] = useState(0);
  const [draftDiscount, setDraftDiscount] = useState(0);
  const [draftNotes, setDraftNotes] = useState('');
  const [draftLineEdits, setDraftLineEdits] = useState<Array<{
    id?: string;
    poLineId?: string;
    productId?: string;
    productName: string;
    drawingNumber: string;
    hsnSac?: string;
    quantity: number;
    uom: string;
    unitPrice: number;
    discountPct?: number;
    taxPct: number;
  }>>([]);

  const [showVoidModal, setShowVoidModal] = useState(false);
  const [voidReason, setVoidReason] = useState('');
  const [showIssueConfirm, setShowIssueConfirm] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  const customer = customers.find(c => c.id === invoice?.customerId);
  const linkedPO = invoice?.poId ? customerPos.find(po => po.id === invoice.poId) : undefined;
  const linkedDispatches = useMemo(
    () => (invoice ? dispatches.filter(d => (invoice.dispatchIds || []).includes(d.id)) : []),
    [dispatches, invoice],
  );

  const lines = useMemo(
    () => (invoice ? invoiceLines.filter(l => l.invoiceId === invoice.id) : []),
    [invoiceLines, invoice],
  );

  const linkedAllocations = useMemo(() => {
    if (!invoice) return [];
    return paymentAllocations
      .filter(a => a.invoiceId === invoice.id)
      .map(a => ({
        allocation: a,
        payment: payments.find(p => p.id === a.paymentId),
      }))
      .filter(x => x.payment);
  }, [paymentAllocations, payments, invoice]);

  if (!invoice) {
    return (
      <div className="p-8 text-center">
        <p className="text-[var(--text-2)]">Customer invoice not found.</p>
        <button
          onClick={() => navigate('/finance?tab=invoices')}
          className="mt-4 text-sm text-[var(--accent)] hover:underline"
        >
          Back to Finance
        </button>
      </div>
    );
  }

  const canManageFinance = currentRole === 'owner' || currentRole === 'sales' || currentRole === 'dispatch';
  const isVoided = invoice.status === 'void' || invoice.status === 'cancelled';
  const effectiveOverdue = isRecordOverdue(invoice.status, invoice.dueDate, invoice.outstandingAmount);
  const displayStatus = effectiveOverdue && invoice.status !== 'overdue' ? 'overdue' : invoice.status;
  const daysOverdue = invoice.outstandingAmount > 0 && !isVoided ? computeDaysOverdue(invoice.dueDate) : 0;

  const openDraftEditor = () => {
    setDraftInvoiceDate(invoice.invoiceDate);
    setDraftDueDate(invoice.dueDate);
    setDraftPaymentTerms(invoice.paymentTerms || 'Net 30');
    setDraftTaxType(invoice.taxType || 'CGST_SGST');
    setDraftFreight(invoice.freightAmount || 0);
    setDraftOther(invoice.otherCharges || 0);
    setDraftDiscount(invoice.discountAmount || 0);
    setDraftNotes(invoice.notes || '');
    setDraftLineEdits(lines.map(l => ({
      id: l.id,
      poLineId: l.poLineId,
      productId: l.productId,
      productName: l.productName,
      drawingNumber: l.drawingNumber,
      hsnSac: l.hsnSac,
      quantity: l.quantity,
      uom: l.uom,
      unitPrice: l.unitPrice,
      discountPct: l.discountPct || 0,
      taxPct: l.taxPct,
    })));
    setEditingDraft(true);
    setFeedback(null);
  };

  const handleSaveDraft = () => {
    const res = updateCustomerInvoiceDraft(invoice.id, {
      invoiceDate: draftInvoiceDate,
      dueDate: draftDueDate,
      paymentTerms: draftPaymentTerms,
      taxType: draftTaxType,
      freightAmount: draftFreight,
      otherCharges: draftOther,
      discountAmount: draftDiscount,
      notes: draftNotes,
      lines: draftLineEdits,
    });
    if (res.ok) {
      setEditingDraft(false);
      setFeedback({ type: 'ok', msg: 'Draft invoice updated and audit history recorded.' });
    } else {
      setFeedback({ type: 'err', msg: res.error || 'Could not update draft.' });
    }
  };

  const handleIssue = () => {
    const res = issueCustomerInvoice(invoice.id);
    if (res.ok) {
      setFeedback({ type: 'ok', msg: 'Invoice issued (Prototype Simulation). GST tax totals finalized and AR updated.' });
    } else {
      setFeedback({ type: 'err', msg: res.error || 'Failed to issue invoice.' });
    }
  };

  const handleVoid = () => {
    if (!voidReason.trim()) return;
    const res = voidCustomerInvoice(invoice.id, voidReason.trim());
    if (res.ok) {
      setShowVoidModal(false);
      setVoidReason('');
      setFeedback({ type: 'ok', msg: 'Invoice voided with mandatory audit reason.' });
    } else {
      setFeedback({ type: 'err', msg: res.error || 'Cannot void invoice.' });
    }
  };

  const draftPreviewTotals = editingDraft
    ? computeGstTotals({
        lines: draftLineEdits.map(l => ({ quantity: l.quantity, unitPrice: l.unitPrice, discountPct: l.discountPct, taxPct: l.taxPct })),
        freightAmount: draftFreight,
        otherCharges: draftOther,
        invoiceDiscountAmount: draftDiscount,
        taxType: draftTaxType,
      })
    : null;

  const relatedRecords: RelatedRecordLink[] = [
    ...(customer ? [{
      relationship: 'Origin' as const,
      typeLabel: 'Customer',
      reference: customer.tradingName,
      to: `/sales/customers/${customer.id}`,
      status: customer.status,
      meta: customer.gstin || customer.city,
    }] : []),
    ...(linkedPO ? [{
      relationship: 'Upstream' as const,
      typeLabel: 'Customer PO',
      reference: linkedPO.poNumber,
      to: `/sales/${linkedPO.id}`,
      status: linkedPO.status,
      meta: fmtINR(linkedPO.totalValue),
    }] : []),
    ...linkedDispatches.map(d => ({
      relationship: 'Upstream' as const,
      typeLabel: 'Dispatch',
      reference: d.dispatchNumber,
      to: `/dispatch/${d.id}`,
      status: d.status,
      meta: `${d.dispatchedQty ?? d.totalQty} units`,
    })),
    ...linkedAllocations.map(({ payment, allocation }) => ({
      relationship: 'Downstream' as const,
      typeLabel: 'Payment Receipt',
      reference: payment!.paymentNumber,
      to: `/finance/payment/${payment!.id}`,
      status: payment!.status,
      meta: `${fmtINR(allocation.allocatedAmount)} allocated`,
    })),
  ];

  const taxLabel =
    invoice.taxType === 'IGST'
      ? 'Inter-State IGST'
      : invoice.taxType === 'Export_LUT'
      ? 'Export under LUT (0% GST)'
      : 'Intra-State CGST + SGST';

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-5">
        <Link to="/finance?tab=invoices" className="inline-flex items-center gap-1.5 text-xs text-[var(--text-3)] hover:text-[var(--text-1)] mb-2">
          <ArrowLeft size={13} /> Back to Customer Invoices
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold font-mono text-[var(--text-1)]">{invoice.invoiceNumber}</h1>
              <StatusChip status={displayStatus} />
            </div>
            <p className="text-xs text-[var(--text-2)] mt-1">
              {customer?.tradingName || invoice.customerName} · {taxLabel} · Terms: {invoice.paymentTerms || customer?.paymentTerms || 'Net 30'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {invoice.status === 'draft' && canManageFinance && (
              <>
                <button
                  onClick={openDraftEditor}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text-1)] border border-[var(--border)] rounded-lg transition-colors"
                >
                  <Edit3 size={13} /> Edit Draft
                </button>
                <button
                  onClick={() => setShowIssueConfirm(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-fg)] rounded-lg transition-colors"
                >
                  <Send size={13} /> Issue Invoice
                </button>
              </>
            )}
            {!isVoided && invoice.status !== 'draft' && invoice.outstandingAmount > 0 && canManageFinance && (
              <Link
                to={`/finance/payment/new?customerId=${invoice.customerId}&invoiceId=${invoice.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-fg)] rounded-lg transition-colors"
              >
                <Plus size={13} /> Record Payment ({fmtINR(invoice.outstandingAmount)})
              </Link>
            )}
            {!isVoided && invoice.status !== 'draft' && !invoice.irn && canManageFinance && (
              <button
                onClick={() => {
                  generateEInvoiceIRN(invoice.id);
                  setFeedback({ type: 'ok', msg: 'Simulated IRP E-Invoice generated! IRN hash and Signed QR registered.' });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-sm"
              >
                <QrCode size={13} /> Generate E-Invoice (IRP)
              </button>
            )}
            {!isVoided && invoice.paidAmount === 0 && canManageFinance && (
              <button
                onClick={() => setShowVoidModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition-colors"
              >
                <Ban size={13} /> Void
              </button>
            )}
            <DocumentActions
              documentType="Tax Invoice"
              reference={invoice.invoiceNumber}
              date={fmtDate(invoice.invoiceDate)}
              partyName={customer?.tradingName || invoice.customerName}
              recipient={customer?.email}
              status={displayStatus}
              total={invoice.totalAmount}
              terms={[`Payment Terms: ${invoice.paymentTerms || 'Net 30'}`, `Tax Mode: ${taxLabel}`]}
              lines={lines.map(l => ({
                description: `${l.productName} (${l.drawingNumber})`,
                quantity: l.quantity,
                uom: l.uom,
                rate: l.unitPrice,
                amount: l.lineTotal,
              }))}
              references={[
                ...(invoice.poNumber ? [`Customer PO: ${invoice.poNumber}`] : []),
                ...(invoice.dispatchNumbers || []).map(dn => `Dispatch: ${dn}`),
              ]}
              notes={invoice.notes}
              includeBankDetails
              gstBreakup={{
                taxableSubtotal: invoice.subtotal,
                taxType: invoice.taxType,
                cgstAmount: invoice.cgstAmount,
                sgstAmount: invoice.sgstAmount,
                igstAmount: invoice.igstAmount,
                taxAmount: invoice.taxAmount,
                totalAmount: invoice.totalAmount,
              }}
            />
          </div>
        </div>
      </div>

      {/* Prototype Simulation Notice */}
      <div className="mb-4 px-3.5 py-2.5 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/25 text-xs text-[var(--text-2)] flex items-center gap-2">
        <ShieldAlert size={14} className="text-[var(--accent)] shrink-0" />
        <span>
          <strong>Prototype Simulation:</strong> GST e-Invoice filings, customer emails, and tax postings are simulated locally in EOSS. No live GSTN or ERP submission occurred.
        </span>
      </div>

      {feedback && (
        <div
          className={`mb-4 px-3.5 py-2.5 rounded-lg border text-xs flex items-center gap-2 ${
            feedback.type === 'ok'
              ? 'bg-[var(--success)]/10 border-[var(--success)]/30 text-[var(--success)]'
              : 'bg-[var(--danger)]/10 border-[var(--danger)]/30 text-[var(--danger)]'
          }`}
        >
          {feedback.type === 'ok' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
          <span>{feedback.msg}</span>
        </div>
      )}

      {isVoided && (
        <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
          <Ban size={18} className="text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-400">Invoice Voided</p>
            <p className="text-xs text-[var(--text-2)] mt-0.5">
              Reason: {invoice.voidReason || 'Voided by Finance'} {invoice.voidedAt ? `· on ${fmtDate(invoice.voidedAt)}` : ''}
            </p>
          </div>
        </div>
      )}

      {daysOverdue > 0 && !isVoided && (
        <div className="mb-5 p-3.5 rounded-xl bg-[var(--danger)]/10 border border-[var(--danger)]/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[var(--danger)] font-medium">
            <AlertTriangle size={15} />
            <span>Payment overdue by {daysOverdue} day{daysOverdue === 1 ? '' : 's'} (Due {fmtDate(invoice.dueDate)})</span>
          </div>
          {canManageFinance && (
            <Link
              to={`/finance/payment/new?customerId=${invoice.customerId}&invoiceId=${invoice.id}`}
              className="text-xs font-semibold text-[var(--danger)] hover:underline"
            >
              Record Receipt →
            </Link>
          )}
        </div>
      )}

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3.5">
          <p className="text-[11px] uppercase tracking-wider text-[var(--text-3)]">Invoice Total</p>
          <p className="text-lg font-bold text-[var(--text-1)] tabular-nums mt-1">{fmtINR(invoice.totalAmount)}</p>
          <p className="text-[11px] text-[var(--text-3)] mt-0.5">Taxable {fmtINR(invoice.subtotal)}</p>
        </div>
        <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3.5">
          <p className="text-[11px] uppercase tracking-wider text-[var(--text-3)]">Tax (GST)</p>
          <p className="text-lg font-bold text-[var(--text-1)] tabular-nums mt-1">{fmtINR(invoice.taxAmount)}</p>
          <p className="text-[11px] text-[var(--text-3)] mt-0.5">{taxLabel}</p>
        </div>
        <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3.5">
          <p className="text-[11px] uppercase tracking-wider text-[var(--text-3)]">Amount Collected</p>
          <p className="text-lg font-bold text-[var(--success)] tabular-nums mt-1">{fmtINR(invoice.paidAmount)}</p>
          <p className="text-[11px] text-[var(--text-3)] mt-0.5">{linkedAllocations.length} receipt allocation{linkedAllocations.length === 1 ? '' : 's'}</p>
        </div>
        <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3.5">
          <p className="text-[11px] uppercase tracking-wider text-[var(--text-3)]">Balance Due</p>
          <p className={`text-lg font-bold tabular-nums mt-1 ${invoice.outstandingAmount > 0 && !isVoided ? 'text-[var(--warning)]' : 'text-[var(--success)]'}`}>
            {fmtINR(invoice.outstandingAmount)}
          </p>
          <p className="text-[11px] text-[var(--text-3)] mt-0.5">Due {fmtDate(invoice.dueDate)}</p>
        </div>
      </div>

      {/* Simulated IRP E-Invoice & Signed QR Card */}
      {invoice.irn && (
        <div className="mb-6 p-4 rounded-xl border border-emerald-300 bg-emerald-50/60 text-slate-800 space-y-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-600 text-white">
                <FileCheck2 size={16} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                    GST E-Invoice Registered (Simulated IRP)
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    IRN ACTIVE
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  Ack No: <strong className="font-mono">{invoice.ackNo}</strong> · Ack Date: <strong>{invoice.ackDate}</strong>
                </p>
              </div>
            </div>

            {canManageFinance && (
              <button
                type="button"
                onClick={() => setShowCancelIrnModal(true)}
                className="px-2.5 py-1 rounded-lg border border-rose-300 text-[11px] font-semibold text-rose-700 bg-white hover:bg-rose-50"
              >
                Cancel IRN
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 border-t border-emerald-200 text-xs">
            <div className="md:col-span-3 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-900 block">
                Invoice Reference Number (IRN · 64-char Hash)
              </span>
              <p className="font-mono text-[11px] p-2 rounded bg-white border border-emerald-200 text-emerald-950 break-all select-all">
                {invoice.irn}
              </p>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded bg-white border border-emerald-200 text-center">
              <QrCode size={36} className="text-emerald-800 mb-1" />
              <span className="text-[10px] font-bold text-emerald-900">Signed QR Verified</span>
              <span className="text-[9px] text-slate-500 font-mono">B2B E-Way Ready</span>
            </div>
          </div>
        </div>
      )}

      {/* Inline Draft Editor */}
      {editingDraft && (
        <div className="mb-6 bg-[var(--surface-2)] border border-[var(--accent)]/40 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[var(--text-1)]">Edit Draft Invoice</h3>
            <button onClick={() => setEditingDraft(false)} className="text-xs text-[var(--text-3)] hover:text-[var(--text-1)]">
              Cancel
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div>
              <label className="block text-[11px] text-[var(--text-3)] mb-1">Invoice Date</label>
              <input
                type="date"
                value={draftInvoiceDate}
                onChange={e => setDraftInvoiceDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-[var(--surface-3)] border border-[var(--border)] rounded-lg text-[var(--text-1)]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[var(--text-3)] mb-1">Due Date</label>
              <input
                type="date"
                value={draftDueDate}
                onChange={e => setDraftDueDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-[var(--surface-3)] border border-[var(--border)] rounded-lg text-[var(--text-1)]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[var(--text-3)] mb-1">Payment Terms</label>
              <input
                type="text"
                value={draftPaymentTerms}
                onChange={e => setDraftPaymentTerms(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-[var(--surface-3)] border border-[var(--border)] rounded-lg text-[var(--text-1)]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[var(--text-3)] mb-1">GST Mode</label>
              <select
                value={draftTaxType}
                onChange={e => setDraftTaxType(e.target.value as NonNullable<Invoice['taxType']>)}
                className="w-full px-2.5 py-1.5 text-xs bg-[var(--surface-3)] border border-[var(--border)] rounded-lg text-[var(--text-1)]"
              >
                <option value="CGST_SGST">CGST + SGST (Intra-state)</option>
                <option value="IGST">IGST (Inter-state)</option>
                <option value="Export_LUT">Export under LUT (0%)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-3)]">Line Quantities &amp; Prices</p>
            {draftLineEdits.map((line, idx) => (
              <div key={line.id || idx} className="grid grid-cols-12 gap-2 items-center bg-[var(--surface-3)]/50 p-2 rounded-lg">
                <div className="col-span-5">
                  <p className="text-xs font-medium text-[var(--text-1)]">{line.productName}</p>
                  <p className="text-[10px] text-[var(--text-3)] font-mono">{line.drawingNumber}</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] text-[var(--text-3)]">Qty ({line.uom})</label>
                  <input
                    type="number"
                    min={1}
                    value={line.quantity}
                    onChange={e => {
                      const v = Math.max(0, Number(e.target.value) || 0);
                      setDraftLineEdits(prev => prev.map((x, i) => i === idx ? { ...x, quantity: v } : x));
                    }}
                    className="w-full px-2 py-1 text-xs bg-[var(--surface-2)] border border-[var(--border)] rounded text-[var(--text-1)] tabular-nums"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-[10px] text-[var(--text-3)]">Rate (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={line.unitPrice}
                    onChange={e => {
                      const v = Math.max(0, Number(e.target.value) || 0);
                      setDraftLineEdits(prev => prev.map((x, i) => i === idx ? { ...x, unitPrice: v } : x));
                    }}
                    className="w-full px-2 py-1 text-xs bg-[var(--surface-2)] border border-[var(--border)] rounded text-[var(--text-1)] tabular-nums"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] text-[var(--text-3)]">GST %</label>
                  <input
                    type="number"
                    min={0}
                    max={28}
                    value={line.taxPct}
                    onChange={e => {
                      const v = Math.max(0, Number(e.target.value) || 0);
                      setDraftLineEdits(prev => prev.map((x, i) => i === idx ? { ...x, taxPct: v } : x));
                    }}
                    className="w-full px-2 py-1 text-xs bg-[var(--surface-2)] border border-[var(--border)] rounded text-[var(--text-1)] tabular-nums"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <div>
              <label className="block text-[11px] text-[var(--text-3)] mb-1">Freight (₹)</label>
              <input
                type="number"
                min={0}
                value={draftFreight}
                onChange={e => setDraftFreight(Math.max(0, Number(e.target.value) || 0))}
                className="w-full px-2.5 py-1.5 text-xs bg-[var(--surface-3)] border border-[var(--border)] rounded-lg text-[var(--text-1)]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[var(--text-3)] mb-1">Other Charges (₹)</label>
              <input
                type="number"
                min={0}
                value={draftOther}
                onChange={e => setDraftOther(Math.max(0, Number(e.target.value) || 0))}
                className="w-full px-2.5 py-1.5 text-xs bg-[var(--surface-3)] border border-[var(--border)] rounded-lg text-[var(--text-1)]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[var(--text-3)] mb-1">Invoice Discount (₹)</label>
              <input
                type="number"
                min={0}
                value={draftDiscount}
                onChange={e => setDraftDiscount(Math.max(0, Number(e.target.value) || 0))}
                className="w-full px-2.5 py-1.5 text-xs bg-[var(--surface-3)] border border-[var(--border)] rounded-lg text-[var(--text-1)]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[var(--text-3)] mb-1">Updated Total</label>
              <div className="px-2.5 py-1.5 text-xs font-bold bg-[var(--surface-3)] border border-[var(--border)] rounded-lg text-[var(--accent)] tabular-nums">
                {draftPreviewTotals ? fmtINR(draftPreviewTotals.totalAmount) : '—'}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-[11px] text-[var(--text-3)] mb-1">Notes</label>
            <input
              type="text"
              value={draftNotes}
              onChange={e => setDraftNotes(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-[var(--surface-3)] border border-[var(--border)] rounded-lg text-[var(--text-1)]"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setEditingDraft(false)}
              className="px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] text-[var(--text-2)] hover:text-[var(--text-1)]"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveDraft}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-fg)]"
            >
              Save Draft Changes
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl overflow-hidden">
            {/* Parties Header */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 border-b border-[var(--border)] bg-[var(--surface-3)]/30">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-3)] mb-1">Seller (From)</p>
                <p className="text-sm font-semibold text-[var(--text-1)]">{companyConfig.companyName}</p>
                <p className="text-xs text-[var(--text-2)] mt-0.5">{companyConfig.registeredAddress}, {companyConfig.city}</p>
                <p className="text-xs font-mono text-[var(--text-3)] mt-1">GSTIN: {companyConfig.gstin}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-3)] mb-1">Billed To (Customer)</p>
                <p className="text-sm font-semibold text-[var(--text-1)]">{customer?.legalName || customer?.tradingName || invoice.customerName}</p>
                <p className="text-xs text-[var(--text-2)] mt-0.5">
                  {customer ? `${customer.city}, ${customer.state}` : 'Customer Address on file'}
                </p>
                <p className="text-xs font-mono text-[var(--text-3)] mt-1">GSTIN: {customer?.gstin || 'N/A'}</p>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-5 py-3.5 border-b border-[var(--border)] text-xs">
              <div>
                <span className="text-[var(--text-3)] block text-[11px]">Invoice Date</span>
                <span className="font-medium text-[var(--text-1)]">{fmtDate(invoice.invoiceDate)}</span>
              </div>
              <div>
                <span className="text-[var(--text-3)] block text-[11px]">Due Date</span>
                <span className="font-medium text-[var(--text-1)]">{fmtDate(invoice.dueDate)}</span>
              </div>
              <div>
                <span className="text-[var(--text-3)] block text-[11px]">Payment Terms</span>
                <span className="font-medium text-[var(--text-1)]">{invoice.paymentTerms || customer?.paymentTerms || 'Net 30'}</span>
              </div>
              <div>
                <span className="text-[var(--text-3)] block text-[11px]">Customer PO / Dispatch</span>
                <div className="flex flex-wrap gap-1.5 mt-0.5">
                  {linkedPO ? (
                    <Link to={`/sales/${linkedPO.id}`} className="text-[var(--accent)] hover:underline font-mono">
                      {linkedPO.poNumber}
                    </Link>
                  ) : (
                    <span className="text-[var(--text-2)]">{invoice.poNumber || '—'}</span>
                  )}
                  {linkedDispatches.map(d => (
                    <Link key={d.id} to={`/dispatch/${d.id}`} className="text-[var(--accent)] hover:underline font-mono">
                      ({d.dispatchNumber})
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--text-3)] text-[11px] uppercase bg-[var(--surface-3)]/20">
                    <th className="text-left px-4 py-2.5 font-medium">Item / Drawing</th>
                    <th className="text-left px-3 py-2.5 font-medium">HSN/SAC</th>
                    <th className="text-right px-3 py-2.5 font-medium">Qty</th>
                    <th className="text-right px-3 py-2.5 font-medium">Rate</th>
                    <th className="text-right px-3 py-2.5 font-medium">Tax %</th>
                    <th className="text-right px-4 py-2.5 font-medium">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {lines.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-[var(--text-3)]">
                        Consolidated invoice — Taxable {fmtINR(invoice.subtotal)} + GST {fmtINR(invoice.taxAmount)}
                      </td>
                    </tr>
                  ) : (
                    lines.map(line => (
                      <tr key={line.id}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-[var(--text-1)]">{line.productName}</p>
                          <p className="text-[11px] font-mono text-[var(--text-3)]">{line.drawingNumber}</p>
                        </td>
                        <td className="px-3 py-3 font-mono text-[var(--text-2)]">{line.hsnSac || '8481'}</td>
                        <td className="px-3 py-3 text-right tabular-nums text-[var(--text-1)]">
                          {line.quantity} {line.uom}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums text-[var(--text-2)]">{fmtINR(line.unitPrice)}</td>
                        <td className="px-3 py-3 text-right tabular-nums text-[var(--text-2)]">{line.taxPct}%</td>
                        <td className="px-4 py-3 text-right tabular-nums font-medium text-[var(--text-1)]">
                          {fmtINR(line.lineTotal)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* GST & Totals Summary */}
            <div className="p-5 border-t border-[var(--border)] bg-[var(--surface-3)]/20 flex flex-col sm:flex-row justify-between gap-4">
              <div className="text-xs text-[var(--text-2)] max-w-sm space-y-1">
                {invoice.notes && (
                  <p>
                    <span className="font-medium text-[var(--text-1)]">Notes: </span>
                    {invoice.notes}
                  </p>
                )}
              </div>
              <div className="w-full sm:w-72 space-y-1.5 text-xs">
                <div className="flex justify-between text-[var(--text-2)]">
                  <span>Taxable Subtotal</span>
                  <span className="tabular-nums">{fmtINR(invoice.subtotal)}</span>
                </div>
                {(invoice.freightAmount || 0) > 0 && (
                  <div className="flex justify-between text-[var(--text-2)]">
                    <span>Freight Charges</span>
                    <span className="tabular-nums">{fmtINR(invoice.freightAmount || 0)}</span>
                  </div>
                )}
                {(invoice.otherCharges || 0) > 0 && (
                  <div className="flex justify-between text-[var(--text-2)]">
                    <span>Other Charges</span>
                    <span className="tabular-nums">{fmtINR(invoice.otherCharges || 0)}</span>
                  </div>
                )}
                {(invoice.discountAmount || 0) > 0 && (
                  <div className="flex justify-between text-[var(--success)]">
                    <span>Discount</span>
                    <span className="tabular-nums">-{fmtINR(invoice.discountAmount || 0)}</span>
                  </div>
                )}
                {invoice.taxType === 'IGST' ? (
                  <div className="flex justify-between text-[var(--text-2)]">
                    <span>IGST</span>
                    <span className="tabular-nums">{fmtINR(invoice.igstAmount ?? invoice.taxAmount)}</span>
                  </div>
                ) : invoice.taxType === 'Export_LUT' ? (
                  <div className="flex justify-between text-[var(--text-2)]">
                    <span>GST (Export LUT)</span>
                    <span className="tabular-nums">₹0</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between text-[var(--text-2)]">
                      <span>CGST</span>
                      <span className="tabular-nums">{fmtINR(invoice.cgstAmount ?? Math.round(invoice.taxAmount / 2))}</span>
                    </div>
                    <div className="flex justify-between text-[var(--text-2)]">
                      <span>SGST</span>
                      <span className="tabular-nums">{fmtINR(invoice.sgstAmount ?? (invoice.taxAmount - Math.round(invoice.taxAmount / 2)))}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between font-bold text-sm text-[var(--text-1)] pt-2 border-t border-[var(--border)]">
                  <span>Grand Total</span>
                  <span className="tabular-nums">{fmtINR(invoice.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-[var(--success)]">
                  <span>Collected</span>
                  <span className="tabular-nums">{fmtINR(invoice.paidAmount)}</span>
                </div>
                <div className="flex justify-between font-semibold text-[var(--text-1)] pt-1 border-t border-[var(--border)]/60">
                  <span>Balance Due</span>
                  <span className="tabular-nums">{fmtINR(invoice.outstandingAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Linked Customer Payments */}
          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CreditCard size={16} className="text-[var(--accent)]" />
                <h2 className="text-sm font-semibold text-[var(--text-1)]">Payment Allocations</h2>
              </div>
              {!isVoided && invoice.status !== 'draft' && invoice.outstandingAmount > 0 && canManageFinance && (
                <Link
                  to={`/finance/payment/new?customerId=${invoice.customerId}&invoiceId=${invoice.id}`}
                  className="text-xs font-medium text-[var(--accent)] hover:underline"
                >
                  + Record Receipt
                </Link>
              )}
            </div>
            {linkedAllocations.length === 0 ? (
              <p className="text-xs text-[var(--text-3)]">No payment receipts allocated to this invoice yet.</p>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {linkedAllocations.map(({ allocation, payment }) => (
                  <div key={allocation.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <Link
                        to={`/finance/payment/${payment!.id}`}
                        className="font-mono font-semibold text-[var(--accent)] hover:underline"
                      >
                        {payment!.paymentNumber}
                      </Link>
                      <span className="text-[var(--text-3)] ml-2">
                        {fmtDate(payment!.receiptDate)} · {payment!.paymentMethod.toUpperCase()} ({payment!.transactionRef})
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusChip status={payment!.status} size="sm" />
                      <span className="font-semibold text-[var(--text-1)] tabular-nums">{fmtINR(allocation.allocatedAmount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Record-level Audit History */}
          <RecordHistoryPanel
            entityId={invoice.id}
            entityRef={invoice.invoiceNumber}
            relatedIds={linkedAllocations.map(x => x.payment!.id)}
            title="Invoice Activity & Audit Trail"
            subtitle="Drafting, edits, issuance, simulated dispatch, payment receipts, and void decisions"
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4 space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-[var(--text-1)] font-semibold mb-1">
              <FileText size={15} className="text-[var(--accent)]" />
              <span>Invoice Lifecycle</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-3)]">Status</span>
              <StatusChip status={displayStatus} size="sm" />
            </div>
            {invoice.issuedDate && (
              <div className="flex justify-between">
                <span className="text-[var(--text-3)]">Issued On</span>
                <span className="text-[var(--text-1)]">{fmtDate(invoice.issuedDate)}</span>
              </div>
            )}
            {invoice.issuedBy && (
              <div className="flex justify-between">
                <span className="text-[var(--text-3)]">Issued By</span>
                <span className="text-[var(--text-1)]">{invoice.issuedBy}</span>
              </div>
            )}
            {invoice.createdBy && (
              <div className="flex justify-between">
                <span className="text-[var(--text-3)]">Created By</span>
                <span className="text-[var(--text-1)]">{invoice.createdBy}</span>
              </div>
            )}
          </div>

          <RelatedRecordsPanel records={relatedRecords} title="Related Order-to-Cash Records" />
        </div>
      </div>

      {/* Issue Confirmation Modal */}
      {showIssueConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center gap-2 text-[var(--text-1)]">
              <Send size={17} className="text-[var(--accent)]" />
              <h3 className="text-sm font-semibold">Issue Invoice {invoice.invoiceNumber}?</h3>
            </div>
            {(() => {
              const pendingDispatches = linkedDispatches.filter(d => !['delivered', 'closed'].includes(d.status));
              return (
                <>
                  {pendingDispatches.length > 0 ? (
                    <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 space-y-1">
                      <div className="font-semibold flex items-center gap-1.5">
                        <AlertTriangle size={14} /> Linked Dispatch Not Delivered / Docs Pending
                      </div>
                      <p>
                        {pendingDispatches.map(d => `${d.dispatchNumber} (${d.status.replace(/_/g, ' ')})`).join(', ')} has not been marked Delivered.
                        Confirm if you still want to finalize and issue this invoice.
                      </p>
                    </div>
                  ) : linkedDispatches.length === 0 ? (
                    <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
                      No delivered dispatch is linked to this invoice yet. Confirm if you want to issue now.
                    </div>
                  ) : null}
                  <p className="text-xs text-[var(--text-2)]">
                    Issuing locks GST tax totals ({fmtINR(invoice.totalAmount)}) and updates open customer receivables (Prototype Simulation).
                  </p>
                </>
              );
            })()}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowIssueConfirm(false)}
                className="px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] text-[var(--text-2)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowIssueConfirm(false);
                  handleIssue();
                }}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-fg)]"
              >
                Confirm &amp; Issue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Void Confirmation Modal */}
      {showVoidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center gap-2 text-red-400">
              <Ban size={18} />
              <h3 className="text-sm font-semibold">Void Invoice {invoice.invoiceNumber}</h3>
            </div>
            <p className="text-xs text-[var(--text-2)]">
              Voiding removes this invoice from open receivables while retaining full audit history. Please provide a reason.
            </p>
            <div>
              <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Void Reason *</label>
              <textarea
                rows={3}
                value={voidReason}
                onChange={e => setVoidReason(e.target.value)}
                placeholder="e.g. Incorrect billing GSTIN / superseded by revised invoice"
                className="w-full px-3 py-2 text-xs bg-[var(--surface-3)] border border-[var(--border)] rounded-lg text-[var(--text-1)]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowVoidModal(false)}
                className="px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] text-[var(--text-2)]"
              >
                Cancel
              </button>
              <button
                onClick={handleVoid}
                disabled={!voidReason.trim()}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white"
              >
                Confirm Void
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel IRN Modal */}
      {showCancelIrnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center gap-2 text-rose-500">
              <Ban size={18} />
              <h3 className="text-sm font-semibold">Cancel E-Invoice IRN ({invoice.invoiceNumber})</h3>
            </div>
            <p className="text-xs text-[var(--text-2)]">
              Under GST rules, IRN cancellation must be reported within 24 hours. A cancellation reason is mandatory.
            </p>
            <div>
              <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Cancellation Reason *</label>
              <textarea
                rows={3}
                value={cancelIrnReason}
                onChange={e => setCancelIrnReason(e.target.value)}
                placeholder="e.g. Duplicate entry, Data entry mistake, Order cancelled by customer"
                className="w-full px-3 py-2 text-xs bg-[var(--surface-3)] border border-[var(--border)] rounded-lg text-[var(--text-1)]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCancelIrnModal(false)}
                className="px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] text-[var(--text-2)]"
              >
                Back
              </button>
              <button
                onClick={() => {
                  if (!cancelIrnReason.trim()) return;
                  cancelEInvoiceIRN(invoice.id, cancelIrnReason.trim());
                  setShowCancelIrnModal(false);
                  setFeedback({ type: 'ok', msg: 'E-Invoice IRN cancelled on simulated IRP.' });
                }}
                disabled={!cancelIrnReason.trim()}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white"
              >
                Confirm Cancel IRN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
