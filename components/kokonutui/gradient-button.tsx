'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GradientButtonProps {
 children: ReactNode;
 onClick?: () => void;
 size?: 'sm' | 'md' | 'lg';
 disabled?: boolean;
}

export default function GradientButton({ 
 children, 
 onClick, 
 size = 'md',
 disabled = false 
}: GradientButtonProps) {
 const sizeClasses = {
 sm: 'px-4 py-2 text-sm h-8',
 md: 'px-6 py-2.5 text-sm h-10',
 lg: 'px-8 py-3 text-base h-12',
 };

 return (
 <motion.button
 onClick={onClick}
 disabled={disabled}
 className={`
 relative overflow-hidden
 text-white font-semibold 
 transition-all duration-300
 disabled:opacity-50 disabled:cursor-not-allowed
 shadow-md hover:shadow-lg
 ${sizeClasses[size]}
 `}
 style={{
 background: disabled 
 ? '#94a3b8' 
 : 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
 }}
 whileHover={{ 
 scale: disabled ? 1 : 1.02,
 boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.5)',
 }}
 whileTap={{ scale: disabled ? 1 : 0.98 }}
 >
 <span className="relative z-10 flex items-center justify-center gap-2">
 {children}
 </span>
 
 {/* Shine effect */}
 <motion.div
 className="absolute inset-0 pointer-events-none"
 initial={{ x: '-100%', opacity: 0 }}
 whileHover={{ 
 x: '100%',
 opacity: [0, 0.5, 0],
 transition: { duration: 0.6 }
 }}
 style={{
 background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
 }}
 />
 </motion.button>
 );
}
