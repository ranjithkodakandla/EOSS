import React, { useState } from 'react';
import { X, ChevronRight } from 'lucide-react';

export default function BusinessHealthCard() {
  const [showDetail, setShowDetail] = useState(false);
  const healthScore = 92;

  // Semi-circle SVG arc parameters
  // Arc from (20, 75) to (120, 75) with radius 50
  // Arc length = PI * 50 = ~157.08
  const arcLength = Math.PI * 50;
  const strokeDashoffset = arcLength * (1 - healthScore / 100);

  return (
    <>
      <div
        onClick={() => setShowDetail(true)}
        className="p-5 rounded-2xl border flex flex-col justify-between cursor-pointer hover:shadow-md transition-all group bg-white"
        style={{
          borderColor: 'var(--border, #E5E0F5)',
          boxShadow: 'var(--shadow-card, 0 4px 18px rgba(24, 27, 65, 0.08))',
        }}
        title="Click to view detailed Health Breakdown & Cash Flow"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[var(--text-primary, #1A1F36)] tracking-tight">
            Business Health
          </h3>
        </div>

        {/* Center Semi-Circle Gauge */}
        <div className="flex flex-col items-center justify-center my-auto py-1">
          <div className="relative w-[150px] h-[100px] flex items-center justify-center">
            <svg viewBox="0 0 140 90" className="w-full h-full overflow-visible">
              {/* Background Arch Track */}
              <path
                d="M 20 75 A 50 50 0 0 1 120 75"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="11"
                strokeLinecap="round"
              />
              {/* Active Green Health Arc */}
              <path
                d="M 20 75 A 50 50 0 0 1 120 75"
                fill="none"
                stroke="#16A34A"
                strokeWidth="11"
                strokeLinecap="round"
                strokeDasharray={arcLength}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
              />
            </svg>

            {/* Centered Values Below The Arch */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-5">
              <span className="text-2xl font-black tracking-tight text-gray-900 font-mono">
                {healthScore}%
              </span>
              <span className="text-[11px] font-bold text-emerald-600 tracking-wide uppercase -mt-0.5">
                Healthy
              </span>
            </div>
          </div>
        </div>

        {/* Bottom subtle note */}
        <div className="flex items-center justify-center text-[10px] text-gray-400">
          <span>Click for operational factors</span>
        </div>
      </div>

      {/* Health & Cash Flow Modal / Drawer */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full max-w-md rounded-2xl p-6 border shadow-2xl relative bg-white"
            style={{ borderColor: 'var(--border, #E5E0F5)' }}
          >
            <button
              onClick={() => setShowDetail(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                {healthScore}%
              </div>
              <div>
                <h4 className="text-lg font-bold text-[var(--text-primary)]">Operational Health Breakdown</h4>
                <div className="text-xs text-gray-500">Composite deterministic operational telemetry</div>
              </div>
            </div>

            {/* Health Factors */}
            <div className="space-y-2.5 mb-5">
              {[
                { label: 'Orders on track', status: '94% On Schedule', positive: true },
                { label: 'Inventory in control', status: '3 Active Shortages Flagged', positive: false },
                { label: 'QC pass rate', status: '98% First Pass Yield', positive: true },
                { label: 'On-time dispatch', status: '93% Met Promised Delivery', positive: true },
              ].map((factor, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 text-xs"
                >
                  <span className="font-semibold text-gray-800">{factor.label}</span>
                  <span className={`font-medium ${factor.positive ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {factor.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Cash Flow Section */}
            <div className="pt-4 border-t border-gray-100">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                Cash Flow Telemetry (MTD)
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                  <div className="text-[10px] font-semibold text-emerald-700">Inflow</div>
                  <div className="text-sm font-bold text-emerald-800 font-mono mt-0.5">₹22.4 L</div>
                </div>
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-100">
                  <div className="text-[10px] font-semibold text-red-700">Outflow</div>
                  <div className="text-sm font-bold text-red-800 font-mono mt-0.5">₹16.8 L</div>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                  <div className="text-[10px] font-semibold text-blue-700">Net Cash</div>
                  <div className="text-sm font-bold text-blue-800 font-mono mt-0.5">+₹5.6 L</div>
                </div>
              </div>
              <div className="text-[10px] text-gray-400 mt-2 text-center">
                Period: Nov 1 – Nov 30, 2026 · Source: Bank reconciliation seed
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
