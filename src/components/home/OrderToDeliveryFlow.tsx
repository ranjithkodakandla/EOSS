import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, ShoppingCart, Settings, ShieldCheck,
  Truck, ArrowRight, Workflow
} from 'lucide-react';

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

  // Operational metrics matching reference specification
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
      countColor: '#4338CA',
      countSize: 'text-[15px] sm:text-[16px] font-extrabold',
      icon: <FileText size={20} className="text-purple-600" />,
      bg: 'linear-gradient(180deg, #FAF8FF 0%, #EDE9FE 100%)',
      borderColor: 'var(--brand-light, #DDD6FE)',
      glowColor: 'rgba(112, 72, 245, 0.08)',
      path: '/sales',
    },
    {
      id: 'material',
      name: 'Material',
      count: `${shortageCount} Shortages`,
      countColor: '#EA580C',
      countSize: 'text-[11.5px] sm:text-[12.5px] font-bold',
      icon: <ShoppingCart size={20} className="text-orange-600" />,
      bg: 'linear-gradient(180deg, #FFF9F5 0%, #FFEDD5 100%)',
      borderColor: 'var(--warning-light, #FED7AA)',
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
      countSize: 'text-[11.5px] sm:text-[12.5px] font-bold',
      icon: <Settings size={20} className="text-blue-600" />,
      bg: 'linear-gradient(180deg, #F5FAFF 0%, #DBEAFE 100%)',
      borderColor: 'var(--info-light, #BFDBFE)',
      glowColor: 'rgba(37, 99, 235, 0.08)',
      path: '/jobs',
    },
    {
      id: 'quality',
      name: 'Quality',
      count: `${pendingQC} Pending`,
      countColor: '#D97706',
      countSize: 'text-[11.5px] sm:text-[12.5px] font-bold',
      icon: <ShieldCheck size={20} className="text-amber-600" />,
      bg: 'linear-gradient(180deg, #FFFCF2 0%, #FEF3C7 100%)',
      borderColor: 'var(--warning-pale, #FDE68A)',
      glowColor: 'rgba(217, 119, 6, 0.08)',
      path: '/quality',
    },
    {
      id: 'dispatch',
      name: 'Dispatch',
      count: `${readyDispatch} Ready`,
      countColor: '#16A34A',
      countSize: 'text-[11.5px] sm:text-[12.5px] font-bold',
      icon: <Truck size={20} className="text-emerald-600" />,
      bg: 'linear-gradient(180deg, #F3FDF7 0%, #DCFCE7 100%)',
      borderColor: 'var(--success-light, #BBF7D0)',
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
      className="p-4 sm:p-5 rounded-2xl border"
      style={{
        background: 'var(--card-gradient, linear-gradient(180deg, #FFFFFF 0%, #FAF9FE 100%))',
        borderColor: 'var(--border)',
        boxShadow: '0 4px 20px -2px rgba(24, 27, 65, 0.06), 0 2px 6px -1px rgba(24, 27, 65, 0.03), inset 0 1px 0 #FFFFFF',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="text-[var(--brand)] flex items-center justify-center">
          <Workflow size={18} strokeWidth={2.5} />
        </div>
        <h2 className="text-base font-bold text-[var(--text)] tracking-tight">
          Order to Delivery
        </h2>
      </div>

      <div className="sm:hidden space-y-1.5">
        {steps.map(step => (
          <button
            key={step.id}
            type="button"
            onClick={() => navigate(step.path)}
            className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border text-left"
            style={{ background: step.bg, borderColor: step.borderColor }}
          >
            <span className="text-sm font-medium text-[var(--text)]">{step.name}</span>
            <span className="text-sm font-bold whitespace-nowrap" style={{ color: step.countColor }}>{step.count}</span>
          </button>
        ))}
      </div>

      {/* Process Boxes: desktop flow */}
      <div className="hidden sm:flex w-full items-center justify-between gap-2">
        {steps.map((step, idx) => (
          <React.Fragment key={step.id}>
            {/* Step Card: 105px on mobile to prevent squishing, flex-1 on tablet/desktop */}
            <button
              onClick={() => navigate(step.path)}
              className="flex-shrink-0 sm:flex-shrink sm:flex-1 min-w-[105px] sm:min-w-0 h-[82px] rounded-2xl border transition-all duration-150 hover:-translate-y-0.5 group relative cursor-pointer flex flex-col items-center justify-between py-2 px-1.5 text-center"
              style={{
                background: step.bg,
                borderColor: step.borderColor,
                boxShadow: `0 3px 12px -2px ${step.glowColor}, inset 0 1px 1px #FFFFFF`,
              }}
              title={`View ${step.name} (${step.count})`}
            >
              {/* Badge if present (Material alert, Dispatch checkmark) */}
              {step.badge && (
                <div className="absolute -top-1.5 -right-1.5 z-10">
                  {step.badge.icon}
                </div>
              )}

              {/* Clean Icon placed directly at the top (No box) */}
              <div className="group-hover:scale-105 transition-transform flex items-center justify-center pt-0.5">
                {step.icon}
              </div>

              {/* Stage Label */}
              <div className="text-[10px] sm:text-[11px] font-medium text-gray-600 tracking-tight leading-tight whitespace-nowrap">
                {step.name}
              </div>

              {/* Value Count — Proportional Typography */}
              <div
                className={`${step.countSize || 'text-xs font-bold'} tracking-tight whitespace-nowrap leading-tight`}
                style={{ color: step.countColor }}
              >
                {step.count}
              </div>
            </button>

            {/* Connecting Arrow */}
            {idx < steps.length - 1 && (
              <div className="flex-shrink-0 text-blue-500 flex items-center justify-center px-0.5">
                <ArrowRight size={14} strokeWidth={2.5} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
