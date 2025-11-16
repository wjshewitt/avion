'use client';

import { useState, useEffect } from 'react';
import { Gauge, Plane, Cloud, MapPin, MessageSquare, Settings, Search, Bell, User, ChevronDown, Sparkles, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThinkingIndicator } from './shared/ThinkingIndicator';
import { LEDStatus } from './shared/LEDStatus';
import { AIInput } from './shared/AIInput';
import { ContextBadge } from './shared/ContextBadge';
import { AIMessage } from './shared/AIMessage';

const navGroups = [
  {
    label: 'Operations',
    items: [
      { icon: Gauge, label: 'Dashboard', count: null },
      { icon: Plane, label: 'Flights', count: 12 },
    ]
  },
  {
    label: 'Information',
    items: [
      { icon: Cloud, label: 'Weather', count: 3 },
      { icon: MapPin, label: 'Airports', count: null },
    ]
  },
  {
    label: 'Tools',
    items: [
      { icon: MessageSquare, label: 'Chat', count: null },
      { icon: Settings, label: 'Settings', count: null },
    ]
  },
];

export default function MissionControlSplit() {
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [searchValue, setSearchValue] = useState('');
  const [mode, setMode] = useState<'nav' | 'copilot'>('nav');
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState<Array<{content: string; isUser: boolean; timestamp: string}>>([]);
  const [aiStatus, setAiStatus] = useState<'ready' | 'thinking' | 'streaming' | 'error'>('ready');

  // Keyboard shortcut ⌘J / Ctrl+J
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        setMode(mode === 'nav' ? 'copilot' : 'nav');
      }
      if (e.key === 'Escape' && mode === 'copilot') {
        e.preventDefault();
        setMode('nav');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode]);

  const handleSendMessage = () => {
    if (!aiInput.trim()) return;

    const userMessage = {
      content: aiInput,
      isUser: true,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
    setAiMessages(prev => [...prev, userMessage]);
    setAiInput('');
    setAiStatus('thinking');

    setTimeout(() => {
      setAiStatus('streaming');
      const aiResponse = {
        content: `Co-Pilot response to "${aiInput}": This is the Mission Control Split pattern where the sidebar transforms between Navigation and Co-Pilot modes.`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
      setAiMessages(prev => [...prev, aiResponse]);
      setAiStatus('ready');
    }, 2000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#F4F4F4]">
      {/* Top Ceramic Bar */}
      <header className="h-12 bg-[#F4F4F4] border-b border-zinc-200 px-6 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-zinc-900 flex items-center justify-center text-white font-bold text-xs">
            Av
          </div>
          <div>
            <div className="text-zinc-900 font-semibold text-sm">Avion</div>
          </div>
        </div>

        {/* System Status Cluster */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
              System Nominal
            </span>
          </div>

          <div className="text-xs font-mono text-zinc-600 tabular-nums">
            14:23 UTC
          </div>

          <div className="text-xs font-mono text-zinc-600 tabular-nums">
            3 ACTIVE
          </div>
        </div>

        {/* User Controls */}
        <div className="flex items-center gap-3">
          <button className="relative">
            <Bell size={16} className="text-zinc-600 hover:text-zinc-900 transition-colors" strokeWidth={1.5} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#F04E30] rounded-full" />
          </button>

          <button className="flex items-center gap-2 px-3 py-1.5 bg-[#e8e8e8] border border-zinc-300 rounded-sm hover:bg-zinc-200 transition-colors shadow-[-1px_-1px_3px_rgba(255,255,255,0.8),1px_1px_3px_rgba(0,0,0,0.05)]">
            <User size={14} className="text-zinc-600" strokeWidth={1.5} />
            <span className="text-xs font-medium text-zinc-700">W. Shewitt</span>
            <ChevronDown size={12} className="text-zinc-500" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* Main Content Area with Side Panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Ceramic Side Panel */}
        <aside className="w-52 bg-[#F4F4F4] border-r border-zinc-200 flex flex-col p-4 space-y-6">
          {/* Mode Toggle Button */}
          <button
            onClick={() => setMode(mode === 'nav' ? 'copilot' : 'nav')}
            className={`
              w-full flex items-center gap-2 px-3 py-2.5 rounded-sm
              transition-all duration-200
              ${mode === 'copilot'
                ? 'bg-white text-zinc-900 shadow-[-1px_-1px_3px_rgba(255,255,255,0.8),1px_1px_3px_rgba(0,0,0,0.08)]'
                : 'bg-[#e8e8e8] border border-zinc-300 text-zinc-600 hover:bg-white/50'
              }
            `}
            title="Toggle Co-Pilot Mode (⌘J)"
          >
            <Sparkles size={16} strokeWidth={1.5} />
            <span className="text-xs font-semibold flex-1 text-left">
              {mode === 'copilot' ? 'Co-Pilot Active' : 'Activate Co-Pilot'}
            </span>
            {mode === 'copilot' && <LEDStatus status={aiStatus} size="sm" label="" />}
          </button>

          <AnimatePresence mode="wait">
            {mode === 'nav' ? (
              <motion.div
                key="nav"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-6 flex-1"
              >
                {/* Search in Groove */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search..."
                    className="
                      w-full h-9 px-3 pr-9
                      bg-[#e8e8e8] text-xs text-zinc-900 font-mono
                      placeholder:text-zinc-400
                      border border-zinc-300 rounded-sm
                      shadow-[inset_1px_1px_3px_rgba(0,0,0,0.08),inset_-1px_-1px_3px_rgba(255,255,255,0.7)]
                      focus:outline-none focus:ring-1 focus:ring-[#F04E30]/30
                    "
                  />
                  <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" strokeWidth={1.5} />
                </div>

                {/* Segmented Navigation Groups */}
                {navGroups.map((group) => (
            <div key={group.label} className="space-y-2">
              {/* Group Label */}
              <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 px-2">
                {group.label}
              </div>

              {/* Group Container with Groove */}
              <div className="bg-[#e8e8e8] border border-zinc-300 rounded-sm p-1 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.06),inset_-1px_-1px_3px_rgba(255,255,255,0.7)]">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeNav === item.label;
                  
                  return (
                    <button
                      key={item.label}
                      onClick={() => setActiveNav(item.label)}
                      className={`
                        w-full flex items-center gap-2 px-3 py-2 rounded-sm
                        transition-all duration-200
                        ${isActive 
                          ? 'bg-white text-zinc-900 shadow-[-1px_-1px_3px_rgba(255,255,255,0.8),1px_1px_3px_rgba(0,0,0,0.08)]' 
                          : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/50'
                        }
                      `}
                    >
                      <Icon size={16} strokeWidth={1.5} />
                      <span className="text-xs font-medium flex-1 text-left">
                        {item.label}
                      </span>
                      {item.count !== null && (
                        <span className="text-[10px] font-mono tabular-nums text-zinc-500 font-semibold">
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

                {/* Profile Section at Bottom */}
                <div className="mt-auto pt-4 border-t border-zinc-200">
                  <div className="bg-[#e8e8e8] border border-zinc-300 rounded-sm p-3 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.06),inset_-1px_-1px_3px_rgba(255,255,255,0.7)]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-zinc-700 flex items-center justify-center text-white text-xs font-semibold rounded-sm">
                        WS
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-zinc-900 truncate">Will Shewitt</div>
                        <div className="text-[10px] font-mono text-zinc-500 truncate">ops@avion.ai</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="copilot"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="flex flex-col flex-1 gap-3"
              >
                {/* Status Header */}
                <div className="px-3 py-2 border-b border-zinc-200">
                  <div className="flex items-center gap-2 mb-1">
                    <LEDStatus status={aiStatus} size="sm" label="" />
                    <span className="text-xs text-zinc-600">Co-Pilot Mode</span>
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                    AI CO-PILOT
                  </div>
                </div>

                {/* Thinking Indicator */}
                {aiStatus === 'thinking' && (
                  <div className="px-3">
                    <ThinkingIndicator material="ceramic" />
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-3 space-y-3">
                  {aiMessages.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-zinc-500 text-sm mb-2">Co-Pilot Ready</div>
                      <div className="text-zinc-600 text-xs">
                        Ask about operations, flights, or weather
                      </div>
                    </div>
                  ) : (
                    aiMessages.map((message, index) => (
                      <div key={index} className={`${message.isUser ? 'ml-auto' : ''} max-w-[80%]`}>
                        <div className={`
                          rounded-sm p-3 text-xs
                          ${message.isUser 
                            ? 'bg-white border border-zinc-200 text-zinc-900 shadow-[-1px_-1px_3px_rgba(255,255,255,0.8),1px_1px_3px_rgba(0,0,0,0.05)]' 
                            : 'bg-white border-l-2 border-[#2563eb] border-t border-r border-b border-zinc-200 text-zinc-900'
                          }
                        `}>
                          {!message.isUser && (
                            <div className="text-[9px] font-mono uppercase tracking-widest text-[#2563eb] mb-1">
                              AVION AI v1.5
                            </div>
                          )}
                          <div className="leading-relaxed">{message.content}</div>
                          <div className="text-[10px] font-mono text-zinc-400 mt-1 tabular-nums">
                            {message.timestamp}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Context Chip */}
                <div className="px-3">
                  <div className="px-3 py-2 bg-white border border-zinc-200 rounded-sm">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-1">
                      Context Mode
                    </div>
                    <div className="text-xs font-medium text-zinc-900">
                      {activeNav}
                    </div>
                  </div>
                </div>

                {/* Input */}
                <div className="px-3">
                  <AIInput
                    value={aiInput}
                    onChange={setAiInput}
                    onSend={handleSendMessage}
                    material="ceramic"
                    placeholder="Ask about operations..."
                    disabled={aiStatus === 'thinking'}
                  />
                </div>

                {/* Return Button */}
                <div className="px-3 mt-auto border-t border-zinc-200 pt-3">
                  <button
                    onClick={() => setMode('nav')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-sm transition-colors text-xs"
                  >
                    <ChevronLeft size={14} strokeWidth={1.5} />
                    <span>Back to Navigation</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto bg-white">
          <div className="max-w-6xl mx-auto">
            {/* Content Card */}
            <div className="bg-[#F4F4F4] border border-zinc-200 rounded-sm p-6 shadow-[-2px_-2px_5px_rgba(255,255,255,0.8),2px_2px_5px_rgba(0,0,0,0.05)]">
              <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-2">
                Current View
              </div>
              <h2 className="text-2xl font-semibold text-zinc-900 mb-4">
                {activeNav}
              </h2>
              <p className="text-zinc-600 leading-relaxed mb-6">
                The <strong>Mission Control Split</strong> uses a dual-panel ceramic system for a 
                lighter, more approachable aesthetic. The minimal top bar houses system status and user 
                controls, while the side panel organizes navigation into segmented groups with groove 
                insets. This pattern works well for applications requiring grouped navigation categories.
              </p>

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Active Flights', value: '12', unit: 'aircraft' },
                  { label: 'Weather Alerts', value: '3', unit: 'locations' },
                  { label: 'System Load', value: '47', unit: 'percent' },
                  { label: 'Data Latency', value: '23', unit: 'ms' },
                ].map((metric, i) => (
                  <div key={i} className="p-4 bg-white border border-zinc-200 rounded-sm shadow-[-1px_-1px_3px_rgba(255,255,255,0.8),1px_1px_3px_rgba(0,0,0,0.04)]">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-1">
                      {metric.label}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-3xl font-mono tabular-nums text-zinc-900">
                        {metric.value}
                      </div>
                      <div className="text-xs text-zinc-500">{metric.unit}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Status Table */}
              <div className="mt-6 bg-white border border-zinc-200 rounded-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[#e8e8e8] border-b border-zinc-200">
                    <tr>
                      <th className="px-4 py-2 text-left text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                        Component
                      </th>
                      <th className="px-4 py-2 text-left text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                        Status
                      </th>
                      <th className="px-4 py-2 text-right text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                        Uptime
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Flight Tracking', status: 'Operational', uptime: '99.9%', color: '#10b981' },
                      { name: 'Weather Data', status: 'Operational', uptime: '99.8%', color: '#10b981' },
                      { name: 'Database', status: 'Operational', uptime: '100%', color: '#10b981' },
                    ].map((item, i) => (
                      <tr key={i} className="border-b border-zinc-100 last:border-0">
                        <td className="px-4 py-3 text-sm text-zinc-900">{item.name}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-xs text-zinc-600">{item.status}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-mono tabular-nums text-zinc-900">
                          {item.uptime}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
