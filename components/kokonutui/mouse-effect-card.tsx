'use client';

import { motion } from 'framer-motion';
import { useState, useRef, MouseEvent } from 'react';

interface MouseEffectCardProps {
 children: React.ReactNode;
 className?: string;
}

export default function MouseEffectCard({ children, className = '' }: MouseEffectCardProps) {
 const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
 const [isHovered, setIsHovered] = useState(false);
 const cardRef = useRef<HTMLDivElement>(null);

 const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
 if (!cardRef.current) return;
 
 const rect = cardRef.current.getBoundingClientRect();
 setMousePosition({
 x: e.clientX - rect.left,
 y: e.clientY - rect.top,
 });
 };

 return (
 <div
 ref={cardRef}
 onMouseMove={handleMouseMove}
 onMouseEnter={() => setIsHovered(true)}
 onMouseLeave={() => setIsHovered(false)}
 className={`relative overflow-hidden bg-white dark:bg-slate-900 border border-border dark:border-slate-700 p-8 ${className}`}
 >
 {/* Dot pattern grid */}
 <div className="absolute inset-0 pointer-events-none">
 <div className="absolute inset-0" style={{
 backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
 backgroundSize: '20px 20px',
 opacity: 0.3,
 }} />
 </div>

 {/* Animated gradient following mouse */}
 {isHovered && (
 <motion.div
 className="absolute pointer-events-none"
 style={{
 left: mousePosition.x,
 top: mousePosition.y,
 width: 300,
 height: 300,
 background: 'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%)',
 transform: 'translate(-50%, -50%)',
 }}
 initial={{ opacity: 0, scale: 0 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: 0.2 }}
 />
 )}

 {/* Content */}
 <div className="relative z-10">
 {children}
 </div>
 </div>
 );
}
