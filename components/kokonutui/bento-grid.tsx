'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface BentoItem {
 id: string;
 title: string;
 description?: string;
 value?: string;
 icon?: LucideIcon;
 color?: string;
 span?: string;
 gradient?: string;
 className?: string;
}

interface BentoGridProps {
 items: BentoItem[];
}

export default function BentoGrid({ items }: BentoGridProps) {
 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
 {items.map((item, index) => (
 <motion.div
 key={index}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: index * 0.1 }}
 className={`
 relative overflow-hidden
 bg-white dark:bg-slate-900 border border-border dark:border-slate-700 p-6
 hover:shadow-lg transition-shadow duration-300
 cursor-pointer group
 ${item.className || ''}
 `}
 >
 {/* Gradient overlay */}
 {item.gradient && (
 <div 
 className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
 style={{ background: item.gradient }}
 />
 )}

 <div className="relative z-10">
 {item.icon && (
 <motion.div
 className="mb-4"
 style={{ color: item.color || '#2563eb' }}
 whileHover={{ scale: 1.1, rotate: 5 }}
 transition={{ type: 'spring', stiffness: 300 }}
 >
 <item.icon size={32} />
 </motion.div>
 )}
 {item.value && (
 <div className="text-3xl font-bold text-text-primary dark:text-slate-50 mb-2">
 {item.value}
 </div>
 )}
 <h3 className="text-md font-semibold text-text-primary dark:text-slate-50 mb-1">
 {item.title}
 </h3>
 {item.description && (
 <p className="text-sm text-text-secondary dark:text-slate-400">
 {item.description}
 </p>
 )}
 </div>

 {/* Corner accent */}
 <div className="absolute top-0 right-0 w-24 h-24 bg-blue opacity-5 -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-500" />
 </motion.div>
 ))}
 </div>
 );
}
