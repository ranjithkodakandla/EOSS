import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Plus, Trash2, Check, FileText, Package, Settings, Upload, Eye } from 'lucide-react';
import { useStore, CUSTOMERS } from '../../store';
import type { CustomerRFQ } from '../../types';

type Step = 1 | 2 | 3 | 4 | 5;

interface RFQLine {
  id: string;
  lineNumber: number;
  drawingNumber: string;
  drawingRevision: string;
  description: string;
  material: string;
  quantity: number;
  uom: string;
  targetPrice: number | '';
  requiredBy: string;
  notes: string;
}

interface TechReqs {
  standards: string;
  inspectionLevel: string;
  surfaceFinish: string;
  heatTreatment: string;
  packagingRequirements: string;
  traceability: boolean;
  specialNotes: string;
}

const DEMO_NOW = new Date().toISOString().slice(0, 10);

function newLine(n: number): RFQLine {
  return { id: `line-${Date.now()}-${n}`, lineNumber: n, drawingNumber: '', drawingRevision: 'A', description: '', material: '', quantity: 1, uom: 'Nos', targetPrice: '', requiredBy: '', notes: '' };
}

export default function RFQCreate() {
  const navigate = useNavigate();
  const { addRfq, currentUser, showToast } = useStore();
  const [step, setStep] = useState<Step>(1);

  // Step 1: Header
  const [customerId, setCustomerId] = useState('');
  const [channel, setChannel] = useState('Email');
  const [receivedDate, setReceivedDate] = useState(DEMO_NOW);
  const [requiredBy, setRequiredBy] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [deliveryTerms, setDeliveryTerms] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  // Step 2: Lines
  const [lines, setLines] = useState<RFQLine[]>([newLine(1)]);

  // Step 3: Technical
  const [techReqs, setTechReqs] = useState<TechReqs>({
    standards: '', inspectionLevel: '', surfaceFinish: '', heatTreatment: '',
    packagingRequirements: '', traceability: false, specialNotes: '',
  });

  // Step 4: Documents (simulated)
  const [docNotes, setDocNotes] = useState('');

  const customer = CUSTOMERS.find(c => c.id === customerId);

  const addLine = () => setLines(ls => [...ls, newLine(ls.length + 1)]);
  const removeLine = (id: string) => setLines(ls => ls.filter(l => l.id !== id).map((l, i) => ({ ...l, lineNumber: i + 1 })));
  const updateLine = (id: string, field: keyof RFQLine, value: any) =>
    setLines(ls => ls.map(l => l.id === id ? { ...l, [field]: value } : l));

  const canNext: Record<Step, boolean> = {
    1: !!customerId && !!receivedDate && !!requiredBy,
    2: lines.length > 0 && lines.every(l => l.drawingNumber && l.description && l.quantity > 0),
    3: true,
    4: true,
    5: true,
  };

  const handleSubmit = () => {
    const seq = Date.now().toString().slice(-4);
    const rfqNumber = `RFQ-${seq}`;
    const rfq: CustomerRFQ & Record<string, any> = {
      id: `rfq-${seq}`,
      rfqNumber,
      customerId,
      customerName: customer?.tradingName ?? customer?.legalName ?? '',
      receivedDate,
      requiredBy,
      status: 'open',
      lineCount: lines.length,
      channel,
      owner: currentUser.name,
      paymentTerms,
      deliveryTerms,
      internalNotes,
      lines: lines.map(l => ({ ...l, targetPrice: l.targetPrice === '' ? null : l.targetPrice })) as unknown as CustomerRFQ['lines'],
      technicalRequirements: {
        standards: techReqs.standards ? techReqs.standards.split('\n').map(s => s.trim()).filter(Boolean) : [],
        inspectionLevel: techReqs.inspectionLevel,
        surfaceFinish: techReqs.surfaceFinish,
        heatTreatment: techReqs.heatTreatment,
        packagingRequirements: techReqs.packagingRequirements,
        traceability: techReqs.traceability,
        specialNotes: techReqs.specialNotes,
      },
      documents: docNotes ? [{ id: `doc-${seq}`, name: 'Notes', type: 'Notes', revision: '—', notes: docNotes }] as unknown as CustomerRFQ['documents'] : [],
      clarifications: [],
      revisions: [{ id: `rev-${seq}`, revision: 1, changedBy: currentUser.name, changeDescription: 'Initial issue', changedAt: DEMO_NOW }],
    };
    addRfq(rfq as unknown as CustomerRFQ);
    showToast({ type: 'success', title: 'RFQ created', body: `${rfqNumber} opened for ${rfq.customerName}.` });
    navigate(`/sales/rfq/${rfq.id}`);
  };

  const steps = [
    { n: 1 as Step, label: 'Header', icon: FileText },
    { n: 2 as Step, label: 'Line Items', icon: Package },
    { n: 3 as Step, label: 'Technical', icon: Settings },
    { n: 4 as Step, label: 'Documents', icon: Upload },
    { n: 5 as Step, label: 'Review', icon: Eye },
  ];

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Top bar */}
      <div className="flex-shrink-0 px-6 py-4 border-b flex items-center gap-3" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <button onClick={() => navigate('/sales?tab=rfqs')} className="p-1.5 rounded-lg hover:bg-[var(--surface-2)]">
          <ArrowLeft size={18} className="text-[var(--text-2)]" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-[var(--text)]">New RFQ</h1>
          <p className="text-xs text-[var(--text-2)]">Customer Request for Quotation — commercial &amp; technical enquiry</p>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex-shrink-0 px-6 py-3 border-b flex items-center gap-0 overflow-x-auto" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        {steps.map((s, i) => {
          const Icon = s.icon;
          const done = step > s.n;
          const active = step === s.n;
          return (
            <React.Fragment key={s.n}>
              <button
                onClick={() => done || active ? setStep(s.n) : undefined}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex-shrink-0 ${
                  active ? 'bg-[var(--brand-fill)] text-white' :
                  done ? 'text-[var(--brand)] hover:bg-[var(--surface-2)]' :
                  'text-[var(--text-3)] cursor-default'
                }`}
              >
                {done ? <Check size={13} /> : <Icon size={13} />}
                {s.label}
              </button>
              {i < steps.length - 1 && <div className="w-6 h-px bg-[var(--border)] flex-shrink-0 mx-1" />}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto">

          {/* Step 1: Header */}
          {step === 1 && (
            <div className="space-y-5">
              <FormCard title="Customer & Channel">
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Customer *">
                    <select value={customerId} onChange={e => setCustomerId(e.target.value)} className="eoss-input">
                      <option value="">— Select customer —</option>
                      {CUSTOMERS.map(c => <option key={c.id} value={c.id}>{c.tradingName ?? c.legalName}</option>)}
                    </select>
                  </Field>
                  <Field label="Received Via">
                    <select value={channel} onChange={e => setChannel(e.target.value)} className="eoss-input">
                      {['Email', 'Portal', 'WhatsApp', 'Phone', 'In Person', 'Post'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Received Date *">
                    <input type="date" value={receivedDate} onChange={e => setReceivedDate(e.target.value)} className="eoss-input" />
                  </Field>
                  <Field label="Required By *">
                    <input type="date" value={requiredBy} onChange={e => setRequiredBy(e.target.value)} className="eoss-input" />
                  </Field>
                </div>
              </FormCard>
              <FormCard title="Commercial Terms">
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Payment Terms">
                    <select value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} className="eoss-input">
                      {['Net 30', 'Net 45', 'Net 60', 'Net 90', '50% Advance + 50% on Delivery', 'LC at Sight', 'Cash on Delivery'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Delivery Terms">
                    <input type="text" value={deliveryTerms} onChange={e => setDeliveryTerms(e.target.value)} className="eoss-input" placeholder="e.g. FOB Hyderabad" />
                  </Field>
                </div>
              </FormCard>
              <FormCard title="Internal Notes">
                <textarea
                  value={internalNotes}
                  onChange={e => setInternalNotes(e.target.value)}
                  className="eoss-input w-full"
                  rows={3}
                  placeholder="Internal notes — not shared with customer"
                />
              </FormCard>
            </div>
          )}

          {/* Step 2: Lines */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[var(--text-2)]">Add each part / drawing to be quoted.</p>
                <button onClick={addLine} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: 'var(--brand-fill)' }}>
                  <Plus size={13} /> Add Line
                </button>
              </div>
              {lines.map((l, idx) => (
                <FormCard key={l.id} title={`Line ${l.lineNumber}`} trailing={
                  lines.length > 1 && (
                    <button onClick={() => removeLine(l.id)} className="p-1 rounded hover:bg-red-50 text-red-500">
                      <Trash2 size={14} />
                    </button>
                  )
                }>
                  <div className="grid md:grid-cols-3 gap-3">
                    <Field label="Drawing Number *">
                      <input value={l.drawingNumber} onChange={e => updateLine(l.id, 'drawingNumber', e.target.value)} className="eoss-input" placeholder="DWG-TC-001" />
                    </Field>
                    <Field label="Revision">
                      <input value={l.drawingRevision} onChange={e => updateLine(l.id, 'drawingRevision', e.target.value)} className="eoss-input" placeholder="A" />
                    </Field>
                    <Field label="Material">
                      <input value={l.material} onChange={e => updateLine(l.id, 'material', e.target.value)} className="eoss-input" placeholder="e.g. EN19, SS316L" />
                    </Field>
                    <Field label="Description *" className="md:col-span-2">
                      <input value={l.description} onChange={e => updateLine(l.id, 'description', e.target.value)} className="eoss-input" placeholder="Part description" />
                    </Field>
                    <Field label="Required By">
                      <input type="date" value={l.requiredBy} onChange={e => updateLine(l.id, 'requiredBy', e.target.value)} className="eoss-input" />
                    </Field>
                    <Field label="Qty *">
                      <input type="number" min={1} value={l.quantity} onChange={e => updateLine(l.id, 'quantity', parseInt(e.target.value) || 1)} className="eoss-input" />
                    </Field>
                    <Field label="UOM">
                      <select value={l.uom} onChange={e => updateLine(l.id, 'uom', e.target.value)} className="eoss-input">
                        {['Nos', 'Kg', 'Set', 'MT', 'Ltr', 'Mtr'].map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </Field>
                    <Field label="Target Price (₹)">
                      <input type="number" min={0} value={l.targetPrice} onChange={e => updateLine(l.id, 'targetPrice', e.target.value === '' ? '' : parseFloat(e.target.value))} className="eoss-input" placeholder="Optional" />
                    </Field>
                    <Field label="Notes" className="md:col-span-3">
                      <input value={l.notes} onChange={e => updateLine(l.id, 'notes', e.target.value)} className="eoss-input" placeholder="e.g. Special tolerances, surface treatment" />
                    </Field>
                  </div>
                </FormCard>
              ))}
            </div>
          )}

          {/* Step 3: Technical */}
          {step === 3 && (
            <div className="space-y-5">
              <FormCard title="Standards & Quality Requirements">
                <Field label="Applicable Standards (one per line)">
                  <textarea
                    value={techReqs.standards}
                    onChange={e => setTechReqs(t => ({ ...t, standards: e.target.value }))}
                    className="eoss-input w-full"
                    rows={3}
                    placeholder="e.g. ISO 9001:2015&#10;DIN EN 10204 3.1&#10;ASME B16.5"
                  />
                </Field>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <Field label="Inspection Level">
                    <select value={techReqs.inspectionLevel} onChange={e => setTechReqs(t => ({ ...t, inspectionLevel: e.target.value }))} className="eoss-input">
                      <option value="">— Select —</option>
                      {['Level I — Visual only', 'Level II — Dimensional + Visual', 'Level III — Full CMM + NDT', 'Per drawing callout'].map(l => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Surface Finish">
                    <input value={techReqs.surfaceFinish} onChange={e => setTechReqs(t => ({ ...t, surfaceFinish: e.target.value }))} className="eoss-input" placeholder="e.g. Ra 1.6 µm, Mirror polish" />
                  </Field>
                  <Field label="Heat Treatment">
                    <input value={techReqs.heatTreatment} onChange={e => setTechReqs(t => ({ ...t, heatTreatment: e.target.value }))} className="eoss-input" placeholder="e.g. Stress relieved, Hardened & Tempered" />
                  </Field>
                  <Field label="Packaging Requirements">
                    <input value={techReqs.packagingRequirements} onChange={e => setTechReqs(t => ({ ...t, packagingRequirements: e.target.value }))} className="eoss-input" placeholder="e.g. VCI-wrapped, wooden crate" />
                  </Field>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <input type="checkbox" id="traceability" checked={techReqs.traceability} onChange={e => setTechReqs(t => ({ ...t, traceability: e.target.checked }))} className="rounded" />
                  <label htmlFor="traceability" className="text-sm text-[var(--text)]">Material traceability (MTR / Heat no.) required</label>
                </div>
              </FormCard>
              <FormCard title="Special Notes">
                <textarea
                  value={techReqs.specialNotes}
                  onChange={e => setTechReqs(t => ({ ...t, specialNotes: e.target.value }))}
                  className="eoss-input w-full"
                  rows={3}
                  placeholder="Any other technical requirements or customer-specific instructions"
                />
              </FormCard>
            </div>
          )}

          {/* Step 4: Documents */}
          {step === 4 && (
            <div className="space-y-4">
              <FormCard title="Attached Documents">
                <div className="border-2 border-dashed rounded-xl p-8 text-center" style={{ borderColor: 'var(--border)' }}>
                  <Upload size={28} className="mx-auto text-[var(--text-3)] mb-3" />
                  <p className="text-sm font-medium text-[var(--text-2)]">Drag & drop files or click to browse</p>
                  <p className="text-xs text-[var(--text-3)] mt-1">Drawings (PDF/DXF), Specs, BOM, Quality Plan — file upload is simulated in this prototype</p>
                </div>
              </FormCard>
              <FormCard title="Document Notes">
                <textarea
                  value={docNotes}
                  onChange={e => setDocNotes(e.target.value)}
                  className="eoss-input w-full"
                  rows={3}
                  placeholder="Notes about attached documents, drawing revisions, etc."
                />
              </FormCard>
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div className="space-y-4">
              <FormCard title="RFQ Summary">
                <dl className="grid md:grid-cols-2 gap-x-6 gap-y-3">
                  {[
                    { label: 'Customer', value: customer?.tradingName ?? customer?.legalName ?? '—' },
                    { label: 'Channel', value: channel },
                    { label: 'Received Date', value: receivedDate },
                    { label: 'Required By', value: requiredBy },
                    { label: 'Payment Terms', value: paymentTerms },
                    { label: 'Delivery Terms', value: deliveryTerms || '—' },
                    { label: 'Lines', value: `${lines.length} item${lines.length !== 1 ? 's' : ''}` },
                    { label: 'Owner', value: currentUser.name },
                  ].map((f, i) => (
                    <div key={i}>
                      <dt className="text-xs text-[var(--text-3)]">{f.label}</dt>
                      <dd className="text-sm font-medium text-[var(--text)] mt-0.5">{f.value}</dd>
                    </div>
                  ))}
                </dl>
              </FormCard>
              <FormCard title={`Line Items (${lines.length})`}>
                <div className="space-y-2">
                  {lines.map(l => (
                    <div key={l.id} className="flex items-center gap-3 text-sm border rounded-lg px-3 py-2" style={{ borderColor: 'var(--border)' }}>
                      <span className="font-mono text-[var(--brand)] font-semibold text-xs flex-shrink-0">{l.drawingNumber}</span>
                      <span className="flex-1 text-[var(--text)] truncate">{l.description}</span>
                      <span className="text-[var(--text-2)] flex-shrink-0">{l.quantity} {l.uom}</span>
                      {l.targetPrice !== '' && <span className="font-mono text-xs text-[var(--text-3)] flex-shrink-0">₹{Number(l.targetPrice).toLocaleString('en-IN')}</span>}
                    </div>
                  ))}
                </div>
              </FormCard>
            </div>
          )}
        </div>
      </div>

      {/* Nav footer */}
      <div className="flex-shrink-0 px-6 py-4 border-t flex items-center justify-between gap-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <button
          onClick={() => step > 1 ? setStep((step - 1) as Step) : navigate('/sales?tab=rfqs')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
          style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
        >
          <ArrowLeft size={15} /> {step === 1 ? 'Cancel' : 'Back'}
        </button>
        {step < 5 ? (
          <button
            onClick={() => setStep((step + 1) as Step)}
            disabled={!canNext[step]}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-40"
            style={{ background: 'var(--brand-fill)' }}
          >
            Next <ArrowRight size={15} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: 'var(--brand-fill)' }}
          >
            <Check size={15} /> Submit RFQ
          </button>
        )}
      </div>
    </div>
  );
}

function FormCard({ title, children, trailing }: { title: string; children: React.ReactNode; trailing?: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-[var(--text)]">{title}</h3>
        {trailing}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-[var(--text-2)] mb-1">{label}</label>
      {children}
    </div>
  );
}
