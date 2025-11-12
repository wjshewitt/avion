'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Pin, Trash2, Loader2, AlertTriangle, MessageSquare } from 'lucide-react';
import { useGeneralConversations, useCreateConversation, useDeleteConversation } from '@/lib/tanstack/hooks/useGeneralConversations';
import CornerBracket from '../corner-bracket';

interface ConversationListItem {
 id: string;
 title: string;
 chat_type: 'general' | 'flight';
 message_count: number;
 last_message_preview: string;
 created_at: string;
 updated_at: string;
 pinned?: boolean;
}

interface ChatSidebarProps {
 activeConversationId: string | null;
 onConversationSelect: (id: string) => void;
}

const MS_IN_DAY = 24 * 60 * 60 * 1000;

export default function ChatSidebar({ activeConversationId, onConversationSelect }: ChatSidebarProps) {
 const [searchQuery, setSearchQuery] = useState('');
 const queryClient = useQueryClient();
 const { data: conversations = [], isLoading, error } = useGeneralConversations();
 const createConversation = useCreateConversation();
 const deleteConversation = useDeleteConversation();
 
 // Prefetch conversation messages on hover for instant loading
 const prefetchConversation = (conversationId: string) => {
   queryClient.prefetchQuery({
     queryKey: ['conversation-messages', conversationId],
     queryFn: async () => {
       const response = await fetch(`/api/chat/conversations/${conversationId}/messages`);
       if (!response.ok) throw new Error('Failed to fetch messages');
       const data = await response.json();
       return { messages: data.messages, notFound: false };
     },
     staleTime: 10 * 60 * 1000,
   });
 };

 const filteredConversations = conversations.filter((c) =>
 c.title.toLowerCase().includes(searchQuery.toLowerCase())
 );

 const startOfTodayUtc = (() => {
   const now = new Date();
   return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
 })();

 const groupedConversations = filteredConversations.reduce(
   (groups, conversation) => {
     if (conversation.pinned) {
       groups.pinned.push(conversation);
       return groups;
     }

     const updatedDate = new Date(conversation.updated_at);
     const updatedDayUtc = Date.UTC(
       updatedDate.getUTCFullYear(),
       updatedDate.getUTCMonth(),
       updatedDate.getUTCDate()
     );

     const diffDays = Math.floor((startOfTodayUtc - updatedDayUtc) / MS_IN_DAY);

     if (diffDays <= 0) {
       groups.today.push(conversation);
     } else if (diffDays === 1) {
       groups.yesterday.push(conversation);
     } else if (diffDays <= 7) {
       groups.lastWeek.push(conversation);
     } else {
       groups.older.push(conversation);
     }

     return groups;
   },
   {
     pinned: [] as ConversationListItem[],
     today: [] as ConversationListItem[],
     yesterday: [] as ConversationListItem[],
     lastWeek: [] as ConversationListItem[],
     older: [] as ConversationListItem[],
   }
 );

 const handleNewConversation = async () => {
 const name = `New Chat ${conversations.length + 1}`;
 const result = await createConversation.mutateAsync(name);
 if (result.conversation) {
 onConversationSelect(result.conversation.id);
 }
 };

 return (
 <aside className="w-72 bg-background-primary border-r border-border flex flex-col">
 {/* Header */}
 <div className="p-4 border-b border-border">
 <button
 onClick={handleNewConversation}
 disabled={createConversation.isPending}
 className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue text-white hover:bg-blue/90 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {createConversation.isPending ? (
 <Loader2 size={16} className="animate-spin" />
 ) : (
 <Plus size={16} />
 )}
 <span>New Chat</span>
 </button>
 </div>

 {/* Search */}
 <div className="p-3 border-b border-border">
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Search conversations..."
 className="w-full pl-9 pr-3 py-2 bg-muted border border-transparent text-sm placeholder:text-muted-foreground focus:outline-none focus:border-blue focus:bg-card transition-colors"
 />
 </div>
 </div>

 {/* Conversation List */}
 <div className="flex-1 overflow-y-auto p-2">
 {isLoading && conversations.length === 0 && (
 <div className="flex flex-col items-center justify-center py-12 gap-3">
 <Loader2 className="animate-spin text-blue" size={24} />
 <p className="text-xs text-muted-foreground">Loading conversations...</p>
 </div>
 )}

 {error && conversations.length === 0 && (
 <div className="flex flex-col items-center justify-center py-12 gap-3 text-center px-4">
 <div className="w-12 h-12 border-2 border-red/20 bg-red/5 flex items-center justify-center">
 <AlertTriangle className="text-red" size={20} />
 </div>
 <div>
 <p className="text-sm font-medium text-red-600 mb-1">Failed to load</p>
 <p className="text-xs text-text-secondary">Could not fetch conversations</p>
 </div>
 </div>
 )}

 {conversations.length > 0 && (
 <>
 {groupedConversations.pinned.length > 0 && (
 <ConversationGroup 
 title="Pinned" 
 conversations={groupedConversations.pinned}
 activeConversationId={activeConversationId}
 onSelect={onConversationSelect}
 onDelete={(id) => deleteConversation.mutate(id)}
 onPrefetch={prefetchConversation}
 />
 )}
 {groupedConversations.today.length > 0 && (
 <ConversationGroup 
 title="Today" 
 conversations={groupedConversations.today}
 activeConversationId={activeConversationId}
 onSelect={onConversationSelect}
 onDelete={(id) => deleteConversation.mutate(id)}
 onPrefetch={prefetchConversation}
 />
 )}
 {groupedConversations.yesterday.length > 0 && (
 <ConversationGroup 
 title="Yesterday" 
 conversations={groupedConversations.yesterday}
 activeConversationId={activeConversationId}
 onSelect={onConversationSelect}
 onDelete={(id) => deleteConversation.mutate(id)}
 onPrefetch={prefetchConversation}
 />
 )}
 {groupedConversations.lastWeek.length > 0 && (
 <ConversationGroup 
 title="Last 7 Days" 
 conversations={groupedConversations.lastWeek}
 activeConversationId={activeConversationId}
 onSelect={onConversationSelect}
 onDelete={(id) => deleteConversation.mutate(id)}
 onPrefetch={prefetchConversation}
 />
 )}
 {groupedConversations.older.length > 0 && (
 <ConversationGroup 
 title="Older" 
 conversations={groupedConversations.older}
 activeConversationId={activeConversationId}
 onSelect={onConversationSelect}
 onDelete={(id) => deleteConversation.mutate(id)}
 onPrefetch={prefetchConversation}
 />
 )}

 {filteredConversations.length === 0 && conversations.length === 0 && !isLoading && (
 <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-4">
 <div className="w-16 h-16 border-2 border-border bg-surface flex items-center justify-center">
 <MessageSquare className="text-text-secondary" size={24} />
 </div>
 <div>
 <p className="text-sm font-medium text-text-primary mb-1">No conversations yet</p>
 <p className="text-xs text-text-secondary">Start a new chat to begin</p>
 </div>
 </div>
 )}
 </>
 )}
 </div>
 </aside>
 );
}

interface ConversationGroupProps {
 title: string;
 conversations: ConversationListItem[];
 activeConversationId: string | null;
 onSelect: (id: string) => void;
 onDelete: (id: string) => void;
 onPrefetch: (id: string) => void;
}

function ConversationGroup({ title, conversations, activeConversationId, onSelect, onDelete, onPrefetch }: ConversationGroupProps) {
 return (
 <div className="mb-6">
 <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</div>
 <div className="space-y-0.5 mt-1">
 {conversations.map((conv) => (
 <div
 key={conv.id}
 onClick={() => onSelect(conv.id)}
 onMouseEnter={() => onPrefetch(conv.id)}
 role="button"
 tabIndex={0}
 onKeyDown={(e) => {
 if (e.key === 'Enter' || e.key === ' ') {
 e.preventDefault();
 onSelect(conv.id);
 }
 }}
 className={`group w-full text-left p-3 transition-all cursor-pointer border-l-2 ${
 activeConversationId === conv.id 
 ? 'bg-blue/5 border-blue' 
 : 'border-transparent hover:bg-surface hover:border-border'
 }`}
 >
 <div className="flex items-start justify-between gap-2">
 <div className="flex-1 min-w-0">
 <div className="font-medium text-sm text-text-primary truncate mb-0.5">
 {conv.title}
 </div>
 <div className="text-xs text-text-secondary">
 {conv.message_count} {conv.message_count === 1 ? 'message' : 'messages'}
 </div>
 </div>
 <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
 <button
 onClick={(e) => {
 e.stopPropagation();
 if (confirm('Delete this conversation?')) {
 onDelete(conv.id);
 }
 }}
 className="p-1.5 hover:bg-red/10 hover:text-red transition-colors rounded"
 title="Delete"
 >
 <Trash2 size={14} />
 </button>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 );
}
