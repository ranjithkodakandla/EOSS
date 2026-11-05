import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Settings, Shield, Clock, ChevronRight } from 'lucide-react';
import { useStore, DEMO_USERS } from '../../store';
import StatusChip from '../../components/layout/StatusChip';

const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner / MD', sales: 'Sales Executive', buyer: 'Buyer / Purchase',
  storekeeper: 'Storekeeper', supervisor: 'Production Supervisor', operator: 'Machine Operator',
  qc: 'QC Inspector', maintenance: 'Maintenance Tech', dispatch: 'Dispatch Executive', auditor: 'Auditor',
};

export default function Admin() {
  const navigate = useNavigate();
  const { currentUser } = useStore();
  const [tab, setTab] = useState<'users' | 'settings'>('users');

  if (!['owner', 'auditor'].includes(currentUser.role)) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-6">
        <Shield size={40} className="text-[var(--text-3)] mb-3" />
        <p className="text-[var(--text-2)] text-sm">Admin access is restricted to Owner and Auditor roles.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex-shrink-0 flex items-center gap-2 px-5 py-3 border-b flex-wrap" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="flex-1" />
        <button onClick={() => navigate('/admin/audit')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium hover:opacity-80"
          style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}>
          <Clock size={13} /> Audit Timeline
        </button>
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 flex items-center border-b px-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        {([['users', `Users (${DEMO_USERS.length})`], ['settings', 'Settings']] as [string, string][]).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id as any)}
            className="relative px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap"
            style={{ color: tab === id ? 'var(--brand)' : 'var(--text-2)' }}>
            {label}
            {tab === id && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full" style={{ background: 'var(--brand)' }} />}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        {tab === 'users' && (
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead style={{ position: 'sticky', top: 0, zIndex: 5 }}>
              <tr style={{ background: 'var(--surface-muted,#F8F9FC)' }}>
                {['User', 'Role', 'Email', 'Employee ID', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DEMO_USERS.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-muted,#F8F9FC)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0" style={{ background: 'var(--brand)' }}>{u.name[0]}</div>
                      <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>{u.name}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ background: 'var(--surface-muted,#F8F9FC)', color: 'var(--text-2)' }}>{ROLE_LABELS[u.role] ?? u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{u.email}</td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-3)' }}>{u.employeeId ?? '—'}</td>
                  <td className="px-4 py-3"><StatusChip status="active" size="sm" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'settings' && (
          <div className="p-5 grid md:grid-cols-2 gap-4 max-w-3xl">
            {[
              { label: 'Company Name', value: 'Precision Metalworks Pvt. Ltd.' },
              { label: 'GSTIN', value: '27AABCP1234F1Z5' },
              { label: 'Financial Year', value: '2024–2025' },
              { label: 'Default Currency', value: 'INR (₹)' },
              { label: 'Sites', value: '2 (Pune Main, Pune Secondary)' },
              { label: 'AI Extraction', value: 'Simulated (prototype mode)' },
              { label: 'Approval Workflow', value: 'Enabled — 2-level' },
              { label: 'Audit Trail', value: 'Enabled — all actions' },
            ].map((s, i) => (
              <div key={i} className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                <dt className="text-xs" style={{ color: 'var(--text-3)' }}>{s.label}</dt>
                <dd className="text-sm font-medium mt-1" style={{ color: 'var(--text)' }}>{s.value}</dd>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
