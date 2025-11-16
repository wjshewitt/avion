'use client';

import { useState, useEffect, useRef } from 'react';
import { Gauge, Plane, Cloud, MapPin, MessageSquare, Settings, Search, Bell, User, ChevronDown, ChevronLeft, ChevronRight, Sparkles, X, Send, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThinkingIndicator } from './shared/ThinkingIndicator';
import { LEDStatus } from './shared/LEDStatus';
import { AIInput } from './shared/AIInput';
import { ContextBadge } from './shared/ContextBadge';
import { AIMessage } from './shared/AIMessage';
import { FlightsInspiredAirportsPage } from '@/components/airports/FlightsInspiredAirportsPage';

const navGroups = [
  {
    label: 'Operations',
    items: [
      { icon: Gauge, label: 'Dashboard', count: null, status: 'nominal' },
      { icon: Plane, label: 'Flights', count: 12, status: 'nominal' },
    ]
  },
  {
    label: 'Information',
    items: [
      { icon: Cloud, label: 'Weather', count: 3, status: 'caution' },
      { icon: MapPin, label: 'Airports', count: null, status: 'nominal' },
    ]
  },
  {
    label: 'Tools',
    items: [
      { icon: MessageSquare, label: 'Chat', count: null, status: 'nominal' },
      { icon: Settings, label: 'Settings', count: null, status: 'nominal' },
    ]
  },
];

const statusColors = {
  nominal: '#10b981',
  caution: '#f59e0b',
  critical: '#F04E30',
};

export default function AdaptiveMissionControl() {
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [searchValue, setSearchValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiFloatingOpen, setAiFloatingOpen] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState<Array<{content: string; isUser: boolean; timestamp: string}>>([]);
  const [aiStatus, setAiStatus] = useState<'ready' | 'thinking' | 'streaming' | 'error'>('ready');
  const [aiInputMode, setAiInputMode] = useState(false);
  const [theme, setTheme] = useState<'ceramic' | 'tungsten'>('ceramic');
  const [searchInput, setSearchInput] = useState('');
  const [conversationPanelOpen, setConversationPanelOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Material palette
  const materials = {
    ceramic: {
      bg: '#F4F4F4',
      surface: '#FFFFFF',
      groove: '#e8e8e8',
      border: '#e0e0e0',
      text: {
        primary: '#18181b',
        secondary: '#71717a',
        tertiary: '#a1a1aa',
      },
      elevation: {
        shadow: '-2px -2px 5px rgba(255,255,255,0.8), 2px 2px 5px rgba(0,0,0,0.05)',
        groove: 'inset 1px 1px 3px rgba(0,0,0,0.08), inset -1px -1px 3px rgba(255,255,255,0.7)',
      },
    },
    tungsten: {
      bg: '#1A1A1A',
      surface: '#2A2A2A',
      groove: '#1A1A1A',
      border: '#333333',
      text: {
        primary: '#E5E5E5',
        secondary: '#a1a1aa',
        tertiary: '#71717a',
      },
      elevation: {
        shadow: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 1px 2px rgba(255,255,255,0.05)',
        groove: 'inset 1px 1px 3px rgba(0,0,0,0.5), inset -1px -1px 3px rgba(255,255,255,0.05)',
      },
    },
  };

  const getTheme = () => materials[theme];

  // Load saved state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('adaptive-sidebar-expanded');
    if (saved !== null) {
      setIsExpanded(saved === 'true');
    }
    
    // Load theme
    const savedTheme = localStorage.getItem('adaptive-theme');
    if (savedTheme === 'tungsten' || savedTheme === 'ceramic') {
      setTheme(savedTheme);
    }
  }, []);

  // Sync AI input mode with modal/floating OR conversation panel state
  useEffect(() => {
    setAiInputMode(aiModalOpen || aiFloatingOpen || conversationPanelOpen);
  }, [aiModalOpen, aiFloatingOpen, conversationPanelOpen]);

  // Auto-focus input when AI mode activates
  useEffect(() => {
    if (aiInputMode) {
      setTimeout(() => {
        const input = document.querySelector('input[type="text"]') as HTMLInputElement;
        input?.focus();
      }, 100);
    }
  }, [aiInputMode]);

  // Save state to localStorage
  const toggleSidebar = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    localStorage.setItem('adaptive-sidebar-expanded', String(newState));
  };

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'ceramic' ? 'tungsten' : 'ceramic';
    setTheme(newTheme);
    localStorage.setItem('adaptive-theme', newTheme);
  };

  // Get context-aware placeholder (header search version)
  const getHeaderPlaceholder = () => {
    if (aiInputMode) {
      return activeNav === 'Dashboard' 
        ? 'Ask about operations, status, or analytics...'
        : activeNav === 'Flights'
        ? 'Ask about flight plans, status, delays...'
        : activeNav === 'Weather'
        ? 'Ask about conditions, forecasts, risks...'
        : 'Ask the AI anything...';
    }
    return activeNav === 'Dashboard'
      ? 'Search operations, flights, weather, airports...'
      : activeNav === 'Flights'
      ? 'Search by flight code, airport, or status...'
      : activeNav === 'Weather'
      ? 'Search airports or compare conditions...'
      : 'Search...';
  };

  // Sidebar placeholder (shorter version)
  const getPlaceholder = () => {
    if (aiInputMode) {
      return 'Ask AI...';
    }
    return 'Search...';
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘B toggle sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
      // ⌘J toggle conversation panel
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        setConversationPanelOpen(!conversationPanelOpen);
      }
      // ⌘K focus header search bar
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
      // ⌘D toggle theme
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        toggleTheme();
      }
      // ESC close conversation panel
      if (e.key === 'Escape') {
        e.preventDefault();
        setConversationPanelOpen(false);
        setAiModalOpen(false);
        setAiFloatingOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [conversationPanelOpen, aiModalOpen, aiFloatingOpen, theme]);

  const handleSendMessage = () => {
    if (!aiInput.trim() || aiStatus === 'thinking') return;

    const userMessage = {
      content: aiInput,
      isUser: true,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
    setAiMessages(prev => [...prev, userMessage]);
    setAiInput('');
    setSearchValue(''); // Clear search value too
    setAiStatus('thinking');

    setTimeout(() => {
      setAiStatus('streaming');
      const aiResponse = {
        content: `Response to "${aiInput}": Adaptive Mission Control in ${theme} mode with search-to-AI input transformation.`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
      setAiMessages(prev => [...prev, aiResponse]);
      setAiStatus('ready');
    }, 2000);
  };

  // Flatten items for collapsed mode
  const allNavItems = navGroups.flatMap(group => group.items);

  return (
    <div 
      className="w-full h-full flex flex-col transition-colors duration-300"
      style={{ backgroundColor: getTheme().bg }}
    >
      {/* Header with Centered Search */}
      <header 
        className="h-12 border-b px-6 flex items-center gap-4 transition-colors duration-300 relative"
        style={{ 
          backgroundColor: getTheme().bg,
          borderColor: getTheme().border,
          boxShadow: theme === 'ceramic' ? '0 1px 3px rgba(0,0,0,0.04)' : 'none'
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-7 h-7 bg-zinc-900 flex items-center justify-center text-white font-bold text-xs">
            Av
          </div>
          <div>
            <div className="font-semibold text-sm" style={{ color: getTheme().text.primary }}>Avion</div>
          </div>
        </div>

        {/* CENTER: Search Bar / AI Input */}
        <div className="flex-1 max-w-2xl relative">
          <motion.div
            className="relative"
            animate={aiInputMode ? {
              scale: 1.03,
            } : {
              scale: 1.0,
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 28 }}
          >
            <input
              ref={searchInputRef}
              type="text"
              value={aiInputMode ? aiInput : searchInput}
              onChange={(e) => aiInputMode ? setAiInput(e.target.value) : setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && aiInputMode && aiInput.trim()) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={getHeaderPlaceholder()}
              className={`
                w-full h-10 px-5 text-[13px] font-mono
                placeholder:text-zinc-400
                border rounded-sm
                focus:outline-none
                transition-all duration-400 ease-out
                ${aiInputMode ? 'pr-12' : 'pr-20'}
              `}
              style={{
                backgroundColor: aiInputMode ? getTheme().surface : getTheme().groove,
                color: getTheme().text.primary,
                borderColor: aiInputMode ? '#F04E30' : getTheme().border,
                borderWidth: aiInputMode ? '2px' : '1px',
                boxShadow: aiInputMode 
                  ? '0 0 0 4px rgba(240,78,48,0.12), 0 8px 24px rgba(240,78,48,0.15)'
                  : getTheme().elevation.groove,
              }}
              aria-label={aiInputMode ? "AI conversation input" : "Search input"}
            />
            
            {/* Search Icon or Send Button */}
            <AnimatePresence mode="wait">
              {aiInputMode ? (
                <motion.button
                  key="send"
                  initial={{ scale: 0.4, opacity: 0, rotate: -45, x: 20 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0, x: 0 }}
                  exit={{ scale: 0.4, opacity: 0, rotate: 45, x: 20 }}
                  transition={{
                    type: 'spring',
                    stiffness: 600,
                    damping: 25,
                  }}
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!aiInput.trim() || aiStatus === 'thinking'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-sm flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, #F04E30 0%, #ff6b4a 100%)',
                    boxShadow: '0 2px 8px rgba(240,78,48,0.4)',
                  }}
                  title="Send (Enter)"
                >
                  <Send size={18} className="text-white" strokeWidth={2} />
                </motion.button>
              ) : (
                <motion.div
                  key="search-icons"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2"
                >
                  <span className="text-[10px] font-mono" style={{ color: getTheme().text.tertiary }}>
                    ⌘K
                  </span>
                  <Search size={16} style={{ color: getTheme().text.tertiary }} strokeWidth={1.5} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* RIGHT: Status + Controls */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Status Indicators */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
              <span 
                className="text-[10px] font-mono uppercase tracking-widest"
                style={{ color: getTheme().text.tertiary }}
              >
                Nominal
              </span>
            </div>

            <div className="text-xs font-mono tabular-nums" style={{ color: getTheme().text.secondary }}>
              14:23 UTC
            </div>
          </div>

          {/* Sparkles Button (AI Trigger) */}
          <AnimatePresence mode="wait">
            {conversationPanelOpen ? (
              <motion.button
                key="sparkles-active"
                animate={{
                  backgroundColor: '#F04E30',
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  backgroundColor: { duration: 0.3 },
                  scale: { duration: 0.5, repeat: Infinity, repeatDelay: 2 },
                }}
                onClick={() => setConversationPanelOpen(false)}
                className="w-10 h-10 rounded-sm flex items-center justify-center"
                style={{
                  boxShadow: '0 0 12px rgba(240,78,48,0.4)',
                }}
                title="AI Active — Close (⌘J)"
              >
                <Sparkles size={20} strokeWidth={2} className="text-white" />
              </motion.button>
            ) : (
              <button
                key="sparkles-default"
                onClick={() => setConversationPanelOpen(true)}
                className={`
                  w-10 h-10 rounded-sm flex items-center justify-center
                  transition-all duration-200
                  ${theme === 'ceramic'
                    ? 'bg-zinc-100 hover:bg-zinc-200'
                    : 'bg-zinc-800 hover:bg-zinc-700'
                  }
                `}
                title="AI Co-Pilot (⌘J)"
              >
                <Sparkles 
                  size={20} 
                  strokeWidth={1.5}
                  style={{ color: getTheme().text.secondary }}
                />
              </button>
            )}
          </AnimatePresence>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`
              w-8 h-8 flex items-center justify-center rounded-sm
              transition-all duration-200
              ${theme === 'ceramic'
                ? 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300'
                : 'bg-zinc-700 text-zinc-200 hover:bg-zinc-600'
              }
            `}
            title={`Switch to ${theme === 'ceramic' ? 'dark' : 'light'} mode (⌘D)`}
          >
            {theme === 'ceramic' ? (
              <Moon size={16} strokeWidth={1.5} />
            ) : (
              <Sun size={16} strokeWidth={1.5} />
            )}
          </button>

          {/* User Menu */}
          <button 
            className="flex items-center gap-2 px-3 py-1.5 rounded-sm hover:opacity-80 transition-all"
            style={{
              backgroundColor: getTheme().groove,
              border: `1px solid ${getTheme().border}`,
              color: getTheme().text.primary,
              boxShadow: theme === 'ceramic' ? '-1px -1px 3px rgba(255,255,255,0.8), 1px 1px 3px rgba(0,0,0,0.05)' : 'none',
            }}
          >
            <User size={14} strokeWidth={1.5} />
            <span className="text-xs font-medium">W. Shewitt</span>
            <ChevronDown size={12} strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* AI Conversation Drawer - Slides from right like FlightDeckClassic */}
      <AnimatePresence>
        {conversationPanelOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40"
              style={{ 
                backgroundColor: 'rgba(0,0,0,0.3)',
                backdropFilter: 'blur(8px)',
              }}
              onClick={() => setConversationPanelOpen(false)}
            />

            {/* AI Drawer - 420px wide tungsten panel */}
            <motion.div
              initial={{ x: 420 }}
              animate={{ x: 0 }}
              exit={{ x: 420 }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 35,
              }}
              className="fixed right-0 top-0 bottom-0 z-50 w-[420px] flex flex-col overflow-hidden"
              style={{ 
                backgroundColor: theme === 'ceramic' ? '#f5f5f5' : '#27272a',
                borderLeft: `2px solid #F04E30`,
                boxShadow: '-24px 0 48px rgba(0,0,0,0.12)',
              }}
            >
              {/* Corner Brackets (Safety Orange) */}
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#F04E30]" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#F04E30]" />
              
              {/* LED Strip - Vertical */}
              <div className="absolute left-0 top-16 bottom-16 w-1 flex flex-col gap-2 px-0.5">
                <motion.div
                  animate={{
                    backgroundColor: aiStatus === 'thinking' ? '#F59E0B' : '#10b981',
                  }}
                  transition={{ duration: 0.3 }}
                  className="h-8 w-full rounded-full"
                />
                <div className="flex-1 bg-zinc-800/20" />
              </div>

              {/* Header Bar */}
              <div 
                className="h-14 px-6 flex items-center justify-between border-b"
                style={{ 
                  backgroundColor: theme === 'ceramic' ? '#e8e8e8' : '#18181b',
                  borderColor: theme === 'ceramic' ? '#d4d4d4' : '#3f3f46',
                }}
              >
                <div className="flex items-center gap-3">
                  <Sparkles size={20} strokeWidth={2} className="text-[#F04E30]" />
                  <div>
                    <div 
                      className="text-sm font-mono font-semibold uppercase tracking-wide"
                      style={{ color: theme === 'ceramic' ? '#18181b' : '#fafafa' }}
                    >
                      AI Co-Pilot
                    </div>
                    <div 
                      className="text-[9px] font-mono uppercase tracking-widest"
                      style={{ color: theme === 'ceramic' ? '#71717a' : '#a1a1aa' }}
                    >
                      Gemini 2.5 Flash
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setConversationPanelOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-sm transition-all hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  title="Close (ESC)"
                >
                  <X size={18} strokeWidth={1.5} style={{ color: theme === 'ceramic' ? '#52525b' : '#a1a1aa' }} />
                </button>
              </div>

              {/* Messages Area with Scanline Effect */}
              <div 
                className="flex-1 overflow-y-auto relative"
                style={{ 
                  backgroundColor: theme === 'ceramic' ? '#fafafa' : '#1a1a1a',
                }}
              >
                {/* Scanline Effect */}
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
                  }}
                />

                {aiMessages.length === 0 ? (
                  /* Empty State */
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="flex flex-col items-center justify-center h-full px-8 py-12"
                  >
                    {/* Pulsing Icon */}
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.6, 1, 0.6],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="w-20 h-20 rounded-sm flex items-center justify-center mb-6"
                      style={{
                        backgroundColor: theme === 'ceramic' ? '#e8e8e8' : '#27272a',
                        border: `2px solid #F04E30`,
                        boxShadow: '0 0 24px rgba(240,78,48,0.2)',
                      }}
                    >
                      <Sparkles size={40} strokeWidth={1.5} className="text-[#F04E30]" />
                    </motion.div>

                    {/* Headline */}
                    <h3 
                      className="text-xl font-mono font-bold mb-3 text-center"
                      style={{ color: theme === 'ceramic' ? '#18181b' : '#fafafa' }}
                    >
                      Ready to Assist
                    </h3>

                    {/* Description */}
                    <p 
                      className="text-sm font-mono text-center max-w-xs mb-8 leading-relaxed"
                      style={{ color: theme === 'ceramic' ? '#52525b' : '#a1a1aa' }}
                    >
                      Ask about operations, weather, flights, or get intelligent assistance with any aviation task.
                    </p>

                    {/* Quick Prompt Chips */}
                    <div className="flex flex-col gap-2 w-full max-w-xs">
                      {[
                        '🌤️ Weather at EGLL',
                        '✈️ Active flights',
                        '📊 Operations summary',
                        '🗺️ Route analysis',
                      ].map((prompt, i) => (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + i * 0.1 }}
                          whileHover={{ scale: 1.02, x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setAiInput(prompt.substring(3)); // Remove emoji
                            searchInputRef.current?.focus();
                          }}
                          className="px-4 py-3 rounded-sm text-left text-sm font-mono transition-all"
                          style={{
                            backgroundColor: theme === 'ceramic' ? '#ffffff' : '#27272a',
                            border: `1px solid ${theme === 'ceramic' ? '#d4d4d4' : '#3f3f46'}`,
                            color: theme === 'ceramic' ? '#18181b' : '#fafafa',
                            boxShadow: theme === 'ceramic' 
                              ? '-1px -1px 2px rgba(255,255,255,0.8), 1px 1px 2px rgba(0,0,0,0.1)'
                              : 'none',
                          }}
                        >
                          {prompt}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  /* Messages List */
                  <div className="p-5 space-y-4">
                    {aiMessages.map((msg, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: msg.isUser ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.08, type: 'spring', stiffness: 400, damping: 30 }}
                        className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className="rounded-sm px-4 py-3 max-w-[85%]"
                          style={{
                            backgroundColor: msg.isUser 
                              ? (theme === 'ceramic' ? '#ffffff' : '#3f3f46')
                              : (theme === 'ceramic' ? '#f0f9ff' : '#1e3a5f'),
                            border: msg.isUser 
                              ? `1px solid ${theme === 'ceramic' ? '#e4e4e7' : '#52525b'}`
                              : '2px solid #3b82f6',
                            boxShadow: theme === 'ceramic' 
                              ? '0 2px 8px rgba(0,0,0,0.06)'
                              : '0 4px 12px rgba(0,0,0,0.3)',
                          }}
                        >
                          {!msg.isUser && (
                            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-blue-500/20">
                              <Sparkles size={14} strokeWidth={2} className="text-blue-500" />
                              <span 
                                className="text-[10px] font-mono uppercase tracking-widest font-bold text-blue-500"
                              >
                                Avion AI
                              </span>
                            </div>
                          )}
                          <p 
                            className="text-sm font-mono leading-relaxed whitespace-pre-wrap"
                            style={{ color: theme === 'ceramic' ? '#18181b' : '#fafafa' }}
                          >
                            {msg.content}
                          </p>
                          <div 
                            className="text-[9px] font-mono mt-2 opacity-50"
                            style={{ color: theme === 'ceramic' ? '#71717a' : '#a1a1aa' }}
                          >
                            {msg.timestamp}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Input Area */}
              <div 
                className="p-4 border-t"
                style={{ 
                  backgroundColor: theme === 'ceramic' ? '#e8e8e8' : '#18181b',
                  borderColor: theme === 'ceramic' ? '#d4d4d4' : '#3f3f46',
                }}
              >
                {/* Context Badge */}
                <div className="mb-3 flex items-center gap-2">
                  <div 
                    className="flex items-center gap-2 px-2 py-1 rounded-sm"
                    style={{
                      backgroundColor: theme === 'ceramic' ? '#f5f5f5' : '#27272a',
                      border: `1px solid ${theme === 'ceramic' ? '#d4d4d4' : '#3f3f46'}`,
                    }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span 
                      className="text-[9px] font-mono uppercase tracking-widest"
                      style={{ color: theme === 'ceramic' ? '#71717a' : '#a1a1aa' }}
                    >
                      {activeNav} Context
                    </span>
                  </div>
                </div>

                {/* Input + Send Button (uses header search when focused) */}
                <div className="text-[10px] font-mono text-center mb-2" style={{ color: theme === 'ceramic' ? '#a1a1aa' : '#71717a' }}>
                  Use header search (⌘K) to send messages
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area with Adaptive Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Adaptive Ceramic Sidebar */}
        <motion.aside
          animate={{ width: isExpanded ? 200 : 56 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="border-r flex flex-col overflow-hidden transition-colors duration-300"
          style={{ 
            backgroundColor: getTheme().bg,
            borderColor: getTheme().border 
          }}
        >
          {isExpanded ? (
            /* EXPANDED STATE */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full p-4 space-y-6"
            >
              {/* Search / AI Input */}
              <div className="relative">
                <motion.input
                  type="text"
                  value={aiInputMode ? aiInput : searchValue}
                  onChange={(e) => aiInputMode ? setAiInput(e.target.value) : setSearchValue(e.target.value)}
                  placeholder={getPlaceholder()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && aiInputMode && aiInput.trim()) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className={`
                    w-full h-9 px-3 text-xs font-mono
                    placeholder:text-zinc-400
                    border rounded-sm
                    focus:outline-none
                    transition-all duration-300 ease-out
                    ${aiInputMode 
                      ? 'pr-12 border-[#F04E30] ring-1 ring-[#F04E30]/30'
                      : 'pr-9'
                    }
                  `}
                  style={{
                    backgroundColor: aiInputMode ? getTheme().surface : getTheme().groove,
                    color: getTheme().text.primary,
                    borderColor: aiInputMode ? '#F04E30' : getTheme().border,
                    boxShadow: aiInputMode 
                      ? '0 0 0 3px rgba(240,78,48,0.05)'
                      : getTheme().elevation.groove,
                  }}
                  animate={{
                    scale: aiInputMode ? 1.02 : 1,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  aria-label={aiInputMode ? "AI assistant input" : "Search navigation"}
                />
                
                <AnimatePresence mode="wait">
                  {aiInputMode ? (
                    <motion.button
                      key="send"
                      initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      exit={{ scale: 0.8, opacity: 0, rotate: 10 }}
                      transition={{ 
                        type: 'spring', 
                        stiffness: 500, 
                        damping: 25,
                        duration: 0.2,
                      }}
                      type="button"
                      onClick={handleSendMessage}
                      disabled={!aiInput.trim() || aiStatus === 'thinking'}
                      className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 bg-[#F04E30] text-white rounded-sm hover:bg-[#F04E30]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      title="Send (Enter)"
                    >
                      <Send size={14} strokeWidth={1.5} />
                    </motion.button>
                  ) : (
                    <motion.div
                      key="search-icon"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: getTheme().text.tertiary }}
                    >
                      <Search size={14} strokeWidth={1.5} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Segmented Navigation Groups */}
              <div className="flex-1 space-y-6 overflow-y-auto">
                {navGroups.map((group) => (
                  <div key={group.label} className="space-y-2">
                    {/* Group Label */}
                    <div 
                      className="text-[10px] font-mono uppercase tracking-widest px-2"
                      style={{ color: getTheme().text.tertiary }}
                    >
                      {group.label}
                    </div>

                    {/* Group Container with Groove */}
                    <div 
                      className="border rounded-sm p-1 transition-all duration-300"
                      style={{
                        backgroundColor: getTheme().groove,
                        borderColor: getTheme().border,
                        boxShadow: getTheme().elevation.groove,
                      }}
                    >
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
                            `}
                            style={isActive ? {
                              backgroundColor: theme === 'ceramic' ? '#FFFFFF' : '#2A2A2A',
                              color: getTheme().text.primary,
                              boxShadow: theme === 'ceramic' 
                                ? '-1px -1px 3px rgba(255,255,255,0.8), 1px 1px 3px rgba(0,0,0,0.08)'
                                : 'inset 0 2px 4px rgba(0,0,0,0.3)',
                            } : {
                              color: getTheme().text.secondary,
                            }}
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
              </div>

              {/* AI Assistant Section */}
              <div 
                className="pt-4 border-t space-y-2 transition-colors duration-300"
                style={{ borderColor: getTheme().border }}
              >
                <div 
                  className="text-[10px] font-mono uppercase tracking-widest px-2"
                  style={{ color: getTheme().text.tertiary }}
                >
                  AI Assistant
                </div>
                
                <div 
                  className="border rounded-sm p-2 transition-all duration-300"
                  style={{
                    backgroundColor: getTheme().groove,
                    borderColor: getTheme().border,
                    boxShadow: getTheme().elevation.groove,
                  }}
                >
                  <button
                    onClick={() => setAiModalOpen(true)}
                    className="w-full flex items-center gap-2 px-2 py-2 text-xs rounded-sm transition-all hover:opacity-80"
                    style={{ color: getTheme().text.secondary }}
                    title="AI Co-Pilot (⌘J)"
                  >
                    <LEDStatus status={aiStatus} size="sm" label="" />
                    <span className="flex-1 text-left">Ask a question...</span>
                    <Sparkles size={14} strokeWidth={1.5} style={{ color: getTheme().text.tertiary }} />
                  </button>
                </div>
              </div>

              {/* Profile Section at Bottom */}
              <div 
                className="pt-4 border-t space-y-3 transition-colors duration-300"
                style={{ borderColor: getTheme().border }}
              >
                <div 
                  className="border rounded-sm p-3 transition-all duration-300"
                  style={{
                    backgroundColor: getTheme().groove,
                    borderColor: getTheme().border,
                    boxShadow: getTheme().elevation.groove,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-700 flex items-center justify-center text-white text-xs font-semibold rounded-sm">
                      WS
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold truncate" style={{ color: getTheme().text.primary }}>Will Shewitt</div>
                      <div className="text-[10px] font-mono truncate" style={{ color: getTheme().text.tertiary }}>ops@avion.ai</div>
                    </div>
                  </div>
                </div>

                {/* Toggle Button */}
                <button
                  onClick={toggleSidebar}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-sm transition-all hover:opacity-80"
                  style={{ color: getTheme().text.secondary }}
                  title="Collapse sidebar (⌘B)"
                >
                  <span className="text-xs font-medium">Collapse</span>
                  <ChevronLeft size={16} strokeWidth={1.5} />
                </button>

                {/* Keyboard Shortcuts */}
                <div 
                  className="px-3 py-2 border-t text-[9px] font-mono uppercase tracking-wider space-y-1 transition-colors duration-300"
                  style={{ 
                    borderColor: getTheme().border,
                    color: getTheme().text.tertiary,
                  }}
                >
                  <div>⌘K Focus · ⌘J AI · ⌘D Theme</div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* COLLAPSED STATE */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full py-4 items-center relative"
            >
              {/* Vertical Breadcrumb Strip */}
              <div 
                className="absolute left-0 top-16 w-full h-24 flex flex-col items-center justify-center gap-1 py-2"
                style={{
                  backgroundColor: theme === 'ceramic' ? '#e8e8e8' : '#1A1A1A',
                  boxShadow: getTheme().elevation.groove,
                }}
              >
                <div className="flex flex-col items-center gap-1">
                  <span 
                    className="text-[8px] font-mono uppercase tracking-wider rotate-0 text-center"
                    style={{ 
                      color: theme === 'ceramic' ? '#71717a' : '#52525b',
                      writingMode: 'vertical-rl',
                      textOrientation: 'mixed',
                    }}
                  >
                    Ops
                  </span>
                  <div 
                    className="w-3 h-px"
                    style={{ backgroundColor: theme === 'ceramic' ? '#d4d4d8' : '#3f3f46' }}
                  />
                  <span 
                    className="text-[8px] font-mono uppercase tracking-wider font-semibold"
                    style={{ 
                      color: theme === 'ceramic' ? '#18181b' : '#fafafa',
                      writingMode: 'vertical-rl',
                      textOrientation: 'mixed',
                    }}
                  >
                    {activeNav.slice(0, 3)}
                  </span>
                </div>
              </div>

              {/* AI Trigger Button at Top */}
              <div className="px-2 w-full mb-6">
                <button
                  onClick={() => setAiFloatingOpen(!aiFloatingOpen)}
                  className={`
                    w-full h-12 flex items-center justify-center rounded-sm relative
                    transition-all duration-200
                    ${aiFloatingOpen
                      ? 'bg-white text-zinc-900 shadow-[-1px_-1px_3px_rgba(255,255,255,0.8),1px_1px_3px_rgba(0,0,0,0.08)]'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/50'
                    }
                  `}
                  title="AI Co-Pilot (⌘J)"
                >
                  {aiFloatingOpen && (
                    <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#F04E30]" />
                  )}
                  <Sparkles size={20} strokeWidth={1.5} />
                </button>
              </div>

              {/* Icon-Only Navigation */}
              <nav className="flex-1 space-y-2 px-2 w-full">
                {allNavItems.map((item) => {
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
                      {/* Corner Brackets on Active - Soft zinc instead of Safety Orange */}
                      {isActive && (
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="absolute top-0 left-0 w-2 h-2 border-l border-t" style={{ borderColor: 'rgba(161,161,170,0.4)' }} />
                          <div className="absolute top-0 right-0 w-2 h-2 border-r border-t" style={{ borderColor: 'rgba(161,161,170,0.4)' }} />
                          <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b" style={{ borderColor: 'rgba(161,161,170,0.4)' }} />
                          <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b" style={{ borderColor: 'rgba(161,161,170,0.4)' }} />
                        </div>
                      )}

                      <button
                        onClick={() => setActiveNav(item.label)}
                        className={`
                          relative w-full h-12 flex items-center justify-center rounded-sm
                          transition-all duration-200
                          ${!isActive && (theme === 'ceramic' ? 'hover:bg-white/50' : 'hover:bg-zinc-800/50')}
                        `}
                        style={isActive ? {
                          backgroundColor: theme === 'ceramic' ? '#FFFFFF' : '#2A2A2A',
                          color: theme === 'ceramic' ? '#18181b' : '#e5e5e5',
                          boxShadow: theme === 'ceramic'
                            ? 'inset 1px 1px 3px rgba(0,0,0,0.08), inset -1px -1px 3px rgba(255,255,255,0.7)'
                            : 'inset 1px 1px 3px rgba(0,0,0,0.5), inset -1px -1px 3px rgba(255,255,255,0.05)',
                        } : {
                          color: theme === 'ceramic' ? '#71717a' : '#a1a1aa',
                        }}
                      >
                        {/* LED Status Dot - unified position at 8px/8px */}
                        <div
                          className="absolute w-1.5 h-1.5 rounded-full"
                          style={{ 
                            top: '8px',
                            left: '8px',
                            backgroundColor: statusColors[item.status as keyof typeof statusColors] 
                          }}
                        />
                        
                        <Icon size={20} strokeWidth={1.5} />

                        {/* Count Badge */}
                        {item.count !== null && (
                          <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#F04E30] rounded-full flex items-center justify-center">
                            <span className="text-[9px] font-mono font-bold text-white">
                              {item.count}
                            </span>
                          </div>
                        )}
                      </button>

                      {/* Tooltip on Hover */}
                      <AnimatePresence>
                        {isHovered && !isActive && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.15 }}
                            className="absolute left-full top-1/2 -translate-y-1/2 ml-4 z-50"
                          >
                            <div className="bg-white border border-zinc-300 px-3 py-2 rounded-sm shadow-lg whitespace-nowrap">
                              <div className="text-xs font-medium text-zinc-900">
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

              {/* Profile Avatar Only */}
              <div 
                className="pt-4 border-t w-full px-2 space-y-3 transition-colors duration-300"
                style={{ borderColor: getTheme().border }}
              >
                <div className="w-full flex justify-center">
                  <div className="w-10 h-10 bg-zinc-700 flex items-center justify-center text-white text-xs font-semibold rounded-sm">
                    WS
                  </div>
                </div>

                {/* Toggle Button - Icon Only */}
                <button
                  onClick={toggleSidebar}
                  className="w-full h-10 flex items-center justify-center rounded-sm transition-all"
                  style={{ 
                    color: getTheme().text.secondary,
                  }}
                  title="Expand sidebar (⌘B)"
                >
                  <ChevronRight size={16} strokeWidth={1.5} />
                </button>
              </div>
            </motion.div>
          )}
        </motion.aside>

        {/* Main Content */}
        <main 
          className="flex-1 overflow-auto transition-colors duration-300"
          style={{ backgroundColor: theme === 'ceramic' ? '#FFFFFF' : '#0A0A0A' }}
        >
          {/* Breadcrumb Navigation */}
          <div className="relative h-9">
            <div 
              className="h-full px-8 flex items-center relative"
              style={{ 
                backgroundColor: theme === 'ceramic' ? '#e8e8e8' : '#1A1A1A',
                clipPath: 'polygon(0 0, 100% 0, calc(100% - 12px) 100%, 0 100%)',
                width: 'fit-content',
                boxShadow: getTheme().elevation.groove,
              }}
            >
              <div className="flex items-center gap-2 text-[10px] font-mono pr-4">
                <span style={{ color: theme === 'ceramic' ? '#71717a' : '#52525b' }}>
                  Operations
                </span>
                <span style={{ color: theme === 'ceramic' ? '#d4d4d8' : '#3f3f46' }}>
                  /
                </span>
                <span style={{ color: theme === 'ceramic' ? '#71717a' : '#52525b' }}>
                  {activeNav}
                </span>
                <span style={{ color: theme === 'ceramic' ? '#d4d4d8' : '#3f3f46' }}>
                  /
                </span>
                <span style={{ color: theme === 'ceramic' ? '#18181b' : '#fafafa' }}>
                  Overview
                </span>
              </div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto p-8">
            {activeNav === 'Airports' ? (
              <div className="space-y-6">
                <FlightsInspiredAirportsPage />
              </div>
            ) : (
              <div
                className="border rounded-sm p-6 transition-all duration-300"
                style={{
                  backgroundColor: getTheme().bg,
                  borderColor: getTheme().border,
                  boxShadow: getTheme().elevation.shadow,
                }}
              >
                <div
                  className="mb-2 text-[10px] font-mono uppercase tracking-widest"
                  style={{ color: getTheme().text.tertiary }}
                >
                  Current View
                </div>
                <h2
                  className="mb-4 text-2xl font-semibold"
                  style={{ color: getTheme().text.primary }}
                >
                  {activeNav}
                </h2>

                <p className="mb-6 leading-relaxed" style={{ color: getTheme().text.secondary }}>
                  The <strong>Adaptive Mission Control</strong> combines the best of both worlds: the organized
                  grouped navigation and ceramic aesthetic of Mission Control Split, with the space-saving collapsible
                  capability of Instrument Rail. Toggle between full navigation groups (200px) or minimal icon-only
                  rail (56px) using the button at the bottom or pressing{' '}
                  <kbd className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs">⌘B</kbd>.
                </p>

                {/* Feature Highlights */}
                <div className="mb-6 grid grid-cols-2 gap-4">
                  <div className="rounded-sm border border-zinc-200 bg-white p-4 shadow-[-1px_-1px_3px_rgba(255,255,255,0.8),1px_1px_3px_rgba(0,0,0,0.04)]">
                    <div className="mb-2 text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                      Expanded Mode
                    </div>
                    <p className="text-sm text-zinc-600">
                      Full navigation with grouped sections, search, labels, count badges, and profile details.
                      Perfect for exploration and discovery.
                    </p>
                  </div>

                  <div className="rounded-sm border border-zinc-200 bg-white p-4 shadow-[-1px_-1px_3px_rgba(255,255,255,0.8),1px_1px_3px_rgba(0,0,0,0.04)]">
                    <div className="mb-2 text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                      Collapsed Mode
                    </div>
                    <p className="text-sm text-zinc-600">
                      Icon-only rail with LED status indicators, corner brackets on active items, and hover tooltips.
                      Maximum viewport space for content.
                    </p>
                  </div>
                </div>

                {/* Data Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Active Flights', value: '12', unit: 'aircraft' },
                    { label: 'Weather Alerts', value: '3', unit: 'locations' },
                    { label: 'System Load', value: '47', unit: 'percent' },
                    { label: 'Data Latency', value: '23', unit: 'ms' },
                  ].map((metric, i) => (
                    <div
                      key={i}
                      className="rounded-sm border border-zinc-200 bg-white p-4 shadow-[-1px_-1px_3px_rgba(255,255,255,0.8),1px_1px_3px_rgba(0,0,0,0.04)]"
                    >
                      <div className="mb-1 text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                        {metric.label}
                      </div>
                      <div className="flex items-baseline gap-2">
                        <div className="font-mono text-3xl tabular-nums text-zinc-900">
                          {metric.value}
                        </div>
                        <div className="text-xs text-zinc-500">{metric.unit}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* AI Modal (Expanded State) */}
      <AnimatePresence>
        {aiModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setAiModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="w-[420px] max-h-[640px] bg-[#F4F4F4] border-2 border-zinc-300 rounded-sm flex flex-col relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Corner Brackets */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-[#F04E30]" />
                <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-[#F04E30]" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-[#F04E30]" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-[#F04E30]" />
              </div>

              {/* Modal Content */}
              <div className="flex-1 flex flex-col relative z-10">
                {/* Header */}
                <div className="px-4 py-3 border-b border-zinc-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LEDStatus status={aiStatus} size="sm" label="" />
                    <div>
                      <div className="text-sm font-semibold text-zinc-900">AI Co-Pilot</div>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                        Adaptive Mode
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setAiModalOpen(false)}
                    className="text-zinc-400 hover:text-zinc-900 transition-colors"
                  >
                    <X size={18} strokeWidth={1.5} />
                  </button>
                </div>

                {/* Thinking Indicator */}
                {aiStatus === 'thinking' && (
                  <div className="px-4 py-3 border-b border-zinc-200">
                    <ThinkingIndicator material="ceramic" />
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {aiMessages.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-zinc-500 text-sm mb-2">AI Co-Pilot Ready</div>
                      <div className="text-zinc-600 text-xs">
                        Ask about operations, data, or system status
                      </div>
                    </div>
                  ) : (
                    aiMessages.map((message, index) => (
                      <AIMessage
                        key={index}
                        content={message.content}
                        isUser={message.isUser}
                        timestamp={message.timestamp}
                        material="ceramic"
                        showTimestamp={false}
                      />
                    ))
                  )}
                </div>

                {/* Context Badge */}
                <div className="px-4 pb-3">
                  <ContextBadge context={activeNav} dataPoints={5} material="ceramic" />
                </div>

                {/* Input */}
                <div className="px-4 pb-4 border-t border-zinc-200 pt-3">
                  <AIInput
                    value={aiInput}
                    onChange={setAiInput}
                    onSend={handleSendMessage}
                    material="ceramic"
                    placeholder="Ask about operations..."
                    disabled={aiStatus === 'thinking'}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Floating Panel (Collapsed State) */}
      <AnimatePresence>
        {!isExpanded && aiFloatingOpen && (
          <>
            {/* Click Outside Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setAiFloatingOpen(false)}
            />

            {/* Floating Panel */}
            <motion.div
              initial={{ x: -20, opacity: 0, scale: 0.95 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: -20, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="fixed top-16 left-16 w-[280px] h-[500px] bg-[#F4F4F4] border-2 border-zinc-300 rounded-sm shadow-[0_8px_32px_rgba(0,0,0,0.15)] flex flex-col z-50 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Corner Brackets */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-[#F04E30]" />
                <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-[#F04E30]" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-[#F04E30]" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-[#F04E30]" />
              </div>

              {/* Panel Content */}
              <div className="flex-1 flex flex-col relative z-10">
                {/* Header */}
                <div className="px-3 py-2 border-b border-zinc-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LEDStatus status={aiStatus} size="sm" label="" />
                    <div>
                      <div className="text-xs font-semibold text-zinc-900">AI Co-Pilot</div>
                      <div className="text-[9px] font-mono uppercase tracking-widest text-zinc-400">
                        Floating Mode
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setAiFloatingOpen(false)}
                    className="text-zinc-400 hover:text-zinc-900 transition-colors"
                  >
                    <X size={16} strokeWidth={1.5} />
                  </button>
                </div>

                {/* Thinking Indicator */}
                {aiStatus === 'thinking' && (
                  <div className="px-3 py-2 border-b border-zinc-200">
                    <ThinkingIndicator material="ceramic" />
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {aiMessages.length === 0 ? (
                    <div className="text-center py-6">
                      <div className="text-zinc-500 text-xs mb-1">AI Co-Pilot</div>
                      <div className="text-zinc-600 text-[10px]">
                        Ask a question
                      </div>
                    </div>
                  ) : (
                    aiMessages.map((message, index) => (
                      <div key={index} className={`${message.isUser ? 'ml-auto' : ''} max-w-[90%]`}>
                        <div className={`
                          rounded-sm p-2 text-[11px]
                          ${message.isUser 
                            ? 'bg-white border border-zinc-200 text-zinc-900 shadow-[-1px_-1px_3px_rgba(255,255,255,0.8),1px_1px_3px_rgba(0,0,0,0.05)]' 
                            : 'bg-white border-l-2 border-[#2563eb] border-t border-r border-b border-zinc-200 text-zinc-900'
                          }
                        `}>
                          {!message.isUser && (
                            <div className="text-[8px] font-mono uppercase tracking-widest text-[#2563eb] mb-1">
                              AVION AI v1.5
                            </div>
                          )}
                          <div className="leading-relaxed">{message.content}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Context Badge */}
                <div className="px-3 pb-2">
                  <div className="px-2 py-1.5 bg-white border border-zinc-200 rounded-sm">
                    <div className="text-[9px] font-mono uppercase tracking-widest text-zinc-400 mb-0.5">
                      Context
                    </div>
                    <div className="text-[10px] font-medium text-zinc-900">
                      {activeNav}
                    </div>
                  </div>
                </div>

                {/* Input */}
                <div className="px-3 pb-3 border-t border-zinc-200 pt-2">
                  <AIInput
                    value={aiInput}
                    onChange={setAiInput}
                    onSend={handleSendMessage}
                    material="ceramic"
                    placeholder="Ask..."
                    disabled={aiStatus === 'thinking'}
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
