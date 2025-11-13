'use client';

import { Suspense, useEffect, useMemo, useCallback, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usePremiumChat } from '@/hooks/usePremiumChat';
import { useFlights } from '@/lib/tanstack/hooks/useFlights';
import { useGeneralConversations } from '@/lib/tanstack/hooks/useGeneralConversations';
import { Chat } from '@/components/ui/chat';
import ChatSidebar from '@/components/chat/chat-sidebar';
import { Download, Settings, Plus } from 'lucide-react';
import ContextSelector from '@/components/chat/context-selector';
import { useChatSessionStore } from '@/lib/chat-session-store';
import ChatSettingsPanel from '@/components/chat/ChatSettingsPanel';
import { useChatSettings } from '@/lib/chat-settings-store';
import ChatModeSelector from '@/components/chat/ChatModeSelector';


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
 const { activeConversationId, setActiveConversationId } = useChatSessionStore();
 const queryClient = useQueryClient();
 const { data: conversations = [] } = useGeneralConversations();
 const { data: flights = [] } = useFlights();
 
 const [showSettings, setShowSettings] = useState(false);
 const { currentMode, useSimpleChat, setMode } = useChatSettings();

 // ✅ useChat now handles ALL message state - no manual transformation needed
 const {
  messages,      // Already in correct format with toolInvocations, etc.
  input,
  setInput,
  sendMessage,
  stopStreaming,
  isStreaming,
  setMessages,
  missingCredentials,
  providerInfo,
 } = usePremiumChat({
  conversationId: activeConversationId,
  onConversationCreated: useCallback((conversationId: string) => {
    // Set the active conversation ID (database-backed)
    setActiveConversationId(conversationId);
    
    // Invalidate conversations list to show the new conversation
    queryClient.invalidateQueries({ queryKey: ['general-conversations'] });
  }, [setActiveConversationId, queryClient]),
  onError: useCallback((error: Error) => {
    console.error('Chat error:', error);
    toast.error('Failed to send message', { description: error.message });
  }, [])
 });

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
   if (conversationFromParams && conversationFromParams !== activeConversationId) {
     setActiveConversationId(conversationFromParams);
   }
 }, [searchParams, activeConversationId, setActiveConversationId]);

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

 // Find the active conversation from the database-backed list
 const activeConversation = useMemo(
   () => conversations.find(c => c.id === activeConversationId),
   [conversations, activeConversationId]
 );

 const handleInputChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
   setInput(e.target.value);
 }, [setInput]);

 const handleSubmit = useCallback((event?: { preventDefault?: () => void }) => {
   event?.preventDefault?.();
   if (!input.trim() || isStreaming || missingCredentials) return;
   void sendMessage();
 }, [input, isStreaming, missingCredentials, sendMessage]);

 const handleAppend = useCallback((message: { role: 'user'; content: string }) => {
   void sendMessage(message.content);
 }, [sendMessage]);

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

 

 return (
 <div className="flex h-full overflow-hidden">
 {/* Sidebar */}
 <ChatSidebar 
 activeConversationId={activeConversationId}
 onConversationSelect={(id) => setActiveConversationId(id)}
 />

 {/* Main Chat Area */}
 <div className="flex-1 flex flex-col min-h-0">
 {/* Header */}
 <header className="border-b border-border bg-card flex-shrink-0">
 <div className="px-6 py-2">
 <div className="flex items-center justify-between">
 <div className="flex-1 min-w-0">
 <div className="flex items-baseline gap-2">
 <h1 className="text-sm font-semibold text-foreground truncate">
 {showSettings ? 'Chat Settings' : (activeConversation?.title || 'AI Aviation Assistant')}
 </h1>
 <div className="text-[10px] text-muted-foreground/70">
 {showSettings ? (
 'Configure chat behavior and preferences'
 ) : isStreaming ? (
 <span className="flex items-center gap-1.5 animate-pulse">
 Generating...
 <kbd className="px-1.5 py-0.5 bg-muted/50 rounded text-[9px] font-mono">ESC</kbd>
 to stop
 </span>
 ) : (
 activeConversation ? `${messages.length} messages` : 'Advanced flight operations support'
 )}
 </div>
 </div>
 {!showSettings && (
 <div className="text-[10px] text-muted-foreground/70 mt-0.5 truncate">
 {providerLabel}
 </div>
 )}
 </div>

 <div className="flex items-center gap-2 ml-4">
 {!showSettings && (
 <>
 <ContextSelector />

 

 <div 
 onClick={() => {
   setActiveConversationId(null);
   setInput('');
   // Clear cached messages to ensure truly empty state
   queryClient.removeQueries({ queryKey: ['conversation-messages'] });
 }}
 className="hidden sm:flex items-center gap-1.5 h-8 text-xs text-muted-foreground/70 hover:text-foreground/90 cursor-pointer transition-colors px-3 hover:bg-muted/30"
 >
 <Plus className="h-3.5 w-3.5" />
 <span className="hidden md:inline">New Chat</span>
 </div>

 {messages.length > 0 && (
 <div
 onClick={handleExport}
 className="text-muted-foreground/70 hover:text-foreground/90 cursor-pointer transition-colors p-1.5 rounded-sm hover:bg-muted/30"
 title="Export conversation"
 >
 <Download size={13} />
 </div>
 )}
 </>
 )}

 <div
 onClick={() => setShowSettings(!showSettings)}
 className={`cursor-pointer transition-colors p-1.5 rounded-sm hover:bg-muted/30 ${
   showSettings 
     ? 'text-blue bg-blue/10' 
     : 'text-muted-foreground/70 hover:text-foreground/90'
 }`}
 title={showSettings ? 'Back to Chat' : 'Settings'}
 >
 <Settings size={13} />
 </div>
 </div>
 </div>
 </div>

 {/* Mode Selector - Show when not in settings and not using simple chat */}
 {!showSettings && !useSimpleChat && (
 <ChatModeSelector
 mode={currentMode || 'flight-ops'}
 onModeChange={setMode}
 compact={false}
 />
 )}
 </header>

 {/* Chat Interface */}
 <div className="flex-1 min-h-0 flex flex-col">
 {showSettings ? (
   <ChatSettingsPanel onBack={() => setShowSettings(false)} />
 ) : (
   <>
     {missingCredentials && (
       <div className="border border-dashed border-border bg-muted/50 text-xs text-muted-foreground px-4 py-2 mb-2 rounded-sm space-y-1">
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
     <Chat
      messages={messages}
      input={input}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      isGenerating={isStreaming}
      stop={stopStreaming}
      append={handleAppend}
      suggestions={contextSuggestions}
      className="flex-1 h-full px-6 py-4"
      setMessages={setMessages}
     />
   </>
 )}

 
 </div>
 </div>
 </div>
 );
}
