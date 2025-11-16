'use client';

import { Suspense, useEffect, useMemo, useCallback, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usePremiumChat } from '@/hooks/usePremiumChat';
import { useFlights } from '@/lib/tanstack/hooks/useFlights';
import { useGeneralConversations } from '@/lib/tanstack/hooks/useGeneralConversations';
import ChatSidebar from '@/components/chat/chat-sidebar';
import { Download, Settings, Plus } from 'lucide-react';
import ContextSelector from '@/components/chat/context-selector';
import { useChatSessionStore } from '@/lib/chat-session-store';
import ChatSettingsPanel from '@/components/chat/ChatSettingsPanel';
import { useChatSettings } from '@/lib/chat-settings-store';
import ChatModeSelector from '@/components/chat/ChatModeSelector';
import { ContextualSuggestions } from '@/components/chat/ContextualSuggestions';
import { AIMessage } from '@/components/ai-drawer/AIMessage';
import { AIInput } from '@/components/ai-drawer/AIInput';
import { ThinkingIndicator } from '@/components/ai-drawer/ThinkingIndicator';
import { ThinkingModal } from '@/components/ai-drawer/ThinkingModal';
import { ContextIndicator } from '@/components/ai-drawer/ContextIndicator';
import { LEDStatus } from '@/components/ai-drawer/LEDStatus';
import { getMessageText, getToolParts, getReasoningParts, type FlightChatMessage } from '@/lib/chat/messages';
import { WeatherToolUI, FlightSelectorToolUI, AirportInfoToolUI } from '@/components/chat/tool-ui';
import { GenericToolUI } from '@/components/chat/GenericToolUI';


import { usePageContext } from '@/lib/context/usePageContext';

export const dynamic = 'force-dynamic';

export default function EnhancedChatPage() {
 return (
  <Suspense fallback={null}>
   <EnhancedChatPageContent />
  </Suspense>
 );
}

function EnhancedChatPageContent() {
 const searchParams = useSearchParams();
 
 // Enable page context detection
 usePageContext();
 const {
   mainConversationId,
   sidebarConversationId,
   linkSurfaces,
   setConversationId,
   lastLinkedConversationId,
 } = useChatSessionStore();
 const queryClient = useQueryClient();
 const { data: conversations = [] } = useGeneralConversations();
 const { data: flights = [] } = useFlights();
 const messagesEndRef = useRef<HTMLDivElement>(null);

 const isLinkedToSidebar = useMemo(
   () => Boolean(mainConversationId && mainConversationId === sidebarConversationId),
   [mainConversationId, sidebarConversationId]
 );

 const canLinkFromMain = useMemo(
   () => Boolean(mainConversationId && sidebarConversationId && !isLinkedToSidebar),
   [mainConversationId, sidebarConversationId, isLinkedToSidebar]
 );
 
 const [showSettings, setShowSettings] = useState(false);
 const { currentMode, useSimpleChat, setMode, showThinkingProcess, showTimestamps } = useChatSettings();

 // ✅ useChat now handles ALL message state - no manual transformation needed
 const {
  messages,      // Already in correct format with toolInvocations, etc.
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
    // Set the active conversation ID (database-backed)
    setConversationId('main', conversationId);
    
    // Invalidate conversations list to show the new conversation
    queryClient.invalidateQueries({ queryKey: ['general-conversations'] });
  }, [setConversationId, queryClient]),
  onError: useCallback((error: Error) => {
    console.error('Chat error:', error);
    toast.error('Failed to send message', { description: error.message });
  }, [])
 });

 const aiStatus: 'ready' | 'thinking' | 'streaming' | 'error' =
   error ? 'error' : isResponseStreaming ? 'streaming' : isThinking ? 'thinking' : 'ready';

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
   const conversationFromParams = searchParams.get('conversation');
   if (conversationFromParams && conversationFromParams !== mainConversationId) {
     setConversationId('main', conversationFromParams, {
       markAsLinked: conversationFromParams === sidebarConversationId,
     });
     return;
   }

   if (!conversationFromParams && !mainConversationId && lastLinkedConversationId) {
     setConversationId('main', lastLinkedConversationId, { markAsLinked: true });
   }
 }, [
   searchParams,
   mainConversationId,
   sidebarConversationId,
   lastLinkedConversationId,
   setConversationId,
 ]);

 // Get suggestions based on available flights - memoized
 const contextSuggestions = useMemo(() => {
   if (flights.length > 0) {
     const flight = flights[0];
     return [
       `What's the weather briefing for ${flight.code}?`,
       `Analyze risks for ${flight.origin} to ${flight.destination}`,
       `Show me weather for all active flights`,
       `Generate a comprehensive operations briefing`,
     ];
   }
   
   return [
     'What are the current weather conditions at KJFK?',
     'Tell me about airport EGLL',
     'What is the TAF for KLAX?',
     'Show me METAR for KSFO',
   ];
 }, [flights]);

 // ESC key to stop streaming
 useEffect(() => {
   const handleKeyDown = (e: KeyboardEvent) => {
     if (e.key === 'Escape' && isStreaming) {
       e.preventDefault();
       stopStreaming();
       toast.info('Generation stopped', {
         description: 'Press ESC anytime to stop generation'
       });
     }
   };

   window.addEventListener('keydown', handleKeyDown);
   return () => window.removeEventListener('keydown', handleKeyDown);
 }, [isStreaming, stopStreaming]);

 useEffect(() => {
   messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
 }, [messages]);

 // Find the active conversation from the database-backed list
 const activeConversation = useMemo(
   () => conversations.find(c => c.id === mainConversationId),
   [conversations, mainConversationId]
 );

 const handleNewMainChat = useCallback(() => {
   setConversationId('main', null);
   setInput('');
   queryClient.removeQueries({ queryKey: ['conversation-messages'] });
 }, [setConversationId, setInput, queryClient]);

 const handleLinkToSidebar = useCallback(() => {
   if (!mainConversationId) return;
   linkSurfaces(mainConversationId);
 }, [linkSurfaces, mainConversationId]);

 const handleSubmit = useCallback((event?: { preventDefault?: () => void }) => {
   event?.preventDefault?.();
   if (!input.trim() || isStreaming || missingCredentials) return;
   void sendMessage();
 }, [input, isStreaming, missingCredentials, sendMessage]);

 const handleSuggestionSelect = useCallback((text: string) => {
   setInput(text);
   void sendMessage(text);
 }, [setInput, sendMessage]);

 const handleExport = useCallback(() => {
   if (messages.length === 0) return;
   const data = JSON.stringify({ messages }, null, 2);
   const blob = new Blob([data], { type: 'application/json' });
   const url = URL.createObjectURL(blob);
   const a = document.createElement('a');
   a.href = url;
   a.download = `chat-export-${new Date().toISOString()}.json`;
   a.click();
 }, [messages]);

 const thinkingContent = useMemo(() => {
   const latestAssistant = [...messages].reverse().find((msg) => msg.role === 'assistant');
   if (!latestAssistant) {
     return isThinking
       ? [
           'Analyzing your request…',
           'Gathering aviation data…',
           'Preparing response…',
         ]
       : [];
   }

   const reasoningParts = getReasoningParts(latestAssistant);
   if (reasoningParts.length > 0) {
     return reasoningParts.map((part) => part.text).filter(Boolean);
   }

   return isThinking
     ? [
         'Processing query…',
         'Aligning with mission context…',
       ]
     : [];
 }, [messages, isThinking]);

 
 return (
  <div className="flex h-full overflow-hidden">
   <ChatSidebar
    activeConversationId={mainConversationId}
    onConversationSelect={(id) => setConversationId('main', id)}
   />

   <div className="flex-1 flex flex-col min-h-0 bg-background">
    <header className="border-b border-border bg-card flex-shrink-0">
     <div className="px-6 py-3 flex flex-wrap items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
       <div className="flex items-center gap-2">
        <h1 className="text-base font-semibold text-foreground truncate">
         {showSettings ? 'Chat Settings' : (activeConversation?.title || 'AI Aviation Assistant')}
        </h1>
        {isLinkedToSidebar && !showSettings && (
          <span className="text-[10px] font-mono uppercase tracking-widest text-blue border border-blue/40 px-2 py-0.5">
            Linked to Sidebar
          </span>
        )}
       </div>
       <div className="text-[11px] text-muted-foreground/80 mt-0.5">
        {showSettings
          ? 'Configure chat behavior and preferences'
          : isStreaming
          ? 'Generating… press ESC to stop'
          : activeConversation
          ? `${messages.length} messages`
          : 'Advanced flight operations support'}
       </div>
       {!showSettings && (
        <div className="mt-1 flex items-center gap-3 text-[10px] text-muted-foreground/70">
          <LEDStatus status={aiStatus} label={providerInfo?.model ?? 'Detecting'} size="sm" />
          <span className="truncate">{providerLabel}</span>
        </div>
       )}
      </div>

      <div className="flex items-center gap-2">
       {!showSettings && (
        <>
          <ContextSelector />
          <button
            onClick={handleNewMainChat}
            className="hidden sm:flex items-center gap-1.5 h-8 text-xs text-muted-foreground/70 hover:text-foreground/90 cursor-pointer transition-colors px-3 border border-border/60 hover:bg-muted/30"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden md:inline">New Chat</span>
          </button>
          {isStreaming && (
            <button
              onClick={stopStreaming}
              className="h-8 px-3 text-xs border border-red/40 text-red hover:bg-red/10"
            >
              Stop
            </button>
          )}
          {messages.length > 0 && (
            <button
              onClick={handleExport}
              className="h-8 px-3 text-xs border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/30"
            >
              <Download size={14} />
            </button>
          )}
        </>
       )}
       <button
        onClick={() => setShowSettings(!showSettings)}
        className={`h-8 w-8 flex items-center justify-center rounded-sm border ${
          showSettings ? 'border-blue/60 text-blue bg-blue/10' : 'border-border/60 text-muted-foreground hover:text-foreground'
        }`}
        title={showSettings ? 'Back to Chat' : 'Settings'}
       >
        <Settings size={14} />
       </button>
      </div>
     </div>
    </header>

    {!showSettings && (
      <div className="border-b border-border bg-muted/30">
        <ContextIndicator material="ceramic" />
        <div className="flex flex-wrap items-center gap-3 px-6 py-2 text-[11px] text-muted-foreground/80">
          {isLinkedToSidebar ? (
            <>
              <span className="text-blue font-medium">Shared with sidebar assistant</span>
              <button
                onClick={handleNewMainChat}
                className="text-[10px] uppercase tracking-widest border border-blue/40 text-blue px-2 py-0.5 rounded-sm hover:bg-blue/10"
              >
                Start detached chat
              </button>
            </>
          ) : canLinkFromMain ? (
            <button
              onClick={handleLinkToSidebar}
              className="text-[10px] uppercase tracking-widest border border-border/70 px-2 py-0.5 rounded-sm hover:bg-muted/40"
            >
              Link with sidebar conversation
            </button>
          ) : (
            <span>Independent session</span>
          )}
        </div>
      </div>
    )}

    {!showSettings && !useSimpleChat && (
      <ChatModeSelector mode={currentMode || 'flight-ops'} onModeChange={setMode} compact={false} />
    )}

    <div className="flex-1 min-h-0 flex flex-col bg-background">
      {showSettings ? (
        <ChatSettingsPanel onBack={() => setShowSettings(false)} />
      ) : (
        <>
          {missingCredentials && (
            <div className="mx-6 mt-4 border border-dashed border-border bg-muted/40 text-xs text-muted-foreground px-4 py-3 rounded-sm space-y-1">
              {missingCredentials === 'vertex' ? (
                <>
                  <p>
                    Configure <code className="rounded bg-background px-1 py-0.5">GOOGLE_VERTEX_PROJECT</code> plus service-account credentials (<code className="rounded bg-background px-1 py-0.5">GOOGLE_VERTEX_CLIENT_EMAIL</code>, <code className="rounded bg-background px-1 py-0.5">GOOGLE_VERTEX_PRIVATE_KEY</code>) or Google ADC to enable Vertex AI streaming.
                  </p>
                  <p>
                    To fall back to Gemini, supply <code className="rounded bg-background px-1 py-0.5">GOOGLE_API_KEY</code> or <code className="rounded bg-background px-1 py-0.5">GOOGLE_GENERATIVE_AI_API_KEY</code>.
                  </p>
                </>
              ) : (
                <p>
                  Add <code className="rounded bg-background px-1 py-0.5">GOOGLE_API_KEY</code> (or <code className="rounded bg-background px-1 py-0.5">GOOGLE_GENERATIVE_AI_API_KEY</code>) and reload to enable the Gemini API fallback.
                </p>
              )}
            </div>
          )}

          <div className="flex-1 min-h-0 overflow-y-auto px-8 py-6">
            {messages.length === 0 && !missingCredentials ? (
              <div className="h-full flex flex-col items-center justify-center">
                <ContextualSuggestions
                  hasMessages={false}
                  onSelect={handleSuggestionSelect}
                  variant="drawer-empty-hero"
                />
                {contextSuggestions.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2 justify-center">
                    {contextSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => handleSuggestionSelect(suggestion)}
                        className="px-3 py-1.5 rounded-full border border-border/70 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
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
                        material="ceramic"
                        showTimestamp={showTimestamps}
                        toolCalls={toolParts}
                      />
                      {toolParts.length > 0 && (
                        <div className="space-y-1">
                          {toolParts.map((part) => (
                            <MainToolInvocation key={part.toolCallId} part={part} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {isResponseStreaming && (!showThinkingProcess || thinkingContent.length === 0) && (
                  <ThinkingIndicator material="ceramic" />
                )}

                {isThinking && showThinkingProcess && thinkingContent.length > 0 && (
                  <ThinkingModal isThinking thoughts={thinkingContent} material="ceramic" />
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-border bg-card px-6 py-4">
            <AIInput
              value={input}
              onChange={setInput}
              onSend={handleSubmit}
              material="ceramic"
              placeholder="Ask about operations, weather, or airports…"
              disabled={Boolean(missingCredentials) || isStreaming}
            />
          </div>
        </>
      )}
    </div>
   </div>
  </div>
 );
}

interface ToolInvocationProps {
  part: import('ai').ToolUIPart;
}

function MainToolInvocation({ part }: ToolInvocationProps) {
  const toolName = part.type.replace('tool-', '');

  if (part.state === 'input-streaming' || part.state === 'input-available') {
    return (
      <div className="border border-border bg-muted/30 px-3 py-2 text-[11px] font-mono uppercase tracking-widest text-muted-foreground rounded-sm flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-blue animate-pulse" />
        <span>Calling {toolName}…</span>
      </div>
    );
  }

  if (part.state === 'output-error') {
    return (
      <div className="border border-red bg-red/5 px-3 py-2 text-[11px] font-mono uppercase tracking-widest text-red rounded-sm">
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

    if (toolName === 'get_airport_weather') {
      return <WeatherToolUI result={{ data: data as any }} />;
    }

    if (toolName === 'get_airport_capabilities') {
      return <AirportInfoToolUI result={{ data: data as any }} />;
    }

    if (toolName === 'get_user_flights') {
      return <FlightSelectorToolUI result={{ data: data as any }} />;
    }

    return <GenericToolUI toolName={toolName} data={data} />;
  }

  return null;
}
