import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ChevronRight, ChevronLeft, Factory, Package, Store, Users, Shield, Building2, AlertCircle } from 'lucide-react';
import { useStore } from '../../store';

type BusinessType = 'manufacturing' | 'fabrication' | 'trading' | 'mixed';

interface Step1Data { businessType: BusinessType }
interface Step2Data {
  companyName: string; tradingName: string; legalName: string; entityType: string;
  pan: string; address: string; city: string; state: string; pincode: string;
  phone: string; email: string; financialYear: string; currency: string;
}
interface GSTEntry { gstin: string; state: string; type: string; notApplicable: boolean }
interface SiteEntry { name: string; type: 'factory' | 'warehouse' | 'office' | 'branch'; address: string; city: string; state: string; isPrimary: boolean }
interface StoreEntry { name: string; code: string }

const STEPS = [
  { id: 1, label: 'Welcome', icon: Building2 },
  { id: 2, label: 'Company', icon: Building2 },
  { id: 3, label: 'GST', icon: Shield },
  { id: 4, label: 'Sites', icon: Factory },
  { id: 5, label: 'Stores', icon: Store },
  { id: 6, label: 'Users', icon: Users },
  { id: 7, label: 'Review', icon: CheckCircle },
];

const DEFAULT_STORES: StoreEntry[] = [
  { name: 'Raw Material Store', code: 'RM' },
  { name: 'WIP Store', code: 'WIP' },
  { name: 'Finished Goods Store', code: 'FG' },
  { name: 'Quarantine Store', code: 'QRN' },
  { name: 'Spare Parts Store', code: 'SPR' },
  { name: 'Dispatch Bay', code: 'DSP' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { completeOnboarding, updateCompanyConfig, showToast } = useStore();

  const [step, setStep] = useState(1);
  const [step1, setStep1] = useState<Step1Data>({ businessType: 'manufacturing' });
  const [step2, setStep2] = useState<Step2Data>({
    companyName: '', tradingName: '', legalName: '', entityType: 'Private Limited',
    pan: '', address: '', city: '', state: '', pincode: '',
    phone: '', email: '', financialYear: '2026-27', currency: 'INR',
  });
  const [gstEntries, setGstEntries] = useState<GSTEntry[]>([
    { gstin: '', state: '', type: 'Regular', notApplicable: false }
  ]);
  const [sites, setSites] = useState<SiteEntry[]>([
    { name: '', type: 'factory', address: '', city: '', state: '', isPrimary: true }
  ]);
  const [stores, setStores] = useState<StoreEntry[]>([...DEFAULT_STORES]);
  const [err, setErr] = useState('');

  const validateStep = (): boolean => {
    setErr('');
    if (step === 2) {
      if (!step2.companyName || !step2.legalName || !step2.city || !step2.state || !step2.email) {
        setErr('Company name, legal name, city, state and email are required.'); return false;
      }
    }
    if (step === 4) {
      if (!sites[0]?.name || !sites[0]?.city) {
        setErr('At least one site with name and city is required.'); return false;
      }
    }
    return true;
  };

  const next = () => { if (!validateStep()) return; setStep(s => Math.min(s + 1, 7)); };
  const back = () => { setErr(''); setStep(s => Math.max(s - 1, 1)); };

  const finish = () => {
    updateCompanyConfig({
      companyName: step2.companyName || 'My Company',
      tradingName: step2.tradingName || step2.companyName,
      businessType: step1.businessType as 'manufacturing',
      legalName: step2.legalName,
      entityType: step2.entityType,
      pan: step2.pan,
      registeredAddress: step2.address,
      city: step2.city,
      state: step2.state,
      phone: step2.phone,
      email: step2.email,
      financialYear: step2.financialYear,
      currency: step2.currency,
      onboardingComplete: true,
    });
    completeOnboarding();
    showToast({ type: 'success', title: 'EOSS activated!', body: 'Your company is configured. Welcome to EOSS.' });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--brand)] to-purple-500 flex items-center justify-center shadow-lg">
            <div className="text-white font-black text-sm">E</div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-[var(--text)]">EOSS</div>
            <div className="text-xs text-[var(--text-3)]">Business OS for Indian MSMEs</div>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-1 mb-8 overflow-x-auto pb-1">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${step === s.id ? 'opacity-100' : step > s.id ? 'opacity-70' : 'opacity-30'}`} onClick={() => step > s.id && setStep(s.id)}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${step === s.id ? 'bg-[var(--brand)] border-[var(--brand)] text-white' : step > s.id ? 'bg-[var(--success)] border-[var(--success)] text-white' : 'border-[var(--border)] text-[var(--text-3)]'}`}>
                  {step > s.id ? <CheckCircle size={14} /> : s.id}
                </div>
                <span className="text-[10px] text-[var(--text-3)] whitespace-nowrap hidden sm:block">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 w-6 md:w-10 rounded flex-shrink-0 ${step > s.id ? 'bg-[var(--success)]' : 'bg-[var(--border)]'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Card */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 md:p-8 shadow-lg">
          {err && (
            <div className="mb-4 p-3 rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/8 flex gap-2 text-sm text-[var(--danger)]">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" /> {err}
            </div>
          )}

          {/* Step 1: Welcome */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-extrabold text-[var(--text)] mb-1">Welcome to EOSS</h2>
              <p className="text-sm text-[var(--text-2)] mb-6">Let's configure your business workspace in a few simple steps. This takes about 5 minutes.</p>
              <h3 className="text-sm font-semibold text-[var(--text)] mb-3">What best describes your operations?</h3>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { key: 'manufacturing', label: 'Manufacturing', desc: 'Make products from raw materials', icon: Factory },
                  { key: 'fabrication', label: 'Industrial Fabrication', desc: 'Custom fabrication and job work', icon: Package },
                  { key: 'trading', label: 'Trading / Distribution', desc: 'Buy and sell without manufacturing', icon: Store },
                  { key: 'mixed', label: 'Mixed Operations', desc: 'Manufacturing + trading combined', icon: Building2 },
                ] as const).map(opt => (
                  <button key={opt.key} onClick={() => setStep1({ businessType: opt.key })}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${step1.businessType === opt.key ? 'border-[var(--brand)] bg-[var(--brand)]/5' : 'border-[var(--border)] hover:border-[var(--brand)]/40'}`}>
                    <opt.icon size={20} className={step1.businessType === opt.key ? 'text-[var(--brand)]' : 'text-[var(--text-3)]'} />
                    <div className="mt-2 font-semibold text-sm text-[var(--text)]">{opt.label}</div>
                    <div className="text-xs text-[var(--text-3)] mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Company Profile */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-[var(--text)] mb-1">Company Profile</h2>
              <p className="text-sm text-[var(--text-2)] mb-5">Your business identity — used across all documents and transactions.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Company Name *</label>
                  <input className="eoss-input w-full" value={step2.companyName} onChange={e => setStep2(s => ({ ...s, companyName: e.target.value }))} placeholder="e.g. Shankar Metalworks Pvt. Ltd." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Trading Name</label>
                  <input className="eoss-input w-full" value={step2.tradingName} onChange={e => setStep2(s => ({ ...s, tradingName: e.target.value }))} placeholder="Shorter commercial name" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Legal Name *</label>
                  <input className="eoss-input w-full" value={step2.legalName} onChange={e => setStep2(s => ({ ...s, legalName: e.target.value }))} placeholder="As per company registration" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Entity Type</label>
                  <select className="eoss-input w-full" value={step2.entityType} onChange={e => setStep2(s => ({ ...s, entityType: e.target.value }))}>
                    {['Private Limited', 'Public Limited', 'LLP', 'Partnership', 'Proprietorship', 'OPC'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-2)] mb-1">PAN</label>
                  <input className="eoss-input w-full" value={step2.pan} onChange={e => setStep2(s => ({ ...s, pan: e.target.value.toUpperCase() }))} placeholder="AAAAA9999A" maxLength={10} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Email *</label>
                  <input type="email" className="eoss-input w-full" value={step2.email} onChange={e => setStep2(s => ({ ...s, email: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Phone</label>
                  <input className="eoss-input w-full" value={step2.phone} onChange={e => setStep2(s => ({ ...s, phone: e.target.value }))} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Registered Address</label>
                  <input className="eoss-input w-full" value={step2.address} onChange={e => setStep2(s => ({ ...s, address: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-2)] mb-1">City *</label>
                  <input className="eoss-input w-full" value={step2.city} onChange={e => setStep2(s => ({ ...s, city: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-2)] mb-1">State *</label>
                  <input className="eoss-input w-full" value={step2.state} onChange={e => setStep2(s => ({ ...s, state: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Financial Year</label>
                  <select className="eoss-input w-full" value={step2.financialYear} onChange={e => setStep2(s => ({ ...s, financialYear: e.target.value }))}>
                    {['2026-27', '2025-26'].map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Currency</label>
                  <select className="eoss-input w-full" value={step2.currency} onChange={e => setStep2(s => ({ ...s, currency: e.target.value }))}>
                    {['INR (₹)'].map(c => <option key={c} value="INR">{c}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: GST */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-[var(--text)] mb-1">GST Registrations</h2>
              <p className="text-sm text-[var(--text-2)] mb-5">Add your GSTIN(s). If not registered, select Not Applicable.</p>
              {gstEntries.map((g, i) => (
                <div key={i} className="border border-[var(--border)] rounded-xl p-4 mb-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-[var(--text)]">Registration {i + 1}</span>
                    <label className="flex items-center gap-2 text-sm text-[var(--text-2)] cursor-pointer">
                      <input type="checkbox" checked={g.notApplicable} onChange={e => {
                        const updated = [...gstEntries];
                        updated[i] = { ...g, notApplicable: e.target.checked };
                        setGstEntries(updated);
                      }} />
                      Not Applicable
                    </label>
                  </div>
                  {!g.notApplicable && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-[var(--text-2)] mb-1">GSTIN</label>
                        <input className="eoss-input w-full" value={g.gstin} onChange={e => {
                          const u = [...gstEntries]; u[i] = { ...g, gstin: e.target.value.toUpperCase() }; setGstEntries(u);
                        }} placeholder="29AABCP1234F1Z5" maxLength={15} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Registration State</label>
                        <input className="eoss-input w-full" value={g.state} onChange={e => {
                          const u = [...gstEntries]; u[i] = { ...g, state: e.target.value }; setGstEntries(u);
                        }} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <button onClick={() => setGstEntries([...gstEntries, { gstin: '', state: '', type: 'Regular', notApplicable: false }])}
                className="text-sm text-[var(--brand)] font-medium hover:underline">
                + Add another GSTIN
              </button>
            </div>
          )}

          {/* Step 4: Sites */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold text-[var(--text)] mb-1">Sites & Locations</h2>
              <p className="text-sm text-[var(--text-2)] mb-5">Add your physical premises. At least one site is required.</p>
              {sites.map((site, i) => (
                <div key={i} className="border border-[var(--border)] rounded-xl p-4 mb-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-[var(--text)]">Site {i + 1}</span>
                    <label className="flex items-center gap-2 text-xs text-[var(--brand)] cursor-pointer">
                      <input type="radio" name="primarySite" checked={site.isPrimary} onChange={() => {
                        setSites(sites.map((s, j) => ({ ...s, isPrimary: j === i })));
                      }} />
                      Primary Site
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Site Name *</label>
                      <input className="eoss-input w-full" value={site.name} onChange={e => { const u = [...sites]; u[i] = { ...site, name: e.target.value }; setSites(u); }} placeholder="e.g. Hyderabad Factory" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Type</label>
                      <select className="eoss-input w-full" value={site.type} onChange={e => { const u = [...sites]; u[i] = { ...site, type: e.target.value as SiteEntry['type'] }; setSites(u); }}>
                        {(['factory', 'warehouse', 'office', 'branch'] as const).map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-2)] mb-1">City *</label>
                      <input className="eoss-input w-full" value={site.city} onChange={e => { const u = [...sites]; u[i] = { ...site, city: e.target.value }; setSites(u); }} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-2)] mb-1">State</label>
                      <input className="eoss-input w-full" value={site.state} onChange={e => { const u = [...sites]; u[i] = { ...site, state: e.target.value }; setSites(u); }} />
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => setSites([...sites, { name: '', type: 'factory', address: '', city: '', state: '', isPrimary: false }])}
                className="text-sm text-[var(--brand)] font-medium hover:underline">
                + Add another site
              </button>
            </div>
          )}

          {/* Step 5: Store Locations */}
          {step === 5 && (
            <div>
              <h2 className="text-xl font-bold text-[var(--text)] mb-1">Stores & Operating Areas</h2>
              <p className="text-sm text-[var(--text-2)] mb-5">Default stock-holding areas have been pre-configured. Add or remove as needed.</p>
              <div className="space-y-2">
                {stores.map((store, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 border border-[var(--border)] rounded-xl">
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <input className="eoss-input" value={store.name} onChange={e => { const u = [...stores]; u[i] = { ...store, name: e.target.value }; setStores(u); }} placeholder="Store name" />
                      <input className="eoss-input" value={store.code} onChange={e => { const u = [...stores]; u[i] = { ...store, code: e.target.value.toUpperCase() }; setStores(u); }} placeholder="Code" maxLength={6} />
                    </div>
                    <button onClick={() => setStores(stores.filter((_, j) => j !== i))} className="text-[var(--danger)] text-xs hover:underline flex-shrink-0">Remove</button>
                  </div>
                ))}
              </div>
              <button onClick={() => setStores([...stores, { name: '', code: '' }])} className="mt-3 text-sm text-[var(--brand)] font-medium hover:underline">
                + Add store location
              </button>
            </div>
          )}

          {/* Step 6: Users */}
          {step === 6 && <Step6Users />}

          {/* Step 7: Review */}
          {step === 7 && (
            <div>
              <h2 className="text-xl font-bold text-[var(--text)] mb-1">Review & Activate</h2>
              <p className="text-sm text-[var(--text-2)] mb-5">Review your configuration before activating EOSS for your business.</p>
              <div className="space-y-3">
                <ReviewSection label="Business Type" value={step1.businessType.charAt(0).toUpperCase() + step1.businessType.slice(1)} />
                <ReviewSection label="Company Name" value={step2.companyName || '—'} required />
                <ReviewSection label="Legal Name" value={step2.legalName || '—'} required />
                <ReviewSection label="Entity Type" value={step2.entityType} />
                <ReviewSection label="Location" value={[step2.city, step2.state].filter(Boolean).join(', ') || '—'} required />
                <ReviewSection label="Financial Year" value={step2.financialYear} />
                <ReviewSection label="Currency" value={step2.currency} />
                <ReviewSection label="GST" value={gstEntries[0]?.notApplicable ? 'Not Applicable' : gstEntries[0]?.gstin || 'Not entered'} />
                <ReviewSection label="Primary Site" value={sites.find(s => s.isPrimary)?.name || sites[0]?.name || '—'} required />
                <ReviewSection label="Store Locations" value={`${stores.filter(s => s.name).length} configured`} />
              </div>
              <div className="mt-5 p-3 rounded-xl border border-[var(--success)]/30 bg-[var(--success)]/5 flex items-start gap-2">
                <CheckCircle size={16} className="text-[var(--success)] mt-0.5 flex-shrink-0" />
                <p className="text-xs text-[var(--text-2)]">All mandatory configuration is complete. Click <strong>Activate EOSS</strong> to start using your workspace.</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <button onClick={back} className="flex items-center gap-2 px-4 py-2.5 border border-[var(--border)] rounded-xl text-sm text-[var(--text-2)] hover:border-[var(--brand)] transition-colors">
                <ChevronLeft size={16} /> Back
              </button>
            )}
            {step < 7 ? (
              <button onClick={next} className="ml-auto flex items-center gap-2 px-5 py-2.5 bg-[var(--brand)] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
                Save & Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={finish} className="ml-auto flex items-center gap-2 px-6 py-2.5 bg-[var(--success)] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
                <CheckCircle size={16} /> Activate EOSS
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const ROLE_CAPS = [
  { role: 'Owner', access: 'Full access to all workspaces, settings and approvals' },
  { role: 'Sales Manager', access: 'Sales, Customers, Dispatch — Read/Write' },
  { role: 'Production Supervisor', access: 'Production, Quality, Inventory — Read/Write' },
  { role: 'Buyer', access: 'Procurement, Suppliers — Read/Write' },
  { role: 'QC Inspector', access: 'Quality — Read/Write; other modules — Read only' },
  { role: 'Store Keeper', access: 'Inventory — Read/Write; other modules — Read only' },
  { role: 'Accounts', access: 'Finance — Read/Write; other modules — Read only' },
  { role: 'Viewer', access: 'All modules — Read only' },
];

function Step6Users() {
  const [users, setUsers] = useState([{ name: 'Owner / Administrator', email: 'ranjith302@gmail.com', role: 'Owner', access: 'Full Access' }]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'Sales Manager' });
  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--text)] mb-1">Users & Access</h2>
      <p className="text-sm text-[var(--text-2)] mb-4">Add team members and assign roles. You can always change this from Admin &amp; Security.</p>

      {/* User table */}
      <div className="rounded-xl border border-[var(--border)] overflow-hidden mb-3">
        <table className="w-full text-sm">
          <thead style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
            <tr>{['Name', 'Email', 'Role', 'Access'].map(h => <th key={h} className="text-left px-3 py-2 text-xs font-semibold text-[var(--text-2)]">{h}</th>)}</tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <td className="px-3 py-2 text-xs font-medium text-[var(--text)]">{u.name}</td>
                <td className="px-3 py-2 text-xs text-[var(--text-2)]">{u.email}</td>
                <td className="px-3 py-2 text-xs text-[var(--text-2)]">{u.role}</td>
                <td className="px-3 py-2 text-xs text-[var(--text-3)]">{u.access}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!showAdd ? (
        <button onClick={() => setShowAdd(true)} className="text-sm text-[var(--brand)] font-medium hover:underline">+ Add User</button>
      ) : (
        <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] space-y-2 mb-3">
          <div className="grid grid-cols-2 gap-2">
            <input className="eoss-input col-span-2 text-xs" placeholder="Full name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <input className="eoss-input text-xs" placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            <select className="eoss-input text-xs" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              {ROLE_CAPS.map(r => <option key={r.role}>{r.role}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { if (form.name && form.email) { setUsers(u => [...u, { name: form.name, email: form.email, role: form.role, access: ROLE_CAPS.find(r => r.role === form.role)?.access.split(';')[0] ?? 'Read/Write' }]); setForm({ name: '', email: '', role: 'Sales Manager' }); setShowAdd(false); } }} className="px-3 py-1.5 bg-[var(--brand)] text-white rounded-lg text-xs font-medium">Add</button>
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 border border-[var(--border)] text-[var(--text-2)] rounded-lg text-xs">Cancel</button>
          </div>
        </div>
      )}

      {/* Role capabilities */}
      <div className="mt-5">
        <div className="text-xs font-semibold text-[var(--text-2)] mb-2">Role Capabilities</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ROLE_CAPS.map(r => (
            <div key={r.role} className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]">
              <div className="text-xs font-semibold text-[var(--text)]">{r.role}</div>
              <div className="text-[11px] text-[var(--text-3)] mt-0.5">{r.access}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReviewSection({ label, value, required }: { label: string; value: string; required?: boolean }) {
  const isMissing = required && (!value || value === '—');
  return (
    <div className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
      <span className="text-sm text-[var(--text-2)]">{label}</span>
      <span className={`text-sm font-medium ${isMissing ? 'text-[var(--danger)]' : 'text-[var(--text)]'}`}>
        {isMissing ? '⚠ Required' : value}
      </span>
    </div>
  );
}
