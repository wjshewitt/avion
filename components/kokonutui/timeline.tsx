'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface TimelineItem {
 id: string;
 time: string;
 title: string;
 description?: string;
 icon: LucideIcon;
 status: 'completed' | 'current' | 'upcoming';
}

interface TimelineProps {
 items: TimelineItem[];
}

export default function Timeline({ items }: TimelineProps) {
 const statusColors = {
 completed: { dot: '#10b981', line: '#10b981', bg: '#f0fdf4' },
 current: { dot: '#3b82f6', line: '#e5e7eb', bg: '#eff6ff' },
 upcoming: { dot: '#e5e7eb', line: '#e5e7eb', bg: '#f9fafb' },
 };

 return (
 <div className="space-y-0">
 {items.map((item, index) => {
 const Icon = item.icon;
 const colors = statusColors[item.status];
 const isLast = index === items.length - 1;

 return (
 <div key={item.id} className="relative flex gap-4">
 {/* Timeline line */}
 {!isLast && (
 <div
 className="absolute left-6 top-12 w-0.5 h-full"
 style={{ backgroundColor: colors.line }}
 />
 )}

 {/* Icon dot */}
 <motion.div
 initial={{ scale: 0 }}
 animate={{ scale: 1 }}
 transition={{ delay: index * 0.1 }}
 className="relative z-10 w-12 h-12 flex items-center justify-center flex-shrink-0"
 style={{ backgroundColor: colors.bg }}
 >
 <Icon size={20} style={{ color: colors.dot }} />
 </motion.div>

 {/* Content */}
 <motion.div
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: index * 0.1 + 0.1 }}
 className="flex-1 pb-8"
 >
 <div className="text-xs text-text-secondary dark:text-slate-400 font-mono mb-1">{item.time}</div>
 <div className="font-semibold text-text-primary dark:text-slate-50 mb-1">{item.title}</div>
 {item.description && (
 <div className="text-sm text-text-secondary dark:text-slate-400">{item.description}</div>
 )}
 </motion.div>
 </div>
 );
 })}
 </div>
 );
}
