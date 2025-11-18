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
import { ThinkingBlock } from '@/components/chat/ThinkingBlock';
import { ConversationSidebar } from '@/components/chat-enhanced/ConversationSidebar';
import { ChatHeader } from '@/components/chat-enhanced/ChatHeader';
import { ArtifactPanel } from '@/components/chat-enhanced/ArtifactPanel';
import { ArtifactTrigger } from '@/components/chat-enhanced/ArtifactTrigger';
import { useArtifactStore } from '@/lib/artifact-store';

const MIN_MESSAGES_FOR_TITLE = 2;

export const dynamic = 'force-dynamic';

const MainToolInvocation = memo(({ part }: { part: import('ai').ToolUIPart }) => {
  const toolName = part.type.replace('tool-', '');
  const data = part.output ?? part.input;

  // Check if execution was cancelled
  if (part.state === 'output-available' && data && typeof data === 'object' && '__cancelled' in data) {
    return (
      <div className="border border-border bg-muted/30 px-3 py-2 text-[11px] font-mono uppercase tracking-widest text-muted-foreground rounded-sm">
        Tool execution cancelled
      </div>
    );
  }

  return <ArtifactTrigger toolCallId={part.toolCallId} toolName={toolName} data={data} state={part.state} />;
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
  const { isOpen: isArtifactOpen } = useArtifactStore();
  const queryClient = useQueryClient();
  const { data: conversations = [] } = useGeneralConversations();
  const { data: flights = [] } = useFlights();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showSettings, setShowSettings] = useState(false);
  const { showThinkingProcess, showTimestamps } = useChatSettings();
  
  // Track the last sent message text for preview
  const lastSentMessageRef = useRef<string>('');

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
      // Replace temporary conversation with real DB conversation
      if (mainConversationId?.startsWith('temp-')) {
        // Use the last sent message for preview
        const messagePreview = lastSentMessageRef.current.substring(0, 60);
        
        queryClient.setQueryData(['general-conversations'], (old: any[] = []) => {
          // Replace temp conversation with a complete real conversation object
          return old.map((conv) => {
            if (conv.id === mainConversationId) {
              return {
                ...conv,
                id: conversationId,
                message_count: 1,
                last_message_preview: messagePreview,
                updated_at: new Date().toISOString(),
              };
            }
            return conv;
          });
        });
      }
      
      setConversationId('main', conversationId);
    }, [setConversationId, queryClient, mainConversationId]),
    onError: useCallback((error: Error) => {
      console.error('Chat error:', error);
      toast.error('Failed to send message', { description: error.message });
    }, [])
  });

  useEffect(() => {
    // Smart auto-scroll: only scroll if the user is already near the bottom
    const container = messagesEndRef.current?.parentElement?.parentElement;
    if (container) {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      if (isNearBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Fallback for initial load
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
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
    if (!latestAssistant) return '';
    const reasoningParts = getReasoningParts(latestAssistant);
    return reasoningParts.length > 0 ? reasoningParts.map((part) => part.text).filter(Boolean).join('\n\n') : '';
  }, [messages]);

  const isStreamingReasoning = useMemo(() => {
    const latestAssistant = [...messages].reverse().find((msg) => msg.role === 'assistant');
    if (!latestAssistant) return false;
    const hasContent = getMessageText(latestAssistant).trim().length > 0;
    const hasTools = getToolParts(latestAssistant).length > 0;
    return isThinking && !hasContent && !hasTools;
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
  }, [mainConversationId, messages.length, setConversationId, setInput]);

  const handleSubmit = useCallback((event?: React.FormEvent) => {
    event?.preventDefault?.();
    if (!input.trim() || isStreaming || missingCredentials) return;
    lastSentMessageRef.current = input.trim();
    sendMessage();
  }, [input, isStreaming, missingCredentials, sendMessage]);

  const handleSuggestionSelect = useCallback((text: string) => {
    lastSentMessageRef.current = text.trim();
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
      <div className="flex-1 flex flex-col min-h-0 relative">
        <ChatHeader
          conversationTitle={activeConversation?.title}
          aiStatus={aiStatus}
          providerLabel={providerLabel}
          showSettings={showSettings}
          onToggleSettings={() => setShowSettings(!showSettings)}
          onNewChat={handleNewMainChat}
        />

        <div className="flex-1 min-h-0 flex flex-row overflow-hidden">
          {showSettings ? (
            <div className="flex-1">
              <ChatSettingsPanel onBack={() => setShowSettings(false)} />
            </div>
          ) : (
            <>
              <div className="flex-1 min-h-0 flex flex-col min-w-0">
                <div className="flex-1 min-h-0 overflow-y-auto relative bg-background">
                  <div className="p-6 md:p-8 lg:p-12">
                  <div className="max-w-4xl mx-auto w-full">
                    {messages.length === 0 && !missingCredentials ? (
                      <div className="h-full min-h-[60vh] flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-sm border border-border bg-card flex items-center justify-center mb-6 shadow-sm">
                          <Bot size={32} strokeWidth={1.5} className="text-muted-foreground" />
                        </div>
                        <h2 className="text-lg font-medium text-foreground mb-2">System Ready</h2>
                        <p className="text-sm text-muted-foreground">Awaiting command. Ask about operations, weather, or airports.</p>
                        <div className="mt-8 grid grid-cols-2 gap-3 max-w-lg w-full">
                          {contextSuggestions.map((suggestion) => (
                            <button
                              key={suggestion}
                              onClick={() => handleSuggestionSelect(suggestion)}
                              className="px-4 py-3 rounded-sm border border-border bg-card text-xs font-mono text-muted-foreground hover:text-foreground hover:border-zinc-400 hover:bg-accent transition-all text-left"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-8 pb-4">
                        {messages.map((msg) => {
                          const typedMsg = msg as FlightChatMessage;
                          const toolParts = getToolParts(typedMsg);
                          const timestamp = new Date(msg.createdAt || Date.now()).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          });
                          
                          return (
                            <div key={msg.id} className="space-y-4">
                              <AIMessage
                                content={getMessageText(msg)}
                                isUser={msg.role === 'user'}
                                timestamp={timestamp}
                                material="tungsten"
                                showTimestamp={showTimestamps}
                                toolCalls={toolParts}
                              />
                              {toolParts.length > 0 && (
                                <div className="ml-0 pl-4 border-l-2 border-border space-y-4 my-4">
                                  {toolParts.map((part) => (
                                    <MainToolInvocation key={part.toolCallId} part={part} />
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {isResponseStreaming && showThinkingProcess && thinkingContent && (
                          <div className="pl-4">
                            <ThinkingBlock 
                              content={thinkingContent} 
                              isStreaming={isStreamingReasoning} 
                              defaultOpen={true}
                            />
                          </div>
                        )}
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              </div>

              <div className="border-t border-border bg-background p-6 pb-8">
                <div className="max-w-4xl mx-auto w-full">
                  <form onSubmit={handleSubmit} className="relative group">
                    <div className="relative">
                      <Textarea
                        value={input}
                        onChange={(e) => {
                          setInput(e.target.value);
                          // Auto-expand input
                          e.target.style.height = 'auto';
                          e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit();
                          }
                        }}
                        placeholder="ENTER COMMAND OR QUERY..."
                        disabled={Boolean(missingCredentials) || isStreaming}
                        className="w-full resize-none rounded-sm border border-input bg-background px-4 py-3 pr-14 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#F04E30] disabled:cursor-not-allowed disabled:opacity-50 min-h-[52px] font-mono shadow-sm transition-all duration-200 ease-in-out"
                        rows={1}
                        style={{ overflow: 'hidden' }}
                      />
                      <div className="absolute top-1/2 right-2 transform -translate-y-1/2 flex items-center gap-2">
                        {isStreaming && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={stopStreaming} 
                            title="Stop (Esc)"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <div className="w-2 h-2 bg-current rounded-sm" />
                          </Button>
                        )}
                        <Button 
                          type="submit" 
                          size="icon" 
                          disabled={!input.trim() || isStreaming}
                          className="h-8 w-8 bg-foreground text-background hover:bg-foreground/90 disabled:opacity-40 disabled:cursor-not-allowed rounded-sm"
                          title="Send (Enter)"
                        >
                          <ArrowRight size={16} strokeWidth={2} />
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
              </div>
              <ArtifactPanel />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
