'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
 text: string;
 size?: 'sm' | 'md';
}

export default function CopyButton({ text, size = 'md' }: CopyButtonProps) {
 const [copied, setCopied] = useState(false);

 const handleCopy = async () => {
 await navigator.clipboard.writeText(text);
 setCopied(true);
 setTimeout(() => setCopied(false), 2000);
 };

 const sizeClasses = {
 sm: 'p-1.5',
 md: 'p-2',
 };

 const iconSize = size === 'sm' ? 14 : 16;

 return (
 <motion.button
 onClick={handleCopy}
 className={`
 relative border border-border
 bg-white dark:bg-slate-900 hover:bg-surface
 transition-colors duration-200
 ${sizeClasses[size]}
 `}
 whileHover={{ scale: 1.05 }}
 whileTap={{ scale: 0.95 }}
 >
 <motion.div
 initial={false}
 animate={{
 scale: copied ? 0 : 1,
 opacity: copied ? 0 : 1,
 }}
 transition={{ duration: 0.2 }}
 >
 <Copy size={iconSize} className="text-text-secondary dark:text-slate-400" />
 </motion.div>
 
 <motion.div
 className="absolute inset-0 flex items-center justify-center"
 initial={false}
 animate={{
 scale: copied ? 1 : 0,
 opacity: copied ? 1 : 0,
 }}
 transition={{ duration: 0.2 }}
 >
 <Check size={iconSize} className="text-green" />
 </motion.div>
 </motion.button>
 );
}
