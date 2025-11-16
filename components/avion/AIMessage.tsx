"use client";

import { motion } from 'framer-motion';
import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIMessageProps {
  message: string;
  version: string;
  timestamp: string;
  className?: string;
}

export default function AIMessage({ message, version, timestamp, className }: AIMessageProps) {
  const [isTyping, setIsTyping] = useState(true);

  // Simulate typing completion
  setTimeout(() => setIsTyping(false), 2000);

  return (
    <div className={cn("relative bg-[#1A1A1A] rounded-sm border border-[#333] overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#333] bg-[#222]">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full">
              <motion.div
                className="w-2 h-2 bg-emerald-500 rounded-full absolute"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <span className="text-white font-mono text-sm">Avion AI</span>
          </div>
          <div className="px-2 py-0.5 bg-[#333] rounded-xs">
            <span className="text-[10px] font-mono text-[#A1A1AA] uppercase tracking-wider">
              {version}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider">
            {timestamp}
          </span>
          <CheckCircle className="w-4 h-4 text-emerald-500" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-white text-sm leading-relaxed font-sans">
          {message}
        </p>

        {/* Typing cursor */}
        {isTyping && (
          <motion.div
            className="inline-block w-0.5 h-4 bg-[#F04E30] ml-1"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
          />
        )}
      </div>

      {/* Left accent border */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/20" />

      {/* Verified indicator */}
      <motion.div
        className="absolute top-2 right-2 flex items-center space-x-1"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
        <span className="text-[8px] font-mono text-emerald-500 uppercase tracking-wider">
          Verified
        </span>
      </motion.div>
    </div>
  );
}