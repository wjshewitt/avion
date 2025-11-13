'use client';

import { usePageContextStore, type PageContext } from '@/lib/context/page-context-store';

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
      return 'None';
  }
}

export default function ContextPanel() {
  const { context, contextEnabled, setContextEnabled } = usePageContextStore();
  const hasContext = context.type !== 'general';
  const contextType = getContextType(context);

  return (
    <div className="space-y-4">
      {/* Toggle */}
      <div className="flex items-center justify-between py-3 border-b border-border">
        <div className="text-xs text-muted-foreground">
          Context Mode
        </div>
        <button
          onClick={() => setContextEnabled(!contextEnabled)}
          className="text-xs font-medium text-foreground hover:text-foreground/70 transition-colors"
        >
          {contextEnabled ? 'Enabled' : 'Disabled'}
        </button>
      </div>

      {/* Current State */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Type</span>
          <span className="font-mono text-foreground">{contextType}</span>
        </div>

        {hasContext && (
          <>
            {(context.type === 'weather' || context.type === 'airport' || context.type === 'briefing') && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">ICAO</span>
                <span className="font-mono text-foreground">{context.icao}</span>
              </div>
            )}
            
            {context.type === 'flight' && context.code && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Code</span>
                <span className="font-mono text-foreground">{context.code}</span>
              </div>
            )}
          </>
        )}

        {!hasContext && (
          <div className="text-xs text-muted-foreground">
            No context detected
          </div>
        )}
      </div>

      {/* Description */}
      <div className="text-[10px] text-muted-foreground leading-relaxed pt-3 border-t border-border">
        {contextEnabled ? (
          hasContext ? (
            'AI understands your current page. Ask questions without specifying codes.'
          ) : (
            'Navigate to a weather, airport, or flight page to enable context.'
          )
        ) : (
          'Context mode is disabled. AI will not use page information.'
        )}
      </div>
    </div>
  );
}
