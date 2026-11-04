import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useStore } from '../../store';
import FinancialKpis from '../../components/home/FinancialKpis';
import OrderToDeliveryFlow from '../../components/home/OrderToDeliveryFlow';
import YourPrioritiesCard from '../../components/home/YourPrioritiesCard';
import ProductionProgressCard from '../../components/home/ProductionProgressCard';
import BusinessHealthCard from '../../components/home/BusinessHealthCard';
import CopilotPanel from '../../components/copilot/CopilotPanel';

export default function Home() {
  const { currentUser } = useStore();
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
