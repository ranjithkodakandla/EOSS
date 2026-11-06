import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Wrench, ClipboardCheck, FileWarning, PackageX, Ban } from 'lucide-react';
import { useStore } from '../../store';
import { computeProductionStatus } from '../../domain/productionStatus';
import { computeMaintenanceDue } from '../../domain/maintenanceDue';
import { listExpiringDocuments } from '../../domain/documentExpiry';
import { DEMO_NOW } from '../../data/seed';

// Every value here is derived live from store state — nothing is hardcoded.
export default function OperationalAttentionCard() {
  const navigate = useNavigate();
  const { jobs, inventory, assets, meterReadings, inspections, documents } = useStore();
  const now = new Date(DEMO_NOW);

  const criticalShortages = inventory.filter(i => i.shortage).length;
  const jobsAffectedByShortage = jobs.filter(j => j.materialReadiness === 'shortage').length;

  const dueInfos = assets.map(a => computeMaintenanceDue(a, meterReadings, now));
  const maintenanceDue = dueInfos.filter(d => d.status === 'due' || d.status === 'upcoming').length;
  const maintenanceOverdue = dueInfos.filter(d => d.status === 'overdue').length + assets.filter(a => a.status === 'pm_overdue').length;

  const jobStatuses = jobs.map(j => computeProductionStatus(j, now));
  const jobsAtRisk = jobStatuses.filter(s => s.risk === 'at_risk' || s.risk === 'delayed').length;
  const jobsBlocked = jobStatuses.filter(s => s.risk === 'blocked').length;

  const inspectionsPending = inspections.filter(i => i.result === 'pending' || i.result === 'fail').length;

  const docsExpiring = listExpiringDocuments(documents, now).length;

  const metrics = [
    { icon: PackageX, label: 'Critical Material Shortages', value: criticalShortages, path: '/inventory', accent: 'error' },
    { icon: AlertTriangle, label: 'Jobs Affected by Shortage', value: jobsAffectedByShortage, path: '/jobs', accent: 'error' },
    { icon: Wrench, label: 'Maintenance Due', value: maintenanceDue, path: '/assets', accent: 'warning' },
    { icon: Wrench, label: 'Maintenance Overdue', value: maintenanceOverdue, path: '/assets', accent: 'error' },
    { icon: Ban, label: 'Jobs At Risk / Delayed', value: jobsAtRisk, path: '/jobs', accent: 'warning' },
    { icon: Ban, label: 'Jobs Blocked', value: jobsBlocked, path: '/jobs', accent: 'error' },
    { icon: ClipboardCheck, label: 'Inspections Pending', value: inspectionsPending, path: '/quality', accent: 'warning' },
    { icon: FileWarning, label: 'Documents Expiring/Expired', value: docsExpiring, path: '/documents', accent: 'warning' },
  ] as const;

  const colorFor = (accent: string) => accent === 'error' ? 'var(--error)' : 'var(--warning)';

  return (
    <div
      className="p-5 rounded-2xl border"
      style={{
        background: 'var(--card-gradient, linear-gradient(180deg, #FFFFFF 0%, #FAF9FE 100%))',
        borderColor: 'var(--border, #E5E0F5)',
        boxShadow: '0 4px 20px -2px rgba(24, 27, 65, 0.06), 0 2px 6px -1px rgba(24, 27, 65, 0.04)',
      }}
    >
      <h3 className="text-base font-bold text-[var(--text-primary, #1A1F36)] tracking-tight mb-3.5">Operational Attention</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {metrics.map(m => (
          <button
            key={m.label}
            onClick={() => navigate(m.path)}
            className="text-left p-3 rounded-xl border hover:-translate-y-0.5 hover:shadow-sm transition-all"
            style={{ borderColor: 'var(--border, #E5E7EB)', background: m.value > 0 ? 'var(--surface-muted, #F8F9FC)' : 'transparent' }}
          >
            <div className="flex items-center justify-between">
              <m.icon size={14} style={{ color: m.value > 0 ? colorFor(m.accent) : 'var(--text-secondary, #9094A6)' }} />
              <span className="text-lg font-bold" style={{ color: m.value > 0 ? colorFor(m.accent) : 'var(--text-primary, #1A1F36)' }}>{m.value}</span>
            </div>
            <div className="text-[11px] font-medium text-[var(--text-secondary, #626A84)] mt-1 leading-tight">{m.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
