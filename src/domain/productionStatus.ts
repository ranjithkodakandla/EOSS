// Simple, explainable production risk classification — planned vs actual, not predictive AI.
import type { Job } from '../types';

export type ProductionRisk = 'on_track' | 'at_risk' | 'delayed' | 'blocked' | 'awaiting_material' | 'complete';

export interface ProductionStatusInfo {
  risk: ProductionRisk;
  daysRemaining: number;
  projectedCompletion: string | null;
  projectionBasis: string;
}

export function computeProductionStatus(job: Job, now: Date): ProductionStatusInfo {
  const plannedEnd = new Date(job.plannedEnd);
  const daysRemaining = Math.ceil((plannedEnd.getTime() - now.getTime()) / 86400000);

  if (job.status === 'complete') {
    return { risk: 'complete', daysRemaining, projectedCompletion: job.actualEnd ?? job.plannedEnd, projectionBasis: 'Actual completion recorded.' };
  }

  if (job.hasBlocker) {
    return { risk: 'blocked', daysRemaining, projectedCompletion: null, projectionBasis: 'Job has an open blocker — no reliable projection until resolved.' };
  }

  if (job.materialReadiness === 'shortage') {
    return { risk: 'awaiting_material', daysRemaining, projectedCompletion: null, projectionBasis: 'Material shortage recorded against this job — see Materials tab.' };
  }

  // Simple projection: remaining stages' planned duration, anchored to today if any stage is running late.
  const incompleteStages = job.stages.filter(s => s.status !== 'complete');
  const remainingPlannedDays = incompleteStages.reduce((sum, s) => {
    const d = (new Date(s.plannedEnd).getTime() - new Date(s.plannedStart).getTime()) / 86400000;
    return sum + Math.max(0, d);
  }, 0);

  const lateStages = job.stages.filter(s => s.status !== 'complete' && new Date(s.plannedStart) < now && s.status === 'pending');
  const hasSlippedStage = lateStages.length > 0 || job.stages.some(s => s.status === 'in_progress' && new Date(s.plannedEnd) < now);

  let projectedCompletion: string | null = null;
  let projectionBasis: string;
  if (incompleteStages.length === 0) {
    projectedCompletion = job.plannedEnd;
    projectionBasis = 'All stages recorded complete; planned date stands.';
  } else if (remainingPlannedDays > 0) {
    const projected = new Date(now);
    projected.setDate(projected.getDate() + Math.ceil(remainingPlannedDays));
    projectedCompletion = projected.toISOString().slice(0, 10);
    projectionBasis = `Based on ${incompleteStages.length} remaining stage(s)' planned durations from today.`;
  } else {
    projectionBasis = 'Insufficient stage duration data to project a completion date.';
  }

  let risk: ProductionRisk = 'on_track';
  if (daysRemaining < 0) risk = 'delayed';
  else if (hasSlippedStage || (projectedCompletion && new Date(projectedCompletion) > plannedEnd)) risk = 'at_risk';
  else if (daysRemaining <= 3) risk = 'at_risk';

  return { risk, daysRemaining, projectedCompletion, projectionBasis };
}
