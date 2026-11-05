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
  const { jobs, inventory, eossTheme } = useStore();

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const isGraphite = eossTheme === 'graphite';
  const isOcean = eossTheme === 'ocean';

  const themeConfig = {
    heroImg: isGraphite
      ? '/assets/copilot/hero_graphite.png'
      : isOcean
      ? '/assets/copilot/hero_ocean.png'
      : '/assets/copilot/hero_aurora.png',
    panelBg: isGraphite
      ? '#1C1D24'
      : isOcean
      ? '#06404A'
      : '#1E0A4C',
    panelBorder: isGraphite
      ? '1px solid rgba(245, 158, 11, 0.35)'
      : isOcean
      ? '1px solid rgba(255, 255, 255, 0.18)'
      : '1px solid rgba(255, 255, 255, 0.18)',
    panelShadow: isGraphite
      ? '0 16px 40px -8px rgba(0,0,0,0.6), 0 0 24px -2px rgba(245,158,11,0.25)'
      : isOcean
      ? '0 16px 40px -8px rgba(8,127,140,0.45)'
      : '0 16px 40px -8px rgba(112,72,245,0.45)',
    sparkleColor: isGraphite ? '#F59E0B' : isOcean ? '#22D3EE' : '#FCD34D',
    sendBtnBg: isGraphite
      ? 'linear-gradient(135deg, #E58A36, #F59E0B)'
      : isOcean
      ? 'linear-gradient(135deg, #087F8C, #0EA5A5)'
      : 'linear-gradient(135deg, #7048F5, #A855F7)',
    sendBtnShadow: isGraphite
      ? '0 4px 14px rgba(229,138,54,0.4)'
      : isOcean
      ? '0 4px 14px rgba(8,127,140,0.4)'
      : '0 4px 14px rgba(112,72,245,0.4)',
    chevronColor: isGraphite ? '#E58A36' : isOcean ? '#087F8C' : '#7048F5',
    iconColorZap: isGraphite ? '#E58A36' : isOcean ? '#087F8C' : '#7048F5',
    iconColorBox: isGraphite ? '#E58A36' : isOcean ? '#087F8C' : '#7048F5',
    iconColorChart: isGraphite ? '#E58A36' : isOcean ? '#087F8C' : '#4F46E5',
    iconColorWarn: isGraphite ? '#E58A36' : '#EA580C',
  };

  const suggestions = [
    {
      id: 'plan-prod',
      icon: <Zap size={17} style={{ color: themeConfig.iconColorZap }} strokeWidth={2.5} />,
      text: 'Plan production for pending orders',
      response: `Analyzing 4 in-progress orders. SO-1245 (60%) is approaching CNC Lathe NL-2500 turn, while SO-1246 (35%) is waiting on SS 304 round bar inspection. Recommended action: Allocate Machine NL-2500 to SO-1245 finishing passes.`,
      action: { label: 'Open Job J-101', path: '/jobs/J-101' },
    },
    {
      id: 'suggest-po',
      icon: <Package size={17} style={{ color: themeConfig.iconColorBox }} strokeWidth={2.5} />,
      text: 'Suggest material purchase',
      response: `Current stock of SS 304 Rod 25mm is 45 kg (below reorder threshold of 100 kg). Projected stockout in 5 days based on SO-1245 & SO-1246 consumption. Recommended PO: 250 kg from Stainless Source India.`,
      action: { label: 'Create Supplier PO', path: '/procurement' },
    },
    {
      id: 'check-status',
      icon: <BarChart3 size={17} style={{ color: themeConfig.iconColorChart }} strokeWidth={2.5} />,
      text: 'Check order status',
      response: `Overall shop floor status: 12 open sales orders, 4 jobs active in production, 2 batches in quarantine awaiting QC release, and 6 dispatches staged and ready for pickup.`,
      action: { label: 'View All Jobs', path: '/jobs' },
    },
    {
      id: 'stock-risk',
      icon: <AlertTriangle size={17} style={{ color: themeConfig.iconColorWarn }} strokeWidth={2.5} />,
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
        'flex flex-col h-full rounded-3xl overflow-hidden relative select-none',
        isDrawer ? 'w-full max-w-md' : 'w-full'
      )}
      style={{
        background: themeConfig.panelBg,
        border: themeConfig.panelBorder,
        boxShadow: themeConfig.panelShadow,
      }}
    >
      {/* ── Header: sits above the hero, never overlaps robot ── */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
            <Sparkles size={18} style={{ color: themeConfig.sparkleColor }} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-extrabold text-white text-base tracking-tight">
              <span>EOSS Copilot</span>
              <span style={{ color: themeConfig.sparkleColor }} className="text-sm">✦</span>
            </div>
            <div className="text-[11px] text-white/70 font-medium">
              Your intelligent business partner
            </div>
          </div>
        </div>
        {isDrawer && onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* ── Hero region: artwork below header ── */}
      <div className="relative flex-shrink-0" style={{ height: 180 }}>
        <img
          src={themeConfig.heroImg}
          alt=""
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center top',
          }}
        />
        {/* Fade into panel bg */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 60,
            background: `linear-gradient(to bottom, transparent, ${themeConfig.panelBg})`,
          }}
        />
        {/* Speech bubble at bottom-left of hero */}
        {messages.length === 0 && (
          <div
            className="absolute bottom-3 left-4 z-10 px-3 py-2 rounded-2xl text-sm font-bold"
            style={{
              background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
              color: '#1A1F36',
              boxShadow: '0 8px 24px -4px rgba(0,0,0,0.18), inset 0 1px 1px #FFFFFF',
              border: '1px solid rgba(255,255,255,0.9)',
              maxWidth: '58%',
            }}
          >
            How can I help your business today?
          </div>
        )}
      </div>

      {/* ── Content area below hero ── */}
      <div className="flex-1 overflow-y-auto scrollbar-none flex flex-col">

        {/* Welcome state: suggestion pills */}
        {messages.length === 0 && (
          <div className="p-3.5 md:p-4 space-y-2">
            {suggestions.map(s => (
              <button
                key={s.id}
                onClick={() => handleSend(s.text)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-full transition-all text-left text-xs md:text-[13px] font-semibold group cursor-pointer hover:-translate-y-0.5"
                style={{
                  background: 'linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%)',
                  boxShadow: '0 4px 14px -2px rgba(0,0,0,0.08), inset 0 1px 1px #FFFFFF',
                  border: '1px solid rgba(255,255,255,0.85)',
                  color: '#1A1F36',
                }}
              >
                <div className="flex items-center gap-3 truncate pr-2">
                  <div className="flex items-center justify-center flex-shrink-0">
                    {s.icon}
                  </div>
                  <span className="truncate font-bold" style={{ color: '#1A1F36' }}>
                    {s.text}
                  </span>
                </div>
                <ChevronRight
                  size={15}
                  className="group-hover:translate-x-0.5 transition-all flex-shrink-0"
                  style={{ color: themeConfig.chevronColor }}
                />
              </button>
            ))}
          </div>
        )}

        {/* Conversation Transcript */}
        {messages.length > 0 && (
          <div className="p-4 md:p-5 space-y-3">
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

                  {msg.action && (
                    <div className="mt-2.5 pt-2 border-t border-white/20 flex justify-end">
                      <button
                        onClick={() => {
                          if (onClose) onClose();
                          navigate(msg.action!.path);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white font-bold text-xs hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
                        style={{ color: themeConfig.chevronColor }}
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

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-white/80 p-2">
                <Bot size={14} className="animate-bounce" />
                <span className="italic">EOSS Copilot is analyzing telemetry...</span>
              </div>
            )}

            <div className="p-2 rounded-lg bg-white/10 text-[10px] text-white/70 text-center flex items-center justify-center gap-1.5">
              <RefreshCw size={10} className="text-amber-300" />
              <span>Simulated AI telemetry · Human sign-off required for PO release</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* ── Bottom composer ── */}
      <div className="p-3.5 md:p-4 bg-black/15 backdrop-blur-md border-t border-white/10 flex-shrink-0">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question..."
            className="w-full bg-white text-gray-900 placeholder-gray-400 text-xs md:text-sm rounded-full py-2.5 pl-4 pr-11 focus:outline-none focus:ring-2 focus:ring-white/80"
            style={{
              color: '#1A1F36',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.08)',
            }}
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="absolute right-1.5 w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 cursor-pointer"
            style={{
              background: themeConfig.sendBtnBg,
              boxShadow: themeConfig.sendBtnShadow,
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
