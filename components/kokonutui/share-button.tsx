'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Share2, Mail, Copy, MessageSquare } from 'lucide-react';

interface ShareButtonProps {
 url?: string;
 title?: string;
}

export default function ShareButton({ url = window.location.href, title = 'Share' }: ShareButtonProps) {
 const [isOpen, setIsOpen] = useState(false);

  const shareOptions = [
    { icon: Mail, label: 'Email', color: '#ea4335' },
    { icon: Copy, label: 'Copy', color: '#10b981' },
    { icon: MessageSquare, label: 'Message', color: '#3b82f6' },
  ] as const;

 return (
 <div className="relative">
 <motion.button
 onClick={() => setIsOpen(!isOpen)}
 className="px-4 py-2 bg-blue-600 text-white flex items-center gap-2 font-semibold hover:bg-blue-700 transition-colors"
 whileHover={{ scale: 1.05 }}
 whileTap={{ scale: 0.95 }}
 >
 <Share2 size={18} />
 <span>{title}</span>
 </motion.button>

 <AnimatePresence>
 {isOpen && (
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: 10 }}
 className="absolute top-full mt-2 left-0 bg-white dark:bg-slate-900 shadow-xl border border-border dark:border-slate-700 p-2 flex gap-2"
 >
 {shareOptions.map((option, index) => {
 const Icon = option.icon;
 return (
              <motion.button
                key={option.label}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 hover:bg-surface dark:bg-slate-800 transition-colors group"
                style={{ color: option.color }}
                title={option.label}
                onClick={() => {
                  if (option.label === 'Copy') {
                    void navigator.clipboard?.writeText(url);
                  } else if (option.label === 'Email') {
                    window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`);
                  } else if (option.label === 'Message' && navigator.share) {
                    void navigator.share({ title, url }).catch(() => undefined);
                  }
                  setIsOpen(false);
                }}
              >
 <Icon size={20} />
 </motion.button>
 );
 })}
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
}
