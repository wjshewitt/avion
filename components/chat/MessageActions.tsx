'use client';

import { useState } from 'react';
import { Copy, Check, RefreshCw, Edit2, ThumbsUp, ThumbsDown, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FlightChatMessage } from '@/lib/chat/messages';

interface MessageActionsProps {
  message: FlightChatMessage;
  onCopy?: () => void;
  onRegenerate?: () => void;
  onEdit?: () => void;
  onRate?: (rating: 'up' | 'down') => void;
  className?: string;
  compact?: boolean;
}

export function MessageActions({
  message,
  onCopy,
  onRegenerate,
  onEdit,
  onRate,
  className,
  compact = false,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const [rated, setRated] = useState<'up' | 'down' | null>(null);
  const [showMore, setShowMore] = useState(false);

  const isAssistant = message.role === 'assistant';
  const isUser = message.role === 'user';

  const handleCopy = () => {
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRate = (rating: 'up' | 'down') => {
    setRated(rating);
    onRate?.(rating);
  };

  if (compact) {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        <button
          onClick={handleCopy}
          className="p-1 hover:bg-muted rounded transition-colors"
          title="Copy"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-600" />
          ) : (
            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>
        
        {isAssistant && onRegenerate && (
          <button
            onClick={onRegenerate}
            className="p-1 hover:bg-muted rounded transition-colors"
            title="Regenerate"
          >
            <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
        
        {isUser && onEdit && (
          <button
            onClick={onEdit}
            className="p-1 hover:bg-muted rounded transition-colors"
            title="Edit"
          >
            <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2 relative', className)}>
      {/* Copy */}
      <button
        onClick={handleCopy}
        className={cn(
          'flex items-center gap-1.5 px-2 py-1 text-xs rounded transition-colors',
          'hover:bg-muted border border-border',
          copied && 'text-green-600 border-green-600'
        )}
        title="Copy message"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5" />
            <span>Copied</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            <span>Copy</span>
          </>
        )}
      </button>

      {/* Regenerate (assistant only) */}
      {isAssistant && onRegenerate && (
        <button
          onClick={onRegenerate}
          className="flex items-center gap-1.5 px-2 py-1 text-xs rounded transition-colors hover:bg-muted border border-border"
          title="Regenerate response"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Regenerate</span>
        </button>
      )}

      {/* Edit (user only) */}
      {isUser && onEdit && (
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 px-2 py-1 text-xs rounded transition-colors hover:bg-muted border border-border"
          title="Edit message"
        >
          <Edit2 className="h-3.5 w-3.5" />
          <span>Edit</span>
        </button>
      )}

      {/* Rating (assistant only) */}
      {isAssistant && onRate && (
        <div className="flex items-center gap-1 border border-border rounded">
          <button
            onClick={() => handleRate('up')}
            className={cn(
              'p-1.5 rounded-l transition-colors',
              rated === 'up' ? 'bg-green-100 text-green-600' : 'hover:bg-muted'
            )}
            title="Good response"
          >
            <ThumbsUp className="h-3.5 w-3.5" />
          </button>
          <div className="w-px h-4 bg-border" />
          <button
            onClick={() => handleRate('down')}
            className={cn(
              'p-1.5 rounded-r transition-colors',
              rated === 'down' ? 'bg-red-100 text-red-600' : 'hover:bg-muted'
            )}
            title="Poor response"
          >
            <ThumbsDown className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* More options */}
      <div className="relative">
        <button
          onClick={() => setShowMore(!showMore)}
          className="p-1.5 hover:bg-muted rounded transition-colors border border-border"
          title="More options"
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>

        {showMore && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMore(false)}
            />
            
            {/* Dropdown menu */}
            <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded shadow-lg z-20 min-w-[160px]">
              <button
                onClick={() => {
                  handleCopy();
                  setShowMore(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors text-left"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy message
              </button>
              
              <button
                onClick={() => {
                  // Copy markdown formatted
                  setShowMore(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors text-left"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy as markdown
              </button>

              <div className="border-t border-border my-1" />
              
              <button
                onClick={() => {
                  console.log('Message details:', message);
                  setShowMore(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors text-left text-muted-foreground"
              >
                View details
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
