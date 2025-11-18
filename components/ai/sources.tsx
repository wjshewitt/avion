'use client';

import * as React from 'react';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

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
 * Verified Sources Grid - Avion Flight Deck Style
 * Displays sources as technical data tiles in a grid
 */
export function VerifiedSources({ sources, className }: VerifiedSourcesProps) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className={cn("border-t border-white/10 bg-black/20 p-4 relative z-10", className)}>
      <div className="flex items-center gap-2 mb-3">
         <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">
           VERIFIED DATA SOURCES
         </span>
         <div className="h-px flex-1 bg-white/10" />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {sources.map((source, i) => (
          <a 
            key={i}
            href={source.url || "#"} 
            className="group/source flex items-start gap-3 p-3 rounded-sm border border-white/5 bg-white/5 hover:bg-white/10 hover:border-primary/50 transition-all"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="mt-0.5 text-primary opacity-70 group-hover/source:opacity-100">
              <ExternalLink size={12} strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-medium text-zinc-300 truncate group-hover/source:text-white">
                {source.title || source.description}
              </div>
              <div className="text-[9px] font-mono text-zinc-500 uppercase mt-0.5 line-clamp-1">
                {source.category ? `[${source.category}]` : ''} {source.description}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

// Deprecated components kept for compatibility during refactor if needed,
// but should be phased out.
export const Sources = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const SourcesTrigger = () => null;
export const SourcesContent = () => null;
export const Source = () => null;
