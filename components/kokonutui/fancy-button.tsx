'use client';

import { motion } from 'framer-motion';
import { useRef, useState } from 'react';

interface FancyButtonProps {
 children: React.ReactNode;
 onClick?: () => void;
}

export default function FancyButton({ children, onClick }: FancyButtonProps) {
 const ref = useRef<HTMLButtonElement>(null);
 const [position, setPosition] = useState({ x: 0, y: 0 });

 const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
 if (!ref.current) return;
 const rect = ref.current.getBoundingClientRect();
 setPosition({
 x: e.clientX - rect.left - rect.width / 2,
 y: e.clientY - rect.top - rect.height / 2,
 });
 };

 return (
 <motion.button
 ref={ref}
 onMouseMove={handleMouseMove}
 onClick={onClick}
 className="relative px-6 py-3 font-semibold text-white overflow-hidden"
 style={{
 background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
 }}
 whileHover={{ scale: 1.05 }}
 whileTap={{ scale: 0.95 }}
 >
 <motion.div
 className="absolute inset-0 bg-white/20"
 style={{
 width: '200px',
 height: '200px',
 left: '50%',
 top: '50%',
 }}
 animate={{
 x: position.x,
 y: position.y,
 }}
 transition={{ type: 'spring', damping: 30, stiffness: 200 }}
 />
 <span className="relative z-10">{children}</span>
 </motion.button>
 );
}
