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
 * Trigger button showing source count
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
        "inline-flex items-center gap-1.5 px-2 py-1 text-xs",
        "text-muted-foreground hover:text-foreground",
        "transition-colors rounded-sm hover:bg-muted/50",
        "border border-transparent hover:border-border",
        className
      )}
      {...props}
    >
      <BookOpen className="h-3 w-3" />
      {children || (
        <>
          <span>Used {count || 0} {count === 1 ? 'source' : 'sources'}</span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-3 w-3" />
          </motion.div>
        </>
      )}
    </CollapsiblePrimitive.Trigger>
  );
}

/**
 * Content area for sources
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
        "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-1",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-1",
        className
      )}
      {...props}
    >
      <div className="pt-2 space-y-1">
        {children}
      </div>
    </CollapsiblePrimitive.Content>
  );
}

/**
 * Individual source link
 */
export function Source({
  href,
  title,
  children,
  className,
  ...props
}: React.ComponentProps<'a'> & {
  title?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex items-start gap-2 px-2 py-1.5 text-xs rounded-sm",
        "text-muted-foreground hover:text-foreground hover:bg-muted/50",
        "transition-colors group",
        className
      )}
      {...props}
    >
      {children || (
        <>
          <BookOpen className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <span className="flex-1 line-clamp-2">{title || href}</span>
          <ExternalLink className="h-3 w-3 mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </>
      )}
    </a>
  );
}
