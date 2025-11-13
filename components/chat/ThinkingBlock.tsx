"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronDown, ChevronUp, Brain, Zap, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatSettings } from "@/lib/chat-settings-store";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";

const AUTO_CLOSE_DELAY = 1000; // 1 second delay before auto-close

interface ThinkingBlockProps {
  content: string;
  tokens?: number;
  isStreaming?: boolean;
  // Controlled state
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  // Duration tracking (optional manual override)
  duration?: number;
}

export function ThinkingBlock({ 
  content, 
  tokens = 0,
  isStreaming = false,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  duration: controlledDuration,
}: ThinkingBlockProps) {
  const { showThinkingProcess } = useChatSettings();
  
  // Internal state for uncontrolled mode
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [internalDuration, setInternalDuration] = useState(0);
  
  // Determine if controlled or uncontrolled
  const isControlled = controlledOpen !== undefined;
  const expanded = isControlled ? controlledOpen : internalOpen;
  const duration = controlledDuration !== undefined ? controlledDuration : internalDuration;
  
  // Refs for tracking
  const streamingStartTimeRef = useRef<number | null>(null);
  const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const wasStreamingRef = useRef(false);
  
  // Handle open state changes
  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (isControlled) {
      onOpenChange?.(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  }, [isControlled, onOpenChange]);
  
  // Auto-open/close behavior based on streaming state
  useEffect(() => {
    // Streaming started
    if (isStreaming && !wasStreamingRef.current) {
      wasStreamingRef.current = true;
      streamingStartTimeRef.current = Date.now();
      
      // Auto-open when streaming starts
      handleOpenChange(true);
      
      // Clear any pending auto-close timer
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
        autoCloseTimerRef.current = null;
      }
      
      // Start duration tracking (update every second)
      durationIntervalRef.current = setInterval(() => {
        if (streamingStartTimeRef.current) {
          const elapsed = Math.floor((Date.now() - streamingStartTimeRef.current) / 1000);
          setInternalDuration(elapsed);
        }
      }, 1000);
    }
    
    // Streaming ended
    if (!isStreaming && wasStreamingRef.current) {
      wasStreamingRef.current = false;
      
      // Stop duration tracking and freeze at final value
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
      
      if (streamingStartTimeRef.current) {
        const finalDuration = Math.floor((Date.now() - streamingStartTimeRef.current) / 1000);
        setInternalDuration(finalDuration);
      }
      
      // Schedule auto-close with delay
      autoCloseTimerRef.current = setTimeout(() => {
        handleOpenChange(false);
      }, AUTO_CLOSE_DELAY);
    }
    
    // Cleanup on unmount
    return () => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [isStreaming, handleOpenChange]);
  
  if (!showThinkingProcess || !content.trim()) return null;
  
  return (
    <div className="mb-2 w-full max-w-2xl">
      {/* Container - straight edges, clean borders */}
      <div className="border border-border overflow-hidden bg-muted/30">
        
        {/* Header Bar - clickable to expand/collapse */}
        <button
          onClick={() => {
            // Cancel auto-close timer if user manually toggles
            if (autoCloseTimerRef.current) {
              clearTimeout(autoCloseTimerRef.current);
              autoCloseTimerRef.current = null;
            }
            handleOpenChange(!expanded);
          }}
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
            {duration > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>
                  {isStreaming ? `${duration}s` : `Thought for ${duration}s`}
                </span>
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
