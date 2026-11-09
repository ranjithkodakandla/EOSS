import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const PRIORITIES = [
  { id: 'pr-1', title: 'Approve 2 purchase requests (₹4.1 L)', path: '/procurement?tab=approvals' },
  { id: 'prod-release', title: 'Release production for SO-1245', path: '/jobs/job-101' },
  { id: 'qc-pending', title: 'QC approval pending — 2 batches', path: '/quality' },
];

export default function YourPrioritiesCard() {
  const navigate = useNavigate();

  return (
    <div
      className="p-4 rounded-2xl border flex flex-col"
      style={{
        background: 'var(--card-gradient, linear-gradient(180deg, #FFFFFF 0%, #FAF9FE 100%))',
        borderColor: 'var(--border, #E5E0F5)',
        boxShadow: '0 4px 20px -2px rgba(24, 27, 65, 0.06)',
      }}
    >
      <h3 className="text-base font-bold text-[var(--text)] tracking-tight mb-2">
        Your Priorities
      </h3>
      <div className="space-y-1">
        {PRIORITIES.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => navigate(item.path)}
            className="w-full flex items-center justify-between gap-2 px-2 py-2 rounded-xl hover:bg-[var(--surface-2)] text-left"
          >
            <span className="text-[13px] font-semibold text-[var(--text)]">{item.title}</span>
            <ChevronRight size={15} className="text-[var(--text-3)] flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
