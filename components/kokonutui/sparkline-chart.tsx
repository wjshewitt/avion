'use client';

import { motion } from 'framer-motion';

interface SparklineChartProps {
 data: number[];
 width?: number;
 height?: number;
 color?: string;
 showFill?: boolean;
}

export default function SparklineChart({
 data,
 width = 100,
 height = 30,
 color = '#2563eb',
 showFill = true,
}: SparklineChartProps) {
 if (data.length === 0) return null;

 const max = Math.max(...data);
 const min = Math.min(...data);
 const range = max - min || 1;

 const points = data.map((value, index) => {
 const x = (index / (data.length - 1)) * width;
 const y = height - ((value - min) / range) * height;
 return `${x},${y}`;
 });

 const pathData = `M ${points.join(' L ')}`;
 const fillPathData = `${pathData} L ${width},${height} L 0,${height} Z`;

 return (
 <svg width={width} height={height} className="overflow-visible">
 {showFill && (
 <motion.path
 d={fillPathData}
 fill={color}
 fillOpacity={0.2}
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ duration: 0.5 }}
 />
 )}
 <motion.path
 d={pathData}
 fill="none"
 stroke={color}
 strokeWidth={2}
 strokeLinecap="round"
 strokeLinejoin="round"
 initial={{ pathLength: 0 }}
 animate={{ pathLength: 1 }}
 transition={{ duration: 1, ease: 'easeInOut' }}
 />
 </svg>
 );
}
