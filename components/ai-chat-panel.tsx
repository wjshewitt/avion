'use client';

/**
 * @deprecated This component has been replaced by AiChatDrawer (ai-chat-drawer.tsx)
 * which implements the Avion Design Language v1.5 with precision instrumentation.
 * This file will be removed in the next release.
 * 
 * Migration: Use <AiChatDrawer /> instead of <AiChatPanel />
 */

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, ChevronDown, Sparkles, Settings, Search } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { useChatStore } from '@/lib/chat-store';
import { useChatSettings } from '@/lib/chat-settings-store';
import { usePremiumChat } from '@/hooks/usePremiumChat';
import { useGeneralConversations } from '@/lib/tanstack/hooks/useGeneralConversations';
import { Message as UIMessage } from '@/components/ui/chat-message';
import { MessageList } from '@/components/ui/message-list';
import { CopyButton } from '@/components/ui/copy-button';
import ChatModeSelector from '@/components/chat/ChatModeSelector';
import ChatSettingsModal from '@/components/chat/ChatSettingsModal';
import { useChatSessionStore } from '@/lib/chat-session-store';
import { groupConversationsByRecency, sortConversationsByUpdatedAt } from '@/lib/conversations';
import { getMessageText } from '@/lib/chat/messages';
import { usePageContext } from '@/lib/context/usePageContext';
import ContextBadge from '@/components/chat/ContextBadge';

export default function AiChatPanel() {
  // Log deprecation warning
  useEffect(() => {
    console.warn('⚠️  AiChatPanel is deprecated. Please use AiChatDrawer instead.');
  }, []);

  const pathname = usePathname();
  const { aiChatOpen, toggleAiChat, setSearchValue } = useAppStore();
  
  // Detect page context for context-aware chat
  usePageContext();
  const { selectedContext } = useChatStore();
  const { useSimpleChat, currentMode, setMode, showTimestamps, showThinkingProcess } = useChatSettings();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { sidebarConversationId, setConversationId } = useChatSessionStore();
  const [isRecentsOpen, setIsRecentsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [recentSearch, setRecentSearch] = useState('');
  const { data: conversations = [] } = useGeneralConversations();
  const conversationId = sidebarConversationId;

  const shouldHidePanel = pathname === '/chat-enhanced';

  // Use Gemini-powered chat hook
  const {
    messages,
    input,
    setInput,
    sendMessage,
    isStreaming,
    isThinking,
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
  const isLoading = isStreaming || isThinking;

  const providerLabel = useMemo(() => {
    if (!providerInfo) {
      return 'Provider: detecting…';
    }

    const providerName = providerInfo.provider === 'vertex' ? 'Vertex AI' : 'Gemini API';
    const modelName = providerInfo.model ?? 'gemini-2.5-flash';
    const thinkingSuffix = providerInfo.supportsThinking ? ' · Thinking enabled' : '';

    return `${providerName} · ${modelName}${thinkingSuffix}`;
  }, [providerInfo]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Keyboard handling
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // ESC closes panel
      if (e.key === 'Escape' && aiChatOpen) {
        toggleAiChat();
      }
    };
    
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [aiChatOpen, toggleAiChat]);

  // Recent conversations: pinned first, then most recent, limit 5
  const filteredConversations = useMemo(() => {
    if (!recentSearch.trim()) return conversations;
    const query = recentSearch.toLowerCase();
    return conversations.filter((conv) => conv.title.toLowerCase().includes(query));
  }, [conversations, recentSearch]);

  const groupedConversations = useMemo(
    () => groupConversationsByRecency(sortConversationsByUpdatedAt(filteredConversations)),
    [filteredConversations]
  );

  const handleSend = useCallback((messageText?: string) => {
    const textToSend = messageText ?? input.trim();
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

  const messageOptions = (message: UIMessage) => ({
    message,
    actions: <CopyButton content={getMessageText(message)} copyMessage="Copied response to clipboard!" />,
    showTimeStamp: showTimestamps,
  });

  // Prefetch conversation messages for snappy switching
  const prefetchConversation = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: ['conversation-messages', id],
      queryFn: async () => {
        const response = await fetch(`/api/chat/conversations/${id}/messages`);
        if (!response.ok) throw new Error('Failed to fetch messages');
        const data = await response.json();
        return { messages: data.messages, notFound: false };
      },
      staleTime: 10 * 60 * 1000,
    });
  };

  const renderSection = (
    label: string,
    items: Array<{ id: string; title: string; message_count: number }>
  ) => {
    if (items.length === 0) {
      return null;
    }

    return (
      <div className="space-y-2" key={label}>
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</div>
        <ul className="space-y-1">
          {items.map((item) => {
            const isActive = conversationId === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setConversationId('sidebar', item.id)}
                  onMouseEnter={() => prefetchConversation(item.id)}
                  className={`w-full text-left px-2 py-2 border-l-2 transition-colors text-xs ${
                    isActive ? 'border-blue bg-blue/5 text-text-primary' : 'border-transparent hover:bg-surface hover:border-border'
                  }`}
                  title={item.title}
                >
                  <div className="flex items-center gap-2">
                    <span className="truncate flex-1">{item.title}</span>
                    <span className="text-[10px] text-text-secondary">{item.message_count}</span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  const handleNew = () => {
    setConversationId('sidebar', null);
    setInput('');
    setSearchValue('');
    // Clear cached messages to ensure truly empty state
    queryClient.removeQueries({ queryKey: ['conversation-messages'] });
  };

  // Important: perform visibility checks only after all hooks are declared to keep hook order stable
  if (shouldHidePanel || !aiChatOpen) {
    return null;
  }

  return (
    <>
      {/* Mobile backdrop */}
      {aiChatOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-in fade-in duration-200"
          onClick={toggleAiChat}
        />
      )}

      {/* AI Sidebar */}
      <aside 
        className={`
          fixed top-16 right-0 bottom-0 z-50
          bg-card border-l border-border
          flex flex-col
          w-full md:w-96
          transform transition-all duration-300 ease-out
          ${aiChatOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        `}
        style={{ transitionProperty: 'transform, opacity' }}
      >
        {/* TOP: Action Buttons */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border shrink-0">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Conversations
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleNew}
              className="text-xs text-blue hover:underline font-medium" 
              title="Start new chat"
            >
              New
            </button>
            <Link 
              href={conversationId ? `/chat-enhanced?conversation=${conversationId}` : '/chat-enhanced'}
              className="text-xs text-text-secondary hover:text-text-primary font-medium" 
              title="Open full chat"
            >
              Open
            </Link>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-text-secondary hover:text-text-primary transition-colors"
              title="Settings"
            >
              <Settings size={14} />
            </button>
          </div>
        </div>

        {/* Mode Selector (hidden in simple chat mode) */}
        {!useSimpleChat && currentMode && (
          <ChatModeSelector
            mode={currentMode}
            onModeChange={setMode}
            compact={true}
          />
        )}

        {/* Context Indicator */}
        <ContextBadge />

        {error && !missingCredentials && (
          <div className="px-6 py-3 text-sm text-red-600 bg-red-50 border-b border-border">
            {error}
          </div>
        )}

        {/* MESSAGES AREA */}
        <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
          
          {missingCredentials ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="max-w-sm space-y-3">
                <h3 className="text-sm font-semibold text-text-primary">Connect your AI provider</h3>
                {missingCredentials === 'vertex' ? (
                  <>
                    <p className="text-xs text-text-secondary">
                      Provide <code className="rounded bg-muted px-1 py-0.5">GOOGLE_VERTEX_PROJECT</code> and service-account credentials (<code className="rounded bg-muted px-1 py-0.5">GOOGLE_VERTEX_CLIENT_EMAIL</code>, <code className="rounded bg-muted px-1 py-0.5">GOOGLE_VERTEX_PRIVATE_KEY</code>) or configure Google Application Default Credentials so the assistant can stream from Vertex AI.
                    </p>
                    <p className="text-xs text-text-secondary">
                      You can also fall back to the Gemini API by supplying <code className="rounded bg-muted px-1 py-0.5">GOOGLE_API_KEY</code> or <code className="rounded bg-muted px-1 py-0.5">GOOGLE_GENERATIVE_AI_API_KEY</code>.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-text-secondary">
                      Add a <code className="rounded bg-muted px-1 py-0.5">GOOGLE_API_KEY</code> (or <code className="rounded bg-muted px-1 py-0.5">GOOGLE_GENERATIVE_AI_API_KEY</code>) environment variable and redeploy to enable the Gemini API fallback.
                    </p>
                    <p className="text-xs text-text-secondary">
                      After updating the environment variable, refresh this page to begin chatting.
                    </p>
                  </>
                )}
              </div>
            </div>
          ) : isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-center max-w-sm">
                <h3 className="text-sm font-medium text-text-primary mb-1">Start a conversation</h3>
                <p className="text-xs text-text-secondary">Ask about flight ops, weather, risks, or planning.</p>
                <div className="mt-3 text-xs">
                  <Link href="/chat-enhanced" className="text-text-secondary hover:text-text-primary underline">Open full chat</Link>
                </div>
              </div>
            </div>
          ) : (
            <>
              <MessageList
                messages={messages}
                isTyping={isLoading && !showThinkingProcess}
                messageOptions={messageOptions}
              />
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

      {/* BOTTOM: AI Assistant Header + Recents */}
      <div className="shrink-0 border-t border-border">
        {/* HEADER: Context Badge + Close */}
        <header className="px-4 py-2 border-b border-border flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-text-primary">
              <Sparkles className="text-blue" size={16} />
              <span className="text-sm font-medium">AI Assistant</span>
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">
              {providerLabel}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedContext.type !== 'general' && (
              <div className="text-[10px] px-1.5 py-0.5 border border-border text-muted-foreground">
                {selectedContext.type === 'flight' ? 'Flight' : 'Airport'}
              </div>
            )}
            <button
              onClick={toggleAiChat}
              className="text-text-secondary hover:text-text-primary transition-colors"
              title="Close"
              aria-label="Close"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </header>

        {/* Recents - Collapsible */}
        <section>
          <button
            onClick={() => setIsRecentsOpen(!isRecentsOpen)}
            className="w-full px-4 py-2 flex items-center gap-2 hover:bg-surface transition-colors"
          >
            {isRecentsOpen ? (
              <ChevronDown size={14} className="text-muted-foreground" />
            ) : (
              <ChevronRight size={14} className="text-muted-foreground" />
            )}
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Recents {!isRecentsOpen && conversations.length > 0 && `(${conversations.length})`}
            </span>
          </button>
          
          {isRecentsOpen && (
            <div className="px-3 pb-3 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={12} />
                <input
                  type="text"
                  value={recentSearch}
                  onChange={(event) => setRecentSearch(event.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-8 pr-3 py-2 bg-muted/40 border border-border text-xs placeholder:text-muted-foreground focus:outline-none focus:border-blue"
                />
              </div>

              <div className="max-h-48 overflow-y-auto pr-1 space-y-4">
                {renderSection('Pinned', groupedConversations.pinned)}
                {renderSection('Today', groupedConversations.today)}
                {renderSection('Yesterday', groupedConversations.yesterday)}
                {renderSection('Last 7 Days', groupedConversations.lastWeek)}
                {renderSection('Older', groupedConversations.older)}

                {filteredConversations.length === 0 && (
                  <div className="text-xs text-text-secondary text-center py-6 border border-dashed border-border/60">
                    No conversations found
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Settings Modal */}
      <ChatSettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </aside>
    </>
  );
}
