'use client';

import { Suspense, useEffect, useMemo, useCallback, useState, useRef, memo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowRight, Bot } from 'lucide-react';
import { usePremiumChat } from '@/hooks/usePremiumChat';
import { useFlights } from '@/lib/tanstack/hooks/useFlights';
import { useGeneralConversations } from '@/lib/tanstack/hooks/useGeneralConversations';
import { useChatSessionStore } from '@/lib/chat-session-store';
import ChatSettingsPanel from '@/components/chat/ChatSettingsPanel';
import { useChatSettings } from '@/lib/chat-settings-store';
import { getReasoningParts, type FlightChatMessage, getToolParts, getMessageText } from '@/lib/chat/messages';
import { usePageContext } from '@/lib/context/usePageContext';
import { requestConversationTitle } from '@/lib/chat/title-client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AIMessage } from '@/components/ai-drawer/AIMessage';
import { ThinkingIndicator } from '@/components/ai-drawer/ThinkingIndicator';
import { ThinkingModal } from '@/components/ai-drawer/ThinkingModal';
import { WeatherToolUI, FlightSelectorToolUI, AirportInfoToolUI } from '@/components/chat/tool-ui';
import { GenericToolUI } from '@/components/chat/GenericToolUI';
import { ConversationSidebar } from '@/components/chat-enhanced/ConversationSidebar';
import { ChatHeader } from '@/components/chat-enhanced/ChatHeader';

const MIN_MESSAGES_FOR_TITLE = 2;

export const dynamic = 'force-dynamic';

const MainToolInvocation = memo(({ part }: { part: import('ai').ToolUIPart }) => {
  const toolName = part.type.replace('tool-', '');

  if (part.state === 'input-streaming' || part.state === 'input-available') {
    return (
      <div className="border border-border bg-muted/30 px-3 py-2 text-[11px] font-mono uppercase tracking-widest text-muted-foreground rounded-sm flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span>Calling {toolName}…</span>
      </div>
    );
  }

  if (part.state === 'output-error') {
    return (
      <div className="border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs font-mono uppercase tracking-widest text-destructive/80 rounded-sm">
        Error in {toolName}
      </div>
    );
  }

  if (part.state === 'output-available') {
    const data = part.output ?? part.input;

    if (data && typeof data === 'object' && '__cancelled' in data) {
      return (
        <div className="border border-border bg-muted/30 px-3 py-2 text-[11px] font-mono uppercase tracking-widest text-muted-foreground rounded-sm">
          Tool execution cancelled
        </div>
      );
    }

    if (toolName === 'get_airport_weather') return <WeatherToolUI result={{ data: data as any }} />;
    if (toolName === 'get_airport_capabilities') return <AirportInfoToolUI result={{ data: data as any }} />;
    if (toolName === 'get_user_flights') return <FlightSelectorToolUI result={{ data: data as any }} />;
    return <GenericToolUI toolName={toolName} data={data} />;
  }

  return null;
});
MainToolInvocation.displayName = 'MainToolInvocation';

export default function EnhancedChatPage() {
  return (
    <Suspense fallback={<div className="flex-1 bg-background" />}>
      <EnhancedChatPageContent />
    </Suspense>
  );
}

function EnhancedChatPageContent() {
  usePageContext();
  const { mainConversationId, setConversationId } = useChatSessionStore();
  const queryClient = useQueryClient();
  const { data: conversations = [] } = useGeneralConversations();
  const { data: flights = [] } = useFlights();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showSettings, setShowSettings] = useState(false);
  const { showThinkingProcess, showTimestamps } = useChatSettings();

  const {
    messages,
    input,
    setInput,
    sendMessage,
    stopStreaming,
    isStreaming,
    missingCredentials,
    providerInfo,
    error,
    isThinking,
    isResponseStreaming,
  } = usePremiumChat({
    conversationId: mainConversationId,
    surface: 'main',
    onConversationCreated: useCallback((conversationId: string) => {
      setConversationId('main', conversationId);
      queryClient.invalidateQueries({ queryKey: ['general-conversations'] });
    }, [setConversationId, queryClient]),
    onError: useCallback((error: Error) => {
      console.error('Chat error:', error);
      toast.error('Failed to send message', { description: error.message });
    }, [])
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isStreaming) {
        e.preventDefault();
        stopStreaming();
        toast.info('Generation stopped');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStreaming, stopStreaming]);

  const previousConversationRef = useRef<string | null>(mainConversationId);
  const lastMessageCountRef = useRef(messages.length);

  useEffect(() => {
    const previousId = previousConversationRef.current;
    if (previousId && previousId !== mainConversationId && lastMessageCountRef.current >= MIN_MESSAGES_FOR_TITLE) {
      requestConversationTitle(previousId, 'conversation-switch');
    }
    previousConversationRef.current = mainConversationId;
    lastMessageCountRef.current = messages.length;
  }, [mainConversationId, messages.length]);

  const activeConversation = useMemo(() => conversations.find(c => c.id === mainConversationId), [conversations, mainConversationId]);
  const aiStatus: 'ready' | 'thinking' | 'streaming' | 'error' = error ? 'error' : isResponseStreaming ? 'streaming' : isThinking ? 'thinking' : 'ready';
  
  const providerLabel = useMemo(() => {
    if (!providerInfo) return 'Provider: detecting…';
    const providerName = providerInfo.provider === 'vertex' ? 'Vertex AI' : 'Gemini API';
    const modelName = providerInfo.model ?? 'gemini-2.5-flash';
    return `${providerName} · ${modelName}`;
  }, [providerInfo]);

  const contextSuggestions = useMemo(() => {
    if (flights.length > 0) {
      const flight = flights[0];
      return [`Briefing for ${flight.code}?`, `Risks for ${flight.origin} to ${flight.destination}`, `Weather for active flights`, `Generate operations briefing`];
    }
    return ['Weather at KJFK?', 'Info on airport EGLL', 'TAF for KLAX?', 'METAR for KSFO'];
  }, [flights]);

  const thinkingContent = useMemo(() => {
    const latestAssistant = [...messages].reverse().find((msg) => msg.role === 'assistant');
    if (!latestAssistant) return isThinking ? ['Analyzing request…'] : [];
    const reasoningParts = getReasoningParts(latestAssistant);
    return reasoningParts.length > 0 ? reasoningParts.map((part) => part.text).filter(Boolean) : (isThinking ? ['Processing…'] : []);
  }, [messages, isThinking]);

  const handleConversationSelect = useCallback((id: string) => {
    if (mainConversationId && mainConversationId !== id && messages.length >= MIN_MESSAGES_FOR_TITLE) {
      requestConversationTitle(mainConversationId, 'conversation-switch');
    }
    setConversationId('main', id);
  }, [mainConversationId, messages.length, setConversationId]);

  const handleNewMainChat = useCallback(() => {
    if (mainConversationId && messages.length >= MIN_MESSAGES_FOR_TITLE) {
      requestConversationTitle(mainConversationId, 'conversation-switch');
    }
    setConversationId('main', null);
    setInput('');
    queryClient.removeQueries({ queryKey: ['conversation-messages'] });
  }, [mainConversationId, messages.length, setConversationId, setInput, queryClient]);

  const handleSubmit = useCallback((event?: React.FormEvent) => {
    event?.preventDefault?.();
    if (!input.trim() || isStreaming || missingCredentials) return;
    sendMessage();
  }, [input, isStreaming, missingCredentials, sendMessage]);

  const handleSuggestionSelect = useCallback((text: string) => {
    setInput(text);
    sendMessage(text);
  }, [setInput, sendMessage]);

  return (
    <div className="flex h-full overflow-hidden bg-background text-foreground">
      <ConversationSidebar
        conversations={conversations}
        activeConversationId={mainConversationId}
        onSelectConversation={handleConversationSelect}
        onNewChat={handleNewMainChat}
      />
      <div className="flex-1 flex flex-col min-h-0">
        <ChatHeader
          conversationTitle={activeConversation?.title}
          aiStatus={aiStatus}
          providerLabel={providerLabel}
          showSettings={showSettings}
          onToggleSettings={() => setShowSettings(!showSettings)}
          onNewChat={handleNewMainChat}
        />

        <div className="flex-1 min-h-0 flex flex-col">
          {showSettings ? (
            <ChatSettingsPanel onBack={() => setShowSettings(false)} />
          ) : (
            <>
              <div className="flex-1 min-h-0 overflow-y-auto relative bg-background">
                {/* Scanline Effect */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-30"
                  style={{
                    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
                  }}
                />
                
                <div className="p-6 md:p-8 lg:p-12">
                  <div className="max-w-5xl mx-auto w-full">
                    {messages.length === 0 && !missingCredentials ? (
                      <div className="h-full min-h-[60vh] flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-sm border border-border bg-card flex items-center justify-center mb-6">
                          <Bot size={32} strokeWidth={1.5} className="text-primary" />
                        </div>
                        <h2 className="text-lg font-medium text-foreground mb-2">How can I assist you?</h2>
                        <p className="text-sm text-muted-foreground">Ask about operations, weather, or airports.</p>
                        <div className="mt-8 grid grid-cols-2 gap-3 max-w-lg">
                          {contextSuggestions.map((suggestion) => (
                            <button
                              key={suggestion}
                              onClick={() => handleSuggestionSelect(suggestion)}
                              className="px-4 py-3 rounded-sm border border-border bg-card text-sm text-foreground hover:border-primary/50 hover:bg-accent transition-all"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {messages.map((msg) => {
                          const typedMsg = msg as FlightChatMessage;
                          const toolParts = getToolParts(typedMsg);
                          const timestamp = new Date(msg.createdAt || Date.now()).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          });
                          
                          return (
                            <div key={msg.id} className="space-y-3">
                              <AIMessage
                                content={getMessageText(msg)}
                                isUser={msg.role === 'user'}
                                timestamp={timestamp}
                                material="tungsten"
                                showTimestamp={showTimestamps}
                                toolCalls={toolParts}
                              />
                              {toolParts.length > 0 && (
                                <div className="ml-12 space-y-2">
                                  {toolParts.map((part) => (
                                    <MainToolInvocation key={part.toolCallId} part={part} />
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {isResponseStreaming && (!showThinkingProcess || thinkingContent.length === 0) && (
                          <div className="flex justify-start">
                            <ThinkingIndicator material="tungsten" />
                          </div>
                        )}
                        {isThinking && showThinkingProcess && thinkingContent.length > 0 && (
                          <ThinkingModal isThinking thoughts={thinkingContent} material="tungsten" />
                        )}
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              </div>

              <div className="border-t border-border bg-card/80 backdrop-blur-sm p-3">
                <div className="max-w-5xl mx-auto w-full">
                  <form onSubmit={handleSubmit} className="relative">
                    <div className="groove-input rounded-sm border border-border overflow-hidden bg-background">
                      <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit();
                          }
                        }}
                        placeholder="Ask about operations, weather, or airports…"
                        disabled={Boolean(missingCredentials) || isStreaming}
                        className="w-full resize-none border-0 bg-transparent focus:ring-2 focus:ring-primary shadow-none p-4 pr-24 min-h-[56px] text-sm text-foreground placeholder:text-muted-foreground"
                        rows={1}
                      />
                    </div>
                    <div className="absolute top-1/2 right-4 transform -translate-y-1/2 flex items-center gap-2">
                      {isStreaming && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={stopStreaming} 
                          title="Stop (Esc)"
                          className="h-8 w-8"
                        >
                          <div className="w-3 h-3 bg-destructive rounded-sm" />
                        </Button>
                      )}
                      <Button 
                        type="submit" 
                        size="icon" 
                        disabled={!input.trim() || isStreaming}
                        className="h-8 w-8 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Send (Enter)"
                      >
                        <ArrowRight size={16} strokeWidth={1.5} />
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
