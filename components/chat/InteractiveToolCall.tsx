'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Check, Download, Wrench, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ToolUIPart } from 'ai';
import { WeatherToolUI, FlightSelectorToolUI, AirportInfoToolUI } from '@/components/chat/tool-ui';

interface InteractiveToolCallProps {
  part: ToolUIPart;
  onCopy?: (data: any) => void;
  onExport?: (data: any) => void;
  selectable?: boolean;
}

export function InteractiveToolCall({ 
  part, 
  onCopy, 
  onExport,
  selectable = true 
}: InteractiveToolCallProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selected, setSelected] = useState(false);

  const toolName = part.type.replace('tool-', '');
  const isLoading = part.state === 'input-streaming' || part.state === 'input-available';
  const hasError = part.state === 'output-error';
  const hasOutput = part.state === 'output-available';

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const data = hasOutput ? part.output : part.input;
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    onCopy?.(data);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = (e: React.MouseEvent) => {
    e.stopPropagation();
    const data = hasOutput ? part.output : part.input;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${toolName}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onExport?.(data);
  };

  const handleSelect = (e: React.MouseEvent) => {
    if (!selectable) return;
    e.stopPropagation();
    setSelected(!selected);
  };

  return (
    <div
      className={cn(
        'border overflow-hidden transition-all',
        selected && selectable ? 'ring-2 ring-primary border-primary' : 'border-border',
        hasError && 'border-destructive bg-destructive/5',
        isLoading && 'border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/20'
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-between p-3 cursor-pointer transition-colors',
          'hover:bg-muted/50',
          selected && 'bg-primary/5'
        )}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 flex-1">
          {/* Selection checkbox */}
          {selectable && (
            <div
              onClick={handleSelect}
              className={cn(
                'w-4 h-4 border-2 rounded-sm flex items-center justify-center transition-colors',
                selected ? 'bg-primary border-primary' : 'border-muted-foreground'
              )}
            >
              {selected && <Check className="h-3 w-3 text-primary-foreground" />}
            </div>
          )}

          {/* Tool icon and name */}
          <div className="flex items-center gap-2">
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : hasError ? (
              <AlertCircle className="h-4 w-4 text-destructive" />
            ) : (
              <Wrench className="h-4 w-4 text-muted-foreground" />
            )}
            <div>
              <div className="text-sm font-medium text-foreground">
                {toolName.replace(/_/g, ' ')}
              </div>
              <div className="text-xs text-muted-foreground">
                {isLoading && 'Executing...'}
                {hasError && 'Execution failed'}
                {hasOutput && 'Completed'}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {!isLoading && (
            <>
              <button
                onClick={handleCopy}
                className="p-1.5 hover:bg-muted rounded transition-colors"
                title="Copy data"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-green-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </button>
              <button
                onClick={handleExport}
                className="p-1.5 hover:bg-muted rounded transition-colors"
                title="Export JSON"
              >
                <Download className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </>
          )}
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Tool Output Content */}
      {hasOutput && (
        <div className="border-t border-border bg-muted/30 p-3">
          {renderToolOutput(toolName, part.output)}
        </div>
      )}

      {/* Expanded content (raw JSON) */}
      {expanded && (
        <div className="border-t border-border bg-muted/30 p-3 space-y-3">
          {/* Input */}
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
              Input (Raw)
            </div>
            <div className="bg-card border border-border p-2 rounded-sm">
              <pre className="text-xs font-mono overflow-x-auto">
                {JSON.stringify(part.input, null, 2)}
              </pre>
            </div>
          </div>

          {/* Output */}
          {hasOutput && (
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                Output (Raw)
              </div>
              <div className="bg-card border border-border p-2 rounded-sm max-h-64 overflow-auto">
                <pre className="text-xs font-mono">
                  {JSON.stringify(part.output, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Error details */}
          {hasError && 'error' in part && (
            <div>
              <div className="text-xs font-medium text-destructive mb-1 uppercase tracking-wider">
                Error
              </div>
              <div className="bg-destructive/10 border border-destructive p-2 rounded-sm">
                <pre className="text-xs font-mono text-destructive">
                  {String(part.error)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Renders the appropriate custom UI component based on tool name
 */
function renderToolOutput(toolName: string, output: any) {
  // Weather tools
  if (toolName === 'get_airport_weather' || toolName === 'get_weather') {
    return <WeatherToolUI result={{ data: output }} />;
  }

  // Flight tools
  if (toolName === 'get_user_flights') {
    return <FlightSelectorToolUI result={{ data: output }} />;
  }

  // Airport info tools
  if (toolName === 'get_airport_capabilities' || toolName === 'get_airport_details' || toolName === 'search_airports') {
    return <AirportInfoToolUI result={{ data: output }} />;
  }

  // Generic fallback - show formatted JSON
  return (
    <div className="bg-card border border-border p-3 rounded-sm">
      <div className="text-xs font-medium text-muted-foreground mb-2">Result</div>
      <pre className="text-xs font-mono overflow-x-auto">
        {JSON.stringify(output, null, 2)}
      </pre>
    </div>
  );
}
