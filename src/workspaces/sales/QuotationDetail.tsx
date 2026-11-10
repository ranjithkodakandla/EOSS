import React, { useState } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, FileText, Send, RotateCcw } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';
import type { CustomerPO, POLine } from '../../types';
import DocumentActions from '../../components/workflow/DocumentActions';

const fmt = (d: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const fmtMoney = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export default function QuotationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { quotations, quotationLines, rfqs, customerPos, currentUser, updateQuotation, convertQuotationToPO, updateRfq, showToast } = useStore();
  const [confirming, setConfirming] = useState<'accept' | 'convert' | null>(null);

  const quotation = quotations.find(q => q.id === id);
  if (!quotation) return (
    <div className="p-8 text-center text-sm text-[var(--text-2)]">
      Quotation not found. <Link to="/sales" className="text-[var(--brand)] underline">Back to Sales</Link>
    </div>
  );

  const lines = quotationLines.filter(l => l.quotationId === quotation.id);
  const rfq = rfqs.find(r => r.id === quotation.rfqId);
  const existingPO = customerPos.find(p => (p as any).quotationRef === quotation.quotationNumber);
  const returnTo = searchParams.get('from') || (rfq ? `/sales/rfq/${rfq.id}` : '/sales?tab=rfqs');

  const canSubmit = quotation.status === 'draft' && ['owner', 'sales'].includes(currentUser.role);
  const canAccept = quotation.status === 'submitted' && ['owner', 'sales'].includes(currentUser.role);
  const canConvert = quotation.status === 'accepted' && !existingPO && ['owner', 'sales'].includes(currentUser.role);

  const handleSubmit = () => {
    updateQuotation(quotation.id, { status: 'submitted' });
    showToast({ type: 'success', title: 'Quotation submitted', body: `${quotation.quotationNumber} sent to ${quotation.customerName}.` });
    setConfirming(null);
  };

  const handleAccept = () => {
    updateQuotation(quotation.id, { status: 'accepted' });
    if (rfq) updateRfq(rfq.id, { status: 'quoted' });
    showToast({ type: 'success', title: 'Quotation accepted', body: `${quotation.quotationNumber} marked accepted. Ready to convert to PO.` });
    setConfirming(null);
  };

  const handleConvertToPO = () => {
    const seq = Date.now().toString().slice(-4);
    const poNumber = `CPO-${seq}`;

    const po: CustomerPO = {
      id: `cpo-${seq}`,
      poNumber,
      customerId: quotation.customerId,
      customerName: quotation.customerName,
      acceptedDate: new Date().toISOString().slice(0, 10),
      paymentTerms: (rfq as any)?.paymentTerms ?? 'Net 30',
      status: 'active',
      totalValue: quotation.totalValue,
      currency: quotation.currency,
      lineCount: lines.length,
      quotationRef: quotation.quotationNumber,
      deliveryTerms: (rfq as any)?.deliveryTerms ?? '',
    };

    const poLines: POLine[] = lines.map((l, i) => ({
      id: `${po.id}-l${i + 1}`,
      poId: po.id,
      drawingNumber: l.drawingNumber,
      revision: l.drawingRevision,
      description: l.productName,
      orderedQty: l.orderedQty,
      uom: l.uom,
      requiredDate: l.requiredDate,
      rate: l.unitPrice,
      value: l.value,
      status: 'pending',
    }));

    convertQuotationToPO(quotation.id, po, poLines);
    if (rfq) updateRfq(rfq.id, { status: 'converted' });
    showToast({ type: 'success', title: 'PO Created', body: `${poNumber} raised for ${fmtMoney(quotation.totalValue)}.` });
    navigate(`/sales/po/${po.id}`);
  };

  const statusColor: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600 border-gray-200',
    submitted: 'bg-blue-50 text-blue-700 border-blue-200',
    accepted: 'bg-green-50 text-green-700 border-green-200',
    rejected: 'bg-red-50 text-red-600 border-red-200',
    expired: 'bg-orange-50 text-orange-600 border-orange-200',
  };

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(returnTo)} className="p-1.5 rounded-lg hover:bg-[var(--surface-2)]">
              <ArrowLeft size={18} className="text-[var(--text-2)]" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-[var(--brand)]">{quotation.quotationNumber}</span>
                <StatusChip status={quotation.status} size="sm" />
              </div>
              <h1 className="text-lg font-bold text-[var(--text)] mt-0.5">{quotation.customerName}</h1>
              <p className="text-xs text-[var(--text-2)]">
                Quoted {fmt(quotation.quotationDate)} · Valid until {fmt(quotation.validUntil)} · Rev {quotation.revision}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <DocumentActions documentType="Customer Quotation" reference={quotation.quotationNumber} date={quotation.quotationDate} partyName={quotation.customerName} status={quotation.status} total={quotation.totalValue} lines={lines.map(l => ({ description: l.productName, quantity: l.orderedQty, uom: l.uom, amount: l.value }))} references={[`Originating RFQ: ${quotation.rfqNumber}`, `Revision: ${quotation.revision ?? 1}`]} />
            {canSubmit && (
              <button onClick={() => setConfirming('accept')} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border" style={{ borderColor: 'var(--brand)', color: 'var(--brand)' }}>
                <Send size={14} /> Submit to Customer
              </button>
            )}
            {canAccept && (
              <button onClick={() => setConfirming('accept')} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700">
                <CheckCircle size={14} /> Mark Accepted
              </button>
            )}
            {canConvert && (
              <button onClick={() => setConfirming('convert')} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: 'var(--brand)' }}>
                <FileText size={14} /> Convert to Customer PO
              </button>
            )}
          </div>
        </div>

        {rfq && (
          <div className="mt-3 flex items-center gap-2 text-xs text-[var(--text-2)] bg-[var(--surface-2)] rounded-lg px-3 py-2 border" style={{ borderColor: 'var(--border)' }}>
            <FileText size={12} className="text-[var(--text-3)]" />
            <span>RFQ:</span>
            <Link to={`/sales/rfq/${rfq.id}`} className="font-mono font-semibold text-[var(--brand)] hover:underline">{rfq.rfqNumber}</Link>
            <span className="text-[var(--text-3)]">·</span>
            <span>{rfq.customerName}</span>
            <span className="text-[var(--text-3)]">·</span>
            <span>Required by {fmt(rfq.requiredBy)}</span>
          </div>
        )}

        {existingPO && (
          <div className="mt-2 flex items-center gap-2 text-xs bg-green-50 text-green-700 border border-green-200 rounded-lg px-3 py-2">
            <CheckCircle size={12} />
            <span>Converted to PO:</span>
            <Link to={`/sales/po/${existingPO.id}`} className="font-mono font-semibold hover:underline">{existingPO.poNumber}</Link>
          </div>
        )}
      </div>

      {/* Summary row */}
      <div className="flex-shrink-0 px-6 py-3 border-b grid grid-cols-2 md:grid-cols-4 gap-3" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
        {[
          { label: 'Total Value', value: fmtMoney(quotation.totalValue), mono: true },
          { label: 'Lines', value: `${lines.length}` },
          { label: 'Prepared By', value: quotation.owner },
          { label: 'Currency', value: quotation.currency },
        ].map((c, i) => (
          <div key={i}>
            <div className="text-[11px] text-[var(--text-3)]">{c.label}</div>
            <div className={`text-sm font-semibold text-[var(--text)] mt-0.5 ${c.mono ? 'font-mono' : ''}`}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Lines table */}
      <div className="flex-1 overflow-auto p-6">
        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border)' }}>
          <table className="eoss-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Drawing No.</th>
                <th>Rev</th>
                <th>Description</th>
                <th>Qty</th>
                <th>UOM</th>
                <th>Unit Price</th>
                <th>Line Value</th>
                <th>Required By</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l, i) => (
                <tr key={l.id}>
                  <td className="font-mono text-xs text-[var(--text-3)]">{i + 1}</td>
                  <td className="font-mono text-xs font-semibold text-[var(--brand)]">{l.drawingNumber}</td>
                  <td className="font-mono text-xs">{l.drawingRevision}</td>
                  <td className="text-sm text-[var(--text)]">{l.productName}</td>
                  <td className="font-mono text-sm text-right">{l.orderedQty}</td>
                  <td className="text-xs text-[var(--text-2)]">{l.uom}</td>
                  <td className="font-mono text-sm text-right">{fmtMoney(l.unitPrice)}</td>
                  <td className="font-mono text-sm text-right font-semibold">{fmtMoney(l.value)}</td>
                  <td className="text-sm text-[var(--text-2)]">{fmt(l.requiredDate)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={7} className="text-right text-xs font-bold text-[var(--text-2)] pr-4">Total</td>
                <td className="font-mono text-base font-bold text-[var(--text)]">{fmtMoney(quotation.totalValue)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>

        {quotation.notes && (
          <div className="mt-4 rounded-xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <div className="text-xs font-bold text-[var(--text-3)] uppercase tracking-wider mb-2">Notes</div>
            <p className="text-sm text-[var(--text-2)]">{quotation.notes}</p>
          </div>
        )}
      </div>

      {/* Confirm dialogs */}
      {confirming && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] rounded-2xl border p-6 max-w-sm w-full shadow-2xl" style={{ borderColor: 'var(--border)' }}>
            <h3 className="text-base font-bold text-[var(--text)] mb-2">
              {confirming === 'convert' ? 'Convert to Customer PO?' : 'Mark Quotation Accepted?'}
            </h3>
            <p className="text-sm text-[var(--text-2)] mb-5">
              {confirming === 'convert'
                ? `A new Customer PO will be created for ${fmtMoney(quotation.totalValue)} against ${quotation.quotationNumber}. This cannot be undone.`
                : `${quotation.quotationNumber} will be marked as accepted by ${quotation.customerName}.`}
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirming(null)} className="px-4 py-2 rounded-lg text-sm border" style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}>Cancel</button>
              <button
                onClick={confirming === 'convert' ? handleConvertToPO : (quotation.status === 'draft' ? handleSubmit : handleAccept)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ background: confirming === 'convert' ? 'var(--brand)' : '#16a34a' }}
              >
                {confirming === 'convert' ? 'Create PO' : (quotation.status === 'draft' ? 'Submit' : 'Accept')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
