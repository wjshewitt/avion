'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AttractButtonProps {
 children: ReactNode;
 onClick?: () => void;
}

export default function AttractButton({ children, onClick }: AttractButtonProps) {
 return (
 <div className="relative inline-block">
 {/* Pulsing rings */}
 <motion.div
 className="absolute inset-0"
 style={{
 border: '2px solid #2563eb',
 }}
 animate={{
 scale: [1, 1.1, 1],
 opacity: [0.5, 0, 0.5],
 }}
 transition={{
 duration: 2,
 repeat: Infinity,
 ease: 'easeInOut',
 }}
 />
 <motion.div
 className="absolute inset-0"
 style={{
 border: '2px solid #2563eb',
 }}
 animate={{
 scale: [1, 1.2, 1],
 opacity: [0.3, 0, 0.3],
 }}
 transition={{
 duration: 2,
 repeat: Infinity,
 ease: 'easeInOut',
 delay: 0.3,
 }}
 />
 
 {/* Button */}
 <motion.button
 onClick={onClick}
 className="relative px-8 py-3 bg-blue text-white font-semibold text-sm shadow-lg"
 whileHover={{ scale: 1.05 }}
 whileTap={{ scale: 0.95 }}
 animate={{
 y: [0, -5, 0],
 }}
 transition={{
 duration: 2,
 repeat: Infinity,
 ease: 'easeInOut',
 }}
 >
 {children}
 </motion.button>
 </div>
 );
}
