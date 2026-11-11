import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Paperclip, X } from 'lucide-react';
import { useStore } from '../../store';
import type { PurchaseRequisition, PRLine as PRLineType } from '../../types';
import SiteStoreField from '../../components/forms/SiteStoreField';
import { DEFAULT_SITE_ID, DEFAULT_SITE_NAME, DEFAULT_STORE_ID, DEFAULT_STORE_NAME } from '../../domain/recordLists';

type Step = 1 | 2 | 3;

interface PRLineForm {
  id: string;
  materialItemId: string;
  materialCode: string;
  description: string;
  grade: string;
  uom: string;
  requiredQty: number;
  targetRate: number;
  requiredBy: string;
  notes: string;
}

const UOM_OPTIONS = ['kg', 'nos', 'mtr', 'pcs', 'sheets', 'ltrs', 'sets', 'rolls', 'cyl'];
const DEPARTMENT_OPTIONS = ['Production', 'Machining & Assembly', 'Stores', 'Maintenance', 'Quality', 'Engineering'];
const TODAY = new Date().toISOString().slice(0, 10);

let prSeq = 100;

export default function PRCreate() {
  const navigate = useNavigate();
  const { id: editId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const prefillName = searchParams.get('name') ?? '';
  const { currentUser, purchaseReqs, materials, sites, storeLocations, addPurchaseReq, updatePurchaseReq, showToast } = useStore();

  const editingPr = editId ? purchaseReqs.find(p => p.id === editId) : undefined;
  const isEditing = Boolean(editId && editingPr);

  const defaultSiteId = searchParams.get('site') || DEFAULT_SITE_ID;
  const defaultStore = storeLocations.find(l => l.siteId === defaultSiteId && l.locationType === 'RM')
    || storeLocations.find(l => l.siteId === defaultSiteId);

  const [step, setStep] = useState<Step>(prefillName && !isEditing ? 2 : 1);

  const [header, setHeader] = useState({
    raisedBy: currentUser.name,
    department: 'Production',
    requiredBy: prefillName ? '2026-11-18' : '',
    priority: (prefillName ? 'high' : 'normal') as PurchaseRequisition['priority'],
    purpose: prefillName ? `Cover shortage of ${prefillName}` : '',
    notes: '',
    deliverToSiteId: defaultSiteId,
    deliverToSiteName: sites.find(s => s.id === defaultSiteId)?.name ?? DEFAULT_SITE_NAME,
    deliverToStoreId: defaultStore?.id ?? DEFAULT_STORE_ID,
    deliverToStoreName: defaultStore?.name ?? DEFAULT_STORE_NAME,
  });

  const [attachments, setAttachments] = useState<{ id: string; name: string; size?: string }[]>([]);
  const [attachmentName, setAttachmentName] = useState('');

  const [lines, setLines] = useState<PRLineForm[]>([
    {
      id: 'l-1',
      materialItemId: searchParams.get('materialId') ?? '',
      materialCode: searchParams.get('code') ?? '',
      description: prefillName,
      grade: searchParams.get('grade') ?? '',
      uom: searchParams.get('uom') || 'kg',
      requiredQty: Number(searchParams.get('qty') || 0),
      targetRate: 0,
      requiredBy: prefillName ? '2026-11-18' : '',
      notes: prefillName ? 'Raised from stock shortage' : '',
    },
  ]);

  useEffect(() => {
    if (!editingPr) return;
    setHeader({
      raisedBy: editingPr.raisedBy || currentUser.name,
      department: editingPr.department || 'Production',
      requiredBy: editingPr.requiredBy || '',
      priority: editingPr.priority || 'normal',
      purpose: editingPr.purpose || editingPr.reason || '',
      notes: editingPr.notes || '',
      deliverToSiteId: editingPr.deliverToSiteId || DEFAULT_SITE_ID,
      deliverToSiteName: editingPr.deliverToSiteName || DEFAULT_SITE_NAME,
      deliverToStoreId: editingPr.deliverToStoreId || DEFAULT_STORE_ID,
      deliverToStoreName: editingPr.deliverToStoreName || DEFAULT_STORE_NAME,
    });
    setAttachments(editingPr.attachments ?? []);
    if (editingPr.lines && editingPr.lines.length > 0) {
      setLines(editingPr.lines.map((l, idx) => ({
        id: l.id || `l-${idx + 1}`,
        materialItemId: l.materialItemId || '',
        materialCode: l.materialCode || '',
        description: l.description || l.materialName || '',
        grade: l.grade || '',
        uom: l.uom || 'kg',
        requiredQty: l.requiredQty || 0,
        targetRate: l.estimatedPrice ?? 0,
        requiredBy: l.requiredDate || editingPr.requiredBy || '',
        notes: l.notes || l.justification || '',
      })));
    }
  }, [editingPr, currentUser.name]);

  if (editId && !editingPr) {
    return (
      <div className="p-8 text-center text-sm text-[var(--text-2)]">
        Purchase Requisition not found.{' '}
        <button onClick={() => navigate('/procurement?tab=pr')} className="text-[var(--brand)] underline">Back</button>
      </div>
    );
  }

  const addLine = () =>
    setLines(ls => [...ls, {
      id: `l-${Date.now()}`,
      materialItemId: '',
      materialCode: '',
      description: '',
      grade: '',
      uom: 'kg',
      requiredQty: 0,
      targetRate: 0,
      requiredBy: header.requiredBy,
      notes: '',
    }]);

  const removeLine = (id: string) => setLines(ls => ls.filter(l => l.id !== id));

  const setLine = (id: string, patch: Partial<PRLineForm>) =>
    setLines(ls => ls.map(l => l.id === id ? { ...l, ...patch } : l));

  const handleCatalogSelect = (lineId: string, materialItemId: string) => {
    if (!materialItemId) {
      setLine(lineId, { materialItemId: '' });
      return;
    }
    const mat = materials.find(m => m.id === materialItemId);
    if (!mat) return;
    setLine(lineId, {
      materialItemId: mat.id,
      materialCode: mat.itemCode,
      description: mat.name,
      grade: mat.standardGrade || '',
      uom: mat.primaryUom || 'kg',
    });
  };

  const addAttachment = () => {
    if (!attachmentName.trim()) return;
    setAttachments(prev => [...prev, { id: `att-${Date.now()}`, name: attachmentName.trim(), size: 'Spec / PDF' }]);
    setAttachmentName('');
  };

  const canNext: Record<Step, boolean> = {
    1: Boolean(header.raisedBy.trim() && header.requiredBy && header.deliverToSiteId),
    2: lines.length > 0 && lines.every(l => l.description.trim() && l.requiredQty > 0),
    3: true,
  };

  const handleSubmit = () => {
    const prId = editingPr ? editingPr.id : `pr-new-${++prSeq}-${Date.now()}`;
    const prNumber = editingPr ? editingPr.prNumber : `PR-${TODAY.slice(0, 4)}-${String(purchaseReqs.length + 101).padStart(3, '0')}`;

    const canonicalLines: PRLineType[] = lines.map((l, idx) => ({
      id: l.id || `${prId}-line-${idx + 1}`,
      prId,
      materialItemId: l.materialItemId || `mat-custom-${idx + 1}`,
      materialCode: l.materialCode.trim() || undefined,
      materialName: l.description.trim(),
      description: l.description.trim(),
      grade: l.grade.trim() || undefined,
      requiredQty: l.requiredQty,
      uom: l.uom,
      requiredDate: l.requiredBy || header.requiredBy,
      estimatedPrice: l.targetRate || undefined,
      notes: l.notes.trim() || undefined,
      justification: l.notes.trim() || undefined,
    }));

    const payload: Partial<PurchaseRequisition> = {
      raisedBy: header.raisedBy.trim(),
      department: header.department,
      requiredBy: header.requiredBy,
      priority: header.priority,
      purpose: header.purpose.trim() || undefined,
      reason: header.purpose.trim() || undefined,
      notes: header.notes.trim() || undefined,
      deliverToSiteId: header.deliverToSiteId,
      deliverToSiteName: header.deliverToSiteName,
      deliverToStoreId: header.deliverToStoreId,
      deliverToStoreName: header.deliverToStoreName,
      lineCount: canonicalLines.length,
      totalQty: canonicalLines.reduce((s, l) => s + l.requiredQty, 0),
      attachments,
      lines: canonicalLines,
    };

    if (isEditing && editingPr) {
      updatePurchaseReq(editingPr.id, payload);
      showToast({ type: 'success', title: 'Purchase Requisition updated', body: `${editingPr.prNumber} changes saved.` });
      navigate(`/procurement/pr/${editingPr.id}`);
      return;
    }

    const newPr: PurchaseRequisition = {
      id: prId,
      prNumber,
      raisedBy: header.raisedBy.trim(),
      department: header.department,
      raisedDate: TODAY,
      requiredBy: header.requiredBy,
      status: ['owner', 'buyer'].includes(currentUser.role) ? 'approved' : 'pending',
      lineCount: canonicalLines.length,
      totalQty: canonicalLines.reduce((s, l) => s + l.requiredQty, 0),
      priority: header.priority,
      deliverToSiteId: header.deliverToSiteId,
      deliverToSiteName: header.deliverToSiteName,
      deliverToStoreId: header.deliverToStoreId,
      deliverToStoreName: header.deliverToStoreName,
      purpose: header.purpose.trim() || undefined,
      reason: header.purpose.trim() || undefined,
      notes: header.notes.trim() || undefined,
      attachments,
      lines: canonicalLines,
    };
    addPurchaseReq(newPr);
    showToast({ type: 'success', title: 'Purchase Requisition created', body: `${newPr.prNumber} raised.` });
    navigate(`/procurement/pr/${newPr.id}`);
  };

  const steps = [
    { n: 1 as Step, label: 'Header' },
    { n: 2 as Step, label: 'Lines' },
    { n: 3 as Step, label: 'Review' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <button onClick={() => navigate(isEditing && editingPr ? `/procurement/pr/${editingPr.id}` : '/procurement?tab=pr')} className="p-1.5 rounded-lg hover:bg-[var(--surface-2)]">
          <ArrowLeft size={18} className="text-[var(--text-2)]" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-[var(--text)]">
            {isEditing && editingPr ? `Edit ${editingPr.prNumber}` : 'New Purchase Requisition'}
          </h1>
          <p className="text-xs text-[var(--text-2)]">Deliver to {header.deliverToSiteName} · {header.deliverToStoreName}</p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          {steps.map((s, i) => (
            <React.Fragment key={s.n}>
              {i > 0 && <div className="w-8 h-px" style={{ background: step > s.n ? 'var(--brand)' : 'var(--border)' }} />}
              <button
                type="button"
                onClick={() => s.n < step && setStep(s.n)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors"
                style={{
                  background: step === s.n ? 'var(--brand)' : step > s.n ? 'var(--success-bg,#F0FDF4)' : 'var(--surface-2)',
                  color: step === s.n ? '#fff' : step > s.n ? 'var(--success,#16A34A)' : 'var(--text-2)',
                }}>
                {step > s.n ? '✓' : s.n} {s.label}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto space-y-5">
          {step === 1 && (
            <div className="rounded-xl border p-5 space-y-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              <h2 className="text-sm font-bold text-[var(--text)]">Requisition Header</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-3)] mb-1">Requester *</label>
                  <input className="eoss-input w-full" value={header.raisedBy} onChange={e => setHeader(h => ({ ...h, raisedBy: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-3)] mb-1">Department</label>
                  <select className="eoss-input w-full" value={header.department} onChange={e => setHeader(h => ({ ...h, department: e.target.value }))}>
                    {DEPARTMENT_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-3)] mb-1">Required By *</label>
                  <input type="date" className="eoss-input w-full" value={header.requiredBy} onChange={e => setHeader(h => ({ ...h, requiredBy: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-3)] mb-1">Priority</label>
                  <select className="eoss-input w-full" value={header.priority} onChange={e => setHeader(h => ({ ...h, priority: e.target.value as PurchaseRequisition['priority'] }))}>
                    {['low', 'normal', 'high', 'urgent'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <SiteStoreField
                    siteId={header.deliverToSiteId}
                    storeId={header.deliverToStoreId}
                    label="Receiving site *"
                    storeLabel="Receiving store"
                    onChange={next => setHeader(h => ({
                      ...h,
                      deliverToSiteId: next.siteId,
                      deliverToSiteName: next.siteName,
                      deliverToStoreId: next.storeId,
                      deliverToStoreName: next.storeName,
                    }))}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-[var(--text-3)] mb-1">Reason / Purpose</label>
                  <input className="eoss-input w-full" placeholder="e.g. Stock replenishment for alloy steel plates" value={header.purpose} onChange={e => setHeader(h => ({ ...h, purpose: e.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-[var(--text-3)] mb-1">Notes</label>
                  <textarea className="eoss-input w-full" rows={2} value={header.notes} onChange={e => setHeader(h => ({ ...h, notes: e.target.value }))} placeholder="Additional procurement instructions or delivery notes..." />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-[var(--text-3)] mb-1">Attachments (Spec Sheets / Drawings)</label>
                  <div className="flex gap-2">
                    <input
                      className="eoss-input flex-1"
                      placeholder="e.g. Spec-SS304L-Rev2.pdf"
                      value={attachmentName}
                      onChange={e => setAttachmentName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addAttachment(); } }}
                    />
                    <button type="button" onClick={addAttachment} className="btn-ghost text-xs inline-flex items-center gap-1">
                      <Paperclip size={13} /> Attach
                    </button>
                  </div>
                  {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {attachments.map(att => (
                        <span key={att.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)]">
                          <Paperclip size={11} /> {att.name}
                          <button type="button" onClick={() => setAttachments(prev => prev.filter(a => a.id !== att.id))} className="text-[var(--text-3)] hover:text-[var(--error)]">
                            <X size={11} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[var(--text)]">Material Lines</h2>
                <button type="button" onClick={addLine} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: 'var(--brand-fill)' }}>
                  <Plus size={13} /> Add Line
                </button>
              </div>

              {lines.map((line, idx) => (
                <div key={line.id} className="rounded-xl border p-4 space-y-3" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--text-2)]">Line {idx + 1}</span>
                    {lines.length > 1 && (
                      <button type="button" onClick={() => removeLine(line.id)} className="p-1 rounded hover:bg-[var(--surface-2)]">
                        <Trash2 size={13} className="text-red-500" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="md:col-span-3">
                      <label className="block text-xs text-[var(--text-3)] mb-1">Select Catalog Material (optional)</label>
                      <select
                        className="eoss-input w-full"
                        value={line.materialItemId}
                        onChange={e => handleCatalogSelect(line.id, e.target.value)}
                      >
                        <option value="">— Custom / Enter manually —</option>
                        {materials.map(m => (
                          <option key={m.id} value={m.id}>{m.itemCode} — {m.name} ({m.primaryUom})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--text-3)] mb-1">Material Code</label>
                      <input className="eoss-input w-full" placeholder="e.g. SS316-6MM" value={line.materialCode} onChange={e => setLine(line.id, { materialCode: e.target.value })} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-[var(--text-3)] mb-1">Description *</label>
                      <input className="eoss-input w-full" placeholder="e.g. SS 316 Plate 6mm thk" value={line.description} onChange={e => setLine(line.id, { description: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--text-3)] mb-1">Grade / Specification</label>
                      <input className="eoss-input w-full" value={line.grade} onChange={e => setLine(line.id, { grade: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--text-3)] mb-1">Qty *</label>
                      <input type="number" min={0.01} step="any" className="eoss-input w-full" value={line.requiredQty || ''} onChange={e => setLine(line.id, { requiredQty: Number(e.target.value) })} />
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--text-3)] mb-1">UOM</label>
                      <select className="eoss-input w-full" value={line.uom} onChange={e => setLine(line.id, { uom: e.target.value })}>
                        {UOM_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--text-3)] mb-1">Est. Rate (₹)</label>
                      <input type="number" min={0} className="eoss-input w-full" value={line.targetRate || ''} onChange={e => setLine(line.id, { targetRate: Number(e.target.value) })} />
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--text-3)] mb-1">Required By</label>
                      <input type="date" className="eoss-input w-full" value={line.requiredBy} onChange={e => setLine(line.id, { requiredBy: e.target.value })} />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-xs text-[var(--text-3)] mb-1">Line Notes</label>
                      <input className="eoss-input w-full" value={line.notes} onChange={e => setLine(line.id, { notes: e.target.value })} />
                    </div>
                  </div>
                </div>
              ))}

              <div className="text-right text-sm font-semibold font-mono text-[var(--text)]">
                Total Qty: {lines.reduce((s, l) => s + l.requiredQty, 0)} · Est. Value: ₹{lines.reduce((s, l) => s + l.targetRate * l.requiredQty, 0).toLocaleString('en-IN')}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-xl border p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                <h2 className="text-sm font-bold text-[var(--text)] mb-3">Review & {isEditing ? 'Save Changes' : 'Submit'}</h2>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  {[
                    { label: 'Requester', value: header.raisedBy },
                    { label: 'Department', value: header.department },
                    { label: 'Required By', value: header.requiredBy },
                    { label: 'Priority', value: header.priority.charAt(0).toUpperCase() + header.priority.slice(1) },
                    { label: 'Receiving Site / Store', value: `${header.deliverToSiteName} · ${header.deliverToStoreName}` },
                    { label: 'Reason / Purpose', value: header.purpose || '—' },
                    { label: 'Lines', value: `${lines.length} material(s)` },
                    { label: 'Total Qty', value: lines.reduce((s, l) => s + l.requiredQty, 0).toString() },
                    { label: 'Est. Value', value: `₹${lines.reduce((s, l) => s + l.targetRate * l.requiredQty, 0).toLocaleString('en-IN')}` },
                    { label: 'Attachments', value: attachments.length > 0 ? attachments.map(a => a.name).join(', ') : 'None' },
                  ].map((f, i) => (
                    <div key={i}>
                      <dt className="text-xs text-[var(--text-3)]">{f.label}</dt>
                      <dd className="text-sm font-medium text-[var(--text)] mt-0.5">{f.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="rounded-xl border overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
                <table className="eoss-table">
                  <thead>
                    <tr><th>#</th><th>Code</th><th>Description</th><th>Grade</th><th>Qty</th><th>UOM</th><th>Est. Rate</th><th>Est. Value</th></tr>
                  </thead>
                  <tbody>
                    {lines.map((l, i) => (
                      <tr key={l.id}>
                        <td className="text-xs text-[var(--text-3)]">{i + 1}</td>
                        <td className="font-mono text-xs">{l.materialCode || '—'}</td>
                        <td>{l.description}</td>
                        <td className="text-xs">{l.grade || '—'}</td>
                        <td className="font-mono text-right">{l.requiredQty}</td>
                        <td>{l.uom}</td>
                        <td className="font-mono text-right">{l.targetRate ? `₹${l.targetRate.toLocaleString('en-IN')}` : '—'}</td>
                        <td className="font-mono text-right">{l.targetRate && l.requiredQty ? `₹${(l.targetRate * l.requiredQty).toLocaleString('en-IN')}` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {!isEditing && ['owner', 'buyer'].includes(currentUser.role) && (
                <div className="rounded-lg p-3 text-xs" style={{ background: 'var(--success-bg,#F0FDF4)', color: 'var(--success,#16A34A)' }}>
                  As {currentUser.role}, this PR will be <strong>auto-approved</strong> on submission.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <button
          type="button"
          onClick={() => step > 1 ? setStep((step - 1) as Step) : navigate(isEditing && editingPr ? `/procurement/pr/${editingPr.id}` : '/procurement?tab=pr')}
          className="px-4 py-2 rounded-lg border text-sm font-medium"
          style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}>
          {step === 1 ? 'Cancel' : '← Back'}
        </button>
        <button
          type="button"
          onClick={() => step < 3 ? setStep((step + 1) as Step) : handleSubmit()}
          disabled={!canNext[step]}
          className="px-5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40"
          style={{ background: 'var(--brand-fill)' }}>
          {step < 3 ? 'Next →' : isEditing ? 'Save Changes' : 'Submit PR'}
        </button>
      </div>
    </div>
  );
}
