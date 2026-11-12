import React from 'react';
import { ArrowLeft, PackageOpen, ExternalLink } from 'lucide-react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useStore } from '../../store';
import { useReturnNavigation } from '../../hooks/useReturnNavigation';
import StatusChip from '../../components/layout/StatusChip';
import RecordHistoryPanel from '../../components/workflow/RecordHistoryPanel';

export default function InventoryItemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { materials, inventory, lots, movements, jobMaterialReqs, jobs, storeLocations, inspections, startInspectionForLot } = useStore();
  const { goBack } = useReturnNavigation('/inventory');
  const material = materials.find(m => m.id === id);

  if (!material) return <div className="p-6 text-sm text-[var(--text-2)]">Inventory item not found.</div>;

  const stock = inventory.filter(i => i.materialItemId === material.id);
  const itemLots = lots.filter(l => l.materialItemId === material.id);
  const jobIds = new Set(jobMaterialReqs.filter(r => r.materialItemId === material.id).map(r => r.jobId));
  const jobMovements = movements.filter(m => m.movementType === 'Issue' && jobIds.has(m.referenceId));

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-5">
      <div className="flex items-start gap-3">
        <button type="button" onClick={() => goBack()} className="mt-1 text-[var(--text-3)] hover:text-[var(--text)]"><ArrowLeft size={17} /></button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <PackageOpen size={18} className="text-[var(--brand)]" />
            <span className="font-mono text-xs font-bold text-[var(--brand)]">{material.itemCode}</span>
            <StatusChip status={material.active === false ? 'archived' : 'active'} label={material.active === false ? 'Inactive' : 'Active'} size="sm" />
          </div>
          <h1 className="text-xl font-bold text-[var(--text)] mt-1">{material.name}</h1>
          <p className="text-sm text-[var(--text-2)] mt-1">{material.categoryName} · Grade/specification: {material.standardGrade ?? 'Not specified'}</p>
        </div>
        <button type="button" onClick={() => navigate(`/procurement/pr/new?code=${encodeURIComponent(material.itemCode)}&name=${encodeURIComponent(material.name)}&uom=${encodeURIComponent(material.primaryUom)}&grade=${encodeURIComponent(material.standardGrade ?? '')}`)} className="px-3 py-2 rounded-lg text-xs font-semibold text-white" style={{ background: 'var(--brand-fill)' }}>
          Create Purchase Requisition
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Fact label="Item code" value={material.itemCode} />
        <Fact label="Category" value={material.categoryName} />
        <Fact label="Unit of measure" value={material.primaryUom} />
        <Fact label="Tracking" value={`${material.trackingMode}${material.certRequired ? ' · certificate required' : ''}`} />
      </div>

      <section className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div><h2 className="text-sm font-bold text-[var(--text)]">Stock summary</h2><p className="text-xs text-[var(--text-3)]">Physical location and quantity remain owned by Stock on Hand.</p></div>
          <Link to={`/inventory?search=${encodeURIComponent(material.itemCode)}`} className="text-xs font-semibold text-[var(--brand)] inline-flex items-center gap-1">Open Stock on Hand <ExternalLink size={12} /></Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <Fact label="On hand" value={`${stock.reduce((s, i) => s + i.onHandQty, 0).toLocaleString('en-IN')} ${material.primaryUom}`} />
          <Fact label="Available" value={`${stock.reduce((s, i) => s + i.availableQty, 0).toLocaleString('en-IN')} ${material.primaryUom}`} />
          <Fact label="Reserved" value={`${stock.reduce((s, i) => s + i.reservedQty, 0).toLocaleString('en-IN')} ${material.primaryUom}`} />
          <Fact label="Quality hold" value={`${stock.reduce((s, i) => s + i.qcHoldQty, 0).toLocaleString('en-IN')} ${material.primaryUom}`} />
        </div>
      </section>

      <section className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}><h2 className="text-sm font-bold text-[var(--text)]">Lot and grade information</h2></div>
        <div className="overflow-x-auto"><table className="eoss-table"><thead><tr><th>Lot</th><th>Supplier Lot / Heat</th><th>Grade</th><th>Quantity</th><th>Location</th><th>Status</th><th>Inspection</th><th /></tr></thead><tbody>
          {itemLots.length === 0 && <tr><td colSpan={8} className="text-center text-sm text-[var(--text-3)] py-6">No lots recorded for this item.</td></tr>}
          {itemLots.map(lot => {
            const lotIns = inspections.find(i => i.lotId === lot.id);
            return (
              <tr key={lot.id}>
                <td className="font-mono text-xs font-semibold">{lot.lotNumber}</td>
                <td className="font-mono text-xs text-[var(--text-2)]">{lot.supplierBatchRef || lot.heatNumber || '—'}</td>
                <td className="text-xs">{lot.grade ?? material.standardGrade ?? '—'}</td>
                <td className="font-mono text-xs">{lot.primaryQty} {lot.primaryUom}</td>
                <td className="text-xs">{lot.storeLocationName}</td>
                <td><StatusChip status={lot.status} size="sm" /></td>
                <td>
                  {lotIns ? (
                    <Link to={`/quality/inspection/${lotIns.id}`} className="font-mono text-xs font-semibold text-[var(--brand)] hover:underline">
                      {lotIns.inspectionNumber} ({lotIns.result})
                    </Link>
                  ) : lot.status === 'qc_hold' ? (
                    <button
                      type="button"
                      onClick={() => {
                        const created = startInspectionForLot(lot.id);
                        if (created) navigate(`/quality/inspection/${created.id}`);
                      }}
                      className="text-xs font-semibold text-[var(--brand)] hover:underline"
                    >
                      Start Inspection
                    </button>
                  ) : <span className="text-xs text-[var(--text-3)]">—</span>}
                </td>
                <td><Link to={`/inventory/lot/${lot.id}`} className="text-xs font-semibold text-[var(--brand)]">Open lot</Link></td>
              </tr>
            );
          })}
        </tbody></table></div>
      </section>

      <section className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}><h2 className="text-sm font-bold text-[var(--text)]">Used by jobs</h2><p className="text-xs text-[var(--text-3)] mt-0.5">Reservations, issues and consumption are linked to the job record.</p></div>
        <div className="overflow-x-auto"><table className="eoss-table"><thead><tr><th>Job</th><th>Site</th><th>Required</th><th>Reserved</th><th>Issued</th><th>Issue reference</th></tr></thead><tbody>
          {jobMaterialReqs.filter(r => r.materialItemId === material.id).length === 0 && <tr><td colSpan={6} className="text-center text-sm text-[var(--text-3)] py-6">No job allocation or consumption is recorded.</td></tr>}
          {jobMaterialReqs.filter(r => r.materialItemId === material.id).map(req => { const job = jobs.find(j => j.id === req.jobId); const issue = jobMovements.find(m => m.referenceId === req.jobId); return <tr key={req.id}><td><Link to={`/jobs/${req.jobId}`} className="text-xs font-semibold text-[var(--brand)]">{job?.jobNumber ?? req.jobId}</Link></td><td className="text-xs">{job?.siteName ?? '—'}</td><td className="font-mono text-xs">{req.requiredQty} {req.uom}</td><td className="font-mono text-xs">{req.reservedQty} {req.uom}</td><td className="font-mono text-xs">{req.issuedQty} {req.uom}</td><td className="text-xs">{issue ? `${issue.referenceNumber} · ${new Date(issue.timestamp).toLocaleDateString('en-IN')}` : 'No issue transaction'}</td></tr>; })}
        </tbody></table></div>
      </section>
      {searchParams.get('view') === 'lots' && <p className="text-xs text-[var(--text-3)]">Lot view opened from Stock on Hand.</p>}
      <p className="text-xs text-[var(--text-3)]">Canonical item record: {material.id}. This page does not duplicate site stock rows.</p>
      {storeLocations.length === 0 && <p className="text-xs text-[var(--text-3)]">No store locations configured.</p>}
      <RecordHistoryPanel
        entityId={material.id}
        entityRef={material.itemCode}
        title="Item & Stock Adjustment History"
        subtitle="Material master updates, stock transfers, reservations, issues, and adjustments"
      />
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border p-3" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}><div className="text-[11px] text-[var(--text-3)]">{label}</div><div className="text-sm font-semibold text-[var(--text)] mt-1">{value}</div></div>;
}
