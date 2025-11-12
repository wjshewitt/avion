'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { useState } from 'react';

interface DockItem {
 icon: LucideIcon;
 label: string;
 onClick?: () => void;
}

interface FloatingDockProps {
 items: DockItem[];
}

export default function FloatingDock({ items }: FloatingDockProps) {
 const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

 return (
 <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
 <motion.div
 initial={{ y: 100, opacity: 0 }}
 animate={{ y: 0, opacity: 1 }}
 className="bg-white/80 backdrop-blur-lg border border-border dark:border-slate-700 shadow-2xl p-3 flex items-end gap-2"
 >
 {items.map((item, index) => {
 const Icon = item.icon;
 const isHovered = hoveredIndex === index;
 const distance = hoveredIndex !== null ? Math.abs(hoveredIndex - index) : 0;
 const scale = isHovered ? 1.5 : distance === 1 ? 1.2 : 1;

 return (
 <motion.button
 key={index}
 onMouseEnter={() => setHoveredIndex(index)}
 onMouseLeave={() => setHoveredIndex(null)}
 onClick={item.onClick}
 className="relative w-12 h-12 flex items-center justify-center text-text-secondary dark:text-slate-400 hover:text-blue transition-colors"
 animate={{ scale, y: isHovered ? -8 : 0 }}
 transition={{ type: 'spring', stiffness: 400, damping: 25 }}
 whileTap={{ scale: 0.9 }}
 title={item.label}
 >
 <Icon size={24} />
 {isHovered && (
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 whitespace-nowrap"
 >
 {item.label}
 </motion.div>
 )}
 </motion.button>
 );
 })}
 </motion.div>
 </div>
 );
}
