import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FileText, Search, Plus, X, RefreshCw } from 'lucide-react';
import { useStore } from '../../store';
import { computeDocumentExpiry, listExpiringDocuments } from '../../domain/documentExpiry';
import { DEMO_NOW } from '../../data/seed';
import { formatDisplayDate } from '../../domain/dates';
import StatusChip from '../../components/layout/StatusChip';
import type { VaultDocument } from '../../types';

const CATEGORIES = ['All', 'Job Documents', 'Quality Documents', 'Material Certificates', 'Supplier Documents', 'Company Certificates', 'Asset Documents'];

export default function Documents() {
  const {
    documents: vaultDocuments, suppliers, customers, jobs, assets, currentUser,
    addDocument, renewDocument, showToast,
  } = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const attentionParam = searchParams.get('attention');
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [cat, setCat] = useState('All');
  const [showArchived, setShowArchived] = useState(false);
  const [attention, setAttention] = useState<'all' | 'expiring' | 'expired' | 'due'>(
    attentionParam === 'expiring' || attentionParam === 'expired' || attentionParam === 'due' ? attentionParam : 'all'
  );
  const [showUpload, setShowUpload] = useState(false);
  const [renewTarget, setRenewTarget] = useState<VaultDocument | null>(null);
  const now = new Date(DEMO_NOW);

  const visibleDocs = vaultDocuments.filter(d => d.status !== 'superseded' && (showArchived || d.status !== 'archived'));
  const activeDocs = vaultDocuments.filter(d => d.status !== 'superseded' && d.status !== 'archived');
  const filtered = visibleDocs.filter(d => {
    const matchSearch = !search || d.title.toLowerCase().includes(search.toLowerCase()) || d.docType.toLowerCase().includes(search.toLowerCase());
    const matchCat = cat === 'All' || d.category === cat;
    const expiry = computeDocumentExpiry(d, now);
    const matchAttention = attention === 'all'
      || (attention === 'due' && (expiry.status === 'expiring' || expiry.status === 'expired'))
      || expiry.status === attention;
    return matchSearch && matchCat && matchAttention;
  });

  const expiring = listExpiringDocuments(activeDocs, now);
  const expiredCount = expiring.filter(x => x.info.status === 'expired').length;
  const expiringCount = expiring.filter(x => x.info.status === 'expiring').length;

  const renewParam = searchParams.get('renew');
  const renewed = useRef<string | null>(null);
  useEffect(() => {
    if (!renewParam || renewed.current === renewParam) return;
    renewed.current = renewParam;
    const target = vaultDocuments.find(d => d.id === renewParam && d.status !== 'archived');
    if (target) setRenewTarget(target);
  }, [renewParam, vaultDocuments]);

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
        <button
          type="button"
          onClick={() => setShowArchived(v => !v)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border"
          style={{
            background: showArchived ? 'var(--surface-2)' : 'var(--surface)',
            color: 'var(--text-2)',
            borderColor: showArchived ? 'var(--brand)' : 'var(--border)',
          }}
        >
          {showArchived ? 'Hide archived' : 'Show archived'}
        </button>
        {['owner', 'buyer', 'qc'].includes(currentUser.role) && (
          <button onClick={() => setShowUpload(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: 'var(--brand-fill)' }}>
            <Plus size={13} /> Upload
          </button>
        )}
      </div>

      {attention !== 'all' && (
        <div className="px-5 py-2 text-sm border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
          These documents are expiring or already expired. Click Renew to upload a replacement file and set a new expiry date.
        </div>
      )}
      <div className="flex-1 overflow-auto p-5">
        <div className="space-y-2 max-w-4xl">
          {filtered.map(doc => {
            const expiry = computeDocumentExpiry(doc, now);
            const isArchived = doc.status === 'archived';
            return (
              <div key={doc.id} role="button" tabIndex={0} onClick={() => navigate(`/documents/${doc.id}`)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') navigate(`/documents/${doc.id}`); }} className="rounded-xl border p-4 flex items-center gap-3 hover:opacity-90 transition-opacity cursor-pointer"
                style={{ borderColor: 'var(--border)', background: 'var(--surface)', opacity: isArchived ? 0.7 : 1 }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--surface-2)' }}>
                  <FileText size={16} style={{ color: 'var(--brand)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{doc.title}</span>
                    {isArchived && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'var(--surface-2)', color: 'var(--text-3)' }}>Archived</span>}
                    {!isArchived && expiry.status === 'expired' && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'var(--error-bg,#FEF2F2)', color: 'var(--error,#DC2626)' }}>Expired</span>}
                    {!isArchived && expiry.status === 'expiring' && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'var(--warning-bg,#FFFBEB)', color: 'var(--warning,#D97706)' }}>{expiry.daysToExpiry}d left</span>}
                    {doc.certStatus && <StatusChip status={doc.certStatus} size="sm" />}
                  </div>
                  <div className="mt-0.5 text-xs truncate" style={{ color: 'var(--text-3)' }}>
                    {doc.category} · {doc.docType}
                    {doc.expiryDate && ` · Expires ${formatDisplayDate(doc.expiryDate)}`}
                    {doc.linkedEntities.length > 0 && ` · ${doc.linkedEntities.map(e => e.ref).join(', ')}`}
                  </div>
                </div>
                {!isArchived && (expiry.status === 'expiring' || expiry.status === 'expired') && (
                  <button onClick={e => { e.stopPropagation(); setRenewTarget(doc); }} className="flex items-center gap-1 text-xs font-semibold flex-shrink-0" style={{ color: 'var(--brand)' }}>
                    <RefreshCw size={12} /> Renew
                  </button>
                )}
                <button type="button" onClick={e => { e.stopPropagation(); navigate(`/documents/${doc.id}`); }} className="text-xs font-semibold flex-shrink-0" style={{ color: 'var(--brand)' }}>
                  Open document →
                </button>
              </div>
            );
          })}
          {filtered.length === 0 && <div className="text-center py-10 text-sm" style={{ color: 'var(--text-3)' }}>No documents found</div>}
        </div>
      </div>

      {showUpload && (
        <UploadModal
          currentUser={currentUser}
          suppliers={suppliers.map(s => ({ id: s.id, name: s.tradingName }))}
          customers={customers.map(c => ({ id: c.id, name: c.tradingName }))}
          jobs={jobs.map(j => ({ id: j.id, jobNumber: j.jobNumber, description: j.description }))}
          assets={assets}
          onClose={() => setShowUpload(false)}
          onSave={(doc) => {
            addDocument(doc);
            showToast({ type: 'success', title: 'Document uploaded', body: `${doc.title} has been added to the vault.` });
            setShowUpload(false);
          }}
        />
      )}

      {renewTarget && (
        <RenewDocumentModal
          doc={renewTarget}
          currentUser={currentUser}
          onClose={() => setRenewTarget(null)}
          onSave={(payload) => {
            renewDocument(renewTarget.id, payload);
            showToast({ type: 'success', title: 'Document renewed', body: `${renewTarget.title} renewed until ${formatDisplayDate(payload.expiryDate)}.` });
            setRenewTarget(null);
          }}
        />
      )}
    </div>
  );
}

function UploadModal({
  currentUser, suppliers, customers, jobs, assets, onClose, onSave,
}: {
  currentUser: { name: string; id: string };
  suppliers: { id: string; name: string }[];
  customers: { id: string; name: string }[];
  jobs: { id: string; jobNumber: string; description: string }[];
  assets: { id: string; assetCode: string; name: string }[];
  onClose: () => void;
  onSave: (doc: VaultDocument) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: '',
    category: 'Job Documents',
    docType: '',
    linkType: '' as '' | 'Supplier' | 'Customer' | 'Job' | 'Asset',
    linkId: '',
    issueDate: '',
    expiryDate: '',
    reminderDays: '30',
    file: null as File | null,
  });
  const [err, setErr] = useState('');

  const linkOptions = form.linkType === 'Supplier'
    ? suppliers.map(s => ({ id: s.id, ref: s.name }))
    : form.linkType === 'Customer'
    ? customers.map(c => ({ id: c.id, ref: c.name }))
    : form.linkType === 'Job'
    ? jobs.map(j => ({ id: j.id, ref: j.jobNumber }))
    : form.linkType === 'Asset'
    ? assets.map(a => ({ id: a.id, ref: `${a.assetCode} — ${a.name}` }))
    : [];

  const save = () => {
    if (!form.title.trim()) { setErr('Title is required'); return; }
    if (!form.file) { setErr('Please select a file'); return; }
    if (form.issueDate && form.expiryDate && form.expiryDate < form.issueDate) {
      setErr('Expiry date cannot be earlier than issue date');
      return;
    }
    const chosen = linkOptions.find(o => o.id === form.linkId);
    const linkedEntities = form.linkType && chosen
      ? [{ type: form.linkType, ref: chosen.ref }]
      : [];
    const doc: VaultDocument = {
      id: `doc-${Date.now()}`,
      title: form.title.trim(),
      category: form.category,
      docType: form.docType.trim() || 'General',
      uploadedBy: currentUser.name,
      uploadedAt: new Date().toISOString().slice(0, 10),
      version: 1,
      fileName: form.file.name,
      fileSize: form.file.size > 1024 * 1024 ? `${(form.file.size / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(form.file.size / 1024))} KB`,
      issueDate: form.issueDate || undefined,
      expiryDate: form.expiryDate || undefined,
      reminderDays: form.expiryDate ? Math.max(1, Number(form.reminderDays) || 30) : undefined,
      status: 'active',
      linkedEntities,
    };
    onSave(doc);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-[var(--text)]">Upload Document</h3>
          <button onClick={onClose}><X size={16} className="text-[var(--text-3)]" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Title *</label>
            <input className="eoss-input w-full" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Document title" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Category</label>
              <select className="eoss-input w-full" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Doc Type</label>
              <input className="eoss-input w-full" value={form.docType} onChange={e => setForm(f => ({ ...f, docType: e.target.value }))} placeholder="Certificate, Drawing…" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Linked record type</label>
              <select
                className="eoss-input w-full"
                value={form.linkType}
                onChange={e => setForm(f => ({ ...f, linkType: e.target.value as typeof f.linkType, linkId: '' }))}
              >
                <option value="">None</option>
                <option value="Supplier">Supplier</option>
                <option value="Customer">Customer</option>
                <option value="Job">Job</option>
                <option value="Asset">Asset</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Linked record</label>
              <select
                className="eoss-input w-full"
                disabled={!form.linkType}
                value={form.linkId}
                onChange={e => setForm(f => ({ ...f, linkId: e.target.value }))}
              >
                <option value="">{form.linkType ? `Select ${form.linkType.toLowerCase()}…` : 'Select type first'}</option>
                {linkOptions.map(o => <option key={o.id} value={o.id}>{o.ref}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Issue date</label>
              <input type="date" className="eoss-input w-full" value={form.issueDate} onChange={e => setForm(f => ({ ...f, issueDate: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Expiry date</label>
              <input type="date" className="eoss-input w-full" value={form.expiryDate} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Remind (days)</label>
              <input type="number" min={1} max={365} className="eoss-input w-full" value={form.reminderDays} onChange={e => setForm(f => ({ ...f, reminderDays: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">File *</label>
            <input ref={fileRef} type="file" className="hidden" onChange={e => setForm(f => ({ ...f, file: e.target.files?.[0] ?? null, title: f.title || (e.target.files?.[0]?.name.replace(/\.[^.]+$/, '') ?? '') }))} />
            <button type="button" onClick={() => fileRef.current?.click()} className="w-full py-2 border-2 border-dashed border-[var(--border)] rounded-xl text-xs text-[var(--text-3)] hover:border-[var(--brand)] transition-colors">
              {form.file ? form.file.name : 'Click to browse files…'}
            </button>
          </div>
        </div>
        {err && <p className="text-xs text-[var(--danger)] mt-2">{err}</p>}
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[var(--border)] rounded-xl text-sm text-[var(--text-2)]">Cancel</button>
          <button onClick={save} className="flex-1 py-2.5 bg-[var(--brand-fill)] text-white rounded-xl text-sm font-medium">Upload</button>
        </div>
      </div>
    </div>
  );
}

export function RenewDocumentModal({
  doc,
  currentUser,
  onClose,
  onSave,
}: {
  doc: VaultDocument;
  currentUser: { name: string; id: string };
  onClose: () => void;
  onSave: (payload: { fileName: string; fileSize: string; issueDate?: string; expiryDate: string; reminderDays?: number; uploadedBy: string; notes?: string }) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const defaultNextExpiry = (() => {
    const base = doc.expiryDate && doc.expiryDate > DEMO_NOW ? new Date(doc.expiryDate) : new Date(DEMO_NOW);
    base.setFullYear(base.getFullYear() + 1);
    return base.toISOString().slice(0, 10);
  })();
  const [file, setFile] = useState<File | null>(null);
  const [issueDate, setIssueDate] = useState(DEMO_NOW);
  const [expiryDate, setExpiryDate] = useState(defaultNextExpiry);
  const [reminderDays, setReminderDays] = useState(String(doc.reminderDays ?? 30));
  const [notes, setNotes] = useState('');
  const [err, setErr] = useState('');

  const handleSubmit = () => {
    if (!file) { setErr('Please attach the renewed document file'); return; }
    if (!expiryDate) { setErr('New expiry date is required'); return; }
    if (issueDate && expiryDate < issueDate) { setErr('Expiry date cannot be earlier than issue date'); return; }
    onSave({
      fileName: file.name,
      fileSize: file.size > 1024 * 1024 ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`,
      issueDate: issueDate || undefined,
      expiryDate,
      reminderDays: Math.max(1, Number(reminderDays) || 30),
      uploadedBy: currentUser.name,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-[var(--text)]">Renew Document</h3>
          <button onClick={onClose}><X size={16} className="text-[var(--text-3)]" /></button>
        </div>
        <p className="text-xs mb-4" style={{ color: 'var(--text-3)' }}>
          Replacing <strong style={{ color: 'var(--text)' }}>{doc.title}</strong> (v{doc.version}) with a new version. Previous version remains in audit history.
        </p>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">New file *</label>
            <input ref={fileRef} type="file" className="hidden" onChange={e => setFile(e.target.files?.[0] ?? null)} />
            <button type="button" onClick={() => fileRef.current?.click()} className="w-full py-2.5 border-2 border-dashed border-[var(--border)] rounded-xl text-xs text-[var(--text-3)] hover:border-[var(--brand)] transition-colors">
              {file ? file.name : 'Click to upload renewed certificate / file…'}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Issue date</label>
              <input type="date" className="eoss-input w-full" value={issueDate} onChange={e => setIssueDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-2)] mb-1">New expiry *</label>
              <input type="date" className="eoss-input w-full" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Remind (days)</label>
              <input type="number" min={1} max={365} className="eoss-input w-full" value={reminderDays} onChange={e => setReminderDays(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Notes</label>
            <input className="eoss-input w-full" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Renewal reference or certificate number…" />
          </div>
        </div>
        {err && <p className="text-xs text-[var(--danger)] mt-2">{err}</p>}
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[var(--border)] rounded-xl text-sm text-[var(--text-2)]">Cancel</button>
          <button onClick={handleSubmit} className="flex-1 py-2.5 bg-[var(--brand-fill)] text-white rounded-xl text-sm font-medium">Save Renewal</button>
        </div>
      </div>
    </div>
  );
}
