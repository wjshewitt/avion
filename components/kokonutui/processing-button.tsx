'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';

interface ProcessingButtonProps {
 children: React.ReactNode;
 onProcess: () => Promise<void>;
 processingText?: string;
 successText?: string;
 size?: 'sm' | 'md' | 'lg';
}

export default function ProcessingButton({ 
 children, 
 onProcess,
 processingText = 'Processing...',
 successText = 'Complete',
 size = 'md' 
}: ProcessingButtonProps) {
 const [state, setState] = useState<'idle' | 'processing' | 'success'>('idle');

 const sizeClasses = {
 sm: 'px-4 py-2 text-sm h-8',
 md: 'px-6 py-2.5 text-sm h-10',
 lg: 'px-8 py-3 text-base h-12',
 };

 const handleClick = async () => {
 if (state !== 'idle') return;
 
 setState('processing');
 try {
 await onProcess();
 setState('success');
 setTimeout(() => setState('idle'), 2000);
 } catch (error) {
 setState('idle');
 }
 };

 return (
 <motion.button
 onClick={handleClick}
 disabled={state === 'processing'}
 className={`
 relative overflow-hidden
 font-semibold 
 transition-all duration-300
 shadow-md
 ${sizeClasses[size]}
 ${state === 'idle' ? 'bg-blue text-white hover:bg-blue-600' : ''}
 ${state === 'processing' ? 'bg-blue-400 text-white cursor-wait' : ''}
 ${state === 'success' ? 'bg-green text-white' : ''}
 `}
 whileHover={state === 'idle' ? { scale: 1.02 } : {}}
 whileTap={state === 'idle' ? { scale: 0.98 } : {}}
 >
 <span className="flex items-center justify-center gap-2">
 {state === 'processing' && (
 <motion.div
 animate={{ rotate: 360 }}
 transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
 >
 <Loader2 size={16} />
 </motion.div>
 )}
 {state === 'success' && <Check size={16} />}
 <span>
 {state === 'idle' && children}
 {state === 'processing' && processingText}
 {state === 'success' && successText}
 </span>
 </span>
 </motion.button>
 );
}
