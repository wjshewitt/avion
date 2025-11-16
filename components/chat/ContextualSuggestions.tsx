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
      <div className="flex flex-col items-center gap-6 py-8 px-6">
        {/* Icon tile */}
        <div className="w-16 h-16 rounded-xl border flex items-center justify-center mb-1" style={{ borderColor: 'var(--accent-info)' }}>
          <Sparkles size={28} strokeWidth={1.5} className="text-[color:var(--accent-info)]" />
        </div>

        {/* Heading */}
        <p className="text-[15px] text-center" style={{ color: 'var(--zinc-600)' }}>
          Ask about operations, weather, or flights
        </p>

        {/* Chips */}
        <div className="flex flex-col w-full gap-2 max-w-xs">
          {suggestions.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.payload ?? s.label)}
              className="w-full rounded-full border px-4 py-2.5 text-[14px] text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-[color:var(--zinc-100)] transition-colors"
              style={{
                backgroundColor: 'rgba(244,244,244,0.6)',
                borderColor: 'var(--zinc-200)',
                color: 'var(--zinc-700)',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
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
