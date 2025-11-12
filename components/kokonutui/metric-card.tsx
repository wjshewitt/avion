'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
 label: string;
 value: string | number;
 unit?: string;
 trend?: number;
 icon?: ReactNode;
}

export default function MetricCard({ label, value, unit, trend, icon }: MetricCardProps) {
 return (
 <motion.div
 className="bg-white dark:bg-slate-900 border border-border dark:border-slate-700 p-6 shadow-sm"
 whileHover={{ y: -2, shadow: '0 4px 12px rgba(0,0,0,0.1)' }}
 transition={{ duration: 0.2 }}
 >
 <div className="flex items-start justify-between mb-3">
 <p className="text-xs text-text-secondary dark:text-slate-400 uppercase tracking-wide">{label}</p>
 {icon && <div className="text-blue">{icon}</div>}
 </div>
 
 <div className="flex items-baseline gap-1 mb-2">
 <span className="text-3xl font-bold font-mono text-text-primary dark:text-slate-50">{value}</span>
 {unit && <span className="text-lg text-text-secondary dark:text-slate-400 font-mono">{unit}</span>}
 </div>

 {trend !== undefined && (
 <div className={`flex items-center gap-1 text-xs font-semibold ${trend >= 0 ? 'text-green' : 'text-red'}`}>
 {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
 <span>{Math.abs(trend)}%</span>
 </div>
 )}
 </motion.div>
 );
}
