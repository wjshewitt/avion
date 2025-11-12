'use client';

import { motion } from 'framer-motion';

interface SquareLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export default function SquareLoader({ size = 'md', color = 'text-blue' }: SquareLoaderProps) {
  const sizeMap = {
    sm: 16,
    md: 24,
    lg: 32,
  };
  
  const borderWidth = {
    sm: 2,
    md: 2,
    lg: 3,
  };

  const colorMap: Record<string, string> = {
    'text-blue': '#2563eb',
    'text-green': '#10b981',
    'text-red': '#ef4444',
    'text-purple-500': '#a855f7',
  };

  const actualColor = colorMap[color || 'text-blue'] || '#2563eb';
  const sizeValue = sizeMap[size];
  const borderValue = borderWidth[size];

  return (
    <div 
      className="relative" 
      style={{ width: sizeValue, height: sizeValue }}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          border: `${borderValue}px solid transparent`,
          borderTopColor: actualColor,
          borderRightColor: actualColor,
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}
