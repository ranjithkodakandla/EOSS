import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, AlertTriangle, X } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';
import type { Inspection } from '../../types';

export default function Quality() {
  const { inspections, ncrs, currentUser, addInspection, showToast } = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'inspections' | 'ncrs'>('inspections');
  const [showNew, setShowNew] = useState(false);

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
          <button onClick={() => setShowNew(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: 'var(--brand)' }}>
            <Plus size={13} /> New Inspection
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 flex items-center border-b px-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        {([['inspections', `Inspections (${inspections.length})`], ['ncrs', `NCRs (${ncrs.length})`]] as [string, string][]).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id as any)}
            className="relative px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap"
            style={{ color: tab === id ? 'var(--brand)' : 'var(--text-2)' }}>
            {label}
            {tab === id && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full" style={{ background: 'var(--brand)' }} />}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        {tab === 'inspections' && (
          <table className="w-full text-sm border-separate border-spacing-0" style={{ minWidth: 800 }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 5 }}>
              <tr style={{ background: 'var(--surface-muted,#F8F9FC)' }}>
                {['Inspection #', 'Type', 'Subject', 'Date', 'Inspector', 'Sample', 'Accept', 'Reject', 'Result', ''].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inspections.map(i => (
                <tr key={i.id} className="cursor-pointer" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-muted,#F8F9FC)'; }}
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
                  <td className="px-4 py-3"><ChevronRight size={14} style={{ color: 'var(--text-3)' }} /></td>
                </tr>
              ))}
              {inspections.length === 0 && (
                <tr><td colSpan={10} className="px-4 py-10 text-center text-sm" style={{ color: 'var(--text-3)' }}>No inspections found</td></tr>
              )}
            </tbody>
          </table>
        )}

        {tab === 'ncrs' && (
          <div className="p-5 space-y-3 max-w-4xl">
            {ncrs.map(n => (
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
                  <ChevronRight size={14} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
                </div>
              </div>
            ))}
            {ncrs.length === 0 && <div className="text-center py-10 text-sm" style={{ color: 'var(--text-3)' }}>No NCRs raised</div>}
          </div>
        )}
      </div>

      {showNew && (
        <NewInspectionModal
          onClose={() => setShowNew(false)}
          onSave={(ins) => {
            addInspection(ins);
            showToast({ type: 'success', title: 'Inspection created', body: `${ins.inspectionNumber} has been opened.` });
            setShowNew(false);
            navigate(`/quality/inspection/${ins.id}`);
          }}
        />
      )}
    </div>
  );
}

function NewInspectionModal({ onClose, onSave }: { onClose: () => void; onSave: (i: Inspection) => void }) {
  const [form, setForm] = useState({ type: 'Incoming' as Inspection['type'], templateName: '', inspectorName: '', sampleQty: '1' });
  const [err, setErr] = useState('');
  const save = () => {
    if (!form.inspectorName) { setErr('Inspector name is required'); return; }
    const id = `ins-${Date.now()}`;
    const num = `INS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900 + 100))}`;
    onSave({ id, inspectionNumber: num, type: form.type, date: '2026-11-05', inspectorId: `usr-demo`, inspectorName: form.inspectorName, templateName: form.templateName || 'General', sampleQty: parseInt(form.sampleQty) || 1, acceptedQty: 0, rejectedQty: 0, result: 'pending' });
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-sm p-6 shadow-2xl">
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
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Checklist Template</label>
            <input className="eoss-input w-full" value={form.templateName} onChange={e => setForm(f => ({ ...f, templateName: e.target.value }))} placeholder="e.g. MS Plate Incoming Check" />
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
        {err && <p className="text-xs text-[var(--danger)] mt-2">{err}</p>}
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[var(--border)] rounded-xl text-sm text-[var(--text-2)]">Cancel</button>
          <button onClick={save} className="flex-1 py-2.5 bg-[var(--brand)] text-white rounded-xl text-sm font-medium">Create</button>
        </div>
      </div>
    </div>
  );
}
