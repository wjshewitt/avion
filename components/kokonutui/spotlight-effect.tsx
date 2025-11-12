'use client';

import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface SpotlightEffectProps {
 children: React.ReactNode;
 className?: string;
 color?: string;
}

export default function SpotlightEffect({
 children,
 className = '',
 color = 'rgba(37, 99, 235, 0.15)',
}: SpotlightEffectProps) {
 const ref = useRef<HTMLDivElement>(null);
 const mouseX = useMotionValue(0);
 const mouseY = useMotionValue(0);

 const springConfig = { damping: 25, stiffness: 300 };
 const x = useSpring(mouseX, springConfig);
 const y = useSpring(mouseY, springConfig);

 useEffect(() => {
 const handleMouseMove = (e: MouseEvent) => {
 if (!ref.current) return;
 const rect = ref.current.getBoundingClientRect();
 mouseX.set(e.clientX - rect.left);
 mouseY.set(e.clientY - rect.top);
 };

 const element = ref.current;
 if (element) {
 element.addEventListener('mousemove', handleMouseMove);
 return () => element.removeEventListener('mousemove', handleMouseMove);
 }
 }, []);

 return (
 <div ref={ref} className={`relative overflow-hidden ${className}`}>
 <motion.div
 className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
 style={{
 background: `radial-gradient(600px circle at ${x}px ${y}px, ${color}, transparent 40%)`,
 }}
 />
 <div className="relative z-10">{children}</div>
 </div>
 );
}
