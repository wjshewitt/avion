'use client';

import { useState, useEffect } from 'react';
import { Gauge, Plane, Cloud, MapPin, MessageSquare, Settings, Search, User, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThinkingIndicator } from './shared/ThinkingIndicator';
import { LEDStatus } from './shared/LEDStatus';
import { AIInput } from './shared/AIInput';
import { ContextBadge } from './shared/ContextBadge';
import { AIMessage } from './shared/AIMessage';

const navItems = [
  { icon: Gauge, label: 'Dashboard', status: 'nominal', badge: null },
  { icon: Plane, label: 'Flights', status: 'nominal', badge: 3 },
  { icon: Cloud, label: 'Weather', status: 'caution', badge: null },
  { icon: MapPin, label: 'Airports', status: 'nominal', badge: null },
  { icon: MessageSquare, label: 'Chat', status: 'nominal', badge: 'new' },
];

const statusColors = {
  nominal: '#10b981', // emerald
  caution: '#f59e0b', // amber
  critical: '#F04E30', // safety orange
};

export default function FlightDeckClassic() {
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [searchValue, setSearchValue] = useState('');
  const [metricValues, setMetricValues] = useState<number[]>([0, 0, 0]);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState<Array<{content: string; isUser: boolean; timestamp: string}>>([]);
  const [aiStatus, setAiStatus] = useState<'ready' | 'thinking' | 'streaming' | 'error'>('ready');

  // Generate random values only on client side to avoid hydration mismatch
  useEffect(() => {
    setMetricValues([
      Math.random() * 100,
      Math.random() * 100,
      Math.random() * 100,
    ]);
  }, []);

  // Keyboard shortcut ⌘J / Ctrl+J
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        setAiOpen(!aiOpen);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [aiOpen]);

  const handleSendMessage = () => {
    if (!aiInput.trim()) return;

    // Add user message
    const userMessage = {
      content: aiInput,
      isUser: true,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
    setAiMessages(prev => [...prev, userMessage]);
    setAiInput('');

    // Simulate AI thinking
    setAiStatus('thinking');
    setTimeout(() => {
      setAiStatus('streaming');
      const aiResponse = {
        content: `I can help you with "${aiInput}". This is a demo response showing how AI integrates with the Flight Deck Classic pattern. The AI appears as an instrument drawer that slides from the right edge.`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
      setAiMessages(prev => [...prev, aiResponse]);
      setAiStatus('ready');
    }, 2000);
  };

  return (
    <div className="w-full h-full flex bg-[#1A1A1A]">
      {/* Tungsten Sidebar */}
      <aside className="w-60 bg-[#2A2A2A] border-r border-[#333] flex flex-col">
        {/* Logo with Corner Brackets */}
        <div className="p-6 border-b border-[#333]">
          <div className="relative">
            {/* Corner Brackets */}
            <div className="absolute -top-1 -left-1 w-3 h-3 border-l-2 border-t-2 border-zinc-500/40" />
            <div className="absolute -top-1 -right-1 w-3 h-3 border-r-2 border-t-2 border-zinc-500/40" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-l-2 border-b-2 border-zinc-500/40" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-r-2 border-b-2 border-zinc-500/40" />
            
            <div className="flex items-center gap-3 p-3">
              <div className="w-10 h-10 bg-[#F04E30] flex items-center justify-center text-white font-bold text-sm">
                Av
              </div>
              <div>
                <div className="text-white font-semibold text-sm">Avion OS</div>
                <div className="text-zinc-400 text-[10px] font-mono uppercase tracking-widest">
                  Flight Deck
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.label;
            
            return (
              <button
                key={item.label}
                onClick={() => setActiveNav(item.label)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-sm relative
                  transition-all duration-200
                  ${isActive 
                    ? 'bg-[#1A1A1A] text-white' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1A1A1A]/50'
                  }
                `}
                style={isActive ? {
                  borderLeft: '3px solid #F04E30',
                  paddingLeft: 'calc(1rem - 3px)'
                } : {}}
              >
                {/* LED Status Dot */}
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: statusColors[item.status as keyof typeof statusColors] }}
                />
                
                <Icon size={18} strokeWidth={1.5} />
                
                <span className="text-sm font-medium flex-1 text-left">
                  {item.label}
                </span>

                {/* Badge */}
                {item.badge && (
                  <span className={`
                    px-2 py-0.5 text-[10px] font-mono font-semibold rounded-sm
                    ${typeof item.badge === 'number'
                      ? 'bg-[#F04E30] text-white'
                      : 'bg-[#f59e0b] text-white'
                    }
                  `}>
                    {typeof item.badge === 'number' ? item.badge : item.badge.toUpperCase()}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-[#333]">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-[#333] border border-[#444] flex items-center justify-center text-zinc-400 text-xs font-semibold">
              WS
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">Will Shewitt</div>
              <div className="text-zinc-500 text-[10px] font-mono truncate">OPS@AVION.AI</div>
            </div>
          </div>
          
          <button className="w-full mt-2 flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-zinc-200 hover:bg-[#1A1A1A]/50 rounded-sm transition-colors">
            <Settings size={16} strokeWidth={1.5} />
            <span className="text-xs font-medium">Settings</span>
          </button>
        </div>
      </aside>

      {/* Ceramic Main Area */}
      <div className="flex-1 flex flex-col bg-[#F4F4F4]">
        {/* Ceramic Header */}
        <header className="h-16 bg-[#F4F4F4] border-b border-zinc-200 px-6 flex items-center gap-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          {/* System Status LED */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#10b981]" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
              Operational
            </span>
          </div>

          {/* Search Input with Groove Effect */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search flights, weather, airports..."
                className="
                  w-full h-10 px-4 pr-12
                  bg-[#e8e8e8] text-sm text-zinc-900 font-mono
                  placeholder:text-zinc-400
                  rounded-sm border border-zinc-300
                  shadow-[inset_1px_1px_3px_rgba(0,0,0,0.08),inset_-1px_-1px_3px_rgba(255,255,255,0.7)]
                  focus:outline-none focus:ring-2 focus:ring-[#F04E30]/20
                "
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Search size={16} className="text-zinc-400" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          {/* Right Status Cluster */}
          <div className="flex items-center gap-6">
            {/* Alerts */}
            <button className="text-[12px] font-semibold uppercase tracking-wider text-[#F04E30] hover:underline decoration-2 underline-offset-4 transition-all">
              2 Alerts
            </button>

            {/* Active Flights */}
            <button className="text-[12px] font-semibold uppercase tracking-wider text-[#2563eb] hover:underline decoration-2 underline-offset-4 transition-all">
              3 Active
            </button>

            {/* UTC Clock */}
            <div className="text-[13px] font-mono text-zinc-900 tabular-nums">
              14:23 UTC
            </div>

            {/* AI Trigger Button */}
            <button
              onClick={() => setAiOpen(!aiOpen)}
              className={`
                w-9 h-9 flex items-center justify-center rounded-sm transition-all border
                ${aiOpen
                  ? 'bg-[#F04E30] border-[#F04E30] text-white'
                  : 'bg-[#e8e8e8] border-zinc-300 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200'
                }
                shadow-[-2px_-2px_5px_rgba(255,255,255,0.8),2px_2px_5px_rgba(0,0,0,0.05)]
              `}
              title="AI Co-Pilot (⌘J)"
            >
              <Sparkles size={18} strokeWidth={1.5} />
            </button>

            {/* User Avatar */}
            <button className="w-9 h-9 bg-[#e8e8e8] border border-zinc-300 flex items-center justify-center text-zinc-700 text-xs font-semibold hover:bg-zinc-200 transition-colors rounded-sm shadow-[-2px_-2px_5px_rgba(255,255,255,0.8),2px_2px_5px_rgba(0,0,0,0.05)]">
              <User size={18} strokeWidth={1.5} />
            </button>
          </div>
        </header>

        {/* Main Content Area with AI Drawer */}
        <div className="flex-1 flex overflow-hidden">
          <motion.main
            animate={{ marginRight: aiOpen ? 320 : 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="flex-1 p-8 overflow-auto"
          >
            <div className="max-w-6xl mx-auto">
            {/* Demo Content Card */}
            <div className="bg-white rounded-sm border border-zinc-200 p-6 shadow-[-2px_-2px_5px_rgba(255,255,255,0.8),2px_2px_5px_rgba(0,0,0,0.05)]">
              <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">
                Active Section
              </div>
              <h2 className="text-2xl font-semibold text-zinc-900 mb-4">
                {activeNav}
              </h2>
              <p className="text-zinc-600 leading-relaxed">
                This is a demonstration of the <strong>Flight Deck Classic</strong> design pattern. 
                The layout features a fixed tungsten sidebar with LED status indicators and a ceramic 
                main area with groove-inset search. This pattern prioritizes traditional navigation 
                hierarchy with clear visual separation between chrome and content.
              </p>

              {/* Sample Data Grid */}
              <div className="mt-6 grid grid-cols-3 gap-4">
                {metricValues.map((value, i) => (
                  <div key={i} className="p-4 bg-[#F4F4F4] border border-zinc-200 rounded-sm">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-1">
                      Metric {i + 1}
                    </div>
                    <div className="text-2xl font-mono tabular-nums text-zinc-900">
                      {value.toFixed(1)}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                      <span className="text-xs text-zinc-500">Nominal</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </motion.main>

          {/* AI Instrument Drawer */}
          <AnimatePresence>
            {aiOpen && (
              <motion.aside
                initial={{ x: 320, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 320, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="w-80 bg-[#2A2A2A] border-l border-[#333] flex flex-col relative"
              >
                {/* Corner Brackets */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-[#F04E30]" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-[#F04E30]" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-[#F04E30]" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-[#F04E30]" />
                </div>

                {/* Header */}
                <div className="p-4 border-b border-[#333] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <LEDStatus status={aiStatus} />
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                        AI Co-Pilot
                      </div>
                      <div className="text-sm font-semibold text-white">
                        Flight Deck Classic
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setAiOpen(false)}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    <X size={18} strokeWidth={1.5} />
                  </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4">
                  {aiMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <Sparkles className="text-[#2563eb] mb-3" size={32} strokeWidth={1.5} />
                      <h3 className="text-sm font-semibold text-white mb-2">
                        AI Co-Pilot Ready
                      </h3>
                      <p className="text-xs text-zinc-400 max-w-xs">
                        Ask about flight operations, weather conditions, or system status.
                      </p>
                    </div>
                  ) : (
                    <>
                      {aiMessages.map((msg, idx) => (
                        <AIMessage
                          key={idx}
                          content={msg.content}
                          isUser={msg.isUser}
                          timestamp={msg.timestamp}
                          material="tungsten"
                          showTimestamp={false}
                        />
                      ))}
                      {aiStatus === 'thinking' && <ThinkingIndicator material="tungsten" />}
                    </>
                  )}
                </div>

                {/* Context Badge */}
                <div className="px-4 pb-3">
                  <ContextBadge
                    context={activeNav}
                    dataPoints={metricValues.length}
                    material="tungsten"
                  />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-[#333]">
                  <AIInput
                    value={aiInput}
                    onChange={setAiInput}
                    onSend={handleSendMessage}
                    material="tungsten"
                    placeholder="Ask about operations..."
                    disabled={aiStatus === 'thinking'}
                  />
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
