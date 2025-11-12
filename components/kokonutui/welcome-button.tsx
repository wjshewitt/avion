'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { X } from 'lucide-react';

interface WelcomeButtonProps {
 children: React.ReactNode;
 onClose?: () => void;
}

export default function WelcomeButton({ children, onClose }: WelcomeButtonProps) {
 const [isVisible, setIsVisible] = useState(true);

 const handleClose = () => {
 setIsVisible(false);
 onClose?.();
 };

 if (!isVisible) return null;

 return (
 <motion.div
 initial={{ scale: 0, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 exit={{ scale: 0, opacity: 0 }}
 className="fixed bottom-8 right-8 z-50"
 >
 <motion.div
 animate={{
 boxShadow: [
 '0 0 0 0 rgba(37, 99, 235, 0.4)',
 '0 0 0 20px rgba(37, 99, 235, 0)',
 ],
 }}
 transition={{
 duration: 2,
 repeat: Infinity,
 ease: 'easeInOut',
 }}
 className="relative"
 >
 <button
 className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2 font-semibold"
 style={{
 background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
 }}
 >
 {children}
 </button>
 <button
 onClick={handleClose}
 className="absolute -top-2 -right-2 w-6 h-6 bg-white dark:bg-slate-900 shadow-md flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
 >
 <X size={14} />
 </button>
 </motion.div>
 </motion.div>
 );
}
