"use client";

import { useMemo } from "react";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { Sources, SourcesTrigger, SourcesContent, Source } from "@/components/ai/sources";

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
    const bgColor = 'bg-surface';
    const textColor = 'text-text-primary';
    const borderColor = 'border-border';

    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[80%]">
          <div className={`${bgColor} ${borderColor} border rounded-sm p-3 shadow-sm`}>
            <div className={`text-sm ${textColor} leading-relaxed`}>
              <MarkdownRenderer>{cleanContent}</MarkdownRenderer>
            </div>
          </div>
          {showTimestamp && timestamp && (
            <div className="text-[10px] font-mono text-zinc-400 mt-1 text-right">
              {timestamp}
            </div>
          )}
        </div>
      </div>
    );
  }

  // AI Message with proper sources rendering - Avion v1.5 precision instrument style
  return (
    <div className="mb-4">
      {/* Sources - Only if tools called or explicit citations */}
      {shouldShowSources && sources && sources.length > 0 && (
        <div className="mb-2">
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

      {/* Avion v1.5: Tungsten card with groove header and instrument aesthetic */}
      <div className="border border-border rounded-sm overflow-hidden bg-card">
        {/* Header bar with badge - groove shadow */}
        <div 
          className="px-3 py-1.5 bg-muted/30 border-b border-border flex items-center justify-between"
          style={{ boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.06)' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              AVION AI
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm bg-blue-500/10 text-blue-600 border border-blue-500/20">
              2.5F
            </span>
          </div>
          {showTimestamp && timestamp && (
            <span className="text-[10px] font-mono text-muted-foreground">
              {timestamp}
            </span>
          )}
        </div>

        {/* Message body */}
        <div className="px-3 py-3 bg-card">
          <div className="text-sm text-foreground leading-relaxed">
            <MarkdownRenderer>{cleanContent}</MarkdownRenderer>
          </div>
        </div>
      </div>
    </div>
  );
}
