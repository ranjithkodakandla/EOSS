import React, { useMemo, useState } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, FilePlus, ExternalLink, ChevronRight, Ban, CheckCircle2, Layers, Factory } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';
import clsx from 'clsx';
import DocumentActions from '../../components/workflow/DocumentActions';
import WorkflowTimeline from '../../components/workflow/WorkflowTimeline';
import RelatedRecordsPanel from '../../components/workflow/RelatedRecordsPanel';
import RecordHistoryPanel from '../../components/workflow/RecordHistoryPanel';
import { useReturnNavigation } from '../../hooks/useReturnNavigation';
import { assessOrderMaterialRequirements } from '../../domain/materialFeasibility';
import OrderJourneyCard, { type JourneyStep } from '../../components/home/OrderJourneyCard';

type DetailTab = 'overview' | 'lines' | 'amendments' | 'jobs' | 'documents' | 'history';

export default function PODetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    customerPos, poLines, poAmendments, jobs, jobMaterialReqs, quotations, rfqs,
    purchaseReqs, supplierInvitations, supplierQuotations, grns, dispatches, invoices,
    payments, paymentAllocations,
    materials, lots, storeLocations, sites, supplierPos, supplierPoLines,
    currentUser, updateCustomerPo, resolvePoAmendment, assessAndAllocateCustomerPO, showToast,
  } = useStore();
  const { goBack, originUrl } = useReturnNavigation('/sales?tab=pos');
  const [allocResultMsg, setAllocResultMsg] = useState<{ status: string; message: string; prId?: string; prNumber?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [searchParams] = useSearchParams();

  const po = customerPos.find(p => p.id === id);
  if (!po) return <div className="p-6 text-sm" style={{ color: 'var(--text-2)' }}>PO not found</div>;

  const poJobs = jobs.filter(j => j.customerPoId === po.id);
  const amendments = poAmendments.filter(a => a.entityType === 'customer_po' && a.poId === po.id);
  const pendingAmendment = amendments.find(a => a.status === 'pending_approval');
  const actualLines = poLines.filter(line => line.poId === po.id);
  const displayLines = actualLines.length > 0
    ? actualLines
    : [{
        id: `scope-${po.id}`,
        drawingNumber: 'CUSTOM-SCOPE',
        revision: 'A',
        description: `${po.customerName} — Custom Order Scope (${po.lineCount} line summary)`,
        orderedQty: 1,
        uom: 'lot',
        requiredDate: '',
        rate: po.totalValue,
        value: po.totalValue,
        status: 'pending' as const,
      }];
  const quotation = quotations.find(q => q.id === po.quotationId || q.quotationNumber === po.quotationRef);
  const originatingRfq = rfqs.find(r => r.id === po.rfqId) ?? (quotation ? rfqs.find(r => r.id === quotation.rfqId) : undefined);
  const linkedJobs = jobs.filter(j => j.customerPoId === po.id || j.customerPoNumber === po.poNumber);
  const linkedReqs = jobMaterialReqs.filter(r => linkedJobs.some(j => j.id === r.jobId));
  const linkedShortagePrs = purchaseReqs.filter(p => p.sourceRefId === po.id || p.sourceRefLabel === po.poNumber || linkedJobs.some(j => j.id === p.jobId));
  const linkedSupplierInvites = supplierInvitations.filter(r => linkedShortagePrs.some(pr => pr.id === r.prId));
  const linkedSupplierQuotes = supplierQuotations.filter(q => linkedSupplierInvites.some(r => r.id === q.invitationId) || linkedShortagePrs.some(pr => pr.id === q.prId));
  const linkedSpos = supplierPos.filter(sp => linkedShortagePrs.some(pr => pr.id === sp.prId) || sp.originatingRequirementId === po.id);
  const linkedGrns = grns.filter(g => linkedSpos.some(sp => sp.id === g.spoId));
  const linkedDispatches = dispatches.filter(d => d.customerPoId === po.id || d.customerPoNumber === po.poNumber);
  const linkedInvoices = invoices.filter(i => i.poId === po.id && i.status !== 'void' && i.status !== 'cancelled');
  const linkedPaymentIds = new Set(paymentAllocations.filter(a => linkedInvoices.some(i => i.id === a.invoiceId)).map(a => a.paymentId));
  const linkedPayments = payments.filter(p => linkedPaymentIds.has(p.id) && p.status !== 'reversed');
  const [checkSiteId, setCheckSiteId] = useState(po.deliverToSiteId ?? sites[0]?.id ?? 'hyd');
  const effectiveReqInputs = useMemo(() => {
    if (linkedReqs.length > 0) {
      return linkedReqs.map(r => {
        const mat = materials.find(m => m.id === r.materialItemId);
        return {
          materialItemId: r.materialItemId,
          materialCode: mat?.itemCode,
          materialName: r.materialName,
          grade: mat?.standardGrade,
          requiredQty: r.requiredQty,
          alreadyReservedQty: r.reservedQty || 0,
          uom: r.uom,
        };
      });
    }
    return actualLines
      .map(l => {
        const mat = materials.find(m =>
          l.description.toLowerCase().includes(m.name.toLowerCase())
          || (l.description.toLowerCase().includes('pipe') && m.id === 'mat-msp')
          || (l.description.toLowerCase().includes('8mm') && m.id === 'mat-ms8')
          || (l.description.toLowerCase().includes('12mm') && m.id === 'mat-ms12')
          || (l.description.toLowerCase().includes('304l') && m.id === 'mat-ss3')
        );
        return mat ? {
          materialItemId: mat.id,
          materialCode: mat.itemCode,
          materialName: mat.name,
          grade: mat.standardGrade,
          requiredQty: l.orderedQty,
          uom: l.uom || mat.primaryUom,
        } : null;
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x));
  }, [linkedReqs, actualLines, materials]);

  const liveAvailability = useMemo(
    () =>
      effectiveReqInputs.length > 0
        ? assessOrderMaterialRequirements({
            requirements: effectiveReqInputs,
            assignedSiteId: checkSiteId,
            lots,
            storeLocations,
            sites,
            supplierPos,
            supplierPoLines,
          })
        : null,
    [effectiveReqInputs, checkSiteId, lots, storeLocations, sites, supplierPos, supplierPoLines],
  );
  const prQuantityDrift = useMemo(() => {
    if (!liveAvailability || linkedShortagePrs.length === 0) return null;
    const totalShortageNow = liveAvailability.items.reduce((s, i) => s + i.shortageQty, 0);
    const totalPrQty = linkedShortagePrs.reduce((s, pr) => s + (pr.lines?.reduce((ls, l) => ls + l.requiredQty, 0) ?? pr.totalQty ?? 0), 0);
    if (totalShortageNow > totalPrQty) {
      return `Additional shortage detected (${totalShortageNow} vs ${totalPrQty} raised in PR). Re-run availability check or amend PR.`;
    }
    return null;
  }, [liveAvailability, linkedShortagePrs]);
  const canEdit = ['owner', 'sales'].includes(currentUser.role);
  const canApprove = currentUser.role === 'owner';
  const returnTo = searchParams.get('from') || '/sales?tab=pos';

  // Build Order Journey steps from real linked records
  const journeySteps = useMemo((): JourneyStep[] => {
    const isDirectOrder = po.isDirectOrder || po.originType === 'direct_order';
    const firstJob = linkedJobs[0];
    const firstPr = linkedShortagePrs[0];
    const firstSpo = linkedSpos[0];
    const firstGrn = linkedGrns[0];
    const firstDispatch = linkedDispatches[0];
    const firstInvoice = linkedInvoices[0];
    const firstPayment = linkedPayments[0];
    const hasShortage = po.availabilityStatus === 'shortage' || po.availabilityStatus === 'partial';
    const isAllocated = po.availabilityStatus === 'allocated' || po.availabilityStatus === 'partial';

    const steps: JourneyStep[] = [];

    if (!isDirectOrder) {
      steps.push({
        id: 'rfq',
        label: 'Customer RFQ',
        status: originatingRfq ? 'completed' : 'not_applicable',
        reference: originatingRfq?.rfqNumber,
        recordPath: originatingRfq ? `/sales/rfq/${originatingRfq.id}` : undefined,
        date: originatingRfq ? new Date(originatingRfq.createdAt || originatingRfq.rfqDate || '').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : undefined,
      });
      steps.push({
        id: 'quotation',
        label: 'Customer Quotation',
        status: quotation ? 'completed' : 'not_applicable',
        reference: quotation?.quotationNumber,
        recordPath: quotation ? `/sales/quotation/${quotation.id}` : undefined,
        date: quotation ? new Date(quotation.sentDate || quotation.createdAt || '').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : undefined,
      });
    }

    steps.push({
      id: 'cpo',
      label: 'Customer PO',
      status: 'in_progress',
      reference: po.poNumber,
      date: new Date(po.acceptedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      note: `${po.customerName} · ₹${(po.totalValue / 100000).toFixed(2)}L`,
    });

    steps.push({
      id: 'material',
      label: 'Material Assessment',
      status: !po.availabilityStatus || po.availabilityStatus === 'not_assessed'
        ? 'pending'
        : isAllocated ? 'completed'
        : hasShortage ? (firstPr ? 'completed' : 'blocked')
        : 'completed',
      reference: po.availabilityStatus && po.availabilityStatus !== 'not_assessed' ? po.availabilityStatus.replace('_', ' ') : undefined,
      blocker: hasShortage && !firstPr ? 'Material shortage — Purchase Requisition not yet raised' : undefined,
      note: isAllocated ? 'Stock reserved for this order' : undefined,
    });

    steps.push({
      id: 'pr',
      label: 'Purchase Requisition',
      status: !hasShortage
        ? 'not_applicable'
        : firstPr
        ? (firstPr.status === 'approved' || firstPr.status === 'converted' ? 'completed' : 'in_progress')
        : 'pending',
      reference: firstPr?.prNumber,
      recordPath: firstPr ? `/procurement/pr/${firstPr.id}` : undefined,
      blocker: firstPr?.status === 'pending_approval' ? 'Awaiting approval' : undefined,
      note: linkedShortagePrs.length > 1 ? `${linkedShortagePrs.length} PRs raised` : undefined,
    });

    steps.push({
      id: 'spo',
      label: 'Supplier PO',
      status: !hasShortage
        ? 'not_applicable'
        : firstSpo
        ? (['received', 'complete'].includes(firstSpo.status) ? 'completed' : 'in_progress')
        : (firstPr?.status === 'approved' || firstPr?.status === 'converted' ? 'pending' : 'not_applicable'),
      reference: firstSpo?.spoNumber ?? firstSpo?.poNumber,
      recordPath: firstSpo ? `/procurement/spo/${firstSpo.id}` : undefined,
      date: firstSpo?.confirmedDate ? new Date(firstSpo.confirmedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : undefined,
      note: linkedSpos.length > 1 ? `${linkedSpos.length} Supplier POs` : undefined,
    });

    steps.push({
      id: 'grn',
      label: 'GRN & Inspection',
      status: !hasShortage
        ? 'not_applicable'
        : firstGrn
        ? 'completed'
        : (firstSpo ? 'pending' : 'not_applicable'),
      reference: firstGrn?.grnNumber,
      recordPath: firstGrn ? `/procurement?tab=grn&grn=${firstGrn.id}` : undefined,
      date: firstGrn?.receivedDate ? new Date(firstGrn.receivedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : undefined,
      note: linkedGrns.length > 1 ? `${linkedGrns.length} GRNs received` : undefined,
    });

    steps.push({
      id: 'production',
      label: 'Production Job',
      status: firstJob
        ? (firstJob.status === 'complete' ? 'completed' : firstJob.status === 'hold' ? 'blocked' : 'in_progress')
        : (isAllocated ? 'pending' : 'not_applicable'),
      reference: firstJob?.jobNumber,
      recordPath: firstJob ? `/jobs/${firstJob.id}` : undefined,
      date: firstJob?.estimatedEnd ? new Date(firstJob.estimatedEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : undefined,
      blocker: firstJob?.status === 'hold' ? `Job on hold — ${firstJob.currentStage}` : undefined,
      note: linkedJobs.length > 1 ? `${linkedJobs.length} jobs` : firstJob ? `Stage: ${firstJob.currentStage}` : undefined,
    });

    steps.push({
      id: 'dispatch',
      label: 'Dispatch',
      status: firstDispatch
        ? (['dispatched', 'delivered', 'pod_received'].includes(firstDispatch.status) ? 'completed' : 'in_progress')
        : (firstJob?.status === 'complete' ? 'pending' : 'not_applicable'),
      reference: firstDispatch?.dispatchNumber,
      recordPath: firstDispatch ? `/dispatch/${firstDispatch.id}` : undefined,
      date: firstDispatch?.dispatchDate ? new Date(firstDispatch.dispatchDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : undefined,
      note: linkedDispatches.length > 1 ? `${linkedDispatches.length} dispatches` : undefined,
    });

    steps.push({
      id: 'invoice',
      label: 'Customer Invoice',
      status: firstInvoice
        ? (['paid', 'partial'].includes(firstInvoice.status) ? 'completed' : 'in_progress')
        : (firstDispatch ? 'pending' : 'not_applicable'),
      reference: firstInvoice?.invoiceNumber,
      recordPath: firstInvoice ? `/finance/invoice/${firstInvoice.id}` : undefined,
      date: firstInvoice?.invoiceDate ? new Date(firstInvoice.invoiceDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : undefined,
      note: firstInvoice ? `₹${firstInvoice.totalAmount.toLocaleString('en-IN')}` : undefined,
    });

    steps.push({
      id: 'payment',
      label: 'Customer Payment',
      status: firstPayment
        ? (firstPayment.status === 'confirmed' ? 'completed' : 'in_progress')
        : (firstInvoice ? 'pending' : 'not_applicable'),
      reference: firstPayment?.referenceNumber ?? firstPayment?.paymentNumber,
      recordPath: firstPayment ? `/finance/payment/${firstPayment.id}` : undefined,
      blocker: firstInvoice && firstInvoice.status === 'overdue' ? `Invoice overdue — ${firstInvoice.invoiceNumber}` : undefined,
      note: firstPayment ? `₹${firstPayment.amount.toLocaleString('en-IN')}` : undefined,
    });

    return steps;
  }, [po, originatingRfq, quotation, linkedJobs, linkedShortagePrs, linkedSpos, linkedGrns, linkedDispatches, linkedInvoices, linkedPayments]);
  const canCancel = canEdit && po.status !== 'complete' && po.status !== 'cancelled' && poJobs.every(j => j.status === 'cancelled' || j.status === 'complete');
  const canAmend = canEdit && !['complete', 'cancelled'].includes(po.status) && poJobs.every(j => !['in_progress', 'complete'].includes(j.status));
  const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const TABS: { id: DetailTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'lines', label: 'Line Items' },
    { id: 'amendments', label: `Amendments${po.hasAmendment ? ' ·' : ''}` },
    { id: 'jobs', label: `Linked Jobs (${poJobs.length})` },
    { id: 'documents', label: 'Documents' },
    { id: 'history', label: 'History' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Record Header */}
      <div
        className="flex-shrink-0 px-6 py-4 border-b"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs mb-3" style={{ color: 'var(--text-3)' }}>
          <button onClick={() => goBack()} className="hover:underline" style={{ color: 'var(--brand)' }}>Sales</button>
          <ChevronRight size={12} />
          <button onClick={() => goBack()} className="hover:underline">Customer POs</button>
          <ChevronRight size={12} />
          <span style={{ color: 'var(--text)' }}>{po.poNumber}</span>
        </div>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate(returnTo)}
              className="mt-0.5 p-1.5 rounded-lg hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text-3)' }}
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold font-mono" style={{ color: 'var(--text)' }}>{po.poNumber}</h1>
                <StatusChip status={po.status} />
                {pendingAmendment && <StatusChip status="pending_approval" size="sm" />}
                {po.revision && <span className="text-xs text-[var(--text-3)]">Rev {po.revision}</span>}
              </div>
              <p className="text-sm mt-0.5 font-medium" style={{ color: 'var(--text-2)' }}>{po.customerName}</p>
            </div>
          </div>

          {/* Contextual Actions */}
          <div className="flex items-center gap-2">
            {canApprove && po.status === 'pending' && (
              <button onClick={() => { updateCustomerPo(po.id, { status: 'active' }); showToast({ type: 'success', title: 'Customer PO approved', body: `${po.poNumber} is now released for execution.` }); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-white" style={{ background: 'var(--success,#16A34A)' }}><CheckCircle2 size={14} /> Approve Customer PO</button>
            )}
            {canApprove && pendingAmendment && <><button onClick={() => resolvePoAmendment(pendingAmendment.id, 'approved', currentUser.name)} className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white" style={{ background: 'var(--success,#16A34A)' }}>Approve Amendment</button><button onClick={() => resolvePoAmendment(pendingAmendment.id, 'rejected', currentUser.name)} className="px-3 py-1.5 rounded-lg text-sm font-semibold border" style={{ borderColor: 'var(--error)', color: 'var(--error)' }}>Reject Amendment</button></>}
            {canCancel && (
              <button onClick={() => { updateCustomerPo(po.id, { status: 'cancelled' }); showToast({ type: 'success', title: 'Customer PO cancelled', body: `${po.poNumber} preserved in history.` }); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium" style={{ borderColor: 'var(--error,#DC2626)', color: 'var(--error,#DC2626)' }}><Ban size={14} /> Cancel PO</button>
            )}
            {canAmend && (
              <>
                <button
                  onClick={() => navigate(`/sales/po/${po.id}/amend`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium hover:opacity-80 transition-opacity"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
                >
                  <FilePlus size={14} /> Create Revised PO
                </button>
              </>
            )}
            <DocumentActions
              documentType="Customer PO"
              reference={po.poNumber}
              date={po.acceptedDate}
              partyName={po.customerName}
              recipient={undefined}
              status={po.status}
              total={po.totalValue}
              terms={[po.paymentTerms, po.deliveryTerms].filter(Boolean)}
              notes={po.isDirectOrder ? `Direct Order${po.directOrderReason ? `: ${po.directOrderReason}` : ''}` : po.deliveryTerms}
              lines={displayLines.map(l => ({ description: `${l.drawingNumber} — ${l.description}`, quantity: l.orderedQty, uom: l.uom, rate: l.rate, amount: l.value }))}
              references={[
                po.isDirectOrder ? 'Origin: Direct Customer Order (no RFQ/Quotation)' : '',
                po.quotationRef ? `Quotation: ${po.quotationRef}` : '',
                originatingRfq ? `Originating RFQ: ${originatingRfq.rfqNumber}` : '',
              ].filter(Boolean)}
            />
          </div>
        </div>

        <WorkflowTimeline
          steps={
            po.isDirectOrder || po.originType === 'direct_order'
              ? ['Direct Customer PO', 'Material Check', 'Production & Dispatch']
              : ['Customer RFQ', 'Quotation', 'Customer PO', 'Material Check', 'Production & Dispatch']
          }
          current={
            po.isDirectOrder || po.originType === 'direct_order'
              ? (po.availabilityStatus && po.availabilityStatus !== 'not_assessed' ? 1 : 0)
              : (po.availabilityStatus && po.availabilityStatus !== 'not_assessed' ? 3 : 2)
          }
        />

        <div className="my-4">
          <RelatedRecordsPanel
            originNote={
              po.isDirectOrder
                ? `Origin: Direct Customer Order${po.directOrderReason ? ` — ${po.directOrderReason}` : ''}`
                : po.quotationRef
                  ? `From Quotation ${po.quotationRef}${originatingRfq ? ` & RFQ ${originatingRfq.rfqNumber}` : ''}`
                  : undefined
            }
            records={[
              ...(originatingRfq ? [{ relationship: 'Upstream' as const, typeLabel: 'Customer RFQ', reference: originatingRfq.rfqNumber, to: `/sales/rfq/${originatingRfq.id}`, status: originatingRfq.status, state: { from: originUrl } }] : []),
              ...(quotation ? [{ relationship: 'Upstream' as const, typeLabel: 'Customer Quotation', reference: quotation.quotationNumber, to: `/sales/quotation/${quotation.id}`, status: quotation.status, state: { from: originUrl } }] : []),
              ...linkedJobs.map(j => ({ relationship: 'Downstream' as const, typeLabel: 'Production Job', reference: j.jobNumber, to: `/jobs/${j.id}`, status: j.status, state: { from: originUrl } })),
              ...linkedShortagePrs.map(p => ({ relationship: 'Downstream' as const, typeLabel: 'Shortage PR', reference: p.prNumber, to: `/procurement/pr/${p.id}`, status: p.status, state: { from: originUrl } })),
              ...linkedSpos.map(sp => ({ relationship: 'Downstream' as const, typeLabel: 'Supplier PO', reference: sp.spoNumber || sp.poNumber, to: `/procurement/spo/${sp.id}`, status: sp.status, state: { from: originUrl } })),
              ...linkedDispatches.map(d => ({ relationship: 'Downstream' as const, typeLabel: 'Dispatch', reference: d.dispatchNumber, to: `/dispatch/${d.id}`, status: d.status, state: { from: originUrl } })),
              ...linkedInvoices.map(inv => ({ relationship: 'Downstream' as const, typeLabel: 'Customer Invoice', reference: inv.invoiceNumber, to: `/finance/invoice/${inv.id}`, status: inv.status, meta: `₹${inv.totalAmount.toLocaleString('en-IN')}`, state: { from: originUrl } })),
            ]}
          />
        </div>

        {/* Material Availability Check & Auto-Procurement Card */}
        <div className="rounded-xl border p-4 mb-4 space-y-3" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-sm text-[var(--text)] flex items-center gap-2">
                <Layers size={15} className="text-[var(--brand)]" />
                Material Availability Check & Allocation
                {po.availabilityStatus && <StatusChip status={po.availabilityStatus} size="sm" />}
              </h3>
              <p className="text-xs text-[var(--text-3)] mt-0.5">
                Checks eligible unreserved inventory at fulfilling site (excluding QC hold, rejected, and reserved stock), reserves available quantity, and raises a Purchase Requisition ONLY for net shortages.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                className="eoss-input text-xs py-1.5"
                value={checkSiteId}
                onChange={e => setCheckSiteId(e.target.value)}
                aria-label="Fulfilling site for material check"
              >
                {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <button
                type="button"
                onClick={() => {
                  const res = assessAndAllocateCustomerPO(po.id, currentUser.name, { siteId: checkSiteId, jobId: linkedJobs[0]?.id });
                  if ('error' in res) {
                    showToast({ type: 'warning', title: 'Material Check Note', body: res.error });
                  } else {
                    setAllocResultMsg({
                      status: res.status,
                      message: res.message,
                      prId: res.createdPr?.id,
                      prNumber: res.createdPr?.prNumber,
                    });
                    showToast({ type: 'success', title: 'Material Check Complete', body: res.message });
                  }
                }}
                className="btn-primary text-xs inline-flex items-center gap-1.5"
              >
                <Factory size={13} /> Run Availability Check & Reserve
              </button>
            </div>
          </div>

          {allocResultMsg && (
            <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/70 text-xs flex flex-wrap items-center justify-between gap-2">
              <span className="text-blue-950 font-medium">{allocResultMsg.message}</span>
              {allocResultMsg.prId && (
                <Link
                  to={`/procurement/pr/${allocResultMsg.prId}`}
                  state={{ from: originUrl }}
                  className="px-2.5 py-1 rounded bg-blue-700 text-white font-semibold"
                >
                  Open Shortage PR {allocResultMsg.prNumber} →
                </Link>
              )}
            </div>
          )}

          {(!po.availabilityStatus || po.availabilityStatus === 'not_assessed') && !allocResultMsg && (
            <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-xs text-[var(--text-2)]">
              Status: <strong>Not assessed</strong> — click <strong>Run Availability Check &amp; Reserve</strong> to check eligible site stock and raise a PR for any net shortage.
            </div>
          )}

          {liveAvailability && liveAvailability.items.length > 0 && po.availabilityStatus && po.availabilityStatus !== 'not_assessed' && (
            <div className="overflow-x-auto border border-[var(--border)] rounded-lg">
              <table className="eoss-table">
                <thead>
                  <tr>
                    <th>Required Material</th>
                    <th className="text-right">Req. Qty</th>
                    <th className="text-right">Reserved</th>
                    <th className="text-right">Eligible Stock</th>
                    <th className="text-right">QC Hold / In Transit</th>
                    <th className="text-right">Shortage</th>
                    <th>Outcome</th>
                  </tr>
                </thead>
                <tbody>
                  {liveAvailability.items.map(item => {
                    const poReserved = linkedReqs.find(r => r.materialItemId === item.materialItemId)?.reservedQty
                      ?? (po.availabilityStatus && po.availabilityStatus !== 'not_assessed' ? item.toReserveQty : item.reservedQty);
                    return (
                    <tr key={item.materialItemId}>
                      <td>
                        <div className="font-medium text-xs text-[var(--text)]">{item.materialName}</div>
                        <div className="text-[11px] font-mono text-[var(--text-3)]">{item.materialCode ?? 'ITEM'}</div>
                      </td>
                      <td className="text-right font-mono text-xs">{item.requiredQty} {item.uom}</td>
                      <td className="text-right font-mono text-xs">{poReserved}</td>
                      <td className="text-right font-mono text-xs font-semibold">{item.eligibleAvailableQty}</td>
                      <td className="text-right font-mono text-xs text-[var(--text-3)]">{item.qcHoldQty} / {item.incomingQty}</td>
                      <td className="text-right font-mono text-xs font-semibold text-amber-700">{item.shortageQty}</td>
                      <td>
                        <StatusChip
                          status={item.outcome === 'available' ? 'ready' : item.outcome === 'partial' ? 'partial' : 'blocked'}
                          size="sm"
                        />
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {prQuantityDrift && (
            <div className="p-3 rounded-lg border border-amber-300 bg-amber-50/70 text-xs text-amber-900 font-medium">
              ⚠ Reconciliation Required: {prQuantityDrift}
            </div>
          )}

          {(linkedShortagePrs.length > 0 || linkedSpos.length > 0 || linkedGrns.length > 0) && (
            <div className="pt-2 border-t border-[var(--border)] flex flex-wrap items-center gap-3 text-xs text-[var(--text-2)]">
              <span className="font-semibold text-[var(--text)]">Shortage Procurement Progress:</span>
              {linkedShortagePrs.map(pr => (
                <Link key={pr.id} to={`/procurement/pr/${pr.id}`} className="px-2 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border)] font-mono text-[var(--brand)] hover:underline">
                  PR {pr.prNumber} ({pr.status})
                </Link>
              ))}
              {linkedSupplierInvites.length > 0 && (
                <span className="px-2 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border)]">
                  {linkedSupplierInvites.length} Supplier Invite{linkedSupplierInvites.length > 1 ? 's' : ''}
                </span>
              )}
              {linkedSupplierQuotes.length > 0 && (
                <span className="px-2 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border)]">
                  {linkedSupplierQuotes.length} Quote{linkedSupplierQuotes.length > 1 ? 's' : ''}
                </span>
              )}
              {linkedSpos.map(sp => (
                <Link key={sp.id} to={`/procurement/spo/${sp.id}`} className="px-2 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border)] font-mono text-[var(--brand)] hover:underline">
                  SPO {sp.spoNumber || sp.poNumber} ({sp.status})
                </Link>
              ))}
              {linkedGrns.map(g => (
                <Link key={g.id} to={`/procurement/grn/${g.id}`} className="px-2 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border)] font-mono text-[var(--brand)] hover:underline">
                  GRN {g.grnNumber} ({g.status})
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Value Summary Bar */}
        <div className="mt-4 flex items-center gap-6 flex-wrap">
          <SummaryBadge label="Total Value" value={`₹${(po.totalValue / 100000).toFixed(2)}L`} emphasis />
          <SummaryBadge label="Line Items" value={String(po.lineCount)} />
          <SummaryBadge label="Payment Terms" value={po.paymentTerms} />
          <SummaryBadge label="Delivery Terms" value={po.deliveryTerms} />
          <SummaryBadge label="Currency" value={po.currency} />
          {po.quotationRef && <SummaryBadge label="Quotation Ref" value={po.quotationRef} mono />}
          <SummaryBadge label="Accepted" value={fmt(po.acceptedDate)} />
        </div>
      </div>

      {/* Detail Tabs */}
      <div
        className="flex-shrink-0 flex items-center gap-0 px-6 border-b"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      >
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className="relative px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap"
            style={{ color: activeTab === t.id ? 'var(--brand)' : 'var(--text-2)' }}
          >
            {t.label}
            {activeTab === t.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full" style={{ background: 'var(--brand)' }} />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'overview' && (
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-5 max-w-7xl">
            {/* Left: PO Info */}
            <div className="lg:col-span-2 space-y-5">
              {/* Order Journey — connected lifecycle view */}
              <OrderJourneyCard steps={journeySteps} />

              <Card title="Customer & PO Information">
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <DL label="Customer" value={po.customerName} />
                  <DL label="PO Number" value={po.poNumber} mono />
                  <DL label="Accepted Date" value={fmt(po.acceptedDate)} />
                  <DL label="Payment Terms" value={po.paymentTerms} />
                  <DL label="Delivery Terms" value={po.deliveryTerms} />
                  <DL label="Currency" value={po.currency} />
                  {po.quotationRef && <div><dt className="text-xs" style={{ color: 'var(--text-3)' }}>Quotation Reference</dt><dd className="text-sm mt-0.5"><Link to={`/sales/quotation/${quotation?.id ?? ''}`} className="font-mono font-semibold" style={{ color: quotation ? 'var(--brand)' : 'var(--text-2)' }}>{po.quotationRef}</Link></dd></div>}
                  {originatingRfq && <div><dt className="text-xs" style={{ color: 'var(--text-3)' }}>Originating RFQ</dt><dd className="text-sm mt-0.5"><Link to={`/sales/rfq/${originatingRfq.id}`} className="font-mono font-semibold" style={{ color: 'var(--brand)' }}>{originatingRfq.rfqNumber}</Link></dd></div>}
                </dl>
              </Card>

              <Card title={`Linked Jobs (${poJobs.length})`}>
                {poJobs.length === 0 ? (
                  <p className="text-sm py-4 text-center" style={{ color: 'var(--text-3)' }}>No jobs linked to this PO yet.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        {['Job #', 'Description', 'Stage', 'Status', 'Value', ''].map(h => (
                          <th key={h} className="text-left pb-2 text-xs font-semibold font-medium" style={{ color: 'var(--text-3)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {poJobs.map(j => (
                        <tr
                          key={j.id}
                          className="cursor-pointer transition-colors"
                          style={{ borderBottom: '1px solid var(--border)' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}
                          onClick={() => navigate(`/jobs/${j.id}`)}
                        >
                          <td className="py-3 font-mono text-xs font-bold" style={{ color: 'var(--brand)' }}>{j.jobNumber}</td>
                          <td className="py-3 text-xs" style={{ color: 'var(--text)' }}>{j.description}</td>
                          <td className="py-3 text-xs" style={{ color: 'var(--text-2)' }}>{j.currentStage}</td>
                          <td className="py-3"><StatusChip status={j.status} size="sm" /></td>
                          <td className="py-3 font-mono text-xs font-semibold" style={{ color: 'var(--text)' }}>₹{((j.value ?? 0) / 1000).toFixed(0)}k</td>
                          <td className="py-3 text-right"><ExternalLink size={12} style={{ color: 'var(--text-3)' }} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Card>
            </div>

            {/* Right: Summary */}
            <div className="space-y-4">
              <Card title="Financial Summary">
                <div className="text-3xl font-bold font-mono" style={{ color: 'var(--brand)' }}>
                  ₹{(po.totalValue / 100000).toFixed(2)}L
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>{po.lineCount} line items · {po.currency}</div>
                <div className="mt-4 pt-4 border-t space-y-2.5" style={{ borderColor: 'var(--border)' }}>
                  <DL label="Payment" value={po.paymentTerms} />
                  <DL label="Delivery" value={po.deliveryTerms} />
                </div>
              </Card>

              <Card title="Quick Actions">
                <div className="space-y-2">
                  {poJobs.map(j => (
                    <button
                      key={j.id}
                      onClick={() => navigate(`/jobs/${j.id}`)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg border text-left hover:opacity-80 transition-opacity text-xs"
                      style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
                    >
                      <span className="font-mono font-bold" style={{ color: 'var(--brand)' }}>{j.jobNumber}</span>
                      <ChevronRight size={12} style={{ color: 'var(--text-3)' }} />
                    </button>
                  ))}
                  {canAmend && (
                    <button
                      onClick={() => navigate(`/sales/po/${po.id}/amend`)}
                      className="w-full py-2 rounded-lg border text-xs font-medium hover:opacity-80 transition-opacity"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
                    >
                      Create Revised PO
                    </button>
                  )}
                  <Link
                    to={`/finance/invoice/new?poId=${po.id}${linkedDispatches[0] ? `&dispatchId=${linkedDispatches[0].id}` : ''}`}
                    className="w-full py-2 rounded-lg text-xs font-semibold text-white text-center block hover:opacity-90 transition-opacity"
                    style={{ background: 'var(--brand-fill)' }}
                  >
                    + Create Customer Invoice
                  </Link>
                </div>
              </Card>

              <Card title={`Dispatches, Invoices & Receipts (${linkedDispatches.length} / ${linkedInvoices.length} / ${linkedPayments.length})`}>
                <div className="space-y-2 text-xs">
                  {linkedDispatches.map(d => (
                    <Link key={d.id} to={`/dispatch/${d.id}`} className="flex items-center justify-between px-2.5 py-1.5 rounded border hover:bg-[var(--surface-2)]" style={{ borderColor: 'var(--border)' }}>
                      <span className="font-mono font-semibold text-[var(--brand)]">{d.dispatchNumber}</span>
                      <StatusChip status={d.status} size="sm" />
                    </Link>
                  ))}
                  {linkedInvoices.map(inv => (
                    <Link key={inv.id} to={`/finance/invoice/${inv.id}`} className="flex items-center justify-between px-2.5 py-1.5 rounded border hover:bg-[var(--surface-2)]" style={{ borderColor: 'var(--border)' }}>
                      <div>
                        <span className="font-mono font-semibold text-[var(--brand)]">{inv.invoiceNumber}</span>
                        <span className="ml-2 text-[var(--text-3)]">₹{inv.totalAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <StatusChip status={inv.status} size="sm" />
                    </Link>
                  ))}
                  {linkedPayments.map(pay => (
                    <Link key={pay.id} to={`/finance/payment/${pay.id}`} className="flex items-center justify-between px-2.5 py-1.5 rounded border hover:bg-[var(--surface-2)]" style={{ borderColor: 'var(--border)' }}>
                      <div>
                        <span className="font-mono font-semibold text-emerald-600">{pay.paymentNumber}</span>
                        <span className="ml-2 text-[var(--text-3)]">Receipt ₹{pay.amount.toLocaleString('en-IN')}</span>
                      </div>
                      <StatusChip status={pay.status} size="sm" />
                    </Link>
                  ))}
                  {linkedDispatches.length === 0 && linkedInvoices.length === 0 && linkedPayments.length === 0 && (
                    <p className="text-[var(--text-3)]">No dispatches, invoices, or receipts generated yet.</p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'lines' && (
          <div className="p-6 max-w-7xl">
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              <div className="px-4 py-3 border-b text-sm font-semibold" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)', color: 'var(--text)' }}>
                Line Items — {po.lineCount} lines · {po.currency}
              </div>
              <table className="w-full text-sm">
                <thead style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                  <tr>
                    {['#', 'Item / Specification', 'Qty', 'UOM', 'Rate', 'Total'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold font-medium" style={{ color: 'var(--text-3)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayLines.map((line, i) => (
                    <tr key={line.id} style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-3)' }}>{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                          {line.description}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
                          {line.drawingNumber} · Rev {line.revision}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-sm font-semibold" style={{ color: 'var(--text)' }}>
                        {line.orderedQty}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{line.uom}</td>
                      <td className="px-4 py-3 font-mono text-sm" style={{ color: 'var(--text)' }}>
                        ₹{line.rate.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm font-semibold" style={{ color: 'var(--text)' }}>
                        ₹{line.value.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                  <tr style={{ background: 'var(--surface-2)' }}>
                    <td colSpan={5} className="px-4 py-3 text-sm font-bold text-right" style={{ color: 'var(--text)' }}>Total</td>
                    <td className="px-4 py-3 font-mono text-sm font-bold" style={{ color: 'var(--brand)' }}>
                      ₹{po.totalValue.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'amendments' && (
          <div className="p-6 max-w-4xl">
            {amendments.length === 0 ? (
              <div className="rounded-xl border p-10 text-center" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                <p className="text-sm" style={{ color: 'var(--text-3)' }}>No amendments recorded for this PO.</p>
                {canAmend && (
                  <button
                    onClick={() => navigate(`/sales/po/${po.id}/amend`)}
                    className="mt-3 px-4 py-2 rounded-lg text-sm font-semibold text-white"
                    style={{ background: 'var(--brand)' }}
                  >
                    Create Revised PO
                  </button>
                )}
              </div>
            ) : <div className="space-y-3">{amendments.map(amendment => <div key={amendment.id} className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}><div className="flex items-start justify-between gap-3"><div><div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Rev {amendment.revision} · {amendment.reason.replaceAll('_', ' ')}</div><div className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>Requested by {amendment.requestedBy} · {fmt(amendment.requestedAt)}</div></div><StatusChip status={amendment.status} size="sm" /></div><p className="mt-3 text-sm" style={{ color: 'var(--text-2)' }}>{amendment.changeNote}</p><div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs"><div className="rounded-lg p-3" style={{ background: 'var(--surface-2)' }}><div className="font-semibold mb-1" style={{ color: 'var(--text-2)' }}>Previous effective version</div><div style={{ color: 'var(--text-3)' }}>PO and line snapshot preserved at submission</div></div><div className="rounded-lg p-3" style={{ background: 'var(--surface-2)' }}><div className="font-semibold mb-1" style={{ color: 'var(--text-2)' }}>{amendment.status === 'approved' ? 'Current effective revision' : 'Proposed revision'}</div><div style={{ color: 'var(--text-3)' }}>{amendment.headerChanges?.paymentTerms ? `Payment terms → ${amendment.headerChanges.paymentTerms}` : ''}{amendment.lineChanges?.quantity !== undefined ? ` · Quantity → ${amendment.lineChanges.quantity}` : ''}{amendment.lineChanges?.rate !== undefined ? ` · Rate → ₹${amendment.lineChanges.rate.toLocaleString('en-IN')}` : ''}{!amendment.headerChanges?.paymentTerms && amendment.lineChanges?.quantity === undefined && amendment.lineChanges?.rate === undefined ? 'See change description above' : ''}</div></div></div>{amendment.attachmentName && <div className="mt-2 text-xs" style={{ color: 'var(--text-3)' }}>Evidence: {amendment.attachmentName}</div>}</div>)}</div>}
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="p-6 max-w-7xl">
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
                <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Linked Jobs ({poJobs.length})</span>
              </div>
              {poJobs.length === 0 ? (
                <div className="p-10 text-center text-sm" style={{ color: 'var(--text-3)' }}>No jobs linked to this PO.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                    <tr>
                      {['Job #', 'Description', 'Current Stage', 'Status', 'Due Date', 'Value', ''].map(h => (
                        <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold font-medium" style={{ color: 'var(--text-3)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {poJobs.map(j => (
                      <tr
                        key={j.id}
                        className="cursor-pointer"
                        style={{ borderBottom: '1px solid var(--border)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}
                        onClick={() => navigate(`/jobs/${j.id}`)}
                      >
                        <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: 'var(--brand)' }}>{j.jobNumber}</td>
                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--text)' }}>{j.description}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{j.currentStage}</td>
                        <td className="px-4 py-3"><StatusChip status={j.status} size="sm" /></td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>
                          {new Date(j.plannedEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: 'var(--text)' }}>
                          ₹{((j.value ?? 0) / 1000).toFixed(0)}k
                        </td>
                        <td className="px-4 py-3 text-right">
                          <ExternalLink size={12} style={{ color: 'var(--text-3)' }} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="p-6 max-w-4xl">
            <div className="rounded-xl border p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              <p className="text-sm mb-4" style={{ color: 'var(--text-2)' }}>
                Attach the customer's purchase order document, drawings, revision notes and other supporting files.
              </p>
              <label
                className="flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-10 cursor-pointer hover:opacity-80 transition-opacity"
                style={{ borderColor: 'var(--border)' }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-3)' }}>
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                </svg>
                <span className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>Drop file, screenshot or photo here</span>
                <span className="text-xs" style={{ color: 'var(--text-3)' }}>PDF, JPG, PNG up to 20 MB</span>
                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
              </label>
              <p className="mt-3 text-xs text-center" style={{ color: 'var(--text-3)' }}>No documents attached yet.</p>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-6 max-w-5xl">
            <RecordHistoryPanel
              entityId={po.id}
              entityRef={po.poNumber}
              relatedIds={[
                ...linkedJobs.map(j => j.id),
                ...linkedShortagePrs.map(p => p.id),
                ...linkedSpos.map(s => s.id),
                ...linkedDispatches.map(d => d.id),
                ...linkedInvoices.map(i => i.id),
              ]}
              title="Customer PO Activity & Audit Trail"
              subtitle="Order creation, material availability assessment, shortage PRs, amendments, dispatches, and invoicing"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryBadge({ label, value, emphasis, mono }: { label: string; value: string; emphasis?: boolean; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-medium" style={{ color: 'var(--text-3)' }}>{label}</span>
      <span
        className={clsx('text-sm font-semibold', mono ? 'font-mono' : '')}
        style={{ color: emphasis ? 'var(--brand)' : 'var(--text)' }}
      >
        {value}
      </span>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <div className="px-4 py-3 border-b text-sm font-semibold" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)', color: 'var(--text)' }}>
        {title}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function DL({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs" style={{ color: 'var(--text-3)' }}>{label}</dt>
      <dd className={clsx('text-sm mt-0.5 font-medium', mono ? 'font-mono' : '')} style={{ color: 'var(--text)' }}>{value}</dd>
    </div>
  );
}
