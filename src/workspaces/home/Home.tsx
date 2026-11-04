import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, TrendingUp, Package, Wrench, FileText, ChevronRight, AlertCircle, CheckCircle, Info, Clock, ArrowRight, BarChart2 } from 'lucide-react';
import { useStore, PURCHASE_REQS } from '../../store';
import { DEMO_NOW } from '../../data/seed';
import StatusChip from '../../components/layout/StatusChip';
import clsx from 'clsx';

const CAT_ICON: Record<string, React.ReactNode> = {
  material: <Package size={16} />,
  procurement: <TrendingUp size={16} />,
  production: <BarChart2 size={16} />,
  quality: <CheckCircle size={16} />,
  asset: <Wrench size={16} />,
  document: <FileText size={16} />,
  dispatch: <TrendingUp size={16} />,
};

const PRIORITY_CONFIG = {
  critical: { icon: <AlertCircle size={14} />, cls: 'border-l-[var(--error)] bg-[var(--error-bg)]', labelCls: 'text-[var(--error)]', label: 'Critical' },
  warning: { icon: <AlertTriangle size={14} />, cls: 'border-l-[var(--warning)] bg-[var(--warning-bg)]', labelCls: 'text-[var(--warning)]', label: 'Warning' },
  info: { icon: <Info size={14} />, cls: 'border-l-[var(--info)] bg-[var(--info-bg)]', labelCls: 'text-[var(--info)]', label: 'Info' },
};

export default function Home() {
  const { pulseExceptions, jobs, inventory, assets, inspections, currentUser } = useStore();
  const navigate = useNavigate();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const critical = pulseExceptions.filter(e => e.priority === 'critical').length;
  const warning = pulseExceptions.filter(e => e.priority === 'warning').length;

  const filtered = categoryFilter === 'all'
    ? pulseExceptions
    : pulseExceptions.filter(e => e.category === categoryFilter);

  // KPIs
  const activeJobs = jobs.filter(j => j.status === 'active').length;
  const holdJobs = jobs.filter(j => j.status === 'hold').length;
  const shortageItems = inventory.filter(i => i.shortage).length;
  const breakdownAssets = assets.filter(a => a.status === 'breakdown').length;

  const categories = ['all', ...Array.from(new Set(pulseExceptions.map(e => e.category)))];

  const openPRs = PURCHASE_REQS.filter(pr => pr.status === 'approved' || pr.status === 'open').length;
  const pendingQC = inspections.filter(i => i.result === 'pending').length;

  const relativeTime = (iso: string) => {
    const demoMs = new Date(DEMO_NOW).getTime();
    const diff = demoMs - new Date(iso).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return `${Math.floor(diff / 60000)}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[var(--text)]">Business Pulse</h1>
        <p className="text-sm text-[var(--text-2)] mt-0.5">Good morning, {currentUser.name.split(' ')[0]}. Here's what needs attention today.</p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Active Jobs" value={activeJobs} sub={`${holdJobs} on hold`} icon={<BarChart2 size={18} />} accent="info" onClick={() => navigate('/jobs')} />
        <KpiCard label="Stock Shortages" value={shortageItems} sub="materials below min" icon={<Package size={18} />} accent={shortageItems > 0 ? 'error' : 'success'} onClick={() => navigate('/inventory')} />
        <KpiCard label="Machine Issues" value={breakdownAssets} sub="in breakdown" icon={<Wrench size={18} />} accent={breakdownAssets > 0 ? 'error' : 'success'} onClick={() => navigate('/assets')} />
        <KpiCard label="Open Exceptions" value={critical + warning} sub={`${critical} critical`} icon={<AlertCircle size={18} />} accent={critical > 0 ? 'error' : 'warning'} onClick={() => {}} />
      </div>

      {/* Pulse exceptions */}
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-2)]">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-[var(--error)]" />
            <span className="font-semibold text-sm text-[var(--text)]">Exceptions requiring attention</span>
            {critical > 0 && <span className="text-xs bg-[var(--error)] text-white px-2 py-0.5 rounded-full font-semibold">{critical} critical</span>}
            {warning > 0 && <span className="text-xs bg-[var(--warning)] text-white px-2 py-0.5 rounded-full font-semibold">{warning} warning</span>}
          </div>
          <span className="text-xs text-[var(--text-3)]">AI-detected • updated just now</span>
        </div>

        {/* Category filters */}
        <div className="flex gap-2 px-4 py-2 border-b border-[var(--border)] overflow-x-auto">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={clsx(
                'px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors capitalize',
                categoryFilter === c
                  ? 'bg-[var(--brand)] text-white'
                  : 'bg-[var(--surface-2)] text-[var(--text-2)] hover:bg-[var(--surface-3)]'
              )}
            >
              {c === 'all' ? `All (${pulseExceptions.length})` : `${CAT_ICON[c] ? '' : ''}${c}`}
            </button>
          ))}
        </div>

        <div className="divide-y divide-[var(--border)]">
          {filtered.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-[var(--text-3)]">No exceptions in this category.</div>
          )}
          {filtered.map(exc => {
            const pc = PRIORITY_CONFIG[exc.priority];
            return (
              <button
                key={exc.id}
                onClick={() => navigate(exc.workspacePath)}
                className={clsx('w-full flex items-start gap-3 px-4 py-4 border-l-4 hover:brightness-95 transition-all text-left', pc.cls)}
              >
                <div className={clsx('flex-shrink-0 mt-0.5', pc.labelCls)}>
                  {pc.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-[var(--text)]">{exc.title}</span>
                    <span className={clsx('text-[10px] font-semibold uppercase tracking-wider', pc.labelCls)}>{pc.label}</span>
                    <span className="text-[11px] text-[var(--text-3)] capitalize px-2 py-0.5 bg-[var(--surface)] rounded-full border border-[var(--border)]">{exc.category}</span>
                  </div>
                  <p className="text-xs text-[var(--text-2)] mt-1 line-clamp-2">{exc.body}</p>
                  {exc.aiReason && (
                    <p className="text-[11px] text-[var(--info)] mt-1 italic">🤖 {exc.aiReason}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[11px] text-[var(--text-3)]">{exc.affectedRef}</span>
                    <span className="text-[11px] text-[var(--text-3)]">•</span>
                    <span className="text-[11px] text-[var(--text-3)]">{relativeTime(exc.since)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 text-xs font-medium text-[var(--brand)] mt-0.5">
                  {exc.cta}
                  <ChevronRight size={14} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
        {[
          { label: 'Active Jobs', count: activeJobs, path: '/jobs', color: 'var(--info)' },
          { label: 'Open PRs', count: openPRs, path: '/procurement', color: 'var(--warning)' },
          { label: 'Pending QC', count: pendingQC, path: '/quality', color: 'var(--hold)' },
        ].map(q => (
          <button key={q.path} onClick={() => navigate(q.path)} className="flex items-center justify-between p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl hover:border-[var(--brand)] transition-colors">
            <div className="text-left">
              <div className="text-xl font-bold" style={{ color: q.color }}>{q.count}</div>
              <div className="text-xs text-[var(--text-2)] mt-0.5">{q.label}</div>
            </div>
            <ArrowRight size={16} className="text-[var(--text-3)]" />
          </button>
        ))}
      </div>
    </div>
  );
}

function KpiCard({ label, value, sub, icon, accent, onClick }: {
  label: string; value: number; sub: string; icon: React.ReactNode;
  accent: 'error' | 'success' | 'info' | 'warning'; onClick: () => void;
}) {
  const color = { error: 'var(--error)', success: 'var(--success)', info: 'var(--info)', warning: 'var(--warning)' }[accent];
  return (
    <button onClick={onClick} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 text-left hover:border-[color:var(--brand)] transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[var(--text-3)]">{icon}</span>
        <span className="text-[11px] text-[var(--text-3)] bg-[var(--surface-2)] px-1.5 py-0.5 rounded">HYD</span>
      </div>
      <div className="text-2xl font-bold" style={{ color }}>{value}</div>
      <div className="text-xs font-medium text-[var(--text)] mt-0.5">{label}</div>
      <div className="text-[11px] text-[var(--text-3)] mt-0.5">{sub}</div>
    </button>
  );
}
