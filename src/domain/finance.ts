import type {
  CustomerPO,
  Dispatch,
  GoodsReceipt,
  Inspection,
  Invoice,
  InvoiceLine,
  MaterialLot,
  POLine,
  SupplierBill,
  SupplierBillLine,
  SupplierPO,
  SupplierPOLine,
  ThreeWayMatchLineResult,
  ThreeWayMatchStatus,
  ThreeWayMatchSummary,
} from '../types';

export type AgeingBucket = 'current' | '1_30' | '31_60' | '60_plus';

export function computeDaysOverdue(dueDate: string, refDateStr = new Date().toISOString().slice(0, 10)): number {
  if (!dueDate) return 0;
  const dueMs = new Date(dueDate.slice(0, 10)).getTime();
  const refMs = new Date(refDateStr.slice(0, 10)).getTime();
  if (Number.isNaN(dueMs) || Number.isNaN(refMs)) return 0;
  return Math.max(0, Math.floor((refMs - dueMs) / 86400000));
}

export function computeAgeingBucket(dueDate: string, refDateStr = new Date().toISOString().slice(0, 10)): AgeingBucket {
  const days = computeDaysOverdue(dueDate, refDateStr);
  if (days <= 0) return 'current';
  if (days <= 30) return '1_30';
  if (days <= 60) return '31_60';
  return '60_plus';
}

export function isRecordOverdue(status: string, dueDate: string, outstandingAmount: number, refDateStr?: string): boolean {
  if (outstandingAmount <= 0) return false;
  if (['draft', 'paid', 'void', 'cancelled', 'rejected'].includes(status)) return false;
  if (status === 'overdue') return true;
  return computeDaysOverdue(dueDate, refDateStr) > 0;
}

/** Infer tax type using GSTIN 2-digit state codes (or country / state fallback). */
export function inferTaxTypeFromGstins(params: {
  sellerGstin?: string;
  buyerGstin?: string;
  buyerCountry?: string;
  sellerState?: string;
  buyerState?: string;
}): 'CGST_SGST' | 'IGST' | 'Export_LUT' {
  if (params.buyerCountry && params.buyerCountry.trim().toLowerCase() !== 'india') {
    return 'Export_LUT';
  }
  const sellerCode = /^\d{2}/.exec((params.sellerGstin ?? '').trim())?.[0];
  const buyerCode = /^\d{2}/.exec((params.buyerGstin ?? '').trim())?.[0];
  if (sellerCode && buyerCode) {
    return sellerCode === buyerCode ? 'CGST_SGST' : 'IGST';
  }
  if (params.sellerState && params.buyerState) {
    return params.sellerState.trim().toLowerCase() === params.buyerState.trim().toLowerCase()
      ? 'CGST_SGST'
      : 'IGST';
  }
  return 'CGST_SGST';
}

export function computeGstTotals(params: {
  lines: Array<{ quantity: number; unitPrice: number; discountPct?: number; taxPct: number }>;
  freightAmount?: number;
  otherCharges?: number;
  invoiceDiscountAmount?: number;
  taxType?: 'CGST_SGST' | 'IGST' | 'Export_LUT';
}) {
  const taxType = params.taxType ?? 'CGST_SGST';
  let lineSubtotal = 0;
  let lineTax = 0;

  const computedLines = params.lines.map((line) => {
    const gross = line.quantity * line.unitPrice;
    const disc = gross * ((line.discountPct ?? 0) / 100);
    const taxable = Math.max(0, Math.round(gross - disc));
    const effTaxPct = taxType === 'Export_LUT' ? 0 : line.taxPct;
    const tax = Math.round(taxable * (effTaxPct / 100));
    lineSubtotal += taxable;
    lineTax += tax;
    return { taxable, tax, lineTotal: taxable + tax };
  });

  const freight = Math.max(0, Math.round(params.freightAmount ?? 0));
  const other = Math.max(0, Math.round(params.otherCharges ?? 0));
  const invDiscount = Math.max(0, Math.round(params.invoiceDiscountAmount ?? 0));
  const subtotal = Math.max(0, lineSubtotal - invDiscount + freight + other);
  // Adjust tax proportionally only if invoice-level discount exists
  const extraTaxBase = freight + other - invDiscount;
  const extraTax = taxType === 'Export_LUT' ? 0 : Math.round(extraTaxBase * 0.18);
  const taxAmount = Math.max(0, lineTax + extraTax);
  const cgstAmount = taxType === 'CGST_SGST' ? Math.round(taxAmount / 2) : 0;
  const sgstAmount = taxType === 'CGST_SGST' ? taxAmount - cgstAmount : 0;
  const igstAmount = taxType === 'IGST' ? taxAmount : 0;
  const totalAmount = Math.max(0, subtotal + taxAmount);

  return {
    computedLines,
    subtotal,
    taxAmount,
    cgstAmount,
    sgstAmount,
    igstAmount,
    totalAmount,
  };
}

export interface EligiblePOLineForInvoice {
  poLineId: string;
  drawingNumber: string;
  description: string;
  orderedQty: number;
  dispatchedQty: number;
  alreadyInvoicedQty: number;
  remainingQty: number;
  uom: string;
  unitRate: number;
}

export function getEligiblePOLinesForInvoice(params: {
  po: CustomerPO;
  poLines: POLine[];
  dispatches: Dispatch[];
  invoices: Invoice[];
  invoiceLines: InvoiceLine[];
  excludeInvoiceId?: string;
}): EligiblePOLineForInvoice[] {
  const lines = params.poLines.filter(l => l.poId === params.po.id);
  const activeInvoices = params.invoices.filter(
    i => i.poId === params.po.id && !['void', 'cancelled'].includes(i.status) && i.id !== params.excludeInvoiceId
  );
  const activeInvIds = new Set(activeInvoices.map(i => i.id));
  const relevantInvLines = params.invoiceLines.filter(il => activeInvIds.has(il.invoiceId));
  const poDispatches = params.dispatches.filter(d => d.customerPoId === params.po.id || d.customerPoNumber === params.po.poNumber);
  const totalDispatchedOnPo = poDispatches.reduce((s, d) => s + (d.dispatchedQty ?? d.totalQty ?? 0), 0);

  return lines.map((l) => {
    const invoicedOnLine = relevantInvLines
      .filter(il => il.poLineId === l.id || il.drawingNumber === l.drawingNumber || il.productName === l.description)
      .reduce((s, il) => s + il.quantity, 0);
    const remainingQty = Math.max(0, l.orderedQty - invoicedOnLine);
    return {
      poLineId: l.id,
      drawingNumber: l.drawingNumber,
      description: l.description,
      orderedQty: l.orderedQty,
      dispatchedQty: lines.length === 1 ? totalDispatchedOnPo : Math.min(l.orderedQty, totalDispatchedOnPo),
      alreadyInvoicedQty: invoicedOnLine,
      remainingQty,
      uom: l.uom,
      unitRate: l.rate,
    };
  });
}

export function computeThreeWayMatch(params: {
  bill: Pick<SupplierBill, 'spoId' | 'grnIds' | 'supplierId'>;
  billLines: Array<Pick<SupplierBillLine, 'id' | 'spoLineId' | 'materialItemId' | 'description' | 'billedQty' | 'unitRate' | 'uom'>>;
  spo?: SupplierPO;
  spoLines: SupplierPOLine[];
  grns: GoodsReceipt[];
  lots: MaterialLot[];
  inspections: Inspection[];
}): ThreeWayMatchSummary {
  const { bill, billLines, spo, spoLines, grns, lots } = params;
  const linkedSpoLines = spo ? spoLines.filter(l => l.spoId === spo.id) : [];
  const linkedGrns = grns.filter(g => bill.grnIds.includes(g.id) || (spo && g.spoId === spo.id));
  const linkedGrnIds = new Set(linkedGrns.map(g => g.id));
  const linkedLots = lots.filter(l => (l.grnId && linkedGrnIds.has(l.grnId)) || (spo && l.spoId === spo.id));

  if (!spo && linkedGrns.length === 0) {
    return {
      overallStatus: 'missing_grn',
      hasMismatch: true,
      totalVarianceAmount: 0,
      summaryText: 'No Supplier PO or GRN linked — cannot complete 3-way match.',
      lines: billLines.map(bl => ({
        lineId: bl.id,
        description: bl.description,
        materialItemId: bl.materialItemId,
        poOrderedQty: 0,
        poRate: 0,
        grnReceivedQty: 0,
        qcAcceptedQty: 0,
        qcRejectedQty: 0,
        billedQty: bl.billedQty,
        billedRate: bl.unitRate,
        uom: bl.uom,
        qtyVariance: bl.billedQty,
        rateVariance: bl.unitRate,
        amountVariance: Math.round(bl.billedQty * bl.unitRate),
        status: 'missing_grn',
        message: 'Missing PO and GRN reference',
      })),
    };
  }

  let hasQtyMismatch = false;
  let hasRateMismatch = false;
  let hasQcPending = false;
  let hasMissingGrn = false;
  let totalVarianceAmount = 0;

  const lines: ThreeWayMatchLineResult[] = billLines.map((bl) => {
    const spoLine = linkedSpoLines.find(
      sl => sl.id === bl.spoLineId
        || (bl.materialItemId && sl.materialItemId === bl.materialItemId)
        || sl.materialName.toLowerCase() === bl.description.toLowerCase()
    );

    const poOrderedQty = spoLine?.orderedQty ?? 0;
    const poRate = spoLine?.rate ?? 0;

    // Aggregate GRN received and QC accepted quantities for this material
    const matchingGrnLines = linkedGrns.flatMap(g =>
      (g.lines ?? []).filter(gl =>
        (bl.materialItemId && gl.materialItemId === bl.materialItemId)
        || gl.materialName.toLowerCase() === bl.description.toLowerCase()
      )
    );
    const matchingLots = linkedLots.filter(
      lt => (bl.materialItemId && lt.materialItemId === bl.materialItemId)
        || lt.materialName.toLowerCase() === bl.description.toLowerCase()
    );

    const grnReceivedFromLines = matchingGrnLines.reduce((s, gl) => s + gl.receivedQty, 0);
    const grnReceivedQty = grnReceivedFromLines > 0
      ? grnReceivedFromLines
      : spoLine?.receivedQty ?? matchingLots.reduce((s, l) => s + l.primaryQty, 0);

    const holdLotQty = matchingLots.filter(l => l.status === 'qc_hold').reduce((s, l) => s + l.primaryQty, 0);
    const acceptedFromLots = matchingLots
      .filter(l => l.status === 'available' || l.status === 'reserved' || l.status === 'issued' || l.status === 'dispatched')
      .reduce((s, l) => s + (l.acceptedQty ?? l.primaryQty), 0);
    const rejectedFromLots = matchingLots
      .filter(l => l.status === 'scrapped' || (l.rejectedQty ?? 0) > 0)
      .reduce((s, l) => s + (l.rejectedQty ?? (l.status === 'scrapped' ? l.primaryQty : 0)), 0);

    const qcAcceptedQty = acceptedFromLots > 0
      ? acceptedFromLots
      : spoLine?.acceptedQty ?? (holdLotQty === 0 && linkedGrns.some(g => g.status === 'accepted') ? grnReceivedQty : 0);
    const qcRejectedQty = rejectedFromLots > 0 ? rejectedFromLots : (spoLine?.rejectedQty ?? 0);

    const rateVariance = poRate > 0 ? Math.round((bl.unitRate - poRate) * 100) / 100 : 0;
    const compareTargetQty = holdLotQty > 0 ? grnReceivedQty : (qcAcceptedQty > 0 ? qcAcceptedQty : grnReceivedQty);
    const qtyVariance = Math.round((bl.billedQty - compareTargetQty) * 100) / 100;
    const amountVariance = Math.round(bl.billedQty * bl.unitRate - compareTargetQty * (poRate || bl.unitRate));

    let status: ThreeWayMatchLineResult['status'] = 'matched';
    let message = 'PO, GRN/QC accepted qty, and billed rate match within tolerance.';

    if (linkedGrns.length === 0 || grnReceivedQty === 0) {
      status = 'missing_grn';
      hasMissingGrn = true;
      message = 'No goods receipt recorded for this line item yet.';
    } else if (holdLotQty > 0 && qcAcceptedQty < bl.billedQty) {
      status = 'qc_pending';
      hasQcPending = true;
      message = `${holdLotQty} ${bl.uom} still under Quality Hold — incoming inspection pending before approval.`;
    } else if (Math.abs(qtyVariance) > 0.01) {
      status = 'qty_mismatch';
      hasQtyMismatch = true;
      message = qtyVariance > 0
        ? `Billed ${bl.billedQty} ${bl.uom} exceeds QC accepted qty (${qcAcceptedQty} ${bl.uom}) by +${qtyVariance} ${bl.uom}.`
        : `Billed ${bl.billedQty} ${bl.uom} is less than QC accepted qty (${qcAcceptedQty} ${bl.uom}).`;
    } else if (poRate > 0 && Math.abs(rateVariance) > 0.5) {
      status = 'rate_mismatch';
      hasRateMismatch = true;
      message = `Billed rate ₹${bl.unitRate.toLocaleString('en-IN')} differs from PO rate ₹${poRate.toLocaleString('en-IN')} (${rateVariance > 0 ? '+' : ''}₹${rateVariance.toLocaleString('en-IN')}/${bl.uom}).`;
    }

    totalVarianceAmount += amountVariance;

    return {
      lineId: bl.id,
      description: bl.description,
      materialItemId: bl.materialItemId,
      poOrderedQty,
      poRate,
      grnReceivedQty,
      qcAcceptedQty,
      qcRejectedQty,
      billedQty: bl.billedQty,
      billedRate: bl.unitRate,
      uom: bl.uom,
      qtyVariance,
      rateVariance,
      amountVariance,
      status,
      message,
    };
  });

  let overallStatus: ThreeWayMatchStatus = 'matched';
  if (hasMissingGrn) overallStatus = 'missing_grn';
  else if (hasQtyMismatch) overallStatus = 'qty_mismatch';
  else if (hasRateMismatch) overallStatus = 'rate_mismatch';
  else if (hasQcPending) overallStatus = 'qc_pending';

  const hasMismatch = overallStatus !== 'matched';
  const summaryText = overallStatus === 'matched'
    ? '3-Way Match passed: PO rates, GRN receipts, and QC accepted quantities align.'
    : overallStatus === 'qty_mismatch'
      ? 'Quantity variance detected between billed quantity and QC accepted / GRN received quantity.'
      : overallStatus === 'rate_mismatch'
        ? 'Unit rate variance detected between Supplier PO rate and Supplier Bill rate.'
        : overallStatus === 'qc_pending'
          ? 'Incoming inspection is still pending / on QC Hold for part or all of the received material.'
          : 'GRN receipt missing for one or more billed items.';

  return {
    overallStatus,
    lines,
    hasMismatch,
    totalVarianceAmount,
    summaryText,
  };
}
