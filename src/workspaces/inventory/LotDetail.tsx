import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, FileText, ArrowRightLeft, CheckCircle } from 'lucide-react';
import { useStore } from '../../store';
import { useReturnNavigation } from '../../hooks/useReturnNavigation';
import StatusChip, { getStatusLabel } from '../../components/layout/StatusChip';
import RecordHistoryPanel from '../../components/workflow/RecordHistoryPanel';
import ConfirmModal from '../../components/feedback/ConfirmModal';

export default function LotDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { lots, movements, certificates, documents, grns, inspections, releaseLotFromHold, startInspectionForLot, currentUser } = useStore();
  const { goBack } = useReturnNavigation('/inventory');
  const [confirm, setConfirm] = useState<null | { action: string; body: string }>(null);

  const lot = lots.find(l => l.id === id);
  if (!lot) return <div className="p-6 text-[var(--text-2)]">Lot not found</div>;

  const lotMovements = movements.filter(m => m.lotId === id);
  const lotCerts = certificates.filter(c => c.linkedLots.includes(id!));
  const lotDocs = documents.filter(d => d.linkedEntities.some(le => le.ref === lot.lotNumber));
  const sourceGrn = lot.grnId ? grns.find(g => g.id === lot.grnId) : undefined;
  const lotInspection = inspections.find(i => i.lotId === lot.id);

  const canEdit = ['owner', 'storekeeper', 'qc'].includes(currentUser.role);

  const INBOUND_TYPES = new Set(['Receipt', 'Return', 'Transfer-In', 'Opening Balance']);
  const sortedMovements = [...lotMovements].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  let runningBalance = 0;
  const movementsWithBalance = sortedMovements.map(m => {
    const delta = INBOUND_TYPES.has(m.movementType) ? m.primaryQty : -m.primaryQty;
    runningBalance += delta;
    return { ...m, balance: runningBalance };
  });

  const handleRelease = () => {
    releaseLotFromHold(lot.id, 'available', currentUser.name, 'Released from QC Hold via Lot Detail');
    setConfirm(null);
  };

  const handleReturn = () => {
    releaseLotFromHold(lot.id, 'scrapped', currentUser.name, 'Rejected / marked for return via Lot Detail');
    setConfirm(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-5">
        <button onClick={() => goBack()} className="text-[var(--text-3)] hover:text-[var(--text)] mt-1"><ArrowLeft size={16} /></button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-bold text-[var(--text)] font-mono">{lot.lotNumber}</h1>
            <StatusChip status={lot.status} />
            {lot.parentLotId && <span className="text-xs text-[var(--text-3)] bg-[var(--surface-2)] px-2 py-0.5 rounded-full border border-[var(--border)]">Remnant</span>}
          </div>
          <p className="text-sm text-[var(--text-2)] mt-0.5">{lot.materialName} · {lot.supplierName}</p>
          <p className="text-sm mt-1">
            <span className="font-semibold text-[var(--text)]">{lot.primaryQty.toLocaleString()} {lot.primaryUom}</span>
            {lot.secondaryQty !== undefined && <span className="text-[var(--text-2)]"> · {lot.secondaryQty} {lot.secondaryUom}</span>}
            <span className="text-[var(--text-2)]"> · {lot.storeLocationName}</span>
          </p>
        </div>
        {canEdit && lot.status === 'qc_hold' && (
          <div className="flex gap-2 flex-wrap">
            {lotInspection ? (
              <Link to={`/quality/inspection/${lotInspection.id}`} className="px-3 py-1.5 bg-[var(--brand-fill)] text-white rounded-lg text-sm font-medium">
                Open Inspection ({lotInspection.inspectionNumber})
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const ins = startInspectionForLot(lot.id);
                  if (ins) navigate(`/quality/inspection/${ins.id}`);
                }}
                className="px-3 py-1.5 bg-[var(--brand-fill)] text-white rounded-lg text-sm font-medium"
              >
                Start Inspection
              </button>
            )}
            {(lotInspection?.result === 'pass' || lotInspection?.concessionGranted) ? (
              <button onClick={() => setConfirm({ action: 'release', body: 'Release this lot from QC hold and make it available in Stock on Hand?' })} className="px-3 py-1.5 bg-[var(--success)] text-white rounded-lg text-sm font-medium">Release</button>
            ) : (
              <span className="px-3 py-1.5 text-xs text-[var(--text-3)] border border-[var(--border)] rounded-lg">Release requires passing inspection</span>
            )}
            <button onClick={() => setConfirm({ action: 'return', body: 'Reject / mark this lot for return to supplier? This will exclude it from available inventory.' })} className="px-3 py-1.5 border border-[var(--error)] text-[var(--error)] rounded-lg text-sm font-medium">Reject / Return</button>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Main info */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Lot Details</h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <Field label="Heat / Supplier Lot Ref" value={lot.supplierBatchRef || lot.heatNumber || '—'} mono />
              <Field label="Grade" value={lot.grade ?? '—'} />
              <Field label="Received" value={lot.receivedDate ? new Date(lot.receivedDate).toLocaleDateString('en-IN') : '—'} />
              {lot.mfgDate && <Field label="Mfg Date" value={new Date(lot.mfgDate).toLocaleDateString('en-IN')} />}
              {lot.expiryDate && <Field label="Expiry Date" value={new Date(lot.expiryDate).toLocaleDateString('en-IN')} />}
              <div>
                <dt className="text-xs text-[var(--text-3)]">GRN</dt>
                {sourceGrn ? <dd className="text-sm text-[var(--text)] mt-0.5"><Link to={`/procurement/grn/${sourceGrn.id}`} className="text-[var(--brand)] hover:underline font-mono">{sourceGrn.grnNumber}</Link><span className="text-[var(--text-3)]"> · {getStatusLabel(sourceGrn.status)}</span></dd> : <dd className="text-sm text-[var(--text)] mt-0.5">Opening balance / legacy receipt</dd>}
              </div>
              {lotInspection && (
                <div>
                  <dt className="text-xs text-[var(--text-3)]">Inspection</dt>
                  <dd className="text-sm text-[var(--text)] mt-0.5">
                    <Link to={`/quality/inspection/${lotInspection.id}`} className="text-[var(--brand)] hover:underline font-mono">{lotInspection.inspectionNumber}</Link>
                    <span className="text-[var(--text-3)]"> · {getStatusLabel(lotInspection.result)}</span>
                  </dd>
                </div>
              )}
              <Field label="Certificate" value={<StatusChip status={lot.certStatus} size="sm" />} />
              {lot.parentLotId && <Field label="Parent Lot" value={lot.parentLotId} mono />}
            </dl>
          </div>

          {/* Movement ledger */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-2)]">
              <h3 className="font-semibold text-sm text-[var(--text)]">Stock Movement Ledger</h3>
            </div>
            <div className="md:hidden divide-y" style={{ borderColor: 'var(--border)' }}>
              {lotMovements.length === 0 && <p className="px-4 py-6 text-sm text-center text-[var(--text-3)]">No movements recorded</p>}
              {lotMovements.map(m => (
                <div key={m.id} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <StatusChip status={m.movementType.toLowerCase().replace(/\s|-/g, '_')} label={m.movementType} size="sm" />
                    <span className="font-mono text-sm font-semibold">{m.primaryQty} {m.uom}</span>
                  </div>
                  <div className="text-xs text-[var(--text-2)] mt-1">
                    {(m.fromLocation ?? '—')} → {(m.toLocation ?? '—')}
                  </div>
                  <div className="text-[11px] text-[var(--text-3)] mt-0.5">
                    {new Date(m.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {m.referenceNumber} · {m.performedBy}
                  </div>
                </div>
              ))}
            </div>
            <table className="eoss-table hidden md:table">
              <thead>
                <tr><th>Timestamp</th><th>Movement</th><th>Qty</th><th>Balance</th><th>From</th><th>To</th><th>Reference</th><th>By</th></tr>
              </thead>
              <tbody>
                {movementsWithBalance.length === 0 && <tr><td colSpan={8} className="text-center py-6 text-sm text-[var(--text-3)]">No movements recorded</td></tr>}
                {movementsWithBalance.map(m => (
                  <tr key={m.id}>
                    <td className="text-xs text-[var(--text-2)] whitespace-nowrap">{new Date(m.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                    <td><StatusChip status={m.movementType.toLowerCase().replace(/\s|-/g, '_')} label={m.movementType} size="sm" /></td>
                    <td className="font-mono text-sm font-semibold">{INBOUND_TYPES.has(m.movementType) ? '+' : '-'}{m.primaryQty} {m.uom}</td>
                    <td className={`font-mono text-sm font-semibold ${m.balance < 0 ? 'text-[var(--error)]' : ''}`}>{m.balance} {m.uom}</td>
                    <td className="text-xs text-[var(--text-2)]">{m.fromLocation ?? '—'}</td>
                    <td className="text-xs text-[var(--text-2)]">{m.toLocation ?? '—'}</td>
                    <td className="text-xs text-[var(--text-2)]">{m.referenceType}: {m.referenceNumber}</td>
                    <td className="text-xs text-[var(--text-2)]">{m.performedBy}</td>
                  </tr>
                ))}
                {movementsWithBalance.length > 0 && (
                  <tr className="bg-[var(--surface-2)] font-semibold text-xs">
                    <td colSpan={3} className="px-3 py-2 text-[var(--text-3)]">Closing balance from ledger</td>
                    <td className={`px-3 py-2 font-mono ${runningBalance !== lot.primaryQty ? 'text-[var(--error)]' : 'text-[var(--success)]'}`}>
                      {runningBalance} {lot.primaryUom}
                      {runningBalance !== lot.primaryQty && <span className="ml-1 text-[10px]">(lot shows {lot.primaryQty})</span>}
                    </td>
                    <td colSpan={4} />
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Certificates */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Material Certificates</h3>
            {lotCerts.length === 0 && <p className="text-xs text-[var(--text-3)]">No certificates linked</p>}
            {lotCerts.map(c => (
              <Link key={c.id} to={`/inventory/cert/${c.id}`} className="block mt-2 p-3 bg-[var(--surface-2)] rounded-lg hover:bg-[var(--surface-3)] transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--text)]">{c.certNumber}</span>
                  <StatusChip status={c.verificationStatus} size="sm" />
                </div>
                <div className="text-[11px] text-[var(--text-2)] mt-1">{c.certType} · {c.grade}</div>
                {c.yieldStrength && (
                  <div className="text-[11px] text-[var(--text-3)] mt-0.5">YS: {c.yieldStrength} MPa · TS: {c.tensileStrength} MPa</div>
                )}
              </Link>
            ))}
          </div>

          {/* Linked documents */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Linked Documents</h3>
            {lotDocs.length === 0 && <p className="text-xs text-[var(--text-3)]">No documents linked</p>}
            {lotDocs.map(d => (
              <div key={d.id} className="flex items-center gap-2 mt-2 p-2 bg-[var(--surface-2)] rounded-lg">
                <FileText size={14} className="text-[var(--brand)] flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-medium text-[var(--text)] truncate">{d.title}</div>
                  <div className="text-[11px] text-[var(--text-3)]">{d.fileSize}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={!!confirm}
        title={confirm?.action === 'release' ? 'Release from QC Hold' : 'Return to Supplier'}
        body={confirm?.body ?? ''}
        confirmLabel={confirm?.action === 'release' ? 'Release' : 'Mark Return'}
        variant={confirm?.action === 'return' ? 'danger' : 'primary'}
        onConfirm={confirm?.action === 'release' ? handleRelease : handleReturn}
        onCancel={() => setConfirm(null)}
      />

      <div className="mt-5">
        <RecordHistoryPanel
          entityId={lot.id}
          entityRef={lot.lotNumber}
          title="Lot Activity & Traceability History"
          subtitle="GRN receipt, QC hold/release decisions, reservations, issues, and stock adjustments"
        />
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-[var(--text-3)]">{label}</dt>
      <dd className={`text-sm text-[var(--text)] mt-0.5 ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  );
}
