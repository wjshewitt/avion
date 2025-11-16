'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cog, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ThinkingModalProps {
  /** Whether the AI is currently thinking */
  isThinking: boolean;
  /** Array of thought strings to display */
  thoughts: string[];
  /** Controlled open state (unused but kept for compatibility) */
  open?: boolean;
  /** Callback when open state changes (unused but kept for compatibility) */
  onOpenChange?: (open: boolean) => void;
  /** Material style (ceramic or tungsten) */
  material?: 'ceramic' | 'tungsten';
}

export function ThinkingModal({
  isThinking,
  thoughts,
  material = 'tungsten',
}: ThinkingModalProps) {
  const [isExpanded, setIsExpanded] = useState(true); // Start expanded
  const [isComplete, setIsComplete] = useState(false);

  // When thinking finishes, auto-collapse after delay
  useEffect(() => {
    if (!isThinking && thoughts.length > 0 && !isComplete) {
      setIsComplete(true);
      // Auto-collapse after 2 seconds
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isThinking, thoughts.length, isComplete]);

  // Don't render if no thoughts
  if (thoughts.length === 0) return null;

  return (
    <div
      className="border border-border rounded-sm overflow-hidden"
      style={{
        backgroundColor: 'var(--card)',
        boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 bg-muted/30 flex items-center justify-between hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          <motion.div
            animate={isThinking ? { rotate: 360 } : {}}
            transition={
              isThinking
                ? { duration: 2, repeat: Infinity, ease: 'linear' }
                : { duration: 0 }
            }
          >
            <Cog 
              size={12} 
              strokeWidth={1.5} 
              className={cn(
                isThinking ? 'text-[#F04E30]' : 'text-muted-foreground'
              )} 
            />
          </motion.div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Thinking
          </span>
          {isComplete && !isExpanded && (
            <span className="text-[9px] text-muted-foreground">
              ({thoughts.length} {thoughts.length === 1 ? 'step' : 'steps'})
            </span>
          )}
        </div>
        <ChevronDown 
          size={12} 
          className={cn(
            "text-muted-foreground transition-transform",
            isExpanded && "rotate-180"
          )} 
        />
      </button>

      {/* Collapsible Thoughts */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-3 py-2 space-y-1 border-t border-border">
              {thoughts.map((thought, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-foreground">
                  <span className="text-muted-foreground">•</span>
                  <span>{thought}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
