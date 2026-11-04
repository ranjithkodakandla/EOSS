import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useStore, SUPPLIERS, SUPPLIER_PO_LINES } from '../../store';
import StatusChip from '../../components/layout/StatusChip';

export default function SupplierDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { supplierPOs } = useStore();

  const supplier = SUPPLIERS.find(s => s.id === id);
  if (!supplier) return <div className="p-6 text-[var(--text-2)]">Supplier not found</div>;

  const pos = supplierPOs.filter(p => p.supplierId === id);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate('/suppliers')} className="text-[var(--text-3)] hover:text-[var(--text)]"><ArrowLeft size={16} /></button>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm font-bold text-[var(--brand)]">{supplier.code}</span>
            <StatusChip status={supplier.status} />
            {supplier.isPreferred && <span className="text-[9px] font-bold bg-[var(--brand)] text-white px-1.5 py-0.5 rounded-full">PREFERRED</span>}
          </div>
          <h1 className="text-lg font-bold text-[var(--text)]">{supplier.name}</h1>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Supplier Details</h3>
            <dl className="space-y-2.5 text-sm">
              <Field label="Category" value={supplier.category} />
              <Field label="City / State" value={`${supplier.city}, ${supplier.state}`} />
              {supplier.gstin && <Field label="GSTIN" value={supplier.gstin} mono />}
              {supplier.pan && <Field label="PAN" value={supplier.pan} mono />}
              <Field label="Credit Days" value={`${supplier.creditDays} days`} />
              {supplier.paymentTerms && <Field label="Payment Terms" value={supplier.paymentTerms} />}
              {supplier.qualityRating && <Field label="Quality Rating" value={`${supplier.qualityRating.toFixed(1)} / 5.0`} />}
              {supplier.deliveryRating && <Field label="Delivery Rating" value={`${supplier.deliveryRating.toFixed(1)} / 5.0`} />}
            </dl>
          </div>

          {supplier.contacts && supplier.contacts.length > 0 && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Contacts</h3>
              <div className="space-y-3">
                {supplier.contacts.map((c, i) => (
                  <div key={i} className="text-sm">
                    <div className="font-medium text-[var(--text)]">{c.name}</div>
                    <div className="text-xs text-[var(--text-3)]">{c.role} · {c.phone}</div>
                    {c.email && <div className="text-xs text-[var(--text-3)]">{c.email}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Purchase Orders ({pos.length})</h3>
            {pos.length === 0 ? <p className="text-sm text-[var(--text-3)]">No POs placed with this supplier</p> : (
              <div className="space-y-2">
                {pos.map(p => (
                  <div key={p.id} className="flex items-center justify-between cursor-pointer hover:bg-[var(--surface-2)] -mx-2 px-2 py-1.5 rounded-lg" onClick={() => navigate(`/procurement/spo/${p.id}`)}>
                    <div>
                      <div className="font-mono text-xs font-semibold text-[var(--brand)]">{p.spoNumber}</div>
                      <div className="text-xs text-[var(--text-3)]">{new Date(p.orderDate).toLocaleDateString('en-IN')}</div>
                    </div>
                    <div className="text-right">
                      <StatusChip status={p.status} size="sm" />
                      <div className="text-xs text-[var(--text-2)] mt-0.5">₹{p.totalValue.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {supplier.bankDetails && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Bank Details</h3>
              <dl className="space-y-2 text-sm">
                <Field label="Bank" value={supplier.bankDetails.bankName} />
                <Field label="Account" value={supplier.bankDetails.accountNumber} mono />
                <Field label="IFSC" value={supplier.bankDetails.ifsc} mono />
              </dl>
            </div>
          )}
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
