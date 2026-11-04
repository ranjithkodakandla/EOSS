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

  // Exact theme styling and official extracted 3D robot assets mapped to reference pack PNGs:
  // Theme A: Aurora Indigo (#7048F5 / #4A1FB8)
  // Theme B: Ocean Teal (#087F8C / #0A5D6B)
  // Theme C: Graphite Amber (#2A2A32 / #E58A36 / #F59E0B)
  const isGraphite = eossTheme === 'graphite';
  const isOcean = eossTheme === 'ocean';

  const themeConfig = {
    panelBg: isGraphite
      ? 'radial-gradient(circle 280px at 15% 12%, rgba(245, 158, 11, 0.38) 0%, transparent 70%), radial-gradient(ellipse 70% 50% at 85% 0%, rgba(255, 255, 255, 0.12) 0%, transparent 60%), linear-gradient(155deg, #2A2A32 0%, #1C1D24 60%, #121318 100%)'
      : isOcean
      ? 'radial-gradient(circle 280px at 15% 12%, rgba(20, 184, 166, 0.45) 0%, transparent 70%), radial-gradient(ellipse 70% 50% at 85% 0%, rgba(255, 255, 255, 0.22) 0%, transparent 60%), linear-gradient(155deg, #0A5D6B 0%, #06404A 60%, #03282E 100%)'
      : 'radial-gradient(circle 280px at 15% 12%, rgba(168, 85, 247, 0.45) 0%, transparent 70%), radial-gradient(ellipse 70% 50% at 85% 0%, rgba(255, 255, 255, 0.22) 0%, transparent 60%), linear-gradient(155deg, #4A1FB8 0%, #311378 60%, #1E0A4C 100%)',
    panelBorder: isGraphite
      ? '1px solid rgba(245, 158, 11, 0.35)'
      : isOcean
      ? '1px solid rgba(255, 255, 255, 0.22)'
      : '1px solid rgba(255, 255, 255, 0.22)',
    panelShadow: isGraphite
      ? '0 16px 40px -8px rgba(0, 0, 0, 0.6), 0 0 24px -2px rgba(245, 158, 11, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.15)'
      : isOcean
      ? '0 16px 40px -8px rgba(8, 127, 140, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.30)'
      : '0 16px 40px -8px rgba(112, 72, 245, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.35)',
    sparkleColor: isGraphite ? '#F59E0B' : isOcean ? '#22D3EE' : '#FCD34D',
    robotImg: isGraphite
      ? '/assets/copilot/robot_graphite.png'
      : isOcean
      ? '/assets/copilot/robot_ocean.png'
      : '/assets/copilot/robot_aurora.png',
    sendBtnBg: isGraphite
      ? 'linear-gradient(135deg, #E58A36, #F59E0B)'
      : isOcean
      ? 'linear-gradient(135deg, #087F8C, #0EA5A5)'
      : 'linear-gradient(135deg, #7048F5, #A855F7)',
    sendBtnShadow: isGraphite
      ? '0 4px 14px rgba(229, 138, 54, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.5)'
      : isOcean
      ? '0 4px 14px rgba(8, 127, 140, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.5)'
      : '0 4px 14px rgba(112, 72, 245, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
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
      {/* Top Header */}
      <div className="p-4 md:p-5 flex items-start justify-between flex-shrink-0 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
            <Sparkles size={18} style={{ color: themeConfig.sparkleColor }} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-extrabold text-white text-base md:text-lg tracking-tight">
              <span>EOSS Copilot</span>
              <span style={{ color: themeConfig.sparkleColor }} className="text-sm">✦</span>
            </div>
            <div className="text-[11px] text-white/80 font-medium tracking-normal">
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

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-3.5 scrollbar-none flex flex-col justify-between">
        {/* 3D Mascot & Speech Bubble Greeting strictly matching reference pack */}
        {messages.length === 0 && (
          <div className="flex items-center justify-between gap-3 pt-1">
            {/* Speech Bubble with Glossy Sheen */}
            <div
              className="relative p-3.5 rounded-2xl flex-1 text-xs md:text-sm font-bold leading-relaxed"
              style={{
                background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
                color: '#1A1F36',
                boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.15), inset 0 1px 1px #FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.9)',
              }}
            >
              <span>How can I help your business today?</span>
              {/* Bubble Tail pointing to robot */}
              <div
                className="absolute top-1/2 -right-2 transform -translate-y-1/2 w-0 h-0 border-t-6 border-t-transparent border-b-6 border-b-transparent border-l-8 border-l-white"
              />
            </div>

            {/* 3D Robot Mascot — RGBA PNG with transparent bg, render as-is */}
            <div className="flex-shrink-0 select-none pointer-events-none">
              <img
                src={themeConfig.robotImg}
                alt="EOSS Copilot Mascot"
                className="w-20 h-auto object-contain"
                style={{ filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.35))' }}
              />
            </div>
          </div>
        )}

        {/* Suggested Quick Prompt Pill Buttons strictly matching reference design (rounded-full, no gray box around icon) */}
        {messages.length === 0 && (
          <div className="space-y-2.5 pt-1">
            {suggestions.map(s => (
              <button
                key={s.id}
                onClick={() => handleSend(s.text)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-full transition-all text-left text-xs md:text-[13px] font-semibold group cursor-pointer hover:-translate-y-0.5"
                style={{
                  background: 'linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%)',
                  boxShadow: '0 4px 14px -2px rgba(0, 0, 0, 0.08), inset 0 1px 1px #FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.85)',
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

      {/* Bottom Composer Input with Glossy Pill & Send Button */}
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
              boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(255, 255, 255, 0.3)',
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
