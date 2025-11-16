'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const steps = ['Parsing...', 'Querying...', 'Synthesizing...'];

export function TypingIndicator() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % steps.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      {/* Three bars */}
      <div className="flex items-end gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1 bg-muted-foreground"
            animate={{
              height: ['8px', '24px', '8px'],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Status text */}
      <motion.p
        key={step}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="text-xs font-mono tracking-wider text-muted-foreground"
      >
        {steps[step]}
      </motion.p>
    </div>
  );
}
