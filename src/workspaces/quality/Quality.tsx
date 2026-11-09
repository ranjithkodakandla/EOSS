import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, ChevronRight, AlertTriangle, X, Trash2 } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';
import type { Inspection, NCR } from '../../types';

let ncrSeq = 100;

export default function Quality() {
  const { inspections, ncrs, jobs, currentUser, addInspection, addNCR, showToast } = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<'inspections' | 'ncrs'>('inspections');
  const [showNew, setShowNew] = useState(!!searchParams.get('newFor'));
  const [showNewNcr, setShowNewNcr] = useState(false);
  const prefilledJobId = searchParams.get('newFor') ?? '';
  const [deletedInspectionIds, setDeletedInspectionIds] = useState<Set<string>>(new Set());
  const [deletedNcrIds, setDeletedNcrIds] = useState<Set<string>>(new Set());

  const canManage = ['owner', 'qc'].includes(currentUser.role);

  const handleDeleteInspection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const hasLinkedNcr = ncrs.some(n => (n as any).inspectionId === id);
    if (hasLinkedNcr) { showToast({ type: 'error', title: 'Cannot delete', body: 'Inspection has linked NCRs.' }); return; }
    setDeletedInspectionIds(prev => new Set([...prev, id]));
    showToast({ type: 'success', title: 'Inspection removed' });
  };

  const handleDeleteNcr = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletedNcrIds(prev => new Set([...prev, id]));
    showToast({ type: 'success', title: 'NCR removed' });
  };

  const resultFilter = searchParams.get('result');
  const visibleInspections = inspections.filter(i => {
    if (deletedInspectionIds.has(i.id)) return false;
    if (resultFilter === 'open') return i.result === 'pending' || i.result === 'fail';
    if (resultFilter) return i.result === resultFilter;
    return true;
  });
  const visibleNcrs = ncrs.filter(n => !deletedNcrIds.has(n.id));

  const openNcrs = ncrs.filter(n => n.status === 'open' || n.status === 'in_progress').length;
  const pendingInspections = inspections.filter(i => i.result === 'pending').length;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex-shrink-0 flex items-center gap-3 px-5 py-3 border-b flex-wrap" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="flex items-center gap-4">
          {openNcrs > 0 && <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--error,#DC2626)' }}><AlertTriangle size={12} /> {openNcrs} open NCRs</span>}
          {pendingInspections > 0 && <span className="text-xs font-semibold" style={{ color: 'var(--warning,#D97706)' }}>{pendingInspections} pending</span>}
        </div>
        <div className="flex-1" />
        {['owner', 'qc'].includes(currentUser.role) && (
          <>
            <button onClick={() => setShowNewNcr(true)} className="px-3 py-1.5 rounded-lg border text-xs font-medium hover:opacity-80"
              style={{ borderColor: 'var(--error,#DC2626)', color: 'var(--error,#DC2626)' }}>
              <Plus size={12} className="inline -mt-0.5 mr-0.5" /> New NCR
            </button>
            <button onClick={() => setShowNew(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: 'var(--brand)' }}>
              <Plus size={13} /> New Inspection
            </button>
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 flex items-center border-b px-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        {([['inspections', `Inspections (${visibleInspections.length})`], ['ncrs', `NCRs (${visibleNcrs.length})`]] as [string, string][]).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id as any)}
            className="relative px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap"
            style={{ color: tab === id ? 'var(--brand)' : 'var(--text-2)' }}>
            {label}
            {tab === id && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full" style={{ background: 'var(--brand)' }} />}
          </button>
        ))}
      </div>

      {resultFilter === 'open' && (
        <div className="px-5 py-2 text-sm border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
          Inspections still waiting on a result. Record the pending ones, or raise an NCR where one already failed.
        </div>
      )}

      <div className="flex-1 overflow-auto">
        {tab === 'inspections' && (
          <table className="w-full text-sm border-separate border-spacing-0" style={{ minWidth: 800 }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 5 }}>
              <tr style={{ background: 'var(--surface-2)' }}>
                {['Inspection #', 'Type', 'Subject', 'Date', 'Inspector', 'Sample', 'Accept', 'Reject', 'Result', ''].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold font-medium" style={{ color: 'var(--text-3)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleInspections.map(i => (
                <tr key={i.id} className="cursor-pointer" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}
                  onClick={() => navigate(`/quality/inspection/${i.id}`)}>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-bold" style={{ color: 'var(--brand)' }}>{i.inspectionNumber}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold capitalize" style={{ color: 'var(--text-2)' }}>{i.type}</span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{i.jobNumber ? `Job ${i.jobNumber} · ${i.stageName}` : i.lotId ? 'Lot' : '—'}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{new Date(i.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  <td className="px-4 py-3 text-xs font-medium" style={{ color: 'var(--text)' }}>{i.inspectorName}</td>
                  <td className="px-4 py-3 text-xs text-center font-mono" style={{ color: 'var(--text)' }}>{i.sampleQty}</td>
                  <td className="px-4 py-3 text-xs text-center font-semibold" style={{ color: i.acceptedQty > 0 ? 'var(--success,#16A34A)' : 'var(--text-3)' }}>{i.acceptedQty > 0 ? i.acceptedQty : '—'}</td>
                  <td className="px-4 py-3 text-xs text-center font-semibold" style={{ color: i.rejectedQty > 0 ? 'var(--error,#DC2626)' : 'var(--text-3)' }}>{i.rejectedQty > 0 ? i.rejectedQty : '—'}</td>
                  <td className="px-4 py-3"><StatusChip status={i.result} size="sm" /></td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      {(i.result === 'pending' || i.result === 'fail') && (
                        <button type="button" onClick={() => navigate(i.result === 'pending' ? `/quality/inspection/${i.id}?record=1` : `/quality/inspection/${i.id}`)}
                          className="px-2 py-1 rounded-lg text-xs font-semibold text-white" style={{ background: 'var(--brand)' }}>
                          {i.result === 'pending' ? 'Record' : 'Raise NCR'}
                        </button>
                      )}
                      {canManage && (
                        <button onClick={e => handleDeleteInspection(i.id, e)} className="p-1 rounded hover:bg-[var(--surface-2)]" title="Remove"><Trash2 size={12} style={{ color: 'var(--error,#DC2626)' }} /></button>
                      )}
                      <ChevronRight size={14} style={{ color: 'var(--text-3)' }} />
                    </div>
                  </td>
                </tr>
              ))}
              {visibleInspections.length === 0 && (
                <tr><td colSpan={10} className="px-4 py-10 text-center text-sm" style={{ color: 'var(--text-3)' }}>No inspections found</td></tr>
              )}
            </tbody>
          </table>
        )}

        {tab === 'ncrs' && (
          <div className="p-5 space-y-3 max-w-4xl">
            {visibleNcrs.map(n => (
              <div key={n.id} className="rounded-xl border p-4 cursor-pointer hover:opacity-90 transition-opacity"
                style={{ borderColor: (n.severity === 'Major' || n.severity === 'Critical') ? 'var(--error,#DC2626)' : 'var(--border)', background: 'var(--surface)' }}
                onClick={() => navigate(`/quality/ncr/${n.id}`)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono font-bold text-sm" style={{ color: 'var(--brand)' }}>{n.ncrNumber}</span>
                      <StatusChip status={n.severity.toLowerCase()} label={n.severity} size="sm" />
                      <StatusChip status={n.status} size="sm" />
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text)' }}>{n.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: 'var(--text-3)' }}>
                      <span>{n.sourceType}</span><span>·</span>
                      <span>Disposition: {n.disposition}</span><span>·</span>
                      <span>{n.affectedQty} units affected</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {canManage && (
                      <button onClick={e => handleDeleteNcr(n.id, e)} className="p-1 rounded hover:bg-[var(--surface-2)]" title="Remove"><Trash2 size={12} style={{ color: 'var(--error,#DC2626)' }} /></button>
                    )}
                    <ChevronRight size={14} style={{ color: 'var(--text-3)' }} />
                  </div>
                </div>
              </div>
            ))}
            {visibleNcrs.length === 0 && <div className="text-center py-10 text-sm" style={{ color: 'var(--text-3)' }}>No NCRs raised</div>}
          </div>
        )}
      </div>

      {showNew && (
        <NewInspectionModal
          prefilledJobId={prefilledJobId}
          jobs={jobs}
          onClose={() => setShowNew(false)}
          onSave={(ins) => {
            addInspection(ins);
            showToast({ type: 'success', title: 'Inspection created', body: `${ins.inspectionNumber} has been opened.` });
            setShowNew(false);
            navigate(`/quality/inspection/${ins.id}`);
          }}
        />
      )}

      {showNewNcr && (
        <NewNCRModal
          jobs={jobs}
          onClose={() => setShowNewNcr(false)}
          onSave={(ncr) => {
            addNCR(ncr);
            showToast({ type: 'success', title: 'NCR raised', body: `${ncr.ncrNumber} opened.` });
            setShowNewNcr(false);
            navigate(`/quality/ncr/${ncr.id}`);
          }}
        />
      )}
    </div>
  );
}

function NewInspectionModal({ onClose, onSave, prefilledJobId, jobs }: {
  onClose: () => void;
  onSave: (i: Inspection) => void;
  prefilledJobId?: string;
  jobs: any[];
}) {
  const [form, setForm] = useState({
    type: 'In-Process' as Inspection['type'],
    templateName: '',
    inspectorName: '',
    sampleQty: '1',
    jobId: prefilledJobId ?? '',
    stageName: '',
    notes: '',
  });
  const [err, setErr] = useState('');
  const selectedJob = jobs.find(j => j.id === form.jobId);
  const save = () => {
    if (!form.inspectorName) { setErr('Inspector name is required'); return; }
    const id = `ins-${Date.now()}`;
    const num = `INS-2026-${String(Math.floor(Math.random() * 900 + 100))}`;
    onSave({
      id, inspectionNumber: num, type: form.type, date: '2026-11-05',
      inspectorId: 'usr-demo', inspectorName: form.inspectorName,
      templateName: form.templateName || 'General',
      sampleQty: parseInt(form.sampleQty) || 1, acceptedQty: 0, rejectedQty: 0, result: 'pending',
      jobId: form.jobId || undefined,
      jobNumber: selectedJob?.jobNumber,
      stageName: form.stageName || undefined,
    });
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-[var(--text)]">New Inspection</h3>
          <button onClick={onClose}><X size={16} className="text-[var(--text-3)]" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Type</label>
            <select className="eoss-input w-full" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as Inspection['type'] }))}>
              {(['Incoming', 'In-Process', 'Final'] as const).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Job Reference (optional)</label>
            <select className="eoss-input w-full" value={form.jobId} onChange={e => setForm(f => ({ ...f, jobId: e.target.value, stageName: '' }))}>
              <option value="">— Not linked to a job —</option>
              {jobs.filter(j => j.status === 'active' || j.status === 'hold').map((j: any) => (
                <option key={j.id} value={j.id}>{j.jobNumber} · {j.description}</option>
              ))}
            </select>
          </div>
          {selectedJob && (
            <div>
              <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Stage</label>
              <select className="eoss-input w-full" value={form.stageName} onChange={e => setForm(f => ({ ...f, stageName: e.target.value }))}>
                <option value="">— Select stage —</option>
                {selectedJob.stages?.map((s: any) => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Checklist Template</label>
            <input className="eoss-input w-full" value={form.templateName} onChange={e => setForm(f => ({ ...f, templateName: e.target.value }))} placeholder="e.g. Weld Visual Check" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Inspector *</label>
            <input className="eoss-input w-full" value={form.inspectorName} onChange={e => setForm(f => ({ ...f, inspectorName: e.target.value }))} placeholder="Inspector name" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Sample Qty</label>
            <input type="number" min="1" className="eoss-input w-full" value={form.sampleQty} onChange={e => setForm(f => ({ ...f, sampleQty: e.target.value }))} />
          </div>
        </div>
        {err && <p className="text-xs text-red-500 mt-2">{err}</p>}
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[var(--border)] rounded-xl text-sm text-[var(--text-2)]">Cancel</button>
          <button onClick={save} className="flex-1 py-2.5 bg-[var(--brand)] text-white rounded-xl text-sm font-medium">Create</button>
        </div>
      </div>
    </div>
  );
}

function NewNCRModal({ onClose, onSave, jobs }: { onClose: () => void; onSave: (n: NCR) => void; jobs: any[] }) {
  const [form, setForm] = useState({
    sourceType: 'In-Process' as NCR['sourceType'],
    severity: 'Major' as NCR['severity'],
    description: '',
    affectedQty: '1',
    disposition: 'Pending' as NCR['disposition'],
    jobId: '',
    raisedBy: '',
  });
  const [err, setErr] = useState('');
  const selectedJob = jobs.find(j => j.id === form.jobId);
  const save = () => {
    if (!form.description) { setErr('Description is required'); return; }
    if (!form.raisedBy) { setErr('Raised by is required'); return; }
    const id = `ncr-new-${++ncrSeq}`;
    const num = `NCR-2026-${String(ncrSeq).padStart(3, '0')}`;
    onSave({
      id, ncrNumber: num,
      sourceType: form.sourceType,
      severity: form.severity,
      description: form.description,
      affectedQty: parseInt(form.affectedQty) || 1,
      disposition: form.disposition,
      raisedBy: form.raisedBy,
      raisedAt: new Date().toISOString(),
      status: 'open',
      jobId: form.jobId || undefined,
      jobNumber: selectedJob?.jobNumber,
    });
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-[var(--text)]">Raise NCR</h3>
          <button onClick={onClose}><X size={16} className="text-[var(--text-3)]" /></button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Source Type</label>
              <select className="eoss-input w-full" value={form.sourceType} onChange={e => setForm(f => ({ ...f, sourceType: e.target.value as any }))}>
                {(['Incoming', 'In-Process', 'Final', 'Customer Return'] as const).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Severity</label>
              <select className="eoss-input w-full" value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value as any }))}>
                {(['Minor', 'Major', 'Critical'] as const).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Job Reference (optional)</label>
            <select className="eoss-input w-full" value={form.jobId} onChange={e => setForm(f => ({ ...f, jobId: e.target.value }))}>
              <option value="">— Not linked —</option>
              {jobs.filter(j => j.status !== 'cancelled').map((j: any) => (
                <option key={j.id} value={j.id}>{j.jobNumber} · {j.description}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Description *</label>
            <textarea rows={3} className="eoss-input w-full resize-none" value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the non-conformance…" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Affected Qty</label>
              <input type="number" min="1" className="eoss-input w-full" value={form.affectedQty}
                onChange={e => setForm(f => ({ ...f, affectedQty: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Initial Disposition</label>
              <select className="eoss-input w-full" value={form.disposition} onChange={e => setForm(f => ({ ...f, disposition: e.target.value as any }))}>
                {(['Pending', 'Rework', 'Return', 'Scrap', 'Accept-on-Deviation'] as const).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Raised By *</label>
            <input className="eoss-input w-full" value={form.raisedBy} onChange={e => setForm(f => ({ ...f, raisedBy: e.target.value }))} placeholder="Your name" />
          </div>
        </div>
        {err && <p className="text-xs text-red-500 mt-2">{err}</p>}
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[var(--border)] rounded-xl text-sm text-[var(--text-2)]">Cancel</button>
          <button onClick={save} className="flex-1 py-2.5 text-white rounded-xl text-sm font-medium" style={{ background: 'var(--error,#DC2626)' }}>Raise NCR</button>
        </div>
      </div>
    </div>
  );
}
