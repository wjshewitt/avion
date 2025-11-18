"use client";

import { useMemo } from "react";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { Sources, SourcesTrigger, SourcesContent, Source } from "@/components/ai/sources";
import { Bot } from "lucide-react";

interface AIMessageProps {
  content: string;
  isUser: boolean;
  timestamp?: string;
  material?: "ceramic" | "tungsten";
  showTimestamp?: boolean;
  toolCalls?: any[]; // Tool calls from the message
}

// Extract sources from markdown content
function extractSources(content: string) {
  const sourceMatch = content.match(/\*\*Sources:\*\*\s*([\s\S]*?)(?:\n\n|$)/);
  if (!sourceMatch) return null;

  const sourcesText = sourceMatch[1];
  const sourceLines = sourcesText.split('\n').filter(line => line.trim());
  
  return sourceLines.map(line => {
    const match = line.match(/^\d+\.\s*\[(.*?)\]\s*(.*)/);
    if (match) {
      return {
        category: match[1],
        description: match[2]
      };
    }
    return null;
  }).filter(Boolean);
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

  if (isUser) {
    return (
      <div className="flex justify-end mb-6 group">
        <div className="max-w-[85%] pl-12">
          <div className="bg-[#F4F4F4] dark:bg-[#2A2A2A] rounded-2xl rounded-tr-sm px-5 py-4 shadow-sm">
            <div className="text-sm text-foreground leading-relaxed">
              <MarkdownRenderer>{cleanContent}</MarkdownRenderer>
            </div>
          </div>
          {showTimestamp && timestamp && (
            <div className="text-[10px] font-mono text-zinc-400 mt-1.5 text-right tabular-nums opacity-0 group-hover:opacity-100 transition-opacity">
              {timestamp}
            </div>
          )}
        </div>
      </div>
    );
  }

  // AI Message - Professional Console Style
  return (
    <div className="mb-8 group flex gap-4">
      {/* Avatar Column */}
      <div className="flex-shrink-0 pt-1">
        <div className="h-8 w-8 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shadow-sm ring-1 ring-zinc-100 dark:ring-zinc-900">
          <Bot size={16} className="text-blue-600 dark:text-blue-400" />
        </div>
      </div>

      {/* Content Column */}
      <div className="flex-1 max-w-3xl min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2 select-none">
          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Avion AI
          </span>
          {showTimestamp && timestamp && (
            <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 tabular-nums">
              {timestamp}
            </span>
          )}
        </div>

        {/* Message Bubble */}
        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
          {/* Message Body */}
          <div className="text-sm text-foreground leading-7">
            <MarkdownRenderer>{cleanContent}</MarkdownRenderer>
          </div>

          {/* Sources Footer */}
          {shouldShowSources && sources && sources.length > 0 && (
            <div className="mt-4 pt-3 border-t border-dashed border-zinc-200 dark:border-zinc-800/50">
              <Sources>
                <SourcesTrigger count={sources.length} />
                <SourcesContent>
                  {sources.map((source: any, i) => (
                    <Source
                      key={i}
                      href="#"
                      title={`[${source.category}] ${source.description}`}
                    />
                  ))}
                </SourcesContent>
              </Sources>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
