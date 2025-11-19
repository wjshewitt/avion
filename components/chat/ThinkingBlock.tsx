"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  
  if (!showThinkingProcess) return null;
  
  // Allow rendering if streaming, even if content is empty (initial "Thinking..." state)
  if (!content.trim() && !isStreaming) return null;
  
  // Blue loading bars animation (Avion style)
  const LoadingBars = () => (
    <div className="flex items-end gap-1 h-4">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 bg-blue-600 rounded-full"
          animate={{
            height: ["20%", "100%", "20%"],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="mb-6 w-full max-w-md">
      {/* Main Status Display */}
      <div 
        onClick={() => handleOpenChange(!expanded)}
        className="cursor-pointer group"
      >
        <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2 group-hover:text-zinc-400 transition-colors">
          THINKING
        </div>
        
        <div className="flex items-center gap-3">
          {isStreaming ? (
            <LoadingBars />
          ) : (
            <div className="flex items-end gap-1 h-4 opacity-50 grayscale">
               <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full" />
               <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full" />
               <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full" />
            </div>
          )}
          
          <span className="text-sm font-mono text-zinc-400 group-hover:text-zinc-300 transition-colors">
            {isStreaming ? "Parsing..." : `Processed (${duration}s)`}
          </span>
        </div>
      </div>

      {/* Expandable Content (Reasoning Log) */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-4 pl-3 border-l border-zinc-800">
              <div className="prose prose-sm prose-invert max-w-none text-zinc-500 text-xs font-mono leading-relaxed">
                <MarkdownRenderer>{content}</MarkdownRenderer>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
