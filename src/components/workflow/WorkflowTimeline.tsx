import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

export default function WorkflowTimeline({ steps, current }: { steps: string[]; current: number }) {
  return <div className="flex items-start gap-1 overflow-x-auto py-3" aria-label="Transaction workflow">{steps.map((step, index) => <React.Fragment key={step}><div className="flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold" style={{ color: index <= current ? 'var(--brand)' : 'var(--text-3)' }}>{index <= current ? <CheckCircle2 size={14} /> : <Circle size={14} />}{step}</div>{index < steps.length - 1 && <div className="w-8 h-px mt-2" style={{ background: index < current ? 'var(--brand)' : 'var(--border)' }} />}</React.Fragment>)}</div>;
}
