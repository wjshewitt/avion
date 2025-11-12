'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface SlideTextButtonProps {
 children: ReactNode;
 onClick?: () => void;
}

export default function SlideTextButton({ children, onClick }: SlideTextButtonProps) {
 return (
 <motion.button
 onClick={onClick}
 className="
 relative overflow-hidden
 px-6 py-2.5 
 bg-white dark:bg-slate-900 border border-border dark:border-slate-700 
 text-sm font-semibold text-text-primary
 transition-all duration-300
 hover:border-blue hover:text-blue
 shadow-sm hover:shadow-md
 group
"
 whileHover={{ y: -1 }}
 whileTap={{ scale: 0.98 }}
 >
 <span className="relative block overflow-hidden h-5">
 <motion.span
 className="block"
 initial={{ y: 0 }}
 whileHover={{ y: -20 }}
 transition={{ duration: 0.3, ease: 'easeInOut' }}
 >
 {children}
 </motion.span>
 <motion.span
 className="absolute top-0 left-0 right-0 text-blue"
 initial={{ y: 20 }}
 whileHover={{ y: 0 }}
 transition={{ duration: 0.3, ease: 'easeInOut' }}
 >
 {children}
 </motion.span>
 </span>
 </motion.button>
 );
}
