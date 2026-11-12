import type {
  MaterialItem,
  Party,
  PRLine,
  PurchaseRequisition,
  Site,
  SupplierPO,
  SupplierQuotation,
  SupplierQuotationLine,
} from '../types';

export interface MatchedSupplierOption {
  supplier: Party;
  score: number;
  recommended: boolean;
  matchedLines: string[];
  basis: string[];
  historicalPoCount: number;
}

export interface LineComparisonCell {
  quoteId: string;
  supplierId: string;
  supplierName: string;
  matchedLine?: SupplierQuotationLine;
  quotedQty: number;
  unitPrice: number;
  lineTotal: number;
  grade?: string;
  gradeMismatch: boolean;
  qtyMismatch: boolean;
  missing: boolean;
  leadTimeDays?: number;
}

export interface PRLineComparisonRow {
  prLineId: string;
  materialItemId: string;
  materialName: string;
  requiredGrade?: string;
  requiredQty: number;
  uom: string;
  cells: LineComparisonCell[];
  lowestUnitPrice?: number;
}

export interface QuoteEvaluation {
  quote: SupplierQuotation;
  supplier?: Party;
  subtotal: number;
  taxAmount: number;
  deliveryCharges: number;
  discountAmount: number;
  landedTotal: number;
  coveragePct: number;
  matchedLineCount: number;
  missingLineNames: string[];
  gradeMismatches: string[];
  qtyMismatches: string[];
  meetsDeliveryTarget: boolean;
  deliveryVarianceDays?: number;
  score: number;
  advantages: string[];
  disadvantages: string[];
  missingInfo: string[];
}

export interface QuotationComparisonResult {
  valid: boolean;
  reason?: string;
  prId?: string;
  prNumber?: string;
  rows: PRLineComparisonRow[];
  evaluations: QuoteEvaluation[];
  recommendedQuoteId?: string;
  recommendationSummary: string;
  advantages: string[];
  disadvantages: string[];
  missingInfo: string[];
  warnings: string[];
}

/**
 * Strictly ensures quotations being compared belong to the exact same Purchase Requisition.
 */
export function assertSamePRComparison(quotes: SupplierQuotation[]): { valid: boolean; prId?: string; reason?: string } {
  if (quotes.length < 2) {
    return { valid: false, reason: 'Select at least 2 supplier quotations from the same PR to compare.' };
  }
  const prIds = Array.from(new Set(quotes.map(q => q.prId).filter((v): v is string => Boolean(v))));
  if (prIds.length === 0) {
    return { valid: false, reason: 'Quotations must be linked to a Purchase Requisition before comparison.' };
  }
  if (prIds.length > 1 || quotes.some(q => !q.prId)) {
    return { valid: false, reason: 'Cross-PR comparison is blocked. Select quotations raised for the same Purchase Requisition.' };
  }
  return { valid: true, prId: prIds[0] };
}

/**
 * Matches eligible suppliers for a Purchase Requisition based on supplier-item associations,
 * supplier category vs material category, grades/specs, historical fulfilled POs, status, and city.
 */
export function matchSuppliersForPR(
  pr: PurchaseRequisition,
  suppliers: Party[],
  materials: MaterialItem[],
  historicalSpos: SupplierPO[],
  sites: Site[] = []
): MatchedSupplierOption[] {
  const prLines = pr.lines ?? [];
  const prMaterials = prLines
    .map(l => materials.find(m => m.id === l.materialItemId || m.itemCode === l.materialCode || m.name.toLowerCase() === l.materialName.toLowerCase()))
    .filter((m): m is MaterialItem => Boolean(m));
  const deliverSite = sites.find(s => s.id === pr.deliverToSiteId);

  return suppliers
    .filter(s => s.partyType === 'Supplier' && s.status === 'active')
    .map(supplier => {
      let score = 0;
      const basis: string[] = [];
      const matchedLines: string[] = [];

      // 1. Direct supplier-item association (preferredSupplierIds)
      for (const line of prLines) {
        const mat = materials.find(
          m => m.id === line.materialItemId || m.itemCode === line.materialCode || m.name.toLowerCase() === line.materialName.toLowerCase()
        );
        if (mat?.preferredSupplierIds?.includes(supplier.id)) {
          score += 45;
          matchedLines.push(line.materialName);
          basis.push(`Associated supplier for ${line.materialName}`);
        }
      }

      // 2. Category alignment
      const supCat = (supplier.category ?? '').toLowerCase();
      const catHits = prMaterials.filter(m => {
        const mc = m.categoryName.toLowerCase();
        return (supCat.includes('steel') && (mc.includes('steel') || mc.includes('bar') || mc.includes('plate')))
          || (supCat.includes('fastener') && mc.includes('fastener'))
          || (supCat.includes('consumable') && (mc.includes('consumable') || mc.includes('welding') || mc.includes('lubricant')))
          || (supCat.includes('valve') && mc.includes('valve'))
          || (supCat.includes('pipe') && mc.includes('pipe'))
          || (supCat && mc.includes(supCat));
      });
      if (catHits.length > 0 && matchedLines.length === 0) {
        score += 25;
        basis.push(`Category match (${supplier.category})`);
      }

      // 3. Historical fulfilled PO evidence
      const supplierSpos = historicalSpos.filter(po => po.supplierId === supplier.id && ['confirmed', 'supplier_accepted', 'received', 'partial', 'closed'].includes(po.status));
      if (supplierSpos.length > 0) {
        score += Math.min(20, supplierSpos.length * 7);
        basis.push(`${supplierSpos.length} fulfilled order${supplierSpos.length > 1 ? 's' : ''} on record`);
      }

      // 4. Quality / supplier rating
      if ((supplier.rating ?? 0) >= 4.2) {
        score += 10;
        basis.push(`High supplier rating (${supplier.rating?.toFixed(1)}/5.0)`);
      }

      // 5. Location match
      if (deliverSite && supplier.city && deliverSite.city.toLowerCase() === supplier.city.toLowerCase()) {
        score += 8;
        basis.push(`Local to ${deliverSite.city} (shorter transit)`);
      }

      if (basis.length === 0) {
        basis.push(`Registered active supplier (${supplier.category ?? 'General'})`);
      }

      return {
        supplier,
        score,
        recommended: score >= 35,
        matchedLines: Array.from(new Set(matchedLines)),
        basis: Array.from(new Set(basis)),
        historicalPoCount: supplierSpos.length,
      };
    })
    .sort((a, b) => b.score - a.score || (b.supplier.rating ?? 0) - (a.supplier.rating ?? 0));
}

function getLineQty(l: SupplierQuotationLine): number {
  return l.quotedQty ?? l.orderedQty ?? l.qty ?? 0;
}

function getLinePrice(l: SupplierQuotationLine): number {
  if (l.unitPrice != null) return l.unitPrice;
  if (l.unitRate != null) return l.unitRate;
  const qty = getLineQty(l);
  return qty > 0 ? l.lineTotal / qty : 0;
}

function matchQuotationLine(prLine: PRLine, qLines: SupplierQuotationLine[]): SupplierQuotationLine | undefined {
  return qLines.find(ql =>
    (ql.materialItemId && prLine.materialItemId && ql.materialItemId === prLine.materialItemId)
    || (ql.materialCode && prLine.materialCode && ql.materialCode.toLowerCase() === prLine.materialCode.toLowerCase())
    || ql.materialName.toLowerCase() === prLine.materialName.toLowerCase()
  );
}

/**
 * Compares 2+ supplier quotations on the SAME PR and explains the recommended option.
 */
export function compareAndRecommendQuotations(
  pr: PurchaseRequisition | undefined,
  quotes: SupplierQuotation[],
  suppliers: Party[],
  historicalSpos: SupplierPO[]
): QuotationComparisonResult {
  const samePr = assertSamePRComparison(quotes);
  if (!samePr.valid || !pr) {
    return {
      valid: false,
      reason: samePr.reason ?? 'Purchase Requisition not found.',
      rows: [],
      evaluations: [],
      recommendationSummary: samePr.reason ?? 'Unable to compare quotations.',
      advantages: [],
      disadvantages: [],
      missingInfo: [],
      warnings: [],
    };
  }

  const prLines = pr.lines ?? [];
  const daysAvailableUntilRequired = pr.requiredBy && quotes[0]?.quoteDate
    ? Math.round((new Date(pr.requiredBy).getTime() - new Date(quotes[0].quoteDate).getTime()) / 86400000)
    : undefined;

  // Build line-by-line matrix
  const rows: PRLineComparisonRow[] = prLines.map(prLine => {
    const cells: LineComparisonCell[] = quotes.map(q => {
      const matched = matchQuotationLine(prLine, q.lines);
      if (!matched) {
        return {
          quoteId: q.id,
          supplierId: q.supplierId,
          supplierName: q.supplierName,
          quotedQty: 0,
          unitPrice: 0,
          lineTotal: 0,
          gradeMismatch: false,
          qtyMismatch: false,
          missing: true,
        };
      }
      const quotedQty = getLineQty(matched);
      const unitPrice = getLinePrice(matched);
      const reqGrade = (prLine.grade ?? '').trim().toLowerCase();
      const quoteGrade = (matched.grade ?? '').trim().toLowerCase();
      const gradeMismatch = Boolean(reqGrade && quoteGrade && reqGrade !== quoteGrade);
      const qtyMismatch = prLine.requiredQty > 0 && quotedQty !== prLine.requiredQty;

      return {
        quoteId: q.id,
        supplierId: q.supplierId,
        supplierName: q.supplierName,
        matchedLine: matched,
        quotedQty,
        unitPrice,
        lineTotal: matched.lineTotal || quotedQty * unitPrice,
        grade: matched.grade,
        gradeMismatch,
        qtyMismatch,
        missing: false,
        leadTimeDays: matched.leadTimeDays ?? q.deliveryDays,
      };
    });
    const validPrices = cells.filter(c => !c.missing && c.unitPrice > 0).map(c => c.unitPrice);
    const lowestUnitPrice = validPrices.length > 0 ? Math.min(...validPrices) : undefined;
    return {
      prLineId: prLine.id,
      materialItemId: prLine.materialItemId,
      materialName: prLine.materialName,
      requiredGrade: prLine.grade,
      requiredQty: prLine.requiredQty,
      uom: prLine.uom,
      cells,
      lowestUnitPrice,
    };
  });

  // Evaluate each quote holistically
  const evaluations: QuoteEvaluation[] = quotes.map(q => {
    const supplier = suppliers.find(s => s.id === q.supplierId);
    const subtotal = q.lines.reduce((s, l) => s + (l.lineTotal || getLineQty(l) * getLinePrice(l)), 0);
    const taxAmount = q.taxAmount ?? q.lines.reduce((s, l) => s + ((l.lineTotal || 0) * (l.taxPct ?? 0)) / 100, 0);
    const deliveryCharges = q.deliveryCharges ?? 0;
    const discountAmount = q.discountAmount ?? 0;
    const landedTotal = Math.max(0, subtotal + taxAmount + deliveryCharges - discountAmount);

    const missingLineNames: string[] = [];
    const gradeMismatches: string[] = [];
    const qtyMismatches: string[] = [];
    let matchedLineCount = 0;

    rows.forEach(row => {
      const cell = row.cells.find(c => c.quoteId === q.id);
      if (!cell || cell.missing) {
        missingLineNames.push(row.materialName);
      } else {
        matchedLineCount += 1;
        if (cell.gradeMismatch) gradeMismatches.push(`${row.materialName} (quoted ${cell.grade} vs required ${row.requiredGrade})`);
        if (cell.qtyMismatch) qtyMismatches.push(`${row.materialName} (quoted ${cell.quotedQty} vs ${row.requiredQty} ${row.uom})`);
      }
    });

    const coveragePct = prLines.length > 0 ? Math.round((matchedLineCount / prLines.length) * 100) : 100;
    const daysAvail = pr.requiredBy && q.quoteDate
      ? Math.round((new Date(pr.requiredBy).getTime() - new Date(q.quoteDate).getTime()) / 86400000)
      : daysAvailableUntilRequired;
    const meetsDeliveryTarget = daysAvail != null ? q.deliveryDays <= Math.max(1, daysAvail) : true;
    const deliveryVarianceDays = daysAvail != null ? q.deliveryDays - daysAvail : undefined;

    const missingInfo: string[] = [];
    if (!q.validUntil) missingInfo.push('Quotation validity date not provided');
    if (!q.paymentTerms) missingInfo.push('Payment terms not stated');
    if (!q.attachmentName && !q.attachmentRef) missingInfo.push('Supplier quotation document/PDF not attached');
    if (q.lines.some(l => l.freightIncluded == null) && !deliveryCharges) {
      missingInfo.push('Freight inclusion not explicitly confirmed');
    }

    const advantages: string[] = [];
    const disadvantages: string[] = [];
    if (coveragePct === 100) advantages.push('Covers 100% of PR line items');
    else disadvantages.push(`Missing ${missingLineNames.length} requested line item(s): ${missingLineNames.join(', ')}`);

    if (gradeMismatches.length === 0) advantages.push('All quoted grades match PR specifications');
    else disadvantages.push(`Grade difference on: ${gradeMismatches.join('; ')}`);

    if (qtyMismatches.length > 0) disadvantages.push(`Quantity mismatch on: ${qtyMismatches.join('; ')}`);

    if (meetsDeliveryTarget) advantages.push(`Delivery lead time (${q.deliveryDays} days) meets PR target`);
    else disadvantages.push(`Delivery lead time (${q.deliveryDays} days) may miss PR target (${pr.requiredBy})`);

    if ((supplier?.rating ?? 0) >= 4.2) advantages.push(`High supplier reliability (${supplier?.rating?.toFixed(1)}/5.0)`);
    const fulfilledCount = historicalSpos.filter(spo => spo.supplierId === q.supplierId && ['confirmed', 'received', 'closed', 'partial'].includes(spo.status)).length;
    if (fulfilledCount > 0) advantages.push(`${fulfilledCount} prior fulfilled order(s)`);
    if (q.paymentTerms.toLowerCase().includes('45') || q.paymentTerms.toLowerCase().includes('60')) {
      advantages.push(`Favorable credit terms (${q.paymentTerms})`);
    }
    if (q.paymentTerms.toLowerCase().includes('advance')) {
      disadvantages.push(`Requires advance payment (${q.paymentTerms})`);
    }
    if (deliveryCharges > 0) disadvantages.push(`Additional freight/delivery charges: ₹${deliveryCharges.toLocaleString('en-IN')}`);

    // Score calculation (higher is better)
    let score = coveragePct * 0.5;
    if (gradeMismatches.length > 0) score -= 25 * gradeMismatches.length;
    if (qtyMismatches.length > 0) score -= 12 * qtyMismatches.length;
    if (meetsDeliveryTarget) score += 15;
    else score -= 10;
    score += Math.min(10, (supplier?.rating ?? 3.5) * 2);
    score += Math.min(8, fulfilledCount * 3);
    if (q.status === 'expired') score -= 40;

    return {
      quote: q,
      supplier,
      subtotal,
      taxAmount,
      deliveryCharges,
      discountAmount,
      landedTotal,
      coveragePct,
      matchedLineCount,
      missingLineNames,
      gradeMismatches,
      qtyMismatches,
      meetsDeliveryTarget,
      deliveryVarianceDays,
      score,
      advantages,
      disadvantages,
      missingInfo,
    };
  });

  // Price competitiveness bonus relative to lowest full/highest-coverage quote
  const completeEvals = evaluations.filter(e => e.missingLineNames.length === 0 && e.landedTotal > 0);
  const pricePool = completeEvals.length > 0 ? completeEvals : evaluations.filter(e => e.landedTotal > 0);
  const minLanded = pricePool.length > 0 ? Math.min(...pricePool.map(e => e.landedTotal)) : 0;
  const minDelivery = Math.min(...evaluations.map(e => e.quote.deliveryDays));

  evaluations.forEach(ev => {
    if (minLanded > 0 && ev.landedTotal === minLanded) {
      ev.score += 18;
      ev.advantages.unshift(`Lowest landed cost (₹${ev.landedTotal.toLocaleString('en-IN')})`);
    } else if (minLanded > 0 && ev.landedTotal > minLanded) {
      const diffPct = Math.round(((ev.landedTotal - minLanded) / minLanded) * 100);
      if (diffPct > 0) ev.disadvantages.push(`${diffPct}% higher landed cost than lowest quote`);
    }
    if (ev.quote.deliveryDays === minDelivery && evaluations.length > 1) {
      ev.score += 6;
      if (!ev.advantages.some(a => a.includes('Fastest'))) {
        ev.advantages.push(`Fastest quoted lead time (${ev.quote.deliveryDays} days)`);
      }
    }
  });

  evaluations.sort((a, b) => b.score - a.score || a.landedTotal - b.landedTotal);
  const nonRejected = evaluations.filter(e => e.quote.status !== 'rejected');
  const best = nonRejected[0] ?? evaluations[0];

  const warnings: string[] = [];
  if (evaluations.some(e => e.missingLineNames.length > 0)) {
    warnings.push('One or more quotations omit requested PR line items.');
  }
  if (evaluations.some(e => e.gradeMismatches.length > 0)) {
    warnings.push('Specification or material grade differences detected across quotations.');
  }
  if (evaluations.some(e => !e.meetsDeliveryTarget)) {
    warnings.push('One or more quotations may exceed the PR required-by date.');
  }

  return {
    valid: true,
    prId: pr.id,
    prNumber: pr.prNumber,
    rows,
    evaluations,
    recommendedQuoteId: best?.quote.id,
    recommendationSummary: best
      ? `Recommended: ${best.quote.supplierName} (${best.quote.quoteNumber}) — landed cost ₹${best.landedTotal.toLocaleString('en-IN')}, ${best.quote.deliveryDays} days delivery, ${best.coveragePct}% PR line coverage.`
      : 'No recommendation available.',
    advantages: best?.advantages ?? [],
    disadvantages: best?.disadvantages ?? [],
    missingInfo: best?.missingInfo ?? [],
    warnings,
  };
}
