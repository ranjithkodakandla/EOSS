import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Phone, Mail, MapPin, FileText, ShoppingCart, Star, Edit2 } from 'lucide-react';
import { CUSTOMERS } from '../../store';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';

type Tab = 'overview' | 'orders' | 'contacts' | 'documents';

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customerPos } = useStore();
  const [tab, setTab] = useState<Tab>('overview');

  const customer = CUSTOMERS.find(c => c.id === id);
  if (!customer) {
    return (
      <div className="p-8 text-center text-[var(--text-secondary,#626A84)]">
        Customer not found.{' '}
        <button onClick={() => navigate('/sales/customers')} className="underline text-[var(--brand,#7048F5)]">
          Back to directory
        </button>
      </div>
    );
  }

  const customerOrders = customerPos.filter(po => po.customerId === id);

  const TABS: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'orders', label: `Orders (${customerOrders.length})` },
    { key: 'contacts', label: 'Contacts' },
    { key: 'documents', label: 'Documents' },
  ];

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-5">
      {/* Back + Header */}
      <div>
        <button
          onClick={() => navigate('/sales/customers')}
          className="flex items-center gap-1.5 text-sm text-[var(--text-secondary,#626A84)] hover:text-[var(--brand,#7048F5)] mb-3 cursor-pointer transition-colors"
        >
          <ArrowLeft size={14} /> Customer Directory
        </button>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary,#1A1F36)]">{customer.tradingName}</h1>
            <p className="text-sm text-[var(--text-secondary,#626A84)]">{customer.legalName} · {customer.partyType}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusChip status={customer.status as 'active' | 'archived'} />
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border cursor-pointer hover:opacity-80 transition"
              style={{ borderColor: 'var(--border,#E5E7EB)', color: 'var(--brand,#7048F5)' }}
            >
              <Edit2 size={13} /> Edit
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b" style={{ borderColor: 'var(--border,#E5E7EB)' }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors cursor-pointer ${tab === t.key ? 'border-[var(--brand,#7048F5)] text-[var(--brand,#7048F5)]' : 'border-transparent text-[var(--text-secondary,#626A84)]'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Identity Card */}
          <div className="rounded-2xl border p-4 space-y-3" style={{ borderColor: 'var(--border,#E5E7EB)', background: 'var(--surface,#FFFFFF)' }}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary,#626A84)]">Identity</h3>
            <InfoRow icon={Building2} label="PAN" value={customer.panNumber} />
            <InfoRow icon={FileText} label="GSTIN" value={customer.gstin} />
            <InfoRow icon={MapPin} label="State" value={`${customer.state} · ${customer.city}`} />
          </div>

          {/* Contact Card */}
          <div className="rounded-2xl border p-4 space-y-3" style={{ borderColor: 'var(--border,#E5E7EB)', background: 'var(--surface,#FFFFFF)' }}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary,#626A84)]">Contact</h3>
            <InfoRow icon={Building2} label="Contact" value={customer.contactPerson} />
            <InfoRow icon={Phone} label="Phone" value={customer.phone} />
            <InfoRow icon={Mail} label="Email" value={customer.email} />
          </div>

          {/* Commercial Card */}
          <div className="rounded-2xl border p-4 space-y-3" style={{ borderColor: 'var(--border,#E5E7EB)', background: 'var(--surface,#FFFFFF)' }}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary,#626A84)]">Commercial</h3>
            <InfoRow icon={FileText} label="Payment Terms" value={customer.paymentTerms} />
            <InfoRow icon={ShoppingCart} label="Currency" value={customer.currency} />
            {customer.creditLimit != null && (
              <InfoRow icon={FileText} label="Credit Limit" value={`₹${customer.creditLimit.toLocaleString('en-IN')}`} />
            )}
            {customer.rating != null && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-secondary,#626A84)]">Rating</span>
                <div className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                  <Star size={12} className="fill-current" />
                  {customer.rating.toFixed(1)} / 5
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border,#E5E7EB)', background: 'var(--surface,#FFFFFF)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border,#E5E7EB)', background: 'var(--surface-muted,#F8F9FC)' }}>
                {['PO Number', 'Accepted', 'Value', 'Lines', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-[var(--text-secondary,#626A84)] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customerOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-[var(--text-secondary,#626A84)]">No orders on record.</td>
                </tr>
              ) : customerOrders.map((po, i) => (
                <tr
                  key={po.id}
                  className="hover:bg-[var(--surface-muted,#F8F9FC)] cursor-pointer"
                  style={{ borderBottom: i < customerOrders.length - 1 ? '1px solid var(--border,#E5E7EB)' : 'none' }}
                  onClick={() => navigate(`/sales/po/${po.id}`)}
                >
                  <td className="px-4 py-3 font-semibold text-[var(--brand,#7048F5)]">{po.poNumber}</td>
                  <td className="px-4 py-3 text-xs text-[var(--text-secondary,#626A84)]">{po.acceptedDate}</td>
                  <td className="px-4 py-3 font-semibold text-[var(--text-primary,#1A1F36)]">
                    {po.currency} {po.totalValue.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--text-secondary,#626A84)]">{po.lineCount}</td>
                  <td className="px-4 py-3"><StatusChip status={po.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'contacts' && (
        <div className="rounded-2xl border p-5 space-y-3" style={{ borderColor: 'var(--border,#E5E7EB)', background: 'var(--surface,#FFFFFF)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm" style={{ background: 'var(--brand,#7048F5)' }}>
              {customer.contactPerson.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div className="font-semibold text-[var(--text-primary,#1A1F36)]">{customer.contactPerson}</div>
              <div className="text-xs text-[var(--text-secondary,#626A84)]">Primary Contact · {customer.email}</div>
            </div>
          </div>
          <p className="text-xs text-[var(--text-secondary,#626A84)]">Additional contacts can be added via the Edit panel.</p>
        </div>
      )}

      {tab === 'documents' && (
        <div className="rounded-2xl border p-5 text-center" style={{ borderColor: 'var(--border,#E5E7EB)', background: 'var(--surface,#FFFFFF)' }}>
          <FileText size={32} className="mx-auto mb-2 text-[var(--text-secondary,#626A84)]" />
          <p className="text-sm text-[var(--text-secondary,#626A84)]">Customer documents managed in the Document Vault.</p>
          <button
            onClick={() => navigate('/documents')}
            className="mt-3 px-4 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer hover:opacity-90"
            style={{ background: 'var(--brand,#7048F5)' }}
          >
            Open Document Vault
          </button>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-xs text-[var(--text-secondary,#626A84)]">
        <Icon size={13} />
        {label}
      </div>
      <span className="text-xs font-semibold text-[var(--text-primary,#1A1F36)] text-right max-w-[55%] truncate">{value}</span>
    </div>
  );
}
