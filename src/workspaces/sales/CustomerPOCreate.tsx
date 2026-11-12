import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, FileText, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../../store';
import { useReturnNavigation } from '../../hooks/useReturnNavigation';
import type { CustomerPO, POLine } from '../../types';

const TODAY = '2026-04-17';

interface DirectLine {
  id: string;
  drawingNumber: string;
  revision: string;
  description: string;
  orderedQty: number;
  uom: string;
  rate: number;
  requiredDate: string;
}

export default function CustomerPOCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuoteParam = searchParams.get('quotationId') ?? '';

  const {
    quotations, quotationLines, customerPos, customers, sites,
    convertQuotationToPO, addCustomerPO, showToast,
  } = useStore();
  const { goBack, originUrl } = useReturnNavigation('/sales?tab=pos');

  const available = quotations.filter(q => q.status === 'accepted');
  const [entryMode, setEntryMode] = useState<'quotation' | 'direct'>(
    initialQuoteParam || available.length > 0 ? 'quotation' : 'direct',
  );
  const [quotationId, setQuotationId] = useState(
    initialQuoteParam || (available[0]?.id ?? ''),
  );
  const selected = available.find(q => q.id === quotationId);
  const selectedQuoteLines = quotationLines.filter(l => l.quotationId === quotationId);

  // Direct Order state
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? '');
  const [directReason, setDirectReason] = useState('');
  const [deliverToSiteId, setDeliverToSiteId] = useState(sites[0]?.id ?? 'hyd');
  const [paymentTerms, setPaymentTerms] = useState('Net 30 days');
  const [deliveryTerms, setDeliveryTerms] = useState('Ex-Works / By Road');
  const [directLines, setDirectLines] = useState<DirectLine[]>([
    {
      id: `dl-${Date.now()}`,
      drawingNumber: 'DRG-SS304-101',
      revision: 'A',
      description: 'SS 304 Machined Flange Assembly',
      orderedQty: 25,
      uom: 'pcs',
      rate: 2400,
      requiredDate: '2026-05-05',
    },
  ]);

  const directCustomer = customers.find(c => c.id === customerId);
  const selectedSite = sites.find(s => s.id === deliverToSiteId);
  const directTotal = directLines.reduce((s, l) => s + l.orderedQty * l.rate, 0);

  const create = () => {
    const seq = String(customerPos.length + 146);
    const poId = `cpo-${Date.now()}`;

    if (entryMode === 'quotation') {
      if (!selected) return;
      const po: CustomerPO = {
        id: poId,
        poNumber: `CPO-${seq}`,
        customerId: selected.customerId,
        customerName: selected.customerName,
        acceptedDate: TODAY,
        paymentTerms: selected.paymentTerms ?? 'Net 30 days',
        status: 'pending',
        totalValue: selected.totalValue,
        currency: selected.currency,
        lineCount: selectedQuoteLines.length,
        quotationRef: selected.quotationNumber,
        quotationId: selected.id,
        rfqId: selected.rfqId,
        rfqRef: selected.rfqNumber,
        deliveryTerms: selected.deliveryTerms ?? 'Ex-Works',
        isDirectOrder: false,
        originType: 'from_quotation',
        availabilityStatus: 'not_assessed',
        deliverToSiteId,
        deliverToSiteName: selectedSite?.name ?? 'Hyderabad Plant 1',
      };
      const poLines: POLine[] = selectedQuoteLines.map((l, i) => ({
        id: `pol-${Date.now()}-${i}`,
        poId,
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
      convertQuotationToPO(selected.id, po, poLines);
      showToast({
        type: 'success',
        title: `Customer PO ${po.poNumber} created`,
        body: 'Run Material Availability Check inside the PO to reserve stock or trigger procurement.',
      });
      navigate(`/sales/po/${poId}`, { state: { from: originUrl } });
      return;
    }

    if (!directCustomer || !directReason.trim() || directLines.length === 0) return;
    const po: CustomerPO = {
      id: poId,
      poNumber: `DPO-${seq}`,
      customerId: directCustomer.id,
      customerName: directCustomer.tradingName || directCustomer.legalName,
      acceptedDate: TODAY,
      paymentTerms,
      status: 'pending',
      totalValue: Math.round(directTotal),
      currency: directCustomer.currency ?? 'INR',
      lineCount: directLines.length,
      deliveryTerms,
      isDirectOrder: true,
      originType: 'direct_order',
      directOrderReason: directReason.trim(),
      availabilityStatus: 'not_assessed',
      deliverToSiteId,
      deliverToSiteName: selectedSite?.name ?? 'Hyderabad Plant 1',
    };
    const poLines: POLine[] = directLines.map((l, i) => ({
      id: `pol-${Date.now()}-${i}`,
      poId,
      drawingNumber: l.drawingNumber,
      revision: l.revision || 'A',
      description: l.description,
      orderedQty: l.orderedQty,
      uom: l.uom,
      requiredDate: l.requiredDate,
      rate: l.rate,
      value: Math.round(l.orderedQty * l.rate),
      status: 'pending',
    }));
    addCustomerPO(po, poLines);
    showToast({
      type: 'success',
      title: `Direct Customer PO ${po.poNumber} recorded`,
      body: 'Saved as Direct Order without requiring an artificial RFQ or Quotation.',
    });
    navigate(`/sales/po/${poId}`, { state: { from: originUrl } });
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg)]">
      <div className="flex-shrink-0 flex items-center justify-between gap-3 px-6 py-4 border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => goBack()} className="p-1.5 rounded-lg hover:bg-[var(--surface-2)]">
            <ArrowLeft size={18} className="text-[var(--text-2)]" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-[var(--text)]">Add Customer PO</h1>
            <p className="text-xs text-[var(--text-2)] mt-0.5">
              Convert an accepted quotation or log a verified Direct Order without manufacturing upstream RFQs.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
          <button
            type="button"
            onClick={() => setEntryMode('quotation')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              entryMode === 'quotation' ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm' : 'text-[var(--text-2)]'
            }`}
          >
            From Accepted Quotation
          </button>
          <button
            type="button"
            onClick={() => setEntryMode('direct')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              entryMode === 'direct' ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm' : 'text-[var(--text-2)]'
            }`}
          >
            Direct Order (No RFQ)
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto space-y-5">
          {entryMode === 'quotation' ? (
            <>
              <div className="eoss-card p-5 space-y-4">
                <h2 className="text-sm font-bold text-[var(--text)]">Accepted Quotation Source</h2>
                {available.length === 0 ? (
                  <div className="rounded-lg p-4 text-sm bg-[var(--surface-2)] text-[var(--text-2)]">
                    No accepted quotations are currently pending conversion. Accept a quotation first or switch to <strong>Direct Order (No RFQ)</strong> above.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Accepted Quotation *</label>
                      <select value={quotationId} onChange={e => setQuotationId(e.target.value)} className="eoss-input w-full">
                        <option value="">Select an accepted quotation…</option>
                        {available.map(q => (
                          <option key={q.id} value={q.id}>
                            {q.quotationNumber} · {q.customerName} · ₹{q.totalValue.toLocaleString('en-IN')}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Fulfilling Site</label>
                      <select value={deliverToSiteId} onChange={e => setDeliverToSiteId(e.target.value)} className="eoss-input w-full">
                        {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {selected && (
                <div className="eoss-card overflow-hidden">
                  <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-2)] flex items-center gap-2">
                    <FileText size={15} className="text-[var(--brand)]" />
                    <span className="text-sm font-semibold text-[var(--text)]">
                      {selected.quotationNumber} · {selected.customerName}
                    </span>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <Summary label="Lines" value={String(selectedQuoteLines.length)} />
                      <Summary label="Total Value" value={`₹${selected.totalValue.toLocaleString('en-IN')}`} />
                      <Summary label="Payment Terms" value={selected.paymentTerms ?? 'Net 30 days'} />
                    </div>
                    <p className="text-xs text-[var(--text-2)]">
                      Originating RFQ {selected.rfqNumber ? `(${selected.rfqNumber})` : ''} and quotation {selected.quotationNumber} stay linked for full audit traceability.
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="eoss-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-[var(--text)]">Direct Order Header</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    Direct Order — Standalone PO
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Customer *</label>
                    <select className="eoss-input w-full" value={customerId} onChange={e => setCustomerId(e.target.value)}>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.tradingName || c.legalName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Fulfilling Site</label>
                    <select className="eoss-input w-full" value={deliverToSiteId} onChange={e => setDeliverToSiteId(e.target.value)}>
                      {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Payment Terms</label>
                    <input className="eoss-input w-full" value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Delivery Terms</label>
                    <input className="eoss-input w-full" value={deliveryTerms} onChange={e => setDeliveryTerms(e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-[var(--text-2)] mb-1">
                      Direct Order Reason / Origin Context *
                    </label>
                    <input
                      className="eoss-input w-full"
                      placeholder="e.g. Repeat blanket contract order received directly via customer email"
                      value={directReason}
                      onChange={e => setDirectReason(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="eoss-card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-[var(--text)]">Order Line Items ({directLines.length})</h2>
                  <button
                    type="button"
                    onClick={() =>
                      setDirectLines(ls => [
                        ...ls,
                        {
                          id: `dl-${Date.now()}`,
                          drawingNumber: `DRG-10${ls.length + 2}`,
                          revision: 'A',
                          description: '',
                          orderedQty: 10,
                          uom: 'pcs',
                          rate: 1500,
                          requiredDate: '2026-05-10',
                        },
                      ])
                    }
                    className="btn-ghost text-xs inline-flex items-center gap-1"
                  >
                    <Plus size={12} /> Add Line
                  </button>
                </div>
                <div className="space-y-2.5">
                  {directLines.map((l, idx) => (
                    <div key={l.id} className="grid grid-cols-2 md:grid-cols-6 gap-2 p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/40 items-end">
                      <div>
                        <label className="block text-[10px] text-[var(--text-3)] mb-0.5">Drawing #</label>
                        <input
                          className="eoss-input w-full text-xs font-mono"
                          value={l.drawingNumber}
                          onChange={e => setDirectLines(ls => ls.map((x, i) => (i === idx ? { ...x, drawingNumber: e.target.value } : x)))}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] text-[var(--text-3)] mb-0.5">Description *</label>
                        <input
                          className="eoss-input w-full text-xs"
                          value={l.description}
                          onChange={e => setDirectLines(ls => ls.map((x, i) => (i === idx ? { ...x, description: e.target.value } : x)))}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-[var(--text-3)] mb-0.5">Qty</label>
                        <input
                          type="number"
                          min={1}
                          className="eoss-input w-full text-xs font-mono"
                          value={l.orderedQty}
                          onChange={e => setDirectLines(ls => ls.map((x, i) => (i === idx ? { ...x, orderedQty: Number(e.target.value) || 1 } : x)))}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-[var(--text-3)] mb-0.5">Rate (₹)</label>
                        <input
                          type="number"
                          min={0}
                          className="eoss-input w-full text-xs font-mono"
                          value={l.rate}
                          onChange={e => setDirectLines(ls => ls.map((x, i) => (i === idx ? { ...x, rate: Number(e.target.value) || 0 } : x)))}
                        />
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-semibold text-[var(--text)]">
                          ₹{(l.orderedQty * l.rate).toLocaleString('en-IN')}
                        </span>
                        {directLines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setDirectLines(ls => ls.filter((_, i) => i !== idx))}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-right font-mono text-sm font-bold text-[var(--text)]">
                  Order Total: ₹{Math.round(directTotal).toLocaleString('en-IN')}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 flex justify-between px-6 py-4 border-t border-[var(--border)] bg-[var(--surface)]">
        <button type="button" onClick={() => goBack()} className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--text-2)]">
          Cancel
        </button>
        <button
          type="button"
          disabled={
            entryMode === 'quotation'
              ? !selected
              : !directCustomer || !directReason.trim() || directLines.some(l => !l.description.trim())
          }
          onClick={create}
          className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40"
          style={{ background: 'var(--brand-fill)' }}
        >
          <CheckCircle2 size={14} /> {entryMode === 'quotation' ? 'Create Customer PO' : 'Record Direct Customer PO'}
        </button>
      </div>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] text-[var(--text-3)]">{label}</div>
      <div className="text-sm font-semibold mt-0.5 text-[var(--text)]">{value}</div>
    </div>
  );
}
