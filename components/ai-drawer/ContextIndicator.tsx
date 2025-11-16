
'use client';

import { X, FileText, Paperclip } from 'lucide-react';
import { usePageContextStore, PageRouteContext } from '@/lib/context/page-context-store';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ContextIndicatorProps {
  material?: 'ceramic' | 'tungsten';
}

export function ContextIndicator({ material = 'tungsten' }: ContextIndicatorProps) {
  const { context, contextEnabled, clearContext } = usePageContextStore();

  if (!contextEnabled || context.type === 'general') {
    return null;
  }

  const getContextInfo = () => {
    switch (context.type) {
      case 'page':
        return {
          label: context.label,
          icon: <FileText size={12} className="text-blue-400" />,
          color: 'rgba(59, 130, 246, 0.1)',
          borderColor: 'rgba(59, 130, 246, 0.3)',
          ledColor: '#3B82F6',
          content: (context as PageRouteContext).content,
        };
      // Other cases remain the same
      default:
        return {
          label: 'Unknown Context',
          icon: null,
          color: 'rgba(107, 114, 128, 0.1)',
          borderColor: 'rgba(107, 114, 128, 0.3)',
          ledColor: '#6B7280',
          content: undefined,
        };
    }
  };

  const { label, icon, color, borderColor, ledColor, content } = getContextInfo();

  return (
    <motion.div
      key="context-indicator"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="border-b px-3 py-2 flex items-center justify-between overflow-hidden"
      style={{
        backgroundColor: color,
        borderColor: borderColor,
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.08)',
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{
            backgroundColor: ledColor,
            boxShadow: `0 0 4px ${ledColor}80`,
          }}
        />
        
        <div className="flex items-center gap-1.5">
          {icon}
          <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: ledColor }}>
            {context.type === 'page' ? 'PAGE CONTEXT' : 'CONTEXT'}:
          </span>
          <span className="text-[11px] font-mono text-foreground font-semibold">
            {label}
          </span>
          {content && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Paperclip size={12} className="text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-xs">AI has context from this page.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      <button
        onClick={clearContext}
        className="flex items-center gap-1 px-2 py-1 rounded-sm transition-colors hover:bg-black/10"
        aria-label="Remove context"
      >
        <X size={12} strokeWidth={2} className="text-muted-foreground" />
      </button>
    </motion.div>
  );
}

