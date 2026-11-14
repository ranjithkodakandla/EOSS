import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Circle, AlertCircle, Clock, ArrowRight, ChevronDown, ChevronUp,
} from 'lucide-react';

export type JourneyStepStatus = 'completed' | 'in_progress' | 'pending' | 'blocked' | 'not_applicable';

export interface JourneyStep {
  id: string;
  label: string;
  status: JourneyStepStatus;
  reference?: string;
  recordPath?: string;
  date?: string;
  blocker?: string;
  responsible?: string;
  note?: string;
}

function StepIcon({ status }: { status: JourneyStepStatus }) {
  if (status === 'completed') return <CheckCircle2 size={16} style={{ color: 'var(--success, #16a34a)', flexShrink: 0 }} />;
  if (status === 'in_progress') return <Clock size={16} style={{ color: 'var(--brand)', flexShrink: 0 }} />;
  if (status === 'blocked') return <AlertCircle size={16} style={{ color: 'var(--error, #DC2626)', flexShrink: 0 }} />;
  if (status === 'not_applicable') return <Circle size={16} style={{ color: 'var(--text-3)', flexShrink: 0, opacity: 0.4 }} />;
  return <Circle size={16} style={{ color: 'var(--text-3)', flexShrink: 0 }} />;
}

function statusColor(status: JourneyStepStatus): string {
  if (status === 'completed') return 'var(--success, #16a34a)';
  if (status === 'in_progress') return 'var(--brand)';
  if (status === 'blocked') return 'var(--error, #DC2626)';
  if (status === 'not_applicable') return 'var(--text-3)';
  return 'var(--text-3)';
}

function statusLabel(status: JourneyStepStatus): string {
  if (status === 'completed') return 'Done';
  if (status === 'in_progress') return 'Active';
  if (status === 'blocked') return 'Blocked';
  if (status === 'not_applicable') return 'N/A';
  return 'Pending';
}

export default function OrderJourneyCard({ steps }: { steps: JourneyStep[] }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(true);

  const activeSteps = steps.filter(s => s.status !== 'not_applicable');
  const doneCount = activeSteps.filter(s => s.status === 'completed').length;
  const hasBlocker = steps.some(s => s.status === 'blocked');
  const inProgress = steps.find(s => s.status === 'in_progress' || s.status === 'blocked');

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: hasBlocker ? 'var(--error, #DC2626)' : 'var(--border)', background: 'var(--surface)' }}
    >
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[var(--surface-2)] transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold text-sm text-[var(--text)]">Order Journey</span>
          {hasBlocker && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'var(--error, #DC2626)', color: '#fff' }}>
              Blocked
            </span>
          )}
          {!hasBlocker && inProgress && (
            <span className="text-[10px] font-semibold text-[var(--brand)]">{inProgress.label}</span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-[var(--text-3)]">{doneCount}/{activeSteps.length} complete</span>
          {expanded ? <ChevronUp size={14} style={{ color: 'var(--text-3)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-3)' }} />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-1">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex gap-2.5">
              {/* Left: icon + connector line */}
              <div className="flex flex-col items-center pt-1" style={{ width: 20, flexShrink: 0 }}>
                <StepIcon status={step.status} />
                {idx < steps.length - 1 && (
                  <div
                    className="w-px flex-1 mt-1"
                    style={{
                      minHeight: 16,
                      background: step.status === 'completed' ? 'var(--success, #16a34a)' : 'var(--border)',
                    }}
                  />
                )}
              </div>

              {/* Right: content */}
              <div className="flex-1 min-w-0 pb-3">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-sm font-medium"
                        style={{
                          color: step.status === 'not_applicable' ? 'var(--text-3)' : 'var(--text)',
                          opacity: step.status === 'not_applicable' ? 0.5 : 1,
                        }}
                      >
                        {step.label}
                      </span>
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                        style={{
                          background: step.status === 'not_applicable' ? 'transparent' : `color-mix(in srgb, ${statusColor(step.status)} 15%, transparent)`,
                          color: statusColor(step.status),
                        }}
                      >
                        {statusLabel(step.status)}
                      </span>
                    </div>
                    {step.reference && (
                      step.recordPath ? (
                        <button
                          type="button"
                          onClick={() => navigate(step.recordPath!)}
                          className="font-mono text-xs font-bold hover:underline flex items-center gap-0.5 mt-0.5"
                          style={{ color: 'var(--brand)' }}
                        >
                          {step.reference} <ArrowRight size={10} />
                        </button>
                      ) : (
                        <span className="font-mono text-xs font-semibold mt-0.5 block" style={{ color: 'var(--text-2)' }}>
                          {step.reference}
                        </span>
                      )
                    )}
                  </div>
                  {step.date && (
                    <span className="text-[11px] text-[var(--text-3)] flex-shrink-0 mt-0.5">{step.date}</span>
                  )}
                </div>
                {step.blocker && (
                  <div className="mt-1 flex items-start gap-1 text-xs" style={{ color: 'var(--error, #DC2626)' }}>
                    <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
                    <span>{step.blocker}</span>
                  </div>
                )}
                {step.note && !step.blocker && (
                  <div className="mt-0.5 text-[11px]" style={{ color: 'var(--text-3)' }}>{step.note}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
