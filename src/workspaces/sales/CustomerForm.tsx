import React, { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import type { Party } from '../../types';

export default function CustomerForm({ customer, title, onSave, onCancel }: { customer: Party; title: string; onSave: (patch: Partial<Party>) => void; onCancel: () => void }) {
  const [form, setForm] = useState({ ...customer });
  const [error, setError] = useState('');
  const update = (key: keyof Party, value: string | number) => setForm(prev => ({ ...prev, [key]: value }));
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.legalName.trim() || !form.city.trim() || !form.contactPerson.trim()) return setError('Legal name, city and contact person are required.');
    if (form.gstin && !/^[0-9A-Z]{15}$/.test(form.gstin.toUpperCase())) return setError('GSTIN must be 15 uppercase characters.');
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) return setError('Enter a valid email address.');
    if (form.phone && !/^[0-9+() -]{8,18}$/.test(form.phone)) return setError('Enter a valid contact number.');
    onSave({ legalName: form.legalName.trim(), tradingName: form.tradingName.trim(), gstin: form.gstin.toUpperCase(), panNumber: form.panNumber.toUpperCase(), city: form.city.trim(), state: form.state.trim(), contactPerson: form.contactPerson.trim(), phone: form.phone.trim(), email: form.email.trim(), paymentTerms: form.paymentTerms, creditLimit: Number(form.creditLimit) || 0 });
  };
  const fields: { key: keyof Party; label: string; type?: string; required?: boolean }[] = [
    { key: 'legalName', label: 'Legal / Business Name', required: true }, { key: 'tradingName', label: 'Trading Name' },
    { key: 'contactPerson', label: 'Primary Contact', required: true }, { key: 'email', label: 'Email', type: 'email' },
    { key: 'phone', label: 'Phone' }, { key: 'gstin', label: 'GSTIN' }, { key: 'panNumber', label: 'PAN' },
    { key: 'city', label: 'City', required: true }, { key: 'state', label: 'State' },
  ];
  return <form onSubmit={save} className="flex flex-col h-full">
    <div className="flex-shrink-0 flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}><button type="button" onClick={onCancel} className="p-1.5 rounded-lg hover:bg-[var(--surface-2)]"><ArrowLeft size={18} style={{ color: 'var(--text-2)' }} /></button><div><h1 className="text-lg font-bold" style={{ color: 'var(--text)' }}>{title}</h1><p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>Canonical customer master form used by all edit entry points</p></div></div>
    <div className="flex-1 overflow-auto p-6"><div className="max-w-3xl mx-auto space-y-5"><section className="rounded-xl border p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}><h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text)' }}>Business identity and contact</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{fields.map(field => <label key={field.key} className="text-xs font-medium" style={{ color: 'var(--text-2)' }}>{field.label}{field.required ? ' *' : ''}<input required={field.required} type={field.type ?? 'text'} value={String(form[field.key] ?? '')} onChange={e => update(field.key, e.target.value)} className="eoss-input w-full mt-1" /></label>)}</div></section><section className="rounded-xl border p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}><h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text)' }}>Commercial terms</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><label className="text-xs font-medium" style={{ color: 'var(--text-2)' }}>Payment Terms<select value={form.paymentTerms} onChange={e => update('paymentTerms', e.target.value)} className="eoss-input w-full mt-1">{['Advance', 'Net 15', 'Net 30', 'Net 45', 'Net 60'].map(v => <option key={v}>{v}</option>)}</select></label><label className="text-xs font-medium" style={{ color: 'var(--text-2)' }}>Credit Limit (₹)<input type="number" min="0" value={form.creditLimit ?? 0} onChange={e => update('creditLimit', Number(e.target.value))} className="eoss-input w-full mt-1" /></label></div></section>{error && <p className="text-sm" style={{ color: 'var(--error,#DC2626)' }}>{error}</p>}</div></div>
    <div className="flex-shrink-0 flex justify-between px-6 py-4 border-t" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}><button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}>Cancel</button><button type="submit" className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: 'var(--brand)' }}><Save size={14} /> Save Customer</button></div>
  </form>;
}
