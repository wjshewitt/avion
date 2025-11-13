'use client';

import { useState } from 'react';
import { FileText, ExternalLink, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Citation {
  id: string;
  title: string;
  source: string;
  url?: string;
  excerpt?: string;
  relevance?: number;
}

interface InlineCitationProps {
  citation: Citation;
  index: number;
  compact?: boolean;
}

export function InlineCitation({ citation, index, compact = false }: InlineCitationProps) {
  const [showPreview, setShowPreview] = useState(false);

  if (compact) {
    return (
      <button
        onClick={() => setShowPreview(!showPreview)}
        className={cn(
          'inline-flex items-center align-baseline',
          'text-xs font-medium px-1 py-0.5',
          'text-primary hover:bg-primary/10',
          'border-b border-primary/30 hover:border-primary',
          'transition-colors cursor-pointer'
        )}
        title={citation.title}
      >
        [{index + 1}]
      </button>
    );
  }

  return (
    <span className="relative inline-block">
      <button
        onMouseEnter={() => setShowPreview(true)}
        onMouseLeave={() => setShowPreview(false)}
        onClick={() => citation.url && window.open(citation.url, '_blank')}
        className={cn(
          'inline-flex items-center gap-1 align-baseline',
          'text-xs font-medium px-1.5 py-0.5 rounded',
          'bg-primary/10 text-primary hover:bg-primary/20',
          'border border-primary/20 hover:border-primary/40',
          'transition-all cursor-pointer'
        )}
      >
        <FileText className="h-3 w-3" />
        <span>{index + 1}</span>
        {citation.url && <ExternalLink className="h-2.5 w-2.5" />}
      </button>

      {/* Preview tooltip */}
      {showPreview && (
        <div className="absolute bottom-full left-0 mb-2 z-50 w-72">
          <div className="bg-popover border border-border rounded-lg shadow-lg p-3 space-y-2">
            {/* Title */}
            <div className="font-medium text-sm text-foreground">
              {citation.title}
            </div>

            {/* Source */}
            <div className="text-xs text-muted-foreground">
              Source: {citation.source}
            </div>

            {/* Excerpt */}
            {citation.excerpt && (
              <div className="text-xs text-muted-foreground leading-relaxed border-l-2 border-primary pl-2">
                "{citation.excerpt}"
              </div>
            )}

            {/* Relevance */}
            {citation.relevance && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Relevance:</span>
                <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{ width: `${citation.relevance * 100}%` }}
                  />
                </div>
                <span className="text-muted-foreground">
                  {Math.round(citation.relevance * 100)}%
                </span>
              </div>
            )}

            {/* URL */}
            {citation.url && (
              <a
                href={citation.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                View source <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      )}
    </span>
  );
}

// Citations list at the end of message
interface CitationsListProps {
  citations: Citation[];
}

export function CitationsList({ citations }: CitationsListProps) {
  const [expanded, setExpanded] = useState(false);

  if (citations.length === 0) return null;

  return (
    <div className="mt-4 border-t border-border pt-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <FileText className="h-3.5 w-3.5" />
        <span>Sources ({citations.length})</span>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 transition-transform',
            expanded && 'rotate-180'
          )}
        />
      </button>

      {expanded && (
        <div className="mt-2 space-y-2">
          {citations.map((citation, index) => (
            <div
              key={citation.id}
              className="flex gap-2 p-2 bg-muted/30 rounded border border-border"
            >
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">
                  {citation.title}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {citation.source}
                </div>
                {citation.url && (
                  <a
                    href={citation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline mt-1 inline-flex items-center gap-1"
                  >
                    View source <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
