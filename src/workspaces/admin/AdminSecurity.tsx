import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, MapPin, Users, Shield, Settings2, Plug, Brain, Clock,
  Plus, Edit2, ChevronRight, CheckCircle, AlertCircle, Eye, EyeOff, X, Pencil
} from 'lucide-react';
import { useStore, DEMO_USERS } from '../../store';
import StatusChip from '../../components/layout/StatusChip';
import type { DemoUser, RoleKey } from '../../types';

type AdminTab = 'company' | 'sites' | 'users' | 'roles' | 'approvals' | 'integrations' | 'ai' | 'audit';

const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner / GM', sales: 'Sales', buyer: 'Buyer / Procurement',
  storekeeper: 'Storekeeper', supervisor: 'Production Supervisor', operator: 'Operator',
  qc: 'QC Inspector', maintenance: 'Maintenance Technician', dispatch: 'Dispatch Personnel', auditor: 'Auditor',
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  owner: 'Full access to all workspaces, settings and approvals.',
  sales: 'Sales, customers, quotations, POs and dispatch visibility.',
  buyer: 'Procurement, supplier management, purchase requisitions and GRN.',
  storekeeper: 'Inventory, stock transfers, cycle counts and GRN receiving.',
  supervisor: 'Job creation, production stages, material issues and QC.',
  operator: 'View job assignments and update own stage progress only.',
  qc: 'Inspections, NCRs, quality release and certificates.',
  maintenance: 'Asset management, maintenance events and breakdowns.',
  dispatch: 'Dispatch planning, delivery confirmation and POD.',
  auditor: 'Read-only access to all records and audit trail.',
};

const INTEGRATIONS = [
  { id: 'tally', name: 'Tally Prime', category: 'Accounting', status: 'not_connected', description: 'Sync invoices and payments with Tally.' },
  { id: 'busy', name: 'BUSY Accounting', category: 'Accounting', status: 'not_connected', description: 'Export vouchers and ledger entries.' },
  { id: 'zoho', name: 'Zoho Books', category: 'Accounting', status: 'not_connected', description: 'Cloud accounting synchronisation.' },
  { id: 'gmail', name: 'Gmail', category: 'Communication', status: 'simulated', description: 'Send quotations and POs via email.' },
  { id: 'outlook', name: 'Outlook / M365', category: 'Communication', status: 'not_connected', description: 'Microsoft email integration.' },
  { id: 'whatsapp', name: 'WhatsApp Business', category: 'Communication', status: 'simulated', description: 'Dispatch alerts and order updates.' },
  { id: 'openai', name: 'OpenAI / Azure OpenAI', category: 'AI Provider', status: 'simulated', description: 'AI extraction and copilot features.' },
];

export default function AdminSecurity() {
  const navigate = useNavigate();
  const { currentUser, companyConfig, updateCompanyConfig, storeLocations, auditEvents, approvalPolicies, employees, switchRole, showToast } = useStore();
  const [tab, setTab] = useState<AdminTab>('company');
  const [editCompany, setEditCompany] = useState(false);
  const [companyForm, setCompanyForm] = useState({ ...companyConfig });
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddSite, setShowAddSite] = useState(false);
  const [editUser, setEditUser] = useState<DemoUser | null>(null);
  const [demoRole, setDemoRole] = useState<RoleKey>(currentUser.role);

  if (!['owner', 'auditor'].includes(currentUser.role)) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-6">
        <Shield size={40} className="text-[var(--text-3)] mb-3" />
        <p className="text-[var(--text-2)] text-sm">Admin access is restricted to Owner and Auditor roles.</p>
      </div>
    );
  }

  const isReadOnly = currentUser.role === 'auditor';

  const TABS: { key: AdminTab; label: string; icon: React.ElementType }[] = [
    { key: 'company', label: 'Company & Legal', icon: Building2 },
    { key: 'sites', label: 'Sites & Stores', icon: MapPin },
    { key: 'users', label: 'Users & Employees', icon: Users },
    { key: 'roles', label: 'Roles & Permissions', icon: Shield },
    { key: 'approvals', label: 'Approval Policies', icon: Settings2 },
    { key: 'integrations', label: 'Integrations', icon: Plug },
    { key: 'ai', label: 'AI & Usage', icon: Brain },
    { key: 'audit', label: 'Audit & Activity', icon: Clock },
  ];

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-[var(--text)]">Admin & Security</h1>
        <p className="text-sm text-[var(--text-2)] mt-0.5">Company configuration, users, roles, integrations and audit</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1 border-b border-[var(--border)]">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap -mb-px ${tab === t.key ? 'border-[var(--brand)] text-[var(--brand)]' : 'border-transparent text-[var(--text-2)] hover:text-[var(--text)]'}`}>
            <t.icon size={13} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Company & Legal */}
      {tab === 'company' && (
        <div className="max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[var(--text)]">Company & Legal Profile</h2>
            {!isReadOnly && (
              <button onClick={() => setEditCompany(!editCompany)} className="flex items-center gap-2 px-3.5 py-2 border border-[var(--border)] rounded-xl text-sm text-[var(--text-2)] hover:border-[var(--brand)] transition-colors">
                <Edit2 size={13} /> {editCompany ? 'Cancel' : 'Edit'}
              </button>
            )}
          </div>
          {editCompany ? (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Company Name', key: 'companyName' },
                  { label: 'Trading Name', key: 'tradingName' },
                  { label: 'Legal Name', key: 'legalName' },
                  { label: 'Entity Type', key: 'entityType' },
                  { label: 'PAN', key: 'pan' },
                  { label: 'GSTIN', key: 'gstin' },
                  { label: 'City', key: 'city' },
                  { label: 'State', key: 'state' },
                  { label: 'Phone', key: 'phone' },
                  { label: 'Email', key: 'email' },
                  { label: 'Financial Year', key: 'financialYear' },
                  { label: 'Currency', key: 'currency' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-medium text-[var(--text-2)] mb-1">{f.label}</label>
                    <input className="eoss-input w-full" value={(companyForm as any)[f.key] ?? ''} onChange={e => setCompanyForm(prev => ({ ...prev, [f.key]: e.target.value }))} />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditCompany(false)} className="px-4 py-2 border border-[var(--border)] rounded-xl text-sm text-[var(--text-2)]">Cancel</button>
                <button onClick={() => {
                  updateCompanyConfig(companyForm);
                  setEditCompany(false);
                  showToast({ type: 'success', title: 'Company profile updated' });
                }} className="px-4 py-2 bg-[var(--brand)] text-white rounded-xl text-sm font-medium">Save Changes</button>
              </div>
            </div>
          ) : (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Company Name', value: companyConfig.companyName },
                  { label: 'Trading Name', value: companyConfig.tradingName },
                  { label: 'Legal Name', value: companyConfig.legalName },
                  { label: 'Entity Type', value: companyConfig.entityType },
                  { label: 'PAN', value: companyConfig.pan },
                  { label: 'GSTIN', value: companyConfig.gstin },
                  { label: 'City', value: companyConfig.city },
                  { label: 'State', value: companyConfig.state },
                  { label: 'Phone', value: companyConfig.phone },
                  { label: 'Email', value: companyConfig.email },
                  { label: 'Financial Year', value: companyConfig.financialYear },
                  { label: 'Default Currency', value: companyConfig.currency },
                ].map(f => (
                  <div key={f.label}>
                    <dt className="text-xs text-[var(--text-3)]">{f.label}</dt>
                    <dd className="text-sm font-medium text-[var(--text)] mt-0.5">{f.value || '—'}</dd>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sites & Stores */}
      {tab === 'sites' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[var(--text)]">Sites & Locations</h2>
            {!isReadOnly && (
              <button onClick={() => setShowAddSite(true)} className="flex items-center gap-2 px-3.5 py-2 bg-[var(--brand)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
                <Plus size={14} /> Add Site
              </button>
            )}
          </div>
          <div className="space-y-4">
            {[
              { id: 'site-hyd', name: 'Hyderabad Factory', type: 'Factory', city: 'Hyderabad', state: 'Telangana', isPrimary: true, gstin: '36AABCS1234F1Z5' },
              { id: 'site-wh', name: 'Hyderabad Warehouse', type: 'Warehouse', city: 'Hyderabad', state: 'Telangana', isPrimary: false, gstin: '36AABCS1234F1Z5' },
            ].map(site => (
              <div key={site.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--text)]">{site.name}</span>
                      {site.isPrimary && <span className="text-[10px] font-bold bg-[var(--brand)] text-white px-2 py-0.5 rounded-full">Primary</span>}
                    </div>
                    <div className="text-xs text-[var(--text-3)] mt-0.5">{site.type} · {site.city}, {site.state}</div>
                  </div>
                  {!isReadOnly && (
                    <button className="text-xs text-[var(--brand)] hover:underline">Edit</button>
                  )}
                </div>
                <div className="text-xs text-[var(--text-3)] mb-3">GSTIN: {site.gstin}</div>
                <div>
                  <div className="text-xs font-medium text-[var(--text-2)] mb-2">Store Locations</div>
                  <div className="flex flex-wrap gap-2">
                    {storeLocations.filter(sl => sl.siteId === site.id).map(sl => (
                      <span key={sl.id} className="text-xs px-2 py-1 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-2)]">
                        {sl.name} ({sl.code})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users & Employees */}
      {tab === 'users' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[var(--text)]">Users & Employees</h2>
            {!isReadOnly && (
              <button onClick={() => setShowAddUser(true)} className="flex items-center gap-2 px-3.5 py-2 bg-[var(--brand)] text-white rounded-xl text-sm font-medium hover:opacity-90">
                <Plus size={14} /> Add User
              </button>
            )}
          </div>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
            <table className="eoss-table">
              <thead>
                <tr><th>User</th><th>Role</th><th>Employee Code</th><th>Department</th><th>Email</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {DEMO_USERS.map(u => {
                  const emp = employees.find(e => e.userId === u.id);
                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[var(--brand)] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{u.avatar}</div>
                          <div>
                            <div className="text-sm font-medium text-[var(--text)]">{u.name}</div>
                            {emp && <div className="text-xs text-[var(--text-3)]">{emp.designation}</div>}
                          </div>
                        </div>
                      </td>
                      <td><span className="text-xs font-semibold bg-[var(--surface-2)] px-2 py-0.5 rounded text-[var(--text-2)]">{ROLE_LABELS[u.role] ?? u.role}</span></td>
                      <td className="font-mono text-xs text-[var(--text-3)]">{emp?.employeeCode ?? '—'}</td>
                      <td className="text-xs text-[var(--text-2)]">{emp?.department ?? '—'}</td>
                      <td className="text-xs text-[var(--text-2)]">{u.email}</td>
                      <td><StatusChip status="active" size="sm" /></td>
                      <td>
                        {!isReadOnly && (
                          <button onClick={() => setEditUser(u)} className="p-1.5 rounded-lg hover:bg-[var(--surface-2)] transition-colors" title="Edit user">
                            <Pencil size={13} style={{ color: 'var(--text-3)' }} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Demo Role Switcher */}
          <div className="mt-6 p-4 border border-dashed border-[var(--border)] rounded-2xl bg-[var(--surface-2)]">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={14} style={{ color: 'var(--brand)' }} />
              <span className="text-xs font-semibold text-[var(--text)]">Demo Role Switcher</span>
              <span className="text-[10px] text-[var(--text-3)] ml-1">— preview access by role</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <select value={demoRole} onChange={e => setDemoRole(e.target.value as RoleKey)} className="eoss-input text-sm py-1.5">
                {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <button onClick={() => {
                switchRole(demoRole);
                showToast({ type: 'info', title: `Switched to ${ROLE_LABELS[demoRole] ?? demoRole}`, body: 'Navigation and permissions now reflect this role.' });
              }} className="px-4 py-2 bg-[var(--brand)] text-white rounded-xl text-sm font-medium">
                Switch Role
              </button>
              <span className="text-xs text-[var(--text-3)]">Currently: <strong className="text-[var(--text)]">{ROLE_LABELS[currentUser.role] ?? currentUser.role}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* Roles & Permissions */}
      {tab === 'roles' && (
        <div>
          <div className="mb-4">
            <h2 className="text-base font-semibold text-[var(--text)]">Roles & Permissions</h2>
            <p className="text-xs text-[var(--text-3)] mt-0.5">10 pre-configured demo roles. Use the role switcher in the top bar to test role-specific access.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {Object.entries(ROLE_LABELS).map(([key, label]) => (
              <div key={key} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-semibold text-[var(--text)]">{label}</div>
                    <div className="text-xs text-[var(--text-3)] mt-0.5">{ROLE_DESCRIPTIONS[key]}</div>
                  </div>
                  {key === 'auditor' && <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full whitespace-nowrap">Read-only</span>}
                  {key === 'operator' && <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full whitespace-nowrap">Limited</span>}
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-[var(--text-3)]">
                  <span className="w-2 h-2 rounded-full bg-[var(--success)]" />
                  {DEMO_USERS.filter(u => u.role === key).length} user(s) assigned
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approval Policies */}
      {tab === 'approvals' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[var(--text)]">Approval Policies</h2>
            {!isReadOnly && (
              <button className="flex items-center gap-2 px-3.5 py-2 bg-[var(--brand)] text-white rounded-xl text-sm font-medium hover:opacity-90">
                <Plus size={14} /> Add Policy
              </button>
            )}
          </div>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
            <table className="eoss-table">
              <thead><tr><th>Scope</th><th>Condition</th><th>Required Role</th><th>Escalation</th><th>Status</th></tr></thead>
              <tbody>
                {approvalPolicies.map(p => (
                  <tr key={p.id}>
                    <td className="font-medium text-sm">{p.scope}</td>
                    <td className="text-sm text-[var(--text-2)]">{p.condition}</td>
                    <td><span className="text-xs font-semibold bg-[var(--surface-2)] px-2 py-0.5 rounded">{ROLE_LABELS[p.requiredRole] ?? p.requiredRole}</span></td>
                    <td className="text-xs text-[var(--text-3)]">{p.escalationRole ? (ROLE_LABELS[p.escalationRole] ?? p.escalationRole) : '—'}</td>
                    <td><StatusChip status={p.active ? 'active' : 'inactive'} size="sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Integrations */}
      {tab === 'integrations' && (
        <div>
          <div className="mb-4">
            <h2 className="text-base font-semibold text-[var(--text)]">Integrations</h2>
            <p className="text-xs text-[var(--text-3)] mt-0.5">Live OAuth connections are not active in this prototype. Simulated integrations are indicated.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {INTEGRATIONS.map(intg => (
              <div key={intg.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-sm font-semibold text-[var(--text)]">{intg.name}</div>
                    <div className="text-xs text-[var(--text-3)]">{intg.category}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${intg.status === 'simulated' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                    {intg.status === 'simulated' ? 'Simulated' : 'Not Connected'}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-3)] mb-3">{intg.description}</p>
                <button className="w-full py-2 border border-[var(--border)] rounded-xl text-xs font-medium text-[var(--text-2)] hover:border-[var(--brand)] transition-colors">
                  {intg.status === 'simulated' ? 'Configure' : 'Connect'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI & Usage */}
      {tab === 'ai' && (
        <div className="max-w-xl space-y-4">
          <h2 className="text-base font-semibold text-[var(--text)]">AI & Usage</h2>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 space-y-4">
            <div>
              <div className="text-sm font-medium text-[var(--text)] mb-2">AI Operating Mode</div>
              <div className="flex gap-2">
                {(['Full', 'Limited', 'Paused'] as const).map(mode => (
                  <button key={mode} className={`px-4 py-2 rounded-xl text-sm border transition-colors ${mode === 'Full' ? 'bg-[var(--brand)] text-white border-[var(--brand)]' : 'border-[var(--border)] text-[var(--text-2)]'}`}>
                    {mode}
                  </button>
                ))}
              </div>
            </div>
            <div className="pt-3 border-t border-[var(--border)]">
              <div className="text-xs text-[var(--text-3)] mb-2">AI Provider</div>
              <div className="text-sm font-medium text-[var(--text)]">OpenAI GPT-4o <span className="text-xs text-blue-600 font-semibold ml-2">[Simulated]</span></div>
            </div>
            <div className="pt-3 border-t border-[var(--border)]">
              <div className="text-xs text-[var(--text-3)] mb-1">Usage this month</div>
              <div className="text-sm text-[var(--text-2)]">All AI features are simulated in prototype mode. No actual API calls are made.</div>
            </div>
            <div className="pt-3 border-t border-[var(--border)] p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200/50">
              <div className="flex gap-2 text-xs text-blue-700 dark:text-blue-300">
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                AI extraction and recommendations are simulated. All AI proposals require human confirmation before any consequential change.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit & Activity */}
      {tab === 'audit' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[var(--text)]">Audit & Activity</h2>
            <button onClick={() => navigate('/admin/audit')} className="flex items-center gap-2 px-3.5 py-2 border border-[var(--border)] rounded-xl text-sm text-[var(--text-2)] hover:border-[var(--brand)] transition-colors">
              Full Timeline <ChevronRight size={14} />
            </button>
          </div>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
            <table className="eoss-table">
              <thead><tr><th>Actor</th><th>Action</th><th>Entity</th><th>Ref</th><th>Date/Time</th><th>Source</th></tr></thead>
              <tbody>
                {auditEvents.slice().reverse().slice(0, 20).map(e => (
                  <tr key={e.id}>
                    <td className="text-sm font-medium">{e.actor}</td>
                    <td><span className="text-xs font-semibold capitalize px-2 py-0.5 rounded bg-[var(--surface-2)]">{e.action}</span></td>
                    <td className="text-xs text-[var(--text-2)]">{e.scope}</td>
                    <td className="font-mono text-xs text-[var(--brand)]">{e.entityRef}</td>
                    <td className="text-xs text-[var(--text-3)]">{e.timestamp.replace('T', ' ')}</td>
                    <td className="text-xs text-[var(--text-3)]">{e.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUser && <AddUserModal onClose={() => setShowAddUser(false)} onSave={(name, role, email) => {
        showToast({ type: 'success', title: 'User invited', body: `${name} (${ROLE_LABELS[role] ?? role}) has been added.` });
        setShowAddUser(false);
      }} />}

      {/* Edit User Modal */}
      {editUser && <EditUserModal user={editUser} onClose={() => setEditUser(null)} onSave={(name, role, email) => {
        showToast({ type: 'success', title: 'User updated', body: `${name} (${ROLE_LABELS[role] ?? role}) has been updated.` });
        setEditUser(null);
      }} />}

      {/* Add Site Modal */}
      {showAddSite && <AddSiteModal onClose={() => setShowAddSite(false)} onSave={(siteName, type, city) => {
        showToast({ type: 'success', title: 'Site added', body: `${siteName} (${city}) has been configured.` });
        setShowAddSite(false);
      }} />}
    </div>
  );
}

function AddUserModal({ onClose, onSave }: { onClose: () => void; onSave: (name: string, role: string, email: string) => void }) {
  const [form, setForm] = useState({ name: '', role: 'sales', email: '' });
  const [err, setErr] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-[var(--text)]">Add / Invite User</h3>
          <button onClick={onClose}><X size={16} className="text-[var(--text-3)]" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Full Name *</label>
            <input className="eoss-input w-full" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Email *</label>
            <input type="email" className="eoss-input w-full" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Role *</label>
            <select className="eoss-input w-full" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>
        {err && <p className="text-xs text-[var(--danger)] mt-2">{err}</p>}
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[var(--border)] rounded-xl text-sm text-[var(--text-2)]">Cancel</button>
          <button onClick={() => {
            if (!form.name || !form.email) { setErr('Name and email required'); return; }
            onSave(form.name, form.role, form.email);
          }} className="flex-1 py-2.5 bg-[var(--brand)] text-white rounded-xl text-sm font-medium">Invite User</button>
        </div>
      </div>
    </div>
  );
}

function AddSiteModal({ onClose, onSave }: { onClose: () => void; onSave: (name: string, type: string, city: string) => void }) {
  const [form, setForm] = useState({ name: '', type: 'factory', city: '', state: '', address: '' });
  const [err, setErr] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-[var(--text)]">Add Site</h3>
          <button onClick={onClose}><X size={16} className="text-[var(--text-3)]" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Site Name *</label>
            <input className="eoss-input w-full" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Pune Factory" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Type</label>
            <select className="eoss-input w-full" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              {['factory', 'warehouse', 'office', 'branch'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">City *</label>
            <input className="eoss-input w-full" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">State</label>
            <input className="eoss-input w-full" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} />
          </div>
        </div>
        {err && <p className="text-xs text-[var(--danger)] mt-2">{err}</p>}
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[var(--border)] rounded-xl text-sm text-[var(--text-2)]">Cancel</button>
          <button onClick={() => {
            if (!form.name || !form.city) { setErr('Name and city required'); return; }
            onSave(form.name, form.type, form.city);
          }} className="flex-1 py-2.5 bg-[var(--brand)] text-white rounded-xl text-sm font-medium">Add Site</button>
        </div>
      </div>
    </div>
  );
}

function EditUserModal({ user, onClose, onSave }: { user: DemoUser; onClose: () => void; onSave: (name: string, role: string, email: string) => void }) {
  const [form, setForm] = useState({ name: user.name, role: user.role as string, email: user.email });
  const [err, setErr] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-[var(--text)]">Edit User</h3>
          <button onClick={onClose}><X size={16} className="text-[var(--text-3)]" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Full Name *</label>
            <input className="eoss-input w-full" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Email *</label>
            <input type="email" className="eoss-input w-full" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-2)] mb-1">Role *</label>
            <select className="eoss-input w-full" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>
        {err && <p className="text-xs text-[var(--danger)] mt-2">{err}</p>}
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[var(--border)] rounded-xl text-sm text-[var(--text-2)]">Cancel</button>
          <button onClick={() => {
            if (!form.name || !form.email) { setErr('Name and email required'); return; }
            onSave(form.name, form.role, form.email);
          }} className="flex-1 py-2.5 bg-[var(--brand)] text-white rounded-xl text-sm font-medium">Save Changes</button>
        </div>
      </div>
    </div>
  );
}
