import React, { useState } from 'react';
import { FileText, Download, Search, Plus, ChevronRight } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';
import clsx from 'clsx';

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
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-[var(--text)]">Document Vault</h1>
          <p className="text-sm text-[var(--text-2)]">{vaultDocuments.length} documents stored</p>
        </div>
        {['owner', 'buyer', 'qc'].includes(currentUser.role) && (
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--brand)] text-white rounded-lg text-sm font-medium"><Plus size={16} /> Upload Document</button>
        )}
      </div>

      <div className="relative mb-3">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents…" className="w-full pl-9 pr-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] placeholder:text-[var(--text-3)] focus:outline-none focus:border-[var(--brand)]" />
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCat(c)} className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors', cat === c ? 'bg-[var(--brand)] text-white' : 'border border-[var(--border)] text-[var(--text-2)]')}>
            {c}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map(doc => (
          <div key={doc.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 flex items-center gap-3 hover:border-[var(--brand)] transition-colors cursor-pointer">
            <div className="w-9 h-9 rounded-lg bg-[var(--surface-2)] flex items-center justify-center flex-shrink-0">
              <FileText size={16} className="text-[var(--brand)]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-[var(--text)] truncate">{doc.title}</span>
                <span className="text-[10px] font-semibold bg-[var(--surface-2)] text-[var(--text-3)] px-1.5 py-0.5 rounded">{doc.category}</span>
                {doc.obligation && <span className="text-[9px] font-bold bg-[var(--warning-bg)] text-[var(--warning)] px-1.5 py-0.5 rounded">RENEWAL DUE</span>}
              </div>
              <div className="flex items-center gap-3 mt-0.5 text-xs text-[var(--text-3)]">
                <span>{doc.docType}</span>
                <span>·</span>
                <span>v{doc.version}</span>
                <span>·</span>
                <span>{new Date(doc.uploadedAt).toLocaleDateString('en-IN')}</span>
                <span>·</span>
                <span>{doc.uploadedBy}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {doc.certStatus && <StatusChip status={doc.certStatus} size="sm" />}
              {doc.expiryDate && (
                <span className="text-[10px] text-[var(--text-3)]">
                  exp {new Date(doc.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                </span>
              )}
              <Download size={14} className="text-[var(--text-3)] hover:text-[var(--brand)]" />
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-center py-10 text-sm text-[var(--text-3)]">No documents found</div>}
      </div>
    </div>
  );
}
