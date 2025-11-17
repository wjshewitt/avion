'use client';

import { Plus, Settings, X } from 'lucide-react';
import { LEDStatus } from '@/components/ai-drawer/LEDStatus';
import ContextSelector from '@/components/chat/context-selector';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  conversationTitle?: string;
  aiStatus: 'ready' | 'thinking' | 'streaming' | 'error';
  providerLabel: string;
  showSettings: boolean;
  onToggleSettings: () => void;
  onNewChat: () => void;
}

export function ChatHeader({
  conversationTitle,
  aiStatus,
  providerLabel,
  showSettings,
  onToggleSettings,
  onNewChat,
}: ChatHeaderProps) {
  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm flex-shrink-0 z-10">
      <div className="h-full px-6 flex items-center justify-between gap-4">
        {/* Left: Page Label & Title */}
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-1">
            Chat Console
          </div>
          <h1 className="text-base font-medium text-foreground truncate">
            {showSettings ? 'Chat Settings' : conversationTitle || 'AI Aviation Assistant'}
          </h1>
        </div>

        {/* Right: Status & Controls */}
        <div className="flex items-center gap-4">
          {!showSettings && (
            <>
              {/* AI Status */}
              <div className="flex items-center gap-3 text-xs">
                <LEDStatus status={aiStatus} size="sm" />
                <span className="font-mono text-muted-foreground truncate max-w-[200px] tabular-nums">
                  {providerLabel}
                </span>
              </div>

              {/* Context Selector */}
              <ContextSelector />

              {/* New Chat Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onNewChat}
                title="New Chat"
                className="h-8 w-8"
              >
                <Plus size={16} strokeWidth={1.5} />
              </Button>
            </>
          )}

          {/* Settings Toggle */}
          <Button
            variant={showSettings ? 'default' : 'ghost'}
            size="icon"
            onClick={onToggleSettings}
            title={showSettings ? 'Close Settings' : 'Settings'}
            className={showSettings ? 'h-8 w-8 bg-primary hover:bg-primary/90' : 'h-8 w-8'}
          >
            {showSettings ? (
              <X size={16} strokeWidth={1.5} />
            ) : (
              <Settings size={16} strokeWidth={1.5} />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
