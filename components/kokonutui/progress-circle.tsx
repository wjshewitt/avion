'use client';

import { motion } from 'framer-motion';

interface ProgressCircleProps {
 progress: number;
 size?: number;
 strokeWidth?: number;
 color?: string;
 showLabel?: boolean;
}

export default function ProgressCircle({
 progress,
 size = 120,
 strokeWidth = 8,
 color = '#2563eb',
 showLabel = true,
}: ProgressCircleProps) {
 const radius = (size - strokeWidth) / 2;
 const circumference = radius * 2 * Math.PI;
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
 initial={{ strokeDashoffset: circumference }}
 animate={{ strokeDashoffset: offset }}
 transition={{ duration: 1, ease: 'easeOut' }}
 style={{
 strokeDasharray: circumference,
 }}
 />
 </svg>
 {showLabel && (
 <motion.div
 initial={{ opacity: 0, scale: 0 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ delay: 0.5 }}
 className="absolute inset-0 flex items-center justify-center"
 >
 <span className="text-2xl font-bold" style={{ color }}>
 {Math.round(progress)}%
 </span>
 </motion.div>
 )}
 </div>
 );
}
