import React from 'react';
import { FileText, ExternalLink, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { computeDocumentExpiry } from '../../domain/documentExpiry';
import { DEMO_NOW } from '../../data/seed';
import { formatDisplayDate } from '../../domain/dates';

interface LinkedDocumentsSectionProps {
  entityType: string;
  entityId?: string;
  entityRef: string;
  entityName?: string;
  title?: string;
}

export default function LinkedDocumentsSection({
  entityType,
  entityId,
  entityRef,
  entityName,
  title = 'Documents',
}: LinkedDocumentsSectionProps) {
  const navigate = useNavigate();
  const { documents } = useStore();
  const now = new Date(DEMO_NOW);

  const norm = (v?: string) => (v ?? '').trim().toLowerCase();
  const targetRef = norm(entityRef);
  const targetName = norm(entityName);
  const targetType = norm(entityType);

  const matchedDocs = documents.filter(doc => {
    if (doc.status === 'superseded' || doc.status === 'archived') return false;
    return doc.linkedEntities.some(le => {
      const leRef = norm(le.ref);
      const leType = norm(le.type);
      const refMatches =
        (entityId && leRef === norm(entityId)) ||
        (targetRef && (leRef === targetRef || leRef.startsWith(`${targetRef} `))) ||
        (targetName && leRef === targetName);
      if (!refMatches) return false;
      return !targetType || leType.includes(targetType) || targetType.includes(leType);
    });
  });

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
        <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
          {title} ({matchedDocs.length})
        </span>
        <button
          type="button"
          onClick={() => navigate('/documents')}
          className="inline-flex items-center gap-1 text-xs font-semibold hover:underline"
          style={{ color: 'var(--brand)' }}
        >
          <Plus size={12} /> Document Vault
        </button>
      </div>
      {matchedDocs.length === 0 ? (
        <div className="px-4 py-5 text-sm" style={{ color: 'var(--text-3)' }}>
          No active documents linked to {entityRef}.
        </div>
      ) : (
        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {matchedDocs.map(doc => {
            const expiry = computeDocumentExpiry(doc, now);
            return (
              <div
                key={doc.id}
                onClick={() => navigate(`/documents/${doc.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') navigate(`/documents/${doc.id}`); }}
                className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-[var(--surface-2)] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText size={15} style={{ color: 'var(--brand)' }} className="flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{doc.title}</div>
                    <div className="text-xs truncate" style={{ color: 'var(--text-3)' }}>
                      {doc.docType} · v{doc.version}
                      {doc.expiryDate ? ` · Expires ${formatDisplayDate(doc.expiryDate)}` : ''}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {expiry.status === 'expired' && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'var(--error-bg,#FEF2F2)', color: 'var(--error,#DC2626)' }}>
                      Expired
                    </span>
                  )}
                  {expiry.status === 'expiring' && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'var(--warning-bg,#FFFBEB)', color: 'var(--warning,#D97706)' }}>
                      {expiry.daysToExpiry}d left
                    </span>
                  )}
                  <ExternalLink size={13} style={{ color: 'var(--text-3)' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
