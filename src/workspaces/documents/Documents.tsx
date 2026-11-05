import React, { useState } from 'react';
import { FileText, Download, Search, Plus } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';

const CATEGORIES = ['All', 'Job Documents', 'Quality Documents', 'Material Certificates', 'Supplier Documents', 'Company Certificates', 'Asset Documents'];

export default function Documents() {
  const { documents: vaultDocuments, currentUser } = useStore();
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');

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
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: 'var(--brand)' }}>
            <Plus size={13} /> Upload
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto p-5">
        <div className="space-y-2 max-w-4xl">
          {filtered.map(doc => (
            <div key={doc.id} className="rounded-xl border p-4 flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--surface-muted,#F8F9FC)' }}>
                <FileText size={16} style={{ color: 'var(--brand)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{doc.title}</span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: 'var(--surface-muted,#F8F9FC)', color: 'var(--text-3)' }}>{doc.category}</span>
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
    </div>
  );
}
