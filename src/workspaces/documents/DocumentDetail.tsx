import React from 'react';
import { ArrowLeft, FileText, ExternalLink } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';
import RecordHistoryPanel from '../../components/workflow/RecordHistoryPanel';

export default function DocumentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { documents } = useStore();
  const document = documents.find(doc => doc.id === id);

  if (!document) {
    return (
      <div className="p-8 text-center text-sm" style={{ color: 'var(--text-2)' }}>
        Document not found.{' '}
        <button type="button" onClick={() => navigate('/documents')} className="underline" style={{ color: 'var(--brand)' }}>
          Back to Document Vault
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 px-6 py-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="flex items-center gap-2 text-xs mb-3" style={{ color: 'var(--text-3)' }}>
          <button type="button" onClick={() => navigate('/documents')} className="hover:underline" style={{ color: 'var(--brand)' }}>
            Document Vault
          </button>
          <span>›</span>
          <span style={{ color: 'var(--text)' }}>{document.title}</span>
        </div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <button type="button" onClick={() => navigate('/documents')} className="mt-0.5 p-1.5 rounded-lg hover:opacity-70" style={{ color: 'var(--text-3)' }} aria-label="Back to Document Vault">
              <ArrowLeft size={16} />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>{document.title}</h1>
                {document.certStatus && <StatusChip status={document.certStatus} size="sm" />}
                {document.status === 'expired' && <StatusChip status="expired" size="sm" />}
              </div>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-2)' }}>{document.docType} · {document.category}</p>
            </div>
          </div>
          <button type="button" onClick={() => navigate('/documents')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium" style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}>
            <ExternalLink size={13} /> Document Vault
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl space-y-5">
          <div className="rounded-xl border p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--surface-2)' }}>
                <FileText size={22} style={{ color: 'var(--brand)' }} />
              </div>
              <div>
                <div className="font-semibold" style={{ color: 'var(--text)' }}>{document.title}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{document.fileSize} · Version {document.version}</div>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
              <Detail label="Document type" value={document.docType} />
              <Detail label="Category" value={document.category} />
              <Detail label="Uploaded by" value={document.uploadedBy} />
              <Detail label="Uploaded on" value={document.uploadedAt} />
              <Detail label="Issue date" value={document.issueDate ?? '—'} />
              <Detail label="Expiry date" value={document.expiryDate ?? '—'} />
            </dl>
          </div>

          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <div className="px-4 py-3 border-b text-sm font-semibold" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)', color: 'var(--text)' }}>
              Linked records
            </div>
            <div className="p-4">
              {document.linkedEntities.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--text-3)' }}>No linked records.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {document.linkedEntities.map(entity => (
                    <span key={`${entity.type}-${entity.ref}`} className="px-3 py-1.5 rounded-lg border text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}>
                      {entity.type}: {entity.ref}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border p-4 text-sm" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)', color: 'var(--text-2)' }}>
            This prototype shows the document record and its links. File preview and download will be connected when document storage is implemented.
          </div>

          <RecordHistoryPanel
            entityId={document.id}
            entityRef={document.title}
            title="Document Activity & Audit Trail"
            subtitle="Uploads, versions, renewals, and linked entity associations"
          />
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs" style={{ color: 'var(--text-3)' }}>{label}</dt>
      <dd className="text-sm mt-0.5 font-medium" style={{ color: 'var(--text)' }}>{value}</dd>
    </div>
  );
}
