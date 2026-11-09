import React from 'react';

const FACTORS = [
  { label: 'Orders on track', status: '94%' },
  { label: 'Inventory', status: '3 short' },
  { label: 'QC pass rate', status: '98%' },
  { label: 'On-time dispatch', status: '93%' },
];

export default function BusinessHealthCard() {
  return (
    <div
      className="p-4 rounded-2xl border flex flex-col"
      style={{
        background: 'var(--card-gradient, linear-gradient(180deg, #FFFFFF 0%, #FAF9FE 100%))',
        borderColor: 'var(--border, #E5E0F5)',
        boxShadow: '0 4px 20px -2px rgba(24, 27, 65, 0.06)',
      }}
    >
      <div className="flex items-baseline justify-between gap-2 mb-2">
        <h3 className="text-base font-bold text-[var(--text)] tracking-tight">Business Health</h3>
        <span className="text-sm font-bold text-emerald-600">92% healthy</span>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2">
        {FACTORS.map(factor => (
          <div key={factor.label}>
            <div className="text-[11px] text-[var(--text-2)]">{factor.label}</div>
            <div className="text-sm font-semibold text-[var(--text)]">{factor.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
