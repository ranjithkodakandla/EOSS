import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, CheckCircle2, Circle, ChevronRight } from 'lucide-react';
import { useStore } from '../../store';

interface PriorityItem {
  id: string;
  title: string;
  completed: boolean;
  path: string;
}

export default function YourPrioritiesCard() {
  const navigate = useNavigate();
  const { showToast } = useStore();

  const [items, setItems] = useState<PriorityItem[]>([
    {
      id: 'pr-1',
      title: 'Approve 2 purchase requests (₹4.1 L)',
      completed: true,
      path: '/procurement',
    },
    {
      id: 'prod-release',
      title: 'Release production for SO-1245',
      completed: false,
      path: '/jobs/J-101',
    },
    {
      id: 'qc-pending',
      title: 'QC approval pending — 2 batches',
      completed: false,
      path: '/quality',
    },
  ]);

  const toggleCheck = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          const next = !item.completed;
          showToast({
            type: next ? 'success' : 'info',
            title: next ? 'Priority Completed' : 'Priority Reopened',
            body: item.title,
          });
          return { ...item, completed: next };
        }
        return item;
      })
    );
  };

  return (
    <div
      className="p-5 rounded-2xl border flex flex-col justify-between bg-white"
      style={{
        borderColor: 'var(--border, #E5E0F5)',
        boxShadow: 'var(--shadow-card, 0 4px 18px rgba(24, 27, 65, 0.08))',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3.5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--brand-soft, #EEE9FF)', color: 'var(--brand-primary, #7048F5)' }}
        >
          <Target size={16} />
        </div>
        <h3 className="text-base font-bold text-[var(--text-primary, #1A1F36)] tracking-tight">
          Your Priorities (3)
        </h3>
      </div>

      {/* Checklist */}
      <div className="space-y-2.5 flex-1 flex flex-col justify-center">
        {items.map(item => (
          <div
            key={item.id}
            onClick={() => navigate(item.path)}
            className="flex items-center justify-between p-2 rounded-xl hover:bg-[var(--surface-muted, #F3F0FF)] transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <button
                type="button"
                onClick={e => toggleCheck(e, item.id)}
                className="flex-shrink-0 text-left transition-transform hover:scale-110 cursor-pointer"
                title={item.completed ? 'Mark incomplete' : 'Mark complete'}
              >
                {item.completed ? (
                  <CheckCircle2 size={18} className="text-emerald-500 fill-emerald-100" />
                ) : (
                  <Circle size={18} className="text-gray-300 hover:text-[var(--brand-primary)]" />
                )}
              </button>

              <span
                className={`text-[13px] font-semibold truncate transition-all ${
                  item.completed
                    ? 'text-gray-800'
                    : 'text-gray-800 group-hover:text-[var(--brand-primary)]'
                }`}
              >
                {item.title}
              </span>
            </div>

            <ChevronRight
              size={15}
              className="text-gray-400 group-hover:text-[var(--brand-primary)] group-hover:translate-x-0.5 transition-all flex-shrink-0"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
