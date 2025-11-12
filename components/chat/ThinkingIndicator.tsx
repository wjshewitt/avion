"use client";

import { Brain } from "lucide-react";
import { motion } from "framer-motion";

export function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-2 px-3 py-2 border border-border bg-muted/30 max-w-fit">
      <Brain className="h-4 w-4 text-primary animate-pulse" />
      <span className="text-sm text-muted-foreground">Thinking</span>
      
      {/* Animated dots - square, not rounded */}
      <div className="flex gap-1">
        {[0, 0.15, 0.3].map((delay, i) => (
          <motion.div
            key={i}
            animate={{
              opacity: [0.2, 1, 0.2],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay,
              ease: "easeInOut"
            }}
            className="w-1 h-1 bg-primary"
          />
        ))}
      </div>
    </div>
  );
}
