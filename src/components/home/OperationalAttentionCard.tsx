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
  const visible = metrics.filter(m => m.value > 0);

  return (
    <div
      className="p-4 rounded-2xl border"
      style={{
        background: 'var(--card-gradient, linear-gradient(180deg, #FFFFFF 0%, #FAF9FE 100%))',
        borderColor: 'var(--border, #E5E0F5)',
        boxShadow: '0 4px 20px -2px rgba(24, 27, 65, 0.06)',
      }}
    >
      <h3 className="text-base font-bold text-[var(--text)] tracking-tight mb-1">Needs attention</h3>
      {visible.length === 0 ? (
        <p className="text-sm text-[var(--text-2)] py-2">Nothing is waiting on you right now.</p>
      ) : (
        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {visible.map(m => (
            <button
              key={m.label}
              onClick={() => navigate(m.path)}
              className="w-full flex items-center gap-3 py-2 text-left"
            >
              <m.icon size={15} style={{ color: colorFor(m.accent) }} />
              <span className="flex-1 text-[13px] font-medium text-[var(--text)]">{m.label}</span>
              <span className="text-sm font-bold tabular-nums" style={{ color: colorFor(m.accent) }}>{m.value}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
