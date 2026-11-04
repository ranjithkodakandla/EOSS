import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Zap, Package, BarChart3, AlertTriangle, Send,
  ArrowRight, X, ChevronRight, Bot, RefreshCw
} from 'lucide-react';
import { useStore } from '../../store';
import clsx from 'clsx';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  action?: {
    label: string;
    path: string;
  };
  timestamp: string;
}

interface Props {
  isDrawer?: boolean;
  onClose?: () => void;
}

export default function CopilotPanel({ isDrawer, onClose }: Props) {
  const navigate = useNavigate();
  const { jobs, inventory, showToast } = useStore();

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const suggestions = [
    {
      id: 'plan-prod',
      icon: <Zap size={16} className="text-purple-600" />,
      text: 'Plan production for pending orders',
      response: `Analyzing 4 in-progress orders. SO-1245 (60%) is approaching CNC Lathe NL-2500 turn, while SO-1246 (35%) is waiting on SS 304 round bar inspection. Recommended action: Allocate Machine NL-2500 to SO-1245 finishing passes.`,
      action: { label: 'Open Job J-101', path: '/jobs/J-101' },
    },
    {
      id: 'suggest-po',
      icon: <Package size={16} className="text-purple-600" />,
      text: 'Suggest material purchase',
      response: `Current stock of SS 304 Rod 25mm is 45 kg (below reorder threshold of 100 kg). Projected stockout in 5 days based on SO-1245 & SO-1246 consumption. Recommended PO: 250 kg from Stainless Source India.`,
      action: { label: 'Create Supplier PO', path: '/procurement' },
    },
    {
      id: 'check-status',
      icon: <BarChart3 size={16} className="text-blue-600" />,
      text: 'Check order status',
      response: `Overall shop floor status: 12 open sales orders, 4 jobs active in production, 2 batches in quarantine awaiting QC release, and 6 dispatches staged and ready for pickup.`,
      action: { label: 'View All Jobs', path: '/jobs' },
    },
    {
      id: 'stock-risk',
      icon: <AlertTriangle size={16} className="text-amber-600" />,
      text: 'Show stock at risk',
      response: `2 items at risk: 1) SS 304 Rod 25mm (depleting in 5 days), 2) EN8 Round Bar 50mm (reserved for Job J-103, no buffer stock). Suggested reorder initiated for approval.`,
      action: { label: 'View Inventory Alerts', path: '/inventory' },
    },
  ];

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: 'Just now',
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const matched = suggestions.find(s => s.text.toLowerCase() === query.toLowerCase());
      const replyText = matched
        ? matched.response
        : `Based on current shop floor telemetry and ERP ledger records, plant health score is 92%. We are tracking ${jobs.length} jobs with ${inventory.filter(i => i.shortage).length} material shortage alerts. Let me know if you want me to draft a purchase order or reassign machine schedules.`;

      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        action: matched?.action || { label: 'Review Active Jobs', path: '/jobs' },
        timestamp: 'Just now',
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={clsx(
        'flex flex-col h-full rounded-3xl overflow-hidden relative shadow-2xl select-none',
        isDrawer ? 'w-full max-w-md' : 'w-full'
      )}
      style={{
        background: 'linear-gradient(145deg, var(--copilot-start, #4C1D95), var(--copilot-end, #A855F7))',
        boxShadow: 'var(--shadow-elevated, 0 8px 28px rgba(24, 27, 65, 0.12))',
      }}
    >
      {/* Top Header */}
      <div className="p-4 md:p-5 flex items-start justify-between flex-shrink-0 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
            <Sparkles size={18} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-extrabold text-white text-base md:text-lg tracking-tight">
              <span>EOSS Copilot</span>
              <span className="text-amber-300 text-sm">✦</span>
            </div>
            <div className="text-[11px] text-white/80 font-medium tracking-normal">
              Your intelligent business partner
            </div>
          </div>
        </div>

        {isDrawer && onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 scrollbar-none">
        {/* Mascot & Speech Bubble Greeting */}
        {messages.length === 0 && (
          <div className="flex items-center justify-between gap-3 pt-1">
            {/* Speech Bubble */}
            <div
              className="relative bg-white p-3.5 rounded-2xl shadow-lg flex-1 text-xs md:text-sm font-bold leading-relaxed"
              style={{ color: '#1A1F36' }}
            >
              <span>How can I help your business today?</span>
              {/* Bubble Tail */}
              <div
                className="absolute top-1/2 -right-2 transform -translate-y-1/2 w-0 h-0 border-t-6 border-t-transparent border-b-6 border-b-transparent border-l-8 border-l-white"
              />
            </div>

            {/* Stylized Friendly Floating Robot Mascot */}
            <div className="w-20 h-20 flex-shrink-0 relative flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-md absolute animate-ping opacity-20" />
              <svg width="68" height="68" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative drop-shadow-lg">
                {/* Antenna */}
                <path d="M50 20 L50 9" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
                <circle cx="50" cy="8" r="5" fill="#38BDF8" className="animate-pulse" />

                {/* Head / Body */}
                <rect x="20" y="20" width="60" height="52" rx="24" fill="#FFFFFF" />

                {/* Screen Visor */}
                <rect x="28" y="30" width="44" height="26" rx="13" fill="#0F172A" />

                {/* Smiling Cyan Eyes */}
                <ellipse cx="40" cy="42" rx="4" ry="5" fill="#22D3EE" />
                <ellipse cx="60" cy="42" rx="4" ry="5" fill="#22D3EE" />
                <path d="M44 47 Q50 51 56 47" stroke="#22D3EE" strokeWidth="2.5" strokeLinecap="round" fill="none" />

                {/* Cheeks */}
                <circle cx="34" cy="45" r="2" fill="#F472B6" opacity="0.6" />
                <circle cx="66" cy="45" r="2" fill="#F472B6" opacity="0.6" />

                {/* Floating Hands */}
                <circle cx="14" cy="52" r="6" fill="#FFFFFF" />
                <circle cx="86" cy="52" r="6" fill="#FFFFFF" />
              </svg>
            </div>
          </div>
        )}

        {/* Proactive Insight Card */}
        {messages.length === 0 && (
          <div
            onClick={() => navigate('/inventory')}
            className="p-3 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 hover:bg-white/25 transition-all cursor-pointer flex items-center justify-between text-xs group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-amber-400 text-amber-950 flex items-center justify-center font-bold flex-shrink-0 text-xs shadow-2xs">
                !
              </div>
              <span className="text-white font-medium">
                2 items are likely to go out of stock in 5 days.
              </span>
            </div>
            <ChevronRight size={14} className="text-white/80 group-hover:translate-x-0.5 group-hover:text-white transition-all flex-shrink-0" />
          </div>
        )}

        {/* Suggested Quick Prompt Chips (Explicit dark text so it's beautifully readable) */}
        {messages.length === 0 && (
          <div className="space-y-2 pt-1">
            {suggestions.map(s => (
              <button
                key={s.id}
                onClick={() => handleSend(s.text)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white hover:bg-gray-50 hover:shadow-md transition-all text-left text-xs md:text-[13px] font-semibold group cursor-pointer"
                style={{ color: '#1A1F36' }}
              >
                <div className="flex items-center gap-2.5 truncate pr-2">
                  <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 shadow-2xs">
                    {s.icon}
                  </div>
                  <span className="truncate font-bold" style={{ color: '#1A1F36' }}>
                    {s.text}
                  </span>
                </div>
                <ChevronRight size={15} className="text-gray-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>
            ))}
          </div>
        )}

        {/* Conversation Transcript */}
        {messages.map(msg => (
          <div
            key={msg.id}
            className={clsx(
              'flex flex-col space-y-1 text-xs md:text-sm animate-in fade-in',
              msg.sender === 'user' ? 'items-end' : 'items-start'
            )}
          >
            <div
              className={clsx(
                'p-3.5 rounded-2xl max-w-[90%] shadow-md leading-relaxed',
                msg.sender === 'user'
                  ? 'bg-white rounded-br-xs font-semibold'
                  : 'bg-white/20 backdrop-blur-md text-white border border-white/20 rounded-bl-xs'
              )}
              style={msg.sender === 'user' ? { color: '#1A1F36' } : {}}
            >
              {msg.text}

              {/* Action Button if provided */}
              {msg.action && (
                <div className="mt-2.5 pt-2 border-t border-white/20 flex justify-end">
                  <button
                    onClick={() => {
                      if (onClose) onClose();
                      navigate(msg.action!.path);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-purple-700 font-bold text-xs hover:bg-purple-50 transition-colors shadow-sm"
                  >
                    <span>{msg.action.label}</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              )}
            </div>

            <span className="text-[10px] text-white/60 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-white/80 p-2">
            <Bot size={14} className="animate-bounce" />
            <span className="italic">EOSS Copilot is analyzing telemetry...</span>
          </div>
        )}

        {/* Simulated disclaimer note */}
        {messages.length > 0 && (
          <div className="p-2 rounded-lg bg-white/10 text-[10px] text-white/70 text-center flex items-center justify-center gap-1.5">
            <RefreshCw size={10} className="text-amber-300" />
            <span>Simulated AI telemetry · Human sign-off required for PO release</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Bottom Composer Input */}
      <div className="p-3.5 md:p-4 bg-black/15 backdrop-blur-md border-t border-white/10 flex-shrink-0">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question..."
            className="w-full bg-white text-gray-900 placeholder-gray-400 text-xs md:text-sm rounded-full py-2.5 pl-4 pr-11 shadow-inner focus:outline-none focus:ring-2 focus:ring-white/80"
            style={{ color: '#1A1F36' }}
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="absolute right-1.5 w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, var(--brand-primary, #7048F5), var(--brand-secondary, #A855F7))',
              color: '#FFFFFF',
            }}
            title="Send inquiry"
          >
            <Send size={14} className="-ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
