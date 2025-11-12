'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { RotateCw } from 'lucide-react';

interface CardFlipProps {
 front: React.ReactNode;
 back: React.ReactNode;
 className?: string;
}

export default function CardFlip({ front, back, className = '' }: CardFlipProps) {
 const [isFlipped, setIsFlipped] = useState(false);

 return (
 <div className={`relative ${className}`} style={{ perspective: '1000px' }}>
 <motion.div
 className="relative w-full h-full cursor-pointer"
 onClick={() => setIsFlipped(!isFlipped)}
 animate={{ rotateY: isFlipped ? 180 : 0 }}
 transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
 style={{ transformStyle: 'preserve-3d' }}
 >
 {/* Front */}
 <div
 className="absolute inset-0 w-full h-full"
 style={{ 
 backfaceVisibility: 'hidden',
 WebkitBackfaceVisibility: 'hidden',
 }}
 >
 <div className="bg-white dark:bg-slate-900 border border-border dark:border-slate-700 p-6 h-full shadow-sm relative">
 {front}
 <div className="absolute top-4 right-4 text-text-secondary dark:text-slate-400">
 <RotateCw size={16} className="transition-transform hover:rotate-180 duration-300" />
 </div>
 </div>
 </div>

 {/* Back */}
 <div
 className="absolute inset-0 w-full h-full"
 style={{ 
 backfaceVisibility: 'hidden',
 WebkitBackfaceVisibility: 'hidden',
 transform: 'rotateY(180deg)',
 }}
 >
 <div className="bg-blue-50 border border-blue-200 p-6 h-full shadow-sm relative">
 {back}
 <div className="absolute top-4 right-4 text-blue">
 <RotateCw size={16} className="transition-transform hover:rotate-180 duration-300" />
 </div>
 </div>
 </div>
 </motion.div>
 </div>
 );
}
