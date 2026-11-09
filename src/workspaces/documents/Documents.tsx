import React, { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileText, Search, Plus, X, RefreshCw } from 'lucide-react';
import { useStore } from '../../store';
import { computeDocumentExpiry, listExpiringDocuments } from '../../domain/documentExpiry';
import { DEMO_NOW } from '../../data/seed';
import StatusChip from '../../components/layout/StatusChip';
import type { VaultDocument } from '../../types';

const CATEGORIES = ['All', 'Job Documents', 'Quality Documents', 'Material Certificates', 'Supplier Documents', 'Company Certificates', 'Asset Documents'];

export default function Documents() {
  const { documents: vaultDocuments, currentUser, addDocument, addDocumentVersion, showToast } = useStore();
  const [searchParams] = useSearchParams();
  const attentionParam = searchParams.get('attention');
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');
  const [attention, setAttention] = useState<'all' | 'expiring' | 'expired' | 'due'>(
    attentionParam === 'expiring' || attentionParam === 'expired' || attentionParam === 'due' ? attentionParam : 'all'
  );
  const [showUpload, setShowUpload] = useState(false);
  const now = new Date(DEMO_NOW);

  const visibleDocs = vaultDocuments.filter(d => d.status !== 'superseded');
  const filtered = visibleDocs.filter(d => {
    const matchSearch = !search || d.title.toLowerCase().includes(search.toLowerCase()) || d.docType.toLowerCase().includes(search.toLowerCase());
    const matchCat = cat === 'All' || d.category === cat;
    const expiry = computeDocumentExpiry(d, now);
    const matchAttention = attention === 'all'
      || (attention === 'due' && (expiry.status === 'expiring' || expiry.status === 'expired'))
      || expiry.status === attention;
    return matchSearch && matchCat && matchAttention;
  });

  const expiring = listExpiringDocuments(visibleDocs, now);
  const expiredCount = expiring.filter(x => x.info.status === 'expired').length;
  const expiringCount = expiring.filter(x => x.info.status === 'expiring').length;

  const handleRenew = (docId: string) => {
    const doc = vaultDocuments.find(d => d.id === docId);
    if (!doc) return;
    const newExpiry = doc.expiryDate ? new Date(doc.expiryDate) : new Date(now);
    newExpiry.setFullYear(newExpiry.getFullYear() + 1);
    addDocumentVersion(docId, {
      ...doc, id: `doc-${Date.now()}`, version: doc.version + 1, uploadedBy: currentUser.name, uploadedAt: DEMO_NOW,
      issueDate: DEMO_NOW, expiryDate: newExpiry.toISOString().slice(0, 10),
      obligation: doc.obligation ? { ...doc.obligation, renewalDue: newExpiry.toISOString().slice(0, 10) } : undefined,
    });
  };

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
        <select
          value={cat}
          onChange={e => setCat(e.target.value)}
          className="md:hidden eoss-input text-xs py-1.5 max-w-[11rem]"
          aria-label="Document category"
        >
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <div className="hidden md:flex gap-1.5 overflow-x-auto">
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
        {expiringCount > 0 && (
          <button type="button" onClick={() => setAttention(attention === 'expiring' ? 'all' : 'expiring')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
            style={{ background: 'var(--warning-bg,#FFFBEB)', color: 'var(--warning,#D97706)', borderColor: attention === 'expiring' ? 'var(--warning,#D97706)' : 'transparent' }}>
            {expiringCount} expiring
          </button>
        )}
        {expiredCount > 0 && (
          <button type="button" onClick={() => setAttention(attention === 'expired' ? 'all' : 'expired')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
            style={{ background: 'var(--error-bg,#FEF2F2)', color: 'var(--error,#DC2626)', borderColor: attention === 'expired' ? 'var(--error,#DC2626)' : 'transparent' }}>
            {expiredCount} expired
          </button>
        )}
        {['owner', 'buyer', 'qc'].includes(currentUser.role) && (
          <button onClick={() => setShowUpload(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: 'var(--brand)' }}>
            <Plus size={13} /> Upload
          </button>
        )}
      </div>

      {attention !== 'all' && (
        <div className="px-5 py-2 text-sm border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
          These documents are expiring or already expired. Renew extends the current certificate by a year.
        </div>
      )}
      <div className="flex-1 overflow-auto p-5">
        <div className="space-y-2 max-w-4xl">
          {filtered.map(doc => {
            const expiry = computeDocumentExpiry(doc, now);
            return (
              <div key={doc.id} className="rounded-xl border p-4 flex items-center gap-3 hover:opacity-90 transition-opacity"
                style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--surface-2)' }}>
                  <FileText size={16} style={{ color: 'var(--brand)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{doc.title}</span>
                    {expiry.status === 'expired' && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'var(--error-bg,#FEF2F2)', color: 'var(--error,#DC2626)' }}>Expired</span>}
                    {expiry.status === 'expiring' && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'var(--warning-bg,#FFFBEB)', color: 'var(--warning,#D97706)' }}>{expiry.daysToExpiry}d left</span>}
                    {doc.certStatus && <StatusChip status={doc.certStatus} size="sm" />}
                  </div>
                  <div className="mt-0.5 text-xs truncate" style={{ color: 'var(--text-3)' }}>
                    {doc.category} · {doc.docType}
                    {doc.linkedEntities.length > 0 && ` · ${doc.linkedEntities.map(e => e.ref).join(', ')}`}
                  </div>
                </div>
                {(expiry.status === 'expiring' || expiry.status === 'expired') && (
                  <button onClick={() => handleRenew(doc.id)} className="flex items-center gap-1 text-xs font-semibold flex-shrink-0" style={{ color: 'var(--brand)' }}>
                    <RefreshCw size={12} /> Renew
                  </button>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && <div className="text-center py-10 text-sm" style={{ color: 'var(--text-3)' }}>No documents found</div>}
        </div>
      </div>

      {showUpload && (
        <UploadModal
          currentUser={currentUser}
          onClose={() => setShowUpload(false)}
          onSave={(doc) => {
            addDocument(doc);
            showToast({ type: 'success', title: 'Document uploaded', body: `${doc.title} has been added to the vault.` });
            setShowUpload(false);
          }}
        />
      )}
    </div>
  );
}

function UploadModal({ currentUser, onClose, onSave }: { currentUser: { name: string; id: string }; onClose: () => void; onSave: (doc: VaultDocument) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ title: '', category: 'Job Documents', docType: '', file: null as File | null });
  const [err, setErr] = useState('');
  const save = () => {
    if (!form.title) { setErr('Title is required'); return; }
    if (!form.file) { setErr('Please select a file'); return; }
    const doc: VaultDocument = {
      id: `doc-${Date.now()}`,
      title: form.title,
      category: form.category,
      docType: form.docType || 'General',
      uploadedBy: currentUser.name,
      uploadedAt: new Date().toISOString(),
      version: 1,
      fileSize: form.file.size > 1024 * 1024 ? `${(form.file.size / 1024 / 1024).toFixed(1)} MB` : `${Math.round(form.file.size / 1024)} KB`,
      linkedEntities: [],
    };
    onSave(doc);
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
