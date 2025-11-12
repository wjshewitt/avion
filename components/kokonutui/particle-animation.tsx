'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface ParticleAnimationProps {
 children: React.ReactNode;
 particleCount?: number;
 className?: string;
}

export default function ParticleAnimation({
 children,
 particleCount = 50,
 className = '',
}: ParticleAnimationProps) {
 const particles = useMemo(
 () =>
 Array.from({ length: particleCount }).map((_, i) => ({
 id: i,
 x: Math.random() * 100,
 y: Math.random() * 100,
 size: Math.random() * 4 + 2,
 duration: Math.random() * 20 + 10,
 delay: Math.random() * 5,
 })),
 [particleCount]
 );

 return (
 <div className={`relative overflow-hidden ${className}`}>
 <div className="absolute inset-0 overflow-hidden">
 {particles.map((particle) => (
 <motion.div
 key={particle.id}
 className="absolute bg-blue-500/20"
 style={{
 width: particle.size,
 height: particle.size,
 left: `${particle.x}%`,
 top: `${particle.y}%`,
 }}
 animate={{
 y: [0, -100, 0],
 opacity: [0, 1, 0],
 }}
 transition={{
 duration: particle.duration,
 repeat: Infinity,
 delay: particle.delay,
 ease: 'easeInOut',
 }}
 />
 ))}
 </div>
 <div className="relative z-10">{children}</div>
 </div>
 );
}
