'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface LiquidGlassCardProps {
 children: ReactNode;
 className?: string;
}

export default function LiquidGlassCard({ children, className = '' }: LiquidGlassCardProps) {
 return (
 <motion.div
 className={`
 relative
 bg-white/70 backdrop-blur-xl backdrop-saturate-150
 border border-white/30
 p-6
 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]
 ${className}
 `}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5 }}
 >
 {children}
 </motion.div>
 );
}
