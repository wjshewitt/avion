'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ColorfulButtonProps {
 children: ReactNode;
 onClick?: () => void;
}

export default function ColorfulButton({ children, onClick }: ColorfulButtonProps) {
 return (
 <motion.button
 onClick={onClick}
 className="relative px-8 py-3 font-semibold text-sm overflow-hidden group"
 style={{
 background: 'linear-gradient(45deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
 backgroundSize: '300% 100%',
 }}
 animate={{
 backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
 }}
 transition={{
 duration: 5,
 repeat: Infinity,
 ease: 'linear',
 }}
 whileHover={{ scale: 1.05 }}
 whileTap={{ scale: 0.95 }}
 >
 <span className="relative z-10 text-white flex items-center justify-center gap-2">
 {children}
 </span>
 
 {/* Shimmer effect */}
 <motion.div
 className="absolute inset-0 pointer-events-none"
 initial={{ x: '-100%' }}
 animate={{ x: '100%' }}
 transition={{
 duration: 1.5,
 repeat: Infinity,
 repeatDelay: 2,
 ease: 'easeInOut',
 }}
 style={{
 background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
 }}
 />
 </motion.button>
 );
}
