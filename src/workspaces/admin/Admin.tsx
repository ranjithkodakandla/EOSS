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
    <div className="p-4 md:p-6">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-[var(--text)]">Admin & Settings</h1>
        <p className="text-sm text-[var(--text-2)] mt-0.5">System configuration and user management</p>
      </div>

      <div className="flex gap-2 mb-5">
        <button onClick={() => setTab('users')} className={`px-4 py-2 rounded-lg text-sm transition-colors ${tab === 'users' ? 'bg-[var(--brand)] text-white' : 'border border-[var(--border)] text-[var(--text-2)]'}`}>
          <span className="flex items-center gap-2"><Users size={14} /> Users ({DEMO_USERS.length})</span>
        </button>
        <button onClick={() => setTab('settings')} className={`px-4 py-2 rounded-lg text-sm transition-colors ${tab === 'settings' ? 'bg-[var(--brand)] text-white' : 'border border-[var(--border)] text-[var(--text-2)]'}`}>
          <span className="flex items-center gap-2"><Settings size={14} /> Settings</span>
        </button>
        <button onClick={() => navigate('/admin/audit')} className="ml-auto flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded-lg text-sm text-[var(--text-2)] hover:border-[var(--brand)] transition-colors">
          <Clock size={14} /> Audit Timeline
        </button>
      </div>

      {tab === 'users' && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="eoss-table">
              <thead><tr><th>User</th><th>Role</th><th>Email</th><th>Employee ID</th><th>Status</th></tr></thead>
              <tbody>
                {DEMO_USERS.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[var(--brand)] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{u.name[0]}</div>
                        <div className="text-sm font-medium text-[var(--text)]">{u.name}</div>
                      </div>
                    </td>
                    <td>
                      <span className="text-xs font-semibold bg-[var(--surface-2)] px-2 py-0.5 rounded text-[var(--text-2)]">{ROLE_LABELS[u.role] ?? u.role}</span>
                    </td>
                    <td className="text-sm text-[var(--text-2)]">{u.email}</td>
                    <td className="font-mono text-xs text-[var(--text-3)]">{u.employeeId ?? '—'}</td>
                    <td><StatusChip status="active" size="sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'settings' && (
        <div className="grid md:grid-cols-2 gap-4">
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
            <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <dt className="text-xs text-[var(--text-3)]">{s.label}</dt>
              <dd className="text-sm font-medium text-[var(--text)] mt-1">{s.value}</dd>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
