import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import { useStore } from '../../store';
import type { CustomerRFQ, RFQLine } from '../../types';

const today = new Date().toISOString().slice(0, 10);

export default function RFQEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { rfqs, currentUser, updateRfq, showToast } = useStore();
  const rfq = rfqs.find(r => r.id === id) as (CustomerRFQ & Record<string, any>) | undefined;
  const [requiredBy, setRequiredBy] = useState(rfq?.requiredBy ?? '');
  const [quotationDueDate, setQuotationDueDate] = useState(rfq?.quotationDueDate ?? '');
  const [paymentTerms, setPaymentTerms] = useState(rfq?.paymentTerms ?? '');
  const [deliveryTerms, setDeliveryTerms] = useState(rfq?.deliveryTerms ?? '');
  const [deliveryLocation, setDeliveryLocation] = useState(rfq?.deliveryLocation ?? '');
  const [internalNotes, setInternalNotes] = useState(rfq?.internalNotes ?? '');
  const [customerInstructions, setCustomerInstructions] = useState(rfq?.customerInstructions ?? '');
  const [specialCommercialConditions, setSpecialCommercialConditions] = useState(rfq?.specialCommercialConditions ?? '');
  const existingTech = rfq?.technicalRequirements ?? {};
  const [standards, setStandards] = useState(Array.isArray(existingTech.standards) ? existingTech.standards.join('\n') : rfq?.applicableStandards ?? '');
  const [inspectionLevel, setInspectionLevel] = useState(existingTech.inspectionLevel ?? (rfq?.dimensionalInspection ? 'Dimensional inspection' : ''));
  const [surfaceFinish, setSurfaceFinish] = useState(existingTech.surfaceFinish ?? rfq?.surfaceTreatment ?? '');
  const [heatTreatment, setHeatTreatment] = useState(existingTech.heatTreatment ?? (rfq?.heatTreatment ? 'Required' : ''));
  const [packagingRequirements, setPackagingRequirements] = useState(existingTech.packagingRequirements ?? rfq?.packagingPreservation ?? '');
  const [traceability, setTraceability] = useState(Boolean(existingTech.traceability ?? rfq?.traceabilityRequired));
  const [specialNotes, setSpecialNotes] = useState(existingTech.specialNotes ?? rfq?.specialQualityReqs ?? '');
  const [documentNote, setDocumentNote] = useState('');
  const [lines, setLines] = useState<RFQLine[]>(() => (rfq?.lines ?? []).map((line: any, i: number) => ({ ...line, lineNumber: line.lineNumber ?? i + 1, qty: line.qty ?? line.quantity ?? 1, requiredDate: line.requiredDate ?? rfq?.requiredBy ?? '' })));

  if (!rfq) return <div className="p-8 text-center text-[var(--text-2)]">RFQ not found.</div>;

  const updateLine = (lineId: string, key: keyof RFQLine, value: unknown) => setLines(current => current.map(line => line.id === lineId ? { ...line, [key]: value } : line));
  const addLine = () => setLines(current => [...current, { id: `rfql-${Date.now()}`, rfqId: rfq.id, lineNumber: current.length + 1, productName: '', description: '', drawingNumber: '', drawingRevision: 'A', material: '', qty: 1, uom: 'Nos', requiredDate: requiredBy }]);
  const removeLine = (lineId: string) => setLines(current => current.filter(line => line.id !== lineId).map((line, i) => ({ ...line, lineNumber: i + 1 })));

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const revision = (rfq.revisionNumber ?? 1) + 1;
    const previousRevisions = rfq.revisions ?? [];
    const documents = documentNote.trim() ? [...(rfq.documents ?? []), { id: `doc-${Date.now()}`, rfqId: rfq.id, filename: 'Revision notes', docType: 'Other' as const, uploadedBy: currentUser.name, uploadedAt: today, notes: documentNote.trim() }] : rfq.documents;
    updateRfq(rfq.id, {
      requiredBy, quotationDueDate, paymentTerms, deliveryTerms, deliveryLocation, internalNotes, customerInstructions,
      specialCommercialConditions, lineCount: lines.length, lines, documents,
      technicalRequirements: { standards: standards.split('\n').map(s => s.trim()).filter(Boolean), inspectionLevel, surfaceFinish, heatTreatment, packagingRequirements, traceability, specialNotes },
      revisions: [...previousRevisions, { id: `rev-${Date.now()}`, revision, changedBy: currentUser.name, changeDescription: 'RFQ details and requirements updated', changedAt: new Date().toISOString() }],
      revisionNumber: revision,
      updatedAt: new Date().toISOString(),
    } as Partial<CustomerRFQ>);
    showToast({ type: 'success', title: 'RFQ revised', body: `${rfq.rfqNumber} saved as Rev ${revision}.` });
    navigate(`/sales/rfq/${rfq.id}`);
  };

  return <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-5">
    <div><button onClick={() => navigate(`/sales/rfq/${rfq.id}`)} className="flex items-center gap-1.5 text-sm text-[var(--text-2)] hover:text-[var(--brand)] mb-3"><ArrowLeft size={14} /> Back to {rfq.rfqNumber}</button><h1 className="text-xl font-bold text-[var(--text)]">Edit RFQ</h1><p className="text-sm text-[var(--text-2)] mt-1">{rfq.rfqNumber} · {rfq.customerName} · Save creates Rev {(rfq.revisionNumber ?? 1) + 1}</p></div>
    <form onSubmit={save} className="space-y-5">
      <Card title="Header & Commercial"><div className="grid md:grid-cols-2 gap-3"><Field label="Required By" value={requiredBy} onChange={setRequiredBy} type="date" /><Field label="Quotation Due" value={quotationDueDate} onChange={setQuotationDueDate} type="date" /><Field label="Payment Terms" value={paymentTerms} onChange={setPaymentTerms} /><Field label="Delivery Terms" value={deliveryTerms} onChange={setDeliveryTerms} /><Field label="Delivery Location" value={deliveryLocation} onChange={setDeliveryLocation} /><Field label="Special Commercial Conditions" value={specialCommercialConditions} onChange={setSpecialCommercialConditions} /></div></Card>
      <Card title="Line Items"><div className="flex justify-end mb-3"><button type="button" onClick={addLine} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: 'var(--brand)' }}><Plus size={13} /> Add Line</button></div><div className="space-y-3">{lines.map(line => <div key={line.id} className="rounded-lg border p-3" style={{ borderColor: 'var(--border)' }}><div className="flex justify-between mb-3"><span className="text-xs font-semibold text-[var(--text-2)]">Line {line.lineNumber}</span><button type="button" onClick={() => removeLine(line.id)} className="text-red-500"><Trash2 size={14} /></button></div><div className="grid md:grid-cols-3 gap-3"><Field label="Drawing / Part No." value={line.drawingNumber ?? ''} onChange={v => updateLine(line.id, 'drawingNumber', v)} /><Field label="Revision" value={line.drawingRevision ?? ''} onChange={v => updateLine(line.id, 'drawingRevision', v)} /><Field label="Material / Grade" value={line.material ?? line.grade ?? ''} onChange={v => updateLine(line.id, 'material', v)} /><Field label="Description" value={line.description} onChange={v => updateLine(line.id, 'description', v)} className="md:col-span-2" /><Field label="Quantity" value={String(line.qty)} onChange={v => updateLine(line.id, 'qty', Number(v) || 0)} type="number" /><Field label="UOM" value={line.uom} onChange={v => updateLine(line.id, 'uom', v)} /><Field label="Required Date" value={line.requiredDate} onChange={v => updateLine(line.id, 'requiredDate', v)} type="date" /><Field label="Inspection Requirements" value={line.inspectionReqs ?? ''} onChange={v => updateLine(line.id, 'inspectionReqs', v)} /><Field label="Certification / Packaging" value={`${line.certificationReqs ?? ''}${line.packagingReqs ? ` · ${line.packagingReqs}` : ''}`} onChange={v => updateLine(line.id, 'certificationReqs', v)} /></div></div>)}</div></Card>
      <Card title="Technical & Quality"><div className="grid md:grid-cols-2 gap-3"><TextArea label="Standards (one per line)" value={standards} onChange={setStandards} /><Field label="Inspection Level" value={inspectionLevel} onChange={setInspectionLevel} /><Field label="Surface Finish" value={surfaceFinish} onChange={setSurfaceFinish} /><Field label="Heat Treatment" value={heatTreatment} onChange={setHeatTreatment} /><Field label="Packaging / Preservation" value={packagingRequirements} onChange={setPackagingRequirements} /><label className="flex items-center gap-2 text-sm text-[var(--text)] mt-6"><input type="checkbox" checked={traceability} onChange={e => setTraceability(e.target.checked)} /> Material traceability required</label><TextArea label="Special Quality Notes" value={specialNotes} onChange={setSpecialNotes} className="md:col-span-2" /></div></Card>
      <Card title="Instructions, Documents & Internal Notes"><div className="space-y-3"><TextArea label="Customer Instructions" value={customerInstructions} onChange={setCustomerInstructions} /><TextArea label="Internal Notes" value={internalNotes} onChange={setInternalNotes} /><TextArea label="Revision / document note" value={documentNote} onChange={setDocumentNote} placeholder="Optional note to add to RFQ documents" /></div></Card>
      <div className="flex justify-end gap-3"><button type="button" onClick={() => navigate(`/sales/rfq/${rfq.id}`)} className="px-4 py-2 rounded-lg border text-sm font-semibold" style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}>Cancel</button><button type="submit" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: 'var(--brand)' }}><Save size={14} /> Save RFQ Revision</button></div>
    </form>
  </div>;
}

function Card({ title, children }: { title: string; children: React.ReactNode }) { return <section className="rounded-xl border p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}><h2 className="text-sm font-bold text-[var(--text)] mb-4">{title}</h2>{children}</section>; }
function Field({ label, value, onChange, type = 'text', className = '' }: { label: string; value: string; onChange: (value: string) => void; type?: string; className?: string }) { return <label className={`block ${className}`}><span className="block text-xs font-medium text-[var(--text-2)] mb-1">{label}</span><input type={type} value={value} onChange={e => onChange(e.target.value)} className="eoss-input w-full" /></label>; }
function TextArea({ label, value, onChange, className = '', placeholder }: { label: string; value: string; onChange: (value: string) => void; className?: string; placeholder?: string }) { return <label className={`block ${className}`}><span className="block text-xs font-medium text-[var(--text-2)] mb-1">{label}</span><textarea value={value} onChange={e => onChange(e.target.value)} rows={3} placeholder={placeholder} className="eoss-input w-full resize-none" /></label>; }
