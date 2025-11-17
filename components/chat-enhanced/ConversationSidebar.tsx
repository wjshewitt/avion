'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Plus, Search, MessageSquare, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const query = searchQuery.toLowerCase();
    return conversations.filter((conv) => {
      const title = conv.title?.toLowerCase() || '';
      const firstMessage = conv.messages?.[0]?.content?.toLowerCase() || '';
      return title.includes(query) || firstMessage.includes(query);
    });
  }, [conversations, searchQuery]);

  const activeCount = filteredConversations.length;

  return (
    <aside className="w-[300px] border-r border-border bg-background flex flex-col">
      {/* Header with New Chat button */}
      <div className="p-4 border-b border-border">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-sm text-xs font-mono uppercase tracking-wider transition-colors shadow-sm"
        >
          <Plus size={16} strokeWidth={1.5} />
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
            {activeCount > 0 && (
              <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-sm text-[10px] font-mono tabular-nums">
                {activeCount}
              </span>
            )}
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
                <div className="groove-input flex items-center bg-card border border-border rounded-sm px-3 py-2">
                  <Search size={14} strokeWidth={1.5} className="text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className="w-full bg-transparent pl-2 border-none text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isExpanded && filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare size={32} strokeWidth={1.5} className="text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'No matching conversations' : 'No conversations yet'}
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
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={cn(
                  'w-full text-left px-3 py-2.5 rounded-sm transition-all duration-150 border',
                  isActive
                    ? 'bg-primary/10 border-primary/50 shadow-sm'
                    : 'bg-card border-border hover:bg-accent/50 hover:border-border'
                )}
              >
                <div className="flex items-start gap-2">
                  <MessageSquare
                    size={14}
                    strokeWidth={1.5}
                    className={cn(
                      'mt-0.5 flex-shrink-0',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        'text-sm truncate',
                        isActive ? 'text-foreground font-medium' : 'text-foreground'
                      )}
                    >
                      {displayTitle}
                    </p>
                    {conv.updated_at && (
                      <p className="text-[10px] font-mono text-muted-foreground mt-1 tabular-nums">
                        {new Date(conv.updated_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Footer with timestamp */}
      {isExpanded && filteredConversations.length > 0 && (
        <div className="px-4 py-2 border-t border-border">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
            <Clock size={12} strokeWidth={1.5} />
            <span>
              {filteredConversations.length} conversation
              {filteredConversations.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}
