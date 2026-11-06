// Dispatch eligibility gate: a Job is not dispatch-eligible merely because production stages are complete.
// A Quality Release record must exist for it first (PRD §6.5).
import type { Job, QualityRelease, Inspection } from '../types';

export interface DispatchEligibility {
  eligible: boolean;
  reason: string;
  qualityReleaseId?: string;
  pendingInspections: Inspection[];
}

export function checkDispatchEligibility(params: {
  job: Job;
  qualityReleases: QualityRelease[];
  inspections: Inspection[];
}): DispatchEligibility {
  const { job, qualityReleases, inspections } = params;

  const pendingInspections = inspections.filter(
    i => i.jobId === job.id && (i.result === 'pending' || i.result === 'fail')
  );

  const release = qualityReleases.find(r => r.jobId === job.id);

  if (!release) {
    return {
      eligible: false,
      reason: pendingInspections.length > 0
        ? `No quality release on record for ${job.jobNumber}, and ${pendingInspections.length} inspection(s) are pending or failed.`
        : `No quality release on record for ${job.jobNumber}. Final inspection must be completed and released before dispatch.`,
      pendingInspections,
    };
  }

  if (pendingInspections.length > 0) {
    return {
      eligible: false,
      reason: `Quality release ${release.id} exists, but ${pendingInspections.length} inspection(s) are still pending or failed.`,
      qualityReleaseId: release.id,
      pendingInspections,
    };
  }

  return { eligible: true, reason: `Released by ${release.releasedBy} on ${release.releasedAt.slice(0, 10)}.`, qualityReleaseId: release.id, pendingInspections: [] };
}
