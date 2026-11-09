import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, FileInput, PackagePlus, Wrench, ClipboardCheck, Truck } from 'lucide-react';
import { useStore } from '../../store';
import FinancialKpis from '../../components/home/FinancialKpis';
import OrderToDeliveryFlow from '../../components/home/OrderToDeliveryFlow';
import OperationalAttentionCard from '../../components/home/OperationalAttentionCard';
import CopilotPanel from '../../components/copilot/CopilotPanel';
import HomeStrip from '../../components/home/HomeStrip';

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
  const copilotBtnBorder =
    eossTheme === 'graphite'
      ? '1px solid rgba(245, 158, 11, 0.4)'
      : eossTheme === 'ocean'
      ? '1px solid rgba(34, 211, 238, 0.35)'
      : '1px solid rgba(168, 85, 247, 0.35)';
  const copilotBtnShadow =
    eossTheme === 'graphite'
      ? '0 8px 24px -4px rgba(229,138,54,0.45), 0 2px 8px rgba(0,0,0,0.5)'
      : eossTheme === 'ocean'
      ? '0 8px 24px -4px rgba(8,127,140,0.5), 0 2px 8px rgba(0,0,0,0.5)'
      : '0 8px 24px -4px rgba(112,72,245,0.5), 0 2px 8px rgba(0,0,0,0.5)';

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
    <div className="p-3 pb-24 md:p-4 md:pb-24 xl:h-[calc(100vh-70px)] xl:overflow-hidden xl:flex xl:flex-col xl:pb-4">
      <div className="mb-3 shrink-0">
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

      <div className="xl:flex-1 xl:min-h-0 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-3 items-stretch">
        <div className="min-w-0 xl:min-h-0 xl:h-full flex flex-col gap-3">
          <FinancialKpis />
          <OrderToDeliveryFlow />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch shrink-0">
            <OperationalAttentionCard />
            <div
              className="rounded-2xl border p-3 flex flex-col h-full min-h-0"
              style={{ background: 'var(--card-gradient, var(--surface))', borderColor: 'var(--border)' }}
            >
              <p className="text-sm font-bold text-[var(--text)] tracking-tight mb-1 shrink-0">Quick actions</p>
              {quickActions.length === 0 ? (
                <p className="text-sm text-[var(--text-2)]">No actions for this role.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 flex-1">
                  {quickActions.map(({ icon: Icon, label, path }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => navigate(path)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold border text-left min-h-[40px] h-full"
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
          <div className="xl:flex-1 xl:min-h-0 min-h-[148px]">
            <HomeStrip />
          </div>
        </div>

        <div className="hidden xl:flex min-h-0 h-full">
          <CopilotPanel />
        </div>
      </div>

      <div className="xl:hidden fixed bottom-[72px] right-4 z-40">
        <button
          type="button"
          onClick={() => setCopilotDrawerOpen(true)}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-full text-white"
          style={{ background: copilotBtnBg, border: copilotBtnBorder, boxShadow: copilotBtnShadow }}
        >
          <img src="/assets/copilot/robot_aurora.png" alt="" className="w-7 h-7 object-contain" />
          <span className="text-xs font-bold tracking-wide">Copilot</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
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
