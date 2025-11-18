"use client";

import { useMemo } from "react";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { VerifiedSources, type SourceItem } from "@/components/ai/sources";
import { Cpu } from "lucide-react";

interface AIMessageProps {
  content: string;
  isUser: boolean;
  timestamp?: string;
  material?: "ceramic" | "tungsten";
  showTimestamp?: boolean;
  toolCalls?: any[]; // Tool calls from the message
}

// Extract sources from markdown content
function extractSources(content: string): SourceItem[] | null {
  const sourceMatch = content.match(/\*\*Sources:\*\*\s*([\s\S]*?)(?:\n\n|$)/);
  if (!sourceMatch) return null;

  const sourcesText = sourceMatch[1];
  const sourceLines = sourcesText.split('\n').filter(line => line.trim());
  
  return sourceLines.map((line): SourceItem | null => {
    const match = line.match(/^\d+\.\s*\[(.*?)\]\s*(.*)/);
    if (match) {
      return {
        category: match[1],
        description: match[2]
      };
    }
    return null;
  }).filter((item): item is SourceItem => item !== null);
}

// Remove sources from content
function removeSources(content: string) {
  return content.replace(/\*\*Sources:\*\*\s*[\s\S]*?(?=\n\n|$)/g, '').trim();
}

export function AIMessage({
  content,
  isUser,
  timestamp,
  material = "tungsten",
  showTimestamp = false,
  toolCalls = [],
}: AIMessageProps) {
  const sources = useMemo(() => (isUser ? null : extractSources(content)), [content, isUser]);
  const cleanContent = useMemo(() => {
    if (isUser || !sources) return content;
    return removeSources(content);
  }, [content, isUser, sources]);

  // Only show sources if tools were called or explicit citations present
  const shouldShowSources = useMemo(() => {
    if (isUser) return false;
    if (toolCalls && toolCalls.length > 0) return true;
    if (sources && sources.length > 0) return true;
    return false;
  }, [isUser, toolCalls, sources]);

  // Completely hide if empty content (unless it's a tool call container, but AIMessage usually handles text)
  // If toolCalls are passed, we might still want to render the container depending on usage.
  // But standard text messages should be hidden if empty.
  if (!isUser && !cleanContent?.trim() && (!toolCalls || toolCalls.length === 0)) {
    return null;
  }

  if (isUser) {
    return (
      <div className="flex flex-col items-end mb-8 group">
        <div className="flex items-center gap-2 mb-1 opacity-70">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            COMMAND INPUT
          </span>
          {showTimestamp && timestamp && (
            <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
              {timestamp}
            </span>
          )}
        </div>
        <div className="max-w-[85%] relative">
          <div className="groove bg-background rounded-sm px-5 py-4 border border-border/50">
            <div className="text-sm text-foreground leading-relaxed font-medium">
              <MarkdownRenderer>{cleanContent}</MarkdownRenderer>
            </div>
          </div>
          {/* Decorative corner bracket for user input */}
          <div className="absolute -right-1 -bottom-1 w-2 h-2 border-r border-b border-primary/30" />
        </div>
      </div>
    );
  }

  // AI Message - Flight Deck Instrument Panel
  return (
    <div className="mb-10 group relative pl-4">
      {/* Connection Line */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-border/50 group-hover:bg-primary/20 transition-colors" />
      
      <div className="flex flex-col gap-0 max-w-3xl">
        {/* Header Strip */}
        <div className="flex items-center justify-between mb-2 pl-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900/50 px-2 py-1 rounded-sm border border-border">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F04E30]"></span>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">
                AVION AI // V2.5
              </span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground hidden sm:inline-block">
              SYSTEM READOUT
            </span>
          </div>
          
          {showTimestamp && timestamp && (
            <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
              T+{timestamp}
            </span>
          )}
        </div>

        {/* Main Data Panel */}
        <div className="tungsten-panel relative overflow-hidden rounded-sm">
          {/* Scanline Effect */}
          <div className="scanline-effect opacity-10" />
          
          {/* Content Area */}
          <div className="p-6 relative z-10">
            <div className="text-sm text-zinc-200 leading-7 tracking-wide">
              <MarkdownRenderer>{cleanContent}</MarkdownRenderer>
            </div>
          </div>

          {/* Sources Data Grid */}
          {shouldShowSources && sources && sources.length > 0 && (
            <VerifiedSources sources={sources} />
          )}
          
          {/* Footer Status Bar */}
          <div className="h-6 bg-black/40 border-t border-white/5 flex items-center justify-between px-3">
            <div className="flex items-center gap-4">
               <span className="text-[9px] font-mono text-zinc-600 uppercase">
                 STATUS: NOMINAL
               </span>
               <span className="text-[9px] font-mono text-zinc-600 uppercase">
                 LATENCY: 42ms
               </span>
            </div>
            <Cpu size={10} className="text-zinc-700" />
          </div>
        </div>
      </div>
    </div>
  );
}

