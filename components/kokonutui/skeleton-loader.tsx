'use client';

import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
 variant?: 'text' | 'card' | 'table' | 'avatar';
 count?: number;
}

export default function SkeletonLoader({ variant = 'card', count = 1 }: SkeletonLoaderProps) {
 const shimmer = {
 hidden: { x: '-100%' },
 visible: { x: '100%' },
 };

 const Shimmer = () => (
 <motion.div
 variants={shimmer}
 initial="hidden"
 animate="visible"
 transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
 className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
 />
 );

 if (variant === 'text') {
 return (
 <div className="space-y-2">
 {Array.from({ length: count }).map((_, i) => (
 <div key={i} className="relative h-4 bg-gray-200 overflow-hidden">
 <Shimmer />
 </div>
 ))}
 </div>
 );
 }

 if (variant === 'avatar') {
 return (
 <div className="relative w-12 h-12 bg-gray-200 overflow-hidden">
 <Shimmer />
 </div>
 );
 }

 if (variant === 'table') {
 return (
 <div className="space-y-3">
 {Array.from({ length: count }).map((_, i) => (
 <div key={i} className="flex gap-4">
 <div className="relative flex-1 h-12 bg-gray-200 overflow-hidden">
 <Shimmer />
 </div>
 </div>
 ))}
 </div>
 );
 }

 return (
 <div className="space-y-4">
 {Array.from({ length: count }).map((_, i) => (
 <div key={i} className="bg-white dark:bg-slate-900 border border-border dark:border-slate-700 p-6">
 <div className="flex items-start gap-4">
 <div className="relative w-12 h-12 bg-gray-200 overflow-hidden">
 <Shimmer />
 </div>
 <div className="flex-1 space-y-3">
 <div className="relative h-4 bg-gray-200 overflow-hidden w-3/4">
 <Shimmer />
 </div>
 <div className="relative h-4 bg-gray-200 overflow-hidden w-1/2">
 <Shimmer />
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>
 );
}
