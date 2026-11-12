import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Send, ArrowRight, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useStore } from '../../store';
import { DEMO_NOW } from '../../data/seed';
import { computeProductionStatus } from '../../domain/productionStatus';
import { listExpiringDocuments } from '../../domain/documentExpiry';
import { maintenanceOverdue } from '../../domain/recordLists';

interface AnswerItem {
  id: string;
  question: string;
  answer: string;
  links: Array<{ label: string; path: string }>;
}

interface Props {
  isDrawer?: boolean;
  onClose?: () => void;
}

const SAMPLE_PROMPTS = [
  'Which jobs are late?',
  'What is waiting for my approval?',
  'Which materials are short?',
  'Which machines need attention?',
  'Which documents are expiring?',
];

export default function CopilotPanel({ onClose }: Props) {
  const navigate = useNavigate();
  const store = useStore();
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<AnswerItem[]>([]);

  const answerFromLocalData = (rawQuery: string): AnswerItem => {
    const q = rawQuery.trim().toLowerCase();
    const now = new Date(DEMO_NOW);

    if (q.includes('late') || q.includes('delay') || q.includes('behind') || q.includes('schedule') || q.includes('risk')) {
      const lateJobs = store.jobs.filter(j => {
        if (j.status === 'complete' || j.status === 'cancelled') return false;
        const st = computeProductionStatus(j, now);
        return st.risk === 'delayed' || st.risk === 'at_risk' || (st.projectedCompletion && st.projectedCompletion > j.plannedEnd) || j.plannedEnd < DEMO_NOW;
      });
      return {
        id: `ans-${Date.now()}`,
        question: rawQuery,
        answer: lateJobs.length === 0
          ? 'No active jobs are currently running behind target completion.'
          : `${lateJobs.length} active job${lateJobs.length === 1 ? ' is' : 's are'} running late or at risk: ${lateJobs.map(j => `${j.jobNumber} (${j.currentStage}, target ${j.plannedEnd})`).join('; ')}.`,
        links: lateJobs.slice(0, 4).map(j => ({ label: `Open ${j.jobNumber}`, path: `/jobs/${j.id}` })),
      };
    }

    if (q.includes('approv') || q.includes('waiting') || q.includes('pending')) {
      const pending = store.approvalRequests.filter(a => a.status === 'pending');
      return {
        id: `ans-${Date.now()}`,
        question: rawQuery,
        answer: pending.length === 0
          ? 'No approvals are currently waiting on you.'
          : `${pending.length} item${pending.length === 1 ? ' is' : 's are'} waiting on you: ${pending.map(a => `${a.entityRef} (${a.description})`).join('; ')}.`,
        links: [
          { label: 'Open Approvals Inbox', path: '/procurement?tab=approvals' },
          ...pending.slice(0, 3).map(a => ({
            label: a.entityRef,
            path: a.requestType.toLowerCase().includes('po') && !a.requestType.toLowerCase().includes('pr') && !a.requestType.toLowerCase().includes('requisition')
              ? `/procurement/spo/${a.entityId}`
              : `/procurement/pr/${a.entityId}`,
          })),
        ],
      };
    }

    if (q.includes('short') || q.includes('stock') || q.includes('material') || q.includes('inventory')) {
      const shortJobs = store.jobMaterialReqs.filter(r => r.shortage);
      const lowStock = store.inventory.filter(i => i.shortage);
      const parts: string[] = [];
      if (shortJobs.length > 0) parts.push(`${shortJobs.length} job material shortage${shortJobs.length === 1 ? '' : 's'} (${shortJobs.map(r => r.materialName).join(', ')})`);
      if (lowStock.length > 0) parts.push(`${lowStock.length} stock item${lowStock.length === 1 ? '' : 's'} below reorder point`);
      return {
        id: `ans-${Date.now()}`,
        question: rawQuery,
        answer: parts.length === 0 ? 'All tracked materials are sufficiently stocked.' : `Current material alerts: ${parts.join('; ')}.`,
        links: [
          { label: 'View Inventory', path: '/inventory?focus=shortage' },
          { label: 'Open Procurement', path: '/procurement' },
        ],
      };
    }

    if (q.includes('machine') || q.includes('asset') || q.includes('breakdown') || q.includes('maint')) {
      const broken = store.assets.filter(a => a.status === 'breakdown' && !a.archivedAt);
      const overdue = maintenanceOverdue(store.assets.filter(a => !a.archivedAt), store.meterReadings, now);
      return {
        id: `ans-${Date.now()}`,
        question: rawQuery,
        answer: `${broken.length} machine breakdown${broken.length === 1 ? '' : 's'} (${broken.map(a => `${a.assetCode} ${a.name}`).join(', ') || 'none'}) and ${overdue.length} preventive service overdue.`,
        links: [
          ...broken.slice(0, 2).map(a => ({ label: `Open ${a.assetCode}`, path: `/assets/${a.id}` })),
          { label: 'View Maintenance', path: '/assets' },
        ],
      };
    }

    if (q.includes('doc') || q.includes('expir') || q.includes('cert')) {
      const activeDocs = store.documents.filter(d => d.status !== 'superseded' && d.status !== 'archived');
      const due = listExpiringDocuments(activeDocs, now);
      return {
        id: `ans-${Date.now()}`,
        question: rawQuery,
        answer: due.length === 0
          ? 'No active documents are expired or expiring soon.'
          : `${due.length} document${due.length === 1 ? '' : 's'} expired or expiring soon: ${due.map(d => `${d.doc.title} (${d.info.status})`).join('; ')}.`,
        links: [{ label: 'Review Expiring Docs', path: '/documents?attention=due' }],
      };
    }

    if (q.includes('invoice') || q.includes('pay') || q.includes('receiv') || q.includes('bill')) {
      const openInv = store.invoices.filter(i => !['paid', 'void', 'cancelled'].includes(i.status));
      const openTotal = openInv.reduce((sum, i) => sum + i.outstandingAmount, 0);
      return {
        id: `ans-${Date.now()}`,
        question: rawQuery,
        answer: `${openInv.length} customer invoice${openInv.length === 1 ? '' : 's'} open totalling ₹${openTotal.toLocaleString('en-IN')} receivable.`,
        links: [{ label: 'Open Finance', path: '/finance' }],
      };
    }

    const activeJobs = store.jobs.filter(j => j.status === 'active' || j.status === 'hold').length;
    const pendingApprovals = store.approvalRequests.filter(a => a.status === 'pending').length;
    return {
      id: `ans-${Date.now()}`,
      question: rawQuery,
      answer: `Currently ${activeJobs} active/on-hold jobs and ${pendingApprovals} pending approvals. Try asking "Which jobs are late?", "What is waiting for my approval?", or "Which materials are short?".`,
      links: [
        { label: 'View Jobs', path: '/jobs' },
        { label: 'Approvals Inbox', path: '/procurement?tab=approvals' },
      ],
    };
  };

  const submitQuery = (text?: string) => {
    const prompt = (text ?? input).trim();
    if (!prompt) return;
    const ans = answerFromLocalData(prompt);
    setHistory(prev => [ans, ...prev].slice(0, 5));
    setInput('');
    setExpanded(true);
  };

  return (
    <div
      className="rounded-xl border px-3.5 py-2.5 transition-all"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md flex-shrink-0" style={{ background: 'var(--surface-2)', color: 'var(--text-2)' }}>
          Ask
        </span>
        <form
          onSubmit={e => { e.preventDefault(); submitQuery(); }}
          className="flex-1 flex items-center gap-2 min-w-[180px]"
        >
          <div className="relative flex-1">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
            <input
              type="text"
              value={input}
              onFocus={() => setExpanded(true)}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about late jobs, pending approvals, material shortages, or machines…"
              className="w-full pl-8 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border outline-none"
              style={{ borderColor: 'var(--border)', background: 'var(--surface-2)', color: 'var(--text)' }}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim()}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-40"
            style={{ background: 'var(--brand-fill)' }}
          >
            <Send size={12} /> Ask
          </button>
        </form>
        <button
          type="button"
          onClick={() => setExpanded(e => !e)}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-[var(--text-2)] hover:text-[var(--text)]"
          aria-expanded={expanded}
        >
          {expanded ? <>Hide <ChevronUp size={13} /></> : <>Quick questions <ChevronDown size={13} /></>}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t space-y-3" style={{ borderColor: 'var(--border)' }}>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_PROMPTS.map(prompt => (
              <button
                key={prompt}
                type="button"
                onClick={() => submitQuery(prompt)}
                className="px-2.5 py-1 rounded-full border text-xs font-medium hover:border-[var(--brand)] transition-colors"
                style={{ borderColor: 'var(--border)', background: 'var(--surface-2)', color: 'var(--text-2)' }}
              >
                {prompt}
              </button>
            ))}
          </div>

          {history.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {history.map(item => (
                <div
                  key={item.id}
                  className="rounded-lg border p-3 text-xs space-y-2"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-[var(--text)]">{item.question}</div>
                    <button
                      type="button"
                      onClick={() => setHistory(prev => prev.filter(h => h.id !== item.id))}
                      className="text-[var(--text-3)] hover:text-[var(--text)]"
                      aria-label="Clear answer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <p className="text-[var(--text-2)] leading-relaxed">{item.answer}</p>
                  {item.links.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {item.links.map(link => (
                        <button
                          key={link.path}
                          type="button"
                          onClick={() => {
                            if (onClose) onClose();
                            navigate(link.path);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-[11px] font-semibold"
                          style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--brand)' }}
                        >
                          {link.label} <ArrowRight size={11} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
