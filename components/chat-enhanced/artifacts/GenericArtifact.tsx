'use client';

import { Copy, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface GenericArtifactProps {
  toolName: string;
  data: any;
}

export function GenericArtifact({ toolName, data }: GenericArtifactProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    toast.success('Copied to clipboard');
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-6 py-6 border-b border-border bg-card/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-sm bg-muted text-muted-foreground">
            <Terminal size={20} />
          </div>
          <div>
            <h1 className="text-lg font-mono font-bold tracking-tight text-foreground uppercase">
              {toolName.replace(/_/g, ' ')}
            </h1>
            <div className="text-xs text-muted-foreground font-mono mt-0.5">
              Raw Output Explorer
            </div>
          </div>
        </div>
        
        <Button variant="outline" size="sm" onClick={handleCopy} className="h-8 text-xs font-mono">
          <Copy size={12} className="mr-2" />
          COPY JSON
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-0 bg-[#0d1117]">
        <pre className="p-6 text-sm font-mono text-blue-100 leading-relaxed whitespace-pre-wrap break-all">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}
