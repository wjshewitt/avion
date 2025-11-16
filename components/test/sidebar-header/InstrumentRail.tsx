'use client';

import { useState, useEffect } from 'react';
import { Gauge, Plane, Cloud, MapPin, MessageSquare, Search, Bell, User, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThinkingIndicator } from './shared/ThinkingIndicator';
import { LEDStatus } from './shared/LEDStatus';
import { AIInput } from './shared/AIInput';
import { ContextBadge } from './shared/ContextBadge';
import { AIMessage } from './shared/AIMessage';

const navItems = [
  { icon: Gauge, label: 'Dashboard', color: '#10b981' },
  { icon: Plane, label: 'Flights', color: '#2563eb' },
  { icon: Cloud, label: 'Weather', color: '#f59e0b' },
  { icon: MapPin, label: 'Airports', color: '#10b981' },
  { icon: MessageSquare, label: 'Chat', color: '#F04E30' },
];

const breadcrumbs = ['Operations', 'Dashboard', 'Overview'];

export default function InstrumentRail() {
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [metricValues, setMetricValues] = useState<number[]>([0, 0, 0, 0]);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState<Array<{content: string; isUser: boolean; timestamp: string}>>([]);
  const [aiStatus, setAiStatus] = useState<'ready' | 'thinking' | 'streaming' | 'error'>('ready');

  // Generate random values only on client side to avoid hydration mismatch
  useEffect(() => {
    setMetricValues([
      Math.random() * 1000,
      Math.random() * 1000,
      Math.random() * 1000,
      Math.random() * 1000,
    ]);
  }, []);

  // Keyboard shortcut ⌘J / Ctrl+J
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        setAiOpen(!aiOpen);
      }
      if (e.key === 'Escape' && aiOpen) {
        e.preventDefault();
        setAiOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [aiOpen]);

  const handleSendMessage = () => {
    if (!aiInput.trim()) return;

    const userMessage = {
      content: aiInput,
      isUser: true,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setAiMessages(prev => [...prev, userMessage]);
    setAiInput('');
    setAiStatus('thinking');

    setTimeout(() => {
      setAiStatus('streaming');
      const aiResponse = {
        content: `Telemetry analysis for "${aiInput}": This is the Instrument Rail AI integration featuring a vertical LED strip and scanline effect for a live data feed aesthetic.`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
      setAiMessages(prev => [...prev, aiResponse]);
      setAiStatus('ready');
    }, 2000);
  };

  return (
    <div className="w-full h-full flex bg-[#1A1A1A]">
      {/* Ultra-Narrow Tungsten Rail */}
      <aside className="w-14 bg-[#2A2A2A] border-r border-[#333] flex flex-col py-4">
        {/* Logo */}
        <div className="px-3 mb-6">
          <div className="w-8 h-8 bg-[#F04E30] flex items-center justify-center text-white font-bold text-xs">
            Av
          </div>
        </div>

        {/* Vertical LED Strip */}
        <div className="absolute left-0 top-20 bottom-20 w-0.5 bg-[#333]">
          <motion.div
            className="w-full bg-[#F04E30]"
            animate={{
              height: '40px',
              y: navItems.findIndex(item => item.label === activeNav) * 56
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </div>

        {/* Navigation Icons with Corner Brackets */}
        <nav className="flex-1 space-y-2 px-2">
          {/* AI Trigger Button */}
          <div className="relative mb-4">
            <button
              onClick={() => setAiOpen(!aiOpen)}
              className={`
                w-full h-12 flex items-center justify-center rounded-sm
                transition-all duration-200 relative z-10
                ${aiOpen 
                  ? 'bg-[#F04E30] text-white' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1A1A1A]/30'
                }
              `}
              title="AI Data Feed (⌘J)"
            >
              <Sparkles size={20} strokeWidth={1.5} />
            </button>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.label;
            const isHovered = hoveredNav === item.label;
            
            return (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setHoveredNav(item.label)}
                onMouseLeave={() => setHoveredNav(null)}
              >
                {/* Corner Brackets */}
                <div className={`
                  absolute inset-0 pointer-events-none transition-opacity duration-200
                  ${isActive ? 'opacity-100' : 'opacity-0'}
                `}>
                  <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-[#F04E30]" />
                  <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-[#F04E30]" />
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-[#F04E30]" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-[#F04E30]" />
                </div>

                <button
                  onClick={() => setActiveNav(item.label)}
                  className={`
                    w-full h-12 flex items-center justify-center rounded-sm
                    transition-colors duration-200 relative z-10
                    ${isActive 
                      ? 'bg-[#1A1A1A] text-white' 
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1A1A1A]/30'
                    }
                  `}
                >
                  <Icon size={20} strokeWidth={1.5} />
                </button>

                {/* Tooltip */}
                <AnimatePresence>
                  {isHovered && !isActive && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-full top-1/2 -translate-y-1/2 ml-4 z-50"
                    >
                      <div className="bg-[#F4F4F4] border border-zinc-300 px-3 py-2 rounded-sm shadow-lg whitespace-nowrap">
                        <div className="text-xs font-mono uppercase tracking-wider text-zinc-500">
                          {item.label}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Main Area with Full-Width Header */}
      <div className="flex-1 flex flex-col">
        {/* Dominant Tungsten Header */}
        <header className="bg-[#2A2A2A] border-b border-[#333]">
          {/* Main Header Bar */}
          <div className="h-20 px-8 flex items-center gap-8">
            {/* Logo and Nav Tabs */}
            <div className="flex items-center gap-8">
              <div>
                <div className="text-white font-semibold text-lg">Avion Flight OS</div>
                <div className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">
                  Instrument Rail
                </div>
              </div>

              {/* Horizontal Nav Tabs */}
              <div className="flex gap-1">
                {navItems.map((item) => {
                  const isActive = activeNav === item.label;
                  return (
                    <button
                      key={item.label}
                      onClick={() => setActiveNav(item.label)}
                      className={`
                        px-4 py-2 text-sm font-medium rounded-sm transition-all duration-200
                        ${isActive 
                          ? 'bg-[#F04E30] text-white' 
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1A1A1A]/50'
                        }
                      `}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-xl relative">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search operations..."
                className="
                  w-full h-10 px-4 pr-10
                  bg-[#1A1A1A] text-sm text-white font-mono
                  placeholder:text-zinc-500
                  border border-[#333] rounded-sm
                  focus:outline-none focus:border-[#F04E30] focus:ring-1 focus:ring-[#F04E30]/50
                  transition-all
                "
              />
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500" strokeWidth={1.5} />
            </div>

            {/* Status Indicators Cluster */}
            <div className="flex items-center gap-6">
              {/* AI Status Pill */}
              {aiOpen && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="flex items-center gap-2 px-3 py-1 bg-[#F04E30] rounded-sm"
                >
                  <motion.div
                    className="w-2 h-2 rounded-full bg-white"
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white">
                    AI Active
                  </span>
                </motion.div>
              )}

              <button className="relative">
                <Bell size={18} className="text-zinc-400 hover:text-zinc-200 transition-colors" strokeWidth={1.5} />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#F04E30] rounded-full flex items-center justify-center text-[9px] font-bold text-white">
                  2
                </div>
              </button>

              <div className="text-xs font-mono text-zinc-400 tabular-nums">
                14:23 UTC
              </div>

              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#10b981]" />
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                  Operational
                </span>
              </div>

              <button className="w-8 h-8 bg-[#1A1A1A] border border-[#333] flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition-colors rounded-sm">
                <User size={16} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Sub-Header Breadcrumbs */}
          <div className="h-8 px-8 bg-[#1A1A1A] border-t border-[#333] flex items-center">
            <div className="flex items-center gap-2 text-xs font-mono">
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb} className="flex items-center gap-2">
                  <span className={index === breadcrumbs.length - 1 ? 'text-white' : 'text-zinc-500'}>
                    {crumb}
                  </span>
                  {index < breadcrumbs.length - 1 && (
                    <span className="text-zinc-600">/</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 bg-[#1A1A1A] p-8 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <div className="bg-[#2A2A2A] border border-[#333] rounded-sm p-6">
              <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">
                Active View
              </div>
              <h2 className="text-2xl font-semibold text-white mb-4">
                {activeNav}
              </h2>
              <p className="text-zinc-400 leading-relaxed">
                The <strong>Instrument Rail</strong> pattern maximizes horizontal space by using an 
                ultra-narrow 56px sidebar. The dominant full-width header contains primary navigation, 
                search, and status indicators. A secondary breadcrumb bar provides context. This layout 
                is ideal for data-dense applications requiring maximum viewport width.
              </p>

              {/* Sample Metrics */}
              <div className="mt-6 grid grid-cols-4 gap-4">
                {metricValues.map((value, i) => (
                  <div key={i} className="p-4 bg-[#1A1A1A] border border-[#333] rounded-sm">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1">
                      Telemetry {i + 1}
                    </div>
                    <div className="text-xl font-mono tabular-nums text-white">
                      {value.toFixed(0)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* AI Data Feed Panel */}
      <AnimatePresence>
        {aiOpen && (
          <motion.aside
            initial={{ x: 360 }}
            animate={{ x: 0 }}
            exit={{ x: 360 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="w-[360px] bg-[#2A2A2A] border-l border-[#333] flex flex-col relative"
          >
            {/* Vertical LED Strip */}
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#333] overflow-hidden">
              {aiStatus === 'ready' && (
                <div className="w-full h-full bg-[#F04E30]" />
              )}
              {aiStatus === 'thinking' && (
                <motion.div
                  className="w-full bg-[#f59e0b]"
                  animate={{ height: ['0%', '100%', '0%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
              {aiStatus === 'streaming' && (
                <motion.div
                  className="w-full h-1/3"
                  style={{
                    background: 'linear-gradient(to bottom, transparent, #2563eb, transparent)',
                  }}
                  animate={{ y: ['100%', '-100%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
              )}
              {aiStatus === 'error' && (
                <motion.div
                  className="w-full h-full bg-[#F04E30]"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              )}
            </div>

            {/* Scanline Effect */}
            <motion.div
              className="absolute left-0 right-0 h-1 pointer-events-none z-10"
              style={{
                background: 'linear-gradient(to right, transparent, rgba(37, 99, 235, 0.3), transparent)',
                filter: 'blur(1px)',
              }}
              animate={{ top: ['0%', '100%'] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            />

            {/* Header */}
            <div className="px-4 py-3 border-b border-[#333] relative z-20">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                  AI Data Feed
                </div>
                <button
                  onClick={() => setAiOpen(false)}
                  className="text-zinc-400 hover:text-zinc-200 transition-colors"
                  title="Close (⌘J)"
                >
                  <X size={16} strokeWidth={1.5} />
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-300">
                <LEDStatus status={aiStatus} size="sm" label="" />
                <span className="capitalize">{aiStatus}</span>
                <span className="text-zinc-600">·</span>
                <span className="font-mono tabular-nums text-zinc-400">
                  {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Thinking Indicator */}
            {aiStatus === 'thinking' && (
              <div className="px-4 py-3 border-b border-[#333]">
                <ThinkingIndicator material="tungsten" />
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {aiMessages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-zinc-500 text-sm mb-2">AI Data Feed Ready</div>
                  <div className="text-zinc-600 text-xs">
                    Ask about operations, metrics, or system status
                  </div>
                </div>
              ) : (
                aiMessages.map((message, index) => (
                  <AIMessage
                    key={index}
                    content={message.content}
                    isUser={message.isUser}
                    timestamp={message.timestamp}
                    material="tungsten"
                    showTimestamp={true}
                  />
                ))
              )}
            </div>

            {/* Context Badge */}
            <div className="px-4 py-2 border-t border-[#333]">
              <ContextBadge
                context={activeNav}
                dataPoints={Math.floor(metricValues.reduce((a, b) => a + b, 0) / 100)}
                material="tungsten"
              />
            </div>

            {/* Provider Info */}
            <div className="px-4 py-2 border-t border-[#333]">
              <div className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">
                Gemini 2.5 · Vertex AI
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[#333]">
              <AIInput
                value={aiInput}
                onChange={setAiInput}
                onSend={handleSendMessage}
                material="tungsten"
                placeholder="Query telemetry data..."
                disabled={aiStatus === 'thinking'}
              />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
