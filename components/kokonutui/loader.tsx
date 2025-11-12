'use client';

import { motion } from 'framer-motion';

interface LoaderProps {
 size?: 'sm' | 'md' | 'lg';
 color?: string;
}

export default function Loader({ size = 'md', color = 'text-blue' }: LoaderProps) {
 const sizeClasses = {
 sm: 'w-4 h-4 border-2',
 md: 'w-6 h-6 border-2',
 lg: 'w-8 h-8 border-3',
 };

 return (
 <motion.div
 className={`
 ${sizeClasses[size]}
 border-current ${color}
 border-t-transparent
 
 `}
 animate={{ rotate: 360 }}
 transition={{
 duration: 1,
 repeat: Infinity,
 ease: 'linear',
 }}
 />
 );
}
