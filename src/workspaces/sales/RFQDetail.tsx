import React, { useState } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, FileText, Package, Paperclip, MessageSquare,
  Clock, ChevronRight, Plus, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';
import type { CustomerRFQ } from '../../types';

const fmt = (d: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const fmtMoney = (n: number) => `₹${n.toLocaleString('en-IN')}`;

type Tab = 'overview' | 'lines' | 'technical' | 'commercial' | 'documents' | 'clarifications' | 'history';

export default function RFQDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { rfqs, quotations, customerPos, currentUser } = useStore();
  const [tab, setTab] = useState<Tab>('lines');

  const rfq = rfqs.find(r => r.id === id) as (CustomerRFQ & Record<string, any>) | undefined;
  if (!rfq) return (
    <div className="p-8 text-center text-sm text-[var(--text-2)]">
      RFQ not found. <Link to="/sales" className="text-[var(--brand)] underline">Back to Sales</Link>
    </div>
  );

  const linkedQuotation = quotations.find(q => q.rfqId === rfq.id);
  const convertedPo = customerPos.find(po => po.id === rfq.convertedPoId || po.rfqId === rfq.id || po.quotationRef === linkedQuotation?.quotationNumber);
  const canQuote = ['owner', 'sales'].includes(currentUser.role) && rfq.status === 'open';
  const canConvert = linkedQuotation?.status === 'accepted' && rfq.status !== 'converted';
  const returnTo = searchParams.get('from') || '/sales?tab=rfqs';

  const lines: any[] = rfq.lines ?? [];
  const documents: any[] = rfq.documents ?? [];
  const clarifications: any[] = rfq.clarifications ?? [];
  const revisions: any[] = rfq.revisions ?? [{ id: `${rfq.id}-rev-1`, revision: rfq.revisionNumber ?? 1, changedBy: rfq.owner, changeDescription: 'Initial issue', changedAt: rfq.receivedDate }];
  const techReqs = {
    ...(rfq.technicalRequirements ?? {}),
    standards: (rfq.technicalRequirements as any)?.standards ?? (rfq.applicableStandards ? rfq.applicableStandards.split(',').map(s => s.trim()) : []),
    inspectionLevel: (rfq.technicalRequirements as any)?.inspectionLevel ?? (rfq.dimensionalInspection ? 'Dimensional inspection' : ''),
    surfaceFinish: (rfq.technicalRequirements as any)?.surfaceFinish ?? rfq.surfaceTreatment,
    heatTreatment: (rfq.technicalRequirements as any)?.heatTreatment ?? (rfq.heatTreatment ? 'Required' : ''),
    packagingRequirements: (rfq.technicalRequirements as any)?.packagingRequirements ?? rfq.packagingPreservation,
    traceability: (rfq.technicalRequirements as any)?.traceability ?? rfq.traceabilityRequired,
    specialNotes: (rfq.technicalRequirements as any)?.specialNotes ?? rfq.specialQualityReqs,
  };

  const statusColor: Record<string, string> = {
    open: 'bg-blue-50 text-blue-700 border-blue-200',
    under_review: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    quoted: 'bg-purple-50 text-purple-700 border-purple-200',
    accepted: 'bg-green-50 text-green-700 border-green-200',
    converted: 'bg-green-100 text-green-800 border-green-300',
    cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
    expired: 'bg-red-50 text-red-600 border-red-200',
  };

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'lines', label: 'Line Items', count: lines.length },
    { id: 'technical', label: 'Technical & Quality' },
    { id: 'commercial', label: 'Commercial & Delivery' },
    { id: 'documents', label: 'Documents', count: documents.length },
    { id: 'clarifications', label: 'Clarifications', count: clarifications.length },
    { id: 'history', label: 'Revision History', count: revisions.length },
  ];

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(returnTo)} className="p-1.5 rounded-lg hover:bg-[var(--surface-2)] transition-colors">
              <ArrowLeft size={18} className="text-[var(--text-2)]" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-[var(--brand)]">{rfq.rfqNumber}</span>
                <StatusChip status={rfq.status} size="sm" />
              </div>
              <h1 className="text-lg font-bold text-[var(--text)] mt-0.5">{rfq.customerName}</h1>
              <p className="text-xs text-[var(--text-2)]">
                Received {fmt(rfq.receivedDate)} · Required by {fmt(rfq.requiredBy)} · {rfq.lineCount} line{rfq.lineCount !== 1 ? 's' : ''} · {rfq.channel}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {['owner', 'sales'].includes(currentUser.role) && !['converted', 'cancelled'].includes(rfq.status) && <button onClick={() => navigate(`/sales/rfq/${rfq.id}/edit`)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border" style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}>Edit RFQ</button>}
            {canQuote && (
              <button
                onClick={() => navigate(`/sales/rfq/${rfq.id}/quotation/new`)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ background: 'var(--brand-fill)' }}
              >
                <Plus size={15} /> Create Quotation
              </button>
            )}
            {linkedQuotation && !canConvert && (
              <button
                onClick={() => navigate(`/sales/quotation/${linkedQuotation.id}?from=${encodeURIComponent(`/sales/rfq/${rfq.id}`)}`)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border"
                style={{ borderColor: 'var(--brand)', color: 'var(--brand)' }}
              >
                <FileText size={15} /> View Quotation
              </button>
            )}
            {canConvert && linkedQuotation && (
              <button
                onClick={() => navigate(`/sales/quotation/${linkedQuotation.id}?from=${encodeURIComponent(`/sales/rfq/${rfq.id}`)}`)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700"
              >
                <CheckCircle size={15} /> Convert to PO
              </button>
            )}
            {rfq.status === 'converted' && convertedPo && (
              <button onClick={() => navigate(`/sales/po/${convertedPo.id}?from=${encodeURIComponent(`/sales/rfq/${rfq.id}`)}`)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border" style={{ borderColor: 'var(--brand)', color: 'var(--brand)' }}>
                <FileText size={15} /> View Customer PO
              </button>
            )}
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {[
            { label: 'Customer', value: rfq.customerName },
            { label: 'Owner / Sales Exec', value: rfq.owner ?? '—' },
            { label: 'Payment Terms', value: rfq.paymentTerms ?? '—' },
            { label: 'Delivery Terms', value: rfq.deliveryTerms ?? '—' },
          ].map((c, i) => (
            <div key={i} className="rounded-lg border p-3" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
              <div className="text-[11px] text-[var(--text-3)]">{c.label}</div>
              <div className="text-sm font-medium text-[var(--text)] mt-0.5 truncate">{c.value}</div>
            </div>
          ))}
        </div>

        {linkedQuotation && (
          <div className="mt-3 flex items-center gap-2 text-xs text-[var(--text-2)] bg-[var(--surface-2)] rounded-lg px-3 py-2 border" style={{ borderColor: 'var(--border)' }}>
            <FileText size={13} className="text-[var(--brand)]" />
            <span>Quotation: </span>
            <Link to={`/sales/quotation/${linkedQuotation.id}?from=${encodeURIComponent(`/sales/rfq/${rfq.id}`)}`} className="font-mono font-semibold text-[var(--brand)] hover:underline">
              {linkedQuotation.quotationNumber}
            </Link>
            <span className="text-[var(--text-3)]">·</span>
            <StatusChip status={linkedQuotation.status} size="sm" />
            <span className="ml-auto font-semibold">{fmtMoney(linkedQuotation.totalValue)}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 flex gap-0 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
              tab === t.id
                ? 'border-[var(--brand)] text-[var(--brand)]'
                : 'border-transparent text-[var(--text-2)] hover:text-[var(--text)]'
            }`}
          >
            {t.label}{t.count !== undefined ? ` (${t.count})` : ''}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto p-6">
        {tab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-4 max-w-5xl">
            <Section title="Enquiry & Customer">
              <DetailGrid fields={[
                ['RFQ Number', rfq.rfqNumber], ['Title', rfq.title], ['Customer', rfq.customerName],
                ['Contact Person', rfq.customerContactPerson], ['Email', rfq.customerEmail], ['Phone', rfq.customerPhone],
                ['Customer Enquiry Ref', rfq.customerEnquiryRef], ['Project Ref', rfq.customerProjectRef],
                ['Received', fmt(rfq.receivedDate)], ['Required By', fmt(rfq.requiredBy)], ['Channel', rfq.channel], ['Priority', rfq.priority],
              ]} />
              {rfq.requirementsSummary && <p className="mt-4 text-sm text-[var(--text-2)]">{rfq.requirementsSummary}</p>}
            </Section>
            <Section title="Instructions & Internal Context">
              <DetailGrid fields={[
                ['Owner', rfq.owner], ['Delivery Location', rfq.deliveryLocation], ['Customer Instructions', rfq.customerInstructions],
                ['Internal Notes', rfq.internalNotes], ['Quote Due', rfq.quotationDueDate ? fmt(rfq.quotationDueDate) : undefined],
              ]} />
            </Section>
          </div>
        )}

        {tab === 'lines' && (
          <div>
            {lines.length === 0 ? (
              <div className="text-center py-12 text-sm text-[var(--text-3)]">No line items recorded.</div>
            ) : (
              <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border)' }}>
                <table className="eoss-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Drawing / Part No.</th>
                      <th>Rev</th>
                      <th>Description</th>
                      <th>Material</th>
                      <th>Qty</th>
                      <th>UOM</th>
                      <th>Target Price</th>
                      <th>Required By</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((l: any, i: number) => (
                      <tr key={l.id ?? i}>
                        <td className="font-mono text-xs text-[var(--text-3)]">{l.lineNumber ?? i + 1}</td>
                        <td className="font-mono text-xs font-semibold text-[var(--brand)]">{l.drawingNumber ?? '—'}</td>
                        <td className="font-mono text-xs">{l.drawingRevision ?? '—'}</td>
                        <td className="text-sm text-[var(--text)]">{l.description ?? l.partName ?? '—'}</td>
                        <td className="text-xs text-[var(--text-2)]">{l.material ?? '—'}</td>
                        <td className="font-mono text-sm text-right">{l.quantity ?? l.qty ?? '—'}</td>
                        <td className="text-xs text-[var(--text-2)]">{l.uom ?? 'Nos'}</td>
                        <td className="font-mono text-sm text-right">
                          {l.targetPrice ? fmtMoney(l.targetPrice) : '—'}
                        </td>
                        <td className="text-sm text-[var(--text-2)]">{l.requiredBy ? fmt(l.requiredBy) : '—'}</td>
                        <td className="text-xs text-[var(--text-2)] max-w-[160px] truncate">{l.notes ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === 'technical' && (
          <div className="max-w-2xl space-y-4">
            {Object.keys(techReqs).length === 0 ? (
              <div className="text-center py-12 text-sm text-[var(--text-3)]">No technical requirements recorded.</div>
            ) : (
              <>
                {techReqs.standards && (
                  <Section title="Standards & Certifications">
                    <ul className="space-y-1">
                      {techReqs.standards.map((s: string, i: number) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-[var(--text)]">
                          <CheckCircle size={13} className="text-green-500 flex-shrink-0" /> {s}
                        </li>
                      ))}
                    </ul>
                  </Section>
                )}
                {techReqs.inspectionLevel && (
                  <Section title="Inspection Level">
                    <p className="text-sm text-[var(--text)]">{techReqs.inspectionLevel}</p>
                  </Section>
                )}
                {techReqs.surfaceFinish && (
                  <Section title="Surface Finish">
                    <p className="text-sm text-[var(--text)]">{techReqs.surfaceFinish}</p>
                  </Section>
                )}
                {techReqs.heatTreatment && (
                  <Section title="Heat Treatment">
                    <p className="text-sm text-[var(--text)]">{techReqs.heatTreatment}</p>
                  </Section>
                )}
                {techReqs.packagingRequirements && (
                  <Section title="Packaging Requirements">
                    <p className="text-sm text-[var(--text)]">{techReqs.packagingRequirements}</p>
                  </Section>
                )}
                {techReqs.specialNotes && (
                  <Section title="Special Notes">
                    <p className="text-sm text-[var(--text)]">{techReqs.specialNotes}</p>
                  </Section>
                )}
                {techReqs.traceability && (
                  <Section title="Traceability">
                    <p className="text-sm text-[var(--text)]">{techReqs.traceability ? 'Required' : 'Not required'}</p>
                  </Section>
                )}
              </>
            )}
          </div>
        )}

        {tab === 'commercial' && (
          <div className="grid lg:grid-cols-2 gap-4 max-w-5xl">
            <Section title="Commercial Terms"><DetailGrid fields={[
              ['Currency', rfq.currency ?? 'INR'], ['Payment Terms', rfq.paymentTerms], ['Payment Expectation', rfq.paymentExpectation],
              ['Price Expectation', rfq.priceExpectation], ['Quote Validity', rfq.quoteValidityExpected], ['Special Conditions', rfq.specialCommercialConditions],
            ]} /></Section>
            <Section title="Delivery & Quality Commitments"><DetailGrid fields={[
              ['Delivery Terms', rfq.deliveryTerms], ['Freight Responsibility', rfq.freightResponsibility], ['Material Standards', rfq.materialStandards],
              ['MTC Required', rfq.mtcRequired ? 'Yes' : 'No'], ['Dimensional Inspection', rfq.dimensionalInspection ? 'Yes' : 'No'], ['NDT Required', rfq.ndtRequired ? 'Yes' : 'No'],
              ['Customer Witness', rfq.customerWitnessRequired ? 'Yes' : 'No'], ['Required Quality Docs', rfq.requiredQualityDocs], ['Packaging / Preservation', rfq.packagingPreservation],
            ]} /></Section>
          </div>
        )}

        {tab === 'documents' && (
          <div className="space-y-2 max-w-2xl">
            {documents.length === 0 ? (
              <div className="text-center py-12 text-sm text-[var(--text-3)]">No documents attached.</div>
            ) : (
              documents.map((d: any, i: number) => (
                <div key={d.id ?? i} className="flex items-center gap-3 p-3 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                  <Paperclip size={16} className="text-[var(--brand)] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[var(--text)] truncate">{d.name ?? d.fileName ?? d.filename}</div>
                    <div className="text-xs text-[var(--text-3)]">{d.type ?? d.documentType ?? d.docType ?? 'Document'} · Rev {d.revision ?? d.version ?? '—'}</div>
                  </div>
                  <span className="text-xs text-[var(--text-3)] flex-shrink-0">{d.uploadedAt ? fmt(d.uploadedAt) : ''}</span>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'clarifications' && (
          <div className="space-y-3 max-w-2xl">
            {clarifications.length === 0 ? (
              <div className="text-center py-12 text-sm text-[var(--text-3)]">No clarifications on record.</div>
            ) : (
              clarifications.map((c: any, i: number) => (
                <div key={c.id ?? i} className="p-4 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-[var(--text)]">{c.question}</div>
                      {(c.answer ?? c.customerResponse) && <div className="mt-2 text-sm text-[var(--text-2)] bg-[var(--surface-2)] rounded p-2">{c.answer ?? c.customerResponse}</div>}
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      c.status === 'answered' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                    }`}>
                      {c.status === 'answered' ? 'Answered' : 'Pending'}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs text-[var(--text-3)]">
                    <MessageSquare size={11} />
                    <span>{c.raisedBy} · {fmt(c.raisedAt ?? c.date)}</span>
                    {c.answeredBy && <span>→ Answered by {c.answeredBy}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'history' && (
          <div className="space-y-3 max-w-2xl">
            {revisions.length === 0 ? (
              <div className="text-center py-12 text-sm text-[var(--text-3)]">No revision history.</div>
            ) : (
              revisions.map((r: any, i: number) => (
                <div key={r.id ?? i} className="flex items-start gap-3 p-3 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                  <Clock size={15} className="text-[var(--text-3)] mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-[var(--text)]">Rev {r.revision} — {r.changedBy}</div>
                    <div className="text-xs text-[var(--text-2)] mt-0.5">{r.changeDescription}</div>
                    <div className="text-xs text-[var(--text-3)] mt-1">{r.changedAt ? fmt(r.changedAt) : ''}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <h3 className="text-xs font-bold text-[var(--text-3)] uppercase tracking-wider mb-3">{title}</h3>
      {children}
    </div>
  );
}

function DetailGrid({ fields }: { fields: [string, unknown][] }) {
  return <dl className="grid md:grid-cols-2 gap-x-6 gap-y-3">{fields.map(([label, value]) => value !== undefined && value !== '' && <div key={label}><dt className="text-xs text-[var(--text-3)]">{label}</dt><dd className="text-sm mt-0.5 text-[var(--text)] whitespace-pre-wrap">{String(value)}</dd></div>)}</dl>;
}
