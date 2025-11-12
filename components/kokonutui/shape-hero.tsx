'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface ShapeHeroProps {
 children?: React.ReactNode;
 className?: string;
}

interface Shape {
 id: number;
 type: 'circle' | 'square' | 'triangle';
 color: string;
 size: number;
 x: number;
 delay: number;
 duration: number;
}

export default function ShapeHero({ children, className = '' }: ShapeHeroProps) {
 const shapes = useMemo<Shape[]>(() => {
 const colors = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'];
 return Array.from({ length: 20 }, (_, i) => ({
 id: i,
 type: ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)] as Shape['type'],
 color: colors[Math.floor(Math.random() * colors.length)],
 size: Math.random() * 40 + 20,
 x: Math.random() * 100,
 delay: Math.random() * 5,
 duration: Math.random() * 10 + 10,
 }));
 }, []);

 return (
 <div className={`relative overflow-hidden ${className}`}>
 {/* Falling shapes */}
 <div className="absolute inset-0 pointer-events-none">
 {shapes.map((shape) => (
 <motion.div
 key={shape.id}
 className="absolute"
 style={{
 left: `${shape.x}%`,
 width: shape.size,
 height: shape.size,
 }}
 initial={{ y: -100, opacity: 0, rotate: 0 }}
 animate={{
 y: ['0vh', '110vh'],
 opacity: [0, 0.6, 0.6, 0],
 rotate: [0, 360],
 }}
 transition={{
 duration: shape.duration,
 delay: shape.delay,
 repeat: Infinity,
 ease: 'linear',
 }}
 >
 {shape.type === 'circle' && (
 <div
 className="w-full h-full"
 style={{ backgroundColor: shape.color }}
 />
 )}
 {shape.type === 'square' && (
 <div
 className="w-full h-full"
 style={{ backgroundColor: shape.color }}
 />
 )}
 {shape.type === 'triangle' && (
 <div
 className="w-0 h-0"
 style={{
 borderLeft: `${shape.size / 2}px solid transparent`,
 borderRight: `${shape.size / 2}px solid transparent`,
 borderBottom: `${shape.size}px solid ${shape.color}`,
 }}
 />
 )}
 </motion.div>
 ))}
 </div>

 {/* Content */}
 <div className="relative z-10">
 {children}
 </div>
 </div>
 );
}
