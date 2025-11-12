'use client';

import { motion } from 'framer-motion';

interface ActivityRingProps {
 progress: number;
 size?: number;
 strokeWidth?: number;
 color?: string;
 label?: string;
}

export default function ActivityRing({ 
 progress, 
 size = 200, 
 strokeWidth = 12,
 color = '#2563eb',
 label 
}: ActivityRingProps) {
 const radius = (size - strokeWidth) / 2;
 const circumference = 2 * Math.PI * radius;
 const offset = circumference - (progress / 100) * circumference;

 return (
 <div className="relative inline-flex items-center justify-center">
 <svg width={size} height={size} className="transform -rotate-90">
 {/* Background circle */}
 <circle
 cx={size / 2}
 cy={size / 2}
 r={radius}
 stroke="#e5e7eb"
 strokeWidth={strokeWidth}
 fill="none"
 />
 
 {/* Progress circle */}
 <motion.circle
 cx={size / 2}
 cy={size / 2}
 r={radius}
 stroke={color}
 strokeWidth={strokeWidth}
 fill="none"
 strokeLinecap="round"
 strokeDasharray={circumference}
 initial={{ strokeDashoffset: circumference }}
 animate={{ strokeDashoffset: offset }}
 transition={{ duration: 1, ease: 'easeOut' }}
 />
 </svg>
 
 {/* Center content */}
 <div className="absolute inset-0 flex flex-col items-center justify-center">
 <motion.span 
 className="text-3xl font-bold font-mono"
 style={{ color }}
 initial={{ opacity: 0, scale: 0.5 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ delay: 0.5 }}
 >
 {Math.round(progress)}%
 </motion.span>
 {label && (
 <span className="text-xs text-text-secondary dark:text-slate-400 mt-1">{label}</span>
 )}
 </div>
 </div>
 );
}
