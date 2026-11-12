import test from 'node:test';
import assert from 'node:assert/strict';

// Minimal browser storage shim for Node unit tests
const memStorage = new Map<string, string>();
(globalThis as Record<string, unknown>).localStorage = {
  getItem: (k: string) => memStorage.get(k) ?? null,
  setItem: (k: string, v: string) => { memStorage.set(k, v); },
  removeItem: (k: string) => { memStorage.delete(k); },
  clear: () => { memStorage.clear(); },
  key: (i: number) => Array.from(memStorage.keys())[i] ?? null,
  get length() { return memStorage.size; },
};

const { useStore } = await import('../src/store/index.ts');
const { getMaterialReadinessLabel, deriveInventoryStatus } = await import('../src/domain/inventory.ts');
const { getStatusLabel } = await import('../src/components/layout/StatusChip.tsx');

test('Material Readiness & Inventory statuses render in consistent Title Case', () => {
  assert.equal(getMaterialReadinessLabel('pending'), 'Not Assessed');
  assert.equal(getMaterialReadinessLabel('available'), 'Available');
  assert.equal(getMaterialReadinessLabel('partial'), 'Partially Available');
  assert.equal(getMaterialReadinessLabel('shortage'), 'Shortage');
  assert.equal(getMaterialReadinessLabel('awaiting_procurement'), 'Awaiting Procurement');
  assert.equal(getMaterialReadinessLabel('awaiting_grn'), 'Awaiting goods receipt');
  assert.equal(getMaterialReadinessLabel('quality_hold'), 'Quality Hold');
  assert.equal(getMaterialReadinessLabel('reserved'), 'Reserved');
  assert.equal(getStatusLabel('qc_hold'), 'Quality Hold');
  assert.equal(getStatusLabel('pending_inspection'), 'Pending Inspection');
  assert.equal(deriveInventoryStatus({ availableQty: 0, reservedQty: 0, qcHoldQty: 10, shortage: true }), 'Quality Hold');
  assert.equal(deriveInventoryStatus({ availableQty: 5, reservedQty: 0, qcHoldQty: 0, shortage: true }), 'Shortage');
  assert.equal(deriveInventoryStatus({ availableQty: 0, reservedQty: 10, qcHoldQty: 0, shortage: false }), 'Reserved');
  assert.equal(deriveInventoryStatus({ availableQty: 20, reservedQty: 0, qcHoldQty: 0, shortage: false }), 'Available');
});

test('Job creation with New Customer PO maintains bidirectional link & prevents duplicate POs', () => {
  const store = useStore.getState();
  const initialPoCount = store.customerPos.length;
  const res1 = store.createJobWithNewCustomerPO({
    job: {
      id: 'job-test-newpo',
      jobNumber: 'JOB-TEST-901',
      customerId: 'cust-01',
      customerName: 'Apex Industrial',
      description: 'Machined SS304 Flange Assembly',
      status: 'active',
      priority: 'normal',
      currentStage: 'Material Prep',
      plannedStart: '2026-11-11',
      plannedEnd: '2026-11-25',
      owner: 'Owner',
      value: 180000,
      stages: [],
      hasBlocker: false,
      siteId: 'site-hyd',
      siteName: 'Hyderabad Plant 1',
      materialReadiness: 'pending',
    },
    po: {
      id: 'cpo-test-901',
      poNumber: 'CPO-TEST-901',
      customerId: 'cust-01',
      customerName: 'Apex Industrial',
      acceptedDate: '2026-11-11',
      paymentTerms: 'Net 30',
      deliveryTerms: 'Ex-Works',
      totalValue: 180000,
      currency: 'INR',
      status: 'active',
      lineCount: 1,
    },
    poLines: [{
      id: 'cpol-test-901',
      poId: 'cpo-test-901',
      drawingNumber: 'DWG-TEST-901',
      revision: 'A',
      description: 'Machined SS304 Flange Assembly',
      orderedQty: 20,
      uom: 'nos',
      requiredDate: '2026-11-25',
      rate: 9000,
      value: 180000,
      jobId: 'job-test-newpo',
      jobNumber: 'JOB-TEST-901',
      status: 'in_progress',
    }],
  });

  assert.equal(res1.job.customerPoId, 'cpo-test-901');
  assert.equal(res1.job.customerPoNumber, 'CPO-TEST-901');
  assert.equal(useStore.getState().customerPos.length, initialPoCount + 1);
  const linkedLines = useStore.getState().poLines.filter(l => l.poId === 'cpo-test-901');
  assert.equal(linkedLines.length, 1);
  assert.equal(linkedLines[0]?.jobId, 'job-test-newpo');

  // Idempotent retry on same draft does not create a duplicate Customer PO or Job
  store.createJobWithNewCustomerPO({ job: res1.job, po: res1.po, poLines: linkedLines });
  assert.equal(useStore.getState().customerPos.length, initialPoCount + 1);
  assert.equal(useStore.getState().jobs.filter(j => j.id === 'job-test-newpo').length, 1);
});

test('Procurement PR -> Multiple Quotations -> Compare -> Finalize 1 -> Issue 1 SPO (no duplicate)', () => {
  const store = useStore.getState();
  const prId = 'pr-unit-test-1';
  store.addPurchaseReq({
    id: prId,
    prNumber: 'PR-2026-9901',
    raisedBy: 'Ramesh Nair',
    raisedDate: '2026-11-11',
    requiredBy: '2026-11-20',
    department: 'Production',
    deliverToSiteId: 'site-hyd',
    deliverToSiteName: 'Hyderabad Plant 1',
    deliverToStoreId: 'loc-rm',
    deliverToStoreName: 'Raw Material Store',
    priority: 'high',
    status: 'approved',
    lineCount: 1,
    lines: [{
      id: 'prl-u-1',
      materialCode: 'RM-SS-3MM',
      description: 'SS Sheet 3mm 304L',
      grade: 'ASTM A240 304L',
      qty: 100,
      uom: 'kg',
      estimatedRate: 320,
    }],
  });

  store.addSupplierQuotation({
    id: 'sq-u-1',
    quoteNumber: 'SQ-U-101',
    prId,
    prNumber: 'PR-2026-9901',
    supplierId: 'supp-ssi',
    supplierName: 'Stainless Source India',
    quoteDate: '2026-11-11',
    validUntil: '2026-11-25',
    deliveryDays: 5,
    paymentTerms: 'Net 30',
    status: 'received',
    lines: [{ id: 'sql-1', materialName: 'SS Sheet 3mm 304L', grade: 'ASTM A240 304L', qty: 100, uom: 'kg', unitRate: 310, lineTotal: 31000 }],
  });
  store.addSupplierQuotation({
    id: 'sq-u-2',
    quoteNumber: 'SQ-U-102',
    prId,
    prNumber: 'PR-2026-9901',
    supplierId: 'supp-msk',
    supplierName: 'MSK Steel Traders',
    quoteDate: '2026-11-11',
    validUntil: '2026-11-25',
    deliveryDays: 4,
    paymentTerms: 'Net 45',
    status: 'received',
    lines: [{ id: 'sql-2', materialName: 'SS Sheet 3mm 304L', grade: 'ASTM A240 304L', qty: 100, uom: 'kg', unitRate: 295, lineTotal: 29500 }],
  });

  // Finalize lowest quotation
  useStore.getState().selectQuotation('sq-u-2');
  const q1 = useStore.getState().supplierQuotations.find(q => q.id === 'sq-u-1');
  const q2 = useStore.getState().supplierQuotations.find(q => q.id === 'sq-u-2');
  assert.equal(q2?.status, 'selected');
  assert.equal(q1?.status, 'not_selected');

  // Draft 1 Supplier PO from selected quotation, then issue and confirm
  const firstPO = useStore.getState().generateSPOFromQuotation('sq-u-2');
  assert.ok(firstPO.spo, 'First SPO should be drafted');
  assert.equal(firstPO.spo?.status, 'draft');
  assert.equal(firstPO.spo?.totalValue, 29500);
  const prAfter = useStore.getState().purchaseReqs.find(p => p.id === prId);
  assert.equal(prAfter?.status, 'po_drafted');

  const issued = useStore.getState().confirmAndIssueSPO(firstPO.spo!.id, 'Owner');
  assert.equal(issued.spo?.status, 'awaiting_supplier_confirmation');
  const confirmed = useStore.getState().recordSupplierPOConfirmation(firstPO.spo!.id, 'accepted', {
    confirmedDate: '2026-11-20',
    supplierRefNumber: 'SUP-UNIT-1',
    recordedBy: 'Owner',
  });
  assert.equal(confirmed.spo?.status, 'confirmed');

  // Guard against issuing duplicate SPO from the same PR/quotation
  const secondPO = useStore.getState().generateSPOFromQuotation('sq-u-2');
  assert.ok(secondPO.error?.includes('already'), 'Duplicate SPO attempt must return error');
  assert.equal(useStore.getState().supplierPos.filter(p => p.prId === prId).length, 1);
});

test('GRN Receipt (Multi-Lot + Over-Receipt Guard + QC Hold Isolation) & Idempotent Inspection Release', () => {
  // Use the SPO created above (100 kg SS Sheet 3mm 304L)
  const spo = useStore.getState().supplierPos.find(p => p.supplierQuotationId === 'sq-u-2');
  assert.ok(spo, 'Generated SPO must exist');
  const spoLine = useStore.getState().supplierPoLines.find(l => l.spoId === spo.id);
  assert.ok(spoLine, 'SPO Line must exist');

  const invBefore = useStore.getState().inventory.find(i => i.materialItemId === spoLine.materialItemId);
  assert.ok(invBefore, 'Inventory record for SS Sheet 3mm 304L must exist');
  const availBefore = invBefore.availableQty;
  const qcHoldBefore = invBefore.qcHoldQty;
  const onHandBefore = invBefore.onHandQty;

  // 1. Mismatched lot sum must fail validation
  const badLotSum = useStore.getState().recordGRNReceipt({
    spoId: spo.id,
    receivedDate: '2026-11-11',
    deliveryChallan: 'DC-ERR-1',
    receivedBy: 'Storekeeper',
    lines: [{
      spoLineId: spoLine.id,
      receivedQty: 60,
      lots: [
        { lotNumber: 'LOT-BAD-1', grade: 'ASTM A240 304L', qty: 25 },
        { lotNumber: 'LOT-BAD-2', grade: 'ASTM A240 304L', qty: 25 },
      ],
    }],
  });
  assert.ok(badLotSum.error?.includes('must equal actual received quantity'));

  // 2. Over-receipt must fail validation
  const overReceipt = useStore.getState().recordGRNReceipt({
    spoId: spo.id,
    receivedDate: '2026-11-11',
    deliveryChallan: 'DC-ERR-2',
    receivedBy: 'Storekeeper',
    lines: [{
      spoLineId: spoLine.id,
      receivedQty: 120,
      lots: [{ lotNumber: 'LOT-OVER-1', grade: 'ASTM A240 304L', qty: 120 }],
    }],
  });
  assert.ok(overReceipt.error?.includes('Over-receipt blocked'));

  // 3. Valid Partial Receipt (60 of 100 kg split across 2 lots: 25 + 35)
  const validGrn = useStore.getState().recordGRNReceipt({
    spoId: spo.id,
    receivedDate: '2026-11-11',
    deliveryChallan: 'DC-OK-900',
    receivedBy: 'Storekeeper',
    lines: [{
      spoLineId: spoLine.id,
      receivedQty: 60,
      lots: [
        { lotNumber: 'LOT-PASS-A', supplierLotRef: 'HT-A1', grade: 'ASTM A240 304L', qty: 25 },
        { lotNumber: 'LOT-PASS-B', supplierLotRef: 'HT-B2', grade: 'ASTM A240 304L', qty: 35 },
      ],
    }],
  });
  assert.ok(validGrn.grn, 'Partial multi-lot GRN should be saved');
  assert.equal(validGrn.grn?.status, 'pending_qc');

  // Verify SPO status became 'partial' (not 'received')
  const updatedSpo = useStore.getState().supplierPos.find(p => p.id === spo.id);
  assert.equal(updatedSpo?.status, 'partial');

  // Pending QC lots MUST NOT increase availableQty; only qcHoldQty and onHandQty increase!
  const invAfterGrn = useStore.getState().inventory.find(i => i.id === invBefore.id);
  assert.equal(invAfterGrn?.availableQty, availBefore, 'Uninspected stock must NOT enter availableQty');
  assert.equal(invAfterGrn?.qcHoldQty, qcHoldBefore + 60);
  assert.equal(invAfterGrn?.onHandQty, onHandBefore + 60);

  const createdLots = useStore.getState().lots.filter(l => l.grnId === validGrn.grn?.id);
  assert.equal(createdLots.length, 2);
  assert.ok(createdLots.every(l => l.status === 'qc_hold'));

  // 4. Start Inspection from GRN and from Lot must return the EXACT SAME inspection record (idempotent)
  const lotA = createdLots.find(l => l.lotNumber === 'LOT-PASS-A')!;
  const inspFromGrn = useStore.getState().startInspectionForGRN(validGrn.grn!.id, lotA.id);
  const inspFromLot = useStore.getState().startInspectionForLot(lotA.id);
  assert.ok(inspFromGrn);
  assert.equal(inspFromLot?.id, inspFromGrn.id, 'GRN & Lot inspection triggers must point to the same inspection');

  // 5. Complete inspection for Lot A (25 kg pass) -> ONLY 25 kg moves from qcHoldQty to availableQty
  useStore.getState().completeIncomingInspection(inspFromGrn.id, {
    acceptedQty: 25,
    rejectedQty: 0,
    result: 'pass',
    by: 'QC Inspector',
  });
  const invAfterPassA = useStore.getState().inventory.find(i => i.id === invBefore.id);
  assert.equal(invAfterPassA?.availableQty, availBefore + 25);
  assert.equal(invAfterPassA?.qcHoldQty, qcHoldBefore + 35);
  const grnAfterPassA = useStore.getState().grns.find(g => g.id === validGrn.grn!.id);
  assert.equal(grnAfterPassA?.status, 'partial', 'GRN remains partial while Lot B is still qc_hold');

  // 6. Inspect Lot B with Partial Acceptance (20 accepted, 15 rejected)
  const lotB = createdLots.find(l => l.lotNumber === 'LOT-PASS-B')!;
  const inspB = useStore.getState().startInspectionForLot(lotB.id)!;
  useStore.getState().completeIncomingInspection(inspB.id, {
    acceptedQty: 20,
    rejectedQty: 15,
    result: 'partial',
    by: 'QC Inspector',
  });
  const invAfterB = useStore.getState().inventory.find(i => i.id === invBefore.id);
  assert.equal(invAfterB?.availableQty, availBefore + 45, 'Accepted 25+20 entered availableQty; rejected 15 never entered availableQty');
  assert.equal(invAfterB?.qcHoldQty, qcHoldBefore, 'All GRN lots processed out of qcHoldQty');
  assert.equal(invAfterB?.onHandQty, onHandBefore + 45, 'Rejected 15 removed from active onHand');
});

test('Maintenance Breakdown -> Asset Status Validation -> Resolve & Meter Reading History', () => {
  const store = useStore.getState();
  const asset = store.assets.find(a => a.status === 'operational');
  assert.ok(asset, 'Operational asset required');
  const prevReading = asset.currentReading ?? 0;
  const initialReadings = store.meterReadings.filter(r => r.assetId === asset.id).length;

  // Log Breakdown
  const bdId = 'me-unit-bd-1';
  store.addMaintenanceEvent({
    id: bdId,
    eventNumber: 'ME-2026-991',
    type: 'Breakdown',
    assetId: asset.id,
    assetName: asset.name,
    assetCode: asset.assetCode,
    severity: 'High',
    symptom: 'Hydraulic pressure drop on main manifold',
    technicianId: 'usr-1',
    technicianName: 'Suresh Verma',
    downtimeStart: '2026-11-11T08:00',
    status: 'open',
    affectedJobs: [],
    sparesUsed: [],
  });
  assert.equal(useStore.getState().assets.find(a => a.id === asset.id)?.status, 'breakdown');

  // Cannot manually flip Asset status back to operational while breakdown event is still open
  const blockedUpdate = useStore.getState().updateAsset(asset.id, { status: 'operational' });
  assert.equal(blockedUpdate.ok, false);
  assert.ok(blockedUpdate.error?.toLowerCase().includes('breakdown'));

  // Updating running hours records a MeterReading entry preserving history
  const okMeterUpdate = useStore.getState().updateAsset(asset.id, { currentReading: prevReading + 25 });
  assert.equal(okMeterUpdate.ok, true);
  assert.equal(useStore.getState().meterReadings.filter(r => r.assetId === asset.id).length, initialReadings + 1);

  // Close breakdown event -> restores asset status & computes resolution timestamp
  useStore.getState().closeMaintenanceEvent(bdId, 'Faulty seal replaced', 'Replaced manifold O-ring and pressure-tested', {
    downtimeEnd: '2026-11-11T12:30',
    completionDate: '2026-11-11',
    notes: 'Verified 210 bar pressure stable',
  });
  const closedEvent = useStore.getState().maintenanceEvents.find(m => m.id === bdId);
  assert.equal(closedEvent?.status, 'closed');
  assert.equal(closedEvent?.downtimeEnd, '2026-11-11T12:30');
  assert.equal(useStore.getState().assets.find(a => a.id === asset.id)?.status, 'operational');
});
