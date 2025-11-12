'use client';

import { motion } from 'framer-motion';

interface InfiniteMarqueeProps {
 items: React.ReactNode[];
 speed?: number;
 direction?: 'left' | 'right';
}

export default function InfiniteMarquee({ 
 items, 
 speed = 50,
 direction = 'left' 
}: InfiniteMarqueeProps) {
 const duplicatedItems = [...items, ...items];

 return (
 <div className="overflow-hidden whitespace-nowrap">
 <motion.div
 className="inline-flex gap-8"
 animate={{
 x: direction === 'left' ? [0, -50 + '%'] : [-50 + '%', 0],
 }}
 transition={{
 x: {
 repeat: Infinity,
 repeatType: 'loop',
 duration: speed,
 ease: 'linear',
 },
 }}
 >
 {duplicatedItems.map((item, index) => (
 <div key={index} className="inline-flex">
 {item}
 </div>
 ))}
 </motion.div>
 </div>
 );
}
