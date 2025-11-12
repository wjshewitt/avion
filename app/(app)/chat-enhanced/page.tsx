'use client';

import { useEffect, useMemo, useCallback, useDeferredValue } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usePremiumChat } from '@/hooks/usePremiumChat';
import { useFlights } from '@/lib/tanstack/hooks/useFlights';
import { useConversationMessages } from '@/lib/tanstack/hooks/useConversationMessages';
import { useGeneralConversations } from '@/lib/tanstack/hooks/useGeneralConversations';
import { Chat } from '@/components/ui/chat';
import ChatSidebar from '@/components/chat/chat-sidebar';
import { Download, Settings, Plus } from 'lucide-react';
import ContextSelector from '@/components/chat/context-selector';
import { Button } from '@/components/ui/button';
import { useChatSessionStore } from '@/lib/chat-session-store';

export default function EnhancedChatPage() {
 const searchParams = useSearchParams();
 const { activeConversationId, setActiveConversationId } = useChatSessionStore();
 const queryClient = useQueryClient();
 const { data: conversations = [] } = useGeneralConversations();
 const { data: flights = [] } = useFlights();

 // SERVER STATE: Load messages from database via TanStack Query
 const { data: conversationData } = useConversationMessages(activeConversationId);
 const messages = useMemo(
   () => conversationData?.messages ?? [],
   [conversationData]
 );

 useEffect(() => {
   const conversationFromParams = searchParams.get('conversation');
   if (conversationFromParams && conversationFromParams !== activeConversationId) {
     setActiveConversationId(conversationFromParams);
   }
 }, [searchParams, activeConversationId, setActiveConversationId]);

 // UI STATE: Chat input and sending logic with optimistic updates
 const {
  input,
  setInput,
  sendMessage,
  stopStreaming,
  isStreaming,
  isThinking,
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
  }, [])
 });

 // Defer input value to prevent re-renders on every keystroke
 const deferredInput = useDeferredValue(input);

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

 const isLoading = isStreaming || isThinking;

 // ESC key to stop streaming
 useEffect(() => {
   const handleKeyDown = (e: KeyboardEvent) => {
     if (e.key === 'Escape' && isLoading) {
       e.preventDefault();
       stopStreaming();
       toast.info('Generation stopped', {
         description: 'Press ESC anytime to stop generation'
       });
     }
   };

   window.addEventListener('keydown', handleKeyDown);
   return () => window.removeEventListener('keydown', handleKeyDown);
 }, [isLoading, stopStreaming]);

 // Find the active conversation from the database-backed list
 const activeConversation = useMemo(
   () => conversations.find(c => c.id === activeConversationId),
   [conversations, activeConversationId]
 );

 // Transform messages to match Chat component interface - optimized
 const transformedMessages = useMemo(() => {
   return messages.map((msg) => {
     const toolInvocations: any[] = [];

     if (msg.weather_tool_data && msg.weather_tool_data.length > 0) {
       msg.weather_tool_data.forEach((weatherItem: any) => {
         toolInvocations.push({
           state: 'result' as const,
           toolName: 'get_airport_weather',
           result: { data: weatherItem },
         });
       });
     }

     if (msg.airport_tool_data && msg.airport_tool_data.length > 0) {
       msg.airport_tool_data.forEach((airportItem: any) => {
         toolInvocations.push({
           state: 'result' as const,
           toolName: 'get_airport_details',
           result: { data: airportItem },
         });
       });
     }

     return {
       id: msg.id,
       role: msg.role,
       content: msg.content,
       createdAt: new Date(msg.created_at),
       thinking_content: msg.thinking_content,
       thinking_tokens: msg.thinking_tokens,
       toolInvocations: toolInvocations.length > 0 ? toolInvocations : undefined,
     };
   });
 }, [messages]);

 const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
   setInput(e.target.value);
 }, [setInput]);

 const handleSubmit = useCallback((event?: { preventDefault?: () => void }) => {
   event?.preventDefault?.();
   if (!input.trim() || isLoading) return;
   sendMessage();
 }, [input, isLoading, sendMessage]);

 const handleAppend = useCallback((message: { role: 'user'; content: string }) => {
   sendMessage(message.content);
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
 <header className="border-b border-border bg-card px-6 py-2 flex-shrink-0">
 <div className="flex items-center justify-between">
 <div className="flex-1 min-w-0">
 <div className="flex items-baseline gap-2">
 <h1 className="text-sm font-semibold text-foreground truncate">
 {activeConversation?.title || 'AI Aviation Assistant'}
 </h1>
 <div className="text-[10px] text-muted-foreground/70">
 {isLoading ? (
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
 </div>

 <div className="flex items-center gap-2 ml-4">
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

 <div
 className="text-muted-foreground/70 hover:text-foreground/90 cursor-pointer transition-colors p-1.5 rounded-sm hover:bg-muted/30"
 title="Settings"
 >
 <Settings size={13} />
 </div>
 </div>
 </div>
 </header>

 {/* Chat Interface */}
 <div className="flex-1 min-h-0 flex flex-col">
 <Chat
 messages={transformedMessages as any}
 input={input}
 handleInputChange={handleInputChange}
 handleSubmit={handleSubmit}
 isGenerating={isLoading}
 stop={stopStreaming}
 append={handleAppend}
 suggestions={contextSuggestions}
 className="flex-1 h-full px-6 py-4"
 />
 </div>
 </div>
 </div>
 );
}
