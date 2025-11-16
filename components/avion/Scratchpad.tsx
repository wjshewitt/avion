"use client";

import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Eraser } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Scratchpad() {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('avion-scratchpad');
    if (saved) {
      setContent(saved);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('avion-scratchpad', content);
    }, 500);
    return () => clearTimeout(timer);
  }, [content]);

  const handleClear = () => {
    if (content && window.confirm('Clear scratchpad?')) {
      setContent('');
      textareaRef.current?.focus();
    }
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA]">
          SCRATCHPAD
        </h4>
        <motion.button
          onClick={handleClear}
          className="p-1 text-[#71717A] hover:text-[#F04E30] transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Eraser className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Textarea with lined background */}
      <div className="relative bg-[#F4F4F4] rounded-sm border border-[#333] overflow-hidden">
        {/* Lined paper effect */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="w-full border-t border-[#000000]/5"
              style={{ top: `${i * 20 + 20}px` }}
            />
          ))}
        </div>

        {/* Text input */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="relative w-full h-48 p-3 bg-transparent font-mono text-sm leading-5 text-black resize-none focus:outline-none focus:ring-2 focus:ring-[#F04E30] focus:ring-inset tabular-nums placeholder-[#71717A]/50"
          placeholder="Enter notes..."
          style={{
            lineHeight: '20px',
            fontFamily: '"JetBrains Mono", "SF Mono", Monaco, Consolas, monospace'
          }}
          spellCheck={false}
        />
      </div>

      {/* Line count indicator */}
      <div className="absolute bottom-2 right-2 text-[8px] font-mono text-[#71717A] pointer-events-none">
        {content.split('\n').length}/20
      </div>
    </div>
  );
}