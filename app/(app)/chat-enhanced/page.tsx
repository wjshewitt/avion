'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { usePremiumChat } from '@/hooks/usePremiumChat';
import { useFlights } from '@/lib/tanstack/hooks/useFlights';
import { useConversationMessages } from '@/lib/tanstack/hooks/useConversationMessages';
import { useGeneralConversations } from '@/lib/tanstack/hooks/useGeneralConversations';
import { Chat } from '@/components/ui/chat';
import ChatSidebar from '@/components/chat/chat-sidebar';
import { Download, Settings, Plus } from 'lucide-react';
import ContextSelector from '@/components/chat/context-selector';
import { Button } from '@/components/ui/button';

export default function EnhancedChatPage() {
 // Use database-backed conversation management (same as AI sidebar)
 const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
 const queryClient = useQueryClient();
 const { data: conversations = [] } = useGeneralConversations();
 const { data: flights = [] } = useFlights();

 // SERVER STATE: Load messages from database via TanStack Query
 const { data: conversationData, isLoading: isLoadingMessages } = useConversationMessages(activeConversationId);
 const messages = conversationData?.messages || [];

 // UI STATE: Chat input and sending logic with optimistic updates
 const {
 input,
 setInput,
 sendMessage,
 stopStreaming,
 isStreaming,
 isThinking,
 error,
 } = usePremiumChat({
  conversationId: activeConversationId,
  onConversationCreated: (conversationId) => {
    // Set the active conversation ID (database-backed)
    setActiveConversationId(conversationId);
    
    // Invalidate conversations list to show the new conversation
    queryClient.invalidateQueries({ queryKey: ['general-conversations'] });
  },
  onError: (error) => {
    console.error('Chat error:', error);
  }
 });

 // Get suggestions based on available flights
 const getContextSuggestions = () => {
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
 };

 const isLoading = isStreaming || isThinking;

 // Find the active conversation from the database-backed list
 const activeConversation = conversations.find(c => c.id === activeConversationId);

 // Transform messages to match Chat component interface
 const transformedMessages = messages.map((msg) => {
 console.log('🔍 [chat-enhanced] Processing message:', {
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
   console.log('✅ [chat-enhanced] Converting weather_tool_data:', msg.weather_tool_data);
   msg.weather_tool_data.forEach((weatherItem: any) => {
     // WeatherToolUI expects data in result.data format
     const toolInvocation = {
       state: 'result' as const,
       toolName: 'get_airport_weather',
       result: {
         data: weatherItem  // ✅ Wrap in data object for WeatherToolUI
       }
     };
     console.log('📦 [chat-enhanced] Created weather toolInvocation:', toolInvocation);
     toolInvocations.push(toolInvocation);
   });
 }
 
 // Convert airportData to toolInvocations format (for AirportInfoToolUI)
 if (msg.airport_tool_data && msg.airport_tool_data.length > 0) {
   console.log('✅ [chat-enhanced] Converting airport_tool_data:', msg.airport_tool_data);
   msg.airport_tool_data.forEach((airportItem: any) => {
     const toolInvocation = {
       state: 'result' as const,
       toolName: 'get_airport_details',
       result: {
         data: airportItem  // ✅ Wrap in data object for consistency
       }
     };
     console.log('📦 [chat-enhanced] Created airport toolInvocation:', toolInvocation);
     toolInvocations.push(toolInvocation);
   });
 }
 
 console.log('📋 [chat-enhanced] Final toolInvocations for message:', {
   messageId: msg.id,
   toolInvocationsCount: toolInvocations.length,
   toolInvocations
 });

 return {
   id: msg.id,
   role: msg.role,
   content: msg.content,
   timestamp: msg.created_at,
   toolInvocations: toolInvocations.length > 0 ? toolInvocations : undefined
 };
 });

 const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
 setInput(e.target.value);
 };

 const handleSubmit = (event?: { preventDefault?: () => void }) => {
 event?.preventDefault?.();
 if (!input.trim() || isLoading) return;
 sendMessage();
 };

 const handleAppend = (message: { role: 'user'; content: string }) => {
 sendMessage(message.content);
 };

 const handleExport = () => {
 if (messages.length === 0) return;
 const data = JSON.stringify({ messages }, null, 2);
 const blob = new Blob([data], { type: 'application/json' });
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = `chat-export-${new Date().toISOString()}.json`;
 a.click();
 };

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
 <header className="border-b border-border bg-card px-6 py-4 flex-shrink-0">
 <div className="flex items-center justify-between">
 <div className="flex-1 min-w-0">
 <h1 className="text-xl font-semibold text-foreground truncate">
 {activeConversation?.title || 'AI Aviation Assistant'}
 </h1>
 <div className="text-xs text-muted-foreground mt-0.5">
 {activeConversation ? `${messages.length} messages` : 'Advanced flight operations support'}
 </div>
 </div>

 <div className="flex items-center gap-2 ml-4">
 <ContextSelector />

 <Button
 onClick={() => {
   setActiveConversationId(null);
   setInput('');
 }}
 size="sm"
 variant="outline"
 className="gap-2 hidden sm:flex"
 >
 <Plus className="h-4 w-4" />
 <span className="hidden md:inline">New Chat</span>
 </Button>

 {messages.length > 0 && (
 <Button
 onClick={handleExport}
 size="sm"
 variant="ghost"
 className="h-8 w-8 p-0"
 title="Export conversation"
 >
 <Download size={16} />
 </Button>
 )}

 <Button
 size="sm"
 variant="ghost"
 className="h-8 w-8 p-0"
 title="Settings"
 >
 <Settings size={16} />
 </Button>
 </div>
 </div>
 </header>

 {/* Chat Interface */}
 <div className="flex-1 min-h-0">
 <Chat
 messages={transformedMessages as any}
 input={input}
 handleInputChange={handleInputChange}
 handleSubmit={handleSubmit}
 isGenerating={isLoading}
 stop={stopStreaming}
 append={handleAppend}
 suggestions={getContextSuggestions()}
 className="h-full px-6 py-4"
 />
 </div>
 </div>
 </div>
 );
}
