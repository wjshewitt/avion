"use client";

import { Sparkles } from 'lucide-react';
import { getSuggestedQuestions } from '@/lib/ai/getSuggestedQuestions';
import { usePageContextStore } from '@/lib/context/page-context-store';
import { useChatStore } from '@/lib/chat-store';

interface ContextualSuggestionsProps {
  hasMessages: boolean;
  onSelect: (text: string) => void;
  disabled?: boolean;
  variant?: 'drawer-empty-hero' | 'inline-pills';
}

export function ContextualSuggestions({
  hasMessages,
  onSelect,
  disabled,
  variant = 'inline-pills',
}: ContextualSuggestionsProps) {
  const { context } = usePageContextStore();
  const { selectedContext } = useChatStore();

  if (disabled) return null;

  const suggestions = getSuggestedQuestions({
    pageContext: context,
    chatContext: selectedContext,
    hasMessages,
  });

  if (!suggestions.length) return null;

  if (variant === 'drawer-empty-hero') {
    return (
      <div className="flex flex-col items-center py-8 px-6 max-w-[360px] mx-auto">
        {/* Icon tile - Instrument precision */}
        <div 
          className="w-16 h-16 rounded-lg border-[1.5px] flex items-center justify-center mb-6 relative"
          style={{ 
            borderColor: 'var(--accent-info)',
            backgroundColor: 'var(--color-surface)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
            animation: 'float 3s ease-in-out infinite',
          }}
        >
          <Sparkles size={28} strokeWidth={1.5} style={{ color: 'var(--accent-info)' }} />
        </div>

        {/* Label - Avion micro-label system */}
        <div 
          className="text-[11px] font-mono uppercase tracking-widest text-center mb-6"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Ask about operations, weather, or flights
        </div>

        {/* Suggestion chips - Instrument buttons with stagger animation */}
        <div className="flex flex-col w-full gap-3">
          {suggestions.map((s, index) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.payload ?? s.label)}
              className="group w-full rounded-sm border h-[40px] px-4 text-[13px] font-mono text-left transition-all duration-150 ease-out hover:scale-[1.01] active:scale-[0.99]"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
                boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.12), inset -1px -1px 4px rgba(255,255,255,0.04)',
                animation: `slideIn 0.3s ease-out ${index * 50}ms backwards`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-safety)';
                e.currentTarget.style.color = 'var(--accent-safety)';
                e.currentTarget.style.boxShadow = 'inset 1px 1px 3px rgba(0,0,0,0.12), inset -1px -1px 4px rgba(255,255,255,0.04), 0 1px 3px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.color = 'var(--color-text-primary)';
                e.currentTarget.style.boxShadow = 'inset 1px 1px 3px rgba(0,0,0,0.12), inset -1px -1px 4px rgba(255,255,255,0.04)';
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Inject keyframe animations */}
        <style jsx>{`
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-2px);
            }
          }
          
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    );
  }

  // Inline tungsten-friendly pills (for potential future inline usage)
  return (
    <div className="flex flex-wrap gap-1.5">
      {suggestions.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onSelect(s.payload ?? s.label)}
          className="px-3 py-1.5 rounded-full border text-[11px] font-medium transition-colors bg-muted/70 hover:bg-muted text-text-secondary hover:text-text-primary border-border/70"
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
