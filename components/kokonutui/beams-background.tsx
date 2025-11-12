'use client';

import { motion } from 'framer-motion';

interface BeamsBackgroundProps {
 children?: React.ReactNode;
 className?: string;
}

export default function BeamsBackground({ children, className = '' }: BeamsBackgroundProps) {
 return (
 <div className={`relative overflow-hidden ${className}`}>
 {/* Animated beams */}
 <div className="absolute inset-0 pointer-events-none">
 <motion.div
 className="absolute w-full h-full"
 style={{
 background: 'linear-gradient(135deg, transparent 20%, rgba(37, 99, 235, 0.03) 40%, transparent 60%)',
 }}
 animate={{
 x: ['-100%', '100%'],
 }}
 transition={{
 duration: 20,
 repeat: Infinity,
 ease: 'linear',
 }}
 />
 <motion.div
 className="absolute w-full h-full"
 style={{
 background: 'linear-gradient(225deg, transparent 20%, rgba(59, 130, 246, 0.03) 40%, transparent 60%)',
 }}
 animate={{
 x: ['100%', '-100%'],
 }}
 transition={{
 duration: 25,
 repeat: Infinity,
 ease: 'linear',
 }}
 />
 <motion.div
 className="absolute w-full h-full"
 style={{
 background: 'linear-gradient(45deg, transparent 30%, rgba(37, 99, 235, 0.02) 50%, transparent 70%)',
 }}
 animate={{
 y: ['-100%', '100%'],
 }}
 transition={{
 duration: 30,
 repeat: Infinity,
 ease: 'linear',
 }}
 />
 </div>

 {/* Content */}
 <div className="relative z-10">
 {children}
 </div>
 </div>
 );
}
