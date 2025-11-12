'use client';

import { motion } from 'framer-motion';

interface BackgroundPathsProps {
 children?: React.ReactNode;
 className?: string;
}

export default function BackgroundPaths({ children, className = '' }: BackgroundPathsProps) {
 const pathVariants = {
 hidden: { pathLength: 0, opacity: 0 },
 visible: {
 pathLength: 1,
 opacity: 0.2,
 transition: {
 pathLength: { duration: 2, ease: 'easeInOut' },
 opacity: { duration: 0.5 },
 },
 },
 };

 return (
 <div className={`relative overflow-hidden ${className}`}>
 {/* SVG Paths Background */}
 <svg
 className="absolute inset-0 w-full h-full pointer-events-none"
 xmlns="http://www.w3.org/2000/svg"
 >
 <motion.path
 d="M 0,200 Q 250,100 500,200 T 1000,200"
 stroke="#2563eb"
 strokeWidth="2"
 fill="none"
 variants={pathVariants}
 initial="hidden"
 animate="visible"
 />
 <motion.path
 d="M 0,300 Q 300,200 600,300 T 1200,300"
 stroke="#3b82f6"
 strokeWidth="2"
 fill="none"
 variants={pathVariants}
 initial="hidden"
 animate="visible"
 transition={{ delay: 0.3 }}
 />
 <motion.path
 d="M 0,400 Q 200,300 400,400 T 800,400"
 stroke="#60a5fa"
 strokeWidth="2"
 fill="none"
 variants={pathVariants}
 initial="hidden"
 animate="visible"
 transition={{ delay: 0.6 }}
 />
 
 {/* Animated circles along paths */}
 <motion.circle
 r="4"
 fill="#2563eb"
 animate={{
 offsetDistance: ['0%', '100%'],
 }}
 transition={{
 duration: 3,
 repeat: Infinity,
 ease: 'linear',
 }}
 >
 <animateMotion dur="3s" repeatCount="indefinite">
 <mpath href="#path1" />
 </animateMotion>
 </motion.circle>
 </svg>

 {/* Content */}
 <div className="relative z-10">
 {children}
 </div>
 </div>
 );
}
