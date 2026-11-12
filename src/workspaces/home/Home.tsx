import React, { useState } from 'react';
import { useStore } from '../../store';
import FinancialKpis from '../../components/home/FinancialKpis';
import OrderToDeliveryFlow from '../../components/home/OrderToDeliveryFlow';
import OperationalAttentionCard from '../../components/home/OperationalAttentionCard';
import WaitingOnMeCard from '../../components/home/WaitingOnMeCard';
import HomeStrip from '../../components/home/HomeStrip';
import CopilotPanel from '../../components/copilot/CopilotPanel';

function getLocalGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Home() {
  const { currentUser, approvalRequests } = useStore();
  const [mobileTab, setMobileTab] = useState<'today' | 'inbox'>('today');

  const nameParts = currentUser?.name ? currentUser.name.trim().split(' ') : ['Ranjith'];
  const firstName = nameParts[0] || 'Ranjith';
  const greeting = getLocalGreeting();
  const pendingCount = approvalRequests.filter(a => a.status === 'pending').length;

  return (
    <div className="p-3 pb-20 md:px-5 md:py-3 space-y-3">
      {/* 1. Greeting row (single line) */}
      <h1 className="text-lg md:text-xl font-extrabold tracking-tight text-[var(--text)] leading-tight">
        {`${greeting}, ${firstName}`}
      </h1>

      {/* 2. KPI row (4 tiles) */}
      <FinancialKpis />

      {/* 3. Today + Inbox (tabs on mobile <768px, equal side-by-side cards on desktop) */}
      <div className="md:hidden">
        <div className="inline-flex rounded-xl border p-0.5 mb-2" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <button
            type="button"
            onClick={() => setMobileTab('today')}
            className="px-3 py-1 rounded-lg text-xs font-semibold transition-colors"
            style={{
              background: mobileTab === 'today' ? 'var(--brand-fill)' : 'transparent',
              color: mobileTab === 'today' ? '#FFFFFF' : 'var(--text-2)',
            }}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('inbox')}
            className="px-3 py-1 rounded-lg text-xs font-semibold transition-colors"
            style={{
              background: mobileTab === 'inbox' ? 'var(--brand-fill)' : 'transparent',
              color: mobileTab === 'inbox' ? '#FFFFFF' : 'var(--text-2)',
            }}
          >
            Inbox ({pendingCount})
          </button>
        </div>
        {mobileTab === 'today' ? <OperationalAttentionCard /> : <WaitingOnMeCard />}
      </div>

      <div className="hidden md:grid md:grid-cols-2 gap-4 items-stretch">
        <OperationalAttentionCard />
        <WaitingOnMeCard />
      </div>

      {/* 4. Order to Delivery slim strip */}
      <OrderToDeliveryFlow />

      {/* 5. This week dispatch view */}
      <HomeStrip />

      {/* Compact Ask bar below This week */}
      <CopilotPanel />
    </div>
  );
}
