'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sparkles, Settings, Search, X, Plus, MessageSquare, Clock } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { useChatStore } from '@/lib/chat-store';
import { useChatSettings } from '@/lib/chat-settings-store';
import { usePremiumChat } from '@/hooks/usePremiumChat';
import { useGeneralConversations } from '@/lib/tanstack/hooks/useGeneralConversations';
import { Message as UIMessage } from '@/components/ui/chat-message';
import { CopyButton } from '@/components/ui/copy-button';
import ChatModeSelector from '@/components/chat/ChatModeSelector';
import { useChatSessionStore } from '@/lib/chat-session-store';
import { getMessageText, getReasoningParts, getToolParts, type FlightChatMessage } from '@/lib/chat/messages';
import { usePageContext } from '@/lib/context/usePageContext';
import { AIMessage } from '@/components/ai-drawer/AIMessage';
import { AIInput } from '@/components/ai-drawer/AIInput';
import { ThinkingIndicator } from '@/components/ai-drawer/ThinkingIndicator';
import { ThinkingModal } from '@/components/ai-drawer/ThinkingModal';
import { ContextIndicator } from '@/components/ai-drawer/ContextIndicator';
import { AISettingsPanel } from '@/components/ai-drawer/AISettingsPanel';
import { WeatherToolUI, FlightSelectorToolUI, AirportInfoToolUI } from '@/components/chat/tool-ui';
import { GenericToolUI } from '@/components/chat/GenericToolUI';
import { cn } from '@/lib/utils';
import { ContextualSuggestions } from '@/components/chat/ContextualSuggestions';

export default function AiChatDrawer() {
  const pathname = usePathname();
  const router = useRouter();
  const { aiChatOpen, toggleAiChat, aiSettingsOpen, setAiSettingsOpen } = useAppStore();
  
  // Detect page context for context-aware chat
  usePageContext();
  const { selectedContext } = useChatStore();
  const { useSimpleChat, currentMode, setMode, showTimestamps, showThinkingProcess } = useChatSettings();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const {
    mainConversationId,
    sidebarConversationId,
    linkSurfaces,
    setConversationId,
  } = useChatSessionStore();
  const [recentSearch, setRecentSearch] = useState('');
  const { data: conversations = [] } = useGeneralConversations();
  const conversationId = sidebarConversationId;
  const isLinkedToMain = Boolean(conversationId && conversationId === mainConversationId);

  const shouldHidePanel = pathname === '/chat-enhanced';

  // Use Gemini-powered chat hook
  const {
    messages,
    input,
    setInput,
    sendMessage,
    isStreaming,
    isThinking,
    isResponseStreaming,
    error,
    missingCredentials,
    providerInfo,
  } = usePremiumChat({
    conversationId,
    surface: 'sidebar',
    onConversationCreated: (newConversationId) => {
      setConversationId('sidebar', newConversationId);
      queryClient.invalidateQueries({
        queryKey: ['conversation-messages', newConversationId],
        refetchType: 'active',
      });
    },
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  const isEmpty = messages.length === 0;
  const isLoading = isStreaming;

  // Determine AI status for LED
  const aiStatus: 'ready' | 'thinking' | 'streaming' | 'error' = 
    error ? 'error' : isResponseStreaming ? 'streaming' : isThinking ? 'thinking' : 'ready';

  const providerLabel = useMemo(() => {
    if (!providerInfo) {
      return 'Detecting...';
    }
    const modelName = providerInfo.model ?? 'gemini-2.5-flash';
    return modelName.replace('gemini-', '').replace('-', ' ').toUpperCase();
  }, [providerInfo]);

  // Extract thinking/reasoning content from the latest assistant message
  const thinkingContent = useMemo(() => {
    const latestAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');
    if (!latestAssistantMessage) {
      // If thinking but no message yet, show generic thoughts
      if (isThinking) {
        return [
          'Analyzing your request...',
          'Accessing relevant data sources...',
          'Formulating response...',
        ];
      }
      return [];
    }
    
    const reasoningParts = getReasoningParts(latestAssistantMessage);
    if (reasoningParts.length > 0) {
      return reasoningParts.map(part => part.text);
    }
    
    // Fallback thoughts if no reasoning parts but thinking
    if (isThinking) {
      return [
        'Processing query...',
        'Querying knowledge base...',
        'Synthesizing response...',
      ];
    }
    
    return [];
  }, [messages, isThinking]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Keyboard handling
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && aiChatOpen) {
        toggleAiChat();
      }
    };
    
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [aiChatOpen, toggleAiChat]);

  const handleSend = useCallback((messageText?: string) => {
    const normalized = typeof messageText === 'string' ? messageText : undefined;
    const textToSend = normalized ?? input.trim();
    if (!textToSend || isLoading || missingCredentials) return;
    void sendMessage(textToSend);
  }, [input, isLoading, missingCredentials, sendMessage]);

  // Expose handleSend to window for header to call
  useEffect(() => {
    if (aiChatOpen) {
      (window as any).__aiChatSend = handleSend;
    }
    return () => {
      delete (window as any).__aiChatSend;
    };
  }, [aiChatOpen, handleSend]);

  const [showHistory, setShowHistory] = useState(false);

  const handleNew = () => {
    setConversationId('sidebar', null);
    setInput('');
    setShowHistory(false);
    queryClient.removeQueries({ queryKey: ['conversation-messages'] });
  };

  const handleSelectConversation = (conversationId: string) => {
    setConversationId('sidebar', conversationId);
    setShowHistory(false);
  };

  // Don't render if hidden
  if (shouldHidePanel || !aiChatOpen) {
    return null;
  }

  return (
    <>
      {/* AI Drawer - 420px wide tungsten panel */}
      <AnimatePresence>
        {aiChatOpen && (
          <motion.div
            initial={{ x: 420 }}
            animate={{ x: 0 }}
            exit={{ x: 420 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 35,
            }}
            className="absolute right-0 top-10 bottom-0 z-50 w-[420px] flex flex-col overflow-hidden"
            style={{ 
              backgroundColor: 'var(--color-surface)',
              boxShadow: '-24px 0 48px rgba(0,0,0,0.12), inset 0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            {/* Conditional Content: Settings or Chat */}
            {aiSettingsOpen ? (
              <AISettingsPanel onBack={() => setAiSettingsOpen(false)} />
            ) : (
              <>
                {/* Header actions */}
                <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={handleNew} className="flex items-center gap-2 px-3 py-1.5 rounded-sm text-[11px] font-mono uppercase tracking-wider transition-colors hover:bg-[#F04E30]/10" style={{ color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}>
                      <Plus size={14} strokeWidth={1.5} />New Chat
                    </button>
                    <button onClick={() => setShowHistory(!showHistory)} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-sm text-[11px] font-mono uppercase tracking-wider transition-colors", showHistory && "bg-[#F04E30]/10")} style={{ color: showHistory ? '#F04E30' : 'var(--color-text-secondary)', border: `1px solid ${showHistory ? '#F04E30' : 'var(--color-border)'}` }}>
                      <Clock size={14} strokeWidth={1.5} />History
                    </button>
                    <button
                      onClick={() => {
                        if (!conversationId) return;
                        linkSurfaces(conversationId);
                        router.push(`/chat-enhanced?conversation=${conversationId}`);
                      }}
                      disabled={!conversationId}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-sm text-[11px] font-mono uppercase tracking-wider transition-colors"
                      style={{
                        color: conversationId ? 'var(--color-text-secondary)' : 'var(--color-text-muted)',
                        border: '1px solid var(--color-border)',
                        opacity: conversationId ? 1 : 0.4,
                      }}
                    >
                      Open Full Chat
                    </button>
                  </div>
                </div>

                {isLinkedToMain && (
                  <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-blue border-b" style={{ borderColor: 'var(--color-border)' }}>
                    Linked to main console
                  </div>
                )}

                {/* History Panel */}
                <AnimatePresence>
                  {showHistory && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-b" style={{ borderColor: 'var(--color-border)' }}>
                      <div className="max-h-64 overflow-y-auto p-2">
                        {conversations?.length > 0 ? conversations.slice(0, 10).map((conv: any) => {
                          const isActive = conv.id === conversationId;
                          return (
                            <button key={conv.id} onClick={() => handleSelectConversation(conv.id)} className={cn("w-full text-left px-3 py-2 rounded-sm transition-colors text-[12px] mb-1", isActive && "bg-[#F04E30]/10")} style={{ color: isActive ? '#F04E30' : 'var(--color-text-primary)', border: `1px solid ${isActive ? '#F04E30' : 'transparent'}` }}>
                              <div className="flex gap-2">
                                <MessageSquare size={14} strokeWidth={1.5} />
                                <div className="flex-1 truncate">{(conv.messages?.[0]?.content || 'New conversation').substring(0, 50)}</div>
                              </div>
                            </button>
                          );
                        }) : <div className="text-center py-8 text-[11px] text-muted-foreground font-mono">No history</div>}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Context Indicator - Prominent position */}
                <AnimatePresence mode="wait">
                  <ContextIndicator material="tungsten" />
                </AnimatePresence>

                {/* Mode Selector (if not simple chat) */}
                {!useSimpleChat && currentMode && (
                  <div 
                    className="border-b"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <ChatModeSelector
                      mode={currentMode}
                      onModeChange={setMode}
                      compact={true}
                    />
                  </div>
                )}

                {/* Messages Area with Scanline Effect */}
                <div 
              className="flex-1 overflow-y-auto relative"
              style={{ backgroundColor: 'var(--color-background-primary)' }}
            >
              {/* Scanline Effect */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
                }}
              />

              {missingCredentials ? (
                <div className="flex h-full flex-col items-center justify-center text-center p-8">
                  <div className="max-w-sm space-y-3">
                    <h3 
                      className="text-sm font-semibold"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      Connect your AI provider
                    </h3>
                    <p 
                      className="text-xs"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      Add <code 
                        className="rounded px-1 py-0.5"
                        style={{ backgroundColor: 'var(--color-surface-subtle)' }}
                      >GOOGLE_API_KEY</code> to enable AI assistance.
                    </p>
                  </div>
                </div>
              ) : isEmpty ? (
                /* Empty State - Avion v1.5 hero */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="flex items-center justify-center h-full px-8 py-16"
                >
                  <ContextualSuggestions
                    hasMessages={false}
                    disabled={false}
                    variant="drawer-empty-hero"
                    onSelect={(text) => {
                      setInput(text);
                      handleSend(text);
                    }}
                  />
                </motion.div>
              ) : (
                /* Messages List */
                <div className="p-5 space-y-4">
                  {messages.map((msg, idx) => {
                    const typedMsg = msg as FlightChatMessage;
                    const toolParts = getToolParts(typedMsg);

                    return (
                      <div key={msg.id || idx} className="space-y-2">
                        <AIMessage
                          content={getMessageText(msg)}
                          isUser={msg.role === 'user'}
                          timestamp={new Date(msg.createdAt || Date.now()).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          material="tungsten"
                          showTimestamp={showTimestamps}
                          toolCalls={toolParts}
                        />

                        {toolParts.length > 0 && (
                          <div className="space-y-1">
                            {toolParts.map((part) => (
                              <SidebarToolInvocation key={part.toolCallId} part={part} />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Loading Indicator - show when waiting for first token */}
                  {isLoading && (!showThinkingProcess || thinkingContent.length === 0) && (
                    <ThinkingIndicator material="tungsten" />
                  )}

                  {/* Thinking Modal - inline with messages */}
                  {isThinking && showThinkingProcess && thinkingContent.length > 0 && (
                    <ThinkingModal
                      isThinking={isThinking}
                      thoughts={thinkingContent}
                      material="tungsten"
                    />
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

interface SidebarToolInvocationProps {
  part: import('ai').ToolUIPart;
}

function SidebarToolInvocation({ part }: SidebarToolInvocationProps) {
  const toolName = part.type.replace('tool-', '');

  if (part.state === 'input-streaming' || part.state === 'input-available') {
    return (
      <div className="border border-border bg-surface-subtle px-3 py-1.5 text-[11px] font-mono uppercase tracking-widest text-text-secondary rounded-sm flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-blue animate-pulse" />
        <span>Calling {toolName}…</span>
      </div>
    );
  }

  if (part.state === 'output-error') {
    return (
      <div className="border border-red bg-red/5 px-3 py-1.5 text-[11px] font-mono uppercase tracking-widest text-red rounded-sm">
        Error in {toolName}
      </div>
    );
  }

  if (part.state === 'output-available') {
    const data = part.output ?? part.input;

    if (data && typeof data === 'object' && '__cancelled' in data) {
      return (
        <div className="border border-border bg-surface-subtle px-3 py-1.5 text-[11px] font-mono uppercase tracking-widest text-text-secondary rounded-sm">
          Tool execution cancelled
        </div>
      );
    }

    // Route to appropriate tool UI component
    if (toolName === 'get_airport_weather') {
      return <WeatherToolUI result={{ data: data as any }} />;
    }

    if (toolName === 'get_airport_capabilities') {
      return <AirportInfoToolUI result={{ data: data as any }} />;
    }

    if (toolName === 'get_user_flights') {
      return <FlightSelectorToolUI result={{ data: data as any }} />;
    }

    // Fallback: Generic collapsible tool UI
    return <GenericToolUI toolName={toolName} data={data} />;
  }

  return null;
}
