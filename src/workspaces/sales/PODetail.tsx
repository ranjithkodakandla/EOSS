import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useStore } from '../../store';
import { JOBS } from '../../data/seed';
import StatusChip from '../../components/layout/StatusChip';

export default function PODetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customerPos, jobs } = useStore();

  const po = customerPos.find(p => p.id === id);
  if (!po) return <div className="p-6 text-[var(--text-2)]">PO not found</div>;

  const poJobs = jobs.filter(j => j.customerPoId === po.id);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate('/sales')} className="text-[var(--text-3)] hover:text-[var(--text)]"><ArrowLeft size={16} /></button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-[var(--text)] font-mono">{po.poNumber}</h1>
            <StatusChip status={po.status} />
            {po.hasAmendment && <span className="text-xs bg-[var(--warning-bg)] text-[var(--warning)] border border-[var(--warning)] px-2 py-0.5 rounded-full font-medium">Amendment</span>}
          </div>
          <p className="text-sm text-[var(--text-2)]">{po.customerName}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <h3 className="font-semibold text-sm text-[var(--text)] mb-3">PO Details</h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <Field label="Customer" value={po.customerName} />
              <Field label="PO Number" value={po.poNumber} mono />
              <Field label="Accepted Date" value={new Date(po.acceptedDate).toLocaleDateString('en-IN')} />
              <Field label="Payment Terms" value={po.paymentTerms} />
              <Field label="Delivery Terms" value={po.deliveryTerms} />
              <Field label="Total Value" value={`₹${po.totalValue.toLocaleString('en-IN')}`} />
              <Field label="Lines" value={String(po.lineCount)} />
              <Field label="Currency" value={po.currency} />
              {po.quotationRef && <Field label="Quotation Ref" value={po.quotationRef} mono />}
            </dl>
          </div>

          {/* Jobs under this PO */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-2)]">
              <h3 className="font-semibold text-sm text-[var(--text)]">Linked Jobs ({poJobs.length})</h3>
            </div>
            <table className="eoss-table">
              <thead><tr><th>Job #</th><th>Description</th><th>Stage</th><th>Status</th><th>Value</th></tr></thead>
              <tbody>
                {poJobs.length === 0 && <tr><td colSpan={5} className="text-center py-6 text-sm text-[var(--text-3)]">No jobs linked</td></tr>}
                {poJobs.map(j => (
                  <tr key={j.id} className="cursor-pointer" onClick={() => navigate(`/jobs/${j.id}`)}>
                    <td><span className="font-mono text-xs font-semibold text-[var(--brand)]">{j.jobNumber}</span></td>
                    <td className="text-sm text-[var(--text-2)]">{j.description}</td>
                    <td className="text-sm text-[var(--text-2)]">{j.currentStage}</td>
                    <td><StatusChip status={j.status} size="sm" /></td>
                    <td className="font-mono text-sm">₹{((j.value ?? 0) / 1000).toFixed(0)}k</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Summary</h3>
            <div className="text-3xl font-bold text-[var(--brand)]">₹{(po.totalValue / 1000).toFixed(0)}k</div>
            <div className="text-xs text-[var(--text-2)] mt-1">{po.lineCount} line items · {po.currency}</div>
            <div className="mt-3 pt-3 border-t border-[var(--border)]">
              <StatusChip status={po.status} />
            </div>
          </div>
        </div>
      </div>
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
