'use client';

import { useMemo } from 'react';
import { ArrowRight, Plus, Minus, Equal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DiffChange {
  type: 'add' | 'remove' | 'equal';
  value: string;
}

interface MessageDiffViewerProps {
  original: string;
  modified: string;
  mode?: 'inline' | 'split';
}

export function MessageDiffViewer({
  original,
  modified,
  mode = 'inline',
}: MessageDiffViewerProps) {
  const diff = useMemo(() => {
    return computeDiff(original, modified);
  }, [original, modified]);

  const stats = useMemo(() => {
    const additions = diff.filter(d => d.type === 'add').length;
    const deletions = diff.filter(d => d.type === 'remove').length;
    const unchanged = diff.filter(d => d.type === 'equal').length;
    return { additions, deletions, unchanged };
  }, [diff]);

  if (mode === 'split') {
    return (
      <div className="border border-border rounded-lg bg-card overflow-hidden">
        {/* Header */}
        <div className="bg-muted px-3 py-2 border-b border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Message Comparison</span>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <Plus className="h-3 w-3 text-green-600" />
                <span className="text-muted-foreground">{stats.additions} added</span>
              </div>
              <div className="flex items-center gap-1">
                <Minus className="h-3 w-3 text-red-600" />
                <span className="text-muted-foreground">{stats.deletions} removed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Split View */}
        <div className="grid grid-cols-2 divide-x divide-border">
          {/* Original */}
          <div className="p-3 bg-red-50/50 dark:bg-red-950/10">
            <div className="text-xs font-medium text-muted-foreground mb-2">Original</div>
            <div className="text-sm text-foreground leading-relaxed">
              {diff.filter(d => d.type !== 'add').map((change, index) => (
                <span
                  key={index}
                  className={cn(
                    change.type === 'remove' && 'bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-300 line-through'
                  )}
                >
                  {change.value}
                </span>
              ))}
            </div>
          </div>

          {/* Modified */}
          <div className="p-3 bg-green-50/50 dark:bg-green-950/10">
            <div className="text-xs font-medium text-muted-foreground mb-2">Modified</div>
            <div className="text-sm text-foreground leading-relaxed">
              {diff.filter(d => d.type !== 'remove').map((change, index) => (
                <span
                  key={index}
                  className={cn(
                    change.type === 'add' && 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-300'
                  )}
                >
                  {change.value}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Inline mode
  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      {/* Header */}
      <div className="bg-muted px-3 py-2 border-b border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Changes</span>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <Plus className="h-3 w-3 text-green-600" />
              <span className="text-green-600 dark:text-green-400 font-medium">{stats.additions}</span>
            </div>
            <div className="flex items-center gap-1">
              <Minus className="h-3 w-3 text-red-600" />
              <span className="text-red-600 dark:text-red-400 font-medium">{stats.deletions}</span>
            </div>
            <div className="flex items-center gap-1">
              <Equal className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">{stats.unchanged}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Inline Diff */}
      <div className="p-3">
        <div className="text-sm text-foreground leading-relaxed">
          {diff.map((change, index) => {
            if (change.type === 'equal') {
              return <span key={index}>{change.value}</span>;
            }
            if (change.type === 'add') {
              return (
                <span
                  key={index}
                  className="bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-300 px-0.5 rounded"
                >
                  {change.value}
                </span>
              );
            }
            if (change.type === 'remove') {
              return (
                <span
                  key={index}
                  className="bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-300 line-through px-0.5 rounded"
                >
                  {change.value}
                </span>
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
}

// Simple diff algorithm (word-based)
function computeDiff(original: string, modified: string): DiffChange[] {
  const originalWords = original.split(/(\s+)/);
  const modifiedWords = modified.split(/(\s+)/);
  
  const changes: DiffChange[] = [];
  let i = 0;
  let j = 0;

  while (i < originalWords.length || j < modifiedWords.length) {
    if (i >= originalWords.length) {
      // Remaining words are additions
      changes.push({ type: 'add', value: modifiedWords[j] });
      j++;
    } else if (j >= modifiedWords.length) {
      // Remaining words are deletions
      changes.push({ type: 'remove', value: originalWords[i] });
      i++;
    } else if (originalWords[i] === modifiedWords[j]) {
      // Words match
      changes.push({ type: 'equal', value: originalWords[i] });
      i++;
      j++;
    } else {
      // Words differ - check if next words match
      if (originalWords[i + 1] === modifiedWords[j]) {
        // Deletion
        changes.push({ type: 'remove', value: originalWords[i] });
        i++;
      } else if (originalWords[i] === modifiedWords[j + 1]) {
        // Addition
        changes.push({ type: 'add', value: modifiedWords[j] });
        j++;
      } else {
        // Both changed
        changes.push({ type: 'remove', value: originalWords[i] });
        changes.push({ type: 'add', value: modifiedWords[j] });
        i++;
        j++;
      }
    }
  }

  return changes;
}

// Compact diff indicator
export function DiffIndicator({
  original,
  modified,
}: {
  original: string;
  modified: string;
}) {
  const diff = useMemo(() => computeDiff(original, modified), [original, modified]);
  const additions = diff.filter(d => d.type === 'add').length;
  const deletions = diff.filter(d => d.type === 'remove').length;

  return (
    <div className="flex items-center gap-2 text-xs">
      <ArrowRight className="h-3 w-3 text-muted-foreground" />
      {additions > 0 && (
        <span className="text-green-600 dark:text-green-400">+{additions}</span>
      )}
      {deletions > 0 && (
        <span className="text-red-600 dark:text-red-400">-{deletions}</span>
      )}
      {additions === 0 && deletions === 0 && (
        <span className="text-muted-foreground">No changes</span>
      )}
    </div>
  );
}
