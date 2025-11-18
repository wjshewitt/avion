'use client';

import { Settings, X } from 'lucide-react';
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
}: ChatHeaderProps) {
  return (
    <header className="h-16 border-b border-border bg-background flex-shrink-0 z-10">
      <div className="h-full px-6 flex items-center justify-between gap-4">
        {/* Left: Title & Model Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-medium text-foreground truncate">
            {showSettings ? 'Chat Settings' : conversationTitle || 'Aviation Assistant'}
          </h1>
          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
            {providerLabel.toUpperCase()}
          </div>
        </div>

        {/* Center: Context (if not in settings) */}
        {!showSettings && (
          <div className="hidden md:flex flex-1 justify-center">
             <div className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <ContextSelector />
             </div>
          </div>
        )}

        {/* Right: Status & Controls */}
        <div className="flex items-center gap-4 flex-1 justify-end">
          {!showSettings && (
            /* AI Status */
            <div className="flex items-center gap-2 text-xs">
              <LEDStatus status={aiStatus} size="sm" />
              <span className="font-mono text-muted-foreground uppercase text-[10px] tracking-wider hidden sm:inline-block">
                {aiStatus === 'streaming' ? 'TRANSMITTING' : aiStatus === 'thinking' ? 'PROCESSING' : 'SYSTEM READY'}
              </span>
            </div>
          )}

          {/* Settings Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSettings}
            title={showSettings ? 'Close Settings' : 'Settings'}
            className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            {showSettings ? (
              <X size={18} strokeWidth={1.5} />
            ) : (
              <Settings size={18} strokeWidth={1.5} />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
