// Evidence-based supplier recommendation from actual historical SupplierPO / SupplierPOLine records.
// Never invents a score when there isn't enough history to support one.
import type { SupplierPO, SupplierPOLine, Party } from '../types';

export interface SupplierEvidence {
  supplierId: string;
  supplierName: string;
  ordersCount: number;
  avgRate: number;
  avgLeadTimeDays: number | null;
  rejectionRatePct: number;
  onTimeDeliveryPct: number | null;
  lastSuppliedDate: string;
}

export interface SupplierRecommendationResult {
  hasSufficientHistory: boolean;
  evidence: SupplierEvidence[];
  recommendedSupplierId?: string;
  reason: string;
}

export function recommendSuppliers(params: {
  materialItemId: string;
  supplierPos: SupplierPO[];
  supplierPoLines: SupplierPOLine[];
  suppliers: Party[];
}): SupplierRecommendationResult {
  const { materialItemId, supplierPos, supplierPoLines, suppliers } = params;

  const lines = supplierPoLines.filter(l => l.materialItemId === materialItemId);
  if (lines.length === 0) {
    return {
      hasSufficientHistory: false,
      evidence: [],
      reason: 'No historical purchase records exist for this material. Select a supplier manually; EOSS cannot yet recommend one based on evidence.',
    };
  }

  const bySupplier = new Map<string, { spos: SupplierPO[]; lines: SupplierPOLine[] }>();
  for (const line of lines) {
    const spo = supplierPos.find(p => p.id === line.spoId);
    if (!spo) continue;
    if (!bySupplier.has(spo.supplierId)) bySupplier.set(spo.supplierId, { spos: [], lines: [] });
    const bucket = bySupplier.get(spo.supplierId)!;
    bucket.spos.push(spo);
    bucket.lines.push(line);
  }

  const evidence: SupplierEvidence[] = [];
  for (const [supplierId, bucket] of bySupplier) {
    const supplier = suppliers.find(s => s.id === supplierId);
    const totalQty = bucket.lines.reduce((s, l) => s + l.orderedQty, 0);
    const totalValue = bucket.lines.reduce((s, l) => s + l.value, 0);
    const avgRate = totalQty > 0 ? totalValue / totalQty : 0;
    const totalReceived = bucket.lines.reduce((s, l) => s + l.receivedQty, 0);
    const totalRejected = bucket.lines.reduce((s, l) => s + l.rejectedQty, 0);
    const rejectionRatePct = totalReceived > 0 ? (totalRejected / totalReceived) * 100 : 0;

    const leadTimes = bucket.spos
      .filter(p => p.raisedDate && p.committedDate)
      .map(p => (new Date(p.committedDate).getTime() - new Date(p.raisedDate).getTime()) / 86400000)
      .filter(d => d > 0 && Number.isFinite(d));
    const avgLeadTimeDays = leadTimes.length > 0 ? leadTimes.reduce((s, d) => s + d, 0) / leadTimes.length : null;

    const receivedSpos = bucket.spos.filter(p => p.status === 'received' || p.status === 'partial' || p.status === 'overdue');
    const onTime = receivedSpos.filter(p => p.status !== 'overdue').length;
    const onTimeDeliveryPct = receivedSpos.length > 0 ? (onTime / receivedSpos.length) * 100 : null;

    const lastSuppliedDate = bucket.spos.reduce((latest, p) => (p.raisedDate > latest ? p.raisedDate : latest), '');

    evidence.push({
      supplierId,
      supplierName: supplier?.tradingName ?? bucket.spos[0]?.supplierName ?? 'Unknown Supplier',
      ordersCount: bucket.spos.length,
      avgRate: Math.round(avgRate * 100) / 100,
      avgLeadTimeDays: avgLeadTimeDays != null ? Math.round(avgLeadTimeDays * 10) / 10 : null,
      rejectionRatePct: Math.round(rejectionRatePct * 10) / 10,
      onTimeDeliveryPct: onTimeDeliveryPct != null ? Math.round(onTimeDeliveryPct) : null,
      lastSuppliedDate,
    });
  }

  evidence.sort((a, b) => {
    if (a.rejectionRatePct !== b.rejectionRatePct) return a.rejectionRatePct - b.rejectionRatePct;
    if (a.avgRate !== b.avgRate) return a.avgRate - b.avgRate;
    return (a.avgLeadTimeDays ?? 999) - (b.avgLeadTimeDays ?? 999);
  });

  if (evidence.length === 0) {
    return { hasSufficientHistory: false, evidence: [], reason: 'No completed purchase history found for this material.' };
  }

  const top = evidence[0];
  const reasonParts: string[] = [];
  reasonParts.push(`${top.ordersCount} previous order${top.ordersCount > 1 ? 's' : ''} on record`);
  reasonParts.push(`avg rate ₹${top.avgRate}/unit`);
  if (top.avgLeadTimeDays != null) reasonParts.push(`avg lead time ${top.avgLeadTimeDays} days`);
  reasonParts.push(`${top.rejectionRatePct}% rejection rate`);

  return {
    hasSufficientHistory: true,
    evidence,
    recommendedSupplierId: top.supplierId,
    reason: `${top.supplierName} is recommended based on ${reasonParts.join(', ')}.`,
  };
}
