import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap, Package, BarChart3, AlertTriangle, Send,
  ArrowRight, X, ChevronRight, Bot, RefreshCw
} from 'lucide-react';
import { useStore } from '../../store';
import { computeProductionStatus } from '../../domain/productionStatus';
import { computeMaintenanceDue } from '../../domain/maintenanceDue';
import { DEMO_NOW } from '../../data/seed';
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
  const { jobs, inventory, eossTheme, assets, meterReadings, inspections } = useStore();

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

  const now = new Date(DEMO_NOW);
  const shortageCount = inventory.filter(i => i.shortage).length;
  const blockedCount = jobs.filter(j => computeProductionStatus(j, now).risk === 'blocked').length;
  const overdueCount = assets.filter(a => computeMaintenanceDue(a, meterReadings, now).status === 'overdue').length
    + assets.filter(a => a.status === 'pm_overdue').length;
  const pendingChecks = inspections.filter(i => i.result === 'pending' || i.result === 'fail').length;
  const updateJob = jobs.find(j => j.status === 'active' && !j.hasBlocker);

  const suggestions = [
    {
      id: 'stock-risk',
      icon: <AlertTriangle size={17} style={{ color: themeConfig.iconColorWarn }} strokeWidth={2.5} />,
      text: shortageCount ? `${shortageCount} materials are short` : 'Any material shortages?',
      response: shortageCount
        ? `${shortageCount} materials are below what the shop needs. The shortage list can raise a purchase request or move stock from another store.`
        : 'No material is flagged short right now.',
      action: { label: 'Open shortages', path: '/inventory?focus=shortage' },
    },
    {
      id: 'plan-prod',
      icon: <Zap size={17} style={{ color: themeConfig.iconColorZap }} strokeWidth={2.5} />,
      text: blockedCount ? `${blockedCount} jobs are blocked` : 'Which jobs need an update?',
      response: blockedCount
        ? `${blockedCount} jobs are blocked. Open one to clear the blocker, or update the active stage on ${updateJob?.jobNumber ?? 'a running job'}.`
        : `${jobs.filter(j => j.status === 'active').length} jobs are active. Update the current stage from the job.`,
      action: blockedCount
        ? { label: 'Open blocked jobs', path: '/jobs?risk=blocked' }
        : { label: updateJob ? `Update ${updateJob.jobNumber}` : 'Open jobs', path: updateJob ? `/jobs/${updateJob.id}?update=1` : '/jobs' },
    },
    {
      id: 'suggest-po',
      icon: <Package size={17} style={{ color: themeConfig.iconColorBox }} strokeWidth={2.5} />,
      text: overdueCount ? `${overdueCount} machines are overdue` : 'Is maintenance overdue?',
      response: overdueCount
        ? `${overdueCount} assets are past their service point. Schedule the work, or complete a work order that is already open.`
        : 'No asset is marked overdue.',
      action: { label: 'Open overdue assets', path: '/assets?focus=overdue' },
    },
    {
      id: 'check-status',
      icon: <BarChart3 size={17} style={{ color: themeConfig.iconColorChart }} strokeWidth={2.5} />,
      text: pendingChecks ? `${pendingChecks} inspections need a result` : 'Any inspections waiting?',
      response: pendingChecks
        ? `${pendingChecks} inspections are pending or failed. Record the result, or raise an NCR where one already failed.`
        : 'No inspection is waiting on a result.',
      action: { label: 'Open inspections', path: '/quality?result=open' },
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
        'flex flex-col rounded-3xl overflow-hidden relative select-none',
        'h-full min-h-0',
        isDrawer ? 'w-full max-w-md' : 'w-full'
      )}
      style={{
        background: themeConfig.panelBg,
        border: themeConfig.panelBorder,
        boxShadow: themeConfig.panelShadow,
      }}
    >
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 flex-shrink-0">
        <img
          src={`/assets/copilot/robot_${eossTheme}.png`}
          alt=""
          className="w-[84px] h-[84px] object-contain flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <div className="font-bold text-white text-sm leading-tight">EOSS Copilot</div>
          <div className="text-[12px] text-white/70 leading-snug mt-0.5">Questions from what needs attention.</div>
        </div>
        {isDrawer && onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white flex-shrink-0"
            aria-label="Close Copilot"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* ── Content area below hero ── */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none flex flex-col">

        {/* Welcome state: suggestion pills */}
        {messages.length === 0 && (
          <div className="flex-1 min-h-0 flex flex-col gap-2 p-3">
            {suggestions.map(s => (
              <button
                key={s.id}
                onClick={() => handleSend(s.text)}
                className="flex-1 min-h-[44px] w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all text-left text-[13px] font-semibold group cursor-pointer"
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

      {/* ── Guardrails disclaimer ── */}
      <div className="px-4 py-1.5 flex items-center gap-1.5 border-t border-white/10 bg-black/10 flex-shrink-0">
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-white/60">⚠ Guardrails active</span>
        <span className="text-[9px] text-white/40 truncate">AI suggestions are advisory — verify before acting · Simulated, no data sent externally</span>
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
