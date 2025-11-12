'use client';

import { motion } from 'framer-motion';

interface SwitchButtonProps {
 checked: boolean;
 onChange: (checked: boolean) => void;
 label?: string;
}

export default function SwitchButton({ checked, onChange, label }: SwitchButtonProps) {
 return (
 <button
 onClick={() => onChange(!checked)}
 className="flex items-center gap-3 cursor-pointer group"
 >
 <div
 className={`relative w-14 h-8 transition-colors ${
 checked ? 'bg-blue-600' : 'bg-gray-300'
 }`}
 >
 <motion.div
 className="absolute top-1 left-1 w-6 h-6 bg-white dark:bg-slate-900 shadow-md"
 animate={{
 x: checked ? 24 : 0,
 }}
 transition={{
 type: 'spring',
 stiffness: 500,
 damping: 30,
 }}
 />
 </div>
 {label && (
 <span className="text-sm font-medium text-text-primary dark:text-slate-50 group-hover:text-blue transition-colors">
 {label}
 </span>
 )}
 </button>
 );
}
