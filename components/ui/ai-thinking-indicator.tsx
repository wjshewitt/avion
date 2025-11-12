'use client';

import { motion } from 'framer-motion';

interface AiThinkingIndicatorProps {
  text?: string;
  variant?: 'dots' | 'pulse' | 'spinner';
  size?: 'sm' | 'md' | 'lg';
}

export function AiThinkingIndicator({ 
  text = 'AI is thinking', 
  variant = 'dots',
  size = 'md' 
}: AiThinkingIndicatorProps) {
  
  if (variant === 'dots') {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-muted/30 rounded-lg border border-border/50 max-w-fit">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-blue rounded-full"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        <span className="text-sm text-muted-foreground font-medium">{text}</span>
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-muted/30 rounded-lg border border-border/50 max-w-fit">
        <motion.div
          className="w-3 h-3 bg-blue rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [1, 0.3, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <span className="text-sm text-muted-foreground font-medium">{text}</span>
      </div>
    );
  }

  // spinner variant
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-5 h-5 border-2',
    lg: 'w-6 h-6 border-[3px]',
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-muted/30 rounded-lg border border-border/50 max-w-fit">
      <motion.div
        className={`${sizeClasses[size]} border-blue border-t-transparent rounded-full`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      <span className="text-sm text-muted-foreground font-medium">{text}</span>
    </div>
  );
}
