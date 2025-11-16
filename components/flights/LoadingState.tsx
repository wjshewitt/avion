'use client';

import { motion } from 'framer-motion';

export function LoadingState() {
  return (
    <div className="bg-white dark:bg-[#2A2A2A] border border-zinc-200 dark:border-[#333] rounded-sm p-12">
      <div className="flex flex-col items-center justify-center">
        <div className="flex gap-2 mb-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-8 bg-zinc-300 dark:bg-zinc-600 rounded-sm"
              animate={{
                height: ['32px', '48px', '32px'],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          LOADING FLIGHTS...
        </div>
      </div>
    </div>
  );
}
