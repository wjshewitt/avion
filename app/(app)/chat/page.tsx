'use client';

import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import ChatSidebar from '@/components/chat/chat-sidebar';
import ChatHeader from '@/components/chat/chat-header';
import ChatMessages from '@/components/chat/chat-messages';
import ChatInput from '@/components/chat/chat-input';

export default function ChatPage() {
 const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
 const [isGenerating, setIsGenerating] = useState(false);
 const queryClient = useQueryClient();

 const handleConversationSelect = useCallback((id: string) => {
 setActiveConversationId(id);
 }, []);

 const handleMessageSent = useCallback(async () => {
 // Start generating state
 setIsGenerating(true);
 
 // Wait a bit for the API to process
 await new Promise(resolve => setTimeout(resolve, 500));
 
 // Invalidate queries to refetch messages
 await queryClient.invalidateQueries({ 
 queryKey: ['conversation-messages', activeConversationId] 
 });
 await queryClient.invalidateQueries({ 
 queryKey: ['general-conversations'] 
 });
 
 // End generating state
 setIsGenerating(false);
 }, [activeConversationId, queryClient]);

 return (
 <div className="flex h-full overflow-hidden">
 {/* Sidebar */}
 <ChatSidebar 
 activeConversationId={activeConversationId}
 onConversationSelect={handleConversationSelect}
 />

 {/* Main Chat Area */}
 <div className="flex-1 flex flex-col min-h-0">
 <ChatHeader conversationTitle={activeConversationId ? 'Chat' : undefined} />
 <ChatMessages 
 conversationId={activeConversationId}
 isGenerating={isGenerating}
 />
 <ChatInput 
 conversationId={activeConversationId}
 onMessageSent={handleMessageSent}
 isGenerating={isGenerating}
 />
 </div>
 </div>
 );
}
