import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, ShoppingCart, Box, Users, FileText, Coins
} from 'lucide-react';
import { useStore } from '../../store';
import { openReceivables, openPayables, payablesDueWithinDays } from '../../domain/recordLists';

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

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)} K`;
  return `₹${n}`;
}

export default function FinancialKpis() {
  const navigate = useNavigate();
  const { customerInvoices, supplierInvoices, invoices, inventory } = useStore();

  const totalSales = customerInvoices.reduce((s, i) => s + i.amount, 0) + invoices.reduce((s, i) => s + i.totalAmount, 0);
  const totalPurchases = supplierInvoices.reduce((s, i) => s + i.amount, 0);
  const unpaidIn = openReceivables(customerInvoices, invoices);
  const unpaidOut = openPayables(supplierInvoices);
  const totalReceivables = unpaidIn.reduce((s, i) => s + i.outstanding, 0);
  const totalPayables = unpaidOut.reduce((s, i) => s + (i.amount - i.amountPaid), 0);
  const dueInWeek = payablesDueWithinDays(supplierInvoices, 7).length;
  const stockValue = inventory.reduce((s, m) => s + (m.onHandQty * (m.unitCost ?? 120)), 0);
  const profit = totalSales - totalPurchases;

  const kpis: KpiItem[] = [
    {
      id: 'sales',
      label: 'Sales',
      value: fmt(totalSales),
      trend: totalSales > 0 ? '↑ invoiced' : undefined,
      icon: <TrendingUp size={15} strokeWidth={2.5} />,
      iconBg: 'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)',
      iconColor: '#16A34A',
      iconGlow: 'rgba(22, 163, 74, 0.25)',
      path: '/sales',
    },
    {
      id: 'purchases',
      label: 'Purchases',
      value: fmt(totalPurchases),
      trend: totalPurchases > 0 ? '↑ invoiced' : undefined,
      icon: <ShoppingCart size={15} strokeWidth={2.5} />,
      iconBg: 'linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)',
      iconColor: '#9333EA',
      iconGlow: 'rgba(147, 51, 234, 0.25)',
      path: '/procurement',
    },
    {
      id: 'stock',
      label: 'Stock Value',
      value: fmt(stockValue),
      icon: <Box size={15} strokeWidth={2.5} />,
      iconBg: 'linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)',
      iconColor: '#EA580C',
      iconGlow: 'rgba(234, 88, 12, 0.25)',
      path: '/inventory',
    },
    {
      id: 'receivables',
      label: 'Receivables',
      value: fmt(totalReceivables),
      subtext: `(${unpaidIn.length} invoices)`,
      icon: <Users size={15} strokeWidth={2.5} />,
      iconBg: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
      iconColor: '#2563EB',
      iconGlow: 'rgba(37, 99, 235, 0.25)',
      path: '/finance?tab=receivables&open=1',
    },
    {
      id: 'payables',
      label: 'Payables',
      value: fmt(totalPayables),
      subtext: dueInWeek > 0 ? `(${dueInWeek} due this week)` : undefined,
      icon: <FileText size={15} strokeWidth={2.5} />,
      iconBg: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
      iconColor: '#DC2626',
      iconGlow: 'rgba(220, 38, 38, 0.25)',
      path: dueInWeek > 0 ? '/finance?tab=payables&due=week' : '/finance?tab=payables&open=1',
    },
    {
      id: 'profit',
      label: 'Profit',
      value: fmt(Math.max(0, profit)),
      trend: profit > 0 ? `↑ margin` : profit < 0 ? '↓ loss' : undefined,
      icon: <Coins size={15} strokeWidth={2.5} />,
      iconBg: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
      iconColor: '#D97706',
      iconGlow: 'rgba(217, 119, 6, 0.25)',
      path: '/finance?tab=overview',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2">
      {kpis.map(kpi => (
        <button
          key={kpi.id}
          onClick={() => navigate(kpi.path)}
          className="text-left px-2.5 py-2 rounded-2xl border transition-all duration-150 hover:-translate-y-0.5 group flex items-start gap-2 cursor-pointer min-w-0"
          style={{
            background: 'var(--card-gradient, linear-gradient(180deg, #FFFFFF 0%, #FAF9FE 100%))',
            borderColor: 'var(--border, #E5E0F5)',
            boxShadow: '0 4px 18px -2px rgba(24, 27, 65, 0.06), 0 2px 6px -1px rgba(24, 27, 65, 0.03), inset 0 1px 1px #FFFFFF',
          }}
          title={`Click to open ${kpi.label} records`}
        >
          {/* Left Icon with Glossy Squircle Pill */}
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform mt-0.5"
            style={{
              background: kpi.iconBg,
              color: kpi.iconColor,
              boxShadow: `0 2px 8px ${kpi.iconGlow}, inset 0 1px 1px rgba(255, 255, 255, 0.8)`,
            }}
          >
            {kpi.icon}
          </div>

          {/* Right Text Block with Perfect Proportions */}
          <div className="flex-1 min-w-0">
            <div className="text-[10.5px] font-semibold text-[var(--text-2)] tracking-tight leading-tight whitespace-nowrap">
              {kpi.label}
            </div>

            <div className="text-[15px] xl:text-[16px] font-extrabold text-[var(--text)] tracking-tight whitespace-nowrap mt-0.5 leading-tight">
              {kpi.value}
            </div>

            <div className="mt-0.5 text-[9.5px] leading-tight">
              {kpi.trend ? (
                <span className="font-bold text-emerald-600 whitespace-nowrap">
                  {kpi.trend}
                </span>
              ) : kpi.subtext ? (
                <span className="font-medium text-[var(--text-3)] whitespace-nowrap">
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
