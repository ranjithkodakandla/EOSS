import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Package, ClipboardCheck, Settings, Plus, ShoppingCart, FileInput, PackagePlus, Wrench, Truck, X } from 'lucide-react';
import clsx from 'clsx';
import { useStore } from '../../store';
import RecordSheet from './RecordSheet';

const LEFT_NAV = [
  { path: '/', label: 'Home', icon: <LayoutDashboard size={20} />, end: true },
  { path: '/jobs', label: 'Jobs', icon: <ClipboardCheck size={20} /> },
];
const RIGHT_NAV = [
  { path: '/inventory', label: 'Stock', icon: <Package size={20} /> },
  { path: '/sales', label: 'Sales', icon: <Briefcase size={20} /> },
];

type QuickAction = 'receive' | 'job' | 'inspection' | 'dispatch';

export default function BottomNav() {
  const navigate = useNavigate();
  const { currentUser, supplierPos, jobs, inspections, qualityReleases } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<{ label: string; action: QuickAction } | null>(null);
  const [selectedId, setSelectedId] = useState('');

  const allItems = [
    { icon: ShoppingCart, label: 'Customer RFQ', roles: ['owner', 'sales'], path: '/sales/rfq/new' },
    { icon: FileInput, label: 'Purchase Request', roles: ['owner', 'buyer'], path: '/procurement/pr/new' },
    { icon: PackagePlus, label: 'Receive Stock', roles: ['owner', 'storekeeper', 'buyer'], action: 'receive' as QuickAction },
    { icon: Wrench, label: 'Update Job', roles: ['owner', 'supervisor', 'operator'], action: 'job' as QuickAction },
    { icon: ClipboardCheck, label: 'Inspection', roles: ['owner', 'qc', 'supervisor'], action: 'inspection' as QuickAction },
    { icon: Truck, label: 'Dispatch', roles: ['owner', 'dispatch', 'sales'], action: 'dispatch' as QuickAction },
  ];
  const items = allItems.filter(a => a.roles.includes(currentUser.role));

  const optionsFor = (action: QuickAction) => {
    if (action === 'receive') {
      return supplierPos
        .filter(p => ['confirmed', 'partial', 'overdue'].includes(p.status))
        .map(p => ({ id: p.id, label: p.poNumber, detail: `${p.supplierName} · ${p.status}`, path: `/procurement?tab=grn&receive=${p.id}` }));
    }
    if (action === 'job') {
      return jobs
        .filter(j => j.status === 'active' || j.status === 'hold')
        .map(j => ({ id: j.id, label: j.jobNumber, detail: `${j.customerName} · ${j.currentStage}`, path: `/jobs/${j.id}?update=1` }));
    }
    if (action === 'inspection') {
      return inspections
        .filter(i => i.result === 'pending' || i.result === 'fail')
        .map(i => ({ id: i.id, label: i.inspectionNumber, detail: `${i.jobNumber ?? i.productDescription ?? 'Inspection target'} · ${i.result}`, path: `/quality/inspection/${i.id}?record=1` }));
    }
    return jobs
      .filter(j => qualityReleases.some(r => r.jobId === j.id) || j.status === 'complete')
      .map(j => ({ id: j.id, label: j.jobNumber, detail: `${j.customerName} · ${j.status}`, path: `/dispatch?plan=${j.id}` }));
  };

  const options = activeAction ? optionsFor(activeAction.action) : [];
  const selected = options.find(o => o.id === selectedId) ?? options[0];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface)] border-t border-[var(--border)] bottom-nav flex md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {LEFT_NAV.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) => clsx(
              'flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors',
              isActive ? 'text-[var(--brand)]' : 'text-[var(--text-3)]'
            )}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}

        {/* Centre FAB */}
        <div className="flex-shrink-0 relative flex items-center justify-center px-3">
          <button
            type="button"
            onClick={() => setMenuOpen(o => !o)}
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg text-white transition-transform active:scale-95"
            style={{ background: 'var(--brand-fill)', marginBottom: 4 }}
            aria-label="Quick Actions"
          >
            {menuOpen ? <X size={20} /> : <Plus size={22} />}
          </button>
        </div>

        {RIGHT_NAV.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => clsx(
              'flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors',
              isActive ? 'text-[var(--brand)]' : 'text-[var(--text-3)]'
            )}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Quick action picker sheet */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-[55] bg-black/30 md:hidden" onClick={() => setMenuOpen(false)} />
          <div
            className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+64px)] left-0 right-0 z-[60] md:hidden"
            style={{ padding: '0 12px 8px' }}
          >
            <div
              className="rounded-2xl border shadow-2xl overflow-hidden"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div className="px-4 py-2.5 border-b text-xs font-bold text-[var(--text-2)] uppercase tracking-wider" style={{ borderColor: 'var(--border)' }}>
                Quick Actions
              </div>
              <div className="grid grid-cols-2 gap-px" style={{ background: 'var(--border)' }}>
                {items.map(item => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      if (item.path) {
                        navigate(item.path);
                      } else if (item.action) {
                        const opts = optionsFor(item.action);
                        setSelectedId(opts[0]?.id ?? '');
                        setActiveAction({ label: item.label, action: item.action });
                      }
                    }}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[var(--text)] active:bg-[var(--surface-2)]"
                    style={{ background: 'var(--surface)' }}
                  >
                    <item.icon size={18} style={{ color: 'var(--brand)', flexShrink: 0 }} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Record picker sheet for actions needing record selection */}
      {activeAction && (
        <RecordSheet
          title={activeAction.label}
          subtitle="Choose the record to continue with"
          onClose={() => setActiveAction(null)}
          width="md"
        >
          {options.length === 0 ? (
            <p className="text-sm text-[var(--text-2)]">No eligible records are available for this action.</p>
          ) : (
            <div className="space-y-2">
              {options.map(option => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedId(option.id)}
                  className="w-full text-left rounded-xl border p-3"
                  style={{
                    borderColor: selected?.id === option.id ? 'var(--brand)' : 'var(--border)',
                    background: selected?.id === option.id ? 'var(--brand-soft)' : 'var(--surface)',
                  }}
                >
                  <div className="font-mono text-sm font-semibold text-[var(--brand)]">{option.label}</div>
                  <div className="text-xs mt-1 text-[var(--text-2)]">{option.detail}</div>
                </button>
              ))}
              <button
                type="button"
                disabled={!selected}
                onClick={() => {
                  if (selected) {
                    setActiveAction(null);
                    navigate(selected.path);
                  }
                }}
                className="w-full mt-3 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
                style={{ background: 'var(--brand-fill)' }}
              >
                Continue →
              </button>
            </div>
          )}
        </RecordSheet>
      )}
    </>
  );
}
