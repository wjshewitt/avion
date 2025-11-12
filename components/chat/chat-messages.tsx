'use client';

import { useEffect, useRef } from 'react';
import { useConversationMessages } from '@/lib/tanstack/hooks/useConversationMessages';
import ChatMessage from './chat-message';
import { Loader2 } from 'lucide-react';

interface ChatMessagesProps {
 conversationId: string | null;
 isGenerating?: boolean;
}

export default function ChatMessages({ conversationId, isGenerating = false }: ChatMessagesProps) {
 const { data, isLoading, error } = useConversationMessages(conversationId);
 const messages = data?.messages || [];
 const messagesEndRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
 }, [messages.length, isGenerating]);

 if (!conversationId) {
 return (
 <div className="flex-1 flex items-center justify-center">
 <div className="text-center">
 <div className="text-4xl mb-4">💬</div>
 <p className="text-muted-foreground">Select or create a conversation to start chatting</p>
 </div>
 </div>
 );
 }

 if (isLoading) {
 return (
 <div className="flex-1 flex items-center justify-center">
 <Loader2 className="animate-spin text-text-secondary" size={32} />
 </div>
 );
 }

 if (error) {
 return (
 <div className="flex-1 flex items-center justify-center">
 <div className="text-center text-red-600 dark:text-red-400">
 <p>Failed to load messages</p>
 </div>
 </div>
 );
 }

 if (messages.length === 0 && !isGenerating) {
 return (
 <div className="flex-1 flex items-center justify-center p-8">
 <div className="text-center max-w-md">
 <div className="text-4xl mb-4">✈️</div>
 <h3 className="text-lg font-semibold text-foreground mb-2">
 Start a conversation
 </h3>
 <p className="text-sm text-muted-foreground mb-4">
 Ask about flight operations, weather conditions, risk assessments, or anything aviation-related.
 </p>
 <div className="flex flex-wrap gap-2 justify-center">
 <span className="text-xs px-3 py-1.5 bg-muted">What's the weather?</span>
 <span className="text-xs px-3 py-1.5 bg-muted">Show flight risks</span>
 <span className="text-xs px-3 py-1.5 bg-muted">Generate briefing</span>
 </div>
 </div>
 </div>
 );
 }

 const handleCopy = (content: string) => {
 navigator.clipboard.writeText(content);
 };

 return (
 <div className="flex-1 overflow-y-auto p-6 min-h-0">
 {messages.map((message) => (
 <ChatMessage
 key={message.id}
 message={{
 id: message.id,
 role: message.role,
 content: message.content,
 timestamp: new Date(message.created_at),
 }}
 onCopy={() => handleCopy(message.content)}
 onDelete={undefined} // Remove delete functionality for now
 />
 ))}
 {isGenerating && (
 <div className="flex items-center gap-2 text-muted-foreground py-4">
 <Loader2 className="animate-spin" size={16} />
 <span className="text-sm">AI is thinking...</span>
 </div>
 )}
 <div ref={messagesEndRef} />
 </div>
 );
}
