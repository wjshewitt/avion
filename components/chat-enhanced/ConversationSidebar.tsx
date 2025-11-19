'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, MessageSquare, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDeleteConversation } from '@/lib/tanstack/hooks/useDeleteConversation';

interface Conversation {
  id: string;
  title?: string;
  messages?: any[];
  updated_at?: string;
}

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
}

export function ConversationSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
}: ConversationSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const deleteConversation = useDeleteConversation();

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const query = searchQuery.toLowerCase();
    return conversations.filter((conv) => {
      const title = conv.title?.toLowerCase() || '';
      const firstMessage = conv.messages?.[0]?.content?.toLowerCase() || '';
      return title.includes(query) || firstMessage.includes(query);
    });
  }, [conversations, searchQuery]);

  const handleDelete = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation(); // Prevent selecting the conversation
    
    // If deleting active conversation, trigger new chat
    if (conversationId === activeConversationId) {
      onNewChat();
    }
    
    deleteConversation.mutate({ conversationId });
  };

  return (
    <aside className="w-[300px] border-r border-border bg-background flex flex-col">
      {/* Header with New Chat button */}
      <div className="p-4 border-b border-border">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-border hover:border-muted-foreground/50 bg-card hover:bg-accent text-foreground rounded-sm text-xs font-medium uppercase tracking-wide transition-all"
        >
          New Chat
        </button>
      </div>

      {/* Collapsible History Section */}
      <div className="border-b border-border">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-accent/50 transition-colors"
          aria-expanded={isExpanded}
        >
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
              Chat History
            </span>
          </div>
          <ChevronDown
            size={16}
            strokeWidth={1.5}
            className={cn(
              'text-muted-foreground transition-transform duration-200',
              isExpanded && 'rotate-180'
            )}
          />
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              {/* Search Input */}
              <div className="px-4 pb-3">
                <div className="flex items-center bg-card border border-border rounded-sm px-3 py-2">
                  <Search size={14} strokeWidth={1.5} className="text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search logs..."
                    className="w-full bg-transparent pl-2 border-none text-xs text-foreground placeholder:text-muted-foreground focus:outline-none font-mono"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-0">
        {isExpanded && filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <MessageSquare size={32} strokeWidth={1.5} className="text-muted-foreground/40 mb-3" />
            <p className="text-xs text-muted-foreground">
              {searchQuery ? 'No matching logs found' : 'No logs available'}
            </p>
          </div>
        ) : (
          isExpanded &&
          filteredConversations.map((conv) => {
            const isActive = conv.id === activeConversationId;
            const displayTitle =
              conv.title ||
              conv.messages?.[0]?.content?.substring(0, 50) ||
              'New conversation';

            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={cn(
                  'w-full text-left px-4 py-3 transition-all duration-150 border-b border-border group relative cursor-pointer flex items-start justify-between gap-2',
                  isActive
                    ? 'bg-accent/50'
                    : 'bg-background hover:bg-accent/30'
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#F04E30]" />
                )}
                
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <div className="flex justify-between items-center w-full">
                    <span className={cn(
                      'text-xs font-medium truncate max-w-[180px]', 
                      isActive ? 'text-foreground' : 'text-zinc-500 group-hover:text-zinc-400'
                    )}>
                      {displayTitle}
                    </span>
                    {conv.updated_at && (
                       <span className="text-[10px] font-mono text-zinc-600 tabular-nums">
                         {new Date(conv.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </span>
                    )}
                  </div>
                  {conv.updated_at && (
                    <span className="text-[10px] font-mono text-zinc-600 tabular-nums">
                      {new Date(conv.updated_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
                
                <button
                  onClick={(e) => handleDelete(e, conv.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-destructive/10 rounded-sm"
                  title="Delete conversation"
                >
                  <Trash2 size={14} className="text-muted-foreground hover:text-destructive transition-colors" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
