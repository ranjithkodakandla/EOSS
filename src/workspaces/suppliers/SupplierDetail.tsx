import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';

export default function SupplierDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { suppliers, supplierPos, materials } = useStore();

  const supplier = suppliers.find(s => s.id === id);
  if (!supplier) return <div className="p-6 text-[var(--text-2)]">Supplier not found</div>;

  const pos = supplierPos.filter(p => p.supplierId === id);
  const suppliedItems = materials.filter(m => m.preferredSupplierIds?.includes(id ?? ''));

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate('/suppliers')} className="text-[var(--text-3)] hover:text-[var(--text)]"><ArrowLeft size={16} /></button>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-[var(--text-3)]">{supplier.id}</span>
            <StatusChip status={supplier.status} />
          </div>
          <h1 className="text-lg font-bold text-[var(--text)]">{supplier.tradingName}</h1>
          {supplier.legalName !== supplier.tradingName && (
            <p className="text-xs text-[var(--text-3)]">{supplier.legalName}</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Supplier Details</h3>
            <dl className="space-y-2.5 text-sm">
              <Field label="Category" value={supplier.category ?? '—'} />
              <Field label="City / State" value={`${supplier.city}, ${supplier.state}`} />
              {supplier.gstin && <Field label="GSTIN" value={supplier.gstin} mono />}
              {supplier.panNumber && <Field label="PAN" value={supplier.panNumber} mono />}
              <Field label="Payment Terms" value={supplier.paymentTerms} />
              {supplier.rating != null && <Field label="Rating" value={`${supplier.rating.toFixed(1)} / 5.0`} />}
              {supplier.since && <Field label="Partner Since" value={supplier.since} />}
            </dl>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Contact</h3>
            <dl className="space-y-2.5 text-sm">
              {supplier.contactPerson && <Field label="Contact Person" value={supplier.contactPerson} />}
              {supplier.phone && <Field label="Phone" value={supplier.phone} mono />}
              {supplier.email && <Field label="Email" value={supplier.email} />}
            </dl>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Supplier Purchase Orders ({pos.length})</h3>
            {pos.length === 0 ? <p className="text-sm text-[var(--text-3)]">No POs placed with this supplier</p> : (
              <div className="space-y-2">
                {pos.map(p => (
                  <div key={p.id} className="flex items-center justify-between cursor-pointer hover:bg-[var(--surface-2)] -mx-2 px-2 py-1.5 rounded-lg" onClick={() => navigate(`/procurement/${p.id}`)}>
                    <div>
                      <div className="font-mono text-xs font-semibold text-[var(--brand)]">{p.spoNumber ?? p.id}</div>
                      {p.orderDate && <div className="text-xs text-[var(--text-3)]">{new Date(p.orderDate).toLocaleDateString('en-IN')}</div>}
                    </div>
                    <div className="text-right">
                      <StatusChip status={p.status} size="sm" />
                      {p.totalValue != null && <div className="text-xs text-[var(--text-2)] mt-0.5">₹{p.totalValue.toLocaleString('en-IN')}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Supplied Inventory Items ({suppliedItems.length})</h3>
            {suppliedItems.length === 0 ? <p className="text-sm text-[var(--text-3)]">No supplier-item associations are recorded.</p> : <div className="space-y-2">{suppliedItems.map(item => <div key={item.id} className="flex items-center justify-between rounded-lg border p-2.5" style={{ borderColor: 'var(--border)' }}><div><div className="text-sm font-medium text-[var(--text)]">{item.name}</div><div className="text-xs text-[var(--text-2)]">{item.itemCode} · {item.categoryName}</div></div><span className="text-xs text-[var(--text-2)]">{item.primaryUom}</span></div>)}</div>}
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
