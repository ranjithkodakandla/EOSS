import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart2, ArrowRight } from 'lucide-react';

interface OrderProgress {
  orderId: string;
  jobId: string;
  progress: number;
  barColor: string;
}

export default function ProductionProgressCard() {
  const navigate = useNavigate();

  const orders: OrderProgress[] = [
    { orderId: 'SO-1245', jobId: 'J-101', progress: 60, barColor: '#16A34A' }, // green
    { orderId: 'SO-1246', jobId: 'J-102', progress: 35, barColor: '#A855F7' }, // purple
    { orderId: 'SO-1247', jobId: 'J-103', progress: 90, barColor: '#16A34A' }, // green
  ];

  return (
    <div
      className="p-5 rounded-2xl border flex flex-col justify-between bg-white"
      style={{
        borderColor: 'var(--border, #E5E0F5)',
        boxShadow: 'var(--shadow-card, 0 4px 18px rgba(24, 27, 65, 0.08))',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--brand-soft, #EEE9FF)', color: 'var(--brand-primary, #7048F5)' }}
          >
            <BarChart2 size={16} />
          </div>
          <h3 className="text-base font-bold text-[var(--text-primary, #1A1F36)] tracking-tight">
            Production Progress
          </h3>
        </div>

        <button
          onClick={() => navigate('/jobs')}
          className="text-xs font-bold text-[var(--brand-primary, #7048F5)] hover:underline flex items-center gap-1 group cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Rows */}
      <div className="space-y-3 flex-1 justify-center flex flex-col">
        {orders.map(order => (
          <div
            key={order.orderId}
            onClick={() => navigate(`/jobs/${order.jobId}`)}
            className="flex items-center gap-3 p-1 rounded-lg hover:bg-[var(--surface-muted, #F3F0FF)] cursor-pointer group transition-colors"
            title={`View Job for ${order.orderId}`}
          >
            <span className="font-mono text-xs md:text-sm font-bold text-gray-800 w-16 flex-shrink-0 group-hover:text-[var(--brand-primary)]">
              {order.orderId}
            </span>

            {/* Progress Track */}
            <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 shadow-2xs"
                style={{
                  width: `${order.progress}%`,
                  background: order.barColor,
                }}
              />
            </div>

            <span className="font-mono text-xs md:text-sm font-bold text-gray-800 w-9 text-right flex-shrink-0">
              {order.progress}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
