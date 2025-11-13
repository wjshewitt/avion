'use client';

import { usePageContextStore, type PageContext } from '@/lib/context/page-context-store';

function getContextLabel(context: PageContext): string {
  switch (context.type) {
    case 'weather':
      return `${context.icao}`;
    case 'airport':
      return `${context.icao}`;
    case 'flight':
      return context.code || 'Flight';
    case 'briefing':
      return `${context.icao}`;
    default:
      return '';
  }
}

function getContextType(context: PageContext): string {
  switch (context.type) {
    case 'weather':
      return 'Weather';
    case 'airport':
      return 'Airport';
    case 'flight':
      return 'Flight';
    case 'briefing':
      return 'Briefing';
    default:
      return '';
  }
}

export default function ContextBadge() {
  const { context, contextEnabled } = usePageContextStore();

  const hasContext = context.type !== 'general';
  const shouldShow = hasContext && contextEnabled;

  if (!shouldShow) return null;

  const label = getContextLabel(context);
  const type = getContextType(context);

  return (
    <div className="border-b border-border/40">
      <div className="px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-foreground/40" />
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            Context
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground">
            {type}
          </span>
          <span className="text-xs font-mono text-foreground">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}
