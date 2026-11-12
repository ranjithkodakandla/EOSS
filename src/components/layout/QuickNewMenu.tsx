import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, ChevronDown, ShoppingCart, FileInput, PackagePlus, Wrench, ClipboardCheck, Truck, type LucideIcon,
} from 'lucide-react';
import { useStore } from '../../store';
import RecordSheet from './RecordSheet';

type QuickAction = 'receive' | 'job' | 'inspection' | 'dispatch';

export default function QuickNewMenu() {
  const navigate = useNavigate();
  const { currentUser, supplierPos, jobs, inspections, qualityReleases } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<{ label: string; action: QuickAction } | null>(null);
  const [selectedId, setSelectedId] = useState('');

  const allItems: Array<{ icon: LucideIcon; label: string; roles: string[]; path?: string; action?: QuickAction }> = [
    { icon: ShoppingCart, label: 'Customer RFQ', path: '/sales/rfq/new', roles: ['owner', 'sales'] },
    { icon: FileInput, label: 'Purchase Request', path: '/procurement/pr/new', roles: ['owner', 'buyer'] },
    { icon: PackagePlus, label: 'Receive Stock', action: 'receive', roles: ['owner', 'storekeeper', 'buyer'] },
    { icon: Wrench, label: 'Update Job', action: 'job', roles: ['owner', 'supervisor', 'operator'] },
    { icon: ClipboardCheck, label: 'Inspection', action: 'inspection', roles: ['owner', 'qc', 'supervisor'] },
    { icon: Truck, label: 'Dispatch', action: 'dispatch', roles: ['owner', 'dispatch', 'sales'] },
  ];
  const items = allItems.filter(a => a.roles.includes(currentUser.role));

  if (items.length === 0) return null;

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
      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen(o => !o)}
          className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-sm hover:opacity-95 transition-opacity cursor-pointer"
          style={{ background: 'var(--brand-fill)' }}
        >
          <Plus size={13} />
          <span>New</span>
          <ChevronDown size={11} className="hidden sm:inline opacity-80" />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
            <div
              className="absolute right-0 mt-2 w-48 rounded-xl border shadow-xl z-40 py-1.5"
              style={{
                background: 'var(--surface, #FFFFFF)',
                borderColor: 'var(--border, #E5E0F5)',
                boxShadow: 'var(--shadow-elevated)',
              }}
            >
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
                  className="w-full px-3 py-2 text-left text-xs font-medium text-[var(--text)] hover:bg-[var(--surface-2)] flex items-center gap-2"
                >
                  <item.icon size={14} style={{ color: 'var(--brand)' }} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

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
                className="w-full mt-3 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40"
                style={{ background: 'var(--brand-fill)' }}
              >
                Continue with selected record
              </button>
            </div>
          )}
        </RecordSheet>
      )}
    </>
  );
}
