import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, FileInput, PackagePlus, Wrench, ClipboardCheck, Truck } from 'lucide-react';
import { useStore } from '../../store';
import FinancialKpis from '../../components/home/FinancialKpis';
import OrderToDeliveryFlow from '../../components/home/OrderToDeliveryFlow';
import OperationalAttentionCard from '../../components/home/OperationalAttentionCard';
import CopilotPanel from '../../components/copilot/CopilotPanel';

export default function Home() {
  const {
    currentUser, eossTheme, customerPos, jobs, inspections, supplierPos, qualityReleases,
  } = useStore();
  const navigate = useNavigate();
  const [copilotDrawerOpen, setCopilotDrawerOpen] = useState(false);

  const copilotBtnBg =
    eossTheme === 'graphite'
      ? 'linear-gradient(135deg, #1C1D24 0%, #2D2418 100%)'
      : eossTheme === 'ocean'
      ? 'linear-gradient(135deg, #06404A 0%, #08606F 100%)'
      : 'linear-gradient(135deg, #1E0A4C 0%, #3B0764 100%)';

  const nameParts = currentUser?.name ? currentUser.name.trim().split(' ') : ['Ranjith'];
  const firstName = nameParts[0] || 'Ranjith';

  const updateJob = jobs.find(j => j.status === 'active' && !j.hasBlocker) ?? jobs.find(j => j.status === 'active');
  const pendingInspection = inspections.find(i => i.result === 'pending') ?? inspections.find(i => i.result === 'fail');
  const receivablePo = supplierPos.find(p => ['confirmed', 'partial', 'overdue', 'sent'].includes(p.status));
  const dispatchJob = jobs.find(j => qualityReleases.some(r => r.jobId === j.id)) ?? jobs.find(j => j.status === 'complete');

  const quickActions = [
    { icon: ShoppingCart, label: 'New Customer RFQ', path: '/sales/rfq/new', roles: ['owner', 'sales'] },
    { icon: FileInput, label: 'Create Purchase Request', path: '/procurement/pr/new', roles: ['owner', 'buyer'] },
    { icon: PackagePlus, label: 'Receive Stock', path: receivablePo ? `/procurement?tab=grn&receive=${receivablePo.id}` : '/procurement?tab=grn&receive=1', roles: ['owner', 'storekeeper', 'buyer'] },
    { icon: Wrench, label: 'Update Job', path: updateJob ? `/jobs/${updateJob.id}?update=1` : '/jobs', roles: ['owner', 'supervisor', 'operator'] },
    { icon: ClipboardCheck, label: 'Record Inspection', path: pendingInspection ? `/quality/inspection/${pendingInspection.id}?record=1` : '/quality?result=open', roles: ['owner', 'qc', 'supervisor'] },
    { icon: Truck, label: 'Plan Dispatch', path: dispatchJob ? `/dispatch?plan=${dispatchJob.id}` : '/dispatch?plan=1', roles: ['owner', 'dispatch', 'sales'] },
  ].filter(a => a.roles.includes(currentUser.role));

  return (
    <div className="p-3 md:p-4 xl:h-[calc(100vh-70px)] xl:overflow-hidden xl:flex xl:flex-col">
      <div className="mb-3 flex items-start justify-between gap-3 shrink-0">
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-[var(--text)] flex items-center gap-2">
            <span>{`Good Evening, ${firstName}`}</span>
            <span>👋</span>
          </h1>
          <p className="text-sm text-[var(--text-2)] mt-0.5">
            Here's how the shop is moving.
            {customerPos.some(po => po.id === 'cpo-rw-001') && (
              <button type="button" onClick={() => navigate('/sales/po/cpo-rw-001')} className="ml-2 text-[var(--brand)] font-medium">
                RheinWerk CPO-0001 is paid
              </button>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCopilotDrawerOpen(true)}
          className="xl:hidden flex-shrink-0 flex items-center gap-1.5 pl-1 pr-3 py-1 rounded-full text-xs font-semibold text-white"
          style={{ background: copilotBtnBg }}
        >
          <img src={`/assets/copilot/robot_${eossTheme}.png`} alt="" className="w-7 h-7 object-contain" />
          Copilot
        </button>
      </div>

      <div className="xl:flex-1 xl:min-h-0 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px] gap-3">
        <div className="min-w-0 xl:min-h-0 flex flex-col gap-3">
          <FinancialKpis />
          <OrderToDeliveryFlow />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 xl:flex-1 xl:min-h-0">
            <OperationalAttentionCard />
            <div
              className="rounded-2xl border p-4 flex flex-col min-h-0"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <p className="text-sm font-bold text-[var(--text)] mb-2 shrink-0">Quick actions</p>
              {quickActions.length === 0 ? (
                <p className="text-sm text-[var(--text-2)]">No actions for this role.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 xl:flex-1">
                  {quickActions.map(({ icon: Icon, label, path }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => navigate(path)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold border text-left min-h-[44px]"
                      style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--brand)' }}
                    >
                      <Icon size={16} className="flex-shrink-0" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="hidden xl:block min-h-0 h-full">
          <CopilotPanel />
        </div>
      </div>

      {copilotDrawerOpen && (
        <div className="xl:hidden fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md h-full p-4 flex flex-col">
            <CopilotPanel isDrawer onClose={() => setCopilotDrawerOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
