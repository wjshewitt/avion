'use client';

import { motion, useSpring, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
 value: number;
 label: string;
 icon: LucideIcon;
 color?: string;
 suffix?: string;
 prefix?: string;
}

export default function StatsCard({ 
 value, 
 label, 
 icon: Icon, 
 color = '#2563eb',
 suffix = '',
 prefix = ''
}: StatsCardProps) {
 const count = useSpring(0, { duration: 2000 });
 const displayValue = useTransform(count, (latest) => Math.round(latest));

 useEffect(() => {
 animate(count, value, { duration: 2 });
 }, [value]);

 return (
 <div className="bg-white dark:bg-slate-900 border border-border dark:border-slate-700 p-6 hover:shadow-lg transition-shadow">
 <div className="flex items-start justify-between mb-4">
 <div 
 className="w-12 h-12 flex items-center justify-center"
 style={{ backgroundColor: `${color}15` }}
 >
 <Icon size={24} style={{ color }} />
 </div>
 </div>
 <motion.div className="text-3xl font-bold text-text-primary dark:text-slate-50 mb-1">
 {prefix}
 <motion.span>{displayValue}</motion.span>
 {suffix}
 </motion.div>
 <div className="text-sm text-text-secondary dark:text-slate-400">{label}</div>
 </div>
 );
}
