import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';

export default function GRNDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { grns } = useStore();

  const grn = grns.find(g => g.id === id);
  if (!grn) return <div className="p-6 text-[var(--text-2)]">GRN not found</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate('/procurement')} className="text-[var(--text-3)] hover:text-[var(--text)]"><ArrowLeft size={16} /></button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-[var(--text)] font-mono">{grn.grnNumber}</h1>
            <StatusChip status={grn.status} />
          </div>
          <p className="text-sm text-[var(--text-2)]">{grn.supplierName}</p>
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
        <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Receipt Details</h3>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <Field label="GRN Number" value={grn.grnNumber} mono />
          <Field label="Supplier" value={grn.supplierName} />
          <Field label="PO Reference" value={grn.spoNumber} mono />
          <Field label="Received Date" value={new Date(grn.receivedDate).toLocaleDateString('en-IN')} />
          <Field label="Received By" value={grn.receivedBy} />
          <Field label="Delivery Challan" value={grn.deliveryChallan} mono />
          {grn.vehicleNumber && <Field label="Vehicle" value={grn.vehicleNumber} mono />}
          <Field label="Lines" value={String(grn.lineCount)} />
        </dl>
      </div>

      {grn.status === 'pending_qc' && (
        <div className="mt-4 bg-[var(--warning-bg)] border border-[var(--warning)] rounded-xl p-4">
          <p className="font-semibold text-sm text-[var(--warning)]">Pending QC Inspection</p>
          <p className="text-xs text-[var(--text-2)] mt-1">This GRN is waiting for incoming inspection. Navigate to Quality to record inspection results.</p>
          <button onClick={() => navigate('/quality')} className="mt-2 px-3 py-1.5 bg-[var(--warning)] text-white text-xs rounded-lg font-medium">Go to Quality</button>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-[var(--text-3)]">{label}</dt>
      <dd className={`text-sm text-[var(--text)] mt-0.5 ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  );
}
