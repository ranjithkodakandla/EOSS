import React, { useState } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, FilePlus, ExternalLink, ChevronRight, Ban, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';
import clsx from 'clsx';
import DocumentActions from '../../components/workflow/DocumentActions';
import WorkflowTimeline from '../../components/workflow/WorkflowTimeline';

type DetailTab = 'overview' | 'lines' | 'amendments' | 'jobs' | 'documents';

export default function PODetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customerPos, poLines, poAmendments, jobs, quotations, rfqs, currentUser, updateCustomerPo, resolvePoAmendment, showToast } = useStore();
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [searchParams] = useSearchParams();

  const po = customerPos.find(p => p.id === id);
  if (!po) return <div className="p-6 text-sm" style={{ color: 'var(--text-2)' }}>PO not found</div>;

  const poJobs = jobs.filter(j => j.customerPoId === po.id);
  const amendments = poAmendments.filter(a => a.entityType === 'customer_po' && a.poId === po.id);
  const pendingAmendment = amendments.find(a => a.status === 'pending_approval');
  const actualLines = poLines.filter(line => line.poId === po.id);
  const displayLines = actualLines.length > 0 ? actualLines : Array.from({ length: po.lineCount }, (_, i) => ({ id: `fallback-${i}`, drawingNumber: `Component-${i + 1}`, revision: 'A', description: i === 0 ? 'SS 304 Precision Component' : i === 1 ? 'EN8 Machined Part' : `Component Line ${i + 1}`, orderedQty: 10 + i * 5, uom: 'pcs', requiredDate: '', rate: (po.totalValue / po.lineCount) / (10 + i * 5), value: po.totalValue / po.lineCount, status: 'pending' as const }));
  const quotation = quotations.find(q => q.quotationNumber === po.quotationRef);
  const originatingRfq = rfqs.find(r => r.id === po.rfqId) ?? (quotation ? rfqs.find(r => r.id === quotation.rfqId) : undefined);
  const canEdit = ['owner', 'sales'].includes(currentUser.role);
  const canApprove = currentUser.role === 'owner';
  const returnTo = searchParams.get('from') || '/sales?tab=pos';
  const canCancel = canEdit && po.status !== 'complete' && po.status !== 'cancelled' && poJobs.every(j => j.status === 'cancelled' || j.status === 'complete');
  const canAmend = canEdit && !['complete', 'cancelled'].includes(po.status) && poJobs.every(j => !['in_progress', 'complete'].includes(j.status));
  const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const TABS: { id: DetailTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'lines', label: 'Line Items' },
    { id: 'amendments', label: `Amendments${po.hasAmendment ? ' ·' : ''}` },
    { id: 'jobs', label: `Linked Jobs (${poJobs.length})` },
    { id: 'documents', label: 'Documents' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Record Header */}
      <div
        className="flex-shrink-0 px-6 py-4 border-b"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs mb-3" style={{ color: 'var(--text-3)' }}>
          <button onClick={() => navigate(returnTo)} className="hover:underline" style={{ color: 'var(--brand)' }}>Sales</button>
          <ChevronRight size={12} />
          <button onClick={() => navigate(returnTo)} className="hover:underline">Customer POs</button>
          <ChevronRight size={12} />
          <span style={{ color: 'var(--text)' }}>{po.poNumber}</span>
        </div>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate(returnTo)}
              className="mt-0.5 p-1.5 rounded-lg hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text-3)' }}
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold font-mono" style={{ color: 'var(--text)' }}>{po.poNumber}</h1>
                <StatusChip status={po.status} />
                {pendingAmendment && <StatusChip status="pending_approval" size="sm" />}
                {po.revision && <span className="text-xs text-[var(--text-3)]">Rev {po.revision}</span>}
              </div>
              <p className="text-sm mt-0.5 font-medium" style={{ color: 'var(--text-2)' }}>{po.customerName}</p>
            </div>
          </div>

          {/* Contextual Actions */}
          <div className="flex items-center gap-2">
            {canApprove && po.status === 'pending' && (
              <button onClick={() => { updateCustomerPo(po.id, { status: 'active' }); showToast({ type: 'success', title: 'Customer PO approved', body: `${po.poNumber} is now released for execution.` }); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-white" style={{ background: 'var(--success,#16A34A)' }}><CheckCircle2 size={14} /> Approve Customer PO</button>
            )}
            {canApprove && pendingAmendment && <><button onClick={() => resolvePoAmendment(pendingAmendment.id, 'approved', currentUser.name)} className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white" style={{ background: 'var(--success,#16A34A)' }}>Approve Amendment</button><button onClick={() => resolvePoAmendment(pendingAmendment.id, 'rejected', currentUser.name)} className="px-3 py-1.5 rounded-lg text-sm font-semibold border" style={{ borderColor: 'var(--error)', color: 'var(--error)' }}>Reject Amendment</button></>}
            {canCancel && (
              <button onClick={() => { updateCustomerPo(po.id, { status: 'cancelled' }); showToast({ type: 'success', title: 'Customer PO cancelled', body: `${po.poNumber} preserved in history.` }); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium" style={{ borderColor: 'var(--error,#DC2626)', color: 'var(--error,#DC2626)' }}><Ban size={14} /> Cancel PO</button>
            )}
            {canAmend && (
              <>
                <button
                  onClick={() => navigate(`/sales/po/${po.id}/amend`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium hover:opacity-80 transition-opacity"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
                >
                  <FilePlus size={14} /> Create Revised PO
                </button>
              </>
            )}
            <DocumentActions documentType="Customer PO" reference={po.poNumber} date={po.acceptedDate} partyName={po.customerName} recipient={undefined} status={po.status} total={po.totalValue} lines={Array.from({ length: po.lineCount }, (_, i) => ({ description: `Customer PO line ${i + 1}`, quantity: '—' }))} references={[po.quotationRef ? `Quotation: ${po.quotationRef}` : '', originatingRfq ? `Originating RFQ: ${originatingRfq.rfqNumber}` : ''].filter(Boolean)} />
          </div>
        </div>

        <WorkflowTimeline steps={['Customer RFQ', 'Quotation', 'Customer PO', 'Jobs / Delivery', 'Invoice / Payment']} current={2} />

        {/* Value Summary Bar */}
        <div className="mt-4 flex items-center gap-6 flex-wrap">
          <SummaryBadge label="Total Value" value={`₹${(po.totalValue / 100000).toFixed(2)}L`} emphasis />
          <SummaryBadge label="Line Items" value={String(po.lineCount)} />
          <SummaryBadge label="Payment Terms" value={po.paymentTerms} />
          <SummaryBadge label="Delivery Terms" value={po.deliveryTerms} />
          <SummaryBadge label="Currency" value={po.currency} />
          {po.quotationRef && <SummaryBadge label="Quotation Ref" value={po.quotationRef} mono />}
          <SummaryBadge label="Accepted" value={fmt(po.acceptedDate)} />
        </div>
      </div>

      {/* Detail Tabs */}
      <div
        className="flex-shrink-0 flex items-center gap-0 px-6 border-b"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      >
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className="relative px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap"
            style={{ color: activeTab === t.id ? 'var(--brand)' : 'var(--text-2)' }}
          >
            {t.label}
            {activeTab === t.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full" style={{ background: 'var(--brand)' }} />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'overview' && (
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-5 max-w-7xl">
            {/* Left: PO Info */}
            <div className="lg:col-span-2 space-y-5">
              <Card title="Customer & PO Information">
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <DL label="Customer" value={po.customerName} />
                  <DL label="PO Number" value={po.poNumber} mono />
                  <DL label="Accepted Date" value={fmt(po.acceptedDate)} />
                  <DL label="Payment Terms" value={po.paymentTerms} />
                  <DL label="Delivery Terms" value={po.deliveryTerms} />
                  <DL label="Currency" value={po.currency} />
                  {po.quotationRef && <div><dt className="text-xs" style={{ color: 'var(--text-3)' }}>Quotation Reference</dt><dd className="text-sm mt-0.5"><Link to={`/sales/quotation/${quotation?.id ?? ''}`} className="font-mono font-semibold" style={{ color: quotation ? 'var(--brand)' : 'var(--text-2)' }}>{po.quotationRef}</Link></dd></div>}
                  {originatingRfq && <div><dt className="text-xs" style={{ color: 'var(--text-3)' }}>Originating RFQ</dt><dd className="text-sm mt-0.5"><Link to={`/sales/rfq/${originatingRfq.id}`} className="font-mono font-semibold" style={{ color: 'var(--brand)' }}>{originatingRfq.rfqNumber}</Link></dd></div>}
                </dl>
              </Card>

              <Card title={`Linked Jobs (${poJobs.length})`}>
                {poJobs.length === 0 ? (
                  <p className="text-sm py-4 text-center" style={{ color: 'var(--text-3)' }}>No jobs linked to this PO yet.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        {['Job #', 'Description', 'Stage', 'Status', 'Value', ''].map(h => (
                          <th key={h} className="text-left pb-2 text-xs font-semibold font-medium" style={{ color: 'var(--text-3)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {poJobs.map(j => (
                        <tr
                          key={j.id}
                          className="cursor-pointer transition-colors"
                          style={{ borderBottom: '1px solid var(--border)' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}
                          onClick={() => navigate(`/jobs/${j.id}`)}
                        >
                          <td className="py-3 font-mono text-xs font-bold" style={{ color: 'var(--brand)' }}>{j.jobNumber}</td>
                          <td className="py-3 text-xs" style={{ color: 'var(--text)' }}>{j.description}</td>
                          <td className="py-3 text-xs" style={{ color: 'var(--text-2)' }}>{j.currentStage}</td>
                          <td className="py-3"><StatusChip status={j.status} size="sm" /></td>
                          <td className="py-3 font-mono text-xs font-semibold" style={{ color: 'var(--text)' }}>₹{((j.value ?? 0) / 1000).toFixed(0)}k</td>
                          <td className="py-3 text-right"><ExternalLink size={12} style={{ color: 'var(--text-3)' }} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Card>
            </div>

            {/* Right: Summary */}
            <div className="space-y-4">
              <Card title="Financial Summary">
                <div className="text-3xl font-bold font-mono" style={{ color: 'var(--brand)' }}>
                  ₹{(po.totalValue / 100000).toFixed(2)}L
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>{po.lineCount} line items · {po.currency}</div>
                <div className="mt-4 pt-4 border-t space-y-2.5" style={{ borderColor: 'var(--border)' }}>
                  <DL label="Payment" value={po.paymentTerms} />
                  <DL label="Delivery" value={po.deliveryTerms} />
                </div>
              </Card>

              <Card title="Quick Actions">
                <div className="space-y-2">
                  {poJobs.map(j => (
                    <button
                      key={j.id}
                      onClick={() => navigate(`/jobs/${j.id}`)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg border text-left hover:opacity-80 transition-opacity text-xs"
                      style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
                    >
                      <span className="font-mono font-bold" style={{ color: 'var(--brand)' }}>{j.jobNumber}</span>
                      <ChevronRight size={12} style={{ color: 'var(--text-3)' }} />
                    </button>
                  ))}
                  {canAmend && (
                    <button
                      onClick={() => navigate(`/sales/po/${po.id}/amend`)}
                      className="w-full py-2 rounded-lg border text-xs font-medium hover:opacity-80 transition-opacity"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
                    >
                      Create Revised PO
                    </button>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'lines' && (
          <div className="p-6 max-w-7xl">
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              <div className="px-4 py-3 border-b text-sm font-semibold" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)', color: 'var(--text)' }}>
                Line Items — {po.lineCount} lines · {po.currency}
              </div>
              <table className="w-full text-sm">
                <thead style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                  <tr>
                    {['#', 'Item / Specification', 'Qty', 'UOM', 'Rate', 'Total'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold font-medium" style={{ color: 'var(--text-3)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayLines.map((line, i) => (
                    <tr key={line.id} style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-3)' }}>{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                          {line.description}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
                          {line.drawingNumber} · Rev {line.revision}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-sm font-semibold" style={{ color: 'var(--text)' }}>
                        {line.orderedQty}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{line.uom}</td>
                      <td className="px-4 py-3 font-mono text-sm" style={{ color: 'var(--text)' }}>
                        ₹{line.rate.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm font-semibold" style={{ color: 'var(--text)' }}>
                        ₹{line.value.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                  <tr style={{ background: 'var(--surface-2)' }}>
                    <td colSpan={5} className="px-4 py-3 text-sm font-bold text-right" style={{ color: 'var(--text)' }}>Total</td>
                    <td className="px-4 py-3 font-mono text-sm font-bold" style={{ color: 'var(--brand)' }}>
                      ₹{po.totalValue.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'amendments' && (
          <div className="p-6 max-w-4xl">
            {amendments.length === 0 ? (
              <div className="rounded-xl border p-10 text-center" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                <p className="text-sm" style={{ color: 'var(--text-3)' }}>No amendments recorded for this PO.</p>
                {canAmend && (
                  <button
                    onClick={() => navigate(`/sales/po/${po.id}/amend`)}
                    className="mt-3 px-4 py-2 rounded-lg text-sm font-semibold text-white"
                    style={{ background: 'var(--brand)' }}
                  >
                    Create Revised PO
                  </button>
                )}
              </div>
            ) : <div className="space-y-3">{amendments.map(amendment => <div key={amendment.id} className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}><div className="flex items-start justify-between gap-3"><div><div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Rev {amendment.revision} · {amendment.reason.replaceAll('_', ' ')}</div><div className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>Requested by {amendment.requestedBy} · {fmt(amendment.requestedAt)}</div></div><StatusChip status={amendment.status} size="sm" /></div><p className="mt-3 text-sm" style={{ color: 'var(--text-2)' }}>{amendment.changeNote}</p><div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs"><div className="rounded-lg p-3" style={{ background: 'var(--surface-2)' }}><div className="font-semibold mb-1" style={{ color: 'var(--text-2)' }}>Previous effective version</div><div style={{ color: 'var(--text-3)' }}>PO and line snapshot preserved at submission</div></div><div className="rounded-lg p-3" style={{ background: 'var(--surface-2)' }}><div className="font-semibold mb-1" style={{ color: 'var(--text-2)' }}>{amendment.status === 'approved' ? 'Current effective revision' : 'Proposed revision'}</div><div style={{ color: 'var(--text-3)' }}>{amendment.headerChanges?.paymentTerms ? `Payment terms → ${amendment.headerChanges.paymentTerms}` : ''}{amendment.lineChanges?.quantity !== undefined ? ` · Quantity → ${amendment.lineChanges.quantity}` : ''}{amendment.lineChanges?.rate !== undefined ? ` · Rate → ₹${amendment.lineChanges.rate.toLocaleString('en-IN')}` : ''}{!amendment.headerChanges?.paymentTerms && amendment.lineChanges?.quantity === undefined && amendment.lineChanges?.rate === undefined ? 'See change description above' : ''}</div></div></div>{amendment.attachmentName && <div className="mt-2 text-xs" style={{ color: 'var(--text-3)' }}>Evidence: {amendment.attachmentName}</div>}</div>)}</div>}
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="p-6 max-w-7xl">
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
                <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Linked Jobs ({poJobs.length})</span>
              </div>
              {poJobs.length === 0 ? (
                <div className="p-10 text-center text-sm" style={{ color: 'var(--text-3)' }}>No jobs linked to this PO.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                    <tr>
                      {['Job #', 'Description', 'Current Stage', 'Status', 'Due Date', 'Value', ''].map(h => (
                        <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold font-medium" style={{ color: 'var(--text-3)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {poJobs.map(j => (
                      <tr
                        key={j.id}
                        className="cursor-pointer"
                        style={{ borderBottom: '1px solid var(--border)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}
                        onClick={() => navigate(`/jobs/${j.id}`)}
                      >
                        <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: 'var(--brand)' }}>{j.jobNumber}</td>
                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--text)' }}>{j.description}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{j.currentStage}</td>
                        <td className="px-4 py-3"><StatusChip status={j.status} size="sm" /></td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>
                          {new Date(j.plannedEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: 'var(--text)' }}>
                          ₹{((j.value ?? 0) / 1000).toFixed(0)}k
                        </td>
                        <td className="px-4 py-3 text-right">
                          <ExternalLink size={12} style={{ color: 'var(--text-3)' }} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="p-6 max-w-4xl">
            <div className="rounded-xl border p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              <p className="text-sm mb-4" style={{ color: 'var(--text-2)' }}>
                Attach the customer's purchase order document, drawings, revision notes and other supporting files.
              </p>
              <label
                className="flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-10 cursor-pointer hover:opacity-80 transition-opacity"
                style={{ borderColor: 'var(--border)' }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-3)' }}>
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                </svg>
                <span className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>Drop file, screenshot or photo here</span>
                <span className="text-xs" style={{ color: 'var(--text-3)' }}>PDF, JPG, PNG up to 20 MB</span>
                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
              </label>
              <p className="mt-3 text-xs text-center" style={{ color: 'var(--text-3)' }}>No documents attached yet.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryBadge({ label, value, emphasis, mono }: { label: string; value: string; emphasis?: boolean; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-medium" style={{ color: 'var(--text-3)' }}>{label}</span>
      <span
        className={clsx('text-sm font-semibold', mono ? 'font-mono' : '')}
        style={{ color: emphasis ? 'var(--brand)' : 'var(--text)' }}
      >
        {value}
      </span>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <div className="px-4 py-3 border-b text-sm font-semibold" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)', color: 'var(--text)' }}>
        {title}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function DL({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs" style={{ color: 'var(--text-3)' }}>{label}</dt>
      <dd className={clsx('text-sm mt-0.5 font-medium', mono ? 'font-mono' : '')} style={{ color: 'var(--text)' }}>{value}</dd>
    </div>
  );
}
