import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, ShoppingCart, Box, Users, FileText, Coins
} from 'lucide-react';

interface KpiItem {
  id: string;
  label: string;
  value: string;
  subtext?: string;
  trend?: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  iconGlow: string;
  path: string;
}

export default function FinancialKpis() {
  const navigate = useNavigate();

  const kpis: KpiItem[] = [
    {
      id: 'sales',
      label: 'Sales',
      value: '₹18.4 L',
      trend: '↑ +24%',
      icon: <TrendingUp size={15} strokeWidth={2.5} />,
      iconBg: 'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)',
      iconColor: '#16A34A',
      iconGlow: 'rgba(22, 163, 74, 0.2)',
      path: '/sales',
    },
    {
      id: 'purchases',
      label: 'Purchases',
      value: '₹11.2 L',
      trend: '↑ +12%',
      icon: <ShoppingCart size={15} strokeWidth={2.5} />,
      iconBg: 'linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)',
      iconColor: '#9333EA',
      iconGlow: 'rgba(147, 51, 234, 0.2)',
      path: '/procurement',
    },
    {
      id: 'stock',
      label: 'Stock Value',
      value: '₹26.9 L',
      icon: <Box size={15} strokeWidth={2.5} />,
      iconBg: 'linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)',
      iconColor: '#EA580C',
      iconGlow: 'rgba(234, 88, 12, 0.2)',
      path: '/inventory',
    },
    {
      id: 'receivables',
      label: 'Receivables',
      value: '₹6.2 L',
      subtext: '(12 customers)',
      icon: <Users size={15} strokeWidth={2.5} />,
      iconBg: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
      iconColor: '#2563EB',
      iconGlow: 'rgba(37, 99, 235, 0.2)',
      path: '/sales',
    },
    {
      id: 'payables',
      label: 'Payables',
      value: '₹2.9 L',
      subtext: '(due in 7 days)',
      icon: <FileText size={15} strokeWidth={2.5} />,
      iconBg: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
      iconColor: '#DC2626',
      iconGlow: 'rgba(220, 38, 38, 0.2)',
      path: '/procurement',
    },
    {
      id: 'profit',
      label: 'Profit',
      value: '₹3.8 L',
      trend: '↑ +28%',
      icon: <Coins size={15} strokeWidth={2.5} />,
      iconBg: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
      iconColor: '#D97706',
      iconGlow: 'rgba(217, 119, 6, 0.2)',
      path: '/reports',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2.5">
      {kpis.map(kpi => (
        <button
          key={kpi.id}
          onClick={() => navigate(kpi.path)}
          className="text-left p-3.5 rounded-2xl border transition-all duration-150 hover:-translate-y-0.5 group flex items-start gap-2.5 cursor-pointer"
          style={{
            background: 'var(--card-gradient, linear-gradient(180deg, #FFFFFF 0%, #FAF9FE 100%))',
            borderColor: 'var(--border, #E5E0F5)',
            boxShadow: '0 4px 18px -2px rgba(24, 27, 65, 0.06), 0 2px 6px -1px rgba(24, 27, 65, 0.03), inset 0 1px 1px #FFFFFF',
          }}
          title={`Click to open ${kpi.label} records`}
        >
          {/* Left Icon with Glossy Pill */}
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform mt-0.5"
            style={{
              background: kpi.iconBg,
              color: kpi.iconColor,
              boxShadow: `0 2px 8px ${kpi.iconGlow}, inset 0 1px 1px rgba(255, 255, 255, 0.8)`,
            }}
          >
            {kpi.icon}
          </div>

          {/* Right Text Block */}
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-semibold text-gray-500 tracking-normal leading-tight">
              {kpi.label}
            </div>

            <div className="text-[17px] font-extrabold text-gray-900 tracking-tight whitespace-nowrap mt-0.5">
              {kpi.value}
            </div>

            <div className="mt-0.5 text-[10px] leading-tight">
              {kpi.trend ? (
                <span className="font-bold text-emerald-600 whitespace-nowrap">
                  {kpi.trend}
                </span>
              ) : kpi.subtext ? (
                <span className="font-medium text-gray-400 whitespace-nowrap">
                  {kpi.subtext}
                </span>
              ) : null}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
