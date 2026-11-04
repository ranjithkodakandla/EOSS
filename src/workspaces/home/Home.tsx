import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ShoppingCart, FileInput, PackagePlus, Wrench, ClipboardCheck, Truck } from 'lucide-react';
import { useStore } from '../../store';
import FinancialKpis from '../../components/home/FinancialKpis';
import OrderToDeliveryFlow from '../../components/home/OrderToDeliveryFlow';
import YourPrioritiesCard from '../../components/home/YourPrioritiesCard';
import ProductionProgressCard from '../../components/home/ProductionProgressCard';
import BusinessHealthCard from '../../components/home/BusinessHealthCard';
import CopilotPanel from '../../components/copilot/CopilotPanel';

const QUICK_ACTIONS = [
  { icon: ShoppingCart, label: 'Create Sales Order', path: '/sales', roles: ['owner', 'sales'] },
  { icon: FileInput, label: 'Create Purchase Request', path: '/procurement', roles: ['owner', 'buyer'] },
  { icon: PackagePlus, label: 'Receive Stock', path: '/procurement', roles: ['owner', 'storekeeper', 'buyer'] },
  { icon: Wrench, label: 'Update Job', path: '/jobs', roles: ['owner', 'supervisor', 'operator'] },
  { icon: ClipboardCheck, label: 'Record Inspection', path: '/quality', roles: ['owner', 'qc', 'supervisor'] },
  { icon: Truck, label: 'Plan Dispatch', path: '/dispatch', roles: ['owner', 'dispatch', 'sales'] },
];

export default function Home() {
  const { currentUser } = useStore();
  const navigate = useNavigate();
  const [copilotDrawerOpen, setCopilotDrawerOpen] = useState(false);

  // Fallback to 'Ranjith' if owner demo or display name
  const nameParts = currentUser?.name ? currentUser.name.trim().split(' ') : ['Ranjith'];
  const firstName = nameParts[0] || 'Ranjith';

  return (
    <div className="p-4 md:p-6 lg:p-7 max-w-[1720px] mx-auto select-none">
      {/* Top Greeting */}
      <div className="mb-4 md:mb-5">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--text-primary, #1A1F36)] flex items-center gap-2">
          <span>{`Good Evening, ${firstName}`}</span>
          <span className="text-2xl">👋</span>
        </h1>
        <p className="text-sm md:text-base text-[var(--text-secondary, #626A84)] mt-1 font-normal">
          Here's how your business is doing this month.
        </p>
      </div>

      {/* Main Two-Zone Responsive Split */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] 2xl:grid-cols-[1fr_380px] gap-5 items-stretch">
        {/* Left Column: Dashboard Intelligence Workspace */}
        <div className="space-y-4 md:space-y-5 min-w-0 flex flex-col justify-between">
          {/* Row 1: Single KPI Row — Financial & Working Capital */}
          <FinancialKpis />

          {/* Row 2: Order to Delivery Operational Flow */}
          <OrderToDeliveryFlow />

          {/* Row 3: Priorities, Production Progress, and Business Health */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <YourPrioritiesCard />
            <ProductionProgressCard />
            <BusinessHealthCard />
          </div>

          {/* Quick Actions Strip — role-filtered, no filler */}
          {(() => {
            const visible = QUICK_ACTIONS.filter(a => a.roles.includes(currentUser.role));
            if (visible.length === 0) return null;
            return (
              <div
                className="rounded-2xl border px-4 py-3"
                style={{
                  background: 'var(--surface, #FFFFFF)',
                  borderColor: 'var(--border, #E5E7EB)',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                <p className="text-[11px] font-semibold text-[var(--text-secondary,#626A84)] uppercase tracking-wider mb-2.5">Quick Actions</p>
                <div className="flex flex-wrap gap-2">
                  {visible.map(({ icon: Icon, label, path }) => (
                    <button
                      key={label}
                      onClick={() => navigate(path)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:-translate-y-0.5 hover:shadow-sm cursor-pointer"
                      style={{
                        background: 'var(--surface-muted, #F8F9FC)',
                        borderColor: 'var(--border, #E5E7EB)',
                        color: 'var(--brand, #7048F5)',
                      }}
                    >
                      <Icon size={14} />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Right Column: EOSS Copilot (Desktop Persistent) */}
        <div className="hidden xl:flex flex-col h-full min-h-[480px]">
          <CopilotPanel />
        </div>
      </div>

      {/* Floating Copilot Button for Mobile and Tablet (< 1280px) */}
      <div className="xl:hidden fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setCopilotDrawerOpen(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-full text-white shadow-xl hover:scale-105 transition-transform cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, var(--copilot-start, #4C1D95), var(--copilot-end, #A855F7))',
          }}
        >
          <Sparkles size={17} />
          <span className="text-xs font-bold tracking-wide">EOSS Copilot</span>
        </button>
      </div>

      {/* Mobile/Tablet Copilot Slide-Over Sheet */}
      {copilotDrawerOpen && (
        <div className="xl:hidden fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md h-full p-4 flex flex-col">
            <CopilotPanel isDrawer onClose={() => setCopilotDrawerOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
