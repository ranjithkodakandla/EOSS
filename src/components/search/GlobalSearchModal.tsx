import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, X, Briefcase, Package, Box, Wrench, FileText,
  Building2, Users, ArrowRight, Clock, ChevronRight
} from 'lucide-react';
import { useStore } from '../../store';

interface SearchResult {
  id: string;
  type: 'Sales Order' | 'Job' | 'Material' | 'Asset' | 'Supplier PO' | 'Document' | 'Customer' | 'Supplier';
  code: string;
  title: string;
  subtitle?: string;
  status?: string;
  url: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const RECENT_KEY = 'eoss_recent_searches';

export default function GlobalSearchModal({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      return stored ? JSON.parse(stored) : ['SO-1245', 'SS 304 Rod', 'CNC Lathe NL-2500', 'Stainless Source'];
    } catch {
      return ['SO-1245', 'SS 304 Rod', 'CNC Lathe NL-2500'];
    }
  });

  const {
    jobs, inventory, lots, assets, documents, customerPos, supplierPos
  } = useStore();

  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K and ESC)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Search indexing
  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const items: SearchResult[] = [];

    // 1. Customer POs / Sales Orders
    customerPos.forEach(po => {
      const alias = po.id === 'cpo-101' ? 'so-1245' : po.id === 'cpo-102' ? 'so-1246' : po.id === 'cpo-103' ? 'so-1247' : '';
      if (po.poNumber.toLowerCase().includes(q) || po.customerName.toLowerCase().includes(q) || alias.includes(q)) {
        items.push({
          id: po.id,
          type: 'Sales Order',
          code: po.id === 'cpo-101' ? 'SO-1245' : po.poNumber,
          title: po.customerName,
          subtitle: `Total Value: ₹${(po.totalValue / 100000).toFixed(2)}L · Lines: ${po.lineCount}`,
          status: po.status,
          url: `/sales/po/${po.id}`
        });
      }
    });

    // 2. Jobs
    jobs.forEach(job => {
      const alias = job.id === 'J-101' ? 'so-1245' : job.id === 'J-102' ? 'so-1246' : job.id === 'J-103' ? 'so-1247' : '';
      if (job.jobNumber.toLowerCase().includes(q) || job.description.toLowerCase().includes(q) || job.customerName.toLowerCase().includes(q) || alias.includes(q)) {
        items.push({
          id: job.id,
          type: 'Job',
          code: job.jobNumber,
          title: job.description,
          subtitle: `${job.customerName} · Stage: ${job.currentStage}`,
          status: job.status,
          url: `/jobs/${job.id}`
        });
      }
    });

    // 3. Materials
    inventory.forEach(inv => {
      if (inv.materialName.toLowerCase().includes(q) || inv.materialCode.toLowerCase().includes(q) || inv.categoryName.toLowerCase().includes(q)) {
        items.push({
          id: inv.id,
          type: 'Material',
          code: inv.materialCode,
          title: inv.materialName,
          subtitle: `${inv.categoryName} · Available: ${inv.availableQty} ${inv.primaryUom}`,
          status: inv.shortage ? 'Shortage' : 'In Stock',
          url: `/inventory`
        });
      }
    });

    // 4. Supplier POs
    supplierPos.forEach(spo => {
      if (spo.poNumber.toLowerCase().includes(q) || spo.supplierName.toLowerCase().includes(q)) {
        items.push({
          id: spo.id,
          type: 'Supplier PO',
          code: spo.poNumber,
          title: spo.supplierName,
          subtitle: `Committed: ${spo.committedDate} · ₹${(spo.totalValue / 100000).toFixed(2)}L`,
          status: spo.status,
          url: `/procurement/spo/${spo.id}`
        });
      }
    });

    // 5. Assets
    assets.forEach(asset => {
      if (asset.name.toLowerCase().includes(q) || asset.assetCode.toLowerCase().includes(q) || asset.category.toLowerCase().includes(q)) {
        items.push({
          id: asset.id,
          type: 'Asset',
          code: asset.assetCode,
          title: asset.name,
          subtitle: `${asset.location || asset.workCentre || 'Plant Floor'} · ${asset.category}`,
          status: asset.status,
          url: `/assets/${asset.id}`
        });
      }
    });

    // 6. Documents
    documents.forEach(doc => {
      if (doc.title.toLowerCase().includes(q) || doc.docType.toLowerCase().includes(q) || doc.category.toLowerCase().includes(q)) {
        items.push({
          id: doc.id,
          type: 'Document',
          code: doc.docType,
          title: doc.title,
          subtitle: `${doc.category} · By ${doc.uploadedBy}`,
          status: 'Active',
          url: `/documents`
        });
      }
    });

    return items.slice(0, 12);
  }, [query, jobs, inventory, customerPos, supplierPos, assets, documents]);

  const handleSelect = (item: SearchResult) => {
    // Record recent search
    const updated = [item.code, ...recentSearches.filter(r => r !== item.code)].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    } catch {}

    onClose();
    navigate(item.url);
  };

  if (!isOpen) return null;

  return (
    <div data-overlay="center" className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 px-4 bg-black/50 backdrop-blur-sm">
      <div
        className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border"
        style={{
          background: 'var(--surface, #FFFFFF)',
          borderColor: 'var(--border, #E5E0F5)',
          boxShadow: 'var(--shadow-elevated, 0 8px 28px rgba(24, 27, 65, 0.12))',
        }}
      >
        {/* Input Bar */}
        <div
          className="flex items-center gap-3 px-4 py-3.5 border-b"
          style={{ borderColor: 'var(--border, #E5E0F5)' }}
        >
          <Search size={18} className="text-[var(--text-2)] flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search orders, customers, suppliers, materials, documents..."
            className="flex-1 bg-transparent text-sm md:text-base text-[var(--text)] placeholder-[var(--text-2)]/60 focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-[var(--text-2)] hover:bg-[var(--surface-2)]"
            >
              <X size={16} />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-2)] border border-[var(--border)]">
              ESC
            </kbd>
          )}
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-3">
          {query.trim() === '' ? (
            /* Recent Searches & Guidance */
            <div className="p-3 space-y-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-2)] mb-2 flex items-center gap-1.5">
                  <Clock size={12} />
                  <span>Recent Records & Searches</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((tag, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQuery(tag)}
                      className="text-xs px-3 py-1.5 rounded-lg border font-medium text-[var(--text)] hover:border-[var(--brand)] hover:bg-[var(--surface-2)] transition-colors flex items-center gap-1.5"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <span>{tag}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--border)]">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-2)] mb-2">
                  Search Scope
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-[var(--text-2)]">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--surface-2)]">
                    <Briefcase size={14} className="text-[var(--brand)]" />
                    <span>Customer & Sales POs</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--surface-2)]">
                    <Package size={14} className="text-[var(--brand)]" />
                    <span>Procurement & Supplier POs</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--surface-2)]">
                    <Box size={14} className="text-[var(--brand)]" />
                    <span>Inventory & Lots</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--surface-2)]">
                    <Wrench size={14} className="text-[var(--brand)]" />
                    <span>Machines & Assets</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--surface-2)]">
                    <FileText size={14} className="text-[var(--brand)]" />
                    <span>Vault Documents & MTCs</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--surface-2)]">
                    <Users size={14} className="text-[var(--brand)]" />
                    <span>Customers & Suppliers</span>
                  </div>
                </div>
              </div>
            </div>
          ) : results.length > 0 ? (
            /* Search Results List */
            <div className="space-y-1">
              <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-2)]">
                Found {results.length} records matching "{query}"
              </div>
              {results.map(item => (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleSelect(item)}
                  className="w-full text-left flex items-center justify-between p-3 rounded-xl hover:bg-[var(--surface-2)] transition-colors group border border-transparent hover:border-[var(--border)]"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        background: 'var(--brand-soft, #EEE9FF)',
                        color: 'var(--brand)',
                      }}
                    >
                      {item.type}
                    </span>
                    <div className="overflow-hidden">
                      <div className="text-sm font-semibold text-[var(--text)] group-hover:text-[var(--brand)] flex items-center gap-2">
                        <span className="font-mono text-xs">{item.code}</span>
                        <span>·</span>
                        <span className="truncate">{item.title}</span>
                      </div>
                      {item.subtitle && (
                        <div className="text-xs text-[var(--text-2)] truncate">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                    {item.status && (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-2)]">
                        {item.status}
                      </span>
                    )}
                    <ChevronRight size={14} className="text-[var(--text-2)] group-hover:text-[var(--brand)] transition-transform group-hover:translate-x-0.5" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            /* No Results */
            <div className="text-center py-12 px-4">
              <Search size={28} className="mx-auto text-[var(--text-2)]/50 mb-2" />
              <div className="text-sm font-semibold text-[var(--text)]">
                No records found for "{query}"
              </div>
              <div className="text-xs text-[var(--text-2)] mt-1">
                Try searching by order number (e.g. SO-1245), material grade (SS 304), machine code, or supplier name.
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div
          className="px-4 py-2.5 bg-[var(--surface-2)] border-t flex items-center justify-between text-xs text-[var(--text-2)]"
          style={{ borderColor: 'var(--border, #E5E0F5)' }}
        >
          <span className="flex items-center gap-1.5">
            <span className="font-medium text-[var(--text)]">Navigation Search</span>
            <span>· Instant record lookup</span>
          </span>
          <span className="font-mono text-[11px]">Press ESC to close</span>
        </div>
      </div>
    </div>
  );
}
