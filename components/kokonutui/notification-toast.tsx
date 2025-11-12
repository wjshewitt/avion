'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface NotificationToastProps {
 type: ToastType;
 title: string;
 message: string;
 isVisible: boolean;
 onClose: () => void;
}

const toastConfig = {
 success: { icon: CheckCircle, color: '#10b981', bg: '#f0fdf4' },
 error: { icon: XCircle, color: '#ef4444', bg: '#fef2f2' },
 warning: { icon: AlertTriangle, color: '#f59e0b', bg: '#fffbeb' },
 info: { icon: Info, color: '#3b82f6', bg: '#eff6ff' },
};

export default function NotificationToast({ 
 type, 
 title, 
 message, 
 isVisible, 
 onClose 
}: NotificationToastProps) {
 const config = toastConfig[type];
 const Icon = config.icon;

 return (
 <AnimatePresence>
 {isVisible && (
 <motion.div
 initial={{ x: 400, opacity: 0 }}
 animate={{ x: 0, opacity: 1 }}
 exit={{ x: 400, opacity: 0 }}
 className="fixed top-6 right-6 w-96 bg-white dark:bg-slate-900 shadow-2xl border border-border dark:border-slate-700 overflow-hidden z-50"
 >
 <div className="flex items-start gap-4 p-4">
 <div
 className="w-10 h-10 flex items-center justify-center flex-shrink-0"
 style={{ backgroundColor: config.bg }}
 >
 <Icon size={20} style={{ color: config.color }} />
 </div>
 <div className="flex-1 min-w-0">
 <h4 className="font-semibold text-text-primary dark:text-slate-50 mb-1">{title}</h4>
 <p className="text-sm text-text-secondary dark:text-slate-400">{message}</p>
 </div>
 <button
 onClick={onClose}
 className="text-text-secondary dark:text-slate-400 hover:text-text-primary dark:text-slate-50 transition-colors flex-shrink-0"
 >
 <X size={18} />
 </button>
 </div>
 <motion.div
 initial={{ width: '100%' }}
 animate={{ width: '0%' }}
 transition={{ duration: 5, ease: 'linear' }}
 className="h-1"
 style={{ backgroundColor: config.color }}
 />
 </motion.div>
 )}
 </AnimatePresence>
 );
}
