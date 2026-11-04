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
      iconBg: '#DCFCE7', // soft green
      iconColor: '#16A34A',
      path: '/sales',
    },
    {
      id: 'purchases',
      label: 'Purchases',
      value: '₹11.2 L',
      trend: '↑ +12%',
      icon: <ShoppingCart size={15} strokeWidth={2.5} />,
      iconBg: '#F3E8FF', // soft purple
      iconColor: '#9333EA',
      path: '/procurement',
    },
    {
      id: 'stock',
      label: 'Stock Value',
      value: '₹26.9 L',
      icon: <Box size={15} strokeWidth={2.5} />,
      iconBg: '#FFEDD5', // soft orange
      iconColor: '#EA580C',
      path: '/inventory',
    },
    {
      id: 'receivables',
      label: 'Receivables',
      value: '₹6.2 L',
      subtext: '(12 customers)',
      icon: <Users size={15} strokeWidth={2.5} />,
      iconBg: '#DBEAFE', // soft blue
      iconColor: '#2563EB',
      path: '/sales',
    },
    {
      id: 'payables',
      label: 'Payables',
      value: '₹2.9 L',
      subtext: '(due in 7 days)',
      icon: <FileText size={15} strokeWidth={2.5} />,
      iconBg: '#FEE2E2', // soft red
      iconColor: '#DC2626',
      path: '/procurement',
    },
    {
      id: 'profit',
      label: 'Profit',
      value: '₹3.8 L',
      trend: '↑ +28%',
      icon: <Coins size={15} strokeWidth={2.5} />,
      iconBg: '#FEF3C7', // soft gold
      iconColor: '#D97706',
      path: '/reports',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2.5">
      {kpis.map(kpi => (
        <button
          key={kpi.id}
          onClick={() => navigate(kpi.path)}
          className="text-left p-3 rounded-2xl border transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md group flex items-start gap-2.5 cursor-pointer bg-white"
          style={{
            borderColor: 'var(--border, #E5E0F5)',
            boxShadow: 'var(--shadow-card, 0 4px 18px rgba(24, 27, 65, 0.08))',
          }}
          title={`Click to open ${kpi.label} records`}
        >
          {/* Left Icon */}
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform mt-0.5 shadow-2xs"
            style={{ background: kpi.iconBg, color: kpi.iconColor }}
          >
            {kpi.icon}
          </div>

          {/* Right Text Block */}
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-semibold text-gray-500 tracking-normal leading-tight">
              {kpi.label}
            </div>

            <div className="text-[17px] font-black text-gray-900 tracking-tight font-mono whitespace-nowrap mt-0.5">
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
