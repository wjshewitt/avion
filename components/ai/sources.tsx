'use client';

import * as React from 'react';
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import { ChevronDown, BookOpen, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// Context for sources state
const SourcesContext = React.createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}>({
  isOpen: false,
  setIsOpen: () => {},
});

/**
 * Main Sources wrapper - Perplexity-style collapsible source citations
 */
export function Sources({ 
  children,
  className,
  ...props 
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  const [isOpen, setIsOpen] = React.useState(false);
  
  return (
    <SourcesContext.Provider value={{ isOpen, setIsOpen }}>
      <CollapsiblePrimitive.Root
        open={isOpen}
        onOpenChange={setIsOpen}
        className={cn("mb-2", className)}
        {...props}
      >
        {children}
      </CollapsiblePrimitive.Root>
    </SourcesContext.Provider>
  );
}

/**
 * Trigger button showing source count - Avion style (minimal)
 */
export function SourcesTrigger({
  count,
  children,
  className,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Trigger> & {
  count?: number;
}) {
  const { isOpen } = React.useContext(SourcesContext);
  
  return (
    <CollapsiblePrimitive.Trigger
      className={cn(
        "flex items-center gap-2 px-2 py-1 text-left",
        "hover:bg-muted/30 transition-colors rounded-sm",
        className
      )}
      {...props}
    >
      <BookOpen className="h-2.5 w-2.5 text-muted-foreground" />
      {children || (
        <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
          Sources · {count || 0}
        </span>
      )}
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <ChevronDown className="h-2.5 w-2.5 text-muted-foreground" />
      </motion.div>
    </CollapsiblePrimitive.Trigger>
  );
}

/**
 * Content area for sources - Avion style minimal
 */
export function SourcesContent({
  children,
  className,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Content>) {
  return (
    <CollapsiblePrimitive.Content
      className={cn(
        "overflow-hidden",
        "data-[state=open]:animate-in data-[state=open]:fade-in-0",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
        className
      )}
      {...props}
    >
      <div className="pl-5 pr-2 py-1 space-y-1">
        {children}
      </div>
    </CollapsiblePrimitive.Content>
  );
}

/**
 * Individual source link - Avion style minimal
 */
let sourceCounter = 0;
export function Source({
  href,
  title,
  children,
  className,
  ...props
}: React.ComponentProps<'a'> & {
  title?: string;
}) {
  const [index] = React.useState(() => ++sourceCounter);
  
  // Reset counter when component unmounts (start of new list)
  React.useEffect(() => {
    return () => {
      sourceCounter = 0;
    };
  }, []);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex items-start gap-1.5 px-1 py-0.5 text-xs rounded-sm",
        "hover:bg-muted/30 transition-colors group",
        className
      )}
      {...props}
    >
      {children || (
        <>
          <span className="font-mono text-[9px] text-muted-foreground flex-shrink-0">
            [{index}]
          </span>
          <div className="flex-1 min-w-0 text-[10px] text-muted-foreground line-clamp-1">
            {title || 'Source'}
          </div>
          <ExternalLink className="h-2.5 w-2.5 flex-shrink-0 opacity-0 group-hover:opacity-50 transition-opacity text-muted-foreground" />
        </>
      )}
    </a>
  );
}
