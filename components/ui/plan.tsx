'use client';

import * as React from 'react';
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import { ChevronDown, Download, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// Context for streaming state
const PlanContext = React.createContext<{
  isStreaming: boolean;
}>({ isStreaming: false });

// Main Plan wrapper
export function Plan({ 
  isStreaming = false, 
  defaultOpen = false,
  children,
  ...props 
}: React.ComponentProps<typeof CollapsiblePrimitive.Root> & {
  isStreaming?: boolean;
}) {
  return (
    <PlanContext.Provider value={{ isStreaming }}>
      <CollapsiblePrimitive.Root 
        defaultOpen={defaultOpen}
        className="border border-border bg-card rounded-sm shadow-sm overflow-hidden"
        {...props}
      >
        {children}
      </CollapsiblePrimitive.Root>
    </PlanContext.Provider>
  );
}

// Header section
export function PlanHeader({ 
  children,
  className,
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn("px-6 py-4 border-b border-border bg-muted/30", className)}
      {...props}
    >
      {children}
    </div>
  );
}

// Title with streaming shimmer
export function PlanTitle({ 
  children,
  className,
  ...props 
}: React.HTMLAttributes<HTMLHeadingElement>) {
  const { isStreaming } = React.useContext(PlanContext);
  
  return (
    <h3 
      className={cn(
        "text-base font-semibold text-foreground",
        isStreaming && "animate-pulse",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

// Description with streaming shimmer  
export function PlanDescription({ 
  children,
  className,
  ...props 
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const { isStreaming } = React.useContext(PlanContext);
  
  return (
    <p 
      className={cn(
        "text-sm text-muted-foreground mt-1",
        isStreaming && "animate-pulse",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

// Collapsible trigger button
export function PlanTrigger({ 
  className,
  children,
  ...props 
}: React.ComponentProps<typeof CollapsiblePrimitive.Trigger>) {
  const [open, setOpen] = React.useState(false);
  
  return (
    <CollapsiblePrimitive.Trigger
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground",
        "hover:text-foreground transition-colors mt-2",
        className
      )}
      onClick={() => setOpen(!open)}
      {...props}
    >
      <motion.div
        animate={{ rotate: open ? 180 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <ChevronDown className="h-4 w-4" />
      </motion.div>
      {children || (open ? 'Hide Full Briefing' : 'Show Full Briefing')}
    </CollapsiblePrimitive.Trigger>
  );
}

// Content area
export function PlanContent({ 
  children,
  className,
  ...props 
}: React.ComponentProps<typeof CollapsiblePrimitive.Content>) {
  return (
    <CollapsiblePrimitive.Content
      className={cn("overflow-hidden", className)}
      {...props}
    >
      <div className="px-6 py-4">
        {children}
      </div>
    </CollapsiblePrimitive.Content>
  );
}

// Footer with actions
export function PlanFooter({ 
  children,
  className,
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn(
        "px-6 py-3 border-t border-border bg-muted/20 flex items-center justify-between",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Action buttons
export function PlanAction({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 text-sm",
        "text-muted-foreground hover:text-foreground",
        "transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// Export commonly used icons for convenience
export { Download, Copy, Check };
