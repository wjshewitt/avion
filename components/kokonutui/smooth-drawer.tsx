'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';

interface SmoothDrawerProps {
 isOpen: boolean;
 onClose: () => void;
 children: React.ReactNode;
 title?: string;
 side?: 'left' | 'right';
}

export default function SmoothDrawer({ 
 isOpen, 
 onClose, 
 children, 
 title,
 side = 'right' 
}: SmoothDrawerProps) {
 useEffect(() => {
 if (isOpen) {
 document.body.style.overflow = 'hidden';
 } else {
 document.body.style.overflow = 'unset';
 }
 return () => {
 document.body.style.overflow = 'unset';
 };
 }, [isOpen]);

 return (
 <AnimatePresence>
 {isOpen && (
 <>
 {/* Backdrop */}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={onClose}
 className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
 />

 {/* Drawer */}
 <motion.div
 initial={{ x: side === 'right' ? '100%' : '-100%' }}
 animate={{ x: 0 }}
 exit={{ x: side === 'right' ? '100%' : '-100%' }}
 transition={{ type: 'spring', damping: 30, stiffness: 300 }}
 className={`
 fixed top-0 ${side === 'right' ? 'right-0' : 'left-0'} 
 h-full w-full md:w-[400px] 
 bg-white dark:bg-slate-900 shadow-2xl z-50
 flex flex-col
 `}
 >
 {/* Header */}
 <div className="flex items-center justify-between p-6 border-b border-border dark:border-slate-700">
 <h2 className="text-lg font-bold text-text-primary dark:text-slate-50">{title}</h2>
 <button
 onClick={onClose}
 className="p-2 hover:bg-surface dark:bg-slate-800 transition-colors"
 >
 <X size={20} className="text-text-secondary dark:text-slate-400" />
 </button>
 </div>

 {/* Content */}
 <div className="flex-1 overflow-y-auto p-6">
 {children}
 </div>
 </motion.div>
 </>
 )}
 </AnimatePresence>
 );
}
