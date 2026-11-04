import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target, FileText, ShoppingCart, Settings, ShieldCheck,
  Truck, ArrowRight, ChevronDown
} from 'lucide-react';
import { useStore } from '../../store';

interface ProcessStep {
  id: string;
  name: string;
  count: string;
  countColor: string;
  countSize?: string;
  icon: React.ReactNode;
  bg: string;
  borderColor: string;
  glowColor: string;
  badge?: {
    type: 'alert' | 'success';
    icon: React.ReactNode;
  };
  path: string;
}

export default function OrderToDeliveryFlow() {
  const navigate = useNavigate();
  const { eossTheme } = useStore();
  const [timeRange, setTimeRange] = useState('This Week');
  const [timeMenuOpen, setTimeMenuOpen] = useState(false);

  // Operational metrics matching reference specification
  const openSales = 12;
  const shortageCount = 3;
  const inProgressJobs = 4;
  const pendingQC = 2;
  const readyDispatch = 6;

  // Badge gradient adapting precisely by active theme
  const flowBadgeBg =
    eossTheme === 'graphite'
      ? 'linear-gradient(135deg, #E58A36 0%, #F59E0B 100%)'
      : eossTheme === 'ocean'
      ? 'linear-gradient(135deg, #0284C7 0%, #0D9488 100%)'
      : 'linear-gradient(135deg, #7048F5 0%, #845EF7 100%)';

  const flowBadgeShadow =
    eossTheme === 'graphite'
      ? '0 2px 8px -1px rgba(229, 138, 54, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.5)'
      : eossTheme === 'ocean'
      ? '0 2px 8px -1px rgba(8, 127, 140, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.5)'
      : '0 2px 8px -1px rgba(112, 72, 245, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.5)';

  const steps: ProcessStep[] = [
    {
      id: 'sales-orders',
      name: 'Sales Orders',
      count: `${openSales}`,
      countColor: '#4338CA',
      countSize: 'text-[17px] font-bold',
      icon: <FileText size={17} className="text-purple-600" />,
      bg: 'linear-gradient(180deg, #FAF8FF 0%, #EDE9FE 100%)',
      borderColor: '#DDD6FE',
      glowColor: 'rgba(112, 72, 245, 0.08)',
      path: '/sales',
    },
    {
      id: 'material',
      name: 'Material',
      count: `${shortageCount} Shortages`,
      countColor: '#EA580C',
      countSize: 'text-[13px] font-bold',
      icon: <ShoppingCart size={17} className="text-orange-600" />,
      bg: 'linear-gradient(180deg, #FFF9F5 0%, #FFEDD5 100%)',
      borderColor: '#FED7AA',
      glowColor: 'rgba(234, 88, 12, 0.08)',
      badge: {
        type: 'alert',
        icon: (
          <span className="w-4 h-4 bg-orange-500 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-sm ring-2 ring-white">
            !
          </span>
        ),
      },
      path: '/inventory',
    },
    {
      id: 'production',
      name: 'Production',
      count: `${inProgressJobs} In Progress`,
      countColor: '#2563EB',
      countSize: 'text-[13px] font-bold',
      icon: <Settings size={17} className="text-blue-600" />,
      bg: 'linear-gradient(180deg, #F5FAFF 0%, #DBEAFE 100%)',
      borderColor: '#BFDBFE',
      glowColor: 'rgba(37, 99, 235, 0.08)',
      path: '/jobs',
    },
    {
      id: 'quality',
      name: 'Quality',
      count: `${pendingQC} Pending`,
      countColor: '#D97706',
      countSize: 'text-[13px] font-bold',
      icon: <ShieldCheck size={17} className="text-amber-600" />,
      bg: 'linear-gradient(180deg, #FFFCF2 0%, #FEF3C7 100%)',
      borderColor: '#FDE68A',
      glowColor: 'rgba(217, 119, 6, 0.08)',
      path: '/quality',
    },
    {
      id: 'dispatch',
      name: 'Dispatch',
      count: `${readyDispatch} Ready`,
      countColor: '#16A34A',
      countSize: 'text-[13px] font-bold',
      icon: <Truck size={17} className="text-emerald-600" />,
      bg: 'linear-gradient(180deg, #F3FDF7 0%, #DCFCE7 100%)',
      borderColor: '#BBF7D0',
      glowColor: 'rgba(22, 163, 74, 0.08)',
      badge: {
        type: 'success',
        icon: (
          <span className="w-4 h-4 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-sm ring-2 ring-white">
            ✓
          </span>
        ),
      },
      path: '/dispatch',
    },
  ];

  return (
    <div
      className="p-5 rounded-2xl border"
      style={{
        background: 'var(--card-gradient, linear-gradient(180deg, #FFFFFF 0%, #FAF9FE 100%))',
        borderColor: 'var(--border, #E5E0F5)',
        boxShadow: '0 4px 20px -2px rgba(24, 27, 65, 0.06), 0 2px 6px -1px rgba(24, 27, 65, 0.03), inset 0 1px 0 #FFFFFF',
      }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shadow-2xs"
            style={{
              background: 'var(--brand-soft, #EEE9FF)',
              color: 'var(--brand-primary, #7048F5)',
            }}
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
          {/* Orders in Flow Pill with Glossy Style */}
          <span
            className="text-xs font-bold text-white px-3.5 py-1.5 rounded-full select-none"
            style={{
              background: flowBadgeBg,
              boxShadow: flowBadgeShadow,
            }}
          >
            Orders in Flow ({openSales})
          </span>

          {/* Time Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setTimeMenuOpen(o => !o)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold bg-white text-[var(--text-primary)] hover:border-[var(--brand-primary)] transition-colors shadow-2xs cursor-pointer"
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
                      className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-[var(--surface-muted)] font-medium text-[var(--text-primary)] cursor-pointer"
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

      {/* Horizontal Steps Container — Strictly Uniform 104px Height, Exact Equal Width, Zero Baseline Jumps */}
      <div className="overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center min-w-[680px] justify-between gap-1.5 md:gap-2">
          {steps.map((step, idx) => (
            <React.Fragment key={step.id}>
              {/* Step Card: Exactly 104px tall, identical flex width, centered vertical alignment */}
              <button
                onClick={() => navigate(step.path)}
                className="flex-1 min-w-0 h-[104px] rounded-2xl border transition-all duration-150 hover:-translate-y-0.5 group relative cursor-pointer flex flex-col items-center justify-between py-3 px-1 text-center"
                style={{
                  background: step.bg,
                  borderColor: step.borderColor,
                  boxShadow: `0 4px 14px -2px ${step.glowColor}, inset 0 1px 1px #FFFFFF`,
                }}
                title={`View ${step.name} (${step.count})`}
              >
                {/* Badge if present */}
                {step.badge && (
                  <div className="absolute -top-1.5 -right-1.5 z-10">
                    {step.badge.icon}
                  </div>
                )}

                {/* Centered Icon Pill */}
                <div className="w-8 h-8 rounded-xl bg-white shadow-2xs flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  {step.icon}
                </div>

                {/* Stage Label */}
                <div className="text-[11px] font-semibold text-gray-500 tracking-normal leading-tight whitespace-nowrap">
                  {step.name}
                </div>

                {/* Value Count — Proportional Sans Font strictly matching reference */}
                <div
                  className={`${step.countSize || 'text-[13px] font-bold'} tracking-tight whitespace-nowrap leading-tight`}
                  style={{ color: step.countColor }}
                >
                  {step.count}
                </div>
              </button>

              {/* Connecting Arrow: Centered vertically */}
              {idx < steps.length - 1 && (
                <div className="flex-shrink-0 px-0.5 text-blue-500 flex items-center justify-center">
                  <ArrowRight size={16} strokeWidth={2.5} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
