'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, ChevronDown, Sparkles, Send, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { useChatStore } from '@/lib/chat-store';
import { usePremiumChat } from '@/hooks/usePremiumChat';
import { useConversationMessages } from '@/lib/tanstack/hooks/useConversationMessages';
import { useGeneralConversations } from '@/lib/tanstack/hooks/useGeneralConversations';
import { Message as UIMessage } from '@/components/ui/chat-message';
import { MessageList } from '@/components/ui/message-list';
import { CopyButton } from '@/components/ui/copy-button';
// (StatusBadge removed from header to reduce visual weight)

export default function AiChatPanel() {
  const pathname = usePathname();
  const { aiChatOpen, toggleAiChat } = useAppStore();
  const { selectedContext } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();
  
  // Manage conversation ID
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isRecentsOpen, setIsRecentsOpen] = useState(false);
  const { data: conversations = [] } = useGeneralConversations();
  
  // Fetch messages for current conversation
  const { data: messagesData } = useConversationMessages(conversationId);
  const messages = useMemo(() => messagesData?.messages ?? [], [messagesData?.messages]);
  const shouldHidePanel = pathname === '/chat-enhanced';

  // Use Gemini-powered chat hook
  const {
    input,
    setInput,
    sendMessage,
    isStreaming,
    isThinking,
    error,
  } = usePremiumChat({
    conversationId,
    onConversationCreated: (newConversationId) => {
      setConversationId(newConversationId);
    },
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  // Transform messages to UI format
  const displayedMessages: UIMessage[] = messages.map((msg) => {
    console.log('🔍 Processing message:', {
      id: msg.id,
      role: msg.role,
      hasWeatherData: !!msg.weather_tool_data,
      weatherDataLength: msg.weather_tool_data?.length,
      weatherData: msg.weather_tool_data,
      hasAirportData: !!msg.airport_tool_data,
      airportDataLength: msg.airport_tool_data?.length
    });

    const toolInvocations: any[] = [];
    
    // Convert weatherData to toolInvocations format (for WeatherToolUI)
    if (msg.weather_tool_data && msg.weather_tool_data.length > 0) {
      console.log('✅ Converting weather_tool_data to toolInvocations:', msg.weather_tool_data);
      msg.weather_tool_data.forEach((weatherItem: any) => {
        // WeatherToolUI expects data in result.data format
        const toolInvocation = {
          state: 'result' as const,
          toolName: 'get_airport_weather',
          result: {
            data: weatherItem // Wrap in data object for WeatherToolUI
          }
        };
        console.log('📦 Created weather toolInvocation:', toolInvocation);
        toolInvocations.push(toolInvocation);
      });
    }
    
    // Convert airportData to toolInvocations format (for AirportInfoToolUI)
    if (msg.airport_tool_data && msg.airport_tool_data.length > 0) {
      console.log('✅ Converting airport_tool_data to toolInvocations:', msg.airport_tool_data);
      msg.airport_tool_data.forEach((airportItem: any) => {
        toolInvocations.push({
          state: 'result' as const,
          toolName: 'get_airport_details',
          result: {
            data: airportItem // Wrap in data object for consistency
          }
        });
      });
    }
    
    console.log('📋 Final toolInvocations for message:', {
      messageId: msg.id,
      toolInvocationsCount: toolInvocations.length,
      toolInvocations
    });
    
    return {
      id: msg.id,
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      createdAt: new Date(msg.created_at),
      toolInvocations: toolInvocations.length > 0 ? toolInvocations : undefined
    };
  });

  const isEmpty = displayedMessages.length === 0;
  const isLoading = isStreaming || isThinking;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Minimal keyboard handling: ESC closes panel
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && aiChatOpen) toggleAiChat();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [aiChatOpen, toggleAiChat]);

  // Recent conversations: pinned first, then most recent, limit 5
  const recentConversations = useMemo(() => {
    const pinned = conversations.filter(c => c.pinned);
    const others = conversations.filter(c => !c.pinned);
    const sortDesc = (a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    const ordered = [...pinned.sort(sortDesc), ...others.sort(sortDesc)];
    return ordered.slice(0, 5);
  }, [conversations]);

  if (shouldHidePanel) {
    return null;
  }

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const messageOptions = (message: UIMessage) => ({
    actions: (
      <CopyButton content={message.content} copyMessage="Copied response to clipboard!" />
    ),
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


  const handleNew = async () => {
    // Clear current conversation and prepare for new chat
    const previousConversationId = conversationId;
    
    // Set to null first (new conversation will be created on first message send)
    setConversationId(null);
    
    // Clear input
    setInput('');
    
    // Remove cached messages from the previous conversation to avoid showing old data
    if (previousConversationId) {
      queryClient.removeQueries({ 
        queryKey: ['conversation-messages', previousConversationId] 
      });
    }
    
    // Focus input for immediate typing
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  if (!aiChatOpen) {
    return (
      <button
        onClick={toggleAiChat}
        className="fixed right-4 top-1/2 -translate-y-1/2 bg-blue text-white px-2 py-5 shadow-md hover:bg-blue/90 transition-colors z-30 rounded-l-sm"
        title="Open AI Chat"
      >
        <ChevronRight size={18} className="rotate-180" />
      </button>
    );
  }

  return (
    <aside className="w-80 md:w-96 bg-card border-l border-border flex flex-col h-full max-h-full">
      <header className="px-4 py-2 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-text-primary">
          <Sparkles className="text-blue" size={16} />
          <span className="text-sm font-medium">AI Assistant</span>
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
      <section className="border-b border-border shrink-0">
        <button
          onClick={() => setIsRecentsOpen(!isRecentsOpen)}
          className="w-full px-4 py-2 flex items-center justify-between hover:bg-surface transition-colors"
        >
          <div className="flex items-center gap-2">
            {isRecentsOpen ? (
              <ChevronDown size={14} className="text-muted-foreground" />
            ) : (
              <ChevronRight size={14} className="text-muted-foreground" />
            )}
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Recents {!isRecentsOpen && recentConversations.length > 0 && `(${recentConversations.length})`}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleNew();
              }} 
              className="text-xs text-blue hover:underline" 
              title="Start new chat"
            >
              New
            </button>
            <Link 
              href="/chat-enhanced" 
              className="text-xs text-text-secondary hover:text-text-primary" 
              title="Open full chat"
              onClick={(e) => e.stopPropagation()}
            >
              Open
            </Link>
          </div>
        </button>
        
        {isRecentsOpen && (
          <ul className="px-2 pb-2 max-h-40 overflow-y-auto">
            {recentConversations.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => setConversationId(c.id)}
                  onMouseEnter={() => prefetchConversation(c.id)}
                  className={`w-full text-left px-2 h-9 flex items-center gap-2 border-l-2 transition-colors ${
                    conversationId === c.id ? 'border-blue bg-blue/5' : 'border-transparent hover:bg-surface hover:border-border'
                  }`}
                  title={c.title}
                >
                  <span className="truncate text-sm text-text-primary">{c.title}</span>
                  <span className="ml-auto text-[10px] text-text-secondary">{c.message_count}</span>
                </button>
              </li>
            ))}
            {recentConversations.length === 0 && (
              <li className="px-4 py-2 text-xs text-text-secondary">No recent chats</li>
            )}
          </ul>
        )}
      </section>

      {error && (
        <div className="px-6 py-3 text-sm text-red-600 bg-red-50 border-b border-border">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
        {isEmpty ? (
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
              messages={displayedMessages}
              isTyping={isLoading}
              messageOptions={messageOptions}
            />
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="p-3 border-t border-border shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask anything..."
            className="flex-1 px-3 py-2.5 border border-border rounded-none text-sm focus:outline-none focus:border-blue resize-none min-h-[56px] max-h-[120px]"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-3 py-2.5 bg-blue text-white hover:bg-blue/90 rounded-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
