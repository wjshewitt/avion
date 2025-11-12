"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Brain, Zap, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useChatSettings } from "@/lib/chat-settings-store";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";

interface ThinkingBlockProps {
  content: string;
  tokens?: number;
  isStreaming?: boolean;
  startTime?: number; // timestamp in ms
}

export function ThinkingBlock({ 
  content, 
  tokens = 0,
  isStreaming = false,
  startTime
}: ThinkingBlockProps) {
  const [expanded, setExpanded] = useState(true); // Default to expanded
  const { showThinkingProcess } = useChatSettings();
  
  // Calculate elapsed time
  const elapsedSeconds = startTime 
    ? Math.floor((Date.now() - startTime) / 1000) 
    : 0;
  
  if (!showThinkingProcess || !content.trim()) return null;
  
  return (
    <div className="mb-2 w-full max-w-2xl">
      {/* Container - straight edges, clean borders */}
      <div className="border border-border overflow-hidden bg-muted/30">
        
        {/* Header Bar - clickable to expand/collapse */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            {isStreaming ? (
              <Brain className="h-4 w-4 text-primary animate-pulse" />
            ) : (
              <Brain className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm font-medium text-foreground">
              {isStreaming ? "Thinking..." : "Thought process"}
            </span>
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          
          {/* Stats - right side */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {elapsedSeconds > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{elapsedSeconds}s</span>
              </div>
            )}
            {tokens > 0 && (
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                <span>{tokens}</span>
              </div>
            )}
          </div>
        </button>
        
        {/* Expandable Content */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="border-t border-border bg-card px-3 py-2">
                <div className="prose prose-sm prose-invert max-w-none text-muted-foreground text-xs">
                  <MarkdownRenderer>{content}</MarkdownRenderer>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
