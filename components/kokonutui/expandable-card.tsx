'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface ExpandableCardProps {
 title: string;
 badge?: React.ReactNode;
 children: React.ReactNode;
 defaultExpanded?: boolean;
}

export default function ExpandableCard({ 
 title, 
 badge,
 children,
 defaultExpanded = false 
}: ExpandableCardProps) {
 const [isExpanded, setIsExpanded] = useState(defaultExpanded);

 return (
 <div className="bg-white dark:bg-slate-900 border border-border dark:border-slate-700 overflow-hidden shadow-sm">
 {/* Header */}
 <button
 onClick={() => setIsExpanded(!isExpanded)}
 className="w-full px-6 py-4 flex items-center justify-between hover:bg-surface dark:bg-slate-800 transition-colors"
 >
 <div className="flex items-center gap-3">
 <h3 className="text-sm font-semibold text-text-primary dark:text-slate-50">{title}</h3>
 {badge}
 </div>
 <motion.div
 animate={{ rotate: isExpanded ? 180 : 0 }}
 transition={{ duration: 0.3 }}
 className="text-text-secondary dark:text-slate-400"
 >
 <ChevronDown size={20} />
 </motion.div>
 </button>

 {/* Content */}
 <AnimatePresence initial={false}>
 {isExpanded && (
 <motion.div
 initial={{ height: 0, opacity: 0 }}
 animate={{ 
 height: 'auto',
 opacity: 1,
 transition: {
 height: { duration: 0.3 },
 opacity: { duration: 0.25, delay: 0.05 }
 }
 }}
 exit={{ 
 height: 0,
 opacity: 0,
 transition: {
 height: { duration: 0.3 },
 opacity: { duration: 0.2 }
 }
 }}
 className="overflow-hidden"
 >
 <div className="px-6 pb-4 pt-2 border-t border-border dark:border-slate-700">
 {children}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
}
