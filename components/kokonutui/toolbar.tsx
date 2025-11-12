'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface ToolbarItem {
 icon: LucideIcon;
 label: string;
 onClick: () => void;
}

interface ToolbarProps {
 items: ToolbarItem[];
 className?: string;
}

export default function Toolbar({ items, className = '' }: ToolbarProps) {
 return (
 <motion.div
 initial={{ y: 20, opacity: 0 }}
 animate={{ y: 0, opacity: 1 }}
 className={`
 inline-flex items-center gap-1 p-2
 bg-white dark:bg-slate-900 border border-border dark:border-slate-700 
 shadow-lg
 ${className}
 `}
 >
 {items.map((item, index) => (
 <div key={index} className="flex items-center">
 <motion.button
 onClick={item.onClick}
 className="
 relative p-2.5 
 hover:bg-surface dark:bg-slate-800 transition-colors duration-200
 group
"
 whileHover={{ scale: 1.05 }}
 whileTap={{ scale: 0.95 }}
 title={item.label}
 >
 <div className="text-text-secondary dark:text-slate-400 group-hover:text-blue transition-colors duration-200">
 <item.icon size={20} />
 </div>
 
 {/* Tooltip */}
 <motion.div
 className="
 absolute -top-10 left-1/2 -translate-x-1/2
 px-2 py-1 
 bg-gray-900 text-white text-xs font-medium
 whitespace-nowrap pointer-events-none
 opacity-0 group-hover:opacity-100
 transition-opacity duration-200
"
 >
 {item.label}
 <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
 </motion.div>
 </motion.button>
 
 {/* Separator */}
 {index < items.length - 1 && (
 <div className="w-px h-6 bg-border" />
 )}
 </div>
 ))}
 </motion.div>
 );
}
