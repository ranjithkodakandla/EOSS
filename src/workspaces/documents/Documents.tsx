import React, { useRef, useState } from 'react';
import { FileText, Download, Search, Plus, X } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';

const CATEGORIES = ['All', 'Job Documents', 'Quality Documents', 'Material Certificates', 'Supplier Documents', 'Company Certificates', 'Asset Documents'];

export default function Documents() {
  const { documents: vaultDocuments, currentUser, showToast } = useStore();
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');
  const [showUpload, setShowUpload] = useState(false);

  const filtered = vaultDocuments.filter(d => {
    const matchSearch = !search || d.title.toLowerCase().includes(search.toLowerCase()) || d.docType.toLowerCase().includes(search.toLowerCase());
    const matchCat = cat === 'All' || d.category === cat;
    return matchSearch && matchCat;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex-shrink-0 flex items-center gap-3 px-5 py-3 border-b flex-wrap" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents…"
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border outline-none"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text)' }} />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap"
              style={{
                background: cat === c ? 'var(--brand)' : 'var(--surface)',
                color: cat === c ? '#fff' : 'var(--text-2)',
                borderColor: cat === c ? 'var(--brand)' : 'var(--border)',
              }}>
              {c}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        {['owner', 'buyer', 'qc'].includes(currentUser.role) && (
          <button onClick={() => setShowUpload(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: 'var(--brand)' }}>
            <Plus size={13} /> Upload
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto p-5">
        <div className="space-y-2 max-w-4xl">
          {filtered.map(doc => (
            <div key={doc.id} className="rounded-xl border p-4 flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--surface-2)' }}>
                <FileText size={16} style={{ color: 'var(--brand)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{doc.title}</span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: 'var(--surface-2)', color: 'var(--text-3)' }}>{doc.category}</span>
                  {doc.obligation && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'var(--warning-bg,#FFFBEB)', color: 'var(--warning,#D97706)' }}>RENEWAL DUE</span>}
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs" style={{ color: 'var(--text-3)' }}>
                  <span>{doc.docType}</span><span>·</span>
                  <span>v{doc.version}</span><span>·</span>
                  <span>{new Date(doc.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span><span>·</span>
                  <span>{doc.uploadedBy}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {doc.certStatus && <StatusChip status={doc.certStatus} size="sm" />}
                {doc.expiryDate && (
                  <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>
                    exp {new Date(doc.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                  </span>
                )}
                <Download size={14} style={{ color: 'var(--text-3)' }} />
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="text-center py-10 text-sm" style={{ color: 'var(--text-3)' }}>No documents found</div>}
        </div>
      </div>

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSave={(title) => {
            showToast({ type: 'success', title: 'Document uploaded', body: `${title} has been added to the vault.` });
            setShowUpload(false);
          }}
        />
      )}
    </div>
  );
}

function UploadModal({ onClose, onSave }: { onClose: () => void; onSave: (title: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ title: '', category: 'Job Documents', docType: '', file: null as File | null });
  const [err, setErr] = useState('');
  const save = () => {
    if (!form.title) { setErr('Title is required'); return; }
    if (!form.file) { setErr('Please select a file'); return; }
    onSave(form.title);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-[var(--text)]">Upload Document</h3>
          <button onClick={onClose}><X size={16} className="text-[var(--text-3)]" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Title *</label>
            <input className="eoss-input w-full" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Document title" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Category</label>
            <select className="eoss-input w-full" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Doc Type</label>
            <input className="eoss-input w-full" value={form.docType} onChange={e => setForm(f => ({ ...f, docType: e.target.value }))} placeholder="e.g. Certificate, Drawing, Invoice" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">File *</label>
            <input ref={fileRef} type="file" className="hidden" onChange={e => setForm(f => ({ ...f, file: e.target.files?.[0] ?? null, title: f.title || (e.target.files?.[0]?.name.replace(/\.[^.]+$/, '') ?? '') }))} />
            <button onClick={() => fileRef.current?.click()} className="w-full py-2 border-2 border-dashed border-[var(--border)] rounded-xl text-xs text-[var(--text-3)] hover:border-[var(--brand)] transition-colors">
              {form.file ? form.file.name : 'Click to browse files…'}
            </button>
          </div>
        </div>
        {err && <p className="text-xs text-[var(--danger)] mt-2">{err}</p>}
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[var(--border)] rounded-xl text-sm text-[var(--text-2)]">Cancel</button>
          <button onClick={save} className="flex-1 py-2.5 bg-[var(--brand)] text-white rounded-xl text-sm font-medium">Upload</button>
        </div>
      </div>
    </div>
  );
}
