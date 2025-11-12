'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface RippleEffectProps {
 children: React.ReactNode;
 color?: string;
}

interface Ripple {
 id: number;
 x: number;
 y: number;
}

export default function RippleEffect({ children, color = 'rgba(37, 99, 235, 0.3)' }: RippleEffectProps) {
 const [ripples, setRipples] = useState<Ripple[]>([]);

 const addRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
 const button = e.currentTarget;
 const rect = button.getBoundingClientRect();
 const x = e.clientX - rect.left;
 const y = e.clientY - rect.top;

 const newRipple = {
 id: Date.now(),
 x,
 y,
 };

 setRipples((prev) => [...prev, newRipple]);

 setTimeout(() => {
 setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
 }, 600);
 };

 return (
 <button
 onClick={addRipple}
 className="relative overflow-hidden px-6 py-3 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
 >
 <span className="relative z-10">{children}</span>
 <AnimatePresence>
 {ripples.map((ripple) => (
 <motion.span
 key={ripple.id}
 initial={{ scale: 0, opacity: 1 }}
 animate={{ scale: 4, opacity: 0 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.6 }}
 className="absolute pointer-events-none"
 style={{
 left: ripple.x,
 top: ripple.y,
 width: 100,
 height: 100,
 marginLeft: -50,
 marginTop: -50,
 backgroundColor: color,
 }}
 />
 ))}
 </AnimatePresence>
 </button>
 );
}
