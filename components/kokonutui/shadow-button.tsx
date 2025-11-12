'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ShadowButtonProps {
 children: ReactNode;
 onClick?: () => void;
 variant?: 'primary' | 'secondary';
}

export default function ShadowButton({ children, onClick, variant = 'primary' }: ShadowButtonProps) {
 const variants = {
 primary: {
 bg: 'bg-blue',
 text: 'text-white',
 shadow: 'shadow-[0_8px_0_0_#1d4ed8]',
 activeShadow: 'shadow-[0_2px_0_0_#1d4ed8]',
 },
 secondary: {
 bg: 'bg-white',
 text: 'text-text-primary',
 shadow: 'shadow-[0_8px_0_0_#cbd5e1]',
 activeShadow: 'shadow-[0_2px_0_0_#cbd5e1]',
 },
 };

 const style = variants[variant];

 return (
 <motion.button
 onClick={onClick}
 className={`
 relative px-8 py-3 
 font-semibold text-sm
 border-2 border-border
 transition-all duration-150
 ${style.bg} ${style.text} ${style.shadow}
 `}
 whileHover={{ y: -2 }}
 whileTap={{ 
 y: 6,
 boxShadow: style.activeShadow.replace('shadow-', ''),
 }}
 initial={{ y: 0 }}
 >
 {children}
 </motion.button>
 );
}
