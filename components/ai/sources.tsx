'use client';

import * as React from 'react';
import { ExternalLink, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import { motion, AnimatePresence } from 'framer-motion';

export interface SourceItem {
  category?: string;
  description: string;
  title?: string;
  url?: string;
}

interface VerifiedSourcesProps {
  sources: SourceItem[];
  className?: string;
}

/**
 * Verified Sources - Compact Data Strip (Avion Style)
 * Displays sources as a minimal, collapsible strip
 */
export function VerifiedSources({ sources, className }: VerifiedSourcesProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <CollapsiblePrimitive.Root
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn("border-t border-white/5 bg-black/10", className)}
    >
      {/* Header / Toggle */}
      <CollapsiblePrimitive.Trigger className="w-full flex items-center justify-between px-4 py-2 hover:bg-white/5 transition-colors group">
        <div className="flex items-center gap-3">
           <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 group-hover:text-zinc-400 transition-colors">
             VERIFIED SOURCES
           </span>
           <span className="px-1.5 py-0.5 bg-white/10 rounded text-[9px] font-mono text-zinc-400">
             {sources.length}
           </span>
        </div>
        
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={12} className="text-zinc-600 group-hover:text-zinc-400" />
        </motion.div>
      </CollapsiblePrimitive.Trigger>

      {/* Content */}
      <CollapsiblePrimitive.Content className="overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
        <div className="px-4 pb-3 pt-1 grid grid-cols-1 gap-1">
          {sources.map((source, i) => (
            <a 
              key={i}
              href={source.url || "#"} 
              className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-white/5 transition-colors group/item"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="text-[9px] font-mono text-zinc-600 min-w-[16px]">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <span className="text-[11px] text-zinc-400 truncate group-hover/item:text-zinc-200 transition-colors">
                  {source.title || source.description}
                </span>
                {source.category && (
                  <span className="text-[9px] font-mono text-zinc-600 uppercase hidden sm:inline-block">
                    {source.category}
                  </span>
                )}
              </div>
              <ExternalLink size={10} className="text-zinc-700 group-hover/item:text-zinc-500" />
            </a>
          ))}
        </div>
      </CollapsiblePrimitive.Content>
    </CollapsiblePrimitive.Root>
  );
}

// Deprecated components kept for compatibility during refactor if needed,
// but should be phased out.
export const Sources = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const SourcesTrigger = () => null;
export const SourcesContent = () => null;
export const Source = () => null;
