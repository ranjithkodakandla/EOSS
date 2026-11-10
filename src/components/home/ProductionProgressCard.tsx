import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, ArrowRight } from 'lucide-react';

interface OrderProgress {
  orderId: string;
  jobId: string;
  progress: number;
  barColor: string;
}

export default function ProductionProgressCard() {
  const navigate = useNavigate();

  const orders: OrderProgress[] = [
    { orderId: 'SO-1245', jobId: 'job-101', progress: 60, barColor: 'linear-gradient(90deg, #22C55E 0%, #16A34A 100%)' },
    { orderId: 'SO-1246', jobId: 'job-105', progress: 35, barColor: 'linear-gradient(90deg, #A855F7 0%, #9333EA 100%)' },
    { orderId: 'SO-1247', jobId: 'job-107', progress: 90, barColor: 'linear-gradient(90deg, #22C55E 0%, #16A34A 100%)' },
  ];

  return (
    <div
      className="p-5 rounded-2xl border flex flex-col justify-between"
      style={{
        background: 'var(--card-gradient, linear-gradient(180deg, #FFFFFF 0%, #FAF9FE 100%))',
        borderColor: 'var(--border, #E5E0F5)',
        boxShadow: '0 4px 20px -2px rgba(24, 27, 65, 0.06), 0 2px 6px -1px rgba(24, 27, 65, 0.04), inset 0 1px 1px #FFFFFF',
      }}
    >
      {/* Header — Orange Bar Chart Icon directly beside text (No Box) strictly matching reference */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="text-orange-500 flex items-center justify-center">
            <BarChart3 size={19} strokeWidth={2.5} />
          </div>
          <h3 className="text-base font-bold text-[var(--text)] tracking-tight">
            Production Progress
          </h3>
        </div>

        <button
          onClick={() => navigate('/jobs')}
          className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1 group cursor-pointer"
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
            className="flex items-center gap-3 p-1 rounded-lg hover:bg-white/80 hover:shadow-2xs cursor-pointer group transition-all"
            title={`View Job for ${order.orderId}`}
          >
            <span className="text-xs sm:text-[13px] font-bold text-[var(--text)] w-16 flex-shrink-0 group-hover:text-[var(--brand)]">
              {order.orderId}
            </span>

            {/* Smooth Rounded Progress Track */}
            <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden shadow-inner">
              <div
                className="h-full rounded-full transition-all duration-500 shadow-2xs"
                style={{
                  width: `${order.progress}%`,
                  background: order.barColor,
                }}
              />
            </div>

            <span className="text-xs sm:text-[13px] font-bold text-gray-800 w-9 text-right flex-shrink-0">
              {order.progress}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
