'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GenericToolUIProps {
  toolName: string;
  data: any;
}

/**
 * Generic fallback UI for tool invocations - Avion v1.5 precision instrument style
 * Displays tool name and collapsible JSON data with tungsten groove aesthetic
 */
export function GenericToolUI({ toolName, data }: GenericToolUIProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Format tool name for display (uppercase with spaces)
  const formattedName = toolName.replace(/_/g, ' ').toUpperCase();

  return (
    <div className="border border-border rounded-sm overflow-hidden bg-card">
      {/* Groove header - precision instrument style */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 bg-muted/30 flex items-center justify-between text-left hover:bg-muted/40 transition-colors"
        style={{
          boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.1), inset -1px -1px 3px rgba(255,255,255,0.2)'
        }}
      >
        {/* Mono uppercase label - no icon (unnecessary decoration) */}
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          TOOL · {formattedName}
        </span>
        
        <ChevronDown 
          size={12}
          strokeWidth={1.5}
          className={cn(
            "text-muted-foreground transition-transform",
            isExpanded && "rotate-180"
          )} 
        />
      </button>

      {/* Collapsible data - tabular monospace */}
      {isExpanded && (
        <div className="px-3 py-2 bg-card/50 border-t border-border">
          <pre className="text-[11px] font-mono overflow-auto text-foreground whitespace-pre-wrap" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
