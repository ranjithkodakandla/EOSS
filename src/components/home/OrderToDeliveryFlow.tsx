import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target, FileText, ShoppingCart, Settings, ShieldCheck,
  Truck, ArrowRight, AlertCircle, CheckCircle, ChevronDown
} from 'lucide-react';
import { useStore } from '../../store';

interface ProcessStep {
  id: string;
  name: string;
  count: string;
  countColor?: string;
  icon: React.ReactNode;
  bg: string;
  borderColor: string;
  badge?: {
    type: 'alert' | 'success';
    icon: React.ReactNode;
  };
  path: string;
}

export default function OrderToDeliveryFlow() {
  const navigate = useNavigate();
  const { jobs, inventory, dispatches, inspections } = useStore();
  const [timeRange, setTimeRange] = useState('This Week');
  const [timeMenuOpen, setTimeMenuOpen] = useState(false);

  // Seeded / Aligned baseline counts
  const openSales = 12;
  const shortageCount = 3;
  const inProgressJobs = 4;
  const pendingQC = 2;
  const readyDispatch = 6;

  const steps: ProcessStep[] = [
    {
      id: 'sales-orders',
      name: 'Sales Orders',
      count: `${openSales}`,
      icon: <FileText size={20} className="text-purple-600" />,
      bg: '#F5F3FF',
      borderColor: '#DDD6FE',
      path: '/sales',
    },
    {
      id: 'material',
      name: 'Material',
      count: `${shortageCount} Shortages`,
      countColor: '#EA580C',
      icon: <ShoppingCart size={20} className="text-orange-600" />,
      bg: '#FFF7ED',
      borderColor: '#FED7AA',
      badge: {
        type: 'alert',
        icon: <span className="w-4 h-4 bg-orange-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">!</span>,
      },
      path: '/inventory',
    },
    {
      id: 'production',
      name: 'Production',
      count: `${inProgressJobs} In Progress`,
      countColor: '#2563EB',
      icon: <Settings size={20} className="text-blue-600 animate-spin-slow" />,
      bg: '#EFF6FF',
      borderColor: '#BFDBFE',
      path: '/jobs',
    },
    {
      id: 'quality',
      name: 'Quality',
      count: `${pendingQC} Pending`,
      countColor: '#D97706',
      icon: <ShieldCheck size={20} className="text-amber-600" />,
      bg: '#FFFBEB',
      borderColor: '#FDE68A',
      path: '/quality',
    },
    {
      id: 'dispatch',
      name: 'Dispatch',
      count: `${readyDispatch} Ready`,
      countColor: '#16A34A',
      icon: <Truck size={20} className="text-emerald-600" />,
      bg: '#F0FDF4',
      borderColor: '#BBF7D0',
      badge: {
        type: 'success',
        icon: <span className="w-4 h-4 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">✓</span>,
      },
      path: '/dispatch',
    },
  ];

  return (
    <div
      className="p-5 rounded-2xl border transition-all duration-150"
      style={{
        background: 'var(--surface, #FFFFFF)',
        borderColor: 'var(--border, #E5E0F5)',
        boxShadow: 'var(--shadow-card, 0 4px 18px rgba(24, 27, 65, 0.08))',
      }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--brand-soft, #EEE9FF)', color: 'var(--brand-primary, #7048F5)' }}
          >
            <Target size={18} />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-bold text-[var(--text-primary, #1A1F36)] tracking-tight">
              Order to Delivery
            </h2>
            <div className="text-[11px] text-[var(--text-secondary, #626A84)]">
              Operational shop floor sequence & throughput
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Orders in Flow Pill */}
          <span
            className="text-xs font-bold text-white px-3 py-1.5 rounded-full shadow-sm select-none"
            style={{
              background: 'linear-gradient(135deg, var(--brand-primary, #7048F5), var(--brand-secondary, #A855F7))',
            }}
          >
            Orders in Flow ({openSales})
          </span>

          {/* Time Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setTimeMenuOpen(o => !o)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold bg-white text-[var(--text-primary)] hover:border-[var(--brand-primary)] transition-colors shadow-2xs"
              style={{ borderColor: 'var(--border, #E5E0F5)' }}
            >
              <span>{timeRange}</span>
              <ChevronDown size={12} className="text-[var(--text-secondary)]" />
            </button>

            {timeMenuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setTimeMenuOpen(false)} />
                <div
                  className="absolute right-0 mt-1.5 w-36 rounded-xl border bg-white shadow-lg z-40 p-1 text-xs"
                  style={{ borderColor: 'var(--border)' }}
                >
                  {['Today', 'This Week', 'This Month', 'All Active'].map(range => (
                    <button
                      key={range}
                      onClick={() => {
                        setTimeRange(range);
                        setTimeMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-[var(--surface-muted)] font-medium text-[var(--text-primary)]"
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Horizontal Steps Container */}
      <div className="overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center min-w-[700px] justify-between gap-2">
          {steps.map((step, idx) => (
            <React.Fragment key={step.id}>
              {/* Step Card */}
              <button
                onClick={() => navigate(step.path)}
                className="flex-1 text-center p-3.5 rounded-xl border transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md group relative cursor-pointer"
                style={{
                  background: step.bg,
                  borderColor: step.borderColor,
                }}
                title={`View ${step.name} (${step.count})`}
              >
                {/* Badge if present */}
                {step.badge && (
                  <div className="absolute -top-1.5 -right-1.5 shadow-sm">
                    {step.badge.icon}
                  </div>
                )}

                <div className="flex justify-center mb-1.5">
                  <div className="p-1.5 rounded-lg bg-white/80 shadow-2xs group-hover:scale-110 transition-transform">
                    {step.icon}
                  </div>
                </div>

                <div className="text-[12px] font-semibold text-[var(--text-secondary, #626A84)] tracking-normal">
                  {step.name}
                </div>

                <div
                  className="text-base font-extrabold mt-1 tracking-tight font-mono"
                  style={{ color: step.countColor || 'var(--text-primary, #1A1F36)' }}
                >
                  {step.count}
                </div>
              </button>

              {/* Connecting Arrow */}
              {idx < steps.length - 1 && (
                <div className="flex-shrink-0 px-1 text-blue-500/70">
                  <ArrowRight size={18} strokeWidth={2.5} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
